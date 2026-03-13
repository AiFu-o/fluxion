/**
 * 文本转换测试
 */

import { describe, it, expect } from 'vitest'
import { transformText, hasTextChildren, normalizeTextContent } from '../../src/transforms/transformText'
import { createElementNode, createTextNode, createInterpolationNode, createSimpleExpression } from '../../src/ast'
import { NodeTypes } from '../../src/types'
import { createTransformContext } from '../../src/transform'

describe('transformText', () => {
	it('应该忽略非元素节点', () => {
		const text = createTextNode('hello')
		const context = createTransformContext(createRoot())

		// @ts-ignore
		const result = transformText(text, context)

		expect(result).toBeUndefined()
	})

	it('应该处理纯文本子节点', () => {
		const text = createTextNode('hello')
		const element = createElementNode('div', [], [text])
		const context = createTransformContext(createRoot())

		const exitFn = transformText(element, context)
		exitFn?.()

		expect(element.children.length).toBe(1)
	})

	it('应该处理纯插值子节点', () => {
		const interpolation = createInterpolationNode('count')
		const element = createElementNode('div', [], [interpolation])
		const context = createTransformContext(createRoot())

		const exitFn = transformText(element, context)
		exitFn?.()

		expect(element.children.length).toBe(1)
	})

	it('应该合并相邻的文本和插值', () => {
		const text = createTextNode('Hello, ')
		const interpolation = createInterpolationNode('name')
		const text2 = createTextNode('!')
		const element = createElementNode('div', [], [text, interpolation, text2])
		const context = createTransformContext(createRoot())

		const exitFn = transformText(element, context)
		exitFn?.()

		// 应该合并成一个复合表达式
		expect(element.children.length).toBe(1)
		expect(element.children[0].type).toBe(NodeTypes.COMPOUND_EXPRESSION)
	})

	it('应该处理混合内容', () => {
		const text = createTextNode('Count: ')
		const interpolation = createInterpolationNode('count')
		const element = createElementNode('div', [], [text, interpolation])
		const context = createTransformContext(createRoot())

		const exitFn = transformText(element, context)
		exitFn?.()

		expect(element.children.length).toBe(1)
	})

	it('应该保留非文本节点', () => {
		const text = createTextNode('hello')
		const childElement = createElementNode('span')
		const element = createElementNode('div', [], [text, childElement])
		const context = createTransformContext(createRoot())

		const exitFn = transformText(element, context)
		exitFn?.()

		expect(element.children.length).toBe(2)
	})
})

describe('hasTextChildren', () => {
	it('应该识别有文本子节点的元素', () => {
		const text = createTextNode('hello')
		const element = createElementNode('div', [], [text])

		expect(hasTextChildren(element)).toBe(true)
	})

	it('应该识别有插值子节点的元素', () => {
		const interpolation = createInterpolationNode('count')
		const element = createElementNode('div', [], [interpolation])

		expect(hasTextChildren(element)).toBe(true)
	})

	it('应该返回 false 对于没有文本子节点的元素', () => {
		const childElement = createElementNode('span')
		const element = createElementNode('div', [], [childElement])

		expect(hasTextChildren(element)).toBe(false)
	})
})

describe('normalizeTextContent', () => {
	it('应该规范化文本内容', () => {
		const text = createTextNode('Hello, ')
		const interpolation = createInterpolationNode('name')
		const text2 = createTextNode('!')
		const element = createElementNode('div', [], [text, interpolation, text2])

		const result = normalizeTextContent(element)
		expect(result).toBe('Hello, {name}!')
	})

	it('应该处理空元素', () => {
		const element = createElementNode('div')

		const result = normalizeTextContent(element)
		expect(result).toBe('')
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