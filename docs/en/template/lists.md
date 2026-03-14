# List Rendering

Use `for` loops to render lists of data.

## Basic Usage

### Simple List

```nui
items = signal(['Apple', 'Banana', 'Orange'])

view
ul
    for item in items
        li {item}
```

### With Index

```nui
items = signal(['Apple', 'Banana', 'Orange'])

view
ul
    for item, index in items
        li {index + 1}. {item}
```

## Object Arrays

```nui
users = signal([
    { id: 1, name: 'Alice', email: 'alice@example.com' },
    { id: 2, name: 'Bob', email: 'bob@example.com' },
    { id: 3, name: 'Charlie', email: 'charlie@example.com' }
])

view
table
    thead
        tr
            th ID
            th Name
            th Email
    tbody
        for user in users
            tr
                td {user.id}
                td {user.name}
                td {user.email}
```

## Nested Loops

```nui
categories = signal([
    {
        name: 'Fruits',
        items: ['Apple', 'Banana']
    },
    {
        name: 'Vegetables',
        items: ['Carrot', 'Broccoli']
    }
])

view
div
    for category in categories
        div class="category"
            h3 {category.name}
            ul
                for item in category.items
                    li {item}
```

## key Attribute

Use `key` to help the framework identify list items:

```nui
items = signal([
    { id: 1, text: 'First' },
    { id: 2, text: 'Second' },
    { id: 3, text: 'Third' }
])

view
ul
    for item in items
        li key={item.id} {item.text}
```

### Importance of key

```nui
// ✅ Good: Use unique ID as key
for user in users
    UserCard key={user.id} user={user}

// ❌ Avoid: Use index as key (unless list won't reorder)
for user, index in users
    UserCard key={index} user={user}
```

## Conditional with Lists

```nui
items = signal([
    { id: 1, name: 'Apple', active: true },
    { id: 2, name: 'Banana', active: false },
    { id: 3, name: 'Orange', active: true }
])

view
div
    // Only show active items
    for item in items
        if item.active
            div key={item.id} {item.name}
```

## Event Handling

```nui
items = signal([
    { id: 1, name: 'Item 1' },
    { id: 2, name: 'Item 2' }
])

function handleDelete(id) {
    items.update(list => list.filter(item => item.id !== id))
}

function handleEdit(item) {
    console.log('Edit:', item)
}

view
ul
    for item in items
        li key={item.id}
            span {item.name}
            button @click={() => handleEdit(item)} Edit
            button @click={() => handleDelete(item.id)} Delete
```

## Dynamic List Operations

### Adding Items

```nui
items = signal(['Apple', 'Banana'])
newItem = signal('')

function addItem() {
    if (newItem().trim()) {
        items.update(list => [...list, newItem().trim()])
        newItem.set('')
    }
}

view
div
    input value={newItem} @input={(e) => newItem.set(e.target.value)}
    button @click=addItem Add
    ul
        for item in items
            li {item}
```

### Removing Items

```nui
items = signal([
    { id: 1, name: 'Item 1' },
    { id: 2, name: 'Item 2' }
])

function removeItem(id) {
    items.update(list => list.filter(item => item.id !== id))
}

view
ul
    for item in items
        li key={item.id}
            span {item.name}
            button @click={() => removeItem(item.id)} Delete
```

### Sorting

```nui
items = signal([
    { id: 1, name: 'Banana', price: 2 },
    { id: 2, name: 'Apple', price: 1 },
    { id: 3, name: 'Cherry', price: 3 }
])

sortBy = signal('name')

sortedItems = computed(() => {
    const list = [...items()]
    list.sort((a, b) => {
        if (sortBy() === 'name') {
            return a.name.localeCompare(b.name)
        }
        return a.price - b.price
    })
    return list
})

view
div
    select value={sortBy} @change={(e) => sortBy.set(e.target.value)}
        option value="name" By Name
        option value="price" By Price
    ul
        for item in sortedItems
            li key={item.id} {item.name} - ${item.price}
```

## Object Iteration

