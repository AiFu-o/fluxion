# 事件发射

组件通过事件向父组件通信。本章介绍事件系统的使用方式。

## 基本用法

### 发射事件

```nui
// Button.nui
view
button @click={emit('click')}
    {text}
```

### 监听事件

```nui
// 父组件
import Button from "./Button.nui"

function handleClick() {
    console.log('Button clicked!')
}

view
div
    Button text="Click me" @click=handleClick
```

## 携带数据

### 传递简单值

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
// 父组件
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

### 传递对象

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
// 父组件
import UserForm from "./UserForm.nui"

function handleSubmit(data) {
    console.log('Form submitted:', data)
}

view
UserForm @submit=handleSubmit
```

## 事件声明

### 在 JavaScript 组件中

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

### 验证事件

```javascript
export const UserForm = {
    emits: {
        // 无验证
        cancel: null,

        // 带验证
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

## 事件命名

### kebab-case（推荐）

```nui
emit('update-value')
emit('user-selected')
```

```nui
// 监听
Component @update-value=handleUpdate
```

### camelCase

```nui
emit('updateValue')
```

```nui
// 监听时自动转换
Component @updateValue=handleUpdate
```

## 自定义事件

### 输入组件

```nui
// Input.nui
view
input
    type="text"
    value={value}
    @input={(e) => emit('update:value', e.target.value)}
```

```nui
// 父组件
import Input from "./Input.nui"

text = signal("")

view
div
    Input value={text} @update:value={text.set}
    p You typed: {text}
```

### 列表组件

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
// 父组件
import ItemList from "./ItemList.nui"

items = signal([{ id: 1, name: 'Item 1' }])

function handleDelete(id) {
    items.update(list => list.filter(item => item.id !== id))
}

view
ItemList items={items} @delete=handleDelete
```

## 事件修饰符

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

### 链式修饰符

```nui
form @submit.prevent.stop=handleSubmit
```

## 完整示例

### 模态框组件

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
// 父组件
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

## API 参考

### emit()

在组件内部发射事件：

```javascript
emit(event: string, ...args: any[]): void
```

### emits 选项

```javascript
{
    emits: string[] | { [event: string]: Function | null }
}
```

## 最佳实践

### 事件命名使用动词

```nui
// ✅ 好
emit('submit')
emit('delete')
emit('update')

// ❌ 避免
emit('form')
emit('item')
```

### 传递有意义的数据

```nui
// ✅ 好：传递完整上下文
emit('item-selected', { id: item.id, name: item.name })

// ❌ 避免：只传递 ID
emit('item-selected', item.id)
```

### 使用 emit 代替回调

```nui
// ✅ 好：使用事件
emit('change', newValue)

// ❌ 避免：回调作为 props
props.onChange(newValue)
```

## 下一步

- [插槽](slots.md) - 内容分发
- [生命周期](lifecycle.md) - 组件生命周期
- [Props 传递](props.md) - Props 详细用法