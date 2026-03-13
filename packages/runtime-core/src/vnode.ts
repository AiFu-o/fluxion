/**
 * VNode 虚拟节点
 * 用于描述 UI 结构的轻量级对象
 */

import { ShapeFlags, VNode, VNodeType, VNodeProps, VNodeChildren, Component } from './types'
import { VNODE_SYMBOL, isVNode as checkVNode } from './symbols'
import { normalizeChildren } from './utils/normalize'
import { isArray, isString, isFunction, isObject } from '@fluxion/shared'
import { warn } from '@fluxion/shared'

/**
 * 当前 VNode ID
 */
let vnodeId = 0

/**
 * 创建 VNode
 * @param type 元素标签或组件
 * @param props 属性对象
 * @param children 子节点
 */
export function createVNode(
    type: VNodeType,
    props?: VNodeProps | null,
    children?: VNodeChildren
): VNode {
    // 参数校验
    if (!type) {
        warn('createVNode: type 不能为空')
        return createEmptyVNode()
    }

    // 判断类型
    const shapeFlag = isString(type)
        ? ShapeFlags.ELEMENT
        : isComponent(type)
            ? ShapeFlags.STATEFUL_COMPONENT
            : 0

    // 创建 VNode
    const vnode: VNode = {
        __v_isVNode: true,
        type,
        props: props || null,
        children: null,
        shapeFlag,
        component: null,
        el: null,
        anchor: null,
        key: props?.key ?? null,
        patchFlag: 0
    }

    // 规范化 children
    if (children) {
        normalizeChildren(vnode, children)
    }

    return vnode
}

/**
 * 创建文本 VNode
 */
export function createTextVNode(text: string = ''): VNode {
    return {
        __v_isVNode: true,
        type: Symbol.for('Text'),
        props: null,
        children: text,
        shapeFlag: 0,
        component: null,
        el: null,
        anchor: null,
        key: null,
        patchFlag: 0
    }
}

/**
 * 创建注释 VNode
 */
export function createCommentVNode(text: string = ''): VNode {
    return {
        __v_isVNode: true,
        type: Symbol.for('Comment'),
        props: null,
        children: text,
        shapeFlag: 0,
        component: null,
        el: null,
        anchor: null,
        key: null,
        patchFlag: 0
    }
}

/**
 * 创建空 VNode
 */
export function createEmptyVNode(): VNode {
    return {
        __v_isVNode: true,
        type: Symbol.for('Empty'),
        props: null,
        children: null,
        shapeFlag: 0,
        component: null,
        el: null,
        anchor: null,
        key: null,
        patchFlag: 0
    }
}

/**
 * 克隆 VNode
 */
export function cloneVNode(vnode: VNode): VNode {
    if (!checkVNode(vnode)) {
        warn('cloneVNode: 参数必须是 VNode')
        return createEmptyVNode()
    }

    const cloned: VNode = {
        ...vnode,
        props: { ...vnode.props }
    }

    return cloned
}

/**
 * 判断是否为 VNode
 */
export function isVNode(value: unknown): value is VNode {
    return checkVNode(value)
}

/**
 * 判断是否为组件
 */
function isComponent(type: VNodeType): type is Component {
    return isFunction(type) || (isObject(type) && !isString(type))
}

/**
 * 判断是否为元素 VNode
 */
export function isElementVNode(vnode: VNode): boolean {
    return vnode.shapeFlag & ShapeFlags.ELEMENT
}

/**
 * 判断是否为组件 VNode
 */
export function isComponentVNode(vnode: VNode): boolean {
    return vnode.shapeFlag & ShapeFlags.STATEFUL_COMPONENT
}

/**
 * 判断 children 是否为文本
 */
export function isTextChildren(vnode: VNode): boolean {
    return vnode.shapeFlag & ShapeFlags.TEXT_CHILDREN
}

/**
 * 判断 children 是否为数组
 */
export function isArrayChildren(vnode: VNode): boolean {
    return vnode.shapeFlag & ShapeFlags.ARRAY_CHILDREN
}

/**
 * 判断 children 是否为插槽
 */
export function isSlotsChildren(vnode: VNode): boolean {
    return vnode.shapeFlag & ShapeFlags.SLOTS_CHILDREN
}