import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../lib/db'
import { attendanceSchema } from '../../../lib/validations'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const memberId = searchParams.get('memberId') || ''
    const date = searchParams.get('date') || ''

    const skip = (page - 1) * limit

    // Build where clause
    const where: any = {}
    
    if (memberId) {
      where.memberId = memberId
    }
    
    if (date) {
      const startDate = new Date(date)
      const endDate = new Date(date)
      endDate.setDate(endDate.getDate() + 1)
      
      where.checkInTime = {
        gte: startDate,
        lt: endDate,
      }
    }

    const [attendance, total] = await Promise.all([
      prisma.attendance.findMany({
        where,
        skip,
        take: limit,
        orderBy: { checkInTime: 'desc' },
        include: {
          person: true,
          // Removed member include for better performance - person is the primary model
        },
      }),
      prisma.attendance.count({ where }),
    ])

    return NextResponse.json({
      attendance,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Get attendance error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch attendance' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, personId, memberId, visitorName, visitorEmail, visitorPhone } = body

    if (action === 'check-in') {
      // Handle unified person check-in
      if (personId) {
        // New unified person check-in
        const person = await prisma.person.findUnique({
          where: { id: personId },
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

        // Check if person already checked in today without checking out
        const today = new Date()
        const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate())
        const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1)

        const existingAttendance = await prisma.attendance.findFirst({
          where: {
            personId: personId,
            checkInTime: {
              gte: startOfDay,
              lt: endOfDay,
            },
            checkOutTime: null,
          },
        })

        if (existingAttendance) {
          return NextResponse.json(
            { error: 'Person is already checked in today' },
            { status: 409 }
          )
        }

        // Create attendance record
        const attendance = await prisma.attendance.create({
          data: {
            personId: personId,
            isVisitor: person.personType === 'VISITOR',
          },
          include: {
            person: true,
          },
        })

        return NextResponse.json(attendance, { status: 201 })
      } else if (memberId) {
        // Member check-in
        const member = await prisma.member.findUnique({
          where: { id: memberId },
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

        // Check if member already checked in today without checking out
        const today = new Date()
        const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate())
        const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1)

        const existingAttendance = await prisma.attendance.findFirst({
          where: {
            memberId: memberId,
            checkInTime: {
              gte: startOfDay,
              lt: endOfDay,
            },
            checkOutTime: null,
          },
        })

        if (existingAttendance) {
          return NextResponse.json(
            { error: 'Member is already checked in today' },
            { status: 409 }
          )
        }

        // Create member attendance record
        const attendance = await prisma.attendance.create({
          data: {
            memberId: memberId,
            isVisitor: false,
          },
          include: {
            member: true,
          },
        })

        return NextResponse.json(attendance, { status: 201 })
      } else {
        // Visitor check-in
        if (!visitorName || !visitorEmail) {
          return NextResponse.json(
            { error: 'Visitor name and email are required' },
            { status: 400 }
          )
        }

        const attendance = await prisma.attendance.create({
          data: {
            visitorName,
            visitorEmail,
            visitorPhone: visitorPhone || null,
            isVisitor: true,
          },
        })

        return NextResponse.json(attendance, { status: 201 })
      }
    } else if (action === 'check-out') {
      // Handle check-out
      const today = new Date()
      const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate())
      const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1)

      let whereClause: any = {
        checkInTime: {
          gte: startOfDay,
          lt: endOfDay,
        },
        checkOutTime: null,
      }

      if (personId) {
        // New unified person check-out
        whereClause.personId = personId
      } else if (memberId) {
        // Legacy member check-out
        whereClause.memberId = memberId
      } else if (visitorEmail) {
        // Legacy visitor check-out
        whereClause.visitorEmail = visitorEmail
        whereClause.isVisitor = true
      } else {
        return NextResponse.json(
          { error: 'Person ID, Member ID, or visitor email is required for check-out' },
          { status: 400 }
        )
      }

      const attendance = await prisma.attendance.findFirst({
        where: whereClause,
        include: {
          person: true,
          // Removed member include for better performance - person is the primary model
        },
      })

      if (!attendance) {
        return NextResponse.json(
          { error: 'No active check-in found for today' },
          { status: 404 }
        )
      }

      // Update with check-out time
      const updatedAttendance = await prisma.attendance.update({
        where: { id: attendance.id },
        data: { checkOutTime: new Date() },
        include: {
          person: true,
          // Removed member include for better performance - person is the primary model
        },
      })

      return NextResponse.json(updatedAttendance, { status: 200 })
    } else {
      return NextResponse.json(
        { error: 'Invalid action. Use "check-in" or "check-out"' },
        { status: 400 }
      )
    }
  } catch (error) {
    console.error('Attendance operation error:', error)
    
    return NextResponse.json(
      { error: 'Failed to process attendance' },
      { status: 500 }
    )
  }
}
