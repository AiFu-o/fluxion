/**
 * NUI 模板解析器
 * 解析 view 块的缩进式语法
 */

import {
	Token,
	TokenType,
	ParserState,
	NuiCompilerError,
	NuiErrorCodes,
	ViewBlock,
	NuiNodeTypes
} from '../types'
import {
	NodeTypes,
	ElementTypes,
	SourceLocation,
	Position,
	TemplateChildNode,
	ElementNode,
	TextNode,
	InterpolationNode,
	IfNode,
	IfBranchNode,
	ForNode,
	AttributeNode,
	DirectiveNode,
	SimpleExpressionNode
} from '@fluxion/compiler-core'
import {
	createPosition,
	createSourceLocation,
	createElementNode,
	createTextNode,
	createInterpolationNode,
	createAttributeNode,
	createDirectiveNode,
	createSimpleExpression,
	createIfNode,
	createIfBranchNode,
	createForNode
} from '@fluxion/compiler-core'
import { isNativeTag } from '@fluxion/compiler-dom'
import {
	initParserState,
	currentToken,
	advance,
	isTokenType,
	expectToken,
	skipNewlines
} from './statement'

// ==================== 工具函数 ====================

/**
 * 判断标识符是否是有效的元素标签
 * HTML 标签或组件（以大写字母开头）
 */
function isValidElementTag(name: string): boolean {
	// 组件：以大写字母开头
	if (/^[A-Z]/.test(name)) {
		return true
	}
	// HTML 标签
	return isNativeTag(name)
}

/**
 * 创建编译错误
 */
function createError(
	code: NuiErrorCodes,
	message: string,
	loc?: SourceLocation
): NuiCompilerError {
	const error = new SyntaxError(message) as NuiCompilerError
	error.code = code
	error.loc = loc
	return error
}

// ==================== 属性解析 ====================

/**
 * 读取完整的表达式（支持函数调用）
 * 例如：switchTab("counter") 或 reset 或 counter + 1
 */
function readExpression(state: ParserState): string {
	let expr = ''
	let parenDepth = 0 // 括号嵌套深度

	while (currentToken(state) && !isTokenType(state, TokenType.NEWLINE)) {
		const token = currentToken(state)!

		// 遇到 INDENT 或 DEDENT 停止
		if (token.type === TokenType.INDENT || token.type === TokenType.DEDENT) {
			break
		}

		// 跟踪括号深度
		if (token.type === TokenType.LPAREN) {
			parenDepth++
		} else if (token.type === TokenType.RPAREN) {
			parenDepth--
		}

		// 如果括号深度为 0 且遇到逗号，可能是下一个属性的分隔符
		if (parenDepth === 0 && token.type === TokenType.COMMA) {
			break
		}

		// 将 token 值添加到表达式
		// 字符串 token 需要加引号
		if (token.type === TokenType.STRING) {
			// 在函数参数中需要加引号
			expr += `"${token.value}"`
		} else {
			expr += token.value
		}
		advance(state)

		// 如果括号深度归零且遇到某些 token，检查是否应该停止
		if (parenDepth === 0) {
			// 检查下一个 token，如果是属性开始符号（@ 或标识符后跟 =），停止
			const next = currentToken(state)
			if (next) {
				if (next.type === TokenType.AT) {
					// 下一个是 @event 指令，停止
					break
				}
				if (next.type === TokenType.IDENTIFIER) {
					// 检查是否是 name=value 形式的属性
					const savedIndex = state.index
					advance(state)
					if (isTokenType(state, TokenType.EQUALS)) {
						// 这是一个新属性，回退并停止
						state.index = savedIndex
						state.currentToken = next
						break
					}
					// 不是属性，继续，但需要恢复状态
					state.index = savedIndex
					state.currentToken = next
				}
			}
		}
	}

	return expr.trim()
}

/**
 * 解析元素属性
 * 支持：name=value, name="value", @event=handler, @event=func(arg)
 */
