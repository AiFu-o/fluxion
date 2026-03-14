/**
 * AsyncSignal 异步信号实现
 * 支持异步数据获取和加载状态
 */

import { warn, isFunction } from '@fluxion-ui/shared'
import type { Signal, AsyncSignal } from '../types'
import { signal } from './signal'

/**
 * AsyncSignal 状态
 */
interface AsyncSignalState<T> {
    data: Signal<T | undefined>
    loading: Signal<boolean>
    error: Signal<Error | null>
}

/**
 * 创建 AsyncSignal 异步信号
 * @param fetcher 异步获取函数
 * @param initialValue 初始值
 * @returns AsyncSignal 对象
 */
export function asyncSignal<T>(
    fetcher: () => Promise<T>,
    initialValue?: T
): AsyncSignal<T> {
    if (!isFunction(fetcher)) {
        warn('asyncSignal fetcher must be a function', fetcher)
        // 返回一个空的 AsyncSignal
        return createEmptyAsyncSignal<T>(initialValue)
    }

    // 创建内部 signal
    const data = signal<T | undefined>(initialValue)
    const loading = signal(true)
    const error = signal<Error | null>(null)

    // fetcher 函数引用（可能变化）
    let currentFetcher = fetcher

    // 取消标志
    let cancelled = false

    /**
     * 执行数据获取
     */
    const reload = async (): Promise<void> => {
        // 标记为进行中
        loading.set(true)
        error.set(null)

        try {
            // 如果有 fetcher，执行它
            if (currentFetcher) {
                const result = await currentFetcher()

                // 检查是否已取消
                if (cancelled) return

                // 设置数据
                data.set(result)
            }
        } catch (e) {
            // 检查是否已取消
            if (cancelled) return

            // 设置错误
            error.set(e as Error)
        } finally {
            // 检查是否已取消
            if (cancelled) return

            // 标记为完成
            loading.set(false)
        }
    }

    // 立即执行一次
    reload()

    // 创建 AsyncSignal 函数
    const signalFn = (function(this: AsyncSignal<T>) {
        return data()
    }) as AsyncSignal<T>

    // 添加属性
    signalFn.loading = loading
    signalFn.error = error
    signalFn.reload = reload

    // 添加 set 方法
    signalFn.set = (value: T | undefined | ((prev: T | undefined) => T | undefined)) => {
        data.set(value as any)
    }

    // 添加 update 方法
    signalFn.update = (updater: (prev: T | undefined) => T | undefined) => {
        const current = data()
        const newValue = updater(current)
        data.set(newValue as T)
    }

    // 添加 cancel 方法
    signalFn.cancel = () => {
        cancelled = true
    }

    // 添加 isCancelled 方法
    signalFn.isCancelled = () => cancelled

    // 添加 abort 方法（使用 AbortController）
    let abortController: AbortController | null = null
    signalFn.abort = () => {
        if (abortController) {
            abortController.abort()
            abortController = null
        }
        cancelled = true
    }

    // 添加 then 方法（Promise 兼容）
    signalFn.then = (onfulfilled?: (value: T) => any, onrejected?: (reason: any) => any) => {
        return Promise.resolve(data()).then(onfulfilled, onrejected)
    }

    // 添加 catch 方法
    signalFn.catch = (onrejected?: (reason: any) => any) => {
        return Promise.resolve(data()).catch(onrejected)
    }

    // 添加 finally 方法
    signalFn.finally = (onfinally?: () => void) => {
        return Promise.resolve(data()).finally(onfinally)
    }

    return signalFn
}

/**
 * 创建空的 AsyncSignal（用于错误情况）
 */
function createEmptyAsyncSignal<T>(initialValue?: T): AsyncSignal<T> {
    const data = signal<T | undefined>(initialValue)
    const loading = signal(false)
    const error = signal<Error | null>(null)

    const signalFn = (() => data()) as AsyncSignal<T>
    signalFn.loading = loading
    signalFn.error = error
    signalFn.reload = async () => {}

    signalFn.set = (value: T | undefined | ((prev: T | undefined) => T | undefined)) => {
        data.set(value as any)
    }

    signalFn.update = (updater: (prev: T | undefined) => T | undefined) => {
        const current = data()
        const newValue = updater(current)
        data.set(newValue as T)
    }

    signalFn.cancel = () => {}
    signalFn.isCancelled = () => false
    signalFn.abort = () => {}

    signalFn.then = (onfulfilled?: (value: T) => any, onrejected?: (reason: any) => any) => {
        return Promise.resolve(data()).then(onfulfilled, onrejected)
    }

    signalFn.catch = (onrejected?: (reason: any) => any) => {
        return Promise.resolve(data()).catch(onrejected)
    }

    signalFn.finally = (onfinally?: () => void) => {
        return Promise.resolve(data()).finally(onfinally)
    }

    return signalFn
}

/**
 * 创建 Suspense 风格的异步信号（带边界）
 * @param fetcher 异步获取函数
 * @param initialValue 初始值
 * @returns AsyncSignal 对象
 */
export function asyncSignalSuspense<T>(
    fetcher: () => Promise<T>,
    initialValue?: T
): AsyncSignal<T> {
    // 简化为普通 asyncSignal
    return asyncSignal(fetcher, initialValue)
}

/**
 * 延迟创建 AsyncSignal
 * @param delay 延迟时间（毫秒）
 * @param fetcher 异步获取函数
 * @returns AsyncSignal
 */
export function lazyAsyncSignal<T>(
    fetcher: () => Promise<T>,
    delay: number = 0
): () => AsyncSignal<T> {
    return () => {
        return asyncSignal(fetcher)
    }
}

/**
 * 缓存 AsyncSignal 的结果
 */
const asyncSignalCache = new Map<string, AsyncSignal<any>>()

/**
 * 创建带缓存的 AsyncSignal
 * @param key 缓存 key
 * @param fetcher 异步获取函数
 * @returns AsyncSignal
 */
export function cachedAsyncSignal<T>(
    key: string,
    fetcher: () => Promise<T>
): AsyncSignal<T> {
    const cached = asyncSignalCache.get(key)
    if (cached) {
        return cached
    }

    const signal = asyncSignal(fetcher)
    asyncSignalCache.set(key, signal)
    return signal
}

/**
 * 清除 AsyncSignal 缓存
 */
export function clearAsyncSignalCache(): void {
    asyncSignalCache.clear()
}