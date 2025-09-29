# Login Fix Guide for Vercel

## 🚨 Can't Log Into Your Library System?

### **Quick Diagnosis:**

**What's happening when you try to log in?**
1. **"Invalid credentials" error?** → Demo users not created
2. **"Internal server error"?** → Database connection issue  
3. **Page won't load?** → Environment variables missing
4. **"User not found"?** → Database migration not run

### **Step 1: Check Environment Variables (Most Important)**

1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Click your library project
3. Go to **Settings** → **Environment Variables**
4. Make sure you have these 3 variables:

```
DATABASE_URL=postgresql://username:password@host:port/database
NEXTAUTH_SECRET=my-super-secret-key-12345
NEXTAUTH_URL=https://your-app-name.vercel.app
```

### **Step 2: Create Demo Users**

If environment variables are set, you need to create demo users:

**Option A: Use Vercel CLI (Recommended)**
```bash
# Install Vercel CLI if you don't have it
npm install -g vercel

# Login to Vercel
vercel login

# Link your project
vercel link

# Pull environment variables
vercel env pull .env.local

# Run the login fix script
node scripts/fix-vercel-login.js
```

**Option B: Manual Database Setup**
1. Go to your database provider (Supabase, PlanetScale, etc.)
2. Run this SQL to create demo users:

```sql
-- Create demo users (replace with your actual password hashes)
INSERT INTO users (id, email, password, name, role, "createdAt", "updatedAt") VALUES
('admin-id', 'admin@library.com', '$2a$10$hashedpassword', 'Administrator', 'ADMIN', NOW(), NOW()),
('librarian-id', 'librarian@library.com', '$2a$10$hashedpassword', 'Librarian', 'LIBRARIAN', NOW(), NOW()),
('member-id', 'member@library.com', '$2a$10$hashedpassword', 'Library Member', 'MEMBER', NOW(), NOW());
```

### **Step 3: Test Login**

Try logging in with these credentials:

**Administrator:**
- Email: `admin@library.com`
- Password: `password`

**Librarian:**
- Email: `librarian@library.com`  
- Password: `password`

**Member:**
- Email: `member@library.com`
- Password: `password`

### **Step 4: If Still Having Issues**

**Tell me:**
1. What's your Vercel app URL?
2. What error message do you see when trying to log in?
3. Do you have environment variables set in Vercel?
4. What database provider are you using? (Supabase, PlanetScale, etc.)

### **Quick Test Commands**

If you have Vercel CLI installed:

```bash
# Check if your app is running
curl https://your-app-name.vercel.app

# Test login API
curl -X POST https://your-app-name.vercel.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@library.com","password":"password"}'
```

## 🆘 Still Stuck?

**Most Common Issues:**
1. **Missing DATABASE_URL** - 90% of login problems
2. **Database not migrated** - Tables don't exist
3. **Wrong password hash** - Demo users created with wrong passwords
4. **Environment variables not deployed** - Need to redeploy after adding variables

**I'll help you fix it step by step!** 🚀
