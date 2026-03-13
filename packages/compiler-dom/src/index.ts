/**
 * compiler-dom
 * DOM 平台特定的编译功能
 */

// 从 compiler-core 重新导出类型和工具
export {
	// 类型
	NodeTypes,
	ElementTypes,
	ErrorCodes,
	type RootNode,
	type ElementNode,
	type TextNode,
	type InterpolationNode,
	type IfNode,
	type IfBranchNode,
	type ForNode,
	type AttributeNode,
	type DirectiveNode,
	type SimpleExpressionNode,
	type CompoundExpressionNode,
	type ExpressionNode,
	type TemplateChildNode,
	type TransformContext,
	type TransformFn,
	type CompilerOptions,
	type CompilerError,
	type CodegenResult,
	type SourceLocation,
	type Position,
	type JSChildNode,
	type JSCallExpression,
	type JSObjectExpression,
	type JSArrayExpression,
	type JSFunctionExpression,
	type JSConditionalExpression,

	// AST 工具
	createRoot,
	createElementNode,
	createTextNode,
	createInterpolationNode,
	createAttributeNode,
	createDirectiveNode,
	createIfNode,
	createIfBranchNode,
	createForNode,
	createSimpleExpression,
	createCompoundExpression,
	createCallExpression,
	createObjectExpression,
	createArrayExpression,
	createFunctionExpression,
	createConditionalExpression,
	createPosition,
	createSourceLocation,
	isElementNode,
	isTextNode,
	isInterpolationNode,
	isIfNode,
	isForNode,
	isSimpleExpressionNode,
	isCompoundExpressionNode,
	getNodeChildren,
	cloneNode,

	// 转换
	transform,
	traverseNode,
	traverseChildren,
	createTransformContext,
	createTransform,

	// 转换插件（compiler-core）
	transformIf,
	transformFor,
	transformText,
	getDefaultTransforms,
	isValidIfBranch,
	getIfBranchType,
	isValidForNode,
	parseForExpression,
	hasTextChildren,
	normalizeTextContent,

	// 代码生成
	generate,

	// 运行时辅助
	runtimeHelpers,
	getRuntimeHelperName,
	isRuntimeHelper
} from '@fluxion/compiler-core'

// 标签配置
export {
	HTML_TAGS,
	SVG_TAGS,
	VOID_TAGS,
	isHTMLTag,
	isSVGTag,
	isVoidTag,
	getTagType,
	isNativeTag,
	isComponentTag
} from './tagConfig'

// DOM 运行时辅助
export {
	DOM_RUNTIME_HELPERS,
	DOMRuntimeHelperNames,
	getDOMRuntimeHelperName,
	isDOMRuntimeHelper,
	EVENT_MODIFIERS,
	KEY_MODIFIERS,
	isEventModifier,
	isKeyModifier,
	getModifierType
} from './runtimeHelpers'

// DOM 转换插件
export {
	transformElement,
	isDOMProperty,
	isBooleanDOMProperty
} from './transforms'

// ==================== 编译功能 ====================

import {
	RootNode,
	CompilerOptions,
	CodegenResult,
	transform,
	generate,
	TransformFn,
	createTransformContext
} from '@fluxion/compiler-core'
import { warn } from '@fluxion/shared'
import { transformElement } from './transforms'
import { transformIf, transformFor, transformText } from '@fluxion/compiler-core'

/**
 * DOM 编译器选项
 */
export interface DOMCompilerOptions extends CompilerOptions {
	/** 自定义元素判断函数 */
	isCustomElement?: (tag: string) => boolean
	/** 空白处理策略 */
	whitespace?: 'condense' | 'preserve'
}

/**
 * 获取 DOM 默认转换插件
 */
export function getDefaultDOMTransforms(): TransformFn[] {
	return [
		transformIf,
		transformFor,
		transformElement,
		transformText
	]
}

/**
 * 编译 AST 为渲染函数代码
 * @param ast AST 根节点
 * @param options 编译选项
 */
export function compile(ast: RootNode, options: DOMCompilerOptions = {}): CodegenResult {
	// 合并默认转换插件
	const transforms = options.nodeTransforms || getDefaultDOMTransforms()

	// 执行转换
	transform(ast, {
		...options,
		nodeTransforms: transforms
	})

	// 生成代码
	return generate(ast)
}

/**
 * 创建 DOM 转换上下文
 */
export function createDOMTransformContext(
	root: RootNode,
	options: DOMCompilerOptions = {}
) {
	return createTransformContext(root, {
		...options,
		nodeTransforms: options.nodeTransforms || getDefaultDOMTransforms()
	})
}