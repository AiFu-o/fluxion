# runtime-core 平台无关运行时实现计划

## 概述

runtime-core 是 Fluxion 框架的核心运行时，提供平台无关的组件系统、虚拟节点（vnode）和渲染器抽象。它依赖 reactivity 包，并为 runtime-dom 提供基础能力。

---

## 一、目录结构

```
packages/runtime-core/src/
├── index.ts                    # 统一导出
├── types.ts                    # 类型定义
├── symbols.ts                  # 内部 Symbol 标记
│
├── vnode.ts                    # 虚拟节点
├── h.ts                        # h 函数（创建 vnode）
│
├── component.ts                # 组件实例
├── componentRenderUtils.ts     # 组件渲染工具
│
├── renderer.ts                 # 渲染器抽象
├── scheduler.ts                # 更新调度器
│
├── apiCreateApp.ts             # createApp API
├── apiRender.ts                # render API
├── apiEmit.ts                  # emit API
│
└── utils/
    └── normalize.ts            # 规范化工具函数
```

---

## 二、核心模块设计

### 2.1 types.ts - 类型定义

```typescript
import type { Signal, Effect } from '@fluxion/reactivity'

// ==================== VNode 类型 ====================

/**
 * VNode 类型标记
 */
export const enum ShapeFlags {
    ELEMENT = 1,           // HTML 元素
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

export type VNodeType = string | Component
export type VNodeProps = Record<string, any>
export type VNodeChildren = string | VNode[] | null

// ==================== Component 类型 ====================

/**
 * 组件定义
 */
export interface Component {
    name?: string
    setup?: (props: ComponentProps, ctx: ComponentContext) => VNode | (() => VNode)
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
    subTree: VNode | null

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
```

### 2.2 symbols.ts - 内部 Symbol

```typescript
/**
 * 内部使用的 Symbol 标记
 */
export const enum Symbols {
    VNode = '__v_isVNode',
    Component = '__v_isComponent',
    Slots = '__v_isSlots'
}
```

---

### 2.3 vnode.ts - 虚拟节点

**职责**：
- 创建 VNode 对象
- 规范化 children
- 提供类型判断函数

**核心 API**：

```typescript
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
): VNode

/**
 * 克隆 VNode
 */
export function cloneVNode(vnode: VNode): VNode

/**
 * 判断是否为 VNode
 */
export function isVNode(value: any): value is VNode

/**
 * 规范化 VNode children
 */
export function normalizeVNode(children: unknown): VNodeChildren
```

**实现要点**：
1. 根据 type 判断是元素还是组件
2. 设置正确的 shapeFlag
3. 规范化 children（字符串、数组、null）

---

### 2.4 h.ts - 创建 VNode 的便捷函数

**职责**：
- 提供 h() 函数作为 createVNode 的便捷包装
- 支持多种参数签名

**API 签名**：

```typescript
// h('div')
export function h(type: string): VNode

// h('div', { id: 'app' })
export function h(type: string, props: VNodeProps): VNode

// h('div', 'hello')
export function h(type: string, children: VNodeChildren): VNode

// h('div', { id: 'app' }, 'hello')
export function h(type: string, props: VNodeProps, children: VNodeChildren): VNode

// h(Component)
export function h(type: Component): VNode

// h(Component, { name: 'test' })
export function h(type: Component, props: VNodeProps): VNode

// h(Component, { name: 'test' }, slots)
export function h(type: Component, props: VNodeProps, children: VNodeChildren): VNode
```

**实现要点**：
- 重载函数签名
- 自动推断参数类型
- 调用 createVNode

---

### 2.5 component.ts - 组件实例

**职责**：
- 创建组件实例
- 处理 props
- 设置组件副作用

**核心 API**：

```typescript
/**
 * 创建组件实例
 * @param vnode 组件 VNode
 */
export function createComponentInstance(vnode: VNode): ComponentInstance

/**
 * 设置组件
 * @param instance 组件实例
 */
export function setupComponent(instance: ComponentInstance): void

/**
 * 处理 props
 */
export function initProps(instance: ComponentInstance, rawProps: VNodeProps | null): void

/**
 * 处理插槽
 */
export function initSlots(instance: ComponentInstance, children: VNodeChildren): void
```

**实现要点**：
1. 创建实例对象，初始化所有属性
2. 调用 setup 函数获取 render
3. 使用 effect 包裹渲染函数
4. 处理 props 响应式

