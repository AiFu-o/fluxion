import { defineConfig } from "vite";
import { fileURLToPath, URL } from "node:url";

const __dirname = fileURLToPath(new URL(".", import.meta.url));

// 直接从源码导入 vite-plugin-fluxion
const { fluxionPlugin } =
  await import("../../packages/vite-plugin-fluxion/src/index.js");

export default defineConfig({
  plugins: [fluxionPlugin({ indentSize: 4})],
  resolve: {
    alias: {
      "@fluxion-ui/shared": `${__dirname}../../packages/shared/src`,
      "@fluxion-ui/reactivity": `${__dirname}../../packages/reactivity/src`,
      "@fluxion-ui/runtime-core": `${__dirname}../../packages/runtime-core/src`,
      "@fluxion-ui/runtime-dom": `${__dirname}../../packages/runtime-dom/src`,
      "@fluxion-ui/compiler-core": `${__dirname}../../packages/compiler-core/src`,
      "@fluxion-ui/compiler-dom": `${__dirname}../../packages/compiler-dom/src`,
      "@fluxion-ui/compiler-nui": `${__dirname}../../packages/compiler-nui/src`,
      "@fluxion-ui/fluxion": `${__dirname}../../packages/fluxion/src`,
      "@fluxion-ui/fluxion/runtime": `${__dirname}../../packages/fluxion/src/runtime.ts`,
    },
  },
  server: {
    port: 3000,
  },
});
