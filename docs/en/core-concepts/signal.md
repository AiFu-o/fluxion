# Signal Reactive State

Signal is the core of Fluxion's reactivity system, providing a simple yet powerful way to manage state.

## What is a Signal?

A Signal is a reactive data container that automatically notifies all places using it to update when its value changes.

```nui
count = signal(0)

view
div
    p Count: {count}
    button @click={() => count.update(c => c + 1)}
        Increment
```

When the button is clicked, `count` changes and the content in the `p` tag updates automatically.

## Signal vs Traditional State

### Traditional Approach

```javascript
// Traditional: manual update trigger needed
let count = 0

function increment() {
    count++
    updateUI() // Manual update call
}

function updateUI() {
    document.querySelector('p').textContent = `Count: ${count}`
}
```

### Signal Approach

```nui
// Signal: automatic tracking and updates
count = signal(0)

function increment() {
    count.update(c => c + 1) // Auto-updates UI
}

view
p Count: {count}
button @click=increment
    Increment
```

**Advantages:**

1. **Automatic Tracking**: No manual dependency management
2. **Fine-grained Updates**: Only parts using the signal update
3. **Cleaner Code**: Less boilerplate

## Creating Signals

### Primitive Types

```nui
// Numbers
count = signal(0)
price = signal(99.99)

// Strings
name = signal("Fluxion")
message = signal("")

// Booleans
isActive = signal(true)
isLoading = signal(false)

// null and undefined
value = signal(null)
data = signal(undefined)
```

### Complex Types

```nui
// Objects
user = signal({
    name: "John",
    age: 30,
    email: "john@example.com"
})

// Arrays
items = signal([1, 2, 3, 4, 5])
users = signal([
    { id: 1, name: "Alice" },
    { id: 2, name: "Bob" }
])

// Map and Set
mapData = signal(new Map([['key', 'value']]))
setData = signal(new Set([1, 2, 3]))
```

## Reading Values

### In Templates

```nui
count = signal(42)
name = signal("Fluxion")

view
div
    // Use signal name directly, auto-called
    p Count: {count}
    p Name: {name}

    // Use in expressions
    p Double: {count() * 2}
    p Greeting: Hello, {name()}
```

### In Functions

```nui
count = signal(0)

function logCount() {
    // Use function call to get value
    console.log('Current count:', count())
}

function doubleCount() {
    return count() * 2
}
```

## Updating Values

### set Method

Directly set a new value:

```nui
count = signal(0)

function reset() {
    count.set(0)
}

function setToTen() {
    count.set(10)
}
```

### update Method

Update based on current value:

```nui
count = signal(0)

function increment() {
    count.update(c => c + 1)
}

function decrement() {
    count.update(c => c - 1)
}

function double() {
    count.update(c => c * 2)
}
```

### Updating Objects and Arrays

```nui
user = signal({ name: "John", age: 30 })
items = signal([1, 2, 3])

function updateName() {
    // Update object property
    user.update(u => ({ ...u, name: "Jane" }))
}

function addItem() {
    // Add array element
    items.update(list => [...list, list.length + 1])
}

function removeItem(index) {
    // Remove array element
    items.update(list => list.filter((_, i) => i !== index))
}
```

## Reactivity Principle

Signal is based on the "publish-subscribe" pattern:

```
┌─────────────┐
│   Signal    │
│   count=0   │
└──────┬──────┘
       │
       ▼
┌─────────────┐     ┌─────────────┐
│  Subscriber │     │  Subscriber │
│  (template) │     │  (computed) │
└─────────────┘     └─────────────┘
       │                   │
       ▼                   ▼
  Auto-update UI     Auto-recalculate
```

### Dependency Collection

```nui
a = signal(1)
b = signal(2)

// Auto-collects dependencies: recalculates when a or b changes
function sum() {
    return a() + b()
}

view
p Sum: {a() + b()}
```

### Update Trigger

```nui
count = signal(0)

view
div
    p Count: {count}
    button @click={() => count.update(c => c + 1)}
        Increment
```

When button is clicked:
1. `count.update(c => c + 1)` updates the value
2. Notifies all subscribers
3. Template re-renders related parts

## Important Notes

### Don't Modify Value Directly

```nui
// ❌ Wrong: Direct assignment won't trigger update
count = signal(0)
count = 1  // This creates a new variable, doesn't update signal

// ✅ Correct: Use set or update
count.set(1)
count.update(c => c + 1)
```

### Use Parentheses in Functions

```nui
count = signal(0)

function getValue() {
    // ✅ Correct: Use parentheses to get value
    return count()
}

// In templates, parentheses can be omitted
view
p {count}  // Equivalent to {count()}
```

### Create New References for Object Updates

```nui
user = signal({ name: "John" })

// ❌ Wrong: Direct modification won't trigger update
function wrongUpdate() {
    user().name = "Jane"  // Modifies original object
}

// ✅ Correct: Create new object
function correctUpdate() {
    user.update(u => ({ ...u, name: "Jane" }))
}
```

## Next Steps

- [Signal API](../reactivity/signal-api.md) - Complete Signal API reference
- [Computed Properties](../reactivity/computed.md) - Derived state
- [Effect](../reactivity/effect.md) - Reactive side effects