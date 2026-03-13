/**
 * patchDOMProp DOM 属性处理测试
 */

import { describe, it, expect } from 'vitest'
import { patchDOMProp, isDOMProp } from '../src/patchProp/patchDOMProp'

describe('isDOMProp', () => {
    it('应该识别 DOM 属性', () => {
        expect(isDOMProp('value')).toBe(true)
        expect(isDOMProp('checked')).toBe(true)
        expect(isDOMProp('innerHTML')).toBe(true)
        expect(isDOMProp('className')).toBe(true)
        expect(isDOMProp('textContent')).toBe(true)
    })

    it('非 DOM 属性应该返回 false', () => {
        expect(isDOMProp('href')).toBe(false)
        expect(isDOMProp('id')).toBe(false)
        expect(isDOMProp('title')).toBe(false)
    })
})

describe('patchDOMProp', () => {
    describe('value', () => {
        it('应该设置 input 的 value', () => {
            const el = document.createElement('input')
            patchDOMProp(el, 'value', 'test', null)
            expect(el.value).toBe('test')
        })

        it('应该设置 textarea 的 value', () => {
            const el = document.createElement('textarea')
            patchDOMProp(el, 'value', 'test', null)
            expect(el.value).toBe('test')
        })

        it('null 应该设置为空字符串', () => {
            const el = document.createElement('input')
            el.value = 'test'
            patchDOMProp(el, 'value', null, 'test')
            expect(el.value).toBe('')
        })
    })

    describe('checked', () => {
        it('应该设置 checked', () => {
            const el = document.createElement('input') as HTMLInputElement
            el.type = 'checkbox'
            patchDOMProp(el, 'checked', true, null)
            expect(el.checked).toBe(true)
        })

        it('false 应该取消 checked', () => {
            const el = document.createElement('input') as HTMLInputElement
            el.type = 'checkbox'
            el.checked = true
            patchDOMProp(el, 'checked', false, true)
            expect(el.checked).toBe(false)
        })
    })

    describe('innerHTML', () => {
        it('应该设置 innerHTML', () => {
            const el = document.createElement('div')
            patchDOMProp(el, 'innerHTML', '<span>test</span>', null)
            expect(el.innerHTML).toBe('<span>test</span>')
        })

        it('null 应该清空 innerHTML', () => {
            const el = document.createElement('div')
            el.innerHTML = '<span>test</span>'
            patchDOMProp(el, 'innerHTML', null, '<span>test</span>')
            expect(el.innerHTML).toBe('')
        })
    })

    describe('textContent', () => {
        it('应该设置 textContent', () => {
            const el = document.createElement('div')
            patchDOMProp(el, 'textContent', 'hello world', null)
            expect(el.textContent).toBe('hello world')
        })

        it('null 应该清空 textContent', () => {
            const el = document.createElement('div')
            el.textContent = 'test'
            patchDOMProp(el, 'textContent', null, 'test')
            expect(el.textContent).toBe('')
        })
    })

    describe('className', () => {
        it('应该设置 className', () => {
            const el = document.createElement('div')
            patchDOMProp(el, 'className', 'foo bar', null)
            expect(el.className).toBe('foo bar')
        })

        it('null 应该清空 className', () => {
            const el = document.createElement('div')
            el.className = 'test'
            patchDOMProp(el, 'className', null, 'test')
            expect(el.className).toBe('')
        })
    })

    describe('disabled', () => {
        it('应该设置 disabled', () => {
            const el = document.createElement('button')
            patchDOMProp(el, 'disabled', true, null)
            expect(el.disabled).toBe(true)
        })

        it('false 应该取消 disabled', () => {
            const el = document.createElement('button')
            el.disabled = true
            patchDOMProp(el, 'disabled', false, true)
            expect(el.disabled).toBe(false)
        })
    })
})