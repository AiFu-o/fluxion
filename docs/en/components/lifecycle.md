# Lifecycle

Components go through different phases from creation to destruction. These phases are called lifecycle. Understanding lifecycle helps execute code at the right time.

## Lifecycle Overview

```
Creation Phase
    ↓
setup() executes
    ↓
Render Phase
    ↓
Mounted
    ↓
Update Phase (reactive data changes)
    ↓
Unmount Phase
```

## Lifecycle Hooks

### onMounted

Called after component is mounted:

```javascript
import { onMounted } from 'fluxion'

export default {
    setup() {
        onMounted(() => {
            console.log('Component mounted')
            // Can access DOM
            document.querySelector('#app')
        })
    }
}
```

### onUpdated

Called after component updates:

```javascript
import { onUpdated } from 'fluxion'

export default {
    setup() {
        onUpdated(() => {
            console.log('Component updated')
        })
    }
}
```

### onUnmounted

Called before component unmounts:

```javascript
import { onUnmounted } from 'fluxion'

export default {
    setup() {
        onUnmounted(() => {
            console.log('Component will unmount')
            // Clean up resources
        })
    }
}
```

### onBeforeMount

Called before component mounts:

```javascript
import { onBeforeMount } from 'fluxion'

export default {
    setup() {
        onBeforeMount(() => {
            console.log('Component will mount')
        })
    }
}
```

### onBeforeUpdate

Called before component updates:

```javascript
import { onBeforeUpdate } from 'fluxion'

export default {
    setup() {
        onBeforeUpdate(() => {
            console.log('Component will update')
        })
    }
}
```

### onBeforeUnmount

Called before component unmounts:

```javascript
import { onBeforeUnmount } from 'fluxion'

export default {
    setup() {
        onBeforeUnmount(() => {
            console.log('Component will unmount')
        })
    }
}
```

## Using in .nui Files

```nui
import { onMounted, onUnmounted } from 'fluxion'

// This code runs during setup phase
console.log('Setup')

onMounted(() => {
    console.log('Mounted')
    // Initialize third-party library
    initThirdPartyLibrary()
})

onUnmounted(() => {
    console.log('Unmounted')
    // Clean up resources
    cleanup()
})

view
div
    p Hello World
```

## Common Use Cases

### DOM Operations

```javascript
import { onMounted } from 'fluxion'

setup() {
    onMounted(() => {
        // DOM is available
        const element = document.querySelector('#my-element')
        element.addEventListener('click', handleClick)
    })
}
```

### Data Fetching

```javascript
import { signal, onMounted } from 'fluxion'

setup() {
    const data = signal(null)
    const loading = signal(true)

    onMounted(async () => {
        try {
            const response = await fetch('/api/data')
            data.set(await response.json())
        } finally {
            loading.set(false)
        }
    })

    return { data, loading }
}
```

### Timer Management

```javascript
import { signal, onMounted, onUnmounted } from 'fluxion'

setup() {
    const time = signal(new Date())

    let timer

    onMounted(() => {
        timer = setInterval(() => {
            time.set(new Date())
        }, 1000)
    })

    onUnmounted(() => {
        clearInterval(timer)
    })

    return { time }
}
```

### Event Listening

```javascript
import { onMounted, onUnmounted } from 'fluxion'

setup() {
    function handleResize() {
        console.log('Window resized')
    }

    onMounted(() => {
        window.addEventListener('resize', handleResize)
    })

    onUnmounted(() => {
        window.removeEventListener('resize', handleResize)
    })
}
```

### Subscription Management

```javascript
import { signal, onMounted, onUnmounted } from 'fluxion'

setup() {
    const messages = signal([])

    let subscription

    onMounted(() => {
        subscription = messageService.subscribe((message) => {
            messages.update(list => [...list, message])
        })
    })

    onUnmounted(() => {
        subscription.unsubscribe()
    })

    return { messages }
}
```

## API Reference

### onMounted

```typescript
function onMounted(callback: () => void | (() => void)): void
```

Register callback after component mounts. Can return cleanup function.

### onUpdated

```typescript
function onUpdated(callback: () => void): void
```

Register callback after component updates.

### onUnmounted

```typescript
function onUnmounted(callback: () => void): void
```

Register callback when component unmounts.

### onBeforeMount

```typescript
function onBeforeMount(callback: () => void): void
```

Register callback before component mounts.

### onBeforeUpdate

```typescript
function onBeforeUpdate(callback: () => void): void
```

Register callback before component updates.

### onBeforeUnmount

```typescript
function onBeforeUnmount(callback: () => void): void
```

Register callback before component unmounts.

## Hook Execution Order

```
1. setup()
2. onBeforeMount
3. Render
4. onMounted

On update:
5. onBeforeUpdate
6. Re-render
7. onUpdated

On unmount:
8. onBeforeUnmount
9. onUnmounted
```

## Best Practices

### Clean Up Side Effects

```javascript
import { onMounted, onUnmounted } from 'fluxion'

setup() {
    onMounted(() => {
        const controller = new AbortController()

        fetch('/api/data', { signal: controller.signal })
            .then(r => r.json())
            .then(data => console.log(data))

        // Return cleanup function
        return () => controller.abort()
    })
}
```

### Avoid Memory Leaks

```javascript
import { onMounted, onUnmounted } from 'fluxion'

setup() {
    const resources = []

    onMounted(() => {
        // Allocate resources
        resources.push(createResource())
    })

    onUnmounted(() => {
        // Release all resources
        resources.forEach(r => r.dispose())
    })
}
```

### Conditional Initialization

```javascript
import { onMounted } from 'fluxion'

setup(props) {
    onMounted(() => {
        if (props.autoLoad) {
            loadData()
        }
    })
}
```

## Next Steps

- [Component Definition](definition.md) - Component definition methods
- [Props](props.md) - Detailed props usage
- [Events](events.md) - Component event system