/**
 * for 循环转换插件
 * 将 for 节点转换为 map 调用
 */

import {
	NodeTypes,
	ForNode,
	TemplateChildNode,
	TransformContext,
	JSCallExpression,
	JSFunctionExpression,
	JSArrayExpression,
	SimpleExpressionNode
} from '../types'
import {
	createCallExpression,
	createFunctionExpression,
	createSimpleExpression,
	createArrayExpression,
	isForNode
} from '../ast'
import { runtimeHelpers } from '../runtimeHelpers'
import { warn } from '@fluxion-ui/shared'

/**
 * for 转换插件
 *
 * 将：
 * for user in users
 *     p {user.name}
 *
 * 转换为：
 * users().map(user => h("p", [user.name]))
 */
export function transformFor(node: TemplateChildNode, context: TransformContext) {
	if (!isForNode(node)) {
		return
	}

	// 处理 for 节点
	processFor(node, context)
}

/**
 * 处理 for 节点
 */
function processFor(node: ForNode, context: TransformContext) {
	const { source, valueAlias, keyAlias, indexAlias, children } = node

	// 校验源表达式
	if (!source) {
		warn('transformFor: for 节点缺少源表达式')
		return
	}

	// 添加运行时辅助函数
	context.helper(runtimeHelpers.CREATE_ELEMENT_VNODE)

	// 生成代码节点
	const codegenNode = createForCodegen(node, context)

	if (codegenNode) {
		node.codegenNode = codegenNode
	}
}

/**
 * 创建 for 的代码生成节点
 */
function createForCodegen(
	node: ForNode,
	context: TransformContext
): JSCallExpression {
	const { source, valueAlias, keyAlias, indexAlias, children } = node

	// 构建参数列表
	const params: string[] = [valueAlias]
	if (keyAlias) {
		params.push(keyAlias)
	}
	if (indexAlias) {
		params.push(indexAlias)
	}

	// 创建渲染函数体
	let renderBody: any

	if (children.length === 1) {
		// 单个子节点
		const child = children[0]
		if (child.type === NodeTypes.ELEMENT && (child as any).codegenNode) {
			renderBody = (child as any).codegenNode
		} else {
			// 创建数组包装
			renderBody = createArrayExpression([child as any])
		}
	} else {
		// 多个子节点，创建数组
		renderBody = createArrayExpression(
			children.map(child => {
				if (child.type === NodeTypes.ELEMENT && (child as any).codegenNode) {
					return (child as any).codegenNode
				}
				return child as any
			})
		)
	}

	// 创建箭头函数
	const arrowFn = createFunctionExpression(
		params,
		renderBody,
		false, // newline
		false  // isSlot
	)

	// 包装源表达式（如果是 signal，需要调用）
	const sourceExpr = wrapSignalCall(source.content)

	// 创建 map 调用
	// source.map(item => ...)
	const mapCall = createCallExpression(
		`${sourceExpr}.map`,
		[arrowFn]
	)

	return mapCall
}

/**
 * 包装 signal 调用
 * 将 count 转换为 count()
 */
function wrapSignalCall(content: string): string {
	// 简单的标识符，可能是 signal
	if (/^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(content)) {
		// 检查是否已经包含函数调用
		if (!content.includes('(')) {
			return `${content}()`
		}
	}
	return content
}

/**
 * 解析 for 表达式
 * 支持：
 * - for item in list
 * - for (item, index) in list
 * - for (item, key, index) in list
 */
export function parseForExpression(
	source: string,
	valueAlias?: string,
	keyAlias?: string,
	indexAlias?: string
): {
	source: string
	value: string
	key?: string
	index?: string
} | null {
	// 匹配 "item in list" 或 "(item, key, index) in list"
	const inMatch = source.match(/^\s*(?:\(([^)]+)\)|(\w+))\s+in\s+(.+)$/)

	if (!inMatch) {
		return null
	}

	const sourceExpr = inMatch[3].trim()

	// 处理变量
	if (inMatch[2]) {
		// 单变量: for item in list
		return {
			source: sourceExpr,
			value: inMatch[2]
		}
	} else {
		// 多变量: for (item, key, index) in list
		// 或: for (item, index) in list
		const vars = inMatch[1].split(',').map(v => v.trim())
		const result: any = {
			source: sourceExpr,
			value: vars[0]
		}

		if (vars.length === 2) {
			// for (item, index) in list
			result.index = vars[1]
		} else if (vars.length >= 3) {
			// for (item, key, index) in list
			result.key = vars[1]
			result.index = vars[2]
		}

		return result
	}
}

/**
 * 检查节点是否为有效的 for 节点
 */
export function isValidForNode(node: any): node is ForNode {
	return isForNode(node) && !!node.source
}