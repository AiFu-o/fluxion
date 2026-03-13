/**
 * nodeOps DOM 操作测试
 */

import { describe, it, expect, beforeEach } from 'vitest'
import {
    createElement,
    createText,
    createComment,
    insert,
    remove,
    setElementText,
    setText,
    parentNode,
    nextSibling
} from '../src/nodeOps'

describe('nodeOps', () => {
    let container: HTMLDivElement

    beforeEach(() => {
        container = document.createElement('div')
        document.body.appendChild(container)
    })

    describe('createElement', () => {
        it('应该创建指定标签的元素', () => {
            const div = createElement('div')
            expect(div.tagName).toBe('DIV')

            const span = createElement('span')
            expect(span.tagName).toBe('SPAN')

            const p = createElement('p')
            expect(p.tagName).toBe('P')
        })

        it('传入空标签名应该创建 div', () => {
            const el = createElement('')
            expect(el.tagName).toBe('DIV')
        })
    })

    describe('createText', () => {
        it('应该创建文本节点', () => {
            const text = createText('hello')
            expect(text.nodeType).toBe(Node.TEXT_NODE)
            expect(text.textContent).toBe('hello')
        })

        it('传入 null/undefined 应该创建空文本节点', () => {
            const text1 = createText(null as any)
            expect(text1.textContent).toBe('')

            const text2 = createText(undefined as any)
            expect(text2.textContent).toBe('')
        })
    })

    describe('createComment', () => {
        it('应该创建注释节点', () => {
            const comment = createComment('test comment')
            expect(comment.nodeType).toBe(Node.COMMENT_NODE)
            expect(comment.textContent).toBe('test comment')
        })
    })

    describe('insert', () => {
        it('应该将节点插入到父节点末尾', () => {
            const child = createElement('div')
            insert(child, container)
            expect(container.lastChild).toBe(child)
        })

        it('应该将节点插入到指定位置', () => {
            const child1 = createElement('div')
            const child2 = createElement('span')
            container.appendChild(child1)

            insert(child2, container, child1)
            expect(container.firstChild).toBe(child2)
            expect(container.lastChild).toBe(child1)
        })
    })

    describe('remove', () => {
        it('应该移除指定节点', () => {
            const child = createElement('div')
            container.appendChild(child)
            expect(container.children.length).toBe(1)

            remove(child)
            expect(container.children.length).toBe(0)
        })
    })

    describe('setElementText', () => {
        it('应该设置元素的文本内容', () => {
            const el = createElement('div')
            setElementText(el, 'hello world')
            expect(el.textContent).toBe('hello world')
        })

        it('传入 null/undefined 应该清空文本', () => {
            const el = createElement('div')
            el.textContent = 'test'
            setElementText(el, null as any)
            expect(el.textContent).toBe('')
        })
    })

    describe('setText', () => {
        it('应该设置文本节点的内容', () => {
            const text = createText('')
            setText(text, 'new text')
            expect(text.nodeValue).toBe('new text')
        })
    })

    describe('parentNode', () => {
        it('应该返回父节点', () => {
            const child = createElement('div')
            container.appendChild(child)
            expect(parentNode(child)).toBe(container)
        })

        it('没有父节点应该返回 null', () => {
            const child = createElement('div')
            expect(parentNode(child)).toBe(null)
        })
    })

    describe('nextSibling', () => {
        it('应该返回下一个兄弟节点', () => {
            const child1 = createElement('div')
            const child2 = createElement('span')
            container.appendChild(child1)
            container.appendChild(child2)

            expect(nextSibling(child1)).toBe(child2)
        })

        it('没有下一个兄弟应该返回 null', () => {
            const child = createElement('div')
            container.appendChild(child)
            expect(nextSibling(child)).toBe(null)
        })
    })
})