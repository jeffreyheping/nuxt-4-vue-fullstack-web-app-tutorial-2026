# 使用 Nuxt 4 + Vue 3 构建全栈 Web 应用

> **原教程来源**：[Build a Full-Stack Web Application with Nuxt 4 and Vue 3](https://www.noqta.tn/en/tutorials/nuxt-4-vue-fullstack-web-app-tutorial-2026)
>
> 本中文版忠实翻译原教程，并在关键位置标注了实际搭建中遇到的坑及修正方案（标注为 **🔧 避坑提示**）。如欲了解所有坑点的完整汇总，请参阅项目根目录的 `原教程避坑指南.md`。

本教程将带你使用 Nuxt 4 和 Vue 3 构建一个全栈 Web 应用。你将构建一个名为 **TaskFlow** 的任务管理应用，包含身份认证、API 路由、以及通过 Prisma 管理数据库。学习完成后，你将拥有一套可投产的完整应用。

---

## 学习目标

完成本教程后，你将能够：

- 创建和配置一个带 TypeScript 的 Nuxt 4 项目
- 掌握 Nuxt 的文件路由系统
- 使用 Composition API 构建响应式 Vue 3 组件
- 用 Nitro 引擎创建服务端 API 路由
- 集成 Prisma ORM 进行数据库管理
- 实现基于 Session 的身份认证
- 将应用部署到生产环境

---

## 准备工作

在开始之前，请确保你的环境满足以下条件：

- **Node.js 20+** 已安装
- **pnpm**（Nuxt 推荐的包管理器）
- 基本的 **JavaScript/TypeScript** 知识
- 熟悉 **Vue.js** 基础（组件、响应式）
- 代码编辑器（推荐 VS Code + Volar 扩展）

> **🔧 避坑提示 — 关于数据库**：本教程原文使用 PostgreSQL，本文提供选项 A（PostgreSQL 原文）和选项 B（SQLite 零配置）两种数据库方案。教程末尾也附有切换方法。

---

## 你将构建什么

一个名为 **TaskFlow** 的全栈任务管理应用，包含：

- 用户注册和登录
- 任务的创建、编辑和删除
- 按状态筛选（待办、进行中、已完成）
- 基于 Nuxt UI 设计系统的响应式界面
- 安全的服务端 REST API

---

## 步骤 1：初始化 Nuxt 4 项目

首先创建一个新的 Nuxt 4 项目：

```bash
pnpm dlx nuxi@latest init taskflow-app
cd taskflow-app
```

当 CLI 提示你选择选项时：

- **包管理器**：pnpm
- **初始化 git**：是

然后安装依赖并启动开发服务器：

```bash
pnpm install
pnpm dev
```

你的应用将在 `http://localhost:3000` 上访问。

> **🔧 避坑提示 — 国内网络**：如果 `pnpm dlx nuxi` 因网络原因无法正常初始化，也可以手动创建项目结构。

### 项目结构

以下是 Nuxt 4 项目的基本目录结构：

```
taskflow-app/
├── app/                  # 客户端代码
│   ├── components/       # 可复用的 Vue 组件
│   ├── composables/      # 可复用的逻辑（hooks）
│   ├── layouts/          # 页面布局
│   ├── pages/            # 页面（自动路由）
│   └── app.vue           # 根组件
├── server/               # 服务端代码
│   ├── api/              # API 路由
│   ├── middleware/       # 服务端中间件
│   └── utils/            # 服务端工具函数
├── prisma/
│   └── schema.prisma     # 数据库 Schema
├── nuxt.config.ts        # Nuxt 配置
├── package.json
└── tsconfig.json
```

Nuxt 4 采用了新的目录结构，将所有客户端代码放在 `app/` 文件夹中。客户端（`app/`）和服务端（`server/`）的清晰分离，使代码组织更加良好。

> **🔧 避坑提示 — 路径别名**：Nuxt 4 中 `~/` 别名指向 `app/` 目录，`~~/` 别名指向项目根目录。在 `server/` 目录中导入时，务必使用 `~~/server/` 而非 `~/server/`（详见步骤 4）。

---

## 步骤 2：配置 Nuxt 4

更新你的 `nuxt.config.ts`，加入所需模块和配置：

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  future: {
    compatibilityVersion: 4,
  },

  devtools: { enabled: true },

  modules: [
    '@nuxt/ui',
  ],

  runtimeConfig: {
    sessionSecret: process.env.SESSION_SECRET || 'dev-secret-change-in-production',
    databaseUrl: process.env.DATABASE_URL,
    public: {
      appName: 'TaskFlow',
    },
  },

  compatibilityDate: '2026-03-01',
})
```

安装 Nuxt UI 模块：

```bash
pnpm add @nuxt/ui@^2.0.0
```

> **🔧 避坑提示 — Nuxt UI 版本**：上述命令中**必须加上 `@^2.0.0`**。如果直接 `pnpm add @nuxt/ui` 不加版本号，npm 会安装最新的 v3.x，v3 与教程代码完全不兼容（组件名不同、需要额外配置等），详见 `原教程避坑指南.md`。

创建 `.env` 文件在项目根目录：

**选项 A — PostgreSQL（原文）**：
```env
DATABASE_URL="postgresql://user:password@localhost:5432/taskflow"
SESSION_SECRET="your-super-secure-secret-here"
```

**选项 B — SQLite（零配置）**：
```env
DATABASE_URL="file:./dev.db"
SESSION_SECRET="your-super-secure-secret-here"
```

---

## 步骤 3：设置 Prisma 和数据库

### 3.1 安装 Prisma

```bash
pnpm add -D prisma@6.19.3
pnpm add @prisma/client@6.19.3
pnpm exec prisma init
```

> **🔧 避坑提示**：**务必锁定版本 `6.19.3`**。Prisma v7 有破坏性变更（移除 `datasource.url`），教程基于 v6。此外使用 `pnpm exec prisma` 而非 `pnpm dlx prisma`。

### 3.2 定义数据库 Schema

**PostgreSQL 版本（原文）**：

```prisma
// prisma/schema.prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id        String   @id @default(cuid())
  email     String   @unique
  name      String
  password  String
  tasks     Task[]
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model Task {
  id          String     @id @default(cuid())
  title       String
  description String?
  status      TaskStatus @default(TODO)
  priority    Priority   @default(MEDIUM)
  userId      String
  user        User       @relation(fields: [userId], references: [id], onDelete: Cascade)
  createdAt   DateTime   @default(now())
  updatedAt   DateTime @updatedAt
}

