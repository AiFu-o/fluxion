/**
 * vFor 转换测试
 */

import { describe, it, expect } from 'vitest'
import { transformFor, isValidForNode, parseForExpression } from '../../src/transforms/vFor'
import { createForNode, createSimpleExpression, createElementNode, createTextNode } from '../../src/ast'
import { NodeTypes, ForNode } from '../../src/types'
import { createTransformContext } from '../../src/transform'

describe('transformFor', () => {
	it('应该忽略非 for 节点', () => {
		const text = createTextNode('hello')
		const context = createTransformContext(createRoot())

		// @ts-ignore
		transformFor(text, context)

		expect((text as any).codegenNode).toBeUndefined()
	})

	it('应该转换简单的 for 节点', () => {
		const source = createSimpleExpression('users', false)
		const forNode = createForNode(source, 'user', [
			createElementNode('div')
		])
		const context = createTransformContext(createRoot())

		transformFor(forNode, context)

		expect(forNode.codegenNode).toBeDefined()
		expect(forNode.codegenNode?.type).toBe(NodeTypes.JS_CALL_EXPRESSION)
	})

	it('应该转换带 key 的 for 节点', () => {
		const source = createSimpleExpression('items', false)
		const forNode = createForNode(source, 'item', [], 'key')
		const context = createTransformContext(createRoot())

		transformFor(forNode, context)

		expect(forNode.codegenNode).toBeDefined()
	})

	it('应该转换带 key 和 index 的 for 节点', () => {
		const source = createSimpleExpression('items', false)
		const forNode = createForNode(source, 'item', [], 'key', 'index')
		const context = createTransformContext(createRoot())

		transformFor(forNode, context)

		expect(forNode.codegenNode).toBeDefined()
	})

	it('应该生成 map 调用', () => {
		const source = createSimpleExpression('users', false)
		const forNode = createForNode(source, 'user', [
			createTextVNode('user.name')
		])
		const context = createTransformContext(createRoot())

		transformFor(forNode, context)

		// 检查生成的代码是否包含 .map
		const codegen = forNode.codegenNode as any
		expect(codegen.callee).toContain('.map')
	})
})

describe('isValidForNode', () => {
	it('应该识别有效的 for 节点', () => {
		const source = createSimpleExpression('users', false)
		const forNode = createForNode(source, 'user', [])
		expect(isValidForNode(forNode)).toBe(true)
	})

	it('应该拒绝非 for 节点', () => {
		expect(isValidForNode(null)).toBe(false)
		expect(isValidForNode({})).toBe(false)
		expect(isValidForNode({ type: NodeTypes.TEXT })).toBe(false)
	})

	it('应该拒绝没有 source 的 for 节点', () => {
		const forNode = { type: NodeTypes.FOR, source: null }
		expect(isValidForNode(forNode)).toBe(false)
	})
})

describe('parseForExpression', () => {
	it('应该解析简单的 for 表达式', () => {
		const result = parseForExpression('item in items')
		expect(result).toEqual({
			source: 'items',
			value: 'item'
		})
	})

	it('应该解析带索引的 for 表达式', () => {
		const result = parseForExpression('(item, index) in items')
		expect(result).toEqual({
			source: 'items',
			value: 'item',
			index: 'index'
		})
	})

	it('应该解析带 key 和索引的 for 表达式', () => {
		const result = parseForExpression('(item, key, index) in items')
		expect(result).toEqual({
			source: 'items',
			value: 'item',
			key: 'key',
			index: 'index'
		})
	})

	it('应该拒绝无效的 for 表达式', () => {
		expect(parseForExpression('invalid')).toBeNull()
		expect(parseForExpression('item')).toBeNull()
	})
})

// 辅助函数
function createRoot() {
	return {
		type: NodeTypes.ROOT,
		children: [],
		helpers: new Set(),
		components: new Set(),
		directives: new Set(),
		imports: new Set()
	} as any
}

function createTextVNode(content: string) {
	return {
		type: NodeTypes.TEXT,
		content
	} as const
}