---

### 2.6 componentRenderUtils.ts - 组件渲染工具

**职责**：
- 渲染组件
- 处理子树

**核心 API**：

```typescript
/**
 * 渲染组件根节点
 */
export function renderComponentRoot(instance: ComponentInstance): VNode

/**
 * 处理组件渲染
 */
export function handleSetupResult(instance: ComponentInstance, result: VNode | (() => VNode)): void
```

---

### 2.7 renderer.ts - 渲染器抽象

**职责**：
- 定义平台无关的渲染逻辑
- 实现 diff 算法
- 处理挂载和更新

**核心 API**：

```typescript
/**
 * 创建渲染器
 * @param options 平台特定操作
 */
export function createRenderer(options: RendererOptions): Renderer
```

**核心流程**：

```
render(vnode, container)
    │
    ├─ prevVNode === null
    │      │
    │      └─ mount(vnode, container)
    │
    └─ prevVNode !== null
           │
           └─ patch(prevVNode, vnode, container)
```

**patch 流程**：

```
patch(n1, n2, container)
    │
    ├─ type 相同
    │      │
    │      ├─ ELEMENT → patchElement(n1, n2)
    │      │
    │      └─ COMPONENT → patchComponent(n1, n2)
    │
    └─ type 不同
           │
           └─ unmount(n1) → mount(n2)
```

**实现要点**：
1. 使用闭包保存 options
2. 实现 patch、mount、unmount 核心函数
3. 实现元素属性 diff
4. 实现子节点 diff（简单实现：全量替换，后续优化 key-based diff）

---

### 2.8 scheduler.ts - 更新调度器

**职责**：
- 批量更新
- 任务队列
- nextTick

**核心 API**：

```typescript
/**
 * 队列任务
 */
export function queueJob(job: () => void): void

/**
 * 队列刷新
 */
export function flushJobs(): void

/**
 * nextTick
 */
export function nextTick(fn?: () => void): Promise<void>
```

**实现要点**：
1. 使用 Set 去重任务
2. 使用 Promise 微任务刷新
3. 支持嵌套更新

---

### 2.9 apiCreateApp.ts - createApp API

**职责**：
- 创建应用实例
- 提供 mount/unmount 方法

**核心 API**：

```typescript
/**
 * 创建应用
 * @param rootComponent 根组件
 */
export function createApp(rootComponent: Component): App
```

**实现要点**：
1. 返回 App 对象
2. mount 时创建根组件 VNode 并渲染
3. 保存应用实例用于卸载

---

### 2.10 apiRender.ts - render API

**职责**：
- 直接渲染 VNode 到容器

**核心 API**：

```typescript
/**
 * 渲染 VNode
 * @param vnode 虚拟节点
 * @param container 容器元素
 */
export function render(vnode: VNode | null, container: Element): void
```

---

### 2.11 apiEmit.ts - emit API

**职责**：
- 组件事件触发

**核心 API**：

```typescript
/**
 * 创建 emit 函数
 * @param instance 组件实例
 * @param eventMap 事件定义
 */
export function createEmit(instance: ComponentInstance, eventMap?: string[]): EmitFunction

/**
 * emit 函数
 * @param instance 组件实例
 * @param event 事件名
 * @param args 参数
 */
export function emit(instance: ComponentInstance, event: string, ...args: any[]): void
```

**编译配合**：
```nui
emit("update", payload)
```
编译为：
```typescript
emit(instance, "update", payload)
```

---

### 2.12 utils/normalize.ts - 规范化工具

**职责**：
- 规范化 props
- 规范化 children

**核心 API**：

```typescript
/**
 * 规范化事件名
 * @param name 原始事件名 (如 onClick)
 */
export function normalizeEventName(name: string): string

/**
 * 规范化 children
 */
export function normalizeChildren(vnode: VNode, children: unknown): void
```

---

## 三、模块依赖关系

```
                   apiCreateApp.ts
                         │
                         ▼
                    renderer.ts ◄─────── apiRender.ts
                         │
           ┌─────────────┼─────────────┐
           ▼             ▼             ▼
      component.ts   vnode.ts     scheduler.ts
           │             │
           ▼             ▼
   componentRenderUtils  h.ts
           │
           ▼
      reactivity (Signal, Effect)
```

