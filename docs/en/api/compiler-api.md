# Compiler API Reference

This section details the complete API of Fluxion's compiler system.

## Imports

```javascript
// Compiler core
import {
  parse,
  transform,
  generate,
  compile
} from '@fluxion-ui/compiler-core'

// NUI DSL compiler
import {
  parse as parseNui,
  compile as compileNui,
  tokenize
} from '@fluxion-ui/compiler-nui'

// DOM compiler
import { compile as compileDom } from '@fluxion-ui/compiler-dom'
```

---

## Compilation Pipeline

Fluxion's compilation pipeline consists of three stages:

```
Source → Tokenization → Token stream → Parsing → AST → Transform → Codegen → JavaScript
```

---

## NUI Compiler API

### compile()

Compiles NUI source code to JavaScript.

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

**Parameters**

| Parameter | Type | Description |
|------|------|------|
| source | string | NUI source code |
| options | NuiParseOptions | Compile options |

**Returns**

Returns the compilation result containing generated code, AST, and error list.

**Example**

```javascript
import { compile } from '@fluxion-ui/compiler-nui'

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
    console.error('Compile errors:', result.errors)
} else {
    console.log(result.code)
}
```

### parse()

Parses NUI source code to AST.

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

**Example**

```javascript
import { parse } from '@fluxion-ui/compiler-nui'

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

Converts NUI source code to a token stream.

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
    // Keywords
    IMPORT,
    SIGNAL,
    FUNCTION,
    VIEW,
    STYLE,

    // Identifiers and literals
    IDENTIFIER,
    STRING,
    NUMBER,

    // Operators
    EQUALS,
    DOT,
    COMMA,
    LPAREN,
    RPAREN,
    LBRACE,
    RBRACE,

    // Special
    AT,         // @
    HASH,       // #
    NEWLINE,
    INDENT,
    DEDENT,
    EOF
}
```

**Example**

```javascript
import { tokenize, TokenType } from '@fluxion-ui/compiler-nui'

const source = 'count = signal(0)'
const { tokens, errors } = tokenize(source)

tokens.forEach(token => {
    console.log(`${TokenType[token.type]}: "${token.value}"`)
})

// Output:
// IDENTIFIER: "count"
// EQUALS: "="
// SIGNAL: "signal"
// LPAREN: "("
// NUMBER: "0"
// RPAREN: ")"
// EOF: ""
```

### generateModule()

Generates JavaScript module code from AST.

```typescript
function generateModule(ast: NuiRootNode): {
    code: string
    errors: NuiCompilerError[]
}
```

---

## Compiler Core API

### transform()

Executes AST transformation.

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

**Parameters**

| Parameter | Type | Description |
|------|------|------|
| root | RootNode | AST root node |
| options | CompilerOptions | Compiler options |

**Example**

```javascript
import { parse, transform, createTransform, NodeTypes } from '@fluxion-ui/compiler-core'

// Custom transform plugin
const myTransform = createTransform([NodeTypes.ELEMENT], (node, context) => {
    console.log('Processing element:', node.tag)

    // Return exit function
    return () => {
        console.log('Exiting element:', node.tag)
    }
})

// Execute transform
transform(ast, {
    nodeTransforms: [myTransform]
})
```

### createTransformContext()

Creates a transform context.

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

Traverses an AST node.

```typescript
function traverseNode(
    node: TemplateChildNode | RootNode,
    context: TransformContext
): void
```

### traverseChildren()

Traverses child nodes.

```typescript
function traverseChildren(
    parent: TemplateChildNode | RootNode,
    context: TransformContext
): void
```

### createTransform()

Creates a simple transform plugin.

```typescript
function createTransform(
    types: NodeTypes[],
    fn: TransformFn
): TransformFn
```

**Example**

```javascript
import { createTransform, NodeTypes } from '@fluxion-ui/compiler-core'

// Create transform plugin that only handles text nodes
const textTransform = createTransform([NodeTypes.TEXT], (node, context) => {
    // Process text node
    node.content = node.content.trim()
})
```

---

## Code Generation API

### generate()

Generates JavaScript code from AST.

```typescript
function generate(ast: RootNode): CodegenResult

interface CodegenResult {
    code: string
    ast: RootNode
    preamble: string
}
```

**Example**