enum TaskStatus {
  TODO
  IN_PROGRESS
  DONE
}

enum Priority {
  LOW
  MEDIUM
  HIGH
}
```

> **🔧 选项 B（SQLite）—— schema 改法**
>
> SQLite **不支持原生枚举**，必须将 `status`/`priority` 字段改为 `String` 类型，并**删除** `enum TaskStatus` 和 `enum Priority` 的定义块：
>
> ```prisma
> // prisma/schema.prisma（SQLite 版本）
> datasource db {
>   provider = "sqlite"
>   url      = env("DATABASE_URL")
> }
>
> model User {
>   id        String   @id @default(cuid())
>   email     String   @unique
>   name      String
>   password  String
>   tasks     Task[]
>   createdAt DateTime @default(now())
>   updatedAt DateTime @updatedAt
> }
>
> model Task {
>   id          String   @id @default(cuid())
>   title       String
>   description String?
>   status      String   @default("TODO")    // ⚠️ SQLite 不支持 enum，改用 String
>   priority    String   @default("MEDIUM")  // ⚠️ 同上
>   userId      String
>   user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
>   createdAt   DateTime @default(now())
>   updatedAt   DateTime @updatedAt
> }
>
> // ⚠️ 不要添加 enum TaskStatus / enum Priority —— SQLite 不支持
> ```
>
> 切换回 PostgreSQL 只需改动两个文件，应用代码完全不动，详见附录。

### 3.3 执行数据库迁移

```bash
pnpm exec prisma migrate dev --name init
```

### 3.4 创建 Prisma 客户端工具

在 `server/utils/prisma.ts` 中创建一个服务端工具函数来访问 Prisma 客户端：

```typescript
// server/utils/prisma.ts
import pkg from '@prisma/client'
const { PrismaClient } = pkg

const prisma = new PrismaClient()

