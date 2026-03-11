/**
 * 警告和错误信息函数
 */

/**
 * 输出警告信息
 */
export function warn(message: string, ...args: unknown[]): void {
    console.warn(`[Fluxion Warn] ${message}`, ...args)
}

/**
 * 输出错误信息
 */
export function error(message: string, ...args: unknown[]): void {
    console.error(`[Fluxion Error] ${message}`, ...args)
}

/**
 * 输出调试信息（仅在开发环境）
 */
export function debug(message: string, ...args: unknown[]): void {
    if (process.env?.NODE_ENV !== 'production') {
        console.debug(`[Fluxion Debug] ${message}`, ...args)
    }
}