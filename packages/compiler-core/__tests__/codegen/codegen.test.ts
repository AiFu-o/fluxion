/**
 * 代码生成测试
 */

import { describe, it, expect } from 'vitest'
import { generate } from '../../src/codegen'
import { createRoot, createElementNode, createTextNode, createInterpolationNode, createIfNode, createIfBranchNode, createForNode, createSimpleExpression, createCallExpression, createObjectExpression, createArrayExpression, createConditionalExpression } from '../../src/ast'
import { NodeTypes } from '../../src/types'
import { runtimeHelpers } from '../../src/runtimeHelpers'

describe('generate', () => {
	it('应该生成空的 render 函数', () => {
		const root = createRoot()
		const result = generate(root)

		expect(result.code).toContain('function render()')
	})

	it('应该生成带子节点的 render 函数', () => {
		const text = createTextNode('hello')
		const root = createRoot([text])
		const result = generate(root)

		expect(result.code).toContain('return')
		expect(result.code).toContain('"hello"')
	})

	it('应该生成元素节点代码', () => {
		const element = createElementNode('div')
		element.codegenNode = createCallExpression('h', ['"div"'])
		const root = createRoot([element])
		const result = generate(root)

		expect(result.code).toContain('h("div")')
	})

	it('应该生成带属性的元素代码', () => {
		const element = createElementNode('div')
		element.codegenNode = createCallExpression('h', [
			'"div"',
			createObjectExpression([{ key: 'id', value: '"app"' }])
		])
		const root = createRoot([element])
		const result = generate(root)

		expect(result.code).toContain('id')
		expect(result.code).toContain('app')
	})

	it('应该生成带子节点的元素代码', () => {
		const element = createElementNode('div')
		element.codegenNode = createCallExpression('h', [
			'"div"',
			'null',
			createArrayExpression(['"hello"'])
		])
		const root = createRoot([element])
		const result = generate(root)

		expect(result.code).toContain('[')
		expect(result.code).toContain(']')
	})
})

describe('条件表达式生成', () => {
	it('应该生成条件表达式', () => {
		const conditional = createConditionalExpression(
			createSimpleExpression('loading()', false),
			createSimpleExpression('"loading..."', true),
			createSimpleExpression('"done"', true)
		)
		const root = createRoot()
		root.children = [conditional as any]
		const result = generate(root)

		expect(result.code).toContain('?')
		expect(result.code).toContain(':')
	})
})

describe('函数调用生成', () => {
	it('应该生成 h 函数调用', () => {
		const call = createCallExpression(runtimeHelpers.CREATE_ELEMENT_VNODE, ['"div"'])
		const root = createRoot()
		root.children = [call as any]
		root.helpers.add(runtimeHelpers.CREATE_ELEMENT_VNODE)
		const result = generate(root)

		expect(result.code).toContain('h("div")')
	})

	it('应该生成带多个参数的函数调用', () => {
		const call = createCallExpression('map', [
			createSimpleExpression('item', false),
			createSimpleExpression('=> item', false)
		])
		const root = createRoot()
		root.children = [call as any]
		const result = generate(root)

		expect(result.code).toContain('map')
	})
})

describe('数组表达式生成', () => {
	it('应该生成空数组', () => {
		const arr = createArrayExpression([])
		const root = createRoot()
		root.children = [arr as any]
		const result = generate(root)

		expect(result.code).toContain('[]')
	})

	it('应该生成带元素的数组', () => {
		const arr = createArrayExpression(['"a"', '"b"', '"c"'])
		const root = createRoot()
		root.children = [arr as any]
		const result = generate(root)

		expect(result.code).toContain('[')
		expect(result.code).toContain(']')
	})
})

describe('对象表达式生成', () => {
	it('应该生成空对象', () => {
		const obj = createObjectExpression([])
		const root = createRoot()
		root.children = [obj as any]
		const result = generate(root)

		expect(result.code).toContain('{}')
	})

	it('应该生成带属性的对象', () => {
		const obj = createObjectExpression([
			{ key: 'id', value: '"app"' },
			{ key: 'class', value: '"container"' }
		])
		const root = createRoot()
		root.children = [obj as any]
		const result = generate(root)

		expect(result.code).toContain('id')
		expect(result.code).toContain('app')
		expect(result.code).toContain('class')
	})
})

describe('导入生成', () => {
	it('应该生成导入语句', () => {
		const root = createRoot()
		root.helpers.add(runtimeHelpers.CREATE_ELEMENT_VNODE)
		const result = generate(root)

		expect(result.code).toContain('import')
		expect(result.code).toContain('h')
	})

	it('应该生成多个导入', () => {
		const root = createRoot()
		root.helpers.add(runtimeHelpers.CREATE_ELEMENT_VNODE)
		root.helpers.add(runtimeHelpers.CREATE_TEXT_VNODE)
		const result = generate(root)

		expect(result.code).toContain('import')
		expect(result.code).toContain('h')
		expect(result.code).toContain('createTextVNode')
	})
})