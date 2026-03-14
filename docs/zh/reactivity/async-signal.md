# AsyncSignal 异步数据

AsyncSignal 是一种特殊的 Signal，专门用于处理异步数据获取，自动管理 loading 和 error 状态。

## 基本用法

### 创建 AsyncSignal

```javascript
import { asyncSignal } from '@fluxion-ui/fluxion'

// 简单用法
const users = asyncSignal(() => fetch('/api/users').then(r => r.json()))

// 带初始值
const data = asyncSignal(
    () => fetchData(),
    { initial: [] }  // 初始值
)
```

### 访问数据

```nui
users = asyncSignal(fetchUsers)

view
div
    if users.loading
        p 加载中...
    elif users.error
        p 错误: {users.error().message}
    else
        ul
            for user in users
                li {user.name}
```

## 状态管理

### loading 状态

```javascript
const users = asyncSignal(() => fetchUsers())

// 访问 loading 状态
if (users.loading()) {
    console.log('正在加载...')
}
```

### error 状态

```javascript
const users = asyncSignal(() => fetchUsers())

// 访问错误状态
if (users.error()) {
    console.error('加载失败:', users.error().message)
}
```

### 数据访问

```javascript
const users = asyncSignal(() => fetchUsers())

// 获取数据
const userList = users()
// 或
const userList = users.data()
```

## 操作方法

### reload()

重新加载数据：

```javascript
const users = asyncSignal(() => fetchUsers())

// 刷新数据
users.reload()
```

### cancel()

取消正在进行的请求：

```javascript
const users = asyncSignal(() => fetchUsers())

// 取消请求
users.cancel()
```

## Promise 兼容

AsyncSignal 实现了 Promise 接口：

```javascript
const users = asyncSignal(() => fetchUsers())

// 可以像 Promise 一样使用
users
    .then(data => console.log('Data:', data))
    .catch(error => console.error('Error:', error))
    .finally(() => console.log('Done'))

// 也可以使用 await
async function handleData() {
    try {
        const data = await users
        console.log('Data:', data)
    } catch (error) {
        console.error('Error:', error)
    }
}
```

## 变体

### lazyAsyncSignal()

懒加载，只有在首次访问时才开始获取数据：

```javascript
import { lazyAsyncSignal } from '@fluxion-ui/fluxion'

const users = lazyAsyncSignal(() => fetchUsers())

// 数据不会立即获取
console.log('Created')

// 首次访问时才开始获取
const data = users()
```

### cachedAsyncSignal()

带缓存的数据获取：

```javascript
import { cachedAsyncSignal, clearAsyncSignalCache } from '@fluxion-ui/fluxion'

// 使用缓存
const users = cachedAsyncSignal('users-key', () => fetchUsers())

// 清除特定缓存
clearAsyncSignalCache('users-key')

// 清除所有缓存
clearAsyncSignalCache()
```

## 完整示例

### 用户列表

```nui
import { asyncSignal } from '@fluxion-ui/fluxion'

users = asyncSignal(() =>
    fetch('/api/users').then(r => r.json())
)

function refresh() {
    users.reload()
}

view
div
    h2 用户列表
    if users.loading
        p 加载中...
    elif users.error
        p 错误: {users.error().message}
        button @click=refresh 重试
    else
        ul
            for user in users
                li {user.name} ({user.email})
        button @click=refresh 刷新
```

### 搜索功能

```nui
import { signal, watch, asyncSignal } from '@fluxion-ui/fluxion'

searchTerm = signal('')
searchResults = asyncSignal(() =>
    fetch(`/api/search?q=${searchTerm()}`).then(r => r.json())
)

// 监听搜索词变化
watch(
    () => searchTerm(),
    () => {
        if (searchTerm().length >= 2) {
            searchResults.reload()
        }
    }
)

view
div
    input
        type="text"
        placeholder="搜索..."
        @input={(e) => searchTerm.set(e.target.value)}

    if searchTerm().length >= 2
        if searchResults.loading
            p 搜索中...
        elif searchResults.error
            p 搜索失败
        else
            ul
                for result in searchResults
                    li {result.title}
```

### 并行请求

```nui
import { asyncSignal } from '@fluxion-ui/fluxion'

users = asyncSignal(() => fetch('/api/users').then(r => r.json()))
posts = asyncSignal(() => fetch('/api/posts').then(r => r.json()))

isLoading = computed(() => users.loading() || posts.loading())
hasError = computed(() => users.error() || posts.error())

view
div
    if isLoading
        p 加载中...
    elif hasError
        p 加载失败
    else
        div class="grid"
            div
                h3 用户
                ul
                    for user in users
                        li {user.name}
            div
                h3 文章
                ul
                    for post in posts
                        li {post.title}
```

## API 参考

### asyncSignal()

```typescript
function asyncSignal<T>(
    fetcher: () => Promise<T>,
    initialValue?: T
): AsyncSignal<T>

interface AsyncSignal<T> {
    (): T                              // 获取数据
    loading: Signal<boolean>           // loading 状态
    error: Signal<Error | null>        // error 状态
    reload(): void                     // 重新加载
    cancel(): void                     // 取消请求
    then(onFulfilled, onRejected)      // Promise 兼容
    catch(onRejected)                  // Promise 兼容
    finally(onFinally)                 // Promise 兼容
}
```

### lazyAsyncSignal()

```typescript
function lazyAsyncSignal<T>(
    fetcher: () => Promise<T>
): AsyncSignal<T>
```

### cachedAsyncSignal()

```typescript
function cachedAsyncSignal<T>(
    key: string,
    fetcher: () => Promise<T>
): AsyncSignal<T>
```

### clearAsyncSignalCache()

```typescript
function clearAsyncSignalCache(key?: string): void
```

## 最佳实践

### 错误处理

```javascript
const data = asyncSignal(async () => {
    const response = await fetch('/api/data')

    if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
    }

    return response.json()
})

// 在 UI 中处理错误
if (data.error()) {
    // 显示错误信息
}
```

### 请求取消

```javascript
const data = asyncSignal(async ({ signal }) => {
    const response = await fetch('/api/data', { signal })
    return response.json()
})

// 组件卸载时取消
onUnmounted(() => {
    data.cancel()
})
```

### 条件请求

```javascript
const userId = signal(null)

const userData = asyncSignal(() => {
    const id = userId()
    if (!id) return null

    return fetch(`/api/users/${id}`).then(r => r.json())
})

// 只有在有 userId 时才请求
watch(() => userId(), () => {
    if (userId()) {
        userData.reload()
    }
})
```

## 下一步

- [Watch 监听器](watch.md) - 状态监听
- [Effect 副作用](effect.md) - 响应式副作用
- [常见模式](../examples/patterns.md) - 更多使用模式