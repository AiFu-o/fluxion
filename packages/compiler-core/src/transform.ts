/**
 * AST 转换核心
 * 负责遍历 AST 并执行转换插件
 */

import {
	NodeTypes,
	RootNode,
	TemplateChildNode,
	TransformContext,
	TransformFn,
	CompilerOptions,
	CompilerError
} from './types'
import { createRoot, getNodeChildren } from './ast'
import { warn } from '@fluxion-ui/shared'

/**
 * 创建转换上下文
 */
export function createTransformContext(
	root: RootNode,
	options: CompilerOptions = {}
): TransformContext {
	const context: TransformContext = {
		root,
		parent: null,
		childIndex: 0,
		currentNode: null,

		helpers: new Set(),
		components: new Set(),
		directives: new Set(),

		// 转换插件
		nodeTransforms: options.nodeTransforms || [],

		// 替换当前节点
		replaceNode(node: TemplateChildNode) {
			if (!context.parent) {
				warn('replaceNode: 没有父节点')
				return
			}

			// 更新父节点的 children
			const parentChildren = getNodeChildren(context.parent as any)
			if (parentChildren) {
				parentChildren[context.childIndex] = node
			}

			context.currentNode = node
		},

		// 移除当前节点
		removeNode(node?: TemplateChildNode) {
			if (!context.parent) {
				warn('removeNode: 没有父节点')
				return
			}

			const parentChildren = getNodeChildren(context.parent as any)
			if (parentChildren) {
				const index = node
					? parentChildren.indexOf(node)
					: context.childIndex

				if (index > -1) {
					parentChildren.splice(index, 1)
				}
			}

			context.currentNode = null
		},

		// 遍历子节点
		traverseChildren(parent: TemplateChildNode | RootNode) {
			traverseChildren(parent, context)
		},

		// 遍历节点
		traverseNode(node: TemplateChildNode | RootNode) {
			traverseNode(node, context)
		},

		// 辅助函数
		helper(name: symbol): symbol {
			context.helpers.add(name)
			return name
		},

		// 错误处理
		onError: options.onError
	}

	return context
}

/**
 * 执行 AST 转换
 * @param root 根节点
 * @param options 编译选项
 */
export function transform(root: RootNode, options: CompilerOptions = {}): void {
	// 创建转换上下文
	const context = createTransformContext(root, options)

	// 遍历根节点
	traverseNode(root, context)

	// 将 helpers 添加到根节点
	root.helpers = new Set([...root.helpers, ...context.helpers])
	root.components = new Set([...root.components, ...context.components])
	root.directives = new Set([...root.directives, ...context.directives])
}

/**
 * 遍历 AST 节点
 */
export function traverseNode(
	node: TemplateChildNode | RootNode,
	context: TransformContext
): void {
	// 设置当前节点
	context.currentNode = node

	// 获取转换插件
	const { nodeTransforms } = context

	// 存储退出函数
	const exitFns: (() => void)[] = []

	// 执行所有转换插件
	if (nodeTransforms) {
		for (const transform of nodeTransforms) {
			const onExit = transform(node as TemplateChildNode, context)

			// 如果节点被移除，直接返回
			if (!context.currentNode) {
				return
			}

			// 收集退出函数
			if (onExit) {
				if (Array.isArray(onExit)) {
					exitFns.push(...onExit)
				} else {
					exitFns.push(onExit)
				}
			}
		}
	}

	// 根据节点类型继续遍历子节点
	switch (node.type) {
		case NodeTypes.ROOT:
		case NodeTypes.ELEMENT:
		case NodeTypes.IF:
		case NodeTypes.FOR:
			traverseChildren(node, context)
			break

		case NodeTypes.IF_BRANCH:
			// if 分支也需要遍历子节点
			traverseChildren(node, context)
			break

		case NodeTypes.TEXT:
		case NodeTypes.INTERPOLATION:
		case NodeTypes.SIMPLE_EXPRESSION:
		case NodeTypes.COMPOUND_EXPRESSION:
			// 这些节点没有子节点，无需处理
			break
	}

	// 逆序执行退出函数
	context.currentNode = node
	let i = exitFns.length
	while (i--) {
		exitFns[i]()
	}
}

/**
 * 遍历子节点
 */
export function traverseChildren(
	parent: TemplateChildNode | RootNode,
	context: TransformContext
): void {
	// 获取子节点
	const children = getNodeChildren(parent as any)

	if (!children || children.length === 0) {
		return
	}

	// 保存父节点
	const parentStack: (TemplateChildNode | RootNode)[] = []
	let currentParent = context.parent

	// 设置新的父节点
	context.parent = parent as TemplateChildNode

	// 遍历子节点
	for (let i = 0; i < children.length; i++) {
		context.childIndex = i
		traverseNode(children[i], context)
	}

	// 恢复父节点
	context.parent = currentParent
}

/**
 * 创建简单的转换插件
 */
export function createTransform(
	types: NodeTypes[],
	fn: TransformFn
): TransformFn {
	return (node, context) => {
		if (types.includes(node.type)) {
			return fn(node, context)
		}
	}
}