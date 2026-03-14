# Events

Components communicate with parents through events. This chapter introduces the event system.

## Basic Usage

### Emitting Events

```nui
// Button.nui
view
button @click={emit('click')}
    {text}
```

### Listening to Events

```nui
// Parent component
import Button from "./Button.nui"

function handleClick() {
    console.log('Button clicked!')
}

view
div
    Button text="Click me" @click=handleClick
```

## Passing Data

### Simple Values

```nui
// Counter.nui
count = signal(0)

function increment() {
    count.update(c => c + 1)
    emit('change', count())
}

view
div
    button @click=increment
        Increment
```

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

### Objects

```nui
// UserForm.nui
function handleSubmit() {
    emit('submit', {
        name: name(),
        email: email(),
        timestamp: Date.now()
    })
}

view
form @submit=handleSubmit
    // ...
```

```nui
// Parent component
import UserForm from "./UserForm.nui"

function handleSubmit(data) {
    console.log('Form submitted:', data)
}

view
UserForm @submit=handleSubmit
```

## Event Declaration

### In JavaScript Components

```javascript
export const UserForm = {
    emits: ['submit', 'cancel', 'validate'],

    setup(props, { emit }) {
        function handleSubmit() {
            emit('submit', formData)
        }

        return () => h('form', { onSubmit: handleSubmit })
    }
}
```

### Event Validation

```javascript
export const UserForm = {
    emits: {
        // No validation
        cancel: null,

        // With validation
        submit: (payload) => {
            if (!payload.name) {
                console.warn('Submit event requires name')
                return false
            }
            return true
        }
    }
}
```

## Event Naming

### kebab-case (Recommended)

```nui
emit('update-value')
emit('user-selected')
```

```nui
// Listening
Component @update-value=handleUpdate
```

### camelCase

```nui
emit('updateValue')
```

```nui
// Auto-converts when listening
Component @updateValue=handleUpdate
```

## Custom Events

### Input Component

```nui
// Input.nui
view
input
    type="text"
    value={value}
    @input={(e) => emit('update:value', e.target.value)}
```

```nui
// Parent component
import Input from "./Input.nui"

text = signal("")

view
div
    Input value={text} @update:value={text.set}
    p You typed: {text}
```

### List Component

```nui
// ItemList.nui
view
ul
    for item in items
        li
            span {item.name}
            button @click={() => emit('delete', item.id)}
                Delete
```

```nui
// Parent component
import ItemList from "./ItemList.nui"

items = signal([{ id: 1, name: 'Item 1' }])

function handleDelete(id) {
    items.update(list => list.filter(item => item.id !== id))
}

view
ItemList items={items} @delete=handleDelete
```

## Event Modifiers

### preventDefault

```nui
form @submit.prevent=handleSubmit
```

### stopPropagation

```nui
div @click.stop=handleClick
```

### once

```nui
button @click.once=handleFirstClick
```

### Chained Modifiers

```nui
form @submit.prevent.stop=handleSubmit
```

## Complete Example

### Modal Component

```nui
// Modal.nui
view
div class="modal-overlay" @click={emit('close')}
    div class="modal-content" @click.stop
        div class="modal-header"
            h2 {title}
            button @click={emit('close')} ×
        div class="modal-body"
            slot
        div class="modal-footer"
            button @click={emit('cancel')} Cancel
            button @click={emit('confirm')} Confirm

style
.modal-overlay {
    position fixed
    top 0
    left 0
    right 0
    bottom 0
    background rgba(0, 0, 0, 0.5)
    display flex
    align-items center
    justify-content center
}

.modal-content {
    background white
    border-radius 8px
    padding 20px
    max-width 500px
}
```

```nui
// Parent component
import Modal from "./Modal.nui"

showModal = signal(false)
result = signal('')

function handleConfirm() {
    result.set('Confirmed!')
    showModal.set(false)
}

function handleCancel() {
    result.set('Cancelled')
    showModal.set(false)
}

view
div
    button @click={() => showModal.set(true)}
        Open Modal
    p Result: {result}

    if showModal
        Modal title="Confirm Action"
            @close={() => showModal.set(false)}
            @confirm=handleConfirm
            @cancel=handleCancel
            p Are you sure you want to proceed?
```

## API Reference

### emit()

Emit event inside component:

```javascript
emit(event: string, ...args: any[]): void
```

### emits Option

```javascript
{
    emits: string[] | { [event: string]: Function | null }
}
```

## Best Practices

### Use Verbs for Event Names

```nui
// ✅ Good
emit('submit')
emit('delete')
emit('update')

// ❌ Avoid
emit('form')
emit('item')
```

### Pass Meaningful Data

```nui
// ✅ Good: Pass complete context
emit('item-selected', { id: item.id, name: item.name })

// ❌ Avoid: Only pass ID
emit('item-selected', item.id)
```

### Use Events Instead of Callbacks

```nui
// ✅ Good: Use events
emit('change', newValue)

// ❌ Avoid: Callbacks as props
props.onChange(newValue)
```

## Next Steps

- [Slots](slots.md) - Content distribution
- [Lifecycle](lifecycle.md) - Component lifecycle
- [Props](props.md) - Detailed props usage