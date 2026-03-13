/**
 * runtime-core 统一导出
 * 提供平台无关的组件系统、虚拟节点和渲染器抽象
 */

// ==================== VNode ====================
export {
    createVNode,
    createTextVNode,
    createCommentVNode,
    createEmptyVNode,
    cloneVNode,
    isVNode,
    isElementVNode,
    isComponentVNode,
    isTextChildren,
    isArrayChildren,
    isSlotsChildren
} from './vnode'
export type { VNode, VNodeType, VNodeProps, VNodeChildren } from './types'

// ==================== h 函数 ====================
export { h } from './h'

// ==================== 组件 ====================
export {
    createComponentInstance,
    setupComponent,
    initProps,
    initSlots,
    getCurrentInstance,
    setCurrentInstance,
    invokeLifecycleHook,
    registerLifecycleHook
} from './component'
export type {
    Component,
    ComponentInstance,
    ComponentProps,
    ComponentContext,
    ComponentPropsOptions,
    PropOption,
    Slots,
    SlotFunction,
    LifecycleHook
} from './types'

// ==================== 渲染器 ====================
export { createRenderer } from './renderer'
export type { RendererOptions, Renderer } from './types'

// ==================== 应用 API ====================
export { createApp, AppImpl, setRenderer as setAppRenderer } from './apiCreateApp'
export { render, setRenderer as setRenderRenderer } from './apiRender'
export { emit, createEmit } from './apiEmit'
export type { App, Plugin, EmitFunction } from './types'

// ==================== 调度器 ====================
export { nextTick, queueJob, flushJobs, clearQueue, getQueueStatus } from './scheduler'
export type { SchedulerJob } from './types'

// ==================== 内部导出 ====================
// 供 runtime-dom 使用
export { ShapeFlags } from './types'
export {
    VNODE_SYMBOL,
    COMPONENT_SYMBOL,
    SLOTS_SYMBOL,
    isVNode as checkVNode,
    isComponentInstance,
    isSlots
} from './symbols'

// ==================== 工具函数 ====================
export {
    normalizeEventName,
    normalizeChildren,
    normalizeVNode,
    normalizePropsOptions
} from './utils/normalize'

// ==================== 组件渲染工具 ====================
export { renderComponentRoot, handleSetupResult } from './componentRenderUtils'