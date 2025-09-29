#!/usr/bin/env node

const https = require('https');

console.log('🔍 Checking Vercel Deployment Status...\n');

// Replace with your actual Vercel app URL
const VERCEL_URL = process.env.VERCEL_URL || 'https://your-app-name.vercel.app';

async function checkEndpoint(endpoint, description) {
  return new Promise((resolve) => {
    const url = `${VERCEL_URL}${endpoint}`;
    
    https.get(url, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        if (res.statusCode === 200) {
          console.log(`✅ ${description}: Working`);
          resolve(true);
        } else {
          console.log(`❌ ${description}: Failed (Status: ${res.statusCode})`);
          resolve(false);
        }
      });
    }).on('error', (err) => {
      console.log(`❌ ${description}: Error - ${err.message}`);
      resolve(false);
    });
  });
}

async function checkDeployment() {
  console.log(`🌐 Checking deployment at: ${VERCEL_URL}\n`);
  
  const checks = [
    { endpoint: '/', description: 'Home Page' },
    { endpoint: '/api/books', description: 'Books API' },
    { endpoint: '/api/persons', description: 'Persons API' },
    { endpoint: '/api/auth/login', description: 'Login API' }
  ];
  
  let allPassed = true;
  
  for (const check of checks) {
    const passed = await checkEndpoint(check.endpoint, check.description);
    if (!passed) allPassed = false;
  }
  
  console.log('\n📊 Deployment Check Results:');
  if (allPassed) {
    console.log('🎉 All endpoints are working! Your deployment is healthy.');
  } else {
    console.log('⚠️  Some endpoints failed. Check the errors above.');
    console.log('\n💡 Troubleshooting Tips:');
    console.log('1. Check environment variables in Vercel dashboard');
    console.log('2. Verify database connection');
    console.log('3. Check Vercel function logs');
  }
}

// Run the check
checkDeployment().catch(console.error);
