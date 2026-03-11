/**
 * 公共类型定义
 */

export type AnyFunction = (...args: any[]) => any
export type AnyObject = Record<string, any>

// 选项类型
export interface Options {
    deep?: boolean
    immediate?: boolean
    flush?: 'pre' | 'post' | 'sync'
}