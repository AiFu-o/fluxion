/**
 * if/elif/else 转换插件
 * 将 if 节点转换为三元表达式
 */

import {
	NodeTypes,
	IfNode,
	IfBranchNode,
	TemplateChildNode,
	TransformContext,
	JSConditionalExpression,
	SimpleExpressionNode
} from '../types'
import {
	createConditionalExpression,
	createSimpleExpression,
	isIfNode
} from '../ast'
import { warn } from '@fluxion/shared'

/**
 * if 转换插件
 *
 * 将：
 * if loading
 *     p loading...
 * else
 *     p loaded
 *
 * 转换为：
 * loading() ? h("p", "loading...") : h("p", "loaded")
 */
export function transformIf(node: TemplateChildNode, context: TransformContext) {
	if (!isIfNode(node)) {
		return
	}

	// 处理 if 节点
	processIf(node, context)
}

/**
 * 处理 if 节点
 */
function processIf(node: IfNode, context: TransformContext) {
	const { branches } = node

	// 校验分支
	if (branches.length === 0) {
		warn('transformIf: if 节点没有分支')
		return
	}

	// 生成条件表达式
	const codegenNode = createIfCodegen(node, context)

	if (codegenNode) {
		node.codegenNode = codegenNode
	}
}

/**
 * 创建 if 的代码生成节点
 */
function createIfCodegen(
	node: IfNode,
	context: TransformContext
): JSConditionalExpression | SimpleExpressionNode | undefined {
	const { branches } = node

	// 从最后一个分支开始构建
	let currentBranch = branches[branches.length - 1]

	// 最后一个分支（else 或最后一个 elif）
	let alternate = createBranchCodegen(currentBranch, context)

	// 从后往前构建三元表达式
	for (let i = branches.length - 2; i >= 0; i--) {
		const branch = branches[i]

		// 创建条件表达式
		alternate = createConditionalExpression(
			createConditionCodegen(branch, context),
			createBranchCodegen(branch, context),
			alternate,
			true
		)
	}

	return alternate as JSConditionalExpression
}

/**
 * 创建条件表达式的测试部分
 */
function createConditionCodegen(
	branch: IfBranchNode,
	context: TransformContext
): SimpleExpressionNode {
	if (!branch.condition) {
		// else 分支不应该有条件
		warn('transformIf: if 分支缺少条件')
		return createSimpleExpression('true', false)
	}

	// 如果条件是简单表达式，需要加上 () 调用（signal）
	const condition = branch.condition

	// 返回条件表达式
	// 注意：signal 变量需要加 () 来获取值
	// 这里我们假设条件表达式已经正确处理
	return createSimpleExpression(
		wrapSignalCall(condition.content),
		false
	)
}

/**
 * 创建分支的代码生成节点
 */
function createBranchCodegen(
	branch: IfBranchNode,
	context: TransformContext
): SimpleExpressionNode {
	// 如果分支只有一个子节点
	if (branch.children.length === 1) {
		const child = branch.children[0]
		// 元素节点应该已经有 codegenNode
		if (child.type === NodeTypes.ELEMENT && (child as any).codegenNode) {
			return (child as any).codegenNode
		}
	}

	// 多个子节点或没有 codegenNode，返回一个占位符
	// 实际的代码生成会在 codegen 阶段处理
	return createSimpleExpression(
		`/* branch with ${branch.children.length} children */`,
		false
	)
}

/**
 * 包装 signal 调用
 * 将 count 转换为 count()
 */
function wrapSignalCall(content: string): string {
	// 简单的标识符，可能是 signal
	if (/^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(content)) {
		// 检查是否已经包含函数调用
		if (!content.includes('(')) {
			return `${content}()`
		}
	}
	return content
}

/**
 * 检查节点是否为有效的 if 分支
 */
export function isValidIfBranch(node: any): boolean {
	return node?.type === NodeTypes.IF_BRANCH
}

/**
 * 获取 if 分支的类型
 */
export function getIfBranchType(branch: IfBranchNode): 'if' | 'elif' | 'else' {
	if (!branch.condition) {
		return 'else'
	}
	return 'if' // elif 和 if 在 AST 中是一样的，区别在于位置
}