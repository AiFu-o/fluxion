# 调试技巧

本章节介绍 Fluxion 应用的调试方法和常见问题解决方案。

---

## 开发工具

### 浏览器开发工具

Fluxion 应用可以使用标准的浏览器开发工具进行调试：

1. **Console** - 查看日志和警告
2. **Elements** - 检查 DOM 结构
3. **Sources** - 设置断点调试
4. **Network** - 检查 API 请求

### Vue DevTools 兼容

Fluxion 的响应式系统与 Vue 类似，可以使用类似的调试思路：

```javascript
// 在控制台中访问 signal 值
const count = signal(0)
count()              // 读取当前值
count.set(10)        // 设置值
```

---

## 日志调试

### 使用 console.log

```nui
count = signal(0)

function increment() {
    console.log('Before:', count())
    count.update(c => c + 1)
    console.log('After:', count())
}

view
button @click=increment Count: {count}
```

### 使用 debug 函数

```javascript
import { debug } from '@fluxion-ui/shared'

// 仅在开发环境输出
debug('Current state:', state())
debug('User action:', action)
```

### 监控 Effect 执行

```javascript
import { effect, signal } from '@fluxion-ui/fluxion'

const count = signal(0)

const dispose = effect(() => {
    console.log('[Effect] Running, count =', count())
})

// 查看执行时机
count.set(1)
// [Effect] Running, count = 1
```

---

## 响应式调试

### 追踪依赖

```javascript
import { signal, computed, effect } from '@fluxion-ui/fluxion'

const firstName = signal('John')
const lastName = signal('Doe')

const fullName = computed(() => {
    console.log('Computing fullName...')
    return `${firstName()} ${lastName()}`
})

// 查看何时重新计算
effect(() => {
    console.log('fullName changed:', fullName())
})

firstName.set('Jane')
// Computing fullName...
// fullName changed: Jane Doe
```

### 检查 Signal 状态

```javascript
import { signal, getQueueStatus } from '@fluxion-ui/fluxion'

const count = signal(0)

// 查看队列状态
console.log(getQueueStatus())
// { length: 0, isFlushing: false, isFlushPending: false }

count.set(1)
console.log(getQueueStatus())
// { length: 1, isFlushing: false, isFlushPending: true }
```

---

## 组件调试

### 查看组件实例

```javascript
import { getCurrentInstance } from '@fluxion-ui/fluxion'

const MyComponent = {
    setup(props) {
        const instance = getCurrentInstance()

        console.log('Component props:', props)
        console.log('Component instance:', instance)

        return () => h('div', 'Hello')
    }
}
```

### 生命周期调试

```javascript
import {
    onBeforeMount,
    onMounted,
    onBeforeUpdate,
    onUpdated,
    onUnmounted
} from '@fluxion-ui/fluxion'

const MyComponent = {
    setup() {
        onBeforeMount(() => console.log('Before mount'))
        onMounted(() => console.log('Mounted'))
        onBeforeUpdate(() => console.log('Before update'))
        onUpdated(() => console.log('Updated'))
        onUnmounted(() => console.log('Unmounted'))
    }
}
```

---

## 编译器调试

### 查看 AST

```javascript
import { parse } from '@fluxion-ui/compiler-nui'

const source = `
count = signal(0)
view
div
    p {count}
`

const { ast, errors } = parse(source)

console.log('AST:', JSON.stringify(ast, null, 2))
console.log('Errors:', errors)
```

### 查看生成的代码

```javascript
import { compile } from '@fluxion-ui/compiler-nui'

const source = `
count = signal(0)
view
div
    p {count}
`

const result = compile(source)

console.log('Generated code:')
console.log(result.code)

if (result.errors.length > 0) {
    console.error('Compile errors:', result.errors)
}
```

### 追踪编译过程

```javascript
import {
    parse,
    transform,
    generate,
    NodeTypes
} from '@fluxion-ui/compiler-core'

const source = '<div>{count}</div>'

// 1. 解析
const ast = parse(source)
console.log('Parsed AST:', ast)

// 2. 转换
transform(ast, {
    nodeTransforms: [
        (node, context) => {
            console.log('Transforming:', NodeTypes[node.type])
        }
    ]
})

// 3. 生成
const result = generate(ast)
console.log('Generated:', result.code)
```

---

## 常见问题

### 1. Signal 更新不触发视图

**问题：**
```javascript
const items = signal([1, 2, 3])
items().push(4)  // 不触发更新
```

**解决：**
```javascript
const items = signal([1, 2, 3])
items.update(arr => [...arr, 4])  // 触发更新
```

### 2. Computed 不更新

