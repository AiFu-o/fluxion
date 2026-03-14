# Runtime API Reference

This section details the complete API of Fluxion's runtime system.

## Imports

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

## Application API

### createApp()

Creates an application instance.

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

**Parameters**

| Parameter | Type | Description |
|------|------|------|
| rootComponent | Component | Root component definition |

**Returns**

Returns an application instance.

**Example**

```javascript
import { createApp, signal, h } from '@fluxion-ui/fluxion'

// Define root component
const App = {
    setup() {
        const count = signal(0)

        return () => h('div', [
            h('p', `Count: ${count()}`),
            h('button', { onClick: () => count.set(c => c + 1) }, 'Increment')
        ])
    }
}

// Create and mount application
createApp(App).mount('#app')
```

### app.mount()

Mounts the application to a DOM container.

```typescript
app.mount(container: Element | string): void
```

**Parameters**

| Parameter | Type | Description |
|------|------|------|
| container | Element \| string | DOM element or selector |

**Example**

```javascript
const app = createApp(App)

// Using selector
app.mount('#app')

// Using DOM element
app.mount(document.getElementById('app'))
```

### app.unmount()

Unmounts the application.

```typescript
app.unmount(): void
```

### app.component()

Registers or retrieves global components.

```typescript
app.component(name: string, component?: Component): App
```

**Example**

```javascript
const app = createApp(App)

// Register global components
app.component('MyButton', ButtonComponent)
app.component('MyInput', InputComponent)

// Get registered component
const MyButton = app.component('MyButton')
```

### app.use()

Installs a plugin.

```typescript
app.use(plugin: Plugin, options?: any): App

interface Plugin {
    install(app: App, options?: any): void
}
```

**Example**

```javascript
// Define plugin
const myPlugin = {
    install(app, options) {
        // Register global component
        app.component('GlobalComponent', {})

        // Provide global property
        app.config.globalProperties.$myPlugin = options
    }
}

// Install plugin
app.use(myPlugin, { someOption: true })
```

---

## VNode API

### createVNode()

Creates a virtual node.

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

**Parameters**

| Parameter | Type | Description |
|------|------|------|
| type | VNodeType | Element tag or component |
| props | VNodeProps | Property object |
| children | VNodeChildren | Child nodes |

**Returns**

Returns a VNode object.

**Example**

```javascript
import { createVNode } from '@fluxion-ui/fluxion'

// Create element VNode
const divVNode = createVNode('div', { id: 'app' }, 'Hello')

// Create component VNode
const componentVNode = createVNode(MyComponent, { name: 'test' })
```

### createTextVNode()

Creates a text VNode.

```typescript
function createTextVNode(text?: string): VNode
```

**Example**

```javascript
const textVNode = createTextVNode('Hello World')
```

### createCommentVNode()

Creates a comment VNode.

```typescript
function createCommentVNode(text?: string): VNode
```

**Example**

```javascript
const commentVNode = createCommentVNode('this is a comment')
```

### createEmptyVNode()

Creates an empty VNode.

```typescript
function createEmptyVNode(): VNode
```

### cloneVNode()

Clones a VNode.

```typescript
function cloneVNode(vnode: VNode): VNode
```

**Example**

```javascript
const original = createVNode('div', { class: 'container' }, 'Content')
const cloned = cloneVNode(original)
```

### isVNode()

Checks if a value is a VNode.

```typescript
function isVNode(value: unknown): value is VNode
```

### isElementVNode()

Checks if a VNode is an element VNode.

```typescript
function isElementVNode(vnode: VNode): boolean
```

### isComponentVNode()

Checks if a VNode is a component VNode.

```typescript
function isComponentVNode(vnode: VNode): boolean
```

### isTextChildren()

Checks if children are text.

```typescript
function isTextChildren(vnode: VNode): boolean
```

### isArrayChildren()

Checks if children are an array.

```typescript
function isArrayChildren(vnode: VNode): boolean
```

### isSlotsChildren()

Checks if children are slots.

```typescript
function isSlotsChildren(vnode: VNode): boolean
```

---

## h Function

### h()

Convenience function for creating VNodes with multiple parameter signatures.

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

**Example**

```javascript
import { h } from '@fluxion-ui/fluxion'

// Simple element
h('div')

// With props
h('div', { id: 'app', class: 'container' })

// With text child
h('p', 'Hello World')

// With multiple children
h('ul', [
    h('li', 'Item 1'),
    h('li', 'Item 2'),
    h('li', 'Item 3')
])

// With props and children
h('div', { class: 'wrapper' }, [
    h('h1', 'Title'),
    h('p', 'Content')
])

// Component
h(MyComponent, { name: 'test' })

// Component with slots
h(MyComponent, null, {
    default: () => h('p', 'Slot content')
})
```

---

## Render API

### render()

Renders a VNode to a container.

```typescript
function render(vnode: VNode | null, container: Element): void
```

**Parameters**

| Parameter | Type | Description |
|------|------|------|
| vnode | VNode \| null | VNode to render, null means unmount |
| container | Element | DOM container |

**Example**

```javascript
import { h, render } from '@fluxion-ui/fluxion'

// Mount
const vnode = h('div', { id: 'app' }, 'Hello')
render(vnode, document.getElementById('root'))

// Update
const newVNode = h('div', { id: 'app' }, 'Updated')
render(newVNode, document.getElementById('root'))

// Unmount
render(null, document.getElementById('root'))
```

### createRenderer()

Creates a custom renderer.

