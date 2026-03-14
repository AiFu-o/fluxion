# Performance Optimization

This section introduces performance optimization strategies and techniques for Fluxion applications.

## Overview

Fluxion is designed with performance in mind, but there are still best practices that can help you achieve better performance.

---

## Reactivity Optimization

### 1. Avoid Unnecessary Dependency Tracking

```nui
// Good: read signal only when needed
function handleClick() {
    // Reading in event handler won't be tracked
    console.log(count())
}

// Avoid: creating effects outside components
const unnecessaryEffect = effect(() => {
    // This effect keeps running
    console.log(count())
})
```

### 2. Use Computed to Cache Calculations

```nui
// Good: use computed for caching
filteredItems = computed(() => {
    return items().filter(item => item.active)
})

// Avoid: calculating directly in template
// Recalculates on every render
for item in items().filter(item => item.active)
    p {item.name}
```

### 3. Batch Updates

```javascript
import { signal, nextTick } from '@fluxion-ui/fluxion'

const firstName = signal('John')
const lastName = signal('Doe')
const email = signal('john@example.com')

// Batch updates: all updates processed in same tick
async function updateUser(user) {
    firstName.set(user.firstName)
    lastName.set(user.lastName)
    email.set(user.email)

    // Wait for DOM update to complete
    await nextTick()
    console.log('Update complete')
}
```

### 4. Use shallowReactive to Reduce Deep Proxying

```javascript
import { shallowReactive } from '@fluxion-ui/fluxion'

// When you only need to track first-level property changes
const state = shallowReactive({
    items: [],        // Won't track array internal changes
    metadata: {}      // Won't track object internal changes
})

// These trigger updates
state.items = []           // ✅ Triggers update
state.count = 1            // ✅ Triggers update

// These don't trigger updates
state.items.push(1)        // ❌ Doesn't trigger
state.metadata.key = 'val' // ❌ Doesn't trigger
```

---

## Rendering Optimization

### 1. Use Keys to Optimize List Rendering

```nui
// Good: use unique keys
for item in items
    div key={item.id}
        p {item.name}

// Avoid: using index as key
for item in items
    div key={items().indexOf(item)}
        p {item.name}

// Avoid: no key
for item in items
    div
        p {item.name}
```

### 2. Conditional Rendering Optimization

```nui
// Good: return early
if !loaded
    p Loading...
else
    // Complex rendering logic
    for item in largeList
        // ...

// Or use elif chain
if status == 'loading'
    p Loading...
elif status == 'error'
    p Error
else
    // Normal rendering
```

### 3. Reduce Unnecessary Reactive Wrapping

```nui
// Good: static data doesn't need signal
STATIC_CONFIG = {
    apiUrl: '/api',
    timeout: 5000
}

// Only data that changes needs signal
count = signal(0)

// Avoid: making everything a signal
apiUrl = signal('/api')  // Unnecessary
```

### 4. Use readonlySignal

```javascript
import { readonlySignal } from '@fluxion-ui/fluxion'

// For constant values, use readonlySignal to prevent accidental modification
const MAX_ITEMS = readonlySignal(100)
const API_VERSION = readonlySignal('v1')
```

---

## Component Optimization

### 1. Split Components Reasonably

```nui
// Good: split into small components
// Item.nui
view
div.item
    span {name}
    button @click=onRemove Remove

// List.nui
import Item from './Item.nui'

view
div
    for item in items
        Item name={item.name} onRemove={() => removeItem(item.id)}
```

### 2. Avoid Creating New Objects in Render Functions

```javascript
// Good: create in setup
setup() {
    const config = { class: 'container' }  // Created once

    return () => h('div', config, ...)
}

// Avoid: creating new objects every render
setup() {
    return () => h('div', { class: 'container' }, ...)  // New object each time
}
```

### 3. Use Props Validation

```javascript
// Defining props types can catch errors early
const MyComponent = {
    props: {
        items: Array,
        count: Number,
        name: String
    },
    setup(props) {
        // props types validated
    }
}
```

---

## Async Data Optimization

