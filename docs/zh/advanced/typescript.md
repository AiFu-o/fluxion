# TypeScript 支持

本章节介绍 Fluxion 的 TypeScript 支持和类型定义。

## 概述

Fluxion 使用 TypeScript 编写，提供了完整的类型定义，支持：

- 完整的类型推断
- 组件 Props 类型检查
- Signal 类型安全
- 事件类型推断

---

## 安装类型定义

Fluxion 包含内置类型定义，无需额外安装：

```bash
npm install @fluxion-ui/fluxion
# 或
pnpm add @fluxion-ui/fluxion
```

---

## 基本类型

### Signal 类型

```typescript
import { signal, Signal } from '@fluxion-ui/fluxion'

// 类型自动推断
const count = signal(0)              // Signal<number>
const name = signal('Fluxion')       // Signal<string>
const isActive = signal(true)        // Signal<boolean>
const items = signal([1, 2, 3])      // Signal<number[]>

// 显式类型标注
const user = signal<User | null>(null)
const data = signal<Record<string, unknown>>({})

// 读取值
const value: number = count()        // 类型推断为 number

// 设置值
count.set(10)                        // 参数类型为 number
count.update(n => n + 1)             // 回调参数类型为 number
```

### Computed 类型

```typescript
import { computed, Computed } from '@fluxion-ui/fluxion'

// 类型自动推断
const double = computed(() => count() * 2)  // Computed<number>
const message = computed(() => `Hello, ${name()}`)  // Computed<string>

// 显式类型标注
const formattedUser = computed<User>(() => {
    return {
        id: userId(),
        name: userName(),
        email: userEmail()
    }
})
```

### Reactive 类型

```typescript
import { reactive, isReactive, toRaw } from '@fluxion-ui/fluxion'

interface User {
    name: string
    age: number
    profile?: {
        bio: string
        avatar: string
    }
}

// 创建响应式对象
const user = reactive<User>({
    name: 'John',
    age: 30
})

// 类型保留
user.name = 'Jane'    // string
user.age = 31         // number

// 使用 toRaw 获取原始类型
const rawUser: User = toRaw(user)
```

### AsyncSignal 类型

```typescript
import { asyncSignal, AsyncSignal } from '@fluxion-ui/fluxion'

interface ApiResponse {
    data: User[]
    total: number
}

// 创建异步信号
const users = asyncSignal<ApiResponse>(() =>
    fetch('/api/users').then(r => r.json())
)

// 类型安全访问
if (users.loading()) {
    console.log('Loading...')
}

const data: ApiResponse | undefined = users()
const error: Error | null = users.error()
```

---

## 组件类型

### 组件定义

```typescript
import { Component, ComponentContext, VNode } from '@fluxion-ui/fluxion'

interface MyComponentProps {
    title: string
    count: number
    onIncrement?: () => void
}

const MyComponent: Component<MyComponentProps> = {
    props: {
        title: String,
        count: Number,
        onIncrement: Function
    },

    setup(props: MyComponentProps, context: ComponentContext) {
        // props 有完整类型推断
        console.log(props.title)     // string
        console.log(props.count)     // number

        return () => {
            // 返回 VNode
        }
    }
}
```

### Props 类型定义

```typescript
import { PropOption } from '@fluxion-ui/fluxion'

// 定义 Props 选项
const propsOptions = {
    // 基本类型
    name: String as PropOption<string>,
    age: Number as PropOption<number>,
    isActive: Boolean as PropOption<boolean>,

    // 数组类型
    items: Array as PropOption<string[]>,
    users: Array as PropOption<User[]>,

    // 对象类型
    config: Object as PropOption<Config>,

    // 可选属性
    title: { type: String, required: false } as PropOption<string | undefined>,

    // 带默认值
    count: { type: Number, default: 0 } as PropOption<number>
}
```

### Emits 类型

```typescript
interface Emits {
    (e: 'change', value: string): void
    (e: 'submit', data: FormData): void
    (e: 'update:modelValue', value: number): void
}

const MyComponent = {
    emits: ['change', 'submit', 'update:modelValue'] as const,

    setup(props: any, context: ComponentContext<Emits>) {
        // 类型安全的 emit
        context.emit('change', 'new value')    // ✓ 正确
        context.emit('submit', new FormData()) // ✓ 正确
        context.emit('update:modelValue', 10)  // ✓ 正确

        // 类型错误
        // context.emit('change', 123)          // ✗ 参数类型错误
        // context.emit('unknown')              // ✗ 未知事件
    }
}
```

---

## 生命周期类型

```typescript
import {
    onBeforeMount,
    onMounted,
    onBeforeUpdate,
    onUpdated,
    onUnmounted
} from '@fluxion-ui/fluxion'

const MyComponent = {
    setup() {
        // 所有生命周期钩子都接受无参数的回调
        onBeforeMount(() => {
            console.log('Before mount')
        })

        onMounted(() => {
            console.log('Mounted')
        })

        onBeforeUpdate(() => {
            console.log('Before update')
        })

        onUpdated(() => {
            console.log('Updated')
        })

        onUnmounted(() => {
            console.log('Unmounted')
        })
    }
}
```

---

## VNode 类型

