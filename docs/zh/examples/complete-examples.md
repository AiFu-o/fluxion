# 完整示例

本章节提供几个完整的 Fluxion 应用示例。

---

## Todo 应用

一个功能完整的 Todo 应用，包含添加、删除、完成标记、过滤等功能。

```nui
import { signal, computed } from '@fluxion-ui/fluxion'

// 状态
todos = signal([])
newTodo = signal("")
filter = signal("all")  // all, active, completed

// 计算属性
filteredTodos = computed(() => {
    const list = todos()
    const f = filter()

    if (f === "active") {
        return list.filter(todo => !todo.done)
    }
    if (f === "completed") {
        return list.filter(todo => todo.done)
    }
    return list
})

remaining = computed(() => {
    return todos().filter(todo => !todo.done).length
})

// 操作
function addTodo() {
    const text = newTodo().trim()
    if (text) {
        todos.update(list => [
            ...list,
            {
                id: Date.now(),
                text,
                done: false,
                createdAt: new Date().toISOString()
            }
        ])
        newTodo.set("")
    }
}

function removeTodo(id) {
    todos.update(list => list.filter(todo => todo.id !== id))
}

function toggleTodo(id) {
    todos.update(list =>
        list.map(todo =>
            todo.id === id ? { ...todo, done: !todo.done } : todo
        )
    )
}

function clearCompleted() {
    todos.update(list => list.filter(todo => !todo.done))
}

function editTodo(id, newText) {
    todos.update(list =>
        list.map(todo =>
            todo.id === id ? { ...todo, text: newText } : todo
        )
    )
}

view
div.todoapp
    header.header
        h1 todos
        input.new-todo value={newTodo} @input={(e) => newTodo.set(e.target.value)} @keyup.enter=addTodo placeholder="What needs to be done?" autofocus

    if todos().length > 0
        section.main
            ul.todo-list
                for todo in filteredTodos
                    li key={todo.id} class={todo.done ? 'completed' : ''}
                        div.view
                            input.toggle type="checkbox" checked={todo.done} @change={() => toggleTodo(todo.id)}
                            label {todo.text}
                            button.destroy @click={() => removeTodo(todo.id)}

        footer.footer
            span.todo-count
                strong {remaining}
                if remaining() === 1
                    |  item left
                else
                    |  items left

            ul.filters
                li
                    a class={filter() === 'all' ? 'selected' : ''} @click={() => filter.set('all')} All
                li
                    a class={filter() === 'active' ? 'selected' : ''} @click={() => filter.set('active')} Active
                li
                    a class={filter() === 'completed' ? 'selected' : ''} @click={() => filter.set('completed')} Completed

            if todos().some(t => t.done)
                button.clear-completed @click=clearCompleted Clear completed

style
.todoapp {
    max-width 550px
    margin 0 auto
    font 14px 'Helvetica Neue', Helvetica, Arial, sans-serif
}
.header h1 {
    font-size 100px
    font-weight 100
    text-align center
    color rgba(175, 47, 47, 0.15)
}
.new-todo {
    width 100%
    padding 16px 16px 16px 60px
    font-size 24px
    border none
    box-shadow inset 0 -2px 1px rgba(0,0,0,0.03)
}
.todo-list li {
    position relative
    border-bottom 1px solid #ededed
    padding 15px
}
.todo-list li.completed label {
    color #d9d9d9
    text-decoration line-through
}
.destroy {
    display none
    position absolute
    right 10px
    color #cc9a9a
}
.todo-list li:hover .destroy {
    display block
}
.filters {
    display flex
    gap 10px
    list-style none
    padding 0
}
.filters a {
    cursor pointer
    padding 3px 7px
}
.filters a.selected {
    border 1px solid rgba(175, 47, 47, 0.2)
}
.clear-completed {
    float right
    cursor pointer
}
```

---

## 用户管理应用

一个用户管理 CRUD 应用，展示异步数据操作。

```nui
import { asyncSignal, signal, computed } from '@fluxion-ui/fluxion'

// 用户数据
users = asyncSignal(() =>
    fetch('/api/users').then(r => r.json()).catch(() => [])
)

// 当前编辑的用户
editingUser = signal(null)
showModal = signal(false)

// 表单状态
formData = signal({
    name: '',
    email: '',
    role: 'user'
})

// 操作
function openCreateModal() {
    formData.set({ name: '', email: '', role: 'user' })
    editingUser.set(null)
    showModal.set(true)
}

function openEditModal(user) {
    formData.set({ name: user.name, email: user.email, role: user.role })
    editingUser.set(user)
    showModal.set(true)
}

function closeModal() {
    showModal.set(false)
    editingUser.set(null)
}

async function handleSubmit(e) {
    e.preventDefault()

    const data = formData()
    const editing = editingUser()

    try {
        if (editing) {
            // 更新
            await fetch(`/api/users/${editing.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            })
        } else {
            // 创建
            await fetch('/api/users', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            })
        }

        // 刷新列表
        users.reload()
        closeModal()
    } catch (error) {
        console.error('Failed to save user:', error)
    }
}

async function deleteUser(user) {
    if (confirm(`Delete user "${user.name}"?`)) {
        try {
            await fetch(`/api/users/${user.id}`, {
                method: 'DELETE'
            })
            users.reload()
        } catch (error) {
            console.error('Failed to delete user:', error)
        }
    }
}

