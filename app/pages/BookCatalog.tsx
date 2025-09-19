'use client'

import React, { useState, useEffect } from 'react'
import { useLibrary } from '../context/LibraryContext'
import { useAuth } from '../context/AuthContext'
import { BookOpen, Search, Filter, Plus, Eye, Edit, Trash2, Download, Upload, Star, Clock, Users, Grid, List, CheckSquare } from 'lucide-react'
import ImportExportModal from '../components/ImportExportModal'

const BookCatalog = () => {
  const { state, addBook, updateBook, deleteBook } = useLibrary()
  const { hasPermission } = useAuth()
  const { books, borrowings } = state
  const [searchTerm, setSearchTerm] = useState('')
  const [filterCategory, setFilterCategory] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')
  const [sortBy, setSortBy] = useState('title')
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingBook, setEditingBook] = useState(null)
  const [viewMode, setViewMode] = useState('grid')
  const [selectedBooks, setSelectedBooks] = useState<string[]>([])
  const [showImportModal, setShowImportModal] = useState(false)
  const [showExportModal, setShowExportModal] = useState(false)

  const categories = ['all', 'fiction', 'non-fiction', 'science', 'history', 'biography', 'children', 'technology', 'art', 'philosophy']
  const statuses = ['all', 'AVAILABLE', 'BORROWED', 'RESERVED']

  const filteredBooks = books.filter(book => {
    const matchesSearch = book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         book.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         book.isbn.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = filterCategory === 'all' || book.category === filterCategory
    const matchesStatus = filterStatus === 'all' || book.status === filterStatus
    return matchesSearch && matchesCategory && matchesStatus
  }).sort((a, b) => {
    switch (sortBy) {
      case 'title':
        return a.title.localeCompare(b.title)
      case 'author':
        return a.author.localeCompare(b.author)
      case 'publishedYear':
        return b.publishedYear - a.publishedYear
      case 'category':
        return a.category.localeCompare(b.category)
      default:
        return 0
    }
  })

  const handleAddBook = async (bookData) => {
    await addBook(bookData)
    setShowAddModal(false)
  }

  const handleEditBook = async (bookData) => {
    await updateBook(bookData)
    setEditingBook(null)
  }

  const handleDeleteBook = async (bookId) => {
    if (confirm('Are you sure you want to delete this book?')) {
      await deleteBook(bookId)
    }
  }

  const handleBulkDelete = async () => {
    if (selectedBooks.length === 0) return
    if (confirm(`Are you sure you want to delete ${selectedBooks.length} books?`)) {
      for (const bookId of selectedBooks) {
        await deleteBook(bookId)
      }
      setSelectedBooks([])
    }
  }

  const handleSelectBook = (bookId: string) => {
    setSelectedBooks(prev => 
      prev.includes(bookId) 
        ? prev.filter(id => id !== bookId)
        : [...prev, bookId]
    )
  }

  const handleSelectAll = () => {
    if (selectedBooks.length === filteredBooks.length) {
      setSelectedBooks([])
    } else {
      setSelectedBooks(filteredBooks.map(book => book.id))
    }
  }

  const getBookBorrowCount = (bookId: string) => {
    return borrowings.filter(b => b.bookId === bookId).length
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Book Catalog</h1>
          <p className="text-gray-600 mt-2">Manage your library's book collection ({filteredBooks.length} books)</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {hasPermission('books:write') && (
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
            >
              <Plus className="h-5 w-5" />
              <span>Add Book</span>
            </button>
          )}
          <button 
            onClick={() => setShowImportModal(true)}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center space-x-2"
          >
            <Upload className="h-5 w-5" />
            <span>Import</span>
          </button>
          <button 
            onClick={() => setShowExportModal(true)}
            className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 flex items-center space-x-2"
          >
            <Download className="h-5 w-5" />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search books..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent w-full"
            />
          </div>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600"
          >
            {categories.map(category => (
              <option key={category} value={category}>
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </option>
            ))}
          </select>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600"
          >
            {statuses.map(status => (
              <option key={status} value={status}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </option>
            ))}
          </select>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600"
          >
            <option value="title">Sort by Title</option>
            <option value="author">Sort by Author</option>
            <option value="publishedYear">Sort by Year</option>
            <option value="category">Sort by Category</option>
          </select>
        </div>

        {/* View Mode and Bulk Actions */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg ${viewMode === 'grid' ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
            >
              <Grid className="h-5 w-5" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg ${viewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
            >
              <List className="h-5 w-5" />
            </button>
          </div>

          {hasPermission('books:write') && (
            <div className="flex items-center space-x-2">
              <button
                onClick={handleSelectAll}
                className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-800"
              >
                <CheckSquare className="h-4 w-4" />
                <span>Select All</span>
              </button>
            </div>
          )}
        </div>

        {/* Bulk Actions */}
        {selectedBooks.length > 0 && hasPermission('books:delete') && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center justify-between mt-4">
            <span className="text-blue-800 font-medium">
              {selectedBooks.length} book{selectedBooks.length > 1 ? 's' : ''} selected
            </span>
            <div className="flex space-x-2">
              <button
                onClick={handleBulkDelete}
                className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
              >
                Delete Selected
              </button>
              <button
                onClick={() => setSelectedBooks([])}
                className="bg-gray-600 text-white px-3 py-1 rounded text-sm hover:bg-gray-700"
              >
                Clear Selection
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Books Display */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredBooks.map((book) => (
            <div key={book.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    {hasPermission('books:delete') && (
                      <input
                        type="checkbox"
                        checked={selectedBooks.includes(book.id)}
                        onChange={() => handleSelectBook(book.id)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    )}
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <BookOpen className="h-6 w-6 text-blue-600" />
                    </div>
                  </div>
                  {hasPermission('books:delete') && (
                    <div className="flex space-x-1">
                      <button
                        onClick={() => setEditingBook(book)}
                        className="p-1 text-gray-400 hover:text-blue-600"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteBook(book.id)}
                        className="p-1 text-gray-400 hover:text-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                </div>
                
                <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">{book.title}</h3>
                <p className="text-sm text-gray-600 mb-2">by {book.author}</p>
                <p className="text-xs text-gray-500 mb-3 capitalize">{book.category}</p>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-500">Published:</span>
                    <span className="font-medium">{book.publishedYear}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-500">Borrowed:</span>
                    <span className="font-medium">{getBookBorrowCount(book.id)} times</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between mt-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    book.status === 'AVAILABLE' ? 'bg-green-100 text-green-800' :
                    book.status === 'BORROWED' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {book.status.charAt(0) + book.status.slice(1).toLowerCase()}
                  </span>
                  <button className="flex items-center space-x-1 text-blue-600 hover:text-blue-700 text-sm">
                    <Eye className="h-4 w-4" />
                    <span>View</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {hasPermission('books:delete') && (
                    <th className="px-6 py-3 text-left">
                      <input
                        type="checkbox"
                        checked={selectedBooks.length === filteredBooks.length && filteredBooks.length > 0}
                        onChange={handleSelectAll}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </th>
                  )}
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Book
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Author
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Year
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Borrowed
                  </th>
                  {hasPermission('books:delete') && (
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredBooks.map((book) => (
                  <tr key={book.id} className="hover:bg-gray-50">
                    {hasPermission('books:delete') && (
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="checkbox"
                          checked={selectedBooks.includes(book.id)}
                          onChange={() => handleSelectBook(book.id)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                      </td>
                    )}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
                            <BookOpen className="h-5 w-5 text-blue-600" />
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{book.title}</div>
                          <div className="text-sm text-gray-500">ISBN: {book.isbn}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {book.author}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">
                      {book.category}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {book.publishedYear}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        book.status === 'AVAILABLE' ? 'bg-green-100 text-green-800' :
                        book.status === 'BORROWED' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {book.status.charAt(0) + book.status.slice(1).toLowerCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {getBookBorrowCount(book.id)} times
                    </td>
                    {hasPermission('books:delete') && (
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => setEditingBook(book)}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteBook(book.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {filteredBooks.length === 0 && (
        <div className="text-center py-12">
          <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No books found</h3>
          <p className="text-gray-600">Try adjusting your search or filter criteria</p>
        </div>
      )}

      {/* Add Book Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-semibold mb-4">Add New Book</h2>
            <form onSubmit={(e) => {
              e.preventDefault()
              const formData = new FormData(e.target)
              handleAddBook({
                title: formData.get('title')?.toString() || '',
                author: formData.get('author')?.toString() || '',
                isbn: formData.get('isbn')?.toString() || '',
                category: formData.get('category')?.toString() || '',
                publishedYear: parseInt(formData.get('publishedYear')?.toString() || '') || new Date().getFullYear(),
                description: formData.get('description')?.toString() || null,
                coverImage: formData.get('coverImage')?.toString() || null
              })
            }}>
              <div className="space-y-4">
                <input
                  name="title"
                  placeholder="Book Title"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
                <input
                  name="author"
                  placeholder="Author"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
                <input
                  name="isbn"
                  placeholder="ISBN (e.g., 978-0-123456-78-9)"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
                <select
                  name="category"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                >
                  <option value="">Select Category</option>
                  {categories.slice(1).map(category => (
                    <option key={category} value={category}>
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </option>
                  ))}
                </select>
                <input
                  name="publishedYear"
                  type="number"
                  placeholder="Published Year"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
                <textarea
                  name="description"
                  placeholder="Description"
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
                <input
                  name="coverImage"
                  placeholder="Cover Image URL (optional)"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Add Book
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Book Modal */}
      {editingBook && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-semibold mb-4">Edit Book</h2>
            <form onSubmit={(e) => {
              e.preventDefault()
              const formData = new FormData(e.target)
              handleEditBook({
                ...editingBook,
                title: formData.get('title')?.toString() || '',
                author: formData.get('author')?.toString() || '',
                isbn: formData.get('isbn')?.toString() || '',
                category: formData.get('category')?.toString() || '',
                publishedYear: parseInt(formData.get('publishedYear')?.toString() || '') || new Date().getFullYear(),
                description: formData.get('description')?.toString() || null,
                coverImage: formData.get('coverImage')?.toString() || null,
                status: formData.get('status')?.toString() || 'AVAILABLE'
              })
            }}>
              <div className="space-y-4">
                <input
                  name="title"
                  defaultValue={editingBook.title}
                  placeholder="Book Title"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
                <input
                  name="author"
                  defaultValue={editingBook.author}
                  placeholder="Author"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
                <input
                  name="isbn"
                  defaultValue={editingBook.isbn}
                  placeholder="ISBN (e.g., 978-0-123456-78-9)"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
                <select
                  name="category"
                  defaultValue={editingBook.category}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                >
                  {categories.slice(1).map(category => (
                    <option key={category} value={category}>
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </option>
                  ))}
                </select>
                <input
                  name="publishedYear"
                  type="number"
                  defaultValue={editingBook.publishedYear}
                  placeholder="Published Year"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
                <select
                  name="status"
                  defaultValue={editingBook.status}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                >
                  <option value="AVAILABLE">Available</option>
                  <option value="BORROWED">Borrowed</option>
                  <option value="RESERVED">Reserved</option>
                </select>
                <textarea
                  name="description"
                  defaultValue={editingBook.description || ''}
                  placeholder="Description"
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
                <input
                  name="coverImage"
                  defaultValue={editingBook.coverImage || ''}
                  placeholder="Cover Image URL (optional)"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => setEditingBook(null)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Update Book
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Import/Export Modals */}
      <ImportExportModal
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
        mode="import"
      />
      <ImportExportModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        mode="export"
      />
    </div>
  )
}

export default BookCatalog