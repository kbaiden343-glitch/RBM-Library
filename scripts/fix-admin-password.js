const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function fixAdminPassword() {
  try {
    console.log('Fixing admin password...')
    
    const correctHash = '$2b$12$nu3BiQV.n8m9hC7pTyl7V.pp2yM5ynbSiR9VB5kBXiazKwEiBt72W'
    
    const updatedUser = await prisma.user.update({
      where: { email: 'admin' },
      data: { password: correctHash }
    })
    
    console.log('Admin password updated successfully!')
    console.log('Email:', updatedUser.email)
    console.log('Role:', updatedUser.role)
    
    // Test the password
    const isValid = bcrypt.compareSync('password', correctHash)
    console.log('Password verification:', isValid ? '✅ Valid' : '❌ Invalid')
    
  } catch (error) {
    console.error('Error fixing admin password:', error)
  } finally {
    await prisma.$disconnect()
  }
}

fixAdminPassword()
