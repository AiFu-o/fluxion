# 组件定义

本章详细介绍组件的各种定义方式。

## 使用 .nui 文件

推荐方式，简洁直观：

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

### 带状态组件

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

## 使用 JavaScript 对象

适合需要更多控制的情况：

### setup 函数

```javascript
import { signal, h } from '@fluxion-ui/fluxion'

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

### render 函数

```javascript
import { h } from '@fluxion-ui/fluxion'

export const HelloWorld = {
    name: 'HelloWorld',

    render() {
        return h('div', null, 'Hello World')
    }
}
```

### 完整组件定义

```javascript
import { signal, h } from '@fluxion-ui/fluxion'

export const UserProfile = {
    name: 'UserProfile',

    // Props 定义
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

    // 事件定义
    emits: ['update', 'delete'],

    // setup 函数
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

## 组件上下文

setup 函数接收两个参数：

```javascript
setup(props, context) {
    // props: 组件属性
    // context: { emit, attrs, slots }
}
```

### props

组件传入的属性：

```javascript
setup(props) {
    console.log(props.title)
    console.log(props.userId)
}
```

### emit

发射事件：

```javascript
setup(props, { emit }) {
    function handleClick() {
        emit('click', { value: 123 })
    }
}
```

### attrs

未在 props 中声明的属性：

```javascript
setup(props, { attrs }) {
    console.log(attrs.class)
    console.log(attrs.style)
}
```

### slots

插槽内容：

```javascript
setup(props, { slots }) {
    return () => h('div', null, [
        slots.default ? slots.default() : 'Default content',
        slots.header && slots.header()
    ])
}
```

## 组件类型

### 函数组件

简单的无状态组件：

```javascript
const Button = (props) => h('button', { onClick: props.onClick }, props.text)
```

### 异步组件

异步加载的组件：

```javascript
const AsyncComponent = defineAsyncComponent(() =>
    import('./HeavyComponent.js')
)
```

### 高阶组件

包装其他组件：

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

## 最佳实践

### 组件命名

```javascript
// ✅ 好：PascalCase
const UserProfile = { ... }
const SearchInput = { ... }

// ❌ 避免：camelCase
const userProfile = { ... }
```

### 单一职责

```javascript
// ✅ 好：职责单一
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

### Props 验证

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

## 下一步

- [Props 传递](props.md) - Props 详细用法
- [事件发射](events.md) - 组件事件系统
- [插槽](slots.md) - 内容分发
- [生命周期](lifecycle.md) - 组件生命周期