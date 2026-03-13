/**
 * Fluxion Playground - 响应式系统演示
 */

// 使用 reactivity 包直接测试
import { signal, effect, computed, reactive, watch } from '@fluxion/reactivity'

// 使用 runtime-core 包
import {
    createVNode,
    h,
    nextTick,
    queueJob,
    getQueueStatus,
    clearQueue,
    createRenderer
} from '@fluxion/runtime-core'

// ==================== Signal 示例 ====================
console.log('=== Signal 示例 ===')

const count = signal(0)


watch(count, (newVal: number, oldVal: number | undefined) => {
    console.log(`Watch: ${oldVal} -> ${newVal}`)
}, { immediate: true })

const counterEl = document.getElementById('counter')!
const incrementBtn = document.getElementById('increment')!
const resetBtn = document.getElementById('reset')!

// 更新显示
effect(() => {
    console.log(12312)
    counterEl.textContent = String(count())
})

setTimeout(()=>{console.log(count())},3000)

// 按钮事件
incrementBtn.addEventListener('click', () => {
    count.update(c => c + 1)
})

resetBtn.addEventListener('click', () => {
    count.set(0)
})

// ==================== Computed 示例 ====================
console.log('=== Computed 示例 ===')

const countForComputed = signal(5)

const double = computed(() => {
    console.log('计算 double')
    return countForComputed() * 2
})

const triple = computed(() => {
    console.log('计算 triple')
    return countForComputed() * 3
})

const countValueEl = document.getElementById('count-value')!
const doubleValueEl = document.getElementById('double-value')!
const tripleValueEl = document.getElementById('triple-value')!
const incComputedBtn = document.getElementById('inc-computed')!

// 使用 effect 追踪 computed
effect(() => {
    countValueEl.textContent = String(countForComputed())
})

effect(() => {
    doubleValueEl.textContent = String(double())
})

effect(() => {
    tripleValueEl.textContent = String(triple())
})

incComputedBtn.addEventListener('click', () => {
    countForComputed.update(c => c + 1)
})

// ==================== Reactive 示例 ====================
console.log('=== Reactive 示例 ===')

const state = reactive({
    name: 'Fluxion',
    version: '0.0.1',
    features: ['Signal', 'Computed', 'Effect', 'Reactive', 'Watch']
})

const reactiveDisplayEl = document.getElementById('reactive-display')!
const updateReactiveBtn = document.getElementById('update-reactive')!

function renderReactive() {
    reactiveDisplayEl.innerHTML = `
        <p>名称: <strong>${state.name}</strong></p>
        <p>版本: <strong>${state.version}</strong></p>
        <p>特性: ${state.features.join(', ')}</p>
    `
}

effect(() => {
    renderReactive()
})

updateReactiveBtn.addEventListener('click', () => {
    state.name = 'Fluxion Framework'
    state.version = '1.0.0'
    state.features = [...state.features, 'TypeScript', 'Vite']
})

// ==================== TODO 示例 ====================
console.log('=== TODO 示例 ===')

interface Todo {
    id: number
    text: string
    completed: boolean
}

const todos = signal<Todo[]>([
    { id: 1, text: '学习 Fluxion', completed: true },
    { id: 2, text: '实现响应式系统', completed: false },
    { id: 3, text: '创建示例项目', completed: false }
])

const todoListEl = document.getElementById('todo-list')!
const todoInputEl = document.getElementById('todo-input')! as HTMLInputElement
const addTodoBtn = document.getElementById('add-todo')!

function renderTodos() {
    const list = todos()
    todoListEl.innerHTML = list.map(todo => `
        <li class="${todo.completed ? 'completed' : ''}">
            <input type="checkbox" ${todo.completed ? 'checked' : ''} data-id="${todo.id}">
            <span>${todo.text}</span>
        </li>
    `).join('')

    // 绑定 checkbox 事件
    todoListEl.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
        checkbox.addEventListener('change', (e) => {
            const id = parseInt((e.target as HTMLInputElement).dataset.id || '0')
            todos.update(list => list.map(t => t.id === id ? { ...t, completed: !t.completed } : t))
        })
    })
}

