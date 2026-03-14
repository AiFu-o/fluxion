# 插槽

插槽（Slots）用于向组件传递模板内容，实现内容分发。

## 默认插槽

### 基本用法

```nui
// Card.nui
view
div class="card"
    slot

style
.card {
    padding 16px
    border-radius 8px
    box-shadow 0 2px 8px rgba(0, 0, 0, 0.1)
}
```

```nui
// 父组件
import Card from "./Card.nui"

view
div
    Card
        p 这是卡片内容
        button 点击我
```

### 默认内容

```nui
// Button.nui
view
button
    slot
        点击  // 默认内容

style
button {
    padding 8px 16px
}
```

```nui
// 父组件
import Button from "./Button.nui"

view
div
    Button  // 显示 "点击"
    Button 自定义文字  // 显示 "自定义文字"
```

## 具名插槽

### 定义插槽

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

style
.layout {
    min-height 100vh
    display flex
    flex-direction column
}

header, footer {
    padding 16px
    background #f5f5f5
}

main {
    flex 1
    padding 16px
}
```

### 使用具名插槽

```nui
// 父组件
import Layout from "./Layout.nui"

view
Layout
    template slot="header"
        h1 网站标题
        nav 导航栏

    p 这是主要内容

    template slot="footer"
        p 版权所有 © 2024
```

## 作用域插槽

作用域插槽允许子组件向插槽传递数据。

### 基本用法

```nui
// List.nui
view
ul
    for item in items
        li
            slot item={item} index={index}
```

```nui
// 父组件
import List from "./List.nui"

items = signal([
    { id: 1, name: 'Apple' },
    { id: 2, name: 'Banana' }
])

view
List items={items}
    template #default={item, index}
        span {index + 1}. {item.name}
        button @click={() => deleteItem(item.id)} 删除
```

### 完整示例

```nui
// Table.nui
view
table
    thead
        tr
            for column in columns
                th {column.title}
    tbody
        for row in data
            tr
                for column in columns
                    td
                        slot name="cell" row={row} column={column}
                            {row[column.key]}

style
table {
    width 100%
    border-collapse collapse
}

th, td {
    padding 8px
    border 1px solid #ddd
}
```

```nui
// 父组件
import Table from "./Table.nui"

columns = signal([
    { key: 'name', title: '姓名' },
    { key: 'age', title: '年龄' }
])

data = signal([
    { name: '张三', age: 25 },
    { name: '李四', age: 30 }
])

view
Table columns={columns} data={data}
    template #cell={row, column}
        if column.key === 'age'
            span {row.age} 岁
        else
            span {row.name}
```

## 插槽 API

### 在 JavaScript 中访问插槽

```javascript
import { h } from 'fluxion'

export const Card = {
    setup(props, { slots }) {
        return () => h('div', { class: 'card' }, [
            // 默认插槽
            slots.default ? slots.default() : 'Default content',

            // 具名插槽
            slots.header && slots.header(),
            slots.footer && slots.footer()
        ])
    }
}
```

### 作用域插槽

```javascript
export const List = {
    props: ['items'],

    setup(props, { slots }) {
        return () => h('ul', null,
            props.items.map((item, index) =>
                h('li', null,
                    slots.default ?
                    slots.default({ item, index }) :
                    JSON.stringify(item)
                )
            )
        )
    }
}
```

## 高级用法

### 条件插槽

```nui
// Card.nui
view
div class="card"
    if $slots.header
        div class="card-header"
            slot name="header"
    div class="card-body"
        slot
    if $slots.footer
        div class="card-footer"
            slot name="footer"
```

### 递归组件

```nui
// TreeNode.nui
view
div class="tree-node"
    div class="node-content"
        slot node={node}
    if node.children
        div class="children"
            for child in node.children
                TreeNode node={child}
                    template #default={node}
                        slot node={node}
```

## 最佳实践

### 插槽命名

```nui
// ✅ 好：语义化命名
slot name="header"
slot name="footer"
slot name="sidebar"

// ❌ 避免：无意义命名
slot name="slot1"
slot name="slot2"
```

### 提供默认内容

```nui
// ✅ 好：有默认内容
slot
    加载中...

// ✅ 好：有条件默认
if items.length
    slot
else
    p 暂无数据
```

### 作用域插槽参数命名

```nui
// ✅ 好：清晰命名
template #default={item, index}
    // ...

// ❌ 避免：模糊命名
template #default={data}
    // ...
```

## 完整示例

### 可复用卡片组件

```nui
// Card.nui
view
div class="card"
    if title
        div class="card-header"
            h3 {title}
            if $slots.actions
                div class="card-actions"
                    slot name="actions"
    div class="card-body"
        slot
            p No content
    if $slots.footer
        div class="card-footer"
            slot name="footer"

style
.card {
    background white
    border-radius 8px
    box-shadow 0 2px 8px rgba(0, 0, 0, 0.1)
    overflow hidden
}

.card-header {
    padding 16px
    border-bottom 1px solid #eee
    display flex
    justify-content space-between
    align-items center
}

.card-body {
    padding 16px
}

.card-footer {
    padding 16px
    border-top 1px solid #eee
    background #f9f9f9
}
```

```nui
// 父组件
import Card from "./Card.nui"

view
div class="app"
    Card title="用户信息"
        template #actions
            button 编辑
            button 删除
        p 姓名：张三
        p 年龄：25岁
        template #footer
            small 最后更新：2024-01-01
```

## 下一步

- [生命周期](lifecycle.md) - 组件生命周期
- [事件发射](events.md) - 组件事件系统
- [Props 传递](props.md) - Props 详细用法