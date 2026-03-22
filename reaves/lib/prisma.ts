// lib/prisma.ts — Prisma 7 singleton with PrismaPg driver adapter
import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '@prisma/client'

// DATABASE_URL should point to the Supabase *pooled* connection (port 6543)
const connectionString = process.env.DATABASE_URL

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
  pool: Pool | undefined
}

function makePrisma() {
  if (!globalForPrisma.pool) {
    globalForPrisma.pool = new Pool({ connectionString })
  }
  const adapter = new PrismaPg(globalForPrisma.pool as any)
  return new PrismaClient({ adapter } as any)
}

const prisma = globalForPrisma.prisma ?? makePrisma()

export default prisma

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}
