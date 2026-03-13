/**
 * 事件属性处理
 * 使用 invoker 模式避免频繁 addEventListener/removeEventListener
 */

import { warn, isFunction, isArray } from '@fluxion/shared'

/**
 * Invoker 缓存键
 * 用于在元素上存储事件 invoker
 */
const VEI_KEY = '__vei'

/**
 * 事件处理器类型
 */
type EventHandler = (event: Event) => void

/**
 * 事件处理器数组类型
 */
type EventHandlerArray = EventHandler[]

/**
 * Invoker 对象
 * 包装事件处理器，支持动态更换内部处理函数
 */
interface Invoker extends EventHandler {
    value: EventHandler | EventHandlerArray
    attached: number // 绑定时间戳，用于去重
}

/**
 * Invoker 处理函数
 */
type InvokerHandlers = Record<string, Invoker>

/**
 * 判断是否为事件属性
 * 事件属性格式：onXxx（第三个字符必须是大写字母）
 * @param key 属性名
 */
export function isEventKey(key: string): boolean {
    return key.startsWith('on') && key.length > 2 && /[A-Z]/.test(key[2])
}

/**
 * 规范化事件名
 * onClick -> click
 * onMyEvent -> myevent
 * @param key 属性名
 */
export function normalizeEventName(key: string): string {
    // 移除 'on' 前缀并转为小写
    return key.slice(2).toLowerCase()
}

/**
 * 创建事件包装函数
 * @param value 事件处理器
 */
function createInvokerWrapper(value: EventHandler | EventHandlerArray): Invoker {
    const invoker: Invoker = (event: Event) => {
        if (isArray(invoker.value)) {
            // 处理函数数组
            for (let i = 0; i < invoker.value.length; i++) {
                const handler = invoker.value[i]
                if (isFunction(handler)) {
                    handler(event)
                }
            }
        } else if (isFunction(invoker.value)) {
            // 单个处理函数
            invoker.value(event)
        }
    }
    invoker.value = value
    invoker.attached = 0
    return invoker
}

/**
 * 处理事件属性
 * @param el 元素
 * @param key 属性名（如 onClick）
 * @param value 新的事件处理器
 * @param prevValue 旧的事件处理器
 */
export function patchEvent(
    el: Element & { [VEI_KEY]?: InvokerHandlers },
    key: string,
    value: EventHandler | EventHandlerArray | null,
    prevValue: EventHandler | EventHandlerArray | null
): void {
    if (!el) {
        warn('patchEvent: 元素不能为空')
        return
    }

    // 获取事件名
    const eventName = normalizeEventName(key)

    // 获取或创建 invokers 缓存
    const invokers = (el[VEI_KEY] ??= {}) as InvokerHandlers

    // 获取现有的 invoker
    const existingInvoker = invokers[eventName]

    if (value == null) {
        // 移除事件
        if (existingInvoker) {
            // 使用 invoker 本身作为移除的函数（invoker 是 wrapper）
            el.removeEventListener(eventName, existingInvoker)
            delete invokers[eventName]
        }
    } else {
        if (existingInvoker) {
            // 更新现有 invoker 的值
            // 不需要重新 addEventListener，直接替换 value
            existingInvoker.value = value
        } else {
            // 创建新的 invoker（invoker 本身就是 wrapper 函数）
            const invoker = createInvokerWrapper(value)
            invoker.attached = Date.now()
            invokers[eventName] = invoker
            el.addEventListener(eventName, invoker)
        }
    }
}