import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const reservation = await prisma.reservation.findUnique({
      where: { id: params.id },
      include: {
        book: true,
        person: true,
      },
    })

    if (!reservation) {
      return NextResponse.json(
        { error: 'Reservation not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(reservation)
  } catch (error) {
    console.error('Get reservation error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch reservation' },
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

    if (action === 'cancel') {
      return await cancelReservation(params.id)
    }

    if (action === 'ready') {
      return await markReservationReady(params.id)
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    )
  } catch (error) {
    console.error('Update reservation error:', error)
    return NextResponse.json(
      { error: 'Failed to update reservation' },
      { status: 500 }
    )
  }
}

async function cancelReservation(reservationId: string) {
  try {
    // Check if reservation exists
    const reservation = await prisma.reservation.findUnique({
      where: { id: reservationId },
      include: { book: true },
    })

    if (!reservation) {
      return NextResponse.json(
        { error: 'Reservation not found' },
        { status: 404 }
      )
    }

    if (reservation.status !== 'WAITING') {
      return NextResponse.json(
        { error: 'Only waiting reservations can be cancelled' },
        { status: 400 }
      )
    }

    // Update reservation status
    const updatedReservation = await prisma.reservation.update({
      where: { id: reservationId },
      data: { status: 'CANCELLED' },
      include: {
        book: true,
        person: true,
      },
    })

    // Update book status if it was reserved
    if (reservation.book.status === 'RESERVED') {
      await prisma.book.update({
        where: { id: reservation.bookId },
        data: { status: 'AVAILABLE' },
      })
    }

    return NextResponse.json(updatedReservation)
  } catch (error) {
    console.error('Cancel reservation error:', error)
    return NextResponse.json(
      { error: 'Failed to cancel reservation' },
      { status: 500 }
    )
  }
}

async function markReservationReady(reservationId: string) {
  try {
    // Check if reservation exists
    const reservation = await prisma.reservation.findUnique({
      where: { id: reservationId },
      include: { book: true },
    })

    if (!reservation) {
      return NextResponse.json(
        { error: 'Reservation not found' },
        { status: 404 }
      )
    }

    if (reservation.status !== 'WAITING') {
      return NextResponse.json(
        { error: 'Only waiting reservations can be marked as ready' },
        { status: 400 }
      )
    }

    // Update reservation status
    const updatedReservation = await prisma.reservation.update({
      where: { id: reservationId },
      data: { status: 'READY' },
      include: {
        book: true,
        person: true,
      },
    })

    return NextResponse.json(updatedReservation)
  } catch (error) {
    console.error('Mark reservation ready error:', error)
    return NextResponse.json(
      { error: 'Failed to mark reservation as ready' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check if reservation exists
    const reservation = await prisma.reservation.findUnique({
      where: { id: params.id },
      include: { book: true },
    })

    if (!reservation) {
      return NextResponse.json(
        { error: 'Reservation not found' },
        { status: 404 }
      )
    }

    // Only allow deletion of cancelled reservations
    if (reservation.status !== 'CANCELLED') {
      return NextResponse.json(
        { error: 'Cannot delete active reservation' },
        { status: 400 }
      )
    }

    await prisma.reservation.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ message: 'Reservation deleted successfully' })
  } catch (error) {
    console.error('Delete reservation error:', error)
    return NextResponse.json(
      { error: 'Failed to delete reservation' },
      { status: 500 }
    )
  }
}
