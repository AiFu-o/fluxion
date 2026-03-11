/**
 * 通用工具函数
 */

/**
 * 判断值是否为函数
 */
export function isFunction(value: unknown): value is Function {
    return typeof value === 'function'
}

/**
 * 判断值是否为对象
 */
export function isObject(value: unknown): value is object {
    return value !== null && typeof value === 'object'
}

/**
 * 判断值是否为数组
 */
export function isArray(value: unknown): value is Array<unknown> {
    return Array.isArray(value)
}

/**
 * 判断值是否为 Promise
 */
export function isPromise(value: unknown): value is Promise<unknown> {
    return value instanceof Promise
}

/**
 * 判断值是否为字符串
 */
export function isString(value: unknown): value is string {
    return typeof value === 'string'
}

/**
 * 判断对象是否有指定属性
 */
export function hasOwn(obj: object, key: string | symbol): boolean {
    return Object.prototype.hasOwnProperty.call(obj, key)
}

/**
 * 判断值是否为 Map
 */
export function isMap(value: unknown): value is Map<unknown, unknown> {
    return value instanceof Map
}

/**
 * 判断值是否为 Set
 */
export function isSet(value: unknown): value is Set<unknown> {
    return value instanceof Set
}

/**
 * 判断值是否为整数
 */
export function isInteger(value: unknown): boolean {
    return Number.isInteger(value)
}

/**
 * 尝试将值转换为数组
 */
export function toArray<T>(value: T | T[]): T[] {
    return isArray(value) ? value : [value]
}