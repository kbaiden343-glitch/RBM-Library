'use client'

import React, { useState } from 'react'
import { useLibrary } from '../context/LibraryContext'
import { BarChart3, TrendingUp, Users, BookOpen, Download, Filter, Eye } from 'lucide-react'

const Reports = () => {
  const { state } = useLibrary()
  const { books, members, borrowings, attendance } = state
  const [selectedPeriod, setSelectedPeriod] = useState('30days')

  // Calculate statistics
  const totalBooks = books.length
  const totalMembers = members.length
  const activeBorrowings = borrowings.filter(b => b.status === 'borrowed').length
  const overdueBooks = borrowings.filter(b => {
    const dueDate = new Date(b.dueDate)
    const today = new Date()
    return dueDate < today && b.status === 'borrowed'
  }).length

  const today = new Date()
  const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000)
  const recentBorrowings = borrowings.filter(b => 
    new Date(b.borrowDate) >= thirtyDaysAgo
  ).length

  const recentAttendance = attendance.filter(a => 
    new Date(a.checkInTime) >= thirtyDaysAgo
  ).length

  // Category distribution
  const categoryStats = books.reduce((acc, book) => {
    acc[book.category] = (acc[book.category] || 0) + 1
    return acc
  }, {})

  const reportData = [
    {
      title: 'Library Overview',
      icon: BookOpen,
      stats: [
        { label: 'Total Books', value: totalBooks, color: 'text-blue-600' },
        { label: 'Total Members', value: totalMembers, color: 'text-green-600' },
        { label: 'Active Loans', value: activeBorrowings, color: 'text-yellow-600' },
        { label: 'Overdue Books', value: overdueBooks, color: 'text-red-600' }
      ]
    },
    {
      title: 'Activity (Last 30 Days)',
      icon: TrendingUp,
      stats: [
        { label: 'New Borrowings', value: recentBorrowings, color: 'text-blue-600' },
        { label: 'Library Visits', value: recentAttendance, color: 'text-green-600' },
        { label: 'Available Books', value: totalBooks - activeBorrowings, color: 'text-purple-600' },
        { label: 'Return Rate', value: '94%', color: 'text-orange-600' }
      ]
    }
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Reports & Analytics</h1>
          <p className="text-gray-600 mt-2">Library performance and usage statistics</p>
        </div>
        <div className="flex space-x-3">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
          >
            <option value="7days">Last 7 days</option>
            <option value="30days">Last 30 days</option>
            <option value="90days">Last 90 days</option>
            <option value="1year">Last year</option>
          </select>
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2">
            <Download className="h-5 w-5" />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {reportData.map((section, sectionIndex) => (
          <div key={sectionIndex} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center mb-4">
              <div className="p-2 bg-blue-100 rounded-lg">
                <section.icon className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 ml-3">{section.title}</h3>
            </div>
            <div className="space-y-3">
              {section.stats.map((stat, statIndex) => (
                <div key={statIndex} className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">{stat.label}</span>
                  <span className={`text-lg font-bold ${stat.color}`}>{stat.value}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Charts and Detailed Reports */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Book Categories Chart */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Books by Category</h3>
          <div className="space-y-3">
            {Object.entries(categoryStats).map(([category, count]) => {
              const percentage = (count / totalBooks) * 100
              return (
                <div key={category} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 capitalize">{category}</span>
                    <span className="font-medium text-gray-900">{count} books</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <BookOpen className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">New Book Added</p>
                  <p className="text-xs text-gray-500">"The Great Gatsby" by F. Scott Fitzgerald</p>
                </div>
              </div>
              <span className="text-xs text-gray-500">2 hours ago</span>
            </div>

            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Users className="h-4 w-4 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">New Member Registered</p>
                  <p className="text-xs text-gray-500">John Doe joined the library</p>
                </div>
              </div>
              <span className="text-xs text-gray-500">4 hours ago</span>
            </div>

            <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <TrendingUp className="h-4 w-4 text-yellow-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Book Returned</p>
                  <p className="text-xs text-gray-500">"1984" by George Orwell</p>
                </div>
              </div>
              <span className="text-xs text-gray-500">6 hours ago</span>
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Reports Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-900">Detailed Reports</h3>
            <div className="flex space-x-2">
              <button className="p-2 text-gray-400 hover:text-gray-600">
                <Filter className="h-4 w-4" />
              </button>
              <button className="p-2 text-gray-400 hover:text-gray-600">
                <Eye className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Report Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Period
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Generated
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  Borrowing Report
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  Last 30 days
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date().toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button className="text-blue-600 hover:text-blue-900">View</button>
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  Member Activity
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  Last 30 days
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date().toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button className="text-blue-600 hover:text-blue-900">View</button>
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  Overdue Books
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  Current
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date().toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button className="text-blue-600 hover:text-blue-900">View</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default Reports
