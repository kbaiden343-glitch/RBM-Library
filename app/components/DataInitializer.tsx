'use client'

import { useEffect, useRef } from 'react'
import { useLibrary } from '../context/LibraryContext'
import { generateSampleBooks, generateSampleMembers, generateSampleBorrowings, generateSampleAttendance, generateSampleReservations } from '../lib/sampleData'

const DataInitializer = () => {
  const { state, addBook, addMember, borrowBook, addAttendance, addReservation } = useLibrary()
  const initialized = useRef(false)

  useEffect(() => {
    // Only run once when component mounts
    if (initialized.current) return
    
    const initializeData = async () => {
      try {
        // Check if data already exists in local state first (much faster)
        let hasBooks = state.books.length > 0
        let hasMembers = state.members.length > 0
        
        // Only check database if local state is empty (avoid unnecessary API calls)
        if (!hasBooks || !hasMembers) {
          console.log('Local state empty, checking database...')
          try {
            const booksResponse = await fetch('/api/books?limit=1')
            hasBooks = booksResponse.ok && (await booksResponse.json()).books?.length > 0
          } catch (error) {
            console.log('Error checking books:', error)
          }
          
          try {
            const membersResponse = await fetch('/api/persons?limit=1')
            hasMembers = membersResponse.ok && (await membersResponse.json()).persons?.length > 0
          } catch (error) {
            console.log('Error checking members:', error)
          }
        }
        
        if (hasBooks && hasMembers) {
          console.log('Sample data already exists, skipping initialization')
          initialized.current = true
          return
        }

        console.log('Initializing sample data...')
        
        // Generate sample data
        const sampleBooks = generateSampleBooks()
        const sampleMembers = generateSampleMembers()
        
        // Add books sequentially to avoid conflicts
        if (!hasBooks) {
          for (const book of sampleBooks) {
            try {
              await addBook(book)
            } catch (error) {
              console.log('Book already exists or error:', error)
            }
          }
        }

        // Add members sequentially to avoid conflicts
        if (!hasMembers) {
          for (const member of sampleMembers) {
            try {
              await addMember(member)
            } catch (error) {
              console.log('Member already exists or error:', error)
            }
          }
        }

        // Wait for state to update, then add relationships
        setTimeout(async () => {
          try {
            // Get current data from state
            const currentBooks = state.books.length > 0 ? state.books : []
            const currentMembers = state.members.length > 0 ? state.members : []
            
            if (currentBooks.length === 0 || currentMembers.length === 0) {
              console.log('Waiting for books/members to be created...')
              return
            }
            
            const bookIds = currentBooks.map(book => book.id)
            const memberIds = currentMembers.map(member => member.id)

            // Add sample borrowings
            const sampleBorrowings = generateSampleBorrowings(bookIds, memberIds)
            for (const borrowing of sampleBorrowings) {
              try {
                await borrowBook(borrowing)
              } catch (error) {
                console.log('Borrowing already exists or error:', error)
              }
            }

            // Add sample attendance
            const sampleAttendance = generateSampleAttendance(memberIds)
            for (const attendance of sampleAttendance) {
              try {
                await addAttendance(attendance)
              } catch (error) {
                console.log('Attendance already exists or error:', error)
              }
            }

            // Add sample reservations
            const sampleReservations = generateSampleReservations(bookIds, memberIds)
            for (const reservation of sampleReservations) {
              try {
                await addReservation(reservation)
              } catch (error) {
                console.log('Reservation already exists or error:', error)
              }
            }
            
            console.log('Sample data initialization completed')
            initialized.current = true
          } catch (error) {
            console.error('Error adding relationships:', error)
          }
        }, 2000)
        
      } catch (error) {
        console.error('Error initializing data:', error)
      }
    }

    initializeData()
  }, []) // Empty dependency array - only run once

  return null
}

export default DataInitializer
