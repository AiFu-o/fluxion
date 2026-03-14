# Reactivity API Reference

This section details the complete API of Fluxion's reactivity system.

## Imports

```javascript
import {
  signal,
  computed,
  effect,
  watch,
  reactive,
  asyncSignal
} from 'fluxion'
```

---

## Signal

### signal()

Creates a reactive signal.

```typescript
function signal<T>(value: T): Signal<T>

interface Signal<T> {
    (): T                              // Read value
    set(value: T): void                // Set value
    update(fn: (prev: T) => T): void   // Update based on previous value
}
```

**Parameters**

| Parameter | Type | Description |
|------|------|------|
| value | T | Initial value |

**Returns**

Returns a Signal object that can be called like a function to get the value.

**Example**

```nui
count = signal(0)
name = signal("Fluxion")

// Read value
currentCount = count()

// Set value
count.set(10)

// Update based on previous value
count.update(c => c + 1)
```

### readonlySignal()

Creates a read-only signal.

```typescript
function readonlySignal<T>(value: T): () => T
```

**Example**

```nui
VERSION = readonlySignal("1.0.0")
MAX_COUNT = readonlySignal(100)

// Usage
p Version: {VERSION}

// The following will error
// VERSION.set("2.0.0")  // Error: readonly
```

### unsubscribe()

Unsubscribes an effect from a Signal.

```typescript
function unsubscribe<T>(signal: Signal<T>, effect: () => void): void
```

---

## Computed

### computed()

Creates a computed property that automatically calculates and caches results based on dependencies.

```typescript
function computed<T>(getter: () => T): Computed<T>

interface Computed<T> {
    (): T           // Read computed value
    stop(): void    // Stop tracking
}
```

**Parameters**

| Parameter | Type | Description |
|------|------|------|
| getter | () => T | Calculation function |

**Returns**

Returns a Computed object that returns the calculated value when called.

**Example**

```nui
firstName = signal("John")
lastName = signal("Doe")

// Create computed property
fullName = computed(() => `${firstName()} ${lastName()}`)

// Usage
p Full Name: {fullName}

// fullName automatically recalculates when firstName or lastName changes
```

### computedReadonly()

Creates a read-only computed property (same behavior as computed).

```typescript
function readonly<T>(getter: () => T): Computed<T>
```

### isCached()

Checks if a Computed has a cached value.

```typescript
function isCached<T>(computed: Computed<T>): boolean
```

### refresh()

Forces a Computed to recalculate.

```typescript
function refresh<T>(computed: Computed<T>): void
```

### computedSet()

Creates a collection of related computed properties.

```typescript
function computedSet<T extends Record<string, () => any>>(
    getters: T
): { [K in keyof T]: ReturnType<T[K]> }
```

**Example**

```javascript
const stats = computedSet({
    double: () => count() * 2,
    triple: () => count() * 3,
    squared: () => count() * count()
})

// Usage
stats.double()  // count * 2
stats.triple()  // count * 3
stats.squared() // count^2
```

---

## Effect

### effect()

Creates a side effect that automatically tracks dependencies and responds to changes.

```typescript
function effect(
    fn: () => void | (() => void),
    options?: { flush?: 'pre' | 'post' | 'sync' }
): Effect

interface Effect {
    (): void        // Execute effect
    stop(): void    // Stop tracking
}
```

**Parameters**

| Parameter | Type | Description |
|------|------|------|
| fn | () => void \| (() => void) | Side effect function, can return cleanup function |
| options | object | Configuration options |

**Returns**

Returns an Effect object that can stop tracking.

**Example**

```javascript
const count = signal(0)

// Create effect
const dispose = effect(() => {
    console.log('Count changed:', count())

    // Return cleanup function (optional)
    return () => {
        console.log('Cleanup before next run')
    }
})

// Stop effect
dispose.stop()
```

### stop()

Stops Effect tracking.

```typescript
function stop(effect: Effect): void
```

### effectPost()

Creates an effect that only runs after DOM updates.

```typescript
function effectPost(fn: () => void | (() => void)): Effect
```

### effectSync()

Creates a synchronously executing effect.

```typescript
function effectSync(fn: () => void | (() => void)): Effect
```

### pauseEffect() / resumeEffect()

Pause or resume Effect execution.

```typescript
function pauseEffect(effect: Effect): void
function resumeEffect(effect: Effect): void
```

### runEffects()

Execute multiple effects in batch.

```typescript
function runEffects(effects: Effect[]): void
```

---

## Watch

### watch()

