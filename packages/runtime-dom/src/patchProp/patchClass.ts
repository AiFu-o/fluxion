/**
 * class 属性处理
 * 支持字符串、数组、对象三种形式
 */

import { warn, isString, isArray, isObject } from '@fluxion/shared'

/**
 * class 值类型
 */
type ClassValue = string | ClassArray | ClassObject | null | undefined

type ClassArray = ClassValue[]

type ClassObject = Record<string, boolean | undefined | null>

/**
 * 将 class 值规范化为字符串
 * @param value class 值
 */
export function normalizeClass(value: ClassValue): string {
    if (value == null) {
        return ''
    }

    if (isString(value)) {
        return value.trim()
    }

    if (isArray(value)) {
        return normalizeArrayClass(value)
    }

    if (isObject(value)) {
        return normalizeObjectClass(value as ClassObject)
    }

    warn('normalizeClass: 无效的 class 值类型')
    return ''
}

/**
 * 规范化数组形式的 class
 * @param values class 数组
 */
function normalizeArrayClass(values: ClassArray): string {
    const classes: string[] = []

    for (let i = 0; i < values.length; i++) {
        const value = normalizeClass(values[i])
        if (value) {
            classes.push(value)
        }
    }

    return classes.join(' ')
}

/**
 * 规范化对象形式的 class
 * @param obj class 对象
 */
function normalizeObjectClass(obj: ClassObject): string {
    const classes: string[] = []

    for (const key in obj) {
        if (obj[key]) {
            classes.push(key)
        }
    }

    return classes.join(' ')
}

/**
 * 处理 class 属性
 * @param el 元素
 * @param value 新的 class 值
 * @param prevValue 旧的 class 值（暂未使用，预留用于增量更新）
 */
export function patchClass(
    el: Element,
    value: ClassValue,
    prevValue: ClassValue
): void {
    if (!el) {
        warn('patchClass: 元素不能为空')
        return
    }

    // 规范化 class 值
    const normalizedClass = normalizeClass(value)

    // 设置 class
    if (normalizedClass) {
        el.className = normalizedClass
    } else {
        // 空值时清空 class
        el.className = ''
    }
}