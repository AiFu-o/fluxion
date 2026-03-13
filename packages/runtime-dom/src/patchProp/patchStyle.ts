/**
 * style 属性处理
 * 支持字符串和对象两种形式
 */

import { warn, isString, isObject, hasOwn } from '@fluxion/shared'

/**
 * CSS 属性名映射（用于处理简写属性）
 */
const cssTextCache = new WeakMap<object, string>()

/**
 * style 值类型
 */
type StyleValue = string | StyleObject | null | undefined

type StyleObject = Record<string, string | number | null | undefined>

/**
 * 重要样式属性，需要添加 !important 后缀
 */
const importantStyles = new Set([
    'display'
])

/**
 * CSS 属性名转换
 * camelCase -> kebab-case
 * @param name 属性名
 */
export function camelize(name: string): string {
    return name.replace(/-(\w)/g, (_, c) => (c ? c.toUpperCase() : ''))
}

/**
 * CSS 属性名转换
 * camelCase -> kebab-case
 * @param name 属性名
 */
export function hyphenate(name: string): string {
    return name.replace(/\B([A-Z])/g, '-$1').toLowerCase()
}

/**
 * 规范化样式值
 * 添加必要的单位（如 px）
 * @param name 属性名
 * @param value 属性值
 */
function normalizeStyleValue(
    name: string,
    value: string | number
): string {
    // 如果已经是字符串，直接返回
    if (isString(value)) {
        return value
    }

    // 数值类型需要添加单位
    // 无单位的 CSS 属性列表
    const unitlessProperties = new Set([
        'animationIterationCount',
        'aspectRatio',
        'borderImageOutset',
        'borderImageSlice',
        'borderImageWidth',
        'boxFlex',
        'boxFlexGroup',
        'boxOrdinalGroup',
        'columnCount',
        'columns',
        'flex',
        'flexGrow',
        'flexPositive',
        'flexShrink',
        'flexNegative',
        'flexOrder',
        'gridArea',
        'gridColumn',
        'gridColumnEnd',
        'gridColumnStart',
        'gridRow',
        'gridRowEnd',
        'gridRowStart',
        'lineClamp',
        'lineHeight',
        'opacity',
        'order',
        'orphans',
        'tabSize',
        'widows',
        'zIndex',
        'zoom',
        'fillOpacity',
        'floodOpacity',
        'stopOpacity',
        'strokeDasharray',
        'strokeDashoffset',
        'strokeMiterlimit',
        'strokeOpacity',
        'strokeWidth'
    ])

    // 检查是否需要单位
    const key = camelize(name)
    if (typeof value === 'number' && !unitlessProperties.has(key)) {
        return `${value}px`
    }

    return String(value)
}

/**
 * 设置单个样式属性
 * @param style style 对象
 * @param name 属性名
 * @param value 属性值
 */
function setStyleProperty(
    style: CSSStyleDeclaration,
    name: string,
    value: string | number | null | undefined
): void {
    if (value == null || value === '') {
        // 移除样式
        style.removeProperty(name)
    } else {
        // 设置样式
        const normalized = normalizeStyleValue(name, value)
        style.setProperty(name, normalized)
    }
}

/**
 * 规范化 style 值为对象形式
 * @param value style 值
 */
export function normalizeStyle(value: StyleValue): StyleObject {
    if (value == null) {
        return {}
    }

    if (isString(value)) {
        return parseStyleString(value)
    }

    if (isObject(value)) {
        return value as StyleObject
    }

    return {}
}

/**
 * 解析 style 字符串为对象
 * @param styleString style 字符串
 */
function parseStyleString(styleString: string): StyleObject {
    const result: StyleObject = {}
    const styles = styleString.split(';')

    for (let i = 0; i < styles.length; i++) {
        const style = styles[i].trim()
        if (style) {
            const colonIndex = style.indexOf(':')
            if (colonIndex > 0) {
                const name = style.slice(0, colonIndex).trim()
                const value = style.slice(colonIndex + 1).trim()
                if (name && value) {
                    result[camelize(name)] = value
                }
            }
        }
    }

    return result
}

/**
 * 处理 style 属性
 * @param el 元素
 * @param value 新的 style 值
 * @param prevValue 旧的 style 值
 */
export function patchStyle(
    el: Element,
    value: StyleValue,
    prevValue: StyleValue
): void {
    if (!el) {
        warn('patchStyle: 元素不能为空')
        return
    }

    const style = (el as HTMLElement).style

    if (!style) {
        // 非 HTMLElement，尝试设置 style 属性
        if (value != null && isString(value)) {
            el.setAttribute('style', value)
        } else if (value != null && isObject(value)) {
            const styleStr = objectToStyleString(value as StyleObject)
            el.setAttribute('style', styleStr)
        }
        return
    }

    // 处理新值
    if (value == null) {
        // 清空所有样式
        if (isString(prevValue)) {
            style.cssText = ''
        } else if (isObject(prevValue)) {
            // 移除旧的样式属性
            for (const key in prevValue as StyleObject) {
                style.removeProperty(hyphenate(key))
            }
        }
        return
    }

    if (isString(value)) {
        // 字符串形式：直接设置 cssText
        style.cssText = value
        return
    }

    // 对象形式：增量更新
    const newStyle = value as StyleObject
    const oldStyle = isObject(prevValue) ? (prevValue as StyleObject) : {}

    // 移除旧的样式
    for (const key in oldStyle) {
        if (!hasOwn(newStyle, key)) {
            style.removeProperty(hyphenate(key))
        }
    }

    // 设置新的样式
    for (const key in newStyle) {
        const newValue = newStyle[key]
        const oldValue = oldStyle[key]
        if (newValue !== oldValue) {
            setStyleProperty(style, hyphenate(key), newValue)
        }
    }
}

/**
 * 将样式对象转换为字符串
 * @param style 样式对象
 */
function objectToStyleString(style: StyleObject): string {
    const parts: string[] = []
    for (const key in style) {
        const value = style[key]
        if (value != null && value !== '') {
            parts.push(`${hyphenate(key)}: ${normalizeStyleValue(key, value)}`)
        }
    }
    return parts.join('; ')
}