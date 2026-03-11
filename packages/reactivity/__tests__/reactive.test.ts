/**
 * Reactive 单元测试
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
    reactive,
    shallowReactive,
    readonly,
    shallowReadonly,
    isReactive,
    isReadonly,
    isProxy,
    toRaw,
    toReactive
} from '../src/api/reactive'
import { effect, stop } from '../src/api/effect'
import { setGlobalEffect } from '../src/api/signal'

describe('reactive', () => {
    beforeEach(() => {
        setGlobalEffect(null)
    })

    afterEach(() => {
        setGlobalEffect(null)
    })

    describe('基础功能', () => {
        it('应该创建响应式对象', () => {
            const state = reactive({ count: 0 })
            expect(state.count).toBe(0)
        })

        it('修改属性应该触发更新', () => {
            const state = reactive({ count: 0 })
            const fn = vi.fn(() => {
                return state.count
            })

            const eff = effect(fn)

            state.count = 10

            // effect 应该在 count 变化时重新执行
            expect(fn).toHaveBeenCalledTimes(2)
        })
    })

    describe('isReactive', () => {
        it('应该正确识别响应式对象', () => {
            const state = reactive({ name: 'test' })
            expect(isReactive(state)).toBe(true)
        })

        it('普通对象应该返回 false', () => {
            const obj = { name: 'test' }
            expect(isReactive(obj)).toBe(false)
        })
    })

    describe('嵌套对象', () => {
        it('嵌套对象应该是响应式的', () => {
            const state = reactive({
                user: {
                    name: 'test'
                }
            })

            expect(isReactive(state.user)).toBe(true)
        })
    })

    describe('数组', () => {
        it('数组应该是响应式的', () => {
            const list = reactive([1, 2, 3])
            expect(list.length).toBe(3)

            list.push(4)
            expect(list.length).toBe(4)
        })
    })
})

describe('shallowReactive', () => {
    it('应该创建浅响应式对象', () => {
        const state = shallowReactive({ count: 0 })
        expect(state.count).toBe(0)
    })

    it('嵌套对象不应该是深层响应式', () => {
        const state = shallowReactive({
            user: { name: 'test' }
        })

        // 浅响应式，嵌套对象不是响应式的
        expect(isReactive(state.user)).toBe(false)
    })
})

describe('readonly', () => {
    it('应该创建只读对象', () => {
        const state = readonly({ count: 0 })
        expect(state.count).toBe(0)
    })

    it('isReadonly 应该返回 true', () => {
        const state = readonly({ name: 'test' })
        expect(isReadonly(state)).toBe(true)
    })

    it('修改属性应该被忽略（不抛出错误）', () => {
        const state = readonly({ count: 0 })
        state.count = 10 // 应该被忽略
        expect(state.count).toBe(0)
    })
})

describe('shallowReadonly', () => {
    it('应该创建浅只读对象', () => {
        const state = shallowReadonly({ count: 0 })
        expect(state.count).toBe(0)
        expect(isReadonly(state)).toBe(true)
    })
})

describe('isProxy', () => {
    it('应该识别响应式代理', () => {
        const state = reactive({ name: 'test' })
        expect(isProxy(state)).toBe(true)
    })

    it('应该识别只读代理', () => {
        const state = readonly({ name: 'test' })
        expect(isProxy(state)).toBe(true)
    })

    it('普通对象返回 false', () => {
        expect(isProxy({ name: 'test' })).toBe(false)
    })
})

describe('toRaw', () => {
    it('应该返回原始对象', () => {
        const original = { name: 'test' }
        const state = reactive(original)

        expect(toRaw(state)).toBe(original)
    })
})

describe('toReactive', () => {
    it('响应式对象直接返回', () => {
        const state = reactive({ name: 'test' })
        expect(toReactive(state)).toBe(state)
    })

    it('普通对象应该转为响应式', () => {
        const obj = { name: 'test' }
        const state = toReactive(obj)

        expect(isReactive(state)).toBe(true)
    })
})