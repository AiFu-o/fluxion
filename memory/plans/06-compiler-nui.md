# compiler-nui 开发计划

## 一、背景

compiler-nui 是 Fluxion 框架的 DSL 解析器，负责将 `.nui` 文件解析为 AST，然后转换为 compiler-core 兼容的格式，最终生成渲染函数代码。

**目标**：实现完整的 `.nui` 文件编译能力，支持：
- import 语句解析
- signal/asyncSignal 响应式声明
- 函数定义
- 缩进式模板语法（view 块）
- 控制流（if/elif/else, for...in）
- 事件指令（@click）
- 组件使用

---

## 二、包结构设计

```
packages/compiler-nui/
├── src/
│   ├── index.ts                    # 包入口
│   ├── types.ts                    # 类型定义
│   ├── parse.ts                    # 解析器入口
│   ├── tokenizer.ts                # 词法分析器
│   ├── parser/
│   │   ├── index.ts                # 解析器主逻辑
│   │   ├── state.ts                # 解析器状态
│   │   ├── statement.ts            # 语句解析
│   │   └── template.ts             # 模板解析
│   └── codegen/
│       └── index.ts                # 模块代码生成
├── __tests__/
│   ├── tokenizer.test.ts           # 词法分析测试
│   ├── statement.test.ts           # 语句解析测试
│   ├── template.test.ts            # 模板解析测试
│   ├── codegen.test.ts             # 代码生成测试
│   └── integration.test.ts         # 集成测试
├── package.json
└── tsconfig.json
```

---

## 三、核心模块设计

### 3.1 词法分析器 (tokenizer.ts)

**职责**：将源码分割为 Token 流，处理缩进敏感语法

**Token 类型**：
```typescript
enum TokenType {
  INDENT,       // 缩进增加
  DEDENT,       // 缩进减少
  NEWLINE,      // 换行
  IDENTIFIER,   // 标识符
  KEYWORD,      // 关键词 (import, function, if, else, for, view, style)
  STRING,       // 字符串 "..."
  NUMBER,       // 数字
  OPERATOR,     // 操作符 = , ( ) { }
  AT,           // @ 事件符号
  INTERPOLATION_START,  // { 插值开始
  INTERPOLATION_END,    // } 插值结束
  EOF           // 结束
}
```

**核心逻辑**：
- 维护缩进栈，检测缩进变化生成 INDENT/DEDENT
- 识别行首关键词分发到不同解析器
- 处理插值表达式 `{expression}`

### 3.2 语句解析器

**解析内容**：

| 语句类型 | 语法示例 | 生成的 AST |
|---------|---------|-----------|
| import | `import Title from "./Title.nui"` | ImportDeclaration |
| signal | `count = signal(0)` | SignalDeclaration |
| asyncSignal | `users = asyncSignal(fetchUsers)` | SignalDeclaration (isAsync: true) |
| function | `function increment() { ... }` | FunctionDeclaration |

**复用 compiler-core AST**：模板部分直接使用 `ElementNode`, `TextNode`, `InterpolationNode`, `IfNode`, `ForNode` 等类型

### 3.3 模板解析器

**解析 view 块的缩进式语法**：

```
view
    div
        p hello           → TextNode
        p Count {count}   → InterpolationNode
        if loading        → IfNode
            p loading...
        else
            p loaded
        for user in users → ForNode
            p {user.name}
        button @click=inc → DirectiveNode
```

**关键实现**：
- 根据缩进层级确定父子关系
- 同行属性解析（`attr=value`, `@event=handler`）
- 控制流语句识别（if/elif/else/for）

### 3.4 代码生成 (codegen/index.ts)

**生成流程**：
```
NUI AST → 模块代码
```

**输出结构**：
```typescript
// 1. 用户 import
import Title from "./Title.nui"

// 2. 运行时 import
import { signal, h, emit } from "fluxion-runtime"

// 3. 响应式声明
const count = signal(0)

// 4. 函数定义
function increment() { ... }

// 5. render 函数
function render() {
  return h("div", [...])
}
```

---

## 四、与现有模块集成

### 4.1 依赖关系

