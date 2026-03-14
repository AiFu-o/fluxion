# First Application

This section guides you through creating your first Fluxion application and understanding the framework's basic concepts.

## Hello World

Let's start with the simplest "Hello World":

### src/App.nui

```nui
view
div
	h1 Hello World
	p Welcome to Fluxion!
```

### src/main.js

```javascript
import { createApp } from '@fluxion-ui/fluxion'
import App from './App.nui'

createApp(App).mount('#app')
```

This simple application displays a title and welcome text on the page.

## Understanding .nui Files

`.nui` files are the core of Fluxion, using a concise DSL to describe UI. Let's understand step by step:

### view Block

The `view` block defines the component's template structure:

```nui
view
div
	h1 Title
	p Paragraph content
```

- Use **indentation** to represent nesting
- Element name at line start, content follows
- Tab indentation represents parent-child relationship

### Element Declaration

```nui
div              # Simple element
h1 Title text    # With text content
p {message}      # With interpolation
button @click=handleClick  # With event binding
```

## Adding Interactivity

Let's create a counter application:

```nui
count = signal(0)

function increment() {
	count.update(c => c + 1)
}

function decrement() {
	count.update(c => c - 1)
}

view
div
	h1 Counter
	p Current count: {count}
	button @click=decrement
		Decrease
	button @click=increment
		Increase

style
div {
	text-align center
	padding 20px
}

h1 {
	color #333
}

p {
	font-size 18px
	margin 20px 0
}

button {
	padding 8px 16px
	margin 0 4px
	background-color #007bff
	color white
	border none
	border-radius 4px
	cursor pointer
}

button:hover {
	background-color #0056b3
}
```

### Code Explanation

#### Signal Declaration

```nui
count = signal(0)
```

Creates a reactive state with initial value `0`. When `count` changes, the UI using it updates automatically.

#### Function Declaration

```nui
function increment() {
	count.update(c => c + 1)
}
```

Defines a function to update `count`. The `update` method receives a function with the current value and returns the new value.

#### Interpolation

```nui
p Current count: {count}
```

Use `{count}` to insert the signal value into text. Signals are automatically called, equivalent to `count()`.

#### Event Binding

```nui
button @click=increment
```

Use `@click` to bind a click event, the value is the function name to call.

#### Styles

```nui
style
button {
	padding 8px 16px
	background-color #007bff
}
```

Define CSS styles in the `style` block. Uses simplified CSS syntax:
- Properties and values separated by space
- No semicolons needed

## Conditional Rendering

Use `if`/`elif`/`else` for conditional rendering:

```nui
count = signal(0)

view
div
	if count() < 0
		p style="color: red" Negative
	elif count() === 0
		p Zero
	else
		p style="color: green" Positive
```

## List Rendering

Use `for` loop to render lists:

```nui
items = signal(['Apple', 'Banana', 'Orange'])

view
ul
	for item in items
		li {item}
```

## Component Reuse

Create reusable components:

### src/Button.nui

```nui
view
button @click=onClick
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

### src/App.nui

```nui
import Button from "./Button.nui"

count = signal(0)

function increment() {
	count.update(c => c + 1)
}

view
div
	p Count: {count}
	Button text="Increment" onClick={increment}
```

## Running and Debugging

### Development Mode

```bash
pnpm dev
```

In development mode:
- Hot Module Replacement (HMR) support
- Auto-refresh on `.nui` file changes
- Detailed error messages in console

### Common Issues

#### 1. Indentation Errors

`.nui` files use Tab indentation, ensure:
- Use Tab not spaces
- Consistent indentation levels

#### 2. Signal Not Updating

Ensure you use `.set()` or `.update()` to update values:

```nui
# Wrong
count = count() + 1

# Correct
count.update(c => c + 1)
```

#### 3. Event Not Triggering

Ensure function name is correct and function is defined:

```nui
# Ensure function is defined
function handleClick() {
	# ...
}

# Event binding uses function name
button @click=handleClick
```

## Next Steps

- [.nui File Structure](../core-concepts/nui-file-structure.md) - Deep dive into .nui files
- [Signal Reactive State](../core-concepts/signal.md) - Learn the reactivity system
- [Component Basics](../core-concepts/component-basics.md) - Master component development