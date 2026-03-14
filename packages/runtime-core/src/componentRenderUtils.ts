/**
 * 组件渲染工具函数
 * 用于处理组件渲染逻辑
 */

import { ComponentInstance, VNode } from './types'
import { warn, isFunction } from '@fluxion/shared'

/**
 * 渲染组件根节点
 * 获取组件的渲染结果 VNode
 */
export function renderComponentRoot(instance: ComponentInstance): VNode | null {
    const { render } = instance

    if (!render) {
        warn('组件缺少 render 函数')
        return null
    }

    try {
        // 执行 render 函数
        // render 函数内部会访问响应式数据，自动建立依赖
        const subTree = render.call(instance)

        // 验证返回值
        if (subTree && !isVNode(subTree)) {
            warn('render 函数应该返回 VNode')
            return null
        }

        return subTree
    } catch (e) {
        warn(`render 执行错误: ${e}`)
        return null
    }
}

/**
 * 处理组件 setup 结果
 */
export function handleSetupResult(
    instance: ComponentInstance,
    result: VNode | (() => VNode) | void
): void {
    if (isFunction(result)) {
        // 返回渲染函数
        instance.render = result as () => VNode
    } else if (result && isVNode(result as VNode)) {
        // 返回 VNode，包装为 render 函数
        instance.render = () => result as VNode
    }
    // void 返回值不做处理
}

/**
 * 判断是否为 VNode
 */
function isVNode(value: any): value is VNode {
    return value && value.__v_isVNode === true
}

/**
 * 创建组件渲染副作用
 * 当响应式数据变化时自动触发更新
 */
export function createComponentEffect(
    instance: ComponentInstance,
    updateFn: () => void
): void {
    // 此函数将由 renderer 调用，使用 reactivity 的 effect
    // 这里只是占位，实际实现在 renderer 中
}