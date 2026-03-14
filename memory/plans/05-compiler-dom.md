# compiler-dom 开发计划

## 一、背景与目标

### 编译流程位置
```
.nui file → compiler-nui (parser) → AST → compiler-core (AST transform) → compiler-dom (DOM transform) → codegen → render function
```

### 核心职责
compiler-dom 负责处理 **DOM 平台特定** 的编译逻辑：

1. **事件指令规范化**：将 `@click` 转换为 `onClick` 格式
2. **DOM 属性处理**：处理 `value`、`checked`、`innerHTML` 等 DOM 特有属性
3. **class/style 绑定**：合并静态和动态 class/style
4. **SVG 元素识别**：识别 SVG 标签并设置正确的命名空间
5. **提供编译入口**：整合所有转换插件，提供 `compile` 函数

### 依赖关系
- 依赖 `@fluxion/compiler-core`：复用 AST 类型、转换核心、代码生成
- 依赖 `@fluxion/shared`：公共工具函数

---

## 二、模块结构

```
packages/compiler-dom/
├── src/
│   ├── index.ts                    # 主入口
│   ├── compile.ts                  # compile 函数
│   ├── transforms/
│   │   ├── index.ts                # 转换插件导出
│   │   ├── transformElement.ts     # DOM 元素转换
│   │   └── transformStyle.ts       # 样式转换
│   ├── runtimeHelpers.ts           # DOM 运行时辅助函数
│   └── tagConfig.ts                # DOM 标签配置
├── __tests__/
│   ├── compile.test.ts
│   ├── transforms/
│   │   ├── transformElement.test.ts
│   │   ├── transformEvent.test.ts
│   │   └── transformStyle.test.ts
│   └── tagConfig.test.ts
├── package.json
└── tsconfig.json
```

---

## 三、功能实现

### 3.1 tagConfig.ts - 标签配置

**功能**：定义 HTML/SVG 标签列表，提供标签判断函数

```typescript
// 常量
export const HTML_TAGS: Set<string>    // HTML 标签集合
export const SVG_TAGS: Set<string>     // SVG 标签集合
export const VOID_TAGS: Set<string>    // 自闭合标签集合

// 函数
export function isHTMLTag(tag: string): boolean
export function isSVGTag(tag: string): boolean
export function isVoidTag(tag: string): boolean
export function getTagType(tag: string): 'html' | 'svg' | 'component'
```

**关键文件参考**：
- [runtime-dom/src/modules/svg.ts](packages/runtime-dom/src/modules/svg.ts) - 已有 SVG 标签列表

### 3.2 runtimeHelpers.ts - 运行时辅助函数

**功能**：定义 DOM 特定的运行时辅助函数符号

```typescript
export const DOM_RUNTIME_HELPERS = {
  NORMALIZE_CLASS: Symbol('normalizeClass'),
  NORMALIZE_STYLE: Symbol('normalizeStyle'),
  NORMALIZE_PROPS: Symbol('normalizeProps'),
  WITH_MODIFIERS: Symbol('withModifiers'),
  WITH_KEYS: Symbol('withKeys')
}
```

### 3.3 transforms/transformElement.ts - DOM 元素转换

**功能**：扩展 compiler-core 的 transformElement，添加 DOM 特定处理

**关键差异**（与 compiler-core 版本相比）：

| 功能 | compiler-core | compiler-dom |
|------|---------------|--------------|
| 事件处理 | 基本事件列表 | 完整事件 + 修饰符 |
| class 处理 | 无 | 合并静态/动态 class |
| style 处理 | 无 | 合并静态/动态 style |
| DOM 属性 | 无 | 识别 DOM 属性（value, checked 等） |
| SVG 支持 | 无 | 识别 SVG 标签 |

**核心函数**：

```typescript
/**
 * 处理事件指令
 * @click -> onClick
 * @click.stop -> withModifiers(handler, ['stop'])
 */
function processEventDirective(directive: DirectiveNode, context: TransformContext)

/**
 * 处理 class 绑定
 * 合并静态 class 和动态 :class
 */
function processClassBinding(staticClass: string, dynamicClass: string)

/**
 * 处理 style 绑定
 * 合并静态 style 和动态 :style
 */
function processStyleBinding(staticStyle: string, dynamicStyle: string)
```

### 3.4 compile.ts - 编译入口

