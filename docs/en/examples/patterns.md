# Common Patterns

This section introduces common development patterns and best practices in Fluxion.

---

## Counter Pattern

The most basic reactive pattern.

```nui
count = signal(0)

function increment() {
    count.update(c => c + 1)
}

function decrement() {
    count.update(c => c - 1)
}

function reset() {
    count.set(0)
}

view
div.counter
    h1 Count: {count}
    div.buttons
        button @click=decrement -1
        button @click=reset Reset
        button @click=increment +1

style
.counter {
    text-align center
    padding 20px
}
.buttons {
    display flex
    gap 10px
    justify-content center
}
button {
    padding 8px 16px
    font-size 16px
}
```

---

## Form Handling Pattern

### Basic Form

```nui
username = signal("")
email = signal("")
submitted = signal(false)

function handleSubmit(e) {
    e.preventDefault()
    submitted.set(true)
    console.log('Submitted:', { username: username(), email: email() })
}

view
form @submit=handleSubmit
    div.form-group
        label Username
        input type="text" value={username} @input={(e) => username.set(e.target.value)}

    div.form-group
        label Email
        input type="email" value={email} @input={(e) => email.set(e.target.value)}

    button type="submit" Submit

    if submitted()
        p.success Form submitted successfully!
```

### Form with Validation

```nui
import { computed } from 'fluxion'

username = signal("")
email = signal("")
errors = signal({})

// Validation
usernameError = computed(() => {
    const value = username()
    if (!value) return "Username is required"
    if (value.length < 3) return "Username must be at least 3 characters"
    return null
})

emailError = computed(() => {
    const value = email()
    if (!value) return "Email is required"
    if (!value.includes('@')) return "Invalid email format"
    return null
})

isValid = computed(() => {
    return !usernameError() && !emailError()
})

function handleSubmit(e) {
    e.preventDefault()
    if (isValid()) {
        console.log('Valid form submitted')
    }
}

view
form @submit=handleSubmit
    div.form-group
        label Username
        input value={username} @input={(e) => username.set(e.target.value)}
        if usernameError()
            span.error {usernameError()}

    div.form-group
        label Email
        input type="email" value={email} @input={(e) => email.set(e.target.value)}
        if emailError()
            span.error {emailError()}

    button type="submit" disabled={!isValid()} Submit
```

---

## List Management Pattern

### Add and Delete

```nui
items = signal([])
newItem = signal("")

function addItem() {
    const text = newItem().trim()
    if (text) {
        items.update(list => [...list, { id: Date.now(), text, done: false }])
        newItem.set("")
    }
}

function removeItem(id) {
    items.update(list => list.filter(item => item.id !== id))
}

function toggleItem(id) {
    items.update(list =>
        list.map(item =>
            item.id === id ? { ...item, done: !item.done } : item
        )
    )
}

view
div.todo-app
    div.input-group
        input value={newItem} @input={(e) => newItem.set(e.target.value)} @keyup.enter=addItem placeholder="Add item..."
        button @click=addItem Add

    ul.item-list
        for item in items
            li key={item.id} class={item.done ? 'done' : ''}
                input type="checkbox" checked={item.done} @change={() => toggleItem(item.id)}
                span {item.text}
                button @click={() => removeItem(item.id)} Delete

style
.done span {
    text-decoration line-through
    color #999
}
```

### Filter and Sort

```nui
items = signal([
    { id: 1, name: "Apple", category: "fruit", price: 1.5 },
    { id: 2, name: "Banana", category: "fruit", price: 0.8 },
    { id: 3, name: "Carrot", category: "vegetable", price: 0.5 }
])

filter = signal("")
category = signal("all")
sortBy = signal("name")

filteredItems = computed(() => {
    let result = items()

    // Filter
    if (filter()) {
        result = result.filter(item =>
            item.name.toLowerCase().includes(filter().toLowerCase())
        )
    }

    // Category
    if (category() !== "all") {
        result = result.filter(item => item.category === category())
    }

    // Sort
    result = [...result].sort((a, b) => {
        if (sortBy() === "name") return a.name.localeCompare(b.name)
        if (sortBy() === "price") return a.price - b.price
        return 0
    })

    return result
})

view
div.list-manager
    div.filters
        input value={filter} @input={(e) => filter.set(e.target.value)} placeholder="Search..."

        select value={category} @change={(e) => category.set(e.target.value)}
            option value="all" All
            option value="fruit" Fruits
            option value="vegetable" Vegetables

        select value={sortBy} @change={(e) => sortBy.set(e.target.value)}
            option value="name" Sort by Name
            option value="price" Sort by Price

    ul
        for item in filteredItems
            li key={item.id}
                span {item.name} - ${item.price}
```

---

## Async Data Pattern

### Data Fetching

```nui
import { asyncSignal } from 'fluxion'

users = asyncSignal(() =>
    fetch('/api/users').then(r => r.json())
)

function refresh() {
    users.reload()
}

view
div.user-list
    if users.loading()
        p.loading Loading users...

    elif users.error()
        p.error Error: {users.error().message}
        button @click=refresh Retry

    else
        h2 Users ({users().length})
        button @click=refresh Refresh
        ul
            for user in users
                li key={user.id} {user.name}
```

