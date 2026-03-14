import { defineConfig } from 'vitest/config'
import path from 'path'

// @ts-ignore - vitest 运行时可用
const __dirname = path.dirname(new URL(import.meta.url).pathname)

export default defineConfig({
    test: {
        globals: true,
        environment: 'jsdom'
    },
    resolve: {
        alias: {
            '@fluxion-ui/shared': path.resolve(__dirname, 'packages/shared/src'),
            '@fluxion-ui/reactivity': path.resolve(__dirname, 'packages/reactivity/src'),
            '@fluxion-ui/runtime-core': path.resolve(__dirname, 'packages/runtime-core/src'),
            '@fluxion-ui/runtime-dom': path.resolve(__dirname, 'packages/runtime-dom/src'),
            '@fluxion-ui/compiler-core': path.resolve(__dirname, 'packages/compiler-core/src'),
            '@fluxion-ui/compiler-dom': path.resolve(__dirname, 'packages/compiler-dom/src'),
            '@fluxion-ui/compiler-nui': path.resolve(__dirname, 'packages/compiler-nui/src'),
            '@fluxion-ui/fluxion': path.resolve(__dirname, 'packages/fluxion/src'),
            '@fluxion-ui/fluxion/runtime': path.resolve(__dirname, 'packages/fluxion/src/runtime.ts')
        }
    }
})