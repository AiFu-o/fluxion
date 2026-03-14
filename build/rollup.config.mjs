import { defineConfig } from 'rollup'
import { nodeResolve } from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import typescript from '@rollup/plugin-typescript'
import terser from '@rollup/plugin-terser'
import replace from '@rollup/plugin-replace'
import alias from '@rollup/plugin-alias'
import dts from 'rollup-plugin-dts'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// 包列表
const packages = [
  'shared',
  'reactivity',
  'runtime-core',
  'runtime-dom',
  'compiler-core',
  'compiler-dom',
  'compiler-nui',
  'fluxion',
  'vite-plugin-fluxion'
]

// 入口文件配置
const entries = packages.map(name => ({
  input: `packages/${name}/src/index.ts`,
  name: name.replace(/-([a-z])/g, (_, c) => c.toUpperCase())
}))

// 通用插件
const createPlugins = (isProduction, packageName) => [
  alias({
    entries: [
      { find: '@fluxion/shared', replacement: path.resolve(__dirname, 'packages/shared/src') },
      { find: '@fluxion/reactivity', replacement: path.resolve(__dirname, 'packages/reactivity/src') },
      { find: '@fluxion/runtime-core', replacement: path.resolve(__dirname, 'packages/runtime-core/src') },
      { find: '@fluxion/runtime-dom', replacement: path.resolve(__dirname, 'packages/runtime-dom/src') },
      { find: '@fluxion/compiler-core', replacement: path.resolve(__dirname, 'packages/compiler-core/src') },
      { find: '@fluxion/compiler-dom', replacement: path.resolve(__dirname, 'packages/compiler-dom/src') },
      { find: '@fluxion/compiler-nui', replacement: path.resolve(__dirname, 'packages/compiler-nui/src') },
      { find: 'fluxion', replacement: path.resolve(__dirname, 'packages/fluxion/src') }
    ]
  }),
  nodeResolve({
    preferBuiltins: true
  }),
  commonjs(),
  replace({
    preventAssignment: true,
    'process.env.NODE_ENV': JSON.stringify(isProduction ? 'production' : 'development'),
    __VUE_OPTIONS_API__: true,
    __VUE_PROD_DEVTOOLS__: false,
    __VUE_PROD_HYDRATION_MISMATCH_DETAILS__: false
  }),
  typescript({
    tsconfig: './tsconfig.json',
    declaration: true,
    declarationDir: path.resolve(__dirname, `packages/${packageName}/dist`)
  }),
  isProduction && terser({
    compress: {
      pure_getters: true,
      drop_console: false,
      drop_debugger: true
    },
    mangle: {
      properties: false
    }
  })
].filter(Boolean)

// ESM 构建配置
const createEsmConfig = (packageName) => defineConfig({
  input: `packages/${packageName}/src/index.ts`,
  output: {
    file: `packages/${packageName}/dist/${packageName}.js`,
    format: 'esm',
    sourcemap: true
  },
  plugins: createPlugins(true, packageName),
  external: [
    /@fluxion\//,
    /^vue$/
  ]
})

// CJS 构建配置
const createCjsConfig = (packageName) => defineConfig({
  input: `packages/${packageName}/src/index.ts`,
  output: {
    file: `packages/${packageName}/dist/${packageName}.cjs`,
    format: 'cjs',
    sourcemap: true,
    exports: 'named'
  },
  plugins: createPlugins(true, packageName),
  external: [
    /@fluxion\//,
    /^vue$/
  ]
})

// IIFE 构建配置 (用于 CDN)
const createIifeConfig = (packageName) => defineConfig({
  input: `packages/${packageName}/src/index.ts`,
  output: {
    file: `packages/${packageName}/dist/${packageName}.iife.js`,
    format: 'iife',
    name: 'Fluxion',
    sourcemap: true,
    global: {
      '@fluxion/reactivity': 'Fluxion',
      '@fluxion/runtime-core': 'Fluxion',
      '@fluxion/runtime-dom': 'Fluxion',
      '@fluxion/compiler-core': 'Fluxion',
      '@fluxion/compiler-dom': 'Fluxion',
      '@fluxion/compiler-nui': 'Fluxion',
      'vue': 'Vue'
    }
  },
  plugins: createPlugins(true, packageName),
  external: [
    /^vue$/
  ],
  inlineDynamicImports: true
})

