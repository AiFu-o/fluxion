/**
 * 运行时辅助函数符号
 * 用于在编译时标识需要导入的运行时函数
 */

/**
 * 运行时辅助函数名称映射
 */
export const enum RuntimeHelperNames {
	// VNode 创建
	CREATE_ELEMENT_VNODE = 'h',
	CREATE_TEXT_VNODE = 'createTextVNode',
	CREATE_COMMENT_VNODE = 'createCommentVNode',

	// 组件相关
	RESOLVE_COMPONENT = 'resolveComponent',
	RESOLVE_DIRECTIVE = 'resolveDirective',

	// 渲染相关
	RENDER_LIST = 'renderList',
	RENDER_SLOT = 'renderSlot',

	// 工具函数
	MERGE_PROPS = 'mergeProps',
	NORMALIZE_CLASS = 'normalizeClass',
	NORMALIZE_STYLE = 'normalizeStyle',
	NORMALIZE_PROPS = 'normalizeProps',

	// 事件处理
	WITH_DIRECTIVES = 'withDirectives',
	WITH_CTX = 'withCtx'
}

/**
 * 运行时辅助函数符号
 */
export const runtimeHelpers = {
	// VNode 创建
	CREATE_ELEMENT_VNODE: Symbol(RuntimeHelperNames.CREATE_ELEMENT_VNODE),
	CREATE_TEXT_VNODE: Symbol(RuntimeHelperNames.CREATE_TEXT_VNODE),
	CREATE_COMMENT_VNODE: Symbol(RuntimeHelperNames.CREATE_COMMENT_VNODE),

	// 组件相关
	RESOLVE_COMPONENT: Symbol(RuntimeHelperNames.RESOLVE_COMPONENT),
	RESOLVE_DIRECTIVE: Symbol(RuntimeHelperNames.RESOLVE_DIRECTIVE),

	// 渲染相关
	RENDER_LIST: Symbol(RuntimeHelperNames.RENDER_LIST),
	RENDER_SLOT: Symbol(RuntimeHelperNames.RENDER_SLOT),

	// 工具函数
	MERGE_PROPS: Symbol(RuntimeHelperNames.MERGE_PROPS),
	NORMALIZE_CLASS: Symbol(RuntimeHelperNames.NORMALIZE_CLASS),
	NORMALIZE_STYLE: Symbol(RuntimeHelperNames.NORMALIZE_STYLE),
	NORMALIZE_PROPS: Symbol(RuntimeHelperNames.NORMALIZE_PROPS),

	// 事件处理
	WITH_DIRECTIVES: Symbol(RuntimeHelperNames.WITH_DIRECTIVES),
	WITH_CTX: Symbol(RuntimeHelperNames.WITH_CTX)
} as const

/**
 * 获取运行时辅助函数名称
 */
export function getRuntimeHelperName(symbol: symbol): string {
	for (const [key, value] of Object.entries(runtimeHelpers)) {
		if (value === symbol) {
			return RuntimeHelperNames[key as keyof typeof RuntimeHelperNames]
		}
	}
	return ''
}

/**
 * 判断是否为运行时辅助函数
 */
export function isRuntimeHelper(value: unknown): value is symbol {
	return typeof value === 'symbol' && Object.values(runtimeHelpers).includes(value)
}