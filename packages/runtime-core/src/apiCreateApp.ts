/**
 * createApp API
 * 创建应用实例
 */

import { App, Plugin, Component } from './types'
import { warn, isString, isFunction } from '@fluxion-ui/shared'

// 存储渲染器实例
let renderer: {
    createApp: (rootComponent: Component) => App
} | null = null

/**
 * 设置渲染器
 * 由 runtime-dom 调用
 */
export function setRenderer(r: typeof renderer): void {
    renderer = r
}

/**
 * 创建应用
 * @param rootComponent 根组件
 */
export function createApp(rootComponent: Component): App {
    if (!renderer) {
        warn('createApp: 渲染器未初始化，请先调用 setRenderer')
        // 返回一个空的 App 对象
        return createEmptyApp()
    }

    return renderer.createApp(rootComponent)
}

/**
 * 创建空的应用实例
 */
function createEmptyApp(): App {
    return {
        mount() {
            warn('createApp: 渲染器未初始化')
        },
        unmount() {},
        component() {
            return this
        },
        use() {
            return this
        }
    }
}

/**
 * 应用实例实现
 */
export class AppImpl implements App {
    private _component: Component
    private _container: Element | null = null
    private _plugins: Plugin[] = []
    private _components: Record<string, Component> = {}

    constructor(rootComponent: Component) {
        this._component = rootComponent
    }

    mount(container: Element | string): void {
        let containerEl: Element | null = null

        if (isString(container)) {
            containerEl = document.querySelector(container)
            if (!containerEl) {
                warn(`mount: 找不到容器 "${container}"`)
                return
            }
        } else {
            containerEl = container
        }

        this._container = containerEl

        // TODO: 实际挂载逻辑由 renderer 处理
        warn('AppImpl.mount: 请使用 renderer.createApp')
    }

    unmount(): void {
        if (this._container) {
            this._container.innerHTML = ''
            ;(this._container as any).__vnode = null
            this._container = null
        }
    }

    component(name: string, component?: Component): App {
        if (component) {
            this._components[name] = component
        }
        return this
    }

    use(plugin: Plugin, options?: any): App {
        if (this._plugins.includes(plugin)) {
            warn('插件已安装')
            return this
        }

        if (isFunction(plugin.install)) {
            plugin.install(this, options)
        } else if (isFunction(plugin)) {
            ;(plugin as any)(this, options)
        }

        this._plugins.push(plugin)
        return this
    }
}