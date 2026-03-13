/**
 * DOM 属性处理
 * 处理需要直接设置到 DOM 对象的属性（不能使用 setAttribute）
 */

import { warn, isString } from '@fluxion/shared'

/**
 * 需要直接设置的 DOM 属性列表
 * 这些属性不能通过 setAttribute 设置，必须直接赋值
 */
const DOM_PROP_KEYS = new Set([
    'value',
    'checked',
    'selected',
    'muted',
    'innerHTML',
    'textContent',
    'className',
    // 表单相关
    'indeterminate',
    'defaultChecked',
    'defaultValue',
    // 其他布尔属性
    'disabled',
    'readOnly',
    'required',
    'multiple',
    'autofocus',
    'autoplay',
    'controls',
    'loop',
    'playsinline',
    'default',
    'open',
    'contentEditable',
    'spellcheck'
])

/**
 * 判断是否为 DOM 属性
 * @param key 属性名
 */
export function isDOMProp(key: string): boolean {
    return DOM_PROP_KEYS.has(key)
}

/**
 * 处理 DOM 属性
 * @param el 元素
 * @param key 属性名
 * @param value 新值
 * @param prevValue 旧值
 */
export function patchDOMProp(
    el: Element & Record<string, any>,
    key: string,
    value: any,
    prevValue: any
): void {
    if (!el) {
        warn('patchDOMProp: 元素不能为空')
        return
    }

    switch (key) {
        case 'value': {
            // value 特殊处理
            const tagName = el.tagName?.toLowerCase()
            if (tagName === 'input' || tagName === 'textarea' || tagName === 'select') {
                // 表单元素：设置 value
                const newValue = value ?? ''
                if (el.value !== newValue) {
                    el.value = newValue
                }
            } else {
                // 其他元素：直接设置
                el.value = value ?? ''
            }
            break
        }

        case 'innerHTML': {
            // innerHTML 特殊处理
            if (value == null) {
                el.innerHTML = ''
            } else {
                el.innerHTML = value
            }
            break
        }

        case 'textContent': {
            // textContent 特殊处理
            if (value == null) {
                el.textContent = ''
            } else {
                el.textContent = value
            }
            break
        }

        case 'className': {
            // className 特殊处理（兼容 SVG）
            if (value == null) {
                el.className = ''
            } else if (isString(value)) {
                el.className = value
            } else {
                warn('patchDOMProp: className 应该是字符串')
            }
            break
        }

        case 'checked':
        case 'selected':
        case 'muted':
        case 'disabled':
        case 'readOnly':
        case 'required':
        case 'multiple':
        case 'autofocus':
        case 'autoplay':
        case 'controls':
        case 'loop':
        case 'playsinline':
        case 'default':
        case 'open':
        case 'indeterminate': {
            // 布尔属性
            if (value == null || value === false) {
                el[key] = false
            } else {
                el[key] = true
            }
            break
        }

        case 'contentEditable':
        case 'spellcheck': {
            // 字符串/布尔混合属性
            if (value == null) {
                el[key] = null
            } else {
                el[key] = value
            }
            break
        }

        default: {
            // 其他 DOM 属性直接设置
            if (key in el) {
                el[key] = value
            } else {
                warn(`patchDOMProp: 未知的 DOM 属性 ${key}`)
            }
        }
    }
}