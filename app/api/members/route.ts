import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../lib/db'
import { memberSchema } from '../../../lib/validations'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const search = searchParams.get('search') || ''
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
    
    if (status) {
      where.status = status
    }

    const [members, total] = await Promise.all([
      prisma.member.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          borrowings: {
            where: { status: 'BORROWED' },
            include: { book: true },
          },
          reservations: {
            where: { status: 'WAITING' },
            include: { book: true },
          },
          attendance: {
            orderBy: { checkInTime: 'desc' },
            take: 5,
          },
        },
      }),
      prisma.member.count({ where }),
    ])

    return NextResponse.json({
      members,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Get members error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch members' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const memberData = memberSchema.parse(body)

    // Check if member already exists
    const existingMember = await prisma.member.findUnique({
      where: { email: memberData.email },
    })

    if (existingMember) {
      return NextResponse.json(
        { error: 'Member with this email already exists' },
        { status: 409 }
      )
    }

    const member = await prisma.member.create({
      data: {
        ...memberData,
        status: memberData.status || 'ACTIVE',
      },
      include: {
        borrowings: true,
        reservations: true,
        attendance: true,
      },
    })

    return NextResponse.json(member, { status: 201 })
  } catch (error) {
    console.error('Create member error:', error)
    
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Invalid input data' },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to create member' },
      { status: 500 }
    )
  }
}