view
div.user-management
    header.header
        h1 User Management
        button.btn-primary @click=openCreateModal + Add User

    // 用户列表
    if users.loading()
        p.loading Loading users...
    elif users.error()
        p.error Error loading users. Please try again.
    else
        table.user-table
            thead
                tr
                    th Name
                    th Email
                    th Role
                    th Actions
            tbody
                for user in users
                    tr key={user.id}
                        td {user.name}
                        td {user.email}
                        td {user.role}
                        td.actions
                            button @click={() => openEditModal(user)} Edit
                            button @click={() => deleteUser(user)} Delete

    // 模态框
    if showModal()
        div.modal-overlay @click=closeModal
            div.modal @click.stop
                h2 {editingUser() ? 'Edit User' : 'New User'}
                form @submit=handleSubmit
                    div.form-group
                        label Name
                        input type="text" value={formData().name} @input={(e) => formData.update(d => ({ ...d, name: e.target.value }))} required

                    div.form-group
                        label Email
                        input type="email" value={formData().email} @input={(e) => formData.update(d => ({ ...d, email: e.target.value }))} required

                    div.form-group
                        label Role
                        select value={formData().role} @change={(e) => formData.update(d => ({ ...d, role: e.target.value }))}
                            option value="user" User
                            option value="admin" Admin
                            option value="moderator" Moderator

                    div.form-actions
                        button type="button" @click=closeModal Cancel
                        button type="submit" class="btn-primary" Save

style
.user-management {
    max-width 1000px
    margin 0 auto
    padding 20px
}
.header {
    display flex
    justify-content space-between
    align-items center
    margin-bottom 20px
}
.user-table {
    width 100%
    border-collapse collapse
}
.user-table th,
.user-table td {
    padding 12px
    text-align left
    border-bottom 1px solid #ddd
}
.actions {
    display flex
    gap 8px
}
.btn-primary {
    background-color #007bff
    color white
    padding 8px 16px
    border none
    border-radius 4px
    cursor pointer
}
.modal-overlay {
    position fixed
    top 0
    left 0
    right 0
    bottom 0
    background rgba(0, 0, 0, 0.5)
    display flex
    align-items center
    justify-content center
}
.modal {
    background white
    padding 24px
    border-radius 8px
    width 400px
}
.form-group {
    margin-bottom 16px
}
.form-group label {
    display block
    margin-bottom 4px
}
.form-group input,
.form-group select {
    width 100%
    padding 8px
    border 1px solid #ddd
    border-radius 4px
}
.form-actions {
    display flex
    gap 8px
    justify-content flex-end
}
```

---

## 博客文章列表

展示博客文章列表，支持搜索和分类过滤。

```nui
import { asyncSignal, signal, computed } from '@fluxion-ui/fluxion'

// 文章数据
posts = asyncSignal(() =>
    fetch('/api/posts').then(r => r.json()).catch(() => [])
)

// 过滤状态
searchQuery = signal("")
selectedCategory = signal("all")

// 分类列表
categories = computed(() => {
    const allCategories = new Set(posts()?.map(p => p.category) || [])
    return ['all', ...allCategories]
})

// 过滤后的文章
filteredPosts = computed(() => {
    const list = posts() || []
    const query = searchQuery().toLowerCase()
    const category = selectedCategory()

    return list.filter(post => {
        const matchesSearch = !query ||
            post.title.toLowerCase().includes(query) ||
            post.content.toLowerCase().includes(query)
        const matchesCategory = category === 'all' || post.category === category
        return matchesSearch && matchesCategory
    })
})

// 格式化日期
function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    })
}

view
div.blog
    header.blog-header
        h1 Blog
        input.search-input value={searchQuery} @input={(e) => searchQuery.set(e.target.value)} placeholder="Search articles..."

    div.blog-content
        // 侧边栏
        aside.sidebar
            h3 Categories
            ul.category-list
                for category in categories
                    li key={category} class={selectedCategory() === category ? 'active' : ''}
                        a @click={() => selectedCategory.set(category)} {category}

        // 文章列表
        main.posts
            if posts.loading()
                p.loading Loading articles...
            else
                for post in filteredPosts
                    article.post-card key={post.id}
                        h2.post-title {post.title}
                        div.post-meta
                            span.date {formatDate(post.createdAt)}
                            span.category {post.category}
                        p.post-excerpt {post.excerpt}
                        a.read-more href={`/posts/${post.id}`} Read more →

style
.blog {
    max-width 1200px
    margin 0 auto
    padding 20px
}
.blog-header {
    text-align center
    margin-bottom 40px
}
.search-input {
    width 100%
    max-width 400px
    padding 12px 16px
    font-size 16px
    border 2px solid #e0e0e0
    border-radius 8px
}
.blog-content {
    display grid
    grid-template-columns 250px 1fr
    gap 40px
}
.sidebar h3 {
    margin-bottom 16px
}
.category-list {
    list-style none
    padding 0
}
.category-list li {
    margin-bottom 8px
}
.category-list li.active a {
    color #007bff
    font-weight bold
}
.category-list a {
    cursor pointer
    color #666
}
.category-list a:hover {
    color #333
}
.post-card {
    background white
    padding 24px
    border-radius 8px
    margin-bottom 20px
    box-shadow 0 2px 4px rgba(0,0,0,0.1)
}
.post-title {
    margin 0 0 8px
    font-size 24px
}
.post-meta {
    font-size 14px
    color #666
    margin-bottom 16px
}
.post-meta .date {
    margin-right 16px
}
.post-excerpt {
    color #333
    line-height 1.6
}
.read-more {
    color #007bff
    text-decoration none
}
```

---

## 下一步

- [常见模式](patterns.md) - 查看更多开发模式
- [调试技巧](debugging.md) - 学习调试方法