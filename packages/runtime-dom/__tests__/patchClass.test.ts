/**
 * patchClass class 属性处理测试
 */

import { describe, it, expect } from 'vitest'
import { patchClass, normalizeClass } from '../src/patchProp/patchClass'

describe('normalizeClass', () => {
    describe('字符串形式', () => {
        it('应该返回字符串本身', () => {
            expect(normalizeClass('foo bar')).toBe('foo bar')
        })

        it('应该去除前后空格', () => {
            expect(normalizeClass('  foo bar  ')).toBe('foo bar')
        })

        it('空字符串应该返回空', () => {
            expect(normalizeClass('')).toBe('')
        })
    })

    describe('数组形式', () => {
        it('应该连接数组中的 class', () => {
            expect(normalizeClass(['foo', 'bar'])).toBe('foo bar')
        })

        it('应该支持嵌套数组', () => {
            expect(normalizeClass(['foo', ['bar', 'baz']])).toBe('foo bar baz')
        })

        it('应该忽略空值', () => {
            expect(normalizeClass(['foo', '', 'bar'])).toBe('foo bar')
        })
    })

    describe('对象形式', () => {
        it('应该只包含值为 true 的 key', () => {
            expect(normalizeClass({ foo: true, bar: false })).toBe('foo')
        })

        it('应该连接多个 true 值的 key', () => {
            expect(normalizeClass({ foo: true, bar: true })).toBe('foo bar')
        })

        it('应该忽略 null/undefined 值', () => {
            expect(normalizeClass({ foo: true, bar: null, baz: undefined } as any)).toBe('foo')
        })
    })

    describe('混合形式', () => {
        it('应该支持对象和数组混合', () => {
            expect(normalizeClass(['foo', { bar: true, baz: false }])).toBe('foo bar')
        })

        it('应该支持复杂嵌套', () => {
            expect(normalizeClass(['foo', { bar: true }, ['baz']])).toBe('foo bar baz')
        })
    })

    describe('边界情况', () => {
        it('null 应该返回空字符串', () => {
            expect(normalizeClass(null)).toBe('')
        })

        it('undefined 应该返回空字符串', () => {
            expect(normalizeClass(undefined)).toBe('')
        })
    })
})

describe('patchClass', () => {
    it('应该设置字符串形式的 class', () => {
        const el = document.createElement('div')
        patchClass(el, 'foo bar', null)
        expect(el.className).toBe('foo bar')
    })

    it('应该设置数组形式的 class', () => {
        const el = document.createElement('div')
        patchClass(el, ['foo', 'bar'], null)
        expect(el.className).toBe('foo bar')
    })

    it('应该设置对象形式的 class', () => {
        const el = document.createElement('div')
        patchClass(el, { foo: true, bar: false }, null)
        expect(el.className).toBe('foo')
    })

    it('传入 null 应该清空 class', () => {
        const el = document.createElement('div')
        el.className = 'existing'
        patchClass(el, null, 'existing')
        expect(el.className).toBe('')
    })

    it('传入空字符串应该清空 class', () => {
        const el = document.createElement('div')
        el.className = 'existing'
        patchClass(el, '', null)
        expect(el.className).toBe('')
    })

    it('应该更新 class', () => {
        const el = document.createElement('div')
        el.className = 'old'
        patchClass(el, 'new', 'old')
        expect(el.className).toBe('new')
    })
})