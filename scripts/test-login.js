#!/usr/bin/env node

const https = require('https');

console.log('🔐 Testing Library System Login...\n');

// Replace with your actual Vercel app URL
const VERCEL_URL = process.argv[2] || 'https://your-app-name.vercel.app';

async function testLogin(email, password, role) {
  return new Promise((resolve) => {
    const postData = JSON.stringify({
      email: email,
      password: password
    });

    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = https.request(`${VERCEL_URL}/api/auth/login`, options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          
          if (res.statusCode === 200 && response.user) {
            console.log(`✅ ${role} Login: SUCCESS`);
            console.log(`   User: ${response.user.email}`);
            console.log(`   Role: ${response.user.role}`);
            resolve(true);
          } else {
            console.log(`❌ ${role} Login: FAILED`);
            console.log(`   Status: ${res.statusCode}`);
            console.log(`   Response: ${data}`);
            resolve(false);
          }
        } catch (error) {
          console.log(`❌ ${role} Login: ERROR`);
          console.log(`   Status: ${res.statusCode}`);
          console.log(`   Raw Response: ${data}`);
          resolve(false);
        }
      });
    });

    req.on('error', (err) => {
      console.log(`❌ ${role} Login: NETWORK ERROR`);
      console.log(`   Error: ${err.message}`);
      resolve(false);
    });

    req.write(postData);
    req.end();
  });
}

async function testAllLogins() {
  console.log(`🌐 Testing login at: ${VERCEL_URL}\n`);

  const loginTests = [
    { email: 'admin@library.com', password: 'password', role: 'Admin' },
    { email: 'librarian@library.com', password: 'password', role: 'Librarian' },
    { email: 'member@library.com', password: 'password', role: 'Member' }
  ];

  let successCount = 0;

  for (const test of loginTests) {
    const success = await testLogin(test.email, test.password, test.role);
    if (success) successCount++;
    console.log(''); // Empty line for readability
  }

  console.log('📊 Login Test Results:');
  console.log(`✅ Successful: ${successCount}/3`);
  console.log(`❌ Failed: ${3 - successCount}/3`);

  if (successCount === 0) {
    console.log('\n🚨 All logins failed! Common issues:');
    console.log('1. Environment variables not set in Vercel');
    console.log('2. Database connection failed');
    console.log('3. Demo users not created');
    console.log('4. Wrong DATABASE_URL format');
    
    console.log('\n💡 Quick fixes:');
    console.log('1. Check Vercel environment variables');
    console.log('2. Ensure DATABASE_URL is correct');
    console.log('3. Run database migrations');
    console.log('4. Create demo users');
  } else if (successCount < 3) {
    console.log('\n⚠️  Some logins failed. Check the errors above.');
  } else {
    console.log('\n🎉 All logins working! Your system is ready to use.');
  }
}

// Get URL from command line argument
if (process.argv[2]) {
  testAllLogins().catch(console.error);
} else {
  console.log('Usage: node scripts/test-login.js https://your-app-name.vercel.app');
  console.log('\nExample:');
  console.log('node scripts/test-login.js https://rbm-library.vercel.app');
}
