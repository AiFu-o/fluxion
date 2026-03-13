/**
 * patchAttr HTML 属性处理测试
 */

import { describe, it, expect } from 'vitest'
import {
    patchAttr,
    isBooleanAttr,
    isSpecialAttr
} from '../src/patchProp/patchAttr'

describe('isBooleanAttr', () => {
    it('应该识别布尔属性', () => {
        expect(isBooleanAttr('disabled')).toBe(true)
        expect(isBooleanAttr('checked')).toBe(true)
        expect(isBooleanAttr('selected')).toBe(true)
        expect(isBooleanAttr('readonly')).toBe(true)
        expect(isBooleanAttr('required')).toBe(true)
    })

    it('应该不区分大小写', () => {
        expect(isBooleanAttr('DISABLED')).toBe(true)
        expect(isBooleanAttr('Checked')).toBe(true)
    })

    it('非布尔属性应该返回 false', () => {
        expect(isBooleanAttr('href')).toBe(false)
        expect(isBooleanAttr('class')).toBe(false)
        expect(isBooleanAttr('id')).toBe(false)
    })
})

describe('isSpecialAttr', () => {
    it('应该识别特殊属性', () => {
        expect(isSpecialAttr('value')).toBe(true)
        expect(isSpecialAttr('checked')).toBe(true)
        expect(isSpecialAttr('innerHTML')).toBe(true)
        expect(isSpecialAttr('className')).toBe(true)
        expect(isSpecialAttr('style')).toBe(true)
    })

    it('非特殊属性应该返回 false', () => {
        expect(isSpecialAttr('href')).toBe(false)
        expect(isSpecialAttr('id')).toBe(false)
    })
})

describe('patchAttr', () => {
    it('应该设置普通属性', () => {
        const el = document.createElement('a')
        patchAttr(el, 'href', 'https://example.com', null)
        expect(el.getAttribute('href')).toBe('https://example.com')
    })

    it('应该设置 id 属性', () => {
        const el = document.createElement('div')
        patchAttr(el, 'id', 'my-id', null)
        expect(el.getAttribute('id')).toBe('my-id')
    })

    it('应该设置 data-* 属性', () => {
        const el = document.createElement('div')
        patchAttr(el, 'data-id', '123', null)
        expect(el.getAttribute('data-id')).toBe('123')
    })

    it('传入 null 应该移除属性', () => {
        const el = document.createElement('div')
        el.setAttribute('title', 'test')
        patchAttr(el, 'title', null, 'test')
        expect(el.getAttribute('title')).toBe(null)
    })

    it('传入 false 应该移除属性', () => {
        const el = document.createElement('div')
        el.setAttribute('title', 'test')
        patchAttr(el, 'title', false, 'test')
        expect(el.getAttribute('title')).toBe(null)
    })

    describe('布尔属性', () => {
        it('应该设置布尔属性', () => {
            const el = document.createElement('input')
            patchAttr(el, 'disabled', true, null)
            expect(el.hasAttribute('disabled')).toBe(true)
        })

        it('布尔属性的值应该被忽略', () => {
            const el = document.createElement('input')
            patchAttr(el, 'disabled', 'disabled', null)
            expect(el.hasAttribute('disabled')).toBe(true)
            expect(el.getAttribute('disabled')).toBe('')
        })

        it('false 应该移除布尔属性', () => {
            const el = document.createElement('input')
            el.disabled = true
            patchAttr(el, 'disabled', false, true)
            expect(el.hasAttribute('disabled')).toBe(false)
        })
    })

    it('应该更新属性值', () => {
        const el = document.createElement('div')
        el.setAttribute('title', 'old')
        patchAttr(el, 'title', 'new', 'old')
        expect(el.getAttribute('title')).toBe('new')
    })
})