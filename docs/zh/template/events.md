# 事件处理

本章介绍如何在 .nui 模板中处理事件。

## 基本用法

### 点击事件

```nui
count = signal(0)

function increment() {
    count.update(c => c + 1)
}

view
div
    p Count: {count}
    button @click=increment
        点击增加
```

### 内联处理器

```nui
count = signal(0)

view
div
    p Count: {count}
    button @click={() => count.update(c => c + 1)}
        增加
    button @click={() => count.update(c => c - 1)}
        减少
```

## 事件参数

### 访问事件对象

```nui
function handleClick(event) {
    console.log('Event:', event)
    console.log('Target:', event.target)
}

view
button @click=handleClick
    点击
```

### 传递参数

```nui
items = signal([
    { id: 1, name: 'Item 1' },
    { id: 2, name: 'Item 2' }
])

function deleteItem(id) {
    items.update(list => list.filter(item => item.id !== id))
}

function handleItemClick(item, event) {
    event.stopPropagation()
    console.log('Item:', item)
}

view
ul
    for item in items
        li key={item.id} @click={(e) => handleItemClick(item, e)}
            span {item.name}
            button @click={() => deleteItem(item.id)}
                删除
```

## 事件类型

### 鼠标事件

```nui
function handleMouseDown(e) { console.log('Mouse down') }
function handleMouseUp(e) { console.log('Mouse up') }
function handleMouseEnter(e) { console.log('Mouse enter') }
function handleMouseLeave(e) { console.log('Mouse leave') }
function handleMouseMove(e) { console.log('Mouse move') }

view
div
    @mousedown=handleMouseDown
    @mouseup=handleMouseUp
    @mouseenter=handleMouseEnter
    @mouseleave=handleMouseLeave
    @mousemove=handleMouseMove
    悬停在此区域
```

### 键盘事件

```nui
text = signal('')

function handleKeyDown(e) {
    if (e.key === 'Enter') {
        console.log('Enter pressed')
    }
}

function handleKeyUp(e) {
    console.log('Key up:', e.key)
}

view
div
    input
        type="text"
        @keydown=handleKeyDown
        @keyup=handleKeyUp
        value={text}
    p 你输入了: {text}
```

### 表单事件

```nui
email = signal('')
password = signal('')

function handleInput(e) {
    email.set(e.target.value)
}

function handleChange(e) {
    console.log('Changed:', e.target.value)
}

function handleSubmit(e) {
    e.preventDefault()
    console.log('Submit:', { email: email(), password: password() })
}

view
form @submit=handleSubmit
    input
        type="email"
        value={email}
        @input=handleInput
        @change=handleChange
    input
        type="password"
        @input={(e) => password.set(e.target.value)}
    button type="submit"
        登录
```

### 焦点事件

```nui
isFocused = signal(false)

function handleFocus() {
    isFocused.set(true)
}

function handleBlur() {
    isFocused.set(false)
}

view
div
    input
        @focus=handleFocus
        @blur=handleBlur
    p {isFocused() ? '已聚焦' : '未聚焦'}
```

## 事件修饰符

### .prevent

阻止默认行为：

```nui
function handleSubmit(e) {
    // 无需 e.preventDefault()，修饰符已处理
    console.log('Submit')
}

view
form @submit.prevent=handleSubmit
    input type="text"
    button 提交
```

### .stop

阻止事件冒泡：

```nui
function handleOuter() {
    console.log('Outer clicked')
}

function handleInner(e) {
    // 无需 e.stopPropagation()
    console.log('Inner clicked')
}

view
div class="outer" @click=handleOuter
    div class="inner" @click.stop=handleInner
        点击内部
```

### .once

只触发一次：

```nui
view
button @click.once={() => console.log('Only once')}
    只触发一次
```

### .capture

使用捕获模式：

```nui
view
div @click.capture=handleCapture
    div @click=handleBubble
        点击测试
```

### .self

只当事件在该元素本身触发时触发：

```nui
view
div @click.self=handleSelf
    p 点击我不会触发
    button 点击我会触发
```

### 组合修饰符

```nui
view
form @submit.prevent.stop=handleSubmit
    input type="text"
    button 提交
```

## 按键修饰符

### 按键别名

