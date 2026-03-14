# 第一个应用

本章节将带你创建第一个 Fluxion 应用，帮助你理解框架的基本概念和工作方式。

## Hello World

让我们从最简单的 "Hello World" 开始：

### src/App.nui

```nui
view
div
	h1 Hello World
	p Welcome to Fluxion!
```

### src/main.js

```javascript
import { createApp } from 'fluxion'
import App from './App.nui'

createApp(App).mount('#app')
```

这个简单的应用会在页面上显示一个标题和一段欢迎文字。

## 理解 .nui 文件

`.nui` 文件是 Fluxion 的核心，它使用简洁的 DSL 描述 UI。让我们逐步理解：

### view 块

`view` 块定义了组件的模板结构：

```nui
view
div
	h1 标题
	p 段落内容
```

- 使用**缩进**表示嵌套关系
- 元素名称在行首，内容跟在后面
- Tab 缩进表示父子关系

### 元素声明

```nui
div              # 简单元素
h1 标题内容       # 带文本内容
p {message}      # 带插值表达式
button @click=handleClick  # 带事件绑定
```

## 添加交互

让我们创建一个计数器应用：

```nui
count = signal(0)

function increment() {
	count.update(c => c + 1)
}

function decrement() {
	count.update(c => c - 1)
}

view
div
	h1 计数器
	p 当前计数: {count}
	button @click=decrement
		减少
	button @click=increment
		增加

style
div {
	text-align center
	padding 20px
}

h1 {
	color #333
}

p {
	font-size 18px
	margin 20px 0
}

button {
	padding 8px 16px
	margin 0 4px
	background-color #007bff
	color white
	border none
	border-radius 4px
	cursor pointer
}

button:hover {
	background-color #0056b3
}
```

### 代码解析

#### Signal 声明

```nui
count = signal(0)
```

创建一个响应式状态，初始值为 `0`。当 `count` 改变时，使用它的 UI 会自动更新。

#### 函数声明

```nui
function increment() {
	count.update(c => c + 1)
}
```

定义一个函数来更新 `count` 的值。`update` 方法接收一个函数，参数是当前值，返回新值。

#### 插值表达式

```nui
p 当前计数: {count}
```

使用 `{count}` 将信号值插入到文本中。信号会自动被调用，等价于 `count()`。

#### 事件绑定

```nui
button @click=increment
```

使用 `@click` 绑定点击事件，值为要调用的函数名。

#### 样式

```nui
style
button {
	padding 8px 16px
	background-color #007bff
}
```

在 `style` 块中定义 CSS 样式。使用简化的 CSS 语法：
- 属性和值用空格分隔
- 不需要分号结尾

## 条件渲染

使用 `if`/`elif`/`else` 进行条件渲染：

```nui
count = signal(0)

view
div
	if count() < 0
		p style="color: red" 负数
	elif count() === 0
		p 零
	else
		p style="color: green" 正数
```

## 列表渲染

使用 `for` 循环渲染列表：

```nui
items = signal(['Apple', 'Banana', 'Orange'])

view
ul
	for item in items
		li {item}
```

## 组件复用

创建可复用的组件：

### src/Button.nui

```nui
view
button @click=onClick
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

### src/App.nui

```nui
import Button from "./Button.nui"

count = signal(0)

function increment() {
	count.update(c => c + 1)
}

view
div
	p Count: {count}
	Button text="Increment" onClick={increment}
```

## 运行和调试

### 开发模式

```bash
pnpm dev
```

开发模式下：
- 支持热更新 (HMR)
- 修改 `.nui` 文件自动刷新
- 控制台显示详细错误信息

### 常见问题

#### 1. 缩进错误

`.nui` 文件使用 Tab 缩进，确保：
- 使用 Tab 而不是空格
- 缩进层级一致

#### 2. Signal 未更新

确保使用 `.set()` 或 `.update()` 更新值：

```nui
# 错误
count = count() + 1

# 正确
count.update(c => c + 1)
```

#### 3. 事件未触发

确保函数名正确，且函数已定义：

```nui
# 确保函数已定义
function handleClick() {
	# ...
}

# 事件绑定使用函数名
button @click=handleClick
```

## 下一步

- [.nui 文件结构](../core-concepts/nui-file-structure.md) - 深入了解 .nui 文件
- [Signal 响应式状态](../core-concepts/signal.md) - 学习响应式系统
- [组件基础](../core-concepts/component-basics.md) - 掌握组件开发