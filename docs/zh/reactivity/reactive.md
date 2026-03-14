# Reactive 对象

Reactive 提供了一种创建响应式对象的方式，基于 Proxy 实现，适合管理复杂的状态结构。

## 基本用法

### reactive()

创建响应式对象：

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

// 直接修改属性
user.name = 'Jane'
user.age = 31

// 嵌套属性也是响应式的
user.address.city = 'Boston'
```

### 与 Signal 对比

```javascript
// Signal - 需要通过方法访问和修改
const count = signal(0)
count()        // 读取
count.set(1)   // 修改

// Reactive - 直接访问和修改
const user = reactive({ name: 'John' })
user.name      // 读取
user.name = 'Jane'  // 修改
```

## 深层响应式

`reactive()` 创建的对象是深层响应式的：

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

// 所有层级都是响应式的
state.user.profile.settings.theme = 'light'
```

## 浅层响应式

### shallowReactive()

只对第一层属性响应：

```javascript
import { shallowReactive } from '@fluxion-ui/fluxion'

const state = shallowReactive({
    name: 'John',
    address: {
        city: 'New York'
    }
})

state.name = 'Jane'           // 响应式
state.address.city = 'Boston' // 不是响应式！
```

## 只读对象

### readonly()

创建只读响应式对象：

```javascript
import { readonly } from '@fluxion-ui/fluxion'

const original = reactive({ count: 0 })
const readOnly = readonly(original)

readOnly.count = 1  // 警告：无法修改只读对象
```

### shallowReadonly()

只对第一层属性只读：

```javascript
import { shallowReadonly } from '@fluxion-ui/fluxion'

const state = shallowReadonly({
    count: 0,
    nested: { value: 1 }
})

state.count = 1         // 警告：无法修改
state.nested.value = 2  // 允许修改（不推荐）
```

## 检查函数

### isReactive()

检查是否是 reactive 对象：

```javascript
import { reactive, isReactive } from '@fluxion-ui/fluxion'

const state = reactive({ count: 0 })

console.log(isReactive(state))  // true
console.log(isReactive({}))     // false
```

### isReadonly()

检查是否是只读对象：

```javascript
import { readonly, isReadonly } from '@fluxion-ui/fluxion'

const state = readonly({ count: 0 })

console.log(isReadonly(state))  // true
```

### isProxy()

检查是否是 Proxy 对象：

```javascript
import { reactive, readonly, isProxy } from '@fluxion-ui/fluxion'

const state = reactive({})
const readOnly = readonly({})

console.log(isProxy(state))     // true
console.log(isProxy(readOnly))  // true
console.log(isProxy({}))        // false
```

## 转换函数

### toRaw()

获取 Proxy 对象的原始对象：

```javascript
import { reactive, toRaw } from '@fluxion-ui/fluxion'

const state = reactive({ count: 0 })
const raw = toRaw(state)

console.log(raw === state)  // false
raw.count = 1               // 不是响应式！
```

### toReactive()

将值转换为 reactive：

```javascript
import { toReactive } from '@fluxion-ui/fluxion'

const raw = { count: 0 }
const reactive = toReactive(raw)

reactive.count = 1  // 响应式
```

### toRef()

为对象的某个属性创建 ref：

```javascript
import { reactive, toRef } from '@fluxion-ui/fluxion'

const state = reactive({ count: 0, name: 'John' })

const countRef = toRef(state, 'count')

console.log(countRef.value)  // 0
countRef.value = 1           // 响应式更新
```

## API 参考

### reactive()

```typescript
function reactive<T extends object>(target: T): T
```

创建深层响应式对象。

### shallowReactive()

```typescript
function shallowReactive<T extends object>(target: T): T
```

创建浅层响应式对象。

### readonly()

```typescript
function readonly<T extends object>(target: T): Readonly<T>
```

创建只读响应式对象。

### shallowReadonly()

```typescript
function shallowReadonly<T extends object>(target: T): Readonly<T>
```

创建浅层只读对象。

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

## 使用场景

### 表单状态管理

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

### 应用状态

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

## 注意事项

### 解构丢失响应性

```javascript
const state = reactive({ count: 0, name: 'John' })

// ❌ 解构后失去响应性
const { count, name } = state

// ✅ 使用 toRef
import { toRef } from '@fluxion-ui/fluxion'
const countRef = toRef(state, 'count')
```

### 替换整个对象

```javascript
const state = reactive({ count: 0 })

// ❌ 替换对象会失去响应性
state = { count: 1 }  // 错误！

// ✅ 使用 Object.assign
Object.assign(state, { count: 1 })

// ✅ 或逐个修改属性
state.count = 1
```

### 数组方法

```javascript
const list = reactive([1, 2, 3])

// ✅ 可变方法正常工作
list.push(4)
list.pop()
list.splice(0, 1)

// ❌ 直接赋值长度无效
list.length = 0  // 不推荐

// ✅ 使用 splice 清空
list.splice(0)
```

## 下一步

- [AsyncSignal 异步数据](async-signal.md) - 异步数据处理
- [Signal API](signal-api.md) - Signal 完整 API
- [Watch 监听器](watch.md) - 状态监听