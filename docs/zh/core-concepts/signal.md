# Signal 响应式状态

Signal 是 Fluxion 响应式系统的核心，提供了一种简单而强大的状态管理方式。

## 什么是 Signal？

Signal 是一个响应式数据容器，当其值发生变化时，会自动通知所有使用它的地方进行更新。

```nui
count = signal(0)

view
div
    p Count: {count}
    button @click={() => count.update(c => c + 1)}
        增加
```

当点击按钮时，`count` 的值改变，`p` 标签中的内容会自动更新。

## Signal vs 传统状态

### 传统方式

```javascript
// 传统方式：需要手动触发更新
let count = 0

function increment() {
    count++
    updateUI() // 手动调用更新
}

function updateUI() {
    document.querySelector('p').textContent = `Count: ${count}`
}
```

### Signal 方式

```nui
// Signal：自动追踪和更新
count = signal(0)

function increment() {
    count.update(c => c + 1) // 自动更新 UI
}

view
p Count: {count}
button @click=increment
    增加
```

**优势：**

1. **自动追踪**：无需手动管理依赖关系
2. **细粒度更新**：只有使用该 signal 的部分会更新
3. **代码简洁**：减少模板代码

## 创建 Signal

### 基本类型

```nui
// 数字
count = signal(0)
price = signal(99.99)

// 字符串
name = signal("Fluxion")
message = signal("")

// 布尔值
isActive = signal(true)
isLoading = signal(false)

// null 和 undefined
value = signal(null)
data = signal(undefined)
```

### 复杂类型

```nui
// 对象
user = signal({
    name: "John",
    age: 30,
    email: "john@example.com"
})

// 数组
items = signal([1, 2, 3, 4, 5])
users = signal([
    { id: 1, name: "Alice" },
    { id: 2, name: "Bob" }
])

// Map 和 Set
mapData = signal(new Map([['key', 'value']]))
setData = signal(new Set([1, 2, 3]))
```

## 读取值

### 在模板中

```nui
count = signal(42)
name = signal("Fluxion")

view
div
    // 直接使用 signal 名称，自动调用
    p Count: {count}
    p Name: {name}

    // 在表达式中使用
    p Double: {count() * 2}
    p Greeting: Hello, {name()}
```

### 在函数中

```nui
count = signal(0)

function logCount() {
    // 使用函数调用获取值
    console.log('Current count:', count())
}

function doubleCount() {
    return count() * 2
}
```

## 更新值

### set 方法

直接设置新值：

```nui
count = signal(0)

function reset() {
    count.set(0)
}

function setToTen() {
    count.set(10)
}
```

### update 方法

基于当前值更新：

```nui
count = signal(0)

function increment() {
    count.update(c => c + 1)
}

function decrement() {
    count.update(c => c - 1)
}

function double() {
    count.update(c => c * 2)
}
```

### 更新对象和数组

```nui
user = signal({ name: "John", age: 30 })
items = signal([1, 2, 3])

function updateName() {
    // 更新对象属性
    user.update(u => ({ ...u, name: "Jane" }))
}

function addItem() {
    // 添加数组元素
    items.update(list => [...list, list.length + 1])
}

function removeItem(index) {
    // 删除数组元素
    items.update(list => list.filter((_, i) => i !== index))
}
```

## 响应式原理

Signal 基于"发布-订阅"模式：

```
┌─────────────┐
│   Signal    │
│   count=0   │
└──────┬──────┘
       │
       ▼
┌─────────────┐     ┌─────────────┐
│  Subscriber │     │  Subscriber │
│  (模板)     │     │  (computed) │
└─────────────┘     └─────────────┘
       │                   │
       ▼                   ▼
  自动更新 UI          自动重新计算
```

### 依赖收集

```nui
a = signal(1)
b = signal(2)

// 自动收集依赖：当 a 或 b 变化时重新计算
function sum() {
    return a() + b()
}

view
p Sum: {a() + b()}
```

### 更新触发

```nui
count = signal(0)

view
div
    p Count: {count}
    button @click={() => count.update(c => c + 1)}
        增加
```

点击按钮时：
1. `count.update(c => c + 1)` 更新值
2. 通知所有订阅者
3. 模板重新渲染相关部分

## 注意事项

### 不要直接修改值

```nui
// ❌ 错误：直接赋值不会触发更新
count = signal(0)
count = 1  // 这会创建一个新的变量，不会更新 signal

// ✅ 正确：使用 set 或 update
count.set(1)
count.update(c => c + 1)
```

### 在函数中使用括号

```nui
count = signal(0)

function getValue() {
    // ✅ 正确：使用括号获取值
    return count()
}

// 在模板中可以省略括号
view
p {count}  // 等价于 {count()}
```

### 对象更新要创建新引用

```nui
user = signal({ name: "John" })

// ❌ 错误：直接修改不会触发更新
function wrongUpdate() {
    user().name = "Jane"  // 修改了原对象
}

// ✅ 正确：创建新对象
function correctUpdate() {
    user.update(u => ({ ...u, name: "Jane" }))
}
```

## 下一步

- [Signal API](../reactivity/signal-api.md) - 完整的 Signal API 参考
- [Computed 计算属性](../reactivity/computed.md) - 派生状态
- [Effect 副作用](../reactivity/effect.md) - 响应式副作用