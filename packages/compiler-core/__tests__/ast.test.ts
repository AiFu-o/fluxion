/**
 * AST 节点创建函数测试
 */

import { describe, it, expect } from 'vitest'
import {
	createRoot,
	createElementNode,
	createTextNode,
	createInterpolationNode,
	createAttributeNode,
	createDirectiveNode,
	createIfNode,
	createIfBranchNode,
	createForNode,
	createSimpleExpression,
	createCompoundExpression,
	createCallExpression,
	createObjectExpression,
	createArrayExpression,
	createFunctionExpression,
	createConditionalExpression,
	isElementNode,
	isTextNode,
	isInterpolationNode,
	isIfNode,
	isForNode,
	isSimpleExpressionNode
} from '../src/ast'
import { NodeTypes } from '../src/types'

describe('createRoot', () => {
	it('应该创建空的根节点', () => {
		const root = createRoot()
		expect(root.type).toBe(NodeTypes.ROOT)
		expect(root.children).toEqual([])
		expect(root.helpers.size).toBe(0)
	})

	it('应该创建带子节点的根节点', () => {
		const text = createTextNode('hello')
		const root = createRoot([text])
		expect(root.children.length).toBe(1)
		expect(root.children[0]).toBe(text)
	})
})

describe('createElementNode', () => {
	it('应该创建简单的元素节点', () => {
		const element = createElementNode('div')
		expect(element.type).toBe(NodeTypes.ELEMENT)
		expect(element.tag).toBe('div')
		expect(element.props).toEqual([])
		expect(element.children).toEqual([])
		expect(element.isSelfClosing).toBe(false)
	})

	it('应该创建带属性的元素节点', () => {
		const attr = createAttributeNode('id', 'app')
		const element = createElementNode('div', [attr])
		expect(element.props.length).toBe(1)
		expect(element.props[0].name).toBe('id')
	})

	it('应该创建带子节点的元素节点', () => {
		const text = createTextNode('hello')
		const element = createElementNode('div', [], [text])
		expect(element.children.length).toBe(1)
	})

	it('应该创建自闭合元素节点', () => {
		const element = createElementNode('img', [], [], undefined, true)
		expect(element.isSelfClosing).toBe(true)
	})
})

describe('createTextNode', () => {
	it('应该创建空的文本节点', () => {
		const text = createTextNode()
		expect(text.type).toBe(NodeTypes.TEXT)
		expect(text.content).toBe('')
	})

	it('应该创建带内容的文本节点', () => {
		const text = createTextNode('hello world')
		expect(text.content).toBe('hello world')
	})
})

describe('createInterpolationNode', () => {
	it('应该创建字符串形式的插值节点', () => {
		const interpolation = createInterpolationNode('count')
		expect(interpolation.type).toBe(NodeTypes.INTERPOLATION)
		expect(interpolation.content.content).toBe('count')
	})

	it('应该创建表达式形式的插值节点', () => {
		const expr = createSimpleExpression('count', false)
		const interpolation = createInterpolationNode(expr)
		expect(interpolation.content).toBe(expr)
	})
})

describe('createAttributeNode', () => {
	it('应该创建无值的属性节点', () => {
		const attr = createAttributeNode('disabled')
		expect(attr.type).toBe(NodeTypes.ATTRIBUTE)
		expect(attr.name).toBe('disabled')
		expect(attr.value).toBeNull()
	})

	it('应该创建带值的属性节点', () => {
		const attr = createAttributeNode('id', 'app')
		expect(attr.name).toBe('id')
		expect(attr.value?.content).toBe('app')
	})
})

describe('createDirectiveNode', () => {
	it('应该创建简单的指令节点', () => {
		const directive = createDirectiveNode('click', 'increment')
		expect(directive.type).toBe(NodeTypes.DIRECTIVE)
		expect(directive.name).toBe('click')
		expect(directive.exp?.content).toBe('increment')
	})

	it('应该创建带参数和修饰符的指令节点', () => {
		const directive = createDirectiveNode('bind', 'value', 'name', ['trim'])
		expect(directive.name).toBe('bind')
		expect(directive.arg?.content).toBe('name')
		expect(directive.modifiers).toContain('trim')
	})
})

describe('createIfNode', () => {
	it('应该创建 if 节点', () => {
		const branch = createIfBranchNode([], createSimpleExpression('loading', false))
		const ifNode = createIfNode([branch])
		expect(ifNode.type).toBe(NodeTypes.IF)
		expect(ifNode.branches.length).toBe(1)
	})
})

