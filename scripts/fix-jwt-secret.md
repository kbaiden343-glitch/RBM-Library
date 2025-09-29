# Fix JWT Secret Issue

## 🚨 Problem: Admin/Librarian Login Getting 500 Error

The issue is that `JWT_SECRET` environment variable is not set in your Vercel deployment.

## 🔧 Quick Fix:

### Step 1: Add JWT_SECRET to Vercel Environment Variables

1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Click your "rbm-library" project
3. Go to **Settings** → **Environment Variables**
4. Click **Add** and add this variable:

**Variable:**
- **Name**: `JWT_SECRET`
- **Value**: `my-super-secret-jwt-key-for-rbm-library-2024`
- **Environment**: Production, Preview, Development

### Step 2: Redeploy

1. Go to **Deployments** tab
2. Click the **3 dots** on your latest deployment
3. Click **Redeploy**

### Step 3: Test Login Again

After redeployment, try logging in with:
- Email: `admin@library.com`
- Password: `password`

## 🎯 This Should Fix the 500 Error!

The JWT_SECRET is required for generating authentication tokens. Without it, the login API fails with a 500 error.
