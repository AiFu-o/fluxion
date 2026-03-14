/**
 * emit API
 * 组件事件触发
 */

import { ComponentInstance, EmitFunction } from './types'
import { warn, isFunction, hasOwn } from '@fluxion-ui/shared'

/**
 * 创建 emit 函数
 * @param instance 组件实例
 * @param eventMap 事件定义
 */
export function createEmit(
    instance: ComponentInstance,
    eventMap?: string[]
): EmitFunction {
    return (event: string, ...args: any[]) => {
        emit(instance, event, ...args)
    }
}

/**
 * emit 函数
 * @param instance 组件实例
 * @param event 事件名
 * @param args 参数
 */
export function emit(
    instance: ComponentInstance,
    event: string,
    ...args: any[]
): void {
    const props = instance.vnode.props

    if (!props) {
        return
    }

    // 验证事件是否在 emits 中定义
    const type = instance.type
    if (type.emits && !type.emits.includes(event)) {
        warn(`事件 "${event}" 未在 emits 中定义`)
    }

    // 转换事件名
    // update:modelValue -> onUpdate:modelValue
    // change -> onChange
    const handlerName = toHandlerKey(event)
    const handler = props[handlerName]

    if (handler) {
        if (isFunction(handler)) {
            try {
                handler(...args)
            } catch (e) {
                warn(`事件处理器执行错误: ${e}`)
            }
        } else if (Array.isArray(handler)) {
            // 多个处理器
            for (const fn of handler) {
                if (isFunction(fn)) {
                    try {
                        fn(...args)
                    } catch (e) {
                        warn(`事件处理器执行错误: ${e}`)
                    }
                }
            }
        }
    }
}

/**
 * 转换事件名为处理器名
 * update:modelValue -> onUpdate:modelValue
 * change -> onChange
 */
function toHandlerKey(event: string): string {
    // 处理 kebab-case
    const parts = event.split(':')
    const eventPart = parts[0]
    const modifierPart = parts.length > 1 ? ':' + parts.slice(1).join(':') : ''

    // 首字母大写
    const capitalizedEvent = eventPart.charAt(0).toUpperCase() + eventPart.slice(1)

    return `on${capitalizedEvent}${modifierPart}`
}