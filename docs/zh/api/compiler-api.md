# 编译器 API 参考

本章节详细介绍 Fluxion 编译器的完整 API。

## 导入

```javascript
// 编译器核心
import {
  parse,
  transform,
  generate,
  compile
} from '@fluxion/compiler-core'

// NUI DSL 编译器
import {
  parse as parseNui,
  compile as compileNui,
  tokenize
} from '@fluxion/compiler-nui'

// DOM 编译器
import { compile as compileDom } from '@fluxion/compiler-dom'
```

---

## 编译流程

Fluxion 的编译流程分为三个阶段：

```
源码 → 词法分析 → Token 流 → 语法分析 → AST → 转换 → 代码生成 → JavaScript
```

---

## NUI 编译器 API

### compile()

编译 NUI 源码为 JavaScript 代码。

```typescript
function compile(
    source: string,
    options?: NuiParseOptions
): NuiCompileResult

interface NuiCompileResult {
    code: string
    ast: NuiRootNode
    errors: NuiCompilerError[]
}

interface NuiParseOptions {
    onError?: (error: NuiCompilerError) => void
}
```

**参数**

| 参数 | 类型 | 描述 |
|------|------|------|
| source | string | NUI 源码 |
| options | NuiParseOptions | 编译选项 |

**返回值**

返回编译结果，包含生成的代码、AST 和错误列表。

**示例**

```javascript
import { compile } from '@fluxion/compiler-nui'

const source = `
count = signal(0)

function increment() {
    count.set(count() + 1)
}

view
div
    p Count: {count}
    button @click=increment Increment
`

const result = compile(source)

if (result.errors.length > 0) {
    console.error('编译错误:', result.errors)
} else {
    console.log(result.code)
}
```

### parse()

解析 NUI 源码为 AST。

```typescript
function parse(
    source: string,
    options?: NuiParseOptions
): NuiParseResult

interface NuiParseResult {
    ast: NuiRootNode
    errors: NuiCompilerError[]
}

interface NuiRootNode {
    type: NuiNodeTypes.NUI_ROOT
    imports: ImportDeclaration[]
    signals: SignalDeclaration[]
    functions: FunctionDeclaration[]
    view: ViewBlock | null
    style: StyleBlock | null
    loc: SourceLocation
    source: string
}
```

**示例**

```javascript
import { parse } from '@fluxion/compiler-nui'

const source = `
import { MyComponent } from './MyComponent.nui'

count = signal(0)

function increment() {
    count.set(count() + 1)
}

view
div
    p Count: {count}
    button @click=increment Increment

style
button {
    padding 8px
    background-color #007bff
}
`

const { ast, errors } = parse(source)

console.log('Signals:', ast.signals)
console.log('Functions:', ast.functions)
console.log('View:', ast.view)
console.log('Style:', ast.style)
```

### tokenize()

将 NUI 源码转换为 Token 流。

```typescript
function tokenize(source: string): {
    tokens: Token[]
    errors: NuiCompilerError[]
}

interface Token {
    type: TokenType
    value: string
    loc: SourceLocation
}

enum TokenType {
    // 关键字
    IMPORT,
    SIGNAL,
    FUNCTION,
    VIEW,
    STYLE,

    // 标识符和字面量
    IDENTIFIER,
    STRING,
    NUMBER,

    // 操作符
    EQUALS,
    DOT,
    COMMA,
    LPAREN,
    RPAREN,
    LBRACE,
    RBRACE,

    // 特殊
    AT,         // @
    HASH,       // #
    NEWLINE,
    INDENT,
    DEDENT,
    EOF
}
```

**示例**

```javascript
import { tokenize, TokenType } from '@fluxion/compiler-nui'

const source = 'count = signal(0)'
const { tokens, errors } = tokenize(source)

tokens.forEach(token => {
    console.log(`${TokenType[token.type]}: "${token.value}"`)
})

// 输出:
// IDENTIFIER: "count"
// EQUALS: "="
// SIGNAL: "signal"
// LPAREN: "("
// NUMBER: "0"
// RPAREN: ")"
// EOF: ""
```

### generateModule()

从 AST 生成 JavaScript 模块代码。

```typescript
function generateModule(ast: NuiRootNode): {
    code: string
    errors: NuiCompilerError[]
}
```

---

## 编译器核心 API

### transform()

执行 AST 转换。

```typescript
function transform(
    root: RootNode,
    options?: CompilerOptions
): void

interface CompilerOptions {
    nodeTransforms?: TransformFn[]
    onError?: (error: CompilerError) => void
}

type TransformFn = (
    node: TemplateChildNode,
    context: TransformContext
) => (() => void) | (() => void)[] | void
```

**参数**

| 参数 | 类型 | 描述 |
|------|------|------|
| root | RootNode | AST 根节点 |
| options | CompilerOptions | 编译选项 |

**示例**

