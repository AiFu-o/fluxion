# reactivity 响应式系统实现计划

## 概述

完成 reactivity 包的完整实现，包含 signal、computed、effect、watch、reactive、asyncSignal 等核心 API。

---

## 步骤 1：实现 shared 公共工具包

### 1.1 创建 shared 目录结构
```
packages/shared/src/
├── index.ts      # 统一导出
├── types.ts      # 公共类型定义
├── utils.ts      # 通用工具函数
└── warn.ts       # 警告信息函数
```

### 1.2 实现 shared/src/types.ts
```typescript
// 基础类型
export type AnyFunction = (...args: any[]) => any
export type AnyObject = Record<string, any>

// 选项类型
export interface Options {
    deep?: boolean
    immediate?: boolean
    flush?: 'pre' | 'post' | 'sync'
}
```

### 1.3 实现 shared/src/utils.ts
```typescript
export function isFunction(value: any): value is Function
export function isObject(value: any): value is object
export function isArray(value: any): value is Array<any>
export function isPromise(value: any): value is Promise<any>
export function isString(value: any): value is string
export function hasOwn(obj: object, key: string | symbol): boolean
```

### 1.4 实现 shared/src/warn.ts
```typescript
export function warn(message: string, ...args: any[]): void
export function error(message: string, ...args: any[]): void
```

---

## 步骤 2：实现 reactivity 包基础结构

### 2.1 创建 reactivity 目录结构
```
packages/reactivity/src/
├── index.ts                      # 统一导出
├── reactivity.ts                 # 核心实现
├── api/
│   ├── signal.ts                 # signal 实现
│   ├── computed.ts               # computed 实现
│   ├── effect.ts                 # effect 实现
│   ├── watch.ts                  # watch 实现
│   ├── reactive.ts               # reactive 实现
│   └── async.ts                  # asyncSignal 实现
└── types.ts                      # 类型定义
```

### 2.2 实现 reactivity/src/types.ts
```typescript
// Signal 类型
export type SignalGetter<T> = (() => T) & {
    set: (value: T | ((prev: T) => T)) => void
}
export interface Signal<T> extends Function {
    (): T
    set: (value: T | ((prev: T) => T)) => void
}

// Computed 类型
export interface Computed<T> extends Function {
    (): T
}

// Effect 类型
export type EffectRunner = () => void
export interface Effect {
    (): void
    stop: () => void
}

// Watch 回调
export type WatchCallback<T> = (newValue: T, oldValue: T, cleanup?: () => void) => void
export type WatchSource<T> = () => T

// Reactive
export type ReactiveTarget<T> = T extends object ? T : never
```

---

## 步骤 3：实现 signal 基础信号

### 3.1 实现 packages/reactivity/src/api/signal.ts

**功能**：
- 创建一个可订阅的值
- 支持读取和设置
- 支持函数形式设置（类似 Vue3）

**核心实现**：
```typescript
export function signal<T>(value: T): Signal<T> {
    const subscribers = new Set<() => void>()

    const getter = () => {
        // TODO: 收集当前 effect
        return value
    }

    getter.set = (newValue: T | ((prev: T) => T)) => {
        const resolved = typeof newValue === 'function'
            ? (newValue as (prev: T) => T)(value)
            : newValue
        if (Object.is(resolved, value)) return
        value = resolved
        subscribers.forEach(fn => fn())
    }

    return Object.assign(getter, { set: getter.set })
}
```

**导出**：`signal`

### 3.2 实现 Signals 集合（可选）
```typescript
export class Signals<T extends Record<string, any>> {
    constructor(initial: T) {
        // 将对象转换为 signal 集合
    }
}
```

---

## 步骤 4：实现 effect 副作用系统

### 4.1 实现 packages/reactivity/src/api/effect.ts

**功能**：
- 自动追踪依赖
- 依赖变化时自动重新执行

**核心实现**：
```typescript
// 全局变量
let currentEffect: (() => void) | null = null
let effects: Set<() => void>[] = []
const STACK: (() => void)[] = []

export function effect(fn: () => void): Effect {
    const effectFn = () => {
        cleanup()
        currentEffect = effectFn
        STACK.push(effectFn)
        fn()
        STACK.pop()
        currentEffect = STACK.length > 0 ? STACK[STACK.length - 1] : null
    }

    const cleanup = () => {
        // 清理逻辑
    }

    effectFn.stop = () => {
        cleanup()
        effects.forEach(set => set.delete(effectFn))
    }

    effectFn()
    return effectFn
}

export function stop(effect: Effect): void {
    effect.stop()
}
```

**导出**：`effect`, `stop`

---

## 步骤 5：实现 computed 计算属性

### 5.1 实现 packages/reactivity/src/api/computed.ts

**功能**：
- 根据依赖自动计算值
- 缓存结果，依赖不变不重算

**核心实现**：
```typescript
export function computed<T>(getter: () => T): Computed<T> {
    let value: T
    let dirty = true

    const computed = (() => {
        if (dirty) {
            value = getter()
            dirty = false
        }
        return value
    }) as Computed<T>

    return computed
}
```

**导出**：`computed`

---

## 步骤 6：实现 reactive 响应式对象

### 6.1 实现 packages/reactivity/src/api/reactive.ts

