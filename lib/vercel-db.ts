import { PrismaClient } from '@prisma/client'

// Vercel-specific Prisma client configuration
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Optimized configuration for Vercel serverless functions
export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
})

// Prevent multiple instances in development
if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}

export default prisma
