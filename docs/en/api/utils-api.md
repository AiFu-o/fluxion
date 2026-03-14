# Utils API Reference

This section details the utility functions provided by Fluxion.

## Imports

```javascript
import {
  isFunction,
  isObject,
  isArray,
  isString,
  isPromise,
  isMap,
  isSet,
  isInteger,
  hasOwn,
  toArray,
  warn,
  error,
  debug
} from '@fluxion-ui/shared'
```

---

## Type Check Functions

### isFunction()

Checks if a value is a function.

```typescript
function isFunction(value: unknown): value is Function
```

**Parameters**

| Parameter | Type | Description |
|------|------|------|
| value | unknown | Value to check |

**Returns**

Returns `true` if the value is a function, otherwise `false`.

**Example**

```javascript
isFunction(() => {})        // true
isFunction(function() {})   // true
isFunction(class Foo {})    // true
isFunction(123)             // false
isFunction('hello')         // false
```

### isObject()

Checks if a value is an object (not null).

```typescript
function isObject(value: unknown): value is object
```

**Parameters**

| Parameter | Type | Description |
|------|------|------|
| value | unknown | Value to check |

**Returns**

Returns `true` if the value is an object and not `null`.

**Example**

```javascript
isObject({})           // true
isObject([])           // true
isObject(null)         // false
isObject(123)          // false
isObject('hello')      // false
isObject(() => {})     // false
```

### isArray()

Checks if a value is an array.

```typescript
function isArray(value: unknown): value is Array<unknown>
```

**Parameters**

| Parameter | Type | Description |
|------|------|------|
| value | unknown | Value to check |

**Returns**

Returns `true` if the value is an array.

**Example**

```javascript
isArray([])            // true
isArray([1, 2, 3])     // true
isArray({})            // false
isArray('hello')       // false
```

### isString()

Checks if a value is a string.

```typescript
function isString(value: unknown): value is string
```

**Parameters**

| Parameter | Type | Description |
|------|------|------|
| value | unknown | Value to check |

**Returns**

Returns `true` if the value is a string.

**Example**

```javascript
isString('hello')      // true
isString("")           // true
isString(123)          // false
isString(['a', 'b'])   // false
```

### isPromise()

Checks if a value is a Promise.

```typescript
function isPromise(value: unknown): value is Promise<unknown>
```

**Parameters**

| Parameter | Type | Description |
|------|------|------|
| value | unknown | Value to check |

**Returns**

Returns `true` if the value is a Promise instance.

**Example**

```javascript
isPromise(Promise.resolve())     // true
isPromise(new Promise(() => {})) // true
isPromise({})                    // false
isPromise({ then: () => {} })    // false (not a Promise instance)
```

### isMap()

Checks if a value is a Map.

```typescript
function isMap(value: unknown): value is Map<unknown, unknown>
```

**Parameters**

| Parameter | Type | Description |
|------|------|------|
| value | unknown | Value to check |

**Returns**

Returns `true` if the value is a Map instance.

**Example**

```javascript
isMap(new Map())       // true
isMap(new Set())       // false
isMap({})              // false
```

### isSet()

Checks if a value is a Set.

```typescript
function isSet(value: unknown): value is Set<unknown>
```

**Parameters**

| Parameter | Type | Description |
|------|------|------|
| value | unknown | Value to check |

**Returns**

Returns `true` if the value is a Set instance.

**Example**

```javascript
isSet(new Set())       // true
isSet(new Map())       // false
isSet([])              // false
```

### isInteger()

Checks if a value is an integer.

```typescript
function isInteger(value: unknown): boolean
```

**Parameters**

| Parameter | Type | Description |
|------|------|------|
| value | unknown | Value to check |

**Returns**

Returns `true` if the value is an integer.

**Example**

```javascript
isInteger(123)         // true
isInteger(0)           // true
isInteger(-5)          // true
isInteger(1.5)         // false
isInteger('123')       // false
isInteger(NaN)         // false
```

---

## Object Operation Functions

### hasOwn()

Checks if an object has a specified own property (not inherited).

```typescript
function hasOwn(obj: object, key: string | symbol): boolean
```

**Parameters**

| Parameter | Type | Description |
|------|------|------|
| obj | object | Object to check |
| key | string \| symbol | Property name |

**Returns**

Returns `true` if the object has the specified own property.

**Example**

```javascript
const obj = { name: 'Fluxion' }

hasOwn(obj, 'name')           // true
hasOwn(obj, 'toString')       // false (inherited property)
hasOwn(obj, 'age')            // false

const arr = [1, 2, 3]
hasOwn(arr, 'length')         // true
hasOwn(arr, 0)                // true (indices are also properties)
```

