/**
 * Fluxion Playground - 响应式系统演示
 */

// 使用 runtime-dom 包（提供 DOM 渲染器）
import { createApp} from '@fluxion/runtime-dom'
import App from "./App.nui"
const app = createApp(App).mount('#app')