# 工具函数 API 参考

本章节详细介绍 Fluxion 提供的工具函数。

## 导入

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

## 类型检查函数

### isFunction()

判断值是否为函数。

```typescript
function isFunction(value: unknown): value is Function
```

**参数**

| 参数 | 类型 | 描述 |
|------|------|------|
| value | unknown | 要检查的值 |

**返回值**

如果值是函数返回 `true`，否则返回 `false`。

**示例**

```javascript
isFunction(() => {})        // true
isFunction(function() {})   // true
isFunction(class Foo {})    // true
isFunction(123)             // false
isFunction('hello')         // false
```

### isObject()

判断值是否为对象（非 null）。

```typescript
function isObject(value: unknown): value is object
```

**参数**

| 参数 | 类型 | 描述 |
|------|------|------|
| value | unknown | 要检查的值 |

**返回值**

如果值是对象且不是 `null` 返回 `true`。

**示例**

```javascript
isObject({})           // true
isObject([])           // true
isObject(null)         // false
isObject(123)          // false
isObject('hello')      // false
isObject(() => {})     // false
```

### isArray()

判断值是否为数组。

```typescript
function isArray(value: unknown): value is Array<unknown>
```

**参数**

| 参数 | 类型 | 描述 |
|------|------|------|
| value | unknown | 要检查的值 |

**返回值**

如果值是数组返回 `true`。

**示例**

```javascript
isArray([])            // true
isArray([1, 2, 3])     // true
isArray({})            // false
isArray('hello')       // false
```

### isString()

判断值是否为字符串。

```typescript
function isString(value: unknown): value is string
```

**参数**

| 参数 | 类型 | 描述 |
|------|------|------|
| value | unknown | 要检查的值 |

**返回值**

如果值是字符串返回 `true`。

**示例**

```javascript
isString('hello')      // true
isString("")           // true
isString(123)          // false
isString(['a', 'b'])   // false
```

### isPromise()

判断值是否为 Promise。

```typescript
function isPromise(value: unknown): value is Promise<unknown>
```

**参数**

| 参数 | 类型 | 描述 |
|------|------|------|
| value | unknown | 要检查的值 |

**返回值**

如果值是 Promise 实例返回 `true`。

**示例**

```javascript
isPromise(Promise.resolve())     // true
isPromise(new Promise(() => {})) // true
isPromise({})                    // false
isPromise({ then: () => {} })    // false (不是 Promise 实例)
```

### isMap()

判断值是否为 Map。

```typescript
function isMap(value: unknown): value is Map<unknown, unknown>
```

**参数**

| 参数 | 类型 | 描述 |
|------|------|------|
| value | unknown | 要检查的值 |

**返回值**

如果值是 Map 实例返回 `true`。

**示例**

```javascript
isMap(new Map())       // true
isMap(new Set())       // false
isMap({})              // false
```

### isSet()

判断值是否为 Set。

```typescript
function isSet(value: unknown): value is Set<unknown>
```

**参数**

| 参数 | 类型 | 描述 |
|------|------|------|
| value | unknown | 要检查的值 |

**返回值**

如果值是 Set 实例返回 `true`。

**示例**

```javascript
isSet(new Set())       // true
isSet(new Map())       // false
isSet([])              // false
```

### isInteger()

判断值是否为整数。

```typescript
function isInteger(value: unknown): boolean
```

**参数**

| 参数 | 类型 | 描述 |
|------|------|------|
| value | unknown | 要检查的值 |

**返回值**

如果值是整数返回 `true`。

**示例**

```javascript
isInteger(123)         // true
isInteger(0)           // true
isInteger(-5)          // true
isInteger(1.5)         // false
isInteger('123')       // false
isInteger(NaN)         // false
```

---

## 对象操作函数

### hasOwn()

判断对象是否有指定属性（自身属性，非继承）。

```typescript
function hasOwn(obj: object, key: string | symbol): boolean
```

**参数**