---

## Array/Collection Operation Functions

### toArray()

Converts a value to an array. If already an array, returns it directly; otherwise wraps in an array.

```typescript
function toArray<T>(value: T | T[]): T[]
```

**Parameters**

| Parameter | Type | Description |
|------|------|------|
| value | T \| T[] | Value to convert |

**Returns**

Returns an array.

**Example**

```javascript
toArray([1, 2, 3])     // [1, 2, 3] (returned as-is)
toArray(123)           // [123]
toArray('hello')       // ['hello']
toArray(null)          // [null]
toArray(undefined)     // [undefined]
```

---

## Logging Functions

### warn()

Outputs a warning message.

```typescript
function warn(message: string, ...args: unknown[]): void
```

**Parameters**

| Parameter | Type | Description |
|------|------|------|
| message | string | Warning message |
| args | unknown[] | Additional arguments |

**Example**

```javascript
warn('This is a warning')
// [Fluxion Warn] This is a warning

warn('Invalid value:', value)
// [Fluxion Warn] Invalid value: <value>
```

### error()

Outputs an error message.

```typescript
function error(message: string, ...args: unknown[]): void
```

**Parameters**

| Parameter | Type | Description |
|------|------|------|
| message | string | Error message |
| args | unknown[] | Additional arguments |

**Example**

```javascript
error('This is an error')
// [Fluxion Error] This is an error

error('Failed to parse:', source)
// [Fluxion Error] Failed to parse: <source>
```

### debug()

Outputs debug information (only in development environment).

```typescript
function debug(message: string, ...args: unknown[]): void
```

**Parameters**

| Parameter | Type | Description |
|------|------|------|
| message | string | Debug message |
| args | unknown[] | Additional arguments |

**Example**

```javascript
debug('Debug info:', data)
// [Fluxion Debug] Debug info: <data> (development only)
```

---

## Type Definitions

```typescript
// Generic function type
type AnyFunction = (...args: any[]) => any

// Generic object type
type AnyObject = Record<string, any>

// Options type
interface Options {
    deep?: boolean
    immediate?: boolean
    flush?: 'pre' | 'post' | 'sync'
}
```

---

## Usage Scenarios

### Parameter Validation

```javascript
import { isFunction, isObject, isString } from '@fluxion-ui/shared'

function createComponent(options) {
    if (!isObject(options)) {
        warn('Component options must be an object')
        return
    }

    if (options.setup && !isFunction(options.setup)) {
        warn('setup must be a function')
        return
    }

    // Create component...
}
```

### Property Checking

```javascript
import { hasOwn, isString } from '@fluxion-ui/shared'

function getProp(obj, key, defaultValue) {
    if (hasOwn(obj, key)) {
        const value = obj[key]
        return isString(value) ? value : defaultValue
    }
    return defaultValue
}
```

### Data Normalization

```javascript
import { toArray, isArray } from '@fluxion-ui/shared'

function normalizeChildren(children) {
    if (!children) return []

    // Ensure always returns array
    const result = toArray(children)

    // Flatten nested arrays
    return result.flat(Infinity)
}
```

### Conditional Logic

```javascript
import { isPromise, isFunction } from '@fluxion-ui/shared'

async function resolveValue(value) {
    if (isPromise(value)) {
        return await value
    }

    if (isFunction(value)) {
        const result = value()
        if (isPromise(result)) {
            return await result
        }
        return result
    }

    return value
}
```

---

## Best Practices

### Type Guards

These type check functions can be used as TypeScript type guards:

```typescript
import { isString, isObject } from '@fluxion-ui/shared'

function process(value: unknown) {
    if (isString(value)) {
        // TypeScript knows value is string
        console.log(value.toUpperCase())
    }

    if (isObject(value)) {
        // TypeScript knows value is object
        console.log(Object.keys(value))
    }
}
```

### Defensive Programming

Use type check functions for defensive programming:

```typescript
import { isFunction, warn } from '@fluxion-ui/shared'

function safeCall(fn: unknown, ...args: unknown[]) {
    if (!isFunction(fn)) {
        warn('safeCall: first argument must be a function')
        return undefined
    }

    try {
        return fn(...args)
    } catch (e) {
        warn('safeCall: function threw an error', e)
        return undefined
    }
}
```

---

## Next Steps

- [Reactivity API](reactivity-api.md) - Reactivity system APIs
- [Runtime API](runtime-api.md) - Application and renderer APIs
- [Compiler API](compiler-api.md) - Compilation and transform APIs