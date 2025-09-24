import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../lib/db'
import { bookSchema } from '../../../lib/validations'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const search = searchParams.get('search') || ''
    const category = searchParams.get('category') || ''
    const status = searchParams.get('status') || ''

    const skip = (page - 1) * limit

    // Build where clause
    const where: any = {}
    
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { author: { contains: search, mode: 'insensitive' } },
        { isbn: { contains: search, mode: 'insensitive' } },
      ]
    }
    
    if (category) {
      where.category = category
    }
    
    if (status) {
      where.status = status
    }

    // Optimized to use single connection for better performance
    const books = await prisma.book.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      // Removed heavy includes for better performance
    })
    
    const total = await prisma.book.count({ where })

    return NextResponse.json({
      books,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Get books error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch books' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Transform empty strings to null for optional fields
    const transformedData = {
      ...body,
      coverImage: body.coverImage === '' ? null : body.coverImage,
      description: body.description === '' ? null : body.description,
    }
    
    // Validate the data
    const validationResult = bookSchema.safeParse(transformedData)
    if (!validationResult.success) {
      console.error('Book validation error:', validationResult.error.issues)
      return NextResponse.json(
        { 
          error: 'Invalid book data', 
          details: validationResult.error.issues.map(err => `${err.path.join('.')}: ${err.message}`)
        },
        { status: 400 }
      )
    }
    
    const bookData = validationResult.data

    // Check if ISBN already exists
    const existingBook = await prisma.book.findUnique({
      where: { isbn: bookData.isbn },
    })

    if (existingBook) {
      return NextResponse.json(
        { error: 'Book with this ISBN already exists' },
        { status: 409 }
      )
    }

    const book = await prisma.book.create({
      data: {
        ...bookData,
        coverImage: bookData.coverImage || null,
        description: bookData.description || null,
      },
      include: {
        borrowings: true,
        reservations: true,
      },
    })

    return NextResponse.json(book, { status: 201 })
  } catch (error) {
    console.error('Create book error:', error)
    
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Invalid input data' },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to create book' },
      { status: 500 }
    )
  }
}
