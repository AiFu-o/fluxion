/**
 * 内部使用的 Symbol 标记
 * 用于标识 VNode、组件实例等内部对象
 */

/**
 * VNode 标记
 */
export const VNODE_SYMBOL = Symbol.for('__v_isVNode')

/**
 * 组件实例标记
 */
export const COMPONENT_SYMBOL = Symbol.for('__v_isComponent')

/**
 * 插槽标记
 */
export const SLOTS_SYMBOL = Symbol.for('__v_isSlots')

/**
 * 判断是否为 VNode
 */
export function isVNode(value: unknown): boolean {
    return value ? (value as any).__v_isVNode === true : false
}

/**
 * 判断是否为组件实例
 */
export function isComponentInstance(value: unknown): boolean {
    return value ? (value as any).__v_isComponent === true : false
}

/**
 * 判断是否为插槽
 */
export function isSlots(value: unknown): boolean {
    return value ? (value as any).__v_isSlots === true : false
}