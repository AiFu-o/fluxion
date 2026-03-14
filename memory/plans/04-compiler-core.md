# compiler-core 编译器核心实现计划

## 概述

compiler-core 是 Fluxion 框架的平台无关编译核心，负责将 AST 转换为渲染函数代码。它被 compiler-dom 和 compiler-nui 依赖，是编译流程的核心模块。

---

## 一、目录结构

```
packages/compiler-core/
├── src/
│   ├── index.ts              # 统一导出
│   ├── types.ts              # AST 节点类型定义
│   ├── ast.ts                # AST 节点创建和工具函数
│   ├── transform.ts          # AST 转换核心
│   ├── transforms/           # 转换插件目录
│   │   ├── index.ts          # 导出所有转换
│   │   ├── vIf.ts            # if/elif/else 转换
│   │   ├── vFor.ts           # for 循环转换
│   │   ├── transformElement.ts # 元素转换
│   │   └── transformText.ts  # 文本插值转换
│   ├── codegen/              # 代码生成目录
│   │   ├── index.ts          # 导出
│   │   └── codegen.ts        # 代码生成核心
│   └── runtimeHelpers.ts     # 运行时辅助函数符号
├── __tests__/                # 测试目录
│   ├── ast.test.ts           # AST 节点测试
│   ├── transform.test.ts     # 转换核心测试
│   ├── transforms/           # 转换插件测试
│   │   ├── vIf.test.ts
│   │   ├── vFor.test.ts
│   │   ├── transformElement.test.ts
│   │   └── transformText.test.ts
│   └── codegen/              # 代码生成测试
│       └── codegen.test.ts
├── package.json
└── tsconfig.json
```

---

## 二、核心类型设计

### 2.1 AST 节点类型枚举

```typescript
// types.ts
export const enum NodeTypes {
    ROOT,                   // 根节点
    ELEMENT,                // 元素节点
    TEXT,                   // 文本节点
    INTERPOLATION,          // 插值表达式 {count}
    ATTRIBUTE,              // 属性
    DIRECTIVE,              // 指令 @click
    IF,                     // if 条件
    IF_BRANCH,              // if 分支
    FOR,                    // for 循环
    SIMPLE_EXPRESSION,      // 简单表达式
    COMPOUND_EXPRESSION,    // 复合表达式
    JS_CALL_EXPRESSION,     // JS 函数调用
    JS_OBJECT_EXPRESSION,   // JS 对象表达式
    JS_ARRAY_EXPRESSION,    // JS 数组表达式
    JS_FUNCTION_EXPRESSION, // JS 函数表达式
    JS_CONDITIONAL_EXPRESSION // JS 条件表达式
}
```

### 2.2 核心 AST 节点接口

```typescript
// 根节点
export interface RootNode extends BaseNode {
    type: NodeTypes.ROOT
    children: TemplateChildNode[]
    helpers: Set<symbol>
    imports: Set<string>
}

// 元素节点
export interface ElementNode extends BaseNode {
    type: NodeTypes.ELEMENT
    tag: string
    props: Array<AttributeNode | DirectiveNode>
    children: TemplateChildNode[]
    isSelfClosing: boolean
    codegenNode?: CodegenNode
}

// if 节点
export interface IfNode extends BaseNode {
    type: NodeTypes.IF
    branches: IfBranchNode[]
    codegenNode?: CodegenNode
}

// for 节点
export interface ForNode extends BaseNode {
    type: NodeTypes.FOR
    source: ExpressionNode
    valueAlias: string
    keyAlias?: string
    children: TemplateChildNode[]
    codegenNode?: CodegenNode
}
```

---

## 三、编译规则映射

| DSL 写法 | JS 编译输出 |
|---------|------------|
| `{count}` | `count()` |
| `if expr` | `expr ? ... : ...` |
| `elif expr` | 嵌套三元表达式 |
| `else` | `: ...` |
| `for item in list` | `list.map(item => ...)` |
| `@click=handler` | `{ onClick: handler }` |
| `Title name={name}` | `h(Title, { name: name() })` |

---

## 四、模块职责

### 4.1 types.ts - 类型定义

定义所有 AST 节点类型、转换上下文、编译选项等接口。

### 4.2 ast.ts - AST 工具

提供 AST 节点创建函数：
- `createRoot()` - 创建根节点
- `createElementNode()` - 创建元素节点
- `createTextNode()` - 创建文本节点
- `createInterpolationNode()` - 创建插值节点
- `createIfNode()` - 创建 if 节点
- `createForNode()` - 创建 for 节点
- `createSimpleExpression()` - 创建简单表达式

### 4.3 transform.ts - 转换核心

实现 AST 遍历和转换：
- `transform()` - 执行转换入口
- `traverseNode()` - 遍历节点
- `traverseChildren()` - 遍历子节点
- `createTransformContext()` - 创建转换上下文

### 4.4 transforms/vIf.ts

将 if/elif/else 转换为三元表达式：
```typescript
// 输入
if loading
    p loading...
else
    p loaded

// 输出
loading() ? h("p", "loading...") : h("p", "loaded")
```

### 4.5 transforms/vFor.ts

将 for 循环转换为 map 调用：
```typescript
// 输入
for user in users
    p {user.name}

// 输出
users().map(user => h("p", [user.name]))
```

### 4.6 transforms/transformElement.ts

将元素转换为 h 函数调用：
```typescript
// 输入
button @click=increment

// 输出
h("button", { onClick: increment })
```

### 4.7 transforms/transformText.ts

处理文本插值，将 `{count}` 转换为 `count()`。

### 4.8 codegen/codegen.ts

