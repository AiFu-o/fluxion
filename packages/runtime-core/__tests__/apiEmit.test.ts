/**
 * emit API 测试
 */

import { describe, it, expect, vi } from 'vitest'
import { emit, createEmit } from '../src/apiEmit'
import { createComponentInstance } from '../src/component'
import { createVNode } from '../src/vnode'

describe('emit', () => {
    it('应该触发事件处理器', () => {
        const handler = vi.fn()
        const component = {
            setup: () => () => null
        }
        const vnode = createVNode(component, {
            onClick: handler
        })
        const instance = createComponentInstance(vnode)

        emit(instance, 'click')

        expect(handler).toHaveBeenCalled()
    })

    it('应该传递参数给事件处理器', () => {
        const handler = vi.fn()
        const component = {
            setup: () => () => null
        }
        const vnode = createVNode(component, {
            onUpdate: handler
        })
        const instance = createComponentInstance(vnode)

        emit(instance, 'update', 'new value', 123)

        expect(handler).toHaveBeenCalledWith('new value', 123)
    })

    it('没有 props 时不应该报错', () => {
        const component = {
            setup: () => () => null
        }
        const vnode = createVNode(component)
        const instance = createComponentInstance(vnode)

        // 不应该抛出错误
        expect(() => emit(instance, 'click')).not.toThrow()
    })

    it('没有对应处理器时不应该报错', () => {
        const component = {
            setup: () => () => null
        }
        const vnode = createVNode(component, {
            onClick: () => {}
        })
        const instance = createComponentInstance(vnode)

        // 触发未定义的事件不应该报错
        expect(() => emit(instance, 'change')).not.toThrow()
    })

    it('应该支持数组形式的多个处理器', () => {
        const handler1 = vi.fn()
        const handler2 = vi.fn()
        const component = {
            setup: () => () => null
        }
        const vnode = createVNode(component, {
            onClick: [handler1, handler2]
        })
        const instance = createComponentInstance(vnode)

        emit(instance, 'click')

        expect(handler1).toHaveBeenCalled()
        expect(handler2).toHaveBeenCalled()
    })

    it('处理器执行错误时应该捕获并继续', () => {
        const errorHandler = vi.fn(() => {
            throw new Error('handler error')
        })
        const normalHandler = vi.fn()
        const component = {
            setup: () => () => null
        }
        const vnode = createVNode(component, {
            onClick: [errorHandler, normalHandler]
        })
        const instance = createComponentInstance(vnode)

        // 不应该抛出错误
        expect(() => emit(instance, 'click')).not.toThrow()
        expect(normalHandler).toHaveBeenCalled()
    })
})

describe('createEmit', () => {
    it('应该返回 emit 函数', () => {
        const component = {
            setup: () => () => null
        }
        const vnode = createVNode(component)
        const instance = createComponentInstance(vnode)

        const emitFn = createEmit(instance)

        expect(typeof emitFn).toBe('function')
    })

    it('返回的函数应该能触发事件', () => {
        const handler = vi.fn()
        const component = {
            setup: () => () => null
        }
        const vnode = createVNode(component, {
            onClick: handler
        })
        const instance = createComponentInstance(vnode)

        const emitFn = createEmit(instance)
        emitFn('click', 'arg1', 'arg2')

        expect(handler).toHaveBeenCalledWith('arg1', 'arg2')
    })
})

describe('事件名转换', () => {
    it('应该将 update 转换为 onUpdate', () => {
        const handler = vi.fn()
        const component = {
            setup: () => () => null
        }
        const vnode = createVNode(component, {
            onUpdate: handler
        })
        const instance = createComponentInstance(vnode)

        emit(instance, 'update')

        expect(handler).toHaveBeenCalled()
    })

    it('应该处理带修饰符的事件名', () => {
        const handler = vi.fn()
        const component = {
            setup: () => () => null
        }
        const vnode = createVNode(component, {
            'onUpdate:modelValue': handler
        })
        const instance = createComponentInstance(vnode)

        emit(instance, 'update:modelValue')

        expect(handler).toHaveBeenCalled()
    })
})