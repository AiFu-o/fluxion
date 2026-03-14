/**
 * 更新调度器
 * 实现批量更新和 nextTick 功能
 */

import { SchedulerJob } from './types'
import { warn } from '@fluxion-ui/shared'

/**
 * 任务队列
 */
const queue: SchedulerJob[] = []

/**
 * 是否正在刷新队列
 */
let isFlushing = false

/**
 * 是否已安排刷新
 */
let isFlushPending = false

/**
 * 待处理的 Promise
 */
let resolvedPromise: Promise<void> | null = null

/**
 * 当前刷新的索引
 */
let flushIndex = 0

/**
 * 获取当前时间
 */
const getTime = () => performance.now()

/**
 * 队列任务
 * 将任务添加到队列，自动去重并安排刷新
 */
export function queueJob(job: SchedulerJob): void {
    // 如果任务不在队列中，添加到队列
    if (!queue.includes(job)) {
        queue.push(job)
        // 安排刷新
        queueFlush()
    }
}

/**
 * 安排队列刷新
 */
function queueFlush(): void {
    // 如果没有正在刷新且没有安排刷新
    if (!isFlushing && !isFlushPending) {
        isFlushPending = true
        // 使用 Promise 微任务刷新
        resolvedPromise = Promise.resolve().then(flushJobs)
    }
}

/**
 * 刷新队列
 */
export function flushJobs(): void {
    isFlushPending = false
    isFlushing = true

    // 排序任务（如果有 id）
    queue.sort((a, b) => {
        const idA = a.id ?? Infinity
        const idB = b.id ?? Infinity
        return idA - idB
    })

    try {
        // 执行所有任务
        for (flushIndex = 0; flushIndex < queue.length; flushIndex++) {
            const job = queue[flushIndex]
            try {
                job()
            } catch (e) {
                warn(`任务执行错误: ${e}`)
            }
        }
    } finally {
        // 重置
        flushIndex = 0
        queue.length = 0
        isFlushing = false
        resolvedPromise = null
    }
}

/**
 * nextTick
 * 在下一个 DOM 更新周期后执行回调
 */
export function nextTick(fn?: () => void): Promise<void> {
    const p = resolvedPromise || Promise.resolve()

    if (fn) {
        return p.then(fn)
    }

    return p
}

/**
 * 清空队列
 */
export function clearQueue(): void {
    queue.length = 0
    isFlushPending = false
    isFlushing = false
}

/**
 * 获取队列状态（用于调试）
 */
export function getQueueStatus(): {
    length: number
    isFlushing: boolean
    isFlushPending: boolean
} {
    return {
        length: queue.length,
        isFlushing,
        isFlushPending
    }
}