function parseElementProps(
	state: ParserState
): Array<AttributeNode | DirectiveNode> {
	const props: Array<AttributeNode | DirectiveNode> = []

	while (currentToken(state) && !isTokenType(state, TokenType.NEWLINE)) {
		const token = currentToken(state)!

		// @event=handler 指令
		if (token.type === TokenType.AT) {
			const atToken = token
			advance(state) // 跳过 @

			// 读取事件名
			if (!isTokenType(state, TokenType.IDENTIFIER)) {
				state.errors.push(createError(
					NuiErrorCodes.INVALID_VIEW_SYNTAX,
					'事件指令需要指定事件名',
					currentToken(state)?.loc
				))
				break
			}
			const eventName = currentToken(state)!.value
			advance(state)

			// 期望 '='
			if (!isTokenType(state, TokenType.EQUALS)) {
				state.errors.push(createError(
					NuiErrorCodes.INVALID_VIEW_SYNTAX,
					'事件指令需要 "="',
					currentToken(state)?.loc
				))
				break
			}
			advance(state)

			// 读取完整的处理函数表达式（支持函数调用）
			const handler = readExpression(state)

			if (!handler) {
				state.errors.push(createError(
					NuiErrorCodes.INVALID_VIEW_SYNTAX,
					'事件指令需要指定处理函数',
					currentToken(state)?.loc
				))
				break
			}

			// 创建指令节点
			props.push(createDirectiveNode(
				'on', // 事件指令名
				handler,
				eventName,
				[],
				atToken.loc
			))
			continue
		}

		// name=value 属性
		if (token.type === TokenType.IDENTIFIER) {
			const attrName = token.value
			advance(state)

			// 检查是否有值
			if (isTokenType(state, TokenType.EQUALS)) {
				advance(state) // 跳过 '='

				// 检查第一个 token 是否是字符串
				const firstToken = currentToken(state)
				const isStaticValue = firstToken?.type === TokenType.STRING

				// 读取属性值（只读一个 token）
				let attrValue = ''
				const valueToken = currentToken(state)

				if (valueToken?.type === TokenType.STRING) {
					attrValue = valueToken.value
					advance(state)
				} else if (valueToken?.type === TokenType.IDENTIFIER) {
					attrValue = valueToken.value
					advance(state)
				} else if (valueToken?.type === TokenType.NUMBER) {
					attrValue = valueToken.value
					advance(state)
				}

				// 创建属性节点，标记是否为静态值
				const attr = createAttributeNode(
					attrName,
					attrValue,
					token.loc
				)
				// 使用自定义属性标记静态值
				;(attr as any).isStatic = isStaticValue
				props.push(attr)
				continue
			} else {
				// 没有 '=' 表示这不是属性，可能是文本内容
				// 回退并停止解析属性
				state.index--
				state.currentToken = token
				break
			}
		}

		// 无法识别的 Token，跳过
		break
	}

	return props
}

// ==================== 文本解析 ====================

/**
 * 解析文本行
 * 可能包含纯文本或插值表达式
 * 例如：hello {name}! 或 Count: {count}
 */
function parseTextLine(
	state: ParserState
): Array<TextNode | InterpolationNode> {
	const nodes: Array<TextNode | InterpolationNode> = []
	let textContent = ''

	// 记录起始位置
	const startLoc = currentToken(state)?.loc

	// 读取直到换行或文件结束
	while (
		currentToken(state) &&
		!isTokenType(state, TokenType.NEWLINE) &&
		!isTokenType(state, TokenType.EOF)
	) {
		const token = currentToken(state)!

		// 标识符可能是文本的一部分
		if (token.type === TokenType.IDENTIFIER) {
			if (textContent) {
				textContent += ' '
			}
			textContent += token.value
			advance(state)
			continue
		}

		// 字符串
		if (token.type === TokenType.STRING) {
			if (textContent) {
				textContent += ' '
			}
			textContent += token.value
			advance(state)
			continue
		}

		// 数字
		if (token.type === TokenType.NUMBER) {
			if (textContent) {
				textContent += ' '
			}
			textContent += token.value
			advance(state)
			continue
		}

		// 其他 Token 视为文本的一部分或跳过
		break
	}

	// 处理文本内容中的插值
	// 这里简化处理：将整个文本作为一个文本节点
	// 后续在 codegen 阶段处理插值
	if (textContent) {
		nodes.push(createTextNode(textContent, startLoc || undefined))
	}

	return nodes
}