export default prisma
```

> **🔧 避坑提示**：由于 pnpm 解析后的 `@prisma/client` 是 CommonJS 模块，不能用 `import { PrismaClient } from '@prisma/client'`（会报 CJS/ESM 冲突）。必须用上面的写法通过默认导入解构获取。

---

## 步骤 4：创建 API 路由

Nuxt 使用 **Nitro** 引擎来驱动服务端路由。接下来创建你的 API 端点。

> **🔧 重要说明 — 导入路径**：以下全部服务端文件中的导入路径已从原文的 `~/server/` 修正为 `~~/server/`。在 Nuxt 4 中，`~/` 别名指向 `app/` 目录，而 `~~/` 指向项目根目录。服务端文件位于项目根目录的 `server/` 下（不在 `app/` 内），因此必须使用 `~~/server/`。

### 4.1 注册路由

```typescript
// server/api/auth/register.post.ts
import bcrypt from 'bcryptjs'
import prisma from '~~/server/utils/prisma'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  if (!body.email || !body.password || !body.name) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Email, name, and password are required',
    })
  }

  const existingUser = await prisma.user.findUnique({
    where: { email: body.email },
  })

  if (existingUser) {
    throw createError({
      statusCode: 409,
      statusMessage: 'An account with this email already exists',
    })
  }

  const hashedPassword = await bcrypt.hash(body.password, 12)

  const user = await prisma.user.create({
    data: {
      email: body.email,
      name: body.name,
      password: hashedPassword,
    },
    select: {
      id: true,
      email: true,
      name: true,
    },
  })

  const session = await useSession(event, {
    password: useRuntimeConfig().sessionSecret,
  })
  await session.update({ userId: user.id })

  return user
})
```

### 4.2 登录路由

```typescript
// server/api/auth/login.post.ts
import bcrypt from 'bcryptjs'
import prisma from '~~/server/utils/prisma'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  if (!body.email || !body.password) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Email and password are required',
    })
  }

  const user = await prisma.user.findUnique({
    where: { email: body.email },
  })

  if (!user || !(await bcrypt.compare(body.password, user.password))) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Invalid credentials',
    })
  }

  const session = await useSession(event, {
    password: useRuntimeConfig().sessionSecret,
  })
  await session.update({ userId: user.id })

  return {
    id: user.id,
    email: user.email,
    name: user.name,
  }
})
```

### 4.3 获取当前用户

```typescript
// server/api/auth/me.get.ts
export default defineEventHandler(async (event) => {
  const user = event.context.user
  if (!user) {
    throw createError({ statusCode: 401, statusMessage: 'Not authenticated' })
  }
  return user
})
```

### 4.4 登出路由

```typescript
// server/api/auth/logout.post.ts
export default defineEventHandler(async (event) => {
  const session = await useSession(event, {
    password: useRuntimeConfig().sessionSecret,
  })
  await session.clear()
  return { success: true }
})
```

### 4.5 服务端认证中间件

```typescript
// server/middleware/auth.ts
import prisma from '~~/server/utils/prisma'

export default defineEventHandler(async (event) => {
  const protectedRoutes = ['/api/tasks']

  const isProtected = protectedRoutes.some((route) =>
    event.path?.startsWith(route)
  )

  if (!isProtected) return

  const session = await useSession(event, {
    password: useRuntimeConfig().sessionSecret,
  })

  if (!session.data?.userId) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Not authenticated',
    })
  }

  const user = await prisma.user.findUnique({
    where: { id: session.data.userId as string },
    select: { id: true, email: true, name: true },
  })

  if (!user) {
    throw createError({
      statusCode: 401,
      statusMessage: 'User not found',
    })
  }

  event.context.user = user
})
```

### 4.6 任务 CRUD — 获取任务列表

```typescript
// server/api/tasks/index.get.ts
import prisma from '~~/server/utils/prisma'

export default defineEventHandler(async (event) => {
  const user = event.context.user
  const query = getQuery(event)

  const where: any = { userId: user.id }

  if (query.status) {
    where.status = query.status
  }

  const tasks = await prisma.task.findMany({
    where,
    orderBy: { createdAt: 'desc' },
  })

  return tasks
})
```

### 4.7 任务 CRUD — 创建任务

```typescript
// server/api/tasks/index.post.ts
import prisma from '~~/server/utils/prisma'

