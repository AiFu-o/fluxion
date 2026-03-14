/**
 * DOM 元素转换插件
 * 扩展 compiler-core 的 transformElement，添加 DOM 特定处理
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
} from '@fluxion-ui/compiler-core'
import {
	createCallExpression,
	createObjectExpression,
	createSimpleExpression,
	createArrayExpression,
	isElementNode
} from '@fluxion-ui/compiler-core'
import { runtimeHelpers } from '@fluxion-ui/compiler-core'
import { warn } from '@fluxion-ui/shared'
import { isHTMLTag, isSVGTag, isComponentTag } from '../tagConfig'
import {
	DOM_RUNTIME_HELPERS,
	getModifierType
} from '../runtimeHelpers'

/**
 * DOM 特定的属性
 * 这些属性需要直接设置到 DOM 元素上，而不是作为 HTML 属性
 */
const DOM_PROPERTIES = new Set([
	'value', 'checked', 'selected', 'multiple',
	'muted', 'disabled', 'readOnly', 'contentEditable',
	'spellcheck', 'draggable', 'autofocus', 'required',
	'indeterminate', 'defaultChecked', 'defaultValue',
	'innerHTML', 'textContent', 'innerText'
])

/**
 * 布尔值 DOM 属性
 * 这些属性值为布尔类型
 */
const BOOLEAN_DOM_PROPERTIES = new Set([
	'checked', 'selected', 'multiple', 'muted', 'disabled',
	'readOnly', 'contentEditable', 'spellcheck', 'draggable',
	'autofocus', 'required', 'indeterminate'
])

/**
 * 判断是否为 DOM 属性
 * @param name 属性名
 */
export function isDOMProperty(name: string): boolean {
	return DOM_PROPERTIES.has(name)
}

/**
 * 判断是否为布尔值 DOM 属性
 * @param name 属性名
 */
export function isBooleanDOMProperty(name: string): boolean {
	return BOOLEAN_DOM_PROPERTIES.has(name)
}

/**
 * DOM 元素转换插件
 *
 * 扩展 compiler-core 的 transformElement，添加：
 * - 事件修饰符处理
 * - class/style 绑定合并
 * - SVG 元素识别
 * - DOM 属性处理
 */
export function transformElement(node: TemplateChildNode, context: TransformContext) {
	if (!isElementNode(node)) {
		return
	}

	// 返回退出函数，在子节点处理完成后执行
	return () => {
		processElement(node, context)
	}
}

/**
 * 处理元素节点
 */
function processElement(node: ElementNode, context: TransformContext) {
	const { tag } = node

	// 判断元素类型
	const isSVG = isSVGTag(tag)
	const isComponent = isComponentTag(tag)

	// 添加运行时辅助函数
	context.helper(runtimeHelpers.CREATE_ELEMENT_VNODE)

	// 创建代码生成节点
	const codegenNode = createElementCodegen(node, context, { isSVG, isComponent })

	if (codegenNode) {
		node.codegenNode = codegenNode
	}
}

/**
 * 创建元素的代码生成节点
 */
function createElementCodegen(
	node: ElementNode,
	context: TransformContext,
	options: { isSVG: boolean; isComponent: boolean }
): JSCallExpression {
	const { tag, props, children } = node
	const { isSVG, isComponent } = options

	// 创建参数
	const args: (string | JSCallExpression | JSObjectExpression)[] = []

	// 第一个参数：标签名或组件
	if (isComponent) {
		args.push(tag)
		context.components.add(tag)
	} else {
		args.push(`"${tag}"`)
	}

	// 第二个参数：props 对象
	const propsObj = createPropsObject(props, context, { isSVG, isComponent })
	if (propsObj || children.length > 0) {
		if (propsObj) {
			args.push(propsObj)
		} else {
			args.push('null' as any)
		}
	}

	// 第三个参数：children
	if (children.length > 0) {
		const childrenArg = createChildrenArg(children)
		args.push(childrenArg as any)
	}

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
	context: TransformContext,
	options: { isSVG: boolean; isComponent: boolean }
): JSObjectExpression | null {
	if (props.length === 0) {
		return null
	}

	const { isSVG, isComponent } = options
	const properties: Array<{ key: string; value: any }> = []

	// 收集 class 和 style，用于合并
	let staticClass: string | null = null
	let dynamicClass: { key: string; value: any } | null = null
	let staticStyle: string | null = null
	let dynamicStyle: { key: string; value: any } | null = null

	for (const prop of props) {
		if (prop.type === NodeTypes.ATTRIBUTE) {
			// 普通属性
			if (prop.name === 'class') {
				staticClass = prop.value ? prop.value.content : ''
			} else if (prop.name === 'style') {
				staticStyle = prop.value ? prop.value.content : ''
			} else {
				properties.push({
					key: prop.name,
					value: prop.value ? `"${prop.value.content}"` : 'true'
				})
			}
		} else if (prop.type === NodeTypes.DIRECTIVE) {
			// 指令
			if (prop.name === 'bind') {
				// 动态绑定
				if (prop.arg) {
					const argName = prop.arg.content

					if (argName === 'class') {
						dynamicClass = {
							key: 'class',
							value: wrapSignalCall(prop.exp?.content || '')
						}
					} else if (argName === 'style') {
						dynamicStyle = {
							key: 'style',
							value: wrapSignalCall(prop.exp?.content || '')
						}
					} else {
						const directiveProp = processBindDirective(prop, { isSVG, isComponent })
						if (directiveProp) {
							properties.push(directiveProp)
						}
					}
				}
			} else {
				// 事件指令或其他指令
				const directiveProp = processDirective(prop, context)
				if (directiveProp) {
					properties.push(directiveProp)
				}
			}
		}
	}

	// 处理 class 合并
	if (staticClass || dynamicClass) {
		properties.push(processClassBinding(staticClass, dynamicClass, context))
	}

	// 处理 style 合并
	if (staticStyle || dynamicStyle) {
		properties.push(processStyleBinding(staticStyle, dynamicStyle, context))
	}

	if (properties.length === 0) {
		return null
	}

	return createObjectExpression(properties)
}