```javascript
import { parse, transform, createTransform, NodeTypes } from '@fluxion/compiler-core'

// 自定义转换插件
const myTransform = createTransform([NodeTypes.ELEMENT], (node, context) => {
    console.log('处理元素:', node.tag)

    // 返回退出函数
    return () => {
        console.log('退出元素:', node.tag)
    }
})

// 执行转换
transform(ast, {
    nodeTransforms: [myTransform]
})
```

### createTransformContext()

创建转换上下文。

```typescript
function createTransformContext(
    root: RootNode,
    options?: CompilerOptions
): TransformContext

interface TransformContext {
    root: RootNode
    parent: TemplateChildNode | null
    childIndex: number
    currentNode: TemplateChildNode | null

    helpers: Set<symbol>
    components: Set<string>
    directives: Set<string>

    nodeTransforms: TransformFn[]

    replaceNode(node: TemplateChildNode): void
    removeNode(node?: TemplateChildNode): void
    traverseChildren(parent: TemplateChildNode | RootNode): void
    traverseNode(node: TemplateChildNode | RootNode): void
    helper(name: symbol): symbol

    onError?: (error: CompilerError) => void
}
```

### traverseNode()

遍历 AST 节点。

```typescript
function traverseNode(
    node: TemplateChildNode | RootNode,
    context: TransformContext
): void
```

### traverseChildren()

遍历子节点。

```typescript
function traverseChildren(
    parent: TemplateChildNode | RootNode,
    context: TransformContext
): void
```

### createTransform()

创建简单的转换插件。

```typescript
function createTransform(
    types: NodeTypes[],
    fn: TransformFn
): TransformFn
```

**示例**

```javascript
import { createTransform, NodeTypes } from '@fluxion/compiler-core'

// 创建只处理文本节点的转换插件
const textTransform = createTransform([NodeTypes.TEXT], (node, context) => {
    // 处理文本节点
    node.content = node.content.trim()
})
```

---

## 代码生成 API

### generate()

从 AST 生成 JavaScript 代码。

```typescript
function generate(ast: RootNode): CodegenResult

interface CodegenResult {
    code: string
    ast: RootNode
    preamble: string
}
```

**示例**

```javascript
import { parse, transform, generate } from '@fluxion/compiler-core'

// 1. 解析源码
const ast = parse(source)

// 2. 转换 AST
transform(ast, {
    nodeTransforms: [/* ... */]
})

// 3. 生成代码
const result = generate(ast)

console.log(result.code)
```

---

## AST 节点类型

### NodeTypes

AST 节点类型枚举。

```typescript
enum NodeTypes {
    ROOT,
    ELEMENT,
    TEXT,
    INTERPOLATION,
    IF,
    IF_BRANCH,
    FOR,
    SIMPLE_EXPRESSION,
    COMPOUND_EXPRESSION,
    ATTRIBUTE,
    DIRECTIVE,

    // JavaScript AST 节点
    JS_CALL_EXPRESSION,
    JS_OBJECT_EXPRESSION,
    JS_ARRAY_EXPRESSION,
    JS_FUNCTION_EXPRESSION,
    JS_CONDITIONAL_EXPRESSION
}
```

### RootNode

根节点。

```typescript
interface RootNode {
    type: NodeTypes.ROOT
    children: TemplateChildNode[]
    helpers: Set<symbol>
    components: Set<string>
    directives: Set<string>
    loc: SourceLocation
}
```

### ElementNode

元素节点。

```typescript
interface ElementNode {
    type: NodeTypes.ELEMENT
    tag: string
    props: Array<AttributeNode | DirectiveNode>
    children: TemplateChildNode[]
    codegenNode?: JSChildNode
    loc: SourceLocation
}
```

### TextNode

文本节点。

```typescript
interface TextNode {
    type: NodeTypes.TEXT
    content: string
    loc: SourceLocation
}
```

### InterpolationNode

插值节点。

```typescript
interface InterpolationNode {
    type: NodeTypes.INTERPOLATION
    content: ExpressionNode
    loc: SourceLocation
}
```

### IfNode

条件节点。

```typescript
interface IfNode {
    type: NodeTypes.IF
    branches: IfBranchNode[]
    codegenNode?: JSConditionalExpression
    loc: SourceLocation
}

interface IfBranchNode {
    type: NodeTypes.IF_BRANCH
    condition?: ExpressionNode
    children: TemplateChildNode[]
    loc: SourceLocation
}
```

### ForNode

循环节点。

```typescript
interface ForNode {
    type: NodeTypes.FOR
    source: ExpressionNode
    valueAlias?: string
    keyAlias?: string
    children: TemplateChildNode[]
    codegenNode?: JSChildNode
    loc: SourceLocation
}
```

---

## AST 创建函数

### createRoot()

创建根节点。

```typescript
function createRoot(children: TemplateChildNode[]): RootNode
```

### createElementNode()

创建元素节点。

```typescript
function createElementNode(
    tag: string,
    props?: Array<AttributeNode | DirectiveNode>,
    children?: TemplateChildNode[]
): ElementNode
```

### createTextNode()

创建文本节点。

```typescript
function createTextNode(content: string): TextNode
```

### createInterpolationNode()

