import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function initializeDatabase() {
  try {
    console.log('🔍 Checking if admin user exists...')
    
    // Check if admin user already exists
    const existingAdmin = await prisma.user.findFirst({
      where: { role: 'ADMIN' }
    })

    if (existingAdmin) {
      console.log('✅ Admin user already exists:', existingAdmin.email)
      return
    }

    console.log('👤 Creating default admin user...')
    
    // Create default admin user
    const hashedPassword = await bcrypt.hash('admin123', 12)
    
    const adminUser = await prisma.user.create({
      data: {
        name: 'Admin User',
        email: 'admin@library.com',
        password: hashedPassword,
        role: 'ADMIN'
      }
    })

    console.log('✅ Admin user created successfully!')
    console.log('📧 Email:', adminUser.email)
    console.log('🔑 Password: admin123')
    console.log('⚠️  Please change the password after first login!')

  } catch (error) {
    console.error('❌ Error initializing database:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Run if called directly
if (require.main === module) {
  initializeDatabase()
    .then(() => {
      console.log('🎉 Database initialization completed!')
      process.exit(0)
    })
    .catch((error) => {
      console.error('💥 Database initialization failed:', error)
      process.exit(1)
    })
}

export default initializeDatabase
