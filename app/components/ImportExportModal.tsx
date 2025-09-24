'use client'

import React, { useState, useRef } from 'react'
import { Upload, Download, FileText, Database, X, CheckCircle, AlertCircle, Info } from 'lucide-react'
import { 
  exportBooksToCSV, 
  exportBooksToJSON, 
  downloadFile, 
  parseCSV, 
  importBooks, 
  generateImportTemplate,
  BookImportData 
} from '../lib/importExport'
import { useLibrary } from '../context/LibraryContext'
import { useNotifications } from '../context/NotificationContext'

interface ImportExportModalProps {
  isOpen: boolean
  onClose: () => void
  mode: 'import' | 'export'
  onImportSuccess?: () => void
}

const ImportExportModal = ({ isOpen, onClose, mode, onImportSuccess }: ImportExportModalProps) => {
  const { state, addBook } = useLibrary()
  const { addNotification } = useNotifications()
  const [importData, setImportData] = useState<BookImportData[]>([])
  const [importResult, setImportResult] = useState<any>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      const content = e.target?.result as string
      try {
        if (file.name.endsWith('.csv')) {
          const books = parseCSV(content)
          setImportData(books)
          setImportResult(null)
        } else if (file.name.endsWith('.json')) {
          const books = JSON.parse(content)
          setImportData(books)
          setImportResult(null)
        } else {
          addNotification({
            type: 'error',
            title: 'Invalid File Format',
            message: 'Please upload a CSV or JSON file.'
          })
        }
      } catch (error) {
        addNotification({
          type: 'error',
          title: 'File Parse Error',
          message: 'Could not parse the uploaded file. Please check the format.'
        })
      }
    }
    reader.readAsText(file)
  }

  const handleImport = async () => {
    if (importData.length === 0) return

    setIsProcessing(true)
    const result = importBooks(importData)
    setImportResult(result)

    if (result.success) {
      // Import valid books
      let importedCount = 0
      for (const book of importData) {
        const errors = result.errors.filter((error: string) => 
          error.includes(`Row ${importData.indexOf(book) + 2}`)
        )
        if (errors.length === 0) {
          const bookToAdd = {
            ...book,
            status: book.status || 'AVAILABLE' as const
          }
          addBook(bookToAdd)
          importedCount++
        }
      }

      addNotification({
        type: 'success',
        title: 'Import Successful',
        message: `Successfully imported ${importedCount} books.`
      })
      
      // Refresh the book list if callback provided
      if (onImportSuccess) {
        onImportSuccess()
      }
    } else {
      addNotification({
        type: 'error',
        title: 'Import Failed',
        message: `Found ${result.errors.length} errors. Please fix them and try again.`
      })
    }

    setIsProcessing(false)
  }

  const handleExport = (format: 'csv' | 'json') => {
    const books = state.books
    const timestamp = new Date().toISOString().split('T')[0]
    
    if (format === 'csv') {
      const csvContent = exportBooksToCSV(books)
      downloadFile(csvContent, `books-export-${timestamp}.csv`, 'text/csv')
    } else {
      const jsonContent = exportBooksToJSON(books)
      downloadFile(jsonContent, `books-export-${timestamp}.json`, 'application/json')
    }

    addNotification({
      type: 'success',
      title: 'Export Successful',
      message: `Books exported as ${format.toUpperCase()} file.`
    })
  }

  const downloadTemplate = () => {
    const template = generateImportTemplate()
    downloadFile(template, 'books-import-template.csv', 'text/csv')
    
    addNotification({
      type: 'info',
      title: 'Template Downloaded',
      message: 'Import template downloaded. Use this format for importing books.'
    })
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold text-gray-900">
              {mode === 'import' ? 'Import Books' : 'Export Books'}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {mode === 'import' ? (
            <div className="space-y-6">
              {/* File Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Upload File
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-4">
                    Upload a CSV or JSON file to import books
                  </p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv,.json"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                  >
                    Choose File
                  </button>
                </div>
              </div>

              {/* Template Download */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <Info className="h-5 w-5 text-blue-600" />
                  <h3 className="font-medium text-blue-900">Need a Template?</h3>
                </div>
                <p className="text-sm text-blue-700 mb-3">
                  Download our CSV template to see the correct format for importing books.
                </p>
                <button
                  onClick={downloadTemplate}
                  className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 text-sm"
                >
                  <Download className="h-4 w-4" />
                  <span>Download Template</span>
                </button>
              </div>

              {/* Import Preview */}
              {importData.length > 0 && (
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-3">
                    Import Preview ({importData.length} books)
                  </h3>
                  <div className="border border-gray-200 rounded-lg overflow-hidden">
                    <div className="max-h-60 overflow-y-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                              Title
                            </th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                              Author
                            </th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                              Category
                            </th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                              Year
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {importData.slice(0, 10).map((book, index) => (
                            <tr key={index}>
                              <td className="px-4 py-2 text-sm text-gray-900">{book.title}</td>
                              <td className="px-4 py-2 text-sm text-gray-900">{book.author}</td>
                              <td className="px-4 py-2 text-sm text-gray-900 capitalize">{book.category}</td>
                              <td className="px-4 py-2 text-sm text-gray-900">{book.publishedYear}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      {importData.length > 10 && (
                        <div className="px-4 py-2 text-sm text-gray-500 text-center">
                          ... and {importData.length - 10} more books
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Import Results */}
              {importResult && (
                <div className={`border rounded-lg p-4 ${
                  importResult.success ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'
                }`}>
                  <div className="flex items-center space-x-2 mb-2">
                    {importResult.success ? (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    ) : (
                      <AlertCircle className="h-5 w-5 text-red-600" />
                    )}
                    <h3 className={`font-medium ${
                      importResult.success ? 'text-green-900' : 'text-red-900'
                    }`}>
                      Import {importResult.success ? 'Successful' : 'Failed'}
                    </h3>
                  </div>
                  <p className={`text-sm ${
                    importResult.success ? 'text-green-700' : 'text-red-700'
                  }`}>
                    {importResult.imported} books imported successfully
                  </p>
                  {importResult.errors.length > 0 && (
                    <div className="mt-2">
                      <p className="text-sm font-medium text-red-700 mb-1">Errors:</p>
                      <ul className="text-sm text-red-600 space-y-1">
                        {importResult.errors.slice(0, 5).map((error: string, index: number) => (
                          <li key={index}>• {error}</li>
                        ))}
                        {importResult.errors.length > 5 && (
                          <li>• ... and {importResult.errors.length - 5} more errors</li>
                        )}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {/* Import Actions */}
              <div className="flex justify-end space-x-3">
                <button
                  onClick={onClose}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </button>
                <button
                  onClick={handleImport}
                  disabled={importData.length === 0 || isProcessing}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isProcessing ? 'Importing...' : `Import ${importData.length} Books`}
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Export Options */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Choose Export Format
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <button
                    onClick={() => handleExport('csv')}
                    className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                  >
                    <FileText className="h-8 w-8 text-green-600" />
                    <div className="text-left">
                      <p className="font-medium text-gray-900">CSV Format</p>
                      <p className="text-sm text-gray-500">Compatible with Excel, Google Sheets</p>
                    </div>
                  </button>
                  <button
                    onClick={() => handleExport('json')}
                    className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                  >
                    <Database className="h-8 w-8 text-blue-600" />
                    <div className="text-left">
                      <p className="font-medium text-gray-900">JSON Format</p>
                      <p className="text-sm text-gray-500">Machine-readable format</p>
                    </div>
                  </button>
                </div>
              </div>

              {/* Export Info */}
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-2">Export Information</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Total books to export: {state.books.length}</li>
                  <li>• Available books: {state.books.filter(b => b.status === 'AVAILABLE').length}</li>
                  <li>• Borrowed books: {state.books.filter(b => b.status === 'BORROWED').length}</li>
                  <li>• Reserved books: {state.books.filter(b => b.status === 'RESERVED').length}</li>
                </ul>
              </div>

              {/* Export Actions */}
              <div className="flex justify-end space-x-3">
                <button
                  onClick={onClose}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Close
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ImportExportModal
