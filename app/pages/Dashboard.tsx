'use client'

import React, { useState, useEffect } from 'react'
import { useLibrary } from '../context/LibraryContext'
import { useAuth } from '../context/AuthContext'
import { useNotifications } from '../context/NotificationContext'
import { 
  BookOpen, 
  Users, 
  BookMarked, 
  Clock, 
  TrendingUp, 
  AlertTriangle,
  Plus,
  QrCode,
  Calendar,
  Star,
  RefreshCw,
  Activity,
  DollarSign,
  Eye,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react'

const Dashboard = () => {
  const { state, addBook, addMember, borrowBook, addAttendance } = useLibrary()
  const { hasPermission } = useAuth()
  const { addNotification } = useNotifications()
  const { books, members, borrowings, reservations, attendance } = state
  
  const [stats, setStats] = useState({
    totalBooks: 0,
    totalMembers: 0,
    borrowedBooks: 0,
    overdueBooks: 0,
    todayAttendance: 0,
    pendingReservations: 0,
    availableBooks: 0,
    totalBorrowings: 0,
    monthlyBorrowings: 0,
    popularCategories: [] as { category: string; count: number }[]
  })

  const [recentActivities, setRecentActivities] = useState<any[]>([])
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [timeRange, setTimeRange] = useState('7days')

  useEffect(() => {
    calculateStats()
    generateRecentActivities()
  }, [books, members, borrowings, reservations, attendance])

  const calculateStats = () => {
    const borrowed = borrowings.filter(b => b.status === 'BORROWED')
    const overdue = borrowed.filter(b => {
      const dueDate = new Date(b.dueDate)
      const today = new Date()
      return dueDate < today
    })
    
    const today = new Date().toDateString()
    const todayAtt = attendance.filter(a => 
      new Date(a.checkInTime).toDateString() === today
    )

    // Calculate monthly borrowings
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    const monthlyBorrowings = borrowings.filter(b => 
      new Date(b.borrowDate) >= thirtyDaysAgo
    ).length

    // Calculate popular categories
    const categoryCount = books.reduce((acc, book) => {
      acc[book.category] = (acc[book.category] || 0) + 1
      return acc
    }, {} as Record<string, number>)
    
    const popularCategories = Object.entries(categoryCount)
      .map(([category, count]) => ({ category, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)

    setStats({
      totalBooks: books.length,
      totalMembers: members.length,
      borrowedBooks: borrowed.length,
      overdueBooks: overdue.length,
      todayAttendance: todayAtt.length,
      pendingReservations: reservations.filter(r => r.status === 'WAITING').length,
      availableBooks: books.filter(b => b.status === 'AVAILABLE').length,
      totalBorrowings: borrowings.length,
      monthlyBorrowings,
      popularCategories
    })
  }

  const generateRecentActivities = () => {
    const activities = []
    
    // Recent borrowings
    const recentBorrowings = borrowings
      .sort((a, b) => new Date(b.borrowDate).getTime() - new Date(a.borrowDate).getTime())
      .slice(0, 5)
      .map(borrowing => {
        const book = books.find(b => b.id === borrowing.bookId)
        const member = members.find(m => m.id === (borrowing.memberId || borrowing.personId))
        return {
          type: 'borrow',
          message: `${member?.name || 'Unknown'} borrowed "${book?.title || 'Unknown Book'}"`,
          time: new Date(borrowing.borrowDate).toLocaleString(),
          icon: BookMarked,
          color: 'text-blue-600'
        }
      })

    // Recent returns
    const recentReturns = borrowings
      .filter(b => b.status === 'RETURNED' && b.returnDate)
      .sort((a, b) => new Date(b.returnDate!).getTime() - new Date(a.returnDate!).getTime())
      .slice(0, 3)
      .map(borrowing => {
        const book = books.find(b => b.id === borrowing.bookId)
        const member = members.find(m => m.id === (borrowing.memberId || borrowing.personId))
        return {
          type: 'return',
          message: `${member?.name || 'Unknown'} returned "${book?.title || 'Unknown Book'}"`,
          time: new Date(borrowing.returnDate!).toLocaleString(),
          icon: BookOpen,
          color: 'text-green-600'
        }
      })

    // Recent attendance
    const recentAttendance = attendance
      .sort((a, b) => new Date(b.checkInTime).getTime() - new Date(a.checkInTime).getTime())
      .slice(0, 3)
      .map(att => {
        const member = members.find(m => m.id === att.memberId)
        return {
          type: 'attendance',
          message: `${member?.name || 'Unknown'} checked in`,
          time: new Date(att.checkInTime).toLocaleString(),
          icon: Users,
          color: 'text-purple-600'
        }
      })

    activities.push(...recentBorrowings, ...recentReturns, ...recentAttendance)
    setRecentActivities(activities.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()).slice(0, 8))
  }

  const handleRefresh = async () => {
    setIsRefreshing(true)
    // Simulate refresh delay
    await new Promise(resolve => setTimeout(resolve, 1000))
    calculateStats()
    generateRecentActivities()
    setIsRefreshing(false)
    addNotification({
      type: 'success',
      title: 'Dashboard Refreshed',
      message: 'All statistics have been updated.'
    })
  }

  const quickActions = [
    {
      title: 'Add New Book',
      description: 'Add a new book to the catalog',
      icon: Plus,
      action: () => {
        addNotification({
          type: 'info',
          title: 'Quick Action',
          message: 'Navigate to Book Catalog to add a new book.'
        })
      },
      color: 'bg-blue-500',
      permission: 'books:write'
    },
    {
      title: 'Scan QR Code',
      description: 'Quick book checkout/return',
      icon: QrCode,
      action: () => {
        addNotification({
          type: 'info',
          title: 'Quick Action',
          message: 'Navigate to QR Scanner for quick operations.'
        })
      },
      color: 'bg-green-500',
      permission: 'scanner:use'
    },
    {
      title: 'Record Attendance',
      description: 'Log member library visit',
      icon: Calendar,
      action: () => {
        const memberId = members[0]?.id
        if (memberId) {
          addAttendance({ memberId })
        }
      },
      color: 'bg-purple-500',
      permission: 'attendance:write'
    },
    {
      title: 'View Reports',
      description: 'Generate library reports',
      icon: TrendingUp,
      action: () => {
        addNotification({
          type: 'info',
          title: 'Quick Action',
          message: 'Navigate to Reports for detailed analytics.'
        })
      },
      color: 'bg-orange-500',
      permission: 'reports:read'
    }
  ]

  const filteredQuickActions = quickActions.filter(action => hasPermission(action.permission))

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-2">Welcome to Robert Aboagye Mensah Community Library</p>
        </div>
        <div className="flex items-center space-x-3">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
          >
            <option value="7days">Last 7 days</option>
            <option value="30days">Last 30 days</option>
            <option value="90days">Last 90 days</option>
          </select>
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Books</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalBooks}</p>
              <p className="text-xs text-gray-500 mt-1">
                {stats.availableBooks} available
              </p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <BookOpen className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Members</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalMembers}</p>
              <p className="text-xs text-gray-500 mt-1">
                {stats.todayAttendance} visited today
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <Users className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Loans</p>
              <p className="text-2xl font-bold text-gray-900">{stats.borrowedBooks}</p>
              <p className="text-xs text-gray-500 mt-1">
                {stats.overdueBooks} overdue
              </p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-lg">
              <BookMarked className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Monthly Activity</p>
              <p className="text-2xl font-bold text-gray-900">{stats.monthlyBorrowings}</p>
              <p className="text-xs text-gray-500 mt-1">
                borrowings this month
              </p>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <Activity className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {filteredQuickActions.map((action, index) => {
            const Icon = action.icon
            return (
              <button
                key={index}
                onClick={action.action}
                className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow text-left group"
              >
                <div className={`p-3 ${action.color} rounded-lg inline-block mb-3 group-hover:scale-110 transition-transform`}>
                  <Icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="font-medium text-gray-900 mb-1">{action.title}</h3>
                <p className="text-sm text-gray-600">{action.description}</p>
              </button>
            )
          })}
        </div>
      </div>

      {/* Charts and Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Popular Categories */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Popular Categories</h3>
          <div className="space-y-3">
            {stats.popularCategories.map((category, index) => {
              const percentage = (category.count / stats.totalBooks) * 100
              return (
                <div key={index} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 capitalize">{category.category}</span>
                    <span className="font-medium text-gray-900">{category.count} books</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Recent Activities */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activities</h3>
          <div className="space-y-3">
            {recentActivities.length > 0 ? (
              recentActivities.map((activity, index) => {
                const Icon = activity.icon
                return (
                  <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <div className={`p-2 rounded-lg ${activity.color.replace('text-', 'bg-').replace('-600', '-100')}`}>
                      <Icon className={`h-4 w-4 ${activity.color}`} />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-900">{activity.message}</p>
                      <p className="text-xs text-gray-500">{activity.time}</p>
                    </div>
                  </div>
                )
              })
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Activity className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                <p>No recent activities</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Additional Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Overdue Books</p>
              <p className="text-2xl font-bold text-red-600">{stats.overdueBooks}</p>
            </div>
            <AlertTriangle className="h-8 w-8 text-red-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pending Reservations</p>
              <p className="text-2xl font-bold text-yellow-600">{stats.pendingReservations}</p>
            </div>
            <Clock className="h-8 w-8 text-yellow-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Borrowings</p>
              <p className="text-2xl font-bold text-blue-600">{stats.totalBorrowings}</p>
            </div>
            <TrendingUp className="h-8 w-8 text-blue-600" />
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard