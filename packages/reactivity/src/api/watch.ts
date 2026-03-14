/**
 * Watch 监听器实现
 * 监听响应式数据变化
 */

import { warn, isFunction, isObject, isArray } from '@fluxion-ui/shared'
import type { WatchCallback, WatchSource, WatchOptions } from '../types'
import { effect, stop } from './effect'
import { toRaw } from './reactive'

// ==================== 深度比较 ====================

/**
 * 深度比较两个值是否相等
 */
function deepEqual(a: any, b: any): boolean {
    if (a === b) return true

    if (!a || !b) return false

    // 如果是原始类型，不相等
    if (typeof a !== 'object' || typeof b !== 'object') {
        return a === b
    }

    // 如果是数组
    if (isArray(a) && isArray(b)) {
        if (a.length !== b.length) return false
        for (let i = 0; i < a.length; i++) {
            if (!deepEqual(a[i], b[i])) return false
        }
        return true
    }

    // 如果是对象
    const keysA = Object.keys(a)
    const keysB = Object.keys(b)

    if (keysA.length !== keysB.length) return false

    for (const key of keysA) {
        if (!keysB.includes(key)) return false
        if (!deepEqual(a[key], b[key])) return false
    }

    return true
}

// ==================== Watch 实现 ====================

/**
 * 监听单一数据源
 */
function watchSource<T>(
    source: WatchSource<T>,
    callback: WatchCallback<T>,
    options?: WatchOptions
): () => void {
    let oldValue: T | undefined = undefined
    let initialRun = true

    // 清理函数
    let cleanup: (() => void) | undefined

    const runner = () => {
        // 如果有清理函数，先执行
        if (cleanup) {
            cleanup()
        }

        // 获取新值
        const newValue = source()

        // 检查值是否变化
        let isChanged = initialRun
        if (!initialRun) {
            if (options?.deep) {
                isChanged = !deepEqual(newValue, oldValue)
            } else {
                isChanged = newValue !== oldValue
            }
        }

        if (isChanged || initialRun) {
            // 执行回调
            cleanup = callback(newValue as T, oldValue as T, cleanup)
            oldValue = newValue
            initialRun = false
        }
    }

    // 立即执行（如果设置了 immediate）
    if (options?.immediate) {
        runner()
    }

    // 创建 effect 来追踪依赖
    const eff = effect(runner, { flush: options?.flush })

    // 返回停止函数
    return () => {
        stop(eff)
    }
}

/**
 * 监听多个数据源
 */
function watchSources<T>(
    sources: WatchSource<T>[],
    callback: (values: T[], oldValues: T[]) => void,
    options?: WatchOptions
): () => void {
    let oldValues: T[] = sources.map(() => undefined as any)
    let initialRun = true

    const runner = () => {
        const newValues = sources.map(source => source())

        let isChanged = initialRun
        if (!initialRun) {
            for (let i = 0; i < newValues.length; i++) {
                if (options?.deep) {
                    if (!deepEqual(newValues[i], oldValues[i])) {
                        isChanged = true
                        break
                    }
                } else {
                    if (newValues[i] !== oldValues[i]) {
                        isChanged = true
                        break
                    }
                }
            }
        }

        if (isChanged || initialRun) {
            callback(newValues, oldValues)
            oldValues = [...newValues]
            initialRun = false
        }
    }

    if (options?.immediate) {
        runner()
    }

    const eff = effect(runner, { flush: options?.flush })

    return () => {
        stop(eff)
    }
}

// ==================== 导出函数 ====================

/**
 * 监听响应式数据变化
 * @param source 要监听的数据源（函数、Signal 或响应式对象）
 * @param callback 变化时的回调函数
 * @param options 选项
 * @returns 停止监听的函数
 */
export function watch<T>(
    source: WatchSource<T> | WatchSource<T>[],
    callback: WatchCallback<T> | ((values: T[], oldValues: T[]) => void),
    options?: WatchOptions
): () => void {
    // 参数校验
    if (!isFunction(source) && !isObject(source)) {
        warn('watch source must be a function or an object')
        return () => {}
    }

    if (!isFunction(callback)) {
        warn('watch callback must be a function')
        return () => {}
    }

    // 处理数组（多个数据源）
    if (Array.isArray(source)) {
        const sources = source as WatchSource<T>[]
        return watchSources(sources, callback as any, options)
    }

    // 处理单一数据源
    return watchSource(source as WatchSource<T>, callback as WatchCallback<T>, options)
}

/**
 * 监听响应式对象的属性
 * @param source 响应式对象
 * @param callback 回调函数
 * @param options 选项
 * @returns 停止监听的函数
 */
export function watchEffect(
    callback: (cleanup?: () => void) => void,
    options?: WatchOptions
): () => void {
    if (!isFunction(callback)) {
        warn('watchEffect callback must be a function')
        return () => {}
    }

    let cleanup: (() => void) | undefined

    const runner = () => {
        if (cleanup) {
            cleanup()
        }

        // 传递清理函数给用户
        cleanup = callback(cleanup)
    }

    const eff = effect(runner, { flush: options?.flush })

    return () => {
        stop(eff)
    }
}

/**
 * 监听对象深度变化
 * @param source 响应式对象
 * @param callback 回调函数
 * @returns 停止监听的函数
 */
export function watchDeep<T extends object>(
    source: T,
    callback: (newValue: T, oldValue: T) => void
): () => void {
    return watch(
        () => toRaw(source),
        callback,
        { deep: true }
    )
}

/**
 * 停止所有 watch（全局函数）
 */
export function disposeAllWatches(): void {
    // 当前实现中，watch 返回的停止函数由用户调用
    // 这里可以添加全局清理逻辑
    warn('disposeAllWatches is not implemented')
}