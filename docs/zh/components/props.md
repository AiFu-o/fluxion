# Props 传递

Props 用于父组件向子组件传递数据。本章详细介绍 Props 的使用方式。

## 基本用法

### 传递静态值

```nui
// 父组件
import Button from "./Button.nui"

view
div
    Button text="Click me"
    Button text="Submit"
```

### 传递动态值

```nui
// 父组件
import UserCard from "./UserCard.nui"

userName = signal("John")
userAge = signal(30)

view
div
    UserCard name={userName} age={userAge}
```

### 传递对象

```nui
// 父组件
import UserCard from "./UserCard.nui"

user = signal({
    name: "John",
    email: "john@example.com"
})

view
div
    UserCard user={user}
```

## Props 声明

### 在 .nui 文件中

在 .nui 文件中，props 自动可用：

```nui
// UserCard.nui
// name 和 age 作为 props 自动可用

view
div class="user-card"
    h3 {name}
    p Age: {age}
```

### 在 JavaScript 组件中

显式声明 props：

```javascript
export const UserCard = {
    props: {
        name: String,
        age: Number
    },

    setup(props) {
        console.log(props.name)
        console.log(props.age)
    }
}
```

## Props 验证

### 类型验证

```javascript
export const UserForm = {
    props: {
        // 基本类型
        title: String,
        count: Number,
        isActive: Boolean,

        // 多种类型
        value: [String, Number],

        // 对象类型
        user: Object,
        callback: Function
    }
}
```

### 详细验证

```javascript
export const UserCard = {
    props: {
        // 必需属性
        userId: {
            type: Number,
            required: true
        },

        // 默认值
        showEmail: {
            type: Boolean,
            default: false
        },

        // 对象/数组默认值
        user: {
            type: Object,
            default: () => ({
                name: 'Guest',
                email: ''
            })
        },

        // 自定义验证
        age: {
            type: Number,
            validator(value) {
                return value >= 0 && value <= 150
            }
        }
    }
}
```

## Props 默认值

### 基本类型

```nui
// Button.nui
// 如果未传递 text，使用默认值
buttonText = signal(text || "Click me")

view
button @click=onClick
    {buttonText}
```

### JavaScript 中定义

```javascript
export const Button = {
    props: {
        text: {
            type: String,
            default: 'Click me'
        },
        size: {
            type: String,
            default: 'medium'
        }
    }
}
```

## Props 传递方式

### 字符串

```nui
Button text="Hello"
```

### 数字

```nui
Counter count={42}
```

### 布尔值

```nui
Button disabled={true}
Button disabled={false}

// 简写（等同于 true）
Button disabled
```

### 对象

```nui
UserCard user={{ name: "John", age: 30 }}

// 或传递变量
user = signal({ name: "John", age: 30 })
UserCard user={user}
```

### 数组

```nui
ItemList items={['Apple', 'Banana', 'Orange']}

// 或传递变量
items = signal([1, 2, 3])
ItemList items={items}
```

### 函数

```nui
function handleClick() {
    console.log('Clicked')
}

Button onClick={handleClick}

// 内联函数
Button onClick={() => console.log('Clicked')}
```

## 单向数据流

Props 是单向绑定的：父组件 → 子组件。

```nui
// ❌ 错误：不要直接修改 props
function changeName() {
    name = "New Name"  // 不要这样做！
}

// ✅ 正确：使用 emit 通知父组件
function changeName() {
    emit('update:name', "New Name")
}
```

## v-model 双向绑定

Fluxion 支持类似 v-model 的双向绑定模式：

### 基本用法

```nui
// 父组件
import Input from "./Input.nui"

text = signal("")

view
div
    Input value={text} @update:value={text.set}
    p You typed: {text}
```

```nui
// Input.nui
view
input
    type="text"
    value={value}
    @input={(e) => emit('update:value', e.target.value)}
```

### 自定义 v-model

```nui
// 父组件
import CustomInput from "./CustomInput.nui"

value = signal("")

view
div
    CustomInput modelValue={value} @update:modelValue={value.set}
```

## 透传属性

未在 props 中声明的属性会透传到根元素：

```nui
// Button.nui
view
button
    {text}

// 父组件
Button text="Click" class="primary" id="submit-btn"
// class 和 id 会透传到 button 元素
```

## 最佳实践

### 命名规范

```nui
// ✅ 好：使用 camelCase
UserCard userName={name} userAge={age}

// ✅ 好：使用 kebab-case
UserCard user-name={name} user-age={age}
```

### 避免过多 Props

```javascript
// ❌ 不好：Props 太多
UserCard
    name={name}
    age={age}
    email={email}
    phone={phone}
    address={address}
    city={city}
    country={country}

// ✅ 更好：合并为对象
UserCard user={user}
```

### Props 文档化

```javascript
export const UserCard = {
    props: {
        /**
         * 用户 ID，必需
         */
        userId: {
            type: Number,
            required: true
        },

        /**
         * 是否显示邮箱，默认 false
         */
        showEmail: {
            type: Boolean,
            default: false
        }
    }
}
```

## 下一步

- [事件发射](events.md) - 组件事件系统
- [插槽](slots.md) - 内容分发
- [组件定义](definition.md) - 组件定义方式