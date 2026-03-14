# 响应式 API 参考

本章节详细介绍 Fluxion 响应式系统的完整 API。

## 导入

```javascript
import {
  signal,
  computed,
  effect,
  watch,
  reactive,
  asyncSignal
} from 'fluxion'
```

---

## Signal

### signal()

创建一个响应式信号。

```typescript
function signal<T>(value: T): Signal<T>

interface Signal<T> {
    (): T                              // 读取值
    set(value: T): void                // 设置值
    update(fn: (prev: T) => T): void   // 基于前值更新
}
```

**参数**

| 参数 | 类型 | 描述 |
|------|------|------|
| value | T | 初始值 |

**返回值**

返回一个 Signal 对象，可以像函数一样调用获取值。

**示例**

```nui
count = signal(0)
name = signal("Fluxion")

// 读取值
currentCount = count()

// 设置值
count.set(10)

// 基于前值更新
count.update(c => c + 1)
```

### readonlySignal()

创建一个只读信号。

```typescript
function readonlySignal<T>(value: T): () => T
```

**示例**

```nui
VERSION = readonlySignal("1.0.0")
MAX_COUNT = readonlySignal(100)

// 使用
p Version: {VERSION}

// 以下操作会报错
// VERSION.set("2.0.0")  // Error: readonly
```

### unsubscribe()

取消订阅 Signal 的副作用。

```typescript
function unsubscribe<T>(signal: Signal<T>, effect: () => void): void
```

---

## Computed

### computed()

创建计算属性，根据依赖自动计算并缓存结果。

```typescript
function computed<T>(getter: () => T): Computed<T>

interface Computed<T> {
    (): T           // 读取计算值
    stop(): void    // 停止追踪
}
```

**参数**

| 参数 | 类型 | 描述 |
|------|------|------|
| getter | () => T | 计算函数 |

**返回值**

返回一个 Computed 对象，调用时返回计算值。

**示例**

```nui
firstName = signal("John")
lastName = signal("Doe")

// 创建计算属性
fullName = computed(() => `${firstName()} ${lastName()}`)

// 使用
p Full Name: {fullName}

// 当 firstName 或 lastName 变化时，fullName 自动重新计算
```

### computedReadonly()

创建只读的计算属性（与 computed 行为相同）。

```typescript
function readonly<T>(getter: () => T): Computed<T>
```

### isCached()

检查 Computed 是否有缓存值。

```typescript
function isCached<T>(computed: Computed<T>): boolean
```

### refresh()

强制 Computed 重新计算。

```typescript
function refresh<T>(computed: Computed<T>): void
```

### computedSet()

创建多个相关计算属性的集合。

```typescript
function computedSet<T extends Record<string, () => any>>(
    getters: T
): { [K in keyof T]: ReturnType<T[K]> }
```

**示例**

```javascript
const stats = computedSet({
    double: () => count() * 2,
    triple: () => count() * 3,
    squared: () => count() * count()
})

// 使用
stats.double()  // count * 2
stats.triple()  // count * 3
stats.squared() // count^2
```

---

## Effect

### effect()

创建副作用，自动追踪依赖并响应变化。

```typescript
function effect(
    fn: () => void | (() => void),
    options?: { flush?: 'pre' | 'post' | 'sync' }
): Effect

interface Effect {
    (): void        // 执行副作用
    stop(): void    // 停止追踪
}
```

**参数**

| 参数 | 类型 | 描述 |
|------|------|------|
| fn | () => void \| (() => void) | 副作用函数，可返回清理函数 |
| options | object | 配置选项 |

**返回值**

返回一个 Effect 对象，可以停止追踪。

**示例**

```javascript
const count = signal(0)

// 创建副作用
const dispose = effect(() => {
    console.log('Count changed:', count())

    // 返回清理函数（可选）
    return () => {
        console.log('Cleanup before next run')
    }
})

// 停止副作用
dispose.stop()
```

### stop()

停止 Effect 追踪。

```typescript
function stop(effect: Effect): void
```

### effectPost()

创建一个只在 DOM 更新后执行的 effect。

```typescript
function effectPost(fn: () => void | (() => void)): Effect
```

### effectSync()

创建一个同步执行的 effect。

```typescript
function effectSync(fn: () => void | (() => void)): Effect
```

### pauseEffect() / resumeEffect()

暂停或恢复 Effect 执行。

```typescript
function pauseEffect(effect: Effect): void
function resumeEffect(effect: Effect): void
```

### runEffects()

批量执行多个 effects。

```typescript
function runEffects(effects: Effect[]): void
```

---

## Watch

