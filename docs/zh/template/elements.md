# 元素与属性

本章详细介绍 .nui 模板中元素和属性的使用方式。

## HTML 元素

### 基本元素

```nui
view
div
    h1 标题
    h2 副标题
    p 段落
    span 行内文本
```

### 自闭合元素

```nui
view
div
    img src="photo.jpg" alt="Photo"
    input type="text"
    br
    hr
```

### 文本内容

```nui
view
div
    p 这是一段文本
    h1 标题文本
    button 按钮文字
```

## 属性绑定

### 静态属性

```nui
view
div id="app"
    input type="text" placeholder="请输入"
    a href="https://example.com" target="_blank" 链接
    img src="image.jpg" alt="图片"
```

### 动态属性

使用 `{}` 绑定动态值：

```nui
view
div id={dynamicId}
    input type="text" value={inputValue}
    img src={imageUrl} alt={imageAlt}
    a href={linkUrl} 链接
```

### 布尔属性

```nui
view
div
    input type="checkbox" checked={isChecked}
    button disabled={isDisabled} 提交
    input type="text" readonly={isReadonly}
```

### 多属性

```nui
view
div class="card" id="card-1" data-index={index}
    p 内容
```

## class 绑定

### 字符串

```nui
view
div class="container"
    p 内容
```

### 对象语法

```nui
view
div class={isActive ? 'active' : ''}
    p 内容

div class={{ active: isActive, disabled: isDisabled }}
    p 内容
```

### 数组语法

```nui
view
div class={['container', isActive && 'active']}
    p 内容
```

### 组合使用

```nui
view
div class="base" class={isActive && 'active'}
    p 内容
```

## style 绑定

### 字符串

```nui
view
div style="color: red; font-size: 16px"
    p 内容
```

### 对象语法

```nui
view
div style={{ color: 'red', fontSize: '16px' }}
    p 内容

div style={{ color: textColor, backgroundColor: bgColor }}
    p 内容
```

### 动态样式

```nui
view
div style={`color: ${textColor}`}
    p 内容
```

## SVG 元素

### 基本 SVG

```nui
view
svg width="100" height="100"
    circle cx="50" cy="50" r="40" fill="red"
    rect x="10" y="10" width="80" height="80" fill="blue"
```

### 动态 SVG

```nui
view
svg width={width} height={height}
    circle cx={cx} cy={cy} r={radius} fill={fillColor}
```

## 嵌套结构

使用 Tab 缩进表示嵌套：

```nui
view
div class="container"
    header
        nav
            a href="/" 首页
            a href="/about" 关于
    main
        article
            h2 文章标题
            p 文章内容...
    footer
        p 版权信息
```

## 特殊属性

### key

用于列表渲染优化：

```nui
view
ul
    for item in items
        li key={item.id} {item.name}
```

### ref

获取元素引用：

```nui
view
div ref={containerRef}
    p 内容
```

### innerHTML

设置 HTML 内容（谨慎使用）：

```nui
view
div innerHTML={htmlContent}
```

### 文本内容

```nui
view
div
    // 文本直接写在元素后面
    p 这是文本

    // 或使用插值
    p {message}
```

## 属性命名

### kebab-case

```nui
view
div data-user-id="123" aria-label="Label"
```

### camelCase

```nui
view
input tabIndex="1"
```

## 最佳实践

### 语义化标签

```nui
// ✅ 好：使用语义化标签
view
article
    header
        h1 标题
    section
        p 内容
    footer
        p 页脚

// ❌ 避免：全部使用 div
view
div
    div
        div 标题
    div
        div 内容
```

### 属性顺序

建议顺序：
1. `id`
2. `class`
3. 其他属性
4. 事件绑定
5. 特殊属性

```nui
view
button id="submit" class="btn primary" type="submit" disabled={isDisabled} @click=handleSubmit
    提交
```

### 简洁写法

```nui
// ✅ 好：简洁
view
img src="photo.jpg"

// ❌ 避免：不必要的引号
view
img src="photo.jpg" alt=""
```

## 下一步

- [插值表达式](interpolation.md) - 文本与表达式插值
- [条件渲染](conditionals.md) - if/elif/else 条件渲染
- [列表渲染](lists.md) - for 循环渲染