export default defineEventHandler(async (event) => {
  const user = event.context.user
  const body = await readBody(event)

  if (!body.title) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Title is required',
    })
  }

  const task = await prisma.task.create({
    data: {
      title: body.title,
      description: body.description || null,
      priority: body.priority || 'MEDIUM',
      userId: user.id,
    },
  })

  return task
})
```

### 4.8 任务 CRUD — 更新任务

```typescript
// server/api/tasks/[id]/index.patch.ts
import prisma from '~~/server/utils/prisma'

export default defineEventHandler(async (event) => {
  const user = event.context.user
  const id = getRouterParam(event, 'id')
  const body = await readBody(event)

  const task = await prisma.task.findFirst({
    where: { id, userId: user.id },
  })

  if (!task) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Task not found',
    })
  }

  const updated = await prisma.task.update({
    where: { id },
    data: {
      title: body.title ?? task.title,
      description: body.description ?? task.description,
      status: body.status ?? task.status,
      priority: body.priority ?? task.priority,
    },
  })

  return updated
})
```

### 4.9 任务 CRUD — 删除任务

```typescript
// server/api/tasks/[id]/index.delete.ts
import prisma from '~~/server/utils/prisma'

export default defineEventHandler(async (event) => {
  const user = event.context.user
  const id = getRouterParam(event, 'id')

  const task = await prisma.task.findFirst({
    where: { id, userId: user.id },
  })

  if (!task) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Task not found',
    })
  }

  await prisma.task.delete({ where: { id } })

  return { success: true }
})
```

### 4.10 安装 bcryptjs

```bash
pnpm add bcryptjs
pnpm add -D @types/bcryptjs
```

---

## 步骤 5：创建认证 Composable

创建一个 composable 来管理客户端认证状态：

```typescript
// app/composables/useAuth.ts
interface User {
  id: string
  email: string
  name: string
}

export function useAuth() {
  const user = useState<User | null>('auth-user', () => null)
  const isAuthenticated = computed(() => !!user.value)

  async function login(email: string, password: string) {
    const data = await $fetch<User>('/api/auth/login', {
      method: 'POST',
      body: { email, password },
    })
    user.value = data
    return data
  }

  async function register(name: string, email: string, password: string) {
    const data = await $fetch<User>('/api/auth/register', {
      method: 'POST',
      body: { name, email, password },
    })
    user.value = data
    return data
  }

  async function logout() {
    await $fetch('/api/auth/logout', { method: 'POST' })
    user.value = null
    navigateTo('/login')
  }

  async function fetchUser() {
    try {
      const data = await $fetch<User>('/api/auth/me')
      user.value = data
    } catch {
      user.value = null
    }
  }

  return {
    user,
    isAuthenticated,
    login,
    register,
    logout,
    fetchUser,
  }
}
```

---

## 步骤 6：创建主布局

定义一个带导航栏的布局：

```vue
<!-- app/layouts/default.vue -->
<script setup lang="ts">
const { user, isAuthenticated, logout } = useAuth()
const config = useRuntimeConfig()
</script>

<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900">
    <header class="bg-white dark:bg-gray-800 shadow-sm">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center h-16">
          <NuxtLink to="/" class="text-xl font-bold text-primary">
            {{ config.public.appName }}
          </NuxtLink>

          <nav class="flex items-center gap-4">
            <template v-if="isAuthenticated">
              <span class="text-sm text-gray-600 dark:text-gray-300">
                {{ user?.name }}
              </span>
              <UButton
                variant="ghost"
                color="red"
                @click="logout"
              >
                退出登录
              </UButton>
            </template>
            <template v-else>
              <UButton to="/login" variant="ghost">登录</UButton>
              <UButton to="/register" color="primary">注册</UButton>
            </template>
          </nav>
        </div>
      </div>
    </header>

    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <slot />
    </main>
  </div>
</template>
```

---

## 步骤 7：构建页面

### 7.1 `app.vue` 根组件

```vue
<!-- app/app.vue -->
<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>
```

> **🔧 说明**：Nuxt UI v2 不需要额外的 `<UApp>` 包裹组件，直接用 `<NuxtLayout>` 和 `<NuxtPage>` 即可。

### 7.2 首页

```vue
<!-- app/pages/index.vue -->
<script setup lang="ts">
const { isAuthenticated } = useAuth()
</script>

