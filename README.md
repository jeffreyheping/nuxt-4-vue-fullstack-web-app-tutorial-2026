# TaskFlow

A fullstack task management app built with **Nuxt 4** + **Prisma 7** + **SQLite**.

Features: user registration/login (bcrypt + cookie session), task board (TODO / IN_PROGRESS / DONE), priority levels (LOW / MEDIUM / HIGH).

## Prerequisites

- **Node.js** >= 20
- **pnpm** >= 10 (the project uses `pnpm-lock.yaml`)
- Git Bash or any Linux/Mac terminal (for shell commands below)

## Quick Start

```bash
# 1. Clone
git clone https://github.com/jeffreyheping/nuxt-4-vue-fullstack-web-app-tutorial-2026.git
cd nuxt-4-vue-fullstack-web-app-tutorial-2026

# 2. Set up environment
cp .env.example .env
# Edit .env — change SESSION_SECRET to a random string

# 3. (pnpm 11 only) Disable the minimumReleaseAge supply-chain check
#    Skip this if your pnpm version < 11
pnpm config set minimum-release-age 0 --location global

# 4. Install dependencies & generate Prisma client
pnpm install

# 5. Run database migration
pnpm exec prisma migrate dev --name init

# 6. Start dev server
pnpm dev
```

Open **http://localhost:3000** in your browser.

## What `pnpm install` Does

The `postinstall` script in `package.json` runs automatically:

```json
"postinstall": "prisma generate && nuxt prepare"
```

This generates the Prisma client and the Nuxt `.nuxt` directory — no additional steps needed.

## Project Structure

```
├── app/
│   ├── app.vue              # Root component (<NuxtLayout> + <NuxtPage>)
│   ├── assets/css/main.css  # Tailwind + Nuxt UI entry
│   ├── layouts/             # Layout templates
│   ├── pages/               # Route pages (index, login, register, dashboard)
│   └── composables/         # Auth composable (useAuth)
├── prisma/
│   └── schema.prisma        # Database schema (User + Task models)
├── server/
│   ├── api/                 # API endpoints (auth, tasks)
│   └── utils/prisma.ts      # Prisma client singleton
├── prisma.config.ts         # Prisma Nuxt module config
├── nuxt.config.ts           # Nuxt config (modules, css)
├── pnpm-workspace.yaml      # pnpm allowBuilds for native modules
└── .env.example             # Environment variable template
```

## Tech Stack

| Layer       | Technology                |
| ----------- | ------------------------- |
| Framework   | Nuxt 4.4 + Vue 3.5       |
| UI          | Nuxt UI v4 + Tailwind v4 |
| Database    | SQLite (via better-sqlite3) |
| ORM         | Prisma 7 (driver adapter) |
| Auth        | bcryptjs + cookie session |
| Package Mgr | pnpm                      |

## Troubleshooting

| Error                                                   | Fix                                                                          |
| ------------------------------------------------------- | ---------------------------------------------------------------------------- |
| `Named export 'PrismaClient' not found`                 | Prisma client is CJS — already handled in `server/utils/prisma.ts`           |
| `Cannot find module '.prisma/client/default'`           | Run `pnpm exec prisma generate` (or re-run `pnpm install`)                   |
| `pnpm: supply-chain policy prevented installation`      | Run `pnpm config set minimum-release-age 0 --location global`                |
| Native module (esbuild/better-sqlite3) build fails      | Ensure `pnpm-workspace.yaml` has all native packages under `allowBuilds`     |

## Notes

- The `.npmrc` file is project-level and sets `minimum-release-age=0` to prevent pnpm 11 supply-chain blocks.
- `pnpm-workspace.yaml` handles `allowBuilds` for native modules (`esbuild`, `better-sqlite3`, `@prisma/engines`, etc.).
- `dev.db` and `.workbuddy/` are git-ignored — they are local development artifacts.
