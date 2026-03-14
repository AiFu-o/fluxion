/**
 * patchProp 分发入口
 * 根据属性类型分发到对应的处理函数
 */

import { patchEvent, isEventKey } from './patchEvent'
import { patchDOMProp, isDOMProp } from './patchDOMProp'
import { patchClass } from './patchClass'
import { patchStyle } from './patchStyle'
import { patchAttr } from './patchAttr'
import { warn } from '@fluxion-ui/shared'

/**
 * 处理元素属性
 * 按优先级分发到对应的处理函数：
 * 1. 事件 (onClick 等) → patchEvent
 * 2. DOM 属性 (value, checked 等) → patchDOMProp
 * 3. class → patchClass
 * 4. style → patchStyle
 * 5. HTML 属性 → patchAttr
 *
 * @param el 元素
 * @param key 属性名
 * @param value 新值
 * @param prevValue 旧值
 */
export function patchProp(
    el: Element,
    key: string,
    value: any,
    prevValue: any
): void {
    if (!el) {
        warn('patchProp: 元素不能为空')
        return
    }

    if (!key) {
        warn('patchProp: 属性名不能为空')
        return
    }

    // 1. 事件处理
    if (isEventKey(key)) {
        patchEvent(el as any, key, value, prevValue)
        return
    }

    // 2. DOM 属性处理
    if (isDOMProp(key)) {
        patchDOMProp(el as any, key, value, prevValue)
        return
    }

    // 3. class 处理
    if (key === 'class') {
        patchClass(el, value, prevValue)
        return
    }

    // 4. style 处理
    if (key === 'style') {
        patchStyle(el, value, prevValue)
        return
    }

    // 5. HTML 属性处理
    patchAttr(el, key, value, prevValue)
}

// 导出各个子模块
export { patchEvent, isEventKey, normalizeEventName } from './patchEvent'
export { patchDOMProp, isDOMProp } from './patchDOMProp'
export { patchClass, normalizeClass } from './patchClass'
export { patchStyle, normalizeStyle, hyphenate, camelize } from './patchStyle'
export { patchAttr, isBooleanAttr, isSpecialAttr } from './patchAttr'