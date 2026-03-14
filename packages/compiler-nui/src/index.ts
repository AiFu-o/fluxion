/**
 * compiler-nui
 * NUI DSL 编译器
 */

// 导出枚举和值
export {
	// Token 类型
	TokenType,

	// NUI AST 节点类型
	NuiNodeTypes,

	// 错误代码
	NuiErrorCodes,

	// 工具
	KEYWORDS
} from './types'

// 导出类型（使用 type 关键字）
export type {
	// Token
	Token,

	// NUI AST 节点
	NuiRootNode,
	ImportDeclaration,
	SignalDeclaration,
	FunctionDeclaration,
	ViewBlock,
	StyleBlock,

	// 解析选项
	NuiParseOptions,
	NuiParseResult,
	NuiCompileResult,

	// 错误
	NuiCompilerError,

	// 状态
	TokenizerState,
	ParserState
} from './types'

// 导出词法分析器
export { tokenize, readUntilNewline, initTokenizerState } from './tokenizer'

// 导出解析器
export {
	parseStatements,
	parseImportDeclaration,
	parseSignalDeclaration,
	parseFunctionDeclaration,
	parseViewBlock
} from './parser'

// 导出类型
export type { StatementParseResult } from './parser'

// 导出代码生成器
export { generateModule } from './codegen'

// ==================== 编译入口 ====================

import {
	NuiRootNode,
	NuiParseOptions,
	NuiParseResult,
	NuiCompileResult,
	NuiNodeTypes,
	ViewBlock,
	StyleBlock,
	Token,
	TokenType,
	NuiCompilerError
} from './types'
import { tokenize } from './tokenizer'
import { parseStatements, parseViewBlock } from './parser'
import { generateModule } from './codegen'
import { createSourceLocation, Position } from '@fluxion-ui/compiler-core'

/**
 * 解析 NUI 源码为 AST
 */
export function parse(source: string, options: NuiParseOptions = {}): NuiParseResult {
	// 1. 词法分析
	const { tokens, errors: tokenErrors } = tokenize(source)

	if (options.onError) {
		for (const error of tokenErrors) {
			options.onError(error)
		}
	}

	// 2. 解析语句
	const statementResult = parseStatements(tokens)

	// 3. 解析 view 块
	const viewResult = parseViewBlock(tokens)

	// 4. 解析 style 块
	const styleResult = parseStyleBlock(source, tokens)

	// 5. 构建 AST
	const ast: NuiRootNode = {
		type: NuiNodeTypes.NUI_ROOT,
		imports: statementResult.imports,
		signals: statementResult.signals,
		functions: statementResult.functions,
		view: viewResult.view,
		style: styleResult.style,
		loc: createSourceLocation(
			{ offset: 0, line: 1, column: 1 } as Position,
			{ offset: source.length, line: 1, column: 1 } as Position,
			source
		),
		source
	}

	// 收集所有错误
	const errors = [
		...tokenErrors,
		...statementResult.errors,
		...viewResult.errors,
		...styleResult.errors
	]

	return { ast, errors }
}

/**
 * 解析 style 块
 * 从源码中提取 style 块的内容
 */
function parseStyleBlock(source: string, tokens: Token[]): {
	style: StyleBlock | null
	errors: NuiCompilerError[]
} {
	// 找到 STYLE token
	let styleToken: Token | null = null
	for (const token of tokens) {
		if (token.type === TokenType.STYLE) {
			styleToken = token
			break
		}
	}

	if (!styleToken) {
		return { style: null, errors: [] }
	}

	// 从 style 关键字后面开始，找到缩进后的内容
	// style 关键字的位置
	const styleStart = styleToken.loc.start.offset

	// 找到 style 后的换行符
	let contentStart = styleStart + 5 // 'style'.length
	while (contentStart < source.length && source[contentStart] !== '\n') {
		contentStart++
	}
	contentStart++ // 跳过换行

	// 跳过缩进（第一个 tab）
	if (contentStart < source.length && source[contentStart] === '\t') {
		contentStart++
	}

	// 提取 style 内容直到文件末尾
	// 需要处理缩进：移除每行开头的 tab
	let content = ''
	let i = contentStart
	let lineStart = true

	while (i < source.length) {
		const char = source[i]

		if (char === '\n') {
			content += char
			i++
			lineStart = true
		} else if (lineStart && char === '\t') {
			// 跳过行首的 tab（缩进）
			i++
			lineStart = false
		} else {
			content += char
			i++
			lineStart = false
		}
	}

	// 创建 style 块
	const styleBlock: StyleBlock = {
		type: NuiNodeTypes.STYLE_BLOCK,
		content: content.trim(),
		loc: styleToken.loc
	}

	return { style: styleBlock, errors: [] }
}

/**
 * 编译 NUI 源码为 JavaScript 代码
 */
export function compile(source: string, options: NuiParseOptions = {}): NuiCompileResult {
	// 解析
	const { ast, errors } = parse(source, options)

	// 代码生成
	const result = generateModule(ast)

	return {
		...result,
		errors: [...errors, ...result.errors]
	}
}