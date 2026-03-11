import { createBuildConfigs } from './rollup.config.mjs'
import { spawn } from 'child_process'
import { createRequire } from 'module'

const require = createRequire(import.meta.url)

// 获取所有配置
const configs = createBuildConfigs(['esm', 'cjs'])

console.log('Starting dev build...')
console.log('Watching for changes...')

// 使用 rollup --watch
const rollupBin = require.resolve('rollup/dist/bin/rollup')

const watchProcess = spawn(rollupBin, [
  'watch',
  '--config', './build/rollup.config.mjs',
  '--watch'
], {
  stdio: 'inherit',
  cwd: process.cwd()
})

watchProcess.on('close', (code) => {
  process.exit(code)
})