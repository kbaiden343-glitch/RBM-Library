'use client'

import React, { createContext, useContext, useReducer, useEffect } from 'react'
import toast from 'react-hot-toast'

interface Book {
  id: string
  title: string
  author: string
  isbn: string
  category: string
  status: 'AVAILABLE' | 'BORROWED' | 'RESERVED'
  publishedYear: number
  description?: string
  coverImage?: string
  createdAt?: string
  updatedAt?: string
}

interface Member {
  id: string
  name: string
  email: string
  phone: string
  address: string
  membershipDate: string
  status: 'ACTIVE' | 'INACTIVE'
  personType?: 'MEMBER' | 'VISITOR' | 'STUDENT' | 'VIP' | 'STAFF' // Include person type
  createdAt?: string
  updatedAt?: string
}

interface Person {
  id: string
  name: string
  email: string
  phone?: string
  address?: string
  personType: 'MEMBER' | 'VISITOR' | 'STUDENT' | 'VIP' | 'STAFF'
  membershipDate?: string
  status: 'ACTIVE' | 'INACTIVE'
  notes?: string
  emergencyContact?: string
  libraryId?: string
  createdAt?: string
  updatedAt?: string
}

interface Borrowing {
  id: string
  bookId: string
  personId: string
  memberId?: string // Keep for backward compatibility
  borrowDate: string
  dueDate: string
  returnDate?: string
  status: 'BORROWED' | 'RETURNED' | 'OVERDUE'
  createdAt?: string
  updatedAt?: string
  book?: Book
  person?: Person
  member?: Member // Keep for backward compatibility
}

interface Reservation {
  id: string
  bookId: string
  personId: string
  memberId?: string // Keep for backward compatibility
  reservationDate: string
  status: 'WAITING' | 'READY' | 'CANCELLED'
  createdAt?: string
  updatedAt?: string
  book?: Book
  person?: Person
  member?: Member // Keep for backward compatibility
}

interface Attendance {
  id: string
  personId: string
  memberId?: string // Keep for backward compatibility
  checkInTime: string
  checkOutTime?: string
  createdAt?: string
  person?: Person
  member?: Member // Keep for backward compatibility
}

interface LibraryState {
  books: Book[]
  members: Member[]
  borrowings: Borrowing[]
  reservations: Reservation[]
  attendance: Attendance[]
  currentUser: any
  loading: boolean
  error: string | null
}

type LibraryAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_BOOKS'; payload: Book[] }
  | { type: 'ADD_BOOK'; payload: Book }
  | { type: 'UPDATE_BOOK'; payload: Book }
  | { type: 'DELETE_BOOK'; payload: string }
  | { type: 'SET_MEMBERS'; payload: Member[] }
  | { type: 'ADD_MEMBER'; payload: Member }
  | { type: 'UPDATE_MEMBER'; payload: Member }
  | { type: 'DELETE_MEMBER'; payload: string }
  | { type: 'SET_BORROWINGS'; payload: Borrowing[] }
  | { type: 'ADD_BORROWING'; payload: Borrowing }
  | { type: 'RETURN_BOOK'; payload: Borrowing }
  | { type: 'SET_RESERVATIONS'; payload: Reservation[] }
  | { type: 'ADD_RESERVATION'; payload: Reservation }
  | { type: 'SET_ATTENDANCE'; payload: Attendance[] }
  | { type: 'ADD_ATTENDANCE'; payload: Attendance }
  | { type: 'SET_CURRENT_USER'; payload: any }

const LibraryContext = createContext<{
  state: LibraryState
  dispatch: React.Dispatch<LibraryAction>
  addBook: (book: Omit<Book, 'id'>) => Promise<void>
  updateBook: (book: Book) => Promise<void>
  deleteBook: (bookId: string) => Promise<void>
  addMember: (member: Omit<Member, 'id'>) => Promise<void>
  updateMember: (member: Member) => Promise<void>
  deleteMember: (memberId: string) => Promise<void>
  borrowBook: (borrowing: Omit<Borrowing, 'id' | 'borrowDate' | 'status'>) => Promise<void>
  returnBook: (borrowingId: string) => Promise<void>
  addReservation: (reservation: Omit<Reservation, 'id' | 'reservationDate' | 'status'>) => Promise<void>
  addAttendance: (attendance: Omit<Attendance, 'id' | 'checkInTime'>) => Promise<void>
  getRecommendations: (memberId: string) => Book[]
  fetchBooks: () => Promise<void>
  fetchMembers: () => Promise<void>
  fetchBorrowings: () => Promise<void>
  fetchReservations: () => Promise<void>
  fetchAttendance: () => Promise<void>
} | null>(null)

const initialState: LibraryState = {
  books: [],
  members: [],
  borrowings: [],
  reservations: [],
  attendance: [],
  currentUser: null,
  loading: false,
  error: null
}