// ==================== 元素解析 ====================

/**
 * 解析元素
 * tag [props...]
 */
function parseElement(
	state: ParserState,
	indentLevel: number
): ElementNode | null {
	const startToken = currentToken(state)
	if (!startToken || startToken.type !== TokenType.IDENTIFIER) {
		return null
	}

	const tagName = startToken.value

	// 检查是否是有效的元素标签
	// 如果不是 HTML 标签也不是组件（大写开头），返回 null
	if (!isValidElementTag(tagName)) {
		return null
	}

	advance(state)

	// 解析属性
	const props = parseElementProps(state)

	// 创建元素节点
	const element = createElementNode(
		tagName,
		props,
		[],
		startToken.loc
	)

	return element
}

// ==================== 控制流解析 ====================

/**
 * 解析 if 语句
 * if condition
 *     ...
 * elif condition
 *     ...
 * else
 *     ...
 */
function parseIfStatement(
	state: ParserState,
	indentLevel: number
): IfNode | null {
	const startToken = currentToken(state)
	if (!startToken || startToken.type !== TokenType.IF) {
		return null
	}

	const branches: IfBranchNode[] = []

	// 解析 if 分支
	advance(state) // 跳过 if

	// 读取条件表达式
	let condition = ''
	while (
		currentToken(state) &&
		!isTokenType(state, TokenType.NEWLINE) &&
		!isTokenType(state, TokenType.INDENT) &&
		!isTokenType(state, TokenType.EOF)
	) {
		condition += currentToken(state)!.value
		advance(state)
	}

	// 跳过换行
	skipNewlines(state)

	// 期望缩进
	if (!isTokenType(state, TokenType.INDENT)) {
		state.errors.push(createError(
			NuiErrorCodes.INVALID_VIEW_SYNTAX,
			'if 语句后需要缩进',
			currentToken(state)?.loc
		))
		return null
	}
	advance(state) // 跳过 INDENT

	// 解析 if 分支的子节点
	const ifChildren = parseChildren(state, indentLevel + 1)

	branches.push(createIfBranchNode(
		ifChildren,
		condition ? createSimpleExpression(condition, false) : undefined,
		startToken.loc
	))

	// 解析 elif 分支
	while (isTokenType(state, TokenType.ELIF)) {
		advance(state) // 跳过 elif

		// 读取条件表达式
		let elifCondition = ''
		while (
			currentToken(state) &&
			!isTokenType(state, TokenType.NEWLINE) &&
			!isTokenType(state, TokenType.INDENT) &&
			!isTokenType(state, TokenType.EOF)
		) {
			elifCondition += currentToken(state)!.value
			advance(state)
		}

		// 跳过换行
		skipNewlines(state)

		// 期望缩进
		if (!isTokenType(state, TokenType.INDENT)) {
			state.errors.push(createError(
				NuiErrorCodes.INVALID_VIEW_SYNTAX,
				'elif 语句后需要缩进',
				currentToken(state)?.loc
			))
			break
		}
		advance(state) // 跳过 INDENT

		// 解析 elif 分支的子节点
		const elifChildren = parseChildren(state, indentLevel + 1)

		branches.push(createIfBranchNode(
			elifChildren,
			elifCondition ? createSimpleExpression(elifCondition, false) : undefined,
			currentToken(state)?.loc
		))
	}

	// 解析 else 分支
	if (isTokenType(state, TokenType.ELSE)) {
		advance(state) // 跳过 else

		// 跳过换行
		skipNewlines(state)

		// 期望缩进
		if (!isTokenType(state, TokenType.INDENT)) {
			state.errors.push(createError(
				NuiErrorCodes.INVALID_VIEW_SYNTAX,
				'else 语句后需要缩进',
				currentToken(state)?.loc
			))
		} else {
			advance(state) // 跳过 INDENT

			// 解析 else 分支的子节点
			const elseChildren = parseChildren(state, indentLevel + 1)

			branches.push(createIfBranchNode(
				elseChildren,
				undefined, // else 无条件
				currentToken(state)?.loc
			))
		}
	}

	return createIfNode(branches, startToken.loc)
}

