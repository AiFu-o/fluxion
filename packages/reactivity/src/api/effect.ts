/**
 * Effect 副作用系统实现
 * 自动追踪依赖并响应变化
 */

import { warn, isFunction } from '@fluxion/shared'
import {
    getCurrentEffect,
    setCurrentEffect,
    pushEffect as statePushEffect,
    popEffect as statePopEffect,
    registerEffect as stateRegisterEffect,
    unregisterEffect as stateUnregisterEffect,
    getEffectStack
} from '../state'

/**
 * Effect 清理函数
 */
type CleanupFn = () => void

/**
 * Effect 运行函数
 */
type EffectRunner = () => void | CleanupFn

/**
 * Effect 接口
 */
interface IEffect extends Function {
    (): void
    stop: () => void
}

/**
 * Effect 选项
 */
interface EffectOptions {
    flush?: 'pre' | 'post' | 'sync'
}

/**
 * 设置当前 effect（供 signal 依赖追踪使用）
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
 * 将 effect 压入栈
 */
function pushEffect(effect: IEffect): void {
    statePushEffect(effect as any)
    // 设置全局 effect 以便 signal 追踪
    setGlobalEffect(effect as any)
}

/**
 * 将 effect 弹出栈
 */
function popEffect(): IEffect | undefined {
    const effect = statePopEffect()
    // 清空全局 effect
    setGlobalEffect(getEffectStack().length > 0 ? getEffectStack()[getEffectStack().length - 1] as any : null)
    return effect
}

/**
 * 注册 effect
 */
function registerEffect(effect: IEffect): void {
    stateRegisterEffect(effect as any)
}

/**
 * 注销 effect
 */
function unregisterEffect(effect: IEffect): void {
    stateUnregisterEffect(effect as any)
}

/**
 * 创建 Effect
 */
export function effect(fn: EffectRunner, _options?: EffectOptions): IEffect {
    if (!isFunction(fn)) {
        warn('effect function must be a function', fn)
        return (() => {}) as IEffect
    }

    let cleanup: CleanupFn | null = null

    const runCleanup = () => {
        if (cleanup) {
            cleanup()
            cleanup = null
        }
    }

    const effectFn = (() => {
        runCleanup()

        pushEffect(effectFn as IEffect)

        try {
            const result = fn()

            if (isFunction(result)) {
                cleanup = result as CleanupFn
            }

            return result
        } finally {
            popEffect()
        }
    }) as IEffect

    effectFn.stop = () => {
        runCleanup()
        unregisterEffect(effectFn as IEffect)
    }

    registerEffect(effectFn as IEffect)
    effectFn()

    return effectFn as IEffect
}

/**
 * 停止 Effect
 */
export function stop(effect: IEffect): void {
    if (effect && isFunction(effect.stop)) {
        effect.stop()
    }
}

/**
 * 创建一个只在 DOM 更新后执行的 effect
 */
export function effectPost(fn: EffectRunner): IEffect {
    return effect(fn)
}

/**
 * 创建一个同步执行的 effect
 */
export function effectSync(fn: EffectRunner): IEffect {
    return effect(fn)
}

export function pauseEffect(_effect: IEffect): void {
    warn('pauseEffect is not fully implemented yet')
}

export function resumeEffect(_effect: IEffect): void {
    warn('resumeEffect is not fully implemented yet')
}

/**
 * 批量执行 effects
 */
export function runEffects(effects: IEffect[]): void {
    effects.forEach(effect => {
        try {
            effect()
        } catch (error) {
            warn('Error running effect:', error)
        }
    })
}