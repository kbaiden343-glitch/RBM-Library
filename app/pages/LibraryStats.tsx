'use client'

import React, { useState, useEffect } from 'react'
import { useLibrary } from '../context/LibraryContext'
import { 
  BookOpen, 
  Users, 
  BookMarked, 
  Clock, 
  TrendingUp, 
  AlertTriangle,
  Activity,
  DollarSign,
  Eye,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  Download,
  BarChart3,
  PieChart,
  Calendar,
  Star,
  Award,
  Target,
  CheckCircle,
  XCircle,
  Ban,
  Pause,
  Library,
  UserPlus,
  BookMarked,
  CalendarDays,
  TrendingDown
} from 'lucide-react'
import toast from 'react-hot-toast'

interface LibraryStats {
  books: {
    total: number
    available: number
    borrowed: number
    overdue: number
    reserved: number
    categories: { category: string; count: number }[]
    popularBooks: { title: string; borrowCount: number }[]
  }
  people: {
    total: number
    members: number
    visitors: number
    active: number
    inactive: number
    banned: number
    suspended: number
    newThisMonth: number
  }
  borrowings: {
    total: number
    active: number
    returned: number
    overdue: number
    monthly: number
    weekly: number
    today: number
    averageReturnTime: number
  }
  attendance: {
    today: number
    thisWeek: number
    thisMonth: number
    averageDaily: number
    peakHours: { hour: number; count: number }[]
  }
  reservations: {
    total: number
    pending: number
    fulfilled: number
    cancelled: number
    averageWaitTime: number
  }
  performance: {
    bookUtilizationRate: number
    memberEngagementRate: number
    averageLoanDuration: number
    returnRate: number
    satisfactionScore: number
  }
}