<template>
  <div class="text-center py-20">
    <h1 class="text-4xl font-bold text-gray-900 dark:text-white mb-4">
      高效管理你的任务
    </h1>
    <p class="text-lg text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
      TaskFlow 是一款简单而强大的任务管理器。
      帮助你组织、排定优先级，并追踪项目进度。
    </p>
    <div class="flex gap-4 justify-center">
      <UButton
        v-if="!isAuthenticated"
        to="/register"
        size="lg"
        color="primary"
      >
        免费开始使用
      </UButton>
      <UButton
        v-if="isAuthenticated"
        to="/dashboard"
        size="lg"
        color="primary"
      >
        进入工作台
      </UButton>
    </div>
  </div>
</template>
```

### 7.3 登录页

```vue
<!-- app/pages/login.vue -->
<script setup lang="ts">
definePageMeta({ layout: 'default' })

const { login } = useAuth()
const error = ref('')
const loading = ref(false)

const form = reactive({
  email: '',
  password: '',
})

async function handleSubmit() {
  error.value = ''
  loading.value = true
  try {
    await login(form.email, form.password)
    navigateTo('/dashboard')
  } catch (e: any) {
    error.value = e.data?.statusMessage || '登录失败'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="max-w-md mx-auto mt-16">
    <UCard>
      <template #header>
        <h2 class="text-2xl font-bold text-center">登录</h2>
      </template>

      <form @submit.prevent="handleSubmit" class="space-y-4">
        <UAlert
          v-if="error"
          color="red"
          :title="error"
          variant="subtle"
        />

        <UFormGroup label="邮箱">
          <UInput
            v-model="form.email"
            type="email"
            placeholder="you@email.com"
            required
          />
        </UFormGroup>

        <UFormGroup label="密码">
          <UInput
            v-model="form.password"
            type="password"
            placeholder="你的密码"
            required
          />
        </UFormGroup>

        <UButton
          type="submit"
          block
          :loading="loading"
        >
          登录
        </UButton>
      </form>

      <template #footer>
        <p class="text-center text-sm text-gray-500">
          还没有账号？
          <NuxtLink to="/register" class="text-primary font-medium">
            立即注册
          </NuxtLink>
        </p>
      </template>
    </UCard>
  </div>
</template>
```

### 7.4 注册页

```vue
<!-- app/pages/register.vue -->
<script setup lang="ts">
definePageMeta({ layout: 'default' })

const { register } = useAuth()
const error = ref('')
const loading = ref(false)

const form = reactive({
  name: '',
  email: '',
  password: '',
  confirmPassword: '',
})

async function handleSubmit() {
  if (form.password !== form.confirmPassword) {
    error.value = '两次输入的密码不一致'
    return
  }

  error.value = ''
  loading.value = true
  try {
    await register(form.name, form.email, form.password)
    navigateTo('/dashboard')
  } catch (e: any) {
    error.value = e.data?.statusMessage || '注册失败'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="max-w-md mx-auto mt-16">
    <UCard>
      <template #header>
        <h2 class="text-2xl font-bold text-center">注册</h2>
      </template>

      <form @submit.prevent="handleSubmit" class="space-y-4">
        <UAlert
          v-if="error"
          color="red"
          :title="error"
          variant="subtle"
        />

        <UFormGroup label="用户名">
          <UInput
            v-model="form.name"
            placeholder="你的名字"
            required
          />
        </UFormGroup>

        <UFormGroup label="邮箱">
          <UInput
            v-model="form.email"
            type="email"
            placeholder="you@email.com"
            required
          />
        </UFormGroup>

        <UFormGroup label="密码">
          <UInput
            v-model="form.password"
            type="password"
            placeholder="至少 8 个字符"
            required
            minlength="8"
          />
        </UFormGroup>

        <UFormGroup label="确认密码">
          <UInput
            v-model="form.confirmPassword"
            type="password"
            placeholder="再次输入密码"
            required
          />
        </UFormGroup>

        <UButton
          type="submit"
          block
          :loading="loading"
        >
          创建账号
        </UButton>
      </form>

      <template #footer>
        <p class="text-center text-sm text-gray-500">
          已有账号？
          <NuxtLink to="/login" class="text-primary font-medium">
            立即登录
          </NuxtLink>
        </p>
      </template>
    </UCard>
  </div>
</template>
```

### 7.5 工作台（Dashboard）

```vue
<!-- app/pages/dashboard.vue -->
<script setup lang="ts">
definePageMeta({
  middleware: 'auth',
})

interface Task {
  id: string
  title: string
  description: string | null
  status: 'TODO' | 'IN_PROGRESS' | 'DONE'
  priority: 'LOW' | 'MEDIUM' | 'HIGH'
  createdAt: string
}

const activeFilter = ref<string | null>(null)

// 建议：不加 await，避免阻塞组件渲染（原教程写了 await，v2 下不崩溃，但去掉更规范）
const { data: tasks, pending, refresh } = useFetch<Task[]>('/api/tasks', {
  query: computed(() => ({
    status: activeFilter.value || undefined,
  })),
})

const showCreateModal = ref(false)

// 建议：用独立 ref 替代 reactive，在 UModal 等 teleported 组件中更可靠
const taskTitle = ref('')
const taskDescription = ref('')
const taskPriority = ref<'LOW' | 'MEDIUM' | 'HIGH'>('MEDIUM')

function resetForm() {
  taskTitle.value = ''
  taskDescription.value = ''
  taskPriority.value = 'MEDIUM'
}

async function createTask() {
  await $fetch('/api/tasks', {
    method: 'POST',
    body: {
      title: taskTitle.value,
      description: taskDescription.value || null,
      priority: taskPriority.value,
    },
  })
  resetForm()
  showCreateModal.value = false
  refresh()
}

async function updateTaskStatus(taskId: string, status: string) {
  await $fetch(`/api/tasks/${taskId}`, {
    method: 'PATCH',
    body: { status },
  })
  refresh()
}

async function deleteTask(taskId: string) {
  await $fetch(`/api/tasks/${taskId}`, {
    method: 'DELETE',
  })
  refresh()
}

const filters = [
  { label: '全部', value: null },
  { label: '待办', value: 'TODO' },
  { label: '进行中', value: 'IN_PROGRESS' },
  { label: '已完成', value: 'DONE' },
]

const priorityColors = {
  LOW: 'green',
  MEDIUM: 'yellow',
  HIGH: 'red',
} as const

const statusLabels = {
  TODO: '待办',
  IN_PROGRESS: '进行中',
  DONE: '已完成',
} as const
</script>

<template>
  <div>
    <div class="flex justify-between items-center mb-8">
      <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
        我的任务
      </h1>
      <UButton
        color="primary"
        icon="i-heroicons-plus"
        @click="showCreateModal = true"
      >
        新建任务
      </UButton>
    </div>

    <!-- 筛选器 -->
    <div class="flex gap-2 mb-6">
      <UButton
        v-for="filter in filters"
        :key="filter.label"
        :variant="activeFilter === filter.value ? 'solid' : 'ghost'"
        size="sm"
        @click="activeFilter = filter.value"
      >
        {{ filter.label }}
      </UButton>
    </div>

    <!-- 任务列表 -->
    <div v-if="pending" class="text-center py-12 text-gray-500">
      <p class="text-lg">加载中...</p>
    </div>

    <div v-else class="space-y-3">
      <UCard
        v-for="task in tasks"
        :key="task.id"
      >
        <div class="flex items-start justify-between">
          <div class="flex-1">
            <div class="flex items-center gap-2 mb-1">
              <h3
                class="font-medium"
                :class="task.status === 'DONE' ? 'line-through text-gray-400' : ''"
              >
                {{ task.title }}
              </h3>
              <UBadge :color="priorityColors[task.priority]" size="xs">
                {{ task.priority }}
              </UBadge>
            </div>
            <p v-if="task.description" class="text-sm text-gray-500">
              {{ task.description }}
            </p>
          </div>

          <div class="flex items-center gap-2">
            <USelect
              :model-value="task.status"
              :options="[
                { label: '待办', value: 'TODO' },
                { label: '进行中', value: 'IN_PROGRESS' },
                { label: '已完成', value: 'DONE' },
              ]"
              size="sm"
              @update:model-value="updateTaskStatus(task.id, $event)"
            />
            <UButton
              icon="i-heroicons-trash"
              color="red"
              variant="ghost"
              size="sm"
              @click="deleteTask(task.id)"
            />
          </div>
        </div>
      </UCard>

      <div
        v-if="!tasks?.length"
        class="text-center py-12 text-gray-500"
      >
        <p class="text-lg mb-2">暂无任务</p>
        <p class="text-sm">点击「新建任务」开始吧</p>
      </div>
    </div>

    <!-- 创建任务弹窗 -->
    <UModal v-model="showCreateModal">
      <UCard>
        <template #header>
          <h3 class="text-lg font-medium">新建任务</h3>
        </template>

        <form @submit.prevent="createTask" class="space-y-4">
          <UFormGroup label="标题" required>
            <UInput
              v-model="taskTitle"
              placeholder="任务标题"
              required
            />
          </UFormGroup>

          <UFormGroup label="描述">
            <UTextarea
              v-model="taskDescription"
              placeholder="可选描述"
            />
          </UFormGroup>

          <UFormGroup label="优先级">
            <USelect
              v-model="taskPriority"
              :options="[
                { label: '低', value: 'LOW' },
                { label: '中', value: 'MEDIUM' },
                { label: '高', value: 'HIGH' },
              ]"
            />
          </UFormGroup>

          <div class="flex justify-end gap-2">
            <UButton
              variant="ghost"
              @click="showCreateModal = false"
            >
              取消
            </UButton>
            <UButton type="submit" color="primary">
              创建
            </UButton>
          </div>
        </form>
      </UCard>
    </UModal>
  </div>
</template>
```

---

## 步骤 8：客户端认证中间件

创建一个导航中间件来保护页面：

```typescript
// app/middleware/auth.ts
export default defineNuxtRouteMiddleware(async (to) => {
  const { isAuthenticated, fetchUser } = useAuth()

  await fetchUser()

  if (!isAuthenticated.value) {
    return navigateTo('/login')
  }
})
```

---

## 步骤 9：使用 Zod 添加数据验证

安装 Zod 进行服务端数据验证：

```bash
pnpm add zod
```

创建验证工具：

```typescript
// server/utils/validate.ts
import { z } from 'zod'

export const createTaskSchema = z.object({
  title: z.string().min(1, '标题不能为空').max(200),
  description: z.string().max(1000).optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH']).default('MEDIUM'),
})

export const updateTaskSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().max(1000).nullable().optional(),
  status: z.enum(['TODO', 'IN_PROGRESS', 'DONE']).optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH']).optional(),
})

