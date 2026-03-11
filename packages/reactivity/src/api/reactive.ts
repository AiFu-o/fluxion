/**
 * Reactive 响应式对象实现
 * 深层响应式代理
 */

import { warn, isObject } from '@fluxion/shared'
import { ReactiveFlags } from '../types'
import { getCurrentEffect } from '../state'

// 响应式映射表
const reactiveMap = new WeakMap<object, any>()
const readonlyMap = new WeakMap<object, any>()

// 目标对象到代理的映射
const targetMap = new WeakMap<object, Map<string | symbol, Set<any>>>()

/**
 * 获取依赖映射
 */
function getDepMap(target: object): Map<string | symbol, Set<any>> {
    let depMap = targetMap.get(target)
    if (!depMap) {
        depMap = new Map()
        targetMap.set(target, depMap)
    }
    return depMap
}

/**
 * 获取指定 key 的依赖集合
 */
function getDep(target: object, key: string | symbol): Set<any> {
    const depMap = getDepMap(target)
    let dep = depMap.get(key)
    if (!dep) {
        dep = new Set()
        depMap.set(key, dep)
    }
    return dep
}

/**
 * 触发指定 key 的依赖更新
 */
function trigger(target: object, key?: string | symbol): void {
    const depMap = targetMap.get(target)
    if (!depMap) return

    if (key !== undefined) {
        const dep = depMap.get(key)
        if (dep) {
            dep.forEach((effectFn: any) => {
                try {
                    effectFn()
                } catch (error) {
                    warn('Error triggering effect:', error)
                }
            })
        }
    }

    const dep = depMap.get(ReactiveFlags.RAW)
    if (dep) {
        dep.forEach((effectFn: any) => {
            try {
                effectFn()
            } catch (error) {
                warn('Error triggering effect:', error)
            }
        })
    }
}

/**
 * 检查是否为响应式
 */
function checkIsReactive(value: unknown): boolean {
    if (!value) return false
    const val = value as any
    return val[ReactiveFlags.IS_REACTIVE] === true
}

/**
 * 检查是否为只读
 */
function checkIsReadonly(value: unknown): boolean {
    if (!value) return false
    const val = value as any
    return val[ReactiveFlags.IS_READONLY] === true
}

/**
 * 创建响应式代理
 */
function createReactive<T extends object>(
    target: T,
    readonlyFlag: boolean = false,
    isShallow: boolean = false
): T {
    if (checkIsReactive(target)) {
        return target
    }
    if (checkIsReadonly(target)) {
        return target
    }

    const map = readonlyFlag ? readonlyMap : reactiveMap
    const existingProxy = map.get(target)
    if (existingProxy) {
        return existingProxy
    }

    const proxy = new Proxy(target, {
        get(target, key, receiver) {
            if (key === ReactiveFlags.IS_REACTIVE) {
                return !readonlyFlag
            }
            if (key === ReactiveFlags.IS_READONLY) {
                return readonlyFlag
            }
            if (key === ReactiveFlags.RAW) {
                return target
            }

            const currentEffect = getCurrentEffect()
            if (currentEffect) {
                const dep = getDep(target, key)
                dep.add(currentEffect)
            }

            const result = Reflect.get(target, key, receiver)

            if (isShallow) {
                return result
            }

            if (isObject(result)) {
                return readonlyFlag
                    ? readonly(result)
                    : reactive(result)
            }

            return result
        },

        set(target, key, value, receiver) {
            const oldValue = Reflect.get(target, key, receiver)
            const result = Reflect.set(target, key, value, receiver)

            if (result && !Object.is(value, oldValue)) {
                trigger(target, key)
            }

            return result
        },

        deleteProperty(target, key) {
            const oldValue = Reflect.get(target, key)
            const result = Reflect.deleteProperty(target, key)

            if (result) {
                trigger(target, key)
            }

            return result
        },

        has(target, key) {
            const result = Reflect.has(target, key)
            const currentEffect = getCurrentEffect()
            if (currentEffect) {
                const dep = getDep(target, key)
                dep.add(currentEffect)
            }
            return result
        },

        ownKeys(target) {
            const currentEffect = getCurrentEffect()
            if (currentEffect) {
                const dep = getDep(target, ReactiveFlags.RAW)
                dep.add(currentEffect)
            }
            return Reflect.ownKeys(target)
        },

        getOwnPropertyDescriptor(target, key) {
            const result = Reflect.getOwnPropertyDescriptor(target, key)
            const currentEffect = getCurrentEffect()
            if (currentEffect) {
                const dep = getDep(target, key)
                dep.add(currentEffect)
            }
            return result
        }
    })

    map.set(target, proxy)
    return proxy
}

/**
 * 创建响应式对象
 */
export function reactive<T extends object>(target: T): T {
    if (!isObject(target)) {
        warn('reactive() expects an object as target', target)
        return target
    }
    if (checkIsReadonly(target)) {
        return target
    }
    return createReactive(target, false, false)
}

/**
 * 创建浅响应式对象
 */
export function shallowReactive<T extends object>(target: T): T {
    if (!isObject(target)) {
        warn('shallowReactive() expects an object as target', target)
        return target
    }
    return createReactive(target, false, true)
}

/**
 * 创建只读对象
 */
export function readonly<T extends object>(target: T): Readonly<T> {
    if (!isObject(target)) {
        warn('readonly() expects an object as target', target)
        return target as any
    }
    if (checkIsReactive(target) || checkIsReadonly(target)) {
        return target as any
    }
    return createReactive(target, true, false) as Readonly<T>
}

/**
 * 创建浅只读对象
 */
export function shallowReadonly<T extends object>(target: T): Readonly<T> {
    if (!isObject(target)) {
        warn('shallowReadonly() expects an object as target', target)
        return target as any
    }
    return createReactive(target, true, true) as Readonly<T>
}

/**
 * 检查是否为响应式对象
 */
export function isReactive(value: unknown): boolean {
    return checkIsReactive(value)
}

/**
 * 检查是否为只读对象
 */
export function isReadonly(value: unknown): boolean {
    return checkIsReadonly(value)
}

/**
 * 检查是否为代理对象
 */
export function isProxy(value: unknown): boolean {
    return checkIsReactive(value) || checkIsReadonly(value)
}

/**
 * 获取原始对象
 */
export function toRaw<T>(value: T): T {
    if (checkIsReactive(value)) {
        return (value as any)[ReactiveFlags.RAW]
    }
    return value
}

/**
 * 转换为响应式（如果尚未转换）
 */
export function toReactive<T>(value: T): T {
    return checkIsReactive(value as any) ? value : reactive(value as object) as T
}

/**
 * 取消响应式（创建副本）
 */
export function toRef<T>(target: T): T {
    return target
}