import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../lib/db'
import bcrypt from 'bcryptjs'

export async function POST(request: NextRequest) {
  try {
    console.log('🚀 Starting database migration and initialization...')
    
    // Test database connection
    await prisma.$connect()
    console.log('✅ Database connection successful')
    
    // Check if tables exist by trying to query users
    let usersExist = false
    try {
      await prisma.user.findFirst()
      usersExist = true
      console.log('✅ Users table exists')
    } catch (error) {
      console.log('⚠️ Users table does not exist, will create admin user after migration')
    }
    
    // Check if admin user exists
    let adminExists = false
    if (usersExist) {
      const existingAdmin = await prisma.user.findFirst({
        where: { role: 'ADMIN' }
      })
      
      if (existingAdmin) {
        adminExists = true
        console.log('✅ Admin user already exists:', existingAdmin.email)
      }
    }
    
    // Create admin user if it doesn't exist
    if (!adminExists) {
      console.log('👤 Creating default admin user...')
      
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
      
      return NextResponse.json({ 
        success: true, 
        message: 'Database migration and admin user creation completed',
        adminEmail: adminUser.email,
        adminPassword: 'admin123',
        warning: 'Please change the admin password after first login!'
      })
    }
    
    return NextResponse.json({ 
      success: true, 
      message: 'Database is already initialized',
      adminEmail: 'admin@library.com',
      adminPassword: 'admin123'
    })

  } catch (error) {
    console.error('❌ Database migration error:', error)
    
    // If it's a prepared statement error, suggest manual migration
    if (error.message && error.message.includes('prepared statement')) {
      return NextResponse.json({
        success: false,
        error: 'Prepared statement conflict detected. Please run database migration manually.',
        suggestion: 'Run: npx prisma migrate deploy'
      }, { status: 500 })
    }
    
    return NextResponse.json({
      success: false,
      error: 'Database migration failed',
      details: error.message
    }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}
