/**
 * Reactivity 包类型定义
 */

import type { AnyFunction } from '@fluxion/shared'

// ==================== Signal 类型 ====================

/**
 * Signal 读取函数
 */
export type SignalGetter<T> = (() => T) & {
    set: (value: T | ((prev: T) => T)) => void
    update: (updater: (prev: T) => T) => void
}

/**
 * Signal 接口
 */
export interface Signal<T> extends Function {
    (): T
    set: (value: T | ((prev: T) => T)) => void
    update: (updater: (prev: T) => T) => void
}

// ==================== Computed 类型 ====================

/**
 * Computed 计算属性接口
 */
export interface Computed<T> extends Function {
    (): T
}

// ==================== Effect 类型 ====================

/**
 * Effect 运行函数
 */
export type EffectRunner = () => void

/**
 * Effect 接口
 */
export interface Effect extends Function {
    (): void
    stop: () => void
}

// ==================== Watch 类型 ====================

/**
 * Watch 回调函数
 */
export type WatchCallback<T> = (
    newValue: T,
    oldValue: T | undefined,
    cleanup?: () => void
) => void

/**
 * Watch 源函数
 */
export type WatchSource<T> = () => T

/**
 * Watch 选项
 */
export interface WatchOptions {
    immediate?: boolean
    deep?: boolean
    flush?: 'pre' | 'post' | 'sync'
}

// ==================== Reactive 类型 ====================

/**
 * Reactive 目标类型
 */
export type ReactiveTarget<T> = T extends object ? T : never

/**
 * Reactive 代理标记
 */
export const ReactiveFlags = {
    IS_REACTIVE: '__v_isReactive',
    IS_READONLY: '__v_isReadonly',
    RAW: '__v_raw'
} as const

/**
 * Reactive 映射表
 */
export interface ReactiveMap {
    get(target: object): any
    set(target: object, proxy: object): void
}

// ==================== AsyncSignal 类型 ====================

/**
 * AsyncSignal 异步信号接口
 */
export interface AsyncSignal<T> extends Signal<T | undefined> {
    loading: Signal<boolean>
    error: Signal<Error | null>
    reload: () => Promise<void>
    cancel: () => void
    isCancelled: () => boolean
    abort: () => void
    then<TResult1 = T, TResult2 = never>(
        onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | null,
        onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | null
    ): Promise<TResult1 | TResult2>
    catch<TResult = never>(
        onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | null
    ): Promise<T | TResult>
    finally(onfinally?: (() => void) | null): Promise<T>
}

// ==================== 内部类型 ====================

/**
 * 依赖项接口
 */
export interface Dependency {
    subscribers: Set<Effect>
    addSubscriber(effect: Effect): void
    removeSubscriber(effect: Effect): void
    notify(): void
}

/**
 * 全局响应式状态
 */
export interface ReactiveState {
    currentEffect: Effect | null
    effects: Set<Effect>[]
}