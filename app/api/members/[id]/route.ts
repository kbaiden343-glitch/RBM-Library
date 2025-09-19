import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../lib/db'
import { updateMemberSchema } from '../../../../lib/validations'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const member = await prisma.member.findUnique({
      where: { id: params.id },
      include: {
        borrowings: {
          include: { book: true },
        },
        reservations: {
          include: { book: true },
        },
        attendance: {
          orderBy: { checkInTime: 'desc' },
        },
      },
    })

    if (!member) {
      return NextResponse.json(
        { error: 'Member not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(member)
  } catch (error) {
    console.error('Get member error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch member' },
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
    const memberData = updateMemberSchema.parse({ ...body, id: params.id })

    // Check if member exists
    const existingMember = await prisma.member.findUnique({
      where: { id: params.id },
    })

    if (!existingMember) {
      return NextResponse.json(
        { error: 'Member not found' },
        { status: 404 }
      )
    }

    // Check if email is being changed and if it already exists
    if (memberData.email && memberData.email !== existingMember.email) {
      const emailExists = await prisma.member.findUnique({
        where: { email: memberData.email },
      })

      if (emailExists) {
        return NextResponse.json(
          { error: 'Member with this email already exists' },
          { status: 409 }
        )
      }
    }

    const member = await prisma.member.update({
      where: { id: params.id },
      data: memberData,
      include: {
        borrowings: true,
        reservations: true,
        attendance: true,
      },
    })

    return NextResponse.json(member)
  } catch (error) {
    console.error('Update member error:', error)
    
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Invalid input data' },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to update member' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check if member exists
    const existingMember = await prisma.member.findUnique({
      where: { id: params.id },
      include: {
        borrowings: { where: { status: 'BORROWED' } },
        reservations: { where: { status: 'WAITING' } },
      },
    })

    if (!existingMember) {
      return NextResponse.json(
        { error: 'Member not found' },
        { status: 404 }
      )
    }

    // Check if member has active borrowings or reservations
    if (existingMember.borrowings.length > 0) {
      return NextResponse.json(
        { error: 'Cannot delete member with active borrowings' },
        { status: 400 }
      )
    }

    if (existingMember.reservations.length > 0) {
      return NextResponse.json(
        { error: 'Cannot delete member with pending reservations' },
        { status: 400 }
      )
    }

    await prisma.member.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ message: 'Member deleted successfully' })
  } catch (error) {
    console.error('Delete member error:', error)
    return NextResponse.json(
      { error: 'Failed to delete member' },
      { status: 500 }
    )
  }
}
