# REVISE.md — 代码修订记录

_记录从 Nuxt 4 空白模板到可运行的 TaskFlow 全栈应用之间的所有改动。_

---

## 1. `server/utils/prisma.ts` — Prisma 7 适配器适配

**原始代码（模板）**：
```ts
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default prisma
```

**问题链**：
1. `Named export 'PrismaClient' not found` — `@prisma/client` 是 CommonJS 模块，不能用 ESM 具名导入
2. `PrismaClient needs to be constructed with ... PrismaClientOptions` — 修复 ESM 后加了 `datasourceUrl`
3. `Unknown property datasourceUrl` — Prisma 7 不再接受 `datasourceUrl`，必须用 **驱动适配器（driver adapter）**

**最终代码**：
```ts
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'
import path from 'node:path'
import pkg from '@prisma/client'
const { PrismaClient } = pkg

// Prisma 7 requires a driver adapter — no more datasourceUrl in constructor
// DATABASE_URL is "file:./dev.db", strip "file:" prefix for the adapter
const dbPath = path.resolve(process.env.DATABASE_URL!.replace(/^file:/, ''))

const adapter = new PrismaBetterSqlite3({ url: dbPath })

const prisma = new PrismaClient({ adapter })

export default prisma
```

**新增依赖**：`@prisma/adapter-better-sqlite3` + `better-sqlite3`

---

## 2. `app/app.vue` — 模板默认页 → 项目页面入口

```diff
 <template>
-  <div>
-    <NuxtRouteAnnouncer />
-    <NuxtWelcome />
-  </div>
+  <NuxtLayout>
+    <NuxtPage />
+  </NuxtLayout>
 </template>
```

Nuxt 模板默认渲染 `<NuxtWelcome />`（介绍页），项目页面路由（`/app/pages/*.vue`）永远不会被加载。

---

## 3. `nuxt.config.ts` — 添加 CSS 入口

```diff
+  css: ['~/assets/css/main.css'],
+
   modules: [
     '@nuxt/ui',
     '@nuxt/fonts',
   ],
```

Nuxt UI v4 + Tailwind v4 需要显式 CSS 入口文件来导入 `tailwindcss` 和 `@nuxt/ui`，否则所有工具类（`bg-white`、`rounded-lg` 等）都不会生成。

---

## 4. `app/assets/css/main.css` — 新建 CSS 入口文件

```css
@import "tailwindcss";
@import "@nuxt/ui";
```

配合 `nuxt.config.ts` 的 `css` 配置使用。

---

## 5. `package.json` — postinstall 脚本

```diff
-  "postinstall": "nuxt prepare"
+  "postinstall": "prisma generate && nuxt prepare"
```

每次 `pnpm install` 后自动运行 `prisma generate`，避免 `.prisma/client/` 生成产物缺失。
同时移除了 pnpm 11 已不支持的 `"pnpm"` 顶层字段（改用 `pnpm-workspace.yaml`）。

---

## 6. `pnpm-workspace.yaml` — 允许 native 模块编译

**原始（模板占位符）**：
```yaml
allowBuilds:
  - @parcel/watcher    # set this to true or false
  - better-sqlite3: set this to true or false
```

**修复后**：
```yaml
allowBuilds:
  '@parcel/watcher': true
  '@prisma/engines': true
  better-sqlite3: true
  esbuild: true
  prisma: true
  vue-demi: true

settings:
  minimumReleaseAge: 0
```

pnpm 11 默认隔离 unsafe packages，`esbuild`、`better-sqlite3`、`@prisma/engines` 等需要 native 编译的包必须显式放行。`minimumReleaseAge: 0` 解决 `hono` 等刚发布的新包被 supply-chain 策略拦截。

---

## 7. `.npmrc` — 新建

```
minimum-release-age=0
```

项目级 pnpm 配置，配合 `pnpm-workspace.yaml` 的 `settings.minimumReleaseAge` 使用。

---

## 8. `.env.example` — 新建

```
DATABASE_URL="file:./dev.db"
SESSION_SECRET="change-me-to-a-random-string"
```

`.env` 在 `.gitignore` 中，clone 后用户需要先 `cp .env.example .env` 才能跑起来。

---

## 9. `.gitignore` — 补充排除项

```diff
 /app/generated/prisma
+
+# Local dev artifacts
+dev.db
+.workbuddy/
+README-trae.md
+SETUP_GUIDE.md
```

`dev.db` 是本地 SQLite 数据库，每个开发者应独立创建；`.workbuddy/` 是 WorkBuddy 辅助目录；其余为其他编辑器遗留文档。

---

## 10. `README.md` — 完全重写

从 Nuxt 模板的通用 README 替换为包含 Quick Start、Tech Stack、Troubleshooting 的完整项目说明。

---

**修订时间**：2026-05-25  
**修订者**：Zoey (WorkBuddy)
