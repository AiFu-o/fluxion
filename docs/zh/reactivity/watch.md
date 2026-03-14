# Watch 监听器

Watch 用于监听响应式状态的变化，并在变化时执行回调函数。相比 Effect，Watch 提供了更精细的控制。

## 基本用法

### watch()

监听指定数据源的变化：

```javascript
import { signal, watch } from 'fluxion'

const count = signal(0)

// 监听 count 变化
const stop = watch(
    () => count(),  // 数据源
    (newValue, oldValue) => {
        console.log(`Count changed from ${oldValue} to ${newValue}`)
    }
)

count.set(1)
// 输出: Count changed from 0 to 1
```

### watchEffect()

自动追踪依赖，无需指定数据源：

```javascript
import { signal, watchEffect } from 'fluxion'

const count = signal(0)
const name = signal('Fluxion')

// 自动追踪 count 和 name
watchEffect(() => {
    console.log(`Count: ${count()}, Name: ${name()}`)
})
// 立即执行: Count: 0, Name: Fluxion

count.set(1)
// 输出: Count: 1, Name: Fluxion
```

### watchDeep()

深度监听对象的所有嵌套属性：

```javascript
import { reactive, watchDeep } from 'fluxion'

const user = reactive({
    name: 'John',
    address: {
        city: 'New York',
        country: 'USA'
    }
})

watchDeep(
    () => user,
    (newValue, oldValue) => {
        console.log('User changed:', newValue)
    }
)

user.address.city = 'Boston'
// 输出: User changed: { name: 'John', address: { city: 'Boston', ... } }
```

## 监听多个数据源

```javascript
import { signal, watch } from 'fluxion'

const firstName = signal('John')
const lastName = signal('Doe')

watch(
    () => [firstName(), lastName()],  // 监听多个
    ([newFirst, newLast], [oldFirst, oldLast]) => {
        console.log(`Name: ${newFirst} ${newLast}`)
    }
)
```

## 监听对象属性

```javascript
import { reactive, watch } from 'fluxion'

const user = reactive({
    name: 'John',
    age: 30
})

// 监听特定属性
watch(
    () => user.name,
    (newName, oldName) => {
        console.log(`Name changed: ${oldName} -> ${newName}`)
    }
)
```

## 配置选项

### immediate

创建时立即执行回调：

```javascript
const count = signal(0)

watch(
    () => count(),
    (newValue, oldValue) => {
        console.log(`Count: ${newValue}`)
    },
    { immediate: true }  // 立即执行
)
// 立即输出: Count: 0
```

### deep

深度监听对象：

```javascript
const user = signal({
    name: 'John',
    address: { city: 'New York' }
})

watch(
    () => user(),
    (newValue, oldValue) => {
        console.log('User changed')
    },
    { deep: true }
)
```

### flush

控制回调执行时机：

```javascript
// 'pre' - DOM 更新前执行（默认）
watch(() => count(), callback, { flush: 'pre' })

// 'post' - DOM 更新后执行
watch(() => count(), callback, { flush: 'post' })

// 'sync' - 同步执行
watch(() => count(), callback, { flush: 'sync' })
```

## 清理副作用

回调函数接收第三个参数用于清理：

```javascript
const userId = signal(1)

watch(
    () => userId(),
    (newId, oldId, onCleanup) => {
        const controller = new AbortController()

        fetch(`/api/user/${newId}`, { signal: controller.signal })
            .then(r => r.json())
            .then(data => console.log(data))

        // 下次执行前或停止时调用
        onCleanup(() => {
            controller.abort()
        })
    }
)
```

## 停止监听

```javascript
const count = signal(0)

const stop = watch(() => count(), (value) => {
    console.log('Count:', value)
})

// 停止监听
stop()
```

## 批量清理

```javascript
import { watch, disposeAllWatches } from 'fluxion'

watch(() => count(), callback1)
watch(() => name(), callback2)
watch(() => age(), callback3)

// 清理所有监听器
disposeAllWatches()
```

## API 参考

### watch()

```typescript
function watch<T>(
    source: WatchSource<T>,
    callback: WatchCallback<T>,
    options?: WatchOptions
): () => void

type WatchSource<T> = () => T
type WatchCallback<T> = (
    newValue: T,
    oldValue: T | undefined,
    onCleanup: (fn: () => void) => void
) => void

interface WatchOptions {
    immediate?: boolean
    deep?: boolean
    flush?: 'pre' | 'post' | 'sync'
}
```

### watchEffect()

```typescript
function watchEffect(
    effect: () => void | (() => void)
): () => void
```

### watchDeep()

```typescript
function watchDeep<T>(
    source: WatchSource<T>,
    callback: WatchCallback<T>
): () => void
```

### disposeAllWatches()

```typescript
function disposeAllWatches(): void
```

## 使用场景

### 表单验证

```javascript
const email = signal('')

watch(
    () => email(),
    (value) => {
        const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
        emailError.set(isValid ? '' : 'Invalid email')
    }
)
```

### 数据同步

```javascript
const settings = signal({ theme: 'light', lang: 'en' })

watch(
    () => settings(),
    (newSettings) => {
        localStorage.setItem('settings', JSON.stringify(newSettings))
    },
    { deep: true }
)
```

### API 请求

```javascript
const searchQuery = signal('')

watch(
    () => searchQuery(),
    async (query, _, onCleanup) => {
        if (!query) return

        const controller = new AbortController()
        onCleanup(() => controller.abort())

        const results = await fetchSearch(query, controller.signal)
        searchResults.set(results)
    }
)
```

## Watch vs Effect

| 特性 | Watch | Effect |
|------|-------|--------|
| 依赖指定 | 显式指定 | 自动追踪 |
| 旧值访问 | ✅ 可访问 | ❌ 不可访问 |
| 立即执行 | 可选（immediate） | 默认执行 |
| 使用场景 | 精确控制、需要旧值 | 自动副作用 |

## 下一步

- [Reactive 对象](reactive.md) - 响应式对象
- [AsyncSignal 异步数据](async-signal.md) - 异步数据处理
- [Effect 副作用](effect.md) - 响应式副作用