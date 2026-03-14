/**
 * @fluxion-ui/runtime-dom
 * DOM 平台的渲染器实现
 */

// ==================== 渲染器 API ====================
export { render, createApp } from './renderer'

// ==================== nodeOps ====================
export {
    nodeOps,
    createElement,
    createText,
    createComment,
    insert,
    remove,
    setElementText,
    setText,
    parentNode,
    nextSibling,
    getTagName
} from './nodeOps'

// ==================== patchProp ====================
export {
    patchProp,
    patchEvent,
    isEventKey,
    normalizeEventName,
    patchDOMProp,
    isDOMProp,
    patchClass,
    normalizeClass,
    patchStyle,
    normalizeStyle,
    hyphenate,
    camelize,
    patchAttr,
    isBooleanAttr,
    isSpecialAttr
} from './patchProp'

// ==================== SVG 支持 ====================
export {
    SVG_NAMESPACE,
    XLINK_NAMESPACE,
    XML_NAMESPACE,
    isSVGTag,
    createSVGElement,
    isXlinkAttr,
    isXMLAttr,
    setSVGAttr,
    getSVGNamespace,
    isInSVG
} from './modules/svg'

// ==================== reactivity 重导出 ====================
// .nui 文件编译后需要从 fluxion-runtime 导入 signal 等 API
export {
    signal,
    asyncSignal,
    computed,
    watch,
    watchEffect,
    reactive,
    effect
} from '@fluxion-ui/reactivity'

export type {
    Signal,
    Computed,
    Effect
} from '@fluxion-ui/reactivity'

// ==================== runtime-core 重导出 ====================
// 为了方便使用，重导出 runtime-core 的常用 API
export {
    h,
    createVNode,
    createTextVNode,
    createCommentVNode,
    createEmptyVNode,
    cloneVNode,
    isVNode,
    isElementVNode,
    isComponentVNode
} from '@fluxion-ui/runtime-core'

export type {
    VNode,
    VNodeType,
    VNodeProps,
    VNodeChildren,
    Component,
    ComponentInstance,
    ComponentProps
} from '@fluxion-ui/runtime-core'