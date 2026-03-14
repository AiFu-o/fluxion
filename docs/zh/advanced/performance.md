# 性能优化

本章节介绍 Fluxion 应用的性能优化策略和技巧。

## 概述

Fluxion 在设计上就考虑了性能优化，但仍有一些最佳实践可以帮助你获得更好的性能。

---

## 响应式优化

### 1. 避免不必要的依赖追踪

```nui
// 好的做法：只在需要时读取 signal
function handleClick() {
    // 事件处理函数中读取，不会被追踪
    console.log(count())
}

// 避免：在组件外部创建 effect
const unnecessaryEffect = effect(() => {
    // 这个 effect 会一直运行
    console.log(count())
})
```

### 2. 使用 Computed 缓存计算

```nui
// 好的做法：使用 computed 缓存
filteredItems = computed(() => {
    return items().filter(item => item.active)
})

// 避免：在模板中直接计算
// 每次渲染都会重新执行
for item in items().filter(item => item.active)
    p {item.name}
```

### 3. 批量更新

```javascript
import { signal, nextTick } from '@fluxion-ui/fluxion'

const firstName = signal('John')
const lastName = signal('Doe')
const email = signal('john@example.com')

// 批量更新：所有更新会在同一个 tick 中处理
async function updateUser(user) {
    firstName.set(user.firstName)
    lastName.set(user.lastName)
    email.set(user.email)

    // 等待 DOM 更新完成
    await nextTick()
    console.log('更新完成')
}
```

### 4. 使用 shallowReactive 减少深层代理

```javascript
import { shallowReactive } from '@fluxion-ui/fluxion'

// 当只需要监听第一层属性变化时
const state = shallowReactive({
    items: [],        // 不会追踪数组内部变化
    metadata: {}      // 不会追踪对象内部变化
})

// 只有这些会触发更新
state.items = []           // ✅ 触发更新
state.count = 1            // ✅ 触发更新

// 这些不会触发更新
state.items.push(1)        // ❌ 不触发
state.metadata.key = 'val' // ❌ 不触发
```

---

## 渲染优化

### 1. 使用 key 优化列表渲染

```nui
// 好的做法：使用唯一 key
for item in items
    div key={item.id}
        p {item.name}

// 避免：使用索引作为 key
for item in items
    div key={items().indexOf(item)}
        p {item.name}

// 避免：不使用 key
for item in items
    div
        p {item.name}
```

### 2. 条件渲染优化

```nui
// 好的做法：尽早返回
if !loaded
    p Loading...
else
    // 复杂渲染逻辑
    for item in largeList
        // ...

// 或使用 elif 链
if status == 'loading'
    p Loading...
elif status == 'error'
    p Error
else
    // 正常渲染
```

### 3. 减少不必要的响应式包装

```nui
// 好的做法：静态数据不需要 signal
STATIC_CONFIG = {
    apiUrl: '/api',
    timeout: 5000
}

// 只有会变化的数据才需要 signal
count = signal(0)

// 避免：把所有数据都变成 signal
apiUrl = signal('/api')  // 不必要的
```

### 4. 使用 readonlySignal

```javascript
import { readonlySignal } from '@fluxion-ui/fluxion'

// 对于常量值，使用 readonlySignal 避免意外修改
const MAX_ITEMS = readonlySignal(100)
const API_VERSION = readonlySignal('v1')
```

---

## 组件优化

### 1. 合理拆分组件

```nui
// 好的做法：拆分为小组件
// Item.nui
view
div.item
    span {name}
    button @click=onRemove Remove

// List.nui
import Item from './Item.nui'

view
div
    for item in items
        Item name={item.name} onRemove={() => removeItem(item.id)}
```

### 2. 避免在渲染函数中创建新对象

```javascript
// 好的做法：在 setup 中创建
setup() {
    const config = { class: 'container' }  // 只创建一次

    return () => h('div', config, ...)
}

// 避免：每次渲染都创建新对象
setup() {
    return () => h('div', { class: 'container' }, ...)  // 每次都是新对象
}
```

### 3. 使用 Props 验证

```javascript
// 定义 props 类型可以提前发现错误
const MyComponent = {
    props: {
        items: Array,
        count: Number,
        name: String
    },
    setup(props) {
        // props 类型已验证
    }
}
```

