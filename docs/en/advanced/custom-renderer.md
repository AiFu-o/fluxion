# Custom Renderer

This section introduces how to use the `createRenderer` API to create custom renderers that render Fluxion components to non-DOM targets.

## Overview

Fluxion's runtime is designed to be platform-agnostic. With the `createRenderer` function, you can:

- Render to Canvas
- Render to WebGL
- Render to native mobile applications
- Render to terminal (CLI)
- Create test renderers

---

## createRenderer API

### Basic Signature

```typescript
import { createRenderer } from '@fluxion-ui/fluxion'

const renderer = createRenderer(options)

interface RendererOptions {
    // Element creation
    createElement(tag: string): any
    createText(text: string): any
    createComment(text: string): any

    // Text operations
    setText(node: any, text: string): void
    setElementText(el: any, text: string): void

    // DOM operations
    insert(el: any, parent: any, anchor?: any): void
    remove(el: any): void

    // Property operations
    patchProp(el: any, key: string, value: any, oldValue: any): void

    // Queries
    parentNode(node: any): any | null
    nextSibling(node: any): any | null
}

interface Renderer {
    render(vnode: VNode | null, container: any): void
    createApp(rootComponent: Component): App
}
```

---

## Renderer Options Details

### createElement(tag)

Creates an element node.

```typescript
createElement(tag: string): any
```

**Parameters**

| Parameter | Type | Description |
|------|------|------|
| tag | string | Element tag name |

**Returns**

Returns the created element object.

**Example**

```javascript
// DOM renderer
createElement(tag) {
    return document.createElement(tag)
}

// Canvas renderer
createElement(tag) {
    return {
        type: tag,
        children: [],
        props: {},
        style: {}
    }
}
```

### createText(text)

Creates a text node.

```typescript
createText(text: string): any
```

**Example**

```javascript
// DOM renderer
createText(text) {
    return document.createTextNode(text)
}

// Simple object renderer
createText(text) {
    return { type: 'text', content: text }
}
```

### createComment(text)

Creates a comment node.

```typescript
createComment(text: string): any
```

### setText(node, text)

Sets text node content.

```typescript
setText(node: any, text: string): void
```

**Example**

```javascript
// DOM renderer
setText(node, text) {
    node.textContent = text
}
```

### setElementText(el, text)

Sets element text content (clears existing children).

```typescript
setElementText(el: any, text: string): void
```

**Example**

```javascript
// DOM renderer
setElementText(el, text) {
    el.textContent = text
}

// Canvas renderer
setElementText(el, text) {
    el.text = text
}
```

### insert(el, parent, anchor)

Inserts an element into a parent node.

```typescript
insert(el: any, parent: any, anchor?: any): void
```

**Parameters**

| Parameter | Type | Description |
|------|------|------|
| el | any | Element to insert |
| parent | any | Parent node |
| anchor | any | Anchor element (insert before it) |

**Example**

```javascript
// DOM renderer
insert(el, parent, anchor) {
    if (anchor) {
        parent.insertBefore(el, anchor)
    } else {
        parent.appendChild(el)
    }
}

// Tree structure renderer
insert(el, parent, anchor) {
    if (anchor) {
        const index = parent.children.indexOf(anchor)
        parent.children.splice(index, 0, el)
    } else {
        parent.children.push(el)
    }
}
```

### remove(el)

Removes an element.

```typescript
remove(el: any): void
```

**Example**

```javascript
// DOM renderer
remove(el) {
    const parent = el.parentNode
    if (parent) {
        parent.removeChild(el)
    }
}
```

### patchProp(el, key, value, oldValue)

Updates element property.

```typescript
patchProp(el: any, key: string, value: any, oldValue: any): void
```

**Parameters**

| Parameter | Type | Description |
|------|------|------|
| el | any | Target element |
| key | string | Property name |
| value | any | New value |
| oldValue | any | Old value |

**Example**

