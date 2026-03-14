# Fluxion Documentation

Fluxion is a lightweight JavaScript UI framework designed with two goals:

- **AI-friendly**: Low token usage, easy to understand
- **Human-friendly**: Maintainable, intuitive code

## Features

- 🚀 **Lightweight**: Minimal core codebase with excellent performance
- 📦 **Custom DSL**: Uses `.nui` files with compile-time optimization
- ⚡ **Fine-grained Reactivity**: Signal-based reactivity system
- 🔧 **Vite Integration**: Out-of-the-box Vite plugin support

## Quick Start

```bash
# Install
pnpm add fluxion

# Install Vite plugin
pnpm add -D vite-plugin-fluxion
```

## Documentation

### Getting Started
- [Installation](getting-started/installation.md) - Install Fluxion and configure your project
- [First Application](getting-started/first-app.md) - Create your first Fluxion application

### Core Concepts
- [.nui File Structure](core-concepts/nui-file-structure.md) - Understand .nui file components
- [Signal Reactive State](core-concepts/signal.md) - Reactive state management basics
- [Component Basics](core-concepts/component-basics.md) - Component definition and usage
- [Template Syntax Overview](core-concepts/template-syntax.md) - Quick introduction to template syntax

### Reactivity System
- [Signal API](reactivity/signal-api.md) - Complete Signal API reference
- [Computed Properties](reactivity/computed.md) - Derived state
- [Effect](reactivity/effect.md) - Reactive side effects
- [Watch](reactivity/watch.md) - State watching
- [Reactive Objects](reactivity/reactive.md) - Reactive objects
- [AsyncSignal](reactivity/async-signal.md) - Async data handling

### Component System
- [Component Definition](components/definition.md) - Detailed component definition
- [Props](components/props.md) - Component property passing
- [Events](components/events.md) - Component event system
- [Slots](components/slots.md) - Content distribution
- [Lifecycle](components/lifecycle.md) - Component lifecycle hooks

### Template Syntax
- [Elements & Attributes](template/elements.md) - HTML/SVG elements and attribute binding
- [Interpolation](template/interpolation.md) - Text and expression interpolation
- [Conditional Rendering](template/conditionals.md) - if/elif/else conditional rendering
- [List Rendering](template/lists.md) - for loop rendering
- [Event Handling](template/events.md) - Event binding and handling
- [Styles](template/styles.md) - CSS style definitions

### Advanced Topics
- [Custom Renderer](advanced/custom-renderer.md) - Platform adaptation and custom rendering
- [Compiler Extension](advanced/compiler-extension.md) - Compiler plugin development
- [Performance Optimization](advanced/performance.md) - Performance optimization tips
- [TypeScript Support](advanced/typescript.md) - TypeScript type support

### API Reference
- [Reactivity API](api/reactivity-api.md) - Complete reactivity system API
- [Runtime API](api/runtime-api.md) - Runtime core API
- [Compiler API](api/compiler-api.md) - Compiler API
- [Utility Functions](api/utils-api.md) - Utility function reference

### Examples
- [Common Patterns](examples/patterns.md) - Common development patterns
- [Complete Examples](examples/complete-examples.md) - Complete application examples
- [Debugging Tips](examples/debugging.md) - Debugging and troubleshooting

---

English | [中文](../zh/README.md)