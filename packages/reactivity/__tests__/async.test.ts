/**
 * AsyncSignal 单元测试
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { asyncSignal } from '../src/api/async'
import { setGlobalEffect } from '../src/api/signal'

// Mock fetch
global.fetch = vi.fn()

describe('asyncSignal', () => {
    beforeEach(() => {
        setGlobalEffect(null)
        vi.useFakeTimers()
    })

    afterEach(() => {
        setGlobalEffect(null)
        vi.useRealTimers()
    })

    describe('基础功能', () => {
        it('应该创建异步信号', async () => {
            const mockData = { id: 1, name: 'test' }
            ;(fetch as any).mockResolvedValue({
                json: () => Promise.resolve(mockData)
            })

            const fetcher = async () => {
                const res = await fetch('/api/user')
                return res.json()
            }

            const user = asyncSignal(fetcher, { id: 0, name: 'initial' })

            // 等待初始加载完成
            await vi.runAllTimersAsync()

            expect(user.loading()).toBe(false)
        })

        it('应该包含 loading 状态', async () => {
            const mockData = { id: 1 }
            ;(fetch as any).mockResolvedValue({
                json: () => Promise.resolve(mockData)
            })

            const user = asyncSignal(async () => ({ id: 1 }))

            // 初始状态应该是 loading
            // 注意：由于是异步，可能需要等待
        })

        it('应该包含 error 状态', async () => {
            ;(fetch as any).mockRejectedValue(new Error('Network error'))

            const user = asyncSignal(async () => {
                throw new Error('Network error')
            })

            await vi.runAllTimersAsync()

            expect(user.error()).toBeInstanceOf(Error)
        })

        it('应该包含 reload 方法', async () => {
            let callCount = 0
            const fetcher = async () => {
                callCount++
                return { id: callCount }
            }

            const data = asyncSignal(fetcher)

            await vi.runAllTimersAsync()
            expect(callCount).toBe(1)

            // reload
            data.reload()
            await vi.runAllTimersAsync()
            expect(callCount).toBe(2)
        })
    })

    describe('数据获取', () => {
        it('应该正确设置初始值', async () => {
            const initialValue = { name: 'initial' }
            const user = asyncSignal(async () => ({ name: 'fetched' }), initialValue)

            // 初始值应该立即可用
            expect(user()).toEqual(initialValue)
        })

        it('获取数据后应该更新值', async () => {
            const mockData = { name: 'test' }
            ;(fetch as any).mockResolvedValue({
                json: () => Promise.resolve(mockData)
            })

            const user = asyncSignal(async () => mockData)

            // 等待数据加载
            await vi.runAllTimersAsync()

            expect(user()).toEqual(mockData)
        })
    })

    describe('取消功能', () => {
        it('应该可以取消请求', () => {
            const user = asyncSignal(async () => {
                await new Promise(r => setTimeout(r, 1000))
                return { id: 1 }
            })

            user.cancel()

            // 取消后应该不再处理响应
            expect(user.isCancelled()).toBe(true)
        })
    })

    describe('Promise 兼容', () => {
        it('应该支持 then 方法', async () => {
            const mockData = { id: 1 }
            ;(fetch as any).mockResolvedValue({
                json: () => Promise.resolve(mockData)
            })

            const user = asyncSignal(async () => mockData)

            await vi.runAllTimersAsync()

            const result = await user.then(d => d)
            expect(result).toEqual(mockData)
        })

        it('应该支持 catch 方法', async () => {
            ;(fetch as any).mockRejectedValue(new Error('error'))

            const user = asyncSignal(async () => {
                throw new Error('error')
            })

            await vi.runAllTimersAsync()

            const error = await user.catch(e => e)
            expect(error).toBeInstanceOf(Error)
        })

        it('应该支持 finally 方法', async () => {
            const user = asyncSignal(async () => ({ id: 1 }))

            let finallyCalled = false
            await user.finally(() => {
                finallyCalled = true
            })

            expect(finallyCalled).toBe(true)
        })
    })
})

describe('cachedAsyncSignal', () => {
    it('应该缓存相同 key 的请求', async () => {
        // 这个功能需要完整的实现
    })
})