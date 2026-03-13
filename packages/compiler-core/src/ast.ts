/**
 * AST 节点创建和工具函数
 */

import {
	NodeTypes,
	RootNode,
	ElementNode,
	TextNode,
	InterpolationNode,
	IfNode,
	IfBranchNode,
	ForNode,
	AttributeNode,
	DirectiveNode,
	SimpleExpressionNode,
	CompoundExpressionNode,
	ElementTypes,
	SourceLocation,
	Position,
	JSCallExpression,
	JSObjectExpression,
	JSArrayExpression,
	JSFunctionExpression,
	JSConditionalExpression,
	JSChildNode,
	TemplateChildNode
} from './types'
import { warn } from '@fluxion/shared'

// ==================== 位置相关 ====================

/**
 * 默认位置
 */
export const defaultPosition: Position = {
	offset: 0,
	line: 1,
	column: 1
}

/**
 * 默认源码位置
 */
export const defaultLoc: SourceLocation = {
	start: defaultPosition,
	end: defaultPosition,
	source: ''
}

/**
 * 创建位置对象
 */
export function createPosition(
	offset: number,
	line: number,
	column: number
): Position {
	return { offset, line, column }
}

/**
 * 创建源码位置对象
 */
export function createSourceLocation(
	start: Position,
	end: Position,
	source: string
): SourceLocation {
	return { start, end, source }
}

// ==================== 根节点 ====================

/**
 * 创建根节点
 */
export function createRoot(
	children: TemplateChildNode[] = [],
	loc: SourceLocation = defaultLoc
): RootNode {
	return {
		type: NodeTypes.ROOT,
		children,
		helpers: new Set(),
		components: new Set(),
		directives: new Set(),
		imports: new Set(),
		loc
	}
}

// ==================== 元素节点 ====================

/**
 * 创建元素节点
 */
export function createElementNode(
	tag: string,
	props: Array<AttributeNode | DirectiveNode> = [],
	children: TemplateChildNode[] = [],
	loc: SourceLocation = defaultLoc,
	isSelfClosing: boolean = false
): ElementNode {
	return {
		type: NodeTypes.ELEMENT,
		tag,
		props,
		children,
		isSelfClosing,
		loc
	}
}

// ==================== 文本节点 ====================

/**
 * 创建文本节点
 */
export function createTextNode(
	content: string = '',
	loc: SourceLocation = defaultLoc
): TextNode {
	return {
		type: NodeTypes.TEXT,
		content,
		loc
	}
}

// ==================== 插值节点 ====================

/**
 * 创建插值节点
 */
export function createInterpolationNode(
	content: string | ExpressionNode,
	loc: SourceLocation = defaultLoc
): InterpolationNode {
	const expression = typeof content === 'string'
		? createSimpleExpression(content, false, loc)
		: content

	return {
		type: NodeTypes.INTERPOLATION,
		content: expression,
		loc
	}
}

// ==================== 属性节点 ====================

/**
 * 创建属性节点
 */
export function createAttributeNode(
	name: string,
	value: string | TextNode | null = null,
	loc: SourceLocation = defaultLoc
): AttributeNode {
	const valueNode = typeof value === 'string'
		? createTextNode(value, loc)
		: value

	return {
		type: NodeTypes.ATTRIBUTE,
		name,
		value: valueNode,
		loc
	}
}

/**
 * 创建指令节点
 */
export function createDirectiveNode(
	name: string,
	exp: string | ExpressionNode | null = null,
	arg: string | ExpressionNode | null = null,
	modifiers: string[] = [],
	loc: SourceLocation = defaultLoc
): DirectiveNode {
	const expNode = typeof exp === 'string'
		? createSimpleExpression(exp, false, loc)
		: exp

	const argNode = typeof arg === 'string'
		? createSimpleExpression(arg, true, loc)
		: arg

	return {
		type: NodeTypes.DIRECTIVE,
		name,
		exp: expNode,
		arg: argNode,
		modifiers,
		loc
	}
}

// ==================== 表达式节点 ====================

/**
 * 表达式节点类型
 */
export type ExpressionNode = SimpleExpressionNode | CompoundExpressionNode

/**
 * 创建简单表达式节点
 */
export function createSimpleExpression(
	content: string,
	isStatic: boolean = false,
	loc: SourceLocation = defaultLoc,
	identifiers?: string[]
): SimpleExpressionNode {
	return {
		type: NodeTypes.SIMPLE_EXPRESSION,
		content,
		isStatic,
		loc,
		identifiers
	}
}

/**
 * 创建复合表达式节点
 */
export function createCompoundExpression(
	children: (SimpleExpressionNode | CompoundExpressionNode | InterpolationNode | TextNode | string)[],
	loc: SourceLocation = defaultLoc
): CompoundExpressionNode {
	return {
		type: NodeTypes.COMPOUND_EXPRESSION,
		children,
		loc
	}
}

// ==================== 控制流节点 ====================

