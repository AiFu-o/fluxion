# Signal API 参考

本章节详细介绍 Signal 的完整 API。

## signal()

创建一个响应式信号。

### 类型签名

```typescript
function signal<T>(value: T): Signal<T>

interface Signal<T> {
    (): T                              // 读取值
    set(value: T): void                // 设置值
    update(fn: (prev: T) => T): void   // 基于前值更新
}
```

### 参数

| 参数 | 类型 | 描述 |
|------|------|------|
| value | T | 初始值 |

### 返回值

返回一个 Signal 对象，可以像函数一样调用获取值。

### 示例

```nui
// 创建 signal
count = signal(0)
name = signal("Fluxion")
items = signal([1, 2, 3])

// 读取值
currentCount = count()
currentName = name()

// 设置值
count.set(10)
name.set("New Name")

// 基于前值更新
count.update(c => c + 1)
items.update(list => [...list, list.length + 1])
```

## Signal.set()

直接设置 Signal 的值。

### 类型签名

```typescript
signal.set(value: T): void
```

### 参数

| 参数 | 类型 | 描述 |
|------|------|------|
| value | T | 新值 |

### 示例

```nui
count = signal(0)

function reset() {
    count.set(0)
}

function setValue(newValue) {
    count.set(newValue)
}
```

## Signal.update()

基于当前值更新 Signal。

### 类型签名

```typescript
signal.update(fn: (prev: T) => T): void
```

### 参数

| 参数 | 类型 | 描述 |
|------|------|------|
| fn | (prev: T) => T | 接收当前值，返回新值的函数 |

### 示例

```nui
count = signal(0)

// 增量更新
function increment() {
    count.update(c => c + 1)
}

// 复杂更新
function addTen() {
    count.update(c => c + 10)
}

// 条件更新
function toggle() {
    isActive.update(v => !v)
}
```

### 对象和数组更新

```nui
user = signal({ name: "John", age: 30 })
items = signal([1, 2, 3])

function updateName(newName) {
    user.update(u => ({ ...u, name: newName }))
}

function addItem(item) {
    items.update(list => [...list, item])
}

function removeItem(index) {
    items.update(list => list.filter((_, i) => i !== index))
}
```

## readonlySignal()

创建一个只读信号。

### 类型签名

```typescript
function readonlySignal<T>(value: T): () => T
```

### 参数

| 参数 | 类型 | 描述 |
|------|------|------|
| value | T | 初始值 |

### 返回值

返回一个只读函数，只能读取值，不能修改。

### 示例

```nui
// 创建只读信号
VERSION = readonlySignal("1.0.0")
MAX_COUNT = readonlySignal(100)

// 使用
view
div
    p Version: {VERSION}
    p Max: {MAX_COUNT}

// 以下操作会报错
// VERSION.set("2.0.0")  // Error: readonly
```

## unsubscribe()

取消订阅 Signal 的副作用。

### 类型签名

```typescript
function unsubscribe<T>(signal: Signal<T>, effect: () => void): void
```

### 参数

| 参数 | 类型 | 描述 |
|------|------|------|
| signal | Signal\<T\> | 要取消订阅的 Signal |
| effect | () => void | 要取消的副作用函数 |

### 示例

```javascript
import { signal, effect, unsubscribe } from 'fluxion'

const count = signal(0)

const dispose = effect(() => {
    console.log('Count changed:', count())
})

// 取消订阅
unsubscribe(count, dispose)
```

## 使用模式

### 计数器模式

```nui
count = signal(0)

function increment() {
    count.update(c => c + 1)
}

function decrement() {
    count.update(c => c - 1)
}

function reset() {
    count.set(0)
}

view
div
    p Count: {count}
    button @click=decrement -1
    button @click=reset Reset
    button @click=increment +1
```

### 表单输入模式

```nui
username = signal("")
email = signal("")

function updateUsername(e) {
    username.set(e.target.value)
}

function updateEmail(e) {
    email.set(e.target.value)
}

function handleSubmit() {
    console.log('Submit:', { username: username(), email: email() })
}

view
form @submit=handleSubmit
    input type="text" value={username} @input=updateUsername
    input type="email" value={email} @input=updateEmail
    button Submit
```

### 列表管理模式

```nui
items = signal([])
newItem = signal("")

function addItem() {
    if (newItem().trim()) {
        items.update(list => [...list, { id: Date.now(), text: newItem() }])
        newItem.set("")
    }
}

function removeItem(id) {
    items.update(list => list.filter(item => item.id !== id))
}

view
div
    input value={newItem} @input={(e) => newItem.set(e.target.value)}
    button @click=addItem Add
    ul
        for item in items
            li
                span {item.text}
                button @click={() => removeItem(item.id)} Delete
```

### 对象状态模式

```nui
user = signal({
    name: "",
    email: "",
    preferences: {
        theme: "light",
        notifications: true
    }
})

function updateName(name) {
    user.update(u => ({ ...u, name }))
}

function toggleTheme() {
    user.update(u => ({
        ...u,
        preferences: {
            ...u.preferences,
            theme: u.preferences.theme === "light" ? "dark" : "light"
        }
    }))
}

view
div
    input value={user().name} @input={(e) => updateName(e.target.value)}
    button @click=toggleTheme Toggle Theme
    p Theme: {user().preferences.theme}
```

## 类型推断

Signal 完全支持 TypeScript 类型推断：

```typescript
import { signal } from 'fluxion'

// 类型自动推断
const count = signal(0)        // Signal<number>
const name = signal("test")    // Signal<string>
const isActive = signal(true)  // Signal<boolean>

// 显式类型标注
interface User {
    id: number
    name: string
}

const user = signal<User>({ id: 1, name: "John" })

// 读取值
const currentUser: User = user()

// 设置值
user.set({ id: 2, name: "Jane" })

// 更新值
user.update(u => ({ ...u, name: "Updated" }))
```

## 下一步

- [Computed 计算属性](computed.md) - 派生状态
- [Effect 副作用](effect.md) - 响应式副作用
- [Watch 监听器](watch.md) - 状态监听