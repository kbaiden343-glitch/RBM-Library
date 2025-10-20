import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../lib/db'
import { returnBookSchema } from '../../../../lib/validations'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const borrowing = await prisma.borrowing.findUnique({
      where: { id: params.id },
      include: {
        book: true,
        person: true,
      },
    })

    if (!borrowing) {
      return NextResponse.json(
        { error: 'Borrowing record not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(borrowing)
  } catch (error) {
    console.error('Get borrowing error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch borrowing' },
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
    const { action } = body

    if (action === 'return') {
      return await returnBook(params.id)
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    )
  } catch (error) {
    console.error('Update borrowing error:', error)
    return NextResponse.json(
      { error: 'Failed to update borrowing' },
      { status: 500 }
    )
  }
}

async function returnBook(borrowingId: string) {
  try {
    // Check if borrowing exists and is not already returned
    const borrowing = await prisma.borrowing.findUnique({
      where: { id: borrowingId },
      include: { book: true },
    })

    if (!borrowing) {
      return NextResponse.json(
        { error: 'Borrowing record not found' },
        { status: 404 }
      )
    }

    if (borrowing.status === 'RETURNED') {
      return NextResponse.json(
        { error: 'Book has already been returned' },
        { status: 400 }
      )
    }

    // Update borrowing record
    const updatedBorrowing = await prisma.borrowing.update({
      where: { id: borrowingId },
      data: {
        status: 'RETURNED',
        returnDate: new Date(),
      },
      include: {
        book: true,
        person: true,
      },
    })

    // Update book status
    await prisma.book.update({
      where: { id: borrowing.bookId },
      data: { status: 'AVAILABLE' },
    })

    return NextResponse.json(updatedBorrowing)
  } catch (error) {
    console.error('Return book error:', error)
    return NextResponse.json(
      { error: 'Failed to return book' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check if borrowing exists
    const borrowing = await prisma.borrowing.findUnique({
      where: { id: params.id },
    })

    if (!borrowing) {
      return NextResponse.json(
        { error: 'Borrowing record not found' },
        { status: 404 }
      )
    }

    // Only allow deletion of returned borrowings
    if (borrowing.status !== 'RETURNED') {
      return NextResponse.json(
        { error: 'Cannot delete active borrowing' },
        { status: 400 }
      )
    }

    await prisma.borrowing.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ message: 'Borrowing record deleted successfully' })
  } catch (error) {
    console.error('Delete borrowing error:', error)
    return NextResponse.json(
      { error: 'Failed to delete borrowing' },
      { status: 500 }
    )
  }
}
