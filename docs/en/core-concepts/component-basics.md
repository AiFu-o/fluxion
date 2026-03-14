# Component Basics

Components are the basic building blocks of Fluxion applications. This chapter introduces component definition and usage.

## Component Definition

### Using .nui Files

The most common way is to create `.nui` files:

```nui
// Button.nui
text = signal("Button")

view
button
    {text}

style
button {
    padding 8px 16px
    background-color #007bff
    color white
    border none
    border-radius 4px
    cursor pointer
}
```

### Using JavaScript Objects

You can also define components using JavaScript objects:

```javascript
import { signal, h } from '@fluxion-ui/fluxion'

export const Button = {
    name: 'Button',
    setup(props) {
        const text = signal(props.text || 'Button')

        return () => h('button', {
            onClick: props.onClick
        }, text())
    }
}
```

## Component Usage

### Importing Components

```nui
import Button from "./Button.nui"

view
div
    Button text="Click me"
```

### Nested Usage

```nui
import Header from "./Header.nui"
import Content from "./Content.nui"
import Footer from "./Footer.nui"

view
div class="app"
    Header title="My App"
    Content
    Footer
```

## Props Passing

### Basic Passing

```nui
// Parent component
import Card from "./Card.nui"

view
div
    Card title="Hello" content="World"
```

```nui
// Card.nui
view
div class="card"
    h3 {title}
    p {content}

style
.card {
    padding 16px
    border 1px solid #ddd
    border-radius 8px
}
```

### Dynamic Props

```nui
// Parent component
import Button from "./Button.nui"

count = signal(0)

function handleClick() {
    count.update(c => c + 1)
}

view
div
    p Count: {count}
    Button text="Increment" onClick={handleClick}
```

### Props Default Values

```nui
// Button.nui
// Use JavaScript logic to set defaults
buttonText = signal(text || "Click me")

view
button @click=onClick
    {buttonText}

style
button {
    padding 8px 16px
    background-color #007bff
    color white
}
```

## Children Content

### Default Slot

```nui
// Card.nui
view
div class="card"
    slot

style
.card {
    padding 16px
    border-radius 8px
    box-shadow 0 2px 4px rgba(0,0,0,0.1)
}
```

```nui
// Parent component
import Card from "./Card.nui"

view
div
    Card
        p This is the card content
        button Action
```

### Named Slots

```nui
// Layout.nui
view
div class="layout"
    header
        slot name="header"
    main
        slot
    footer
        slot name="footer"
```

```nui
// Parent component
import Layout from "./Layout.nui"

view
Layout
    template slot="header"
        h1 Page Title
    p Main content here
    template slot="footer"
        p Copyright 2024
```

## Events

### Emitting Events

```nui
// Counter.nui
count = signal(0)

function increment() {
    count.update(c => c + 1)
    emit('change', count())
}

view
div
    p Count: {count}
    button @click=increment Increment
```

### Listening to Events

```nui
// Parent component
import Counter from "./Counter.nui"

totalCount = signal(0)

function handleChange(value) {
    totalCount.set(value)
}

view
div
    Counter @change=handleChange
    p Total: {totalCount}
```

## Component Composition

### Composition Pattern

```nui
// App.nui
import Header from "./Header.nui"
import Sidebar from "./Sidebar.nui"
import Main from "./Main.nui"

view
div class="app"
    Header
    div class="container"
        Sidebar
        Main
```

### Higher-Order Components

```javascript
// withLoading.js
import { signal } from '@fluxion-ui/fluxion'

export function withLoading(Component) {
    return {
        setup(props) {
            const loading = signal(true)

            // Simulate loading
            setTimeout(() => loading.set(false), 1000)

            return () => {
                if (loading()) {
                    return h('div', null, 'Loading...')
                }
                return h(Component, props)
            }
        }
    }
}
```

## Component Lifecycle

### Setup Phase

Executes when component initializes:

```nui
// Code executed during setup phase
data = signal(null)

// This code runs during setup
console.log('Component setup')

async function loadData() {
    const response = await fetch('/api/data')
    data.set(await response.json())
}

// Load data on initialization
loadData()

view
div
    if data
        p {data().message}
    else
        p Loading...
```

### Cleaning Up Effects

```javascript
import { signal, effect, onUnmounted } from '@fluxion-ui/fluxion'

// Using in component
const timer = effect(() => {
    const id = setInterval(() => {
        console.log('Tick')
    }, 1000)

    return () => clearInterval(id)
})
```

## Best Practices

### Single Responsibility

Each component should do one thing:

```nui
// ✅ Good: Single responsibility
// UserName.nui
view
span class="user-name" {name}

// UserProfile.nui
view
div class="user-profile"
    img src={avatar}
    UserName name={name}
```

### Props Validation

```javascript
// Can add validation when using JavaScript definition
export const Button = {
    props: {
        text: {
            type: String,
            required: true
        },
        onClick: {
            type: Function,
            required: false
        }
    },
    setup(props) {
        // ...
    }
}
```

### Avoid Deep Nesting

```nui
// ❌ Avoid: Deep nesting
view
div
    div
        div
            div
                p Content

// ✅ Better: Use component splitting
import Card from "./Card.nui"

view
Card
    p Content
```

## Next Steps

- [Component Definition](../components/definition.md) - Deep dive into component definition
- [Props](../components/props.md) - Detailed props usage
- [Events](../components/events.md) - Component event system
- [Slots](../components/slots.md) - Content distribution