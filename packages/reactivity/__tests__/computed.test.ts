/**
 * Computed 单元测试
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { computed, refresh } from '../src/api/computed'
import { signal, setGlobalEffect } from '../src/api/signal'
import { effect, stop } from '../src/api/effect'

describe('computed', () => {
    beforeEach(() => {
        setGlobalEffect(null)
    })

    afterEach(() => {
        setGlobalEffect(null)
    })

    describe('基础功能', () => {
        it('应该创建计算属性', () => {
            const double = computed(() => 10 * 2)
            expect(double()).toBe(20)
        })

        it('应该基于依赖计算值', () => {
            const count = signal(5)
            const double = computed(() => count() * 2)
            expect(double()).toBe(10)

            count.set(10)
            expect(double()).toBe(20)
        })
    })

    describe('缓存', () => {
        it('依赖未变时不重新计算', () => {
            const count = signal(5)
            const computeFn = vi.fn(() => count() * 2)

            const double = computed(computeFn)

            // 第一次调用
            double()
            expect(computeFn).toHaveBeenCalledTimes(1)

            // 再次调用，依赖未变
            double()
            expect(computeFn).toHaveBeenCalledTimes(1)
        })

        it('依赖变化后重新计算', () => {
            const count = signal(5)
            const computeFn = vi.fn(() => count() * 2)

            const double = computed(computeFn)
            double() // 第一次调用

            count.set(10) // 改变依赖
            double() // 重新计算

            expect(computeFn).toHaveBeenCalledTimes(2)
        })
    })

    describe('响应式', () => {
        it('应该追踪 signal 变化', () => {
            const count = signal(0)
            const result = computed(() => count() + 1)

            expect(result()).toBe(1)

            count.set(5)
            expect(result()).toBe(6)

            count.set(100)
            expect(result()).toBe(101)
        })

        it('可以在 effect 中使用', () => {
            const count = signal(1)
            const computedVal = computed(() => count() * 2)

            const fn = vi.fn(() => {
                return computedVal()
            })

            const eff = effect(fn)

            expect(fn).toHaveBeenCalledTimes(1)

            count.set(2)
            // effect 应该重新执行
            expect(fn).toHaveBeenCalledTimes(2)
        })
    })

    describe('不同类型', () => {
        it('应该支持字符串计算', () => {
            const name = signal('hello')
            const greeting = computed(() => name() + ' world')
            expect(greeting()).toBe('hello world')
        })

        it('应该支持对象计算', () => {
            const a = signal(1)
            const b = signal(2)
            const sum = computed(() => ({ a: a(), b: b(), sum: a() + b() }))

            expect(sum().sum).toBe(3)
        })

        it('应该支持数组计算', () => {
            const list = signal([1, 2, 3])
            const doubled = computed(() => list().map(x => x * 2))

            expect(doubled()).toEqual([2, 4, 6])
        })
    })
})

describe('refresh', () => {
    it('应该强制重新计算', () => {
        const count = signal(5)
        const computeFn = vi.fn(() => count() * 2)

        const double = computed(computeFn)
        double()
        expect(computeFn).toHaveBeenCalledTimes(1)

        // refresh 触发重新计算
        refresh(double)
        expect(computeFn).toHaveBeenCalledTimes(2)
    })
})