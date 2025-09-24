'use client'

import React, { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Clock, 
  Calendar,
  Download,
  Filter,
  RefreshCw,
  AlertCircle,
  Award,
  Target,
  PieChart
} from 'lucide-react'
import toast from 'react-hot-toast'

interface AttendanceStats {
  period: string
  dateRange: {
    start: string
    end: string
  }
  summary: {
    totalVisits: number
    activeVisitors: number
    averageDuration: number
    completedVisits: number
  }
  dailyStats: Record<string, number>
  hourlyStats: Record<string, number>
  typeBreakdown: Array<{
    type: string
    count: number
  }>
  topVisitors: Array<{
    id: string
    name: string
    email: string
    type: string
    visits: number
  }>
}

const AttendanceTracking = () => {
  const { hasPermission } = useAuth()
  const [stats, setStats] = useState<AttendanceStats | null>(null)
  const [loading, setLoading] = useState(false)
  const [period, setPeriod] = useState('week')
  const [customStartDate, setCustomStartDate] = useState('')
  const [customEndDate, setCustomEndDate] = useState('')

  // Check permissions
  if (!hasPermission('attendance:read')) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600">You need appropriate privileges to view attendance analytics.</p>
        </div>
      </div>
    )
  }

  useEffect(() => {
    fetchStats()
  }, [period])

  const fetchStats = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('token')
      
      let url = `/api/attendance/stats?period=${period}`
      if (customStartDate && customEndDate) {
        url += `&startDate=${customStartDate}&endDate=${customEndDate}`
      }

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setStats(data)
      } else {
        toast.error('Failed to fetch attendance statistics')
      }
    } catch (error) {
      console.error('Error fetching attendance stats:', error)
      toast.error('Failed to fetch attendance statistics')
    } finally {
      setLoading(false)
    }
  }

  const exportReport = async (format: 'pdf' | 'excel') => {
    toast.success(`Exporting ${format.toUpperCase()} report...`)
    // TODO: Implement actual export functionality
  }

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`
  }

  const getTopHours = () => {
    if (!stats?.hourlyStats) return []
    
    return Object.entries(stats.hourlyStats)
      .map(([hour, count]) => ({
        hour: parseInt(hour),
        count,
        timeSlot: `${hour}:00 - ${parseInt(hour) + 1}:00`
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)
  }

  const getDailyChartData = () => {
    if (!stats?.dailyStats) return []
    
    return Object.entries(stats.dailyStats)
      .map(([date, count]) => ({
        date: new Date(date).toLocaleDateString('en-US', { 
          month: 'short', 
          day: 'numeric' 
        }),
        visits: count
      }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900">📊 Attendance Analytics</h1>
          <p className="text-sm sm:text-base lg:text-lg text-gray-600 mt-1 sm:mt-2">Track patterns, insights, and generate reports</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 text-base w-full sm:w-auto"
          >
            <option value="week">Last 7 Days</option>
            <option value="month">Last 30 Days</option>
            <option value="year">Last Year</option>
            <option value="custom">Custom Range</option>
          </select>
          
          {period === 'custom' && (
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="date"
                value={customStartDate}
                onChange={(e) => setCustomStartDate(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 text-base w-full sm:w-auto"
              />
              <input
                type="date"
                value={customEndDate}
                onChange={(e) => setCustomEndDate(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 text-base w-full sm:w-auto"
              />
            </div>
          )}
          
          <button
            onClick={fetchStats}
            className="flex items-center justify-center space-x-2 px-3 sm:px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm sm:text-base w-full sm:w-auto"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600 mt-4">Loading analytics...</p>
        </div>
      ) : stats ? (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Visits</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.summary.totalVisits}</p>
                </div>
                <div className="bg-blue-100 rounded-full p-3">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
              </div>
              <div className="mt-4">
                <span className="text-sm text-gray-500">
                  {period === 'week' ? 'Past 7 days' : 
                   period === 'month' ? 'Past 30 days' : 
                   period === 'year' ? 'Past year' : 'Custom period'}
                </span>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Currently In Library</p>
                  <p className="text-3xl font-bold text-green-600">{stats.summary.activeVisitors}</p>
                </div>
                <div className="bg-green-100 rounded-full p-3">
                  <Target className="h-6 w-6 text-green-600" />
                </div>
              </div>
              <div className="mt-4">
                <span className="text-sm text-gray-500">Right now</span>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Avg. Visit Duration</p>
                  <p className="text-3xl font-bold text-purple-600">
                    {formatDuration(stats.summary.averageDuration)}
                  </p>
                </div>
                <div className="bg-purple-100 rounded-full p-3">
                  <Clock className="h-6 w-6 text-purple-600" />
                </div>
              </div>
              <div className="mt-4">
                <span className="text-sm text-gray-500">Completed visits only</span>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Completed Visits</p>
                  <p className="text-3xl font-bold text-orange-600">{stats.summary.completedVisits}</p>
                </div>
                <div className="bg-orange-100 rounded-full p-3">
                  <Award className="h-6 w-6 text-orange-600" />
                </div>
              </div>
              <div className="mt-4">
                <span className="text-sm text-gray-500">
                  {Math.round((stats.summary.completedVisits / stats.summary.totalVisits) * 100)}% completion rate
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Daily Attendance Chart */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">📈 Daily Attendance Trend</h2>
                <BarChart3 className="h-5 w-5 text-gray-400" />
              </div>
              
              <div className="space-y-4">
                {getDailyChartData().slice(-7).map((day, index) => (
                  <div key={day.date} className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700 w-20">{day.date}</span>
                    <div className="flex-1 mx-4">
                      <div className="bg-gray-200 rounded-full h-4 relative overflow-hidden">
                        <div 
                          className="bg-blue-600 h-full rounded-full transition-all duration-500"
                          style={{ 
                            width: `${Math.max((day.visits / Math.max(...getDailyChartData().map(d => d.visits))) * 100, 5)}%` 
                          }}
                        />
                      </div>
                    </div>
                    <span className="text-sm font-bold text-gray-900 w-12 text-right">{day.visits}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Visitors */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">🏆 Most Frequent Visitors</h2>
                <Award className="h-5 w-5 text-gray-400" />
              </div>
              
              <div className="space-y-3">
                {stats.topVisitors.slice(0, 8).map((visitor, index) => (
                  <div key={visitor.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                        index === 0 ? 'bg-yellow-100 text-yellow-800' :
                        index === 1 ? 'bg-gray-100 text-gray-800' :
                        index === 2 ? 'bg-orange-100 text-orange-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {index + 1}
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">{visitor.name}</div>
                        <div className="text-xs text-gray-500">{visitor.type}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold text-gray-900">{visitor.visits} visits</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Peak Hours */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">🕐 Peak Hours Analysis</h2>
                <Clock className="h-5 w-5 text-gray-400" />
              </div>
              
              <div className="space-y-3">
                {getTopHours().map((slot, index) => (
                  <div key={slot.hour} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                        index === 0 ? 'bg-red-100 text-red-800' :
                        index === 1 ? 'bg-orange-100 text-orange-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {index + 1}
                      </div>
                      <span className="text-sm font-medium text-gray-700">{slot.timeSlot}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-20 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ 
                            width: `${(slot.count / getTopHours()[0]?.count) * 100}%` 
                          }}
                        />
                      </div>
                      <span className="text-sm font-bold text-gray-900 w-8">{slot.count}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Visitor Type Breakdown */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">👥 Visitor Type Breakdown</h2>
                <PieChart className="h-5 w-5 text-gray-400" />
              </div>
              
              <div className="space-y-4">
                {stats.typeBreakdown.map((type) => {
                  const percentage = Math.round((type.count / stats!.summary.totalVisits) * 100)
                  return (
                    <div key={type.type} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700">{type.type}s</span>
                        <span className="text-sm font-bold text-gray-900">{type.count} ({percentage}%)</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div 
                          className={`h-3 rounded-full transition-all duration-500 ${
                            type.type === 'Member' ? 'bg-blue-600' : 'bg-green-600'
                          }`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>

              {stats.typeBreakdown.length === 0 && (
                <div className="text-center py-8">
                  <PieChart className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No visitor data available for this period</p>
                </div>
              )}
            </div>
          </div>

          {/* Export Section */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">📄 Export Reports</h2>
              <Download className="h-5 w-5 text-gray-400" />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button
                onClick={() => exportReport('pdf')}
                className="flex items-center justify-center space-x-2 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                <Download className="h-4 w-4" />
                <span>Export PDF Report</span>
              </button>
              
              <button
                onClick={() => exportReport('excel')}
                className="flex items-center justify-center space-x-2 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Download className="h-4 w-4" />
                <span>Export Excel Data</span>
              </button>
              
              <button
                onClick={() => {
                  const data = JSON.stringify(stats, null, 2)
                  const blob = new Blob([data], { type: 'application/json' })
                  const url = URL.createObjectURL(blob)
                  const a = document.createElement('a')
                  a.href = url
                  a.download = `attendance-data-${new Date().toISOString().split('T')[0]}.json`
                  a.click()
                  URL.revokeObjectURL(url)
                  toast.success('JSON data downloaded!')
                }}
                className="flex items-center justify-center space-x-2 px-4 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                <Download className="h-4 w-4" />
                <span>Export JSON Data</span>
              </button>
            </div>
          </div>

          {/* Insights & Recommendations */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">💡 Insights & Recommendations</h2>
              <TrendingUp className="h-5 w-5 text-gray-400" />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-800">📊 Key Insights</h3>
                <div className="space-y-3">
                  <div className="flex items-start space-x-2">
                    <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                    <p className="text-sm text-gray-700">
                      <span className="font-semibold">Busiest time:</span> {getTopHours()[0]?.timeSlot || 'No data'} 
                      ({getTopHours()[0]?.count || 0} visits)
                    </p>
                  </div>
                  <div className="flex items-start space-x-2">
                    <div className="w-2 h-2 bg-green-600 rounded-full mt-2"></div>
                    <p className="text-sm text-gray-700">
                      <span className="font-semibold">Completion rate:</span> {
                        Math.round((stats.summary.completedVisits / stats.summary.totalVisits) * 100)
                      }% of visitors properly sign out
                    </p>
                  </div>
                  <div className="flex items-start space-x-2">
                    <div className="w-2 h-2 bg-purple-600 rounded-full mt-2"></div>
                    <p className="text-sm text-gray-700">
                      <span className="font-semibold">Average stay:</span> {formatDuration(stats.summary.averageDuration)} per visit
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-800">🎯 Recommendations</h3>
                <div className="space-y-3">
                  {stats.summary.completedVisits / stats.summary.totalVisits < 0.8 && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                      <p className="text-sm text-yellow-800">
                        <span className="font-semibold">⚠️ Low sign-out rate:</span> Consider reminding visitors to sign out when leaving.
                      </p>
                    </div>
                  )}
                  
                  {getTopHours().length > 0 && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                      <p className="text-sm text-blue-800">
                        <span className="font-semibold">📊 Peak hours:</span> Consider having more staff during {getTopHours()[0]?.timeSlot} for better service.
                      </p>
                    </div>
                  )}
                  
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                    <p className="text-sm text-green-800">
                      <span className="font-semibold">✅ Good attendance:</span> {stats.summary.totalVisits} total visits show healthy library usage.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="text-center py-12">
          <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No data available</h3>
          <p className="text-gray-600">Try selecting a different time period or check if there are attendance records.</p>
        </div>
      )}
    </div>
  )
}

export default AttendanceTracking
