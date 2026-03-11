import { createBuildConfigs } from './rollup.config.mjs'
import minimist from 'minimist'
import { rollup } from 'rollup'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const args = minimist(process.argv.slice(2))
const formats = args.formats ? args.formats.split(',') : ['esm', 'cjs']

const configs = createBuildConfigs(formats)

console.log('Building Fluxion packages...')
console.log('Formats:', formats.join(', '))
console.log('Configs:', configs.length)

// 执行构建
async function build() {
    for (const config of configs) {
        const outputFile = config.output.file
        if (!outputFile) continue

        const packageName = outputFile.split('/')[1]
        console.log(`Building ${packageName}...`)

        try {
            const bundle = await rollup({
                input: config.input,
                external: config.external,
                plugins: config.plugins
            })

            await bundle.write({
                file: outputFile,
                format: config.output.format,
                sourcemap: true,
                name: config.output.name
            })

            console.log(`  ✓ ${outputFile}`)
        } catch (error) {
            console.error(`  ✗ Failed to build ${outputFile}:`, error.message)
        }
    }
    console.log('Build complete!')
}

build()