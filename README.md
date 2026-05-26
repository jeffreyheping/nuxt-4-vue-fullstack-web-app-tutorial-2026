# TaskFlow

> 一个跟着教程搭建、踩坑、修坑、再整理出来的全栈任务管理器。

---

## 前世今生

2026 年 3 月，来自突尼斯的开发者 [@noqta](https://www.noqta.tn/en/tutorials/nuxt-4-vue-fullstack-web-app-tutorial-2026) 发布了一篇 Nuxt 4 全栈教程，用来演示用 Vue 3 + Nuxt 4 + Nuxt UI 搭建一个带注册/登录的任务管理应用。

两个月后，我照着这篇教程重新搭建——踩了整整 10 个坑，大部分源于依赖包在这两个月里悄悄升了主版本。

本仓库是这段折腾的最终产物：
- 一个可以跑起来的完整项目（SQLite 版）
- 一份帮你避开所有坑的中文教程 [`Nuxt4全栈教程-中文无坑版.md`](./Nuxt4全栈教程-中文无坑版.md)
- 一份记录踩坑过程的复盘文档 [`原教程避坑指南.md`](./原教程避坑指南.md)
- 一份随时切换 PostgreSQL 的说明 [`DATABASE_SWITCH.md`](./DATABASE_SWITCH.md)

---

## 功能

- 用户注册 / 登录 / 登出（session-based 认证）
- 创建、编辑、删除任务
- 按状态筛选（TODO / IN_PROGRESS / DONE）
- 响应式界面（Nuxt UI 组件）

---

## 技术栈

| 层 | 技术 |
|----|------|
| 前端 | Nuxt 4 + Vue 3 + **@nuxt/ui v2** |
| 后端 | Nitro（Nuxt 内置）|
| 数据库 | SQLite（Prisma 6） |
| 验证 | Zod |
| 密码 | bcryptjs |

> **⚠️ 关于 @nuxt/ui 版本**：本项目固定使用 v2.22.3，不是 v3。教程发布时默认装 v2，但现在 `pnpm add @nuxt/ui` 会装 v3，两个版本差异巨大且不兼容，是所有坑的根源。见下方说明。

---

## 快速开始

### 依赖

- Node.js >= 18
- pnpm

### 安装

```bash
pnpm install
```

### 配置数据库

```bash
# 复制环境变量
cp .env.example .env

# 初始化 SQLite 数据库
npx prisma db push
```

`.env` 内容：

```env
DATABASE_URL="file:./prisma/dev.db"
NUXT_SESSION_PASSWORD="your-secret-key-at-least-32-chars"
```

### 启动开发服务器

```bash
pnpm dev
```

打开 [http://localhost:3000](http://localhost:3000)，注册账号即可开始使用。

---

## 主要踩坑记录

教程虽然写得清晰，但按步骤操作时因依赖版本漂移会连续踩坑。以下是必须手动处理的 4 项：

| # | 问题 | 原因 | 修正 |
|---|------|------|------|
| 1 | 整个 UI 无法运行 | `@nuxt/ui` 默认装了 v3，教程基于 v2 | 锁定 `@nuxt/ui@^2.0.0` |
| 2 | Prisma schema 语法报错 | Prisma 7 破坏性变更 | 锁定 `prisma@6.19.3` |
| 3 | `Cannot find module` | Nuxt 4 中 `~/` 指向 `app/`，不是项目根 | 服务端导入改用 `~~/server/` |
| 4 | PrismaClient named export 报错 | pnpm 下 `@prisma/client` 是 CJS 模块 | 用 `import pkg from '@prisma/client'` |

完整复盘见 [原教程避坑指南.md](./原教程避坑指南.md)。

---

## 切换 PostgreSQL

只需修改两个文件，无需改应用代码。详见 [DATABASE_SWITCH.md](./DATABASE_SWITCH.md)。

---

## 参考

- 原始教程：[Nuxt 4 Vue Fullstack Web App Tutorial 2026](https://www.noqta.tn/en/tutorials/nuxt-4-vue-fullstack-web-app-tutorial-2026)
- 中文教程（含修正）：[Nuxt4全栈教程-中文无坑版.md](./Nuxt4全栈教程-中文无坑版.md)
