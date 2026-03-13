/**
 * VNode 测试
 */

import { describe, it, expect } from 'vitest'
import {
    createVNode,
    createTextVNode,
    createCommentVNode,
    createEmptyVNode,
    cloneVNode,
    isVNode,
    isElementVNode,
    isComponentVNode
} from '../src/vnode'
import { ShapeFlags } from '../src/types'

describe('createVNode', () => {
    it('应该创建元素 VNode', () => {
        const vnode = createVNode('div')

        expect(vnode.__v_isVNode).toBe(true)
        expect(vnode.type).toBe('div')
        expect(vnode.props).toBeNull()
        expect(vnode.children).toBeNull()
        expect(vnode.shapeFlag).toBe(ShapeFlags.ELEMENT)
    })

    it('应该创建带 props 的元素 VNode', () => {
        const vnode = createVNode('div', { id: 'app', class: 'container' })

        expect(vnode.props).toEqual({ id: 'app', class: 'container' })
        // key 没有传入时为 null
        expect(vnode.key).toBeNull()
    })

    it('应该创建带 key 的 VNode', () => {
        const vnode = createVNode('div', { key: 'my-key' })

        expect(vnode.key).toBe('my-key')
    })

    it('应该创建带文本 children 的 VNode', () => {
        const vnode = createVNode('div', null, 'hello')

        expect(vnode.children).toBe('hello')
        expect(vnode.shapeFlag & ShapeFlags.TEXT_CHILDREN).toBe(ShapeFlags.TEXT_CHILDREN)
    })

    it('应该创建带数组 children 的 VNode', () => {
        const child1 = createVNode('span')
        const child2 = createVNode('p')
        const vnode = createVNode('div', null, [child1, child2])

        expect(Array.isArray(vnode.children)).toBe(true)
        expect(vnode.shapeFlag & ShapeFlags.ARRAY_CHILDREN).toBe(ShapeFlags.ARRAY_CHILDREN)
    })

    it('应该创建组件 VNode', () => {
        const component = {
            setup: () => () => createVNode('div')
        }
        const vnode = createVNode(component)

        expect(vnode.type).toBe(component)
        expect(vnode.shapeFlag & ShapeFlags.STATEFUL_COMPONENT).toBe(ShapeFlags.STATEFUL_COMPONENT)
    })
})

describe('createTextVNode', () => {
    it('应该创建文本 VNode', () => {
        const vnode = createTextVNode('hello')

        expect(vnode.__v_isVNode).toBe(true)
        expect(vnode.type).toBe(Symbol.for('Text'))
        expect(vnode.children).toBe('hello')
    })

    it('应该创建空文本 VNode', () => {
        const vnode = createTextVNode()

        expect(vnode.children).toBe('')
    })
})

describe('createCommentVNode', () => {
    it('应该创建注释 VNode', () => {
        const vnode = createCommentVNode('comment')

        expect(vnode.__v_isVNode).toBe(true)
        expect(vnode.type).toBe(Symbol.for('Comment'))
        expect(vnode.children).toBe('comment')
    })
})

describe('createEmptyVNode', () => {
    it('应该创建空 VNode', () => {
        const vnode = createEmptyVNode()

        expect(vnode.__v_isVNode).toBe(true)
        expect(vnode.type).toBe(Symbol.for('Empty'))
    })
})

describe('cloneVNode', () => {
    it('应该克隆 VNode', () => {
        const original = createVNode('div', { id: 'app' }, 'hello')
        const cloned = cloneVNode(original)

        expect(cloned).not.toBe(original)
        expect(cloned.type).toBe(original.type)
        expect(cloned.props).toEqual(original.props)
        expect(cloned.children).toBe(original.children)
    })

    it('克隆后的 props 应该是独立的', () => {
        const original = createVNode('div', { id: 'app' })
        const cloned = cloneVNode(original)

        cloned.props!.id = 'changed'

        expect(original.props!.id).toBe('app')
        expect(cloned.props!.id).toBe('changed')
    })
})

describe('isVNode', () => {
    it('应该正确识别 VNode', () => {
        const vnode = createVNode('div')
        expect(isVNode(vnode)).toBe(true)
    })

    it('应该拒绝非 VNode', () => {
        expect(isVNode(null)).toBe(false)
        expect(isVNode({})).toBe(false)
        expect(isVNode('div')).toBe(false)
    })
})

describe('isElementVNode', () => {
    it('应该识别元素 VNode', () => {
        const vnode = createVNode('div')
        // 位运算返回非零值表示 true
        expect(isElementVNode(vnode)).toBeTruthy()
    })

    it('应该拒绝组件 VNode', () => {
        const vnode = createVNode({ setup: () => () => createVNode('div') })
        // 位运算返回 0 表示 false
        expect(isElementVNode(vnode)).toBeFalsy()
    })
})

describe('isComponentVNode', () => {
    it('应该识别组件 VNode', () => {
        const vnode = createVNode({ setup: () => () => createVNode('div') })
        // 位运算返回非零值表示 true
        expect(isComponentVNode(vnode)).toBeTruthy()
    })

    it('应该拒绝元素 VNode', () => {
        const vnode = createVNode('div')
        // 位运算返回 0 表示 false
        expect(isComponentVNode(vnode)).toBeFalsy()
    })
})