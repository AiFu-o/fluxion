# Reactive Objects

Reactive provides a way to create reactive objects, implemented based on Proxy, suitable for managing complex state structures.

## Basic Usage

### reactive()

Create reactive objects:

```javascript
import { reactive } from '@fluxion-ui/fluxion'

const user = reactive({
    name: 'John',
    age: 30,
    address: {
        city: 'New York',
        country: 'USA'
    }
})

// Directly modify properties
user.name = 'Jane'
user.age = 31

// Nested properties are also reactive
user.address.city = 'Boston'
```

### Compared with Signal

```javascript
// Signal - Access and modify through methods
const count = signal(0)
count()        // Read
count.set(1)   // Modify

// Reactive - Direct access and modify
const user = reactive({ name: 'John' })
user.name      // Read
user.name = 'Jane'  // Modify
```

## Deep Reactivity

Objects created with `reactive()` are deeply reactive:

```javascript
const state = reactive({
    user: {
        profile: {
            settings: {
                theme: 'dark'
            }
        }
    }
})

// All levels are reactive
state.user.profile.settings.theme = 'light'
```

## Shallow Reactivity

### shallowReactive()

Only the first level of properties is reactive:

```javascript
import { shallowReactive } from '@fluxion-ui/fluxion'

const state = shallowReactive({
    name: 'John',
    address: {
        city: 'New York'
    }
})

state.name = 'Jane'           // Reactive
state.address.city = 'Boston' // NOT reactive!
```

## Readonly Objects

### readonly()

Create readonly reactive objects:

```javascript
import { readonly } from '@fluxion-ui/fluxion'

const original = reactive({ count: 0 })
const readOnly = readonly(original)

readOnly.count = 1  // Warning: Cannot modify readonly object
```

### shallowReadonly()

Only first level properties are readonly:

```javascript
import { shallowReadonly } from '@fluxion-ui/fluxion'

const state = shallowReadonly({
    count: 0,
    nested: { value: 1 }
})

state.count = 1         // Warning: Cannot modify
state.nested.value = 2  // Allowed (not recommended)
```

## Check Functions

### isReactive()

Check if it's a reactive object:

```javascript
import { reactive, isReactive } from '@fluxion-ui/fluxion'

const state = reactive({ count: 0 })

console.log(isReactive(state))  // true
console.log(isReactive({}))     // false
```

### isReadonly()

Check if it's a readonly object:

```javascript
import { readonly, isReadonly } from '@fluxion-ui/fluxion'

const state = readonly({ count: 0 })

console.log(isReadonly(state))  // true
```

### isProxy()

Check if it's a Proxy object:

```javascript
import { reactive, readonly, isProxy } from '@fluxion-ui/fluxion'

const state = reactive({})
const readOnly = readonly({})

console.log(isProxy(state))     // true
console.log(isProxy(readOnly))  // true
console.log(isProxy({}))        // false
```

## Conversion Functions

### toRaw()

Get the raw object from a Proxy:

```javascript
import { reactive, toRaw } from '@fluxion-ui/fluxion'

const state = reactive({ count: 0 })
const raw = toRaw(state)

console.log(raw === state)  // false
raw.count = 1               // NOT reactive!
```

### toReactive()

Convert a value to reactive:

```javascript
import { toReactive } from '@fluxion-ui/fluxion'

const raw = { count: 0 }
const reactive = toReactive(raw)

reactive.count = 1  // Reactive
```

### toRef()

Create a ref for a specific object property:

```javascript
import { reactive, toRef } from '@fluxion-ui/fluxion'

const state = reactive({ count: 0, name: 'John' })

const countRef = toRef(state, 'count')

console.log(countRef.value)  // 0
countRef.value = 1           // Reactive update
```

## API Reference

### reactive()

```typescript
function reactive<T extends object>(target: T): T
```

Creates a deeply reactive object.

### shallowReactive()

```typescript
function shallowReactive<T extends object>(target: T): T
```

Creates a shallowly reactive object.

### readonly()

```typescript
function readonly<T extends object>(target: T): Readonly<T>
```

Creates a readonly reactive object.

### shallowReadonly()

```typescript
function shallowReadonly<T extends object>(target: T): Readonly<T>
```

Creates a shallowly readonly object.

### isReactive()

```typescript
function isReactive(value: unknown): boolean
```

### isReadonly()

```typescript
function isReadonly(value: unknown): boolean
```

### isProxy()

```typescript
function isProxy(value: unknown): boolean
```

### toRaw()

```typescript
function toRaw<T>(observed: T): T
```

### toReactive()

```typescript
function toReactive<T>(value: T): T
```

### toRef()

```typescript
function toRef<T extends object>(object: T, key: string): Ref
```

## Use Cases

### Form State Management

```javascript
const form = reactive({
    email: '',
    password: '',
    errors: {
        email: '',
        password: ''
    }
})

function validateEmail() {
    form.errors.email = form.email.includes('@') ? '' : 'Invalid email'
}

function submitForm() {
    console.log('Submit:', form)
}
```

### Application State

```javascript
const appState = reactive({
    user: null,
    isLoading: false,
    error: null,
    theme: 'light'
})

async function fetchUser() {
    appState.isLoading = true
    appState.error = null

    try {
        appState.user = await fetch('/api/user').then(r => r.json())
    } catch (e) {
        appState.error = e.message
    } finally {
        appState.isLoading = false
    }
}
```

## Important Notes

### Destructuring Loses Reactivity

```javascript
const state = reactive({ count: 0, name: 'John' })

// ❌ Destructuring loses reactivity
const { count, name } = state

// ✅ Use toRef
import { toRef } from '@fluxion-ui/fluxion'
const countRef = toRef(state, 'count')
```

### Replacing Entire Object

```javascript
const state = reactive({ count: 0 })

// ❌ Replacing object loses reactivity
state = { count: 1 }  // Error!

// ✅ Use Object.assign
Object.assign(state, { count: 1 })

// ✅ Or modify properties individually
state.count = 1
```

### Array Methods

```javascript
const list = reactive([1, 2, 3])

// ✅ Mutating methods work correctly
list.push(4)
list.pop()
list.splice(0, 1)

// ❌ Direct length assignment doesn't work
list.length = 0  // Not recommended

// ✅ Use splice to clear
list.splice(0)
```

## Next Steps

- [AsyncSignal](async-signal.md) - Async data handling
- [Signal API](signal-api.md) - Complete Signal API
- [Watch](watch.md) - State watching