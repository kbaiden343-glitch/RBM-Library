const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function migrateData() {
  try {
    console.log('Starting data migration...')

    // Create default admin user
    const adminUser = await prisma.user.upsert({
      where: { email: 'admin@library.com' },
      update: {},
      create: {
        name: 'System Administrator',
        email: 'admin@library.com',
        password: '$2b$12$RX7RSxeAQAUugIgaWC9o7eTJ9djMhS5zqIfV9eonriWr/B5JaxlM2', // 'password'
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
        password: '$2b$12$RX7RSxeAQAUugIgaWC9o7eTJ9djMhS5zqIfV9eonriWr/B5JaxlM2', // 'password'
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
        password: '$2b$12$RX7RSxeAQAUugIgaWC9o7eTJ9djMhS5zqIfV9eonriWr/B5JaxlM2', // 'password'
        role: 'MEMBER',
      },
    })

    console.log('Member user created:', memberUser.email)

    // Create sample books
    const sampleBooks = [
      {
        title: 'The Great Gatsby',
        author: 'F. Scott Fitzgerald',
        isbn: '9780743273565',
        category: 'fiction',
        publishedYear: 1925,
        description: 'A classic American novel about the Jazz Age.',
        status: 'AVAILABLE',
      },
      {
        title: 'To Kill a Mockingbird',
        author: 'Harper Lee',
        isbn: '9780061120084',
        category: 'fiction',
        publishedYear: 1960,
        description: 'A gripping tale of racial injustice and childhood innocence.',
        status: 'AVAILABLE',
      },
      {
        title: '1984',
        author: 'George Orwell',
        isbn: '9780451524935',
        category: 'fiction',
        publishedYear: 1949,
        description: 'A dystopian social science fiction novel.',
        status: 'AVAILABLE',
      },
      {
        title: 'Sapiens: A Brief History of Humankind',
        author: 'Yuval Noah Harari',
        isbn: '9780062316097',
        category: 'non-fiction',
        publishedYear: 2014,
        description: 'An exploration of how Homo sapiens came to dominate the world.',
        status: 'AVAILABLE',
      },
      {
        title: 'The Selfish Gene',
        author: 'Richard Dawkins',
        isbn: '9780192860927',
        category: 'science',
        publishedYear: 1976,
        description: 'A book on evolution that introduced the concept of the meme.',
        status: 'AVAILABLE',
      },
    ]

    for (const book of sampleBooks) {
      await prisma.book.upsert({
        where: { isbn: book.isbn },
        update: {},
        create: book,
      })
    }

    console.log('Sample books created')

    // Create sample members
    const sampleMembers = [
      {
        name: 'John Doe',
        email: 'john.doe@email.com',
        phone: '555-0101',
        address: '123 Main St, Anytown, USA',
        status: 'ACTIVE',
      },
      {
        name: 'Jane Smith',
        email: 'jane.smith@email.com',
        phone: '555-0102',
        address: '456 Oak Ave, Anytown, USA',
        status: 'ACTIVE',
      },
      {
        name: 'Bob Johnson',
        email: 'bob.johnson@email.com',
        phone: '555-0103',
        address: '789 Pine Rd, Anytown, USA',
        status: 'ACTIVE',
      },
    ]

    for (const member of sampleMembers) {
      await prisma.member.upsert({
        where: { email: member.email },
        update: {},
        create: member,
      })
    }

    console.log('Sample members created')

    console.log('Data migration completed successfully!')
  } catch (error) {
    console.error('Error during migration:', error)
  } finally {
    await prisma.$disconnect()
  }
}

migrateData()
