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
