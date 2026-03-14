/**
 * NUI 模块代码生成器
 * 将 NUI AST 转换为 JavaScript 模块代码
 */

import {
	NuiRootNode,
	ImportDeclaration,
	SignalDeclaration,
	FunctionDeclaration,
	ViewBlock,
	StyleBlock,
	NuiCompileResult
} from '../types'
import {
	NodeTypes,
	ElementNode,
	TextNode,
	InterpolationNode,
	IfNode,
	ForNode,
	TemplateChildNode,
	RootNode,
	createRoot
} from '@fluxion/compiler-core'
import { isNativeTag } from '@fluxion/compiler-dom'
import { warn } from '@fluxion/shared'

// ==================== 代码生成上下文 ====================

/**
 * 代码生成上下文
 */
interface ModuleCodegenContext {
	// 生成的代码
	code: string
	// 缩进级别
	indentLevel: number
}

/**
 * 创建代码生成上下文
 */
function createModuleCodegenContext(): ModuleCodegenContext {
	return {
		code: '',
		indentLevel: 0
	}
}

// ==================== 缩进辅助 ====================

/**
 * 获取缩进字符串
 */
function indent(level: number): string {
	return '\t'.repeat(level)
}

// ==================== Import 代码生成 ====================

/**
 * 生成用户 import 语句
 */
function genImportDeclaration(
	decl: ImportDeclaration,
	ctx: ModuleCodegenContext
): void {
	ctx.code += `import ${decl.identifier} from "${decl.source}"\n`
}

/**
 * 生成运行时 import 语句
 */
function genRuntimeImports(
	signals: SignalDeclaration[],
	functions: FunctionDeclaration[],
	view: ViewBlock | null,
	ctx: ModuleCodegenContext
): void {
	const imports: Set<string> = new Set()

	// signal 相关
	if (signals.length > 0) {
		imports.add('signal')
		// 检查是否有 asyncSignal
		if (signals.some(s => s.isAsync)) {
			imports.add('asyncSignal')
		}
	}

	// render 相关
	if (view) {
		imports.add('h')
	}

	// emit 相关（检查函数体是否包含 emit）
	for (const fn of functions) {
		if (fn.body.includes('emit(')) {
			imports.add('emit')
		}
	}

	if (imports.size > 0) {
		ctx.code += `import { ${Array.from(imports).join(', ')} } from "fluxion-runtime"\n`
	}
}

// ==================== Signal 代码生成 ====================

/**
 * 生成 signal 声明
 */
function genSignalDeclaration(
	decl: SignalDeclaration,
	ctx: ModuleCodegenContext
): void {
	const keyword = decl.isAsync ? 'asyncSignal' : 'signal'
	ctx.code += `const ${decl.name} = ${keyword}(${decl.initExpression})\n`
}

// ==================== Function 代码生成 ====================

/**
 * 生成函数声明
 */
function genFunctionDeclaration(
	decl: FunctionDeclaration,
	ctx: ModuleCodegenContext
): void {
	ctx.code += `function ${decl.name}(${decl.params.join(', ')}) { ${decl.body} }\n`
}

// ==================== Render 函数代码生成 ====================

/**
 * 生成元素节点代码
 */
