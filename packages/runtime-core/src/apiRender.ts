/**
 * render API
 * 直接渲染 VNode 到容器
 */

import { VNode } from './types'
import { warn, isString } from '@fluxion-ui/shared'

// 存储渲染器实例
let renderer: {
    render: (vnode: VNode | null, container: Element) => void
} | null = null

/**
 * 设置渲染器
 * 由 runtime-dom 调用
 */
export function setRenderer(r: typeof renderer): void {
    renderer = r
}

/**
 * 渲染 VNode
 * @param vnode 虚拟节点
 * @param container 容器元素
 */
export function render(vnode: VNode | null, container: Element | string): void {
    if (!renderer) {
        warn('render: 渲染器未初始化，请先调用 setRenderer')
        return
    }

    let containerEl: Element | null = null

    if (isString(container)) {
        containerEl = document.querySelector(container)
        if (!containerEl) {
            warn(`render: 找不到容器 "${container}"`)
            return
        }
    } else {
        containerEl = container
    }

    renderer.render(vnode, containerEl)
}