/**
 * 处理事件指令
 * @click -> onClick
 * @click.stop -> withModifiers(handler, ['stop'])
 */
function processDirective(
	directive: DirectiveNode,
	context: TransformContext
): { key: string; value: any } | null {
	const { name, exp, modifiers } = directive

	// 构建事件处理器
	let handlerValue = exp ? exp.content : '() => {}'

	// 处理修饰符
	const eventModifiers: string[] = []
	const keyModifiers: string[] = []

	for (const modifier of modifiers) {
		const type = getModifierType(modifier)
		if (type === 'event') {
			eventModifiers.push(modifier)
		} else if (type === 'key') {
			keyModifiers.push(modifier)
		}
	}

	// 包装事件修饰符
	if (eventModifiers.length > 0) {
		context.helper(DOM_RUNTIME_HELPERS.WITH_MODIFIERS)
		handlerValue = `withModifiers(${handlerValue}, ["${eventModifiers.join('", "')}"])`
	}

	// 包装按键修饰符
	if (keyModifiers.length > 0) {
		context.helper(DOM_RUNTIME_HELPERS.WITH_KEYS)
		handlerValue = `withKeys(${handlerValue}, ["${keyModifiers.join('", "')}"])`
	}

	return {
		key: `on${capitalize(name)}`,
		value: handlerValue
	}
}

/**
 * 处理 bind 指令
 */
function processBindDirective(
	directive: DirectiveNode,
	options: { isSVG: boolean; isComponent: boolean }
): { key: string; value: any } | null {
	const { arg, exp } = directive
	const { isSVG, isComponent } = options

	if (!arg) {
		warn('transformElement: v-bind 指令缺少参数')
		return null
	}

	const argName = arg.content
	const value = wrapSignalCall(exp?.content || '')

	// DOM 属性处理
	if (!isComponent && isDOMProperty(argName)) {
		// 对于 DOM 属性，直接设置
		return {
			key: argName,
			value
		}
	}

	// SVG 属性处理
	if (isSVG) {
		// SVG 元素的属性需要特殊处理
		return {
			key: argName,
			value
		}
	}

	return {
		key: argName,
		value
	}
}

/**
 * 处理 class 绑定
 * 合并静态 class 和动态 :class
 */
function processClassBinding(
	staticClass: string | null,
	dynamicClass: { key: string; value: any } | null,
	context: TransformContext
): { key: string; value: any } {
	if (staticClass && dynamicClass) {
		// 需要合并
		context.helper(DOM_RUNTIME_HELPERS.NORMALIZE_CLASS)
		return {
			key: 'class',
			value: `normalizeClass(["${staticClass}", ${dynamicClass.value}])`
		}
	} else if (staticClass) {
		return {
			key: 'class',
			value: `"${staticClass}"`
		}
	} else if (dynamicClass) {
		return {
			key: 'class',
			value: dynamicClass.value
		}
	}

	return {
		key: 'class',
		value: '""'
	}
}

/**
 * 处理 style 绑定
 * 合并静态 style 和动态 :style
 */
function processStyleBinding(
	staticStyle: string | null,
	dynamicStyle: { key: string; value: any } | null,
	context: TransformContext
): { key: string; value: any } {
	if (staticStyle && dynamicStyle) {
		// 需要合并
		context.helper(DOM_RUNTIME_HELPERS.NORMALIZE_STYLE)
		return {
			key: 'style',
			value: `normalizeStyle({"${staticStyle.replace(/:/g, '":"').replace(/;/g, '","')}"}， ${dynamicStyle.value})`
		}
	} else if (staticStyle) {
		return {
			key: 'style',
			value: `"${staticStyle}"`
		}
	} else if (dynamicStyle) {
		return {
			key: 'style',
			value: dynamicStyle.value
		}
	}

	return {
		key: 'style',
		value: '""'
	}
}

/**
 * 创建 children 参数
 */
function createChildrenArg(
	children: TemplateChildNode[]
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