```javascript
// DOM renderer
patchProp(el, key, value, oldValue) {
    if (key === 'class') {
        el.className = value || ''
    } else if (key === 'style') {
        if (typeof value === 'string') {
            el.style.cssText = value
        } else {
            for (const prop in value) {
                el.style[prop] = value[prop]
            }
        }
    } else if (key.startsWith('on')) {
        const event = key.slice(2).toLowerCase()
        if (oldValue) el.removeEventListener(event, oldValue)
        if (value) el.addEventListener(event, value)
    } else {
        if (value == null) {
            el.removeAttribute(key)
        } else {
            el.setAttribute(key, value)
        }
    }
}
```

### parentNode(node)

Gets the parent node.

```typescript
parentNode(node: any): any | null
```

### nextSibling(node)

Gets the next sibling node.

```typescript
nextSibling(node: any): any | null
```

---

## Complete Example: Canvas Renderer

```javascript
import { createRenderer, h } from '@fluxion-ui/fluxion'

// Create Canvas renderer
const canvasRenderer = createRenderer({
    // Element creation
    createElement(tag) {
        return {
            type: tag,
            children: [],
            props: {},
            style: {},
            x: 0,
            y: 0,
            width: 0,
            height: 0
        }
    },

    createText(text) {
        return { type: 'text', content: text }
    },

    createComment(text) {
        return { type: 'comment', content: text }
    },

    setText(node, text) {
        node.content = text
    },

    setElementText(el, text) {
        el.children = [{ type: 'text', content: text }]
    },

    // Node operations
    insert(el, parent, anchor) {
        if (anchor) {
            const index = parent.children.indexOf(anchor)
            parent.children.splice(index, 0, el)
        } else {
            parent.children.push(el)
        }
        el.parent = parent
    },

    remove(el) {
        const parent = el.parent
        if (parent) {
            const index = parent.children.indexOf(el)
            if (index > -1) {
                parent.children.splice(index, 1)
            }
        }
    },

    // Property handling
    patchProp(el, key, value, oldValue) {
        if (key === 'style') {
            Object.assign(el.style, value)
        } else if (key.startsWith('on')) {
            el[key] = value
        } else {
            el.props[key] = value
        }
    },

    // Queries
    parentNode(node) {
        return node.parent || null
    },

    nextSibling(node) {
        const parent = node.parent
        if (!parent) return null
        const index = parent.children.indexOf(node)
        return parent.children[index + 1] || null
    }
})

// Canvas drawing function
function drawCanvas(ctx, node, x = 0, y = 0) {
    if (node.type === 'text') {
        ctx.fillText(node.content, x, y)
        return
    }

    // Draw element background
    if (node.style.backgroundColor) {
        ctx.fillStyle = node.style.backgroundColor
        ctx.fillRect(x, y, node.props.width || 100, node.props.height || 50)
    }

    // Draw text
    if (node.children) {
        let childY = y
        for (const child of node.children) {
            drawCanvas(ctx, child, x, childY)
            childY += 20
        }
    }
}

// Usage example
const App = {
    setup() {
        return () => h('container', {
            style: { backgroundColor: '#f0f0f0' },
            width: 300,
            height: 200
        }, [
            h('text', { style: { color: '#333' } }, 'Hello Canvas'),
            h('rect', {
                style: { backgroundColor: '#007bff' },
                width: 100,
                height: 50
            })
        ])
    }
}

// Create application
const app = canvasRenderer.createApp(App)

// Virtual container
const container = {
    children: [],
    type: 'root'
}

// Mount
app.mount(container)

// Draw to Canvas
const canvas = document.getElementById('myCanvas')
const ctx = canvas.getContext('2d')
drawCanvas(ctx, container.children[0])
```

---

## Complete Example: Terminal Renderer

