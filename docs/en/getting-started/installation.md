# Installation

This section covers how to install Fluxion and configure your project environment.

## Installation Methods

### Package Manager

Recommended installation using pnpm:

```bash
pnpm add fluxion
```

Or using npm:

```bash
npm install fluxion
```

Or using yarn:

```bash
yarn add fluxion
```

### Vite Plugin Installation

If using Vite for your project, install the Vite plugin:

```bash
pnpm add -D vite-plugin-fluxion
```

## Project Configuration

### Vite Integration

Add the Fluxion plugin to your `vite.config.js`:

```javascript
import { defineConfig } from 'vite'
import { fluxionPlugin } from 'vite-plugin-fluxion'

export default defineConfig({
  plugins: [
    fluxionPlugin()
  ]
})
```

#### Plugin Options

```typescript
interface FluxionPluginOptions {
  isProduction?: boolean   // Production mode flag
  include?: string[]       // File extensions to include, default: ['.nui']
}
```

Example:

```javascript
import { defineConfig } from 'vite'
import { fluxionPlugin } from 'vite-plugin-fluxion'

export default defineConfig({
  plugins: [
    fluxionPlugin({
      isProduction: process.env.NODE_ENV === 'production',
      include: ['.nui']
    })
  ]
})
```

### TypeScript Support

Fluxion provides TypeScript type definitions out of the box.

To add type declarations for `.nui` files, create a `fluxion.d.ts`:

```typescript
declare module '*.nui' {
  import { Component } from 'fluxion'
  const component: Component
  export default component
}
```

## CDN Usage

You can use Fluxion directly in the browser via CDN:

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Fluxion App</title>
</head>
<body>
  <div id="app"></div>
  <script src="https://unpkg.com/fluxion/dist/fluxion.iife.js"></script>
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

## Minimal Example

### Project Structure

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
<html lang="en">
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
import { createApp } from 'fluxion'
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
    "fluxion": "latest"
  },
  "devDependencies": {
    "vite": "^5.0.0",
    "vite-plugin-fluxion": "latest"
  }
}
```

## Running the Project

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev

# Build for production
pnpm build

# Preview production build
pnpm preview
```

## Next Steps

- [First Application](first-app.md) - Create your first Fluxion application
- [.nui File Structure](../core-concepts/nui-file-structure.md) - Understand .nui file components