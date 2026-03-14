# Conditional Rendering

Use `if`, `elif`, `else` to render different content based on conditions.

## Basic Usage

### if Statement

```nui
isLoading = signal(true)

view
div
    if isLoading
        p Loading...
```

### if-else Statement

```nui
isLoggedIn = signal(false)

view
div
    if isLoggedIn
        p Welcome back!
    else
        p Please login
```

### if-elif-else Statement

```nui
status = signal('loading')

view
div
    if status() === 'loading'
        p Loading...
    elif status() === 'error'
        p Failed to load
    elif status() === 'success'
        p Success
    else
        p Unknown status
```

## Conditional Expressions

### Signal Value Comparison

```nui
count = signal(0)

view
div
    if count() > 0
        p Positive
    elif count() < 0
        p Negative
    else
        p Zero
```

### Complex Conditions

```nui
user = signal({ name: 'John', role: 'admin' })

view
div
    if user().role === 'admin'
        p Admin Panel
    elif user().role === 'user'
        p User Panel
    else
        p Guest Panel
```

### Logical Operations

```nui
isLoggedIn = signal(true)
isAdmin = signal(false)

view
div
    if isLoggedIn() && isAdmin()
        p Admin privileges
    elif isLoggedIn()
        p Regular user
    else
        p Please login
```

## Nested Conditions

```nui
user = signal({ name: 'John', age: 25, verified: true })

view
div
    if user()
        if user().age >= 18
            if user().verified
                p Verified adult user
            else
                p Unverified adult user
        else
            p Minor user
    else
        p Not logged in
```

## Conditional Component Rendering

```nui
import Loading from "./Loading.nui"
import Error from "./Error.nui"
import Content from "./Content.nui"

data = signal(null)
error = signal(null)
isLoading = signal(true)

view
div
    if isLoading
        Loading
    elif error
        Error message={error().message}
    else
        Content data={data}
```

## Combined with List Rendering

```nui
items = signal([1, 2, 3, 4, 5])

view
div
    if items().length > 0
        ul
            for item in items
                li {item}
    else
        p No data
```

## Function Calls in Conditions

```nui
function isValid(value) {
    return value && value.length > 0
}

name = signal("")

view
div
    if isValid(name())
        p Valid name
    else
        p Please enter name
```

## Important Notes

### Condition Values Must Be Boolean or Coercible

```nui
// ✅ Correct: Boolean
if isActive()
    p Active

// ✅ Correct: truthy/falsy values
if user()
    p Logged in

// ✅ Correct: Comparison expression
if count() > 0
    p Has items
```

### Avoid Modifying State in Conditions

```nui
// ❌ Wrong: Side effect in condition
if (count.update(c => c + 1), count() > 10)
    p Done

// ✅ Correct: Pure expression in condition
if count() > 10
    p Done
```

### Use key for Optimization

Use key when conditionally rendering components:

```nui
view
div
    if mode() === 'edit'
        EditForm key="edit"
    else
        ViewForm key="view"
```

## Best Practices

### Keep Conditions Simple

```nui
// ✅ Good: Simple condition
if isLoading
    Loading

// ❌ Avoid: Complex inline logic
if data() && data().items && data().items.length > 0 && !error()
    Content

// ✅ Better: Use computed
hasContent = computed(() =>
    data() &&
    data().items &&
    data().items.length > 0 &&
    !error()
)

if hasContent
    Content
```

### Use Early Return Pattern

```nui
// ✅ Good: Early return
view
div
    if !user
        p Please login
    elif !user().verified
        p Please verify email
    else
        p Welcome {user().name}
```

## Complete Example

```nui
// Auth status component
user = signal(null)
isLoading = signal(true)
error = signal(null)

async function checkAuth() {
    isLoading.set(true)
    try {
        const response = await fetch('/api/user')
        if (response.ok) {
            user.set(await response.json())
        }
    } catch (e) {
        error.set(e)
    } finally {
        isLoading.set(false)
    }
}

checkAuth()

view
div class="auth-status"
    if isLoading
        div class="loading"
            p Checking login status...
    elif error
        div class="error"
            p Login check failed
            button @click=checkAuth Retry
    elif user
        div class="logged-in"
            p Welcome, {user().name}
            if user().role === 'admin'
                span class="badge" Admin
            button @click={() => user.set(null)} Logout
    else
        div class="logged-out"
            p You are not logged in
            button Login
            button Register

style
.auth-status {
    padding 20px
}

.loading, .error, .logged-in, .logged-out {
    padding 16px
    border-radius 8px
}

.loading {
    background #f0f0f0
}

.error {
    background #ffebee
    color #c62828
}

.badge {
    background #4caf50
    color white
    padding 2px 8px
    border-radius 4px
    font-size 12px
}
```

## Next Steps

- [List Rendering](lists.md) - for loop rendering
- [Event Handling](events.md) - Event binding and handling
- [Interpolation](interpolation.md) - Text and expression interpolation