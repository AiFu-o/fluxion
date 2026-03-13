/**
 * 渲染器抽象
 * 平台无关的渲染逻辑
 */

import {
    RendererOptions,
    Renderer,
    VNode,
    ShapeFlags,
    ComponentInstance
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
import { isElementVNode, isComponentVNode, createTextVNode } from './vnode'

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
    const createApp = (rootComponent: any): any => {
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

        if (n1 == null) {
            // 挂载
            // 处理 props
            const props = n2.props
            if (props) {
                for (const key in props) {
                    patchProp(el, key, props[key], null)
                }
            }

            // 处理 children
            mountChildren(n2.children, el)

            // 插入 DOM
            insert(el, container, anchor)
        } else {
            // 更新
            patchProps(el, n1.props, n2.props)
            patchChildren(n1, n2, el)
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
            // 旧为数组（简单实现：全量替换）
            else if (prevShapeFlag & ShapeFlags.ARRAY_CHILDREN) {
                patchArrayChildren(c1 as VNode[], c2 as VNode[], container)
            }
        }
    }

    /**
     * Patch 数组 children（简单实现）
     */
    const patchArrayChildren = (
        c1: VNode[],
        c2: VNode[],
        container: Element
    ): void => {
        // 简单实现：全量替换
        // TODO: 实现 key-based diff
        const oldLength = c1.length
        const newLength = c2.length
        const commonLength = Math.min(oldLength, newLength)

        // 更新共同的节点
        for (let i = 0; i < commonLength; i++) {
            patch(c1[i], c2[i], container)
        }

        // 挂载新节点
        if (newLength > oldLength) {
            mountChildren(c2.slice(oldLength), container)
        }
        // 卸载旧节点
        else if (oldLength > newLength) {
            unmountChildren(c1.slice(newLength))
        }
    }

    /**
     * 挂载 children
     */
    const mountChildren = (children: VNode['children'], container: Element): void => {
        if (!children) return

        if (isString(children)) {
            setElementText(container, children)
        } else if (isArray(children)) {
            for (let i = 0; i < children.length; i++) {
                const child = children[i]
                if (isString(child)) {
                    const textNode = createTextVNode(child)
                    children[i] = textNode
                    patch(null, textNode, container)
                } else {
                    patch(null, child, container)
                }
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