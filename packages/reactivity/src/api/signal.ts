/**
 * Signal 基础信号实现
 * 提供响应式数据封装
 */

import { warn } from '@fluxion/shared'
import type { Signal, SignalGetter } from '../types'
import { getCurrentEffect, setCurrentEffect } from '../state'

/**
 * 设置当前 effect
 */
export function setGlobalEffect(effect: (() => void) | null): void {
    setCurrentEffect(effect as any)
}

/**
 * 获取当前 effect
 */
export function getGlobalEffect(): (() => void) | null {
    return getCurrentEffect() as any
}

/**
 * Signal 订阅者
 */
interface SignalSubscriber {
    effect: (() => void) | null
}

/**
 * 创建 Signal
 * @param value 初始值
 * @returns Signal 函数，调用返回当前值
 */
export function signal<T>(value: T): Signal<T> {
    // 订阅者集合
    const subscribers = new Set<SignalSubscriber>()

    // 当前值
    let currentValue = value

    // 获取器函数
    const getter: SignalGetter<T> = function(this: SignalGetter<T>) {
        // 收集当前正在执行的 effect 作为依赖
        const effect = getGlobalEffect()
        if (effect) {
            // 检查是否已存在该 effect 的订阅
            const existing = Array.from(subscribers).find(s => s.effect === effect)
            if (!existing) {
                subscribers.add({ effect })
            }
        }
        return currentValue
    } as SignalGetter<T>

    // 设置值
    getter.set = function(value: T | ((prev: T) => T)): void {
        const resolved = typeof value === 'function'
            ? (value as (prev: T) => T)(currentValue)
            : value

        if (Object.is(resolved, currentValue)) {
            return
        }

        currentValue = resolved

        // 通知所有订阅者
        subscribers.forEach(subscriber => {
            if (subscriber.effect) {
                subscriber.effect()
            }
        })
    }

    // 更新值（set 的别名，语义更明确）
    getter.update = function(updater: (prev: T) => T): void {
        const newValue = updater(currentValue)
        getter.set(newValue)
    }

    // 合并到 Signal 类型
    const signalFn = getter as Signal<T>
    signalFn.set = getter.set
    signalFn.update = getter.update

    return signalFn
}

/**
 * 创建只读 Signal（不可修改）
 * @param value 初始值
 * @returns 只读的 Signal 函数
 */
export function readonlySignal<T>(value: T): () => T {
    let currentValue = value

    return function() {
        // 收集依赖
        const effect = getGlobalEffect()
        if (effect) {
            // 只读信号也需要追踪依赖，但这里我们简化处理
            // 在实际实现中可能需要特殊的只读订阅机制
        }
        return currentValue
    }
}

/**
 * 取消 Signal 的订阅
 * @param signal 要取消订阅的 Signal
 * @param effect 要移除的 effect
 */
export function unsubscribe<T>(signal: Signal<T>, effect: () => void): void {
    // 注意：由于 subscribers 是闭包中的私有变量，
    // 这个函数需要在 signal 内部实现专门的取消订阅机制
    // 当前简化实现暂不提供此功能
    warn('unsubscribe is not fully implemented yet')
}