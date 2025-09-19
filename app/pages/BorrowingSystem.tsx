'use client'

import React, { useState, useEffect } from 'react'
import { useLibrary } from '../context/LibraryContext'
import { BookMarked, Search, Plus, Clock, CheckCircle, AlertTriangle } from 'lucide-react'

const BorrowingSystem = () => {
  const { state, borrowBook, returnBook, fetchBooks, fetchMembers, fetchBorrowings } = useLibrary()
  const { books, members, borrowings } = state
  const [searchTerm, setSearchTerm] = useState('')
  const [showBorrowModal, setShowBorrowModal] = useState(false)

  // Fetch data on component mount
  useEffect(() => {
    fetchBooks()
    fetchMembers()
    fetchBorrowings()
  }, [])

  const activeBorrowings = borrowings.filter(b => b.status === 'BORROWED')
  const overdueBorrowings = activeBorrowings.filter(b => {
    const dueDate = new Date(b.dueDate)
    const today = new Date()
    return dueDate < today
  })

  // Filter borrowings based on search term
  const filteredBorrowings = activeBorrowings.filter(borrowing => {
    const book = books.find(b => b.id === borrowing.bookId)
    const member = members.find(m => m.id === borrowing.memberId)
    
    if (!searchTerm) return true
    
    const searchLower = searchTerm.toLowerCase()
    return (
      book?.title.toLowerCase().includes(searchLower) ||
      book?.author.toLowerCase().includes(searchLower) ||
      member?.name.toLowerCase().includes(searchLower) ||
      member?.email.toLowerCase().includes(searchLower) ||
      borrowing.id.toLowerCase().includes(searchLower)
    )
  })

  const handleBorrowBook = (borrowingData: any) => {
    const dueDate = new Date()
    dueDate.setDate(dueDate.getDate() + 14) // 14 days from now
    
    borrowBook({
      bookId: borrowingData.bookId,
      memberId: borrowingData.memberId,
      dueDate: dueDate.toISOString()
    })
    setShowBorrowModal(false)
  }

  const handleReturnBook = (borrowingId: string) => {
    returnBook(borrowingId)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Borrowing System</h1>
          <p className="text-gray-600 mt-2">Manage book loans and returns</p>
        </div>
        <button
          onClick={() => setShowBorrowModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
        >
          <Plus className="h-5 w-5" />
          <span>New Loan</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-lg">
              <BookMarked className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active Loans</p>
              <p className="text-2xl font-bold text-gray-900">{activeBorrowings.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-3 bg-red-100 rounded-lg">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Overdue</p>
              <p className="text-2xl font-bold text-gray-900">{overdueBorrowings.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-lg">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Available Books</p>
              <p className="text-2xl font-bold text-gray-900">
                {books.filter(b => b.status === 'AVAILABLE').length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by book title, member name, or loan ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent w-full"
          />
        </div>
      </div>

      {/* Borrowings List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Book
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Member
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Borrow Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Due Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredBorrowings.map((borrowing) => {
                const book = books.find(b => b.id === borrowing.bookId)
                const member = members.find(m => m.id === borrowing.memberId)
                const isOverdue = new Date(borrowing.dueDate) < new Date()
                
                return (
                  <tr key={borrowing.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{book?.title}</div>
                      <div className="text-sm text-gray-500">by {book?.author}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{member?.name}</div>
                      <div className="text-sm text-gray-500">{member?.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(borrowing.borrowDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`text-sm ${isOverdue ? 'text-red-600 font-medium' : 'text-gray-900'}`}>
                        {new Date(borrowing.dueDate).toLocaleDateString()}
                      </div>
                      {isOverdue && (
                        <div className="text-xs text-red-500 flex items-center">
                          <Clock className="h-3 w-3 mr-1" />
                          Overdue
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        isOverdue 
                          ? 'bg-red-100 text-red-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {isOverdue ? 'Overdue' : 'Borrowed'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => handleReturnBook(borrowing.id)}
                        className="text-green-600 hover:text-green-900"
                      >
                        Return
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {activeBorrowings.length === 0 && (
        <div className="text-center py-12">
          <BookMarked className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No active loans</h3>
          <p className="text-gray-600">All books are currently available</p>
        </div>
      )}

      {activeBorrowings.length > 0 && filteredBorrowings.length === 0 && searchTerm && (
        <div className="text-center py-12">
          <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No loans found</h3>
          <p className="text-gray-600">Try adjusting your search criteria</p>
        </div>
      )}

      {/* Borrow Book Modal */}
      {showBorrowModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">Borrow Book</h2>
            <form onSubmit={(e) => {
              e.preventDefault()
              const formData = new FormData(e.target as HTMLFormElement)
              handleBorrowBook({
                bookId: formData.get('bookId'),
                memberId: formData.get('memberId')
              })
            }}>
              <div className="space-y-4">
                <select
                  name="bookId"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                >
                  <option value="">Select Book</option>
                  {books.filter(b => b.status === 'AVAILABLE').map(book => (
                    <option key={book.id} value={book.id}>
                      {book.title} by {book.author}
                    </option>
                  ))}
                </select>
                <select
                  name="memberId"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                >
                  <option value="">Select Member</option>
                  {members.filter(m => m.status === 'ACTIVE').map(member => (
                    <option key={member.id} value={member.id}>
                      {member.name} ({member.email})
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowBorrowModal(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Borrow Book
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default BorrowingSystem
