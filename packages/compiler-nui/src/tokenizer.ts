/**
 * NUI 词法分析器
 * 将源码分割为 Token 流，处理缩进敏感语法
 */

import {
	TokenType,
	Token,
	TokenizerState,
	NuiCompilerError,
	NuiErrorCodes,
	KEYWORDS
} from './types'
import {
	SourceLocation,
	Position
} from '@fluxion/compiler-core'
import { warn } from '@fluxion/shared'

// ==================== 常量 ====================

/**
 * Tab 字符
 */
const TAB = '\t'

/**
 * 换行符
 */
const NEWLINE = '\n'

/**
 * 回车符
 */
const CARRIAGE_RETURN = '\r'

/**
 * 空格字符
 */
const SPACE = ' '

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
 * 创建 Token
 */
function createToken(
	type: TokenType,
	value: string,
	loc: SourceLocation
): Token {
	return { type, value, loc }
}

// ==================== 词法分析器 ====================

/**
 * 初始化词法分析器状态
 */
export function initTokenizerState(source: string): TokenizerState {
	return {
		source,
		offset: 0,
		line: 1,
		column: 1,
		indentStack: [0],
		tokens: [],
		errors: []
	}
}

/**
 * 获取当前字符
 */
function currentChar(state: TokenizerState): string | null {
	if (state.offset >= state.source.length) {
		return null
	}
	return state.source[state.offset]
}

/**
 * 向前看 n 个字符
 */
function peekChar(state: TokenizerState, n: number = 1): string | null {
	const offset = state.offset + n
	if (offset >= state.source.length) {
		return null
	}
	return state.source[offset]
}

/**
 * 前进一个字符
 */
function advance(state: TokenizerState): string | null {
	const char = currentChar(state)
	if (char !== null) {
		state.offset++
		if (char === NEWLINE) {
			state.line++
			state.column = 1
		} else {
			state.column++
		}
	}
	return char
}

/**
 * 跳过空白字符（不包含换行）
 */
function skipWhitespace(state: TokenizerState): void {
	while (currentChar(state) === SPACE) {
		advance(state)
	}
}

/**
 * 计算当前行的缩进（Tab 数量）
 * 仅在行首调用
 */
function countIndent(state: TokenizerState): number {
	let indent = 0
	const startOffset = state.offset

	while (currentChar(state) === TAB) {
		indent++
		advance(state)
	}

	// 如果这一行是空行或注释行，返回 -1 表示忽略
	const char = currentChar(state)
	if (char === null || char === NEWLINE) {
		return -1
	}

	return indent
}

/**
 * 处理缩进变化
 * 返回需要生成的 INDENT/DEDENT Token 数量
 */
function handleIndent(
	state: TokenizerState,
	currentIndent: number,
	loc: SourceLocation
): Token[] {
	const tokens: Token[] = []
	const topIndent = state.indentStack[state.indentStack.length - 1]

	if (currentIndent > topIndent) {
		// 缩进增加
		state.indentStack.push(currentIndent)
		tokens.push(createToken(TokenType.INDENT, '', loc))
	} else if (currentIndent < topIndent) {
		// 缩进减少，可能需要多个 DEDENT
		while (
			state.indentStack.length > 1 &&
			state.indentStack[state.indentStack.length - 1] > currentIndent
		) {
			state.indentStack.pop()
			tokens.push(createToken(TokenType.DEDENT, '', loc))
		}

		// 检查缩进是否匹配
		if (state.indentStack[state.indentStack.length - 1] !== currentIndent) {
			state.errors.push(createError(
				NuiErrorCodes.INCONSISTENT_INDENT,
				`缩进不一致：期望 ${state.indentStack[state.indentStack.length - 1]} 个 Tab，但得到 ${currentIndent} 个`,
				loc
			))
		}
	}

	return tokens
}

/**
 * 读取字符串字面量
 */
function readString(state: TokenizerState): Token {
	const startLoc = createSourceLocation(
		createPosition(state.offset, state.line, state.column),
		createPosition(state.offset, state.line, state.column),
		''
	)

	const quote = advance(state) // 读取起始引号
	let value = ''
	const start = state.offset

	while (true) {
		const char = currentChar(state)
		if (char === null) {
			state.errors.push(createError(
				NuiErrorCodes.INVALID_STRING,
				'未终止的字符串',
				startLoc
			))
			break
		}

		if (char === quote) {
			advance(state) // 读取结束引号
			break
		}

		if (char === '\\') {
			advance(state)
			const escaped = currentChar(state)
			if (escaped !== null) {
				advance(state)
				// 处理转义字符
				switch (escaped) {
					case 'n':
						value += '\n'
						break
					case 't':
						value += '\t'
						break
					case 'r':
						value += '\r'
						break
					case '\\':
						value += '\\'
						break
					case '"':
						value += '"'
						break
					case "'":
						value += "'"
						break
					default:
						value += escaped
				}
			}
		} else {
			value += advance(state)
		}
	}

	const endLoc = createSourceLocation(
		startLoc.start,
		createPosition(state.offset, state.line, state.column),
		''
	)

	return createToken(TokenType.STRING, value, endLoc)
}