Watches reactive data for changes.

```typescript
function watch<T>(
    source: WatchSource<T> | WatchSource<T>[],
    callback: WatchCallback<T> | ((values: T[], oldValues: T[]) => void),
    options?: WatchOptions
): () => void

type WatchSource<T> = () => T | Signal<T> | Reactive<T>

interface WatchOptions {
    immediate?: boolean    // Execute immediately
    deep?: boolean         // Deep watch
    flush?: 'pre' | 'post' | 'sync'  // Scheduling timing
}

type WatchCallback<T> = (
    newValue: T,
    oldValue: T | undefined,
    cleanup?: () => void
) => void | (() => void)
```

**Parameters**

| Parameter | Type | Description |
|------|------|------|
| source | WatchSource \| WatchSource[] | Data source(s) to watch |
| callback | WatchCallback | Callback when changes occur |
| options | WatchOptions | Configuration options |

**Returns**

Returns a function to stop watching.

**Example**

```javascript
const count = signal(0)

// Watch single source
const stopWatch = watch(
    () => count(),
    (newValue, oldValue) => {
        console.log(`Changed from ${oldValue} to ${newValue}`)
    }
)

// Stop watching
stopWatch()
```

**Watching Multiple Sources**

```javascript
const firstName = signal("John")
const lastName = signal("Doe")

watch(
    [() => firstName(), () => lastName()],
    ([newFirst, newLast], [oldFirst, oldLast]) => {
        console.log(`Name changed: ${newFirst} ${newLast}`)
    }
)
```

### watchEffect()

Automatically tracks dependencies and executes side effects.

```typescript
function watchEffect(
    callback: (cleanup?: () => void) => void,
    options?: WatchOptions
): () => void
```

**Example**

```javascript
const count = signal(0)

const stop = watchEffect(() => {
    console.log('Count is:', count())
    // Automatically tracks count
})
```

### watchDeep()

Deep watches object changes.

```typescript
function watchDeep<T extends object>(
    source: T,
    callback: (newValue: T, oldValue: T) => void
): () => void
```

**Example**

```javascript
const user = reactive({
    name: 'John',
    profile: {
        age: 30,
        city: 'NYC'
    }
})

watchDeep(user, (newValue, oldValue) => {
    console.log('User changed deeply')
})

// All these changes trigger the callback
user.name = 'Jane'
user.profile.age = 31
```

### disposeAllWatches()

Stops all watch listeners.

```typescript
function disposeAllWatches(): void
```

---

## Reactive

### reactive()

Creates a deeply reactive object.

```typescript
function reactive<T extends object>(target: T): T
```

**Parameters**

| Parameter | Type | Description |
|------|------|------|
| target | T | Object to convert to reactive |

**Returns**

Returns a reactive proxy object.

**Example**

```javascript
const user = reactive({
    name: 'John',
    age: 30,
    profile: {
        city: 'NYC'
    }
})

// Directly modify properties
user.name = 'Jane'
user.age++

// Nested objects are also reactive
user.profile.city = 'LA'
```

### shallowReactive()

Creates a shallow reactive object (only proxies the first level).

```typescript
function shallowReactive<T extends object>(target: T): T
```

**Example**

```javascript
const state = shallowReactive({
    count: 0,
    nested: {
        value: 1
    }
})

// Reactive
state.count++

// Not reactive (nested is not reactive)
state.nested.value = 2
```

### readonly()

Creates a readonly reactive object.

```typescript
function readonly<T extends object>(target: T): T
```

**Example**

```javascript
const original = reactive({ count: 0 })
const readonlyCopy = readonly(original)

// Can read
console.log(readonlyCopy.count)  // 0

// Cannot modify (will warn)
readonlyCopy.count = 1  // Warn: target is readonly
```

### shallowReadonly()

Creates a shallow readonly reactive object.

```typescript
function shallowReadonly<T extends object>(target: T): T
```

### isReactive()

Checks if an object is reactive.

```typescript
function isReactive(value: unknown): boolean
```

### isReadonly()

Checks if an object is readonly.

```typescript
function isReadonly(value: unknown): boolean
```

### isProxy()

Checks if an object is a Proxy.

```typescript
function isProxy(value: unknown): boolean
```

### toRaw()

Gets the raw object from a reactive object.

```typescript
function toRaw<T>(observed: T): T
```

**Example**

```javascript
const original = { count: 0 }
const reactiveCopy = reactive(original)

console.log(toRaw(reactiveCopy) === original)  // true
```

### toRef()

