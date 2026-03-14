/**
 * fluxion
 * 主入口包 - 提供完整的 Fluxion API
 */

// ==================== 响应式 API ====================
export {
    // Signal
    signal,
    asyncSignal,

    // Reactive
    reactive,
    readonly,

    // Computed
    computed,

    // Effect
    effect,
    stop,

    // Watch
    watch,
    watchEffect
} from '@fluxion/reactivity'

// 导出类型
export type {
    Signal,
    AsyncSignal,
    ReactiveObject,
    Effect,
    WatchOptions,
    ComputedOptions
} from '@fluxion/reactivity'

// ==================== 运行时 API ====================
// 从 runtime-dom 导出（包含 DOM 渲染器）
export {
    // 应用
    createApp,
    render,

    // VNode
    h,
    createVNode,
    createTextVNode,
    createCommentVNode,
    createEmptyVNode,
    cloneVNode,
    isVNode,

    // 调度器
    nextTick,
    queueJob,

    // DOM 操作（高级 API）
    nodeOps,
    patchProp,
    patchStyle,
    patchClass,
    patchEvent,
    patchAttr,
    patchDOMProp,

    // SVG
    createSVGElement,
    isSVGTag
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

// ==================== 编译器 API ====================
// 通常用户不需要直接使用编译器 API
// 但对于高级用例（如 SSR、自定义编译），我们提供导出
export {
    // NUI 编译器
    compile as compileNui,
    parse as parseNui,

    // Token 类型
    TokenType,
    NuiNodeTypes
} from '@fluxion/compiler-nui'

// 导出类型
export type {
    NuiParseResult,
    NuiCompileResult,
    NuiRootNode
} from '@fluxion/compiler-nui'

// ==================== 工具函数 ====================
export {
    warn,
    error,
    isString,
    isObject,
    isArray,
    isFunction,
    isPromise,
    hasOwn
} from '@fluxion/shared'