```typescript
import {
    h,
    VNode,
    VNodeProps,
    createVNode
} from '@fluxion-ui/fluxion'

// h 函数自动推断类型
const div: VNode = h('div')                         // 元素 VNode
const text: VNode = h('p', 'Hello')                 // 带文本
const withProps: VNode = h('div', { class: 'foo' }) // 带属性

// 组件 VNode
const component: VNode = h(MyComponent, {
    title: 'Hello',
    count: 10
})

// 属性类型
const props: VNodeProps = {
    class: 'container',
    style: { color: 'red' },
    onClick: (e: Event) => console.log(e)
}
```

---

## Watch 类型

```typescript
import { watch, watchEffect, WatchCallback, WatchSource } from '@fluxion-ui/fluxion'

// watch 自动推断类型
const count = signal(0)

// source 类型为 () => number
// callback 的 newValue 和 oldValue 都推断为 number
const stop = watch(
    () => count(),
    (newValue, oldValue) => {
        console.log(newValue)  // number
        console.log(oldValue)  // number | undefined
    }
)

// 监听多个源
const name = signal('John')

watch(
    [() => count(), () => name()],
    ([newCount, newName], [oldCount, oldName]) => {
        console.log(newCount, newName)  // [number, string]
    }
)

// watchEffect
const dispose = watchEffect(() => {
    console.log(count())  // 自动追踪
})
```

---

## Effect 类型

```typescript
import { effect, Effect } from '@fluxion-ui/fluxion'

// 创建 effect
const dispose: Effect = effect(() => {
    console.log('Effect running')

    // 可选的清理函数
    return () => {
        console.log('Cleanup')
    }
})

// 停止 effect
dispose.stop()
```

---

## 泛型工具

### 创建泛型组件

```typescript
import { Component, signal, Signal } from '@fluxion-ui/fluxion'

// 泛型列表组件
interface ListProps<T> {
    items: Signal<T[]>
    renderItem: (item: T, index: number) => VNode
}

function createListComponent<T>(): Component<ListProps<T>> {
    return {
        props: {
            items: Object,
            renderItem: Function
        },

        setup(props: ListProps<T>) {
            return () => {
                return h('ul', {},
                    props.items().map((item, index) =>
                        props.renderItem(item, index)
                    )
                )
            }
        }
    }
}

// 使用
const NumberList = createListComponent<number>()
const UserList = createListComponent<User>()
```

### 泛型工具函数

```typescript
import { Signal, computed } from '@fluxion-ui/fluxion'

// 泛型选择器
function createSelector<T, R>(
    source: Signal<T>,
    selector: (value: T) => R
): Signal<R> {
    return computed(() => selector(source()))
}

// 使用
interface State {
    user: { name: string }
    settings: { theme: string }
}

const state = signal<State>({
    user: { name: 'John' },
    settings: { theme: 'dark' }
})

const userName = createSelector(state, s => s.user.name)  // Signal<string>
const theme = createSelector(state, s => s.settings.theme) // Signal<string>
```

---

## 类型声明文件

### 项目类型声明

```typescript
// types/fluxion.d.ts
declare module '@fluxion-ui/fluxion' {
    // 扩展组件类型
    interface ComponentCustomProperties {
        $router?: Router
        $store?: Store
    }

    // 扩展 VNode 类型
    interface VNodeCustomData {
        myCustomData?: any
    }
}
```

### .nui 文件声明

```typescript
// types/nui.d.ts
declare module '*.nui' {
    import { Component } from '@fluxion-ui/fluxion'
    const component: Component
    export default component
}
```

---

## 类型检查配置

### tsconfig.json

```json
{
    "compilerOptions": {
        "target": "ES2020",
        "module": "ESNext",
        "moduleResolution": "bundler",
        "strict": true,
        "jsx": "react-jsx",
        "jsxImportSource": "@fluxion-ui/fluxion",
        "types": ["@fluxion-ui/fluxion"]
    },
    "include": [
        "src/**/*",
        "types/**/*"
    ]
}
```

---

## 最佳实践

### 1. 使用严格模式

```json
{
    "compilerOptions": {
        "strict": true,
        "noImplicitAny": true,
        "strictNullChecks": true
    }
}
```

### 2. 定义清晰的接口

```typescript
// 好的做法：定义清晰的接口
interface User {
    id: number
    name: string
    email: string
}

interface UserComponentProps {
    user: User
    onUpdate: (user: User) => void
}

// 避免：使用 any
const user = signal<any>({})  // 失去类型安全
```

### 3. 使用类型守卫

```typescript
function isUser(value: unknown): value is User {
    return typeof value === 'object' &&
        value !== null &&
        'id' in value &&
        'name' in value &&
        'email' in value
}

const data = signal<unknown>(fetchResult)

if (isUser(data())) {
    console.log(data().name)  // 类型安全
}
```

### 4. 利用类型推断

```typescript
// 让 TypeScript 推断类型
const count = signal(0)
const double = computed(() => count() * 2)  // 自动推断为 Computed<number>

// 只在必要时显式标注
const users = asyncSignal<User[]>(() => fetchUsers())
```

---

## 下一步

- [自定义渲染器](custom-renderer.md) - 创建自定义渲染器
- [编译器扩展](compiler-extension.md) - 扩展编译器功能
- [性能优化](performance.md) - 优化应用性能