**功能**：整合所有转换，提供完整编译流程

```typescript
export interface DOMCompilerOptions extends CompilerOptions {
  isCustomElement?: (tag: string) => boolean
}

export function compile(ast: RootNode, options?: DOMCompilerOptions): CodegenResult
```

**流程**：
1. 创建转换上下文
2. 注册 DOM 特定转换插件
3. 调用 compiler-core 的 transform
4. 调用 compiler-core 的 generate

---

## 四、类型定义

```typescript
/**
 * DOM 编译器选项
 */
export interface DOMCompilerOptions extends CompilerOptions {
  /** 自定义元素判断函数 */
  isCustomElement?: (tag: string) => boolean
  /** 空白处理策略 */
  whitespace?: 'condense' | 'preserve'
}

/**
 * DOM 转换上下文（扩展 TransformContext）
 */
export interface DOMTransformContext extends TransformContext {
  /** 是否在 SVG 上下文中 */
  inSVG: boolean
  /** 自定义元素判断函数 */
  isCustomElement?: (tag: string) => boolean
}
```

---

## 五、实现步骤

### 阶段 1：基础结构
- [ ] 创建 `packages/compiler-dom` 目录
- [ ] 配置 `package.json` 和 `tsconfig.json`
- [ ] 创建 `src/index.ts` 主入口
- [ ] 实现 `tagConfig.ts` 标签配置

### 阶段 2：运行时辅助
- [ ] 实现 `runtimeHelpers.ts`
- [ ] 定义 DOM 特定的辅助函数符号

### 阶段 3：转换插件
- [ ] 实现 `transforms/transformElement.ts`
- [ ] 添加事件修饰符处理
- [ ] 添加 class/style 绑定处理
- [ ] 添加 SVG 支持

### 阶段 4：编译入口
- [ ] 实现 `compile.ts`
- [ ] 整合所有转换插件

### 阶段 5：测试
- [ ] 编写 `tagConfig.test.ts`
- [ ] 编写 `transformElement.test.ts`
- [ ] 编写 `transformEvent.test.ts`
- [ ] 编写 `transformStyle.test.ts`
- [ ] 编写 `compile.test.ts`

---

## 六、测试策略

### 测试文件组织
```
__tests__/
├── compile.test.ts              # 编译入口集成测试
├── transforms/
│   ├── transformElement.test.ts # 元素转换
│   ├── transformEvent.test.ts   # 事件处理
│   └── transformStyle.test.ts   # 样式处理
└── tagConfig.test.ts            # 标签配置
```

### 关键测试用例

**标签配置测试**：
- 识别 HTML 标签
- 识别 SVG 标签
- 识别组件标签

**事件转换测试**：
- `@click` → `onClick`
- `@click.stop` → `withModifiers(handler, ['stop'])`
- `@keyup.enter` → `withKeys(handler, ['enter'])`

**元素转换测试**：
- HTML 元素生成 `h("div", ...)`
- 组件生成 `h(Component, ...)`
- SVG 元素正确识别
- class/style 合并

---

## 七、关键文件

### 需要参考的文件
| 文件 | 用途 |
|------|------|
| [compiler-core/src/transforms/transformElement.ts](packages/compiler-core/src/transforms/transformElement.ts) | 扩展基础元素转换 |
| [compiler-core/src/types.ts](packages/compiler-core/src/types.ts) | 类型定义参考 |
| [runtime-dom/src/patchProp/index.ts](packages/runtime-dom/src/patchProp/index.ts) | 属性处理逻辑 |
| [runtime-dom/src/modules/svg.ts](packages/runtime-dom/src/modules/svg.ts) | SVG 标签列表 |

### 需要创建的文件
| 文件 | 说明 |
|------|------|
| `src/index.ts` | 主入口 |
| `src/compile.ts` | 编译入口 |
| `src/transforms/transformElement.ts` | DOM 元素转换 |
| `src/transforms/transformStyle.ts` | 样式转换 |
| `src/runtimeHelpers.ts` | 运行时辅助函数 |
| `src/tagConfig.ts` | 标签配置 |

---

## 八、验证方法

1. **单元测试**：运行 `pnpm run test` 确保所有测试通过
2. **类型检查**：运行 `pnpm run build` 确保 TypeScript 编译通过
3. **集成测试**：在 playground 中使用 compiler-dom 编译 .nui 文件