```javascript
import { parse, transform, generate } from '@fluxion-ui/compiler-core'

// 1. Parse source
const ast = parse(source)

// 2. Transform AST
transform(ast, {
    nodeTransforms: [/* ... */]
})

// 3. Generate code
const result = generate(ast)

console.log(result.code)
```

---

## AST Node Types

### NodeTypes

AST node type enumeration.

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

    // JavaScript AST nodes
    JS_CALL_EXPRESSION,
    JS_OBJECT_EXPRESSION,
    JS_ARRAY_EXPRESSION,
    JS_FUNCTION_EXPRESSION,
    JS_CONDITIONAL_EXPRESSION
}
```

### RootNode

Root node.

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

Element node.

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

Text node.

```typescript
interface TextNode {
    type: NodeTypes.TEXT
    content: string
    loc: SourceLocation
}
```

### InterpolationNode

Interpolation node.

```typescript
interface InterpolationNode {
    type: NodeTypes.INTERPOLATION
    content: ExpressionNode
    loc: SourceLocation
}
```

### IfNode

Conditional node.

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

Loop node.

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

## AST Creation Functions

### createRoot()

Creates a root node.

```typescript
function createRoot(children: TemplateChildNode[]): RootNode
```

### createElementNode()

Creates an element node.

```typescript
function createElementNode(
    tag: string,
    props?: Array<AttributeNode | DirectiveNode>,
    children?: TemplateChildNode[]
): ElementNode
```

### createTextNode()

Creates a text node.

```typescript
function createTextNode(content: string): TextNode
```

### createInterpolationNode()

Creates an interpolation node.

```typescript
function createInterpolationNode(content: ExpressionNode): InterpolationNode
```

### createIfNode()

Creates a conditional node.

```typescript
function createIfNode(branches: IfBranchNode[]): IfNode
```

### createForNode()

Creates a loop node.

```typescript
function createForNode(
    source: ExpressionNode,
    valueAlias?: string,
    children?: TemplateChildNode[]
): ForNode
```

### createAttributeNode()

Creates an attribute node.

```typescript
function createAttributeNode(name: string, value?: string): AttributeNode
```

### createDirectiveNode()

Creates a directive node.

```typescript
function createDirectiveNode(name: string, exp?: string): DirectiveNode
```

---

## AST Utility Functions

### isElementNode()

Checks if a node is an element node.

```typescript
function isElementNode(node: TemplateChildNode): node is ElementNode
```

### isTextNode()

Checks if a node is a text node.

```typescript
function isTextNode(node: TemplateChildNode): node is TextNode
```

### isInterpolationNode()

Checks if a node is an interpolation node.

```typescript
function isInterpolationNode(node: TemplateChildNode): node is InterpolationNode
```

### isIfNode()

Checks if a node is a conditional node.

```typescript
function isIfNode(node: TemplateChildNode): node is IfNode
```

### isForNode()

Checks if a node is a loop node.

```typescript
function isForNode(node: TemplateChildNode): node is ForNode
```

---

## Transform Plugins

### transformIf()

Transforms if/elif/else statements.

```typescript
function transformIf(node: IfNode, context: TransformContext): void
```

### transformFor()

Transforms for loop statements.

```typescript
function transformFor(node: ForNode, context: TransformContext): void
```

### transformElement()

Transforms element nodes.

```typescript
function transformElement(node: ElementNode, context: TransformContext): void
```

### transformText()

Transforms text nodes (merges adjacent text and interpolation).

```typescript
function transformText(node: TemplateChildNode, context: TransformContext): void
```

### getDefaultTransforms()

Gets the default set of transform plugins.

```typescript
function getDefaultTransforms(): TransformFn[]
```

---

## Runtime Helpers

### runtimeHelpers

Runtime helper symbol collection.

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

Gets the runtime helper name.

```typescript
function getRuntimeHelperName(symbol: symbol): string | undefined
```

### isRuntimeHelper()

Checks if a value is a runtime helper.

```typescript
function isRuntimeHelper(value: unknown): value is symbol
```

---

## Type Definitions

```typescript
// Source location
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

// Compiler error
interface CompilerError {
    code: number
    message: string
    loc?: SourceLocation
}

// Expression node
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

// JavaScript AST nodes
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

## Next Steps

- [Reactivity API](reactivity-api.md) - Reactivity system APIs
- [Runtime API](runtime-api.md) - Application and renderer APIs
- [Utils API](utils-api.md) - Utility helper functions