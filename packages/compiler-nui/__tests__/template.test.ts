/**
 * 模板解析器测试
 */

import { describe, it, expect } from 'vitest'
import { tokenize } from '../src/tokenizer'
import { parseViewBlock } from '../src/parser/template'
import { NodeTypes } from '@fluxion/compiler-core'

describe('template parser', () => {
	describe('基础元素解析', () => {
		it('应该正确解析简单元素', () => {
			const source = `view
	div`
			const tokens = tokenize(source).tokens
			const result = parseViewBlock(tokens)

			expect(result.view).not.toBeNull()
			expect(result.view!.children).toHaveLength(1)
			expect(result.view!.children[0].type).toBe(NodeTypes.ELEMENT)
		})

		it('应该正确解析多个同级元素', () => {
			const source = `view
	div
	p`
			const tokens = tokenize(source).tokens
			const result = parseViewBlock(tokens)

			expect(result.view!.children).toHaveLength(2)
		})

		it('应该正确解析嵌套元素', () => {
			const source = `view
	div
		p
			span`
			const tokens = tokenize(source).tokens
			const result = parseViewBlock(tokens)

			const div = result.view!.children[0]
			expect(div.type).toBe(NodeTypes.ELEMENT)

			// 检查嵌套结构
			if (div.type === NodeTypes.ELEMENT) {
				expect(div.children).toHaveLength(1)
				const p = div.children[0]
				expect(p.type).toBe(NodeTypes.ELEMENT)

				if (p.type === NodeTypes.ELEMENT) {
					expect(p.children).toHaveLength(1)
					const span = p.children[0]
					expect(span.type).toBe(NodeTypes.ELEMENT)
				}
			}
		})
	})

	describe('属性解析', () => {
		it('应该正确解析简单属性', () => {
			const source = `view
	div id="test"`
			const tokens = tokenize(source).tokens
			const result = parseViewBlock(tokens)

			const div = result.view!.children[0] as any
			expect(div.props).toHaveLength(1)
			expect(div.props[0].name).toBe('id')
		})

		it('应该正确解析多个属性', () => {
			const source = `view
	div id="test" class="container"`
			const tokens = tokenize(source).tokens
			const result = parseViewBlock(tokens)

			const div = result.view!.children[0] as any
			expect(div.props).toHaveLength(2)
		})
	})

	describe('事件指令解析', () => {
		it('应该正确解析事件绑定', () => {
			const source = `view
	button @click=handleClick`
			const tokens = tokenize(source).tokens
			const result = parseViewBlock(tokens)

			const button = result.view!.children[0] as any
			expect(button.props).toHaveLength(1)
			expect(button.props[0].type).toBe(NodeTypes.DIRECTIVE)
			expect(button.props[0].name).toBe('on')
		})
	})

	describe('if/elif/else 解析', () => {
		it('应该正确解析简单 if', () => {
			const source = `view
	if loading
		p loading...`
			const tokens = tokenize(source).tokens
			const result = parseViewBlock(tokens)

			expect(result.view!.children).toHaveLength(1)
			expect(result.view!.children[0].type).toBe(NodeTypes.IF)
		})

		it('应该正确解析 if/else', () => {
			const source = `view
	if loading
		p loading...
	else
		p loaded`
			const tokens = tokenize(source).tokens
			const result = parseViewBlock(tokens)

			const ifNode = result.view!.children[0] as any
			expect(ifNode.type).toBe(NodeTypes.IF)
			expect(ifNode.branches).toHaveLength(2)
		})

		it('应该正确解析 if/elif/else', () => {
			const source = `view
	if loading
		p loading...
	elif error
		p error
	else
		p loaded`
			const tokens = tokenize(source).tokens
			const result = parseViewBlock(tokens)

			const ifNode = result.view!.children[0] as any
			expect(ifNode.branches).toHaveLength(3)
		})
	})

	describe('for 循环解析', () => {
		it('应该正确解析简单 for', () => {
			const source = `view
	for item in items
		p item`
			const tokens = tokenize(source).tokens
			const result = parseViewBlock(tokens)

			expect(result.view!.children).toHaveLength(1)
			const forNode = result.view!.children[0]
			expect(forNode.type).toBe(NodeTypes.FOR)

			if (forNode.type === NodeTypes.FOR) {
				expect(forNode.valueAlias).toBe('item')
				expect(forNode.source.content).toBe('items')
			}
		})

		it('应该正确解析嵌套 for', () => {
			const source = `view
	for row in rows
		for cell in row.cells
			p cell`
			const tokens = tokenize(source).tokens
			const result = parseViewBlock(tokens)

			const outerFor = result.view!.children[0]
			expect(outerFor.type).toBe(NodeTypes.FOR)
		})
	})

	describe('混合结构解析', () => {
		it('应该正确解析复杂结构', () => {
			const source = `view
	div
		p hello
		if loading
			p loading...
		else
			p loaded
		for item in items
			p item
		button @click=handleClick`
			const tokens = tokenize(source).tokens
			const result = parseViewBlock(tokens)

			const div = result.view!.children[0] as any
			expect(div.type).toBe(NodeTypes.ELEMENT)
			expect(div.children).toHaveLength(4) // p, if, for, button

			// 检查 if 节点
			const ifNode = div.children[1]
			expect(ifNode.type).toBe(NodeTypes.IF)

			// 检查 for 节点
			const forNode = div.children[2]
			expect(forNode.type).toBe(NodeTypes.FOR)

			// 检查 button 的事件
			const button = div.children[3] as any
			expect(button.props).toHaveLength(1)
		})
	})

	describe('错误处理', () => {
		it('应该报告 elif 缺少 if 的错误', () => {
			const source = `view
	elif x
		p test`
			const tokens = tokenize(source).tokens
			const result = parseViewBlock(tokens)

			expect(result.errors.length).toBeGreaterThan(0)
		})

		it('应该报告 else 缺少 if 的错误', () => {
			const source = `view
	else
		p test`
			const tokens = tokenize(source).tokens
			const result = parseViewBlock(tokens)

			expect(result.errors.length).toBeGreaterThan(0)
		})
	})
})