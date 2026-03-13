/**
 * 元素转换测试
 */

import { describe, it, expect } from 'vitest'
import { transformElement } from '../../src/transforms/transformElement'
import { createElementNode, createTextNode, createAttributeNode, createDirectiveNode, createInterpolationNode } from '../../src/ast'
import { NodeTypes } from '../../src/types'
import { createTransformContext } from '../../src/transform'

describe('transformElement', () => {
	it('应该忽略非元素节点', () => {
		const text = createTextNode('hello')
		const context = createTransformContext(createRoot())

		// @ts-ignore
		const result = transformElement(text, context)

		expect(result).toBeUndefined()
	})

	it('应该转换简单的元素节点', () => {
		const element = createElementNode('div')
		const context = createTransformContext(createRoot())

		const exitFn = transformElement(element, context)
		exitFn?.()

		expect(element.codegenNode).toBeDefined()
		expect(element.codegenNode?.type).toBe(NodeTypes.JS_CALL_EXPRESSION)
	})

	it('应该转换带属性的元素节点', () => {
		const attr = createAttributeNode('id', 'app')
		const element = createElementNode('div', [attr])
		const context = createTransformContext(createRoot())

		const exitFn = transformElement(element, context)
		exitFn?.()

		expect(element.codegenNode).toBeDefined()
	})

	it('应该转换带事件的元素节点', () => {
		const directive = createDirectiveNode('click', 'increment')
		const element = createElementNode('button', [directive])
		const context = createTransformContext(createRoot())

		const exitFn = transformElement(element, context)
		exitFn?.()

		expect(element.codegenNode).toBeDefined()
		// 检查是否包含 onClick
		const callExpr = element.codegenNode as any
		expect(callExpr.arguments.length).toBeGreaterThan(1)
	})

	it('应该转换带子节点的元素节点', () => {
		const text = createTextNode('hello')
		const element = createElementNode('div', [], [text])
		const context = createTransformContext(createRoot())

		const exitFn = transformElement(element, context)
		exitFn?.()

		expect(element.codegenNode).toBeDefined()
	})

	it('应该转换带插值子节点的元素节点', () => {
		const interpolation = createInterpolationNode('count')
		const element = createElementNode('div', [], [interpolation])
		const context = createTransformContext(createRoot())

		const exitFn = transformElement(element, context)
		exitFn?.()

		expect(element.codegenNode).toBeDefined()
	})

	it('应该识别组件标签', () => {
		const element = createElementNode('MyComponent')
		const context = createTransformContext(createRoot())

		const exitFn = transformElement(element, context)
		exitFn?.()

		expect(element.codegenNode).toBeDefined()
		expect(context.components.has('MyComponent')).toBe(true)
	})

	it('应该识别带连字符的组件标签', () => {
		const element = createElementNode('my-component')
		const context = createTransformContext(createRoot())

		const exitFn = transformElement(element, context)
		exitFn?.()

		expect(element.codegenNode).toBeDefined()
	})

	it('应该处理多个子节点', () => {
		const text1 = createTextNode('hello')
		const text2 = createTextNode('world')
		const element = createElementNode('div', [], [text1, text2])
		const context = createTransformContext(createRoot())

		const exitFn = transformElement(element, context)
		exitFn?.()

		expect(element.codegenNode).toBeDefined()
	})

	it('应该添加 CREATE_ELEMENT_VNODE 帮助函数', () => {
		const element = createElementNode('div')
		const context = createTransformContext(createRoot())

		const exitFn = transformElement(element, context)
		exitFn?.()

		expect(context.helpers.size).toBeGreaterThan(0)
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