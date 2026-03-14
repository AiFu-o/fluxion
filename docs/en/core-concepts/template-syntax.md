# Template Syntax Overview

This chapter introduces the basics of `.nui` file template syntax to help you get started quickly.

## Element Declaration

### Basic Elements

```nui
view
div
    h1 Title
    p Paragraph
    span Text
```

### Self-closing Elements

```nui
view
div
    img src="photo.jpg"
    input type="text"
    br
```

### Nested Structure

Use Tab indentation for nesting:

```nui
view
div class="container"
    header
        nav
            a href="/" Home
            a href="/about" About
    main
        article
            h2 Article Title
            p Article content...
```

## Attribute Binding

### Static Attributes

```nui
view
div id="app"
    input type="text" placeholder="Enter text"
    a href="https://example.com" Link
```

### Dynamic Attributes

Use `{}` to bind dynamic values:

```nui
view
div id={dynamicId}
    input type="text" value={inputValue}
    img src={imageUrl}
    a href={linkUrl} Link
```

### Multiple Attributes

```nui
view
div class="card" id="card-1" data-index={index}
    p Content
```

### class and style

```nui
view
div class="container" class={isActive ? 'active' : ''}
    p Content

div style="color: red" style={isDark ? 'background: black' : ''}
    p Content
```

## Interpolation

### Text Interpolation

```nui
view
div
    p Hello {name}
    p Count: {count}
```

### Expression Interpolation

```nui
view
div
    p Total: {price * quantity}
    p Status: {isActive() ? 'Active' : 'Inactive'}
    p User: {user().name}
```

## Conditional Rendering

### if Statement

```nui
view
div
    if isLoading
        p Loading...
    elif hasError
        p Error: {error}
    else
        p Data loaded
```

### Conditional Rendering Components

```nui
view
div
    if user
        p Welcome, {user().name}
    else
        button @click=login
            Login
```

## List Rendering

### Basic Loop

```nui
view
ul
    for item in items
        li {item}
```

### Object Array

```nui
view
ul
    for user in users
        li
            span {user.name}
            span {user.email}
```

### With Index

```nui
view
ol
    for item, index in items
        li {index + 1}. {item}
```

## Event Handling

### Click Events

```nui
view
div
    button @click=handleClick
        Click
    button @click={() => count.update(c => c + 1)}
        Increment
```

### Event Parameters

```nui
view
div
    button @click=deleteItem(item.id)
        Delete
    input @input=handleInput
```

### Event Object

```nui
function handleClick(event) {
    event.preventDefault()
    console.log('Clicked')
}

view
button @click=handleClick
    Click
```

### Form Events

```nui
view
form @submit=handleSubmit
    input type="text" @input=handleInput
    button type="submit"
        Submit
```

## Component Usage

### Basic Usage

```nui
import Button from "./Button.nui"

view
div
    Button text="Click me"
```

### With Children

```nui
import Card from "./Card.nui"

view
Card title="Card Title"
    p Card content
    button Action
```

### Event Listening

```nui
import Counter from "./Counter.nui"

view
Counter @change=handleChange
```

## Styles

### style Block

```nui
view
div class="container"
    h1 Title
    p Content

style
.container {
    padding 20px
}

h1 {
    font-size 24px
    color #333
}

p {
    line-height 1.6
}
```

### Dynamic class

```nui
view
div class={isActive ? 'active' : 'inactive'}
    p Content

style
.active {
    background-color green
}

.inactive {
    background-color gray
}
```

## Comments

Use JavaScript comments in `.nui` files:

```nui
// This is a single line comment
view
div
    p Content  // End of line comment

/*
This is a multi-line comment
Can span multiple lines
*/
```

## Complete Example

```nui
import Button from "./Button.nui"
import Card from "./Card.nui"

// Reactive state
count = signal(0)
items = signal(['Apple', 'Banana', 'Orange'])
isLoading = signal(false)

// Methods
function increment() {
    count.update(c => c + 1)
}

function addItem() {
    items.update(list => [...list, 'New Item'])
}

// Template
view
div class="app"
    header
        h1 Counter App
    main
        Card title="Counter"
            p Count: {count}
            div class="buttons"
                Button text="-1" onClick={() => count.update(c => c - 1)}
                Button text="+1" onClick={increment}

        Card title="List"
            ul
                for item in items
                    li {item}
            Button text="Add" onClick={addItem}

        if isLoading
            p Loading...
        else
            p Data loaded

    footer
        p Fluxion Framework

// Styles
style
.app {
    max-width 800px
    margin 0 auto
    padding 20px
}

header {
    margin-bottom 20px
}

h1 {
    font-size 24px
    color #333
}

main {
    display grid
    gap 20px
}

.buttons {
    display flex
    gap 10px
}

ul {
    list-style none
    padding 0
}

li {
    padding 8px
    border-bottom 1px solid #eee
}

footer {
    margin-top 40px
    text-align center
    color #666
}
```

## Next Steps

- [Elements & Attributes](../template/elements.md) - Learn more about elements and attributes
- [Interpolation](../template/interpolation.md) - Deep dive into interpolation syntax
- [Conditional Rendering](../template/conditionals.md) - Detailed conditional rendering
- [List Rendering](../template/lists.md) - Detailed list rendering
- [Event Handling](../template/events.md) - Detailed event handling
- [Styles](../template/styles.md) - Style definitions