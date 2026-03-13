/**
 * 编译入口测试
 */

import { describe, it, expect } from 'vitest'
import { compile, getDefaultDOMTransforms, createDOMTransformContext } from '../src/index'
import { createRoot, createElementNode, createTextNode, createDirectiveNode, NodeTypes } from '@fluxion/compiler-core'

describe('compile', () => {
	it('应该编译空的 AST', () => {
		const ast = createRoot([])
		const result = compile(ast)

		expect(result.code).toBeDefined()
		expect(result.ast).toBe(ast)
	})

	it('应该编译带单个元素的 AST', () => {
		const element = createElementNode('div')
		const ast = createRoot([element])
		const result = compile(ast)

		expect(result.code).toContain('render')
		expect(result.code).toContain('h')
	})

	it('应该编译带多个子节点的 AST', () => {
		const text1 = createTextNode('hello')
		const text2 = createTextNode('world')
		const ast = createRoot([text1, text2])
		const result = compile(ast)

		expect(result.code).toBeDefined()
	})

	it('应该编译带事件的元素', () => {
		const directive = createDirectiveNode('click', 'handleClick')
		const element = createElementNode('button', [directive])
		const ast = createRoot([element])
		const result = compile(ast)

		expect(result.code).toContain('onClick')
	})
})

describe('getDefaultDOMTransforms', () => {
	it('应该返回默认转换插件数组', () => {
		const transforms = getDefaultDOMTransforms()

		expect(Array.isArray(transforms)).toBe(true)
		expect(transforms.length).toBeGreaterThan(0)
	})
})

describe('createDOMTransformContext', () => {
	it('应该创建带默认转换插件的上下文', () => {
		const ast = createRoot([])
		const context = createDOMTransformContext(ast)

		expect(context.nodeTransforms.length).toBeGreaterThan(0)
	})

	it('应该允许自定义转换插件', () => {
		const ast = createRoot([])
		const customTransform = () => {}
		const context = createDOMTransformContext(ast, {
			nodeTransforms: [customTransform]
		})

		expect(context.nodeTransforms).toContain(customTransform)
	})
})