const libraryReducer = (state: LibraryState, action: LibraryAction): LibraryState => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload }
    
    case 'SET_ERROR':
      return { ...state, error: action.payload }
    
    case 'SET_BOOKS':
      return { ...state, books: action.payload }
    
    case 'ADD_BOOK':
      return { ...state, books: [...state.books, action.payload] }
    
    case 'UPDATE_BOOK':
      return {
        ...state,
        books: state.books.map(book => 
          book.id === action.payload.id ? action.payload : book
        )
      }
    
    case 'DELETE_BOOK':
      return {
        ...state,
        books: state.books.filter(book => book.id !== action.payload)
      }
    
    case 'SET_MEMBERS':
      return { ...state, members: action.payload }
    
    case 'ADD_MEMBER':
      return { ...state, members: [...state.members, action.payload] }
    
    case 'UPDATE_MEMBER':
      return {
        ...state,
        members: state.members.map(member => 
          member.id === action.payload.id ? action.payload : member
        )
      }
    
    case 'DELETE_MEMBER':
      return {
        ...state,
        members: state.members.filter(member => member.id !== action.payload)
      }
    
    case 'SET_BORROWINGS':
      return { ...state, borrowings: action.payload }
    
    case 'ADD_BORROWING':
      return { ...state, borrowings: [...state.borrowings, action.payload] }
    
    case 'RETURN_BOOK':
      return {
        ...state,
        borrowings: state.borrowings.map(borrowing => 
          borrowing.id === action.payload.id ? action.payload : borrowing
        )
      }
    
    case 'SET_RESERVATIONS':
      return { ...state, reservations: action.payload }
    
    case 'ADD_RESERVATION':
      return { ...state, reservations: [...state.reservations, action.payload] }
    
    case 'SET_ATTENDANCE':
      return { ...state, attendance: action.payload }
    
    case 'ADD_ATTENDANCE':
      return { ...state, attendance: [...state.attendance, action.payload] }
    
    case 'SET_CURRENT_USER':
      return { ...state, currentUser: action.payload }
    
    default:
      return state
  }
}

// API helper functions
const apiCall = async (url: string, options: RequestInit = {}) => {
  const token = localStorage.getItem('token')
  
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'API call failed')
  }

  return response.json()
}

