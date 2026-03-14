# Component Definition

This chapter details various ways to define components.

## Using .nui Files

Recommended approach, simple and intuitive:

```nui
// Button.nui
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

### Stateful Component

```nui
// Counter.nui
count = signal(0)

function increment() {
    count.update(c => c + 1)
}

function decrement() {
    count.update(c => c - 1)
}

view
div class="counter"
    button @click=decrement -1
    span {count}
    button @click=increment +1

style
.counter {
    display flex
    gap 8px
    align-items center
}

button {
    padding 4px 12px
}

span {
    font-size 18px
    min-width 40px
    text-align center
}
```

## Using JavaScript Objects

Suitable when more control is needed:

### setup Function

```javascript
import { signal, h } from 'fluxion'

export const Counter = {
    name: 'Counter',

    setup(props) {
        const count = signal(props.initialValue || 0)

        function increment() {
            count.update(c => c + 1)
        }

        function decrement() {
            count.update(c => c - 1)
        }

        return () => h('div', { class: 'counter' }, [
            h('button', { onClick: decrement }, '-1'),
            h('span', null, count()),
            h('button', { onClick: increment }, '+1')
        ])
    }
}
```

### render Function

```javascript
import { h } from 'fluxion'

export const HelloWorld = {
    name: 'HelloWorld',

    render() {
        return h('div', null, 'Hello World')
    }
}
```

### Complete Component Definition

```javascript
import { signal, h } from 'fluxion'

export const UserProfile = {
    name: 'UserProfile',

    // Props definition
    props: {
        userId: {
            type: Number,
            required: true
        },
        showEmail: {
            type: Boolean,
            default: false
        }
    },

    // Events definition
    emits: ['update', 'delete'],

    // setup function
    setup(props, { emit }) {
        const user = signal(null)
        const loading = signal(true)

        async function loadUser() {
            loading.set(true)
            const response = await fetch(`/api/users/${props.userId}`)
            user.set(await response.json())
            loading.set(false)
        }

        function handleUpdate() {
            emit('update', user())
        }

        function handleDelete() {
            emit('delete', props.userId)
        }

        loadUser()

        return () => {
            if (loading()) {
                return h('div', null, 'Loading...')
            }

            return h('div', { class: 'user-profile' }, [
                h('h3', null, user().name),
                showEmail && h('p', null, user().email),
                h('button', { onClick: handleUpdate }, 'Update'),
                h('button', { onClick: handleDelete }, 'Delete')
            ])
        }
    }
}
```

## Component Context

The setup function receives two parameters:

```javascript
setup(props, context) {
    // props: Component properties
    // context: { emit, attrs, slots }
}
```

### props

Properties passed to the component:

```javascript
setup(props) {
    console.log(props.title)
    console.log(props.userId)
}
```

### emit

Emit events:

```javascript
setup(props, { emit }) {
    function handleClick() {
        emit('click', { value: 123 })
    }
}
```

### attrs

Attributes not declared in props:

```javascript
setup(props, { attrs }) {
    console.log(attrs.class)
    console.log(attrs.style)
}
```

### slots

Slot content:

```javascript
setup(props, { slots }) {
    return () => h('div', null, [
        slots.default ? slots.default() : 'Default content',
        slots.header && slots.header()
    ])
}
```

## Component Types

### Functional Component

Simple stateless component:

```javascript
const Button = (props) => h('button', { onClick: props.onClick }, props.text)
```

### Async Component

Asynchronously loaded component:

```javascript
const AsyncComponent = defineAsyncComponent(() =>
    import('./HeavyComponent.js')
)
```

### Higher-Order Component

Wraps other components:

```javascript
function withLoading(Component) {
    return {
        setup(props) {
            const loading = signal(true)

            setTimeout(() => loading.set(false), 1000)

            return () => loading()
                ? h('div', null, 'Loading...')
                : h(Component, props)
        }
    }
}

const ButtonWithLoading = withLoading(Button)
```

## Best Practices

### Component Naming

```javascript
// ✅ Good: PascalCase
const UserProfile = { ... }
const SearchInput = { ... }

// ❌ Avoid: camelCase
const userProfile = { ... }
```

### Single Responsibility

```javascript
// ✅ Good: Single responsibility
const UserName = {
    setup(props) {
        return () => h('span', null, props.name)
    }
}

const UserAvatar = {
    setup(props) {
        return () => h('img', { src: props.avatar })
    }
}

const UserCard = {
    setup(props) {
        return () => h('div', null, [
            h(UserAvatar, { avatar: props.user.avatar }),
            h(UserName, { name: props.user.name })
        ])
    }
}
```

### Props Validation

```javascript
const UserForm = {
    props: {
        user: {
            type: Object,
            required: true,
            validate(value) {
                return value.id && value.name
            }
        },
        mode: {
            type: String,
            default: 'edit',
            validator(value) {
                return ['edit', 'view'].includes(value)
            }
        }
    }
}
```

## Next Steps

- [Props](props.md) - Detailed props usage
- [Events](events.md) - Component event system
- [Slots](slots.md) - Content distribution
- [Lifecycle](lifecycle.md) - Component lifecycle