effect(() => {
    renderTodos()
})

addTodoBtn.addEventListener('click', () => {
    const text = todoInputEl.value.trim()
    if (!text) return

    todos.update(list => [
        ...list,
        { id: Date.now(), text, completed: false }
    ])
    todoInputEl.value = ''
})

// ==================== Effect 示例 ====================
console.log('=== Effect 示例 ===')

const effectTrigger = signal(0)
const effectLogEl = document.getElementById('effect-log')!
const triggerEffectBtn = document.getElementById('trigger-effect')!

effect(() => {
    const value = effectTrigger()
    effectLogEl.textContent = `Effect 触发！当前值: ${value} (${new Date().toLocaleTimeString()})`
})

triggerEffectBtn.addEventListener('click', () => {
    effectTrigger.update(v => v + 1)
})

// ==================== Watch 示例 ====================
console.log('=== Watch 示例 ===')

const watchValue = signal('hello')

watch(watchValue, (newVal: string, oldVal: string | undefined) => {
    console.log(`Watch: ${oldVal} -> ${newVal}`)
}, { immediate: true })

// 3秒后改变值
setTimeout(() => {
    watchValue.set('world')
}, 3000)

// ==================== VNode 示例 ====================
console.log('=== VNode 示例 ===')

const vnodeDisplayEl = document.getElementById('vnode-display')!
const createVNodeBtn = document.getElementById('create-vnode')!
const createHBtn = document.getElementById('create-h')!

// 简单的 VNode 渲染函数（将 VNode 转换为真实 DOM）
function renderVNode(vnode: any): Node | null {
    if (!vnode) return null

    // 文本节点
    if (typeof vnode.children === 'string' && !vnode.type) {
        return document.createTextNode(vnode.children)
    }

    // 处理特殊类型
    if (typeof vnode.type === 'symbol') {
        const symbolName = String(vnode.type).slice(7, -1)
        if (symbolName === 'Text') {
            return document.createTextNode(vnode.children || '')
        }
        if (symbolName === 'Comment') {
            return document.createComment(vnode.children || '')
        }
        return null
    }

    // 创建元素
    const el = document.createElement(vnode.type as string)

    // 设置属性
    if (vnode.props) {
        for (const key in vnode.props) {
            const value = vnode.props[key]
            if (key === 'class') {
                el.className = value
            } else if (key === 'style' && typeof value === 'object') {
                Object.assign(el.style, value)
            } else if (key.startsWith('on') && typeof value === 'function') {
                const eventName = key.slice(2).toLowerCase()
                el.addEventListener(eventName, value)
            } else {
                el.setAttribute(key, value)
            }
        }
    }

    // 处理子节点
    if (vnode.children) {
        if (typeof vnode.children === 'string') {
            el.textContent = vnode.children
        } else if (Array.isArray(vnode.children)) {
            vnode.children.forEach((child: any) => {
                const childEl = renderVNode(child)
                if (childEl) el.appendChild(childEl)
            })
        }
    }

    // 保存 DOM 引用到 VNode
    vnode.el = el
    return el
}

// 创建 VNode 按钮
createVNodeBtn.addEventListener('click', () => {
    // 清空显示区域
    vnodeDisplayEl.innerHTML = ''

    // 使用 createVNode 创建多种类型的 VNode
    const elementVNode = createVNode('div', {
        id: 'my-div',
        class: 'rendered-vnode',
        style: { background: '#2a4a7f', padding: '16px', borderRadius: '8px', marginTop: '12px' }
    }, 'Hello VNode! 这是渲染的真实 DOM')

    // 创建嵌套结构
    const parentVNode = createVNode('section', {
        style: { background: '#1e3a5f', padding: '12px', borderRadius: '8px', marginTop: '12px' }
    }, [
        createVNode('h3', { style: { color: '#4fc3f7', marginBottom: '8px' } }, '嵌套结构示例'),
        createVNode('p', null, '这是第一段内容'),
        createVNode('p', null, '这是第二段内容')
    ])

    // 渲染到页面
    const el1 = renderVNode(elementVNode)
    const el2 = renderVNode(parentVNode)

    if (el1) vnodeDisplayEl.appendChild(el1)
    if (el2) vnodeDisplayEl.appendChild(el2)

    console.log('createVNode:', elementVNode, parentVNode)
})

