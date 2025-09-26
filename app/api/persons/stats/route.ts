import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    // Build date filter
    const dateFilter: any = {}
    if (startDate && endDate) {
      dateFilter.createdAt = {
        gte: new Date(startDate),
        lte: new Date(endDate)
      }
    }

    // Get comprehensive statistics
    const [
      totalPeople,
      totalMembers,
      totalVisitors,
      activePeople,
      inactivePeople,
      bannedPeople,
      suspendedPeople,
      recentPeople,
      weeklyPeople,
      monthlyPeople
    ] = await Promise.all([
      // Total people
      prisma.person.count({ where: dateFilter }),
      
      // Total members
      prisma.person.count({ 
        where: { 
          ...dateFilter,
          personType: 'MEMBER' 
        } 
      }),
      
      // Total visitors
      prisma.person.count({ 
        where: { 
          ...dateFilter,
          personType: 'VISITOR' 
        } 
      }),
      
      // Active people
      prisma.person.count({ 
        where: { 
          ...dateFilter,
          status: 'ACTIVE' 
        } 
      }),
      
      // Inactive people
      prisma.person.count({ 
        where: { 
          ...dateFilter,
          status: 'INACTIVE' 
        } 
      }),
      
      // Banned people
      prisma.person.count({ 
        where: { 
          ...dateFilter,
          status: 'BANNED' 
        } 
      }),
      
      // Suspended people
      prisma.person.count({ 
        where: { 
          ...dateFilter,
          status: 'SUSPENDED' 
        } 
      }),
      
      // Recent people (last 30 days)
      prisma.person.count({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
          }
        }
      }),
      
      // Weekly people (last 7 days)
      prisma.person.count({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
          }
        }
      }),
      
      // Monthly people (last 30 days)
      prisma.person.count({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
          }
        }
      })
    ])

    // Get daily statistics for the last 7 days
    const dailyStats = await Promise.all(
      Array.from({ length: 7 }, (_, i) => {
        const date = new Date()
        date.setDate(date.getDate() - i)
        const startOfDay = new Date(date.setHours(0, 0, 0, 0))
        const endOfDay = new Date(date.setHours(23, 59, 59, 999))
        
        return prisma.person.count({
          where: {
            createdAt: {
              gte: startOfDay,
              lte: endOfDay
            }
          }
        }).then(count => ({
          date: startOfDay.toISOString().split('T')[0],
          count
        }))
      })
    )

    // Get monthly statistics for the last 12 months
    const monthlyStats = await Promise.all(
      Array.from({ length: 12 }, (_, i) => {
        const date = new Date()
        date.setMonth(date.getMonth() - i)
        const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1)
        const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0)
        
        return prisma.person.count({
          where: {
            createdAt: {
              gte: startOfMonth,
              lte: endOfMonth
            }
          }
        }).then(count => ({
          month: startOfMonth.toISOString().substring(0, 7),
          count
        }))
      })
    )

    // Calculate growth rates and insights
    const memberConversionRate = totalVisitors > 0 ? (totalMembers / (totalMembers + totalVisitors)) * 100 : 0
    const activeRate = totalPeople > 0 ? (activePeople / totalPeople) * 100 : 0
    const growthRate = totalPeople > 0 ? (recentPeople / totalPeople) * 100 : 0
    const averageDailyRegistrations = recentPeople / 30

    return NextResponse.json({
      overview: {
        totalPeople,
        totalMembers,
        totalVisitors,
        activePeople,
        inactivePeople,
        bannedPeople,
        suspendedPeople,
        recentPeople,
        weeklyPeople,
        monthlyPeople
      },
      insights: {
        memberConversionRate: Math.round(memberConversionRate * 10) / 10,
        activeRate: Math.round(activeRate * 10) / 10,
        growthRate: Math.round(growthRate * 10) / 10,
        averageDailyRegistrations: Math.round(averageDailyRegistrations * 10) / 10
      },
      trends: {
        daily: dailyStats.reverse(), // Show oldest to newest
        monthly: monthlyStats.reverse() // Show oldest to newest
      }
    })
  } catch (error) {
    console.error('Get person stats error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch person statistics' },
      { status: 500 }
    )
  }
}
