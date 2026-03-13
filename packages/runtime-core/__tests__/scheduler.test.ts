/**
 * 调度器测试
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { queueJob, flushJobs, nextTick, clearQueue, getQueueStatus } from '../src/scheduler'

describe('scheduler', () => {
    beforeEach(() => {
        clearQueue()
    })

    describe('queueJob', () => {
        it('应该添加任务到队列', () => {
            const job = vi.fn()
            queueJob(job)

            const status = getQueueStatus()
            expect(status.length).toBe(1)
        })

        it('应该自动去重', () => {
            const job = vi.fn()
            queueJob(job)
            queueJob(job)

            const status = getQueueStatus()
            expect(status.length).toBe(1)
        })

        it('不同任务应该都能添加', () => {
            const job1 = vi.fn()
            const job2 = vi.fn()
            queueJob(job1)
            queueJob(job2)

            const status = getQueueStatus()
            expect(status.length).toBe(2)
        })
    })

    describe('flushJobs', () => {
        it('应该执行所有任务', async () => {
            const job1 = vi.fn()
            const job2 = vi.fn()

            queueJob(job1)
            queueJob(job2)

            await flushJobs()

            expect(job1).toHaveBeenCalled()
            expect(job2).toHaveBeenCalled()
        })

        it('执行后应该清空队列', async () => {
            const job = vi.fn()
            queueJob(job)

            await flushJobs()

            const status = getQueueStatus()
            expect(status.length).toBe(0)
        })

        it('任务执行错误不应该中断其他任务', async () => {
            const job1 = vi.fn(() => {
                throw new Error('test error')
            })
            const job2 = vi.fn()

            queueJob(job1)
            queueJob(job2)

            await flushJobs()

            expect(job1).toHaveBeenCalled()
            expect(job2).toHaveBeenCalled()
        })
    })

    describe('nextTick', () => {
        it('应该返回 Promise', () => {
            const promise = nextTick()
            expect(promise).toBeInstanceOf(Promise)
        })

        it('回调应该在下一个 tick 执行', async () => {
            const order: number[] = []

            nextTick(() => {
                order.push(2)
            })
            order.push(1)

            await nextTick()

            expect(order).toEqual([1, 2])
        })

        it('支持链式调用', async () => {
            const result = await nextTick()
                .then(() => 'first')
                .then((v) => v + ' second')

            expect(result).toBe('first second')
        })
    })

    describe('clearQueue', () => {
        it('应该清空队列', () => {
            queueJob(() => {})
            queueJob(() => {})

            clearQueue()

            const status = getQueueStatus()
            expect(status.length).toBe(0)
        })
    })

    describe('getQueueStatus', () => {
        it('应该返回队列状态', () => {
            queueJob(() => {})

            const status = getQueueStatus()

            expect(status).toHaveProperty('length')
            expect(status).toHaveProperty('isFlushing')
            expect(status).toHaveProperty('isFlushPending')
        })
    })
})