import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../lib/db'
import bcrypt from 'bcryptjs'

export async function POST(request: NextRequest) {
  try {
    console.log('🔍 Checking if admin user exists...')
    
    // Check if admin user already exists
    const existingAdmin = await prisma.user.findFirst({
      where: { role: 'ADMIN' }
    })

    if (existingAdmin) {
      console.log('✅ Admin user already exists:', existingAdmin.email)
      return NextResponse.json({ 
        success: true, 
        message: 'Admin user already exists',
        email: existingAdmin.email 
      })
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

    return NextResponse.json({ 
      success: true, 
      message: 'Admin user created successfully',
      email: adminUser.email,
      password: 'admin123'
    })

  } catch (error) {
    console.error('❌ Error initializing database:', error)
    return NextResponse.json(
      { error: 'Failed to initialize database' },
      { status: 500 }
    )
  }
}
