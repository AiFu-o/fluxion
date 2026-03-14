/**
 * 代码生成核心
 * 将 AST 转换为 JavaScript 代码
 */

import {
	NodeTypes,
	RootNode,
	TemplateChildNode,
	CodegenResult,
	JSChildNode,
	JSCallExpression,
	JSObjectExpression,
	JSArrayExpression,
	JSFunctionExpression,
	JSConditionalExpression,
	SimpleExpressionNode,
	CompoundExpressionNode,
	ElementNode,
	TextNode,
	InterpolationNode,
	IfNode,
	ForNode
} from '../types'
import { isRuntimeHelper, runtimeHelpers, getRuntimeHelperName } from '../runtimeHelpers'
import { warn } from '@fluxion-ui/shared'

// ==================== 代码生成上下文 ====================

/**
 * 代码生成上下文
 */
interface CodegenContext {
	// 生成的代码
	code: string

	// 缩进级别
	indentLevel: number

	// 缩进字符串
	indent: (level?: number) => string

	// 换行
	newline: () => string

	// 推送代码
	push: (code: string) => void

	// 缩进
	indentCode: () => void

	// 取消缩进
	deindent: () => void
}

/**
 * 创建代码生成上下文
 */
function createCodegenContext(): CodegenContext {
	const context: CodegenContext = {
		code: '',
		indentLevel: 0,

		indent(level: number = context.indentLevel) {
			return '  '.repeat(level)
		},

		newline() {
			return '\n'
		},

		push(code: string) {
			context.code += code
		},

		indentCode() {
			context.indentLevel++
		},

		deindent() {
			context.indentLevel--
		}
	}

	return context
}

// ==================== 代码生成入口 ====================

/**
 * 生成代码
 */
export function generate(ast: RootNode): CodegenResult {
	const context = createCodegenContext()

	// 生成前导代码（导入等）
	genFunctionPreamble(ast, context)

	// 生成 render 函数
	genRenderFunction(ast, context)

	return {
		code: context.code,
		ast,
		preamble: ''
	}
}

/**
 * 生成函数前导代码（导入语句）
 */
function genFunctionPreamble(ast: RootNode, context: CodegenContext) {
	// 如果有帮助函数，生成导入语句
	if (ast.helpers.size > 0) {
		// 收集需要的运行时函数
		const imports: string[] = []

		for (const helper of ast.helpers) {
			const name = getRuntimeHelperName(helper)
			if (name && !imports.includes(name)) {
				imports.push(name)
			}
		}

		if (imports.length > 0) {
			context.push(`import { ${imports.join(', ')} } from 'fluxion/runtime'\n`)
		}
	}

	// 添加空行
	context.push('\n')
}

/**
 * 生成 render 函数
 */
function genRenderFunction(ast: RootNode, context: CodegenContext) {
	context.push('export function render() {\n')
	context.indentCode()

	context.push(context.indent())
	context.push('return ')

	// 生成根节点的子节点
	if (ast.children.length === 1) {
		// 单个子节点
		genNode(ast.children[0], context)
	} else if (ast.children.length > 1) {
		// 多个子节点，生成数组
		context.push('[\n')
		context.indentCode()

		for (let i = 0; i < ast.children.length; i++) {
			context.push(context.indent())
			genNode(ast.children[i], context)

			if (i < ast.children.length - 1) {
				context.push(',')
			}
			context.push('\n')
		}

		context.deindent()
		context.push(context.indent())
		context.push(']')
	} else {
		// 空节点
		context.push('null')
	}

	context.push('\n')
	context.deindent()
	context.push('}\n')
}

// ==================== 节点代码生成 ====================

/**
 * 生成节点代码
 */
function genNode(node: TemplateChildNode | JSChildNode, context: CodegenContext) {
	switch (node.type) {
		case NodeTypes.ELEMENT:
			genElementNode(node as ElementNode, context)
			break

		case NodeTypes.TEXT:
			genTextNode(node as TextNode, context)
			break

		case NodeTypes.INTERPOLATION:
			genInterpolationNode(node as InterpolationNode, context)
			break

		case NodeTypes.IF:
			genIfNode(node as IfNode, context)
			break

		case NodeTypes.FOR:
			genForNode(node as ForNode, context)
			break

		case NodeTypes.SIMPLE_EXPRESSION:
			genSimpleExpression(node as SimpleExpressionNode, context)
			break

		case NodeTypes.COMPOUND_EXPRESSION:
			genCompoundExpression(node as CompoundExpressionNode, context)
			break

		case NodeTypes.JS_CALL_EXPRESSION:
			genCallExpression(node as JSCallExpression, context)
			break

		case NodeTypes.JS_OBJECT_EXPRESSION:
			genObjectExpression(node as JSObjectExpression, context)
			break

		case NodeTypes.JS_ARRAY_EXPRESSION:
			genArrayExpression(node as JSArrayExpression, context)
			break

		case NodeTypes.JS_FUNCTION_EXPRESSION:
			genFunctionExpression(node as JSFunctionExpression, context)
			break

		case NodeTypes.JS_CONDITIONAL_EXPRESSION:
			genConditionalExpression(node as JSConditionalExpression, context)
			break

		default:
			warn(`genNode: 未知的节点类型 ${node.type}`)
	}
}

/**
 * 生成元素节点代码
 */
