# 组件基础

组件是 Fluxion 应用的基本构建块。本章介绍组件的定义和使用方式。

## 组件定义

### 使用 .nui 文件

最常见的方式是创建 `.nui` 文件：

```nui
// Button.nui
text = signal("Button")

view
button
    {text}

style
button {
    padding 8px 16px
    background-color #007bff
    color white
    border none
    border-radius 4px
    cursor pointer
}
```

### 使用 JavaScript 对象

也可以使用 JavaScript 对象定义组件：

```javascript
import { signal, h } from 'fluxion'

export const Button = {
    name: 'Button',
    setup(props) {
        const text = signal(props.text || 'Button')

        return () => h('button', {
            onClick: props.onClick
        }, text())
    }
}
```

## 组件使用

### 导入组件

```nui
import Button from "./Button.nui"

view
div
    Button text="Click me"
```

### 嵌套使用

```nui
import Header from "./Header.nui"
import Content from "./Content.nui"
import Footer from "./Footer.nui"

view
div class="app"
    Header title="My App"
    Content
    Footer
```

## Props 传递

### 基本传递

```nui
// 父组件
import Card from "./Card.nui"

view
div
    Card title="Hello" content="World"
```

```nui
// Card.nui
view
div class="card"
    h3 {title}
    p {content}

style
.card {
    padding 16px
    border 1px solid #ddd
    border-radius 8px
}
```

### 动态 Props

```nui
// 父组件
import Button from "./Button.nui"

count = signal(0)

function handleClick() {
    count.update(c => c + 1)
}

view
div
    p Count: {count}
    Button text="Increment" onClick={handleClick}
```

### Props 默认值

```nui
// Button.nui
// 使用 JavaScript 逻辑设置默认值
buttonText = signal(text || "Click me")

view
button @click=onClick
    {buttonText}

style
button {
    padding 8px 16px
    background-color #007bff
    color white
}
```

## 子内容

### 默认插槽

```nui
// Card.nui
view
div class="card"
    slot

style
.card {
    padding 16px
    border-radius 8px
    box-shadow 0 2px 4px rgba(0,0,0,0.1)
}
```

```nui
// 父组件
import Card from "./Card.nui"

view
div
    Card
        p This is the card content
        button Action
```

### 具名插槽

```nui
// Layout.nui
view
div class="layout"
    header
        slot name="header"
    main
        slot
    footer
        slot name="footer"
```

```nui
// 父组件
import Layout from "./Layout.nui"

view
Layout
    template slot="header"
        h1 Page Title
    p Main content here
    template slot="footer"
        p Copyright 2024
```

## 事件

### 发射事件

```nui
// Counter.nui
count = signal(0)

function increment() {
    count.update(c => c + 1)
    emit('change', count())
}

view
div
    p Count: {count}
    button @click=increment Increment
```

### 监听事件

```nui
// 父组件
import Counter from "./Counter.nui"

totalCount = signal(0)

function handleChange(value) {
    totalCount.set(value)
}

view
div
    Counter @change=handleChange
    p Total: {totalCount}
```

## 组件组合

### 组合模式

```nui
// App.nui
import Header from "./Header.nui"
import Sidebar from "./Sidebar.nui"
import Main from "./Main.nui"

view
div class="app"
    Header
    div class="container"
        Sidebar
        Main
```

### 高阶组件

```javascript
// withLoading.js
import { signal } from 'fluxion'

export function withLoading(Component) {
    return {
        setup(props) {
            const loading = signal(true)

            // 模拟加载
            setTimeout(() => loading.set(false), 1000)

            return () => {
                if (loading()) {
                    return h('div', null, 'Loading...')
                }
                return h(Component, props)
            }
        }
    }
}
```

## 组件生命周期

### setup 阶段

组件初始化时执行：

```nui
// 组件初始化时执行的代码
data = signal(null)

// 这里的代码在 setup 阶段执行
console.log('Component setup')

async function loadData() {
    const response = await fetch('/api/data')
    data.set(await response.json())
}

// 初始化时加载数据
loadData()

view
div
    if data
        p {data().message}
    else
        p Loading...
```

### 清理副作用

```javascript
import { signal, effect, onUnmounted } from 'fluxion'

// 在组件中使用
const timer = effect(() => {
    const id = setInterval(() => {
        console.log('Tick')
    }, 1000)

    return () => clearInterval(id)
})
```

## 最佳实践

### 单一职责

每个组件只做一件事：

```nui
// ✅ 好：单一职责
// UserName.nui
view
span class="user-name" {name}

// UserProfile.nui
view
div class="user-profile"
    img src={avatar}
    UserName name={name}
```

### Props 验证

```javascript
// 使用 JavaScript 定义时可以添加验证
export const Button = {
    props: {
        text: {
            type: String,
            required: true
        },
        onClick: {
            type: Function,
            required: false
        }
    },
    setup(props) {
        // ...
    }
}
```

### 避免深层嵌套

```nui
// ❌ 避免：深层嵌套
view
div
    div
        div
            div
                p Content

// ✅ 更好：使用组件拆分
import Card from "./Card.nui"

view
Card
    p Content
```

## 下一步

- [组件定义](../components/definition.md) - 深入了解组件定义
- [Props 传递](../components/props.md) - Props 详细用法
- [事件发射](../components/events.md) - 组件事件系统
- [插槽](../components/slots.md) - 内容分发