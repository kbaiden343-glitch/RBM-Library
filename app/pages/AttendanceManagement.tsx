'use client'

import React, { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { 
  Users, 
  Search, 
  UserPlus, 
  LogIn, 
  LogOut, 
  Clock, 
  UserCheck, 
  AlertCircle,
  Calendar,
  Filter,
  Plus
} from 'lucide-react'
import toast from 'react-hot-toast'

interface Person {
  id: string
  name: string
  email: string
  phone?: string
  address?: string
  personType: 'MEMBER' | 'VISITOR' | 'VIP' | 'STUDENT' | 'STAFF'
  status: 'ACTIVE' | 'INACTIVE' | 'BANNED' | 'SUSPENDED'
}

interface AttendanceRecord {
  id: string
  personId?: string
  memberId?: string
  visitorName?: string
  visitorEmail?: string
  visitorPhone?: string
  checkInTime: string
  checkOutTime?: string
  isVisitor: boolean
  person?: Person
  member?: any
}

const AttendanceManagement = () => {
  const { hasPermission } = useAuth()
  const [persons, setPersons] = useState<Person[]>([])
  const [todayAttendance, setTodayAttendance] = useState<AttendanceRecord[]>([])
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [showAddPersonModal, setShowAddPersonModal] = useState(false)

  // Check if user has librarian or admin permissions
  if (!hasPermission('manage_attendance')) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600">You need librarian privileges to access attendance management.</p>
        </div>
      </div>
    )
  }

  useEffect(() => {
    fetchPersons()
    fetchTodayAttendance()
  }, [selectedDate])

  const fetchPersons = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('token')
      const response = await fetch('/api/persons?limit=100', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setPersons(data.persons || [])
      } else {
        toast.error('Failed to fetch persons')
      }
    } catch (error) {
      console.error('Error fetching persons:', error)
      toast.error('Failed to fetch persons')
    } finally {
      setLoading(false)
    }
  }

  const fetchTodayAttendance = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/attendance?date=${selectedDate}&limit=100`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setTodayAttendance(data.attendance || [])
      } else {
        toast.error('Failed to fetch attendance records')
      }
    } catch (error) {
      console.error('Error fetching attendance:', error)
      toast.error('Failed to fetch attendance records')
    }
  }

  const handlePersonCheckIn = async (personId: string) => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/attendance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          action: 'check-in',
          personId,
        }),
      })

      if (response.ok) {
        toast.success('Person checked in successfully!')
        fetchTodayAttendance()
      } else {
        const error = await response.json()
        toast.error(error.error || 'Failed to check in person')
      }
    } catch (error) {
      console.error('Error checking in person:', error)
      toast.error('Failed to check in person')
    }
  }

  const handleCheckOut = async (record: AttendanceRecord) => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/attendance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          action: 'check-out',
          memberId: record.memberId,
          visitorEmail: record.visitorEmail,
        }),
      })

      if (response.ok) {
        toast.success('Check-out successful!')
        fetchTodayAttendance()
      } else {
        const error = await response.json()
        toast.error(error.error || 'Failed to check out')
      }
    } catch (error) {
      console.error('Error checking out:', error)
      toast.error('Failed to check out')
    }
  }

  const handleVisitorCheckIn = async (visitorData: any) => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/attendance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          action: 'check-in',
          visitorName: visitorData.name,
          visitorEmail: visitorData.email,
          visitorPhone: visitorData.phone,
        }),
      })

      if (response.ok) {
        toast.success('Visitor checked in successfully!')
        setShowVisitorModal(false)
        fetchTodayAttendance()
      } else {
        const error = await response.json()
        toast.error(error.error || 'Failed to check in visitor')
      }
    } catch (error) {
      console.error('Error checking in visitor:', error)
      toast.error('Failed to check in visitor')
    }
  }

  const filteredMembers = members.filter(member =>
    member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getMemberAttendanceStatus = (memberId: string) => {
    return todayAttendance.find(record => 
      record.memberId === memberId && !record.checkOutTime
    )
  }

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const calculateDuration = (checkIn: string, checkOut?: string) => {
    const start = new Date(checkIn)
    const end = checkOut ? new Date(checkOut) : new Date()
    const diff = end.getTime() - start.getTime()
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
    return `${hours}h ${minutes}m`
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Attendance Management</h1>
          <p className="text-gray-600 mt-1">Track daily library visitors and member attendance</p>
        </div>
        <div className="flex items-center space-x-3">
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
          />
          <button
            onClick={() => setShowVisitorModal(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            <UserPlus className="h-4 w-4" />
            <span>Add Visitor</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Members List */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Library Members</h2>
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <Users className="h-4 w-4" />
                <span>{filteredMembers.length} members</span>
              </div>
            </div>
            
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search members..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="text-gray-600 mt-2">Loading members...</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {filteredMembers.map((member) => {
                  const attendanceStatus = getMemberAttendanceStatus(member.id)
                  const isCheckedIn = !!attendanceStatus

                  return (
                    <div key={member.id} className="p-4 hover:bg-gray-50">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                              <Users className="h-5 w-5 text-blue-600" />
                            </div>
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">{member.name}</div>
                            <div className="text-sm text-gray-500">{member.email}</div>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          {isCheckedIn ? (
                            <div className="flex items-center space-x-2">
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                <Clock className="h-3 w-3 mr-1" />
                                In: {formatTime(attendanceStatus.checkInTime)}
                              </span>
                              <button
                                onClick={() => handleCheckOut(attendanceStatus)}
                                className="flex items-center space-x-1 px-3 py-1 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm"
                              >
                                <LogOut className="h-3 w-3" />
                                <span>Check Out</span>
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => handleMemberCheckIn(member.id)}
                              className="flex items-center space-x-1 px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
                            >
                              <LogIn className="h-3 w-3" />
                              <span>Check In</span>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        {/* Today's Attendance */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">
                {selectedDate === new Date().toISOString().split('T')[0] ? 'Today\'s' : 'Daily'} Attendance
              </h2>
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <UserCheck className="h-4 w-4" />
                <span>{todayAttendance.length} visitors</span>
              </div>
            </div>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {todayAttendance.length === 0 ? (
              <div className="text-center py-8">
                <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No attendance records</h3>
                <p className="text-gray-600">No one has visited the library on this date</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {todayAttendance.map((record) => (
                  <div key={record.id} className="p-4 hover:bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                            record.isVisitor ? 'bg-orange-100' : 'bg-blue-100'
                          }`}>
                            {record.isVisitor ? (
                              <UserPlus className={`h-5 w-5 ${record.isVisitor ? 'text-orange-600' : 'text-blue-600'}`} />
                            ) : (
                              <Users className="h-5 w-5 text-blue-600" />
                            )}
                          </div>
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {record.isVisitor ? record.visitorName : record.member?.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {record.isVisitor ? record.visitorEmail : record.member?.email}
                          </div>
                          <div className="flex items-center space-x-4 text-xs text-gray-500 mt-1">
                            <span>In: {formatTime(record.checkInTime)}</span>
                            {record.checkOutTime && (
                              <span>Out: {formatTime(record.checkOutTime)}</span>
                            )}
                            <span>Duration: {calculateDuration(record.checkInTime, record.checkOutTime)}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        {record.isVisitor && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                            Visitor
                          </span>
                        )}
                        {!record.checkOutTime && (
                          <button
                            onClick={() => handleCheckOut(record)}
                            className="flex items-center space-x-1 px-3 py-1 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm"
                          >
                            <LogOut className="h-3 w-3" />
                            <span>Check Out</span>
                          </button>
                        )}
                        {record.checkOutTime && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                            Completed
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Visitor Modal */}
      {showVisitorModal && (
        <VisitorModal
          onSubmit={handleVisitorCheckIn}
          onClose={() => setShowVisitorModal(false)}
        />
      )}
    </div>
  )
}

// Visitor Modal Component
const VisitorModal = ({ onSubmit, onClose }: {
  onSubmit: (data: any) => void
  onClose: () => void
}) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const formData = new FormData(e.target as HTMLFormElement)
    const data = {
      name: formData.get('name')?.toString() || '',
      email: formData.get('email')?.toString() || '',
      phone: formData.get('phone')?.toString() || '',
    }

    if (!data.name || !data.email) {
      toast.error('Name and email are required')
      return
    }

    onSubmit(data)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Add Visitor</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <Plus className="h-6 w-6 transform rotate-45" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Full Name *
              </label>
              <input
                name="name"
                type="text"
                required
                placeholder="Enter visitor's full name"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email Address *
              </label>
              <input
                name="email"
                type="email"
                required
                placeholder="Enter visitor's email"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number
              </label>
              <input
                name="phone"
                type="tel"
                placeholder="Enter visitor's phone (optional)"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>
          </div>
          
          <div className="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              <LogIn className="h-4 w-4" />
              <span>Check In Visitor</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default AttendanceManagement
