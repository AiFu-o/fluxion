/**
 * 解析器模块入口
 */

// 导出语句解析器
export {
	initParserState,
	currentToken,
	advance,
	isTokenType,
	expectToken,
	skipNewlines,
	skipIndent,
	parseStatements,
	parseImportDeclaration,
	parseSignalDeclaration,
	parseFunctionDeclaration
} from './statement'

// 导出类型
export type { StatementParseResult } from './statement'

// 导出模板解析器
export { parseViewBlock } from './template'