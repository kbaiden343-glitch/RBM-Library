import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const person = await prisma.person.findUnique({
      where: { id: params.id },
      include: {
        attendance: {
          orderBy: { checkInTime: 'desc' },
          take: 10,
        },
        borrowings: {
          include: { book: true },
          orderBy: { createdAt: 'desc' },
          take: 5,
        },
        reservations: {
          include: { book: true },
          orderBy: { createdAt: 'desc' },
          take: 5,
        },
      },
    })

    if (!person) {
      return NextResponse.json(
        { error: 'Person not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(person)
  } catch (error) {
    console.error('Get person error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch person' },
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
    const { name, email, phone, address, personType, occupationType, status, notes, emergencyContact } = body

    // Check if person exists
    const existingPerson = await prisma.person.findUnique({
      where: { id: params.id },
    })

    if (!existingPerson) {
      return NextResponse.json(
        { error: 'Person not found' },
        { status: 404 }
      )
    }

    // Check if email is already taken by another person
    if (email !== existingPerson.email) {
      const emailExists = await prisma.person.findUnique({
        where: { email },
      })

      if (emailExists) {
        return NextResponse.json(
          { error: 'Email is already taken by another person' },
          { status: 409 }
        )
      }
    }

    // Update person
    const updateData: any = {
      name: name || existingPerson.name,
      email: email || existingPerson.email,
      phone: phone !== undefined ? phone : existingPerson.phone,
      address: address !== undefined ? address : existingPerson.address,
      personType: personType || existingPerson.personType,
      status: status || existingPerson.status,
      notes: notes !== undefined ? notes : existingPerson.notes,
      emergencyContact: emergencyContact !== undefined ? emergencyContact : existingPerson.emergencyContact,
      membershipDate: personType === 'MEMBER' && !existingPerson.membershipDate 
        ? new Date() 
        : existingPerson.membershipDate,
    }

    // Only update occupationType if it's provided (after database migration)
    // Temporarily commented out until database migration is complete
    // if (occupationType) {
    //   updateData.occupationType = occupationType
    // }

    const person = await prisma.person.update({
      where: { id: params.id },
      data: updateData,
    })

    return NextResponse.json(person)
  } catch (error) {
    console.error('Update person error:', error)
    return NextResponse.json(
      { error: 'Failed to update person' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check if person exists
    const person = await prisma.person.findUnique({
      where: { id: params.id },
    })

    if (!person) {
      return NextResponse.json(
        { error: 'Person not found' },
        { status: 404 }
      )
    }

    // Delete person (cascade will handle related records)
    await prisma.person.delete({
      where: { id: params.id },
    })

    return NextResponse.json(
      { message: 'Person deleted successfully' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Delete person error:', error)
    return NextResponse.json(
      { error: 'Failed to delete person' },
      { status: 500 }
    )
  }
}