/**
 * 解析 for 语句
 * for item in list
 *     ...
 */
function parseForStatement(
	state: ParserState,
	indentLevel: number
): ForNode | null {
	const startToken = currentToken(state)
	if (!startToken || startToken.type !== TokenType.FOR) {
		return null
	}

	advance(state) // 跳过 for

	// 读取迭代变量
	if (!isTokenType(state, TokenType.IDENTIFIER)) {
		state.errors.push(createError(
			NuiErrorCodes.INVALID_VIEW_SYNTAX,
			'for 语句需要指定迭代变量',
			currentToken(state)?.loc
		))
		return null
	}
	const valueAlias = currentToken(state)!.value
	advance(state)

	// 期望 'in'
	if (!isTokenType(state, TokenType.IN)) {
		state.errors.push(createError(
			NuiErrorCodes.FOR_WITHOUT_IN,
			'for 语句需要 "in" 关键词',
			currentToken(state)?.loc
		))
		return null
	}
	advance(state) // 跳过 in

	// 读取源表达式
	let source = ''
	while (
		currentToken(state) &&
		!isTokenType(state, TokenType.NEWLINE) &&
		!isTokenType(state, TokenType.INDENT) &&
		!isTokenType(state, TokenType.EOF)
	) {
		source += currentToken(state)!.value
		advance(state)
	}

	// 跳过换行
	skipNewlines(state)

	// 期望缩进
	if (!isTokenType(state, TokenType.INDENT)) {
		state.errors.push(createError(
			NuiErrorCodes.INVALID_VIEW_SYNTAX,
			'for 语句后需要缩进',
			currentToken(state)?.loc
		))
		return null
	}
	advance(state) // 跳过 INDENT

	// 解析子节点
	const children = parseChildren(state, indentLevel + 1)

	return createForNode(
		createSimpleExpression(source, false),
		valueAlias,
		children,
		undefined, // keyAlias
		undefined, // indexAlias
		startToken.loc
	)
}

// ==================== 子节点解析 ====================

/**
 * 解析行内内容（元素后的文本和插值）
 * 例如：h1 {title} 或 p hello world
 */