### 1. Use cachedAsyncSignal to Cache Requests

```javascript
import { cachedAsyncSignal, clearAsyncSignalCache } from '@fluxion-ui/fluxion'

// Cache API requests
const users = cachedAsyncSignal('users', () =>
    fetch('/api/users').then(r => r.json())
)

// Multiple calls with same key share the same request
const users2 = cachedAsyncSignal('users', () =>
    fetch('/api/users').then(r => r.json())
)
// users === users2

// Clear cache
clearAsyncSignalCache()
```

### 2. Cancel Unneeded Requests

```javascript
import { asyncSignal } from '@fluxion-ui/fluxion'

// Create cancellable async signal
const data = asyncSignal(() => fetchData())

// Cancel request on component unmount
onUnmounted(() => {
    data.cancel()
})

// Or use abort
onUnmounted(() => {
    data.abort()
})
```

### 3. Use lazyAsyncSignal for Lazy Loading

```javascript
import { lazyAsyncSignal } from '@fluxion-ui/fluxion'

// Lazily create async signal
const lazyData = lazyAsyncSignal(() => fetchData())

// Only created when called
const data = lazyData()
```

---

## Memory Management

### 1. Clean Up Effects

```javascript
import { effect, signal } from '@fluxion-ui/fluxion'

const count = signal(0)

const dispose = effect(() => {
    console.log('Count:', count())

    // Return cleanup function
    return () => {
        console.log('Cleanup')
    }
})

// Stop when no longer needed
dispose.stop()
```

### 2. Stop Watches

```javascript
import { watch, signal } from '@fluxion-ui/fluxion'

const data = signal({})

const stop = watch(
    () => data(),
    (newVal) => {
        console.log('Changed:', newVal)
    }
)

// Stop watching on component unmount
onUnmounted(() => {
    stop()
})
```

### 3. Clean Up Component Instances

```javascript
// Cleanup on component unmount
const MyComponent = {
    setup() {
        const timer = setInterval(() => {
            // Periodic task
        }, 1000)

        // Return cleanup function
        onUnmounted(() => {
            clearInterval(timer)
        })
    }
}
```

---

## Performance Analysis

### 1. Use nextTick to Measure Update Time

```javascript
import { signal, nextTick } from '@fluxion-ui/fluxion'

const items = signal([])

async function measureUpdate() {
    const start = performance.now()

    items.update(list => [...list, ...newItems])

    await nextTick()

    const duration = performance.now() - start
    console.log(`Update took: ${duration}ms`)
}
```

### 2. Monitor Queue Status

```javascript
import { getQueueStatus } from '@fluxion-ui/fluxion'

// Check update queue status
const status = getQueueStatus()
console.log('Queue length:', status.length)
console.log('Is flushing:', status.isFlushing)
console.log('Is pending:', status.isFlushPending)
```

### 3. Use Browser DevTools

```javascript
// Add performance marks in development
if (process.env.NODE_ENV !== 'production') {
    performance.mark('update-start')

    // Update operations...

    performance.mark('update-end')
    performance.measure('update', 'update-start', 'update-end')
}
```

---

## Best Practices Checklist

### Reactivity

- [ ] Use `computed` to cache calculation results
- [ ] Use `shallowReactive` to reduce proxy overhead
- [ ] Use `readonlySignal` to protect constants
- [ ] Batch state updates

### Rendering

- [ ] Add stable `key` to list items
- [ ] Split large components into smaller ones
- [ ] Avoid creating new objects in render functions
- [ ] Use conditional rendering to reduce unnecessary renders

### Async

- [ ] Use `cachedAsyncSignal` to cache API requests
- [ ] Cancel unneeded requests in time
- [ ] Use lazy loading to reduce initial load

### Memory

- [ ] Stop unneeded effects and watches in time
- [ ] Clean up resources in `onUnmounted`
- [ ] Avoid memory leaks

---

## Next Steps

- [Custom Renderer](custom-renderer.md) - Create custom renderers
- [Compiler Extension](compiler-extension.md) - Extend compiler functionality
- [TypeScript Support](typescript.md) - TypeScript integration