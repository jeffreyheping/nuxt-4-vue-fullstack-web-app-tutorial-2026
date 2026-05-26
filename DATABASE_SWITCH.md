# 数据库切换指南：SQLite → PostgreSQL

当前项目使用 **SQLite**（零配置、文件型数据库）。如需切换到 **PostgreSQL**，只需修改 **2 个文件**，代码本身无需任何改动。

---

## 最简切换步骤（改 2 个文件）

### 1. 修改 `.env` — 改连接字符串

```diff
- DATABASE_URL="file:./dev.db"
+ DATABASE_URL="postgresql://user:password@localhost:5432/taskflow"
```

### 2. 修改 `prisma/schema.prisma` — 改 provider + 恢复 enum

```diff
datasource db {
-  provider = "sqlite"
+  provider = "postgresql"
   url      = env("DATABASE_URL")
}
```

同时把 Task 模型中的 String 字段恢复为原生 enum：

```diff
model Task {
   // ...
-  status      String     @default("TODO")
+  status      TaskStatus @default(TODO)
-  priority    String     @default("MEDIUM")
+  priority    Priority   @default(MEDIUM)
   // ...
}

+ enum TaskStatus {
+   TODO
+   IN_PROGRESS
+   DONE
+ }
+
+ enum Priority {
+   LOW
+   MEDIUM
+   HIGH
+ }
```

### 3. 重建数据库

```bash
# 确保 PostgreSQL 已运行，然后执行迁移
pnpm dlx prisma migrate dev --name init
```

---

## 为什么代码不用改？

- Prisma Client API 完全一致——`prisma.user.create()`、`prisma.task.findMany()` 等调用无需修改
- SQLite 不支持原生 enum，当前用 String 字段代替；Zod 验证层（`server/utils/validate.ts`）已经确保了值的合法性
- API 路由、前端页面、认证逻辑全部与数据库无关

---

## 两种模式对比

| | SQLite（当前） | PostgreSQL |
|---|---|---|
| 配置 | 零配置，文件即数据库 | 需安装和运行 PostgreSQL 服务 |
| 连接字符串 | `file:./dev.db` | `postgresql://user:pass@host:5432/db` |
| enum 支持 | 不支持，用 String 模拟 | 原生支持 |
| 适用场景 | 开发、单机、轻量部署 | 生产、多用户、高并发 |
| 并发写入 | 单写（文件锁） | 多写（MVCC） |

---

## 已确认兼容的 Prisma 特性

以下特性在 SQLite 和 PostgreSQL 下均可正常工作（代码无需修改）：

- ✅ `@id @default(cuid())` 主键
- ✅ `@unique` 唯一约束
- ✅ `@relation` 关联查询
- ✅ `@default(now())` / `@updatedAt` 时间戳
- ✅ `onDelete: Cascade` 级联删除
- ✅ `orderBy`、`where`、分页查询