### Paginated Loading

```nui
import { asyncSignal, signal, computed } from 'fluxion'

page = signal(1)
pageSize = signal(10)

data = asyncSignal(() =>
    fetch(`/api/items?page=${page()}&size=${pageSize()}`).then(r => r.json())
)

totalPages = computed(() => {
    const d = data()
    return d ? Math.ceil(d.total / pageSize()) : 0
})

function nextPage() {
    if (page() < totalPages()) {
        page.update(p => p + 1)
        data.reload()
    }
}

function prevPage() {
    if (page() > 1) {
        page.update(p => p - 1)
        data.reload()
    }
}

view
div.paginated-list
    if data.loading()
        p Loading...

    elif data()
        ul
            for item in data().items
                li key={item.id} {item.name}

        div.pagination
            button @click=prevPage disabled={page() <= 1} Previous
            span Page {page()} of {totalPages()}
            button @click=nextPage disabled={page() >= totalPages()} Next
```

---

## State Management Pattern

### Global State

```nui
// store.nui
import { signal, computed } from 'fluxion'

// Global state
user = signal(null)
cart = signal([])
theme = signal('light')

// Computed properties
isLoggedIn = computed(() => !!user())
cartCount = computed(() => cart().reduce((sum, item) => sum + item.quantity, 0))

// Actions
function login(userData) {
    user.set(userData)
}

function logout() {
    user.set(null)
    cart.set([])
}

function addToCart(product) {
    cart.update(items => {
        const existing = items.find(i => i.id === product.id)
        if (existing) {
            return items.map(i =>
                i.id === product.id
                    ? { ...i, quantity: i.quantity + 1 }
                    : i
            )
        }
        return [...items, { ...product, quantity: 1 }]
    })
}

function removeFromCart(productId) {
    cart.update(items => items.filter(i => i.id !== productId))
}

// Export
export { user, cart, theme, isLoggedIn, cartCount, login, logout, addToCart, removeFromCart }
```

### Using Global State

```nui
import { user, isLoggedIn, cartCount, login, logout, addToCart } from './store.nui'

view
header
    if isLoggedIn()
        span Welcome, {user().name}
        span Cart: {cartCount} items
        button @click=logout Logout
    else
        button @click={() => login({ name: 'Guest' })} Login
```

---

## Component Communication Pattern

### Props Down

```nui
// Parent.nui
import Child from './Child.nui'

message = signal("Hello from parent")

view
div
    h1 Parent Component
    Child message={message}

// Child.nui
view
div
    h2 Child Component
    p Message: {message}
```

### Events Up

```nui
// Parent.nui
import Child from './Child.nui'

receivedMessage = signal("")

function handleMessage(msg) {
    receivedMessage.set(msg)
}

view
div
    h1 Parent
    p Received: {receivedMessage}
    Child onMessage={handleMessage}

// Child.nui
function send() {
    onMessage("Hello from child!")
}

view
div
    h2 Child
    button @click=send Send Message
```

### Slot Pattern

```nui
// Card.nui
view
div.card
    div.header
        if title
            h3 {title}
    div.body
        // Default slot
        slot
    div.footer
        // Named slot
        slot name="footer"

// App.nui
import Card from './Card.nui'

view
Card title="My Card"
    p This goes in the body
    slot name="footer"
        button Action
```

---

## Two-Way Binding Pattern

```nui
// Two-way binding helper
function bindSignal(s) {
    return {
        value: s(),
        onInput: (e) => s.set(e.target.value)
    }
}

name = signal("")
email = signal("")

view
form
    input value={name} @input={(e) => name.set(e.target.value)}
    input value={email} @input={(e) => email.set(e.target.value)}

    p Name: {name}
    p Email: {email}
```

---

## Debounce and Throttle Pattern

```nui
import { signal, computed } from 'fluxion'

searchTerm = signal("")
debouncedSearch = signal("")

// Debounce timer
debounceTimer = signal(null)

function handleSearch(e) {
    const value = e.target.value
    searchTerm.set(value)

    // Clear previous timer
    if (debounceTimer()) {
        clearTimeout(debounceTimer())
    }

    // Set new timer
    debounceTimer.set(
        setTimeout(() => {
            debouncedSearch.set(value)
        }, 300)
    )
}

// Search results
results = asyncSignal(() => {
    if (!debouncedSearch()) return []
    return fetch(`/api/search?q=${debouncedSearch()}`).then(r => r.json())
})

view
div.search
    input value={searchTerm} @input=handleSearch placeholder="Search..."
    if results.loading()
        p Searching...
    else
        for result in results
            p key={result.id} {result.name}
```

---

## Next Steps

- [Complete Examples](complete-examples.md) - See complete application examples
- [Debugging Tips](debugging.md) - Learn debugging methods