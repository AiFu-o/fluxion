/**
 * 转换插件统一导出
 */

export { transformIf, isValidIfBranch, getIfBranchType } from './vIf'
export { transformFor, isValidForNode, parseForExpression } from './vFor'
export { transformElement } from './transformElement'
export { transformText, hasTextChildren, normalizeTextContent } from './transformText'

// 默认转换插件集合
import { TransformFn } from '../types'
import { transformIf } from './vIf'
import { transformFor } from './vFor'
import { transformElement } from './transformElement'
import { transformText } from './transformText'

/**
 * 获取默认的节点转换插件
 */
export function getDefaultTransforms(): TransformFn[] {
	return [
		transformIf,
		transformFor,
		transformElement,
		transformText
	]
}