export const loginSchema = z.object({
  email: z.string().email('邮箱格式不正确'),
  password: z.string().min(1, '密码不能为空'),
})

export const registerSchema = z.object({
  name: z.string().min(2, '用户名至少需要 2 个字符'),
  email: z.string().email('邮箱格式不正确'),
  password: z.string().min(8, '密码至少需要 8 个字符'),
})
```

然后更新任务创建路由，加入验证逻辑：

```typescript
// server/api/tasks/index.post.ts（更新版）
import prisma from '~~/server/utils/prisma'
import { createTaskSchema } from '~~/server/utils/validate'

export default defineEventHandler(async (event) => {
  const user = event.context.user
  const body = await readBody(event)

  const result = createTaskSchema.safeParse(body)
  if (!result.success) {
    throw createError({
      statusCode: 400,
      statusMessage: result.error.issues[0].message,
    })
  }

  const task = await prisma.task.create({
    data: {
      ...result.data,
      description: result.data.description || null,
      userId: user.id,
    },
  })

  return task
})
```

---

## 步骤 10：测试你的应用

启动开发服务器：

```bash
pnpm dev
```

测试完整流程：

1. 访问 `http://localhost:3000` — 首页正常显示
2. 点击「注册」并填写表单
3. 在工作台中创建任务
4. 通过下拉菜单更改任务状态
5. 按状态筛选任务
6. 用删除按钮删除任务

