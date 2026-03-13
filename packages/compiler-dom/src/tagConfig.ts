/**
 * DOM 标签配置
 * 定义 HTML/SVG 标签列表，提供标签判断函数
 */

/**
 * HTML 标签集合
 */
export const HTML_TAGS = new Set([
	'html', 'body', 'base', 'head', 'link', 'meta', 'style', 'title',
	'address', 'article', 'aside', 'footer', 'header', 'h1', 'h2', 'h3',
	'h4', 'h5', 'h6', 'hgroup', 'nav', 'section', 'div', 'dd', 'dl', 'dt',
	'figcaption', 'figure', 'hr', 'img', 'li', 'main', 'ol', 'p', 'pre', 'ul',
	'a', 'b', 'abbr', 'bdi', 'bdo', 'br', 'cite', 'code', 'data', 'dfn', 'em',
	'i', 'kbd', 'mark', 'q', 'rp', 'rt', 'ruby', 's', 'samp', 'small', 'span',
	'strong', 'sub', 'sup', 'time', 'u', 'var', 'wbr', 'area', 'audio', 'map',
	'track', 'video', 'embed', 'object', 'param', 'source', 'canvas', 'script',
	'noscript', 'del', 'ins', 'caption', 'col', 'colgroup', 'table', 'thead',
	'tbody', 'tfoot', 'td', 'th', 'tr', 'button', 'datalist', 'fieldset',
	'form', 'input', 'label', 'legend', 'meter', 'optgroup', 'option', 'output',
	'progress', 'select', 'textarea', 'details', 'dialog', 'menu', 'summary',
	'template', 'blockquote', 'iframe', 'tfoot'
])

/**
 * SVG 标签集合
 */
export const SVG_TAGS = new Set([
	'svg', 'animate', 'animateMotion', 'animateTransform', 'circle', 'clipPath',
	'defs', 'desc', 'ellipse', 'feBlend', 'feColorMatrix', 'feComponentTransfer',
	'feComposite', 'feConvolveMatrix', 'feDiffuseLighting', 'feDisplacementMap',
	'feDistantLight', 'feDropShadow', 'feFlood', 'feFuncA', 'feFuncB', 'feFuncG',
	'feFuncR', 'feGaussianBlur', 'feImage', 'feMerge', 'feMergeNode', 'feMorphology',
	'feOffset', 'fePointLight', 'feSpecularLighting', 'feSpotLight', 'feTile',
	'feTurbulence', 'filter', 'foreignObject', 'g', 'image', 'line', 'linearGradient',
	'marker', 'mask', 'metadata', 'mpath', 'path', 'pattern', 'polygon', 'polyline',
	'radialGradient', 'rect', 'set', 'stop', 'switch', 'symbol', 'text', 'textPath',
	'tspan', 'use', 'view'
])

/**
 * 自闭合（void）标签集合
 * 这些标签不需要闭合标签
 */
export const VOID_TAGS = new Set([
	'area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta',
	'param', 'source', 'track', 'wbr'
])

/**
 * 判断是否为 HTML 标签
 * @param tag 标签名
 */
export function isHTMLTag(tag: string): boolean {
	return HTML_TAGS.has(tag)
}

/**
 * 判断是否为 SVG 标签
 * @param tag 标签名
 */
export function isSVGTag(tag: string): boolean {
	return SVG_TAGS.has(tag)
}

/**
 * 判断是否为自闭合标签
 * @param tag 标签名
 */
export function isVoidTag(tag: string): boolean {
	return VOID_TAGS.has(tag)
}

/**
 * 获取标签类型
 * @param tag 标签名
 * @returns 'html' | 'svg' | 'component'
 */
export function getTagType(tag: string): 'html' | 'svg' | 'component' {
	// 先检查 SVG（因为 SVG 标签也可能是有效的 HTML）
	if (isSVGTag(tag)) {
		return 'svg'
	}

	// 再检查 HTML
	if (isHTMLTag(tag)) {
		return 'html'
	}

	// 否则认为是组件
	return 'component'
}

/**
 * 判断是否为原生标签（HTML 或 SVG）
 * @param tag 标签名
 */
export function isNativeTag(tag: string): boolean {
	return isHTMLTag(tag) || isSVGTag(tag)
}

/**
 * 判断是否为组件标签
 * 组件标签以大写字母开头或包含连字符
 * @param tag 标签名
 */
export function isComponentTag(tag: string): boolean {
	// 如果是原生标签，不是组件
	if (isNativeTag(tag)) {
		return false
	}

	// 以大写字母开头或包含连字符的是组件
	return /^[A-Z]/.test(tag) || tag.includes('-')
}