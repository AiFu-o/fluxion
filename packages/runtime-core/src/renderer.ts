/**
 * 渲染器抽象
 * 平台无关的渲染逻辑
 */

import {
    RendererOptions,
    Renderer,
    VNode,
    ShapeFlags,
    ComponentInstance,
    Component
} from './types'
import {
    createComponentInstance,
    setupComponent,
    invokeLifecycleHook
} from './component'
import { renderComponentRoot } from './componentRenderUtils'
import { effect, Effect } from '@fluxion/reactivity'
import { queueJob, nextTick } from './scheduler'
import { warn, isString, isArray, isFunction } from '@fluxion/shared'
import { normalizeVNode } from './utils/normalize'

// Text 类型的 Symbol
const TextSymbol = Symbol.for('Text')
// Fragment 类型的 Symbol
const FragmentSymbol = Symbol.for('Fragment')

/**
 * 创建渲染器
 * @param options 平台特定操作
 */
export function createRenderer(options: RendererOptions): Renderer {
    const {
        createElement,
        createText,
        createComment,
        insert,
        remove,
        setElementText,
        patchProp,
        parentNode,
        nextSibling,
        setText
    } = options

    /**
     * 判断是否为文本 VNode
     */
    const isTextVNode = (vnode: VNode): boolean => vnode.type === TextSymbol

    /**
     * 判断是否为 Fragment VNode
     */
    const isFragmentVNode = (vnode: VNode): boolean => vnode.type === FragmentSymbol

    /**
     * 渲染 VNode 到容器
     */
    const render = (vnode: VNode | null, container: Element): void => {
        // 获取旧的 VNode
        const prevVNode = (container as any).__vnode as VNode | null

        if (vnode == null) {
            // 卸载
            if (prevVNode) {
                unmount(prevVNode)
                ;(container as any).__vnode = null
            }
        } else {
            // 挂载或更新
            patch(prevVNode, vnode, container)
            ;(container as any).__vnode = vnode
        }
    }

    /**
     * 创建应用
     */
    const createApp = (rootComponent: Component): any => {
        return {
            mount(container: Element | string) {
                const containerEl = isString(container)
                    ? document.querySelector(container)
                    : container

                if (!containerEl) {
                    warn('mount: 找不到容器元素')
                    return
                }

                // 创建根组件 VNode
                const vnode = {
                    __v_isVNode: true,
                    type: rootComponent,
                    props: null,
                    children: null,
                    shapeFlag: ShapeFlags.STATEFUL_COMPONENT,
                    component: null,
                    el: null,
                    anchor: null,
                    key: null,
                    patchFlag: 0
                }

                // 渲染
                render(vnode, containerEl as Element)
            },
            unmount() {
                // TODO: 实现卸载
            },
            component() {
                return this
            },
            use() {
                return this
            }
        }
    }

    /**
     * Patch 核心
     */
    const patch = (
        n1: VNode | null,
        n2: VNode,
        container: Element,
        anchor?: Element | null
    ): void => {
        // 类型不同，直接替换
        if (n1 && n1.type !== n2.type) {
            unmount(n1)
            n1 = null
        }

        const { shapeFlag } = n2

        if (shapeFlag & ShapeFlags.ELEMENT) {
            // 元素
            patchElement(n1, n2, container, anchor)
        } else if (shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
            // 组件
            patchComponent(n1, n2, container, anchor)
        } else if (isTextVNode(n2)) {
            // 文本节点
            patchText(n1, n2, container, anchor)
        } else if (isFragmentVNode(n2)) {
            // Fragment
            patchFragment(n1, n2, container, anchor)
        }
    }

    /**
     * Patch 文本节点
     */
    const patchText = (
        n1: VNode | null,
        n2: VNode,
        container: Element,
        anchor?: Element | null
    ): void => {
        if (n1 == null) {
            // 挂载文本节点
            const el = (n2.el = createText(n2.children as string) as unknown as Element)
            insert(el, container, anchor)
        } else {
            // 更新文本节点
            const el = (n2.el = n1.el)
            if (n1.children !== n2.children) {
                setText(el as unknown as globalThis.Text, n2.children as string)
            }
        }
    }

    /**
     * Patch Fragment
     */
    const patchFragment = (
        n1: VNode | null,
        n2: VNode,
        container: Element,
        anchor?: Element | null
    ): void => {
        const c1 = n1 ? (n1.children as VNode[]) : []
        const c2 = n2.children as VNode[]

        if (n1 == null) {
            // 挂载 Fragment 的所有子节点
            mountChildren(c2, container, anchor)
        } else {
            // 更新 Fragment
            patchKeyedChildren(c1, c2, container, anchor)
        }
    }

    /**
     * Patch 元素
     */
    const patchElement = (
        n1: VNode | null,
        n2: VNode,
        container: Element,
        anchor?: Element | null
    ): void => {
        const el = (n2.el = n1 ? n1.el : createElement(n2.type as string))

        // el 不可能为 null，因为 createElement 总是返回 Element
        const element = el!

        if (n1 == null) {
            // 挂载
            // 处理 props
            const props = n2.props
            if (props) {
                for (const key in props) {
                    patchProp(element, key, props[key], null)
                }
            }

            // 处理 children
            mountChildren(n2.children, element)

            // 插入 DOM
            insert(element, container, anchor)
        } else {
            // 更新
            patchProps(element, n1.props, n2.props)
            patchChildren(n1, n2, element)
        }
    }

    /**
     * Patch props
     */
    const patchProps = (
        el: Element,
        oldProps: VNode['props'],
        newProps: VNode['props']
    ): void => {
        if (oldProps === newProps) return

        oldProps = oldProps || {}
        newProps = newProps || {}

        // 更新新 props
        for (const key in newProps) {
            const next = newProps[key]
            const prev = oldProps[key]
            if (next !== prev) {
                patchProp(el, key, next, prev)
            }
        }

        // 删除旧 props
        for (const key in oldProps) {
            if (!(key in newProps)) {
                patchProp(el, key, null, oldProps[key])
            }
        }
    }

    /**
     * Patch children
     */
    const patchChildren = (
        n1: VNode,
        n2: VNode,
        container: Element
    ): void => {
        const c1 = n1.children
        const c2 = n2.children
        const prevShapeFlag = n1.shapeFlag
        const shapeFlag = n2.shapeFlag

        // 新 children 为空
        if (shapeFlag & 0) {
            if (prevShapeFlag & ShapeFlags.ARRAY_CHILDREN) {
                unmountChildren(c1 as VNode[])
            }
        }
        // 新 children 为文本
        else if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
            // 旧为数组，先卸载
            if (prevShapeFlag & ShapeFlags.ARRAY_CHILDREN) {
                unmountChildren(c1 as VNode[])
            }
            setElementText(container, c2 as string)
        }
        // 新 children 为数组
        else if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
            // 旧为文本
            if (prevShapeFlag & ShapeFlags.TEXT_CHILDREN) {
                setElementText(container, '')
                mountChildren(c2 as VNode[], container)
            }
            // 旧为数组
            else if (prevShapeFlag & ShapeFlags.ARRAY_CHILDREN) {
                patchKeyedChildren(c1 as VNode[], c2 as VNode[], container)
            }
        }
    }

    /**
     * Patch 带 key 的数组 children
     * 实现完整的 diff 算法
     */
    const patchKeyedChildren = (
        c1: VNode[],
        c2: VNode[],
        container: Element,
        parentAnchor?: Element | null
    ): void => {
        let i = 0
        const l2 = c2.length
        let e1 = c1.length - 1
        let e2 = l2 - 1

        // 1. 从头开始同步
        while (i <= e1 && i <= e2) {
            const n1 = c1[i]
            const n2 = normalizeVNode(c2[i] as any)
            c2[i] = n2
            if (isSameVNodeType(n1, n2)) {
                patch(n1, n2, container)
            } else {
                break
            }
            i++
        }

        // 2. 从尾开始同步
        while (i <= e1 && i <= e2) {
            const n1 = c1[e1]
            const n2 = normalizeVNode(c2[e2] as any)
            c2[e2] = n2
            if (isSameVNodeType(n1, n2)) {
                patch(n1, n2, container)
            } else {
                break
            }
            e1--
            e2--
        }

        // 3. 新增节点
        if (i > e1) {
            if (i <= e2) {
                const nextPos = e2 + 1
                const anchor = nextPos < l2 ? (c2[nextPos].el as Element) : parentAnchor
                while (i <= e2) {
                    const n2 = normalizeVNode(c2[i] as any)
                    c2[i] = n2
                    patch(null, n2, container, anchor)
                    i++
                }
            }
        }
        // 4. 删除节点
        else if (i > e2) {
            while (i <= e1) {
                unmount(c1[i])
                i++
            }
        }
        // 5. 未知序列
        else {
            const s1 = i
            const s2 = i

            // 5.1 构建 key -> index 映射
            const keyToNewIndexMap = new Map<any, number>()
            for (i = s2; i <= e2; i++) {
                const child = normalizeVNode(c2[i] as any)
                c2[i] = child
                const key = child.key
                if (key != null) {
                    keyToNewIndexMap.set(key, i)
                }
            }

            // 5.2 遍历旧节点，标记需要删除和更新的节点
            let j = 0
            let patched = 0
            const toBePatched = e2 - s2 + 1
            let moved = false
            let maxNewIndexSoFar = 0

            // 用于跟踪新节点在旧节点中的位置，用于计算最长递增子序列
            const newIndexToOldIndexMap = new Array(toBePatched)
            for (i = 0; i < toBePatched; i++) {
                newIndexToOldIndexMap[i] = 0
            }

            for (i = s1; i <= e1; i++) {
                const prev = c1[i]
                if (patched >= toBePatched) {
                    // 所有新节点都已处理，删除剩余旧节点
                    unmount(prev)
                    continue
                }
                const key = prev.key
                let newIndex: number | undefined
                if (key != null) {
                    newIndex = keyToNewIndexMap.get(key)
                } else {
                    // 无 key，尝试查找相同类型节点
                    for (j = s2; j <= e2; j++) {
                        const nextChild = c2[j]
                        if (isSameVNodeType(prev, nextChild)) {
                            newIndex = j
                            break
                        }
                    }
                }
                if (newIndex === undefined) {
                    // 旧节点不在新节点中，删除
                    unmount(prev)
                } else {
                    // 记录新节点位置
                    if (newIndex >= maxNewIndexSoFar) {
                        maxNewIndexSoFar = newIndex
                    } else {
                        moved = true
                    }
                    newIndexToOldIndexMap[newIndex - s2] = i + 1
                    patch(prev, c2[newIndex] as VNode, container)
                    patched++
                }
            }

            // 5.3 移动和挂载新节点
            const increasingNewIndexSequence = moved
                ? getSequence(newIndexToOldIndexMap)
                : []
            j = increasingNewIndexSequence.length - 1

            for (i = toBePatched - 1; i >= 0; i--) {
                const nextIndex = s2 + i
                const nextChild = c2[nextIndex] as VNode
                const anchor = nextIndex + 1 < l2 ? (c2[nextIndex + 1].el as Element) : parentAnchor
                if (newIndexToOldIndexMap[i] === 0) {
                    // 新节点，挂载
                    patch(null, nextChild, container, anchor)
                } else if (moved) {
                    // 检查是否需要移动
                    if (j < 0 || i !== increasingNewIndexSequence[j]) {
                        move(nextChild, container, anchor)
                    } else {
                        j--
                    }
                }
            }
        }
    }

    /**
     * 判断两个 VNode 类型是否相同
     */
    const isSameVNodeType = (n1: VNode, n2: VNode): boolean => {
        return n1.type === n2.type && n1.key === n2.key
    }

    /**
     * 移动节点
     */
    const move = (
        vnode: VNode,
        container: Element,
        anchor?: Element | null
    ): void => {
        const el = vnode.el
        if (el) {
            insert(el, container, anchor)
        }
    }

    /**
     * 获取最长递增子序列的索引数组
     * 用于优化节点移动
     */
    const getSequence = (arr: number[]): number[] => {
        const p = arr.slice()
        const result = [0]
        let i, j, u, v, c
        const len = arr.length

        for (i = 0; i < len; i++) {
            const arrI = arr[i]
            if (arrI !== 0) {
                j = result[result.length - 1]
                if (arr[j] < arrI) {
                    p[i] = j
                    result.push(i)
                    continue
                }
                u = 0
                v = result.length - 1
                while (u < v) {
                    c = ((u + v) / 2) | 0
                    if (arr[result[c]] < arrI) {
                        u = c + 1
                    } else {
                        v = c
                    }
                }
                if (arrI < arr[result[u]]) {
                    if (u > 0) {
                        p[i] = result[u - 1]
                    }
                    result[u] = i
                }
            }
        }

        u = result.length
        v = result[u - 1]
        while (u-- > 0) {
            result[u] = v
            v = p[v]
        }

        return result
    }

    /**
     * 挂载 children
     */
    const mountChildren = (
        children: VNode['children'],
        container: Element,
        anchor?: Element | null
    ): void => {
        if (!children) return

        if (isString(children)) {
            setElementText(container, children)
        } else if (isArray(children)) {
            for (let i = 0; i < children.length; i++) {
                const child = children[i]
                // 使用 normalizeVNode 处理所有类型（字符串、数字、VNode、数组等）
                const vnode = normalizeVNode(child as any)
                children[i] = vnode
                patch(null, vnode, container, anchor)
            }
        }
    }

    /**
     * 卸载 children
     */
    const unmountChildren = (children: VNode[]): void => {
        for (let i = 0; i < children.length; i++) {
            unmount(children[i])
        }
    }

    /**
     * Patch 组件
     */
    const patchComponent = (
        n1: VNode | null,
        n2: VNode,
        container: Element,
        anchor?: Element | null
    ): void => {
        if (n1 == null) {
            // 挂载组件
            mountComponent(n2, container, anchor)
        } else {
            // 更新组件
            updateComponent(n1, n2)
        }
    }

    /**
     * 挂载组件
     */
    const mountComponent = (
        vnode: VNode,
        container: Element,
        anchor?: Element | null
    ): void => {
        // 创建组件实例
        const instance = createComponentInstance(vnode)
        vnode.component = instance

        // 设置组件
        setupComponent(instance)

        // 设置渲染副作用
        setupRenderEffect(instance, vnode, container, anchor)
    }

    /**
     * 设置渲染副作用
     */
    const setupRenderEffect = (
        instance: ComponentInstance,
        vnode: VNode,
        container: Element,
        anchor?: Element | null
    ): void => {
        // 组件更新函数
        const componentUpdate = () => {
            if (!instance.isMounted) {
                // 挂载
                // beforeMount 钩子
                invokeLifecycleHook(instance.bm)

                // 渲染子树
                const subTree = renderComponentRoot(instance)
                if (subTree) {
                    instance.subTree = subTree
                    patch(null, subTree, container, anchor)
                    vnode.el = subTree.el
                }

                instance.isMounted = true

                // mounted 钩子
                nextTick(() => {
                    invokeLifecycleHook(instance.m)
                })
            } else {
                // 更新
                // beforeUpdate 钩子
                invokeLifecycleHook(instance.bu)

                const prevSubTree = instance.subTree
                const subTree = renderComponentRoot(instance)

                if (subTree) {
                    instance.subTree = subTree
                    patch(prevSubTree!, subTree, container, anchor)
                    vnode.el = subTree.el
                }

                // updated 钩子
                nextTick(() => {
                    invokeLifecycleHook(instance.u)
                })
            }
        }

        // 创建响应式副作用
        const runner = effect(componentUpdate) as Effect
        instance.effect = runner

        // 初始渲染
        runner()
    }

    /**
     * 更新组件
     */
    const updateComponent = (n1: VNode, n2: VNode): void => {
        const instance = (n2.component = n1.component)

        if (!instance) {
            warn('updateComponent: 组件实例不存在')
            return
        }

        // 更新 props
        if (n2.props) {
            instance.props = { ...instance.props, ...n2.props }
        }

        // 触发更新
        if (instance.effect) {
            instance.effect()
        }
    }

    /**
     * 卸载
     */
    const unmount = (vnode: VNode): void => {
        if (vnode.shapeFlag & ShapeFlags.ELEMENT) {
            // 卸载元素
            removeElement(vnode)
        } else if (vnode.shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
            // 卸载组件
            unmountComponent(vnode)
        } else if (isTextVNode(vnode)) {
            // 卸载文本节点
            if (vnode.el) {
                remove(vnode.el)
            }
        } else if (isFragmentVNode(vnode)) {
            // 卸载 Fragment
            unmountChildren(vnode.children as VNode[])
        }
    }

    /**
     * 移除元素
     */
    const removeElement = (vnode: VNode): void => {
        const el = vnode.el
        if (el) {
            remove(el)
        }

        // 卸载子节点
        if (vnode.shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
            unmountChildren(vnode.children as VNode[])
        }
    }

    /**
     * 卸载组件
     */
    const unmountComponent = (vnode: VNode): void => {
        const instance = vnode.component
        if (!instance) return

        // unmounted 钩子
        invokeLifecycleHook(instance.um)

        // 卸载子树
        if (instance.subTree) {
            unmount(instance.subTree)
        }

        // 停止副作用
        if (instance.effect) {
            instance.effect.stop?.()
        }
    }

    return {
        render,
        createApp
    }
}