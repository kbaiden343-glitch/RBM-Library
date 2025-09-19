import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const period = searchParams.get('period') || 'week' // week, month, year
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    // Calculate date range based on period
    let dateRange: { gte: Date; lt: Date }
    const now = new Date()

    if (startDate && endDate) {
      dateRange = {
        gte: new Date(startDate),
        lt: new Date(endDate)
      }
    } else {
      switch (period) {
        case 'week':
          const weekStart = new Date(now)
          weekStart.setDate(now.getDate() - 7)
          dateRange = { gte: weekStart, lt: now }
          break
        case 'month':
          const monthStart = new Date(now)
          monthStart.setMonth(now.getMonth() - 1)
          dateRange = { gte: monthStart, lt: now }
          break
        case 'year':
          const yearStart = new Date(now)
          yearStart.setFullYear(now.getFullYear() - 1)
          dateRange = { gte: yearStart, lt: now }
          break
        default:
          const defaultStart = new Date(now)
          defaultStart.setDate(now.getDate() - 7)
          dateRange = { gte: defaultStart, lt: now }
      }
    }

    // Get total attendance count for the period
    const totalAttendance = await prisma.attendance.count({
      where: {
        checkInTime: dateRange
      }
    })

    // Get daily attendance breakdown
    const dailyAttendance = await prisma.attendance.groupBy({
      by: ['checkInTime'],
      where: {
        checkInTime: dateRange
      },
      _count: {
        id: true
      },
      orderBy: {
        checkInTime: 'asc'
      }
    })

    // Process daily data
    const dailyStats = dailyAttendance.reduce((acc: any, record) => {
      const date = new Date(record.checkInTime).toISOString().split('T')[0]
      if (!acc[date]) {
        acc[date] = 0
      }
      acc[date] += record._count.id
      return acc
    }, {})

    // Get attendance by person type
    const attendanceByType = await prisma.attendance.groupBy({
      by: ['isVisitor'],
      where: {
        checkInTime: dateRange
      },
      _count: {
        id: true
      }
    })

    // Get top visitors
    const topVisitors = await prisma.attendance.groupBy({
      by: ['personId', 'memberId'],
      where: {
        checkInTime: dateRange,
        OR: [
          { personId: { not: null } },
          { memberId: { not: null } }
        ]
      },
      _count: {
        id: true
      },
      orderBy: {
        _count: {
          id: 'desc'
        }
      },
      take: 10
    })

    // Get detailed info for top visitors
    const visitorIds = topVisitors
      .filter(v => v.personId)
      .map(v => v.personId!)
    const memberIds = topVisitors
      .filter(v => v.memberId)
      .map(v => v.memberId!)

    const [persons, members] = await Promise.all([
      visitorIds.length > 0 ? prisma.person.findMany({
        where: { id: { in: visitorIds } },
        select: { id: true, name: true, email: true, personType: true }
      }) : [],
      memberIds.length > 0 ? prisma.member.findMany({
        where: { id: { in: memberIds } },
        select: { id: true, name: true, email: true }
      }) : []
    ])

    const topVisitorsWithDetails = topVisitors.map(visitor => {
      const person = persons.find(p => p.id === visitor.personId)
      const member = members.find(m => m.id === visitor.memberId)
      
      return {
        id: visitor.personId || visitor.memberId,
        name: person?.name || member?.name || 'Unknown',
        email: person?.email || member?.email || 'Unknown',
        type: person?.personType || 'Member',
        visits: visitor._count.id
      }
    })

    // Get hourly distribution
    const hourlyAttendance = await prisma.attendance.findMany({
      where: {
        checkInTime: dateRange
      },
      select: {
        checkInTime: true
      }
    })

    const hourlyStats = hourlyAttendance.reduce((acc: any, record) => {
      const hour = new Date(record.checkInTime).getHours()
      acc[hour] = (acc[hour] || 0) + 1
      return acc
    }, {})

    // Calculate average visit duration
    const completedVisits = await prisma.attendance.findMany({
      where: {
        checkInTime: dateRange,
        checkOutTime: { not: null }
      },
      select: {
        checkInTime: true,
        checkOutTime: true
      }
    })

    const avgDuration = completedVisits.length > 0
      ? completedVisits.reduce((sum, visit) => {
          const duration = new Date(visit.checkOutTime!).getTime() - new Date(visit.checkInTime).getTime()
          return sum + duration
        }, 0) / completedVisits.length
      : 0

    // Get current active visitors
    const today = new Date()
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate())
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1)

    const activeVisitors = await prisma.attendance.count({
      where: {
        checkInTime: {
          gte: startOfDay,
          lt: endOfDay
        },
        checkOutTime: null
      }
    })

    return NextResponse.json({
      period,
      dateRange: {
        start: dateRange.gte.toISOString(),
        end: dateRange.lt.toISOString()
      },
      summary: {
        totalVisits: totalAttendance,
        activeVisitors,
        averageDuration: Math.round(avgDuration / (1000 * 60)), // in minutes
        completedVisits: completedVisits.length
      },
      dailyStats,
      hourlyStats,
      typeBreakdown: attendanceByType.map(type => ({
        type: type.isVisitor ? 'Visitor' : 'Member',
        count: type._count.id
      })),
      topVisitors: topVisitorsWithDetails
    })
  } catch (error) {
    console.error('Get attendance stats error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch attendance statistics' },
      { status: 500 }
    )
  }
}