const LibraryStats = () => {
  const { state } = useLibrary()
  const { books, members, borrowings, reservations, attendance } = state
  const [stats, setStats] = useState<LibraryStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState('30days')
  const [viewMode, setViewMode] = useState<'overview' | 'detailed'>('overview')

  useEffect(() => {
    calculateStats()
  }, [books, members, borrowings, reservations, attendance, timeRange])

  const calculateStats = async () => {
    setLoading(true)
    try {
      // Calculate book statistics
      const availableBooks = books.filter(b => b.status === 'AVAILABLE').length
      const borrowedBooks = borrowings.filter(b => b.status === 'BORROWED').length
      const overdueBooks = borrowings.filter(b => {
        if (b.status !== 'BORROWED') return false
        const dueDate = new Date(b.dueDate)
        const today = new Date()
        return dueDate < today
      }).length

      // Calculate category distribution
      const categoryCount = books.reduce((acc, book) => {
        acc[book.category] = (acc[book.category] || 0) + 1
        return acc
      }, {} as Record<string, number>)
      
      const categories = Object.entries(categoryCount)
        .map(([category, count]) => ({ category, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10)

      // Calculate popular books (based on borrowings)
      const bookBorrowCount = borrowings.reduce((acc, borrowing) => {
        acc[borrowing.bookId] = (acc[borrowing.bookId] || 0) + 1
        return acc
      }, {} as Record<string, number>)
      
      const popularBooks = Object.entries(bookBorrowCount)
        .map(([bookId, count]) => {
          const book = books.find(b => b.id === bookId)
          return { title: book?.title || 'Unknown', borrowCount: count }
        })
        .sort((a, b) => b.borrowCount - a.borrowCount)
        .slice(0, 10)

      // Calculate people statistics
      const totalPeople = members.length
      const memberCount = members.filter(m => m.personType === 'MEMBER').length
      const visitorCount = members.filter(m => m.personType === 'VISITOR').length
      const activePeople = members.filter(m => m.status === 'ACTIVE').length
      const inactivePeople = members.filter(m => m.status === 'INACTIVE').length
      const bannedPeople = members.filter(m => m.status === 'BANNED').length
      const suspendedPeople = members.filter(m => m.status === 'SUSPENDED').length

      // Calculate new people this month
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
      const newThisMonth = members.filter(m => 
        new Date(m.createdAt) >= thirtyDaysAgo
      ).length

      // Calculate borrowing statistics
      const totalBorrowings = borrowings.length
      const activeBorrowings = borrowings.filter(b => b.status === 'BORROWED').length
      const returnedBorrowings = borrowings.filter(b => b.status === 'RETURNED').length
      
      // Monthly and weekly borrowings
      const sevenDaysAgo = new Date()
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
      const weeklyBorrowings = borrowings.filter(b => 
        new Date(b.borrowDate) >= sevenDaysAgo
      ).length

      const monthlyBorrowings = borrowings.filter(b => 
        new Date(b.borrowDate) >= thirtyDaysAgo
      ).length

      // Today's borrowings
      const today = new Date().toDateString()
      const todayBorrowings = borrowings.filter(b => 
        new Date(b.borrowDate).toDateString() === today
      ).length

      // Calculate average return time
      const returnedWithReturnDate = borrowings.filter(b => 
        b.status === 'RETURNED' && b.returnDate
      )
      const averageReturnTime = returnedWithReturnDate.length > 0 
        ? returnedWithReturnDate.reduce((sum, b) => {
            const borrowDate = new Date(b.borrowDate)
            const returnDate = new Date(b.returnDate!)
            const diffDays = Math.ceil((returnDate.getTime() - borrowDate.getTime()) / (1000 * 60 * 60 * 24))
            return sum + diffDays
          }, 0) / returnedWithReturnDate.length
        : 0

      // Calculate attendance statistics
      const todayAttendance = attendance.filter(a => 
        new Date(a.checkInTime).toDateString() === today
      ).length

      const thisWeekAttendance = attendance.filter(a => 
        new Date(a.checkInTime) >= sevenDaysAgo
      ).length

      const thisMonthAttendance = attendance.filter(a => 
        new Date(a.checkInTime) >= thirtyDaysAgo
      ).length

      const averageDailyAttendance = thisMonthAttendance / 30

      // Calculate peak hours
      const hourCount = attendance.reduce((acc, a) => {
        const hour = new Date(a.checkInTime).getHours()
        acc[hour] = (acc[hour] || 0) + 1
        return acc
      }, {} as Record<number, number>)

      const peakHours = Object.entries(hourCount)
        .map(([hour, count]) => ({ hour: parseInt(hour), count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5)

      // Calculate reservation statistics
      const totalReservations = reservations.length
      const pendingReservations = reservations.filter(r => r.status === 'WAITING').length
      const fulfilledReservations = reservations.filter(r => r.status === 'FULFILLED').length
      const cancelledReservations = reservations.filter(r => r.status === 'CANCELLED').length

      // Calculate average wait time for reservations
      const fulfilledWithDates = reservations.filter(r => 
        r.status === 'FULFILLED' && r.createdAt && r.fulfilledAt
      )
      const averageWaitTime = fulfilledWithDates.length > 0
        ? fulfilledWithDates.reduce((sum, r) => {
            const createdDate = new Date(r.createdAt!)
            const fulfilledDate = new Date(r.fulfilledAt!)
            const diffDays = Math.ceil((fulfilledDate.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24))
            return sum + diffDays
          }, 0) / fulfilledWithDates.length
        : 0

      // Calculate performance metrics
      const bookUtilizationRate = books.length > 0 ? (borrowedBooks / books.length) * 100 : 0
      const memberEngagementRate = totalPeople > 0 ? (activePeople / totalPeople) * 100 : 0
      const returnRate = totalBorrowings > 0 ? (returnedBorrowings / totalBorrowings) * 100 : 0

      const calculatedStats: LibraryStats = {
        books: {
          total: books.length,
          available: availableBooks,
          borrowed: borrowedBooks,
          overdue: overdueBooks,
          reserved: pendingReservations,
          categories,
          popularBooks
        },
        people: {
          total: totalPeople,
          members: memberCount,
          visitors: visitorCount,
          active: activePeople,
          inactive: inactivePeople,
          banned: bannedPeople,
          suspended: suspendedPeople,
          newThisMonth
        },
        borrowings: {
          total: totalBorrowings,
          active: activeBorrowings,
          returned: returnedBorrowings,
          overdue: overdueBooks,
          monthly: monthlyBorrowings,
          weekly: weeklyBorrowings,
          today: todayBorrowings,
          averageReturnTime: Math.round(averageReturnTime * 10) / 10
        },
        attendance: {
          today: todayAttendance,
          thisWeek: thisWeekAttendance,
          thisMonth: thisMonthAttendance,
          averageDaily: Math.round(averageDailyAttendance * 10) / 10,
          peakHours
        },
        reservations: {
          total: totalReservations,
          pending: pendingReservations,
          fulfilled: fulfilledReservations,
          cancelled: cancelledReservations,
          averageWaitTime: Math.round(averageWaitTime * 10) / 10
        },
        performance: {
          bookUtilizationRate: Math.round(bookUtilizationRate * 10) / 10,
          memberEngagementRate: Math.round(memberEngagementRate * 10) / 10,
          averageLoanDuration: Math.round(averageReturnTime * 10) / 10,
          returnRate: Math.round(returnRate * 10) / 10,
          satisfactionScore: Math.round((bookUtilizationRate + memberEngagementRate + returnRate) / 3 * 10) / 10
        }
      }

      setStats(calculatedStats)
    } catch (error) {
      console.error('Error calculating stats:', error)
      toast.error('Failed to calculate statistics')
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = async () => {
    await calculateStats()
    toast.success('Statistics refreshed successfully!')
  }

  const handleExport = () => {
    if (!stats) return
    
    const dataStr = JSON.stringify(stats, null, 2)
    const dataBlob = new Blob([dataStr], {type: 'application/json'})
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = `library-stats-${new Date().toISOString().split('T')[0]}.json`
    link.click()
    URL.revokeObjectURL(url)
    toast.success('Statistics exported successfully!')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin text-blue-600" />
        <span className="ml-2 text-gray-600">Calculating statistics...</span>
      </div>
    )
  }

  if (!stats) {
    return (
      <div className="text-center py-12">
        <BarChart3 className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">No statistics available</h3>
        <p className="mt-1 text-sm text-gray-500">Unable to calculate library statistics.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Library Statistics</h1>
          <p className="text-gray-600 mt-2">Comprehensive analytics for Robert Aboagye Mensah Community Library</p>
        </div>
        <div className="flex items-center space-x-3">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 text-gray-900 bg-white"
          >
            <option value="7days">Last 7 days</option>
            <option value="30days">Last 30 days</option>
            <option value="90days">Last 90 days</option>
          </select>
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('overview')}
              className={`px-3 py-1 rounded-md text-sm ${
                viewMode === 'overview' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setViewMode('detailed')}
              className={`px-3 py-1 rounded-md text-sm ${
                viewMode === 'detailed' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600'
              }`}
            >
              Detailed
            </button>
          </div>
          <button
            onClick={handleExport}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center space-x-2"
          >
            <Download className="h-4 w-4" />
            <span>Export</span>
          </button>
          <button
            onClick={handleRefresh}
            disabled={loading}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center space-x-2"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Key Performance Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-6 rounded-xl border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600">Total Books</p>
              <p className="text-3xl font-bold text-blue-900">{stats.books.total}</p>
              <p className="text-xs text-blue-700 mt-1">{stats.books.available} available</p>
            </div>
            <BookOpen className="h-12 w-12 text-blue-600 opacity-80" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-50 to-green-100 p-6 rounded-xl border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-600">Total People</p>
              <p className="text-3xl font-bold text-green-900">{stats.people.total}</p>
              <p className="text-xs text-green-700 mt-1">{stats.people.active} active</p>
            </div>
            <Users className="h-12 w-12 text-green-600 opacity-80" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-6 rounded-xl border border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-purple-600">Active Loans</p>
              <p className="text-3xl font-bold text-purple-900">{stats.borrowings.active}</p>
              <p className="text-xs text-purple-700 mt-1">{stats.borrowings.overdue} overdue</p>
            </div>
            <BookMarked className="h-12 w-12 text-purple-600 opacity-80" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-orange-50 to-orange-100 p-6 rounded-xl border border-orange-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-orange-600">Today's Visitors</p>
              <p className="text-3xl font-bold text-orange-900">{stats.attendance.today}</p>
              <p className="text-xs text-orange-700 mt-1">{stats.attendance.averageDaily}/day avg</p>
            </div>
            <Calendar className="h-12 w-12 text-orange-600 opacity-80" />
          </div>
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Target className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Book Utilization</p>
              <p className="text-xl font-bold text-gray-900">{stats.performance.bookUtilizationRate}%</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <UserPlus className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Member Engagement</p>
              <p className="text-xl font-bold text-gray-900">{stats.performance.memberEngagementRate}%</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <BookMarked className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Return Rate</p>
              <p className="text-xl font-bold text-gray-900">{stats.performance.returnRate}%</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-orange-100 rounded-lg">
              <CalendarDays className="h-6 w-6 text-orange-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Avg Loan Duration</p>
              <p className="text-xl font-bold text-gray-900">{stats.performance.averageLoanDuration} days</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Star className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Satisfaction Score</p>
              <p className="text-xl font-bold text-gray-900">{stats.performance.satisfactionScore}%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Statistics */}
      {viewMode === 'detailed' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Book Categories */}
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <PieChart className="h-5 w-5 mr-2 text-blue-600" />
              Book Categories
            </h3>
            <div className="space-y-3">
              {stats.books.categories.map((category, index) => {
                const percentage = (category.count / stats.books.total) * 100
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

          {/* People Status Breakdown */}
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Users className="h-5 w-5 mr-2 text-green-600" />
              People Status
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-600 mr-3" />
                  <span className="text-sm font-medium text-gray-700">Active</span>
                </div>
                <span className="text-lg font-bold text-green-600">{stats.people.active}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <UserPlus className="h-4 w-4 text-purple-600 mr-3" />
                  <span className="text-sm font-medium text-gray-700">Members</span>
                </div>
                <span className="text-lg font-bold text-purple-600">{stats.people.members}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Users className="h-4 w-4 text-orange-600 mr-3" />
                  <span className="text-sm font-medium text-gray-700">Visitors</span>
                </div>
                <span className="text-lg font-bold text-orange-600">{stats.people.visitors}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <XCircle className="h-4 w-4 text-gray-600 mr-3" />
                  <span className="text-sm font-medium text-gray-700">Inactive</span>
                </div>
                <span className="text-lg font-bold text-gray-600">{stats.people.inactive}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Ban className="h-4 w-4 text-red-600 mr-3" />
                  <span className="text-sm font-medium text-gray-700">Banned</span>
                </div>
                <span className="text-lg font-bold text-red-600">{stats.people.banned}</span>
              </div>
            </div>
          </div>

          {/* Borrowing Trends */}
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <TrendingUp className="h-5 w-5 mr-2 text-purple-600" />
              Borrowing Activity
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 text-blue-600 mr-3" />
                  <span className="text-sm font-medium text-gray-700">Today</span>
                </div>
                <span className="text-xl font-bold text-blue-600">{stats.borrowings.today}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div className="flex items-center">
                  <CalendarDays className="h-4 w-4 text-green-600 mr-3" />
                  <span className="text-sm font-medium text-gray-700">This Week</span>
                </div>
                <span className="text-xl font-bold text-green-600">{stats.borrowings.weekly}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 text-purple-600 mr-3" />
                  <span className="text-sm font-medium text-gray-700">This Month</span>
                </div>
                <span className="text-xl font-bold text-purple-600">{stats.borrowings.monthly}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <Clock className="h-4 w-4 text-gray-600 mr-3" />
                  <span className="text-sm font-medium text-gray-700">Avg Return Time</span>
                </div>
                <span className="text-xl font-bold text-gray-600">{stats.borrowings.averageReturnTime} days</span>
              </div>
            </div>
          </div>

          {/* Popular Books */}
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Star className="h-5 w-5 mr-2 text-yellow-600" />
              Popular Books
            </h3>
            <div className="space-y-3">
              {stats.books.popularBooks.slice(0, 5).map((book, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <span className="text-sm font-bold text-blue-600 mr-3">#{index + 1}</span>
                    <span className="text-sm text-gray-900 truncate max-w-48">{book.title}</span>
                  </div>
                  <span className="text-sm font-bold text-gray-600">{book.borrowCount} loans</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Quick Summary */}
      <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-6 rounded-xl border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Library className="h-5 w-5 mr-2 text-gray-600" />
          Library Summary
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-600">{stats.books.total}</p>
            <p className="text-sm text-gray-600">Total Books</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-green-600">{stats.people.total}</p>
            <p className="text-sm text-gray-600">Total People</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-purple-600">{stats.borrowings.total}</p>
            <p className="text-sm text-gray-600">Total Borrowings</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-orange-600">{stats.attendance.thisMonth}</p>
            <p className="text-sm text-gray-600">Monthly Visitors</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LibraryStats
