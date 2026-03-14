/**
 * 组件实例管理
 * 创建和管理组件实例的生命周期
 */

import {
    ComponentInstance,
    Component,
    ComponentProps,
    VNode,
    VNodeProps,
    Slots,
    LifecycleHook
} from './types'
import { COMPONENT_SYMBOL } from './symbols'
import { effect, Effect } from '@fluxion-ui/reactivity'
import { warn, isFunction, isArray, isObject, hasOwn } from '@fluxion-ui/shared'
import { normalizePropsOptions } from './utils/normalize'

/**
 * 组件实例 ID 计数器
 */
let uid = 0

/**
 * 当前正在处理的组件实例
 */
let currentInstance: ComponentInstance | null = null

/**
 * 获取当前组件实例
 */
export function getCurrentInstance(): ComponentInstance | null {
    return currentInstance
}

/**
 * 设置当前组件实例
 */
export function setCurrentInstance(instance: ComponentInstance | null): void {
    currentInstance = instance
}

/**
 * 创建组件实例
 * @param vnode 组件 VNode
 */
export function createComponentInstance(vnode: VNode): ComponentInstance {
    const type = vnode.type as Component

    const instance: ComponentInstance = {
        uid: uid++,
        type,
        __v_isComponent: true,
        vnode,
        subTree: null,
        props: {},
        attrs: {},
        isMounted: false,
        render: null,
        effect: null,
        bm: null,
        m: null,
        bu: null,
        u: null,
        um: null,
        slots: {}
    }

    return instance
}

/**
 * 设置组件
 * @param instance 组件实例
 */
export function setupComponent(instance: ComponentInstance): void {
    const { props, children } = instance.vnode

    // 初始化 props
    initProps(instance, props)

    // 初始化插槽
    initSlots(instance, children)

    // 执行 setup
    setupStatefulComponent(instance)
}

/**
 * 初始化 props
 */
export function initProps(instance: ComponentInstance, rawProps: VNodeProps | null): void {
    const type = instance.type
    const propsOptions = normalizePropsOptions(type.props)

    const props: ComponentProps = {}
    const attrs: Record<string, any> = {}

    if (rawProps) {
        for (const key in rawProps) {
            if (hasOwn(propsOptions, key)) {
                props[key] = rawProps[key]
            } else {
                attrs[key] = rawProps[key]
            }
        }
    }

    // 设置默认值
    for (const key in propsOptions) {
        const opt = propsOptions[key]
        if (opt.default !== undefined && !(key in props)) {
            props[key] = isFunction(opt.default) ? opt.default() : opt.default
        }
    }

    instance.props = props
    instance.attrs = attrs
}

/**
 * 初始化插槽
 */
export function initSlots(instance: ComponentInstance, children: VNode['children']): void {
    const slots: Slots = {}

    if (children) {
        if (isArray(children)) {
            // 默认插槽
            slots.default = () => children as VNode[]
        } else if (isObject(children)) {
            // 具名插槽
            for (const key in children as Slots) {
                slots[key] = (children as Slots)[key]
            }
        }
    }

    instance.slots = slots
}

/**
 * 设置有状态组件
 */
function setupStatefulComponent(instance: ComponentInstance): void {
    const type = instance.type as Component

    // 设置 render 函数
    if (type.render) {
        instance.render = type.render
    }

    // 执行 setup 函数
    if (type.setup) {
        // 设置当前实例
        setCurrentInstance(instance)

        try {
            // 创建 setup 上下文
            const ctx = {
                emit: (event: string, ...args: any[]) => {
                    emit(instance, event, ...args)
                },
                attrs: instance.attrs,
                slots: instance.slots
            }

            const setupResult = type.setup(instance.props, ctx)

            // 处理 setup 返回值
            handleSetupResult(instance, setupResult)
        } catch (e) {
            warn(`setup 执行错误: ${e}`)
        } finally {
            setCurrentInstance(null)
        }
    }
}

/**
 * 处理 setup 返回值
 */
function handleSetupResult(
    instance: ComponentInstance,
    setupResult: VNode | (() => VNode) | void
): void {
    if (isFunction(setupResult)) {
        // 返回渲染函数
        instance.render = setupResult
    } else if (setupResult) {
        // 返回 VNode（直接作为 render 结果）
        instance.render = () => setupResult as VNode
    }

    // 如果没有 render 函数，检查组件是否定义了 render
    if (!instance.render && !instance.type.render) {
        warn(`组件 "${instance.type.name || 'Anonymous'}" 缺少 render 函数`)
    }
}

/**
 * 触发生命周期钩子
 */
export function invokeLifecycleHook(hooks: LifecycleHook[] | null): void {
    if (!hooks) return

    for (const hook of hooks) {
        try {
            hook()
        } catch (e) {
            warn(`生命周期钩子执行错误: ${e}`)
        }
    }
}

/**
 * 注册生命周期钩子
 */
export function registerLifecycleHook(
    hooks: LifecycleHook[] | null,
    hook: LifecycleHook
): LifecycleHook[] {
    if (hooks) {
        hooks.push(hook)
        return hooks
    }
    return [hook]
}

/**
 * emit 事件触发
 */
function emit(instance: ComponentInstance, event: string, ...args: any[]): void {
    const props = instance.vnode.props

    if (!props) return

    // 转换事件名：update:modelValue -> onUpdate:modelValue
    const handlerName = `on${event.charAt(0).toUpperCase() + event.slice(1)}`
    const handler = props[handlerName]

    if (isFunction(handler)) {
        try {
            handler(...args)
        } catch (e) {
            warn(`事件处理器执行错误: ${e}`)
        }
    }
}