| 参数 | 类型 | 描述 |
|------|------|------|
| obj | object | 要检查的对象 |
| key | string \| symbol | 属性名 |

**返回值**

如果对象有指定的自身属性返回 `true`。

**示例**

```javascript
const obj = { name: 'Fluxion' }

hasOwn(obj, 'name')           // true
hasOwn(obj, 'toString')       // false (继承属性)
hasOwn(obj, 'age')            // false

const arr = [1, 2, 3]
hasOwn(arr, 'length')         // true
hasOwn(arr, 0)                // true (索引也是属性)
```

---

## 数组/集合操作函数

### toArray()

将值转换为数组。如果已经是数组则直接返回，否则包装为数组。

```typescript
function toArray<T>(value: T | T[]): T[]
```

**参数**

| 参数 | 类型 | 描述 |
|------|------|------|
| value | T \| T[] | 要转换的值 |

**返回值**

返回数组。

**示例**

```javascript
toArray([1, 2, 3])     // [1, 2, 3] (原样返回)
toArray(123)           // [123]
toArray('hello')       // ['hello']
toArray(null)          // [null]
toArray(undefined)     // [undefined]
```

---

## 日志函数

### warn()

输出警告信息。

```typescript
function warn(message: string, ...args: unknown[]): void
```

**参数**

| 参数 | 类型 | 描述 |
|------|------|------|
| message | string | 警告消息 |
| args | unknown[] | 附加参数 |

**示例**

```javascript
warn('This is a warning')
// [Fluxion Warn] This is a warning

warn('Invalid value:', value)
// [Fluxion Warn] Invalid value: <value>
```

### error()

输出错误信息。

```typescript
function error(message: string, ...args: unknown[]): void
```

**参数**

| 参数 | 类型 | 描述 |
|------|------|------|
| message | string | 错误消息 |
| args | unknown[] | 附加参数 |

**示例**

```javascript
error('This is an error')
// [Fluxion Error] This is an error

error('Failed to parse:', source)
// [Fluxion Error] Failed to parse: <source>
```

### debug()

输出调试信息（仅在开发环境）。

```typescript
function debug(message: string, ...args: unknown[]): void
```

**参数**

| 参数 | 类型 | 描述 |
|------|------|------|
| message | string | 调试消息 |
| args | unknown[] | 附加参数 |

**示例**

```javascript
debug('Debug info:', data)
// [Fluxion Debug] Debug info: <data> (仅开发环境)
```

---

## 类型定义

```typescript
// 通用函数类型
type AnyFunction = (...args: any[]) => any

// 通用对象类型
type AnyObject = Record<string, any>

// 选项类型
interface Options {
    deep?: boolean
    immediate?: boolean
    flush?: 'pre' | 'post' | 'sync'
}
```

---

## 使用场景

### 参数验证

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

    // 创建组件...
}
```

### 属性检查

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

### 数据规范化

```javascript
import { toArray, isArray } from '@fluxion-ui/shared'

function normalizeChildren(children) {
    if (!children) return []

    // 确保总是返回数组
    const result = toArray(children)

    // 扁平化嵌套数组
    return result.flat(Infinity)
}
```

### 条件判断

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

## 最佳实践

### 类型守卫

这些类型检查函数可以作为 TypeScript 的类型守卫使用：

```typescript
import { isString, isObject } from '@fluxion-ui/shared'

function process(value: unknown) {
    if (isString(value)) {
        // TypeScript 知道 value 是 string 类型
        console.log(value.toUpperCase())
    }

    if (isObject(value)) {
        // TypeScript 知道 value 是 object 类型
        console.log(Object.keys(value))
    }
}
```

### 防御性编程

使用类型检查函数进行防御性编程：

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

## 下一步

- [响应式 API](reactivity-api.md) - 响应式系统 API
- [运行时 API](runtime-api.md) - 应用和渲染器 API
- [编译器 API](compiler-api.md) - 编译和转换 API