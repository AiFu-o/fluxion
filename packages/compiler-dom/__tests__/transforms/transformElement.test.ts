/**
 * DOM 元素转换测试
 */

import { describe, it, expect } from 'vitest'
import { transformElement, isDOMProperty, isBooleanDOMProperty } from '../../src/transforms/transformElement'
import { createElementNode, createTextNode, createAttributeNode, createDirectiveNode, createInterpolationNode } from '@fluxion-ui/compiler-core'
import { NodeTypes } from '@fluxion-ui/compiler-core'
import { createTransformContext } from '@fluxion-ui/compiler-core'

describe('transformElement', () => {
	it('应该忽略非元素节点', () => {
		const text = createTextNode('hello')
		const context = createTransformContext(createRoot())

		// @ts-ignore
		const result = transformElement(text, context)

		expect(result).toBeUndefined()
	})

	it('应该转换简单的 HTML 元素节点', () => {
		const element = createElementNode('div')
		const context = createTransformContext(createRoot())

		const exitFn = transformElement(element, context)
		exitFn?.()

		expect(element.codegenNode).toBeDefined()
		expect(element.codegenNode?.type).toBe(NodeTypes.JS_CALL_EXPRESSION)
	})

	it('应该转换 SVG 元素节点', () => {
		const element = createElementNode('svg')
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

	it('应该处理带事件的元素节点', () => {
		const directive = createDirectiveNode('click', 'increment')
		const element = createElementNode('button', [directive])
		const context = createTransformContext(createRoot())

		const exitFn = transformElement(element, context)
		exitFn?.()

		expect(element.codegenNode).toBeDefined()
	})

	it('应该处理带子节点的元素节点', () => {
		const text = createTextNode('hello')
		const element = createElementNode('div', [], [text])
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

describe('isDOMProperty', () => {
	it('应该识别 DOM 属性', () => {
		expect(isDOMProperty('value')).toBe(true)
		expect(isDOMProperty('checked')).toBe(true)
		expect(isDOMProperty('innerHTML')).toBe(true)
	})

	it('应该对非 DOM 属性返回 false', () => {
		expect(isDOMProperty('class')).toBe(false)
		expect(isDOMProperty('id')).toBe(false)
	})
})

describe('isBooleanDOMProperty', () => {
	it('应该识别布尔值 DOM 属性', () => {
		expect(isBooleanDOMProperty('checked')).toBe(true)
		expect(isBooleanDOMProperty('disabled')).toBe(true)
		expect(isBooleanDOMProperty('readOnly')).toBe(true)
	})

	it('应该对非布尔值属性返回 false', () => {
		expect(isBooleanDOMProperty('value')).toBe(false)
		expect(isBooleanDOMProperty('innerHTML')).toBe(false)
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