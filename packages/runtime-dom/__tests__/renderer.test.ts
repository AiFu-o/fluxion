/**
 * 渲染器集成测试
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { createApp, h, render } from '../src/index'
import { signal } from '@fluxion-ui/reactivity'

describe('render', () => {
    let container: HTMLDivElement

    beforeEach(() => {
        container = document.createElement('div')
        document.body.appendChild(container)
    })

    describe('元素渲染', () => {
        it('应该渲染简单元素', () => {
            const vnode = h('div', { id: 'test' }, 'hello')
            render(vnode, container)

            expect(container.innerHTML).toBe('<div id="test">hello</div>')
        })

        it('应该渲染嵌套元素', () => {
            const vnode = h('div', null, [
                h('p', null, 'paragraph 1'),
                h('p', null, 'paragraph 2')
            ])
            render(vnode, container)

            expect(container.innerHTML).toBe('<div><p>paragraph 1</p><p>paragraph 2</p></div>')
        })

        it('应该渲染 null 时清空容器', () => {
            const vnode = h('div', null, 'hello')
            render(vnode, container)
            expect(container.innerHTML).not.toBe('')

            render(null, container)
            expect(container.innerHTML).toBe('')
        })
    })

    describe('属性处理', () => {
        it('应该设置 class', () => {
            const vnode = h('div', { class: 'foo bar' })
            render(vnode, container)

            const el = container.firstChild as HTMLElement
            expect(el.className).toBe('foo bar')
        })

        it('应该设置 style', () => {
            const vnode = h('div', { style: { color: 'red' } })
            render(vnode, container)

            const el = container.firstChild as HTMLElement
            expect(el.style.color).toBe('red')
        })

        it('应该绑定事件', () => {
            const handler = vi.fn()
            const vnode = h('button', { onClick: handler }, 'click')
            render(vnode, container)

            const button = container.querySelector('button')!
            button.click()

            expect(handler).toHaveBeenCalledTimes(1)
        })
    })

    describe('更新', () => {
        it('应该更新文本内容', () => {
            const vnode1 = h('div', null, 'hello')
            render(vnode1, container)

            const vnode2 = h('div', null, 'world')
            render(vnode2, container)

            expect(container.textContent).toBe('world')
        })

        it('应该更新属性', () => {
            const vnode1 = h('div', { id: 'old' })
            render(vnode1, container)

            const vnode2 = h('div', { id: 'new' })
            render(vnode2, container)

            const el = container.firstChild as HTMLElement
            expect(el.id).toBe('new')
        })

        it('应该移除旧属性', () => {
            const vnode1 = h('div', { id: 'test', title: 'title' })
            render(vnode1, container)

            const vnode2 = h('div', { id: 'test' })
            render(vnode2, container)

            const el = container.firstChild as HTMLElement
            expect(el.hasAttribute('title')).toBe(false)
        })
    })
})

describe('createApp', () => {
    let container: HTMLDivElement

    beforeEach(() => {
        container = document.createElement('div')
        container.id = 'app'
        document.body.appendChild(container)
    })

    afterEach(() => {
        document.body.innerHTML = ''
    })

    it('应该挂载组件', () => {
        const App = {
            setup() {
                return () => h('div', null, 'hello from app')
            }
        }

        createApp(App).mount(container)
        expect(container.textContent).toBe('hello from app')
    })

    it('应该支持响应式更新', async () => {
        const App = {
            setup() {
                const count = signal(0)
                return () => h('div', null, `count: ${count()}`)
            }
        }

        createApp(App).mount(container)
        expect(container.textContent).toBe('count: 0')
    })

    it('应该支持字符串选择器挂载', () => {
        const App = {
            setup() {
                return () => h('div', null, 'mounted by selector')
            }
        }

        createApp(App).mount('#app')
        expect(container.textContent).toBe('mounted by selector')
    })

    it('应该支持组件 props', () => {
        const Child = {
            props: {
                msg: String
            },
            setup(props: { msg: string }) {
                return () => h('div', null, props.msg)
            }
        }

        const App = {
            setup() {
                return () => h(Child, { msg: 'hello child' })
            }
        }

        createApp(App).mount(container)
        expect(container.textContent).toBe('hello child')
    })
})