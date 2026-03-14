# Fluxion 框架使用文档规划

## 背景

Fluxion 是一个轻量级 JavaScript UI 框架，设计目标：
- **AI友好**：低 token 使用，易于理解
- **人类友好**：可维护，阅读直观

框架使用自定义 DSL（`.nui` 文件）编译为渲染函数。当前框架已实现完整功能，但缺乏系统性的使用文档。

---

## 文档章节规划

### 第一部分：快速开始 (docs/getting-started/)

#### 1. 安装与配置 (`installation.md`)
- 通过 npm/pnpm 安装
- CDN 使用方式
- Vite 项目集成
- 最小化示例

#### 2. 第一个应用 (`first-app.md`)
- 创建 Hello World
- 理解 .nui 文件结构
- 运行和调试

---

### 第二部分：核心概念 (docs/core-concepts/)

#### 3. .nui 文件结构 (`nui-file-structure.md`)
- import 声明
- signal 声明
- function 声明
- view 块
- style 块

#### 4. Signal 响应式状态 (`signal.md`)
- 创建 Signal
- 读取和更新值
- Signal vs 传统状态

#### 5. 组件基础 (`component-basics.md`)
- 组件定义
- 组件使用
- Props 传递

#### 6. 模板语法概览 (`template-syntax.md`)
- 元素声明
- 插值表达式
- 属性绑定

---

### 第三部分：响应式系统 (docs/reactivity/)

#### 7. Signal API (`signal-api.md`)
- `signal(value)` 创建
- `.set(value)` 设置
- `.update(fn)` 更新
- `readonlySignal()` 只读

#### 8. Computed 计算属性 (`computed.md`)
- 创建计算属性
- 缓存机制
- 可写计算属性
- `refresh()` 强制刷新

#### 9. Effect 副作用 (`effect.md`)
- 创建副作用
- 清理函数
- 停止追踪
- 调度时机

#### 10. Watch 监听器 (`watch.md`)
- `watch()` 监听
- `watchEffect()` 自动追踪
- `watchDeep()` 深度监听
- 配置选项

#### 11. Reactive 对象 (`reactive.md`)
- `reactive()` 创建
- `shallowReactive()` 浅层
- `readonly()` 只读
- `toRaw()` 转换原始

#### 12. AsyncSignal 异步数据 (`async-signal.md`)
- 创建异步信号
- loading/error 状态
- 重新加载
- 缓存策略

---

### 第四部分：组件系统 (docs/components/)

#### 13. 组件定义 (`definition.md`)
- setup 函数
- render 函数
- 组件上下文

#### 14. Props 传递 (`props.md`)
- 定义 Props
- 接收 Props
- Props 验证

#### 15. 事件发射 (`events.md`)
- emit 函数
- 定义 emits
- 事件处理

#### 16. 插槽 (`slots.md`)
- 默认插槽
- 具名插槽
- 作用域插槽

#### 17. 生命周期 (`lifecycle.md`)
- 生命周期钩子
- 注册方式
- 使用场景

---

### 第五部分：模板语法详解 (docs/template/)

#### 18. 元素与属性 (`elements.md`)
- HTML 元素
- SVG 元素
- 属性绑定
- class 和 style

#### 19. 插值表达式 (`interpolation.md`)
- 文本插值
- 表达式插值
- 转义规则

#### 20. 条件渲染 (`conditionals.md`)
- if 语句
- elif 语句
- else 语句

#### 21. 列表渲染 (`lists.md`)
- for 语句
- 迭代语法
- key 处理

#### 22. 事件处理 (`events.md`)
- 事件绑定 (@click 等)
- 事件修饰符
- 事件参数

#### 23. 样式 (`styles.md`)
- style 块
- CSS 语法
- 作用域样式

---

### 第六部分：进阶主题 (docs/advanced/)

#### 24. 自定义渲染器 (`custom-renderer.md`)
- createRenderer API
- 渲染器选项
- 平台适配

#### 25. 编译器扩展 (`compiler-extension.md`)
- AST 结构
- 自定义转换
- 代码生成

#### 26. 性能优化 (`performance.md`)
- 响应式优化
- 渲染优化
- 批量更新

#### 27. TypeScript 支持 (`typescript.md`)
- 类型定义
- 类型推断
- 最佳实践

---

### 第七部分：API 参考 (docs/api/)

#### 28. 响应式 API (`reactivity-api.md`)
- signal
- computed
- effect
- watch
- reactive
- asyncSignal

#### 29. 运行时 API (`runtime-api.md`)
- createApp
- h
- createVNode
- render
- nextTick

#### 30. 编译器 API (`compiler-api.md`)
- compile
- parse
- tokenize
- generate

#### 31. 工具函数 (`utils-api.md`)
- 类型检查
- 工具方法
- 警告函数

---

### 第八部分：示例与最佳实践 (docs/examples/)

#### 32. 常见模式 (`patterns.md`)
- 计数器
- 表单处理
- 列表过滤
- 异步数据

#### 33. 完整示例 (`complete-examples.md`)
- Todo 应用
- 用户管理
- 博客系统

#### 34. 调试技巧 (`debugging.md`)
- 开发工具
- 常见问题
- 错误处理

---

## 实施计划

### 阶段一：基础文档（优先级高）
1. 安装与配置
2. 第一个应用
3. .nui 文件结构
4. Signal 响应式状态
5. Signal API

### 阶段二：核心文档
1. Computed 计算属性
2. Effect 副作用
3. 组件基础
4. Props 传递
5. 事件处理
6. 模板语法各章节

### 阶段三：进阶文档
1. Watch 监听器
2. Reactive 对象
3. AsyncSignal 异步数据
4. 插槽
5. 生命周期

### 阶段四：参考文档
1. API 参考各章节
2. 自定义渲染器
3. 编译器扩展
4. 性能优化
5. TypeScript 支持

### 阶段五：示例文档
1. 常见模式
2. 完整示例
3. 调试技巧

---

## 文档规范

1. **语言**：所有文档使用中文编写
2. **代码示例**：每个概念配套可运行的代码示例
3. **结构**：
   - 概述
   - 基础用法
   - API 说明
   - 示例代码
   - 注意事项
4. **格式**：使用 Markdown 格式，代码块指定语言
5. **交叉引用**：相关章节之间添加链接

---

## 文件组织

```
docs/
├── README.md                 # 文档首页
├── getting-started/          # 快速开始
│   ├── installation.md
│   └── first-app.md
├── core-concepts/            # 核心概念
│   ├── nui-file-structure.md
│   ├── signal.md
│   ├── component-basics.md
│   └── template-syntax.md
├── reactivity/               # 响应式系统
│   ├── signal-api.md
│   ├── computed.md
│   ├── effect.md
│   ├── watch.md
│   ├── reactive.md
│   └── async-signal.md
├── components/               # 组件系统
│   ├── definition.md
│   ├── props.md
│   ├── events.md
│   ├── slots.md
│   └── lifecycle.md
├── template/                 # 模板语法
│   ├── elements.md
│   ├── interpolation.md
│   ├── conditionals.md
│   ├── lists.md
│   ├── events.md
│   └── styles.md
├── advanced/                 # 进阶主题
│   ├── custom-renderer.md
│   ├── compiler-extension.md
│   ├── performance.md
│   └── typescript.md
├── api/                      # API 参考
│   ├── reactivity-api.md
│   ├── runtime-api.md
│   ├── compiler-api.md
│   └── utils-api.md
└── examples/                 # 示例
    ├── patterns.md
    ├── complete-examples.md
    └── debugging.md
```