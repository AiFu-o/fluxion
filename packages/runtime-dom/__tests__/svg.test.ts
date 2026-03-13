/**
 * SVG 支持测试
 */

import { describe, it, expect } from 'vitest'
import {
    isSVGTag,
    createSVGElement,
    isXlinkAttr,
    isXMLAttr,
    setSVGAttr,
    isInSVG
} from '../src/modules/svg'

describe('isSVGTag', () => {
    it('应该识别 SVG 标签', () => {
        expect(isSVGTag('svg')).toBe(true)
        expect(isSVGTag('circle')).toBe(true)
        expect(isSVGTag('path')).toBe(true)
        expect(isSVGTag('rect')).toBe(true)
        expect(isSVGTag('g')).toBe(true)
    })

    it('非 SVG 标签应该返回 false', () => {
        expect(isSVGTag('div')).toBe(false)
        expect(isSVGTag('span')).toBe(false)
        expect(isSVGTag('input')).toBe(false)
    })
})

describe('createSVGElement', () => {
    it('应该创建 SVG 元素', () => {
        const svg = createSVGElement('svg')
        expect(svg.tagName.toLowerCase()).toBe('svg')
        expect(svg.namespaceURI).toBe('http://www.w3.org/2000/svg')
    })

    it('应该创建 SVG 子元素', () => {
        const circle = createSVGElement('circle')
        expect(circle.tagName.toLowerCase()).toBe('circle')
        expect(circle.namespaceURI).toBe('http://www.w3.org/2000/svg')
    })

    it('传入空标签应该创建 svg 元素', () => {
        const svg = createSVGElement('')
        expect(svg.tagName.toLowerCase()).toBe('svg')
    })
})

describe('isXlinkAttr', () => {
    it('应该识别 XLINK 属性', () => {
        expect(isXlinkAttr('xlink:href')).toBe(true)
        expect(isXlinkAttr('xlink:title')).toBe(true)
        expect(isXlinkAttr('xlink:show')).toBe(true)
    })

    it('非 XLINK 属性应该返回 false', () => {
        expect(isXlinkAttr('href')).toBe(false)
        expect(isXlinkAttr('title')).toBe(false)
    })
})

describe('isXMLAttr', () => {
    it('应该识别 XML 属性', () => {
        expect(isXMLAttr('xml:space')).toBe(true)
        expect(isXMLAttr('xml:lang')).toBe(true)
    })

    it('非 XML 属性应该返回 false', () => {
        expect(isXMLAttr('space')).toBe(false)
        expect(isXMLAttr('lang')).toBe(false)
    })
})

describe('setSVGAttr', () => {
    it('应该设置普通 SVG 属性', () => {
        const svg = createSVGElement('svg')
        setSVGAttr(svg, 'width', '100')
        expect(svg.getAttribute('width')).toBe('100')
    })

    it('应该设置 XLINK 属性', () => {
        const svg = createSVGElement('svg')
        const use = createSVGElement('use')
        svg.appendChild(use)
        setSVGAttr(use, 'xlink:href', '#icon')
        // getAttributeNS 的第二个参数是本地名称（不带前缀）
        expect(use.getAttributeNS('http://www.w3.org/1999/xlink', 'href')).toBe('#icon')
    })

    it('null 应该移除属性', () => {
        const svg = createSVGElement('svg')
        svg.setAttribute('width', '100')
        setSVGAttr(svg, 'width', null)
        expect(svg.hasAttribute('width')).toBe(false)
    })

    it('false 应该移除属性', () => {
        const svg = createSVGElement('svg')
        svg.setAttribute('width', '100')
        setSVGAttr(svg, 'width', false)
        expect(svg.hasAttribute('width')).toBe(false)
    })
})

describe('isInSVG', () => {
    it('在 SVG 中应该返回 true', () => {
        const svg = createSVGElement('svg')
        const circle = createSVGElement('circle')
        svg.appendChild(circle)

        expect(isInSVG(circle)).toBe(true)
    })

    it('不在 SVG 中应该返回 false', () => {
        const div = document.createElement('div')
        expect(isInSVG(div)).toBe(false)
    })
})