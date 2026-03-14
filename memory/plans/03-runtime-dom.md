# runtime-dom DOM 渲染器实现计划

## 一、背景

根据设计文档，Fluxion 框架已完成 `shared`、`reactivity`、`runtime-core` 包的实现。现在需要实现 `runtime-dom` 包，提供 DOM 平台的渲染器。

### runtime-core 已提供

- `createRenderer(options: RendererOptions): Renderer` - 创建渲染器的工厂函数
- `setAppRenderer` / `setRenderRenderer` - 注入渲染器到 runtime-core
- `RendererOptions` 接口定义了需要 runtime-dom 实现的 10 个方法

### RendererOptions 接口（需实现）

```typescript
interface RendererOptions {
    createElement(tag: string): Element
    createText(text: string): Text
    createComment(text: string): Comment
    insert(child: Node, parent: Node, anchor?: Node | null): void
    remove(child: Node): void
    setElementText(el: Element, text: string): void
    patchProp(el: Element, key: string, value: any, prevValue: any): void
    parentNode(node: Node): Node | null
    nextSibling(node: Node): Node | null
    setText(node: Text, text: string): void
}
```

---

## 二、包目录结构

```
packages/runtime-dom/
├── src/
│   ├── index.ts              # 统一导出
│   ├── nodeOps.ts            # DOM 节点操作
│   ├── patchProp/
│   │   ├── index.ts          # patchProp 主入口
│   │   ├── patchAttr.ts      # 属性处理
│   │   ├── patchClass.ts     # class 处理
│   │   ├── patchStyle.ts     # style 处理
│   │   ├── patchEvent.ts     # 事件处理
│   │   └── patchDOMProp.ts   # DOM 属性处理
│   ├── modules/
│   │   └── svg.ts            # SVG 支持
│   └── renderer.ts           # 渲染器创建
├── __tests__/
│   ├── nodeOps.test.ts       # DOM 操作测试
│   ├── patchAttr.test.ts     # 属性测试
│   ├── patchClass.test.ts    # class 测试
│   ├── patchStyle.test.ts    # style 测试
│   ├── patchEvent.test.ts    # 事件测试
│   └── renderer.test.ts      # 渲染器集成测试
└── package.json
```

---

## 三、实现步骤

### 阶段一：基础设施

#### 1. 创建包配置

创建 `package.json`：
```json
{
    "name": "@fluxion/runtime-dom",
    "version": "0.0.1",
    "type": "module",
    "main": "./dist/runtime-dom.cjs",
    "module": "./dist/runtime-dom.js",
    "types": "./dist/runtime-dom.d.ts",
    "dependencies": {
        "@fluxion/runtime-core": "workspace:*",
        "@fluxion/shared": "workspace:*"
    }
}
```

#### 2. 实现 nodeOps.ts

实现 DOM 基础操作，对应 RendererOptions 接口：

| 函数 | DOM API |
|------|---------|
| `createElement(tag)` | `document.createElement(tag)` |
| `createText(text)` | `document.createTextNode(text)` |
| `createComment(text)` | `document.createComment(text)` |
| `insert(child, parent, anchor)` | `parent.insertBefore(child, anchor \|\| null)` |
| `remove(child)` | `child.parentNode?.removeChild(child)` |
| `setElementText(el, text)` | `el.textContent = text` |
| `setText(node, text)` | `node.nodeValue = text` |
| `parentNode(node)` | `node.parentNode` |
| `nextSibling(node)` | `node.nextSibling` |

#### 3. 实现 renderer.ts

组合 nodeOps 和 patchProp，调用 `createRenderer` 创建渲染器：

```typescript
import { createRenderer, setAppRenderer, setRenderRenderer } from '@fluxion/runtime-core'
import { nodeOps } from './nodeOps'
import { patchProp } from './patchProp'

const rendererOptions = { ...nodeOps, patchProp }
const { render, createApp } = createRenderer(rendererOptions)

setAppRenderer({ createApp })
setRenderRenderer({ render })

export { render, createApp }
```

