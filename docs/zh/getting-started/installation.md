# 安装与配置

本章节介绍如何安装 Fluxion 并配置项目环境。

## 安装方式

### 通过包管理器安装

推荐使用 pnpm 安装：

```bash
pnpm add @fluxion-ui/fluxion
```

或使用 npm：

```bash
npm install @fluxion-ui/fluxion
```

或使用 yarn：

```bash
yarn add @fluxion-ui/fluxion
```

### Vite 插件安装

如果使用 Vite 构建项目，需要安装 Vite 插件：

```bash
pnpm add -D @fluxion-ui/vite-plugin-fluxion
```

## 项目配置

### Vite 项目集成

在 `vite.config.js` 中添加 Fluxion 插件：

```javascript
import { defineConfig } from 'vite'
import { fluxionPlugin } from '@fluxion-ui/vite-plugin-fluxion'

export default defineConfig({
  plugins: [
    fluxionPlugin()
  ]
})
```

#### 插件选项

```typescript
interface FluxionPluginOptions {
  isProduction?: boolean   // 生产模式标记
  include?: string[]       // 包含的文件扩展名，默认 ['.nui']
}
```

示例：

```javascript
import { defineConfig } from 'vite'
import { fluxionPlugin } from '@fluxion-ui/vite-plugin-fluxion'

export default defineConfig({
  plugins: [
    fluxionPlugin({
      isProduction: process.env.NODE_ENV === 'production',
      include: ['.nui']
    })
  ]
})
```

### TypeScript 支持

Fluxion 提供 TypeScript 类型定义，无需额外配置即可获得类型提示。

如需为 `.nui` 文件添加类型声明，创建 `fluxion.d.ts`：

```typescript
declare module '*.nui' {
  import { Component } from '@fluxion-ui/fluxion'
  const component: Component
  export default component
}
```

## CDN 使用方式

可通过 CDN 直接在浏览器中使用 Fluxion：

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Fluxion App</title>
</head>
<body>
  <div id="app"></div>
  <script src="https://unpkg.com/@fluxion-ui/fluxion/dist/fluxion.iife.js"></script>
  <script>
    const { createApp, signal, h } = Fluxion

    const App = {
      setup() {
        const count = signal(0)
        return () => h('div', null, [
          h('p', null, `Count: ${count()}`),
          h('button', { onClick: () => count.set(count() + 1) }, 'Increment')
        ])
      }
    }

    createApp(App).mount('#app')
  </script>
</body>
</html>
```

## 最小化示例

### 项目结构

```
my-fluxion-app/
├── index.html
├── package.json
├── vite.config.js
└── src/
    └── App.nui
```

### index.html

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Fluxion App</title>
</head>
<body>
  <div id="app"></div>
  <script type="module" src="/src/main.js"></script>
</body>
</html>
```

### src/main.js

```javascript
import { createApp } from '@fluxion-ui/fluxion'
import App from './App.nui'

createApp(App).mount('#app')
```

### src/App.nui

```nui
count = signal(0)

function increment() {
	count.update(c => c + 1)
}

view
div
	p Count: {count}
	button @click=increment
		Increment

style
button {
	padding 8px 16px
	background-color #007bff
	color white
	border none
	border-radius 4px
	cursor pointer
}

button:hover {
	background-color #0056b3
}
```

### package.json

```json
{
  "name": "my-fluxion-app",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "@fluxion-ui/fluxion": "latest"
  },
  "devDependencies": {
    "vite": "^5.0.0",
    "@fluxion-ui/vite-plugin-fluxion": "latest"
  }
}
```

## 运行项目

```bash
# 安装依赖
pnpm install

# 启动开发服务器
pnpm dev

# 构建生产版本
pnpm build

# 预览生产版本
pnpm preview
```

## 下一步

- [第一个应用](first-app.md) - 创建你的第一个 Fluxion 应用
- [.nui 文件结构](../core-concepts/nui-file-structure.md) - 了解 .nui 文件的组成