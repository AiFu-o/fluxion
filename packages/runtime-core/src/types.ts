/**
 * runtime-core 核心类型定义
 */

import type { Effect } from '@fluxion-ui/reactivity'

// ==================== VNode 类型 ====================

/**
 * VNode 类型标记（位运算）
 */
export const enum ShapeFlags {
    ELEMENT = 1,            // HTML 元素
    STATEFUL_COMPONENT = 2, // 有状态组件
    TEXT_CHILDREN = 16,     // 子节点为文本
    ARRAY_CHILDREN = 32,    // 子节点为数组
    SLOTS_CHILDREN = 64     // 子节点为插槽
}

/**
 * 虚拟节点
 */
export interface VNode {
    __v_isVNode: true
    type: VNodeType
    props: VNodeProps | null
    children: VNodeChildren
    shapeFlag: number

    // 组件相关
    component: ComponentInstance | null

    // DOM 相关（由 renderer 填充）
    el: Element | null
    anchor: Element | null

    // 用于 diff
    key: string | number | null
    patchFlag: number
}

export type VNodeType = string | Component | symbol
export type VNodeProps = Record<string, any>
export type VNodeChildren = string | VNode[] | null

// ==================== Component 类型 ====================

/**
 * 组件定义
 */
export interface Component {
    name?: string
    setup?: (props: ComponentProps, ctx: ComponentContext) => VNode | (() => VNode) | void
    render?: () => VNode
    props?: ComponentPropsOptions
    emits?: string[]
}

/**
 * 组件 Props 选项
 */
export interface ComponentPropsOptions {
    [key: string]: PropOption
}

export type PropOption = {
    type: any
    required?: boolean
    default?: any
} | Function

/**
 * 组件 Props
 */
export type ComponentProps = Record<string, any>

/**
 * 组件上下文
 */
export interface ComponentContext {
    emit: EmitFunction
    attrs: Record<string, any>
    slots: Slots
}

/**
 * 组件实例
 */
export interface ComponentInstance {
    // 标识
    uid: number
    type: Component
    __v_isComponent: true

    // VNode
    vnode: VNode
    subTree: VNode | null

    // Props
    props: ComponentProps
    attrs: Record<string, any>

    // 状态
    isMounted: boolean

    // 渲染
    render: (() => VNode) | null

    // 副作用
    effect: Effect | null

    // 生命周期
    bm: LifecycleHook[] | null   // beforeMount
    m: LifecycleHook[] | null    // mounted
    bu: LifecycleHook[] | null   // beforeUpdate
    u: LifecycleHook[] | null    // updated
    um: LifecycleHook[] | null   // unmounted

    // 插槽
    slots: Slots
}

// ==================== Renderer 类型 ====================

/**
 * 渲染器选项（由 runtime-dom 实现）
 */
export interface RendererOptions {
    // 元素操作
    createElement(tag: string): Element
    createText(text: string): Text
    createComment(text: string): Comment

    // 插入操作
    insert(child: Node, parent: Node, anchor?: Node | null): void
    remove(child: Node): void

    // 属性操作
    setElementText(el: Element, text: string): void
    patchProp(el: Element, key: string, value: any, prevValue: any): void

    // 查询操作
    parentNode(node: Node): Node | null
    nextSibling(node: Node): Node | null

    // 文本操作
    setText(node: Text, text: string): void
}

/**
 * 渲染器
 */
export interface Renderer {
    render(vnode: VNode | null, container: Element): void
    createApp(rootComponent: Component): App
}

// ==================== App 类型 ====================

/**
 * 应用实例
 */
export interface App {
    mount(container: Element | string): void
    unmount(): void
    component(name: string, component: Component): App
    use(plugin: Plugin, options?: any): App
}

export interface Plugin {
    install(app: App, options?: any): void
}

// ==================== 其他类型 ====================

export type EmitFunction = (event: string, ...args: any[]) => void
export type LifecycleHook = () => void

export interface Slots {
    [name: string]: SlotFunction
}

export type SlotFunction = (props?: any) => VNode[]

// ==================== 调度器类型 ====================

/**
 * 任务队列项
 */
export interface SchedulerJob {
    (): void
    id?: number
    allowRecurse?: boolean
}