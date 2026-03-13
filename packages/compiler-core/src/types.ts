/**
 * compiler-core 核心类型定义
 * 定义 AST 节点类型、转换上下文、编译选项等
 */

// ==================== AST 节点类型枚举 ====================

/**
 * AST 节点类型枚举
 */
export const enum NodeTypes {
	ROOT,                     // 根节点
	ELEMENT,                  // 元素节点
	TEXT,                     // 文本节点
	INTERPOLATION,            // 插值表达式 {count}
	ATTRIBUTE,                // 属性
	DIRECTIVE,                // 指令 @click
	IF,                       // if 条件
	IF_BRANCH,                // if 分支
	FOR,                      // for 循环
	SIMPLE_EXPRESSION,        // 简单表达式
	COMPOUND_EXPRESSION,      // 复合表达式
	JS_CALL_EXPRESSION,       // JS 函数调用
	JS_OBJECT_EXPRESSION,     // JS 对象表达式
	JS_ARRAY_EXPRESSION,      // JS 数组表达式
	JS_FUNCTION_EXPRESSION,   // JS 函数表达式
	JS_CONDITIONAL_EXPRESSION // JS 条件表达式
}

// ==================== 基础节点接口 ====================

/**
 * AST 节点基础接口
 */
export interface BaseNode {
	type: NodeTypes
	loc?: SourceLocation
}

/**
 * 源码位置信息
 */
export interface SourceLocation {
	start: Position
	end: Position
	source: string
}

/**
 * 位置信息
 */
export interface Position {
	offset: number
	line: number
	column: number
}

// ==================== 表达式节点 ====================

/**
 * 表达式节点基类
 */
export interface ExpressionNode extends BaseNode {
	content: string
	isStatic?: boolean
}

/**
 * 简单表达式节点
 */
export interface SimpleExpressionNode extends ExpressionNode {
	type: NodeTypes.SIMPLE_EXPRESSION
	isStatic: boolean
	identifiers?: string[]
}

/**
 * 复合表达式节点
 */
export interface CompoundExpressionNode extends BaseNode {
	type: NodeTypes.COMPOUND_EXPRESSION
	children: (SimpleExpressionNode | CompoundExpressionNode | InterpolationNode | TextNode | string)[]
	identifiers?: string[]
}

// ==================== 模板子节点 ====================

/**
 * 模板子节点类型
 */
export type TemplateChildNode =
	| ElementNode
	| TextNode
	| InterpolationNode
	| IfNode
	| ForNode

/**
 * 文本节点
 */
export interface TextNode extends BaseNode {
	type: NodeTypes.TEXT
	content: string
}

/**
 * 插值节点 {count}
 */
export interface InterpolationNode extends BaseNode {
	type: NodeTypes.INTERPOLATION
	content: ExpressionNode
}

// ==================== 元素节点 ====================

/**
 * 元素节点
 */
export interface ElementNode extends BaseNode {
	type: NodeTypes.ELEMENT
	tag: string
	props: Array<AttributeNode | DirectiveNode>
	children: TemplateChildNode[]
	isSelfClosing: boolean
	codegenNode?: CodegenNode
	tagType?: ElementTypes
}

/**
 * 元素类型
 */
export const enum ElementTypes {
	ELEMENT,    // 普通元素
	COMPONENT   // 组件
}

/**
 * 属性节点
 */
export interface AttributeNode extends BaseNode {
	type: NodeTypes.ATTRIBUTE
	name: string
	value: TextNode | null
}

/**
 * 指令节点
 */
export interface DirectiveNode extends BaseNode {
	type: NodeTypes.DIRECTIVE
	name: string
	exp: ExpressionNode | null
	arg: ExpressionNode | null
	modifiers: string[]
}

// ==================== 控制流节点 ====================

/**
 * if 节点
 */
export interface IfNode extends BaseNode {
	type: NodeTypes.IF
	branches: IfBranchNode[]
	codegenNode?: CodegenNode
}

/**
 * if 分支节点
 */
export interface IfBranchNode extends BaseNode {
	type: NodeTypes.IF_BRANCH
	condition?: ExpressionNode
	children: TemplateChildNode[]
	userKey?: string | number
}

/**
 * for 节点
 */
export interface ForNode extends BaseNode {
	type: NodeTypes.FOR
	source: ExpressionNode
	valueAlias: string
	keyAlias?: string
	indexAlias?: string
	children: TemplateChildNode[]
	codegenNode?: CodegenNode
}

// ==================== 根节点 ====================

/**
 * 根节点
 */
export interface RootNode extends BaseNode {
	type: NodeTypes.ROOT
	children: TemplateChildNode[]
	helpers: Set<symbol>
	components: Set<string>
	directives: Set<string>
	imports: Set<string>
	hoists?: (JSChildNode | null)[]
	cached?: number
	codegenNode?: TemplateChildNode | CodegenNode
}

// ==================== JS 代码生成节点 ====================

/**
 * JS 子节点类型
 */
export type JSChildNode =
	| JSCallExpression
	| JSObjectExpression
	| JSArrayExpression
	| JSFunctionExpression
	| JSConditionalExpression
	| SimpleExpressionNode
	| CompoundExpressionNode

/**
 * 代码生成节点
 */
export type CodegenNode = JSChildNode

/**
 * JS 函数调用表达式
 */
export interface JSCallExpression extends BaseNode {
	type: NodeTypes.JS_CALL_EXPRESSION
	callee: string | symbol
	arguments: (string | JSChildNode)[]
}

