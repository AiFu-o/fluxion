# Debugging Tips

This section introduces debugging methods and common problem solutions for Fluxion applications.

---

## Development Tools

### Browser DevTools

Fluxion applications can be debugged using standard browser development tools:

1. **Console** - View logs and warnings
2. **Elements** - Inspect DOM structure
3. **Sources** - Set breakpoints for debugging
4. **Network** - Check API requests

### Vue DevTools Compatibility

Fluxion's reactivity system is similar to Vue, allowing for similar debugging approaches:

```javascript
// Access signal values in console
const count = signal(0)
count()              // Read current value
count.set(10)        // Set value
```

---

## Logging Debugging

### Using console.log

```nui
count = signal(0)

function increment() {
    console.log('Before:', count())
    count.update(c => c + 1)
    console.log('After:', count())
}

view
button @click=increment Count: {count}
```

### Using debug Function

```javascript
import { debug } from '@fluxion/shared'

// Only outputs in development environment
debug('Current state:', state())
debug('User action:', action)
```

### Monitoring Effect Execution

```javascript
import { effect, signal } from 'fluxion'

const count = signal(0)

const dispose = effect(() => {
    console.log('[Effect] Running, count =', count())
})

// See execution timing
count.set(1)
// [Effect] Running, count = 1
```

---

## Reactivity Debugging

### Tracking Dependencies

```javascript
import { signal, computed, effect } from 'fluxion'

const firstName = signal('John')
const lastName = signal('Doe')

const fullName = computed(() => {
    console.log('Computing fullName...')
    return `${firstName()} ${lastName()}`
})

// See when recomputation happens
effect(() => {
    console.log('fullName changed:', fullName())
})

firstName.set('Jane')
// Computing fullName...
// fullName changed: Jane Doe
```

### Checking Signal State

```javascript
import { signal, getQueueStatus } from 'fluxion'

const count = signal(0)

// Check queue status
console.log(getQueueStatus())
// { length: 0, isFlushing: false, isFlushPending: false }

count.set(1)
console.log(getQueueStatus())
// { length: 1, isFlushing: false, isFlushPending: true }
```

---

## Component Debugging

### Viewing Component Instance

```javascript
import { getCurrentInstance } from 'fluxion'

const MyComponent = {
    setup(props) {
        const instance = getCurrentInstance()

        console.log('Component props:', props)
        console.log('Component instance:', instance)

        return () => h('div', 'Hello')
    }
}
```

### Lifecycle Debugging

```javascript
import {
    onBeforeMount,
    onMounted,
    onBeforeUpdate,
    onUpdated,
    onUnmounted
} from 'fluxion'

const MyComponent = {
    setup() {
        onBeforeMount(() => console.log('Before mount'))
        onMounted(() => console.log('Mounted'))
        onBeforeUpdate(() => console.log('Before update'))
        onUpdated(() => console.log('Updated'))
        onUnmounted(() => console.log('Unmounted'))
    }
}
```

---

## Compiler Debugging

### Viewing AST

```javascript
import { parse } from '@fluxion/compiler-nui'

const source = `
count = signal(0)
view
div
    p {count}
`

const { ast, errors } = parse(source)

console.log('AST:', JSON.stringify(ast, null, 2))
console.log('Errors:', errors)
```

### Viewing Generated Code

```javascript
import { compile } from '@fluxion/compiler-nui'

const source = `
count = signal(0)
view
div
    p {count}
`

const result = compile(source)

console.log('Generated code:')
console.log(result.code)

if (result.errors.length > 0) {
    console.error('Compile errors:', result.errors)
}
```

### Tracing Compilation

```javascript
import {
    parse,
    transform,
    generate,
    NodeTypes
} from '@fluxion/compiler-core'

const source = '<div>{count}</div>'

// 1. Parse
const ast = parse(source)
console.log('Parsed AST:', ast)

// 2. Transform
transform(ast, {
    nodeTransforms: [
        (node, context) => {
            console.log('Transforming:', NodeTypes[node.type])
        }
    ]
})

// 3. Generate
const result = generate(ast)
console.log('Generated:', result.code)
```

---

## Common Issues

### 1. Signal Update Doesn't Trigger View

**Problem:**
```javascript
const items = signal([1, 2, 3])
items().push(4)  // Doesn't trigger update
```

**Solution:**
```javascript
const items = signal([1, 2, 3])
items.update(arr => [...arr, 4])  // Triggers update
```

### 2. Computed Doesn't Update