export const LibraryProvider = ({ children }: { children: React.ReactNode }) => {
  const [state, dispatch] = useReducer(libraryReducer, initialState)

  // Fetch functions
  const fetchBooks = async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true })
      const data = await apiCall('/api/books')
      dispatch({ type: 'SET_BOOKS', payload: data.books || data })
    } catch (error) {
      console.error('Error fetching books:', error)
      dispatch({ type: 'SET_ERROR', payload: 'Failed to fetch books' })
      toast.error('Failed to fetch books')
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false })
    }
  }

  const fetchMembers = async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true })
      // Use the new persons API and fetch all person types for borrowing
      const data = await apiCall('/api/persons?limit=100')
      // Convert persons to member format for backward compatibility
      const membersData = data.persons?.map((person: any) => ({
        id: person.id,
        name: person.name,
        email: person.email,
        phone: person.phone || '',
        address: person.address || '',
        membershipDate: person.membershipDate || person.createdAt,
        status: (person.status === 'ACTIVE' ? 'ACTIVE' : 'INACTIVE') as 'ACTIVE' | 'INACTIVE',
        personType: person.personType, // Include person type
        createdAt: person.createdAt,
        updatedAt: person.updatedAt,
      })) || []
      dispatch({ type: 'SET_MEMBERS', payload: membersData })
    } catch (error) {
      console.error('Error fetching members:', error)
      dispatch({ type: 'SET_ERROR', payload: 'Failed to fetch members' })
      toast.error('Failed to fetch members')
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false })
    }
  }

  const fetchBorrowings = async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true })
      const data = await apiCall('/api/borrowings')
      dispatch({ type: 'SET_BORROWINGS', payload: data.borrowings || data })
    } catch (error) {
      console.error('Error fetching borrowings:', error)
      dispatch({ type: 'SET_ERROR', payload: 'Failed to fetch borrowings' })
      toast.error('Failed to fetch borrowings')
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false })
    }
  }

  const fetchReservations = async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true })
      const data = await apiCall('/api/reservations')
      dispatch({ type: 'SET_RESERVATIONS', payload: data.reservations || data })
    } catch (error) {
      console.error('Error fetching reservations:', error)
      dispatch({ type: 'SET_ERROR', payload: 'Failed to fetch reservations' })
      toast.error('Failed to fetch reservations')
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false })
    }
  }

  const fetchAttendance = async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true })
      const data = await apiCall('/api/attendance')
      dispatch({ type: 'SET_ATTENDANCE', payload: data.attendance || data })
    } catch (error) {
      console.error('Error fetching attendance:', error)
      dispatch({ type: 'SET_ERROR', payload: 'Failed to fetch attendance' })
      toast.error('Failed to fetch attendance')
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false })
    }
  }

  // Load initial data
  useEffect(() => {
    const loadData = async () => {
      try {
        await Promise.all([
          fetchBooks(),
          fetchMembers(),
          fetchBorrowings(),
          fetchReservations(),
          fetchAttendance(),
        ])
      } catch (error) {
        console.error('Error loading initial data:', error)
        toast.error('Error loading library data')
      }
    }

    loadData()
  }, [])

  const value = {
    state,
    dispatch,
    // Book operations
    addBook: async (book: Omit<Book, 'id'>) => {
      try {
        dispatch({ type: 'SET_LOADING', payload: true })
        const newBook = await apiCall('/api/books', {
          method: 'POST',
          body: JSON.stringify(book),
        })
        dispatch({ type: 'ADD_BOOK', payload: newBook })
        toast.success('Book added successfully!')
      } catch (error) {
        console.error('Error adding book:', error)
        toast.error('Failed to add book')
      } finally {
        dispatch({ type: 'SET_LOADING', payload: false })
      }
    },
    updateBook: async (book: Book) => {
      try {
        dispatch({ type: 'SET_LOADING', payload: true })
        const updatedBook = await apiCall(`/api/books/${book.id}`, {
          method: 'PUT',
          body: JSON.stringify(book),
        })
        dispatch({ type: 'UPDATE_BOOK', payload: updatedBook })
        toast.success('Book updated successfully!')
      } catch (error) {
        console.error('Error updating book:', error)
        toast.error('Failed to update book')
      } finally {
        dispatch({ type: 'SET_LOADING', payload: false })
      }
    },
    deleteBook: async (bookId: string) => {
      try {
        dispatch({ type: 'SET_LOADING', payload: true })
        await apiCall(`/api/books/${bookId}`, {
          method: 'DELETE',
        })
        dispatch({ type: 'DELETE_BOOK', payload: bookId })
        toast.success('Book deleted successfully!')
      } catch (error) {
        console.error('Error deleting book:', error)
        toast.error('Failed to delete book')
      } finally {
        dispatch({ type: 'SET_LOADING', payload: false })
      }
    },
    // Member operations
    addMember: async (member: Omit<Member, 'id'>) => {
      try {
        dispatch({ type: 'SET_LOADING', payload: true })
        // Use the new persons API to create a member
        const personData = {
          name: member.name,
          email: member.email,
          phone: member.phone,
          address: member.address,
          personType: 'MEMBER',
          status: 'ACTIVE',
        }
        const newPerson = await apiCall('/api/persons', {
          method: 'POST',
          body: JSON.stringify(personData),
        })
        // Convert person to member format
        const newMember = {
          id: newPerson.id,
          name: newPerson.name,
          email: newPerson.email,
          phone: newPerson.phone || '',
          address: newPerson.address || '',
          membershipDate: newPerson.membershipDate || newPerson.createdAt,
          status: (newPerson.status === 'ACTIVE' ? 'ACTIVE' : 'INACTIVE') as 'ACTIVE' | 'INACTIVE',
          createdAt: newPerson.createdAt,
          updatedAt: newPerson.updatedAt,
        }
        dispatch({ type: 'ADD_MEMBER', payload: newMember })
        toast.success('Member added successfully!')
      } catch (error) {
        console.error('Error adding member:', error)
        toast.error('Failed to add member')
      } finally {
        dispatch({ type: 'SET_LOADING', payload: false })
      }
    },
    updateMember: async (member: Member) => {
      try {
        dispatch({ type: 'SET_LOADING', payload: true })
        
        // Convert Member to Person format for the API
        const personData = {
          name: member.name,
          email: member.email,
          phone: member.phone,
          address: member.address,
          personType: 'MEMBER',
          status: member.status === 'ACTIVE' ? 'ACTIVE' : 'INACTIVE',
        }
        
        const updatedPerson = await apiCall(`/api/persons/${member.id}`, {
          method: 'PUT',
          body: JSON.stringify(personData),
        })
        
        // Convert back to Member format
        const updatedMember = {
          id: updatedPerson.id,
          name: updatedPerson.name,
          email: updatedPerson.email,
          phone: updatedPerson.phone || '',
          address: updatedPerson.address || '',
          membershipDate: updatedPerson.membershipDate || updatedPerson.createdAt,
          status: (updatedPerson.status === 'ACTIVE' ? 'ACTIVE' : 'INACTIVE') as 'ACTIVE' | 'INACTIVE',
          createdAt: updatedPerson.createdAt,
          updatedAt: updatedPerson.updatedAt,
        }
        
        dispatch({ type: 'UPDATE_MEMBER', payload: updatedMember })
        toast.success('Member updated successfully!')
      } catch (error) {
        console.error('Error updating member:', error)
        toast.error('Failed to update member')
      } finally {
        dispatch({ type: 'SET_LOADING', payload: false })
      }
    },
    deleteMember: async (memberId: string) => {
      try {
        dispatch({ type: 'SET_LOADING', payload: true })
        await apiCall(`/api/persons/${memberId}`, {
          method: 'DELETE',
        })
        dispatch({ type: 'DELETE_MEMBER', payload: memberId })
        toast.success('Member deleted successfully!')
      } catch (error) {
        console.error('Error deleting member:', error)
        toast.error('Failed to delete member')
      } finally {
        dispatch({ type: 'SET_LOADING', payload: false })
      }
    },
    // Borrowing operations
    borrowBook: async (borrowing: Omit<Borrowing, 'id' | 'borrowDate' | 'status'>) => {
      try {
        dispatch({ type: 'SET_LOADING', payload: true })
        const newBorrowing = await apiCall('/api/borrowings', {
          method: 'POST',
          body: JSON.stringify(borrowing),
        })
        dispatch({ type: 'ADD_BORROWING', payload: newBorrowing })
        toast.success('Book borrowed successfully!')
      } catch (error) {
        console.error('Error borrowing book:', error)
        toast.error('Failed to borrow book')
      } finally {
        dispatch({ type: 'SET_LOADING', payload: false })
      }
    },
    returnBook: async (borrowingId: string) => {
      try {
        dispatch({ type: 'SET_LOADING', payload: true })
        const updatedBorrowing = await apiCall(`/api/borrowings/${borrowingId}`, {
          method: 'PUT',
          body: JSON.stringify({ action: 'return' }),
        })
        dispatch({ type: 'RETURN_BOOK', payload: updatedBorrowing })
        toast.success('Book returned successfully!')
      } catch (error) {
        console.error('Error returning book:', error)
        toast.error('Failed to return book')
      } finally {
        dispatch({ type: 'SET_LOADING', payload: false })
      }
    },
    // Reservation operations
    addReservation: async (reservation: Omit<Reservation, 'id' | 'reservationDate' | 'status'>) => {
      try {
        dispatch({ type: 'SET_LOADING', payload: true })
        const newReservation = await apiCall('/api/reservations', {
          method: 'POST',
          body: JSON.stringify(reservation),
        })
        dispatch({ type: 'ADD_RESERVATION', payload: newReservation })
        toast.success('Book reserved successfully!')
      } catch (error) {
        console.error('Error adding reservation:', error)
        toast.error('Failed to reserve book')
      } finally {
        dispatch({ type: 'SET_LOADING', payload: false })
      }
    },
    // Attendance operations
    addAttendance: async (attendance: Omit<Attendance, 'id' | 'checkInTime'>) => {
      try {
        dispatch({ type: 'SET_LOADING', payload: true })
        const newAttendance = await apiCall('/api/attendance', {
          method: 'POST',
          body: JSON.stringify(attendance),
        })
        dispatch({ type: 'ADD_ATTENDANCE', payload: newAttendance })
        toast.success('Attendance recorded successfully!')
      } catch (error) {
        console.error('Error adding attendance:', error)
        toast.error('Failed to record attendance')
      } finally {
        dispatch({ type: 'SET_LOADING', payload: false })
      }
    },
    // AI Recommendation
    getRecommendations: (memberId: string) => {
      const memberBorrowings = state.borrowings.filter(b => b.memberId === memberId)
      const borrowedBooks = memberBorrowings.map(b => 
        state.books.find(book => book.id === b.bookId)
      ).filter(Boolean) as Book[]
      
      // Simple recommendation based on category
      const categories = borrowedBooks.map(book => book.category)
      const mostCommonCategory = categories.sort((a,b) => 
        categories.filter(v => v === a).length - categories.filter(v => v === b).length
      ).pop()
      
      return state.books.filter(book => 
        book.category === mostCommonCategory && 
        !borrowedBooks.some(b => b.id === book.id) &&
        book.status === 'AVAILABLE'
      ).slice(0, 3)
    },
    // Fetch functions
    fetchBooks,
    fetchMembers,
    fetchBorrowings,
    fetchReservations,
    fetchAttendance,
  }

  return (
    <LibraryContext.Provider value={value}>
      {children}
    </LibraryContext.Provider>
  )
}

export const useLibrary = () => {
  const context = useContext(LibraryContext)
  if (!context) {
    throw new Error('useLibrary must be used within a LibraryProvider')
  }
  return context
}