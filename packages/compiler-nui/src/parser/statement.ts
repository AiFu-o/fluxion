/**
 * NUI 语句解析器
 * 解析 import、signal、function 声明
 */

import {
	Token,
	TokenType,
	ParserState,
	NuiCompilerError,
	NuiErrorCodes,
	ImportDeclaration,
	SignalDeclaration,
	FunctionDeclaration,
	NuiNodeTypes
} from '../types'
import {
	SourceLocation,
	Position
} from '@fluxion/compiler-core'

// ==================== 工具函数 ====================

/**
 * 创建位置对象
 */
function createPosition(
	offset: number,
	line: number,
	column: number
): Position {
	return { offset, line, column }
}

/**
 * 创建源码位置对象
 */
function createSourceLocation(
	start: Position,
	end: Position,
	source: string
): SourceLocation {
	return { start, end, source }
}

/**
 * 创建编译错误
 */
function createError(
	code: NuiErrorCodes,
	message: string,
	loc?: SourceLocation
): NuiCompilerError {
	const error = new SyntaxError(message) as NuiCompilerError
	error.code = code
	error.loc = loc
	return error
}

/**
 * 初始化解析器状态
 */
export function initParserState(tokens: Token[]): ParserState {
	return {
		tokens,
		index: 0,
		currentToken: tokens[0] || null,
		errors: [],
		indentLevel: 0
	}
}

/**
 * 获取当前 Token
 */
export function currentToken(state: ParserState): Token | null {
	return state.currentToken
}

/**
 * 获取下一个 Token（不移动）
 */
export function peekToken(state: ParserState): Token | null {
	const nextIndex = state.index + 1
	if (nextIndex >= state.tokens.length) {
		return null
	}
	return state.tokens[nextIndex]
}

/**
 * 前进到下一个 Token
 */
export function advance(state: ParserState): Token | null {
	state.index++
	if (state.index < state.tokens.length) {
		state.currentToken = state.tokens[state.index]
	} else {
		state.currentToken = null
	}
	return state.currentToken
}

/**
 * 检查当前 Token 是否为指定类型
 */
export function isTokenType(state: ParserState, type: TokenType): boolean {
	return state.currentToken?.type === type
}

/**
 * 期望当前 Token 为指定类型，否则报错
 */
export function expectToken(
	state: ParserState,
	type: TokenType,
	errorMessage: string
): Token | null {
	if (isTokenType(state, type)) {
		const token = state.currentToken
		advance(state)
		return token
	}

	state.errors.push(createError(
		NuiErrorCodes.UNEXPECTED_TOKEN,
		errorMessage,
		state.currentToken?.loc
	))
	return null
}

/**
 * 跳过换行 Token
 */
export function skipNewlines(state: ParserState): void {
	while (isTokenType(state, TokenType.NEWLINE)) {
		advance(state)
	}
}

/**
 * 跳过缩进/缩进 Token
 */
export function skipIndent(state: ParserState): void {
	while (
		isTokenType(state, TokenType.INDENT) ||
		isTokenType(state, TokenType.DEDENT)
	) {
		advance(state)
	}
}

// ==================== Import 解析 ====================

/**
 * 解析 import 声明
 * import Title from "./Title.nui"
 */
export function parseImportDeclaration(state: ParserState): ImportDeclaration | null {
	const startToken = currentToken(state)
	if (!startToken) return null

	const startLoc = startToken.loc

	// 期望 'import'
	if (!isTokenType(state, TokenType.IMPORT)) {
		return null
	}
	advance(state)

	// 期望标识符
	const identifierToken = expectToken(
		state,
		TokenType.IDENTIFIER,
		'import 语句需要指定导入的标识符'
	)
	if (!identifierToken) return null

	const identifier = identifierToken.value

	// 期望 'from'
	expectToken(state, TokenType.FROM, 'import 语句需要 "from" 关键词')

	// 期望字符串
	const sourceToken = expectToken(
		state,
		TokenType.STRING,
		'import 语句需要指定来源路径'
	)
	if (!sourceToken) return null

	const source = sourceToken.value

	const endLoc = sourceToken.loc

	return {
		type: NuiNodeTypes.IMPORT_DECLARATION,
		identifier,
		source,
		loc: createSourceLocation(
			startLoc.start,
			endLoc.end,
			''
		)
	}
}

// ==================== Signal 解析 ====================

/**
 * 解析 signal 声明
 * count = signal(0)
 * users = asyncSignal(fetchUsers)
 */
export function parseSignalDeclaration(state: ParserState): SignalDeclaration | null {
	const startToken = currentToken(state)
	if (!startToken) return null

	const startLoc = startToken.loc

	// 期望标识符
	if (!isTokenType(state, TokenType.IDENTIFIER)) {
		return null
	}
	const name = startToken.value
	advance(state)

	// 期望 '='
	if (!isTokenType(state, TokenType.EQUALS)) {
		// 不是 signal 声明，回退
		state.index--
		state.currentToken = startToken
		return null
	}
	advance(state)

	// 检查是 signal 还是 asyncSignal
	const isAsync = isTokenType(state, TokenType.ASYNC_SIGNAL)
	if (!isAsync && !isTokenType(state, TokenType.SIGNAL)) {
		// 不是 signal 声明，回退并返回 null
		state.index -= 2 // 回退到标识符位置（跳过标识符和 =）
		state.currentToken = state.tokens[state.index]
		return null
	}
	advance(state)

	// 期望 '('
	expectToken(state, TokenType.LPAREN, 'signal 声明需要括号')

	// 读取初始化表达式（直到 ')'）
	let initExpression = ''

	while (currentToken(state) && !isTokenType(state, TokenType.RPAREN)) {
		const token = currentToken(state)!
		// 字符串字面量需要加引号
		if (token.type === TokenType.STRING) {
			initExpression += `"${token.value}"`
		} else {
			initExpression += token.value
		}
		advance(state)
	}

	// 期望 ')'
	expectToken(state, TokenType.RPAREN, 'signal 声明需要闭合括号')

	const endLoc = currentToken(state)?.loc || startLoc

	return {
		type: NuiNodeTypes.SIGNAL_DECLARATION,
		name,
		isAsync,
		initExpression,
		loc: createSourceLocation(
			startLoc.start,
			endLoc.end,
			''
		)
	}
}