function genElementNode(
	node: ElementNode,
	ctx: ModuleCodegenContext,
	indentLevel: number
): string {
	const indentStr = indent(indentLevel)
	const isComponent = !isNativeTag(node.tag)

	// 构建参数
	const args: string[] = []

	// 第一个参数：标签名或组件
	if (isComponent) {
		args.push(node.tag) // 组件直接使用标识符
	} else {
		args.push(`"${node.tag}"`) // 原生标签使用字符串
	}

	// 第二个参数：props
	if (node.props.length > 0) {
		const propsObj = genPropsObject(node)
		args.push(propsObj)
	}

	// 第三个参数：children
	if (node.children.length > 0) {
		// 检查是否所有子节点都是文本节点（没有插值）
		const allText = node.children.every(
			child => child.type === NodeTypes.TEXT
		)

		if (allText) {
			// 合并所有文本为一个字符串
			const combinedText = (node.children as TextNode[])
				.map(child => child.content)
				.join(' ')
			args.push(`"${combinedText}"`)
		} else if (node.children.length === 1) {
			const childCode = genChildNode(node.children[0], ctx, indentLevel)
			args.push(childCode)
		} else {
			// 混合内容：文本和插值
			// 需要处理文本节点之间的空格
			const childrenParts: string[] = []
			for (let i = 0; i < node.children.length; i++) {
				const child = node.children[i]
				const childCode = genChildNode(child, ctx, indentLevel)

				// 如果当前是文本节点，且前一个也是文本节点，需要添加空格连接
				if (child.type === NodeTypes.TEXT && i > 0) {
					const prevChild = node.children[i - 1]
					if (prevChild.type === NodeTypes.TEXT) {
						// 两个相邻的文本节点，用 + 连接并添加空格
						// 但由于我们分别处理，这里不需要额外处理
						// 因为每个文本节点已经用引号包裹
					}
				}

				childrenParts.push(childCode)
			}
			args.push(`[${childrenParts.join(', ')}]`)
		}
	}

	// 生成 h 调用
	if (args.length === 1) {
		return `h(${args[0]})`
	} else if (args.length === 2) {
		return `h(${args[0]}, ${args[1]})`
	} else {
		return `h(${args[0]}, ${args[1]}, ${args[2]})`
	}
}

/**
 * 生成 props 对象代码
 */
function genPropsObject(node: ElementNode): string {
	const props: string[] = []

	for (const prop of node.props) {
		if (prop.type === NodeTypes.ATTRIBUTE) {
			// 普通属性
			if (prop.value) {
				const value = prop.value.content
				// 检查是否标记为静态值（字符串字面量）
				const isStatic = (prop as any).isStatic
				if (isStatic) {
					// 静态字符串值，加引号
					props.push(`${prop.name}: "${value}"`)
				} else if (/^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(value)) {
					// 标识符（变量引用），直接使用
					props.push(`${prop.name}: ${value}`)
				} else {
					// 其他情况，加引号
					props.push(`${prop.name}: "${value}"`)
				}
			} else {
				props.push(`${prop.name}: true`)
			}
		} else if (prop.type === NodeTypes.DIRECTIVE) {
			// 指令（主要是事件）
			if (prop.name === 'on' && prop.arg) {
				const eventName = (prop.arg as any).content || prop.arg
				const handler = prop.exp ? (prop.exp as any).content : 'undefined'
				// 转换事件名：click -> onClick
				const handlerName = `on${eventName.charAt(0).toUpperCase()}${eventName.slice(1)}`
				props.push(`${handlerName}: ${handler}`)
			}
		}
	}

	if (props.length === 0) {
		return 'null'
	}

	return `{ ${props.join(', ')} }`
}

/**
 * 生成子节点代码
 */
function genChildNode(
	node: TemplateChildNode,
	ctx: ModuleCodegenContext,
	indentLevel: number
): string {
	switch (node.type) {
		case NodeTypes.ELEMENT:
			return genElementNode(node as ElementNode, ctx, indentLevel)

		case NodeTypes.TEXT:
			const textContent = (node as TextNode).content
			// 处理插值表达式 {xxx}
			return genTextWithInterpolation(textContent)

		case NodeTypes.INTERPOLATION:
			const exp = (node as InterpolationNode).content
			const exprContent = (exp as any).content || ''
			// 如果是简单标识符，添加 () 来调用 signal
			if (/^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(exprContent)) {
				return `${exprContent}()`
			}
			return exprContent

		case NodeTypes.IF:
			return genIfNode(node as IfNode, ctx, indentLevel)

		case NodeTypes.FOR:
			return genForNode(node as ForNode, ctx, indentLevel)

		default:
			return 'null'
	}
}

/**
 * 处理包含插值表达式的文本
 * 例如：hello {name}! -> ["hello ", name(), "!"]
 * 根据设计文档，{count} 被转换为 count() 来读取 signal 的值
 */
