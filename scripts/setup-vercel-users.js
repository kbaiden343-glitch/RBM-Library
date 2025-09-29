#!/usr/bin/env node

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

console.log('👥 Setting up demo users for Vercel deployment...\n');

async function setupDemoUsers() {
  const prisma = new PrismaClient();
  
  try {
    console.log('📊 Connecting to database...');
    await prisma.$connect();
    console.log('✅ Database connected successfully');
    
    // Check if users already exist
    const existingUsers = await prisma.user.findMany();
    console.log(`📋 Found ${existingUsers.length} existing users`);
    
    if (existingUsers.length > 0) {
      console.log('👥 Users already exist. Checking if demo users are present...');
      
      const demoEmails = ['admin@library.com', 'librarian@library.com', 'member@library.com'];
      const existingEmails = existingUsers.map(u => u.email);
      
      for (const email of demoEmails) {
        if (existingEmails.includes(email)) {
          console.log(`✅ ${email} - Already exists`);
        } else {
          console.log(`❌ ${email} - Missing`);
        }
      }
    }
    
    // Create demo users
    console.log('\n🔨 Creating demo users...');
    
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
        // Try to create user
        await prisma.user.create({
          data: user
        });
        console.log(`✅ Created: ${user.email}`);
      } catch (error) {
        if (error.code === 'P2002') {
          console.log(`⚠️  ${user.email} - Already exists, updating password...`);
          
          // Update existing user's password
          await prisma.user.update({
            where: { email: user.email },
            data: { password: user.password }
          });
          console.log(`✅ Updated password for: ${user.email}`);
        } else {
          console.log(`❌ Error with ${user.email}: ${error.message}`);
        }
      }
    }
    
    // Verify users can login
    console.log('\n🔐 Testing login credentials...');
    
    const testCredentials = [
      { email: 'admin@library.com', password: 'password', role: 'Admin' },
      { email: 'librarian@library.com', password: 'password', role: 'Librarian' },
      { email: 'member@library.com', password: 'password', role: 'Member' }
    ];
    
    for (const test of testCredentials) {
      const user = await prisma.user.findUnique({
        where: { email: test.email }
      });
      
      if (user) {
        const isValid = await bcrypt.compare(test.password, user.password);
        console.log(`${isValid ? '✅' : '❌'} ${test.role} (${test.email}): ${isValid ? 'Login OK' : 'Password issue'}`);
      } else {
        console.log(`❌ ${test.role} (${test.email}): User not found`);
      }
    }
    
    console.log('\n🎉 Demo users setup completed!');
    console.log('\n📝 You can now login with:');
    console.log('   Admin: admin@library.com / password');
    console.log('   Librarian: librarian@library.com / password');
    console.log('   Member: member@library.com / password');
    
  } catch (error) {
    console.error('❌ Error setting up users:', error.message);
    
    if (error.message.includes('connect')) {
      console.log('\n💡 Database connection failed. Check:');
      console.log('1. DATABASE_URL environment variable is set');
      console.log('2. Database is accessible from Vercel');
      console.log('3. Database credentials are correct');
    } else if (error.message.includes('schema')) {
      console.log('\n💡 Database schema issue. Try:');
      console.log('1. Run: npx prisma migrate deploy');
      console.log('2. Run: npx prisma generate');
    }
  } finally {
    await prisma.$disconnect();
  }
}

// Run the setup
setupDemoUsers().catch(console.error);
