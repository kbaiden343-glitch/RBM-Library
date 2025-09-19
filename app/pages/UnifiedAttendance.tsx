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
  checkInTime: string
  checkOutTime?: string
  person?: Person
}

const UnifiedAttendance = () => {
  const { hasPermission } = useAuth()
  const [persons, setPersons] = useState<Person[]>([])
  const [todayAttendance, setTodayAttendance] = useState<AttendanceRecord[]>([])
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [showAddPersonModal, setShowAddPersonModal] = useState(false)

  // Check permissions
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
          personId: record.personId,
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

  const handleAddPerson = async (personData: any) => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/persons', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(personData),
      })

      if (response.ok) {
        const newPerson = await response.json()
        setPersons([newPerson, ...persons])
        setShowAddPersonModal(false)
        toast.success('Person added successfully!')
        
        // Automatically check in the new person
        handlePersonCheckIn(newPerson.id)
      } else {
        const error = await response.json()
        toast.error(error.error || 'Failed to add person')
      }
    } catch (error) {
      console.error('Error adding person:', error)
      toast.error('Failed to add person')
    }
  }

  const filteredPersons = persons.filter(person =>
    person.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    person.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (person.phone && person.phone.includes(searchTerm))
  )

  const getPersonAttendanceStatus = (personId: string) => {
    return todayAttendance.find(record => 
      record.personId === personId && !record.checkOutTime
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

  const getPersonTypeColor = (type: string) => {
    switch (type) {
      case 'MEMBER':
        return 'bg-blue-100 text-blue-800'
      case 'VISITOR':
        return 'bg-green-100 text-green-800'
      case 'VIP':
        return 'bg-purple-100 text-purple-800'
      case 'STUDENT':
        return 'bg-yellow-100 text-yellow-800'
      case 'STAFF':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-gray-900">📋 Daily Attendance System</h1>
          <p className="text-lg text-gray-600 mt-2">Search, Sign In & Sign Out Library Visitors</p>
        </div>
        <div className="flex items-center space-x-3">
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
          />
          <button
            onClick={() => setShowAddPersonModal(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            <UserPlus className="h-4 w-4" />
            <span>Add Person</span>
          </button>
        </div>
      </div>

      <div className="space-y-6">
        {/* Search Section */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-gray-900">👥 Search & Sign In People</h2>
              <div className="flex items-center space-x-2 text-sm font-semibold text-blue-600 bg-blue-50 px-3 py-1 rounded-lg">
                <Users className="h-4 w-4" />
                <span>{filteredPersons.length} registered people</span>
              </div>
            </div>
            
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search by name, email, or phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>
          </div>

          <div className="max-h-80 overflow-y-auto border-t border-gray-100 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="text-gray-600 mt-2">Loading people...</p>
              </div>
            ) : searchTerm.length === 0 ? (
              <div className="text-center py-12">
                <Search className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-700 mb-2">Start typing to search for people</h3>
                <p className="text-gray-500">Type a person's name, email, or phone number to find them and sign them in</p>
              </div>
            ) : (
              <div>
                {filteredPersons.length > 5 && (
                  <div className="bg-blue-50 px-4 py-2 text-sm text-blue-700 font-medium border-b border-blue-100">
                    📝 Found {filteredPersons.length} people - scroll to see all results
                  </div>
                )}
                <div className="divide-y divide-gray-200">
                {filteredPersons.map((person) => {
                  const attendanceStatus = getPersonAttendanceStatus(person.id)
                  const isCheckedIn = !!attendanceStatus

                  return (
                    <div key={person.id} className="p-4 hover:bg-gray-50">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                              <Users className="h-5 w-5 text-blue-600" />
                            </div>
                          </div>
                          <div>
                            <div className="text-lg font-bold text-gray-900 mb-1">{person.name}</div>
                            <div className="text-sm text-gray-600 mb-1">{person.email}</div>
                            <div className="flex items-center space-x-2 mb-2">
                              <span className={`inline-flex items-center px-3 py-1 rounded-lg text-xs font-semibold ${getPersonTypeColor(person.personType)} border`}>
                                {person.personType}
                              </span>
                              {(person as any).libraryId && (
                                <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-mono font-semibold bg-gray-100 text-gray-800 border">
                                  ID: {(person as any).libraryId}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-3">
                          {isCheckedIn ? (
                            <div className="flex items-center space-x-3">
                              <div className="text-center">
                                <div className="inline-flex items-center px-3 py-2 rounded-lg text-sm font-semibold bg-green-100 text-green-800 border border-green-200">
                                  <Clock className="h-4 w-4 mr-2" />
                                  <div>
                                    <div className="font-bold">CHECKED IN</div>
                                    <div className="text-xs">at {formatTime(attendanceStatus.checkInTime)}</div>
                                  </div>
                                </div>
                              </div>
                              <button
                                onClick={() => handleCheckOut(attendanceStatus)}
                                className="flex items-center space-x-2 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm font-semibold shadow-md transition-all duration-200 hover:shadow-lg"
                              >
                                <LogOut className="h-4 w-4" />
                                <span>SIGN OUT</span>
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => handlePersonCheckIn(person.id)}
                              className="flex items-center space-x-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-semibold shadow-md transition-all duration-200 hover:shadow-lg"
                            >
                              <LogIn className="h-4 w-4" />
                              <span>SIGN IN</span>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
                {searchTerm.length > 0 && filteredPersons.length === 0 && (
                  <div className="text-center py-8">
                    <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-700 mb-2">No people found</h3>
                    <p className="text-gray-500 mb-4">No one matches "{searchTerm}"</p>
                    <button
                      onClick={() => setShowAddPersonModal(true)}
                      className="inline-flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-semibold"
                    >
                      <UserPlus className="h-4 w-4" />
                      <span>Add New Person</span>
                    </button>
                  </div>
                )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Today's Attendance */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">
                🕐 {selectedDate === new Date().toISOString().split('T')[0] ? 'Today\'s Attendance' : 'Daily Attendance'}
              </h2>
              <div className="flex items-center space-x-2 text-sm font-semibold text-green-600 bg-green-50 px-3 py-1 rounded-lg">
                <UserCheck className="h-4 w-4" />
                <span>{todayAttendance.length} total visits</span>
              </div>
            </div>
          </div>

          <div className="max-h-96 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
            {todayAttendance.length === 0 ? (
              <div className="text-center py-8">
                <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No attendance records</h3>
                <p className="text-gray-600">No one has visited the library on this date</p>
              </div>
            ) : (
              <div>
                {todayAttendance.length > 5 && (
                  <div className="bg-green-50 px-4 py-2 text-sm text-green-700 font-medium border-b border-green-100">
                    📋 {todayAttendance.length} total visits today - scroll to see all records
                  </div>
                )}
                <div className="divide-y divide-gray-200">
                {todayAttendance.map((record) => (
                  <div key={record.id} className="p-4 hover:bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                            <Users className="h-5 w-5 text-blue-600" />
                          </div>
                        </div>
                        <div>
                          <div className="text-lg font-bold text-gray-900 mb-1">
                            {record.person?.name || 'Unknown Person'}
                          </div>
                          <div className="text-sm text-gray-600 mb-1">
                            {record.person?.email || 'No email'}
                          </div>
                          {(record.person as any)?.libraryId && (
                            <div className="text-xs font-mono font-semibold text-blue-600 mb-2">
                              Library ID: {(record.person as any).libraryId}
                            </div>
                          )}
                          <div className="flex items-center space-x-4 text-sm font-medium text-gray-700 bg-gray-50 px-3 py-2 rounded-lg">
                            <div className="flex items-center">
                              <span className="text-green-600 font-semibold">IN:</span>
                              <span className="ml-1">{formatTime(record.checkInTime)}</span>
                            </div>
                            {record.checkOutTime && (
                              <div className="flex items-center">
                                <span className="text-red-600 font-semibold">OUT:</span>
                                <span className="ml-1">{formatTime(record.checkOutTime)}</span>
                              </div>
                            )}
                            <div className="flex items-center">
                              <span className="text-blue-600 font-semibold">TIME:</span>
                              <span className="ml-1">{calculateDuration(record.checkInTime, record.checkOutTime)}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-3">
                        {record.person && (
                          <span className={`inline-flex items-center px-3 py-1 rounded-lg text-xs font-semibold ${getPersonTypeColor(record.person.personType)} border`}>
                            {record.person.personType}
                          </span>
                        )}
                        {!record.checkOutTime && (
                          <div className="flex items-center space-x-2">
                            <span className="inline-flex items-center px-3 py-1 rounded-lg text-xs font-semibold bg-green-100 text-green-800 border border-green-200">
                              ✓ CURRENTLY IN LIBRARY
                            </span>
                            <button
                              onClick={() => handleCheckOut(record)}
                              className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm font-semibold shadow-md transition-all duration-200 hover:shadow-lg"
                            >
                              <LogOut className="h-4 w-4" />
                              <span>SIGN OUT</span>
                            </button>
                          </div>
                        )}
                        {record.checkOutTime && (
                          <span className="inline-flex items-center px-3 py-2 rounded-lg text-sm font-semibold bg-gray-100 text-gray-800 border border-gray-200">
                            ✓ VISIT COMPLETED
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add Person Modal */}
      {showAddPersonModal && (
        <AddPersonModal
          onSubmit={handleAddPerson}
          onClose={() => setShowAddPersonModal(false)}
        />
      )}
    </div>
  )
}

// Add Person Modal Component
const AddPersonModal = ({ onSubmit, onClose }: {
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
      address: formData.get('address')?.toString() || '',
      personType: formData.get('personType')?.toString() || 'VISITOR',
      notes: formData.get('notes')?.toString() || '',
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
          <h2 className="text-xl font-semibold">Add Person & Check In</h2>
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
                placeholder="Enter person's full name"
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
                placeholder="Enter person's email"
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
                placeholder="Enter phone number (optional)"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Person Type
              </label>
              <select
                name="personType"
                defaultValue="VISITOR"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
              >
                <option value="VISITOR">Visitor</option>
                <option value="MEMBER">Member</option>
                <option value="STUDENT">Student</option>
                <option value="VIP">VIP</option>
                <option value="STAFF">Staff</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Address
              </label>
              <textarea
                name="address"
                placeholder="Enter address (optional)"
                rows={2}
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
              <span>Add & Check In</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default UnifiedAttendance