---

### 阶段二：patchProp 实现

#### 1. patchProp/index.ts - 分发入口

按优先级分发到对应的处理函数：

```
事件 (onClick 等) → patchEvent
    ↓
DOM 属性 (value, checked 等) → patchDOMProp
    ↓
class → patchClass
    ↓
style → patchStyle
    ↓
HTML 属性 → patchAttr
```

#### 2. patchEvent.ts - 事件处理

- 判断：`key.startsWith('on') && key.length > 2`
- 规范化事件名：`onClick` → `click`
- 使用 invoker 模式避免频繁 addEventListener/removeEventListener
- 支持单个处理函数和函数数组

#### 3. patchDOMProp.ts - DOM 属性处理

需要直接设置的属性（不能用 setAttribute）：
- `value`, `checked`, `selected`, `muted`
- `innerHTML`, `textContent`
- `className`（SVG 兼容）

#### 4. patchClass.ts - class 处理

支持三种形式：
- 字符串：`"foo bar"`
- 数组：`['foo', 'bar']`
- 对象：`{ foo: true, bar: false }`

#### 5. patchStyle.ts - style 处理

支持两种形式：
- 字符串：`"color: red; font-size: 14px"` → 直接设置 cssText
- 对象：`{ color: 'red', fontSize: '14px' }` → 增量更新

#### 6. patchAttr.ts - HTML 属性处理

- 普通属性：`el.setAttribute(key, value)`
- 移除属性：`el.removeAttribute(key)`
- 布尔属性特殊处理

---

### 阶段三：SVG 支持

#### modules/svg.ts

- SVG 命名空间：`http://www.w3.org/2000/svg`
- 使用 `createElementNS` 创建 SVG 元素
- `xlink:href` 等属性使用 `setAttributeNS`
- SVG 标签列表判断

---

### 阶段四：测试

每个模块独立测试文件：

| 测试文件 | 测试内容 |
|---------|---------|
| nodeOps.test.ts | createElement, insert, remove 等基础操作 |
| patchAttr.test.ts | 属性设置、移除、布尔属性 |
| patchClass.test.ts | 字符串/数组/对象形式 class |
| patchStyle.test.ts | 字符串/对象形式 style，增量更新 |
| patchEvent.test.ts | 事件绑定、移除、多处理函数 |
| renderer.test.ts | 完整渲染流程、createApp、组件挂载 |

---

## 四、关键文件

| 文件 | 用途 |
|------|------|
| [runtime-core/src/types.ts](../packages/runtime-core/src/types.ts) | RendererOptions 接口定义 |
| [runtime-core/src/renderer.ts](../packages/runtime-core/src/renderer.ts) | createRenderer 实现，理解如何使用 options |
| [shared/src/utils.ts](../packages/shared/src/utils.ts) | 类型守卫函数 |
| [shared/src/warn.ts](../packages/shared/src/warn.ts) | warn, error 函数 |

---

## 五、验证方式

1. **单元测试**：每个模块独立测试
2. **集成测试**：创建完整组件，验证渲染到 DOM
3. **Playground 验证**：在 playground/sfc 中创建示例应用

```typescript
// 集成测试示例
import { createApp, h, signal } from '@fluxion/runtime-dom'

const App = {
    setup() {
        const count = signal(0)
        return () => h('div', [
            h('p', `Count: ${count()}`),
            h('button', { onClick: () => count.set(c => c + 1) }, 'Increment')
        ])
    }
}

createApp(App).mount('#app')
```

---

## 六、注意事项

1. **错误处理**：每个函数添加参数验证和 warn 提示
2. **中文注释**：所有注释使用中文
3. **测试拆分**：按功能拆分测试文件，不放在一个文件
4. **XSS 防护**：innerHTML 谨慎处理