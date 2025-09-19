# Robert Aboagye Mensah Community Library Management System

A comprehensive, modern Library Management System built with Next.js 14, TypeScript, and PostgreSQL, featuring advanced features like QR code integration, AI recommendations, attendance tracking, and real-time analytics.

## 🚀 Features

### Core Features
- **Book Catalog Management** - Complete CRUD operations for books with detailed metadata
- **Member Management** - Member registration, profiles, and membership plans
- **Borrowing System** - Checkout/return with automatic due date tracking and fine calculation
- **Search & Filter** - Advanced search by title, author, ISBN, category, and status
- **Reservation System** - Waitlist management for unavailable books

### Unique & Modern Features
- **QR Code Integration** - Generate and scan QR codes for quick book operations
- **AI Recommendation Engine** - Suggest books based on borrowing history
- **Attendance Tracking** - Log member library visits and usage hours
- **Smart Shelving** - Track exact book locations (Row → Shelf → Slot)
- **Mobile-Responsive Design** - Works seamlessly on all devices
- **Real-time Analytics** - Comprehensive reports and insights
- **JWT Authentication** - Secure user authentication with role-based access
- **PostgreSQL Database** - Robust data persistence with Prisma ORM

## 🛠️ Technology Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **Backend**: Next.js API Routes, Prisma ORM
- **Database**: PostgreSQL
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **State Management**: React Context API
- **Authentication**: JWT tokens with bcryptjs
- **Validation**: Zod schemas
- **Notifications**: react-hot-toast
- **QR Codes**: qrcode.react

## 📦 Installation

### Prerequisites
- Node.js 18+ installed
- PostgreSQL 12+ installed
- npm or yarn package manager

### 1. Clone the repository
```bash
git clone <repository-url>
cd robert-aboagye-mensah-library
```

### 2. Install dependencies
```bash
npm install
```

### 3. Set up the database
```bash
# Generate Prisma client
npm run db:generate

# Push schema to database
npm run db:push

# Seed with sample data
npm run db:seed
```

### 4. Configure environment variables
Create `.env.local` file:
```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/library_db"
JWT_SECRET="your-super-secret-jwt-key"
NEXTAUTH_SECRET="your-nextauth-secret-key"
NEXTAUTH_URL="http://localhost:3000"
NODE_ENV="development"
```

### 5. Start the development server
```bash
npm run dev
```

### 6. Open your browser
Navigate to `http://localhost:3000`

## 🔐 Default Login Credentials

- **Admin**: admin@library.com / admin123
- **Librarian**: librarian@library.com / librarian123
- **Member**: member@library.com / member123

## 🏗️ Project Structure

```
app/
├── api/                    # API routes
│   ├── auth/              # Authentication endpoints
│   ├── books/             # Book management endpoints
│   ├── members/           # Member management endpoints
│   ├── borrowings/        # Borrowing system endpoints
│   ├── reservations/      # Reservation system endpoints
│   ├── attendance/        # Attendance tracking endpoints
│   └── dashboard/         # Dashboard statistics endpoints
├── components/            # Reusable UI components
│   ├── Navbar.tsx         # Main navigation bar
│   ├── Sidebar.tsx        # Sidebar navigation
│   └── ProtectedRoute.tsx # Route protection component
├── context/               # React context for state management
│   ├── LibraryContext.tsx # Library data management
│   ├── AuthContext.tsx    # Authentication management
│   └── NotificationContext.tsx # Notification system
├── pages/                 # Main application pages
│   ├── Dashboard.tsx      # Main dashboard with overview
│   ├── BookCatalog.tsx    # Book management
│   ├── MemberManagement.tsx # Member management
│   ├── BorrowingSystem.tsx  # Checkout/return system
│   ├── QRScanner.tsx      # QR code scanner
│   ├── Reports.tsx        # Analytics and reports
│   └── Settings.tsx       # System configuration
├── lib/                   # Utility functions
│   ├── db.ts             # Database connection
│   ├── auth.ts           # Authentication utilities
│   └── validations.ts    # Data validation schemas
├── prisma/               # Database schema and migrations
│   └── schema.prisma     # Database schema
└── scripts/              # Database scripts
    ├── migrate-data.js   # Data migration script
    └── test-db.js        # Database test script
```

