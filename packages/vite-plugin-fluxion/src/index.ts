/**
 * vite-plugin-fluxion
 * Vite 插件，用于编译 .nui 文件
 */

import { Plugin, ResolvedConfig } from 'vite'
import { compile, NuiCompileResult } from '@fluxion-ui/compiler-nui'
import { warn } from '@fluxion-ui/shared'

/**
 * 插件选项
 */
export interface FluxionPluginOptions {
	// 是否在开发模式
	isProduction?: boolean
	// 自定义 .nui 文件扩展名
	include?: string[]
}

/**
 * 创建 Fluxion Vite 插件
 */
export function fluxionPlugin(options: FluxionPluginOptions = {}): Plugin {
	const { include = ['.nui'] } = options

	let config: ResolvedConfig

	/**
	 * 检查文件是否应该被处理
	 */
	function isNuiFile(id: string): boolean {
		return include.some(ext => id.endsWith(ext))
	}

	return {
		name: 'fluxion',

		configResolved(resolvedConfig) {
			config = resolvedConfig
		},

		/**
		 * 解析 .nui 文件的导入
		 * 使 Vite 能够正确处理 .nui 文件
		 */
		enforce: 'pre',

		/**
		 * 转换 .nui 文件为 JavaScript
		 */
		transform(code, id) {
			if (!isNuiFile(id)) {
				return null
			}

			try {
				// 编译 .nui 文件
				const result = compile(code, {
					filename: id,
					isBrowser: true
				})

				// 报告编译错误
				if (result.errors.length > 0) {
					for (const error of result.errors) {
						warn(`[fluxion] ${id}: ${error.message}`)
					}
					// 在开发模式下，返回错误信息
					if (config.mode === 'development') {
						return {
							code: `export default function() { return document.createElement('div'); }`,
							map: null
						}
					}
					throw result.errors[0]
				}

				return {
					code: result.code,
					map: null
				}
			} catch (e: any) {
				warn(`[fluxion] Failed to compile ${id}: ${e.message}`)
				throw e
			}
		},

		/**
		 * 处理 HMR
		 */
		handleHotUpdate({ file, server }) {
			if (isNuiFile(file)) {
				// 触发完全重载
				server.ws.send({
					type: 'full-reload',
					path: file
				})
				return []
			}
		}
	}
}

export default fluxionPlugin