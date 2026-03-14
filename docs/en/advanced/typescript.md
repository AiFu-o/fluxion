# TypeScript Support

This section introduces Fluxion's TypeScript support and type definitions.

## Overview

Fluxion is written in TypeScript and provides complete type definitions, supporting:

- Complete type inference
- Component Props type checking
- Signal type safety
- Event type inference

---

## Installing Type Definitions

Fluxion includes built-in type definitions, no additional installation needed:

```bash
npm install @fluxion-ui/fluxion
# or
pnpm add @fluxion-ui/fluxion
```

---

## Basic Types

### Signal Types

```typescript
import { signal, Signal } from '@fluxion-ui/fluxion'

// Automatic type inference
const count = signal(0)              // Signal<number>
const name = signal('Fluxion')       // Signal<string>
const isActive = signal(true)        // Signal<boolean>
const items = signal([1, 2, 3])      // Signal<number[]>

// Explicit type annotation
const user = signal<User | null>(null)
const data = signal<Record<string, unknown>>({})

// Read value
const value: number = count()        // Inferred as number

// Set value
count.set(10)                        // Parameter type is number
count.update(n => n + 1)             // Callback parameter type is number
```

### Computed Types

```typescript
import { computed, Computed } from '@fluxion-ui/fluxion'

// Automatic type inference
const double = computed(() => count() * 2)  // Computed<number>
const message = computed(() => `Hello, ${name()}`)  // Computed<string>

// Explicit type annotation
const formattedUser = computed<User>(() => {
    return {
        id: userId(),
        name: userName(),
        email: userEmail()
    }
})
```

### Reactive Types

```typescript
import { reactive, isReactive, toRaw } from '@fluxion-ui/fluxion'

interface User {
    name: string
    age: number
    profile?: {
        bio: string
        avatar: string
    }
}

// Create reactive object
const user = reactive<User>({
    name: 'John',
    age: 30
})

// Type preserved
user.name = 'Jane'    // string
user.age = 31         // number

// Use toRaw to get original type
const rawUser: User = toRaw(user)
```

### AsyncSignal Types

```typescript
import { asyncSignal, AsyncSignal } from '@fluxion-ui/fluxion'

interface ApiResponse {
    data: User[]
    total: number
}

// Create async signal
const users = asyncSignal<ApiResponse>(() =>
    fetch('/api/users').then(r => r.json())
)

// Type-safe access
if (users.loading()) {
    console.log('Loading...')
}

const data: ApiResponse | undefined = users()
const error: Error | null = users.error()
```

---

## Component Types

### Component Definition

```typescript
import { Component, ComponentContext, VNode } from '@fluxion-ui/fluxion'

interface MyComponentProps {
    title: string
    count: number
    onIncrement?: () => void
}

const MyComponent: Component<MyComponentProps> = {
    props: {
        title: String,
        count: Number,
        onIncrement: Function
    },

    setup(props: MyComponentProps, context: ComponentContext) {
        // props have full type inference
        console.log(props.title)     // string
        console.log(props.count)     // number

        return () => {
            // Return VNode
        }
    }
}
```

### Props Type Definition

```typescript
import { PropOption } from '@fluxion-ui/fluxion'

// Define Props options
const propsOptions = {
    // Basic types
    name: String as PropOption<string>,
    age: Number as PropOption<number>,
    isActive: Boolean as PropOption<boolean>,

    // Array types
    items: Array as PropOption<string[]>,
    users: Array as PropOption<User[]>,

    // Object types
    config: Object as PropOption<Config>,

    // Optional properties
    title: { type: String, required: false } as PropOption<string | undefined>,

    // With default value
    count: { type: Number, default: 0 } as PropOption<number>
}
```

### Emits Types

```typescript
interface Emits {
    (e: 'change', value: string): void
    (e: 'submit', data: FormData): void
    (e: 'update:modelValue', value: number): void
}

const MyComponent = {
    emits: ['change', 'submit', 'update:modelValue'] as const,

    setup(props: any, context: ComponentContext<Emits>) {
        // Type-safe emit
        context.emit('change', 'new value')    // ✓ Correct
        context.emit('submit', new FormData()) // ✓ Correct
        context.emit('update:modelValue', 10)  // ✓ Correct

        // Type errors
        // context.emit('change', 123)          // ✗ Wrong parameter type
        // context.emit('unknown')              // ✗ Unknown event
    }
}
```

---

## Lifecycle Types

```typescript
import {
    onBeforeMount,
    onMounted,
    onBeforeUpdate,
    onUpdated,
    onUnmounted
} from '@fluxion-ui/fluxion'

const MyComponent = {
    setup() {
        // All lifecycle hooks accept callbacks with no parameters
        onBeforeMount(() => {
            console.log('Before mount')
        })

        onMounted(() => {
            console.log('Mounted')
        })

        onBeforeUpdate(() => {
            console.log('Before update')
        })

        onUpdated(() => {
            console.log('Updated')
        })

        onUnmounted(() => {
            console.log('Unmounted')
        })
    }
}
```

---

## VNode Types

