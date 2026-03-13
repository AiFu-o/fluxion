/**
 * h 函数测试
 */

import { describe, it, expect } from 'vitest'
import { h } from '../src/h'
import { isVNode, isElementVNode, isComponentVNode } from '../src/vnode'
import { ShapeFlags } from '../src/types'

describe('h 函数', () => {
    describe('创建元素 VNode', () => {
        it('h(type) - 只传类型', () => {
            const vnode = h('div')

            expect(isVNode(vnode)).toBe(true)
            expect(vnode.type).toBe('div')
            expect(vnode.props).toBeNull()
            expect(vnode.children).toBeNull()
        })

        it('h(type, props) - 类型 + props', () => {
            const vnode = h('div', { id: 'app', class: 'container' })

            expect(vnode.type).toBe('div')
            expect(vnode.props).toEqual({ id: 'app', class: 'container' })
        })

        it('h(type, children) - 类型 + 文本 children', () => {
            const vnode = h('div', 'hello')

            expect(vnode.type).toBe('div')
            expect(vnode.children).toBe('hello')
            expect(vnode.shapeFlag & ShapeFlags.TEXT_CHILDREN).toBe(ShapeFlags.TEXT_CHILDREN)
        })

        it('h(type, children) - 类型 + 数组 children', () => {
            const child = h('span')
            const vnode = h('div', [child])

            expect(vnode.type).toBe('div')
            expect(Array.isArray(vnode.children)).toBe(true)
            expect(vnode.shapeFlag & ShapeFlags.ARRAY_CHILDREN).toBe(ShapeFlags.ARRAY_CHILDREN)
        })

        it('h(type, props, children) - 类型 + props + 文本 children', () => {
            const vnode = h('div', { id: 'app' }, 'hello')

            expect(vnode.type).toBe('div')
            expect(vnode.props).toEqual({ id: 'app' })
            expect(vnode.children).toBe('hello')
        })

        it('h(type, props, children) - 类型 + props + 数组 children', () => {
            const child1 = h('span')
            const child2 = h('p')
            const vnode = h('div', { id: 'app' }, [child1, child2])

            expect(vnode.type).toBe('div')
            expect(vnode.props).toEqual({ id: 'app' })
            expect(Array.isArray(vnode.children)).toBe(true)
            expect((vnode.children as any[]).length).toBe(2)
        })
    })

    describe('创建组件 VNode', () => {
        const MyComponent = {
            name: 'MyComponent',
            setup: () => () => h('div')
        }

        it('h(Component) - 只传组件', () => {
            const vnode = h(MyComponent)

            expect(isVNode(vnode)).toBe(true)
            expect(vnode.type).toBe(MyComponent)
            // 位运算返回非零值表示 true
            expect(isComponentVNode(vnode)).toBeTruthy()
        })

        it('h(Component, props) - 组件 + props', () => {
            const vnode = h(MyComponent, { name: 'test' })

            expect(vnode.type).toBe(MyComponent)
            expect(vnode.props).toEqual({ name: 'test' })
        })

        it('h(Component, props, slots) - 组件 + props + 插槽', () => {
            const slots = { default: () => [h('span')] }
            const vnode = h(MyComponent, { name: 'test' }, slots)

            expect(vnode.type).toBe(MyComponent)
            expect(vnode.props).toEqual({ name: 'test' })
        })
    })

    describe('嵌套结构', () => {
        it('应该支持嵌套 h 函数', () => {
            const vnode = h('div', { id: 'app' }, [
                h('header', [
                    h('h1', 'Title')
                ]),
                h('main', [
                    h('p', 'Content')
                ])
            ])

            expect(vnode.type).toBe('div')
            expect(Array.isArray(vnode.children)).toBe(true)
            const children = vnode.children as any[]
            expect(children.length).toBe(2)
            expect(children[0].type).toBe('header')
            expect(children[1].type).toBe('main')
        })
    })

    describe('边界情况', () => {
        it('props 为 null 时应该正常处理', () => {
            const vnode = h('div', null, 'hello')

            expect(vnode.props).toBeNull()
            expect(vnode.children).toBe('hello')
        })

        it('children 为 null 时应该正常处理', () => {
            const vnode = h('div', { id: 'app' }, null)

            expect(vnode.props).toEqual({ id: 'app' })
            expect(vnode.children).toBeNull()
        })

        it('props 为空对象时应该正常处理', () => {
            const vnode = h('div', {})

            expect(vnode.props).toEqual({})
        })
    })
})