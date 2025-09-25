const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function addOccupationType() {
  try {
    console.log('Adding occupationType field to existing persons...')

    // Get all persons without occupationType
    const persons = await prisma.person.findMany({
      where: {
        occupationType: null
      }
    })

    console.log(`Found ${persons.length} persons without occupationType`)

    // Update each person with default occupationType (STUDENT)
    for (const person of persons) {
      await prisma.person.update({
        where: { id: person.id },
        data: { occupationType: 'STUDENT' }
      })
      console.log(`Updated ${person.name} with occupationType: STUDENT`)
    }

    console.log('Successfully added occupationType to all persons!')
  } catch (error) {
    console.error('Error adding occupationType:', error)
  } finally {
    await prisma.$disconnect()
  }
}

addOccupationType()