```
compiler-nui
    │
    ├── @fluxion/compiler-dom    # 使用 compile() 生成 render
    │       │
    │       └── @fluxion/compiler-core
    │
    └── @fluxion/shared          # 工具函数
```

### 4.2 复用点

| 来源模块 | 复用内容 |
|---------|---------|
| compiler-core/types.ts | NodeTypes, ElementNode, TextNode, IfNode, ForNode 等 |
| compiler-core/ast.ts | createElementNode, createTextNode, createIfNode, createForNode 等 |
| compiler-dom/index.ts | compile(), getDefaultDOMTransforms() |
| compiler-dom/tagConfig.ts | isNativeTag(), isComponentTag() |
| shared | warn(), isString(), isArray() 等 |

---

## 五、实现步骤

### 阶段一：基础结构 (Day 1)

| 优先级 | 任务 | 文件 |
|-------|------|------|
| P0 | 创建包结构和 package.json | package.json, tsconfig.json |
| P0 | 实现类型定义 | src/types.ts |
| P1 | 实现词法分析器 | src/tokenizer.ts |
| P1 | 编写词法分析测试 | __tests__/tokenizer.test.ts |

### 阶段二：语句解析 (Day 2)

| 优先级 | 任务 | 文件 |
|-------|------|------|
| P0 | 实现解析器状态管理 | src/parser/state.ts |
| P0 | 实现 import 解析 | src/parser/statement.ts |
| P0 | 实现 signal 声明解析 | src/parser/statement.ts |
| P0 | 实现 function 解析 | src/parser/statement.ts |
| P1 | 编写语句解析测试 | __tests__/statement.test.ts |

### 阶段三：模板解析 (Day 3-4)

| 优先级 | 任务 | 文件 |
|-------|------|------|
| P0 | 实现基础元素解析 | src/parser/template.ts |
| P0 | 实现属性/指令解析 | src/parser/template.ts |
| P0 | 实现 if/elif/else 解析 | src/parser/template.ts |
| P0 | 实现 for...in 解析 | src/parser/template.ts |
| P0 | 实现组件识别 | src/parser/template.ts |
| P1 | 编写模板解析测试 | __tests__/template.test.ts |

### 阶段四：代码生成 (Day 5)

| 优先级 | 任务 | 文件 |
|-------|------|------|
| P0 | 实现模块代码生成 | src/codegen/index.ts |
| P0 | 集成 compiler-dom | src/codegen/index.ts |
| P1 | 编写代码生成测试 | __tests__/codegen.test.ts |
| P1 | 编写集成测试 | __tests__/integration.test.ts |

### 阶段五：完善 (Day 6)

| 优先级 | 任务 |
|-------|------|
| P1 | 错误处理和警告完善 |
| P1 | 源码位置映射 |
| P2 | style 块处理 |
| P2 | emit 支持完善 |

---

## 六、测试策略

### 6.1 测试文件拆分

| 测试文件 | 测试范围 |
|---------|---------|
| tokenizer.test.ts | 缩进识别、token 生成、插值边界 |
| statement.test.ts | import, signal, function 解析 |
| template.test.ts | 元素、属性、指令、控制流解析 |
| codegen.test.ts | 各类型节点的代码输出 |
| integration.test.ts | 完整 .nui 文件编译验证 |

### 6.2 边缘案例覆盖

- 缩进不一致错误
- elif/else 无前置 if
- for 循环语法错误
- 空文件处理
- 只有 view 块无脚本
- 深层嵌套结构

---

## 七、关键文件参考

| 文件路径 | 用途 |
|---------|------|
| packages/compiler-core/src/types.ts | AST 节点类型定义 |
| packages/compiler-core/src/ast.ts | AST 节点创建函数 |
| packages/compiler-dom/src/index.ts | 编译入口参考 |
| packages/compiler-dom/src/tagConfig.ts | 标签判断函数 |
| packages/compiler-core/src/transforms/vIf.ts | if 转换实现参考 |
| packages/compiler-core/src/transforms/vFor.ts | for 转换实现参考 |

---

## 八、验证方式

1. **单元测试**：`pnpm run test` 运行所有测试
2. **编译验证**：编写示例 .nui 文件，编译后检查输出代码
3. **运行时验证**：在 playground 中测试编译后的组件能否正常渲染