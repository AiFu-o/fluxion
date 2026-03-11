import { defineConfig } from 'vitest/config'
import path from 'path'

export default defineConfig({
    test: {
        globals: true,
        environment: 'node'
    },
    resolve: {
        alias: {
            '@fluxion/shared': path.resolve(__dirname, 'packages/shared/src'),
            '@fluxion/reactivity': path.resolve(__dirname, 'packages/reactivity/src'),
            '@fluxion/runtime-core': path.resolve(__dirname, 'packages/runtime-core/src'),
            '@fluxion/runtime-dom': path.resolve(__dirname, 'packages/runtime-dom/src'),
            '@fluxion/compiler-core': path.resolve(__dirname, 'packages/compiler-core/src'),
            '@fluxion/compiler-dom': path.resolve(__dirname, 'packages/compiler-dom/src'),
            '@fluxion/compiler-nui': path.resolve(__dirname, 'packages/compiler-nui/src'),
            'fluxion': path.resolve(__dirname, 'packages/fluxion/src')
        }
    }
})