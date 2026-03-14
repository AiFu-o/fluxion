# 条件渲染

使用 `if`、`elif`、`else` 根据条件渲染不同的内容。

## 基本用法

### if 语句

```nui
isLoading = signal(true)

view
div
    if isLoading
        p 加载中...
```

### if-else 语句

```nui
isLoggedIn = signal(false)

view
div
    if isLoggedIn
        p 欢迎回来！
    else
        p 请先登录
```

### if-elif-else 语句

```nui
status = signal('loading')

view
div
    if status() === 'loading'
        p 加载中...
    elif status() === 'error'
        p 加载失败
    elif status() === 'success'
        p 加载成功
    else
        p 未知状态
```

## 条件表达式

### Signal 值判断

```nui
count = signal(0)

view
div
    if count() > 0
        p 正数
    elif count() < 0
        p 负数
    else
        p 零
```

### 复杂条件

```nui
user = signal({ name: 'John', role: 'admin' })

view
div
    if user().role === 'admin'
        p 管理员面板
    elif user().role === 'user'
        p 用户面板
    else
        p 访客面板
```

### 逻辑运算

```nui
isLoggedIn = signal(true)
isAdmin = signal(false)

view
div
    if isLoggedIn() && isAdmin()
        p 管理员权限
    elif isLoggedIn()
        p 普通用户
    else
        p 请登录
```

## 嵌套条件

```nui
user = signal({ name: 'John', age: 25, verified: true })

view
div
    if user()
        if user().age >= 18
            if user().verified
                p 已验证的成年用户
            else
                p 未验证的成年用户
        else
            p 未成年用户
    else
        p 未登录
```

## 条件渲染组件

```nui
import Loading from "./Loading.nui"
import Error from "./Error.nui"
import Content from "./Content.nui"

data = signal(null)
error = signal(null)
isLoading = signal(true)

view
div
    if isLoading
        Loading
    elif error
        Error message={error().message}
    else
        Content data={data}
```

## 与列表渲染结合

```nui
items = signal([1, 2, 3, 4, 5])

view
div
    if items().length > 0
        ul
            for item in items
                li {item}
    else
        p 暂无数据
```

## 条件中的函数调用

```nui
function isValid(value) {
    return value && value.length > 0
}

name = signal("")

view
div
    if isValid(name())
        p 有效名称
    else
        p 请输入名称
```

## 注意事项

### 条件值必须是布尔值或可转换值

```nui
// ✅ 正确：布尔值
if isActive()
    p Active

// ✅ 正确：truthy/falsy 值
if user()
    p Logged in

// ✅ 正确：比较表达式
if count() > 0
    p Has items
```

### 避免在条件中修改状态

```nui
// ❌ 错误：条件中有副作用
if (count.update(c => c + 1), count() > 10)
    p Done

// ✅ 正确：条件是纯表达式
if count() > 10
    p Done
```

### 使用 key 优化

在条件渲染组件时使用 key：

```nui
view
div
    if mode() === 'edit'
        EditForm key="edit"
    else
        ViewForm key="view"
```

## 最佳实践

### 保持条件简单

```nui
// ✅ 好：简单条件
if isLoading
    Loading

// ❌ 避免：复杂内联逻辑
if data() && data().items && data().items.length > 0 && !error()
    Content

// ✅ 更好：使用 computed
hasContent = computed(() =>
    data() &&
    data().items &&
    data().items.length > 0 &&
    !error()
)

if hasContent
    Content
```

### 使用早返回模式

```nui
// ✅ 好：早返回
view
div
    if !user
        p 请登录
    elif !user().verified
        p 请验证邮箱
    else
        p 欢迎 {user().name}
```

## 完整示例

```nui
// 认证状态组件
user = signal(null)
isLoading = signal(true)
error = signal(null)

async function checkAuth() {
    isLoading.set(true)
    try {
        const response = await fetch('/api/user')
        if (response.ok) {
            user.set(await response.json())
        }
    } catch (e) {
        error.set(e)
    } finally {
        isLoading.set(false)
    }
}

checkAuth()

view
div class="auth-status"
    if isLoading
        div class="loading"
            p 检查登录状态...
    elif error
        div class="error"
            p 登录检查失败
            button @click=checkAuth 重试
    elif user
        div class="logged-in"
            p 欢迎, {user().name}
            if user().role === 'admin'
                span class="badge" 管理员
            button @click={() => user.set(null)} 登出
    else
        div class="logged-out"
            p 您尚未登录
            button 登录
            button 注册

style
.auth-status {
    padding 20px
}

.loading, .error, .logged-in, .logged-out {
    padding 16px
    border-radius 8px
}

.loading {
    background #f0f0f0
}

.error {
    background #ffebee
    color #c62828
}

.badge {
    background #4caf50
    color white
    padding 2px 8px
    border-radius 4px
    font-size 12px
}
```

## 下一步

- [列表渲染](lists.md) - for 循环渲染
- [事件处理](events.md) - 事件绑定与处理
- [插值表达式](interpolation.md) - 文本与表达式插值