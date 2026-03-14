/**
 * 代码生成器测试
 */

import { describe, it, expect } from 'vitest'
import { generateModule } from '../src/codegen'
import { NuiNodeTypes, NuiRootNode, ViewBlock } from '../src/types'
import { createRoot, createElementNode, createTextNode } from '@fluxion-ui/compiler-core'

describe('codegen', () => {
	describe('import 生成', () => {
		it('应该生成用户 import 语句', () => {
			const ast: NuiRootNode = {
				type: NuiNodeTypes.NUI_ROOT,
				imports: [{
					type: NuiNodeTypes.IMPORT_DECLARATION,
					identifier: 'Title',
					source: './Title.nui',
					loc: {} as any
				}],
				signals: [],
				functions: [],
				view: null,
				style: null,
				loc: {} as any,
				source: ''
			}

			const result = generateModule(ast)
			expect(result.code).toContain('import Title from "./Title.nui"')
		})
	})

	describe('signal 生成', () => {
		it('应该生成 signal 声明', () => {
			const ast: NuiRootNode = {
				type: NuiNodeTypes.NUI_ROOT,
				imports: [],
				signals: [{
					type: NuiNodeTypes.SIGNAL_DECLARATION,
					name: 'count',
					isAsync: false,
					initExpression: '0',
					loc: {} as any
				}],
				functions: [],
				view: null,
				style: null,
				loc: {} as any,
				source: ''
			}

			const result = generateModule(ast)
			expect(result.code).toContain('const count = signal(0)')
			expect(result.code).toContain('import { signal } from "fluxion-runtime"')
		})

		it('应该生成 asyncSignal 声明', () => {
			const ast: NuiRootNode = {
				type: NuiNodeTypes.NUI_ROOT,
				imports: [],
				signals: [{
					type: NuiNodeTypes.SIGNAL_DECLARATION,
					name: 'users',
					isAsync: true,
					initExpression: 'fetchUsers',
					loc: {} as any
				}],
				functions: [],
				view: null,
				style: null,
				loc: {} as any,
				source: ''
			}

			const result = generateModule(ast)
			expect(result.code).toContain('const users = asyncSignal(fetchUsers)')
			expect(result.code).toContain('asyncSignal')
		})
	})

	describe('function 生成', () => {
		it('应该生成函数定义', () => {
			const ast: NuiRootNode = {
				type: NuiNodeTypes.NUI_ROOT,
				imports: [],
				signals: [],
				functions: [{
					type: NuiNodeTypes.FUNCTION_DECLARATION,
					name: 'increment',
					params: [],
					body: 'count.update(c => c + 1)',
					loc: {} as any
				}],
				view: null,
				style: null,
				loc: {} as any,
				source: ''
			}

			const result = generateModule(ast)
			expect(result.code).toContain('function increment() { count.update(c => c + 1) }')
		})

		it('应该生成带参数的函数', () => {
			const ast: NuiRootNode = {
				type: NuiNodeTypes.NUI_ROOT,
				imports: [],
				signals: [],
				functions: [{
					type: NuiNodeTypes.FUNCTION_DECLARATION,
					name: 'add',
					params: ['a', 'b'],
					body: 'return a + b',
					loc: {} as any
				}],
				view: null,
				style: null,
				loc: {} as any,
				source: ''
			}

			const result = generateModule(ast)
			expect(result.code).toContain('function add(a, b) { return a + b }')
		})
	})

	describe('render 生成', () => {
		it('应该生成 render 函数', () => {
			const view: ViewBlock = {
				type: NuiNodeTypes.VIEW_BLOCK,
				children: [
					createElementNode('div', [], [])
				],
				loc: {} as any
			}

			const ast: NuiRootNode = {
				type: NuiNodeTypes.NUI_ROOT,
				imports: [],
				signals: [],
				functions: [],
				view,
				style: null,
				loc: {} as any,
				source: ''
			}

			const result = generateModule(ast)
			expect(result.code).toContain('function render()')
			expect(result.code).toContain('export default { render }')
			expect(result.code).toContain('h("div")')
		})

		it('应该生成带文本子节点的元素', () => {
			const view: ViewBlock = {
				type: NuiNodeTypes.VIEW_BLOCK,
				children: [
					createElementNode('p', [], [
						createTextNode('hello world')
					])
				],
				loc: {} as any
			}

			const ast: NuiRootNode = {
				type: NuiNodeTypes.NUI_ROOT,
				imports: [],
				signals: [],
				functions: [],
				view,
				style: null,
				loc: {} as any,
				source: ''
			}

			const result = generateModule(ast)
			expect(result.code).toContain('h("p", "hello world")')
		})
	})
})