/**
 * 创建 if 节点
 */
export function createIfNode(
	branches: IfBranchNode[],
	loc: SourceLocation = defaultLoc
): IfNode {
	return {
		type: NodeTypes.IF,
		branches,
		loc
	}
}

/**
 * 创建 if 分支节点
 */
export function createIfBranchNode(
	children: TemplateChildNode[],
	condition?: ExpressionNode,
	loc: SourceLocation = defaultLoc
): IfBranchNode {
	return {
		type: NodeTypes.IF_BRANCH,
		children,
		condition,
		loc
	}
}

/**
 * 创建 for 节点
 */
export function createForNode(
	source: ExpressionNode,
	valueAlias: string,
	children: TemplateChildNode[],
	keyAlias?: string,
	indexAlias?: string,
	loc: SourceLocation = defaultLoc
): ForNode {
	return {
		type: NodeTypes.FOR,
		source,
		valueAlias,
		keyAlias,
		indexAlias,
		children,
		loc
	}
}

// ==================== JS 代码节点 ====================

/**
 * 创建 JS 函数调用表达式
 */
export function createCallExpression(
	callee: string | symbol,
	args: (string | JSChildNode)[] = [],
	loc: SourceLocation = defaultLoc
): JSCallExpression {
	return {
		type: NodeTypes.JS_CALL_EXPRESSION,
		callee,
		arguments: args,
		loc
	}
}

/**
 * 创建 JS 对象表达式
 */
export function createObjectExpression(
	properties: Array<{ key: string | ExpressionNode; value: JSChildNode | string }> = [],
	loc: SourceLocation = defaultLoc
): JSObjectExpression {
	return {
		type: NodeTypes.JS_OBJECT_EXPRESSION,
		properties,
		loc
	}
}

/**
 * 创建 JS 数组表达式
 */
export function createArrayExpression(
	elements: (JSChildNode | string | null)[] = [],
	loc: SourceLocation = defaultLoc
): JSArrayExpression {
	return {
		type: NodeTypes.JS_ARRAY_EXPRESSION,
		elements,
		loc
	}
}

/**
 * 创建 JS 函数表达式
 */
export function createFunctionExpression(
	params: string[] | ExpressionNode[] = [],
	returns?: JSChildNode,
	newline: boolean = false,
	isSlot: boolean = false,
	loc: SourceLocation = defaultLoc
): JSFunctionExpression {
	return {
		type: NodeTypes.JS_FUNCTION_EXPRESSION,
		params,
		returns,
		newline,
		isSlot,
		loc
	}
}

/**
 * 创建 JS 条件表达式
 */
export function createConditionalExpression(
	test: JSChildNode,
	consequent: JSChildNode,
	alternate: JSChildNode | JSConditionalExpression,
	newline: boolean = true,
	loc: SourceLocation = defaultLoc
): JSConditionalExpression {
	return {
		type: NodeTypes.JS_CONDITIONAL_EXPRESSION,
		test,
		consequent,
		alternate,
		newline,
		loc
	}
}

// ==================== 工具函数 ====================

/**
 * 判断是否为元素节点
 */
export function isElementNode(node: any): node is ElementNode {
	return node?.type === NodeTypes.ELEMENT
}

/**
 * 判断是否为文本节点
 */
export function isTextNode(node: any): node is TextNode {
	return node?.type === NodeTypes.TEXT
}

/**
 * 判断是否为插值节点
 */
export function isInterpolationNode(node: any): node is InterpolationNode {
	return node?.type === NodeTypes.INTERPOLATION
}

/**
 * 判断是否为 if 节点
 */
export function isIfNode(node: any): node is IfNode {
	return node?.type === NodeTypes.IF
}

/**
 * 判断是否为 for 节点
 */
export function isForNode(node: any): node is ForNode {
	return node?.type === NodeTypes.FOR
}

/**
 * 判断是否为简单表达式节点
 */
export function isSimpleExpressionNode(node: any): node is SimpleExpressionNode {
	return node?.type === NodeTypes.SIMPLE_EXPRESSION
}

/**
 * 判断是否为复合表达式节点
 */
export function isCompoundExpressionNode(node: any): node is CompoundExpressionNode {
	return node?.type === NodeTypes.COMPOUND_EXPRESSION
}

/**
 * 获取节点的所有子节点
 */
export function getNodeChildren(node: RootNode | ElementNode | IfNode | ForNode): TemplateChildNode[] {
	switch (node.type) {
		case NodeTypes.ROOT:
		case NodeTypes.ELEMENT:
		case NodeTypes.IF_BRANCH:
		case NodeTypes.FOR:
			return node.children
		case NodeTypes.IF:
			return node.branches
		default:
			return []
	}
}

/**
 * 克隆 AST 节点
 */
export function cloneNode<T extends BaseNode>(node: T): T {
	const cloned = { ...node }
	if (node.loc) {
		cloned.loc = { ...node.loc }
	}
	return cloned
}