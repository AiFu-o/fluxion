/**
 * h 函数 - 创建 VNode 的便捷函数
 * 支持多种参数签名，简化 VNode 创建
 */

import { createVNode, isVNode, VNode } from './vnode'
import { VNodeType, VNodeProps, VNodeChildren, Component } from './types'
import { isArray, isString, isObject } from '@fluxion/shared'
import { warn } from '@fluxion/shared'

/**
 * h 函数重载签名
 */

// h('div')
export function h(type: string): VNode

// h('div', { id: 'app' })
export function h(type: string, props: VNodeProps | null): VNode

// h('div', 'hello')
export function h(type: string, children: VNodeChildren): VNode

// h('div', { id: 'app' }, 'hello')
export function h(
    type: string,
    props: VNodeProps | null,
    children: VNodeChildren
): VNode

// h(Component)
export function h(type: Component): VNode

// h(Component, { name: 'test' })
export function h(type: Component, props: VNodeProps | null): VNode

// h(Component, { name: 'test' }, slots)
export function h(
    type: Component,
    props: VNodeProps | null,
    children: VNodeChildren
): VNode

// 通用签名
export function h(
    type: VNodeType,
    propsOrChildren?: VNodeProps | VNodeChildren | null,
    children?: VNodeChildren
): VNode

/**
 * h 函数实现
 */
export function h(
    type: VNodeType,
    propsOrChildren?: VNodeProps | VNodeChildren | null,
    children?: VNodeChildren
): VNode {
    // 参数校验
    if (!type) {
        warn('h: type 不能为空')
        return createVNode(Symbol.for('Empty'))
    }

    const l = arguments.length

    // h(type)
    if (l === 1) {
        return createVNode(type)
    }

    // h(type, propsOrChildren)
    if (l === 2) {
        // 如果第二个参数是对象但不是数组，判断是 props 还是 children
        if (isObject(propsOrChildren) && !isArray(propsOrChildren)) {
            // 如果是 VNode 数组或者字符串，作为 children
            if (isVNode((propsOrChildren as any).__v_isVNode ? propsOrChildren : null)) {
                return createVNode(type, null, propsOrChildren as VNodeChildren)
            }
            // 否则作为 props
            return createVNode(type, propsOrChildren as VNodeProps)
        }
        // 数组或字符串作为 children
        return createVNode(type, null, propsOrChildren as VNodeChildren)
    }

    // h(type, props, children)
    if (l === 3) {
        // 如果 props 为 null 或对象
        if (propsOrChildren === null || isObject(propsOrChildren)) {
            return createVNode(type, propsOrChildren as VNodeProps, children)
        }
        // 否则 props 位置实际是 children
        warn('h: 当有 3 个参数时，第二个参数应该是 props 对象')
        return createVNode(type, null, propsOrChildren as VNodeChildren)
    }

    // h(type, props, child1, child2, ...)
    if (l > 3) {
        const childrenArray = Array.from(arguments).slice(2)
        return createVNode(type, propsOrChildren as VNodeProps, childrenArray as VNode[])
    }

    return createVNode(type)
}