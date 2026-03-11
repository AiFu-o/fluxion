/**
 * Fluxion Playground - 响应式系统演示
 */

// 使用 reactivity 包直接测试
import { signal, effect, computed, reactive, watch, setGlobalEffect, getGlobalEffect } from '@fluxion/reactivity'

// ==================== Signal 示例 ====================
console.log('=== Signal 示例 ===')

const count = signal(0)


watch(count, (newVal, oldVal) => {
    console.log(`Watch: ${oldVal} -> ${newVal}`)
}, { immediate: true })

const counterEl = document.getElementById('counter')
const incrementBtn = document.getElementById('increment')
const resetBtn = document.getElementById('reset')

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

const countValueEl = document.getElementById('count-value')
const doubleValueEl = document.getElementById('double-value')
const tripleValueEl = document.getElementById('triple-value')
const incComputedBtn = document.getElementById('inc-computed')

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

const reactiveDisplayEl = document.getElementById('reactive-display')
const updateReactiveBtn = document.getElementById('update-reactive')

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

const todoListEl = document.getElementById('todo-list')
const todoInputEl = document.getElementById('todo-input') as HTMLInputElement
const addTodoBtn = document.getElementById('add-todo')

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
const effectLogEl = document.getElementById('effect-log')
const triggerEffectBtn = document.getElementById('trigger-effect')

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

watch(watchValue, (newVal, oldVal) => {
    console.log(`Watch: ${oldVal} -> ${newVal}`)
}, { immediate: true })

// 3秒后改变值
setTimeout(() => {
    watchValue.set('world')
}, 3000)

console.log('=== Playground 初始化完成 ===')
console.log('Signal:', count())
console.log('Computed:', double(), triple())
console.log('Reactive:', state.name)