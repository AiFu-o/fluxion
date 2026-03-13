/**
 * 组件测试
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
    createComponentInstance,
    setupComponent,
    initProps,
    initSlots,
    getCurrentInstance,
    setCurrentInstance
} from '../src/component'
import { createVNode } from '../src/vnode'
import { h } from '../src/h'

describe('createComponentInstance', () => {
    it('应该创建组件实例', () => {
        const component = {
            name: 'TestComponent',
            setup: () => () => h('div')
        }
        const vnode = createVNode(component)
        const instance = createComponentInstance(vnode)

        expect(instance.uid).toBeDefined()
        expect(instance.type).toBe(component)
        expect(instance.vnode).toBe(vnode)
        expect(instance.isMounted).toBe(false)
        expect(instance.props).toEqual({})
        expect(instance.slots).toEqual({})
    })

    it('应该设置 __v_isComponent 标记', () => {
        const component = { setup: () => () => h('div') }
        const vnode = createVNode(component)
        const instance = createComponentInstance(vnode)

        expect(instance.__v_isComponent).toBe(true)
    })
})

describe('initProps', () => {
    it('应该初始化空 props', () => {
        const component = { setup: () => () => h('div') }
        const vnode = createVNode(component)
        const instance = createComponentInstance(vnode)

        initProps(instance, null)

        expect(instance.props).toEqual({})
        expect(instance.attrs).toEqual({})
    })

    it('应该分离 props 和 attrs', () => {
        const component = {
            props: { name: { type: String } },
            setup: () => () => h('div')
        }
        const vnode = createVNode(component, { name: 'test', id: 'app' })
        const instance = createComponentInstance(vnode)

        initProps(instance, vnode.props)

        expect(instance.props.name).toBe('test')
        expect(instance.attrs.id).toBe('app')
    })

    it('应该应用默认值', () => {
        const component = {
            props: {
                name: { type: String, default: 'default' }
            },
            setup: () => () => h('div')
        }
        const vnode = createVNode(component, {})
        const instance = createComponentInstance(vnode)

        initProps(instance, vnode.props)

        expect(instance.props.name).toBe('default')
    })
})

describe('initSlots', () => {
    it('应该初始化空插槽', () => {
        const component = { setup: () => () => h('div') }
        const vnode = createVNode(component)
        const instance = createComponentInstance(vnode)

        initSlots(instance, null)

        expect(instance.slots).toEqual({})
    })

    it('应该处理数组形式的默认插槽', () => {
        const component = { setup: () => () => h('div') }
        const child = h('span')
        const vnode = createVNode(component, null, [child])
        const instance = createComponentInstance(vnode)

        initSlots(instance, vnode.children)

        expect(instance.slots.default).toBeDefined()
        expect(Array.isArray(instance.slots.default())).toBe(true)
    })
})

describe('setupComponent', () => {
    it('应该执行 setup 函数', () => {
        const setup = vi.fn(() => () => h('div'))
        const component = { setup }
        const vnode = createVNode(component)
        const instance = createComponentInstance(vnode)

        setupComponent(instance)

        expect(setup).toHaveBeenCalled()
        expect(instance.render).toBeDefined()
    })

    it('setup 应该接收 props 和 context', () => {
        let receivedProps: any = null
        let receivedCtx: any = null

        const component = {
            props: { name: { type: String } },
            setup(props: any, ctx: any) {
                receivedProps = props
                receivedCtx = ctx
                return () => h('div')
            }
        }

        const vnode = createVNode(component, { name: 'test' })
        const instance = createComponentInstance(vnode)

        setupComponent(instance)

        expect(receivedProps.name).toBe('test')
        expect(receivedCtx.emit).toBeDefined()
        expect(receivedCtx.attrs).toBeDefined()
        expect(receivedCtx.slots).toBeDefined()
    })
})

describe('getCurrentInstance', () => {
    it('应该返回 null 当没有活跃实例', () => {
        setCurrentInstance(null)
        expect(getCurrentInstance()).toBeNull()
    })

    it('应该返回当前实例', () => {
        const component = { setup: () => () => h('div') }
        const vnode = createVNode(component)
        const instance = createComponentInstance(vnode)

        setCurrentInstance(instance)
        expect(getCurrentInstance()).toBe(instance)
        setCurrentInstance(null)
    })
})