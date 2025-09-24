import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../lib/db'
import { reservationSchema } from '../../../lib/validations'

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
      where.OR = [
        { memberId: memberId },
        { personId: memberId }
      ]
    }
    
    if (bookId) {
      where.bookId = bookId
    }

    const [reservations, total] = await Promise.all([
      prisma.reservation.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          book: true,
          person: true,
          // Removed member include for better performance
        },
      }),
      prisma.reservation.count({ where }),
    ])

    return NextResponse.json({
      reservations,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Get reservations error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch reservations' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const reservationData = reservationSchema.parse(body)

    // Check if book exists
    const book = await prisma.book.findUnique({
      where: { id: reservationData.bookId },
    })

    if (!book) {
      return NextResponse.json(
        { error: 'Book not found' },
        { status: 404 }
      )
    }

    // Check if person exists and is active
    let person = null
    
    if (reservationData.personId) {
      person = await prisma.person.findUnique({
        where: { id: reservationData.personId },
      })

      if (!person) {
        return NextResponse.json(
          { error: 'Person not found' },
          { status: 404 }
        )
      }

      if (person.status !== 'ACTIVE') {
        return NextResponse.json(
          { error: 'Person is not active' },
          { status: 400 }
        )
      }
    } else if (reservationData.memberId) {
      // Legacy member support
      const member = await prisma.member.findUnique({
        where: { id: reservationData.memberId },
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
    } else {
      return NextResponse.json(
        { error: 'Person ID or Member ID is required' },
        { status: 400 }
      )
    }

    // Check if person/member already has a reservation for this book
    const existingReservation = await prisma.reservation.findFirst({
      where: {
        bookId: reservationData.bookId,
        OR: [
          { personId: reservationData.personId },
          { memberId: reservationData.memberId }
        ],
        status: 'WAITING',
      },
    })

    if (existingReservation) {
      return NextResponse.json(
        { error: 'Member already has a reservation for this book' },
        { status: 409 }
      )
    }

    // Check if person/member already has an active borrowing for this book
    const activeBorrowing = await prisma.borrowing.findFirst({
      where: {
        bookId: reservationData.bookId,
        OR: [
          { personId: reservationData.personId },
          { memberId: reservationData.memberId }
        ],
        status: 'BORROWED',
      },
    })

    if (activeBorrowing) {
      return NextResponse.json(
        { error: 'Person already has this book borrowed' },
        { status: 409 }
      )
    }

    // Create reservation record
    const reservation = await prisma.reservation.create({
      data: {
        bookId: reservationData.bookId,
        personId: reservationData.personId,
        memberId: reservationData.memberId,
      },
      include: {
        book: true,
        person: true,
        // Removed member include for better performance
      },
    })

    // Update book status if it's available
    if (book.status === 'AVAILABLE') {
      await prisma.book.update({
        where: { id: reservationData.bookId },
        data: { status: 'RESERVED' },
      })
    }

    return NextResponse.json(reservation, { status: 201 })
  } catch (error) {
    console.error('Create reservation error:', error)
    
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Invalid input data' },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to create reservation' },
      { status: 500 }
    )
  }
}