// ==================== Function 解析 ====================

/**
 * 解析函数参数列表
 */
function parseFunctionParams(state: ParserState): string[] {
	const params: string[] = []

	// 期望 '('
	if (!isTokenType(state, TokenType.LPAREN)) {
		return params
	}
	advance(state)

	// 解析参数
	while (!isTokenType(state, TokenType.RPAREN)) {
		if (isTokenType(state, TokenType.IDENTIFIER)) {
			params.push(currentToken(state)!.value)
			advance(state)
		}

		// 跳过逗号
		if (isTokenType(state, TokenType.COMMA)) {
			advance(state)
		} else if (!isTokenType(state, TokenType.RPAREN)) {
			break
		}
	}

	// 期望 ')'
	expectToken(state, TokenType.RPAREN, '函数参数列表需要闭合括号')

	return params
}

/**
 * 解析函数体
 * 函数体从 '{' 开始到 '}' 结束，需要处理嵌套的大括号
 */
function parseFunctionBody(state: ParserState): string {
	// 期望 '{'
	if (!isTokenType(state, TokenType.LBRACE)) {
		return ''
	}
	advance(state)

	let body = ''
	let braceDepth = 1

	while (currentToken(state) && braceDepth > 0) {
		const token = currentToken(state)!

		if (token.type === TokenType.LBRACE) {
			braceDepth++
			body += '{'
			advance(state)
		} else if (token.type === TokenType.RBRACE) {
			braceDepth--
			if (braceDepth > 0) {
				body += '}'
			}
			advance(state)
		} else if (token.type === TokenType.NEWLINE) {
			body += '\n'
			advance(state)
		} else if (token.type === TokenType.STRING) {
			// 字符串字面量需要加引号
			body += `"${token.value}"`
			advance(state)
		} else {
			body += token.value
			advance(state)
		}
	}

	return body.trim()
}

/**
 * 解析 function 声明
 * function increment() { count.update(c => c + 1) }
 */
export function parseFunctionDeclaration(state: ParserState): FunctionDeclaration | null {
	const startToken = currentToken(state)
	if (!startToken) return null

	const startLoc = startToken.loc

	// 期望 'function'
	if (!isTokenType(state, TokenType.FUNCTION)) {
		return null
	}
	advance(state)

	// 期望函数名
	const nameToken = expectToken(
		state,
		TokenType.IDENTIFIER,
		'函数声明需要指定函数名'
	)
	if (!nameToken) return null

	const name = nameToken.value

	// 解析参数
	const params = parseFunctionParams(state)

	// 解析函数体
	const body = parseFunctionBody(state)

	const endLoc = currentToken(state)?.loc || startLoc

	return {
		type: NuiNodeTypes.FUNCTION_DECLARATION,
		name,
		params,
		body,
		loc: createSourceLocation(
			startLoc.start,
			endLoc.end,
			''
		)
	}
}

// ==================== 语句解析入口 ====================

/**
 * 语句解析结果
 */
export interface StatementParseResult {
	imports: ImportDeclaration[]
	signals: SignalDeclaration[]
	functions: FunctionDeclaration[]
	errors: NuiCompilerError[]
}

/**
 * 解析所有语句
 */
export function parseStatements(tokens: Token[]): StatementParseResult {
	const state = initParserState(tokens)

	const imports: ImportDeclaration[] = []
	const signals: SignalDeclaration[] = []
	const functions: FunctionDeclaration[] = []

	// 跳过开始的换行
	skipNewlines(state)

	while (currentToken(state) && !isTokenType(state, TokenType.EOF)) {
		// 跳过缩进变化
		skipIndent(state)
		skipNewlines(state)

		if (isTokenType(state, TokenType.EOF)) {
			break
		}

		// 尝试解析各种声明
		if (isTokenType(state, TokenType.IMPORT)) {
			const decl = parseImportDeclaration(state)
			if (decl) {
				imports.push(decl)
			}
		} else if (isTokenType(state, TokenType.FUNCTION)) {
			const decl = parseFunctionDeclaration(state)
			if (decl) {
				functions.push(decl)
			}
		} else if (isTokenType(state, TokenType.IDENTIFIER)) {
			// 可能是 signal 声明
			const decl = parseSignalDeclaration(state)
			if (decl) {
				signals.push(decl)
			} else {
				// 无法识别的语句，跳过
				advance(state)
			}
		} else {
			// 跳过无法识别的 Token
			advance(state)
		}

		// 跳过行尾
		skipNewlines(state)
	}

	return {
		imports,
		signals,
		functions,
		errors: state.errors
	}
}