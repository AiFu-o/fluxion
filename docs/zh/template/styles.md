# 样式

本章介绍如何在 .nui 文件中定义和使用 CSS 样式。

## style 块

### 基本语法

```nui
view
div class="container"
    h1 标题
    p 内容

style
.container {
    padding 20px
    max-width 800px
    margin 0 auto
}

h1 {
    font-size 24px
    color #333
}

p {
    line-height 1.6
}
```

### 语法特点

- 属性名使用 kebab-case（推荐）或 camelCase
- 属性值不需要引号（除非包含空格）
- 不需要分号结尾
- 使用缩进表示嵌套

## 选择器

### 元素选择器

```nui
style
h1 {
    font-size 24px
}

p {
    margin 16px 0
}

button {
    padding 8px 16px
}
```

### 类选择器

```nui
style
.container {
    max-width 1200px
    margin 0 auto
}

.card {
    padding 16px
    border-radius 8px
    box-shadow 0 2px 8px rgba(0 0 0 0.1)
}
```

### ID 选择器

```nui
style
#app {
    min-height 100vh
}

#header {
    position fixed
    top 0
    left 0
    right 0
}
```

### 属性选择器

```nui
style
input[type="text"] {
    border 1px solid #ddd
}

button[disabled] {
    opacity 0.5
    cursor not-allowed
}
```

## 嵌套选择器

### 子选择器

```nui
style
.card {
    padding 16px

    .title {
        font-size 18px
        font-weight bold
    }

    .content {
        margin-top 8px
    }

    .footer {
        margin-top 16px
        text-align right
    }
}
```

### 后代选择器

```nui
style
.container {
    padding 20px

    h1 {
        margin-bottom 16px
    }

    p {
        line-height 1.6
    }
}
```

## 伪类

### 状态伪类

```nui
style
button {
    background-color #007bff
    color white

    :hover {
        background-color #0056b3
    }

    :active {
        transform scale(0.98)
    }

    :focus {
        outline 2px solid #007bff
        outline-offset 2px
    }

    :disabled {
        background-color #ccc
        cursor not-allowed
    }
}
```

### 结构伪类

```nui
style
.list {
    :first-child {
        border-top none
    }

    :last-child {
        border-bottom none
    }

    :nth-child(odd) {
        background-color #f9f9f9
    }

    :nth-child(2n) {
        background-color #f5f5f5
    }
}
```

## 伪元素

```nui
style
.quote {
    position relative
    padding-left 20px

    :before {
        content '"'
        position absolute
        left 0
        font-size 32px
        color #999
    }

    :after {
        content '"'
        font-size 32px
        color #999
    }
}

.clearfix {
    :after {
        content ''
        display table
        clear both
    }
}
```

## 媒体查询

### 响应式布局

```nui
style
.container {
    width 100%
    padding 0 16px

    @media (min-width 768px) {
        max-width 750px
        margin 0 auto
    }

    @media (min-width 1024px) {
        max-width 960px
    }

    @media (min-width 1280px) {
        max-width 1200px
    }
}
```

### 移动优先

```nui
style
.grid {
    display grid
    grid-template-columns 1fr
    gap 16px

    @media (min-width 640px) {
        grid-template-columns repeat(2 1fr)
    }

    @media (min-width 1024px) {
        grid-template-columns repeat(3 1fr)
    }
}
```

## CSS 变量

### 定义变量

```nui
style
:root {
    --primary-color #007bff
    --secondary-color #6c757d
    --success-color #28a745
    --danger-color #dc3545
    --font-sans-serif -apple-system BlinkMacSystemFont "Segoe UI" Roboto
    --spacing-xs 4px
    --spacing-sm 8px
    --spacing-md 16px
    --spacing-lg 24px
    --border-radius 4px
}
```

### 使用变量

```nui
style
.button {
    padding var(--spacing-sm) var(--spacing-md)
    background-color var(--primary-color)
    color white
    border none
    border-radius var(--border-radius)
    font-family var(--font-sans-serif)
}

.button-secondary {
    background-color var(--secondary-color)
}

.button-danger {
    background-color var(--danger-color)
}
```

## 动画

### 关键帧动画

```nui
style
@keyframes fadeIn {
    from {
        opacity 0
    }
    to {
        opacity 1
    }
}

@keyframes slideIn {
    from {
        transform translateY(-20px)
        opacity 0
    }
    to {
        transform translateY(0)
        opacity 1
    }
}

.modal {
    animation fadeIn 0.3s ease
}

.dropdown {
    animation slideIn 0.2s ease
}
```

### 过渡效果

```nui
style
.button {
    background-color #007bff
    transition background-color 0.2s ease transform 0.1s ease

    :hover {
        background-color #0056b3
    }

    :active {
        transform scale(0.98)
    }
}
```

## 动态样式

