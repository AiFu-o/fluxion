# 运行时 API 参考

本章节详细介绍 Fluxion 运行时系统的完整 API。

## 导入

```javascript
import {
  createApp,
  h,
  createVNode,
  render,
  nextTick
} from '@fluxion-ui/fluxion'
```

---

## 应用 API

### createApp()

创建应用实例。

```typescript
function createApp(rootComponent: Component): App

interface App {
    mount(container: Element | string): void
    unmount(): void
    component(name: string, component?: Component): App
    use(plugin: Plugin, options?: any): App
}

interface Component {
    setup?(props: any, context: ComponentContext): any
    render?(): VNode
    props?: ComponentPropsOptions
    emits?: string[]
}
```

**参数**

| 参数 | 类型 | 描述 |
|------|------|------|
| rootComponent | Component | 根组件定义 |

**返回值**

返回一个应用实例。

**示例**

```javascript
import { createApp, signal, h } from '@fluxion-ui/fluxion'

// 定义根组件
const App = {
    setup() {
        const count = signal(0)

        return () => h('div', [
            h('p', `Count: ${count()}`),
            h('button', { onClick: () => count.set(c => c + 1) }, 'Increment')
        ])
    }
}

// 创建并挂载应用
createApp(App).mount('#app')
```

### app.mount()

将应用挂载到 DOM 容器。

```typescript
app.mount(container: Element | string): void
```

**参数**

| 参数 | 类型 | 描述 |
|------|------|------|
| container | Element \| string | DOM 元素或选择器 |

**示例**

```javascript
const app = createApp(App)

// 使用选择器
app.mount('#app')

// 使用 DOM 元素
app.mount(document.getElementById('app'))
```

### app.unmount()

卸载应用。

```typescript
app.unmount(): void
```

### app.component()

注册或获取全局组件。

```typescript
app.component(name: string, component?: Component): App
```

**示例**

```javascript
const app = createApp(App)

// 注册全局组件
app.component('MyButton', ButtonComponent)
app.component('MyInput', InputComponent)

// 获取已注册的组件
const MyButton = app.component('MyButton')
```

### app.use()

安装插件。

```typescript
app.use(plugin: Plugin, options?: any): App

interface Plugin {
    install(app: App, options?: any): void
}
```

**示例**

```javascript
// 定义插件
const myPlugin = {
    install(app, options) {
        // 注册全局组件
        app.component('GlobalComponent', {})

        // 提供全局属性
        app.config.globalProperties.$myPlugin = options
    }
}

// 安装插件
app.use(myPlugin, { someOption: true })
```

---

## VNode API

### createVNode()

创建虚拟节点。

```typescript
function createVNode(
    type: VNodeType,
    props?: VNodeProps | null,
    children?: VNodeChildren
): VNode

type VNodeType = string | Component

interface VNode {
    __v_isVNode: true
    type: VNodeType
    props: VNodeProps | null
    children: VNodeChildren
    shapeFlag: number
    component: ComponentInstance | null
    el: Element | null
    key: string | number | null
    patchFlag: number
}
```

**参数**

| 参数 | 类型 | 描述 |
|------|------|------|
| type | VNodeType | 元素标签或组件 |
| props | VNodeProps | 属性对象 |
| children | VNodeChildren | 子节点 |

**返回值**

返回一个 VNode 对象。

**示例**

```javascript
import { createVNode } from '@fluxion-ui/fluxion'

// 创建元素 VNode
const divVNode = createVNode('div', { id: 'app' }, 'Hello')

// 创建组件 VNode
const componentVNode = createVNode(MyComponent, { name: 'test' })
```

### createTextVNode()

创建文本 VNode。

```typescript
function createTextVNode(text?: string): VNode
```

**示例**

```javascript
const textVNode = createTextVNode('Hello World')
```

### createCommentVNode()

创建注释 VNode。

```typescript
function createCommentVNode(text?: string): VNode
```

**示例**

```javascript
const commentVNode = createCommentVNode('this is a comment')
```

### createEmptyVNode()

创建空 VNode。

```typescript
function createEmptyVNode(): VNode
```

### cloneVNode()

克隆 VNode。

```typescript
function cloneVNode(vnode: VNode): VNode
```

**示例**

```javascript
const original = createVNode('div', { class: 'container' }, 'Content')
const cloned = cloneVNode(original)
```

### isVNode()

判断是否为 VNode。

```typescript
function isVNode(value: unknown): value is VNode
```

### isElementVNode()

判断是否为元素 VNode。

```typescript
function isElementVNode(vnode: VNode): boolean
```