// 类型定义构建配置
const createDtsConfig = (packageName) => defineConfig({
  input: `packages/${packageName}/src/index.ts`,
  output: {
    file: `packages/${packageName}/dist/${packageName}.d.ts`,
    format: 'esm'
  },
  plugins: [
    dts({
      tsconfig: './tsconfig.json'
    })
  ],
  external: [
    /@fluxion\//
  ]
})

// 主包（fluxion）的完整配置，包含 runtime 和 compiler 入口
const createFluxionConfig = (format) => {
  const configs = []

  // 主入口
  configs.push(defineConfig({
    input: 'packages/fluxion/src/index.ts',
    output: {
      file: `packages/fluxion/dist/fluxion.${format === 'iife' ? 'iife' : format === 'cjs' ? 'cjs' : 'js'}`,
      format: format,
      name: 'Fluxion',
      sourcemap: true
    },
    plugins: createPlugins(true, 'fluxion'),
    external: format !== 'iife' ? [/@fluxion\//] : [],
    inlineDynamicImports: format === 'iife'
  }))

  // runtime 入口
  configs.push(defineConfig({
    input: 'packages/fluxion/src/runtime.ts',
    output: {
      file: `packages/fluxion/dist/fluxion-runtime.${format === 'iife' ? 'iife' : format === 'cjs' ? 'cjs' : 'js'}`,
      format: format,
      name: 'Fluxion',
      sourcemap: true
    },
    plugins: createPlugins(true, 'fluxion'),
    external: format !== 'iife' ? [/@fluxion\//] : [],
    inlineDynamicImports: format === 'iife'
  }))

  return configs
}

// fluxion 主包的类型定义构建配置
const createFluxionDtsConfigs = () => {
  return [
    // 主入口类型定义
    defineConfig({
      input: 'packages/fluxion/src/index.ts',
      output: {
        file: 'packages/fluxion/dist/fluxion.d.ts',
        format: 'esm'
      },
      plugins: [
        dts({
          tsconfig: './tsconfig.json'
        })
      ],
      external: [/@fluxion\//]
    }),
    // runtime 入口类型定义
    defineConfig({
      input: 'packages/fluxion/src/runtime.ts',
      output: {
        file: 'packages/fluxion/dist/fluxion-runtime.d.ts',
        format: 'esm'
      },
      plugins: [
        dts({
          tsconfig: './tsconfig.json'
        })
      ],
      external: [/@fluxion\//]
    })
  ]
}

// 生成所有构建配置
export function createBuildConfigs(formats = ['esm', 'cjs']) {
  const configs = []

  // 基础包
  for (const pkg of packages) {
    if (pkg === 'fluxion' || pkg === 'vite-plugin-fluxion') continue

    if (formats.includes('esm')) {
      configs.push(createEsmConfig(pkg))
    }
    if (formats.includes('cjs')) {
      configs.push(createCjsConfig(pkg))
    }
    if (formats.includes('iife')) {
      configs.push(createIifeConfig(pkg))
    }
    // 类型定义
    configs.push(createDtsConfig(pkg))
  }

  // fluxion 主包
  for (const format of formats) {
    configs.push(...createFluxionConfig(format))
  }
  // fluxion 类型定义
  configs.push(...createFluxionDtsConfigs())

  // vite-plugin-fluxion
  if (formats.includes('esm')) {
    configs.push(createEsmConfig('vite-plugin-fluxion'))
  }
  if (formats.includes('cjs')) {
    configs.push(createCjsConfig('vite-plugin-fluxion'))
  }
  configs.push(createDtsConfig('vite-plugin-fluxion'))

  return configs
}

export default createBuildConfigs