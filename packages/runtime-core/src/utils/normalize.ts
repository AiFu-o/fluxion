/**
 * 规范化工具函数
 * 用于规范化 props、children 等数据
 */

import type { VNode, VNodeChildren } from '../types'
import { ShapeFlags } from '../types'
import { isArray, isString } from '@fluxion/shared'

/**
 * 规范化事件名
 * 将 onClick 转换为 click
 * @param name 原始事件名 (如 onClick)
 */
export function normalizeEventName(name: string): string {
    // 处理 on 前缀
    if (name.startsWith('on')) {
        // 将 onClick 转换为 click
        const eventName = name.slice(2)
        // 首字母小写
        return eventName.charAt(0).toLowerCase() + eventName.slice(1)
    }
    return name
}

/**
 * 规范化 children
 * 设置正确的 shapeFlag
 */
export function normalizeChildren(vnode: VNode, children: unknown): void {
    let type = 0
    let normalizedChildren: VNodeChildren = null

    if (children == null) {
        type = 0
        normalizedChildren = null
    } else if (isArray(children)) {
        type = ShapeFlags.ARRAY_CHILDREN
        normalizedChildren = children as VNode[]
    } else if (typeof children === 'object') {
        // 插槽
        type = ShapeFlags.SLOTS_CHILDREN
        normalizedChildren = children as any
    } else if (isString(children)) {
        type = ShapeFlags.TEXT_CHILDREN
        normalizedChildren = children as string
    }

    vnode.children = normalizedChildren
    vnode.shapeFlag |= type
}

/**
 * 规范化 VNode
 * 将可能的值转换为 VNode
 */
export function normalizeVNode(child: VNode | string | number | null | undefined | any[]): VNode {
    // 如果已经是 VNode，直接返回
    if ((child as VNode)?.__v_isVNode) {
        return child as VNode
    }

    // null 或 undefined 返回空文本节点
    if (child == null) {
        return {
            __v_isVNode: true,
            type: Symbol.for('Text'),
            props: null,
            children: '',
            shapeFlag: 0,
            component: null,
            el: null,
            anchor: null,
            key: null,
            patchFlag: 0
        }
    }

    // 数组返回 Fragment（简化处理：创建包含数组的文本节点）
    if (isArray(child)) {
        return {
            __v_isVNode: true,
            type: Symbol.for('Fragment'),
            props: null,
            children: child as any[],
            shapeFlag: ShapeFlags.ARRAY_CHILDREN,
            component: null,
            el: null,
            anchor: null,
            key: null,
            patchFlag: 0
        } as VNode
    }

    // 将字符串和数字转换为文本 VNode
    return {
        __v_isVNode: true,
        type: Symbol.for('Text'),
        props: null,
        children: String(child),
        shapeFlag: 0,
        component: null,
        el: null,
        anchor: null,
        key: null,
        patchFlag: 0
    }
}

/**
 * 规范化 props 选项
 * 将数组形式转换为对象形式
 */
export function normalizePropsOptions(
    options: string[] | Record<string, any> | undefined
): Record<string, { type: any; required?: boolean; default?: any }> {
    if (!options) {
        return {}
    }

    if (isArray(options)) {
        const normalized: Record<string, { type: any; required?: boolean; default?: any }> = {}
        for (const key of options as string[]) {
            normalized[key] = { type: null }
        }
        return normalized
    }

    return options as Record<string, { type: any; required?: boolean; default?: any }>
}