### isComponentVNode()

判断是否为组件 VNode。

```typescript
function isComponentVNode(vnode: VNode): boolean
```

### isTextChildren()

判断 children 是否为文本。

```typescript
function isTextChildren(vnode: VNode): boolean
```

### isArrayChildren()

判断 children 是否为数组。

```typescript
function isArrayChildren(vnode: VNode): boolean
```

### isSlotsChildren()

判断 children 是否为插槽。

```typescript
function isSlotsChildren(vnode: VNode): boolean
```

---

## h 函数

### h()

创建 VNode 的便捷函数，支持多种参数签名。

```typescript
// h('div')
function h(type: string): VNode

// h('div', { id: 'app' })
function h(type: string, props: VNodeProps | null): VNode

// h('div', 'hello')
function h(type: string, children: VNodeChildren): VNode

// h('div', { id: 'app' }, 'hello')
function h(type: string, props: VNodeProps | null, children: VNodeChildren): VNode

// h(Component)
function h(type: Component): VNode

// h(Component, { name: 'test' })
function h(type: Component, props: VNodeProps | null): VNode
```

**示例**

```javascript
import { h } from '@fluxion-ui/fluxion'

// 简单元素
h('div')

// 带属性
h('div', { id: 'app', class: 'container' })

// 带文本子节点
h('p', 'Hello World')

// 带多个子节点
h('ul', [
    h('li', 'Item 1'),
    h('li', 'Item 2'),
    h('li', 'Item 3')
])

// 带属性和子节点
h('div', { class: 'wrapper' }, [
    h('h1', 'Title'),
    h('p', 'Content')
])

// 组件
h(MyComponent, { name: 'test' })

// 组件带插槽
h(MyComponent, null, {
    default: () => h('p', 'Slot content')
})
```

---

## 渲染 API

### render()

将 VNode 渲染到容器。

```typescript
function render(vnode: VNode | null, container: Element): void
```

**参数**

| 参数 | 类型 | 描述 |
|------|------|------|
| vnode | VNode \| null | 要渲染的 VNode，null 表示卸载 |
| container | Element | DOM 容器 |

**示例**

```javascript
import { h, render } from '@fluxion-ui/fluxion'

// 挂载
const vnode = h('div', { id: 'app' }, 'Hello')
render(vnode, document.getElementById('root'))

// 更新
const newVNode = h('div', { id: 'app' }, 'Updated')
render(newVNode, document.getElementById('root'))

// 卸载
render(null, document.getElementById('root'))
```

### createRenderer()

创建自定义渲染器。

```typescript
function createRenderer(options: RendererOptions): Renderer

interface RendererOptions {
    // 元素操作
    createElement(tag: string): Element
    createText(text: string): Text
    createComment(text: string): Comment
    setText(node: Text, text: string): void
    setElementText(el: Element, text: string): void

    // DOM 操作
    insert(el: Element, parent: Element, anchor?: Element | null): void
    remove(el: Element): void

    // 属性操作
    patchProp(el: Element, key: string, value: any, oldValue: any): void

    // 查询
    parentNode(node: Node): Element | null
    nextSibling(node: Node): Element | null
}

interface Renderer {
    render(vnode: VNode | null, container: Element): void
    createApp(rootComponent: Component): App
}
```

**示例**

```javascript
import { createRenderer } from '@fluxion-ui/fluxion'

// 创建自定义渲染器（例如 Canvas 渲染器）
const canvasRenderer = createRenderer({
    createElement(tag) {
        // 创建自定义元素
    },
    createText(text) {
        // 创建文本节点
    },
    insert(el, parent, anchor) {
        // 插入节点
    },
    remove(el) {
        // 移除节点
    },
    patchProp(el, key, value, oldValue) {
        // 更新属性
    },
    // ...其他方法
})

// 使用自定义渲染器
const app = canvasRenderer.createApp(MyComponent)
app.mount(canvasElement)
```

---

## 调度器 API

### nextTick()

在下一个 DOM 更新周期后执行回调。

```typescript
function nextTick(fn?: () => void): Promise<void>
```

**参数**

| 参数 | 类型 | 描述 |
|------|------|------|
| fn | () => void | 可选的回调函数 |

**返回值**

返回 Promise，可用于 async/await。

**示例**

```javascript
import { signal, nextTick } from '@fluxion-ui/fluxion'

const count = signal(0)

// 使用回调
count.set(1)
nextTick(() => {
    console.log('DOM 已更新')
})

// 使用 Promise
count.set(2)
await nextTick()
console.log('DOM 已更新')

// 使用 async/await
async function updateAndCheck() {
    count.set(3)
    await nextTick()
    // DOM 已更新，可以安全读取
    console.log(document.getElementById('count').textContent)
}
```

