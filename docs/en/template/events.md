# Event Handling

This chapter covers how to handle events in .nui templates.

## Basic Usage

### Click Events

```nui
count = signal(0)

function increment() {
    count.update(c => c + 1)
}

view
div
    p Count: {count}
    button @click=increment
        Click to increment
```

### Inline Handlers

```nui
count = signal(0)

view
div
    p Count: {count}
    button @click={() => count.update(c => c + 1)}
        Increment
    button @click={() => count.update(c => c - 1)}
        Decrement
```

## Event Parameters

### Accessing Event Object

```nui
function handleClick(event) {
    console.log('Event:', event)
    console.log('Target:', event.target)
}

view
button @click=handleClick
    Click
```

### Passing Parameters

```nui
items = signal([
    { id: 1, name: 'Item 1' },
    { id: 2, name: 'Item 2' }
])

function deleteItem(id) {
    items.update(list => list.filter(item => item.id !== id))
}

function handleItemClick(item, event) {
    event.stopPropagation()
    console.log('Item:', item)
}

view
ul
    for item in items
        li key={item.id} @click={(e) => handleItemClick(item, e)}
            span {item.name}
            button @click={() => deleteItem(item.id)}
                Delete
```

## Event Types

### Mouse Events

```nui
function handleMouseDown(e) { console.log('Mouse down') }
function handleMouseUp(e) { console.log('Mouse up') }
function handleMouseEnter(e) { console.log('Mouse enter') }
function handleMouseLeave(e) { console.log('Mouse leave') }
function handleMouseMove(e) { console.log('Mouse move') }

view
div
    @mousedown=handleMouseDown
    @mouseup=handleMouseUp
    @mouseenter=handleMouseEnter
    @mouseleave=handleMouseLeave
    @mousemove=handleMouseMove
    Hover over this area
```

### Keyboard Events

```nui
text = signal('')

function handleKeyDown(e) {
    if (e.key === 'Enter') {
        console.log('Enter pressed')
    }
}

function handleKeyUp(e) {
    console.log('Key up:', e.key)
}

view
div
    input
        type="text"
        @keydown=handleKeyDown
        @keyup=handleKeyUp
        value={text}
    p You typed: {text}
```

### Form Events

```nui
email = signal('')
password = signal('')

function handleInput(e) {
    email.set(e.target.value)
}

function handleChange(e) {
    console.log('Changed:', e.target.value)
}

function handleSubmit(e) {
    e.preventDefault()
    console.log('Submit:', { email: email(), password: password() })
}

view
form @submit=handleSubmit
    input
        type="email"
        value={email}
        @input=handleInput
        @change=handleChange
    input
        type="password"
        @input={(e) => password.set(e.target.value)}
    button type="submit"
        Login
```

### Focus Events

```nui
isFocused = signal(false)

function handleFocus() {
    isFocused.set(true)
}

function handleBlur() {
    isFocused.set(false)
}

view
div
    input
        @focus=handleFocus
        @blur=handleBlur
    p {isFocused() ? 'Focused' : 'Not focused'}
```

## Event Modifiers

### .prevent

Prevent default behavior:

```nui
function handleSubmit(e) {
    // No need for e.preventDefault(), modifier handles it
    console.log('Submit')
}

view
form @submit.prevent=handleSubmit
    input type="text"
    button Submit
```

### .stop

Stop event propagation:

```nui
function handleOuter() {
    console.log('Outer clicked')
}

function handleInner(e) {
    // No need for e.stopPropagation()
    console.log('Inner clicked')
}

view
div class="outer" @click=handleOuter
    div class="inner" @click.stop=handleInner
        Click inner
```

### .once

Trigger only once:

```nui
view
button @click.once={() => console.log('Only once')}
        Trigger once
```

### .capture

Use capture mode:

```nui
view
div @click.capture=handleCapture
    div @click=handleBubble
        Click test
```

### .self

Only trigger when event is on the element itself:

```nui
view
div @click.self=handleSelf
    p Clicking me won't trigger
    button Clicking me will trigger
```

### Combined Modifiers

```nui
view
form @submit.prevent.stop=handleSubmit
    input type="text"
    button Submit
```

## Key Modifiers

### Key Aliases

