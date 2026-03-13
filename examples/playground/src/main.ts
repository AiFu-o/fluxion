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
    clearQueue
} from '@fluxion/runtime-core'

// 使用 runtime-dom 包（提供 DOM 渲染器）
import { createApp, render, patchStyle, normalizeStyle, hyphenate, camelize } from '@fluxion/runtime-dom'

// 使用 compiler-core 包（编译器核心）
import {
    // AST 创建
    createRoot,
    createElementNode,
    createTextNode,
    createInterpolationNode,
    createDirectiveNode,
    createIfNode,
    createIfBranchNode,
    createForNode,
    createSimpleExpression,
    // 转换
    transform,
    // 转换插件
    transformIf,
    transformFor,
    transformElement,
    transformText,
    // 代码生成
    generate
} from '@fluxion/compiler-core'

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

// ==================== Style 示例 (patchStyle) ====================
console.log('=== Style 示例 (patchStyle) ===')

const styleDemoBox = document.getElementById('style-demo-box')! as HTMLElement
const styleLogEl = document.getElementById('style-log')!
const styleStringBtn = document.getElementById('style-string')!
const styleObjectBtn = document.getElementById('style-object')!
const styleUpdateBtn = document.getElementById('style-update')!
const styleClearBtn = document.getElementById('style-clear')!

// 记录当前样式状态
let currentStyle: any = null

function addStyleLog(message: string): void {
    const time = new Date().toLocaleTimeString()
    styleLogEl.textContent = `[${time}] ${message}`
}

// 字符串形式样式
styleStringBtn.addEventListener('click', () => {
    const styleString = 'color: #4fc3f7; font-size: 18px; font-weight: bold; background: #1e3a5f; border: 2px solid #4fc3f7;'
    patchStyle(styleDemoBox, styleString, currentStyle)
    currentStyle = styleString

    // 演示 normalizeStyle
    const normalized = normalizeStyle(styleString)
    console.log('normalizeStyle 结果:', normalized)
    addStyleLog(`字符串样式: "${styleString.slice(0, 50)}..."`)
})

// 对象形式样式
styleObjectBtn.addEventListener('click', () => {
    const styleObject = {
        color: '#ffcc80',
        fontSize: '20px',
        background: 'linear-gradient(135deg, #2a4a7f 0%, #4a2a7f 100%)',
        borderRadius: '12px',
        padding: '20px',
        transform: 'scale(1.02)'
    }
    patchStyle(styleDemoBox, styleObject, currentStyle)
    currentStyle = styleObject

    addStyleLog(`对象样式: ${JSON.stringify(styleObject, null, 2).slice(0, 80)}...`)
})

// 更新样式（增量更新）
styleUpdateBtn.addEventListener('click', () => {
    const newStyle = {
        color: '#66bb6a',
        fontSize: 24,  // 数值会自动添加 px
        background: '#1a4a1a',
        borderRadius: '16px',
        boxShadow: '0 4px 20px rgba(102, 187, 106, 0.3)'
    }
    patchStyle(styleDemoBox, newStyle, currentStyle)
    currentStyle = newStyle

    // 演示 hyphenate 和 camelize
    console.log('hyphenate("fontSize"):', hyphenate('fontSize')) // font-size
    console.log('camelize("background-color"):', camelize('background-color')) // backgroundColor

    addStyleLog(`更新样式（数值自动加px）: fontSize: 24 → "24px"`)
})

// 清空样式
styleClearBtn.addEventListener('click', () => {
    patchStyle(styleDemoBox, null, currentStyle)
    currentStyle = null

    // 重置为初始样式
    styleDemoBox.style.cssText = 'padding: 16px; background: #2a4a7f; border-radius: 8px; text-align: center; transition: all 0.3s;'
    styleDemoBox.textContent = '样式演示区域'

    addStyleLog('样式已清空，重置为初始状态')
})

// ==================== createApp 示例 ====================
console.log('=== createApp 示例 ===')

