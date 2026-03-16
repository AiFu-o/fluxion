/**
 * compiler-nui 类型定义
 * 定义 NUI DSL 的 Token 类型、AST 节点类型等
 */

import {
	NodeTypes,
	SourceLocation,
	Position,
	TemplateChildNode,
	RootNode
} from '@fluxion-ui/compiler-core'

// ==================== Token 类型 ====================

/**
 * Token 类型枚举
 */
export const enum TokenType {
	// 结构
	INDENT,              // 缩进增加
	DEDENT,              // 缩进减少
	NEWLINE,             // 换行
	EOF,                 // 结束

	// 字面量
	IDENTIFIER,          // 标识符
	STRING,              // 字符串 "..."
	NUMBER,              // 数字

	// 关键词
	IMPORT,              // import
	FROM,                // from
	FUNCTION,            // function
	IF,                  // if
	ELIF,                // elif
	ELSE,                // else
	FOR,                 // for
	IN,                  // in
	VIEW,                // view
	STYLE,               // style
	SIGNAL,              // signal
	ASYNC_SIGNAL,        // asyncSignal

	// 操作符
	EQUALS,              // =
	COMMA,               // ,
	LPAREN,              // (
	RPAREN,              // )
	LBRACE,              // {
	RBRACE,              // }
	OPERATOR,            // + - * / < > ! & | 等

	// 特殊
	AT,                  // @ 事件符号
	DOT,                 // .
	INTERPOLATION_START, // { 插值开始（行内）
	INTERPOLATION_END    // } 插值结束（行内）
}

/**
 * Token 接口
 */
export interface Token {
	type: TokenType
	value: string
	loc: SourceLocation
}

// ==================== NUI AST 节点类型 ====================

/**
 * NUI AST 节点类型枚举
 */
export const enum NuiNodeTypes {
	NUI_ROOT,            // NUI 根节点
	IMPORT_DECLARATION,  // import 声明
	SIGNAL_DECLARATION,  // signal 声明
	FUNCTION_DECLARATION,// function 声明
	VIEW_BLOCK,          // view 块
	STYLE_BLOCK          // style 块
}

// ==================== NUI 根节点 ====================

/**
 * NUI 根节点
 */
export interface NuiRootNode {
	type: NuiNodeTypes.NUI_ROOT
	// import 声明列表
	imports: ImportDeclaration[]
	// signal 声明列表
	signals: SignalDeclaration[]
	// function 声明列表
	functions: FunctionDeclaration[]
	// view 块（可选）
	view: ViewBlock | null
	// style 块（可选）
	style: StyleBlock | null
	// 源码位置
	loc: SourceLocation
	// 原始源码
	source: string
}

// ==================== Import 声明 ====================

/**
 * import 声明
 * import Title from "./Title.nui"
 */
export interface ImportDeclaration {
	type: NuiNodeTypes.IMPORT_DECLARATION
	// 导入的标识符
	identifier: string
	// 导入来源路径
	source: string
	// 源码位置
	loc: SourceLocation
}

// ==================== Signal 声明 ====================

/**
 * signal 声明
 * count = signal(0)
 * users = asyncSignal(fetchUsers)
 */
export interface SignalDeclaration {
	type: NuiNodeTypes.SIGNAL_DECLARATION
	// 变量名
	name: string
	// 是否为 asyncSignal
	isAsync: boolean
	// 初始值表达式
	initExpression: string
	// 源码位置
	loc: SourceLocation
}

// ==================== Function 声明 ====================

/**
 * function 声明
 * function increment() { count.update(c => c + 1) }
 */
export interface FunctionDeclaration {
	type: NuiNodeTypes.FUNCTION_DECLARATION
	// 函数名
	name: string
	// 参数列表
	params: string[]
	// 函数体（原始代码字符串）
	body: string
	// 源码位置
	loc: SourceLocation
}

// ==================== View 块 ====================

/**
 * view 块
 * 包含模板子节点
 */