如果使用 PostgreSQL，请确保数据库正在运行且 `DATABASE_URL` 配置正确。

---

## 步骤 11：准备生产环境

### 构建配置

更新 `nuxt.config.ts`，加入生产环境配置：

```typescript
// nuxt.config.ts（生产环境追加内容）
export default defineNuxtConfig({
  // ...已有配置

  nitro: {
    preset: 'node-server',
    compressPublicAssets: true,
  },

  app: {
    head: {
      title: 'TaskFlow - 任务管理器',
      meta: [
        { name: 'description', content: '现代化高效任务管理应用' },
      ],
    },
  },
})
```

### 构建并运行

```bash
# 生产环境构建
pnpm build

# 生产环境运行
node .output/server/index.mjs
```

### 使用 Docker 部署

创建 `Dockerfile`：

```dockerfile
FROM node:20-slim AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

FROM base AS build
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile
COPY . .
RUN pnpm exec prisma generate
RUN pnpm build

FROM base AS production
WORKDIR /app
COPY --from=build /app/.output .output
COPY --from=build /app/node_modules/.prisma node_modules/.prisma
COPY --from=build /app/prisma prisma

ENV NODE_ENV=production
EXPOSE 3000

CMD ["node", ".output/server/index.mjs"]
```

```bash
# 构建并运行
docker build -t taskflow .
docker run -p 3000:3000 --env-file .env taskflow
```

