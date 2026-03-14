# Effect 副作用

Effect 用于创建响应式副作用函数，当依赖的响应式状态变化时自动执行。

## 基本用法

### 创建副作用

```javascript
import { signal, effect } from 'fluxion'

const count = signal(0)

// 创建副作用
effect(() => {
    console.log(`Count is: ${count()}`)
})
// 立即执行: Count is: 0

count.set(1)
// 自动执行: Count is: 1
```

### 自动追踪依赖

Effect 会自动追踪内部使用的响应式状态：

```javascript
const a = signal(1)
const b = signal(2)

effect(() => {
    console.log(`Sum: ${a() + b()}`)
})
// 输出: Sum: 3

a.set(3)
// 输出: Sum: 5

b.set(4)
// 输出: Sum: 7
```

## 清理函数

Effect 函数可以返回一个清理函数，在下次执行前或停止时调用：

```javascript
import { signal, effect } from 'fluxion'

const userId = signal(1)

const dispose = effect(() => {
    const id = userId()
    const timer = setInterval(() => {
        console.log(`Polling user ${id}`)
    }, 1000)

    // 返回清理函数
    return () => {
        clearInterval(timer)
        console.log(`Cleaned up user ${id}`)
    }
})

userId.set(2)
// 输出: Cleaned up user 1
// 然后开始轮询 user 2
```

## 停止追踪

### stop()

停止副作用函数的追踪：

```javascript
import { signal, effect, stop } from 'fluxion'

const count = signal(0)

const myEffect = effect(() => {
    console.log(`Count: ${count()}`)
})

// 停止追踪
stop(myEffect)

count.set(1)  // 不会再触发
```

### 手动停止

```javascript
const count = signal(0)

const dispose = effect(() => {
    console.log(`Count: ${count()}`)
})

// 调用返回的函数停止
dispose.stop()
// 或
stop(dispose)
```

## 调度时机

### 默认行为

默认情况下，副作用在 DOM 更新前异步执行：

```javascript
const count = signal(0)

effect(() => {
    // 在 DOM 更新前执行
    console.log('Before DOM update:', count())
})
```

### effectPost

在 DOM 更新后执行：

```javascript
import { signal, effectPost } from 'fluxion'

const count = signal(0)

effectPost(() => {
    // 在 DOM 更新后执行
    console.log('After DOM update:', count())
    // 可以安全地访问 DOM
    document.querySelector('#count').textContent = count()
})
```

### effectSync

同步执行（不推荐，可能导致性能问题）：

```javascript
import { signal, effectSync } from 'fluxion'

const count = signal(0)

effectSync(() => {
    // 立即同步执行
    console.log('Sync:', count())
})
```

## 暂停和恢复

### pauseEffect / resumeEffect

```javascript
import { signal, effect, pauseEffect, resumeEffect } from 'fluxion'

const count = signal(0)

const myEffect = effect(() => {
    console.log(`Count: ${count()}`)
})

// 暂停
pauseEffect(myEffect)
count.set(1)  // 不会触发

// 恢复
resumeEffect(myEffect)
count.set(2)  // 触发: Count: 2
```

## API 参考

### effect()

创建一个副作用函数。

```typescript
function effect(fn: () => void | (() => void)): Effect

interface Effect {
    (): void           // 手动执行
    stop(): void       // 停止追踪
}
```

#### 参数

| 参数 | 类型 | 描述 |
|------|------|------|
| fn | () => void \| (() => void) | 副作用函数，可选返回清理函数 |

#### 返回值

返回 Effect 对象，可调用执行或停止。

### stop()

停止副作用追踪。

```typescript
function stop(effect: Effect): void
```

### effectPost()

创建在 DOM 更新后执行的副作用。

```typescript
function effectPost(fn: () => void | (() => void)): Effect
```

### effectSync()

创建同步执行的副作用。

```typescript
function effectSync(fn: () => void | (() => void)): Effect
```

### pauseEffect()

暂停副作用执行。

```typescript
function pauseEffect(effect: Effect): void
```

### resumeEffect()

恢复副作用执行。

```typescript
function resumeEffect(effect: Effect): void
```

### runEffects()

批量执行副作用。

```typescript
function runEffects(effects: Effect[]): void
```

## 使用场景

### 数据同步

```javascript
const user = signal({ name: '', email: '' })

effect(() => {
    // 自动保存到 localStorage
    localStorage.setItem('user', JSON.stringify(user()))
})
```

### 定时器管理

```javascript
const isRunning = signal(true)

effect(() => {
    if (!isRunning()) return

    const timer = setInterval(() => {
        console.log('Running...')
    }, 1000)

    return () => clearInterval(timer)
})
```

### 事件监听

```javascript
const activeElement = signal(null)

effect(() => {
    const element = activeElement()
    if (!element) return

    const handler = (e) => {
        console.log('Click:', e.target)
    }

    element.addEventListener('click', handler)

    return () => {
        element.removeEventListener('click', handler)
    }
})
```

### 订阅管理

```javascript
const channel = signal('general')

effect(() => {
    const ch = channel()
    const subscription = subscribeToChannel(ch, (message) => {
        console.log('Message:', message)
    })

    return () => {
        subscription.unsubscribe()
    }
})
```

## 注意事项

### 避免无限循环

```javascript
// ❌ 错误：无限循环
const count = signal(0)

effect(() => {
    count.update(c => c + 1)  // 触发自己
})

// ✅ 正确：条件判断
const count = signal(0)

effect(() => {
    if (count() < 10) {
        count.update(c => c + 1)
    }
})
```

### 异步操作

```javascript
const userId = signal(1)

effect(() => {
    // 异步操作
    fetchUser(userId()).then(user => {
        // 注意：这里的更新会触发新的 effect
        userData.set(user)
    })
})
```

### 清理资源

确保清理函数正确释放资源：

```javascript
effect(() => {
    const controller = new AbortController()

    fetch('/api/data', { signal: controller.signal })
        .then(r => r.json())
        .then(data => {
            dataSignal.set(data)
        })

    return () => {
        controller.abort()  // 取消请求
    }
})
```

## 下一步

- [Watch 监听器](watch.md) - 更灵活的状态监听
- [Reactive 对象](reactive.md) - 响应式对象
- [AsyncSignal 异步数据](async-signal.md) - 异步数据处理