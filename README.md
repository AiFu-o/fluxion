# Fluxion 文档

Fluxion 是一个轻量级 JavaScript UI 框架，设计目标：

- **AI友好**：低 token 使用，易于理解
- **人类友好**：可维护，阅读直观

## 特色

- 🚀 **轻量级**：核心代码精简，性能优异
- 📦 **自定义 DSL**：使用 `.nui` 文件，编译时优化
- ⚡ **细粒度响应式**：基于 Signal 的响应式系统
- 🔧 **Vite 集成**：开箱即用的 Vite 插件支持

## 快速开始

```bash
# 安装
pnpm add fluxion

# 安装 Vite 插件
pnpm add -D vite-plugin-fluxion
```

## 文档目录

### 快速开始
- [安装与配置](getting-started/installation.md) - 安装 Fluxion 并配置项目
- [第一个应用](getting-started/first-app.md) - 创建你的第一个 Fluxion 应用

### 核心概念
- [.nui 文件结构](core-concepts/nui-file-structure.md) - 了解 .nui 文件的组成部分
- [Signal 响应式状态](core-concepts/signal.md) - 响应式状态管理基础
- [组件基础](core-concepts/component-basics.md) - 组件的定义与使用
- [模板语法概览](core-concepts/template-syntax.md) - 模板语法快速入门

### 响应式系统
- [Signal API](reactivity/signal-api.md) - Signal 完整 API 参考
- [Computed 计算属性](reactivity/computed.md) - 派生状态
- [Effect 副作用](reactivity/effect.md) - 响应式副作用
- [Watch 监听器](reactivity/watch.md) - 状态监听
- [Reactive 对象](reactivity/reactive.md) - 响应式对象
- [AsyncSignal 异步数据](reactivity/async-signal.md) - 异步数据处理

### 组件系统
- [组件定义](components/definition.md) - 组件的详细定义方式
- [Props 传递](components/props.md) - 组件属性传递
- [事件发射](components/events.md) - 组件事件系统
- [插槽](components/slots.md) - 内容分发
- [生命周期](components/lifecycle.md) - 组件生命周期钩子

### 模板语法
- [元素与属性](template/elements.md) - HTML/SVG 元素与属性绑定
- [插值表达式](template/interpolation.md) - 文本与表达式插值
- [条件渲染](template/conditionals.md) - if/elif/else 条件渲染
- [列表渲染](template/lists.md) - for 循环渲染
- [事件处理](template/events.md) - 事件绑定与处理
- [样式](template/styles.md) - CSS 样式定义

### 进阶主题
- [自定义渲染器](advanced/custom-renderer.md) - 平台适配与自定义渲染
- [编译器扩展](advanced/compiler-extension.md) - 编译器插件开发
- [性能优化](advanced/performance.md) - 性能优化技巧
- [TypeScript 支持](advanced/typescript.md) - TypeScript 类型支持

### API 参考
- [响应式 API](api/reactivity-api.md) - 响应式系统完整 API
- [运行时 API](api/runtime-api.md) - 运行时核心 API
- [编译器 API](api/compiler-api.md) - 编译器 API
- [工具函数](api/utils-api.md) - 工具函数参考

### 示例
- [常见模式](examples/patterns.md) - 常见开发模式
- [完整示例](examples/complete-examples.md) - 完整应用示例
- [调试技巧](examples/debugging.md) - 调试与问题排查

---

[English](./docs/en/README.md) | 中文