describe('createIfBranchNode', () => {
	it('应该创建带条件的分支节点', () => {
		const condition = createSimpleExpression('loading', false)
		const branch = createIfBranchNode([], condition)
		expect(branch.type).toBe(NodeTypes.IF_BRANCH)
		expect(branch.condition).toBe(condition)
	})

	it('应该创建 else 分支节点', () => {
		const branch = createIfBranchNode([])
		expect(branch.condition).toBeUndefined()
	})
})

describe('createForNode', () => {
	it('应该创建 for 节点', () => {
		const source = createSimpleExpression('users', false)
		const forNode = createForNode(source, 'user', [])
		expect(forNode.type).toBe(NodeTypes.FOR)
		expect(forNode.valueAlias).toBe('user')
	})

	it('应该创建带 key 和 index 的 for 节点', () => {
		const source = createSimpleExpression('items', false)
		const forNode = createForNode(source, 'item', [], 'key', 'index')
		expect(forNode.keyAlias).toBe('key')
		expect(forNode.indexAlias).toBe('index')
	})
})

describe('createSimpleExpression', () => {
	it('应该创建静态表达式', () => {
		const expr = createSimpleExpression('"hello"', true)
		expect(expr.type).toBe(NodeTypes.SIMPLE_EXPRESSION)
		expect(expr.isStatic).toBe(true)
		expect(expr.content).toBe('"hello"')
	})

	it('应该创建动态表达式', () => {
		const expr = createSimpleExpression('count', false)
		expect(expr.isStatic).toBe(false)
	})
})

describe('createCompoundExpression', () => {
	it('应该创建复合表达式', () => {
		const expr = createCompoundExpression(['Hello, ', createSimpleExpression('name', false), '!'])
		expect(expr.type).toBe(NodeTypes.COMPOUND_EXPRESSION)
		expect(expr.children.length).toBe(3)
	})
})

describe('createCallExpression', () => {
	it('应该创建函数调用表达式', () => {
		const call = createCallExpression('h', ['"div"'])
		expect(call.type).toBe(NodeTypes.JS_CALL_EXPRESSION)
		expect(call.callee).toBe('h')
		expect(call.arguments.length).toBe(1)
	})
})

describe('createObjectExpression', () => {
	it('应该创建对象表达式', () => {
		const obj = createObjectExpression([
			{ key: 'id', value: '"app"' }
		])
		expect(obj.type).toBe(NodeTypes.JS_OBJECT_EXPRESSION)
		expect(obj.properties.length).toBe(1)
	})
})

describe('createArrayExpression', () => {
	it('应该创建数组表达式', () => {
		const arr = createArrayExpression(['"a"', '"b"'])
		expect(arr.type).toBe(NodeTypes.JS_ARRAY_EXPRESSION)
		expect(arr.elements.length).toBe(2)
	})
})

describe('createFunctionExpression', () => {
	it('应该创建函数表达式', () => {
		const fn = createFunctionExpression(['item'], createSimpleExpression('item', false))
		expect(fn.type).toBe(NodeTypes.JS_FUNCTION_EXPRESSION)
		expect(fn.params.length).toBe(1)
	})
})

describe('createConditionalExpression', () => {
	it('应该创建条件表达式', () => {
		const test = createSimpleExpression('loading', false)
		const consequent = createSimpleExpression('"loading..."', true)
		const alternate = createSimpleExpression('"done"', true)
		const conditional = createConditionalExpression(test, consequent, alternate)
		expect(conditional.type).toBe(NodeTypes.JS_CONDITIONAL_EXPRESSION)
		expect(conditional.test).toBe(test)
	})
})

describe('类型判断函数', () => {
	it('isElementNode 应该正确判断元素节点', () => {
		const element = createElementNode('div')
		expect(isElementNode(element)).toBe(true)
		expect(isElementNode(createTextNode('test'))).toBe(false)
	})

	it('isTextNode 应该正确判断文本节点', () => {
		const text = createTextNode('test')
		expect(isTextNode(text)).toBe(true)
		expect(isTextNode(createElementNode('div'))).toBe(false)
	})

	it('isInterpolationNode 应该正确判断插值节点', () => {
		const interpolation = createInterpolationNode('count')
		expect(isInterpolationNode(interpolation)).toBe(true)
	})

	it('isIfNode 应该正确判断 if 节点', () => {
		const branch = createIfBranchNode([])
		const ifNode = createIfNode([branch])
		expect(isIfNode(ifNode)).toBe(true)
	})

	it('isForNode 应该正确判断 for 节点', () => {
		const source = createSimpleExpression('list', false)
		const forNode = createForNode(source, 'item', [])
		expect(isForNode(forNode)).toBe(true)
	})

	it('isSimpleExpressionNode 应该正确判断简单表达式节点', () => {
		const expr = createSimpleExpression('count', false)
		expect(isSimpleExpressionNode(expr)).toBe(true)
	})
})