function genElementNode(node: ElementNode, context: CodegenContext) {
	if (node.codegenNode) {
		// 有代码生成节点，直接使用
		genNode(node.codegenNode, context)
	} else {
		// 没有代码生成节点，生成默认的 h 调用
		context.push(`h("${node.tag}"`)

		if (node.props.length > 0) {
			context.push(', ')
			genProps(node.props, context)
		}

		if (node.children.length > 0) {
			context.push(', ')
			if (node.children.length === 1) {
				genNode(node.children[0], context)
			} else {
				context.push('[')
				for (let i = 0; i < node.children.length; i++) {
					genNode(node.children[i], context)
					if (i < node.children.length - 1) {
						context.push(', ')
					}
				}
				context.push(']')
			}
		}

		context.push(')')
	}
}

/**
 * 生成文本节点代码
 */
function genTextNode(node: TextNode, context: CodegenContext) {
	context.push(`"${node.content}"`)
}

/**
 * 生成插值节点代码
 */
function genInterpolationNode(node: InterpolationNode, context: CodegenContext) {
	// 获取插值内容
	const content = (node.content as SimpleExpressionNode).content
	context.push(content)
}

/**
 * 生成 if 节点代码
 */
function genIfNode(node: IfNode, context: CodegenContext) {
	if (node.codegenNode) {
		genNode(node.codegenNode, context)
	} else {
		warn('genIfNode: if 节点缺少 codegenNode')
	}
}

/**
 * 生成 for 节点代码
 */
function genForNode(node: ForNode, context: CodegenContext) {
	if (node.codegenNode) {
		genNode(node.codegenNode, context)
	} else {
		warn('genForNode: for 节点缺少 codegenNode')
	}
}

/**
 * 生成简单表达式代码
 */
function genSimpleExpression(node: SimpleExpressionNode, context: CodegenContext) {
	context.push(node.content)
}

/**
 * 生成复合表达式代码
 */
function genCompoundExpression(node: CompoundExpressionNode, context: CodegenContext) {
	for (const child of node.children) {
		if (typeof child === 'string') {
			context.push(child)
		} else {
			genNode(child as any, context)
		}
	}
}

/**
 * 生成函数调用表达式代码
 */
function genCallExpression(node: JSCallExpression, context: CodegenContext) {
	// 生成调用者
	if (typeof node.callee === 'symbol') {
		context.push(getRuntimeHelperName(node.callee) || 'h')
	} else {
		context.push(node.callee)
	}

	context.push('(')

	// 生成参数
	for (let i = 0; i < node.arguments.length; i++) {
		const arg = node.arguments[i]

		if (typeof arg === 'string') {
			context.push(arg)
		} else {
			genNode(arg, context)
		}

		if (i < node.arguments.length - 1) {
			context.push(', ')
		}
	}

	context.push(')')
}

/**
 * 生成对象表达式代码
 */
function genObjectExpression(node: JSObjectExpression, context: CodegenContext) {
	if (node.properties.length === 0) {
		context.push('{}')
		return
	}

	context.push('{\n')
	context.indentCode()

	for (let i = 0; i < node.properties.length; i++) {
		const prop = node.properties[i] as any
		context.push(context.indent())

		// key
		if (typeof prop.key === 'string') {
			context.push(prop.key)
		} else {
			genNode(prop.key, context)
		}

		context.push(': ')

		// value
		if (typeof prop.value === 'string') {
			context.push(prop.value)
		} else {
			genNode(prop.value, context)
		}

		if (i < node.properties.length - 1) {
			context.push(',')
		}
		context.push('\n')
	}

	context.deindent()
	context.push(context.indent())
	context.push('}')
}

/**
 * 生成数组表达式代码
 */
function genArrayExpression(node: JSArrayExpression, context: CodegenContext) {
	if (node.elements.length === 0) {
		context.push('[]')
		return
	}

	context.push('[\n')
	context.indentCode()

	for (let i = 0; i < node.elements.length; i++) {
		const element = node.elements[i]

		context.push(context.indent())

		if (element === null) {
			context.push('null')
		} else if (typeof element === 'string') {
			context.push(element)
		} else {
			genNode(element, context)
		}

		if (i < node.elements.length - 1) {
			context.push(',')
		}
		context.push('\n')
	}

	context.deindent()
	context.push(context.indent())
	context.push(']')
}

/**
 * 生成函数表达式代码
 */
function genFunctionExpression(node: JSFunctionExpression, context: CodegenContext) {
	context.push('(')

	// 参数
	const params = node.params as string[]
	for (let i = 0; i < params.length; i++) {
		context.push(params[i])
		if (i < params.length - 1) {
			context.push(', ')
		}
	}

	context.push(') => ')

	// 返回值
	if (node.returns) {
		if (node.newline) {
			context.push('{\n')
			context.indentCode()
			context.push(context.indent())
			context.push('return ')
			genNode(node.returns, context)
			context.push('\n')
			context.deindent()
			context.push(context.indent())
			context.push('}')
		} else {
			genNode(node.returns, context)
		}
	} else if (node.body) {
		genNode(node.body, context)
	}
}

/**
 * 生成条件表达式代码
 */
function genConditionalExpression(node: JSConditionalExpression, context: CodegenContext) {
	// test
	genNode(node.test, context)
	context.push(' ? ')

	// consequent
	genNode(node.consequent, context)
	context.push(' : ')

	// alternate
	genNode(node.alternate, context)
}

// ==================== 辅助函数 ====================

/**
 * 生成 props 代码
 */
function genProps(props: any[], context: CodegenContext) {
	context.push('{')

	for (let i = 0; i < props.length; i++) {
		const prop = props[i]
		context.push(`${prop.name}: ${prop.value ? `"${prop.value.content}"` : 'true'}`)

		if (i < props.length - 1) {
			context.push(', ')
		}
	}

	context.push('}')
}