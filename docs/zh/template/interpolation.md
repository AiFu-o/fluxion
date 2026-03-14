# 插值表达式

插值表达式用于在模板中插入动态值。

## 基本用法

### 文本插值

```nui
name = signal("Fluxion")

view
div
    p Hello {name}
    p Welcome to {name}
```

### Signal 自动调用

Signal 值会自动被调用：

```nui
count = signal(0)

view
div
    // 这两种写法等价
    p Count: {count}
    p Count: {count()}
```

## 表达式插值

### 算术运算

```nui
a = signal(10)
b = signal(5)

view
div
    p Sum: {a() + b()}
    p Difference: {a() - b()}
    p Product: {a() * b()}
    p Quotient: {a() / b()}
```

### 字符串操作

```nui
firstName = signal("John")
lastName = signal("Doe")

view
div
    p Full name: {firstName()} {lastName()}
    p Upper: {firstName().toUpperCase()}
    p Length: {firstName().length}
```

### 三元表达式

```nui
count = signal(5)

view
div
    p Status: {count() > 0 ? 'Positive' : 'Non-positive'}
    p Result: {count() % 2 === 0 ? 'Even' : 'Odd'}
```

### 函数调用

```nui
items = signal([1, 2, 3, 4, 5])

view
div
    p Count: {items().length}
    p First: {items()[0]}
    p Last: {items()[items().length - 1]}
```

## 对象和数组

### 对象属性访问

```nui
user = signal({
    name: "John",
    age: 30,
    email: "john@example.com"
})

view
div
    p Name: {user().name}
    p Age: {user().age}
    p Email: {user().email}
```

### 嵌套对象

```nui
data = signal({
    user: {
        profile: {
            name: "John"
        }
    }
})

view
div
    p Name: {data().user.profile.name}
```

### 数组访问

```nui
items = signal(['Apple', 'Banana', 'Orange'])

view
div
    p First: {items()[0]}
    p Second: {items()[1]}
    p Length: {items().length}
```

## 复杂表达式

### 数组方法

```nui
numbers = signal([1, 2, 3, 4, 5])

view
div
    p Sum: {numbers().reduce((a, b) => a + b, 0)}
    p Doubled: {numbers().map(n => n * 2).join(', ')}
    p Filtered: {numbers().filter(n => n > 2).join(', ')}
```

### 对象解构

```nui
user = signal({ name: "John", age: 30 })

view
div
    p Info: {{ name, age } = user(); `${name} is ${age}`}
```

## 转义

### HTML 转义

插值内容会自动转义 HTML：

```nui
htmlContent = signal("<script>alert('xss')</script>")

view
div
    p {htmlContent}
    // 显示: <script>alert('xss')</script>
```

### 原始 HTML

如需插入原始 HTML（谨慎使用）：

```nui
htmlContent = signal("<strong>Bold</strong>")

view
div innerHTML={htmlContent()}
```

## 表达式限制

### 支持的表达式

- 变量访问
- 属性访问 (`obj.prop`)
- 数组索引 (`arr[0]`)
- 函数调用 (`fn()`)
- 算术运算 (`+`, `-`, `*`, `/`, `%`)
- 比较运算 (`===`, `!==`, `>`, `<`, `>=`, `<=`)
- 逻辑运算 (`&&`, `||`, `!`)
- 三元表达式 (`a ? b : c`)
- 模板字符串 (`` `text ${value}` ``)
- 数组/对象字面量

### 不支持的表达式

```nui
// ❌ 不支持：语句
{ if (condition) { ... } }

// ❌ 不支持：声明
{ const x = 1 }

// ❌ 不支持：多行代码
{
    const x = 1
    return x
}
```

## 最佳实践

### 保持简单

```nui
// ✅ 好：简单表达式
p Total: {price() * quantity()}

// ❌ 避免：复杂逻辑
p Result: {items().filter(i => i.active).map(i => i.price).reduce((a, b) => a + b, 0)}

// ✅ 更好：使用 computed
total = computed(() =>
    items()
        .filter(i => i.active)
        .reduce((sum, i) => sum + i.price, 0)
)
p Total: {total}
```

### 使用计算属性

```nui
// ✅ 好：使用 computed
fullName = computed(() => `${firstName()} ${lastName()}`)
p Name: {fullName}

// ❌ 避免：内联计算
p Name: {firstName() + ' ' + lastName()}
```

### 格式化函数

```nui
function formatPrice(price) {
    return `$${price.toFixed(2)}`
}

price = signal(99.99)

view
div
    p Price: {formatPrice(price())}
```

## 下一步

- [条件渲染](conditionals.md) - if/elif/else 条件渲染
- [列表渲染](lists.md) - for 循环渲染
- [元素与属性](elements.md) - HTML/SVG 元素