## 🎯 Key Components

### Dashboard
- Real-time statistics and metrics
- Quick action buttons
- Recent activity feed
- Library overview cards
- Time range filtering

### Book Catalog
- Add, edit, and delete books
- Generate QR codes for each book
- Advanced filtering and search
- Bulk operations
- Import/Export functionality

### Member Management
- Member registration and profiles
- Membership plan management
- Borrowing history tracking
- Contact information management

### Borrowing System
- Book checkout and return
- Due date management
- Fine calculation
- Reservation system
- Overdue tracking

### QR Scanner
- Quick book checkout/return
- Attendance tracking
- Multiple operation modes
- Manual entry fallback

### Reports & Analytics
- Most borrowed books
- Member activity analysis
- Borrowing trends
- Attendance statistics
- Export functionality

### Settings
- Library information configuration
- Book and member policies
- Notification preferences
- System configuration
- Appearance customization

## 🔧 Database Management

### Available Scripts
```bash
# Generate Prisma client
npm run db:generate

# Push schema to database
npm run db:push

# Create and run migrations
npm run db:migrate

# Seed database with sample data
npm run db:seed

# Test database connection
npm run db:test

# Open Prisma Studio (database GUI)
npm run db:studio

# Reset database
npm run db:reset
```

## 🔒 Authentication & Security

- **JWT-based authentication** with secure tokens
- **Role-based access control** (ADMIN, LIBRARIAN, MEMBER)
- **Password hashing** with bcryptjs
- **Input validation** with Zod schemas
- **SQL injection protection** with Prisma ORM
- **CORS protection** and security headers

## 📱 Mobile Responsiveness

The system is fully responsive and works on:
- Desktop computers
- Tablets
- Mobile phones
- All modern browsers

## 🚀 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration

### Books
- `GET /api/books` - Get all books (with pagination, search, filters)
- `POST /api/books` - Create new book
- `GET /api/books/[id]` - Get book by ID
- `PUT /api/books/[id]` - Update book
- `DELETE /api/books/[id]` - Delete book

### Members
- `GET /api/members` - Get all members (with pagination, search, filters)
- `POST /api/members` - Create new member
- `GET /api/members/[id]` - Get member by ID
- `PUT /api/members/[id]` - Update member
- `DELETE /api/members/[id]` - Delete member

### Borrowings
- `GET /api/borrowings` - Get all borrowings (with pagination, filters)
- `POST /api/borrowings` - Create new borrowing
- `GET /api/borrowings/[id]` - Get borrowing by ID
- `PUT /api/borrowings/[id]` - Update borrowing (return book)
- `DELETE /api/borrowings/[id]` - Delete borrowing

### Reservations
- `GET /api/reservations` - Get all reservations (with pagination, filters)
- `POST /api/reservations` - Create new reservation
- `GET /api/reservations/[id]` - Get reservation by ID
- `PUT /api/reservations/[id]` - Update reservation (cancel/ready)
- `DELETE /api/reservations/[id]` - Delete reservation

### Attendance
- `GET /api/attendance` - Get all attendance records (with pagination, filters)
- `POST /api/attendance` - Create new attendance record
- `GET /api/attendance/[id]` - Get attendance by ID
- `DELETE /api/attendance/[id]` - Delete attendance record

### Dashboard
- `GET /api/dashboard/stats` - Get dashboard statistics (with time range filters)

## 🚀 Future Enhancements

- **Email Integration** - Automated notifications
- **Mobile App** - React Native mobile application
- **Cloud Storage** - AWS S3 for file storage
- **Real-time Updates** - WebSocket integration
- **Advanced Analytics** - Machine learning insights
- **Multi-language Support** - Internationalization
- **API Rate Limiting** - Enhanced security
- **Caching Layer** - Redis for performance

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👥 Support

For support and questions:
- Email: info@robertmensahlibrary.org
- Phone: +233 20 123 4567
- Website: www.robertmensahlibrary.org

## 🙏 Acknowledgments

- Next.js team for the amazing framework
- Prisma team for the excellent ORM
- Tailwind CSS for the utility-first CSS framework
- Lucide for the beautiful icons
- The library management community for inspiration

---

**Built with ❤️ for the Robert Aboagye Mensah Community Library**#   R B M - L i b r a r y  
 