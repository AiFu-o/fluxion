/**
 * 样式转换单元测试
 */

import { describe, it, expect } from 'vitest'
import { transformNuiStyle } from '../src/style/transform'

describe('transformNuiStyle', () => {
	describe('基础属性转换', () => {
		it('应该转换单个属性', () => {
			const input = `button {
	padding 20px
}`
			const expected = `button {
	padding: 20px;
}`
			expect(transformNuiStyle(input)).toBe(expected)
		})

		it('应该转换多值属性', () => {
			const input = `button {
	margin 8px 16px
}`
			const expected = `button {
	margin: 8px 16px;
}`
			expect(transformNuiStyle(input)).toBe(expected)
		})

		it('应该转换多个属性', () => {
			const input = `.container {
	padding 20px
	max-width 800px
	margin 0 auto
}`
			const expected = `.container {
	padding: 20px;
	max-width: 800px;
	margin: 0 auto;
}`
			expect(transformNuiStyle(input)).toBe(expected)
		})
	})

	describe('已有标准 CSS 处理', () => {
		it('应该保持已有冒号分号的属性不变', () => {
			const input = `button {
	padding: 20px;
}`
			expect(transformNuiStyle(input)).toBe(input)
		})

		it('应该处理混合格式', () => {
			const input = `button {
	padding 20px
	margin: 10px;
}`
			const expected = `button {
	padding: 20px;
	margin: 10px;
}`
			expect(transformNuiStyle(input)).toBe(expected)
		})
	})

	describe('边缘情况', () => {
		it('应该处理 CSS 变量定义', () => {
			const input = `:root {
	--primary-color #007bff
	--spacing-md 16px
}`
			const expected = `:root {
	--primary-color: #007bff;
	--spacing-md: 16px;
}`
			expect(transformNuiStyle(input)).toBe(expected)
		})

		it('应该处理 CSS 变量使用', () => {
			const input = `.button {
	color var(--primary-color)
}`
			const expected = `.button {
	color: var(--primary-color);
}`
			expect(transformNuiStyle(input)).toBe(expected)
		})

		it('应该处理带引号的值', () => {
			const input = `.quote {
	font-family "Segoe UI"
}`
			const expected = `.quote {
	font-family: "Segoe UI";
}`
			expect(transformNuiStyle(input)).toBe(expected)
		})

		it('应该保持属性选择器不变', () => {
			const input = `input[type="text"] {
	border 1px solid
}`
			const expected = `input[type="text"] {
	border: 1px solid;
}`
			expect(transformNuiStyle(input)).toBe(expected)
		})

		it('应该保持空行', () => {
			const input = `.container {
	padding 20px

	margin 0 auto
}`
			const expected = `.container {
	padding: 20px;

	margin: 0 auto;
}`
			expect(transformNuiStyle(input)).toBe(expected)
		})

		it('应该保持注释', () => {
			const input = `.container {
	// 这是一个注释
	padding 20px
}`
			const expected = `.container {
	// 这是一个注释
	padding: 20px;
}`
			expect(transformNuiStyle(input)).toBe(expected)
		})
	})

	describe('多选择器', () => {
		it('应该处理多个规则块', () => {
			const input = `.container {
	padding 20px
}

.button {
	padding 8px 16px
}`
			const expected = `.container {
	padding: 20px;
}

.button {
	padding: 8px 16px;
}`
			expect(transformNuiStyle(input)).toBe(expected)
		})
	})

	describe('嵌套选择器', () => {
		it('应该处理嵌套规则块（保持嵌套结构）', () => {
			const input = `.card {
	padding 16px

	.title {
		font-size 18px
	}
}`
			const expected = `.card {
	padding: 16px;

	.title {
		font-size: 18px;
	}
}`
			expect(transformNuiStyle(input)).toBe(expected)
		})
	})

	describe('空内容', () => {
		it('应该处理空字符串', () => {
			expect(transformNuiStyle('')).toBe('')
		})

		it('应该处理只有空格的内容', () => {
			expect(transformNuiStyle('   ')).toBe('   ')
		})
	})
})