# Compiler Extension

This section introduces how to extend the Fluxion compiler with custom transforms and code generation.

## Overview

Fluxion's compiler uses a plugin architecture, allowing you to:

- Create custom AST transform plugins
- Add new directive support
- Extend the code generator
- Create custom compilation pipelines

---

## Compiler Architecture

```
Source → Tokenization → Token stream → Parsing → AST → Transform → Codegen → JavaScript
         ↑                     ↑          ↑          ↑
      tokenizer            parser     transforms   codegen
```

---

## Custom Transform Plugins

### Basic Structure

```typescript
import { TransformFn, TransformContext, TemplateChildNode } from '@fluxion-ui/compiler-core'

const myTransform: TransformFn = (node, context) => {
    // Process node...

    // Optional: return exit function
    return () => {
        // Post-processing...
    }
}
```

### Transform Context

```typescript
interface TransformContext {
    root: RootNode
    parent: TemplateChildNode | null
    childIndex: number
    currentNode: TemplateChildNode | null

    helpers: Set<symbol>
    components: Set<string>
    directives: Set<string>

    nodeTransforms: TransformFn[]

    // Node operations
    replaceNode(node: TemplateChildNode): void
    removeNode(node?: TemplateChildNode): void

    // Traversal
    traverseChildren(parent: TemplateChildNode | RootNode): void
    traverseNode(node: TemplateChildNode | RootNode): void

    // Helpers
    helper(name: symbol): symbol

    // Error handling
    onError?: (error: CompilerError) => void
}
```

### Example: Logging Transform Plugin

```typescript
import {
    TransformFn,
    NodeTypes,
    ElementNode,
    createCallExpression,
    createSimpleExpression
} from '@fluxion-ui/compiler-core'

// Add logging functionality to elements
function createLoggingTransform(): TransformFn {
    return (node, context) => {
        if (node.type !== NodeTypes.ELEMENT) return

        const element = node as ElementNode

        // Only process elements with @log directive
        const logDirective = element.props.find(
            p => p.type === NodeTypes.DIRECTIVE && p.name === 'log'
        )

        if (!logDirective) return

        // Remove directive
        element.props = element.props.filter(p => p !== logDirective)

        // Get directive value
        const logMessage = logDirective.exp || `"${element.tag}"`

        // Add onMounted lifecycle
        // Simplified here, actual implementation needs more complex transform
        console.log(`Element ${element.tag} mounted: ${logMessage}`)
    }
}
```

### Example: Auto Key Generation

```typescript
import { TransformFn, NodeTypes, ForNode, ElementNode } from '@fluxion-ui/compiler-core'

// Auto-generate keys for v-for elements
function createAutoKeyTransform(): TransformFn {
    return (node, context) => {
        if (node.type !== NodeTypes.FOR) return

        const forNode = node as ForNode

        // Iterate through children
        for (const child of forNode.children) {
            if (child.type === NodeTypes.ELEMENT) {
                const element = child as ElementNode

                // Check if key already exists
                const hasKey = element.props.some(
                    p => p.type === NodeTypes.ATTRIBUTE && p.name === 'key'
                )

                if (!hasKey && forNode.valueAlias) {
                    // Use loop variable as key
                    element.props.push({
                        type: NodeTypes.ATTRIBUTE,
                        name: 'key',
                        value: {
                            type: NodeTypes.SIMPLE_EXPRESSION,
                            content: forNode.valueAlias,
                            isStatic: false,
                            loc: node.loc
                        },
                        loc: node.loc
                    })
                }
            }
        }
    }
}
```

---

## Custom Directives

### Directive Structure

```typescript
interface DirectiveNode {
    type: NodeTypes.DIRECTIVE
    name: string
    exp?: string
    arg?: string
    modifiers: string[]
    loc: SourceLocation
}
```

### Example: v-focus Directive

```typescript
import {
    TransformFn,
    NodeTypes,
    ElementNode,
    DirectiveNode,
    createSimpleExpression,
    createCallExpression
} from '@fluxion-ui/compiler-core'
import { runtimeHelpers } from '@fluxion-ui/compiler-core'

function createFocusDirectiveTransform(): TransformFn {
    return (node, context) => {
        if (node.type !== NodeTypes.ELEMENT) return

        const element = node as ElementNode
        const focusDirective = element.props.find(
            (p): p is DirectiveNode =>
                p.type === NodeTypes.DIRECTIVE && p.name === 'focus'
        )

        if (!focusDirective) return

        // Remove directive
        element.props = element.props.filter(p => p !== focusDirective)

        // Add ref
        const refName = `_focus_ref_${element.tag}`
        element.props.push({
            type: NodeTypes.ATTRIBUTE,
            name: 'ref',
            value: {
                type: NodeTypes.SIMPLE_EXPRESSION,
                content: refName,
                isStatic: false,
                loc: element.loc
            },
            loc: element.loc
        })

        // Mark runtime helper needed
        context.helper(runtimeHelpers.CREATE_VNODE)
    }
}
```

---

## Extending Code Generation

### Custom Code Generator

