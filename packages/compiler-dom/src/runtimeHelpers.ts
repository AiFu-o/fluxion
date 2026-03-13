/**
 * DOM 运行时辅助函数
 * 定义 DOM 特定的运行时辅助函数符号
 */

/**
 * DOM 运行时辅助函数名称枚举
 */
export const enum DOMRuntimeHelperNames {
	// VNode 创建
	CREATE_ELEMENT_VNODE = 'h',
	CREATE_TEXT_VNODE = 'createTextVNode',

	// 工具函数
	NORMALIZE_CLASS = 'normalizeClass',
	NORMALIZE_STYLE = 'normalizeStyle',
	NORMALIZE_PROPS = 'normalizeProps',

	// 事件处理
	WITH_MODIFIERS = 'withModifiers',
	WITH_KEYS = 'withKeys'
}

/**
 * DOM 运行时辅助函数符号
 */
export const DOM_RUNTIME_HELPERS = {
	// VNode 创建
	CREATE_ELEMENT_VNODE: Symbol(DOMRuntimeHelperNames.CREATE_ELEMENT_VNODE),
	CREATE_TEXT_VNODE: Symbol(DOMRuntimeHelperNames.CREATE_TEXT_VNODE),

	// 工具函数
	NORMALIZE_CLASS: Symbol(DOMRuntimeHelperNames.NORMALIZE_CLASS),
	NORMALIZE_STYLE: Symbol(DOMRuntimeHelperNames.NORMALIZE_STYLE),
	NORMALIZE_PROPS: Symbol(DOMRuntimeHelperNames.NORMALIZE_PROPS),

	// 事件处理
	WITH_MODIFIERS: Symbol(DOMRuntimeHelperNames.WITH_MODIFIERS),
	WITH_KEYS: Symbol(DOMRuntimeHelperNames.WITH_KEYS)
} as const

/**
 * 获取 DOM 运行时辅助函数名称
 * @param symbol 辅助函数符号
 */
export function getDOMRuntimeHelperName(symbol: symbol): string {
	for (const [key, value] of Object.entries(DOM_RUNTIME_HELPERS)) {
		if (value === symbol) {
			return DOMRuntimeHelperNames[key as keyof typeof DOMRuntimeHelperNames]
		}
	}
	return ''
}

/**
 * 判断是否为 DOM 运行时辅助函数
 * @param value 要判断的值
 */
export function isDOMRuntimeHelper(value: unknown): value is symbol {
	return typeof value === 'symbol' && Object.values(DOM_RUNTIME_HELPERS).includes(value)
}

/**
 * 事件修饰符列表
 */
export const EVENT_MODIFIERS = {
	// 事件修饰符
	stop: 'stop',
	prevent: 'prevent',
	capture: 'capture',
	self: 'self',
	once: 'once',
	passive: 'passive',
	native: 'native',

	// 鼠标按钮修饰符
	middle: 'middle',
	right: 'right',
	left: 'left'
} as const

/**
 * 按键修饰符列表
 */
export const KEY_MODIFIERS = {
	// 按键别名
	enter: 'enter',
	tab: 'tab',
	esc: 'esc',
	space: 'space',
	up: 'up',
	down: 'down',
	left: 'left',
	right: 'right',
	delete: 'delete',
	backspace: 'backspace',
	insert: 'insert',

	// 系统修饰键
	ctrl: 'ctrl',
	alt: 'alt',
	shift: 'shift',
	meta: 'meta'
} as const

/**
 * 判断是否为事件修饰符
 * @param modifier 修饰符名称
 */
export function isEventModifier(modifier: string): boolean {
	return modifier in EVENT_MODIFIERS
}

/**
 * 判断是否为按键修饰符
 * @param modifier 修饰符名称
 */
export function isKeyModifier(modifier: string): boolean {
	return modifier in KEY_MODIFIERS
}

/**
 * 获取修饰符类型
 * @param modifier 修饰符名称
 */
export function getModifierType(modifier: string): 'event' | 'key' | 'unknown' {
	if (isEventModifier(modifier)) {
		return 'event'
	}
	if (isKeyModifier(modifier)) {
		return 'key'
	}
	return 'unknown'
}