### watch()

监听响应式数据变化。

```typescript
function watch<T>(
    source: WatchSource<T> | WatchSource<T>[],
    callback: WatchCallback<T> | ((values: T[], oldValues: T[]) => void),
    options?: WatchOptions
): () => void

type WatchSource<T> = () => T | Signal<T> | Reactive<T>

interface WatchOptions {
    immediate?: boolean    // 是否立即执行
    deep?: boolean         // 是否深度监听
    flush?: 'pre' | 'post' | 'sync'  // 调度时机
}

type WatchCallback<T> = (
    newValue: T,
    oldValue: T | undefined,
    cleanup?: () => void
) => void | (() => void)
```

**参数**

| 参数 | 类型 | 描述 |
|------|------|------|
| source | WatchSource \| WatchSource[] | 要监听的数据源 |
| callback | WatchCallback | 变化时的回调函数 |
| options | WatchOptions | 配置选项 |

**返回值**

返回一个停止监听的函数。

**示例**

```javascript
const count = signal(0)

// 监听单个数据源
const stopWatch = watch(
    () => count(),
    (newValue, oldValue) => {
        console.log(`Changed from ${oldValue} to ${newValue}`)
    }
)

// 停止监听
stopWatch()
```

**监听多个数据源**

```javascript
const firstName = signal("John")
const lastName = signal("Doe")

watch(
    [() => firstName(), () => lastName()],
    ([newFirst, newLast], [oldFirst, oldLast]) => {
        console.log(`Name changed: ${newFirst} ${newLast}`)
    }
)
```

### watchEffect()

自动追踪依赖并执行副作用。

```typescript
function watchEffect(
    callback: (cleanup?: () => void) => void,
    options?: WatchOptions
): () => void
```

**示例**

```javascript
const count = signal(0)

const stop = watchEffect(() => {
    console.log('Count is:', count())
    // 自动追踪 count
})
```

### watchDeep()

深度监听对象变化。

```typescript
function watchDeep<T extends object>(
    source: T,
    callback: (newValue: T, oldValue: T) => void
): () => void
```

**示例**

```javascript
const user = reactive({
    name: 'John',
    profile: {
        age: 30,
        city: 'NYC'
    }
})

watchDeep(user, (newValue, oldValue) => {
    console.log('User changed deeply')
})

// 以下变化都会触发
user.name = 'Jane'
user.profile.age = 31
```

### disposeAllWatches()

停止所有 watch 监听器。

```typescript
function disposeAllWatches(): void
```

---

## Reactive

### reactive()

创建深度响应式对象。

```typescript
function reactive<T extends object>(target: T): T
```

**参数**

| 参数 | 类型 | 描述 |
|------|------|------|
| target | T | 要转换为响应式的对象 |

**返回值**

返回一个响应式代理对象。

**示例**

```javascript
const user = reactive({
    name: 'John',
    age: 30,
    profile: {
        city: 'NYC'
    }
})

// 直接修改属性
user.name = 'Jane'
user.age++

// 嵌套对象也是响应式的
user.profile.city = 'LA'
```

### shallowReactive()

创建浅层响应式对象（只代理第一层）。

```typescript
function shallowReactive<T extends object>(target: T): T
```

**示例**

```javascript
const state = shallowReactive({
    count: 0,
    nested: {
        value: 1
    }
})

// 响应式
state.count++

// 非响应式（nested 不是响应式的）
state.nested.value = 2
```

### readonly()

创建只读响应式对象。

```typescript
function readonly<T extends object>(target: T): T
```

**示例**

```javascript
const original = reactive({ count: 0 })
const readonlyCopy = readonly(original)

// 可以读取
console.log(readonlyCopy.count)  // 0

// 无法修改（会发出警告）
readonlyCopy.count = 1  // Warn: target is readonly
```

### shallowReadonly()

创建浅层只读响应式对象。

```typescript
function shallowReadonly<T extends object>(target: T): T
```

### isReactive()

检查对象是否为响应式对象。

```typescript
function isReactive(value: unknown): boolean
```

### isReadonly()

检查对象是否为只读对象。

```typescript
function isReadonly(value: unknown): boolean
```

### isProxy()

检查对象是否为 Proxy 代理对象。

```typescript
function isProxy(value: unknown): boolean
```

### toRaw()

获取响应式对象的原始对象。

```typescript
function toRaw<T>(observed: T): T
```

**示例**

```javascript
const original = { count: 0 }
const reactiveCopy = reactive(original)

console.log(toRaw(reactiveCopy) === original)  // true
```

### toRef()

将响应式对象的属性转换为 ref。

