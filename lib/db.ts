import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Configure database URL with connection pool parameters for Vercel
const databaseUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL || process.env.POSTGRES_PRISMA_URL
const optimizedDatabaseUrl = databaseUrl ? 
  `${databaseUrl}?connection_limit=1&pool_timeout=20&connect_timeout=60&schema=public&pgbouncer=true&prepared_statements=false` : 
  databaseUrl

// Create a fallback Prisma client that handles missing generated client gracefully
let prisma: PrismaClient

try {
  prisma = globalForPrisma.prisma ?? new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
    datasources: {
      db: {
        url: optimizedDatabaseUrl,
      },
    },
  })
} catch (error) {
  console.warn('Prisma client not available, using fallback:', error)
  // Create a minimal fallback client for build time
  prisma = {} as PrismaClient
}

export { prisma }
export default prisma
