/**
 * SVG 支持
 * 提供 SVG 元素的创建和属性处理
 */

import { warn } from '@fluxion-ui/shared'

/**
 * SVG 命名空间
 */
export const SVG_NAMESPACE = 'http://www.w3.org/2000/svg'

/**
 * XLINK 命名空间
 */
export const XLINK_NAMESPACE = 'http://www.w3.org/1999/xlink'

/**
 * XML 命名空间
 */
export const XML_NAMESPACE = 'http://www.w3.org/XML/1998/namespace'

/**
 * SVG 标签列表
 */
const SVG_TAGS = new Set([
    'svg',
    'animate',
    'animateMotion',
    'animateTransform',
    'circle',
    'clipPath',
    'defs',
    'desc',
    'ellipse',
    'feBlend',
    'feColorMatrix',
    'feComponentTransfer',
    'feComposite',
    'feConvolveMatrix',
    'feDiffuseLighting',
    'feDisplacementMap',
    'feDistantLight',
    'feDropShadow',
    'feFlood',
    'feFuncA',
    'feFuncB',
    'feFuncG',
    'feFuncR',
    'feGaussianBlur',
    'feImage',
    'feMerge',
    'feMergeNode',
    'feMorphology',
    'feOffset',
    'fePointLight',
    'feSpecularLighting',
    'feSpotLight',
    'feTile',
    'feTurbulence',
    'filter',
    'foreignObject',
    'g',
    'image',
    'line',
    'linearGradient',
    'marker',
    'mask',
    'metadata',
    'mpath',
    'path',
    'pattern',
    'polygon',
    'polyline',
    'radialGradient',
    'rect',
    'set',
    'stop',
    'switch',
    'symbol',
    'text',
    'textPath',
    'tspan',
    'use',
    'view'
])

/**
 * 判断是否为 SVG 标签
 * @param tag 标签名
 */
export function isSVGTag(tag: string): boolean {
    return SVG_TAGS.has(tag)
}

/**
 * 创建 SVG 元素
 * @param tag 标签名
 */
export function createSVGElement(tag: string): SVGElement {
    if (!tag) {
        warn('createSVGElement: 标签名不能为空')
        tag = 'svg'
    }
    return document.createElementNS(SVG_NAMESPACE, tag) as SVGElement
}

/**
 * 需要使用 XLINK 命名空间的属性
 */
const XLINK_ATTRIBUTES = new Set([
    'xlink:href',
    'xlink:title',
    'xlink:role',
    'xlink:arcrole',
    'xlink:show',
    'xlink:actuate',
    'xlink:type',
    'xlink:label'
])

/**
 * 判断是否为 XLINK 属性
 * @param attr 属性名
 */
export function isXlinkAttr(attr: string): boolean {
    return XLINK_ATTRIBUTES.has(attr)
}

/**
 * 需要使用 XML 命名空间的属性
 */
const XML_ATTRIBUTES = new Set([
    'xml:space',
    'xml:lang',
    'xml:base'
])

/**
 * 判断是否为 XML 属性
 * @param attr 属性名
 */
export function isXMLAttr(attr: string): boolean {
    return XML_ATTRIBUTES.has(attr)
}

/**
 * 设置 SVG 属性
 * @param el SVG 元素
 * @param key 属性名
 * @param value 属性值
 */
export function setSVGAttr(
    el: SVGElement,
    key: string,
    value: any
): void {
    if (!el) {
        warn('setSVGAttr: 元素不能为空')
        return
    }

    if (value == null || value === false) {
        // 移除属性
        el.removeAttribute(key)
        return
    }

    // XLINK 属性
    if (isXlinkAttr(key)) {
        // 提取本地名称：xlink:href -> href
        const localName = key.slice(6) // 'xlink:'.length = 6
        el.setAttributeNS(XLINK_NAMESPACE, localName, value)
        return
    }

    // XML 属性
    if (isXMLAttr(key)) {
        // 提取本地名称：xml:space -> space
        const localName = key.slice(4) // 'xml:'.length = 4
        el.setAttributeNS(XML_NAMESPACE, localName, value)
        return
    }

    // 普通属性（但在 SVG 命名空间中）
    el.setAttribute(key, value)
}

/**
 * 获取 SVG 元素的命名空间
 * @param el 元素
 */
export function getSVGNamespace(el: Element): string | null {
    return el.namespaceURI
}

/**
 * 判断元素是否在 SVG 上下文中
 * @param el 元素
 */
export function isInSVG(el: Element): boolean {
    let current: Element | null = el
    while (current) {
        if (current.tagName.toLowerCase() === 'svg') {
            return true
        }
        current = current.parentElement
    }
    return false
}