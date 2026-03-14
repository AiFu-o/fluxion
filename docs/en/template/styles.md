# Styles

This chapter covers how to define and use CSS styles in .nui files.

## style Block

### Basic Syntax

```nui
view
div class="container"
    h1 Title
    p Content

style
.container {
    padding 20px
    max-width 800px
    margin 0 auto
}

h1 {
    font-size 24px
    color #333
}

p {
    line-height 1.6
}
```

### Syntax Features

- Property names use kebab-case (recommended) or camelCase
- Property values don't need quotes (unless containing spaces)
- No semicolons needed at end
- Use indentation for nesting

## Selectors

### Element Selectors

```nui
style
h1 {
    font-size 24px
}

p {
    margin 16px 0
}

button {
    padding 8px 16px
}
```

### Class Selectors

```nui
style
.container {
    max-width 1200px
    margin 0 auto
}

.card {
    padding 16px
    border-radius 8px
    box-shadow 0 2px 8px rgba(0 0 0 0.1)
}
```

### ID Selectors

```nui
style
#app {
    min-height 100vh
}

#header {
    position fixed
    top 0
    left 0
    right 0
}
```

### Attribute Selectors

```nui
style
input[type="text"] {
    border 1px solid #ddd
}

button[disabled] {
    opacity 0.5
    cursor not-allowed
}
```

## Nested Selectors

### Child Selectors

```nui
style
.card {
    padding 16px

    .title {
        font-size 18px
        font-weight bold
    }

    .content {
        margin-top 8px
    }

    .footer {
        margin-top 16px
        text-align right
    }
}
```

### Descendant Selectors

```nui
style
.container {
    padding 20px

    h1 {
        margin-bottom 16px
    }

    p {
        line-height 1.6
    }
}
```

## Pseudo-classes

### State Pseudo-classes

```nui
style
button {
    background-color #007bff
    color white

    :hover {
        background-color #0056b3
    }

    :active {
        transform scale(0.98)
    }

    :focus {
        outline 2px solid #007bff
        outline-offset 2px
    }

    :disabled {
        background-color #ccc
        cursor not-allowed
    }
}
```

### Structural Pseudo-classes

```nui
style
.list {
    :first-child {
        border-top none
    }

    :last-child {
        border-bottom none
    }

    :nth-child(odd) {
        background-color #f9f9f9
    }

    :nth-child(2n) {
        background-color #f5f5f5
    }
}
```

## Pseudo-elements

```nui
style
.quote {
    position relative
    padding-left 20px

    :before {
        content '"'
        position absolute
        left 0
        font-size 32px
        color #999
    }

    :after {
        content '"'
        font-size 32px
        color #999
    }
}

.clearfix {
    :after {
        content ''
        display table
        clear both
    }
}
```

## Media Queries

### Responsive Layout

```nui
style
.container {
    width 100%
    padding 0 16px

    @media (min-width 768px) {
        max-width 750px
        margin 0 auto
    }

    @media (min-width 1024px) {
        max-width 960px
    }

    @media (min-width 1280px) {
        max-width 1200px
    }
}
```

### Mobile First

```nui
style
.grid {
    display grid
    grid-template-columns 1fr
    gap 16px

    @media (min-width 640px) {
        grid-template-columns repeat(2 1fr)
    }

    @media (min-width 1024px) {
        grid-template-columns repeat(3 1fr)
    }
}
```

## CSS Variables

### Defining Variables

```nui
style
:root {
    --primary-color #007bff
    --secondary-color #6c757d
    --success-color #28a745
    --danger-color #dc3545
    --font-sans-serif -apple-system BlinkMacSystemFont "Segoe UI" Roboto
    --spacing-xs 4px
    --spacing-sm 8px
    --spacing-md 16px
    --spacing-lg 24px
    --border-radius 4px
}
```

### Using Variables

```nui
style
.button {
    padding var(--spacing-sm) var(--spacing-md)
    background-color var(--primary-color)
    color white
    border none
    border-radius var(--border-radius)
    font-family var(--font-sans-serif)
}

.button-secondary {
    background-color var(--secondary-color)
}

.button-danger {
    background-color var(--danger-color)
}
```

## Animations

### Keyframe Animations

```nui
style
@keyframes fadeIn {
    from {
        opacity 0
    }
    to {
        opacity 1
    }
}

@keyframes slideIn {
    from {
        transform translateY(-20px)
        opacity 0
    }
    to {
        transform translateY(0)
        opacity 1
    }
}

.modal {
    animation fadeIn 0.3s ease
}

.dropdown {
    animation slideIn 0.2s ease
}
```

### Transitions

```nui
style
.button {
    background-color #007bff
    transition background-color 0.2s ease transform 0.1s ease

    :hover {
        background-color #0056b3
    }

    :active {
        transform scale(0.98)
    }
}
```

