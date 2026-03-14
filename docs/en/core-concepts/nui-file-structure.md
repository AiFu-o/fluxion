# .nui File Structure

`.nui` files are the core of Fluxion, using a custom DSL to describe components. This chapter details the various parts of a `.nui` file.

## File Components

A complete `.nui` file consists of the following parts:

```nui
// 1. import declarations (optional)
import ComponentName from "./path/to/Component.nui"

// 2. signal declarations
count = signal(0)
name = signal("Fluxion")

// 3. function declarations
function increment() {
    count.update(c => c + 1)
}

// 4. view block (required)
view
div
    p Hello {name}

// 5. style block (optional)
style
div {
    padding 20px
}
```

## import Declarations

Used to import other components or modules:

```nui
// Import components
import Button from "./Button.nui"
import Header from "./components/Header.nui"

// Import JavaScript modules
import { format } from "date-fns"
import * as utils from "./utils.js"
```

### Import Rules

- Supports relative paths and package names
- Imported components can be used directly in view block
- Imported functions can be called in functions

## signal Declarations

Signal is the foundation of Fluxion's reactive state management:

```nui
// Primitive types
count = signal(0)
name = signal("Fluxion")
isActive = signal(true)

// Objects and arrays
user = signal({ name: "John", age: 30 })
items = signal([1, 2, 3])

// Async data
users = asyncSignal(fetchUsers)
data = asyncSignal(() => fetch('/api/data').then(r => r.json()))
```

### Signal Features

- **Reactive**: UI updates automatically when value changes
- **Fine-grained**: Only parts using the signal update
- **Trackable**: Dependencies are automatically collected

## function Declarations

Define component methods:

```nui
// Function without parameters
function reset() {
    count.set(0)
}

// Function with parameters
function add(a, b) {
    return a + b
}

// Event handler
function handleClick(event) {
    console.log('clicked', event)
}

// Async function
async function fetchData() {
    const response = await fetch('/api/data')
    data.set(await response.json())
}
```

### Function Features

- Can access signals within the component
- Can be used as event handlers
- Support async operations

## view Block

The `view` block defines the component's template structure and is required in `.nui` files:

### Basic Structure

```nui
view
div
    h1 Title
    p Paragraph content
    button Button
```

### Element Syntax

```nui
// Simple elements
div
p
span

// With text content
h1 Title text
p This is paragraph

// With attributes
div id="container"
input type="text" placeholder="Enter text"
a href="https://example.com" Link

// With dynamic attributes
div id={dynamicId}
input value={inputValue}

// With multiple attributes
div class="card" id="card-1" data-index={index}
```

### Nested Structure

Use Tab indentation for nesting:

```nui
view
div class="container"
    header
        h1 Website Title
        nav
            a href="/" Home
            a href="/about" About
    main
        article
            h2 Article Title
            p Article content...
    footer
        p Copyright
```

### Component Usage

```nui
// Imported component
import Button from "./Button.nui"

view
div
    Button text="Click me" onClick={handleClick}

// With children
import Card from "./Card.nui"

view
Card title="Card Title"
    p Card content
    button Action
```

### Interpolation

```nui
// Simple interpolation
p Hello {name}
p Count: {count}

// Expression interpolation
p Total: {price * quantity}
p Status: {isActive() ? 'Active' : 'Inactive'}

// Chained access
p User: {user().name}
p First item: {items()[0]}
```

### Conditional Rendering

```nui
view
div
    if loading
        p Loading...
    elif error
        p Error: {error}
    else
        p Data loaded
```

### List Rendering

```nui
view
ul
    for item in items
        li {item.name} - {item.price}

// With index
for item, index in items
    li {index}: {item}
```

### Event Binding

```nui
view
div
    // Click event
    button @click=handleClick
        Click

    // With parameters
    button @click=deleteItem(item.id)
        Delete

    // Input event
    input @input=handleInput

    // Form submit
    form @submit=handleSubmit
        input type="text"
        button Submit
```

## style Block

The `style` block defines component styles:

### Basic Syntax

```nui
style
div {
    padding 20px
    margin 10px
}

h1 {
    font-size 24px
    color #333
}

button {
    padding 8px 16px
    background-color #007bff
    color white
}
```

### Syntax Features

- Property names use kebab-case (recommended) or camelCase
- Property values don't need quotes (unless containing spaces)
- No semicolons needed at end
- Supports nested selectors

### Nested Selectors

```nui
style
.card {
    padding 16px
    border-radius 8px

    .title {
        font-size 18px
        font-weight bold
    }

    .content {
        margin-top 8px
    }
}
```

### Pseudo-classes and Pseudo-elements

```nui
style
button {
    background-color #007bff

    :hover {
        background-color #0056b3
    }

    :active {
        transform scale(0.98)
    }

    :disabled {
        opacity 0.5
        cursor not-allowed
    }
}
```

### Media Queries

```nui
style
.container {
    width 100%

    @media (min-width 768px) {
        width 750px
    }

    @media (min-width 1024px) {
        width 960px
    }
}
```

### CSS Variables

```nui
style
:root {
    --primary-color #007bff
    --text-color #333
    --spacing 16px
}

button {
    background-color var(--primary-color)
    color var(--text-color)
    padding var(--spacing)
}
```

## Complete Example

```nui
import Button from "./Button.nui"

// Reactive state
count = signal(0)
theme = signal('light')

// Methods
function increment() {
    count.update(c => c + 1)
}

function decrement() {
    count.update(c => c - 1)
}

function toggleTheme() {
    theme.update(t => t === 'light' ? 'dark' : 'light')
}

// Template
view
div class={theme}
    header
        h1 Counter App
        button @click=toggleTheme
            Toggle Theme
    main
        p Count: {count}
        div class="buttons"
            Button text="-" onClick={decrement}
            Button text="+" onClick={increment}
    footer
        p Fluxion Framework

// Styles
style
div {
    min-height 100vh
    padding 20px
    transition background-color 0.3s
}

div.light {
    background-color #fff
    color #333
}

div.dark {
    background-color #1a1a1a
    color #fff
}

header {
    display flex
    justify-content space-between
    align-items center
    margin-bottom 20px
}

h1 {
    font-size 24px
}

main {
    text-align center
}

p {
    font-size 48px
    margin 40px 0
}

.buttons {
    display flex
    gap 10px
    justify-content center
}

footer {
    text-align center
    margin-top 40px
    opacity 0.6
}
```

## Next Steps

- [Signal Reactive State](signal.md) - Deep dive into the reactivity system
- [Component Basics](component-basics.md) - Master component development
- [Template Syntax Overview](template-syntax.md) - Learn more template syntax