---

## 故障排查

### Nuxt UI 组件未渲染 / 表单无法交互

确认 `@nuxt/ui` 安装的是 v2.x 版本：执行 `npm ls @nuxt/ui` 查看版本号。如果显示 v3.x：

```bash
pnpm remove @nuxt/ui
pnpm add @nuxt/ui@^2.0.0
rm -rf node_modules .nuxt pnpm-lock.yaml
pnpm install
```

### 报错 "Cannot find module @prisma/client"

确保在安装依赖后执行了 `pnpm exec prisma generate`。

### 报错 "Named export 'PrismaClient' not found"

将 `server/utils/prisma.ts` 中的导入改为 CJS 兼容写法：
```typescript
import pkg from '@prisma/client'
const { PrismaClient } = pkg
```

### Session 不持久

检查 `.env` 文件中是否定义了 `SESSION_SECRET`。在生产环境中，请使用足够长的随机密钥。

### 数据库连接错误

验证 `DATABASE_URL` 配置是否正确，确保数据库服务可访问。

---

## 后续方向

现在你的应用已经可以正常运行了，以下是一些可以继续探索的方向：

- **添加分类**：按项目组织任务
- **实现拖拽功能**：用 vue-draggable 构建看板视图
- **添加邮件通知**：对逾期任务发送提醒
- **集成 OAuth**：通过 nuxt-auth-utils 接入 Google 或 GitHub 登录
- **添加测试**：使用 Vitest 和 Testing Library
- **选择性 SSR**：优化性能

---

## 总结

你已经用 Nuxt 4 和 Vue 3 构建了一个完整的全栈 Web 应用。本教程涵盖了：

- Nuxt 4 的新项目结构（`app/` 目录）
- 自动文件路由系统
- 基于 Nitro 引擎的 API 路由
- 使用 Prisma ORM 进行数据库管理
- Vue 3 Composition API 构建响应式组件
- 使用 Zod 进行数据验证
- 使用 Docker 进行部署

Nuxt 4 凭借其无缝的服务端集成和丰富的模块生态，提供了极为出色的全栈开发体验。无论你是搭建 MVP 还是企业级应用，Nuxt 4 都是 Vue.js 项目的可靠选择。

---

## 附录：从 SQLite 切换到 PostgreSQL

如果你最初使用了 SQLite，要切换到 PostgreSQL，只需改动两个文件（应用代码完全不用动）：

### 改动 1：`prisma/schema.prisma`

```diff
datasource db {
-  provider = "sqlite"
-  url      = env("DATABASE_URL")
+  provider = "postgresql"
+  url      = env("DATABASE_URL")
}

model Task {
  // ...
-  status   String   @default("TODO")
-  priority String   @default("MEDIUM")
+  status   TaskStatus @default(TODO)
+  priority Priority   @default(MEDIUM)
  // ...
}

+enum TaskStatus {
+  TODO
+  IN_PROGRESS
+  DONE
+}
+
+enum Priority {
+  LOW
+  MEDIUM
+  HIGH
+}
```

### 改动 2：`.env`

```diff
-DATABASE_URL="file:./dev.db"
+DATABASE_URL="postgresql://user:password@localhost:5432/taskflow"
```

然后执行：

```bash
pnpm exec prisma generate
pnpm exec prisma migrate dev --name switch-to-postgres
```

---

> **本文档在忠实翻译原教程的基础上，对所有已知坑点进行了标注和修正。如果你在实际搭建中遇到新的问题，欢迎补充到 `原教程避坑指南.md` 中。**
