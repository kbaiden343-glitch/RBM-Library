# Quick Vercel Fix Guide

## 🚨 If Your Data Isn't Persisting on Vercel

### Step 1: Check Vercel Dashboard (2 minutes)

1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Click your library project
3. Go to **Settings** → **Environment Variables**
4. Look for these 3 variables:

```
DATABASE_URL=postgresql://username:Brain@12345@host:port/database
NEXTAUTH_SECRET=any-random-string-32-chars-long
NEXTAUTH_URL=https://your-app-name.vercel.app
```

### Step 2: If Variables Are Missing

**Add these environment variables:**

1. Click **Add** in Environment Variables
2. Add each variable:
   - **Name**: `DATABASE_URL`
   - **Value**: Your PostgreSQL connection string
   - **Environment**: Production, Preview, Development

   - **Name**: `NEXTAUTH_SECRET`
   - **Value**: Any random string (like: `my-super-secret-key-12345`)
   - **Environment**: Production, Preview, Development

   - **Name**: `NEXTAUTH_URL`
   - **Value**: `https://your-app-name.vercel.app`
   - **Environment**: Production, Preview, Development

### Step 3: Redeploy

1. Go to **Deployments** tab
2. Click the **3 dots** on your latest deployment
3. Click **Redeploy**

### Step 4: Test

1. Go to your Vercel app URL
2. Try logging in with:
   - Email: `admin@library.com`
   - Password: `password`
3. Add a book or member
4. Check if it persists after refresh

## 🆘 Still Having Issues?

**Tell me:**
1. What environment variables do you see in Vercel?
2. What's your Vercel app URL?
3. Are you getting any error messages?

**I'll help you fix it step by step!**
