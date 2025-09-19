export const generateSampleBooks = () => [
  {
    title: "The Great Gatsby",
    author: "F. Scott Fitzgerald",
    isbn: "9780743273565",
    category: "fiction",
    publishedYear: 1925,
    description: "A classic American novel about the Jazz Age",
    status: "AVAILABLE" as const
  },
  {
    title: "1984",
    author: "George Orwell",
    isbn: "9780451524935",
    category: "fiction",
    publishedYear: 1949,
    description: "A dystopian social science fiction novel",
    status: "BORROWED" as const
  },
  {
    title: "To Kill a Mockingbird",
    author: "Harper Lee",
    isbn: "9780061120084",
    category: "fiction",
    publishedYear: 1960,
    description: "A novel about racial injustice in the American South",
    status: "AVAILABLE" as const
  },
  {
    title: "A Brief History of Time",
    author: "Stephen Hawking",
    isbn: "9780553380163",
    category: "science",
    publishedYear: 1988,
    description: "A landmark volume in science writing",
    status: "AVAILABLE" as const
  },
  {
    title: "Sapiens",
    author: "Yuval Noah Harari",
    isbn: "9780062316097",
    category: "history",
    publishedYear: 2011,
    description: "A brief history of humankind",
    status: "RESERVED" as const
  },
  {
    title: "The Catcher in the Rye",
    author: "J.D. Salinger",
    isbn: "9780316769174",
    category: "fiction",
    publishedYear: 1951,
    description: "A coming-of-age story",
    status: "AVAILABLE" as const
  },
  {
    title: "Pride and Prejudice",
    author: "Jane Austen",
    isbn: "9780141439518",
    category: "fiction",
    publishedYear: 1813,
    description: "A romantic novel of manners",
    status: "BORROWED" as const
  },
  {
    title: "The Art of War",
    author: "Sun Tzu",
    isbn: "9781590309637",
    category: "philosophy",
    publishedYear: -500,
    description: "An ancient Chinese military treatise",
    status: "AVAILABLE" as const
  }
]

export const generateSampleMembers = () => [
  {
    name: "John Doe",
    email: "john.doe@email.com",
    phone: "+1234567890",
    address: "123 Main St, City, State",
    membershipDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    status: "ACTIVE" as const
  },
  {
    name: "Jane Smith",
    email: "jane.smith@email.com",
    phone: "+1234567891",
    address: "456 Oak Ave, City, State",
    membershipDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    status: "ACTIVE" as const
  },
  {
    name: "Mike Johnson",
    email: "mike.johnson@email.com",
    phone: "+1234567892",
    address: "789 Pine Rd, City, State",
    membershipDate: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
    status: "ACTIVE" as const
  },
  {
    name: "Sarah Wilson",
    email: "sarah.wilson@email.com",
    phone: "+1234567893",
    address: "321 Elm St, City, State",
    membershipDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    status: "ACTIVE" as const
  }
]

export const generateSampleBorrowings = (bookIds: string[], memberIds: string[]) => [
  {
    bookId: bookIds[1], // 1984
    memberId: memberIds[0], // John Doe
    borrowDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    dueDate: new Date(Date.now() + 9 * 24 * 60 * 60 * 1000).toISOString(),
    status: "BORROWED" as const
  },
  {
    bookId: bookIds[6], // Pride and Prejudice
    memberId: memberIds[1], // Jane Smith
    borrowDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    dueDate: new Date(Date.now() + 11 * 24 * 60 * 60 * 1000).toISOString(),
    status: "BORROWED" as const
  },
  {
    bookId: bookIds[0], // The Great Gatsby
    memberId: memberIds[2], // Mike Johnson
    borrowDate: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
    returnDate: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
    dueDate: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
    status: "returned" as const
  }
]

export const generateSampleAttendance = (memberIds: string[]) => [
  {
    memberId: memberIds[0], // John Doe
    checkInTime: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
    checkOutTime: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString() // 1 hour ago
  },
  {
    memberId: memberIds[1], // Jane Smith
    checkInTime: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString() // 4 hours ago
  },
  {
    memberId: memberIds[3], // Sarah Wilson
    checkInTime: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString() // 6 hours ago
  }
]

export const generateSampleReservations = (bookIds: string[], memberIds: string[]) => [
  {
    bookId: bookIds[4], // Sapiens
    memberId: memberIds[2], // Mike Johnson
    reservationDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    status: "waiting" as const
  }
]