const appDisplayEl = document.getElementById('app-display')!
const mountAppBtn = document.getElementById('mount-app')!
const unmountAppBtn = document.getElementById('unmount-app')!

// 计数器组件 - 使用 runtime-dom 的 createApp
const appCount = signal(0)

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
            h('h3', { style: { color: '#4fc3f7', marginBottom: '16px' } }, 'createApp 计数器 (runtime-dom)'),
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

// 应用实例
let isAppMounted = false

// 挂载应用
mountAppBtn.addEventListener('click', () => {
    if (isAppMounted) {
        appDisplayEl.innerHTML = '<p style="color: #ffcc80;">应用已挂载，请先卸载</p>'
        return
    }

    // 清空并创建挂载容器
    appDisplayEl.innerHTML = '<div id="app-container" style="min-height: 100px;"></div>'
    const container = document.getElementById('app-container')!

    // 使用 runtime-dom 的 createApp 创建并挂载应用
    createApp(CounterApp).mount(container)
    isAppMounted = true

    console.log('App mounted using runtime-dom')
})

// 卸载应用
unmountAppBtn.addEventListener('click', () => {
    if (!isAppMounted) {
        appDisplayEl.innerHTML = '<p style="color: #ffcc80;">没有已挂载的应用</p>'
        return
    }

    // 渲染 null 来清空容器
    const container = document.getElementById('app-container')
    if (container) {
        render(null, container)
    }
    isAppMounted = false
    appDisplayEl.innerHTML = '<p style="color: #66bb6a;">应用已卸载</p>'

    console.log('App unmounted')
})

// ==================== Compiler-Core 示例 ====================
console.log('=== Compiler-Core 示例 ===')

const compilerDisplayEl = document.getElementById('compiler-display')!
const compilerCodeEl = document.getElementById('compiler-code')! as HTMLElement
const createAstBtn = document.getElementById('create-ast')!
const transformAstBtn = document.getElementById('transform-ast')!
const generateCodeBtn = document.getElementById('generate-code')!
const compilerFullBtn = document.getElementById('compiler-full')!

// 当前 AST 状态
let currentAst: any = null

// 节点类型名称映射
const nodeTypeNames: Record<number, string> = {
    0: 'ROOT',
    1: 'ELEMENT',
    2: 'TEXT',
    3: 'INTERPOLATION',
    4: 'ATTRIBUTE',
    5: 'DIRECTIVE',
    6: 'IF',
    7: 'IF_BRANCH',
    8: 'FOR',
    9: 'SIMPLE_EXPRESSION',
    10: 'COMPOUND_EXPRESSION',
    11: 'JS_CALL_EXPRESSION',
    12: 'JS_OBJECT_EXPRESSION',
    13: 'JS_ARRAY_EXPRESSION',
    14: 'JS_FUNCTION_EXPRESSION',
    15: 'JS_CONDITIONAL_EXPRESSION'
}

// 显示 AST 结构
function displayAst(ast: any, _title: string) {
    function formatNode(node: any, indent: number = 0): string {
        if (!node) return 'null'
        const prefix = '  '.repeat(indent)
        const typeName = nodeTypeNames[node.type] || `Unknown(${node.type})`
        let result = `${prefix}${typeName}`

        if (node.tag) result += ` (${node.tag})`
        if (node.content !== undefined && typeof node.content === 'string') {
            result += `: "${node.content}"`
        } else if (node.content && node.content.content) {
            result += `: {${node.content.content}}`
        }

        if (node.children && node.children.length > 0) {
            result += '\n' + node.children.map((c: any) => formatNode(c, indent + 1)).join('\n')
        }
        if (node.branches && node.branches.length > 0) {
            result += '\n' + node.branches.map((b: any) => formatNode(b, indent + 1)).join('\n')
        }

        return result
    }

    compilerDisplayEl.innerHTML = `<pre style="margin: 0; white-space: pre-wrap;">${formatNode(ast)}</pre>`
    compilerCodeEl.textContent = JSON.stringify(ast, null, 2)
    compilerCodeEl.style.display = 'block'
}