**问题：**
```javascript
const a = signal(1)
const b = signal(2)

// 在 computed 外部读取依赖
const sum = computed(() => a() + b())

// 错误：依赖在 setup 时已固定
```

**解决：**
确保所有依赖在 computed 回调内部读取：
```javascript
const sum = computed(() => a() + b())  // ✓ 正确
```

### 3. Effect 无限循环

**问题：**
```javascript
const count = signal(0)

effect(() => {
    count.set(count() + 1)  // 无限循环
})
```

**解决：**
避免在 effect 中修改自己依赖的 signal：
```javascript
const count = signal(0)
const doubled = computed(() => count() * 2)

effect(() => {
    console.log(doubled())  // ✓ 安全
})
```

### 4. 事件处理函数丢失 this

**问题：**
```javascript
const obj = {
    count: signal(0),
    increment() {
        this.count.set(this.count() + 1)  // this 可能丢失
    }
}
```

**解决：**
使用箭头函数或绑定 this：
```javascript
const obj = {
    count: signal(0),
    increment: () => {
        obj.count.set(obj.count() + 1)
    }
}
```

### 5. 异步数据加载问题

**问题：**
```nui
data = asyncSignal(() => fetchData())

// 组件挂载时数据还未加载完成
p {data().title}  // Error: Cannot read property 'title' of undefined
```

**解决：**
添加加载状态检查：
```nui
data = asyncSignal(() => fetchData())

if data.loading()
    p Loading...
elif data.error()
    p Error: {data.error().message}
else
    p {data().title}
```

### 6. 组件不更新

**问题：**
```javascript
// 直接修改 props 对象
props.item.name = 'new name'  // 不触发更新
```

**解决：**
使用 emit 通知父组件更新：
```javascript
emit('update:item', { ...props.item, name: 'new name' })
```

---

## 性能调试

### 检测不必要的渲染

```javascript
import { effect } from '@fluxion-ui/fluxion'

let renderCount = 0

effect(() => {
    renderCount++
    console.log(`Render #${renderCount}`)
    // 渲染逻辑...
})
```

### 使用 Performance API

```javascript
import { signal, nextTick } from '@fluxion-ui/fluxion'

const items = signal([])

async function measureUpdate() {
    performance.mark('update-start')

    items.update(list => [...list, ...newItems])

    await nextTick()

    performance.mark('update-end')
    performance.measure('update', 'update-start', 'update-end')

    const measure = performance.getEntriesByName('update')[0]
    console.log(`Update took: ${measure.duration}ms`)
}
```

---

## 错误处理

### 全局错误处理

```javascript
import { warn } from '@fluxion-ui/shared'

// 设置全局错误处理
window.onerror = (message, source, lineno, colno, error) => {
    console.error('Global error:', { message, source, lineno, colno, error })
    return false
}

// 处理未捕获的 Promise 错误
window.onunhandledrejection = (event) => {
    console.error('Unhandled rejection:', event.reason)
}
```

### 组件错误边界

```javascript
const ErrorBoundary = {
    setup(props, { slots }) {
        const error = signal(null)

        // 捕获子组件错误
        const handleError = (err) => {
            error.set(err)
            console.error('Component error:', err)
        }

        return () => {
            if (error()) {
                return h('div', { class: 'error' }, [
                    h('p', 'Something went wrong:'),
                    h('pre', error().message)
                ])
            }

            return slots.default?.()
        }
    }
}
```

---

## 调试工具函数

### 创建调试 Signal

```javascript
import { signal } from '@fluxion-ui/fluxion'

function createDebugSignal(initialValue, name) {
    const s = signal(initialValue)

    // 包装 setter
    const originalSet = s.set
    s.set = (value) => {
        console.log(`[${name}] Setting:`, value)
        originalSet(value)
    }

    return s
}

// 使用
const count = createDebugSignal(0, 'count')
count.set(5)  // [count] Setting: 5
```

### 追踪 Signal 读取

```javascript
import { effect } from '@fluxion-ui/fluxion'

function trackSignalDeps(signal, name) {
    const deps = new Set()

    effect(() => {
        const value = signal()
        deps.add(value)
        console.log(`[${name}] Dependencies:`, [...deps])
    })

    return signal
}
```

---

## 最佳实践

1. **使用开发模式** - 确保在开发环境中捕获更多错误
2. **添加日志** - 在关键操作前后添加日志
3. **使用 TypeScript** - 获得更好的类型检查和 IDE 支持
4. **单元测试** - 为关键功能编写测试用例
5. **渐进式调试** - 从简单场景开始，逐步复杂化

---

## 下一步

- [常见模式](patterns.md) - 查看开发模式
- [完整示例](complete-examples.md) - 查看完整应用示例