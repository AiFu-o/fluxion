/**
 * 全局响应式状态
 * 用于追踪当前正在执行的 effect
 */

import type { Effect } from './types'

// 当前正在执行的 effect
let currentEffect: Effect | null = null

// effect 栈
const effectStack: Effect[] = []

// 存储所有活跃的 effect 集合
const allEffects = new Set<Effect>()

/**
 * 获取当前正在执行的 effect
 */
export function getCurrentEffect(): Effect | null {
    return currentEffect
}

/**
 * 设置当前正在执行的 effect
 */
export function setCurrentEffect(effect: Effect | null): void {
    currentEffect = effect
}

/**
 * 获取 effect 栈
 */
export function getEffectStack(): Effect[] {
    return effectStack
}

/**
 * 将 effect 压入栈
 */
export function pushEffect(effect: Effect): void {
    effectStack.push(effect)
    currentEffect = effect
}

/**
 * 将 effect 弹出栈
 */
export function popEffect(): Effect | undefined {
    const effect = effectStack.pop()
    currentEffect = effectStack.length > 0
        ? effectStack[effectStack.length - 1]
        : null
    return effect
}

/**
 * 注册 effect
 */
export function registerEffect(effect: Effect): void {
    allEffects.add(effect)
}

/**
 * 注销 effect
 */
export function unregisterEffect(effect: Effect): void {
    allEffects.delete(effect)
}

/**
 * 获取所有活跃的 effects
 */
export function getAllEffects(): Set<Effect> {
    return allEffects
}

// 重新导出 Effect 类型
export type { Effect } from './types'