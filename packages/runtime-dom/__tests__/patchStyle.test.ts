/**
 * patchStyle style 属性处理测试
 */

import { describe, it, expect } from 'vitest'
import {
    patchStyle,
    normalizeStyle,
    hyphenate,
    camelize
} from '../src/patchProp/patchStyle'

describe('hyphenate', () => {
    it('应该将 camelCase 转为 kebab-case', () => {
        expect(hyphenate('backgroundColor')).toBe('background-color')
        expect(hyphenate('fontSize')).toBe('font-size')
        expect(hyphenate('marginTop')).toBe('margin-top')
    })

    it('普通字符串应该不变', () => {
        expect(hyphenate('color')).toBe('color')
    })
})

describe('camelize', () => {
    it('应该将 kebab-case 转为 camelCase', () => {
        expect(camelize('background-color')).toBe('backgroundColor')
        expect(camelize('font-size')).toBe('fontSize')
        expect(camelize('margin-top')).toBe('marginTop')
    })

    it('普通字符串应该不变', () => {
        expect(camelize('color')).toBe('color')
    })
})

describe('normalizeStyle', () => {
    it('应该解析 style 字符串', () => {
        const result = normalizeStyle('color: red; font-size: 14px')
        expect(result).toEqual({
            color: 'red',
            fontSize: '14px'
        })
    })

    it('应该处理空格', () => {
        const result = normalizeStyle('  color : red ;  font-size : 14px  ')
        expect(result).toEqual({
            color: 'red',
            fontSize: '14px'
        })
    })

    it('对象应该直接返回', () => {
        const obj = { color: 'red' }
        expect(normalizeStyle(obj)).toBe(obj)
    })

    it('null/undefined 应该返回空对象', () => {
        expect(normalizeStyle(null)).toEqual({})
        expect(normalizeStyle(undefined)).toEqual({})
    })
})

describe('patchStyle', () => {
    it('应该设置字符串形式的 style', () => {
        const el = document.createElement('div')
        patchStyle(el, 'color: red; font-size: 14px', null)
        expect(el.style.color).toBe('red')
    })

    it('应该设置对象形式的 style', () => {
        const el = document.createElement('div')
        patchStyle(el, { color: 'red', fontSize: '14px' }, null)
        expect(el.style.color).toBe('red')
    })

    it('应该移除旧的 style', () => {
        const el = document.createElement('div')
        el.style.color = 'red'
        patchStyle(el, { fontSize: '14px' }, { color: 'red' })
        expect(el.style.color).toBe('')
    })

    it('传入 null 应该清空 style', () => {
        const el = document.createElement('div')
        el.style.color = 'red'
        patchStyle(el, null, { color: 'red' })
        expect(el.style.color).toBe('')
    })

    it('数值应该自动添加 px', () => {
        const el = document.createElement('div')
        patchStyle(el, { fontSize: 14 }, null)
        expect(el.style.fontSize).toBe('14px')
    })

    it('无单位属性不应该添加 px', () => {
        const el = document.createElement('div')
        patchStyle(el, { opacity: 0.5, zIndex: 10 }, null)
        expect(el.style.opacity).toBe('0.5')
        expect(el.style.zIndex).toBe('10')
    })

    it('应该更新 style', () => {
        const el = document.createElement('div')
        el.style.color = 'red'
        patchStyle(el, { color: 'blue' }, { color: 'red' })
        expect(el.style.color).toBe('blue')
    })

    it('空值应该移除样式', () => {
        const el = document.createElement('div')
        el.style.color = 'red'
        patchStyle(el, { color: null }, { color: 'red' })
        expect(el.style.color).toBe('')
    })
})