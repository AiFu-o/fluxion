/**
 * AST 转换核心测试
 */

import { describe, it, expect } from 'vitest'
import { transform, createTransformContext, traverseNode, traverseChildren } from '../src/transform'
import { createRoot, createElementNode, createTextNode, createInterpolationNode, createIfNode, createIfBranchNode, createSimpleExpression } from '../src/ast'
import { NodeTypes } from '../src/types'

describe('transform', () => {
	it('应该能转换空的根节点', () => {
		const root = createRoot()
		transform(root, {})
		expect(root.children.length).toBe(0)
	})

	it('应该能转换带子节点的根节点', () => {
		const text = createTextNode('hello')
		const root = createRoot([text])

		transform(root, {})

		expect(root.children.length).toBe(1)
	})

	it('应该收集帮助函数', () => {
		const root = createRoot()
		const context = createTransformContext(root)

		// 添加一个帮助函数
		const helper = Symbol('test')
		context.helper(helper)

		transform(root, {})

		// 帮助函数应该在上下文中
		expect(context.helpers.has(helper)).toBe(true)
	})
})

describe('createTransformContext', () => {
	it('应该创建转换上下文', () => {
		const root = createRoot()
		const context = createTransformContext(root)

		expect(context.root).toBe(root)
		expect(context.parent).toBeNull()
		expect(context.currentNode).toBeNull()
		expect(context.helpers.size).toBe(0)
	})

	it('应该支持替换节点', () => {
		const text = createTextNode('hello')
		const element = createElementNode('div', [], [text])
		const root = createRoot([element])
		const context = createTransformContext(root, {
			nodeTransforms: []
		})

		// 设置父节点和当前节点
		context.parent = root
		context.childIndex = 0
		context.currentNode = element

		// 替换节点
		const newText = createTextNode('replaced')
		context.replaceNode(newText)

		expect(root.children[0]).toBe(newText)
	})

	it('应该支持移除节点', () => {
		const text = createTextNode('hello')
		const element = createElementNode('div', [], [text])
		const root = createRoot([element])
		const context = createTransformContext(root)

		context.parent = root
		context.childIndex = 0
		context.currentNode = element

		context.removeNode()

		expect(root.children.length).toBe(0)
	})
})

describe('traverseNode', () => {
	it('应该遍历元素节点的子节点', () => {
		const text1 = createTextNode('hello')
		const text2 = createTextNode('world')
		const element = createElementNode('div', [], [text1, text2])
		const root = createRoot([element])

		const visited: any[] = []

		transform(root, {
			nodeTransforms: [
				(node) => {
					visited.push(node.type)
				}
			]
		})

		// 应该访问根节点、元素节点、两个文本节点
		expect(visited).toContain(NodeTypes.ROOT)
		expect(visited).toContain(NodeTypes.ELEMENT)
		expect(visited.filter(t => t === NodeTypes.TEXT).length).toBe(2)
	})
})

describe('traverseChildren', () => {
	it('应该遍历所有子节点', () => {
		const text1 = createTextNode('a')
		const text2 = createTextNode('b')
		const text3 = createTextNode('c')
		const root = createRoot([text1, text2, text3])

		const visited: any[] = []

		transform(root, {
			nodeTransforms: [
				(node) => {
					if (node.type === NodeTypes.TEXT) {
						visited.push((node as any).content)
					}
				}
			]
		})

		expect(visited).toEqual(['a', 'b', 'c'])
	})
})

describe('退出函数', () => {
	it('应该正确执行退出函数', () => {
		const text = createTextNode('hello')
		const root = createRoot([text])

		const order: string[] = []

		transform(root, {
			nodeTransforms: [
				(node) => {
					order.push(`enter-${node.type}`)
					return () => {
						order.push(`exit-${node.type}`)
					}
				}
			]
		})

		// 退出函数应该逆序执行
		expect(order[0]).toBe(`enter-${NodeTypes.ROOT}`)
		expect(order[1]).toBe(`enter-${NodeTypes.TEXT}`)
		expect(order[2]).toBe(`exit-${NodeTypes.TEXT}`)
		expect(order[3]).toBe(`exit-${NodeTypes.ROOT}`)
	})
})