**Problem:**
```javascript
const a = signal(1)
const b = signal(2)

// Reading dependencies outside computed
const sum = computed(() => a() + b())

// Wrong: dependencies fixed at setup time
```

**Solution:**
Ensure all dependencies are read inside the computed callback:
```javascript
const sum = computed(() => a() + b())  // ✓ Correct
```

### 3. Effect Infinite Loop

**Problem:**
```javascript
const count = signal(0)

effect(() => {
    count.set(count() + 1)  // Infinite loop
})
```

**Solution:**
Avoid modifying signals that the effect depends on:
```javascript
const count = signal(0)
const doubled = computed(() => count() * 2)

effect(() => {
    console.log(doubled())  // ✓ Safe
})
```

### 4. Event Handler Loses this

**Problem:**
```javascript
const obj = {
    count: signal(0),
    increment() {
        this.count.set(this.count() + 1)  // this may be lost
    }
}
```

**Solution:**
Use arrow functions or bind this:
```javascript
const obj = {
    count: signal(0),
    increment: () => {
        obj.count.set(obj.count() + 1)
    }
}
```

### 5. Async Data Loading Issues

**Problem:**
```nui
data = asyncSignal(() => fetchData())

// Data not loaded when component mounts
p {data().title}  // Error: Cannot read property 'title' of undefined
```

**Solution:**
Add loading state check:
```nui
data = asyncSignal(() => fetchData())

if data.loading()
    p Loading...
elif data.error()
    p Error: {data.error().message}
else
    p {data().title}
```

### 6. Component Doesn't Update

**Problem:**
```javascript
// Directly modifying props object
props.item.name = 'new name'  // Doesn't trigger update
```

**Solution:**
Use emit to notify parent component to update:
```javascript
emit('update:item', { ...props.item, name: 'new name' })
```

---

## Performance Debugging

### Detecting Unnecessary Renders

```javascript
import { effect } from 'fluxion'

let renderCount = 0

effect(() => {
    renderCount++
    console.log(`Render #${renderCount}`)
    // Render logic...
})
```

### Using Performance API

```javascript
import { signal, nextTick } from 'fluxion'

const items = signal([])

async function measureUpdate() {
    performance.mark('update-start')

    items.update(list => [...list, ...newItems])

    await nextTick()

    performance.mark('update-end')
    performance.measure('update', 'update-start', 'update-end')

    const measure = performance.getEntriesByName('update')[0]
    console.log(`Update took: ${measure.duration}ms`)
}
```

---

## Error Handling

### Global Error Handling

```javascript
import { warn } from '@fluxion/shared'

// Set up global error handling
window.onerror = (message, source, lineno, colno, error) => {
    console.error('Global error:', { message, source, lineno, colno, error })
    return false
}

// Handle uncaught Promise errors
window.onunhandledrejection = (event) => {
    console.error('Unhandled rejection:', event.reason)
}
```

### Component Error Boundary

```javascript
const ErrorBoundary = {
    setup(props, { slots }) {
        const error = signal(null)

        // Catch child component errors
        const handleError = (err) => {
            error.set(err)
            console.error('Component error:', err)
        }

        return () => {
            if (error()) {
                return h('div', { class: 'error' }, [
                    h('p', 'Something went wrong:'),
                    h('pre', error().message)
                ])
            }

            return slots.default?.()
        }
    }
}
```

---

## Debugging Utility Functions

### Creating Debug Signal

```javascript
import { signal } from 'fluxion'

function createDebugSignal(initialValue, name) {
    const s = signal(initialValue)

    // Wrap setter
    const originalSet = s.set
    s.set = (value) => {
        console.log(`[${name}] Setting:`, value)
        originalSet(value)
    }

    return s
}

// Usage
const count = createDebugSignal(0, 'count')
count.set(5)  // [count] Setting: 5
```

### Tracking Signal Reads

```javascript
import { effect } from 'fluxion'

function trackSignalDeps(signal, name) {
    const deps = new Set()

    effect(() => {
        const value = signal()
        deps.add(value)
        console.log(`[${name}] Dependencies:`, [...deps])
    })

    return signal
}
```

---

## Best Practices

1. **Use Development Mode** - Ensure more errors are caught in development
2. **Add Logging** - Add logs before and after key operations
3. **Use TypeScript** - Get better type checking and IDE support
4. **Unit Testing** - Write test cases for key functionality
5. **Progressive Debugging** - Start with simple scenarios and gradually increase complexity

---

## Next Steps

- [Common Patterns](patterns.md) - See development patterns
- [Complete Examples](complete-examples.md) - See complete application examples