// 创建 AST 按钮
createAstBtn.addEventListener('click', () => {
    // 创建一个简单的 AST
    // 模拟: div > p "Count: {count}" + button @click=increment
    const ast = createRoot([
        createElementNode('div', [], [
            createTextNode('Count: '),
            createInterpolationNode('count'),
            createElementNode(
                'button',
                [createDirectiveNode('click', 'increment')],
                [createTextNode('+1')]
            )
        ])
    ])

    currentAst = ast
    displayAst(ast, 'AST 已创建')
    console.log('Created AST:', ast)
})

// 转换 AST 按钮
transformAstBtn.addEventListener('click', () => {
    if (!currentAst) {
        compilerDisplayEl.innerHTML = '<p style="color: #ef5350;">请先创建 AST</p>'
        return
    }

    // 执行转换
    transform(currentAst, {
        nodeTransforms: [
            transformIf,
            transformFor,
            transformElement,
            transformText
        ]
    })

    displayAst(currentAst, 'AST 已转换')
    console.log('Transformed AST:', currentAst)
})

// 生成代码按钮
generateCodeBtn.addEventListener('click', () => {
    if (!currentAst) {
        compilerDisplayEl.innerHTML = '<p style="color: #ef5350;">请先创建并转换 AST</p>'
        return
    }

    // 生成代码
    const result = generate(currentAst)

    compilerDisplayEl.innerHTML = '<p style="color: #66bb6a;">代码生成完成！查看下方生成的代码。</p>'
    compilerCodeEl.textContent = result.code
    compilerCodeEl.style.display = 'block'

    console.log('Generated code:', result.code)
})

// 完整编译演示
compilerFullBtn.addEventListener('click', () => {
    // 模拟完整的编译流程
    // 输入: 一个包含 if/else 和 for 的模板

    // 1. 创建 AST
    // 模拟:
    // div
    //   if loading
    //     p "Loading..."
    //   else
    //     p "Loaded"
    //   for user in users
    //     div {user.name}

    const ifBranch = createIfBranchNode(
        [createElementNode('p', [], [createTextNode('Loading...')])],
        createSimpleExpression('loading', false)
    )
    const elseBranch = createIfBranchNode(
        [createElementNode('p', [], [createTextNode('Loaded')])]
    )

    const ast = createRoot([
        createElementNode('div', [], [
            createIfNode([ifBranch, elseBranch]),
            createForNode(
                createSimpleExpression('users', false),
                'user',
                [
                    createElementNode('div', [], [
                        createInterpolationNode('user.name')
                    ])
                ]
            )
        ])
    ])

    compilerDisplayEl.innerHTML = '<p style="color: #4fc3f7;">步骤 1: AST 创建完成</p>'

    // 2. 执行转换
    transform(ast, {
        nodeTransforms: [
            transformIf,
            transformFor,
            transformElement,
            transformText
        ]
    })

    compilerDisplayEl.innerHTML = '<p style="color: #ffcc80;">步骤 2: AST 转换完成</p>'

    // 3. 生成代码
    const result = generate(ast)

    compilerDisplayEl.innerHTML = '<p style="color: #66bb6a;">步骤 3: 代码生成完成！</p>'
    compilerCodeEl.textContent = result.code
    compilerCodeEl.style.display = 'block'

    console.log('Full compilation result:', result)
})

// ==================== 初始化日志 ====================
console.log('=== Playground 初始化完成 ===')
console.log('Signal:', count())
console.log('Computed:', double(), triple())
console.log('Reactive:', state.name)
console.log('VNode API:', { createVNode, h })
console.log('Scheduler API:', { nextTick, queueJob, getQueueStatus })
console.log('Runtime-DOM API:', { createApp, render, patchStyle, normalizeStyle, hyphenate, camelize })
console.log('Compiler-Core API:', {
    createRoot,
    createElementNode,
    transform,
    generate
})