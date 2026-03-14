# Effect

Effect is used to create reactive side effect functions that automatically execute when dependent reactive states change.

## Basic Usage

### Creating Effects

```javascript
import { signal, effect } from 'fluxion'

const count = signal(0)

// Create effect
effect(() => {
    console.log(`Count is: ${count()}`)
})
// Executes immediately: Count is: 0

count.set(1)
// Auto executes: Count is: 1
```

### Auto Tracking Dependencies

Effect automatically tracks reactive states used inside:

```javascript
const a = signal(1)
const b = signal(2)

effect(() => {
    console.log(`Sum: ${a() + b()}`)
})
// Output: Sum: 3

a.set(3)
// Output: Sum: 5

b.set(4)
// Output: Sum: 7
```

## Cleanup Functions

Effect functions can return a cleanup function that's called before the next execution or when stopped:

```javascript
import { signal, effect } from 'fluxion'

const userId = signal(1)

const dispose = effect(() => {
    const id = userId()
    const timer = setInterval(() => {
        console.log(`Polling user ${id}`)
    }, 1000)

    // Return cleanup function
    return () => {
        clearInterval(timer)
        console.log(`Cleaned up user ${id}`)
    }
})

userId.set(2)
// Output: Cleaned up user 1
// Then starts polling user 2
```

## Stopping Tracking

### stop()

Stop the effect function's tracking:

```javascript
import { signal, effect, stop } from 'fluxion'

const count = signal(0)

const myEffect = effect(() => {
    console.log(`Count: ${count()}`)
})

// Stop tracking
stop(myEffect)

count.set(1)  // Won't trigger anymore
```

### Manual Stop

```javascript
const count = signal(0)

const dispose = effect(() => {
    console.log(`Count: ${count()}`)
})

// Call returned function to stop
dispose.stop()
// Or
stop(dispose)
```

## Scheduling

### Default Behavior

By default, effects execute asynchronously before DOM updates:

```javascript
const count = signal(0)

effect(() => {
    // Executes before DOM update
    console.log('Before DOM update:', count())
})
```

### effectPost

Execute after DOM updates:

```javascript
import { signal, effectPost } from 'fluxion'

const count = signal(0)

effectPost(() => {
    // Executes after DOM update
    console.log('After DOM update:', count())
    // Can safely access DOM
    document.querySelector('#count').textContent = count()
})
```

### effectSync

Execute synchronously (not recommended, may cause performance issues):

```javascript
import { signal, effectSync } from 'fluxion'

const count = signal(0)

effectSync(() => {
    // Executes immediately and synchronously
    console.log('Sync:', count())
})
```

## Pause and Resume

### pauseEffect / resumeEffect

```javascript
import { signal, effect, pauseEffect, resumeEffect } from 'fluxion'

const count = signal(0)

const myEffect = effect(() => {
    console.log(`Count: ${count()}`)
})

// Pause
pauseEffect(myEffect)
count.set(1)  // Won't trigger

// Resume
resumeEffect(myEffect)
count.set(2)  // Triggers: Count: 2
```

## API Reference

### effect()

Creates an effect function.

```typescript
function effect(fn: () => void | (() => void)): Effect

interface Effect {
    (): void           // Manual execution
    stop(): void       // Stop tracking
}
```

#### Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| fn | () => void \| (() => void) | Effect function, optionally returns cleanup function |

#### Returns

Returns Effect object that can be called to execute or stopped.

### stop()

Stops effect tracking.

```typescript
function stop(effect: Effect): void
```

### effectPost()

Creates effect that runs after DOM updates.

```typescript
function effectPost(fn: () => void | (() => void)): Effect
```

### effectSync()

Creates synchronously executing effect.

```typescript
function effectSync(fn: () => void | (() => void)): Effect
```

### pauseEffect()

Pauses effect execution.

```typescript
function pauseEffect(effect: Effect): void
```

### resumeEffect()

Resumes effect execution.

```typescript
function resumeEffect(effect: Effect): void
```

### runEffects()

Batch execute effects.

```typescript
function runEffects(effects: Effect[]): void
```

## Use Cases

### Data Synchronization

```javascript
const user = signal({ name: '', email: '' })

effect(() => {
    // Auto-save to localStorage
    localStorage.setItem('user', JSON.stringify(user()))
})
```

### Timer Management

```javascript
const isRunning = signal(true)

effect(() => {
    if (!isRunning()) return

    const timer = setInterval(() => {
        console.log('Running...')
    }, 1000)

    return () => clearInterval(timer)
})
```

### Event Listening

```javascript
const activeElement = signal(null)

effect(() => {
    const element = activeElement()
    if (!element) return

    const handler = (e) => {
        console.log('Click:', e.target)
    }

    element.addEventListener('click', handler)

    return () => {
        element.removeEventListener('click', handler)
    }
})
```

### Subscription Management

```javascript
const channel = signal('general')

effect(() => {
    const ch = channel()
    const subscription = subscribeToChannel(ch, (message) => {
        console.log('Message:', message)
    })

    return () => {
        subscription.unsubscribe()
    }
})
```

## Important Notes

### Avoid Infinite Loops

```javascript
// ❌ Wrong: Infinite loop
const count = signal(0)

effect(() => {
    count.update(c => c + 1)  // Triggers itself
})

// ✅ Correct: Conditional
const count = signal(0)

effect(() => {
    if (count() < 10) {
        count.update(c => c + 1)
    }
})
```

### Async Operations

```javascript
const userId = signal(1)

effect(() => {
    // Async operation
    fetchUser(userId()).then(user => {
        // Note: This update triggers a new effect
        userData.set(user)
    })
})
```

### Resource Cleanup

Ensure cleanup function properly releases resources:

```javascript
effect(() => {
    const controller = new AbortController()

    fetch('/api/data', { signal: controller.signal })
        .then(r => r.json())
        .then(data => {
            dataSignal.set(data)
        })

    return () => {
        controller.abort()  // Cancel request
    }
})
```

## Next Steps

- [Watch](watch.md) - More flexible state watching
- [Reactive Objects](reactive.md) - Reactive objects
- [AsyncSignal](async-signal.md) - Async data handling