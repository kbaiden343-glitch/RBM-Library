const fetch = require('node-fetch').default

async function testAPI() {
  try {
    console.log('Testing API endpoints...')
    
    // 1. Login to get token
    console.log('1. Logging in...')
    const loginResponse = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin', password: 'password' })
    })
    
    const loginData = await loginResponse.json()
    console.log('Login successful:', loginData.user.email)
    
    const token = loginData.token
    
    // 2. Test adding a book
    console.log('2. Testing book creation...')
    const bookData = {
      title: 'Test Book',
      author: 'Test Author',
      isbn: '1234567890',
      category: 'fiction',
      publishedYear: 2023,
      description: 'A test book'
    }
    
    const bookResponse = await fetch('http://localhost:3000/api/books', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(bookData)
    })
    
    if (bookResponse.ok) {
      const newBook = await bookResponse.json()
      console.log('Book created successfully:', newBook.title)
      
      // 3. Test deleting the book
      console.log('3. Testing book deletion...')
      const deleteResponse = await fetch(`http://localhost:3000/api/books/${newBook.id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      })
      
      if (deleteResponse.ok) {
        console.log('Book deleted successfully')
      } else {
        console.log('Delete failed:', await deleteResponse.text())
      }
    } else {
      console.log('Book creation failed:', await bookResponse.text())
    }
    
  } catch (error) {
    console.error('Test failed:', error.message)
  }
}

testAPI()