```typescript
import {
    generate,
    CodegenResult,
    RootNode,
    NodeTypes,
    ElementNode
} from '@fluxion-ui/compiler-core'

function customGenerate(ast: RootNode): CodegenResult {
    let code = ''

    // Generate preamble
    code += '// Generated by custom codegen\n\n'

    // Generate imports
    code += "import { h } from '@fluxion-ui/fluxion'\n\n"

    // Generate render function
    code += 'export function render() {\n'
    code += '  return '

    // Generate root node
    if (ast.children.length === 1) {
        code += genNode(ast.children[0])
    } else {
        code += '[' + ast.children.map(genNode).join(', ') + ']'
    }

    code += '\n}\n'

    return { code, ast, preamble: '' }
}

function genNode(node: any): string {
    switch (node.type) {
        case NodeTypes.ELEMENT:
            return genElement(node)
        case NodeTypes.TEXT:
            return `"${node.content}"`
        case NodeTypes.INTERPOLATION:
            return node.content.content
        default:
            return 'null'
    }
}

function genElement(node: ElementNode): string {
    const props = node.props.map(p => {
        if (p.type === NodeTypes.ATTRIBUTE) {
            return `${p.name}: "${p.value?.content || ''}"`
        }
        return ''
    }).filter(Boolean).join(', ')

    const children = node.children.map(genNode).join(', ')

    return `h("${node.tag}", { ${props} }, [${children}])`
}
```

---

## Complete Compilation Pipeline

### Custom Compiler

```typescript
import {
    parse,
    transform,
    generate,
    RootNode,
    CompilerOptions
} from '@fluxion-ui/compiler-core'
import { getDefaultTransforms } from '@fluxion-ui/compiler-core'

interface CustomCompileOptions extends CompilerOptions {
    // Custom options
    enableLogging?: boolean
    autoKey?: boolean
}

function customCompile(
    source: string,
    options: CustomCompileOptions = {}
) {
    // 1. Parse
    const ast = parse(source)

    // 2. Collect transforms
    const transforms = [...getDefaultTransforms()]

    // Add custom transforms
    if (options.enableLogging) {
        transforms.push(createLoggingTransform())
    }

    if (options.autoKey) {
        transforms.push(createAutoKeyTransform())
    }

    // 3. Transform
    transform(ast, {
        nodeTransforms: transforms,
        ...options
    })

    // 4. Generate code
    const result = generate(ast)

    return result
}
```

---

## NUI Compiler Extension

### Extending NUI Parser

```typescript
import {
    parse,
    NuiRootNode,
    tokenize,
    TokenType
} from '@fluxion-ui/compiler-nui'

// Custom parsing
function parseWithCustomDirectives(source: string): NuiRootNode {
    const { tokens } = tokenize(source)

    // Process custom syntax
    for (let i = 0; i < tokens.length; i++) {
        const token = tokens[i]

        // Detect custom directives
        if (token.type === TokenType.AT) {
            const nextToken = tokens[i + 1]
            if (nextToken && nextToken.value === 'custom') {
                // Handle custom directive
            }
        }
    }

    // Use standard parsing
    const { ast } = parse(source)
    return ast
}
```

### Adding New Statement Types

```typescript
// Support new declaration types
// Example: state = reactive({ ... })

import { NuiRootNode, NuiNodeTypes, Token, TokenType } from '@fluxion-ui/compiler-nui'

interface StateDeclaration {
    type: NuiNodeTypes
    name: string
    value: string
    loc: SourceLocation
}

function parseStateDeclaration(tokens: Token[], index: number): {
    declaration: StateDeclaration
    nextIndex: number
} {
    const nameToken = tokens[index]
    const equalsToken = tokens[index + 1]
    const valueToken = tokens[index + 2]

    if (
        nameToken.type === TokenType.IDENTIFIER &&
        equalsToken?.type === TokenType.EQUALS &&
        valueToken?.type === TokenType.IDENTIFIER &&
        valueToken.value === 'reactive'
    ) {
        // Parse reactive declaration
        return {
            declaration: {
                type: 'STATE_DECLARATION' as any,
                name: nameToken.value,
                value: 'reactive',
                loc: nameToken.loc
            },
            nextIndex: index + 3
        }
    }

    throw new Error('Invalid state declaration')
}
```

---

## Best Practices

### 1. Keep Transforms Pure

```typescript
// Good: pure function
function myTransform(node, context) {
    const newNode = cloneNode(node)
    // Modify newNode...
    context.replaceNode(newNode)
}

// Avoid: direct mutation
function badTransform(node, context) {
    node.props.push(...) // Directly mutates original node
}
```

### 2. Use Exit Functions for Nesting

```typescript
function parentChildTransform(node, context) {
    // On enter: process parent
    const parentData = {}

    return () => {
        // On exit: children have been processed
        // Can access processed children
        const children = getNodeChildren(node)
        // Post-processing...
    }
}
```

### 3. Error Handling

```typescript
function safeTransform(node, context) {
    try {
        // Transform logic
    } catch (error) {
        context.onError?.({
            code: ErrorCodes.TRANSFORM_ERROR,
            message: `Transform failed: ${error.message}`,
            loc: node.loc
        })
    }
}
```

---

## Debugging Tips

### 1. Print AST

```typescript
import { parse } from '@fluxion-ui/compiler-core'

const ast = parse(source)
console.log(JSON.stringify(ast, null, 2))
```

### 2. Trace Transforms

```typescript
function debugTransform(node, context) {
    console.log('Enter:', node.type, node)

    return () => {
        console.log('Exit:', node.type, node)
    }
}
```

### 3. Check Generated Code

```typescript
import { compile } from '@fluxion-ui/compiler-nui'

const result = compile(source)
console.log(result.code)
console.log('Errors:', result.errors)
```

---

## Next Steps

- [Custom Renderer](custom-renderer.md) - Create custom renderers
- [Performance Optimization](performance.md) - Optimize application performance
- [TypeScript Support](typescript.md) - TypeScript integration