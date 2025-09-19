import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../lib/db'
import { borrowingSchema } from '../../../lib/validations'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const status = searchParams.get('status') || ''
    const memberId = searchParams.get('memberId') || ''
    const bookId = searchParams.get('bookId') || ''

    const skip = (page - 1) * limit

    // Build where clause
    const where: any = {}
    
    if (status) {
      where.status = status
    }
    
    if (memberId) {
      where.memberId = memberId
    }
    
    if (bookId) {
      where.bookId = bookId
    }

    const [borrowings, total] = await Promise.all([
      prisma.borrowing.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          book: true,
          member: true,
        },
      }),
      prisma.borrowing.count({ where }),
    ])

    return NextResponse.json({
      borrowings,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Get borrowings error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch borrowings' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const borrowingData = borrowingSchema.parse(body)

    // Check if book exists and is available
    const book = await prisma.book.findUnique({
      where: { id: borrowingData.bookId },
    })

    if (!book) {
      return NextResponse.json(
        { error: 'Book not found' },
        { status: 404 }
      )
    }

    if (book.status !== 'AVAILABLE') {
      return NextResponse.json(
        { error: 'Book is not available for borrowing' },
        { status: 400 }
      )
    }

    // Check if member exists and is active
    const member = await prisma.member.findUnique({
      where: { id: borrowingData.memberId },
    })

    if (!member) {
      return NextResponse.json(
        { error: 'Member not found' },
        { status: 404 }
      )
    }

    if (member.status !== 'ACTIVE') {
      return NextResponse.json(
        { error: 'Member is not active' },
        { status: 400 }
      )
    }

    // Check if member has reached borrowing limit (e.g., 5 books)
    const activeBorrowings = await prisma.borrowing.count({
      where: {
        memberId: borrowingData.memberId,
        status: 'BORROWED',
      },
    })

    if (activeBorrowings >= 5) {
      return NextResponse.json(
        { error: 'Member has reached maximum borrowing limit' },
        { status: 400 }
      )
    }

    // Create borrowing record
    const borrowing = await prisma.borrowing.create({
      data: {
        bookId: borrowingData.bookId,
        memberId: borrowingData.memberId,
        dueDate: new Date(borrowingData.dueDate),
      },
      include: {
        book: true,
        member: true,
      },
    })

    // Update book status
    await prisma.book.update({
      where: { id: borrowingData.bookId },
      data: { status: 'BORROWED' },
    })

    return NextResponse.json(borrowing, { status: 201 })
  } catch (error) {
    console.error('Create borrowing error:', error)
    
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Invalid input data' },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to create borrowing' },
      { status: 500 }
    )
  }
}