function parseInlineContent(state: ParserState): Array<TextNode | InterpolationNode> {
	const nodes: Array<TextNode | InterpolationNode> = []

	// 收集连续的文本内容
	let currentText = ''
	let currentTextLoc: any = null

	// 辅助函数：将收集的文本推送到 nodes
	const flushText = () => {
		if (currentText) {
			nodes.push(createTextNode(currentText, currentTextLoc))
			currentText = ''
			currentTextLoc = null
		}
	}

	while (currentToken(state) && !isTokenType(state, TokenType.EOF)) {
		// 遇到换行、缩进、结束插值，停止
		if (
			isTokenType(state, TokenType.NEWLINE) ||
			isTokenType(state, TokenType.INDENT) ||
			isTokenType(state, TokenType.DEDENT) ||
			isTokenType(state, TokenType.RBRACE)
		) {
			break
		}

		const token = currentToken(state)!

		// 插值表达式 {expr}
		if (token.type === TokenType.LBRACE) {
			// 先刷新已收集的文本
			flushText()

			advance(state) // 跳过 {

			// 读取插值内容
			let expr = ''
			while (
				currentToken(state) &&
				!isTokenType(state, TokenType.RBRACE) &&
				!isTokenType(state, TokenType.NEWLINE) &&
				!isTokenType(state, TokenType.EOF)
			) {
				const t = currentToken(state)!
				expr += t.value
				advance(state)
			}

			// 期望 }
			if (isTokenType(state, TokenType.RBRACE)) {
				advance(state)
			}

			// 创建插值节点
			if (expr) {
				nodes.push(createInterpolationNode(
					createSimpleExpression(expr, false),
					token.loc
				))
			}
			continue
		}

		// 文本类 token：收集到 currentText
		if (
			token.type === TokenType.IDENTIFIER ||
			token.type === TokenType.STRING ||
			token.type === TokenType.NUMBER ||
			token.type === TokenType.COMMA ||
			token.type === TokenType.OPERATOR ||
			token.type === TokenType.DOT
		) {
			// 记录起始位置
			if (!currentTextLoc) {
				currentTextLoc = token.loc
			}
			currentText += token.value
			advance(state)
			continue
		}

		// 其他 token 跳过
		advance(state)
	}

	// 刷新剩余的文本
	flushText()

	return nodes
}

/**
 * 解析子节点
 */
function parseChildren(
	state: ParserState,
	indentLevel: number
): TemplateChildNode[] {
	const children: TemplateChildNode[] = []

	while (currentToken(state) && !isTokenType(state, TokenType.EOF)) {
		// 检查是否到达当前块的结束（DEDENT）
		if (isTokenType(state, TokenType.DEDENT)) {
			advance(state) // 消耗 DEDENT
			break
		}

		// 跳过换行
		if (isTokenType(state, TokenType.NEWLINE)) {
			advance(state)
			continue
		}

		// 跳过额外的 INDENT
		if (isTokenType(state, TokenType.INDENT)) {
			advance(state)
			continue
		}

		const token = currentToken(state)!

		// if 语句
		if (token.type === TokenType.IF) {
			const ifNode = parseIfStatement(state, indentLevel)
			if (ifNode) {
				children.push(ifNode)
			}
			continue
		}

		// elif/else 不应该单独出现
		if (token.type === TokenType.ELIF || token.type === TokenType.ELSE) {
			state.errors.push(createError(
				token.type === TokenType.ELIF
					? NuiErrorCodes.ELIF_WITHOUT_IF
					: NuiErrorCodes.ELSE_WITHOUT_IF,
				`${token.type === TokenType.ELIF ? 'elif' : 'else'} 必须紧跟在 if 或 elif 之后`,
				token.loc
			))
			advance(state)
			continue
		}

		// for 语句
		if (token.type === TokenType.FOR) {
			const forNode = parseForStatement(state, indentLevel)
			if (forNode) {
				children.push(forNode)
			}
			continue
		}

		// 元素或文本
		if (token.type === TokenType.IDENTIFIER) {
			// 检查是否是有效的元素标签
			if (isValidElementTag(token.value)) {
				const element = parseElement(state, indentLevel)
				if (element) {
					// 先解析同一行的文本/插值内容
					const inlineChildren = parseInlineContent(state)

					// 如果元素是组件（大写开头）、没有属性、且有行内文本内容
					// 则将整个行作为文本处理（用户想写的是文本，不是组件）
					if (/^[A-Z]/.test(element.tag) &&
					    element.props.length === 0 &&
					    inlineChildren.length > 0) {
						// 将标签名作为文本的一部分
						const textNodes = [createTextNode(element.tag, element.loc), ...inlineChildren]
						children.push(...textNodes)
						continue
					}

					if (inlineChildren.length > 0) {
						element.children = inlineChildren
					}

					// 检查是否有嵌套子节点（下一个 Token 是 INDENT）
					skipNewlines(state)
					if (isTokenType(state, TokenType.INDENT)) {
						advance(state) // 消耗 INDENT
						const elementChildren = parseChildren(state, indentLevel + 1)
						// 合并嵌套子节点
						if (elementChildren.length > 0) {
							if (element.children && element.children.length > 0) {
								// 如果已有行内内容，合并
								element.children = [...element.children, ...elementChildren]
							} else {
								element.children = elementChildren
							}
						}
					}
					children.push(element)
				}
			} else {
				// 不是有效的元素标签，作为文本处理
				// 收集同一行的所有文本内容
				const textNodes = parseInlineContent(state)
				children.push(...textNodes)
			}
			continue
		}

		// 插值表达式 {expr} 作为独立的子节点
		if (token.type === TokenType.LBRACE) {
			advance(state) // 跳过 {

			// 读取插值内容
			let expr = ''
			while (
				currentToken(state) &&
				!isTokenType(state, TokenType.RBRACE) &&
				!isTokenType(state, TokenType.NEWLINE) &&
				!isTokenType(state, TokenType.EOF)
			) {
				const t = currentToken(state)!
				expr += t.value
				advance(state)
			}

			// 期望 }
			if (isTokenType(state, TokenType.RBRACE)) {
				advance(state)
			}

			// 创建插值节点
			if (expr) {
				children.push(createInterpolationNode(
					createSimpleExpression(expr, false),
					token.loc
				))
			}
			continue
		}

		// 文本类 token：收集连续的文本
		if (
			token.type === TokenType.IDENTIFIER ||
			token.type === TokenType.NUMBER ||
			token.type === TokenType.STRING ||
			token.type === TokenType.COMMA ||
			token.type === TokenType.OPERATOR ||
			token.type === TokenType.DOT
		) {
			let textContent = ''
			let textLoc: any = token.loc

			// 收集连续的文本 token
			while (currentToken(state)) {
				const t = currentToken(state)!
				if (
					t.type === TokenType.IDENTIFIER ||
					t.type === TokenType.NUMBER ||
					t.type === TokenType.STRING ||
					t.type === TokenType.COMMA ||
					t.type === TokenType.OPERATOR ||
					t.type === TokenType.DOT
				) {
					textContent += t.value
					advance(state)
				} else {
					break
				}
			}

			if (textContent) {
				children.push(createTextNode(textContent, textLoc))
			}
			continue
		}

		// 无法识别的 Token，跳过
		advance(state)
	}

	return children
}

