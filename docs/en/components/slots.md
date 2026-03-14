# Slots

Slots are used to pass template content to components for content distribution.

## Default Slot

### Basic Usage

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
// Parent component
import Card from "./Card.nui"

view
div
    Card
        p This is card content
        button Click me
```

### Default Content

```nui
// Button.nui
view
button
    slot
        Click  // Default content

style
button {
    padding 8px 16px
}
```

```nui
// Parent component
import Button from "./Button.nui"

view
div
    Button  // Shows "Click"
    Button Custom text  // Shows "Custom text"
```

## Named Slots

### Defining Slots

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

### Using Named Slots

```nui
// Parent component
import Layout from "./Layout.nui"

view
Layout
    template slot="header"
        h1 Website Title
        nav Navigation

    p This is main content

    template slot="footer"
        p Copyright © 2024
```

## Scoped Slots

Scoped slots allow child components to pass data to slots.

### Basic Usage

```nui
// List.nui
view
ul
    for item in items
        li
            slot item={item} index={index}
```

```nui
// Parent component
import List from "./List.nui"

items = signal([
    { id: 1, name: 'Apple' },
    { id: 2, name: 'Banana' }
])

view
List items={items}
    template #default={item, index}
        span {index + 1}. {item.name}
        button @click={() => deleteItem(item.id)} Delete
```

### Complete Example

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
// Parent component
import Table from "./Table.nui"

columns = signal([
    { key: 'name', title: 'Name' },
    { key: 'age', title: 'Age' }
])

data = signal([
    { name: 'John', age: 25 },
    { name: 'Jane', age: 30 }
])

view
Table columns={columns} data={data}
    template #cell={row, column}
        if column.key === 'age'
            span {row.age} years
        else
            span {row.name}
```

## Slots API

### Accessing Slots in JavaScript

```javascript
import { h } from 'fluxion'

export const Card = {
    setup(props, { slots }) {
        return () => h('div', { class: 'card' }, [
            // Default slot
            slots.default ? slots.default() : 'Default content',

            // Named slots
            slots.header && slots.header(),
            slots.footer && slots.footer()
        ])
    }
}
```

### Scoped Slots

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

## Advanced Usage

### Conditional Slots

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

### Recursive Components

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

## Best Practices

### Slot Naming

```nui
// ✅ Good: Semantic naming
slot name="header"
slot name="footer"
slot name="sidebar"

// ❌ Avoid: Meaningless naming
slot name="slot1"
slot name="slot2"
```

### Provide Default Content

```nui
// ✅ Good: Has default content
slot
    Loading...

// ✅ Good: Conditional default
if items.length
    slot
else
    p No data
```

### Scoped Slot Parameter Naming

```nui
// ✅ Good: Clear naming
template #default={item, index}
    // ...

// ❌ Avoid: Vague naming
template #default={data}
    // ...
```

## Complete Example

### Reusable Card Component

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
// Parent component
import Card from "./Card.nui"

view
div class="app"
    Card title="User Info"
        template #actions
            button Edit
            button Delete
        p Name: John
        p Age: 25
        template #footer
            small Last updated: 2024-01-01
```

## Next Steps

- [Lifecycle](lifecycle.md) - Component lifecycle
- [Events](events.md) - Component event system
- [Props](props.md) - Detailed props usage