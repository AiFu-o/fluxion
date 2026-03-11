/**
 * Computed 计算属性实现
 * 根据依赖自动计算值并缓存结果
 */

import { warn, isFunction } from '@fluxion/shared'
import type { Computed } from '../types'
import { effect, stop } from './effect'

/**
 * 创建 Computed 计算属性
 * @param getter 计算函数
 * @returns Computed 函数，调用返回计算值
 */
export function computed<T>(getter: () => T): Computed<T> {
    if (!isFunction(getter)) {
        warn('computed getter must be a function', getter)
        return (() => undefined) as Computed<T>
    }

    // 缓存的值
    let cachedValue: T | undefined = undefined

    // 是否脏（需要重新计算）
    let dirty = true

    // 通知更新的回调（外部订阅用）
    let onUpdate: (() => void) | null = null

    // 创建一个 effect 来追踪 getter 中的响应式依赖
    // 当依赖变化时，设置 dirty 并通知回调
    const eff = effect(() => {
        // 读取 getter 中的响应式数据
        // 这会收集依赖（如 countSignal）
        getter()

        // 依赖变化时，下次访问需要重新计算
        dirty = true

        // 通知更新
        if (onUpdate) {
            onUpdate()
        }
    })

    // 创建 computed 函数
    const computedFn = (() => {
        if (dirty) {
            // 重新计算
            cachedValue = getter()
            dirty = false
        }

        return cachedValue as T
    }) as Computed<T>

    // 添加 stop 方法
    computedFn.stop = () => {
        stop(eff)
    }

    return computedFn
}

/**
 * 创建只读的计算属性
 * @param getter 计算函数
 * @returns Computed 函数
 */
export function readonly<T>(getter: () => T): Computed<T> {
    return computed(getter)
}

/**
 * 检查 Computed 是否有缓存值
 * @param computed 要检查的 Computed
 * @returns 是否有缓存
 */
export function isCached<T>(computed: Computed<T>): boolean {
    // 当前实现总是有缓存
    return true
}

/**
 * 强制 Computed 重新计算
 * @param computed 要重新计算的 Computed
 */
export function refresh<T>(computed: Computed<T>): void {
    // 触发重新计算
    // 由于 computed 是惰性求值，调用即重新计算
    computed()
}

/**
 * 创建 ComputedSet（多个相关计算属性的集合）
 * @param getters 计算函数映射
 * @returns Computed 映射
 */
export function computedSet<T extends Record<string, () => any>>(
    getters: T
): {
    [K in keyof T]: ReturnType<T[K]>
} {
    const result: any = {}

    for (const key in getters) {
        if (Object.prototype.hasOwnProperty.call(getters, key)) {
            result[key] = computed(getters[key]!)
        }
    }

    return result
}