```typescript
import {
    h,
    VNode,
    VNodeProps,
    createVNode
} from '@fluxion-ui/fluxion'

// h function automatically infers types
const div: VNode = h('div')                         // Element VNode
const text: VNode = h('p', 'Hello')                 // With text
const withProps: VNode = h('div', { class: 'foo' }) // With props

// Component VNode
const component: VNode = h(MyComponent, {
    title: 'Hello',
    count: 10
})

// Props type
const props: VNodeProps = {
    class: 'container',
    style: { color: 'red' },
    onClick: (e: Event) => console.log(e)
}
```

---

## Watch Types

```typescript
import { watch, watchEffect, WatchCallback, WatchSource } from '@fluxion-ui/fluxion'

// watch automatically infers types
const count = signal(0)

// source type is () => number
// callback's newValue and oldValue both inferred as number
const stop = watch(
    () => count(),
    (newValue, oldValue) => {
        console.log(newValue)  // number
        console.log(oldValue)  // number | undefined
    }
)

// Watch multiple sources
const name = signal('John')

watch(
    [() => count(), () => name()],
    ([newCount, newName], [oldCount, oldName]) => {
        console.log(newCount, newName)  // [number, string]
    }
)

// watchEffect
const dispose = watchEffect(() => {
    console.log(count())  // Automatically tracks
})
```

---

## Effect Types

```typescript
import { effect, Effect } from '@fluxion-ui/fluxion'

// Create effect
const dispose: Effect = effect(() => {
    console.log('Effect running')

    // Optional cleanup function
    return () => {
        console.log('Cleanup')
    }
})

// Stop effect
dispose.stop()
```

---

## Generic Utilities

### Creating Generic Components

```typescript
import { Component, signal, Signal } from '@fluxion-ui/fluxion'

// Generic list component
interface ListProps<T> {
    items: Signal<T[]>
    renderItem: (item: T, index: number) => VNode
}

function createListComponent<T>(): Component<ListProps<T>> {
    return {
        props: {
            items: Object,
            renderItem: Function
        },

        setup(props: ListProps<T>) {
            return () => {
                return h('ul', {},
                    props.items().map((item, index) =>
                        props.renderItem(item, index)
                    )
                )
            }
        }
    }
}

// Usage
const NumberList = createListComponent<number>()
const UserList = createListComponent<User>()
```

### Generic Utility Functions

```typescript
import { Signal, computed } from '@fluxion-ui/fluxion'

// Generic selector
function createSelector<T, R>(
    source: Signal<T>,
    selector: (value: T) => R
): Signal<R> {
    return computed(() => selector(source()))
}

// Usage
interface State {
    user: { name: string }
    settings: { theme: string }
}

const state = signal<State>({
    user: { name: 'John' },
    settings: { theme: 'dark' }
})

const userName = createSelector(state, s => s.user.name)  // Signal<string>
const theme = createSelector(state, s => s.settings.theme) // Signal<string>
```

---

## Type Declaration Files

### Project Type Declarations

```typescript
// types/fluxion.d.ts
declare module '@fluxion-ui/fluxion' {
    // Extend component types
    interface ComponentCustomProperties {
        $router?: Router
        $store?: Store
    }

    // Extend VNode types
    interface VNodeCustomData {
        myCustomData?: any
    }
}
```

### .nui File Declaration

```typescript
// types/nui.d.ts
declare module '*.nui' {
    import { Component } from '@fluxion-ui/fluxion'
    const component: Component
    export default component
}
```

---

## Type Checking Configuration

### tsconfig.json

```json
{
    "compilerOptions": {
        "target": "ES2020",
        "module": "ESNext",
        "moduleResolution": "bundler",
        "strict": true,
        "jsx": "react-jsx",
        "jsxImportSource": "@fluxion-ui/fluxion",
        "types": ["@fluxion-ui/fluxion"]
    },
    "include": [
        "src/**/*",
        "types/**/*"
    ]
}
```

---

## Best Practices

### 1. Use Strict Mode

```json
{
    "compilerOptions": {
        "strict": true,
        "noImplicitAny": true,
        "strictNullChecks": true
    }
}
```

### 2. Define Clear Interfaces

```typescript
// Good: define clear interfaces
interface User {
    id: number
    name: string
    email: string
}

interface UserComponentProps {
    user: User
    onUpdate: (user: User) => void
}

// Avoid: using any
const user = signal<any>({})  // Loses type safety
```

### 3. Use Type Guards

```typescript
function isUser(value: unknown): value is User {
    return typeof value === 'object' &&
        value !== null &&
        'id' in value &&
        'name' in value &&
        'email' in value
}

const data = signal<unknown>(fetchResult)

if (isUser(data())) {
    console.log(data().name)  // Type safe
}
```

### 4. Leverage Type Inference

```typescript
// Let TypeScript infer types
const count = signal(0)
const double = computed(() => count() * 2)  // Automatically inferred as Computed<number>

// Only annotate explicitly when necessary
const users = asyncSignal<User[]>(() => fetchUsers())
```

---

## Next Steps

- [Custom Renderer](custom-renderer.md) - Create custom renderers
- [Compiler Extension](compiler-extension.md) - Extend compiler functionality
- [Performance Optimization](performance.md) - Optimize application performance