import { defineConfig } from 'vitest/config'
import path from 'path'

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
            'fluxion': path.resolve(__dirname, 'packages/fluxion/src')
        }
    }
})