# Library Management System Documentation

## Table of Contents
1. [System Overview](#system-overview)
2. [Technology Stack](#technology-stack)
3. [System Architecture](#system-architecture)
4. [Database Schema](#database-schema)
5. [API Documentation](#api-documentation)
6. [Frontend Components](#frontend-components)
7. [User Roles & Permissions](#user-roles--permissions)
8. [Features Overview](#features-overview)
9. [Installation & Setup](#installation--setup)
10. [Deployment](#deployment)
11. [Security Features](#security-features)
12. [Performance Optimizations](#performance-optimizations)
13. [Troubleshooting](#troubleshooting)

---

## System Overview

The Library Management System is a comprehensive web application designed to manage all aspects of a modern library operation. It provides functionality for book cataloging, member management, borrowing systems, attendance tracking, and administrative controls.

### Key Capabilities
- **Book Management**: Complete catalog system with search, categorization, and inventory tracking
- **Member Management**: User registration, profile management, and membership tracking
- **Borrowing System**: Book lending, returns, reservations, and overdue management
- **Attendance Tracking**: Library visitor and member attendance monitoring
- **Administrative Tools**: User management, settings, reports, and system configuration
- **Import/Export**: Bulk data operations for books and member information

---

## Technology Stack

### Frontend
- **Framework**: Next.js 14.2.32 (React-based)
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Notifications**: React Hot Toast
- **State Management**: React Context API

### Backend
- **Runtime**: Node.js
- **Framework**: Next.js API Routes
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Authentication**: bcryptjs for password hashing

### Development Tools
- **Language**: TypeScript
- **Package Manager**: npm
- **Version Control**: Git
- **Build Tool**: Next.js built-in bundler

---

## System Architecture

### High-Level Architecture
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   API Layer     │    │   Database      │
│   (Next.js)     │◄──►│   (Next.js)     │◄──►│   (PostgreSQL)  │
│                 │    │                 │    │                 │
│ • Components    │    │ • REST APIs     │    │ • Prisma ORM    │
│ • Context       │    │ • Validation    │    │ • Schema        │
│ • Pages         │    │ • Authentication│    │ • Migrations    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Component Structure
```
app/
├── api/                    # API routes
│   ├── auth/              # Authentication endpoints
│   ├── books/             # Book management
│   ├── members/           # Member management
│   ├── persons/           # Person management (unified)
│   ├── borrowings/        # Borrowing system
│   ├── reservations/      # Reservation system
│   ├── attendance/        # Attendance tracking
│   └── dashboard/         # Dashboard statistics
├── components/            # Reusable UI components
├── context/               # React Context providers
├── lib/                   # Utility functions
├── pages/                 # Main application pages
└── globals.css           # Global styles
```

---

## Database Schema

### Core Entities

#### Users Table
```sql
model User {
  id        String   @id @default(cuid())
  name      String
  email     String   @unique
  password  String
  role      UserRole
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

#### Books Table
```sql
model Book {
  id            String      @id @default(cuid())
  title         String
  author        String
  isbn          String      @unique
  category      String
  publishedYear Int
  description   String?
  coverImage    String?
  status        BookStatus  @default(AVAILABLE)
  createdAt     DateTime    @default(now())
  updatedAt     DateTime    @updatedAt
  
  borrowings    Borrowing[]
  reservations  Reservation[]
}
```

#### Persons Table (Unified Model)
```sql
model Person {
  id              String      @id @default(cuid())
  name            String
  email           String      @unique
  phone           String?
  address         String?
  personType      PersonType
  status          PersonStatus @default(ACTIVE)
  membershipDate  DateTime?
  notes           String?
  emergencyContact String?
  createdAt       DateTime    @default(now())
  updatedAt       DateTime    @updatedAt
  
  borrowings      Borrowing[]
  reservations    Reservation[]
  attendance      Attendance[]
}
```

#### Borrowings Table
```sql
model Borrowing {
  id          String        @id @default(cuid())
  bookId      String
  personId    String?
  memberId    String?
  borrowDate  DateTime      @default(now())
  dueDate     DateTime
  returnDate  DateTime?
  status      BorrowStatus  @default(BORROWED)
  notes       String?
  createdAt   DateTime      @default(now())
  updatedAt   DateTime      @updatedAt
  
  book        Book          @relation(fields: [bookId], references: [id])
  person      Person?       @relation(fields: [personId], references: [id])
}
```

#### Reservations Table
```sql
model Reservation {
  id              String         @id @default(cuid())
  bookId          String
  personId        String?
  memberId        String?
  reservationDate DateTime       @default(now())
  expiryDate      DateTime
  status          ReserveStatus  @default(WAITING)
  notes           String?
  createdAt       DateTime       @default(now())
  updatedAt       DateTime       @updatedAt
  
  book            Book           @relation(fields: [bookId], references: [id])
  person          Person?        @relation(fields: [personId], references: [id])
}
```

#### Attendance Table
```sql
model Attendance {
  id            String    @id @default(cuid())
  personId      String?
  memberId      String?
  visitorName   String?
  visitorEmail  String?
  visitorPhone  String?
  checkInTime   DateTime  @default(now())
  checkOutTime  DateTime?
  purpose       String?
  isVisitor     Boolean   @default(false)
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  
  person        Person?   @relation(fields: [personId], references: [id])
}
```

---

## API Documentation

### Authentication Endpoints

#### POST `/api/auth/login`
Authenticate user and return JWT token.

**Request Body:**
```json
{
  "email": "admin",
  "password": "password"
}
```

**Response:**
```json
{
  "user": {
    "id": "user_id",
    "name": "Admin User",
    "email": "admin",
    "role": "ADMIN"
  },
  "token": "jwt_token"
}
```

#### POST `/api/auth/register`
Register new user (Admin only).

**Request Body:**
```json
{
  "name": "New User",
  "email": "user@example.com",
  "password": "password123",
  "role": "LIBRARIAN"
}
```

### Book Management Endpoints

#### GET `/api/books`
Retrieve books with optional filtering and pagination.

**Query Parameters:**
- `search`: Search term for title, author, or ISBN
- `category`: Filter by category
- `status`: Filter by availability status
- `page`: Page number for pagination
- `limit`: Number of items per page

#### POST `/api/books`
Create a new book.

**Request Body:**
```json
{
  "title": "Book Title",
  "author": "Author Name",
  "isbn": "978-0-123456-78-9",
  "category": "fiction",
  "publishedYear": 2023,
  "description": "Book description",
  "coverImage": "https://example.com/cover.jpg"
}
```

#### PUT `/api/books/[id]`
Update an existing book.

#### DELETE `/api/books/[id]`
Delete a book (only if not borrowed or reserved).

### Member Management Endpoints

#### GET `/api/persons`
Retrieve all persons (members and visitors).

#### POST `/api/persons`
Create a new person (member or visitor).

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+1234567890",
  "address": "123 Main St",
  "personType": "MEMBER",
  "notes": "Additional notes"
}
```

### Borrowing System Endpoints

#### GET `/api/borrowings`
Retrieve borrowing records with filtering options.

#### POST `/api/borrowings`
Create a new borrowing record.

**Request Body:**
```json
{
  "bookId": "book_id",
  "personId": "person_id",
  "dueDate": "2024-01-15T00:00:00.000Z"
}
```

#### PUT `/api/borrowings/[id]`
Update borrowing record (typically for returns).

### Reservation Endpoints

#### GET `/api/reservations`
Retrieve reservation records.

#### POST `/api/reservations`
Create a new reservation.

**Request Body:**
```json
{
  "bookId": "book_id",
  "personId": "person_id"
}
```

### Attendance Endpoints

#### GET `/api/attendance`
Retrieve attendance records with date filtering.

#### POST `/api/attendance`
Record attendance (check-in or check-out).

**Request Body:**
```json
{
  "action": "check-in",
  "personId": "person_id",
  "purpose": "Study"
}
```

---

## Frontend Components

### Core Components

#### LibraryContext
Central state management for the application.
- Manages books, members, borrowings, reservations, and attendance data
- Provides CRUD operations for all entities
- Handles API communication and error management

#### AuthContext
Authentication state management.
- User session management
- Permission checking
- Login/logout functionality

#### NotificationContext
Notification system management.
- Toast notifications for user feedback
- Persistent notification panel
- System announcements

### Page Components

#### Dashboard
- System statistics and overview
- Recent activities
- Quick access to common operations

#### BookCatalog
- Book listing with search and filtering
- Add/edit/delete book functionality
- Import/export capabilities
- Grid and list view modes

#### MemberManagement
- Member listing and search
- Member registration and editing
- Membership status management

#### BorrowingSystem
- Active borrowing records
- Book lending and return operations
- Overdue book management
- Borrowing history

#### AttendanceTracking
- Attendance recording
- Visitor registration
- Attendance reports and statistics

### Utility Components

#### GlobalSearch
- System-wide search functionality
- Quick access to books, members, and records

#### ImportExportModal
- CSV/JSON import and export
- Data validation and error handling
- Bulk operations support

---

## User Roles & Permissions

### Admin Role
**Full System Access:**
- User management (create, edit, delete users)
- System settings configuration
- All book and member operations
- Complete borrowing and attendance management
- Access to all reports and statistics
- Import/export operations

### Librarian Role
**Library Operations:**
- Book catalog management
- Member registration and management
- Borrowing and return operations
- Reservation management
- Attendance tracking
- Basic reports access

### Member Role
**Limited Access:**
- View available books
- Personal borrowing history
- Reservation requests
- Profile management

### Permission System
Permissions are checked at both frontend and backend levels:
```typescript
// Example permission check
if (hasPermission('books:delete')) {
  // Show delete button
}
```

---

## Features Overview

### Book Management
- **Catalog System**: Complete book database with search and filtering
- **Categories**: Organized by fiction, non-fiction, science, history, etc.
- **ISBN Management**: Unique identifier tracking
- **Cover Images**: Book cover display support
- **Status Tracking**: Available, Borrowed, Reserved states
- **Bulk Operations**: Import/export functionality

### Member Management
- **Unified Model**: Single system for members and visitors
- **Contact Information**: Name, email, phone, address tracking
- **Membership Types**: Regular, Student, VIP memberships
- **Emergency Contacts**: Additional contact information
- **Status Management**: Active/Inactive member states

### Borrowing System
- **Loan Management**: Complete borrowing lifecycle
- **Due Date Tracking**: Automatic due date calculation
- **Overdue Management**: Overdue book identification and handling
- **Return Processing**: Book return and status updates
- **Borrowing History**: Complete transaction records

### Reservation System
- **Book Reservations**: Reserve unavailable books
- **Queue Management**: First-come-first-served reservation system
- **Expiry Handling**: Automatic reservation expiration
- **Notification System**: Reservation status updates

### Attendance Tracking
- **Check-in/Check-out**: Time-based attendance recording
- **Visitor Management**: Guest registration and tracking
- **Purpose Tracking**: Record visit purposes (study, research, etc.)
- **Reports**: Attendance statistics and analytics

### Administrative Features
- **User Management**: Role-based user administration
- **System Settings**: Library configuration options
- **Reports**: Comprehensive reporting system
- **Data Management**: Backup, restore, and migration tools

---

## Installation & Setup

### Prerequisites
- Node.js 18+ 
- PostgreSQL 14+
- Git

### Installation Steps

1. **Clone Repository**
```bash
git clone <repository-url>
cd library-project
```

2. **Install Dependencies**
```bash
npm install
```

3. **Environment Configuration**
Create `.env.local` file:
```env
DATABASE_URL="postgresql://username:password@localhost:5432/library_db"
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3000"
```

4. **Database Setup**
```bash
npx prisma generate
npx prisma db push
node scripts/migrate-data.js
```

5. **Start Development Server**
```bash
npm run dev
```

### Default Login Credentials
- **Admin**: admin / password
- **Librarian**: librarian / password
- **Member**: member / password

---

## Deployment

### Production Build
```bash
npm run build
npm start
```

### Environment Variables
```env
DATABASE_URL="your-production-database-url"
NEXTAUTH_SECRET="production-secret-key"
NEXTAUTH_URL="https://your-domain.com"
```

### Database Migration
```bash
npx prisma migrate deploy
```

---

## Security Features

### Authentication
- **Password Hashing**: bcryptjs with salt rounds
- **Session Management**: Secure session handling
- **JWT Tokens**: Stateless authentication

### Authorization
- **Role-Based Access**: Admin, Librarian, Member roles
- **Permission System**: Granular permission checking
- **Route Protection**: Protected API endpoints

### Data Validation
- **Input Sanitization**: All user inputs validated
- **Zod Schemas**: Type-safe validation
- **SQL Injection Protection**: Prisma ORM protection

### Security Headers
- **CORS Configuration**: Cross-origin request handling
- **Content Security Policy**: XSS protection
- **Rate Limiting**: API endpoint protection

---

## Performance Optimizations

### Database Optimizations
- **Indexing**: Strategic database indexes for common queries
- **Connection Pooling**: Efficient database connection management
- **Query Optimization**: Optimized Prisma queries

### Frontend Optimizations
- **Code Splitting**: Dynamic imports for better loading
- **Image Optimization**: Next.js automatic image optimization
- **Caching**: Browser and server-side caching strategies

### API Optimizations
- **Pagination**: Large dataset handling
- **Selective Loading**: Load only required data
- **Error Handling**: Graceful error management

---

## Troubleshooting

### Common Issues

#### Database Connection Issues
```bash
# Check database connection
npx prisma db pull

# Reset database
npx prisma migrate reset
```

#### Build Errors
```bash
# Clear cache and rebuild
rm -rf .next
npm run build
```

#### Permission Errors
- Verify user roles in database
- Check permission configurations
- Ensure proper authentication

### Debug Mode
Enable debug logging:
```env
DEBUG=true
NODE_ENV=development
```

### Log Files
- Application logs: Console output
- Database logs: PostgreSQL logs
- Error tracking: Browser console

---

## Support & Maintenance

### Regular Maintenance Tasks
- Database backup scheduling
- Log file rotation
- Performance monitoring
- Security updates

### Backup Procedures
```bash
# Database backup
pg_dump library_db > backup.sql

# File system backup
tar -czf system-backup.tar.gz /path/to/app
```

### Update Procedures
1. Backup current system
2. Pull latest changes
3. Run database migrations
4. Update dependencies
5. Test functionality
6. Deploy to production

---

## Conclusion

This Library Management System provides a comprehensive solution for modern library operations. With its robust architecture, extensive feature set, and user-friendly interface, it serves as an effective tool for managing all aspects of library administration.

For additional support or feature requests, please refer to the project repository or contact the development team.

---

*Last Updated: January 2024*
*Version: 1.0.0*