将 AST 生成 JavaScript 代码：
- `generate()` - 代码生成入口
- `genNode()` - 生成节点代码
- `genElementNode()` - 生成元素代码
- `genConditionalExpression()` - 生成条件表达式
- `genCallExpression()` - 生成函数调用

### 4.9 runtimeHelpers.ts

定义运行时辅助函数符号：
```typescript
export const runtimeHelpers = {
    CREATE_ELEMENT_VNODE: Symbol('h'),
    CREATE_TEXT_VNODE: Symbol('createTextVNode'),
    RESOLVE_COMPONENT: Symbol('resolveComponent')
}
```

---

## 五、实现步骤

### 阶段一：基础架构（1-2天）

| 步骤 | 文件 | 说明 |
|------|------|------|
| 1.1 | package.json, tsconfig.json | 包配置 |
| 1.2 | types.ts | AST 节点类型定义 |
| 1.3 | runtimeHelpers.ts | 运行时辅助符号 |
| 1.4 | ast.ts | AST 节点创建函数 |
| 1.5 | index.ts | 统一导出 |

### 阶段二：转换核心（2-3天）

| 步骤 | 文件 | 说明 |
|------|------|------|
| 2.1 | transform.ts | AST 遍历和转换框架 |
| 2.2 | transforms/vIf.ts | if/else 转换 |
| 2.3 | transforms/vFor.ts | for 循环转换 |
| 2.4 | transforms/transformElement.ts | 元素转换 |
| 2.5 | transforms/transformText.ts | 文本插值转换 |
| 2.6 | transforms/index.ts | 转换插件导出 |

### 阶段三：代码生成（2天）

| 步骤 | 文件 | 说明 |
|------|------|------|
| 3.1 | codegen/codegen.ts | 代码生成核心 |
| 3.2 | codegen/index.ts | 导出 |

### 阶段四：测试和优化（1-2天）

| 步骤 | 文件 | 说明 |
|------|------|------|
| 4.1 | __tests__/ast.test.ts | AST 测试 |
| 4.2 | __tests__/transform.test.ts | 转换测试 |
| 4.3 | __tests__/transforms/*.test.ts | 转换插件测试 |
| 4.4 | __tests__/codegen/codegen.test.ts | 代码生成测试 |

---

## 六、测试策略

### 测试文件组织

每个功能模块独立测试文件：

```
__tests__/
├── ast.test.ts              # AST 节点创建测试
├── transform.test.ts        # 转换框架测试
├── transforms/
│   ├── vIf.test.ts          # if 转换测试
│   ├── vFor.test.ts         # for 转换测试
│   ├── transformElement.test.ts # 元素转换测试
│   └── transformText.test.ts    # 文本转换测试
└── codegen/
    └── codegen.test.ts      # 代码生成测试
```

### 测试要点

**vIf.test.ts**：
- 简单 if 转换
- if-else 转换
- if-elif-else 嵌套转换
- 空分支处理

**vFor.test.ts**：
- 基础 for 循环
- 带索引的 for 循环
- 嵌套 for 循环
- signal 源处理

**codegen.test.ts**：
- 元素代码生成
- 条件表达式生成
- map 调用生成
- props 对象生成

---

## 七、依赖关系

```
compiler-core
    │
    └── @fluxion/shared (工具函数、warn)
```

compiler-core 是平台无关的，只依赖 shared 包。

---

## 八、关键参考文件

| 参考目的 | 文件路径 |
|---------|---------|
| 类型定义风格 | packages/runtime-core/src/types.ts |
| 导出组织 | packages/reactivity/src/index.ts |
| 错误处理 | packages/runtime-dom/src/nodeOps.ts |
| 测试组织 | packages/reactivity/__tests__/signal.test.ts |
| VNode 结构 | packages/runtime-core/src/vnode.ts |
| h 函数签名 | packages/runtime-core/src/h.ts |

---

## 九、注意事项

### 9.1 平台无关性
- compiler-core 不包含任何平台特定代码
- DOM 特定转换放在 compiler-dom
- DSL 解析放在 compiler-nui

### 9.2 错误处理
- 每个函数需要完整的 warn 提示
- 使用 shared 包的 warn 函数
- 捕获并提示编译错误

### 9.3 代码规范
- 注释和文档使用中文
- 遵循现有代码风格
- 使用 Tab 缩进

### 9.4 Signal 处理
- `{count}` 编译为 `count()` 调用
- 支持 signal 链式调用

---

## 十、导出清单

```typescript
// compiler-core/src/index.ts

// 类型
export { NodeTypes } from './types'
export type {
    RootNode,
    ElementNode,
    TextNode,
    InterpolationNode,
    IfNode,
    IfBranchNode,
    ForNode,
    ExpressionNode,
    TemplateChildNode,
    TransformContext,
    CompilerOptions,
    CodegenResult
} from './types'

// AST 工具
export {
    createRoot,
    createElementNode,
    createTextNode,
    createInterpolationNode,
    createIfNode,
    createForNode,
    createSimpleExpression
} from './ast'

// 转换
export { transform, traverseNode } from './transform'
export type { TransformFn } from './types'

// 转换插件
export { transformIf, transformFor, transformElement, transformText } from './transforms'

// 代码生成
export { generate } from './codegen'

// 运行时辅助
export { runtimeHelpers } from './runtimeHelpers'
```

---

## 十一、验证方式

1. **单元测试**：运行 `pnpm run test` 确保所有测试通过
2. **集成测试**：与 compiler-dom 和 compiler-nui 集成后验证完整编译流程
3. **输出验证**：检查生成的 render function 是否符合预期格式