/**
 * 读取数字字面量
 */
function readNumber(state: TokenizerState): Token {
	const startOffset = state.offset
	const startLine = state.line
	const startColumn = state.column

	let value = ''
	let hasDecimal = false

	while (true) {
		const char = currentChar(state)
		if (char === null) break

		if (char >= '0' && char <= '9') {
			value += advance(state)
		} else if (char === '.' && !hasDecimal) {
			const next = peekChar(state)
			if (next !== null && next >= '0' && next <= '9') {
				hasDecimal = true
				value += advance(state)
			} else {
				break
			}
		} else {
			break
		}
	}

	const loc = createSourceLocation(
		createPosition(startOffset, startLine, startColumn),
		createPosition(state.offset, state.line, state.column),
		''
	)

	return createToken(TokenType.NUMBER, value, loc)
}

/**
 * 读取标识符或关键词
 */
function readIdentifier(state: TokenizerState): Token {
	const startOffset = state.offset
	const startLine = state.line
	const startColumn = state.column

	let value = ''

	while (true) {
		const char = currentChar(state)
		if (char === null) break

		// 标识符可以包含字母、数字、下划线、$
		if (
			(char >= 'a' && char <= 'z') ||
			(char >= 'A' && char <= 'Z') ||
			(char >= '0' && char <= '9') ||
			char === '_' ||
			char === '$'
		) {
			value += advance(state)
		} else {
			break
		}
	}

	const loc = createSourceLocation(
		createPosition(startOffset, startLine, startColumn),
		createPosition(state.offset, state.line, state.column),
		''
	)

	// 检查是否为关键词
	const keywordType = KEYWORDS[value]
	if (keywordType !== undefined) {
		return createToken(keywordType, value, loc)
	}

	return createToken(TokenType.IDENTIFIER, value, loc)
}

/**
 * 读取行内容直到换行
 * 用于处理函数体等内容
 */
export function readUntilNewline(state: TokenizerState): string {
	let content = ''
	while (true) {
		const char = currentChar(state)
		if (char === null || char === NEWLINE) {
			break
		}
		content += advance(state)
	}
	return content
}

/**
 * 词法分析主函数
 */
