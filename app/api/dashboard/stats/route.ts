import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../lib/db'

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
      prisma.member.count(),
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

    // Get recent activities
    const recentActivities = await prisma.$queryRaw`
      SELECT 
        'borrow' as type,
        b.borrow_date as timestamp,
        m.name as member_name,
        bk.title as book_title
      FROM borrowings b
      JOIN members m ON b.member_id = m.id
      JOIN books bk ON b.book_id = bk.id
      WHERE b.borrow_date >= ${startDate}
      
      UNION ALL
      
      SELECT 
        'return' as type,
        b.return_date as timestamp,
        m.name as member_name,
        bk.title as book_title
      FROM borrowings b
      JOIN members m ON b.member_id = m.id
      JOIN books bk ON b.book_id = bk.id
      WHERE b.return_date >= ${startDate}
      
      UNION ALL
      
      SELECT 
        'attendance' as type,
        a.check_in_time as timestamp,
        m.name as member_name,
        NULL as book_title
      FROM attendance a
      JOIN members m ON a.member_id = m.id
      WHERE a.check_in_time >= ${startDate}
      
      UNION ALL
      
      SELECT 
        'reservation' as type,
        r.reservation_date as timestamp,
        m.name as member_name,
        bk.title as book_title
      FROM reservations r
      JOIN members m ON r.member_id = m.id
      JOIN books bk ON r.book_id = bk.id
      WHERE r.reservation_date >= ${startDate}
      
      ORDER BY timestamp DESC
      LIMIT 10
    `

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