```javascript
import { createRenderer, h } from '@fluxion-ui/fluxion'

// Terminal renderer
const terminalRenderer = createRenderer({
    createElement(tag) {
        return {
            tag,
            children: [],
            props: {},
            content: ''
        }
    },

    createText(text) {
        return { type: 'text', content: text }
    },

    createComment() {
        return { type: 'comment' }
    },

    setText(node, text) {
        node.content = text
    },

    setElementText(el, text) {
        el.content = text
    },

    insert(el, parent) {
        parent.children.push(el)
    },

    remove(el) {
        // Removal logic
    },

    patchProp(el, key, value) {
        el.props[key] = value
    },

    parentNode(node) {
        return node.parent || null
    },

    nextSibling(node) {
        return null
    }
})

// Render terminal output
function renderTerminal(node, indent = 0) {
    const spaces = '  '.repeat(indent)

    if (node.type === 'text') {
        return spaces + node.content + '\n'
    }

    let output = spaces + `<${node.tag}>\n`

    for (const child of node.children) {
        output += renderTerminal(child, indent + 1)
    }

    output += spaces + `</${node.tag}>\n`
    return output
}

// Usage example
const TerminalApp = {
    setup() {
        return () => h('terminal', null, [
            h('header', null, 'Welcome to Fluxion CLI'),
            h('body', null, [
                h('line', null, 'Status: Running'),
                h('line', null, 'Mode: Production')
            ])
        ])
    }
}

const app = terminalRenderer.createApp(TerminalApp)
const container = { children: [], tag: 'root' }
app.mount(container)

console.log(renderTerminal(container.children[0]))
```

---

## Complete Example: Test Renderer

```javascript
import { createRenderer, h } from '@fluxion-ui/fluxion'

// Lightweight test renderer
export function createTestRenderer() {
    const operations = []

    const renderer = createRenderer({
        createElement(tag) {
            return { tag, children: [], props: {} }
        },

        createText(text) {
            return { type: 'text', content: text }
        },

        createComment(text) {
            return { type: 'comment', content: text }
        },

        setText(node, text) {
            operations.push({ type: 'setText', node, text })
            node.content = text
        },

        setElementText(el, text) {
            operations.push({ type: 'setElementText', el, text })
            el.children = [{ type: 'text', content: text }]
        },

        insert(el, parent, anchor) {
            operations.push({ type: 'insert', el, parent, anchor })
            parent.children.push(el)
        },

        remove(el) {
            operations.push({ type: 'remove', el })
        },

        patchProp(el, key, value, oldValue) {
            operations.push({ type: 'patchProp', el, key, value, oldValue })
            el.props[key] = value
        },

        parentNode(node) {
            return node.parent || null
        },

        nextSibling(node) {
            return null
        }
    })

    return {
        ...renderer,
        operations,
        reset() {
            operations.length = 0
        }
    }
}

// Test case
describe('TestRenderer', () => {
    it('should track operations', () => {
        const renderer = createTestRenderer()

        const App = {
            setup() {
                return () => h('div', { class: 'test' }, 'Hello')
            }
        }

        const container = { children: [], tag: 'root' }
        renderer.createApp(App).mount(container)

        // Verify operations
        expect(renderer.operations).toContainEqual(
            expect.objectContaining({ type: 'patchProp', key: 'class' })
        )
    })
})
```

---

## Best Practices

### 1. Maintain Immutability

```javascript
// Good practice
patchProp(el, key, value) {
    if (value !== oldValue) {
        el.props[key] = value
    }
}

// Avoid
patchProp(el, key, value) {
    el.props[key] = value // Always updates, even if same value
}
```

### 2. Handle Special Properties

```javascript
patchProp(el, key, value, oldValue) {
    // Handle class
    if (key === 'class') {
        el.className = normalizeClass(value)
        return
    }

    // Handle style
    if (key === 'style') {
        patchStyle(el, value, oldValue)
        return
    }

    // Handle events
    if (key.startsWith('on')) {
        patchEvent(el, key, value, oldValue)
        return
    }

    // Default handling
    el[key] = value
}
```

### 3. Optimize Performance

```javascript
// Cache common values
const textCache = new Map()

createText(text) {
    if (textCache.has(text)) {
        return { ...textCache.get(text) }
    }
    const node = { type: 'text', content: text }
    textCache.set(text, node)
    return node
}
```

---

## Next Steps

- [Compiler Extension](compiler-extension.md) - Extend compiler functionality
- [Performance Optimization](performance.md) - Optimize application performance
- [TypeScript Support](typescript.md) - TypeScript integration