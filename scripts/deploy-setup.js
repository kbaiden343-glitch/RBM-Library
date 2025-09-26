const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function setupDeployment() {
  try {
    console.log('Setting up deployment database...')

    // Create default admin user
    const adminUser = await prisma.user.upsert({
      where: { email: 'admin@library.com' },
      update: {},
      create: {
        name: 'System Administrator',
        email: 'admin@library.com',
        password: '$2b$12$EcQL.A1oqz.f0R0ZaE6AI.EY0Ujzx02/64a1qARfClsMmYmASvVhS', // 'password'
        role: 'ADMIN',
      },
    })

    console.log('Admin user created:', adminUser.email)

    // Create default librarian user
    const librarianUser = await prisma.user.upsert({
      where: { email: 'librarian@library.com' },
      update: {},
      create: {
        name: 'Library Staff',
        email: 'librarian@library.com',
        password: '$2b$12$EcQL.A1oqz.f0R0ZaE6AI.EY0Ujzx02/64a1qARfClsMmYmASvVhS', // 'password'
        role: 'LIBRARIAN',
      },
    })

    console.log('Librarian user created:', librarianUser.email)

    // Create default member user
    const memberUser = await prisma.user.upsert({
      where: { email: 'member@library.com' },
      update: {},
      create: {
        name: 'Library Member',
        email: 'member@library.com',
        password: '$2b$12$EcQL.A1oqz.f0R0ZaE6AI.EY0Ujzx02/64a1qARfClsMmYmASvVhS', // 'password'
        role: 'MEMBER',
      },
    })

    console.log('Member user created:', memberUser.email)

    // Create default settings
    const defaultSettings = await prisma.settings.upsert({
      where: { id: 'default' },
      update: {},
      create: {
        id: 'default',
        libraryName: 'Robert Aboagye Mensah Community Library',
        libraryAddress: '123 Library Street, Community City',
        libraryEmail: 'info@rbm-library.com',
        libraryPhone: '+233-XXX-XXXX',
        maxBorrowDays: 14,
        maxBooksPerMember: 5,
        overdueFinePerDay: 0.50,
        notifications: {
          email: true,
          sms: false,
          overdue: true,
          reservations: true
        },
        theme: 'light',
        language: 'en'
      },
    })

    console.log('Default settings created')

    console.log('Deployment setup completed successfully!')
    console.log('\n=== LOGIN CREDENTIALS ===')
    console.log('Admin: admin@library.com / password')
    console.log('Librarian: librarian@library.com / password')
    console.log('Member: member@library.com / password')
    console.log('========================')

  } catch (error) {
    console.error('Error during deployment setup:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

setupDeployment()
