'use client'

import { useEffect } from 'react'
import { useLibrary } from '../context/LibraryContext'
import { generateSampleBooks, generateSampleMembers, generateSampleBorrowings, generateSampleAttendance, generateSampleReservations } from '../lib/sampleData'

const DataInitializer = () => {
  const { state, addBook, addMember, borrowBook, addAttendance, addReservation } = useLibrary()

  useEffect(() => {
    const initializeData = () => {
      // Check if data already exists
      const hasBooks = state.books.length > 0
      const hasMembers = state.members.length > 0
      
      if (hasBooks && hasMembers) return

      // Generate sample data
      const sampleBooks = generateSampleBooks()
      const sampleMembers = generateSampleMembers()
      
      // Add books
      if (!hasBooks) {
        sampleBooks.forEach(book => {
          addBook(book)
        })
      }

      // Add members
      if (!hasMembers) {
        sampleMembers.forEach(member => {
          addMember(member)
        })
      }

      // Wait a bit for the state to update, then add relationships
      setTimeout(() => {
        const currentBooks = state.books.length > 0 ? state.books : sampleBooks.map((book, index) => ({ ...book, id: `book-${index}` }))
        const currentMembers = state.members.length > 0 ? state.members : sampleMembers.map((member, index) => ({ ...member, id: `member-${index}` }))
        
        const bookIds = currentBooks.map(book => book.id)
        const memberIds = currentMembers.map(member => member.id)

        // Add sample borrowings
        const sampleBorrowings = generateSampleBorrowings(bookIds, memberIds)
        sampleBorrowings.forEach(borrowing => {
          borrowBook(borrowing)
        })

        // Add sample attendance
        const sampleAttendance = generateSampleAttendance(memberIds)
        sampleAttendance.forEach(attendance => {
          addAttendance(attendance)
        })

        // Add sample reservations
        const sampleReservations = generateSampleReservations(bookIds, memberIds)
        sampleReservations.forEach(reservation => {
          addReservation(reservation)
        })
      }, 1000)
    }

    initializeData()
  }, [state.books.length, state.members.length, addBook, addMember, borrowBook, addAttendance, addReservation])

  return null
}

export default DataInitializer
