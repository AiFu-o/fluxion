# 编译器扩展

本章节介绍如何扩展 Fluxion 编译器，添加自定义转换和代码生成。

## 概述

Fluxion 编译器采用插件化架构，你可以：

- 创建自定义 AST 转换插件
- 添加新的指令支持
- 扩展代码生成器
- 创建自定义编译流程

---

## 编译器架构

```
源码 → 词法分析 → Token 流 → 语法分析 → AST → 转换 → 代码生成 → JavaScript
        ↑                     ↑          ↑          ↑
     tokenizer            parser     transforms   codegen
```

---

## 自定义转换插件

### 基本结构

```typescript
import { TransformFn, TransformContext, TemplateChildNode } from '@fluxion-ui/compiler-core'

const myTransform: TransformFn = (node, context) => {
    // 处理节点...

    // 可选：返回退出函数
    return () => {
        // 后处理...
    }
}
```

### 转换上下文

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

    // 节点操作
    replaceNode(node: TemplateChildNode): void
    removeNode(node?: TemplateChildNode): void

    // 遍历
    traverseChildren(parent: TemplateChildNode | RootNode): void
    traverseNode(node: TemplateChildNode | RootNode): void

    // 辅助函数
    helper(name: symbol): symbol

    // 错误处理
    onError?: (error: CompilerError) => void
}
```

### 示例：日志转换插件

```typescript
import {
    TransformFn,
    NodeTypes,
    ElementNode,
    createCallExpression,
    createSimpleExpression
} from '@fluxion-ui/compiler-core'

// 为元素添加日志功能
function createLoggingTransform(): TransformFn {
    return (node, context) => {
        if (node.type !== NodeTypes.ELEMENT) return

        const element = node as ElementNode

        // 只处理有 @log 指令的元素
        const logDirective = element.props.find(
            p => p.type === NodeTypes.DIRECTIVE && p.name === 'log'
        )

        if (!logDirective) return

        // 移除指令
        element.props = element.props.filter(p => p !== logDirective)

        // 获取指令值
        const logMessage = logDirective.exp || `"${element.tag}"`

        // 添加 onMounted 生命周期
        // 这里简化处理，实际需要更复杂的转换
        console.log(`Element ${element.tag} mounted: ${logMessage}`)
    }
}
```

### 示例：自动 Key 生成

```typescript
import { TransformFn, NodeTypes, ForNode, ElementNode } from '@fluxion-ui/compiler-core'

// 为 v-for 元素自动生成 key
function createAutoKeyTransform(): TransformFn {
    return (node, context) => {
        if (node.type !== NodeTypes.FOR) return

        const forNode = node as ForNode

        // 遍历子元素
        for (const child of forNode.children) {
            if (child.type === NodeTypes.ELEMENT) {
                const element = child as ElementNode

                // 检查是否已有 key
                const hasKey = element.props.some(
                    p => p.type === NodeTypes.ATTRIBUTE && p.name === 'key'
                )

                if (!hasKey && forNode.valueAlias) {
                    // 使用循环变量作为 key
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

## 自定义指令

### 指令结构

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

### 示例：v-focus 指令

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

        // 移除指令
        element.props = element.props.filter(p => p !== focusDirective)

        // 添加 ref
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

        // 标记需要运行时帮助
        context.helper(runtimeHelpers.CREATE_VNODE)
    }
}
```

---

## 扩展代码生成

### 自定义代码生成器

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

    // 生成前导代码
    code += '// Generated by custom codegen\n\n'

    // 生成导入
    code += "import { h } from 'fluxion'\n\n"

    // 生成 render 函数
    code += 'export function render() {\n'
    code += '  return '

    // 生成根节点
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

## 完整编译流程

### 自定义编译器

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
    // 自定义选项
    enableLogging?: boolean
    autoKey?: boolean
}

function customCompile(
    source: string,
    options: CustomCompileOptions = {}
) {
    // 1. 解析
    const ast = parse(source)

    // 2. 收集转换插件
    const transforms = [...getDefaultTransforms()]

    // 添加自定义转换
    if (options.enableLogging) {
        transforms.push(createLoggingTransform())
    }

    if (options.autoKey) {
        transforms.push(createAutoKeyTransform())
    }

    // 3. 转换
    transform(ast, {
        nodeTransforms: transforms,
        ...options
    })

    // 4. 代码生成
    const result = generate(ast)

    return result
}
```

---

## NUI 编译器扩展

### 扩展 NUI 解析器

```typescript
import {
    parse,
    NuiRootNode,
    tokenize,
    TokenType
} from '@fluxion-ui/compiler-nui'

// 自定义解析
function parseWithCustomDirectives(source: string): NuiRootNode {
    const { tokens } = tokenize(source)

    // 处理自定义语法
    for (let i = 0; i < tokens.length; i++) {
        const token = tokens[i]

        // 检测自定义指令
        if (token.type === TokenType.AT) {
            const nextToken = tokens[i + 1]
            if (nextToken && nextToken.value === 'custom') {
                // 处理自定义指令
            }
        }
    }

    // 使用标准解析
    const { ast } = parse(source)
    return ast
}
```

### 添加新语句类型

```typescript
// 支持新的声明类型
// 例如：state = reactive({ ... })

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
        // 解析 reactive 声明
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

## 最佳实践

### 1. 保持转换纯净

```typescript
// 好的做法：纯函数
function myTransform(node, context) {
    const newNode = cloneNode(node)
    // 修改 newNode...
    context.replaceNode(newNode)
}

// 避免：直接修改
function badTransform(node, context) {
    node.props.push(...) // 直接修改原节点
}
```

### 2. 使用退出函数处理嵌套

```typescript
function parentChildTransform(node, context) {
    // 进入时：处理父节点
    const parentData = {}

    return () => {
        // 退出时：子节点已处理完毕
        // 可以访问处理后的子节点
        const children = getNodeChildren(node)
        // 后处理...
    }
}
```

### 3. 错误处理

```typescript
function safeTransform(node, context) {
    try {
        // 转换逻辑
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

## 调试技巧

### 1. 打印 AST

```typescript
import { parse } from '@fluxion-ui/compiler-core'

const ast = parse(source)
console.log(JSON.stringify(ast, null, 2))
```

### 2. 追踪转换

```typescript
function debugTransform(node, context) {
    console.log('Enter:', node.type, node)

    return () => {
        console.log('Exit:', node.type, node)
    }
}
```

### 3. 检查生成代码

```typescript
import { compile } from '@fluxion-ui/compiler-nui'

const result = compile(source)
console.log(result.code)
console.log('Errors:', result.errors)
```

---

## 下一步

- [自定义渲染器](custom-renderer.md) - 创建自定义渲染器
- [性能优化](performance.md) - 优化应用性能
- [TypeScript 支持](typescript.md) - TypeScript 集成