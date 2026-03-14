/**
 * 文本插值转换插件
 * 处理文本节点和插值表达式
 */

import {
	NodeTypes,
	TextNode,
	InterpolationNode,
	TemplateChildNode,
	TransformContext,
	CompoundExpressionNode,
	ElementNode
} from '../types'
import {
	createCompoundExpression,
	createSimpleExpression,
	isTextNode,
	isInterpolationNode,
	isElementNode
} from '../ast'
import { warn } from '@fluxion-ui/shared'

/**
 * 文本转换插件
 *
 * 处理文本和插值的混合情况：
 * - 纯文本：直接使用
 * - 插值表达式：包装 signal 调用
 * - 混合文本：创建复合表达式
 */
export function transformText(node: TemplateChildNode, context: TransformContext) {
	// 只处理元素节点
	if (!isElementNode(node)) {
		return
	}

	// 返回退出函数，在子节点处理完成后执行
	return () => {
		processText(node, context)
	}
}

/**
 * 处理元素中的文本
 */
function processText(node: ElementNode, context: TransformContext) {
	const { children } = node

	// 遍历子节点，合并相邻的文本和插值
	let hasText = false
	let currentContainer: CompoundExpressionNode | null = null

	for (let i = 0; i < children.length; i++) {
		const child = children[i]

		if (isTextNode(child) || isInterpolationNode(child)) {
			hasText = true

			// 如果前一个节点也是文本或插值，合并到复合表达式
			if (currentContainer) {
				// 添加到复合表达式
				if (isTextNode(child)) {
					// 文本节点
					currentContainer.children.push(child.content)
				} else {
					// 插值节点，包装 signal 调用
					const content = (child.content as any).content
					currentContainer.children.push(
						createSimpleExpression(wrapSignalCall(content), false)
					)
				}
				// 移除当前节点（已合并）
				children.splice(i, 1)
				i--
			} else {
				// 创建新的复合表达式
				if (isTextNode(child)) {
					// 检查下一个节点是否也是文本/插值
					const next = children[i + 1]
					if (next && (isTextNode(next) || isInterpolationNode(next))) {
						// 创建复合表达式
						currentContainer = createCompoundExpression([child.content])
						// 替换当前节点
						children[i] = currentContainer as any
					}
				} else {
					// 插值节点
					const content = (child.content as any).content
					const next = children[i + 1]
					if (next && (isTextNode(next) || isInterpolationNode(next))) {
						// 创建复合表达式
						currentContainer = createCompoundExpression([
							createSimpleExpression(wrapSignalCall(content), false)
						])
						// 替换当前节点
						children[i] = currentContainer as any
					} else {
						// 单独的插值，直接包装
						;(child as any).content = createSimpleExpression(
							wrapSignalCall(content),
							false
						)
					}
				}
			}
		} else {
			// 非文本节点，重置容器
			currentContainer = null
		}
	}

	// 如果没有文本节点，不需要处理
	if (!hasText) {
		return
	}
}

/**
 * 包装 signal 调用
 * 将 count 转换为 count()
 */
function wrapSignalCall(content: string): string {
	if (!content) return ''
	// 简单的标识符，可能是 signal
	if (/^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(content)) {
		if (!content.includes('(')) {
			return `${content}()`
		}
	}
	return content
}

/**
 * 检查节点是否包含文本
 */
export function hasTextChildren(node: ElementNode): boolean {
	return node.children.some(
		child => isTextNode(child) || isInterpolationNode(child)
	)
}

/**
 * 规范化文本内容
 */
export function normalizeTextContent(node: ElementNode): string {
	const parts: string[] = []

	for (const child of node.children) {
		if (isTextNode(child)) {
			parts.push(child.content)
		} else if (isInterpolationNode(child)) {
			parts.push(`{${(child.content as any).content}}`)
		}
	}

	return parts.join('')
}