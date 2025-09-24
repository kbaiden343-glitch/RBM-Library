# Database Setup Instructions

This guide will help you set up PostgreSQL database for the Robert Aboagye Mensah Community Library Management System.

## Prerequisites

1. **PostgreSQL** installed on your system
2. **Node.js** 18+ installed
3. **npm** or **yarn** package manager

## Step 1: Install PostgreSQL

### Windows
1. Download PostgreSQL from https://www.postgresql.org/download/windows/
2. Run the installer and follow the setup wizard
3. Remember the password you set for the `postgres` user
4. Make sure PostgreSQL service is running

### macOS
```bash
# Using Homebrew
brew install postgresql
brew services start postgresql
```

### Linux (Ubuntu/Debian)
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

## Step 2: Create Database

1. Open PostgreSQL command line or pgAdmin
2. Create a new database:

```sql
CREATE DATABASE library_db;
```

3. Create a user (optional, you can use the default postgres user):

```sql
CREATE USER library_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE library_db TO library_user;
```

## Step 3: Configure Environment Variables

1. Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```

2. Update `.env.local` with your database credentials:
```env
DATABASE_URL="postgresql://postgres:your_password@localhost:5432/library_db"
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
NEXTAUTH_SECRET="your-nextauth-secret-key"
NEXTAUTH_URL="http://localhost:3000"
NODE_ENV="development"
```

## Step 4: Install Dependencies and Setup Database

1. Install dependencies:
```bash
npm install
```

2. Generate Prisma client:
```bash
npm run db:generate
```

3. Push database schema:
```bash
npm run db:push
```

4. Seed the database with sample data:
```bash
npm run db:seed
```

## Step 5: Start the Application

```bash
npm run dev
```

The application will be available at http://localhost:3000

## Default Login Credentials

- **Admin**: admin / password
- **Librarian**: librarian / password
- **Member**: member / password

## Database Management

### View Database
```bash
npm run db:studio
```

### Reset Database
```bash
npm run db:reset
```

### Create Migration
```bash
npm run db:migrate
```

## Troubleshooting

### Connection Issues
1. Ensure PostgreSQL is running
2. Check if the database exists
3. Verify connection string in `.env.local`
4. Check firewall settings

### Permission Issues
1. Ensure the database user has proper permissions
2. Check if the database exists and is accessible

### Port Issues
1. Default PostgreSQL port is 5432
2. Check if the port is available
3. Update connection string if using different port

## Production Setup

For production deployment:

1. Use a managed PostgreSQL service (AWS RDS, Google Cloud SQL, etc.)
2. Set strong passwords and JWT secrets
3. Enable SSL connections
4. Set up proper backup strategies
5. Configure connection pooling
6. Set up monitoring and logging

## Support

If you encounter any issues:
1. Check the logs in the terminal
2. Verify all environment variables are set correctly
3. Ensure PostgreSQL is running and accessible
4. Check the Prisma documentation: https://www.prisma.io/docs/