// 使用 h() 函数按钮
createHBtn.addEventListener('click', () => {
    // 清空显示区域
    vnodeDisplayEl.innerHTML = ''

    // 使用 h() 函数创建 VNode（更简洁的 API）
    const simpleH = h('div', {
        style: { background: '#2a4a7f', padding: '16px', borderRadius: '8px' }
    }, '使用 h() 创建的简单元素')

    const nestedH = h('ul', {
        class: 'rendered-list',
        style: { background: '#1e3a5f', padding: '16px 16px 16px 32px', borderRadius: '8px', marginTop: '12px' }
    }, [
        h('li', { style: { margin: '4px 0' } }, 'Item 1 - h() 函数'),
        h('li', { style: { margin: '4px 0' } }, 'Item 2 - 支持嵌套'),
        h('li', { style: { margin: '4px 0' } }, 'Item 3 - 自动规范化 children')
    ])

    // 带交互的按钮
    let clickCount = 0
    const interactiveH = h('button', {
        class: 'btn',
        style: { marginTop: '12px' },
        onClick: () => {
            clickCount++
            alert(`按钮被点击了 ${clickCount} 次！`)
        }
    }, '点击我 - 带事件处理')

    // 渲染到页面
    const el1 = renderVNode(simpleH)
    const el2 = renderVNode(nestedH)
    const el3 = renderVNode(interactiveH)

    if (el1) vnodeDisplayEl.appendChild(el1)
    if (el2) vnodeDisplayEl.appendChild(el2)
    if (el3) vnodeDisplayEl.appendChild(el3)

    console.log('h() result:', simpleH, nestedH, interactiveH)
})

// ==================== 调度器示例 ====================
console.log('=== 调度器示例 ===')

const schedulerLogEl = document.getElementById('scheduler-log')!
const queueJobsBtn = document.getElementById('queue-jobs')!
const clearQueueBtn = document.getElementById('clear-queue')!

// 日志记录
let schedulerLogs: string[] = []

function addSchedulerLog(message: string): void {
    const time = new Date().toLocaleTimeString()
    schedulerLogs.unshift(`[${time}] ${message}`)
    if (schedulerLogs.length > 10) {
        schedulerLogs = schedulerLogs.slice(0, 10)
    }
    schedulerLogEl.textContent = schedulerLogs.join('\n')
}

// 初始状态
addSchedulerLog('调度器就绪')

queueJobsBtn.addEventListener('click', () => {
    // 添加多个任务到队列
    addSchedulerLog('添加 3 个任务到队列...')

    let taskOrder = 0

    // 任务 1
    queueJob(() => {
        taskOrder++
        addSchedulerLog(`任务 1 执行 (顺序: ${taskOrder})`)
    })

    // 任务 2 - 带有 ID 的任务会被排序
    const task2 = () => {
        taskOrder++
        addSchedulerLog(`任务 2 执行 (顺序: ${taskOrder})`)
    }
    ;(task2 as any).id = 1
    queueJob(task2)

    // 任务 3
    queueJob(() => {
        taskOrder++
        addSchedulerLog(`任务 3 执行 (顺序: ${taskOrder})`)
    })

    // 显示队列状态
    const status = getQueueStatus()
    addSchedulerLog(`队列状态: ${status.length} 个任务`)

    // nextTick 演示
    nextTick(() => {
        addSchedulerLog('nextTick 回调执行 - DOM 已更新')
    })
})

clearQueueBtn.addEventListener('click', () => {
    clearQueue()
    schedulerLogs = []
    addSchedulerLog('队列已清空')
})

// ==================== createApp 示例 ====================
console.log('=== createApp 示例 ===')

