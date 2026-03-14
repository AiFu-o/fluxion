# .nui 文件结构

`.nui` 文件是 Fluxion 的核心，使用自定义 DSL 描述组件。本章详细介绍 `.nui` 文件的各个组成部分。

## 文件组成

一个完整的 `.nui` 文件由以下几个部分组成：

```nui
// 1. import 声明（可选）
import ComponentName from "./path/to/Component.nui"

// 2. signal 声明
count = signal(0)
name = signal("Fluxion")

// 3. function 声明
function increment() {
    count.update(c => c + 1)
}

// 4. view 块（必需）
view
div
    p Hello {name}

// 5. style 块（可选）
style
div {
    padding 20px
}
```

## import 声明

用于导入其他组件或模块：

```nui
// 导入组件
import Button from "./Button.nui"
import Header from "./components/Header.nui"

// 导入 JavaScript 模块
import { format } from "date-fns"
import * as utils from "./utils.js"
```

### 导入规则

- 支持相对路径和包名
- 导入的组件可在 view 块中直接使用
- 导入的函数可在 function 中调用

## signal 声明

Signal 是 Fluxion 的响应式状态管理基础：

```nui
// 基本类型
count = signal(0)
name = signal("Fluxion")
isActive = signal(true)

// 对象和数组
user = signal({ name: "John", age: 30 })
items = signal([1, 2, 3])

// 异步数据
users = asyncSignal(fetchUsers)
data = asyncSignal(() => fetch('/api/data').then(r => r.json()))
```

### Signal 特点

- **响应式**：值改变时自动更新 UI
- **细粒度**：只有使用该 signal 的部分会更新
- **可追踪**：自动收集依赖关系

## function 声明

定义组件的方法：

```nui
// 无参数函数
function reset() {
    count.set(0)
}

// 带参数函数
function add(a, b) {
    return a + b
}

// 事件处理函数
function handleClick(event) {
    console.log('clicked', event)
}

// 异步函数
async function fetchData() {
    const response = await fetch('/api/data')
    data.set(await response.json())
}
```

### 函数特点

- 可访问组件内的 signal
- 可作为事件处理器
- 支持异步操作

## view 块

`view` 块定义组件的模板结构，是 `.nui` 文件的必需部分：

### 基本结构

```nui
view
div
    h1 标题
    p 段落内容
    button 按钮
```

### 元素语法

```nui
// 简单元素
div
p
span

// 带文本内容
h1 标题文本
p 这是一段文字

// 带属性
div id="container"
input type="text" placeholder="请输入"
a href="https://example.com" 链接

// 带动态属性
div id={dynamicId}
input value={inputValue}

// 带多个属性
div class="card" id="card-1" data-index={index}
```

### 嵌套结构

使用 Tab 缩进表示嵌套：

```nui
view
div class="container"
    header
        h1 网站标题
        nav
            a href="/" 首页
            a href="/about" 关于
    main
        article
            h2 文章标题
            p 文章内容...
    footer
        p 版权信息
```

### 组件使用

```nui
// 导入的组件
import Button from "./Button.nui"

view
div
    Button text="点击我" onClick={handleClick}

// 带子内容
import Card from "./Card.nui"

view
Card title="卡片标题"
    p 卡片内容
    button 操作
```

### 插值表达式

```nui
// 简单插值
p Hello {name}
p Count: {count}

// 表达式插值
p Total: {price * quantity}
p Status: {isActive() ? 'Active' : 'Inactive'}

// 链式访问
p User: {user().name}
p First item: {items()[0]}
```

### 条件渲染

```nui
view
div
    if loading
        p 加载中...
    elif error
        p 错误: {error}
    else
        p 数据加载完成
```

### 列表渲染

```nui
view
ul
    for item in items
        li {item.name} - {item.price}

// 带索引
for item, index in items
    li {index}: {item}
```

### 事件绑定

```nui
view
div
    // 点击事件
    button @click=handleClick
        点击

    // 带参数
    button @click=deleteItem(item.id)
        删除

    // 输入事件
    input @input=handleInput

    // 表单提交
    form @submit=handleSubmit
        input type="text"
        button 提交
```

## style 块

`style` 块定义组件的样式：

### 基本语法

```nui
style
div {
    padding 20px
    margin 10px
}

h1 {
    font-size 24px
    color #333
}

button {
    padding 8px 16px
    background-color #007bff
    color white
}
```

### 语法特点

- 属性名使用 kebab-case（推荐）或 camelCase
- 属性值不需要引号（除非包含空格）
- 不需要分号结尾
- 支持嵌套选择器

### 嵌套选择器

```nui
style
.card {
    padding 16px
    border-radius 8px

    .title {
        font-size 18px
        font-weight bold
    }

    .content {
        margin-top 8px
    }
}
```

### 伪类和伪元素

```nui
style
button {
    background-color #007bff

    :hover {
        background-color #0056b3
    }

    :active {
        transform scale(0.98)
    }

    :disabled {
        opacity 0.5
        cursor not-allowed
    }
}
```

### 媒体查询

```nui
style
.container {
    width 100%

    @media (min-width 768px) {
        width 750px
    }

    @media (min-width 1024px) {
        width 960px
    }
}
```

### CSS 变量

```nui
style
:root {
    --primary-color #007bff
    --text-color #333
    --spacing 16px
}

button {
    background-color var(--primary-color)
    color var(--text-color)
    padding var(--spacing)
}
```

## 完整示例

```nui
import Button from "./Button.nui"

// 响应式状态
count = signal(0)
theme = signal('light')

// 方法定义
function increment() {
    count.update(c => c + 1)
}

function decrement() {
    count.update(c => c - 1)
}

function toggleTheme() {
    theme.update(t => t === 'light' ? 'dark' : 'light')
}

// 模板
view
div class={theme}
    header
        h1 计数器应用
        button @click=toggleTheme
            切换主题
    main
        p Count: {count}
        div class="buttons"
            Button text="-" onClick={decrement}
            Button text="+" onClick={increment}
    footer
        p Fluxion Framework

// 样式
style
div {
    min-height 100vh
    padding 20px
    transition background-color 0.3s
}

div.light {
    background-color #fff
    color #333
}

div.dark {
    background-color #1a1a1a
    color #fff
}

header {
    display flex
    justify-content space-between
    align-items center
    margin-bottom 20px
}

h1 {
    font-size 24px
}

main {
    text-align center
}

p {
    font-size 48px
    margin 40px 0
}

.buttons {
    display flex
    gap 10px
    justify-content center
}

footer {
    text-align center
    margin-top 40px
    opacity 0.6
}
```

## 下一步

- [Signal 响应式状态](signal.md) - 深入学习响应式系统
- [组件基础](component-basics.md) - 掌握组件开发
- [模板语法概览](template-syntax.md) - 了解更多模板语法