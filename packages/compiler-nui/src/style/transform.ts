/**
 * NUI 样式语法转换器
 * 将 `属性名 值` 语法转换为标准 CSS `属性名: 值;`
 */

/**
 * 检测内容是否需要转换
 * 如果已经包含分号，可能已经是标准 CSS
 */
function needsTransform(content: string): boolean {
	// 检查是否有属性行不包含冒号和分号
	// 简单判断：如果内容中有类似 "padding 20px" 这样的行
	const lines = content.split('\n')
	let inBlock = false
	let braceDepth = 0

	for (const line of lines) {
		const trimmed = line.trim()

		// 空行或注释
		if (!trimmed || trimmed.startsWith('//') || trimmed.startsWith('/*')) {
			continue
		}

		// 规则块开始
		if (trimmed.endsWith('{')) {
			inBlock = true
			braceDepth++
			continue
		}

		// 规则块结束
		if (trimmed === '}') {
			braceDepth--
			inBlock = braceDepth > 0
			continue
		}

		// 在规则块内
		if (inBlock && !trimmed.endsWith('{') && !trimmed.endsWith('}')) {
			// 检查是否缺少冒号（NUI 语法特征）
			if (!trimmed.includes(':')) {
				return true
			}
		}
	}

	return false
}

/**
 * 转换单个属性行
 * "padding 20px" -> "padding: 20px;"
 * "margin 8px 16px" -> "margin: 8px 16px;"
 */
function transformPropertyLine(line: string): string {
	// 检测是否已经包含冒号（已经是标准格式）
	if (line.includes(':')) {
		// 可能已经有分号，检查并添加
		return line.endsWith(';') ? line : line + ';'
	}

	// 找到第一个空格，分割属性名和值
	const firstSpace = line.indexOf(' ')
	if (firstSpace === -1) {
		// 只有属性名，没有值（不完整，但保持原样）
		return line
	}

	const propName = line.slice(0, firstSpace)
	const propValue = line.slice(firstSpace + 1)

	return `${propName}: ${propValue};`
}

/**
 * 将 NUI 样式语法转换为标准 CSS
 * @param content NUI 样式内容
 * @returns 标准 CSS 内容
 */
export function transformNuiStyle(content: string): string {
	// 如果不需要转换，直接返回
	if (!needsTransform(content)) {
		return content
	}

	const lines = content.split('\n')
	const result: string[] = []
	let inBlock = false
	let braceDepth = 0

	for (const line of lines) {
		const trimmed = line.trim()

		// 空行，保持原样
		if (!trimmed) {
			result.push(line)
			continue
		}

		// 注释，保持原样
		if (trimmed.startsWith('//') || trimmed.startsWith('/*')) {
			result.push(line)
			continue
		}

		// 规则块开始
		if (trimmed.endsWith('{')) {
			inBlock = true
			braceDepth++
			result.push(line)
			continue
		}

		// 规则块结束
		if (trimmed === '}') {
			braceDepth--
			inBlock = braceDepth > 0
			result.push(line)
			continue
		}

		// 在规则块内，转换属性
		if (inBlock && !trimmed.endsWith('{') && !trimmed.endsWith('}')) {
			// 保留原始缩进
			const indent = line.slice(0, line.indexOf(trimmed))
			const transformed = transformPropertyLine(trimmed)
			result.push(indent + transformed)
		} else {
			// 选择器等，保持原样
			result.push(line)
		}
	}

	return result.join('\n')
}