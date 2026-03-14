# Elements & Attributes

This chapter details how to use elements and attributes in .nui templates.

## HTML Elements

### Basic Elements

```nui
view
div
    h1 Title
    h2 Subtitle
    p Paragraph
    span Inline text
```

### Self-closing Elements

```nui
view
div
    img src="photo.jpg" alt="Photo"
    input type="text"
    br
    hr
```

### Text Content

```nui
view
div
    p This is text
    h1 Title text
    button Button text
```

## Attribute Binding

### Static Attributes

```nui
view
div id="app"
    input type="text" placeholder="Enter text"
    a href="https://example.com" target="_blank" Link
    img src="image.jpg" alt="Image"
```

### Dynamic Attributes

Use `{}` to bind dynamic values:

```nui
view
div id={dynamicId}
    input type="text" value={inputValue}
    img src={imageUrl} alt={imageAlt}
    a href={linkUrl} Link
```

### Boolean Attributes

```nui
view
div
    input type="checkbox" checked={isChecked}
    button disabled={isDisabled} Submit
    input type="text" readonly={isReadonly}
```

### Multiple Attributes

```nui
view
div class="card" id="card-1" data-index={index}
    p Content
```

## class Binding

### String

```nui
view
div class="container"
    p Content
```

### Object Syntax

```nui
view
div class={isActive ? 'active' : ''}
    p Content

div class={{ active: isActive, disabled: isDisabled }}
    p Content
```

### Array Syntax

```nui
view
div class={['container', isActive && 'active']}
    p Content
```

### Combined Usage

```nui
view
div class="base" class={isActive && 'active'}
    p Content
```

## style Binding

### String

```nui
view
div style="color: red; font-size: 16px"
    p Content
```

### Object Syntax

```nui
view
div style={{ color: 'red', fontSize: '16px' }}
    p Content

div style={{ color: textColor, backgroundColor: bgColor }}
    p Content
```

### Dynamic Styles

```nui
view
div style={`color: ${textColor}`}
    p Content
```

## SVG Elements

### Basic SVG

```nui
view
svg width="100" height="100"
    circle cx="50" cy="50" r="40" fill="red"
    rect x="10" y="10" width="80" height="80" fill="blue"
```

### Dynamic SVG

```nui
view
svg width={width} height={height}
    circle cx={cx} cy={cy} r={radius} fill={fillColor}
```

## Nested Structure

Use Tab indentation for nesting:

```nui
view
div class="container"
    header
        nav
            a href="/" Home
            a href="/about" About
    main
        article
            h2 Article Title
            p Article content...
    footer
        p Copyright
```

## Special Attributes

### key

For list rendering optimization:

```nui
view
ul
    for item in items
        li key={item.id} {item.name}
```

### ref

Get element reference:

```nui
view
div ref={containerRef}
    p Content
```

### innerHTML

Set HTML content (use with caution):

```nui
view
div innerHTML={htmlContent}
```

### Text Content

```nui
view
div
    // Text directly after element
    p This is text

    // Or use interpolation
    p {message}
```

## Attribute Naming

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

## Best Practices

### Semantic Tags

```nui
// ✅ Good: Use semantic tags
view
article
    header
        h1 Title
    section
        p Content
    footer
        p Footer

// ❌ Avoid: All divs
view
div
    div
        div Title
    div
        div Content
```

### Attribute Order

Recommended order:
1. `id`
2. `class`
3. Other attributes
4. Event bindings
5. Special attributes

```nui
view
button id="submit" class="btn primary" type="submit" disabled={isDisabled} @click=handleSubmit
    Submit
```

### Concise Syntax

```nui
// ✅ Good: Concise
view
img src="photo.jpg"

// ❌ Avoid: Unnecessary quotes
view
img src="photo.jpg" alt=""
```

## Next Steps

- [Interpolation](interpolation.md) - Text and expression interpolation
- [Conditional Rendering](conditionals.md) - if/elif/else conditional rendering
- [List Rendering](lists.md) - for loop rendering