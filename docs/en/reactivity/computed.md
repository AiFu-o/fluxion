# Computed Properties

Computed properties are used to derive new values from other reactive states. They have caching characteristics and only recalculate when dependencies change.

## Basic Usage

### Creating Computed Properties

```nui
firstName = signal("John")
lastName = signal("Doe")

// Create computed property
fullName = computed(() => `${firstName()} ${lastName()}`)

view
p Full Name: {fullName}
```

When `firstName` or `lastName` changes, `fullName` automatically recalculates.

### Computed Property Features

1. **Lazy Evaluation**: Only calculates when accessed
2. **Automatic Caching**: Returns cached value when dependencies unchanged
3. **Auto Tracking**: Automatically collects dependencies

## Caching Mechanism

Computed properties cache calculation results and only recalculate when dependencies change:

```nui
a = signal(1)
b = signal(2)

// Computed property
sum = computed(() => {
    console.log('Calculating...')  // Only logs when dependencies change
    return a() + b()
})

view
div
    p Sum: {sum}      // First access, calculates
    p Sum: {sum}      // Uses cache, no recalculation
    p Sum: {sum}      // Uses cache, no recalculation
```

## Use Cases

### Formatting Data

```nui
price = signal(99.99)
quantity = signal(2)

formattedPrice = computed(() => `$${price().toFixed(2)}`)
total = computed(() => `$${(price() * quantity()).toFixed(2)}`)

view
div
    p Price: {formattedPrice}
    p Quantity: {quantity}
    p Total: {total}
```

### Filtering and Sorting

```nui
items = signal([
    { id: 1, name: "Apple", price: 1.5 },
    { id: 2, name: "Banana", price: 0.8 },
    { id: 3, name: "Orange", price: 2.0 }
])
searchTerm = signal("")

filteredItems = computed(() => {
    const term = searchTerm().toLowerCase()
    return items().filter(item =>
        item.name.toLowerCase().includes(term)
    )
})

sortedItems = computed(() => {
    return [...filteredItems()].sort((a, b) => a.price - b.price)
})

view
div
    input placeholder="Search..." @input={(e) => searchTerm.set(e.target.value)}
    ul
        for item in sortedItems
            li {item.name} - ${item.price}
```

### Combining State

```nui
user = signal({ name: "John", age: 30 })
settings = signal({ theme: "dark", lang: "en" })

userDisplay = computed(() => `${user().name} (${user().age} years old)`)
isDarkMode = computed(() => settings().theme === "dark")

view
div class={isDarkMode ? 'dark' : 'light'}
    p {userDisplay}
```

## API Reference

### computed()

Creates a computed property.

```typescript
function computed<T>(getter: () => T): Computed<T>

interface Computed<T> {
    (): T  // Read value
}
```

#### Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| getter | () => T | Calculation function |

#### Examples

```nui
count = signal(0)

double = computed(() => count() * 2)
isEven = computed(() => count() % 2 === 0)
parity = computed(() => isEven() ? 'even' : 'odd')

view
div
    p Count: {count}
    p Double: {double}
    p Is even: {isEven}
    p Parity: {parity}
```

### readonly()

Wraps a computed property as read-only.

```typescript
function readonly<T>(computed: Computed<T>): Computed<T>
```

### isCached()

Checks if computed property has a cached value.

```typescript
function isCached<T>(computed: Computed<T>): boolean
```

### refresh()

Forces refresh of computed property cache.

```typescript
function refresh<T>(computed: Computed<T>): void
```

#### Examples

```nui
import { signal, computed, refresh } from '@fluxion-ui/fluxion'

timestamp = signal(Date.now())
timeDisplay = computed(() => new Date(timestamp()).toLocaleTimeString())

function updateTimestamp() {
    timestamp.set(Date.now())
}

function forceRefresh() {
    // Force recalculation
    refresh(timeDisplay)
}

view
div
    p Time: {timeDisplay}
    button @click=updateTimestamp Update
    button @click=forceRefresh Force Refresh
```

### computedSet()

Creates a writable computed property.

```typescript
function computedSet<T>(getter: () => T, setter: (value: T) => void): Computed<T>
```

#### Examples

```nui
import { signal, computedSet } from '@fluxion-ui/fluxion'

firstName = signal("John")
lastName = signal("Doe")

// Writable computed property
fullName = computedSet(
    () => `${firstName()} ${lastName()}`,
    (value) => {
        const [first, last] = value.split(' ')
        firstName.set(first || '')
        lastName.set(last || '')
    }
)

// Can read
view
p Full Name: {fullName}

// Can also set
function changeName() {
    fullName.set("Jane Smith")
}
```

## Performance Optimization

### Avoid Expensive Calculations

```nui
// ❌ Bad: Expensive operation on every access
heavyResult = computed(() => {
    // Complex calculation
    let result = 0
    for (let i = 0; i < 1000000; i++) {
        result += Math.sqrt(i)
    }
    return result
})

// ✅ Better: Use cached result
data = signal(null)

async function loadHeavyResult() {
    const result = await computeHeavyResult()
    data.set(result)
}
```

### Reasonable Splitting

```nui
// ❌ Bad: One large computed property
userSummary = computed(() => {
    const u = user()
    const s = settings()
    return {
        name: u.name,
        email: u.email,
        theme: s.theme,
        lang: s.lang,
        formattedName: `${u.name} (${u.email})`,
        // ...more calculations
    }
})

// ✅ Better: Split into multiple computed properties
userName = computed(() => user().name)
userEmail = computed(() => user().email)
userTheme = computed(() => settings().theme)
formattedName = computed(() => `${userName()} (${userEmail()})`)
```

## Important Notes

### Avoid Side Effects

Computed properties should be pure functions. Don't execute side effects in computed properties:

```nui
// ❌ Wrong: Side effects in computed property
count = signal(0)
bad = computed(() => {
    console.log('Side effect!')  // Side effect
    fetch('/api/log', { method: 'POST', body: count() })  // Side effect
    return count() * 2
})

// ✅ Correct: Pure calculation
count = signal(0)
double = computed(() => count() * 2)
```

### Avoid Circular Dependencies

```nui
// ❌ Wrong: Circular dependency
a = computed(() => b() + 1)
b = computed(() => a() + 1)  // Infinite loop
```

## Next Steps

- [Effect](effect.md) - Reactive side effects
- [Watch](watch.md) - State watching
- [Reactive Objects](reactive.md) - Reactive objects