```typescript
function toRef<T extends object, K extends keyof T>(
    object: T,
    key: K
): Ref<T[K]>
```

### toReactive()

将值转换为响应式（如果已经是对象）。

```typescript
function toReactive<T>(value: T): T
```

---

## AsyncSignal

### asyncSignal()

创建异步信号，支持异步数据获取和加载状态。

```typescript
function asyncSignal<T>(
    fetcher: () => Promise<T>,
    initialValue?: T
): AsyncSignal<T>

interface AsyncSignal<T> {
    (): T | undefined              // 获取数据
    loading: Signal<boolean>       // 加载状态
    error: Signal<Error | null>    // 错误状态
    reload: () => Promise<void>    // 重新加载
    set(value: T): void            // 设置值
    update(fn: (prev: T | undefined) => T | undefined): void
    cancel(): void                 // 取消请求
    isCancelled(): boolean         // 是否已取消
    abort(): void                  // 中止请求
    then(onfulfilled?, onrejected?): Promise<T>  // Promise 兼容
    catch(onrejected?): Promise<T>
    finally(onfinally?): Promise<T>
}
```

**参数**

| 参数 | 类型 | 描述 |
|------|------|------|
| fetcher | () => Promise\<T\> | 异步获取函数 |
| initialValue | T | 可选的初始值 |

**返回值**

返回一个 AsyncSignal 对象。

**示例**

```nui
// 创建异步信号
users = asyncSignal(() => fetch('/api/users').then(r => r.json()))

view
div
    if users.loading()
        p Loading...
    elif users.error()
        p Error: {users.error().message}
    else
        for user in users()
            p {user.name}
```

### asyncSignalSuspense()

创建 Suspense 风格的异步信号。

```typescript
function asyncSignalSuspense<T>(
    fetcher: () => Promise<T>,
    initialValue?: T
): AsyncSignal<T>
```

### lazyAsyncSignal()

延迟创建 AsyncSignal。

```typescript
function lazyAsyncSignal<T>(
    fetcher: () => Promise<T>,
    delay?: number
): () => AsyncSignal<T>
```

### cachedAsyncSignal()

创建带缓存的 AsyncSignal。

```typescript
function cachedAsyncSignal<T>(
    key: string,
    fetcher: () => Promise<T>
): AsyncSignal<T>
```

**示例**

```javascript
// 使用缓存键
const users = cachedAsyncSignal('users', () => fetchUsers())

// 再次调用相同键会返回缓存的信号
const sameUsers = cachedAsyncSignal('users', () => fetchUsers())
// users === sameUsers
```

### clearAsyncSignalCache()

清除 AsyncSignal 缓存。

```typescript
function clearAsyncSignalCache(): void
```

---

## 内部 API

以下 API 主要供框架内部使用，一般用户无需直接调用。

### Effect 状态管理

```typescript
// 获取/设置当前 effect
function getCurrentEffect(): Effect | null
function setCurrentEffect(effect: Effect | null): void

// Effect 栈操作
function getEffectStack(): Effect[]
function pushEffect(effect: Effect): void
function popEffect(): Effect | undefined

// 注册/注销
function registerEffect(effect: Effect): void
function unregisterEffect(effect: Effect): void
function getAllEffects(): Effect[]
```

### 全局 Effect 设置

```typescript
function setGlobalEffect(effect: (() => void) | null): void
function getGlobalEffect(): (() => void) | null
```

---

## 类型定义

```typescript
// Signal 类型
interface Signal<T> {
    (): T
    set(value: T | ((prev: T) => T)): void
    update(fn: (prev: T) => T): void
}

// Computed 类型
interface Computed<T> {
    (): T
    stop(): void
}

// Effect 类型
interface Effect extends Function {
    (): void
    stop: () => void
}

// AsyncSignal 类型
interface AsyncSignal<T> {
    (): T | undefined
    loading: Signal<boolean>
    error: Signal<Error | null>
    reload(): Promise<void>
    set(value: T): void
    update(fn: (prev: T | undefined) => T | undefined): void
    cancel(): void
    isCancelled(): boolean
    abort(): void
    // Promise 方法
    then<R>(onfulfilled?: (value: T) => R, onrejected?: (reason: any) => R): Promise<R>
    catch<R>(onrejected?: (reason: any) => R): Promise<R>
    finally(onfinally?: () => void): Promise<T>
}
```

---

## 下一步

- [运行时 API](runtime-api.md) - 应用和渲染器 API
- [编译器 API](compiler-api.md) - 编译和转换 API
- [工具函数 API](utils-api.md) - 辅助工具函数