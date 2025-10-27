import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const timeRange = searchParams.get('timeRange') || '7days'

    // Calculate date range
    const now = new Date()
    let startDate = new Date()

    switch (timeRange) {
      case '7days':
        startDate.setDate(now.getDate() - 7)
        break
      case '30days':
        startDate.setMonth(now.getMonth() - 1)
        break
      case '90days':
        startDate.setMonth(now.getMonth() - 3)
        break
      default:
        startDate.setDate(now.getDate() - 7)
    }

    // Get basic counts
    const [
      totalBooks,
      totalMembers,
      activeBorrowings,
      overdueBorrowings,
      pendingReservations,
      todayAttendance,
    ] = await Promise.all([
      prisma.book.count(),
      prisma.person.count(),
      prisma.borrowing.count({
        where: { status: 'BORROWED' },
      }),
      prisma.borrowing.count({
        where: {
          status: 'BORROWED',
          dueDate: { lt: now },
        },
      }),
      prisma.reservation.count({
        where: { status: 'WAITING' },
      }),
      prisma.attendance.count({
        where: {
          checkInTime: {
            gte: new Date(now.getFullYear(), now.getMonth(), now.getDate()),
            lt: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1),
          },
        },
      }),
    ])

    // Get recent activity counts
    const [
      recentBorrowings,
      recentReturns,
      recentAttendance,
      recentReservations,
    ] = await Promise.all([
      prisma.borrowing.count({
        where: {
          borrowDate: { gte: startDate },
        },
      }),
      prisma.borrowing.count({
        where: {
          returnDate: { gte: startDate },
        },
      }),
      prisma.attendance.count({
        where: {
          checkInTime: { gte: startDate },
        },
      }),
      prisma.reservation.count({
        where: {
          reservationDate: { gte: startDate },
        },
      }),
    ])

    // Get popular categories
    const categoryStats = await prisma.book.groupBy({
      by: ['category'],
      _count: {
        category: true,
      },
      orderBy: {
        _count: {
          category: 'desc',
        },
      },
      take: 5,
    })

    const popularCategories = categoryStats.map(stat => ({
      name: stat.category,
      count: stat._count.category,
      percentage: totalBooks > 0 ? ((stat._count.category / totalBooks) * 100).toFixed(1) : '0.0',
    }))

    // Get recent activities using Prisma instead of raw SQL
    const recentActivities = []

    const stats = {
      totalBooks,
      availableBooks: totalBooks - activeBorrowings,
      totalMembers,
      activeLoans: activeBorrowings,
      overdueBooks: overdueBorrowings,
      todayAttendance,
      pendingReservations,
      recentBorrowings,
      recentReturns,
      recentAttendance,
      recentReservations,
      popularCategories,
      recentActivities,
    }

    return NextResponse.json(stats)
  } catch (error) {
    console.error('Get dashboard stats error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch dashboard statistics' },
      { status: 500 }
    )
  }
}
