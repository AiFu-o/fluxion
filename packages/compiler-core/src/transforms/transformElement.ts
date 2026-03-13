/**
 * 元素转换插件
 * 将元素节点转换为 h 函数调用
 */

import {
	NodeTypes,
	ElementNode,
	TemplateChildNode,
	TransformContext,
	JSCallExpression,
	JSObjectExpression,
	DirectiveNode,
	AttributeNode
} from '../types'
import {
	createCallExpression,
	createObjectExpression,
	createSimpleExpression,
	createArrayExpression,
	isElementNode
} from '../ast'
import { runtimeHelpers } from '../runtimeHelpers'
import { warn } from '@fluxion/shared'

/**
 * 元素转换插件
 *
 * 将：
 * button @click=increment
 *
 * 转换为：
 * h("button", { onClick: increment })
 */
export function transformElement(node: TemplateChildNode, context: TransformContext) {
	if (!isElementNode(node)) {
		return
	}

	// 返回退出函数，在子节点处理完成后执行
	return () => {
		// 处理元素节点
		processElement(node, context)
	}
}

/**
 * 处理元素节点
 */
function processElement(node: ElementNode, context: TransformContext) {
	const { tag, props, children, isSelfClosing } = node

	// 添加运行时辅助函数
	context.helper(runtimeHelpers.CREATE_ELEMENT_VNODE)

	// 创建 h 函数调用
	const codegenNode = createElementCodegen(node, context)

	if (codegenNode) {
		node.codegenNode = codegenNode
	}
}

/**
 * 创建元素的代码生成节点
 */
function createElementCodegen(
	node: ElementNode,
	context: TransformContext
): JSCallExpression {
	const { tag, props, children } = node

	// 判断是元素还是组件
	const isComponent = isComponentTag(tag)

	// 创建参数
	const args: (string | JSCallExpression | JSObjectExpression)[] = []

	// 第一个参数：标签名或组件
	if (isComponent) {
		// 组件使用变量名
		args.push(tag)
		context.components.add(tag)
	} else {
		// 元素使用字符串
		args.push(`"${tag}"`)
	}

	// 第二个参数：props 对象
	const propsObj = createPropsObject(props, context)
	if (propsObj || children.length > 0) {
		if (propsObj) {
			args.push(propsObj)
		} else {
			args.push('null' as any)
		}
	}

	// 第三个参数：children
	if (children.length > 0) {
		const childrenArg = createChildrenArg(children, context)
		args.push(childrenArg as any)
	}

	// 创建 h 函数调用
	return createCallExpression(
		runtimeHelpers.CREATE_ELEMENT_VNODE,
		args
	)
}

/**
 * 创建 props 对象
 */
function createPropsObject(
	props: Array<AttributeNode | DirectiveNode>,
	context: TransformContext
): JSObjectExpression | null {
	if (props.length === 0) {
		return null
	}

	const properties: Array<{ key: string; value: any }> = []

	for (const prop of props) {
		if (prop.type === NodeTypes.ATTRIBUTE) {
			// 普通属性
			properties.push({
				key: prop.name,
				value: prop.value ? `"${prop.value.content}"` : 'true'
			})
		} else if (prop.type === NodeTypes.DIRECTIVE) {
			// 指令
			const directiveProp = processDirective(prop, context)
			if (directiveProp) {
				properties.push(directiveProp)
			}
		}
	}

	if (properties.length === 0) {
		return null
	}

	return createObjectExpression(properties)
}

/**
 * 处理指令
 */
function processDirective(
	directive: DirectiveNode,
	context: TransformContext
): { key: string; value: any } | null {
	const { name, exp, arg, modifiers } = directive

	switch (name) {
		case 'click':
		case 'mousedown':
		case 'mouseup':
		case 'mouseenter':
		case 'mouseleave':
		case 'keydown':
		case 'keyup':
		case 'submit':
		case 'input':
		case 'change':
			// 事件处理
			return {
				key: `on${capitalize(name)}`,
				value: exp ? exp.content : '() => {}'
			}

		case 'bind':
			// 动态绑定
			if (arg) {
				return {
					key: arg.content,
					value: wrapSignalCall(exp?.content || '')
				}
			}
			return null

		case 'model':
			// 双向绑定
			// TODO: 实现 model 指令
			return null

		default:
			// 未知指令，作为事件处理
			return {
				key: `on${capitalize(name)}`,
				value: exp ? exp.content : '() => {}'
			}
	}
}

/**
 * 创建 children 参数
 */
function createChildrenArg(
	children: TemplateChildNode[],
	context: TransformContext
): JSCallExpression | any {
	if (children.length === 0) {
		return null
	}

	// 单个文本节点
	if (children.length === 1) {
		const child = children[0]
		if (child.type === NodeTypes.TEXT) {
			return `"${child.content}"`
		}
		if (child.type === NodeTypes.INTERPOLATION) {
			return wrapSignalCall((child.content as any).content)
		}
		// 元素节点使用其 codegenNode
		if (child.type === NodeTypes.ELEMENT && (child as any).codegenNode) {
			return (child as any).codegenNode
		}
	}

	// 多个子节点，创建数组
	const elements: any[] = []
	for (const child of children) {
		if (child.type === NodeTypes.TEXT) {
			elements.push(`"${child.content}"`)
		} else if (child.type === NodeTypes.INTERPOLATION) {
			elements.push(wrapSignalCall((child.content as any).content))
		} else if (child.type === NodeTypes.ELEMENT) {
			if ((child as any).codegenNode) {
				elements.push((child as any).codegenNode)
			}
		} else if (child.type === NodeTypes.IF) {
			if ((child as any).codegenNode) {
				elements.push((child as any).codegenNode)
			}
		} else if (child.type === NodeTypes.FOR) {
			if ((child as any).codegenNode) {
				elements.push((child as any).codegenNode)
			}
		}
	}

	return createArrayExpression(elements)
}

/**
 * 判断是否为组件标签
 */
function isComponentTag(tag: string): boolean {
	// 组件标签以大写字母开头或包含连字符
	return /^[A-Z]/.test(tag) || tag.includes('-')
}

/**
 * 首字母大写
 */
function capitalize(str: string): string {
	return str.charAt(0).toUpperCase() + str.slice(1)
}

/**
 * 包装 signal 调用
 */
function wrapSignalCall(content: string): string {
	if (!content) return ''
	// 简单的标识符，可能是 signal
	if (/^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(content)) {
		if (!content.includes('(')) {
			return `${content}()`
		}
	}
	return content
}