Converts a reactive object property to a ref.

```typescript
function toRef<T extends object, K extends keyof T>(
    object: T,
    key: K
): Ref<T[K]>
```

### toReactive()

Converts a value to reactive (if it's already an object).

```typescript
function toReactive<T>(value: T): T
```

---

## AsyncSignal

### asyncSignal()

Creates an async signal that supports async data fetching and loading states.

```typescript
function asyncSignal<T>(
    fetcher: () => Promise<T>,
    initialValue?: T
): AsyncSignal<T>

interface AsyncSignal<T> {
    (): T | undefined              // Get data
    loading: Signal<boolean>       // Loading state
    error: Signal<Error | null>    // Error state
    reload: () => Promise<void>    // Reload
    set(value: T): void            // Set value
    update(fn: (prev: T | undefined) => T | undefined): void
    cancel(): void                 // Cancel request
    isCancelled(): boolean         // Is cancelled
    abort(): void                  // Abort request
    then(onfulfilled?, onrejected?): Promise<T>  // Promise compatible
    catch(onrejected?): Promise<T>
    finally(onfinally?): Promise<T>
}
```

**Parameters**

| Parameter | Type | Description |
|------|------|------|
| fetcher | () => Promise\<T\> | Async fetch function |
| initialValue | T | Optional initial value |

**Returns**

Returns an AsyncSignal object.

**Example**

```nui
// Create async signal
users = asyncSignal(() => fetch('/api/users').then(r => r.json()))

view
div
    if users.loading()
        p Loading...
    elif users.error()
        p Error: {users.error().message}
    else
        for user in users()
            p {user.name}
```

### asyncSignalSuspense()

Creates a Suspense-style async signal.

```typescript
function asyncSignalSuspense<T>(
    fetcher: () => Promise<T>,
    initialValue?: T
): AsyncSignal<T>
```

### lazyAsyncSignal()

Lazily creates an AsyncSignal.

```typescript
function lazyAsyncSignal<T>(
    fetcher: () => Promise<T>,
    delay?: number
): () => AsyncSignal<T>
```

### cachedAsyncSignal()

Creates a cached AsyncSignal.

```typescript
function cachedAsyncSignal<T>(
    key: string,
    fetcher: () => Promise<T>
): AsyncSignal<T>
```

**Example**

```javascript
// Use cache key
const users = cachedAsyncSignal('users', () => fetchUsers())

// Calling with same key returns cached signal
const sameUsers = cachedAsyncSignal('users', () => fetchUsers())
// users === sameUsers
```

### clearAsyncSignalCache()

Clears the AsyncSignal cache.

```typescript
function clearAsyncSignalCache(): void
```

---

## Internal APIs

The following APIs are primarily for internal framework use. Regular users typically don't need to call them directly.

### Effect State Management

```typescript
// Get/set current effect
function getCurrentEffect(): Effect | null
function setCurrentEffect(effect: Effect | null): void

// Effect stack operations
function getEffectStack(): Effect[]
function pushEffect(effect: Effect): void
function popEffect(): Effect | undefined

// Register/unregister
function registerEffect(effect: Effect): void
function unregisterEffect(effect: Effect): void
function getAllEffects(): Effect[]
```

### Global Effect Settings

```typescript
function setGlobalEffect(effect: (() => void) | null): void
function getGlobalEffect(): (() => void) | null
```

---

## Type Definitions

```typescript
// Signal type
interface Signal<T> {
    (): T
    set(value: T | ((prev: T) => T)): void
    update(fn: (prev: T) => T): void
}

// Computed type
interface Computed<T> {
    (): T
    stop(): void
}

// Effect type
interface Effect extends Function {
    (): void
    stop: () => void
}

// AsyncSignal type
interface AsyncSignal<T> {
    (): T | undefined
    loading: Signal<boolean>
    error: Signal<Error | null>
    reload(): Promise<void>
    set(value: T): void
    update(fn: (prev: T | undefined) => T | undefined): void
    cancel(): void
    isCancelled(): boolean
    abort(): void
    // Promise methods
    then<R>(onfulfilled?: (value: T) => R, onrejected?: (reason: any) => R): Promise<R>
    catch<R>(onrejected?: (reason: any) => R): Promise<R>
    finally(onfinally?: () => void): Promise<T>
}
```

---

## Next Steps

- [Runtime API](runtime-api.md) - Application and renderer APIs
- [Compiler API](compiler-api.md) - Compilation and transform APIs
- [Utils API](utils-api.md) - Utility helper functions