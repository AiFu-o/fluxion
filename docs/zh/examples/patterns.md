# 常见模式

本章节介绍 Fluxion 中常见的开发模式和最佳实践。

---

## 计数器模式

最基本的响应式模式。

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
div.counter
    h1 Count: {count}
    div.buttons
        button @click=decrement -1
        button @click=reset Reset
        button @click=increment +1

style
.counter {
    text-align center
    padding 20px
}
.buttons {
    display flex
    gap 10px
    justify-content center
}
button {
    padding 8px 16px
    font-size 16px
}
```

---

## 表单处理模式

### 基本表单

```nui
username = signal("")
email = signal("")
submitted = signal(false)

function handleSubmit(e) {
    e.preventDefault()
    submitted.set(true)
    console.log('Submitted:', { username: username(), email: email() })
}

view
form @submit=handleSubmit
    div.form-group
        label Username
        input type="text" value={username} @input={(e) => username.set(e.target.value)}

    div.form-group
        label Email
        input type="email" value={email} @input={(e) => email.set(e.target.value)}

    button type="submit" Submit

    if submitted()
        p.success Form submitted successfully!
```

### 带验证的表单

```nui
import { computed } from '@fluxion-ui/fluxion'

username = signal("")
email = signal("")
errors = signal({})

// 验证
usernameError = computed(() => {
    const value = username()
    if (!value) return "Username is required"
    if (value.length < 3) return "Username must be at least 3 characters"
    return null
})

emailError = computed(() => {
    const value = email()
    if (!value) return "Email is required"
    if (!value.includes('@')) return "Invalid email format"
    return null
})

isValid = computed(() => {
    return !usernameError() && !emailError()
})

function handleSubmit(e) {
    e.preventDefault()
    if (isValid()) {
        console.log('Valid form submitted')
    }
}

view
form @submit=handleSubmit
    div.form-group
        label Username
        input value={username} @input={(e) => username.set(e.target.value)}
        if usernameError()
            span.error {usernameError()}

    div.form-group
        label Email
        input type="email" value={email} @input={(e) => email.set(e.target.value)}
        if emailError()
            span.error {emailError()}

    button type="submit" disabled={!isValid()} Submit
```

---

## 列表管理模式

### 添加和删除

```nui
items = signal([])
newItem = signal("")

function addItem() {
    const text = newItem().trim()
    if (text) {
        items.update(list => [...list, { id: Date.now(), text, done: false }])
        newItem.set("")
    }
}

function removeItem(id) {
    items.update(list => list.filter(item => item.id !== id))
}

function toggleItem(id) {
    items.update(list =>
        list.map(item =>
            item.id === id ? { ...item, done: !item.done } : item
        )
    )
}

view
div.todo-app
    div.input-group
        input value={newItem} @input={(e) => newItem.set(e.target.value)} @keyup.enter=addItem placeholder="Add item..."
        button @click=addItem Add

    ul.item-list
        for item in items
            li key={item.id} class={item.done ? 'done' : ''}
                input type="checkbox" checked={item.done} @change={() => toggleItem(item.id)}
                span {item.text}
                button @click={() => removeItem(item.id)} Delete

style
.done span {
    text-decoration line-through
    color #999
}
```

### 过滤和排序

```nui
items = signal([
    { id: 1, name: "Apple", category: "fruit", price: 1.5 },
    { id: 2, name: "Banana", category: "fruit", price: 0.8 },
    { id: 3, name: "Carrot", category: "vegetable", price: 0.5 }
])

filter = signal("")
category = signal("all")
sortBy = signal("name")

filteredItems = computed(() => {
    let result = items()

    // 过滤
    if (filter()) {
        result = result.filter(item =>
            item.name.toLowerCase().includes(filter().toLowerCase())
        )
    }

    // 分类
    if (category() !== "all") {
        result = result.filter(item => item.category === category())
    }

    // 排序
    result = [...result].sort((a, b) => {
        if (sortBy() === "name") return a.name.localeCompare(b.name)
        if (sortBy() === "price") return a.price - b.price
        return 0
    })

    return result
})

view
div.list-manager
    div.filters
        input value={filter} @input={(e) => filter.set(e.target.value)} placeholder="Search..."

        select value={category} @change={(e) => category.set(e.target.value)}
            option value="all" All
            option value="fruit" Fruits
            option value="vegetable" Vegetables

        select value={sortBy} @change={(e) => sortBy.set(e.target.value)}
            option value="name" Sort by Name
            option value="price" Sort by Price

    ul
        for item in filteredItems
            li key={item.id}
                span {item.name} - ${item.price}
```

---

## 异步数据模式

### 数据获取

```nui
import { asyncSignal } from '@fluxion-ui/fluxion'

users = asyncSignal(() =>
    fetch('/api/users').then(r => r.json())
)

function refresh() {
    users.reload()
}

view
div.user-list
    if users.loading()
        p.loading Loading users...

    elif users.error()
        p.error Error: {users.error().message}
        button @click=refresh Retry

    else
        h2 Users ({users().length})
        button @click=refresh Refresh
        ul
            for user in users
                li key={user.id} {user.name}
