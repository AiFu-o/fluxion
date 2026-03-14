# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Fluxion is a lightweight JavaScript UI framework with two design goals:
- **AI-friendly**: Low token usage when generating pages, easy to understand
- **Human-friendly**: Maintainable, intuitive code

The framework uses a custom DSL (`.nui` files) that compiles to render functions.

## Package Structure

```
fluxion (monorepo with pnpm workspaces)
├─ packages/
│  ├─ fluxion              # Main entry package
│  ├─ runtime-core         # Platform-independent runtime
│  ├─ runtime-dom          # DOM renderer
│  ├─ reactivity           # Reactive system (Proxy-based, Vue-inspired)
│  ├─ compiler-core        # Compiler core (AST transforms)
│  ├─ compiler-dom         # DOM-specific compilation
│  ├─ compiler-nui         # .nui DSL parser
│  ├─ shared               # Shared utilities
│  └─ vite-plugin-fluxion  # Vite plugin
├─ build/                  # Rollup build scripts
└─ docs/                   # Framework documentation
```

## Common Commands

```bash
pnpm run dev        # Start development mode
pnpm run build      # Build all packages
pnpm run build:esm  # Build ESM format only
pnpm run build:iife # Build IIFE format only (CDN)
pnpm run build:all  # Build all formats
pnpm run lint       # Run ESLint
pnpm run test       # Run tests with Vitest
```

## Architecture

### Compilation Flow (.nui → render function)
```
.nui file → compiler-nui (parser) → AST → compiler-core (transform) → compiler-dom (DOM transform) → codegen → render function
```

### Runtime Flow
```
render function → runtime-core (component system) → vnode → renderer → runtime-dom → DOM
```

### Reactivity Flow
```
state change → reactivity (signal/effect) → component update → render() → vnode diff → runtime-dom → DOM patch
```

## .nui DSL Syntax

### Reactive State
```nui
count = signal(0)
users = asyncSignal(fetchUsers)
```

### Event Handling
```nui
button @click=increment
```

### Control Flow
```nui
if loading
    p loading...
elif data
    p loaded
else
    p no data

for user in users
    p {user.name}
```

### Component Props
```nui
Title name={name}
    hello
```

### Styling
```nui
style
button {
    padding 8px
    background-color #007bff
}
```

## Important Conventions

- **Tab indentation** for .nui files
- **Quotes around attributes**: `name="test"`
- Signal values accessed as functions: `{count}` → `count()`
- Control flow compiles to ternary expressions and `.map()`
- Use `/*#__PURE__*/` annotations in Rollup for tree-shaking
- Each module requires complete unit tests (split by feature into separate files)
- All functions need error handling with Warn messages

## 开发规则

1. **注释和文档使用中文**: 所有代码注释、文档均使用中文编写
2. **计划文件位置**: 所有计划生成在 `memory/plans` 文件夹下
3. **先描述方法再编码**: 在编写任何代码前，先描述实现方法并等待批准
4. **澄清模糊需求**: 如果需求模糊，请在编写代码前提出澄清问题
5. **边缘案例测试**: 完成代码编写后，列出边缘案例并建立覆盖它们的测试用例
6. **拆分大任务**: 如果任务需要修改超过 3 个文件，先停止并将其拆分成更小的任务
7. **测试驱动修复**: 出现 bug 时，先编写能重现该 bug 的测试，再修复直到测试通过
8. **反思错误原因**: 每次纠正时，反思错误原因，并制定永不再犯的计划
9. **框架使用文档**: 框架的使用文档存储在 `docs/` 目录下