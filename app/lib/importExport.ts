export interface BookImportData {
  title: string
  author: string
  isbn: string
  category: string
  publishedYear: number
  description?: string
  status?: 'available' | 'borrowed' | 'reserved'
}

export interface ImportResult {
  success: boolean
  imported: number
  errors: string[]
  warnings: string[]
}

export const exportBooksToCSV = (books: any[]): string => {
  const headers = ['Title', 'Author', 'ISBN', 'Category', 'Published Year', 'Status', 'Description']
  const csvContent = [
    headers.join(','),
    ...books.map(book => [
      `"${book.title.replace(/"/g, '""')}"`,
      `"${book.author.replace(/"/g, '""')}"`,
      `"${book.isbn}"`,
      `"${book.category}"`,
      book.publishedYear,
      `"${book.status}"`,
      `"${(book.description || '').replace(/"/g, '""')}"`
    ].join(','))
  ].join('\n')
  
  return csvContent
}

export const exportBooksToJSON = (books: any[]): string => {
  return JSON.stringify(books, null, 2)
}

export const downloadFile = (content: string, filename: string, mimeType: string) => {
  const blob = new Blob([content], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

export const parseCSV = (csvText: string): BookImportData[] => {
  const lines = csvText.split('\n').filter(line => line.trim())
  if (lines.length < 2) return []
  
  const headers = lines[0].split(',').map(h => h.replace(/"/g, '').trim())
  const books: BookImportData[] = []
  
  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i])
    if (values.length !== headers.length) continue
    
    const book: BookImportData = {
      title: values[0] || '',
      author: values[1] || '',
      isbn: values[2] || '',
      category: values[3] || 'fiction',
      publishedYear: parseInt(values[4]) || new Date().getFullYear(),
      description: values[6] || '',
      status: (values[5] as 'available' | 'borrowed' | 'reserved') || 'available'
    }
    
    books.push(book)
  }
  
  return books
}

const parseCSVLine = (line: string): string[] => {
  const result: string[] = []
  let current = ''
  let inQuotes = false
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i]
    
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"'
        i++ // Skip next quote
      } else {
        inQuotes = !inQuotes
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim())
      current = ''
    } else {
      current += char
    }
  }
  
  result.push(current.trim())
  return result
}

export const validateBookData = (book: BookImportData): string[] => {
  const errors: string[] = []
  
  if (!book.title || book.title.trim().length === 0) {
    errors.push('Title is required')
  }
  
  if (!book.author || book.author.trim().length === 0) {
    errors.push('Author is required')
  }
  
  if (!book.category || book.category.trim().length === 0) {
    errors.push('Category is required')
  }
  
  if (!book.publishedYear || book.publishedYear < 1000 || book.publishedYear > new Date().getFullYear() + 1) {
    errors.push('Published year must be between 1000 and ' + (new Date().getFullYear() + 1))
  }
  
  if (book.isbn && book.isbn.length > 0 && !isValidISBN(book.isbn)) {
    errors.push('Invalid ISBN format')
  }
  
  return errors
}

const isValidISBN = (isbn: string): boolean => {
  // Basic ISBN validation (supports both ISBN-10 and ISBN-13)
  const cleaned = isbn.replace(/[-\s]/g, '')
  return /^(978|979)?\d{9}[\dX]$/.test(cleaned)
}

export const importBooks = (books: BookImportData[]): ImportResult => {
  const result: ImportResult = {
    success: true,
    imported: 0,
    errors: [],
    warnings: []
  }
  
  books.forEach((book, index) => {
    const errors = validateBookData(book)
    
    if (errors.length > 0) {
      result.errors.push(`Row ${index + 2}: ${errors.join(', ')}`)
      result.success = false
    } else {
      result.imported++
    }
  })
  
  if (result.imported === 0 && books.length > 0) {
    result.success = false
  }
  
  return result
}

export const generateImportTemplate = (): string => {
  const template = [
    'Title,Author,ISBN,Category,Published Year,Status,Description',
    'The Great Gatsby,F. Scott Fitzgerald,9780743273565,fiction,1925,available,A classic American novel',
    '1984,George Orwell,9780451524935,fiction,1949,available,A dystopian social science fiction novel',
    'To Kill a Mockingbird,Harper Lee,9780061120084,fiction,1960,available,A novel about racial injustice'
  ].join('\n')
  
  return template
}
