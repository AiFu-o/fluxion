import { defineConfig } from 'vite'
import { fileURLToPath, URL } from 'node:url'

const __dirname = fileURLToPath(new URL('.', import.meta.url))

// 直接从源码导入 vite-plugin-fluxion
const { fluxionPlugin } = await import('../../packages/vite-plugin-fluxion/src/index.js')

export default defineConfig({
    plugins: [
        fluxionPlugin()
    ],
    resolve: {
        alias: {
            '@fluxion/shared': `${__dirname}../../packages/shared/src`,
            '@fluxion/reactivity': `${__dirname}../../packages/reactivity/src`,
            '@fluxion/runtime-core': `${__dirname}../../packages/runtime-core/src`,
            '@fluxion/runtime-dom': `${__dirname}../../packages/runtime-dom/src`,
            '@fluxion/compiler-core': `${__dirname}../../packages/compiler-core/src`,
            '@fluxion/compiler-dom': `${__dirname}../../packages/compiler-dom/src`,
            '@fluxion/compiler-nui': `${__dirname}../../packages/compiler-nui/src`,
            'fluxion': `${__dirname}../../packages/fluxion/src`,
            'fluxion-runtime': `${__dirname}../../packages/runtime-dom/src`
        }
    },
    server: {
        port: 3000
    }
})