#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');

console.log('🚀 Starting Vercel database migration...');

try {
  // Check if DATABASE_URL is set
  if (!process.env.DATABASE_URL) {
    console.error('❌ DATABASE_URL environment variable is not set');
    process.exit(1);
  }

  console.log('📊 Generating Prisma client...');
  execSync('npx prisma generate', { stdio: 'inherit' });

  console.log('🗄️ Running database migrations...');
  execSync('npx prisma migrate deploy', { stdio: 'inherit' });

  console.log('✅ Database migration completed successfully!');
  
  // Run the deploy setup script to ensure demo users exist
  console.log('👥 Setting up demo users...');
  execSync('node scripts/deploy-setup.js', { stdio: 'inherit' });

  console.log('🎉 Vercel deployment setup completed!');
} catch (error) {
  console.error('❌ Migration failed:', error.message);
  process.exit(1);
}
