# API Reference Guide

## Base URL
```
Development: http://localhost:3000/api
Production: https://your-domain.com/api
```

## Authentication

All protected endpoints require authentication. Include the JWT token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

---

## Authentication Endpoints

### POST /api/auth/login
Authenticate user and receive JWT token.

**Request:**
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
  "token": "jwt_token_string"
}
```

### POST /api/auth/register
Register new user (Admin only).

**Request:**
```json
{
  "name": "New User",
  "email": "user@example.com",
  "password": "password123",
  "role": "LIBRARIAN"
}
```

---

## Books API

### GET /api/books
Get all books with optional filtering.

**Query Parameters:**
- `search` (string): Search in title, author, or ISBN
- `category` (string): Filter by category
- `status` (string): Filter by status (AVAILABLE, BORROWED, RESERVED)
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 10)

**Response:**
```json
{
  "books": [
    {
      "id": "book_id",
      "title": "Book Title",
      "author": "Author Name",
      "isbn": "978-0-123456-78-9",
      "category": "fiction",
      "publishedYear": 2023,
      "description": "Book description",
      "coverImage": "https://example.com/cover.jpg",
      "status": "AVAILABLE",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "total": 100,
  "page": 1,
  "limit": 10
}
```

### POST /api/books
Create a new book.

**Request:**
```json
{
  "title": "Book Title",
  "author": "Author Name",
  "isbn": "978-0-123456-78-9",
  "category": "fiction",
  "publishedYear": 2023,
  "description": "Book description (optional)",
  "coverImage": "https://example.com/cover.jpg (optional)"
}
```

**Response:** `201 Created`
```json
{
  "id": "new_book_id",
  "title": "Book Title",
  "author": "Author Name",
  "isbn": "978-0-123456-78-9",
  "category": "fiction",
  "publishedYear": 2023,
  "description": "Book description",
  "coverImage": "https://example.com/cover.jpg",
  "status": "AVAILABLE",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

### GET /api/books/[id]
Get a specific book by ID.

**Response:**
```json
{
  "id": "book_id",
  "title": "Book Title",
  "author": "Author Name",
  "isbn": "978-0-123456-78-9",
  "category": "fiction",
  "publishedYear": 2023,
  "description": "Book description",
  "coverImage": "https://example.com/cover.jpg",
  "status": "AVAILABLE",
  "borrowings": [],
  "reservations": [],
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

### PUT /api/books/[id]
Update a book.

**Request:** Same as POST /api/books

### DELETE /api/books/[id]
Delete a book (only if not borrowed or reserved).

**Response:** `200 OK`
```json
{
  "message": "Book deleted successfully"
}
```

---

## Persons API

### GET /api/persons
Get all persons (members and visitors).

**Query Parameters:**
- `search` (string): Search in name or email
- `personType` (string): Filter by type (MEMBER, VISITOR)
- `status` (string): Filter by status (ACTIVE, INACTIVE)

**Response:**
```json
{
  "persons": [
    {
      "id": "person_id",
      "name": "John Doe",
      "email": "john@example.com",
      "phone": "+1234567890",
      "address": "123 Main St",
      "personType": "MEMBER",
      "status": "ACTIVE",
      "membershipDate": "2024-01-01T00:00:00.000Z",
      "notes": "Additional notes",
      "emergencyContact": "Jane Doe - 0987654321",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "total": 50
}
```

### POST /api/persons
Create a new person.

**Request:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+1234567890",
  "address": "123 Main St",
  "personType": "MEMBER",
  "notes": "Additional notes (optional)",
  "emergencyContact": "Jane Doe - 0987654321 (optional)"
}
```

### GET /api/persons/[id]
Get a specific person by ID.

### PUT /api/persons/[id]
Update a person.

### DELETE /api/persons/[id]
Delete a person.

---

## Borrowings API

### GET /api/borrowings
Get all borrowing records.

**Query Parameters:**
- `status` (string): Filter by status (BORROWED, RETURNED, OVERDUE)
- `personId` (string): Filter by person
- `bookId` (string): Filter by book

**Response:**
```json
{
  "borrowings": [
    {
      "id": "borrowing_id",
      "bookId": "book_id",
      "personId": "person_id",
      "borrowDate": "2024-01-01T00:00:00.000Z",
      "dueDate": "2024-01-15T00:00:00.000Z",
      "returnDate": null,
      "status": "BORROWED",
      "notes": "Additional notes",
      "book": {
        "id": "book_id",
        "title": "Book Title",
        "author": "Author Name"
      },
      "person": {
        "id": "person_id",
        "name": "John Doe",
        "email": "john@example.com"
      }
    }
  ]
}
```

### POST /api/borrowings
Create a new borrowing record.

**Request:**
```json
{
  "bookId": "book_id",
  "personId": "person_id",
  "dueDate": "2024-01-15T00:00:00.000Z",
  "notes": "Additional notes (optional)"
}
```

### PUT /api/borrowings/[id]
Update a borrowing record (typically for returns).

**Request:**
```json
{
  "status": "RETURNED",
  "returnDate": "2024-01-10T00:00:00.000Z",
  "notes": "Return notes (optional)"
}
```

---

## Reservations API

### GET /api/reservations
Get all reservation records.

**Response:**
```json
{
  "reservations": [
    {
      "id": "reservation_id",
      "bookId": "book_id",
      "personId": "person_id",
      "reservationDate": "2024-01-01T00:00:00.000Z",
      "expiryDate": "2024-01-08T00:00:00.000Z",
      "status": "WAITING",
      "notes": "Additional notes",
      "book": {
        "id": "book_id",
        "title": "Book Title",
        "author": "Author Name"
      },
      "person": {
        "id": "person_id",
        "name": "John Doe",
        "email": "john@example.com"
      }
    }
  ]
}
```

### POST /api/reservations
Create a new reservation.

**Request:**
```json
{
  "bookId": "book_id",
  "personId": "person_id",
  "notes": "Additional notes (optional)"
}
```

### PUT /api/reservations/[id]
Update a reservation.

### DELETE /api/reservations/[id]
Cancel a reservation.

---

## Attendance API

### GET /api/attendance
Get attendance records.

**Query Parameters:**
- `startDate` (string): Start date filter (ISO format)
- `endDate` (string): End date filter (ISO format)
- `personId` (string): Filter by person

**Response:**
```json
{
  "attendance": [
    {
      "id": "attendance_id",
      "personId": "person_id",
      "visitorName": null,
      "visitorEmail": null,
      "visitorPhone": null,
      "checkInTime": "2024-01-01T09:00:00.000Z",
      "checkOutTime": "2024-01-01T17:00:00.000Z",
      "purpose": "Study",
      "isVisitor": false,
      "person": {
        "id": "person_id",
        "name": "John Doe",
        "email": "john@example.com"
      }
    }
  ]
}
```

### POST /api/attendance
Record attendance.

**Request:**
```json
{
  "action": "check-in",
  "personId": "person_id",
  "purpose": "Study",
  "notes": "Additional notes (optional)"
}
```

For visitors:
```json
{
  "action": "check-in",
  "visitorName": "Jane Doe",
  "visitorEmail": "jane@example.com",
  "visitorPhone": "+1234567890",
  "purpose": "Research"
}
```

---

## Dashboard API

### GET /api/dashboard/stats
Get dashboard statistics.

**Response:**
```json
{
  "totalBooks": 1500,
  "totalMembers": 250,
  "totalBorrowings": 75,
  "overdueBooks": 12,
  "todayAttendance": 45,
  "recentActivities": [
    {
      "type": "borrowing",
      "description": "John Doe borrowed 'Book Title'",
      "timestamp": "2024-01-01T10:00:00.000Z"
    }
  ]
}
```

### GET /api/attendance/stats
Get attendance statistics.

**Response:**
```json
{
  "todayAttendance": 45,
  "weekAttendance": 320,
  "monthAttendance": 1200,
  "averageDailyAttendance": 40
}
```

---

## Search API

### GET /api/search
Global search across all entities.

**Query Parameters:**
- `q` (string): Search query
- `type` (string): Entity type (books, persons, borrowings)

**Response:**
```json
{
  "results": [
    {
      "type": "book",
      "id": "book_id",
      "title": "Book Title",
      "author": "Author Name",
      "description": "Book description"
    },
    {
      "type": "person",
      "id": "person_id",
      "name": "John Doe",
      "email": "john@example.com",
      "personType": "MEMBER"
    }
  ]
}
```

---

## Error Responses

### Standard Error Format
```json
{
  "error": "Error message",
  "details": "Additional error details (optional)"
}
```

### Common HTTP Status Codes
- `200 OK`: Successful request
- `201 Created`: Resource created successfully
- `400 Bad Request`: Invalid request data
- `401 Unauthorized`: Authentication required
- `403 Forbidden`: Insufficient permissions
- `404 Not Found`: Resource not found
- `409 Conflict`: Resource already exists
- `500 Internal Server Error`: Server error

### Validation Errors
```json
{
  "error": "Invalid input data",
  "details": [
    {
      "field": "email",
      "message": "Invalid email format"
    }
  ]
}
```

---

## Rate Limiting

API endpoints are rate-limited to prevent abuse:
- **Authentication endpoints**: 5 requests per minute
- **Other endpoints**: 100 requests per minute

Rate limit headers:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1640995200
```

---

## Examples

### Complete Workflow: Borrow a Book

1. **Search for a book:**
```bash
GET /api/books?search=programming
```

2. **Get book details:**
```bash
GET /api/books/book_id
```

3. **Create borrowing record:**
```bash
POST /api/borrowings
{
  "bookId": "book_id",
  "personId": "person_id",
  "dueDate": "2024-01-15T00:00:00.000Z"
}
```

4. **Return the book:**
```bash
PUT /api/borrowings/borrowing_id
{
  "status": "RETURNED",
  "returnDate": "2024-01-10T00:00:00.000Z"
}
```

### Bulk Operations

**Import books from CSV:**
```bash
POST /api/books/import
Content-Type: multipart/form-data

file: books.csv
```

**Export books to CSV:**
```bash
GET /api/books/export?format=csv
```

---

*For more detailed information, refer to the main system documentation.*
