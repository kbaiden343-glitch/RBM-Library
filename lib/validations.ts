import { z } from 'zod'

// User validation schemas
export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['ADMIN', 'LIBRARIAN', 'MEMBER']).optional(),
})

// Book validation schemas
export const bookSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  author: z.string().min(1, 'Author is required'),
  isbn: z.string().min(1, 'ISBN is required'),
  category: z.string().min(1, 'Category is required'),
  publishedYear: z.number().min(1000).max(new Date().getFullYear() + 1),
  description: z.string().optional().nullable(),
  coverImage: z.string().optional().nullable().refine(
    (val) => !val || val === '' || z.string().url().safeParse(val).success,
    { message: 'Cover image must be a valid URL' }
  ),
})

export const updateBookSchema = bookSchema.partial().extend({
  id: z.string(),
})

// Member validation schemas
export const memberSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(10, 'Phone number must be at least 10 characters'),
  address: z.string().min(5, 'Address must be at least 5 characters'),
  status: z.enum(['ACTIVE', 'INACTIVE']).optional(),
})

export const updateMemberSchema = memberSchema.partial().extend({
  id: z.string(),
})

// Borrowing validation schemas
export const borrowingSchema = z.object({
  bookId: z.string(),
  personId: z.string().optional(),
  memberId: z.string().optional(),
  dueDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Invalid date format"
  }),
}).refine((data) => data.personId || data.memberId, {
  message: "Either personId or memberId is required"
})

export const returnBookSchema = z.object({
  borrowingId: z.string(),
})

// Reservation validation schemas
export const reservationSchema = z.object({
  bookId: z.string(),
  personId: z.string().optional(),
  memberId: z.string().optional(),
}).refine((data) => data.personId || data.memberId, {
  message: "Either personId or memberId is required"
})

// Attendance validation schemas
export const attendanceSchema = z.object({
  action: z.enum(['check-in', 'check-out']),
  personId: z.string().optional(),
  memberId: z.string().optional(),
  visitorName: z.string().optional(),
  visitorEmail: z.string().optional(),
  visitorPhone: z.string().optional(),
}).refine((data) => {
  // For check-in, we need either personId, memberId, or visitor info
  if (data.action === 'check-in') {
    return data.personId || data.memberId || (data.visitorName && data.visitorEmail)
  }
  // For check-out, we need personId, memberId, or visitorEmail
  if (data.action === 'check-out') {
    return data.personId || data.memberId || data.visitorEmail
  }
  return true
}, {
  message: "For check-in: personId, memberId, or visitorName+visitorEmail required. For check-out: personId, memberId, or visitorEmail required"
})

// Type exports
export type LoginInput = z.infer<typeof loginSchema>
export type RegisterInput = z.infer<typeof registerSchema>
export type BookInput = z.infer<typeof bookSchema>
export type UpdateBookInput = z.infer<typeof updateBookSchema>
export type MemberInput = z.infer<typeof memberSchema>
export type UpdateMemberInput = z.infer<typeof updateMemberSchema>
export type BorrowingInput = z.infer<typeof borrowingSchema>
export type ReturnBookInput = z.infer<typeof returnBookSchema>
export type ReservationInput = z.infer<typeof reservationSchema>
export type AttendanceInput = z.infer<typeof attendanceSchema>