```

### 分页加载

```nui
import { asyncSignal, signal, computed } from '@fluxion-ui/fluxion'

page = signal(1)
pageSize = signal(10)

data = asyncSignal(() =>
    fetch(`/api/items?page=${page()}&size=${pageSize()}`).then(r => r.json())
)

totalPages = computed(() => {
    const d = data()
    return d ? Math.ceil(d.total / pageSize()) : 0
})

function nextPage() {
    if (page() < totalPages()) {
        page.update(p => p + 1)
        data.reload()
    }
}

function prevPage() {
    if (page() > 1) {
        page.update(p => p - 1)
        data.reload()
    }
}

view
div.paginated-list
    if data.loading()
        p Loading...

    elif data()
        ul
            for item in data().items
                li key={item.id} {item.name}

        div.pagination
            button @click=prevPage disabled={page() <= 1} Previous
            span Page {page()} of {totalPages()}
            button @click=nextPage disabled={page() >= totalPages()} Next
```

---

## 状态管理模式

### 全局状态

```nui
// store.nui
import { signal, computed } from '@fluxion-ui/fluxion'

// 全局状态
user = signal(null)
cart = signal([])
theme = signal('light')

// 计算属性
isLoggedIn = computed(() => !!user())
cartCount = computed(() => cart().reduce((sum, item) => sum + item.quantity, 0))

// 操作
function login(userData) {
    user.set(userData)
}

function logout() {
    user.set(null)
    cart.set([])
}

function addToCart(product) {
    cart.update(items => {
        const existing = items.find(i => i.id === product.id)
        if (existing) {
            return items.map(i =>
                i.id === product.id
                    ? { ...i, quantity: i.quantity + 1 }
                    : i
            )
        }
        return [...items, { ...product, quantity: 1 }]
    })
}

function removeFromCart(productId) {
    cart.update(items => items.filter(i => i.id !== productId))
}

// 导出
export { user, cart, theme, isLoggedIn, cartCount, login, logout, addToCart, removeFromCart }
```

### 使用全局状态

```nui
import { user, isLoggedIn, cartCount, login, logout, addToCart } from './store.nui'

view
header
    if isLoggedIn()
        span Welcome, {user().name}
        span Cart: {cartCount} items
        button @click=logout Logout
    else
        button @click={() => login({ name: 'Guest' })} Login
```

---

## 组件通信模式

### Props 向下传递

```nui
// Parent.nui
import Child from './Child.nui'

message = signal("Hello from parent")

view
div
    h1 Parent Component
    Child message={message}

// Child.nui
view
div
    h2 Child Component
    p Message: {message}
```

### 事件向上传递

```nui
// Parent.nui
import Child from './Child.nui'

receivedMessage = signal("")

function handleMessage(msg) {
    receivedMessage.set(msg)
}

view
div
    h1 Parent
    p Received: {receivedMessage}
    Child onMessage={handleMessage}

// Child.nui
function send() {
    onMessage("Hello from child!")
}

view
div
    h2 Child
    button @click=send Send Message
```

### 插槽模式

```nui
// Card.nui
view
div.card
    div.header
        if title
            h3 {title}
    div.body
        // 默认插槽
        slot
    div.footer
        // 具名插槽
        slot name="footer"

// App.nui
import Card from './Card.nui'

view
Card title="My Card"
    p This goes in the body
    slot name="footer"
        button Action
```

---

## 双向绑定模式

```nui
// 双向绑定辅助函数
function bindSignal(s) {
    return {
        value: s(),
        onInput: (e) => s.set(e.target.value)
    }
}

name = signal("")
email = signal("")

view
form
    input value={name} @input={(e) => name.set(e.target.value)}
    input value={email} @input={(e) => email.set(e.target.value)}

    p Name: {name}
    p Email: {email}
```

---

## 防抖和节流模式

```nui
import { signal, computed } from '@fluxion-ui/fluxion'

searchTerm = signal("")
debouncedSearch = signal("")

// 防抖定时器
debounceTimer = signal(null)

function handleSearch(e) {
    const value = e.target.value
    searchTerm.set(value)

    // 清除之前的定时器
    if (debounceTimer()) {
        clearTimeout(debounceTimer())
    }

    // 设置新的定时器
    debounceTimer.set(
        setTimeout(() => {
            debouncedSearch.set(value)
        }, 300)
    )
}

// 搜索结果
results = asyncSignal(() => {
    if (!debouncedSearch()) return []
    return fetch(`/api/search?q=${debouncedSearch()}`).then(r => r.json())
})

view
div.search
    input value={searchTerm} @input=handleSearch placeholder="Search..."
    if results.loading()
        p Searching...
    else
        for result in results
            p key={result.id} {result.name}
```

---

## 下一步

- [完整示例](complete-examples.md) - 查看完整应用示例
- [调试技巧](debugging.md) - 学习调试方法