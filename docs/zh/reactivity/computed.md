# Computed 计算属性

Computed（计算属性）用于基于其他响应式状态派生新值。它具有缓存特性，只有依赖项变化时才重新计算。

## 基本用法

### 创建计算属性

```nui
firstName = signal("John")
lastName = signal("Doe")

// 创建计算属性
fullName = computed(() => `${firstName()} ${lastName()}`)

view
p Full Name: {fullName}
```

当 `firstName` 或 `lastName` 变化时，`fullName` 会自动重新计算。

### 计算属性特点

1. **惰性求值**：只有被访问时才计算
2. **自动缓存**：依赖不变时返回缓存值
3. **自动追踪**：自动收集依赖关系

## 缓存机制

计算属性会缓存计算结果，只有依赖项变化时才重新计算：

```nui
a = signal(1)
b = signal(2)

// 计算属性
sum = computed(() => {
    console.log('Calculating...')  // 只在依赖变化时打印
    return a() + b()
})

view
div
    p Sum: {sum}      // 首次访问，计算
    p Sum: {sum}      // 使用缓存，不重新计算
    p Sum: {sum}      // 使用缓存，不重新计算
```

## 使用场景

### 格式化数据

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

### 过滤和排序

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

### 组合状态

```nui
user = signal({ name: "John", age: 30 })
settings = signal({ theme: "dark", lang: "en" })

userDisplay = computed(() => `${user().name} (${user().age} years old)`)
isDarkMode = computed(() => settings().theme === "dark")

view
div class={isDarkMode ? 'dark' : 'light'}
    p {userDisplay}
```

## API 参考

### computed()

创建一个计算属性。

```typescript
function computed<T>(getter: () => T): Computed<T>

interface Computed<T> {
    (): T  // 读取值
}
```

#### 参数

| 参数 | 类型 | 描述 |
|------|------|------|
| getter | () => T | 计算函数 |

#### 示例

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

将计算属性包装为只读。

```typescript
function readonly<T>(computed: Computed<T>): Computed<T>
```

### isCached()

检查计算属性是否有缓存值。

```typescript
function isCached<T>(computed: Computed<T>): boolean
```

### refresh()

强制刷新计算属性的缓存。

```typescript
function refresh<T>(computed: Computed<T>): void
```

#### 示例

```nui
import { signal, computed, refresh } from '@fluxion-ui/fluxion'

timestamp = signal(Date.now())
timeDisplay = computed(() => new Date(timestamp()).toLocaleTimeString())

function updateTimestamp() {
    timestamp.set(Date.now())
}

function forceRefresh() {
    // 强制重新计算
    refresh(timeDisplay)
}

view
div
    p Time: {timeDisplay}
    button @click=updateTimestamp Update
    button @click=forceRefresh Force Refresh
```

### computedSet()

创建可写的计算属性。

```typescript
function computedSet<T>(getter: () => T, setter: (value: T) => void): Computed<T>
```

#### 示例

```nui
import { signal, computedSet } from '@fluxion-ui/fluxion'

firstName = signal("John")
lastName = signal("Doe")

// 可写的计算属性
fullName = computedSet(
    () => `${firstName()} ${lastName()}`,
    (value) => {
        const [first, last] = value.split(' ')
        firstName.set(first || '')
        lastName.set(last || '')
    }
)

// 可以读取
view
p Full Name: {fullName}

// 也可以设置
function changeName() {
    fullName.set("Jane Smith")
}
```

## 性能优化

### 避免昂贵计算

```nui
// ❌ 不好：每次访问都执行昂贵操作
heavyResult = computed(() => {
    // 复杂计算
    let result = 0
    for (let i = 0; i < 1000000; i++) {
        result += Math.sqrt(i)
    }
    return result
})

// ✅ 更好：使用缓存的结果
data = signal(null)

async function loadHeavyResult() {
    const result = await computeHeavyResult()
    data.set(result)
}
```

### 合理拆分

```nui
// ❌ 不好：一个大的计算属性
userSummary = computed(() => {
    const u = user()
    const s = settings()
    return {
        name: u.name,
        email: u.email,
        theme: s.theme,
        lang: s.lang,
        formattedName: `${u.name} (${u.email})`,
        // ...更多计算
    }
})

// ✅ 更好：拆分为多个计算属性
userName = computed(() => user().name)
userEmail = computed(() => user().email)
userTheme = computed(() => settings().theme)
formattedName = computed(() => `${userName()} (${userEmail()})`)
```

## 注意事项

### 避免副作用

计算属性应该是纯函数，不要在计算属性中执行副作用：

```nui
// ❌ 错误：在计算属性中执行副作用
count = signal(0)
bad = computed(() => {
    console.log('Side effect!')  // 副作用
    fetch('/api/log', { method: 'POST', body: count() })  // 副作用
    return count() * 2
})

// ✅ 正确：纯计算
count = signal(0)
double = computed(() => count() * 2)
```

### 避免循环依赖

```nui
// ❌ 错误：循环依赖
a = computed(() => b() + 1)
b = computed(() => a() + 1)  // 无限循环
```

## 下一步

- [Effect 副作用](effect.md) - 响应式副作用
- [Watch 监听器](watch.md) - 状态监听
- [Reactive 对象](reactive.md) - 响应式对象