```nui
view
input
    @keydown.enter=handleEnter
    @keydown.esc=handleEsc
    @keydown.tab=handleTab
    @keydown.space=handleSpace
    @keydown.up=handleUp
    @keydown.down=handleDown
    @keydown.left=handleLeft
    @keydown.right=handleRight
```

### 组合按键

```nui
view
input
    @keydown.ctrl.enter=handleCtrlEnter
    @keydown.shift.tab=handleShiftTab
    @keydown.alt.s=handleAltS
    @keydown.meta.enter=handleMetaEnter
```

## 鼠标按钮修饰符

```nui
view
div
    @click.left=handleLeftClick
    @click.right=handleRightClick
    @click.middle=handleMiddleClick
    点击测试
```

## 最佳实践

### 方法命名

```nui
// ✅ 好：动词开头
function handleClick() {}
function handleSubmit() {}
function handleDelete() {}

// ❌ 避免：名词
function button() {}
function form() {}
```

### 避免内联复杂逻辑

```nui
// ❌ 避免：复杂内联逻辑
button @click={() => {
    if (user().isLoggedIn) {
        if (user().hasPermission) {
            doSomething()
        } else {
            showError()
        }
    } else {
        redirectToLogin()
    }
}}

// ✅ 更好：提取方法
function handleAction() {
    if (!user().isLoggedIn) {
        redirectToLogin()
        return
    }
    if (!user().hasPermission) {
        showError()
        return
    }
    doSomething()
}

button @click=handleAction
```

### 事件委托

```nui
// ✅ 好：事件委托
function handleListClick(e) {
    const id = e.target.dataset.id
    if (id) {
        handleItemClick(id)
    }
}

view
ul @click=handleListClick
    for item in items
        li key={item.id} data-id={item.id}
            {item.name}
```

## 完整示例

```nui
// 搜索组件
searchTerm = signal('')
searchResults = signal([])
isLoading = signal(false)
selectedIndex = signal(-1)

async function handleSearch() {
    if (!searchTerm().trim()) return

    isLoading.set(true)
    try {
        const response = await fetch(`/api/search?q=${searchTerm()}`)
        searchResults.set(await response.json())
    } catch (error) {
        console.error('Search failed:', error)
    } finally {
        isLoading.set(false)
    }
}

function handleKeyDown(e) {
    const results = searchResults()
    const index = selectedIndex()

    switch (e.key) {
        case 'ArrowDown':
            e.preventDefault()
            selectedIndex.set(Math.min(index + 1, results.length - 1))
            break
        case 'ArrowUp':
            e.preventDefault()
            selectedIndex.set(Math.max(index - 1, 0))
            break
        case 'Enter':
            if (index >= 0 && results[index]) {
                selectItem(results[index])
            }
            break
        case 'Escape':
            searchResults.set([])
            selectedIndex.set(-1)
            break
    }
}

function selectItem(item) {
    console.log('Selected:', item)
    searchTerm.set(item.name)
    searchResults.set([])
    selectedIndex.set(-1)
}

view
div class="search"
    div class="search-input"
        input
            type="text"
            value={searchTerm}
            @input={(e) => searchTerm.set(e.target.value)}
            @keydown=handleKeyDown
            placeholder="搜索..."
        button @click=handleSearch disabled={isLoading}
            {isLoading() ? '搜索中...' : '搜索'}

    if searchResults().length > 0
        ul class="search-results"
            for item, index in searchResults
                li
                    key={item.id}
                    class={index === selectedIndex() ? 'selected' : ''}
                    @click={() => selectItem(item)}
                    {item.name}

style
.search {
    max-width 400px
    margin 20px auto
}

.search-input {
    display flex
    gap 8px
}

.search-input input {
    flex 1
    padding 8px
    border 1px solid #ddd
    border-radius 4px
}

.search-input button {
    padding 8px 16px
    background #007bff
    color white
    border none
    border-radius 4px
    cursor pointer
}

.search-input button:disabled {
    background #ccc
    cursor not-allowed
}

.search-results {
    list-style none
    padding 0
    margin 8px 0
    border 1px solid #ddd
    border-radius 4px
}

.search-results li {
    padding 8px
    cursor pointer
}

.search-results li:hover {
    background #f5f5f5
}

.search-results li.selected {
    background #e3f2fd
}
```

## 下一步

- [样式](styles.md) - CSS 样式定义
- [列表渲染](lists.md) - for 循环渲染
- [条件渲染](conditionals.md) - if/elif/else 条件渲染