// ==================== View 块解析 ====================

/**
 * 解析 view 块
 */
export function parseViewBlock(tokens: Token[]): {
	view: ViewBlock | null
	errors: NuiCompilerError[]
} {
	const state = initParserState(tokens)

	// 找到 view 关键词
	let foundView = false
	while (currentToken(state) && !isTokenType(state, TokenType.EOF)) {
		if (isTokenType(state, TokenType.VIEW)) {
			foundView = true
			advance(state) // 跳过 view
			break
		}
		advance(state)
	}

	if (!foundView) {
		return {
			view: null,
			errors: []
		}
	}

	// 跳过换行
	skipNewlines(state)

	// 期望 INDENT
	if (!isTokenType(state, TokenType.INDENT)) {
		state.errors.push(createError(
			NuiErrorCodes.INVALID_VIEW_SYNTAX,
			'view 块后需要缩进',
			currentToken(state)?.loc
		))
		return {
			view: null,
			errors: state.errors
		}
	}
	advance(state) // 跳过 INDENT

	// 解析子节点
	const children = parseChildren(state, 1)

	const viewBlock: ViewBlock = {
		type: NuiNodeTypes.VIEW_BLOCK,
		children,
		loc: {
			start: { offset: 0, line: 1, column: 1 },
			end: { offset: 0, line: 1, column: 1 },
			source: ''
		}
	}

	return {
		view: viewBlock,
		errors: state.errors
	}
}