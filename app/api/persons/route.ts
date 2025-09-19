import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../lib/db'
import { generatePersonID } from '../../lib/idGenerator'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const search = searchParams.get('search') || ''
    const personType = searchParams.get('personType') || ''
    const status = searchParams.get('status') || ''

    const skip = (page - 1) * limit

    // Build where clause
    const where: any = {}
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } },
      ]
    }
    
    if (personType && personType !== 'all') {
      where.personType = personType
    }
    
    if (status && status !== 'all') {
      where.status = status
    }

    const [persons, total] = await Promise.all([
      prisma.person.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.person.count({ where }),
    ])

    return NextResponse.json({
      persons,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Get persons error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch persons' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, phone, address, personType, notes, emergencyContact } = body

    // Validate required fields
    if (!name || !email) {
      return NextResponse.json(
        { error: 'Name and email are required' },
        { status: 400 }
      )
    }

    // Check if person already exists (in persons table or legacy members table)
    const [existingPerson, existingMember] = await Promise.all([
      prisma.person.findUnique({
        where: { email },
      }),
      prisma.member.findUnique({
        where: { email },
      }).catch(() => null) // Handle case where members table doesn't exist
    ])

    if (existingPerson) {
      return NextResponse.json(
        { 
          error: `A ${existingPerson.personType.toLowerCase()} with email "${email}" already exists`,
          details: `Person: ${existingPerson.name} (${existingPerson.libraryId || 'No ID'})`
        },
        { status: 409 }
      )
    }

    if (existingMember) {
      return NextResponse.json(
        { 
          error: `A member with email "${email}" already exists in the legacy system`,
          details: `Member: ${existingMember.name}`
        },
        { status: 409 }
      )
    }

    // Generate unique library ID
    const libraryId = generatePersonID(personType || 'VISITOR')

    // Create person record
    const person = await prisma.person.create({
      data: {
        libraryId,
        name,
        email,
        phone: phone || null,
        address: address || null,
        personType: personType || 'VISITOR',
        notes: notes || null,
        emergencyContact: emergencyContact || null,
        membershipDate: personType === 'MEMBER' ? new Date() : null,
      },
    })

    console.log('Person created successfully:', { 
      id: person.id, 
      name: person.name, 
      email: person.email, 
      libraryId: person.libraryId,
      personType: person.personType 
    })

    return NextResponse.json(person, { status: 201 })
  } catch (error) {
    console.error('Create person error:', error)
    
    // Handle specific Prisma errors
    if (error instanceof Error) {
      if (error.message.includes('Unique constraint failed')) {
        return NextResponse.json(
          { error: 'A person with this email or library ID already exists' },
          { status: 409 }
        )
      }
      if (error.message.includes('libraryId')) {
        return NextResponse.json(
          { error: 'Library ID field is not available. Please contact system administrator.' },
          { status: 500 }
        )
      }
    }
    
    return NextResponse.json(
      { 
        error: 'Failed to create person',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
