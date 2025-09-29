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
  // Vercel-specific optimizations
  __internal: {
    engine: {
      connectTimeout: 60000,
      requestTimeout: 60000,
    },
  },
})

// Prevent multiple instances in development
if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}

// Enhanced error handling for Vercel
prisma.$on('beforeExit', async () => {
  console.log('Prisma client disconnecting...')
  await prisma.$disconnect()
})

export default prisma
