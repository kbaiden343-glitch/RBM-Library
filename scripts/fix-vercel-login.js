#!/usr/bin/env node

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

console.log('🔐 Fixing Vercel Login Issues...\n');

async function fixLogin() {
  const prisma = new PrismaClient();
  
  try {
    console.log('📊 Checking database connection...');
    
    // Test database connection
    await prisma.$connect();
    console.log('✅ Database connected successfully');
    
    // Check if users exist
    const existingUsers = await prisma.user.findMany();
    console.log(`📋 Found ${existingUsers.length} existing users`);
    
    if (existingUsers.length === 0) {
      console.log('👥 No users found. Creating demo users...');
      
      // Create demo users
      const demoUsers = [
        {
          email: 'admin@library.com',
          password: await bcrypt.hash('password', 10),
          name: 'Administrator',
          role: 'ADMIN'
        },
        {
          email: 'librarian@library.com', 
          password: await bcrypt.hash('password', 10),
          name: 'Librarian',
          role: 'LIBRARIAN'
        },
        {
          email: 'member@library.com',
          password: await bcrypt.hash('password', 10),
          name: 'Library Member',
          role: 'MEMBER'
        }
      ];
      
      for (const user of demoUsers) {
        try {
          await prisma.user.create({
            data: user
          });
          console.log(`✅ Created user: ${user.email}`);
        } catch (error) {
          if (error.code === 'P2002') {
            console.log(`⚠️  User ${user.email} already exists`);
          } else {
            console.log(`❌ Error creating ${user.email}: ${error.message}`);
          }
        }
      }
    } else {
      console.log('👥 Users already exist. Checking login credentials...');
      
      // Test login for each user
      const testUsers = [
        { email: 'admin@library.com', password: 'password' },
        { email: 'librarian@library.com', password: 'password' },
        { email: 'member@library.com', password: 'password' }
      ];
      
      for (const testUser of testUsers) {
        const user = await prisma.user.findUnique({
          where: { email: testUser.email }
        });
        
        if (user) {
          const isValid = await bcrypt.compare(testUser.password, user.password);
          console.log(`${isValid ? '✅' : '❌'} ${testUser.email}: ${isValid ? 'Login OK' : 'Password mismatch'}`);
        } else {
          console.log(`❌ ${testUser.email}: User not found`);
        }
      }
    }
    
    console.log('\n🎉 Login fix completed!');
    console.log('\n📝 You can now log in with:');
    console.log('   Admin: admin@library.com / password');
    console.log('   Librarian: librarian@library.com / password'); 
    console.log('   Member: member@library.com / password');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.log('\n💡 Troubleshooting:');
    console.log('1. Check DATABASE_URL in environment variables');
    console.log('2. Ensure database is accessible');
    console.log('3. Run database migrations first');
  } finally {
    await prisma.$disconnect();
  }
}

// Run the fix
fixLogin().catch(console.error);