export interface ViewBlock {
	type: NuiNodeTypes.VIEW_BLOCK
	// 模板子节点（复用 compiler-core 的类型）
	children: TemplateChildNode[]
	// 源码位置
	loc: SourceLocation
}

// ==================== Style 块 ====================

/**
 * style 块
 * 包含原始 CSS 代码
 */
export interface StyleBlock {
	type: NuiNodeTypes.STYLE_BLOCK
	// CSS 内容
	content: string
	// 源码位置
	loc: SourceLocation
}

// ==================== 解析选项 ====================

/**
 * NUI 解析选项
 */
export interface NuiParseOptions {
	// 文件名（用于错误提示）
	filename?: string
	// 是否在浏览器环境
	isBrowser?: boolean
	// 错误回调
	onError?: (error: NuiCompilerError) => void
	// 缩进大小（空格数量，默认 2；Tab 会被视为 size 个空格）
	indentSize?: number
}

// ==================== 解析结果 ====================

/**
 * NUI 解析结果
 */
export interface NuiParseResult {
	// 解析后的 AST
	ast: NuiRootNode
	// 错误列表
	errors: NuiCompilerError[]
}

// ==================== 编译结果 ====================

/**
 * NUI 编译结果
 */
export interface NuiCompileResult {
	// 生成的代码
	code: string
	// 解析后的 AST
	ast: NuiRootNode
	// 模板 AST（compiler-core 格式）
	templateAst: RootNode | null
	// 错误列表
	errors: NuiCompilerError[]
}

// ==================== 编译错误 ====================

/**
 * NUI 编译错误
 */
export interface NuiCompilerError extends SyntaxError {
	code: NuiErrorCodes
	loc?: SourceLocation
}

/**
 * NUI 错误代码
 */
export const enum NuiErrorCodes {
	// 词法错误
	UNEXPECTED_TOKEN,
	UNEXPECTED_EOF,
	INCONSISTENT_INDENT,
	INVALID_STRING,
	INVALID_NUMBER,

	// 语法错误
	INVALID_IMPORT_SYNTAX,
	INVALID_SIGNAL_SYNTAX,
	INVALID_FUNCTION_SYNTAX,
	INVALID_VIEW_SYNTAX,
	ELIF_WITHOUT_IF,
	ELSE_WITHOUT_IF,
	FOR_WITHOUT_IN,
	UNTERMINATED_INTERPOLATION,

	// 未知错误
	UNKNOWN_ERROR
}

// ==================== 词法分析器状态 ====================

/**
 * 词法分析器状态
 */
export interface TokenizerState {
	// 源码
	source: string
	// 当前位置
	offset: number
	// 当前行号
	line: number
	// 当前列号
	column: number
	// 缩进栈
	indentStack: number[]
	// 当前 Token 列表
	tokens: Token[]
	// 错误列表
	errors: NuiCompilerError[]
	// 缩进大小（每个缩进级别的空格数量）
	indentSize: number
}

// ==================== 解析器状态 ====================

/**
 * 解析器状态
 */
export interface ParserState {
	// Token 列表
	tokens: Token[]
	// 当前 Token 索引
	index: number
	// 当前 Token
	currentToken: Token | null
	// 错误列表
	errors: NuiCompilerError[]
	// 当前缩进层级
	indentLevel: number
}

// ==================== 工具函数 ====================

/**
 * 关键词映射表
 */
export const KEYWORDS: Record<string, TokenType> = {
	import: TokenType.IMPORT,
	from: TokenType.FROM,
	function: TokenType.FUNCTION,
	if: TokenType.IF,
	elif: TokenType.ELIF,
	else: TokenType.ELSE,
	for: TokenType.FOR,
	in: TokenType.IN,
	view: TokenType.VIEW,
	style: TokenType.STYLE,
	signal: TokenType.SIGNAL,
	asyncSignal: TokenType.ASYNC_SIGNAL
}