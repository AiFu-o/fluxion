import { defineConfig } from 'vite'
import { fileURLToPath, URL } from 'node:url'

const __dirname = fileURLToPath(new URL('.', import.meta.url))

// 直接从源码导入 vite-plugin-fluxion
const { fluxionPlugin } = await import('@fluxion-ui/vite-plugin-fluxion')

export default defineConfig({
    plugins: [
        fluxionPlugin()
    ],
    server: {
        port: 3000
    }
})