```typescript
function createRenderer(options: RendererOptions): Renderer

interface RendererOptions {
    // Element operations
    createElement(tag: string): Element
    createText(text: string): Text
    createComment(text: string): Comment
    setText(node: Text, text: string): void
    setElementText(el: Element, text: string): void

    // DOM operations
    insert(el: Element, parent: Element, anchor?: Element | null): void
    remove(el: Element): void

    // Property operations
    patchProp(el: Element, key: string, value: any, oldValue: any): void

    // Queries
    parentNode(node: Node): Element | null
    nextSibling(node: Node): Element | null
}

interface Renderer {
    render(vnode: VNode | null, container: Element): void
    createApp(rootComponent: Component): App
}
```

**Example**

```javascript
import { createRenderer } from '@fluxion-ui/fluxion'

// Create custom renderer (e.g., Canvas renderer)
const canvasRenderer = createRenderer({
    createElement(tag) {
        // Create custom element
    },
    createText(text) {
        // Create text node
    },
    insert(el, parent, anchor) {
        // Insert node
    },
    remove(el) {
        // Remove node
    },
    patchProp(el, key, value, oldValue) {
        // Update property
    },
    // ...other methods
})

// Use custom renderer
const app = canvasRenderer.createApp(MyComponent)
app.mount(canvasElement)
```

---

## Scheduler API

### nextTick()

Executes a callback after the next DOM update cycle.

```typescript
function nextTick(fn?: () => void): Promise<void>
```

**Parameters**

| Parameter | Type | Description |
|------|------|------|
| fn | () => void | Optional callback function |

**Returns**

Returns a Promise that can be used with async/await.

**Example**

```javascript
import { signal, nextTick } from '@fluxion-ui/fluxion'

const count = signal(0)

// Using callback
count.set(1)
nextTick(() => {
    console.log('DOM updated')
})

// Using Promise
count.set(2)
await nextTick()
console.log('DOM updated')

// Using async/await
async function updateAndCheck() {
    count.set(3)
    await nextTick()
    // DOM is updated, safe to read
    console.log(document.getElementById('count').textContent)
}
```

### queueJob()

Adds a job to the queue.

```typescript
function queueJob(job: SchedulerJob): void

interface SchedulerJob {
    (): void
    id?: number
}
```

**Example**

```javascript
import { queueJob } from '@fluxion-ui/fluxion'

// Add update job
queueJob(() => {
    console.log('Executing update')
})
```

### flushJobs()

Flushes the queue and executes all pending jobs.

```typescript
function flushJobs(): void
```

### clearQueue()

Clears the job queue.

```typescript
function clearQueue(): void
```

### getQueueStatus()

Gets the queue status (for debugging).

```typescript
function getQueueStatus(): {
    length: number
    isFlushing: boolean
    isFlushPending: boolean
}
```

---

## Component API

### createComponentInstance()

Creates a component instance.

```typescript
function createComponentInstance(vnode: VNode): ComponentInstance
```

### setupComponent()

Sets up a component (executes setup function).

```typescript
function setupComponent(instance: ComponentInstance): void
```

### getCurrentInstance()

Gets the current component instance.

```typescript
function getCurrentInstance(): ComponentInstance | null
```

**Example**

```javascript
import { getCurrentInstance } from '@fluxion-ui/fluxion'

const MyComponent = {
    setup() {
        const instance = getCurrentInstance()

        // Access component properties
        console.log(instance.props)
        console.log(instance.emit)

        return () => h('div', 'My Component')
    }
}
```

### setCurrentInstance()

Sets the current component instance (internal use).

```typescript
function setCurrentInstance(instance: ComponentInstance | null): void
```

### initProps()

Initializes component props.

```typescript
function initProps(instance: ComponentInstance, rawProps?: VNodeProps): void
```

### initSlots()

Initializes component slots.

```typescript
function initSlots(instance: ComponentInstance, children?: VNodeChildren): void
```

---

## Lifecycle API

### registerLifecycleHook()

Registers a lifecycle hook.

```typescript
function registerLifecycleHook(
    instance: ComponentInstance,
    hook: LifecycleHook,
    fn: () => void
): void
```

### invokeLifecycleHook()

Invokes a lifecycle hook.

```typescript
function invokeLifecycleHook(hook: (() => void)[] | undefined): void
```

---

## Events API

### emit()

Emits a component event.

```typescript
function emit(
    instance: ComponentInstance,
    event: string,
    ...args: any[]
): void
```

**Example**

```javascript
import { emit } from '@fluxion-ui/fluxion'

// Emit event inside component
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

Creates an emit function.

```typescript
function createEmit(
    instance: ComponentInstance,
    eventMap?: string[]
): EmitFunction
```

---

## Type Definitions

```typescript
// VNode type
type VNodeType = string | Component

// VNode properties
interface VNodeProps {
    [key: string]: any
    key?: string | number
    ref?: Ref | string
    class?: string | object | Array<string | object>
    style?: string | object
    on[eventName]?: Function
}

// VNode children
type VNodeChildren = string | VNode[] | Slots

// Component instance
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
    // Lifecycle hooks
    bm: (() => void)[] | undefined  // beforeMount
    m: (() => void)[] | undefined   // mounted
    bu: (() => void)[] | undefined  // beforeUpdate
    u: (() => void)[] | undefined   // updated
    um: (() => void)[] | undefined  // unmounted
}

// Component context
interface ComponentContext {
    attrs: any
    slots: Slots
    emit: EmitFunction
    expose?: (exposed?: Record<string, any>) => void
}

// Slots
interface Slots {
    [name: string]: SlotFunction
}

type SlotFunction = (props?: any) => VNode[]

// Emit function
interface EmitFunction {
    (event: string, ...args: any[]): void
}
```

---

## Next Steps

- [Reactivity API](reactivity-api.md) - Reactivity system APIs
- [Compiler API](compiler-api.md) - Compilation and transform APIs
- [Utils API](utils-api.md) - Utility helper functions