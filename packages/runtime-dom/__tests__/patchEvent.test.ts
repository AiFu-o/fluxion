/**
 * patchEvent 事件处理测试
 */

import { describe, it, expect, vi } from 'vitest'
import {
    patchEvent,
    isEventKey,
    normalizeEventName
} from '../src/patchProp/patchEvent'

describe('isEventKey', () => {
    it('应该识别事件属性', () => {
        expect(isEventKey('onClick')).toBe(true)
        expect(isEventKey('onInput')).toBe(true)
        expect(isEventKey('onChange')).toBe(true)
        expect(isEventKey('onMyEvent')).toBe(true)
    })

    it('应该拒绝非事件属性', () => {
        expect(isEventKey('onclick')).toBe(false) // 小写
        expect(isEventKey('on')).toBe(false) // 太短
        expect(isEventKey('class')).toBe(false)
        expect(isEventKey('style')).toBe(false)
    })
})

describe('normalizeEventName', () => {
    it('应该转换事件名', () => {
        expect(normalizeEventName('onClick')).toBe('click')
        expect(normalizeEventName('onInput')).toBe('input')
        expect(normalizeEventName('onChange')).toBe('change')
    })

    it('应该处理自定义事件名', () => {
        expect(normalizeEventName('onMyEvent')).toBe('myevent')
    })
})

describe('patchEvent', () => {
    it('应该绑定事件处理器', () => {
        const el = document.createElement('button')
        const handler = vi.fn()

        patchEvent(el, 'onClick', handler, null)

        el.click()
        expect(handler).toHaveBeenCalledTimes(1)
    })

    it('应该移除事件处理器', () => {
        const el = document.createElement('button')
        const handler = vi.fn()

        patchEvent(el, 'onClick', handler, null)
        patchEvent(el, 'onClick', null, handler)

        el.click()
        expect(handler).not.toHaveBeenCalled()
    })

    it('应该更新事件处理器', () => {
        const el = document.createElement('button')
        const handler1 = vi.fn()
        const handler2 = vi.fn()

        patchEvent(el, 'onClick', handler1, null)
        el.click()
        expect(handler1).toHaveBeenCalledTimes(1)

        patchEvent(el, 'onClick', handler2, handler1)
        el.click()
        expect(handler2).toHaveBeenCalledTimes(1)
        // handler1 不应该再被调用
        expect(handler1).toHaveBeenCalledTimes(1)
    })

    it('应该支持事件处理器数组', () => {
        const el = document.createElement('button')
        const handler1 = vi.fn()
        const handler2 = vi.fn()

        patchEvent(el, 'onClick', [handler1, handler2], null)

        el.click()
        expect(handler1).toHaveBeenCalledTimes(1)
        expect(handler2).toHaveBeenCalledTimes(1)
    })

    it('事件应该接收到 event 参数', () => {
        const el = document.createElement('button')
        const handler = vi.fn()

        patchEvent(el, 'onClick', handler, null)

        el.click()
        expect(handler).toHaveBeenCalledWith(expect.any(Event))
    })

    it('应该支持其他事件类型', () => {
        const el = document.createElement('input')
        const handler = vi.fn()

        patchEvent(el, 'onInput', handler, null)

        el.dispatchEvent(new Event('input'))
        expect(handler).toHaveBeenCalledTimes(1)
    })
})