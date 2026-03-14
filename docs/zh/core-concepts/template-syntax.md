# 模板语法概览

本章介绍 `.nui` 文件的模板语法基础，让你快速上手编写模板。

## 元素声明

### 基本元素

```nui
view
div
    h1 标题
    p 段落
    span 文本
```

### 自闭合元素

```nui
view
div
    img src="photo.jpg"
    input type="text"
    br
```

### 嵌套结构

使用 Tab 缩进表示嵌套：

```nui
view
div class="container"
    header
        nav
            a href="/" 首页
            a href="/about" 关于
    main
        article
            h2 文章标题
            p 文章内容...
```

## 属性绑定

### 静态属性

```nui
view
div id="app"
    input type="text" placeholder="请输入"
    a href="https://example.com" 链接
```

### 动态属性

使用 `{}` 绑定动态值：

```nui
view
div id={dynamicId}
    input type="text" value={inputValue}
    img src={imageUrl}
    a href={linkUrl} 链接
```

### 多属性

```nui
view
div class="card" id="card-1" data-index={index}
    p 内容
```

### class 和 style

```nui
view
div class="container" class={isActive ? 'active' : ''}
    p 内容

div style="color: red" style={isDark ? 'background: black' : ''}
    p 内容
```

## 插值表达式

### 文本插值

```nui
view
div
    p Hello {name}
    p Count: {count}
```

### 表达式插值

```nui
view
div
    p Total: {price * quantity}
    p Status: {isActive() ? 'Active' : 'Inactive'}
    p User: {user().name}
```

## 条件渲染

### if 语句

```nui
view
div
    if isLoading
        p 加载中...
    elif hasError
        p 错误: {error}
    else
        p 数据加载完成
```

### 条件渲染组件

```nui
view
div
    if user
        p Welcome, {user().name}
    else
        button @click=login
            登录
```

## 列表渲染

### 基本循环

```nui
view
ul
    for item in items
        li {item}
```

### 对象数组

```nui
view
ul
    for user in users
        li
            span {user.name}
            span {user.email}
```

### 带索引

```nui
view
ol
    for item, index in items
        li {index + 1}. {item}
```

## 事件处理

### 点击事件

```nui
view
div
    button @click=handleClick
        点击
    button @click={() => count.update(c => c + 1)}
        增加
```

### 事件参数

```nui
view
div
    button @click=deleteItem(item.id)
        删除
    input @input=handleInput
```

### 事件对象

```nui
function handleClick(event) {
    event.preventDefault()
    console.log('Clicked')
}

view
button @click=handleClick
    点击
```

### 表单事件

```nui
view
form @submit=handleSubmit
    input type="text" @input=handleInput
    button type="submit"
        提交
```

## 组件使用

### 基本使用

```nui
import Button from "./Button.nui"

view
div
    Button text="Click me"
```

### 带子内容

```nui
import Card from "./Card.nui"

view
Card title="Card Title"
    p Card content
    button Action
```

### 事件监听

```nui
import Counter from "./Counter.nui"

view
Counter @change=handleChange
```

## 样式

### style 块

```nui
view
div class="container"
    h1 标题
    p 内容

style
.container {
    padding 20px
}

h1 {
    font-size 24px
    color #333
}

p {
    line-height 1.6
}
```

### 动态 class

```nui
view
div class={isActive ? 'active' : 'inactive'}
    p 内容

style
.active {
    background-color green
}

.inactive {
    background-color gray
}
```

## 注释

在 `.nui` 文件中使用 JavaScript 注释：

```nui
// 这是单行注释
view
div
    p 内容  // 行尾注释

/*
这是多行注释
可以跨越多行
*/
```

## 完整示例

```nui
import Button from "./Button.nui"
import Card from "./Card.nui"

// 响应式状态
count = signal(0)
items = signal(['Apple', 'Banana', 'Orange'])
isLoading = signal(false)

// 方法
function increment() {
    count.update(c => c + 1)
}

function addItem() {
    items.update(list => [...list, 'New Item'])
}

// 模板
view
div class="app"
    header
        h1 计数器应用
    main
        Card title="计数器"
            p Count: {count}
            div class="buttons"
                Button text="-1" onClick={() => count.update(c => c - 1)}
                Button text="+1" onClick={increment}

        Card title="列表"
            ul
                for item in items
                    li {item}
            Button text="添加" onClick={addItem}

        if isLoading
            p 加载中...
        else
            p 数据已加载

    footer
        p Fluxion Framework

// 样式
style
.app {
    max-width 800px
    margin 0 auto
    padding 20px
}

header {
    margin-bottom 20px
}

h1 {
    font-size 24px
    color #333
}

main {
    display grid
    gap 20px
}

.buttons {
    display flex
    gap 10px
}

ul {
    list-style none
    padding 0
}

li {
    padding 8px
    border-bottom 1px solid #eee
}

footer {
    margin-top 40px
    text-align center
    color #666
}
```

## 下一步

- [元素与属性](../template/elements.md) - 详细了解元素和属性
- [插值表达式](../template/interpolation.md) - 深入了解插值语法
- [条件渲染](../template/conditionals.md) - 条件渲染详解
- [列表渲染](../template/lists.md) - 列表渲染详解
- [事件处理](../template/events.md) - 事件处理详解
- [样式](../template/styles.md) - 样式定义