const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function testDatabase() {
  try {
    console.log('Testing database connection...')
    
    // Test connection
    await prisma.$connect()
    console.log('✅ Database connection successful!')
    
    // Test basic queries
    const userCount = await prisma.user.count()
    console.log(`📊 Users in database: ${userCount}`)
    
    const bookCount = await prisma.book.count()
    console.log(`📚 Books in database: ${bookCount}`)
    
    const memberCount = await prisma.member.count()
    console.log(`👥 Members in database: ${memberCount}`)
    
    const borrowingCount = await prisma.borrowing.count()
    console.log(`📖 Borrowings in database: ${borrowingCount}`)
    
    const reservationCount = await prisma.reservation.count()
    console.log(`📋 Reservations in database: ${reservationCount}`)
    
    const attendanceCount = await prisma.attendance.count()
    console.log(`📅 Attendance records in database: ${attendanceCount}`)
    
    console.log('✅ Database test completed successfully!')
    
  } catch (error) {
    console.error('❌ Database test failed:', error.message)
    console.error('Full error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testDatabase()