/**
 * JS 对象表达式
 */
export interface JSObjectExpression extends BaseNode {
	type: NodeTypes.JS_OBJECT_EXPRESSION
	properties: Array<JSProperty | SpreadElement>
}

/**
 * JS 属性
 */
export interface JSProperty {
	key: string | ExpressionNode
	value: JSChildNode | string
	runtimeName?: string
}

/**
 * 展开元素
 */
export interface SpreadElement extends BaseNode {
	type: NodeTypes.JS_CALL_EXPRESSION
	arguments: JSChildNode[]
}

/**
 * JS 数组表达式
 */
export interface JSArrayExpression extends BaseNode {
	type: NodeTypes.JS_ARRAY_EXPRESSION
	elements: (JSChildNode | string | null)[]
}

/**
 * JS 函数表达式
 */
export interface JSFunctionExpression extends BaseNode {
	type: NodeTypes.JS_FUNCTION_EXPRESSION
	params: string[] | ExpressionNode[]
	returns?: JSChildNode
	body?: JSChildNode
	newline: boolean
	isSlot: boolean
}

/**
 * JS 条件表达式
 */
export interface JSConditionalExpression extends BaseNode {
	type: NodeTypes.JS_CONDITIONAL_EXPRESSION
	test: JSChildNode
	consequent: JSChildNode
	alternate: JSChildNode | JSConditionalExpression
	newline: boolean
}

// ==================== 转换上下文 ====================

/**
 * 转换函数类型
 */
export type TransformFn = (node: TemplateChildNode, context: TransformContext) => void | (() => void) | (() => void)[]

/**
 * 转换上下文
 */
export interface TransformContext {
	// 根节点
	root: RootNode

	// 父节点
	parent: TemplateChildNode | null

	// 当前节点索引
	childIndex: number

	// 当前节点
	currentNode: TemplateChildNode | null

	// 帮助函数
	helpers: Set<symbol>
	components: Set<string>
	directives: Set<string>

	// 转换插件
	nodeTransforms: TransformFn[]

	// 替换节点
	replaceNode(node: TemplateChildNode): void

	// 移除节点
	removeNode(node?: TemplateChildNode): void

	// 遍历子节点
	traverseChildren(parent: TemplateChildNode | RootNode): void

	// 遍历节点
	traverseNode(node: TemplateChildNode | RootNode): void

	// 辅助函数
	helper(name: symbol): symbol

	// 错误处理
	onError?: (error: CompilerError) => void
}

// ==================== 编译选项 ====================

/**
 * 编译选项
 */
export interface CompilerOptions {
	// 是否在开发模式
	isBrowser?: boolean

	// 文件名
	filename?: string

	// 源码
	source?: string

	// 前置转换
	hoistStatic?: boolean

	// 转换插件
	nodeTransforms?: TransformFn[]

	// 指令转换
	directiveTransforms?: Record<string, TransformFn>

	// 表达式转换
	expressionTransforms?: Record<string, TransformFn>

	// 错误处理
	onError?: (error: CompilerError) => void
}

// ==================== 编译结果 ====================

/**
 * 代码生成结果
 */
export interface CodegenResult {
	code: string
	ast: RootNode
	preamble: string
	map?: SourceMap
}

/**
 * 源码映射（简化版）
 */
export interface SourceMap {
	file?: string
	mappings: string
	names: string[]
	sourceRoot?: string
	sources: string[]
	sourcesContent?: string[]
	version: number
}

// ==================== 编译错误 ====================

/**
 * 编译错误
 */
export interface CompilerError extends SyntaxError {
	code: number
	loc?: SourceLocation
}

/**
 * 错误代码
 */
export const enum ErrorCodes {
	// 解析错误
	ABRUPT_CLOSING_OF_EMPTY_COMMENT,
	CDATA_IN_HTML_CONTENT,
	DUPLICATE_ATTRIBUTE,
	END_TAG_WITH_ATTRIBUTES,
	END_TAG_WITH_TRAILING_SOLIDUS,
	EOF_BEFORE_TAG_NAME,
	EOF_IN_CDATA,
	EOF_IN_COMMENT,
	EOF_IN_SCRIPT_HTML_COMMENT_LIKE_TEXT,
	EOF_IN_TAG,
	INCORRECTLY_CLOSED_COMMENT,
	INCORRECTLY_OPENED_COMMENT,
	INVALID_FIRST_CHARACTER_OF_TAG_NAME,
	MISSING_ATTRIBUTE_VALUE,
	MISSING_END_TAG_NAME,
	MISSING_WHITESPACE_BETWEEN_ATTRIBUTES,
	NESTED_COMMENT,
	UNEXPECTED_CHARACTER_IN_ATTRIBUTE_NAME,
	UNEXPECTED_CHARACTER_IN_UNQUOTED_ATTRIBUTE_VALUE,
	UNEXPECTED_EQUALS_SIGN_BEFORE_ATTRIBUTE_NAME,
	UNEXPECTED_NULL_CHARACTER,
	UNEXPECTED_QUESTION_MARK_INSTEAD_OF_TAG_NAME,
	UNEXPECTED_SOLIDUS_IN_TAG,

	// 转换错误
	X_IF_NO_CONDITION,
	X_ELIF_NO_ADJACENT_IF,
	X_ELSE_NO_ADJACENT_IF,
	X_FOR_NO_EXPRESSION,
	X_FOR_MALFORMED_EXPRESSION,

	// 未知错误
	UNKNOWN_ERROR
}