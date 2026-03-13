/**
 * DOM 渲染器
 * 组合 nodeOps 和 patchProp，创建平台渲染器
 */

import {
    createRenderer,
    setAppRenderer,
    setRenderRenderer
} from '@fluxion/runtime-core'
import { nodeOps } from './nodeOps'
import { patchProp } from './patchProp'
import { isSVGTag, createSVGElement } from './modules/svg'
import type { RendererOptions } from '@fluxion/runtime-core'

/**
 * 扩展的渲染器选项
 * 支持 SVG 元素创建
 */
const rendererOptions: RendererOptions = {
    ...nodeOps,
    patchProp,

    /**
     * 重写 createElement 以支持 SVG
     * @param tag 标签名
     */
    createElement(tag: string): Element {
        // 检查是否为 SVG 标签
        if (isSVGTag(tag)) {
            return createSVGElement(tag)
        }
        return nodeOps.createElement(tag)
    }
}

// 创建渲染器
const renderer = createRenderer(rendererOptions)

// 获取 render 和 createApp
const { render, createApp } = renderer

// 注入渲染器到 runtime-core
setAppRenderer({ createApp })
setRenderRenderer({ render })

// 导出渲染器 API
export { render, createApp }