创建插值节点。

```typescript
function createInterpolationNode(content: ExpressionNode): InterpolationNode
```

### createIfNode()

创建条件节点。

```typescript
function createIfNode(branches: IfBranchNode[]): IfNode
```

### createForNode()

创建循环节点。

```typescript
function createForNode(
    source: ExpressionNode,
    valueAlias?: string,
    children?: TemplateChildNode[]
): ForNode
```

### createAttributeNode()

创建属性节点。

```typescript
function createAttributeNode(name: string, value?: string): AttributeNode
```

### createDirectiveNode()

创建指令节点。

```typescript
function createDirectiveNode(name: string, exp?: string): DirectiveNode
```

---

## AST 工具函数

### isElementNode()

判断是否为元素节点。

```typescript
function isElementNode(node: TemplateChildNode): node is ElementNode
```

### isTextNode()

判断是否为文本节点。

```typescript
function isTextNode(node: TemplateChildNode): node is TextNode
```

### isInterpolationNode()

判断是否为插值节点。

```typescript
function isInterpolationNode(node: TemplateChildNode): node is InterpolationNode
```

### isIfNode()

判断是否为条件节点。

```typescript
function isIfNode(node: TemplateChildNode): node is IfNode
```

### isForNode()

判断是否为循环节点。

```typescript
function isForNode(node: TemplateChildNode): node is ForNode
```

---

## 转换插件

### transformIf()

转换 if/elif/else 语句。

```typescript
function transformIf(node: IfNode, context: TransformContext): void
```

### transformFor()

转换 for 循环语句。

```typescript
function transformFor(node: ForNode, context: TransformContext): void
```

### transformElement()

转换元素节点。

```typescript
function transformElement(node: ElementNode, context: TransformContext): void
```

### transformText()

转换文本节点（合并相邻文本和插值）。

```typescript
function transformText(node: TemplateChildNode, context: TransformContext): void
```

### getDefaultTransforms()

获取默认的转换插件集合。

```typescript
function getDefaultTransforms(): TransformFn[]
```

---

## 运行时辅助函数

### runtimeHelpers

运行时辅助函数 Symbol 集合。

```typescript
export const runtimeHelpers = {
    CREATE_VNODE: Symbol('createVNode'),
    CREATE_TEXT_VNODE: Symbol('createTextVNode'),
    CREATE_COMMENT_VNODE: Symbol('createCommentVNode'),
    RESOLVE_COMPONENT: Symbol('resolveComponent'),
    RESOLVE_DIRECTIVE: Symbol('resolveDirective'),
    RENDER_LIST: Symbol('renderList'),
    MERGE_PROPS: Symbol('mergeProps'),
    NORMALIZE_CLASS: Symbol('normalizeClass'),
    NORMALIZE_STYLE: Symbol('normalizeStyle'),
    NORMALIZE_PROPS: Symbol('normalizeProps')
}
```

### getRuntimeHelperName()

获取运行时辅助函数名称。

```typescript
function getRuntimeHelperName(symbol: symbol): string | undefined
```

### isRuntimeHelper()

判断是否为运行时辅助函数。

```typescript
function isRuntimeHelper(value: unknown): value is symbol
```

---

## 类型定义

```typescript
// 源码位置
interface Position {
    offset: number
    line: number
    column: number
}

interface SourceLocation {
    start: Position
    end: Position
    source: string
}

// 编译错误
interface CompilerError {
    code: number
    message: string
    loc?: SourceLocation
}

// 表达式节点
type ExpressionNode = SimpleExpressionNode | CompoundExpressionNode

interface SimpleExpressionNode {
    type: NodeTypes.SIMPLE_EXPRESSION
    content: string
    isStatic: boolean
    loc: SourceLocation
}

interface CompoundExpressionNode {
    type: NodeTypes.COMPOUND_EXPRESSION
    children: Array<string | ExpressionNode>
    loc: SourceLocation
}

// JavaScript AST 节点
interface JSCallExpression {
    type: NodeTypes.JS_CALL_EXPRESSION
    callee: string | symbol
    arguments: Array<string | JSChildNode>
}

interface JSObjectExpression {
    type: NodeTypes.JS_OBJECT_EXPRESSION
    properties: Array<{ key: string; value: JSChildNode }>
}

interface JSArrayExpression {
    type: NodeTypes.JS_ARRAY_EXPRESSION
    elements: Array<JSChildNode | null | string>
}

interface JSFunctionExpression {
    type: NodeTypes.JS_FUNCTION_EXPRESSION
    params: string[]
    returns?: JSChildNode
    body?: JSChildNode
    newline?: boolean
}

interface JSConditionalExpression {
    type: NodeTypes.JS_CONDITIONAL_EXPRESSION
    test: JSChildNode
    consequent: JSChildNode
    alternate: JSChildNode
}
```

---

## 下一步

- [响应式 API](reactivity-api.md) - 响应式系统 API
- [运行时 API](runtime-api.md) - 应用和渲染器 API
- [工具函数 API](utils-api.md) - 辅助工具函数