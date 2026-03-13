/**
 * HTML 属性处理
 * 使用 setAttribute/removeAttribute 处理 HTML 属性
 */

import { warn, isString, isBoolean } from '@fluxion/shared'

/**
 * 布尔属性列表
 * 这些属性只要存在即为 true，值会被忽略
 */
const BOOLEAN_ATTRIBUTES = new Set([
    'allowfullscreen',
    'async',
    'autofocus',
    'autoplay',
    'checked',
    'controls',
    'default',
    'defer',
    'disabled',
    'formnovalidate',
    'hidden',
    'inert',
    'ismap',
    'itemscope',
    'loop',
    'multiple',
    'muted',
    'nomodule',
    'novalidate',
    'open',
    'playsinline',
    'readonly',
    'required',
    'reversed',
    'selected'
])

/**
 * 判断是否为布尔属性
 * @param name 属性名
 */
export function isBooleanAttr(name: string): boolean {
    return BOOLEAN_ATTRIBUTES.has(name.toLowerCase())
}

/**
 * 需要特殊处理的属性
 * 这些属性使用 setAttribute 会有问题
 */
const SPECIAL_ATTRIBUTES = new Set([
    'value',
    'checked',
    'selected',
    'muted',
    'innerHTML',
    'textContent',
    'className',
    'style'
])

/**
 * 判断是否需要特殊处理
 * @param name 属性名
 */
export function isSpecialAttr(name: string): boolean {
    return SPECIAL_ATTRIBUTES.has(name)
}

/**
 * 处理 HTML 属性
 * @param el 元素
 * @param key 属性名
 * @param value 新值
 * @param prevValue 旧值（暂未使用）
 */
export function patchAttr(
    el: Element,
    key: string,
    value: any,
    prevValue: any
): void {
    if (!el) {
        warn('patchAttr: 元素不能为空')
        return
    }

    if (!key) {
        warn('patchAttr: 属性名不能为空')
        return
    }

    // 检查是否为特殊属性
    if (isSpecialAttr(key)) {
        warn(`patchAttr: ${key} 应该由对应的 patch 函数处理`)
        return
    }

    // 转为小写进行比较
    const lowerKey = key.toLowerCase()

    if (value == null || value === false) {
        // 移除属性
        el.removeAttribute(key)
    } else if (isBooleanAttr(lowerKey)) {
        // 布尔属性：值存在即为 true
        el.setAttribute(key, '')
    } else {
        // 普通属性
        el.setAttribute(key, value)
    }
}

/**
 * 批量设置属性
 * @param el 元素
 * @param attrs 属性对象
 */
export function setAttrs(el: Element, attrs: Record<string, any>): void {
    if (!el || !attrs) return

    for (const key in attrs) {
        const value = attrs[key]
        patchAttr(el, key, value, null)
    }
}

/**
 * 移除所有属性
 * @param el 元素
 * @param attrs 要移除的属性名数组
 */
export function removeAttrs(el: Element, attrs: string[]): void {
    if (!el || !attrs) return

    for (let i = 0; i < attrs.length; i++) {
        el.removeAttribute(attrs[i])
    }
}