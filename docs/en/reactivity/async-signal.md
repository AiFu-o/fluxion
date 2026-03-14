# AsyncSignal

AsyncSignal is a special type of Signal designed for handling async data fetching, automatically managing loading and error states.

## Basic Usage

### Creating AsyncSignal

```javascript
import { asyncSignal } from 'fluxion'

// Simple usage
const users = asyncSignal(() => fetch('/api/users').then(r => r.json()))

// With initial value
const data = asyncSignal(
    () => fetchData(),
    { initial: [] }  // Initial value
)
```

### Accessing Data

```nui
users = asyncSignal(fetchUsers)

view
div
    if users.loading
        p Loading...
    elif users.error
        p Error: {users.error().message}
    else
        ul
            for user in users
                li {user.name}
```

## State Management

### loading State

```javascript
const users = asyncSignal(() => fetchUsers())

// Access loading state
if (users.loading()) {
    console.log('Loading...')
}
```

### error State

```javascript
const users = asyncSignal(() => fetchUsers())

// Access error state
if (users.error()) {
    console.error('Failed:', users.error().message)
}
```

### Data Access

```javascript
const users = asyncSignal(() => fetchUsers())

// Get data
const userList = users()
// Or
const userList = users.data()
```

## Operations

### reload()

Reload data:

```javascript
const users = asyncSignal(() => fetchUsers())

// Refresh data
users.reload()
```

### cancel()

Cancel ongoing request:

```javascript
const users = asyncSignal(() => fetchUsers())

// Cancel request
users.cancel()
```

## Promise Compatibility

AsyncSignal implements the Promise interface:

```javascript
const users = asyncSignal(() => fetchUsers())

// Can use like a Promise
users
    .then(data => console.log('Data:', data))
    .catch(error => console.error('Error:', error))
    .finally(() => console.log('Done'))

// Can also use await
async function handleData() {
    try {
        const data = await users
        console.log('Data:', data)
    } catch (error) {
        console.error('Error:', error)
    }
}
```

## Variants

### lazyAsyncSignal()

Lazy loading, only starts fetching on first access:

```javascript
import { lazyAsyncSignal } from 'fluxion'

const users = lazyAsyncSignal(() => fetchUsers())

// Data won't be fetched immediately
console.log('Created')

// Only starts fetching on first access
const data = users()
```

### cachedAsyncSignal()

Data fetching with caching:

```javascript
import { cachedAsyncSignal, clearAsyncSignalCache } from 'fluxion'

// Use cache
const users = cachedAsyncSignal('users-key', () => fetchUsers())

// Clear specific cache
clearAsyncSignalCache('users-key')

// Clear all cache
clearAsyncSignalCache()
```

## Complete Example

### User List

```nui
import { asyncSignal } from 'fluxion'

users = asyncSignal(() =>
    fetch('/api/users').then(r => r.json())
)

function refresh() {
    users.reload()
}

view
div
    h2 User List
    if users.loading
        p Loading...
    elif users.error
        p Error: {users.error().message}
        button @click=refresh Retry
    else
        ul
            for user in users
                li {user.name} ({user.email})
        button @click=refresh Refresh
```

### Search Feature

```nui
import { signal, watch, asyncSignal } from 'fluxion'

searchTerm = signal('')
searchResults = asyncSignal(() =>
    fetch(`/api/search?q=${searchTerm()}`).then(r => r.json())
)

// Watch search term changes
watch(
    () => searchTerm(),
    () => {
        if (searchTerm().length >= 2) {
            searchResults.reload()
        }
    }
)

view
div
    input
        type="text"
        placeholder="Search..."
        @input={(e) => searchTerm.set(e.target.value)}

    if searchTerm().length >= 2
        if searchResults.loading
            p Searching...
        elif searchResults.error
            p Search failed
        else
            ul
                for result in searchResults
                    li {result.title}
```

### Parallel Requests

```nui
import { asyncSignal } from 'fluxion'

users = asyncSignal(() => fetch('/api/users').then(r => r.json()))
posts = asyncSignal(() => fetch('/api/posts').then(r => r.json()))

isLoading = computed(() => users.loading() || posts.loading())
hasError = computed(() => users.error() || posts.error())

view
div
    if isLoading
        p Loading...
    elif hasError
        p Loading failed
    else
        div class="grid"
            div
                h3 Users
                ul
                    for user in users
                        li {user.name}
            div
                h3 Posts
                ul
                    for post in posts
                        li {post.title}
```

## API Reference

### asyncSignal()

```typescript
function asyncSignal<T>(
    fetcher: () => Promise<T>,
    initialValue?: T
): AsyncSignal<T>

interface AsyncSignal<T> {
    (): T                              // Get data
    loading: Signal<boolean>           // loading state
    error: Signal<Error | null>        // error state
    reload(): void                     // Reload
    cancel(): void                     // Cancel request
    then(onFulfilled, onRejected)      // Promise compatible
    catch(onRejected)                  // Promise compatible
    finally(onFinally)                 // Promise compatible
}
```

### lazyAsyncSignal()

```typescript
function lazyAsyncSignal<T>(
    fetcher: () => Promise<T>
): AsyncSignal<T>
```

### cachedAsyncSignal()

```typescript
function cachedAsyncSignal<T>(
    key: string,
    fetcher: () => Promise<T>
): AsyncSignal<T>
```

### clearAsyncSignalCache()

```typescript
function clearAsyncSignalCache(key?: string): void
```

## Best Practices

### Error Handling

```javascript
const data = asyncSignal(async () => {
    const response = await fetch('/api/data')

    if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
    }

    return response.json()
})

// Handle error in UI
if (data.error()) {
    // Show error message
}
```

### Request Cancellation

```javascript
const data = asyncSignal(async ({ signal }) => {
    const response = await fetch('/api/data', { signal })
    return response.json()
})

// Cancel on component unmount
onUnmounted(() => {
    data.cancel()
})
```

### Conditional Requests

```javascript
const userId = signal(null)

const userData = asyncSignal(() => {
    const id = userId()
    if (!id) return null

    return fetch(`/api/users/${id}`).then(r => r.json())
})

// Only request when there's a userId
watch(() => userId(), () => {
    if (userId()) {
        userData.reload()
    }
})
```

## Next Steps

- [Watch](watch.md) - State watching
- [Effect](effect.md) - Reactive side effects
- [Common Patterns](../examples/patterns.md) - More usage patterns