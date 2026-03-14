/**
 * 词法分析器测试
 */

import { describe, it, expect } from 'vitest'
import { tokenize } from '../src/tokenizer'
import { TokenType } from '../src/types'

describe('tokenizer', () => {
	describe('基础 Token', () => {
		it('应该正确生成 EOF Token', () => {
			const result = tokenize('')
			expect(result.tokens).toHaveLength(1)
			expect(result.tokens[0].type).toBe(TokenType.EOF)
		})

		it('应该忽略空行', () => {
			const result = tokenize('\n\n\n')
			expect(result.tokens).toHaveLength(1)
			expect(result.tokens[0].type).toBe(TokenType.EOF)
		})
	})

	describe('缩进处理', () => {
		it('应该正确处理单层缩进', () => {
			const source = `view
	div`
			const result = tokenize(source)

			// 找到 INDENT Token
			const indentTokens = result.tokens.filter(t => t.type === TokenType.INDENT)
			expect(indentTokens).toHaveLength(1)

			// 找到 DEDENT Token（文件结束时）
			const dedentTokens = result.tokens.filter(t => t.type === TokenType.DEDENT)
			expect(dedentTokens).toHaveLength(1)
		})

		it('应该正确处理多层缩进', () => {
			const source = `view
	div
		p`
			const result = tokenize(source)

			const indentTokens = result.tokens.filter(t => t.type === TokenType.INDENT)
			expect(indentTokens).toHaveLength(2)

			const dedentTokens = result.tokens.filter(t => t.type === TokenType.DEDENT)
			expect(dedentTokens).toHaveLength(2) // 两个 DEDENT 在文件结束
		})

		it('应该正确处理缩进回退', () => {
			const source = `view
	div
		p
	span`
			const result = tokenize(source)

			const indentTokens = result.tokens.filter(t => t.type === TokenType.INDENT)
			expect(indentTokens).toHaveLength(2)

			const dedentTokens = result.tokens.filter(t => t.type === TokenType.DEDENT)
			expect(dedentTokens).toHaveLength(2) // 一个在 span 前，一个在文件结束
		})
	})

	describe('关键词识别', () => {
		it('应该识别 import 关键词', () => {
			const result = tokenize('import')
			expect(result.tokens[0].type).toBe(TokenType.IMPORT)
		})

		it('应该识别 from 关键词', () => {
			const result = tokenize('from')
			expect(result.tokens[0].type).toBe(TokenType.FROM)
		})

		it('应该识别 function 关键词', () => {
			const result = tokenize('function')
			expect(result.tokens[0].type).toBe(TokenType.FUNCTION)
		})

		it('应该识别 if/elif/else 关键词', () => {
			const result = tokenize('if elif else')
			expect(result.tokens[0].type).toBe(TokenType.IF)
			expect(result.tokens[1].type).toBe(TokenType.ELIF)
			expect(result.tokens[2].type).toBe(TokenType.ELSE)
		})

		it('应该识别 for/in 关键词', () => {
			const result = tokenize('for in')
			expect(result.tokens[0].type).toBe(TokenType.FOR)
			expect(result.tokens[1].type).toBe(TokenType.IN)
		})

		it('应该识别 view/style 关键词', () => {
			const result = tokenize('view style')
			expect(result.tokens[0].type).toBe(TokenType.VIEW)
			expect(result.tokens[1].type).toBe(TokenType.STYLE)
		})

		it('应该识别 signal/asyncSignal 关键词', () => {
			const result = tokenize('signal asyncSignal')
			expect(result.tokens[0].type).toBe(TokenType.SIGNAL)
			expect(result.tokens[1].type).toBe(TokenType.ASYNC_SIGNAL)
		})
	})

	describe('标识符', () => {
		it('应该识别普通标识符', () => {
			const result = tokenize('count')
			expect(result.tokens[0].type).toBe(TokenType.IDENTIFIER)
			expect(result.tokens[0].value).toBe('count')
		})

		it('应该识别包含数字的标识符', () => {
			const result = tokenize('count1')
			expect(result.tokens[0].type).toBe(TokenType.IDENTIFIER)
			expect(result.tokens[0].value).toBe('count1')
		})

		it('应该识别包含下划线的标识符', () => {
			const result = tokenize('count_value')
			expect(result.tokens[0].type).toBe(TokenType.IDENTIFIER)
			expect(result.tokens[0].value).toBe('count_value')
		})

		it('应该识别包含 $ 的标识符', () => {
			const result = tokenize('$count')
			expect(result.tokens[0].type).toBe(TokenType.IDENTIFIER)
			expect(result.tokens[0].value).toBe('$count')
		})
	})

	describe('字符串字面量', () => {
		it('应该识别双引号字符串', () => {
			const result = tokenize('"hello"')
			expect(result.tokens[0].type).toBe(TokenType.STRING)
			expect(result.tokens[0].value).toBe('hello')
		})

		it('应该识别单引号字符串', () => {
			const result = tokenize("'hello'")
			expect(result.tokens[0].type).toBe(TokenType.STRING)
			expect(result.tokens[0].value).toBe('hello')
		})

		it('应该处理转义字符', () => {
			const result = tokenize('"hello\\nworld"')
			expect(result.tokens[0].type).toBe(TokenType.STRING)
			expect(result.tokens[0].value).toBe('hello\nworld')
		})

		it('应该处理转义引号', () => {
			const result = tokenize('"hello\\"world"')
			expect(result.tokens[0].type).toBe(TokenType.STRING)
			expect(result.tokens[0].value).toBe('hello"world')
		})
	})

	describe('数字字面量', () => {
		it('应该识别整数', () => {
			const result = tokenize('123')
			expect(result.tokens[0].type).toBe(TokenType.NUMBER)
			expect(result.tokens[0].value).toBe('123')
		})

		it('应该识别浮点数', () => {
			const result = tokenize('123.45')
			expect(result.tokens[0].type).toBe(TokenType.NUMBER)
			expect(result.tokens[0].value).toBe('123.45')
		})

		it('不应该将点号单独识别为小数', () => {
			const result = tokenize('123.')
			expect(result.tokens[0].type).toBe(TokenType.NUMBER)
			expect(result.tokens[0].value).toBe('123')
			expect(result.tokens[1].type).toBe(TokenType.DOT)
		})
	})

	describe('操作符', () => {
		it('应该识别 =', () => {
			const result = tokenize('=')
			expect(result.tokens[0].type).toBe(TokenType.EQUALS)
		})

		it('应该识别 ,', () => {
			const result = tokenize(',')
			expect(result.tokens[0].type).toBe(TokenType.COMMA)
		})

		it('应该识别 ( 和 )', () => {
			const result = tokenize('()')
			expect(result.tokens[0].type).toBe(TokenType.LPAREN)
			expect(result.tokens[1].type).toBe(TokenType.RPAREN)
		})

		it('应该识别 { 和 }', () => {
			const result = tokenize('{}')
			expect(result.tokens[0].type).toBe(TokenType.LBRACE)
			expect(result.tokens[1].type).toBe(TokenType.RBRACE)
		})

		it('应该识别 .', () => {
			const result = tokenize('.')
			expect(result.tokens[0].type).toBe(TokenType.DOT)
		})

		it('应该识别 @', () => {
			const result = tokenize('@')
			expect(result.tokens[0].type).toBe(TokenType.AT)
		})
	})

	describe('复杂语句', () => {
		it('应该正确解析 import 语句', () => {
			const source = 'import Title from "./Title.nui"'
			const result = tokenize(source)

			expect(result.tokens[0].type).toBe(TokenType.IMPORT)
			expect(result.tokens[1].type).toBe(TokenType.IDENTIFIER)
			expect(result.tokens[1].value).toBe('Title')
			expect(result.tokens[2].type).toBe(TokenType.FROM)
			expect(result.tokens[3].type).toBe(TokenType.STRING)
			expect(result.tokens[3].value).toBe('./Title.nui')
		})

		it('应该正确解析 signal 声明', () => {
			const source = 'count = signal(0)'
			const result = tokenize(source)

			expect(result.tokens[0].type).toBe(TokenType.IDENTIFIER)
			expect(result.tokens[0].value).toBe('count')
			expect(result.tokens[1].type).toBe(TokenType.EQUALS)
			expect(result.tokens[2].type).toBe(TokenType.SIGNAL)
			expect(result.tokens[3].type).toBe(TokenType.LPAREN)
			expect(result.tokens[4].type).toBe(TokenType.NUMBER)
			expect(result.tokens[4].value).toBe('0')
			expect(result.tokens[5].type).toBe(TokenType.RPAREN)
		})

		it('应该正确解析事件绑定', () => {
			const source = '@click=increment'
			const result = tokenize(source)

			expect(result.tokens[0].type).toBe(TokenType.AT)
			expect(result.tokens[1].type).toBe(TokenType.IDENTIFIER)
			expect(result.tokens[1].value).toBe('click')
			expect(result.tokens[2].type).toBe(TokenType.EQUALS)
			expect(result.tokens[3].type).toBe(TokenType.IDENTIFIER)
			expect(result.tokens[3].value).toBe('increment')
		})
	})

	describe('错误处理', () => {
		it('应该报告未终止的字符串', () => {
			const result = tokenize('"hello')
			expect(result.errors.length).toBeGreaterThan(0)
			expect(result.errors[0].code).toBeDefined()
		})

		it('应该报告 Tab 不在行首的错误', () => {
			const source = 'hello\tworld'
			const result = tokenize(source)
			expect(result.errors.length).toBeGreaterThan(0)
		})
	})

	describe('换行处理', () => {
		it('应该生成 NEWLINE Token', () => {
			const source = `a
b`
			const result = tokenize(source)

			const newlineTokens = result.tokens.filter(t => t.type === TokenType.NEWLINE)
			expect(newlineTokens).toHaveLength(1)
		})

		it('应该处理 CRLF 换行', () => {
			const source = 'a\r\nb'
			const result = tokenize(source)

			const newlineTokens = result.tokens.filter(t => t.type === TokenType.NEWLINE)
			expect(newlineTokens).toHaveLength(1)
		})
	})
})