export function tokenize(source: string): {
	tokens: Token[]
	errors: NuiCompilerError[]
} {
	const state = initTokenizerState(source)
	let atLineStart = true
	let pendingIndent = 0

	while (state.offset < source.length) {
		const char = currentChar(state)

		// 处理行首缩进
		if (atLineStart) {
			// 跳过回车符
			if (char === CARRIAGE_RETURN) {
				advance(state)
				continue
			}

			// 处理换行（空行）
			if (char === NEWLINE) {
				advance(state)
				continue
			}

			// 计算缩进
			const indent = countIndent(state)
			atLineStart = false

			// 空行，继续
			if (indent === -1) {
				atLineStart = true
				continue
			}

			// 处理缩进变化
			const loc = createSourceLocation(
				createPosition(state.offset, state.line, 1),
				createPosition(state.offset, state.line, 1),
				''
			)
			const indentTokens = handleIndent(state, indent, loc)
			state.tokens.push(...indentTokens)

			// 更新当前字符
			continue
		}

		// 处理换行
		if (char === NEWLINE) {
			const startOffset = state.offset
			const startLine = state.line
			const startColumn = state.column

			advance(state)

			const loc = createSourceLocation(
				createPosition(startOffset, startLine, startColumn),
				createPosition(state.offset, state.line, state.column),
				''
			)
			state.tokens.push(createToken(TokenType.NEWLINE, '\\n', loc))
			atLineStart = true
			continue
		}

		// 跳过回车符
		if (char === CARRIAGE_RETURN) {
			advance(state)
			continue
		}

		// 跳过空格
		if (char === SPACE) {
			skipWhitespace(state)
			continue
		}

		// 处理注释 // ...（跳过直到换行）
		if (char === '/' && peekChar(state) === '/') {
			// 跳过 //
			advance(state)
			advance(state)
			// 读取直到换行或文件结束
			while (currentChar(state) && currentChar(state) !== NEWLINE) {
				advance(state)
			}
			continue
		}

		// 处理块注释 /* ... */
		if (char === '/' && peekChar(state) === '*') {
			advance(state) // 跳过 /
			advance(state) // 跳过 *
			// 读取直到 */
			while (currentChar(state)) {
				if (currentChar(state) === '*' && peekChar(state) === '/') {
					advance(state) // 跳过 *
					advance(state) // 跳过 /
					break
				}
				advance(state)
			}
			continue
		}

		// 记录 Token 起始位置
		const startOffset = state.offset
		const startLine = state.line
		const startColumn = state.column

		// 处理各种 Token
		switch (char) {
			case TAB:
				// Tab 只在行首有意义，其他位置视为错误
				state.errors.push(createError(
					NuiErrorCodes.INCONSISTENT_INDENT,
					'Tab 只能出现在行首',
					createSourceLocation(
						createPosition(startOffset, startLine, startColumn),
						createPosition(startOffset + 1, startLine, startColumn + 1),
						''
					)
				))
				advance(state)
				break

			case '@':
				advance(state)
				state.tokens.push(createToken(
					TokenType.AT,
					'@',
					createSourceLocation(
						createPosition(startOffset, startLine, startColumn),
						createPosition(state.offset, startLine, startColumn + 1),
						''
					)
				))
				break

			case '=':
				advance(state)
				state.tokens.push(createToken(
					TokenType.EQUALS,
					'=',
					createSourceLocation(
						createPosition(startOffset, startLine, startColumn),
						createPosition(state.offset, startLine, startColumn + 1),
						''
					)
				))
				break

			case ',':
				advance(state)
				state.tokens.push(createToken(
					TokenType.COMMA,
					',',
					createSourceLocation(
						createPosition(startOffset, startLine, startColumn),
						createPosition(state.offset, startLine, startColumn + 1),
						''
					)
				))
				break

			case '(':
				advance(state)
				state.tokens.push(createToken(
					TokenType.LPAREN,
					'(',
					createSourceLocation(
						createPosition(startOffset, startLine, startColumn),
						createPosition(state.offset, startLine, startColumn + 1),
						''
					)
				))
				break

			case ')':
				advance(state)
				state.tokens.push(createToken(
					TokenType.RPAREN,
					')',
					createSourceLocation(
						createPosition(startOffset, startLine, startColumn),
						createPosition(state.offset, startLine, startColumn + 1),
						''
					)
				))
				break

			case '{':
				advance(state)
				state.tokens.push(createToken(
					TokenType.LBRACE,
					'{',
					createSourceLocation(
						createPosition(startOffset, startLine, startColumn),
						createPosition(state.offset, startLine, startColumn + 1),
						''
					)
				))
				break

			case '}':
				advance(state)
				state.tokens.push(createToken(
					TokenType.RBRACE,
					'}',
					createSourceLocation(
						createPosition(startOffset, startLine, startColumn),
						createPosition(state.offset, startLine, startColumn + 1),
						''
					)
				))
				break

			case '.':
				advance(state)
				state.tokens.push(createToken(
					TokenType.DOT,
					'.',
					createSourceLocation(
						createPosition(startOffset, startLine, startColumn),
						createPosition(state.offset, startLine, startColumn + 1),
						''
					)
				))
				break

			// 操作符：+ - * / < > ! & | : ; ? %
			case '+':
			case '-':
			case '*':
			case '/':
			case '<':
			case '>':
			case '!':
			case '&':
			case '|':
			case ':':
			case ';':
			case '?':
			case '%':
				advance(state)
				state.tokens.push(createToken(
					TokenType.OPERATOR,
					char,
					createSourceLocation(
						createPosition(startOffset, startLine, startColumn),
						createPosition(state.offset, startLine, startColumn + 1),
						''
					)
				))
				break

			case '"':
			case "'":
				state.tokens.push(readString(state))
				break

			default:
				// 数字
				if (char >= '0' && char <= '9') {
					state.tokens.push(readNumber(state))
					break
				}

				// 标识符或关键词
				if (
					(char >= 'a' && char <= 'z') ||
					(char >= 'A' && char <= 'Z') ||
					char === '_' ||
					char === '$'
				) {
					state.tokens.push(readIdentifier(state))
					break
				}

				// 未知字符
				state.errors.push(createError(
					NuiErrorCodes.UNEXPECTED_TOKEN,
					`意外的字符: ${char}`,
					createSourceLocation(
						createPosition(startOffset, startLine, startColumn),
						createPosition(startOffset + 1, startLine, startColumn + 1),
						''
					)
				))
				advance(state)
		}
	}

	// 生成剩余的 DEDENT
	const endLoc = createSourceLocation(
		createPosition(state.offset, state.line, state.column),
		createPosition(state.offset, state.line, state.column),
		''
	)

	while (state.indentStack.length > 1) {
		state.indentStack.pop()
		state.tokens.push(createToken(TokenType.DEDENT, '', endLoc))
	}

	// 添加 EOF
	state.tokens.push(createToken(TokenType.EOF, '', endLoc))

	return {
		tokens: state.tokens,
		errors: state.errors
	}
}