---

## 四、实现步骤

### 步骤 1：基础类型和工具

| 序号 | 文件 | 说明 |
|------|------|------|
| 1.1 | symbols.ts | Symbol 标记 |
| 1.2 | types.ts | 类型定义 |
| 1.3 | utils/normalize.ts | 规范化工具 |

### 步骤 2：VNode 核心

| 序号 | 文件 | 说明 |
|------|------|------|
| 2.1 | vnode.ts | VNode 创建和判断 |
| 2.2 | h.ts | h 函数 |

### 步骤 3：组件系统

| 序号 | 文件 | 说明 |
|------|------|------|
| 3.1 | component.ts | 组件实例创建 |
| 3.2 | componentRenderUtils.ts | 组件渲染工具 |

### 步骤 4：渲染器

| 序号 | 文件 | 说明 |
|------|------|------|
| 4.1 | scheduler.ts | 更新调度器 |
| 4.2 | renderer.ts | 渲染器核心 |

### 步骤 5：应用 API

| 序号 | 文件 | 说明 |
|------|------|------|
| 5.1 | apiEmit.ts | emit API |
| 5.2 | apiRender.ts | render API |
| 5.3 | apiCreateApp.ts | createApp API |

### 步骤 6：统一导出

| 序号 | 文件 | 说明 |
|------|------|------|
| 6.1 | index.ts | 统一导出 |

---

## 五、测试计划

### 测试文件结构

```
packages/runtime-core/__tests__/
├── vnode.test.ts           # VNode 创建测试
├── h.test.ts               # h 函数测试
├── component.test.ts       # 组件实例测试
├── renderer.test.ts        # 渲染器测试
├── scheduler.test.ts       # 调度器测试
├── apiCreateApp.test.ts    # createApp 测试
├── apiRender.test.ts       # render API
└── apiEmit.test.ts         # emit 测试
```

### 测试要点

**vnode.test.ts**：
- 创建元素 VNode
- 创建组件 VNode
- 判断 VNode 类型
- children 规范化

**h.test.ts**：
- 各种参数签名
- 元素创建
- 组件创建

**component.test.ts**：
- 创建组件实例
- props 处理
- setup 执行
- 响应式更新

**renderer.test.ts**：
- 元素挂载
- 元素更新
- 组件挂载
- 组件更新
- 卸载

**scheduler.test.ts**：
- 任务队列
- 批量更新
- nextTick

---

## 六、注意事项

### 6.1 平台无关性
- renderer.ts 不直接操作 DOM
- 所有 DOM 操作通过 RendererOptions 接口
- 方便后续扩展到其他平台（如 Canvas、Native）

### 6.2 与 reactivity 的配合
- 组件渲染使用 effect 包裹
- 自动追踪依赖
- 数据变化自动触发更新

### 6.3 错误处理
- 每个函数需要完整的错误捕获
- 使用 warn 函数输出警告
- setup 执行错误需要捕获并提示

### 6.4 性能考虑
- 使用 ShapeFlags 进行位运算判断
- 批量更新减少渲染次数
- 后续可添加 key-based diff 优化

---

## 七、导出清单

```typescript
// runtime-core/src/index.ts

// VNode
export { createVNode, cloneVNode, isVNode } from './vnode'
export type { VNode, VNodeType, VNodeProps, VNodeChildren } from './types'

// h 函数
export { h } from './h'

// 组件
export { createComponentInstance, setupComponent } from './component'
export type { Component, ComponentInstance, ComponentProps, ComponentContext } from './types'

// 渲染器
export { createRenderer } from './renderer'
export type { RendererOptions, Renderer } from './types'

// 应用 API
export { createApp } from './apiCreateApp'
export { render } from './apiRender'
export { emit } from './apiEmit'
export type { App, Plugin, EmitFunction } from './types'

// 调度器
export { nextTick, queueJob } from './scheduler'

// 内部导出（供 runtime-dom 使用）
export { ShapeFlags } from './types'
```

---

## 八、后续优化方向

1. **Diff 算法优化**：实现 key-based diff（双端比较或最长递增子序列）
2. **异步组件**：支持 defineAsyncComponent
3. **Teleport**：传送门组件
4. **Suspense**：异步依赖处理
5. **KeepAlive**：组件缓存
6. **SSR 支持**：服务端渲染