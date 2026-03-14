# 生命周期

组件从创建到销毁经历不同的阶段，这些阶段称为生命周期。了解生命周期有助于在正确的时机执行代码。

## 生命周期概览

```
创建阶段
    ↓
setup() 执行
    ↓
渲染阶段
    ↓
挂载完成
    ↓
更新阶段（响应式数据变化）
    ↓
卸载阶段
```

## 生命周期钩子

### onMounted

组件挂载完成后调用：

```javascript
import { onMounted } from 'fluxion'

export default {
    setup() {
        onMounted(() => {
            console.log('组件已挂载')
            // 可以访问 DOM
            document.querySelector('#app')
        })
    }
}
```

### onUpdated

组件更新后调用：

```javascript
import { onUpdated } from 'fluxion'

export default {
    setup() {
        onUpdated(() => {
            console.log('组件已更新')
        })
    }
}
```

### onUnmounted

组件卸载前调用：

```javascript
import { onUnmounted } from 'fluxion'

export default {
    setup() {
        onUnmounted(() => {
            console.log('组件即将卸载')
            // 清理资源
        })
    }
}
```

### onBeforeMount

组件挂载前调用：

```javascript
import { onBeforeMount } from 'fluxion'

export default {
    setup() {
        onBeforeMount(() => {
            console.log('组件即将挂载')
        })
    }
}
```

### onBeforeUpdate

组件更新前调用：

```javascript
import { onBeforeUpdate } from 'fluxion'

export default {
    setup() {
        onBeforeUpdate(() => {
            console.log('组件即将更新')
        })
    }
}
```

### onBeforeUnmount

组件卸载前调用：

```javascript
import { onBeforeUnmount } from 'fluxion'

export default {
    setup() {
        onBeforeUnmount(() => {
            console.log('组件即将卸载')
        })
    }
}
```

## 在 .nui 文件中使用

```nui
import { onMounted, onUnmounted } from 'fluxion'

// 这里的代码在 setup 阶段执行
console.log('Setup')

onMounted(() => {
    console.log('Mounted')
    // 初始化第三方库
    initThirdPartyLibrary()
})

onUnmounted(() => {
    console.log('Unmounted')
    // 清理资源
    cleanup()
})

view
div
    p Hello World
```

## 常见使用场景

### DOM 操作

```javascript
import { onMounted } from 'fluxion'

setup() {
    onMounted(() => {
        // DOM 已经可用
        const element = document.querySelector('#my-element')
        element.addEventListener('click', handleClick)
    })
}
```

### 数据获取

```javascript
import { signal, onMounted } from 'fluxion'

setup() {
    const data = signal(null)
    const loading = signal(true)

    onMounted(async () => {
        try {
            const response = await fetch('/api/data')
            data.set(await response.json())
        } finally {
            loading.set(false)
        }
    })

    return { data, loading }
}
```

### 定时器管理

```javascript
import { signal, onMounted, onUnmounted } from 'fluxion'

setup() {
    const time = signal(new Date())

    let timer

    onMounted(() => {
        timer = setInterval(() => {
            time.set(new Date())
        }, 1000)
    })

    onUnmounted(() => {
        clearInterval(timer)
    })

    return { time }
}
```

### 事件监听

```javascript
import { onMounted, onUnmounted } from 'fluxion'

setup() {
    function handleResize() {
        console.log('Window resized')
    }

    onMounted(() => {
        window.addEventListener('resize', handleResize)
    })

    onUnmounted(() => {
        window.removeEventListener('resize', handleResize)
    })
}
```

### 订阅管理

```javascript
import { signal, onMounted, onUnmounted } from 'fluxion'

setup() {
    const messages = signal([])

    let subscription

    onMounted(() => {
        subscription = messageService.subscribe((message) => {
            messages.update(list => [...list, message])
        })
    })

    onUnmounted(() => {
        subscription.unsubscribe()
    })

    return { messages }
}
```

## API 参考

### onMounted

```typescript
function onMounted(callback: () => void | (() => void)): void
```

注册组件挂载后的回调。可以返回清理函数。

### onUpdated

```typescript
function onUpdated(callback: () => void): void
```

注册组件更新后的回调。

### onUnmounted

```typescript
function onUnmounted(callback: () => void): void
```

注册组件卸载后的回调。

### onBeforeMount

```typescript
function onBeforeMount(callback: () => void): void
```

注册组件挂载前的回调。

### onBeforeUpdate

```typescript
function onBeforeUpdate(callback: () => void): void
```

注册组件更新前的回调。

### onBeforeUnmount

```typescript
function onBeforeUnmount(callback: () => void): void
```

注册组件卸载前的回调。

## 钩子执行顺序

```
1. setup()
2. onBeforeMount
3. 渲染
4. onMounted

更新时：
5. onBeforeUpdate
6. 重新渲染
7. onUpdated

卸载时：
8. onBeforeUnmount
9. onUnmounted
```

## 最佳实践

### 清理副作用

```javascript
import { onMounted, onUnmounted } from 'fluxion'

setup() {
    onMounted(() => {
        const controller = new AbortController()

        fetch('/api/data', { signal: controller.signal })
            .then(r => r.json())
            .then(data => console.log(data))

        // 返回清理函数
        return () => controller.abort()
    })
}
```

### 避免内存泄漏

```javascript
import { onMounted, onUnmounted } from 'fluxion'

setup() {
    const resources = []

    onMounted(() => {
        // 分配资源
        resources.push(createResource())
    })

    onUnmounted(() => {
        // 释放所有资源
        resources.forEach(r => r.dispose())
    })
}
```

### 条件初始化

```javascript
import { onMounted } from 'fluxion'

setup(props) {
    onMounted(() => {
        if (props.autoLoad) {
            loadData()
        }
    })
}
```

## 下一步

- [组件定义](definition.md) - 组件定义方式
- [Props 传递](props.md) - Props 详细用法
- [事件发射](events.md) - 组件事件系统