### queueJob()

将任务添加到队列。

```typescript
function queueJob(job: SchedulerJob): void

interface SchedulerJob {
    (): void
    id?: number
}
```

**示例**

```javascript
import { queueJob } from '@fluxion-ui/fluxion'

// 添加更新任务
queueJob(() => {
    console.log('执行更新')
})
```

### flushJobs()

刷新队列，执行所有待处理任务。

```typescript
function flushJobs(): void
```

### clearQueue()

清空任务队列。

```typescript
function clearQueue(): void
```

### getQueueStatus()

获取队列状态（用于调试）。

```typescript
function getQueueStatus(): {
    length: number
    isFlushing: boolean
    isFlushPending: boolean
}
```

---

## 组件 API

### createComponentInstance()

创建组件实例。

```typescript
function createComponentInstance(vnode: VNode): ComponentInstance
```

### setupComponent()

设置组件（执行 setup 函数）。

```typescript
function setupComponent(instance: ComponentInstance): void
```

### getCurrentInstance()

获取当前组件实例。

```typescript
function getCurrentInstance(): ComponentInstance | null
```

**示例**

```javascript
import { getCurrentInstance } from '@fluxion-ui/fluxion'

const MyComponent = {
    setup() {
        const instance = getCurrentInstance()

        // 访问组件属性
        console.log(instance.props)
        console.log(instance.emit)

        return () => h('div', 'My Component')
    }
}
```

### setCurrentInstance()

设置当前组件实例（内部使用）。

```typescript
function setCurrentInstance(instance: ComponentInstance | null): void
```

### initProps()

初始化组件 Props。

```typescript
function initProps(instance: ComponentInstance, rawProps?: VNodeProps): void
```

### initSlots()

初始化组件插槽。

```typescript
function initSlots(instance: ComponentInstance, children?: VNodeChildren): void
```

---

## 生命周期 API

### registerLifecycleHook()

注册生命周期钩子。

```typescript
function registerLifecycleHook(
    instance: ComponentInstance,
    hook: LifecycleHook,
    fn: () => void
): void
```

### invokeLifecycleHook()

调用生命周期钩子。

```typescript
function invokeLifecycleHook(hook: (() => void)[] | undefined): void
```

---

## 事件 API

### emit()

触发组件事件。

```typescript
function emit(
    instance: ComponentInstance,
    event: string,
    ...args: any[]
): void
```

**示例**

```javascript
import { emit } from '@fluxion-ui/fluxion'

// 在组件内部触发事件
const MyComponent = {
    emits: ['change', 'submit'],
    setup(props, { emit }) {
        const handleClick = () => {
            emit('change', newValue)
        }

        return () => h('button', { onClick: handleClick }, 'Click')
    }
}
```

### createEmit()

创建 emit 函数。

```typescript
function createEmit(
    instance: ComponentInstance,
    eventMap?: string[]
): EmitFunction
```

---

## 类型定义

```typescript
// VNode 类型
type VNodeType = string | Component

// VNode 属性
interface VNodeProps {
    [key: string]: any
    key?: string | number
    ref?: Ref | string
    class?: string | object | Array<string | object>
    style?: string | object
    on[eventName]?: Function
}

// VNode 子节点
type VNodeChildren = string | VNode[] | Slots

// 组件实例
interface ComponentInstance {
    vnode: VNode
    type: Component
    props: any
    attrs: any
    slots: Slots
    emit: EmitFunction
    isMounted: boolean
    subTree: VNode | null
    effect: Effect | null
    // 生命周期钩子
    bm: (() => void)[] | undefined  // beforeMount
    m: (() => void)[] | undefined   // mounted
    bu: (() => void)[] | undefined  // beforeUpdate
    u: (() => void)[] | undefined   // updated
    um: (() => void)[] | undefined  // unmounted
}

// 组件上下文
interface ComponentContext {
    attrs: any
    slots: Slots
    emit: EmitFunction
    expose?: (exposed?: Record<string, any>) => void
}

// 插槽
interface Slots {
    [name: string]: SlotFunction
}

type SlotFunction = (props?: any) => VNode[]

// 发射函数
interface EmitFunction {
    (event: string, ...args: any[]): void
}
```

---

## 下一步

- [响应式 API](reactivity-api.md) - 响应式系统 API
- [编译器 API](compiler-api.md) - 编译和转换 API
- [工具函数 API](utils-api.md) - 辅助工具函数