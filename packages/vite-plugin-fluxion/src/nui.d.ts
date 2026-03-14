/**
 * .nui 文件 TypeScript 类型声明
 * 使 IDE 能够正确识别 .nui 文件导入的类型
 */

import { Component } from '@fluxion/runtime-core'

declare module '*.nui' {
    const component: Component
    export default component
}