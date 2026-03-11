/**
 * Signal 单元测试
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { signal, setGlobalEffect, getGlobalEffect } from '../src/api/signal'

describe('signal', () => {
    beforeEach(() => {
        // 重置全局 effect 状态
        setGlobalEffect(null)
    })

    afterEach(() => {
        setGlobalEffect(null)
    })

    describe('基础功能', () => {
        it('应该创建初始值的 signal', () => {
            const count = signal(0)
            expect(count()).toBe(0)
        })

        it('应该可以读取 signal 的值', () => {
            const name = signal('test')
            expect(name()).toBe('test')
        })

        it('应该可以设置 signal 的值', () => {
            const count = signal(0)
            count.set(10)
            expect(count()).toBe(10)
        })

        it('应该可以使用函数形式设置值', () => {
            const count = signal(5)
            count.set((prev) => prev + 3)
            expect(count()).toBe(8)
        })

        it('应该可以使用 update 方法更新值', () => {
            const count = signal(10)
            count.update((prev) => prev * 2)
            expect(count()).toBe(20)
        })
    })

    describe('值相等性', () => {
        it('相同值不应该触发更新', () => {
            const count = signal(5)
            const callback = vi.fn()

            // 模拟订阅
            setGlobalEffect(callback)
            count()

            count.set(5) // 设置相同值
            expect(callback).not.toHaveBeenCalled()
        })
    })

    describe('不同类型', () => {
        it('应该支持数字类型', () => {
            const num = signal(123)
            expect(typeof num()).toBe('number')
        })

        it('应该支持字符串类型', () => {
            const str = signal('hello')
            expect(typeof str()).toBe('string')
        })

        it('应该支持布尔类型', () => {
            const bool = signal(true)
            expect(typeof bool()).toBe('boolean')
        })

        it('应该支持对象类型', () => {
            const obj = signal({ name: 'test' })
            expect(obj().name).toBe('test')
        })

        it('应该支持数组类型', () => {
            const arr = signal([1, 2, 3])
            expect(arr().length).toBe(3)
        })

        it('应该支持 null 和 undefined', () => {
            const nullVal = signal(null)
            const undefinedVal = signal(undefined)

            expect(nullVal()).toBe(null)
            expect(undefinedVal()).toBe(undefined)
        })
    })

    describe('依赖追踪', () => {
        it('读取时应该追踪当前 effect', () => {
            const count = signal(0)
            const callback = vi.fn()

            setGlobalEffect(callback)
            count() // 读取值，触发追踪

            expect(getGlobalEffect()).toBe(callback)
        })
    })
})

describe('readonlySignal', () => {
    it('应该创建只读 signal', () => {
        const value = readonlySignal(42)
        expect(value()).toBe(42)
    })
})