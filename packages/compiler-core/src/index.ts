/**
 * compiler-core 编译器核心
 * 平台无关的 AST 转换和代码生成
 */

// 类型
export { NodeTypes, ElementTypes, ErrorCodes } from './types'
export type {
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
	ExpressionNode,
	TemplateChildNode,
	TransformContext,
	TransformFn,
	CompilerOptions,
	CompilerError,
	CodegenResult,
	SourceLocation,
	Position,
	JSChildNode,
	JSCallExpression,
	JSObjectExpression,
	JSArrayExpression,
	JSFunctionExpression,
	JSConditionalExpression
} from './types'

// AST 工具
export {
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
	cloneNode
} from './ast'

// 转换
export { transform, traverseNode, traverseChildren, createTransformContext, createTransform } from './transform'

// 转换插件
export {
	transformIf,
	transformFor,
	transformElement,
	transformText,
	getDefaultTransforms,
	isValidIfBranch,
	getIfBranchType,
	isValidForNode,
	parseForExpression,
	hasTextChildren,
	normalizeTextContent
} from './transforms'

// 代码生成
export { generate } from './codegen'

// 运行时辅助
export { runtimeHelpers, getRuntimeHelperName, isRuntimeHelper } from './runtimeHelpers'