function genTextWithInterpolation(text: string): string {
	// 检查是否包含插值
	if (!text.includes('{')) {
		return `"${text}"`
	}

	// 解析插值表达式
	const parts: string[] = []
	let lastIndex = 0
	const regex = /\{([^}]+)\}/g
	let match

	while ((match = regex.exec(text)) !== null) {
		// 添加前面的文本
		if (match.index > lastIndex) {
			parts.push(`"${text.slice(lastIndex, match.index)}"`)
		}
		// 添加插值表达式，转换为 signal 调用
		// 根据设计文档：{count} → count()
		const expr = match[1].trim()
		// 如果是简单标识符，添加 () 调用
		if (/^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(expr)) {
			parts.push(`${expr}()`)
		} else {
			// 复杂表达式，保持原样（可能已经包含函数调用）
			parts.push(expr)
		}
		lastIndex = match.index + match[0].length
	}

	// 添加剩余的文本
	if (lastIndex < text.length) {
		parts.push(`"${text.slice(lastIndex)}"`)
	}

	if (parts.length === 1) {
		return parts[0]
	}

	return `[${parts.join(', ')}]`
}

/**
 * 将条件表达式中的 Signal 标识符转换为函数调用
 * 例如：loading -> loading()
 * 例如：status == "loading" -> status() == "loading"
 */
function convertSignalAccess(condition: string): string {
	// 处理比较操作符周围的标识符
	// 匹配模式：标识符（不在引号内）后面跟着操作符
	const operators = ['==', '!=', '===', '!==', '<', '>', '<=', '>=', '&&', '||']

	let result = condition

	// 简单方法：将独立的标识符转换为函数调用
	// 匹配：单词边界开始的标识符，后面不是 ( （说明不是函数调用）
	result = result.replace(/\b([a-zA-Z_$][a-zA-Z0-9_$]*)\b(?!\()/g, (match, ident) => {
		// 排除关键字和字面量
		const keywords = ['true', 'false', 'null', 'undefined', 'if', 'else', 'elif', 'for', 'in', 'view', 'style']
		if (keywords.includes(ident)) {
			return ident
		}
		return `${ident}()`
	})

	return result
}

/**
 * 生成 if 节点代码
 */
function genIfNode(
	node: IfNode,
	ctx: ModuleCodegenContext,
	indentLevel: number
): string {
	const branches = node.branches

	if (branches.length === 0) {
		return 'null'
	}

	// 生成三元表达式链
	let code = ''

	for (let i = 0; i < branches.length; i++) {
		const branch = branches[i]

		if (branch.condition) {
			// if 或 elif 分支
			const rawCondition = (branch.condition as any).content
			// 将条件中的 Signal 标识符转换为函数调用
			const condition = convertSignalAccess(rawCondition)
			const consequent = genBranchChildren(branch.children, ctx, indentLevel)

			if (i === 0) {
				// 第一个分支
				code = `${condition} ? ${consequent}`
			} else {
				// 后续分支
				code += ` : ${condition} ? ${consequent}`
			}
		} else {
			// else 分支
			const alternate = genBranchChildren(branch.children, ctx, indentLevel)
			code += ` : ${alternate}`
		}
	}

	return code
}

/**
 * 生成分支子节点代码
 */
function genBranchChildren(
	children: TemplateChildNode[],
	ctx: ModuleCodegenContext,
	indentLevel: number
): string {
	if (children.length === 0) {
		return 'null'
	}

	if (children.length === 1) {
		return genChildNode(children[0], ctx, indentLevel)
	}

	const childrenCode = children
		.map(child => genChildNode(child, ctx, indentLevel))
		.join(', ')
	return `[${childrenCode}]`
}

/**
 * 生成 for 节点代码
 */
function genForNode(
	node: ForNode,
	ctx: ModuleCodegenContext,
	indentLevel: number
): string {
	const source = node.source.content
	const valueAlias = node.valueAlias
	const children = node.children

	// 生成 map 回调
	const childrenCode = genBranchChildren(children, ctx, indentLevel + 1)

	return `${source}().map(${valueAlias} => ${childrenCode})`
}

/**
 * 生成 render 函数
 */
function genRenderFunction(
	view: ViewBlock,
	ctx: ModuleCodegenContext
): void {
	ctx.code += 'function render() {\n'
	ctx.code += '\treturn '

	if (view.children.length === 0) {
		ctx.code += 'null'
	} else if (view.children.length === 1) {
		ctx.code += genChildNode(view.children[0], ctx, 1)
	} else {
		const childrenCode = view.children
			.map(child => genChildNode(child, ctx, 1))
			.join(',\n\t\t')
		ctx.code += `[\n\t\t${childrenCode}\n\t]`
	}

	ctx.code += '\n}\n'
}

// ==================== Style 代码生成 ====================

/**
 * 生成 style 块
 * 将 CSS 内容注入到文档中
 */
function genStyleBlock(
	style: StyleBlock,
	ctx: ModuleCodegenContext
): void {
	if (!style.content.trim()) {
		return
	}

	// 生成一个唯一的 style ID（基于内容 hash）
	const styleId = `style_${Buffer.from(style.content).toString('base64').slice(0, 8)}`

	// 生成注入样式表的代码
	ctx.code += `\n// 注入样式\n`
	ctx.code += `;(function() {\n`
	ctx.code += `\tif (typeof document !== 'undefined') {\n`
	ctx.code += `\t\tconst style = document.getElementById('${styleId}')\n`
	ctx.code += `\t\tif (!style) {\n`
	ctx.code += `\t\t\tconst el = document.createElement('style')\n`
	ctx.code += `\t\t\tel.id = '${styleId}'\n`
	ctx.code += `\t\t\tel.textContent = \`${style.content.replace(/`/g, '\\`').replace(/\$/g, '\\$')}\`\n`
	ctx.code += `\t\t\tdocument.head.appendChild(el)\n`
	ctx.code += `\t\t}\n`
	ctx.code += `\t}\n`
	ctx.code += `})()\n`
}

