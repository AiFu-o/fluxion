# Props

Props are used to pass data from parent to child components. This chapter details how to use Props.

## Basic Usage

### Passing Static Values

```nui
// Parent component
import Button from "./Button.nui"

view
div
    Button text="Click me"
    Button text="Submit"
```

### Passing Dynamic Values

```nui
// Parent component
import UserCard from "./UserCard.nui"

userName = signal("John")
userAge = signal(30)

view
div
    UserCard name={userName} age={userAge}
```

### Passing Objects

```nui
// Parent component
import UserCard from "./UserCard.nui"

user = signal({
    name: "John",
    email: "john@example.com"
})

view
div
    UserCard user={user}
```

## Props Declaration

### In .nui Files

In .nui files, props are automatically available:

```nui
// UserCard.nui
// name and age are automatically available as props

view
div class="user-card"
    h3 {name}
    p Age: {age}
```

### In JavaScript Components

Explicitly declare props:

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

## Props Validation

### Type Validation

```javascript
export const UserForm = {
    props: {
        // Basic types
        title: String,
        count: Number,
        isActive: Boolean,

        // Multiple types
        value: [String, Number],

        // Object types
        user: Object,
        callback: Function
    }
}
```

### Detailed Validation

```javascript
export const UserCard = {
    props: {
        // Required property
        userId: {
            type: Number,
            required: true
        },

        // Default value
        showEmail: {
            type: Boolean,
            default: false
        },

        // Object/array default value
        user: {
            type: Object,
            default: () => ({
                name: 'Guest',
                email: ''
            })
        },

        // Custom validation
        age: {
            type: Number,
            validator(value) {
                return value >= 0 && value <= 150
            }
        }
    }
}
```

## Props Default Values

### Basic Types

```nui
// Button.nui
// Use default value if text not passed
buttonText = signal(text || "Click me")

view
button @click=onClick
    {buttonText}
```

### In JavaScript

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

## Props Passing Methods

### String

```nui
Button text="Hello"
```

### Number

```nui
Counter count={42}
```

### Boolean

```nui
Button disabled={true}
Button disabled={false}

// Shorthand (equivalent to true)
Button disabled
```

### Object

```nui
UserCard user={{ name: "John", age: 30 }}

// Or pass variable
user = signal({ name: "John", age: 30 })
UserCard user={user}
```

### Array

```nui
ItemList items={['Apple', 'Banana', 'Orange']}

// Or pass variable
items = signal([1, 2, 3])
ItemList items={items}
```

### Function

```nui
function handleClick() {
    console.log('Clicked')
}

Button onClick={handleClick}

// Inline function
Button onClick={() => console.log('Clicked')}
```

## One-way Data Flow

Props are one-way bound: Parent → Child.

```nui
// ❌ Wrong: Don't modify props directly
function changeName() {
    name = "New Name"  // Don't do this!
}

// ✅ Correct: Use emit to notify parent
function changeName() {
    emit('update:name', "New Name")
}
```

## v-model Two-way Binding

Fluxion supports v-model-like two-way binding pattern:

### Basic Usage

```nui
// Parent component
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

### Custom v-model

```nui
// Parent component
import CustomInput from "./CustomInput.nui"

value = signal("")

view
div
    CustomInput modelValue={value} @update:modelValue={value.set}
```

## Attribute Fallthrough

Attributes not declared in props fall through to the root element:

```nui
// Button.nui
view
button
    {text}

// Parent component
Button text="Click" class="primary" id="submit-btn"
// class and id fall through to button element
```

## Best Practices

### Naming Convention

```nui
// ✅ Good: Use camelCase
UserCard userName={name} userAge={age}

// ✅ Good: Use kebab-case
UserCard user-name={name} user-age={age}
```

### Avoid Too Many Props

```javascript
// ❌ Bad: Too many props
UserCard
    name={name}
    age={age}
    email={email}
    phone={phone}
    address={address}
    city={city}
    country={country}

// ✅ Better: Combine into object
UserCard user={user}
```

### Document Props

```javascript
export const UserCard = {
    props: {
        /**
         * User ID, required
         */
        userId: {
            type: Number,
            required: true
        },

        /**
         * Show email or not, default false
         */
        showEmail: {
            type: Boolean,
            default: false
        }
    }
}
```

## Next Steps

- [Events](events.md) - Component event system
- [Slots](slots.md) - Content distribution
- [Component Definition](definition.md) - Component definition methods