```nui
user = signal({
    name: 'John',
    age: 30,
    email: 'john@example.com'
})

view
dl
    for key, value in user
        dt {key}
        dd {value}
```

## Range Loop

```nui
view
div
    // Render 1-5
    for i in [1, 2, 3, 4, 5]
        span {i}
```

## Best Practices

### Use Appropriate key

```nui
// ✅ Good: Use unique identifier
for user in users
    UserCard key={user.id} user={user}

// ❌ Avoid: No key
for user in users
    UserCard user={user}
```

### Avoid Complex Calculations in Loops

```nui
// ❌ Avoid: Calculate on every render
for user in users
    li {formatName(user.name)} - {calculateScore(user)}

// ✅ Better: Preprocess with computed
processedUsers = computed(() =>
    users().map(user => ({
        ...user,
        formattedName: formatName(user.name),
        score: calculateScore(user)
    }))
)

for user in processedUsers
    li {user.formattedName} - {user.score}
```

### Empty List Handling

```nui
items = signal([])

view
div
    if items().length > 0
        ul
            for item in items
                li {item}
    else
        p class="empty" No data
```

## Complete Example

```nui
// Todo App
todos = signal([
    { id: 1, text: 'Learn Fluxion', done: true },
    { id: 2, text: 'Build an app', done: false },
    { id: 3, text: 'Deploy to production', done: false }
])
newTodo = signal('')
filter = signal('all')

function addTodo() {
    if (newTodo().trim()) {
        todos.update(list => [...list, {
            id: Date.now(),
            text: newTodo().trim(),
            done: false
        }])
        newTodo.set('')
    }
}

function toggleTodo(id) {
    todos.update(list =>
        list.map(todo =>
            todo.id === id ? { ...todo, done: !todo.done } : todo
        )
    )
}

function deleteTodo(id) {
    todos.update(list => list.filter(todo => todo.id !== id))
}

filteredTodos = computed(() => {
    const list = todos()
    const f = filter()
    if (f === 'active') return list.filter(t => !t.done)
    if (f === 'done') return list.filter(t => t.done)
    return list
})

remaining = computed(() => todos().filter(t => !t.done).length)

view
div class="todo-app"
    h1 Todo List
    div class="input"
        input
            type="text"
            value={newTodo}
            @input={(e) => newTodo.set(e.target.value)}
            @keydown.enter=addTodo
        button @click=addTodo Add

    div class="filters"
        button
            class={filter() === 'all' ? 'active' : ''}
            @click={() => filter.set('all')}
            All
        button
            class={filter() === 'active' ? 'active' : ''}
            @click={() => filter.set('active')}
            Active
        button
            class={filter() === 'done' ? 'active' : ''}
            @click={() => filter.set('done')}
            Done

    ul class="todo-list"
        for todo in filteredTodos
            li key={todo.id} class={todo.done ? 'done' : ''}
                input
                    type="checkbox"
                    checked={todo.done}
                    @change={() => toggleTodo(todo.id)}
                span {todo.text}
                button @click={() => deleteTodo(todo.id)} Delete

    p class="status" {remaining} items left

style
.todo-app {
    max-width 400px
    margin 20px auto
    padding 20px
}

.input {
    display flex
    gap 8px
    margin-bottom 16px
}

input[type="text"] {
    flex 1
    padding 8px
    border 1px solid #ddd
    border-radius 4px
}

.filters {
    display flex
    gap 8px
    margin-bottom 16px
}

.filters button {
    padding 4px 12px
    border 1px solid #ddd
    background white
    cursor pointer
}

.filters button.active {
    background #007bff
    color white
    border-color #007bff
}

.todo-list {
    list-style none
    padding 0
}

.todo-list li {
    display flex
    align-items center
    gap 8px
    padding 8px
    border-bottom 1px solid #eee
}

.todo-list li.done span {
    text-decoration line-through
    color #999
}

.status {
    text-align center
    color #666
    margin-top 16px
}
```

## Next Steps

- [Event Handling](events.md) - Event binding and handling
- [Styles](styles.md) - CSS style definitions
- [Conditional Rendering](conditionals.md) - if/elif/else conditional rendering