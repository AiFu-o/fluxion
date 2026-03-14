# 自定义渲染器

本章节介绍如何使用 `createRenderer` API 创建自定义渲染器，将 Fluxion 组件渲染到非 DOM 目标。

## 概述

Fluxion 的运行时设计为平台无关的。通过 `createRenderer` 函数，你可以：

- 渲染到 Canvas
- 渲染到 WebGL
- 渲染到原生移动应用
- 渲染到终端（CLI）
- 创建测试渲染器

---

## createRenderer API

### 基本签名

```typescript
import { createRenderer } from 'fluxion'

const renderer = createRenderer(options)

interface RendererOptions {
    // 元素创建
    createElement(tag: string): any
    createText(text: string): any
    createComment(text: string): any

    // 文本操作
    setText(node: any, text: string): void
    setElementText(el: any, text: string): void

    // DOM 操作
    insert(el: any, parent: any, anchor?: any): void
    remove(el: any): void

    // 属性操作
    patchProp(el: any, key: string, value: any, oldValue: any): void

    // 查询
    parentNode(node: any): any | null
    nextSibling(node: any): any | null
}

interface Renderer {
    render(vnode: VNode | null, container: any): void
    createApp(rootComponent: Component): App
}
```

---

## 渲染器选项详解

### createElement(tag)

创建元素节点。

```typescript
createElement(tag: string): any
```

**参数**

| 参数 | 类型 | 描述 |
|------|------|------|
| tag | string | 元素标签名 |

**返回值**

返回创建的元素对象。

**示例**

```javascript
// DOM 渲染器
createElement(tag) {
    return document.createElement(tag)
}

// Canvas 渲染器
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

创建文本节点。

```typescript
createText(text: string): any
```

**示例**

```javascript
// DOM 渲染器
createText(text) {
    return document.createTextNode(text)
}

// 简单对象渲染器
createText(text) {
    return { type: 'text', content: text }
}
```

### createComment(text)

创建注释节点。

```typescript
createComment(text: string): any
```

### setText(node, text)

设置文本节点内容。

```typescript
setText(node: any, text: string): void
```

**示例**

```javascript
// DOM 渲染器
setText(node, text) {
    node.textContent = text
}
```

### setElementText(el, text)

设置元素文本内容（会清空现有子节点）。

```typescript
setElementText(el: any, text: string): void
```

**示例**

```javascript
// DOM 渲染器
setElementText(el, text) {
    el.textContent = text
}

// Canvas 渲染器
setElementText(el, text) {
    el.text = text
}
```

### insert(el, parent, anchor)

将元素插入到父节点。

```typescript
insert(el: any, parent: any, anchor?: any): void
```

**参数**

| 参数 | 类型 | 描述 |
|------|------|------|
| el | any | 要插入的元素 |
| parent | any | 父节点 |
| anchor | any | 锚点元素（插入到它之前） |

**示例**

```javascript
// DOM 渲染器
insert(el, parent, anchor) {
    if (anchor) {
        parent.insertBefore(el, anchor)
    } else {
        parent.appendChild(el)
    }
}

// 树结构渲染器
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

移除元素。

```typescript
remove(el: any): void
```

**示例**

```javascript
// DOM 渲染器
remove(el) {
    const parent = el.parentNode
    if (parent) {
        parent.removeChild(el)
    }
}
```

### patchProp(el, key, value, oldValue)

更新元素属性。

```typescript
patchProp(el: any, key: string, value: any, oldValue: any): void
```

**参数**

| 参数 | 类型 | 描述 |
|------|------|------|
| el | any | 目标元素 |
| key | string | 属性名 |
| value | any | 新值 |
| oldValue | any | 旧值 |

**示例**

```javascript
// DOM 渲染器
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

获取父节点。

```typescript
parentNode(node: any): any | null
```

### nextSibling(node)

获取下一个兄弟节点。

```typescript
nextSibling(node: any): any | null
```

---

## 完整示例：Canvas 渲染器

```javascript
import { createRenderer, h } from 'fluxion'

// 创建 Canvas 渲染器
const canvasRenderer = createRenderer({
    // 元素创建
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

    // 节点操作
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

    // 属性处理
    patchProp(el, key, value, oldValue) {
        if (key === 'style') {
            Object.assign(el.style, value)
        } else if (key.startsWith('on')) {
            el[key] = value
        } else {
            el.props[key] = value
        }
    },

    // 查询
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

// Canvas 绘制函数
function drawCanvas(ctx, node, x = 0, y = 0) {
    if (node.type === 'text') {
        ctx.fillText(node.content, x, y)
        return
    }

    // 绘制元素背景
    if (node.style.backgroundColor) {
        ctx.fillStyle = node.style.backgroundColor
        ctx.fillRect(x, y, node.props.width || 100, node.props.height || 50)
    }

    // 绘制文本
    if (node.children) {
        let childY = y
        for (const child of node.children) {
            drawCanvas(ctx, child, x, childY)
            childY += 20
        }
    }
}

// 使用示例
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

// 创建应用
const app = canvasRenderer.createApp(App)

// 虚拟容器
const container = {
    children: [],
    type: 'root'
}

// 挂载
app.mount(container)

// 绘制到 Canvas
const canvas = document.getElementById('myCanvas')
const ctx = canvas.getContext('2d')
drawCanvas(ctx, container.children[0])
```

---

## 完整示例：终端渲染器

```javascript
import { createRenderer, h } from 'fluxion'

// 终端渲染器
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
        // 移除逻辑
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

// 渲染终端输出
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

// 使用示例
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

## 完整示例：测试渲染器

```javascript
import { createRenderer, h } from 'fluxion'

// 轻量级测试渲染器
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

// 测试用例
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

        // 验证操作
        expect(renderer.operations).toContainEqual(
            expect.objectContaining({ type: 'patchProp', key: 'class' })
        )
    })
})
```

---

## 最佳实践

### 1. 保持不可变性

```javascript
// 好的做法
patchProp(el, key, value) {
    if (value !== oldValue) {
        el.props[key] = value
    }
}

// 避免
patchProp(el, key, value) {
    el.props[key] = value // 总是更新，即使值相同
}
```

### 2. 处理特殊属性

```javascript
patchProp(el, key, value, oldValue) {
    // 处理 class
    if (key === 'class') {
        el.className = normalizeClass(value)
        return
    }

    // 处理 style
    if (key === 'style') {
        patchStyle(el, value, oldValue)
        return
    }

    // 处理事件
    if (key.startsWith('on')) {
        patchEvent(el, key, value, oldValue)
        return
    }

    // 默认处理
    el[key] = value
}
```

### 3. 优化性能

```javascript
// 缓存常用值
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

## 下一步

- [编译器扩展](compiler-extension.md) - 扩展编译器功能
- [性能优化](performance.md) - 优化应用性能
- [TypeScript 支持](typescript.md) - TypeScript 集成