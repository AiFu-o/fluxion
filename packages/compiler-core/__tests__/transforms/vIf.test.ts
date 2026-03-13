/**
 * vIf 转换测试
 */

import { describe, it, expect } from 'vitest'
import { transformIf, isValidIfBranch, getIfBranchType } from '../../src/transforms/vIf'
import { createIfNode, createIfBranchNode, createSimpleExpression, createElementNode, createTextNode } from '../../src/ast'
import { NodeTypes, IfNode, IfBranchNode, TransformContext } from '../../src/types'
import { createTransformContext } from '../../src/transform'

describe('transformIf', () => {
	it('应该忽略非 if 节点', () => {
		const text = createTextNode('hello')
		const context = createTransformContext(createRoot())

		// @ts-ignore - 测试用
		transformIf(text, context)

		expect((text as any).codegenNode).toBeUndefined()
	})

	it('应该转换简单的 if 节点', () => {
		const condition = createSimpleExpression('loading', false)
		const branch = createIfBranchNode([createTextNode('loading...')], condition)
		const ifNode = createIfNode([branch])
		const context = createTransformContext(createRoot())

		transformIf(ifNode, context)

		expect(ifNode.codegenNode).toBeDefined()
		expect(ifNode.codegenNode?.type).toBe(NodeTypes.SIMPLE_EXPRESSION)
	})

	it('应该转换 if-else 节点', () => {
		const condition = createSimpleExpression('loading', false)
		const ifBranch = createIfBranchNode([createTextNode('loading...')], condition)
		const elseBranch = createIfBranchNode([createTextNode('done')])
		const ifNode = createIfNode([ifBranch, elseBranch])
		const context = createTransformContext(createRoot())

		transformIf(ifNode, context)

		expect(ifNode.codegenNode).toBeDefined()
		expect(ifNode.codegenNode?.type).toBe(NodeTypes.JS_CONDITIONAL_EXPRESSION)
	})

	it('应该转换 if-elif-else 节点', () => {
		const condition1 = createSimpleExpression('loading', false)
		const condition2 = createSimpleExpression('error', false)
		const ifBranch = createIfBranchNode([createTextNode('loading...')], condition1)
		const elifBranch = createIfBranchNode([createTextNode('error')], condition2)
		const elseBranch = createIfBranchNode([createTextNode('done')])
		const ifNode = createIfNode([ifBranch, elifBranch, elseBranch])
		const context = createTransformContext(createRoot())

		transformIf(ifNode, context)

		expect(ifNode.codegenNode).toBeDefined()
		// 应该是嵌套的条件表达式
		expect(ifNode.codegenNode?.type).toBe(NodeTypes.JS_CONDITIONAL_EXPRESSION)
	})
})

describe('isValidIfBranch', () => {
	it('应该识别有效的分支节点', () => {
		const branch = createIfBranchNode([])
		expect(isValidIfBranch(branch)).toBe(true)
	})

	it('应该拒绝非分支节点', () => {
		expect(isValidIfBranch(null)).toBe(false)
		expect(isValidIfBranch({})).toBe(false)
		expect(isValidIfBranch({ type: NodeTypes.TEXT })).toBe(false)
	})
})

describe('getIfBranchType', () => {
	it('应该识别 if 分支', () => {
		const condition = createSimpleExpression('loading', false)
		const branch = createIfBranchNode([], condition)
		expect(getIfBranchType(branch)).toBe('if')
	})

	it('应该识别 else 分支', () => {
		const branch = createIfBranchNode([])
		expect(getIfBranchType(branch)).toBe('else')
	})
})

// 辅助函数
function createRoot() {
	return {
		type: NodeTypes.ROOT,
		children: [],
		helpers: new Set(),
		components: new Set(),
		directives: new Set(),
		imports: new Set()
	} as any
}