## Dynamic Styles

### Dynamic class

```nui
isActive = signal(false)
theme = signal('light')

view
div class={`container ${isActive() ? 'active' : ''}`}
    p Content

div class={theme()}
    p Theme content

style
.container {
    padding 16px
}

.container.active {
    border-color #007bff
}

.light {
    background white
    color black
}

.dark {
    background #1a1a1a
    color white
}
```

### Dynamic style

```nui
color = signal('red')
size = signal(16)

view
div style={`color: ${color()}; font-size: ${size()}px`}
    p Dynamic styles

style
// Static styles
```

## Common Layouts

### Flexbox

```nui
style
.flex-container {
    display flex
    flex-direction row
    justify-content space-between
    align-items center
    gap 16px
}

.flex-item {
    flex 1
}

.flex-center {
    display flex
    justify-content center
    align-items center
}
```

### Grid

```nui
style
.grid-container {
    display grid
    grid-template-columns repeat(3 1fr)
    grid-gap 16px
}

.grid-span-2 {
    grid-column span 2
}

.grid-span-3 {
    grid-column span 3
}
```

## Best Practices

### Use Semantic Class Names

```nui
// ✅ Good: Semantic
style
.navbar { }
.sidebar { }
.main-content { }
.card-title { }

// ❌ Avoid: Presentational
style
.red-text { }
.big-font { }
.left-panel { }
```

### Avoid Deep Nesting

```nui
// ✅ Good: Flat structure
style
.card { }
.card-title { }
.card-content { }

// ❌ Avoid: Deep nesting
style
.container .wrapper .section .card .title { }
```

### Use Shorthand Properties

```nui
// ✅ Good: Shorthand
style
.element {
    margin 8px 16px
    padding 4px 8px
    border 1px solid #ddd
}

// ❌ Avoid: Separate properties
style
.element {
    margin-top 8px
    margin-right 16px
    margin-bottom 8px
    margin-left 16px
}
```

## Complete Example

```nui
theme = signal('light')

function toggleTheme() {
    theme.update(t => t === 'light' ? 'dark' : 'light')
}

view
div class={`app ${theme()}`}
    header class="header"
        h1 My App
        button class="theme-toggle" @click=toggleTheme
            {theme() === 'light' ? '🌙' : '☀️'}

    main class="main"
        section class="hero"
            h2 Welcome
            p This is a complete example

        section class="features"
            div class="feature-card"
                h3 Feature 1
                p Description text
            div class="feature-card"
                h3 Feature 2
                p Description text
            div class="feature-card"
                h3 Feature 3
                p Description text

    footer class="footer"
        p © 2024 My App

style
// CSS Variables
:root {
    --primary-color #007bff
    --text-color-light #333
    --text-color-dark #f0f0f0
    --bg-light #ffffff
    --bg-dark #1a1a1a
    --card-bg-light #f9f9f9
    --card-bg-dark #2a2a2a
}

// App container
.app {
    min-height 100vh
    transition background-color 0.3s color 0.3s
}

.app.light {
    background-color var(--bg-light)
    color var(--text-color-light)
}

.app.dark {
    background-color var(--bg-dark)
    color var(--text-color-dark)
}

// Header
.header {
    display flex
    justify-content space-between
    align-items center
    padding 16px 24px
    border-bottom 1px solid currentColor
}

.header h1 {
    font-size 24px
    margin 0
}

.theme-toggle {
    padding 8px 16px
    background transparent
    border 1px solid currentColor
    border-radius 4px
    cursor pointer
    font-size 20px
}

// Main content
.main {
    max-width 1200px
    margin 0 auto
    padding 40px 24px
}

// Hero section
.hero {
    text-align center
    margin-bottom 60px
}

.hero h2 {
    font-size 48px
    margin-bottom 16px
}

.hero p {
    font-size 18px
    opacity 0.8
}

// Feature cards
.features {
    display grid
    grid-template-columns repeat(auto-fit minmax(280px 1fr))
    gap 24px
}

.feature-card {
    padding 24px
    border-radius 8px
    transition transform 0.2s box-shadow 0.2s
}

.light .feature-card {
    background-color var(--card-bg-light)
}

.dark .feature-card {
    background-color var(--card-bg-dark)
}

.feature-card:hover {
    transform translateY(-4px)
    box-shadow 0 8px 24px rgba(0 0 0 0.1)
}

.feature-card h3 {
    font-size 20px
    margin-bottom 12px
}

.feature-card p {
    opacity 0.8
    line-height 1.6
}

// Footer
.footer {
    text-align center
    padding 24px
    opacity 0.6
}
```

## Next Steps

- [Elements & Attributes](elements.md) - HTML/SVG elements and attribute binding
- [Conditional Rendering](conditionals.md) - if/elif/else conditional rendering
- [List Rendering](lists.md) - for loop rendering