---

## 异步数据优化

### 1. 使用 cachedAsyncSignal 缓存请求

```javascript
import { cachedAsyncSignal, clearAsyncSignalCache } from '@fluxion-ui/fluxion'

// 缓存 API 请求
const users = cachedAsyncSignal('users', () =>
    fetch('/api/users').then(r => r.json())
)

// 相同 key 的多次调用共享同一个请求
const users2 = cachedAsyncSignal('users', () =>
    fetch('/api/users').then(r => r.json())
)
// users === users2

// 清除缓存
clearAsyncSignalCache()
```

### 2. 取消不需要的请求

```javascript
import { asyncSignal } from '@fluxion-ui/fluxion'

// 创建可取消的异步信号
const data = asyncSignal(() => fetchData())

// 组件卸载时取消请求
onUnmounted(() => {
    data.cancel()
})

// 或使用 abort
onUnmounted(() => {
    data.abort()
})
```

### 3. 使用 lazyAsyncSignal 延迟加载

```javascript
import { lazyAsyncSignal } from '@fluxion-ui/fluxion'

// 延迟创建异步信号
const lazyData = lazyAsyncSignal(() => fetchData())

// 只在调用时才创建
const data = lazyData()
```

---

## 内存管理

### 1. 清理 Effect

```javascript
import { effect, signal } from '@fluxion-ui/fluxion'

const count = signal(0)

const dispose = effect(() => {
    console.log('Count:', count())

    // 返回清理函数
    return () => {
        console.log('Cleanup')
    }
})

// 不需要时停止
dispose.stop()
```

### 2. 停止 Watch

```javascript
import { watch, signal } from '@fluxion-ui/fluxion'

const data = signal({})

const stop = watch(
    () => data(),
    (newVal) => {
        console.log('Changed:', newVal)
    }
)

// 组件卸载时停止监听
onUnmounted(() => {
    stop()
})
```

### 3. 清理组件实例

```javascript
// 组件卸载时的清理
const MyComponent = {
    setup() {
        const timer = setInterval(() => {
            // 定期任务
        }, 1000)

        // 返回清理函数
        onUnmounted(() => {
            clearInterval(timer)
        })
    }
}
```

---

## 性能分析

### 1. 使用 nextTick 测量更新时间

```javascript
import { signal, nextTick } from '@fluxion-ui/fluxion'

const items = signal([])

async function measureUpdate() {
    const start = performance.now()

    items.update(list => [...list, ...newItems])

    await nextTick()

    const duration = performance.now() - start
    console.log(`更新耗时: ${duration}ms`)
}
```

### 2. 监控队列状态

```javascript
import { getQueueStatus } from '@fluxion-ui/fluxion'

// 检查更新队列状态
const status = getQueueStatus()
console.log('队列长度:', status.length)
console.log('正在刷新:', status.isFlushing)
console.log('等待刷新:', status.isFlushPending)
```

### 3. 使用浏览器开发工具

```javascript
// 在开发环境中添加性能标记
if (process.env.NODE_ENV !== 'production') {
    performance.mark('update-start')

    // 更新操作...

    performance.mark('update-end')
    performance.measure('update', 'update-start', 'update-end')
}
```

---

## 最佳实践清单

### 响应式

- [ ] 使用 `computed` 缓存计算结果
- [ ] 使用 `shallowReactive` 减少代理开销
- [ ] 使用 `readonlySignal` 保护常量
- [ ] 批量更新状态

### 渲染

- [ ] 为列表项添加稳定的 `key`
- [ ] 拆分大组件为小组件
- [ ] 避免在渲染函数中创建新对象
- [ ] 使用条件渲染减少不必要的渲染

### 异步

- [ ] 使用 `cachedAsyncSignal` 缓存 API 请求
- [ ] 及时取消不需要的请求
- [ ] 使用延迟加载减少初始负载

### 内存

- [ ] 及时停止不再需要的 effect 和 watch
- [ ] 在 `onUnmounted` 中清理资源
- [ ] 避免内存泄漏

---

## 下一步

- [自定义渲染器](custom-renderer.md) - 创建自定义渲染器
- [编译器扩展](compiler-extension.md) - 扩展编译器功能
- [TypeScript 支持](typescript.md) - TypeScript 集成