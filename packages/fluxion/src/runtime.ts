/**
 * fluxion/runtime
 * 运行时入口 - 仅包含运行时代码，不包含编译器
 * 用于生产环境，包体积更小
 */

// ==================== 响应式 API ====================
export {
    signal,
    asyncSignal,
    reactive,
    readonly,
    computed,
    effect,
    stop,
    watch,
    watchEffect
} from '@fluxion/reactivity'

// ==================== 运行时 API ====================
export {
    createApp,
    render,
    h,
    createVNode,
    createTextVNode,
    createCommentVNode,
    createEmptyVNode,
    cloneVNode,
    isVNode,
    nextTick,
    queueJob
} from '@fluxion/runtime-dom'

// 导出类型
export type {
    VNode,
    VNodeType,
    VNodeProps,
    VNodeChildren,
    Component,
    ComponentInstance,
    ComponentProps,
    App
} from '@fluxion/runtime-core'