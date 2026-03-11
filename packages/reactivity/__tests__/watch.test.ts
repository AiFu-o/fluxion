/**
 * Watch 单元测试
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { watch, watchEffect, watchDeep } from '../src/api/watch'
import { signal, setGlobalEffect } from '../src/api/signal'
import { effect, stop } from '../src/api/effect'

describe('watch', () => {
    beforeEach(() => {
        setGlobalEffect(null)
    })

    afterEach(() => {
        setGlobalEffect(null)
    })

    describe('基础功能', () => {
        it('应该监听值变化', () => {
            const count = signal(0)
            const callback = vi.fn((newVal, oldVal) => {})

            watch(count, callback)

            count.set(1)

            expect(callback).toHaveBeenCalledTimes(1)
            expect(callback).toHaveBeenCalledWith(1, 0)
        })

        it('相同值不触发回调', () => {
            const count = signal(5)
            const callback = vi.fn((newVal, oldVal) => {})

            watch(count, callback)

            count.set(5) // 相同值

            expect(callback).not.toHaveBeenCalled()
        })

        it('应该返回停止函数', () => {
            const count = signal(0)
            const callback = vi.fn((newVal, oldVal) => {})

            const stopWatch = watch(count, callback)

            stopWatch()

            count.set(10)

            expect(callback).not.toHaveBeenCalled()
        })
    })

    describe('immediate 选项', () => {
        it('immediate: true 应该立即执行', () => {
            const count = signal(5)
            const callback = vi.fn((newVal, oldVal) => {})

            watch(count, callback, { immediate: true })

            expect(callback).toHaveBeenCalledTimes(1)
            expect(callback).toHaveBeenCalledWith(5, undefined)
        })
    })

    describe('deep 选项', () => {
        it('应该深度监听对象变化', () => {
            const state = signal({ count: 0 })
            const callback = vi.fn((newVal, oldVal) => {})

            watch(state, callback, { deep: true })

            state.set({ count: 5 })

            expect(callback).toHaveBeenCalled()
        })
    })

    describe('多个数据源', () => {
        it('应该监听多个 signal', () => {
            const a = signal(1)
            const b = signal(2)
            const callback = vi.fn((values) => {})

            watch([a, b], callback)

            a.set(10)

            expect(callback).toHaveBeenCalled()
        })
    })
})

describe('watchEffect', () => {
    it('应该立即执行并追踪依赖', () => {
        const count = signal(0)
        const callback = vi.fn(() => {
            return count()
        })

        watchEffect(callback)

        expect(callback).toHaveBeenCalledTimes(1)

        count.set(10)

        // 应该重新执行
        expect(callback).toHaveBeenCalledTimes(2)
    })

    it('应该返回停止函数', () => {
        const count = signal(0)
        const callback = vi.fn(() => count())

        const stopWatch = watchEffect(callback)

        stopWatch()

        count.set(10)

        expect(callback).toHaveBeenCalledTimes(1) // 只执行了初始一次
    })
})

describe('watchDeep', () => {
    it('应该深度监听响应式对象', () => {
        const state = signal({ nested: { count: 0 } })
        const callback = vi.fn((newVal, oldVal) => {})

        watchDeep(state, callback)

        state.set({ nested: { count: 10 } })

        expect(callback).toHaveBeenCalled()
    })
})