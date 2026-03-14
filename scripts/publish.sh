#!/bin/bash
# 发布所有包到 npm
# 按依赖顺序发布

set -e

# 获取脚本所在目录的父目录（项目根目录）
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

cd "$PROJECT_ROOT"

# 检查是否已登录
if ! npm whoami &>/dev/null; then
    echo "请先登录 npm: npm login"
    exit 1
fi

# 包发布顺序（按依赖关系）
packages=(
    "packages/shared"
    "packages/reactivity"
    "packages/runtime-core"
    "packages/runtime-dom"
    "packages/compiler-core"
    "packages/compiler-dom"
    "packages/compiler-nui"
    "packages/fluxion"
    "packages/vite-plugin-fluxion"
)

echo "即将发布以下包:"
for pkg in "${packages[@]}"; do
    name=$(cat "$pkg/package.json" | grep '"name"' | head -1 | sed 's/.*"name": "\(.*\)".*/\1/')
    version=$(cat "$pkg/package.json" | grep '"version"' | head -1 | sed 's/.*"version": "\(.*\)".*/\1/')
    echo "  - $name@$version"
done

echo ""
read -p "确认发布? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "已取消"
    exit 0
fi

for pkg in "${packages[@]}"; do
    echo ""
    echo "========================================="
    echo "发布: $pkg"
    echo "========================================="

    # 获取包名
    name=$(cat "$pkg/package.json" | grep '"name"' | head -1 | sed 's/.*"name": "\(.*\)".*/\1/')

    # 进入包目录
    cd "$PROJECT_ROOT/$pkg"

    # 使用 pnpm publish（会自动转换 workspace:* 依赖）
    # 检查是否是 scoped package
    if [[ $name == @* ]]; then
        pnpm publish --access public --no-git-checks
    else
        pnpm publish --no-git-checks
    fi

    # 返回项目根目录
    cd "$PROJECT_ROOT"
done

echo ""
echo "========================================="
echo "所有包发布完成!"
echo "========================================="