// ==================== 主入口 ====================

/**
 * 生成模块代码
 */
export function generateModule(
	ast: NuiRootNode
): NuiCompileResult {
	const ctx = createModuleCodegenContext()
	const errors = [...ast.imports, ...ast.signals, ...ast.functions]
		.map(() => null)
		.filter(Boolean) || []

	// 1. 生成用户 import 语句
	for (const imp of ast.imports) {
		genImportDeclaration(imp, ctx)
	}

	// 空行
	if (ast.imports.length > 0) {
		ctx.code += '\n'
	}

	// 2. 生成运行时 import 语句
	genRuntimeImports(ast.signals, ast.functions, ast.view, ctx)

	// 空行
	if (ast.signals.length > 0 || ast.functions.length > 0 || ast.view) {
		ctx.code += '\n'
	}

	// 3. 生成 signal 声明
	for (const signal of ast.signals) {
		genSignalDeclaration(signal, ctx)
	}

	// 空行
	if (ast.signals.length > 0 && ast.functions.length > 0) {
		ctx.code += '\n'
	}

	// 4. 生成 function 定义
	for (const fn of ast.functions) {
		genFunctionDeclaration(fn, ctx)
	}

	// 空行
	if (ast.functions.length > 0 && ast.view) {
		ctx.code += '\n'
	}

	// 5. 生成 render 函数
	if (ast.view) {
		genRenderFunction(ast.view, ctx)
	}

	// 6. 生成 style 块
	if (ast.style) {
		genStyleBlock(ast.style, ctx)
	}

	// 7. 生成默认导出（组件对象）
	if (ast.view) {
		ctx.code += '\nexport default { render }\n'
	}

	// 创建模板 AST（用于后续处理）
	const templateAst: RootNode | null = ast.view
		? createRoot(ast.view.children)
		: null

	return {
		code: ctx.code,
		ast,
		templateAst,
		errors: []
	}
}