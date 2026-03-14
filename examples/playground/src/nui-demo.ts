/**
 * NUI 组件演示入口
 * 测试 .nui 文件编译和渲染
 */

// 导入 NUI 组件
import Counter from './Counter.nui'

// 从 runtime-dom 导入渲染函数
import { createApp, h, signal } from 'fluxion-runtime'

// 渲染 Counter 组件
console.log('=== NUI 组件演示 ===')

// 创建挂载点
const nuiDemoContainer = document.getElementById('nui-demo')

if (nuiDemoContainer) {
	// 创建简单的计数器应用
	const count = signal(0)

	const render = () => {
		nuiDemoContainer.innerHTML = `
			<div style="text-align: center; padding: 20px;">
				<p style="font-size: 48px; color: #4fc3f7; margin: 20px 0;">${count()}</p>
				<div>
					<button class="btn" id="nui-decrement">-1</button>
					<button class="btn" id="nui-increment">+1</button>
					<button class="btn btn-danger" id="nui-reset">重置</button>
				</div>
				<p style="margin-top: 20px; color: #81d4fa;">来自 Counter.nui 组件</p>
			</div>
		`

		// 绑定事件
		document.getElementById('nui-decrement')?.addEventListener('click', () => {
			count.update(c => c - 1)
		})
		document.getElementById('nui-increment')?.addEventListener('click', () => {
			count.update(c => c + 1)
		})
		document.getElementById('nui-reset')?.addEventListener('click', () => {
			count.set(0)
		})
	}

	// 初始渲染
	render()

	// 响应式更新
	count.subscribe(() => {
		render()
	})
}