```nui
view
input
    @keydown.enter=handleEnter
    @keydown.esc=handleEsc
    @keydown.tab=handleTab
    @keydown.space=handleSpace
    @keydown.up=handleUp
    @keydown.down=handleDown
    @keydown.left=handleLeft
    @keydown.right=handleRight
```

### Combination Keys

```nui
view
input
    @keydown.ctrl.enter=handleCtrlEnter
    @keydown.shift.tab=handleShiftTab
    @keydown.alt.s=handleAltS
    @keydown.meta.enter=handleMetaEnter
```

## Mouse Button Modifiers

```nui
view
div
    @click.left=handleLeftClick
    @click.right=handleRightClick
    @click.middle=handleMiddleClick
    Click test
```

## Best Practices

### Method Naming

```nui
// ✅ Good: Start with verb
function handleClick() {}
function handleSubmit() {}
function handleDelete() {}

// ❌ Avoid: Noun
function button() {}
function form() {}
```

### Avoid Complex Inline Logic

```nui
// ❌ Avoid: Complex inline logic
button @click={() => {
    if (user().isLoggedIn) {
        if (user().hasPermission) {
            doSomething()
        } else {
            showError()
        }
    } else {
        redirectToLogin()
    }
}}

// ✅ Better: Extract method
function handleAction() {
    if (!user().isLoggedIn) {
        redirectToLogin()
        return
    }
    if (!user().hasPermission) {
        showError()
        return
    }
    doSomething()
}

button @click=handleAction
```

### Event Delegation

```nui
// ✅ Good: Event delegation
function handleListClick(e) {
    const id = e.target.dataset.id
    if (id) {
        handleItemClick(id)
    }
}

view
ul @click=handleListClick
    for item in items
        li key={item.id} data-id={item.id}
            {item.name}
```

## Complete Example

```nui
// Search Component
searchTerm = signal('')
searchResults = signal([])
isLoading = signal(false)
selectedIndex = signal(-1)

async function handleSearch() {
    if (!searchTerm().trim()) return

    isLoading.set(true)
    try {
        const response = await fetch(`/api/search?q=${searchTerm()}`)
        searchResults.set(await response.json())
    } catch (error) {
        console.error('Search failed:', error)
    } finally {
        isLoading.set(false)
    }
}

function handleKeyDown(e) {
    const results = searchResults()
    const index = selectedIndex()

    switch (e.key) {
        case 'ArrowDown':
            e.preventDefault()
            selectedIndex.set(Math.min(index + 1, results.length - 1))
            break
        case 'ArrowUp':
            e.preventDefault()
            selectedIndex.set(Math.max(index - 1, 0))
            break
        case 'Enter':
            if (index >= 0 && results[index]) {
                selectItem(results[index])
            }
            break
        case 'Escape':
            searchResults.set([])
            selectedIndex.set(-1)
            break
    }
}

function selectItem(item) {
    console.log('Selected:', item)
    searchTerm.set(item.name)
    searchResults.set([])
    selectedIndex.set(-1)
}

view
div class="search"
    div class="search-input"
        input
            type="text"
            value={searchTerm}
            @input={(e) => searchTerm.set(e.target.value)}
            @keydown=handleKeyDown
            placeholder="Search..."
        button @click=handleSearch disabled={isLoading}
            {isLoading() ? 'Searching...' : 'Search'}

    if searchResults().length > 0
        ul class="search-results"
            for item, index in searchResults
                li
                    key={item.id}
                    class={index === selectedIndex() ? 'selected' : ''}
                    @click={() => selectItem(item)}
                    {item.name}

style
.search {
    max-width 400px
    margin 20px auto
}

.search-input {
    display flex
    gap 8px
}

.search-input input {
    flex 1
    padding 8px
    border 1px solid #ddd
    border-radius 4px
}

.search-input button {
    padding 8px 16px
    background #007bff
    color white
    border none
    border-radius 4px
    cursor pointer
}

.search-input button:disabled {
    background #ccc
    cursor not-allowed
}

.search-results {
    list-style none
    padding 0
    margin 8px 0
    border 1px solid #ddd
    border-radius 4px
}

.search-results li {
    padding 8px
    cursor pointer
}

.search-results li:hover {
    background #f5f5f5
}

.search-results li.selected {
    background #e3f2fd
}
```

## Next Steps

- [Styles](styles.md) - CSS style definitions
- [List Rendering](lists.md) - for loop rendering
- [Conditional Rendering](conditionals.md) - if/elif/else conditional rendering