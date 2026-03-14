# Watch

Watch is used to monitor reactive state changes and execute callback functions when changes occur. Compared to Effect, Watch provides more fine-grained control.

## Basic Usage

### watch()

Watch changes to a specified data source:

```javascript
import { signal, watch } from 'fluxion'

const count = signal(0)

// Watch count changes
const stop = watch(
    () => count(),  // Data source
    (newValue, oldValue) => {
        console.log(`Count changed from ${oldValue} to ${newValue}`)
    }
)

count.set(1)
// Output: Count changed from 0 to 1
```

### watchEffect()

Auto-track dependencies without specifying data source:

```javascript
import { signal, watchEffect } from 'fluxion'

const count = signal(0)
const name = signal('Fluxion')

// Auto-tracks count and name
watchEffect(() => {
    console.log(`Count: ${count()}, Name: ${name()}`)
})
// Executes immediately: Count: 0, Name: Fluxion

count.set(1)
// Output: Count: 1, Name: Fluxion
```

### watchDeep()

Deep watch all nested properties of an object:

```javascript
import { reactive, watchDeep } from 'fluxion'

const user = reactive({
    name: 'John',
    address: {
        city: 'New York',
        country: 'USA'
    }
})

watchDeep(
    () => user,
    (newValue, oldValue) => {
        console.log('User changed:', newValue)
    }
)

user.address.city = 'Boston'
// Output: User changed: { name: 'John', address: { city: 'Boston', ... } }
```

## Watching Multiple Sources

```javascript
import { signal, watch } from 'fluxion'

const firstName = signal('John')
const lastName = signal('Doe')

watch(
    () => [firstName(), lastName()],  // Watch multiple
    ([newFirst, newLast], [oldFirst, oldLast]) => {
        console.log(`Name: ${newFirst} ${newLast}`)
    }
)
```

## Watching Object Properties

```javascript
import { reactive, watch } from 'fluxion'

const user = reactive({
    name: 'John',
    age: 30
})

// Watch specific property
watch(
    () => user.name,
    (newName, oldName) => {
        console.log(`Name changed: ${oldName} -> ${newName}`)
    }
)
```

## Configuration Options

### immediate

Execute callback immediately on creation:

```javascript
const count = signal(0)

watch(
    () => count(),
    (newValue, oldValue) => {
        console.log(`Count: ${newValue}`)
    },
    { immediate: true }  // Execute immediately
)
// Immediately outputs: Count: 0
```

### deep

Deep watch objects:

```javascript
const user = signal({
    name: 'John',
    address: { city: 'New York' }
})

watch(
    () => user(),
    (newValue, oldValue) => {
        console.log('User changed')
    },
    { deep: true }
)
```

### flush

Control callback execution timing:

```javascript
// 'pre' - Execute before DOM update (default)
watch(() => count(), callback, { flush: 'pre' })

// 'post' - Execute after DOM update
watch(() => count(), callback, { flush: 'post' })

// 'sync' - Execute synchronously
watch(() => count(), callback, { flush: 'sync' })
```

## Cleanup Side Effects

The callback receives a third parameter for cleanup:

```javascript
const userId = signal(1)

watch(
    () => userId(),
    (newId, oldId, onCleanup) => {
        const controller = new AbortController()

        fetch(`/api/user/${newId}`, { signal: controller.signal })
            .then(r => r.json())
            .then(data => console.log(data))

        // Called before next execution or when stopped
        onCleanup(() => {
            controller.abort()
        })
    }
)
```

## Stopping Watch

```javascript
const count = signal(0)

const stop = watch(() => count(), (value) => {
    console.log('Count:', value)
})

// Stop watching
stop()
```

## Batch Cleanup

```javascript
import { watch, disposeAllWatches } from 'fluxion'

watch(() => count(), callback1)
watch(() => name(), callback2)
watch(() => age(), callback3)

// Clear all watchers
disposeAllWatches()
```

## API Reference

### watch()

```typescript
function watch<T>(
    source: WatchSource<T>,
    callback: WatchCallback<T>,
    options?: WatchOptions
): () => void

type WatchSource<T> = () => T
type WatchCallback<T> = (
    newValue: T,
    oldValue: T | undefined,
    onCleanup: (fn: () => void) => void
) => void

interface WatchOptions {
    immediate?: boolean
    deep?: boolean
    flush?: 'pre' | 'post' | 'sync'
}
```

### watchEffect()

```typescript
function watchEffect(
    effect: () => void | (() => void)
): () => void
```

### watchDeep()

```typescript
function watchDeep<T>(
    source: WatchSource<T>,
    callback: WatchCallback<T>
): () => void
```

### disposeAllWatches()

```typescript
function disposeAllWatches(): void
```

## Use Cases

### Form Validation

```javascript
const email = signal('')

watch(
    () => email(),
    (value) => {
        const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
        emailError.set(isValid ? '' : 'Invalid email')
    }
)
```

### Data Synchronization

```javascript
const settings = signal({ theme: 'light', lang: 'en' })

watch(
    () => settings(),
    (newSettings) => {
        localStorage.setItem('settings', JSON.stringify(newSettings))
    },
    { deep: true }
)
```

### API Requests

```javascript
const searchQuery = signal('')

watch(
    () => searchQuery(),
    async (query, _, onCleanup) => {
        if (!query) return

        const controller = new AbortController()
        onCleanup(() => controller.abort())

        const results = await fetchSearch(query, controller.signal)
        searchResults.set(results)
    }
)
```

## Watch vs Effect

| Feature | Watch | Effect |
|---------|-------|--------|
| Dependency specification | Explicit | Auto-track |
| Old value access | ✅ Available | ❌ Not available |
| Immediate execution | Optional (immediate) | Default |
| Use cases | Precise control, need old value | Auto side effects |

## Next Steps

- [Reactive Objects](reactive.md) - Reactive objects
- [AsyncSignal](async-signal.md) - Async data handling
- [Effect](effect.md) - Reactive side effects