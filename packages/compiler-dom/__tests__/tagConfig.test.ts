/**
 * 标签配置测试
 */

import { describe, it, expect } from 'vitest'
import {
	isHTMLTag,
	isSVGTag,
	isVoidTag,
	getTagType,
	isNativeTag,
	isComponentTag,
	HTML_TAGS,
	SVG_TAGS,
	VOID_TAGS
} from '../src/tagConfig'

describe('tagConfig', () => {
	describe('HTML_TAGS', () => {
		it('应该包含常见的 HTML 标签', () => {
			expect(HTML_TAGS.has('div')).toBe(true)
			expect(HTML_TAGS.has('span')).toBe(true)
			expect(HTML_TAGS.has('button')).toBe(true)
			expect(HTML_TAGS.has('input')).toBe(true)
		})
	})

	describe('SVG_TAGS', () => {
		it('应该包含常见的 SVG 标签', () => {
			expect(SVG_TAGS.has('svg')).toBe(true)
			expect(SVG_TAGS.has('circle')).toBe(true)
			expect(SVG_TAGS.has('path')).toBe(true)
			expect(SVG_TAGS.has('rect')).toBe(true)
		})
	})

	describe('VOID_TAGS', () => {
		it('应该包含自闭合标签', () => {
			expect(VOID_TAGS.has('br')).toBe(true)
			expect(VOID_TAGS.has('hr')).toBe(true)
			expect(VOID_TAGS.has('img')).toBe(true)
			expect(VOID_TAGS.has('input')).toBe(true)
		})
	})

	describe('isHTMLTag', () => {
		it('应该正确识别 HTML 标签', () => {
			expect(isHTMLTag('div')).toBe(true)
			expect(isHTMLTag('span')).toBe(true)
			expect(isHTMLTag('p')).toBe(true)
		})

		it('应该对 SVG 标签返回 false', () => {
			expect(isHTMLTag('svg')).toBe(false)
			expect(isHTMLTag('circle')).toBe(false)
		})

		it('应该对非标签返回 false', () => {
			expect(isHTMLTag('MyComponent')).toBe(false)
			expect(isHTMLTag('not-a-tag')).toBe(false)
		})
	})

	describe('isSVGTag', () => {
		it('应该正确识别 SVG 标签', () => {
			expect(isSVGTag('svg')).toBe(true)
			expect(isSVGTag('circle')).toBe(true)
			expect(isSVGTag('path')).toBe(true)
		})

		it('应该对 HTML 标签返回 false', () => {
			expect(isSVGTag('div')).toBe(false)
			expect(isSVGTag('span')).toBe(false)
		})
	})

	describe('isVoidTag', () => {
		it('应该正确识别自闭合标签', () => {
			expect(isVoidTag('br')).toBe(true)
			expect(isVoidTag('hr')).toBe(true)
			expect(isVoidTag('img')).toBe(true)
			expect(isVoidTag('input')).toBe(true)
		})

		it('应该对非自闭合标签返回 false', () => {
			expect(isVoidTag('div')).toBe(false)
			expect(isVoidTag('span')).toBe(false)
		})
	})

	describe('getTagType', () => {
		it('应该返回 svg 对于 SVG 标签', () => {
			expect(getTagType('svg')).toBe('svg')
			expect(getTagType('circle')).toBe('svg')
		})

		it('应该返回 html 对于 HTML 标签', () => {
			expect(getTagType('div')).toBe('html')
			expect(getTagType('span')).toBe('html')
		})

		it('应该返回 component 对于非原生标签', () => {
			expect(getTagType('MyComponent')).toBe('component')
			expect(getTagType('not-a-tag')).toBe('component')
		})
	})

	describe('isNativeTag', () => {
		it('应该对 HTML 标签返回 true', () => {
			expect(isNativeTag('div')).toBe(true)
			expect(isNativeTag('span')).toBe(true)
		})

		it('应该对 SVG 标签返回 true', () => {
			expect(isNativeTag('svg')).toBe(true)
			expect(isNativeTag('circle')).toBe(true)
		})

		it('应该对非原生标签返回 false', () => {
			expect(isNativeTag('MyComponent')).toBe(false)
		})
	})

	describe('isComponentTag', () => {
		it('应该对以大写字母开头的标签返回 true', () => {
			expect(isComponentTag('MyComponent')).toBe(true)
			expect(isComponentTag('Button')).toBe(true)
		})

		it('应该对包含连字符的标签返回 true', () => {
			expect(isComponentTag('my-component')).toBe(true)
			expect(isComponentTag('custom-button')).toBe(true)
		})

		it('应该对原生标签返回 false', () => {
			expect(isComponentTag('div')).toBe(false)
			expect(isComponentTag('span')).toBe(false)
			expect(isComponentTag('svg')).toBe(false)
		})
	})
})