import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../lib/db'
import { updateBookSchema } from '../../../../lib/validations'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const book = await prisma.book.findUnique({
      where: { id: params.id },
      include: {
        borrowings: {
          include: { person: true },
        },
        reservations: {
          include: { person: true },
        },
      },
    })

    if (!book) {
      return NextResponse.json(
        { error: 'Book not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(book)
  } catch (error) {
    console.error('Get book error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch book' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    
    // Transform empty strings to null for optional fields
    const transformedData = {
      ...body,
      id: params.id,
      coverImage: body.coverImage === '' ? null : body.coverImage,
      description: body.description === '' ? null : body.description,
    }
    
    const bookData = updateBookSchema.parse(transformedData)

    // Check if book exists
    const existingBook = await prisma.book.findUnique({
      where: { id: params.id },
    })

    if (!existingBook) {
      return NextResponse.json(
        { error: 'Book not found' },
        { status: 404 }
      )
    }

    // Check if ISBN is being changed and if it already exists
    if (bookData.isbn && bookData.isbn !== existingBook.isbn) {
      const isbnExists = await prisma.book.findUnique({
        where: { isbn: bookData.isbn },
      })

      if (isbnExists) {
        return NextResponse.json(
          { error: 'Book with this ISBN already exists' },
          { status: 409 }
        )
      }
    }

    const book = await prisma.book.update({
      where: { id: params.id },
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

    return NextResponse.json(book)
  } catch (error) {
    console.error('Update book error:', error)
    
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Invalid input data' },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to update book' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check if book exists
    const existingBook = await prisma.book.findUnique({
      where: { id: params.id },
      include: {
        borrowings: { where: { status: 'BORROWED' } },
        reservations: { where: { status: 'WAITING' } },
      },
    })

    if (!existingBook) {
      return NextResponse.json(
        { error: 'Book not found' },
        { status: 404 }
      )
    }

    // Check if book is currently borrowed or reserved
    if (existingBook.borrowings.length > 0) {
      return NextResponse.json(
        { error: 'Cannot delete book that is currently borrowed' },
        { status: 400 }
      )
    }

    if (existingBook.reservations.length > 0) {
      return NextResponse.json(
        { error: 'Cannot delete book that has pending reservations' },
        { status: 400 }
      )
    }

    await prisma.book.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ message: 'Book deleted successfully' })
  } catch (error) {
    console.error('Delete book error:', error)
    return NextResponse.json(
      { error: 'Failed to delete book' },
      { status: 500 }
    )
  }
}
