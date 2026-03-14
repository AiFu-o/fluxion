# Signal API Reference

This chapter details the complete Signal API.

## signal()

Creates a reactive signal.

### Type Signature

```typescript
function signal<T>(value: T): Signal<T>

interface Signal<T> {
    (): T                              // Read value
    set(value: T): void                // Set value
    update(fn: (prev: T) => T): void   // Update based on previous value
}
```

### Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| value | T | Initial value |

### Returns

Returns a Signal object that can be called like a function to get the value.

### Examples

```nui
// Create signal
count = signal(0)
name = signal("Fluxion")
items = signal([1, 2, 3])

// Read value
currentCount = count()
currentName = name()

// Set value
count.set(10)
name.set("New Name")

// Update based on previous value
count.update(c => c + 1)
items.update(list => [...list, list.length + 1])
```

## Signal.set()

Directly set the Signal's value.

### Type Signature

```typescript
signal.set(value: T): void
```

### Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| value | T | New value |

### Examples

```nui
count = signal(0)

function reset() {
    count.set(0)
}

function setValue(newValue) {
    count.set(newValue)
}
```

## Signal.update()

Update Signal based on current value.

### Type Signature

```typescript
signal.update(fn: (prev: T) => T): void
```

### Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| fn | (prev: T) => T | Function receiving current value and returning new value |

### Examples

```nui
count = signal(0)

// Increment update
function increment() {
    count.update(c => c + 1)
}

// Complex update
function addTen() {
    count.update(c => c + 10)
}

// Conditional update
function toggle() {
    isActive.update(v => !v)
}
```

### Object and Array Updates

```nui
user = signal({ name: "John", age: 30 })
items = signal([1, 2, 3])

function updateName(newName) {
    user.update(u => ({ ...u, name: newName }))
}

function addItem(item) {
    items.update(list => [...list, item])
}

function removeItem(index) {
    items.update(list => list.filter((_, i) => i !== index))
}
```

## readonlySignal()

Creates a read-only signal.

### Type Signature

```typescript
function readonlySignal<T>(value: T): () => T
```

### Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| value | T | Initial value |

### Returns

Returns a read-only function that can only read the value, not modify it.

### Examples

```nui
// Create read-only signal
VERSION = readonlySignal("1.0.0")
MAX_COUNT = readonlySignal(100)

// Usage
view
div
    p Version: {VERSION}
    p Max: {MAX_COUNT}

// Following will error
// VERSION.set("2.0.0")  // Error: readonly
```

## unsubscribe()

Unsubscribe an effect from a Signal.

### Type Signature

```typescript
function unsubscribe<T>(signal: Signal<T>, effect: () => void): void
```

### Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| signal | Signal\<T\> | Signal to unsubscribe from |
| effect | () => void | Effect function to unsubscribe |

### Examples

```javascript
import { signal, effect, unsubscribe } from '@fluxion-ui/fluxion'

const count = signal(0)

const dispose = effect(() => {
    console.log('Count changed:', count())
})

// Unsubscribe
unsubscribe(count, dispose)
```

## Usage Patterns

### Counter Pattern

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
div
    p Count: {count}
    button @click=decrement -1
    button @click=reset Reset
    button @click=increment +1
```

### Form Input Pattern

```nui
username = signal("")
email = signal("")

function updateUsername(e) {
    username.set(e.target.value)
}

function updateEmail(e) {
    email.set(e.target.value)
}

function handleSubmit() {
    console.log('Submit:', { username: username(), email: email() })
}

view
form @submit=handleSubmit
    input type="text" value={username} @input=updateUsername
    input type="email" value={email} @input=updateEmail
    button Submit
```

### List Management Pattern

```nui
items = signal([])
newItem = signal("")

function addItem() {
    if (newItem().trim()) {
        items.update(list => [...list, { id: Date.now(), text: newItem() }])
        newItem.set("")
    }
}

function removeItem(id) {
    items.update(list => list.filter(item => item.id !== id))
}

view
div
    input value={newItem} @input={(e) => newItem.set(e.target.value)}
    button @click=addItem Add
    ul
        for item in items
            li
                span {item.text}
                button @click={() => removeItem(item.id)} Delete
```

### Object State Pattern

```nui
user = signal({
    name: "",
    email: "",
    preferences: {
        theme: "light",
        notifications: true
    }
})

function updateName(name) {
    user.update(u => ({ ...u, name }))
}

function toggleTheme() {
    user.update(u => ({
        ...u,
        preferences: {
            ...u.preferences,
            theme: u.preferences.theme === "light" ? "dark" : "light"
        }
    }))
}

view
div
    input value={user().name} @input={(e) => updateName(e.target.value)}
    button @click=toggleTheme Toggle Theme
    p Theme: {user().preferences.theme}
```

## Type Inference

Signal fully supports TypeScript type inference:

```typescript
import { signal } from '@fluxion-ui/fluxion'

// Automatic type inference
const count = signal(0)        // Signal<number>
const name = signal("test")    // Signal<string>
const isActive = signal(true)  // Signal<boolean>

// Explicit type annotation
interface User {
    id: number
    name: string
}

const user = signal<User>({ id: 1, name: "John" })

// Read value
const currentUser: User = user()

// Set value
user.set({ id: 2, name: "Jane" })

// Update value
user.update(u => ({ ...u, name: "Updated" }))
```

## Next Steps

- [Computed Properties](computed.md) - Derived state
- [Effect](effect.md) - Reactive side effects
- [Watch](watch.md) - State watching