### 动态 class

```nui
isActive = signal(false)
theme = signal('light')

view
div class={`container ${isActive() ? 'active' : ''}`}
    p 内容

div class={theme()}
    p 主题内容

style
.container {
    padding 16px
}

.container.active {
    border-color #007bff
}

.light {
    background white
    color black
}

.dark {
    background #1a1a1a
    color white
}
```

### 动态 style

```nui
color = signal('red')
size = signal(16)

view
div style={`color: ${color()}; font-size: ${size()}px`}
    p 动态样式

style
// 静态样式
```

## 常用布局

### Flexbox

```nui
style
.flex-container {
    display flex
    flex-direction row
    justify-content space-between
    align-items center
    gap 16px
}

.flex-item {
    flex 1
}

.flex-center {
    display flex
    justify-content center
    align-items center
}
```

### Grid

```nui
style
.grid-container {
    display grid
    grid-template-columns repeat(3 1fr)
    grid-gap 16px
}

.grid-span-2 {
    grid-column span 2
}

.grid-span-3 {
    grid-column span 3
}
```

## 最佳实践

### 使用语义化类名

```nui
// ✅ 好：语义化
style
.navbar { }
.sidebar { }
.main-content { }
.card-title { }

// ❌ 避免：表现性命名
style
.red-text { }
.big-font { }
.left-panel { }
```

### 避免过度嵌套

```nui
// ✅ 好：扁平结构
style
.card { }
.card-title { }
.card-content { }

// ❌ 避免：深层嵌套
style
.container .wrapper .section .card .title { }
```

### 使用简写属性

```nui
// ✅ 好：简写
style
.element {
    margin 8px 16px
    padding 4px 8px
    border 1px solid #ddd
}

// ❌ 避免：分开写
style
.element {
    margin-top 8px
    margin-right 16px
    margin-bottom 8px
    margin-left 16px
}
```

## 完整示例

```nui
theme = signal('light')

function toggleTheme() {
    theme.update(t => t === 'light' ? 'dark' : 'light')
}

view
div class={`app ${theme()}`}
    header class="header"
        h1 My App
        button class="theme-toggle" @click=toggleTheme
            {theme() === 'light' ? '🌙' : '☀️'}

    main class="main"
        section class="hero"
            h2 Welcome
            p 这是一个完整示例

        section class="features"
            div class="feature-card"
                h3 特性 1
                p 描述文字
            div class="feature-card"
                h3 特性 2
                p 描述文字
            div class="feature-card"
                h3 特性 3
                p 描述文字

    footer class="footer"
        p © 2024 My App

style
// CSS 变量
:root {
    --primary-color #007bff
    --text-color-light #333
    --text-color-dark #f0f0f0
    --bg-light #ffffff
    --bg-dark #1a1a1a
    --card-bg-light #f9f9f9
    --card-bg-dark #2a2a2a
}

// 应用容器
.app {
    min-height 100vh
    transition background-color 0.3s color 0.3s
}

.app.light {
    background-color var(--bg-light)
    color var(--text-color-light)
}

.app.dark {
    background-color var(--bg-dark)
    color var(--text-color-dark)
}

// 头部
.header {
    display flex
    justify-content space-between
    align-items center
    padding 16px 24px
    border-bottom 1px solid currentColor
}

.header h1 {
    font-size 24px
    margin 0
}

.theme-toggle {
    padding 8px 16px
    background transparent
    border 1px solid currentColor
    border-radius 4px
    cursor pointer
    font-size 20px
}

// 主内容
.main {
    max-width 1200px
    margin 0 auto
    padding 40px 24px
}

// 英雄区
.hero {
    text-align center
    margin-bottom 60px
}

.hero h2 {
    font-size 48px
    margin-bottom 16px
}

.hero p {
    font-size 18px
    opacity 0.8
}

// 特性卡片
.features {
    display grid
    grid-template-columns repeat(auto-fit minmax(280px 1fr))
    gap 24px
}

.feature-card {
    padding 24px
    border-radius 8px
    transition transform 0.2s box-shadow 0.2s
}

.light .feature-card {
    background-color var(--card-bg-light)
}

.dark .feature-card {
    background-color var(--card-bg-dark)
}

.feature-card:hover {
    transform translateY(-4px)
    box-shadow 0 8px 24px rgba(0 0 0 0.1)
}

.feature-card h3 {
    font-size 20px
    margin-bottom 12px
}

.feature-card p {
    opacity 0.8
    line-height 1.6
}

// 页脚
.footer {
    text-align center
    padding 24px
    opacity 0.6
}
```

## 下一步

- [元素与属性](elements.md) - HTML/SVG 元素与属性绑定
- [条件渲染](conditionals.md) - if/elif/else 条件渲染
- [列表渲染](lists.md) - for 循环渲染