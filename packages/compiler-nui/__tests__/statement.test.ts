/**
 * 语句解析器测试
 */

import { describe, it, expect } from 'vitest'
import { tokenize } from '../src/tokenizer'
import { parseStatements } from '../src/parser/statement'
import { NuiNodeTypes } from '../src/types'

describe('statement parser', () => {
	describe('import 解析', () => {
		it('应该正确解析简单 import', () => {
			const source = 'import Title from "./Title.nui"'
			const tokens = tokenize(source).tokens
			const result = parseStatements(tokens)

			expect(result.imports).toHaveLength(1)
			expect(result.imports[0].type).toBe(NuiNodeTypes.IMPORT_DECLARATION)
			expect(result.imports[0].identifier).toBe('Title')
			expect(result.imports[0].source).toBe('./Title.nui')
		})

		it('应该正确解析多个 import', () => {
			const source = `import Title from "./Title.nui"
import Button from "./Button.nui"`
			const tokens = tokenize(source).tokens
			const result = parseStatements(tokens)

			expect(result.imports).toHaveLength(2)
			expect(result.imports[0].identifier).toBe('Title')
			expect(result.imports[1].identifier).toBe('Button')
		})
	})

	describe('signal 解析', () => {
		it('应该正确解析 signal 声明', () => {
			const source = 'count = signal(0)'
			const tokens = tokenize(source).tokens
			const result = parseStatements(tokens)

			expect(result.signals).toHaveLength(1)
			expect(result.signals[0].type).toBe(NuiNodeTypes.SIGNAL_DECLARATION)
			expect(result.signals[0].name).toBe('count')
			expect(result.signals[0].isAsync).toBe(false)
			expect(result.signals[0].initExpression).toBe('0')
		})

		it('应该正确解析 asyncSignal 声明', () => {
			const source = 'users = asyncSignal(fetchUsers)'
			const tokens = tokenize(source).tokens
			const result = parseStatements(tokens)

			expect(result.signals).toHaveLength(1)
			expect(result.signals[0].name).toBe('users')
			expect(result.signals[0].isAsync).toBe(true)
			expect(result.signals[0].initExpression).toBe('fetchUsers')
		})

		it('应该正确解析字符串初始值', () => {
			const source = 'name = signal("test")'
			const tokens = tokenize(source).tokens
			const result = parseStatements(tokens)

			expect(result.signals).toHaveLength(1)
			expect(result.signals[0].initExpression).toBe('test')
		})

		it('应该正确解析多个 signal', () => {
			const source = `count = signal(0)
name = signal("test")`
			const tokens = tokenize(source).tokens
			const result = parseStatements(tokens)

			expect(result.signals).toHaveLength(2)
			expect(result.signals[0].name).toBe('count')
			expect(result.signals[1].name).toBe('name')
		})
	})

	describe('function 解析', () => {
		it('应该正确解析简单函数', () => {
			const source = 'function increment() { count++ }'
			const tokens = tokenize(source).tokens
			const result = parseStatements(tokens)

			expect(result.functions).toHaveLength(1)
			expect(result.functions[0].type).toBe(NuiNodeTypes.FUNCTION_DECLARATION)
			expect(result.functions[0].name).toBe('increment')
			expect(result.functions[0].params).toHaveLength(0)
			expect(result.functions[0].body).toBe('count++')
		})

		it('应该正确解析带参数的函数', () => {
			const source = 'function add(a, b) { return a + b }'
			const tokens = tokenize(source).tokens
			const result = parseStatements(tokens)

			expect(result.functions).toHaveLength(1)
			expect(result.functions[0].name).toBe('add')
			expect(result.functions[0].params).toEqual(['a', 'b'])
		})

		it('应该正确解析多行函数体', () => {
			const source = `function increment() {
	count++
	console.log(count)
}`
			const tokens = tokenize(source).tokens
			const result = parseStatements(tokens)

			expect(result.functions).toHaveLength(1)
			expect(result.functions[0].body).toContain('count++')
			expect(result.functions[0].body).toContain('console.log')
		})

		it('应该正确处理嵌套大括号', () => {
			const source = 'function test() { if (true) { count++ } }'
			const tokens = tokenize(source).tokens
			const result = parseStatements(tokens)

			expect(result.functions).toHaveLength(1)
			expect(result.functions[0].body).toContain('if')
			expect(result.functions[0].body).toContain('count++')
		})
	})

	describe('混合语句', () => {
		it('应该正确解析混合声明', () => {
			const source = `import Title from "./Title.nui"
count = signal(0)
name = signal("test")

function increment() {
	count++
}`
			const tokens = tokenize(source).tokens
			const result = parseStatements(tokens)

			expect(result.imports).toHaveLength(1)
			expect(result.signals).toHaveLength(2)
			expect(result.functions).toHaveLength(1)
		})
	})
})