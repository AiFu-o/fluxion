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
	StyleBlock
} from './types'
import { tokenize } from './tokenizer'
import { parseStatements, parseViewBlock } from './parser'
import { generateModule } from './codegen'
import { createSourceLocation, Position } from '@fluxion/compiler-core'

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

	// 4. 解析 style 块（暂未实现）
	let style: StyleBlock | null = null

	// 5. 构建 AST
	const ast: NuiRootNode = {
		type: NuiNodeTypes.NUI_ROOT,
		imports: statementResult.imports,
		signals: statementResult.signals,
		functions: statementResult.functions,
		view: viewResult.view,
		style,
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
		...viewResult.errors
	]

	return { ast, errors }
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