**功能**：
- 深层响应式代理
- 支持 readonly
- 支持 isReactive 检查

**核心实现**：
```typescript
const reactiveMap = new WeakMap<object, any>()
const readonlyMap = new WeakMap<object, any>()

export function reactive<T extends object>(target: T): T {
    if (isReadonly(target)) return target
    return createReactive(target, false)
}

function createReactive(target: object, readonly: boolean): any {
    const existingProxy = reactiveMap.get(target)
    if (existingProxy) return existingProxy

    const proxy = new Proxy(target, {
        get(target, key, receiver) {
            // 收集依赖
            const result = Reflect.get(target, key, receiver)
            if (readonly) {
                return result
            }
            // 追踪依赖
            return result
        },
        set(target, key, value, receiver) {
            const oldValue = Reflect.get(target, key, receiver)
            const result = Reflect.set(target, key, value, receiver)
            if (result && !Object.is(value, oldValue)) {
                // 触发更新
            }
            return result
        }
    })

    reactiveMap.set(target, proxy)
    return proxy
}

export function readonly<T extends object>(target: T): Readonly<T> {
    return createReactive(target, true)
}

export function isReactive(value: any): boolean
export function isReadonly(value: any): boolean
export function isProxy(value: any): boolean
```

**导出**：`reactive`, `readonly`, `isReactive`, `isReadonly`, `isProxy`

---

## 步骤 7：实现 watch 监听器

### 7.1 实现 packages/reactivity/src/api/watch.ts

**功能**：
- 监听 signal 或 computed 变化
- 支持 immediate 选项
- 支持 deep 选项

**核心实现**：
```typescript
export function watch<T>(
    source: WatchSource<T>,
    callback: WatchCallback<T>,
    options?: { immediate?: boolean; deep?: boolean }
): () => void {
    let oldValue = undefined

    const runner = () => {
        const newValue = source()
        if (options?.deep || !Object.is(newValue, oldValue)) {
            callback(newValue, oldValue)
            oldValue = newValue
        }
    }

    if (options?.immediate) {
        runner()
    }

    effect(runner)

    return () => {
        stop(runner as Effect)
    }
}
```

**导出**：`watch`

---

## 步骤 8：实现 asyncSignal 异步信号

### 8.1 实现 packages/reactivity/src/api/async.ts

**功能**：
- 支持异步数据获取
- 自动处理 loading 状态
- 支持 Promise

**核心实现**：
```typescript
export interface AsyncSignal<T> extends Signal<T> {
    loading: Signal<boolean>
    error: Signal<Error | null>
    reload: () => void
}

export function asyncSignal<T>(
    fetcher: () => Promise<T>,
    initialValue?: T
): AsyncSignal<T> {
    const data = signal<T | undefined>(initialValue)
    const loading = signal(true)
    const error = signal<Error | null>(null)

    const reload = async () => {
        loading.set(true)
        error.set(null)
        try {
            const result = await fetcher()
            data.set(result)
        } catch (e) {
            error.set(e as Error)
        } finally {
            loading.set(false)
        }
    }

    // 初始加载
    reload()

    const signalFn = ((...args: any[]) => {
        // 透传调用
        return data()
    }) as AsyncSignal<T>

    signalFn.loading = loading
    signalFn.error = error
    signalFn.reload = reload
    signalFn.set = data.set

    return signalFn
}
```

**导出**：`asyncSignal`

---

## 步骤 9：实现统一导出 index.ts

### 9.1 实现 packages/reactivity/src/index.ts

```typescript
// 导出所有 API
export { signal, type Signal } from './api/signal'
export { computed, type Computed } from './api/computed'
export { effect, stop, type Effect } from './api/effect'
export { watch } from './api/watch'
export { reactive, readonly, isReactive, isReadonly, isProxy } from './api/reactive'
export { asyncSignal, type AsyncSignal } from './api/async'
```

---

## 验证步骤

### 步骤 10：构建测试

```bash
npm run build
```

### 步骤 11：单元测试

创建测试文件：
- `packages/reactivity/__tests__/signal.test.ts`
- `packages/reactivity/__tests__/computed.test.ts`
- `packages/reactivity/__tests__/effect.test.ts`
- `packages/reactivity/__tests__/reactive.test.ts`
- `packages/reactivity/__tests__/async.test.ts`

---

## 文件清单

| 步骤 | 文件路径 | 状态 |
|------|----------|------|
| 1.1 | packages/shared/src/types.ts | 待创建 |
| 1.2 | packages/shared/src/utils.ts | 待创建 |
| 1.3 | packages/shared/src/warn.ts | 待创建 |
| 1.4 | packages/shared/src/index.ts | 待创建 |
| 2.1 | packages/reactivity/src/types.ts | 待创建 |
| 3.1 | packages/reactivity/src/api/signal.ts | 待创建 |
| 4.1 | packages/reactivity/src/api/effect.ts | 待创建 |
| 5.1 | packages/reactivity/src/api/computed.ts | 待创建 |
| 6.1 | packages/reactivity/src/api/reactive.ts | 待创建 |
| 7.1 | packages/reactivity/src/api/watch.ts | 待创建 |
| 8.1 | packages/reactivity/src/api/async.ts | 待创建 |
| 9.1 | packages/reactivity/src/index.ts | 待创建 |