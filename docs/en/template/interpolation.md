# Interpolation

Interpolation is used to insert dynamic values into templates.

## Basic Usage

### Text Interpolation

```nui
name = signal("Fluxion")

view
div
    p Hello {name}
    p Welcome to {name}
```

### Auto Signal Invocation

Signal values are automatically invoked:

```nui
count = signal(0)

view
div
    // These are equivalent
    p Count: {count}
    p Count: {count()}
```

## Expression Interpolation

### Arithmetic Operations

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

### String Operations

```nui
firstName = signal("John")
lastName = signal("Doe")

view
div
    p Full name: {firstName()} {lastName()}
    p Upper: {firstName().toUpperCase()}
    p Length: {firstName().length}
```

### Ternary Expression

```nui
count = signal(5)

view
div
    p Status: {count() > 0 ? 'Positive' : 'Non-positive'}
    p Result: {count() % 2 === 0 ? 'Even' : 'Odd'}
```

### Function Calls

```nui
items = signal([1, 2, 3, 4, 5])

view
div
    p Count: {items().length}
    p First: {items()[0]}
    p Last: {items()[items().length - 1]}
```

## Objects and Arrays

### Object Property Access

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

### Nested Objects

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

### Array Access

```nui
items = signal(['Apple', 'Banana', 'Orange'])

view
div
    p First: {items()[0]}
    p Second: {items()[1]}
    p Length: {items().length}
```

## Complex Expressions

### Array Methods

```nui
numbers = signal([1, 2, 3, 4, 5])

view
div
    p Sum: {numbers().reduce((a, b) => a + b, 0)}
    p Doubled: {numbers().map(n => n * 2).join(', ')}
    p Filtered: {numbers().filter(n => n > 2).join(', ')}
```

### Object Destructuring

```nui
user = signal({ name: "John", age: 30 })

view
div
    p Info: {{ name, age } = user(); `${name} is ${age}`}
```

## Escaping

### HTML Escaping

Interpolated content is automatically HTML-escaped:

```nui
htmlContent = signal("<script>alert('xss')</script>")

view
div
    p {htmlContent}
    // Shows: <script>alert('xss')</script>
```

### Raw HTML

To insert raw HTML (use with caution):

```nui
htmlContent = signal("<strong>Bold</strong>")

view
div innerHTML={htmlContent()}
```

## Expression Limitations

### Supported Expressions

- Variable access
- Property access (`obj.prop`)
- Array index (`arr[0]`)
- Function calls (`fn()`)
- Arithmetic operations (`+`, `-`, `*`, `/`, `%`)
- Comparison operations (`===`, `!==`, `>`, `<`, `>=`, `<=`)
- Logical operations (`&&`, `||`, `!`)
- Ternary expression (`a ? b : c`)
- Template literals (`` `text ${value}` ``)
- Array/object literals

### Unsupported Expressions

```nui
// ❌ Not supported: statements
{ if (condition) { ... } }

// ❌ Not supported: declarations
{ const x = 1 }

// ❌ Not supported: multiline code
{
    const x = 1
    return x
}
```

## Best Practices

### Keep It Simple

```nui
// ✅ Good: Simple expression
p Total: {price() * quantity()}

// ❌ Avoid: Complex logic
p Result: {items().filter(i => i.active).map(i => i.price).reduce((a, b) => a + b, 0)}

// ✅ Better: Use computed
total = computed(() =>
    items()
        .filter(i => i.active)
        .reduce((sum, i) => sum + i.price, 0)
)
p Total: {total}
```

### Use Computed Properties

```nui
// ✅ Good: Use computed
fullName = computed(() => `${firstName()} ${lastName()}`)
p Name: {fullName}

// ❌ Avoid: Inline calculation
p Name: {firstName() + ' ' + lastName()}
```

### Formatting Functions

```nui
function formatPrice(price) {
    return `$${price.toFixed(2)}`
}

price = signal(99.99)

view
div
    p Price: {formatPrice(price())}
```

## Next Steps

- [Conditional Rendering](conditionals.md) - if/elif/else conditional rendering
- [List Rendering](lists.md) - for loop rendering
- [Elements & Attributes](elements.md) - HTML/SVG elements