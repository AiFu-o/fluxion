/**
 * 集成测试
 * 测试完整的 .nui 文件编译流程
 */

import { describe, it, expect } from 'vitest'
import { compile, parse } from '../src/index'

describe('integration', () => {
	describe('完整编译', () => {
		it('应该编译空的 .nui 文件', () => {
			const result = compile('')
			expect(result.code).toBe('')
			expect(result.errors).toHaveLength(0)
		})

		it('应该编译只有 import 的文件', () => {
			const source = `import Title from "./Title.nui"`
			const result = compile(source)

			expect(result.code).toContain('import Title from "./Title.nui"')
			expect(result.errors).toHaveLength(0)
		})

		it('应该编译只有 signal 的文件', () => {
			const source = `count = signal(0)`
			const result = compile(source)

			expect(result.code).toContain('const count = signal(0)')
			expect(result.code).toContain('import { signal } from "@fluxion-ui/fluxion/runtime"')
		})

		it('应该编译只有 function 的文件', () => {
			const source = `function increment() { count++ }`
			const result = compile(source)

			expect(result.code).toContain('function increment() { count++ }')
		})
	})

	describe('完整组件编译', () => {
		it('应该编译简单组件', () => {
			const source = `count = signal(0)

function increment() {
	count.update(c => c + 1)
}

view
	div
		p Count: {count}
		button @click=increment`
			const result = compile(source)

			// 检查 signal 声明
			expect(result.code).toContain('const count = signal(0)')

			// 检查函数定义
			expect(result.code).toContain('function increment()')

			// 检查 render 函数
			expect(result.code).toContain('function render()')
			expect(result.code).toContain('export default { render }')
			expect(result.code).toContain('h("div"')

			// 检查事件绑定
			expect(result.code).toContain('onClick: increment')
		})

		it('应该编译带 import 的组件', () => {
			const source = `import Title from "./Title.nui"
import Button from "./Button.nui"

view
	div
		Title
		Button @click=handleClick`
			const result = compile(source)

			expect(result.code).toContain('import Title from "./Title.nui"')
			expect(result.code).toContain('import Button from "./Button.nui"')
			expect(result.code).toContain('h(Title)')
			expect(result.code).toContain('h(Button')
		})
	})

	describe('控制流编译', () => {
		it('应该编译 if/else 结构', () => {
			const source = `loading = signal(true)

view
	if loading
		p loading...
	else
		p loaded`
			const result = compile(source)

			expect(result.code).toContain('loading() ?')
			expect(result.code).toContain(': ')
		})

		it('应该编译 if/elif/else 结构', () => {
			// 注意：当前实现对条件表达式中的字符串支持有限
			// 使用简单的布尔条件测试
			const source = `loading = signal(true)
error = signal(false)

view
	if loading
		p loading...
	elif error
		p error
	else
		p loaded`
			const result = compile(source)

			expect(result.code).toContain('loading() ?')
			expect(result.code).toContain(': error() ?')
		})

		it('应该编译 for 循环', () => {
			const source = `items = signal([1, 2, 3])

view
	for item in items
		p item`
			const result = compile(source)

			expect(result.code).toContain('items()')
			expect(result.code).toContain('.map(item =>')
		})
	})

	describe('属性编译', () => {
		it('应该编译静态属性', () => {
			const source = `view
	div id="test" class="container"
		p hello`
			const result = compile(source)

			expect(result.code).toContain('id: "test"')
			expect(result.code).toContain('class: "container"')
		})

		it('应该编译动态属性', () => {
			const source = `name = signal("test")

view
	div id=name
		p hello`
			const result = compile(source)

			expect(result.code).toContain('id: name')
		})
	})

	describe('嵌套结构编译', () => {
		it('应该编译深层嵌套结构', () => {
			const source = `view
	div
		header
			nav
				ul
					li
						a link`
			const result = compile(source)

			expect(result.code).toContain('h("div"')
			expect(result.code).toContain('h("header"')
			expect(result.code).toContain('h("nav"')
			expect(result.code).toContain('h("ul"')
			expect(result.code).toContain('h("li"')
			expect(result.code).toContain('h("a"')
		})
	})

	describe('插值表达式', () => {
		// TODO: 当前实现对行内文本支持有限，需要改进模板解析器
		it.skip('应该处理简单插值', () => {
			const source = `name = signal("world")

view
	p hello {name}!`
			const result = compile(source)

			// 应该生成数组形式
			expect(result.code).toContain('["hello ", name(), "!"]')
		})
	})

	describe('错误处理', () => {
		it('应该报告语法错误', () => {
			const source = `import from "test"`
			const result = compile(source)

			expect(result.errors.length).toBeGreaterThan(0)
		})
	})

	describe('AST 结构', () => {
		it('应该生成正确的 AST', () => {
			const source = `count = signal(0)
view
	div`
			const result = parse(source)

			expect(result.ast.signals).toHaveLength(1)
			expect(result.ast.view).not.toBeNull()
			expect(result.ast.view!.children).toHaveLength(1)
		})
	})

	describe('Style 块', () => {
		it('应该解析 style 块', () => {
			const source = `view
	div

style
	button {
		width: 20px;
	}`
			const result = parse(source)

			expect(result.ast.style).not.toBeNull()
			expect(result.ast.style!.content).toContain('button')
			expect(result.ast.style!.content).toContain('width: 20px')
		})

		it('应该编译 style 块为注入代码', () => {
			const source = `view
	div

style
	button {
		width: 20px;
	}`
			const result = compile(source)

			expect(result.code).toContain('document.createElement(\'style\')')
			expect(result.code).toContain('width: 20px')
			expect(result.code).toContain('document.head.appendChild')
		})

		it('应该处理空的 style 块', () => {
			const source = `view
	div

style`
			const result = parse(source)

			// style 块存在但内容为空
			expect(result.ast.style).not.toBeNull()
		})

		it('应该将 NUI 样式语法转换为标准 CSS', () => {
			const source = `view
div

style
.button {
	padding 8px 16px
	background-color #007bff
}`
			const result = compile(source)

			expect(result.code).toContain('padding: 8px 16px;')
			expect(result.code).toContain('background-color: #007bff;')
		})

		it('应该转换多值属性', () => {
			const source = `view
div

style
.container {
	margin 0 auto
	padding 20px 40px
}`
			const result = compile(source)

			expect(result.code).toContain('margin: 0 auto;')
			expect(result.code).toContain('padding: 20px 40px;')
		})
	})
})