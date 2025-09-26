# Deployment Setup Guide

## Quick Setup for Deployed Version

If you're having trouble logging into the deployed version, follow these steps:

### 1. Run Database Setup

After deploying, you need to set up the database with demo users:

```bash
npm run db:deploy
```

This will create the default users and settings needed for the system.

### 2. Login Credentials

After running the setup, use these credentials:

- **Admin**: `admin@library.com` / `password`
- **Librarian**: `librarian@library.com` / `password`
- **Member**: `member@library.com` / `password`

### 3. Alternative Login Methods

You can also login using just the username:
- **Admin**: `admin` / `password`
- **Librarian**: `librarian` / `password`
- **Member**: `member` / `password`

### 4. Troubleshooting

If you're still having issues:

1. **Check Database Connection**: Ensure your `DATABASE_URL` environment variable is set correctly
2. **Run Prisma Generate**: `npm run db:generate`
3. **Check Database Schema**: `npm run db:push`
4. **Re-run Setup**: `npm run db:deploy`

### 5. Manual Database Check

You can verify the users exist by running:

```bash
npm run db:studio
```

This will open Prisma Studio where you can see all the data in your database.

## Environment Variables Required

Make sure these are set in your deployment environment:

```env
DATABASE_URL="your_database_connection_string"
JWT_SECRET="your_jwt_secret_key"
NEXTAUTH_URL="your_deployment_url"
```

## Support

If you continue to have issues, check:
1. Database connection is working
2. Environment variables are set correctly
3. Prisma client is generated
4. Database schema is up to date