const appDisplayEl = document.getElementById('app-display')!
const mountAppBtn = document.getElementById('mount-app')!
const unmountAppBtn = document.getElementById('unmount-app')!

// 创建简单的 DOM 渲染器
const domRenderer = createRenderer({
    createElement(tag: string): Element {
        return document.createElement(tag)
    },
    createText(text: string): Text {
        return document.createTextNode(text)
    },
    createComment(text: string): Comment {
        return document.createComment(text)
    },
    insert(child: Node, parent: Node, anchor?: Node | null): void {
        parent.insertBefore(child, anchor || null)
    },
    remove(child: Node): void {
        const parent = child.parentNode
        if (parent) parent.removeChild(child)
    },
    setElementText(el: Element, text: string): void {
        el.textContent = text
    },
    patchProp(el: Element, key: string, value: any, _prevValue: any): void {
        if (key === 'class') {
            el.className = value || ''
        } else if (key === 'style') {
            if (typeof value === 'string') {
                el.setAttribute('style', value)
            } else if (value) {
                for (const k in value) {
                    (el as any).style[k] = value[k]
                }
            }
        } else if (key.startsWith('on')) {
            const eventName = key.slice(2).toLowerCase()
            if (value) {
                el.addEventListener(eventName, value)
            }
        } else if (value == null) {
            el.removeAttribute(key)
        } else {
            el.setAttribute(key, value)
        }
    },
    parentNode(node: Node): Node | null {
        return node.parentNode
    },
    nextSibling(node: Node): Node | null {
        return node.nextSibling
    },
    setText(node: Text, text: string): void {
        node.textContent = text
    }
})

// 计数器组件
const appCount = signal(0)
let appInstance: ReturnType<typeof domRenderer.createApp> | null = null

const CounterApp = {
    name: 'CounterApp',
    setup() {
        const increment = () => appCount.update(c => c + 1)
        const decrement = () => appCount.update(c => c - 1)

        return () => h('div', {
            style: {
                background: 'linear-gradient(135deg, #1e3a5f 0%, #2a4a7f 100%)',
                padding: '20px',
                borderRadius: '12px',
                textAlign: 'center'
            }
        }, [
            h('h3', { style: { color: '#4fc3f7', marginBottom: '16px' } }, 'createApp 计数器'),
            h('div', {
                style: { fontSize: '48px', color: '#4fc3f7', marginBottom: '16px' }
            }, String(appCount())),
            h('div', null, [
                h('button', {
                    class: 'btn',
                    style: { marginRight: '8px' },
                    onClick: decrement
                }, '- 减少'),
                h('button', {
                    class: 'btn btn-success',
                    onClick: increment
                }, '+ 增加')
            ])
        ])
    }
}

// 挂载应用
mountAppBtn.addEventListener('click', () => {
    if (appInstance) {
        appDisplayEl.innerHTML = '<p style="color: #ffcc80;">应用已挂载，请先卸载</p>'
        return
    }

    // 清空并创建挂载容器
    appDisplayEl.innerHTML = '<div id="app-container" style="min-height: 100px;"></div>'
    const container = document.getElementById('app-container')!

    // 创建并挂载应用
    appInstance = domRenderer.createApp(CounterApp)
    appInstance.mount(container)

    console.log('App mounted:', appInstance)
})

// 卸载应用
unmountAppBtn.addEventListener('click', () => {
    if (!appInstance) {
        appDisplayEl.innerHTML = '<p style="color: #ffcc80;">没有已挂载的应用</p>'
        return
    }

    appInstance.unmount()
    appInstance = null
    appDisplayEl.innerHTML = '<p style="color: #66bb6a;">应用已卸载</p>'

    console.log('App unmounted')
})

// ==================== 初始化日志 ====================
console.log('=== Playground 初始化完成 ===')
console.log('Signal:', count())
console.log('Computed:', double(), triple())
console.log('Reactive:', state.name)
console.log('VNode API:', { createVNode, h })
console.log('Scheduler API:', { nextTick, queueJob, getQueueStatus })
console.log('Renderer API:', { createRenderer })