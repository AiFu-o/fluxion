/**
 * DOM 节点操作
 * 提供 RendererOptions 所需的基础 DOM 操作方法
 */

import { warn } from '@fluxion/shared'

/**
 * 创建 HTML 元素
 * @param tag 标签名
 */
export function createElement(tag: string): Element {
    if (!tag) {
        warn('createElement: 标签名不能为空')
        return document.createElement('div')
    }
    return document.createElement(tag)
}

/**
 * 创建文本节点
 * @param text 文本内容
 */
export function createText(text: string): Text {
    return document.createTextNode(text ?? '')
}

/**
 * 创建注释节点
 * @param text 注释内容
 */
export function createComment(text: string): Comment {
    return document.createComment(text ?? '')
}

/**
 * 插入节点到父节点
 * @param child 要插入的子节点
 * @param parent 父节点
 * @param anchor 参考节点（插入到该节点之前）
 */
export function insert(
    child: Node,
    parent: Node,
    anchor?: Node | null
): void {
    if (!child) {
        warn('insert: 子节点不能为空')
        return
    }
    if (!parent) {
        warn('insert: 父节点不能为空')
        return
    }
    // 使用 insertBefore 实现，anchor 为 null 时插入到末尾
    parent.insertBefore(child, anchor ?? null)
}

/**
 * 移除节点
 * @param child 要移除的节点
 */
export function remove(child: Node): void {
    if (!child) {
        warn('remove: 节点不能为空')
        return
    }
    const parent = child.parentNode
    if (parent) {
        parent.removeChild(child)
    }
}

/**
 * 设置元素的文本内容
 * @param el 元素
 * @param text 文本内容
 */
export function setElementText(el: Element, text: string): void {
    if (!el) {
        warn('setElementText: 元素不能为空')
        return
    }
    el.textContent = text ?? ''
}

/**
 * 设置文本节点的内容
 * @param node 文本节点
 * @param text 文本内容
 */
export function setText(node: Text, text: string): void {
    if (!node) {
        warn('setText: 文本节点不能为空')
        return
    }
    node.nodeValue = text ?? ''
}

/**
 * 获取父节点
 * @param node 节点
 */
export function parentNode(node: Node): Node | null {
    if (!node) {
        warn('parentNode: 节点不能为空')
        return null
    }
    return node.parentNode
}

/**
 * 获取下一个兄弟节点
 * @param node 节点
 */
export function nextSibling(node: Node): Node | null {
    if (!node) {
        warn('nextSibling: 节点不能为空')
        return null
    }
    return node.nextSibling
}

/**
 * 获取元素的标签名
 * @param el 元素
 */
export function getTagName(el: Element): string {
    return el?.tagName?.toLowerCase() ?? ''
}

/**
 * 导出所有 nodeOps 方法
 */
export const nodeOps = {
    createElement,
    createText,
    createComment,
    insert,
    remove,
    setElementText,
    setText,
    parentNode,
    nextSibling
}