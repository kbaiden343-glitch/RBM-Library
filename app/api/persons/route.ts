import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const search = searchParams.get('search') || ''
    const personType = searchParams.get('personType') || ''
    const occupationType = searchParams.get('occupationType') || ''
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
    
    // Only filter by occupationType if the field exists in the database
    if (occupationType && occupationType !== 'all') {
      // For now, we'll skip this filter until the database is migrated
      // where.occupationType = occupationType
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
    const { name, email, phone, address, personType, occupationType, notes, emergencyContact } = body

    // Validate required fields
    if (!name || !email) {
      return NextResponse.json(
        { error: 'Name and email are required' },
        { status: 400 }
      )
    }

    // Check if person already exists (optimized to use single connection)
    const existingPerson = await prisma.person.findUnique({
      where: { email },
    })

    if (existingPerson) {
      return NextResponse.json(
        { 
          error: `A ${existingPerson.personType.toLowerCase()} with email "${email}" already exists`,
          details: `Person: ${existingPerson.name}`
        },
        { status: 409 }
      )
    }

    // Only check legacy members table if person doesn't exist
    let existingMember = null
    try {
      existingMember = await prisma.member.findUnique({
        where: { email },
      })
    } catch (error) {
      // Handle case where members table doesn't exist
      console.log('Legacy members table check skipped:', error)
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

    // Create person record
    const personData: any = {
      name,
      email,
      phone: phone || null,
      address: address || null,
      personType: personType || 'VISITOR',
      notes: notes || null,
      emergencyContact: emergencyContact || null,
      membershipDate: personType === 'MEMBER' ? new Date() : null,
    }

    // Only add occupationType if it's provided (after database migration)
    // Temporarily commented out until database migration is complete
    // if (occupationType) {
    //   personData.occupationType = occupationType
    // }

    const person = await prisma.person.create({
      data: personData,
    })

    console.log('Person created successfully:', { 
      id: person.id, 
      name: person.name, 
      email: person.email, 
      personType: person.personType 
    })

    return NextResponse.json(person, { status: 201 })
  } catch (error) {
    console.error('Create person error:', error)
    
    // Handle specific Prisma errors
    if (error instanceof Error) {
      if (error.message.includes('Unique constraint failed')) {
        return NextResponse.json(
          { error: 'A person with this email already exists' },
          { status: 409 }
        )
      }
      
      // Handle connection pool exhaustion
      if (error.message.includes('Max client connections reached') || 
          error.message.includes('connection pool')) {
        return NextResponse.json(
          { 
            error: 'Database temporarily unavailable. Please try again in a moment.',
            details: 'Connection pool limit reached'
          },
          { status: 503 }
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
