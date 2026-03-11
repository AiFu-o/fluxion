/**
 * Reactivity 响应式系统
 * 提供 signal、computed、effect、watch、reactive 等响应式 API
 */

// Signal
export { signal, readonlySignal, unsubscribe } from './api/signal'
export type { Signal, SignalGetter } from './types'

// Computed
export { computed, readonly as computedReadonly, isCached, refresh, computedSet } from './api/computed'
export type { Computed } from './types'

// Effect
export { effect, stop, effectPost, effectSync, pauseEffect, resumeEffect, runEffects, setGlobalEffect, getGlobalEffect } from './api/effect'
export type { Effect, EffectRunner } from './types'

// Watch
export { watch, watchEffect, watchDeep, disposeAllWatches } from './api/watch'
export type { WatchCallback, WatchSource, WatchOptions } from './types'

// Reactive
export {
    reactive,
    shallowReactive,
    readonly,
    shallowReadonly,
    isReactive,
    isReadonly,
    isProxy,
    toRaw,
    toReactive,
    toRef
} from './api/reactive'

// AsyncSignal
export {
    asyncSignal,
    asyncSignalSuspense,
    lazyAsyncSignal,
    cachedAsyncSignal,
    clearAsyncSignalCache
} from './api/async'
export type { AsyncSignal } from './types'

// 内部状态（谨慎使用）
export {
    getCurrentEffect,
    setCurrentEffect,
    getEffectStack,
    pushEffect,
    popEffect,
    registerEffect,
    unregisterEffect,
    getAllEffects
} from './state'