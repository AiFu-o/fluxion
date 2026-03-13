/**
 * 渲染器测试
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createRenderer, ShapeFlags } from '../src'
import type { RendererOptions } from '../src/types'
import { createVNode } from '../src/vnode'
import { h } from '../src/h'

/**
 * 创建模拟的渲染器选项
 */
function createMockOptions(): RendererOptions {
    const elements: Map<Element, { text: string; props: Record<string, any> }> = new Map()

    return {
        createElement(tag: string): Element {
            const el = { tagName: tag.toUpperCase(), children: [], parent: null } as unknown as Element
            elements.set(el, { text: '', props: {} })
            return el
        },

        createText(text: string): Text {
            return { textContent: text } as unknown as Text
        },

        createComment(text: string): Comment {
            return { textContent: text } as unknown as Comment
        },

        insert(child: Node, parent: Node, anchor?: Node | null): void {
            // 模拟插入
            ;(child as any).parent = parent
            ;(parent as any).children = (parent as any).children || []
            ;(parent as any).children.push(child)
        },

        remove(child: Node): void {
            // 模拟移除
            const parent = (child as any).parent
            if (parent && (parent as any).children) {
                const index = (parent as any).children.indexOf(child)
                if (index > -1) {
                    (parent as any).children.splice(index, 1)
                }
            }
        },

        setElementText(el: Element, text: string): void {
            const data = elements.get(el)
            if (data) {
                data.text = text
            }
        },

        patchProp(el: Element, key: string, value: any, prevValue: any): void {
            const data = elements.get(el)
            if (data) {
                if (value == null) {
                    delete data.props[key]
                } else {
                    data.props[key] = value
                }
            }
        },

        parentNode(node: Node): Node | null {
            return (node as any).parent || null
        },

        nextSibling(node: Node): Node | null {
            const parent = (node as any).parent
            if (parent && (parent as any).children) {
                const index = (parent as any).children.indexOf(node)
                if (index > -1 && index < (parent as any).children.length - 1) {
                    return (parent as any).children[index + 1]
                }
            }
            return null
        },

        setText(node: Text, text: string): void {
            ;(node as any).textContent = text
        }
    }
}

describe('createRenderer', () => {
    let renderer: ReturnType<typeof createRenderer>
    let mockOptions: RendererOptions

    beforeEach(() => {
        mockOptions = createMockOptions()
        renderer = createRenderer(mockOptions)
    })

    describe('render', () => {
        it('应该创建渲染器', () => {
            expect(renderer).toBeDefined()
            expect(renderer.render).toBeTypeOf('function')
            expect(renderer.createApp).toBeTypeOf('function')
        })

        it('应该挂载元素 VNode', () => {
            const container = mockOptions.createElement('div') as Element
            const vnode = createVNode('span', { id: 'test' }, 'hello')

            renderer.render(vnode, container)

            // 验证 vnode.el 已设置
            expect(vnode.el).toBeDefined()
        })

        it('应该卸载 VNode', () => {
            const container = mockOptions.createElement('div') as Element
            const vnode = createVNode('span')

            renderer.render(vnode, container)
            expect((container as any).__vnode).toBe(vnode)

            renderer.render(null, container)
            expect((container as any).__vnode).toBeNull()
        })
    })

    describe('createApp', () => {
        it('应该创建应用实例', () => {
            const app = renderer.createApp({})

            expect(app).toBeDefined()
            expect(app.mount).toBeTypeOf('function')
            expect(app.unmount).toBeTypeOf('function')
        })

        it('应该支持链式调用', () => {
            const app = renderer.createApp({})

            const result = app.component('Test', {}).use({ install: () => {} })

            expect(result).toBe(app)
        })
    })
})

describe('元素更新', () => {
    let renderer: ReturnType<typeof createRenderer>
    let mockOptions: RendererOptions

    beforeEach(() => {
        mockOptions = createMockOptions()
        renderer = createRenderer(mockOptions)
    })

    it('应该更新元素 props', () => {
        const container = mockOptions.createElement('div') as Element
        const vnode1 = createVNode('span', { id: 'old' })
        const vnode2 = createVNode('span', { id: 'new' })

        renderer.render(vnode1, container)
        renderer.render(vnode2, container)

        // 验证更新后的 props
        expect(vnode2.el).toBe(vnode1.el)
    })

    it('应该更新文本内容', () => {
        const container = mockOptions.createElement('div') as Element
        const vnode1 = createVNode('span', null, 'old text')
        const vnode2 = createVNode('span', null, 'new text')

        renderer.render(vnode1, container)
        renderer.render(vnode2, container)
    })
})

describe('组件渲染', () => {
    let renderer: ReturnType<typeof createRenderer>
    let mockOptions: RendererOptions

    beforeEach(() => {
        mockOptions = createMockOptions()
        renderer = createRenderer(mockOptions)
    })

    it('应该挂载组件', () => {
        const container = mockOptions.createElement('div') as Element

        const component = {
            name: 'TestComponent',
            setup() {
                return () => h('div', { id: 'test' }, 'component content')
            }
        }

        const vnode = createVNode(component)
        renderer.render(vnode, container)

        expect(vnode.component).toBeDefined()
        expect(vnode.component!.isMounted).toBe(true)
    })
})