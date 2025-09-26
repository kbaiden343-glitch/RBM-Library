'use client'

import React, { useState, useEffect } from 'react'
import { useLibrary } from '../context/LibraryContext'
import { 
  Users, 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  UserPlus,
  Phone,
  Mail,
  MapPin,
  AlertCircle,
  Filter,
  Eye,
  Calendar,
  Clock,
  RefreshCw,
  Grid,
  List,
  GraduationCap,
  Briefcase,
  BarChart3
} from 'lucide-react'
import toast from 'react-hot-toast'

interface Person {
  id: string
  name: string
  email: string
  phone?: string
  address?: string
  personType: 'MEMBER' | 'VISITOR'
  occupationType?: 'STUDENT' | 'WORKER' // Optional until database migration
  status: 'ACTIVE' | 'INACTIVE' | 'BANNED' | 'SUSPENDED'
  notes?: string
  emergencyContact?: string
  membershipDate?: string
  createdAt: string
  updatedAt: string
}

const UnifiedPeopleManagement = () => {
  const { state, addMember, updateMember, deleteMember, fetchMembers } = useLibrary()
  const [persons, setPersons] = useState<Person[]>([])
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterPersonType, setFilterPersonType] = useState('all')
  const [filterOccupationType, setFilterOccupationType] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingPerson, setEditingPerson] = useState<Person | null>(null)
  const [viewingPerson, setViewingPerson] = useState<Person | null>(null)
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table')
  const [stats, setStats] = useState<any>(null)
  const [showStats, setShowStats] = useState(false)
  const [newPerson, setNewPerson] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    personType: 'VISITOR' as 'MEMBER' | 'VISITOR',
    occupationType: 'STUDENT' as 'STUDENT' | 'WORKER',
    status: 'ACTIVE' as 'ACTIVE' | 'INACTIVE' | 'BANNED' | 'SUSPENDED',
    notes: '',
    emergencyContact: ''
  })

  const personTypes = ['all', 'MEMBER', 'VISITOR']
  const occupationTypes = ['all', 'STUDENT', 'WORKER']
  const statuses = ['all', 'ACTIVE', 'INACTIVE', 'BANNED', 'SUSPENDED']

  // Load persons on component mount
  useEffect(() => {
    fetchPersons()
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/persons/stats')
      if (response.ok) {
        const data = await response.json()
        setStats(data)
      }
    } catch (error) {
      console.error('Error fetching stats:', error)
    }
  }

  const fetchPersons = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/persons')
      if (response.ok) {
        const data = await response.json()
        setPersons(data.persons || [])
      } else {
        toast.error('Failed to fetch people data')
      }
    } catch (error) {
      console.error('Error fetching persons:', error)
      toast.error('Failed to fetch people data')
    } finally {
      setLoading(false)
    }
  }

  const filteredPersons = (persons || []).filter(person => {
    const matchesSearch = person.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         person.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (person.phone && person.phone.includes(searchTerm))
    
    const matchesPersonType = filterPersonType === 'all' || person.personType === filterPersonType
    const matchesOccupationType = filterOccupationType === 'all' || person.occupationType === filterOccupationType || !person.occupationType
    const matchesStatus = filterStatus === 'all' || person.status === filterStatus

    return matchesSearch && matchesPersonType && matchesOccupationType && matchesStatus
  })

  const handleAddPerson = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      const response = await fetch('/api/persons', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newPerson),
      })

      if (response.ok) {
        toast.success('Person added successfully!')
        setNewPerson({
          name: '',
          email: '',
          phone: '',
          address: '',
          personType: 'VISITOR',
          occupationType: 'STUDENT',
          status: 'ACTIVE',
          notes: '',
          emergencyContact: ''
        })
        setShowAddModal(false)
        fetchPersons()
      } else {
        const error = await response.json()
        toast.error(error.error || 'Failed to add person')
      }
    } catch (error) {
      console.error('Error adding person:', error)
      toast.error('Failed to add person')
    } finally {
      setLoading(false)
    }
  }

  const handleEditPerson = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingPerson) return

    setLoading(true)
    try {
      const response = await fetch(`/api/persons/${editingPerson.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editingPerson),
      })

      if (response.ok) {
        toast.success('Person updated successfully!')
        setEditingPerson(null)
        fetchPersons()
      } else {
        const error = await response.json()
        toast.error(error.error || 'Failed to update person')
      }
    } catch (error) {
      console.error('Error updating person:', error)
      toast.error('Failed to update person')
    } finally {
      setLoading(false)
    }
  }

  const handleDeletePerson = async (personId: string) => {
    if (!confirm('Are you sure you want to delete this person?')) return

    setLoading(true)
    try {
      const response = await fetch(`/api/persons/${personId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        toast.success('Person deleted successfully!')
        fetchPersons()
      } else {
        const error = await response.json()
        toast.error(error.error || 'Failed to delete person')
      }
    } catch (error) {
      console.error('Error deleting person:', error)
      toast.error('Failed to delete person')
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'bg-green-100 text-green-800'
      case 'INACTIVE': return 'bg-gray-100 text-gray-800'
      case 'BANNED': return 'bg-red-100 text-red-800'
      case 'SUSPENDED': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getPersonTypeColor = (personType: string) => {
    switch (personType) {
      case 'MEMBER': return 'bg-blue-100 text-blue-800'
      case 'VISITOR': return 'bg-purple-100 text-purple-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getOccupationTypeColor = (occupationType: string) => {
    switch (occupationType) {
      case 'STUDENT': return 'bg-indigo-100 text-indigo-800'
      case 'WORKER': return 'bg-orange-100 text-orange-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getOccupationIcon = (occupationType: string) => {
    switch (occupationType) {
      case 'STUDENT': return <GraduationCap className="h-4 w-4" />
      case 'WORKER': return <Briefcase className="h-4 w-4" />
      default: return <Users className="h-4 w-4" />
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">People Management</h1>
          <p className="text-gray-600 mt-2">Manage library members and visitors</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <button
            onClick={fetchPersons}
            disabled={loading}
            className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 w-full sm:w-auto justify-center"
          >
            {loading ? (
              <RefreshCw className="h-5 w-5 animate-spin" />
            ) : (
              <RefreshCw className="h-5 w-5" />
            )}
            <span>Refresh</span>
          </button>
          <button
            onClick={() => setShowStats(true)}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center space-x-2 w-full sm:w-auto justify-center"
          >
            <BarChart3 className="h-5 w-5" />
            <span>Statistics</span>
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2 w-full sm:w-auto justify-center"
          >
            <Plus className="h-5 w-5" />
            <span>Add Person</span>
          </button>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white p-4 lg:p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Search */}
          <div className="lg:col-span-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Search people..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 text-gray-900 bg-white"
              />
            </div>
          </div>

          {/* Person Type Filter */}
          <div>
            <select
              value={filterPersonType}
              onChange={(e) => setFilterPersonType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 text-gray-900 bg-white"
            >
              {personTypes.map(type => (
                <option key={type} value={type}>
                  {type === 'all' ? 'All Types' : type}
                </option>
              ))}
            </select>
          </div>

          {/* Occupation Type Filter */}
          <div>
            <select
              value={filterOccupationType}
              onChange={(e) => setFilterOccupationType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 text-gray-900 bg-white"
            >
              {occupationTypes.map(type => (
                <option key={type} value={type}>
                  {type === 'all' ? 'All Occupations' : type}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 text-gray-900 bg-white"
            >
              {statuses.map(status => (
                <option key={status} value={status}>
                  {status === 'all' ? 'All Statuses' : status}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* View Mode Toggle */}
        <div className="flex justify-end mt-4">
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('table')}
              className={`px-3 py-1 rounded-md flex items-center space-x-2 text-sm ${
                viewMode === 'table' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600'
              }`}
            >
              <List className="h-4 w-4" />
              <span>Table</span>
            </button>
            <button
              onClick={() => setViewMode('cards')}
              className={`px-3 py-1 rounded-md flex items-center space-x-2 text-sm ${
                viewMode === 'cards' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600'
              }`}
            >
              <Grid className="h-4 w-4" />
              <span>Cards</span>
            </button>
          </div>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total People</p>
              <p className="text-2xl font-bold text-gray-900">{(persons || []).length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <GraduationCap className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Students</p>
              <p className="text-2xl font-bold text-gray-900">
                {(persons || []).filter(p => p.occupationType === 'STUDENT').length || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Briefcase className="h-6 w-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Workers</p>
              <p className="text-2xl font-bold text-gray-900">
                {(persons || []).filter(p => p.occupationType === 'WORKER').length || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <UserPlus className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Members</p>
              <p className="text-2xl font-bold text-gray-900">
                {(persons || []).filter(p => p.personType === 'MEMBER').length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* People List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <RefreshCw className="h-8 w-8 animate-spin text-blue-600" />
            <span className="ml-2 text-gray-600">Loading people...</span>
          </div>
        ) : viewMode === 'table' ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Person
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Occupation
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredPersons.map((person) => (
                  <tr key={person.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                            <Users className="h-5 w-5 text-gray-600" />
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{person.name}</div>
                          <div className="text-sm text-gray-500">{person.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPersonTypeColor(person.personType)}`}>
                        {person.personType}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {getOccupationIcon(person.occupationType || 'STUDENT')}
                        <span className={`ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getOccupationTypeColor(person.occupationType || 'STUDENT')}`}>
                          {person.occupationType || 'N/A'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(person.status)}`}>
                        {person.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {person.phone && (
                        <div className="flex items-center">
                          <Phone className="h-4 w-4 mr-1" />
                          {person.phone}
                        </div>
                      )}
                      {person.address && (
                        <div className="flex items-center mt-1">
                          <MapPin className="h-4 w-4 mr-1" />
                          <span className="truncate max-w-32">{person.address}</span>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => setViewingPerson(person)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => setEditingPerson(person)}
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeletePerson(person.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-4 lg:p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredPersons.map((person) => (
                <div key={person.id} className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center">
                      <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                        <Users className="h-5 w-5 text-gray-600" />
                      </div>
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-gray-900">{person.name}</h3>
                        <p className="text-sm text-gray-500">{person.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => setViewingPerson(person)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => setEditingPerson(person)}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeletePerson(person.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="mt-3 flex flex-wrap gap-2">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPersonTypeColor(person.personType)}`}>
                      {person.personType}
                    </span>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getOccupationTypeColor(person.occupationType || 'STUDENT')}`}>
                      {getOccupationIcon(person.occupationType || 'STUDENT')}
                      <span className="ml-1">{person.occupationType || 'N/A'}</span>
                    </span>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(person.status)}`}>
                      {person.status}
                    </span>
                  </div>

                  {person.phone && (
                    <div className="mt-2 flex items-center text-sm text-gray-500">
                      <Phone className="h-4 w-4 mr-1" />
                      {person.phone}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {filteredPersons.length === 0 && !loading && (
          <div className="text-center py-12">
            <Users className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No people found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm || filterPersonType !== 'all' || filterOccupationType !== 'all' || filterStatus !== 'all'
                ? 'Try adjusting your search or filters.'
                : 'Get started by adding a new person.'}
            </p>
          </div>
        )}
      </div>

      {/* Add Person Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Add New Person</h2>
              <form onSubmit={handleAddPerson} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={newPerson.name}
                    onChange={(e) => setNewPerson({...newPerson, name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 text-gray-900 bg-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={newPerson.email}
                    onChange={(e) => setNewPerson({...newPerson, email: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 text-gray-900 bg-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone
                  </label>
                  <input
                    type="tel"
                    value={newPerson.phone}
                    onChange={(e) => setNewPerson({...newPerson, phone: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 text-gray-900 bg-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Address
                  </label>
                  <textarea
                    value={newPerson.address}
                    onChange={(e) => setNewPerson({...newPerson, address: e.target.value})}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 text-gray-900 bg-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Person Type *
                  </label>
                  <select
                    required
                    value={newPerson.personType}
                    onChange={(e) => setNewPerson({...newPerson, personType: e.target.value as 'MEMBER' | 'VISITOR'})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 text-gray-900 bg-white"
                  >
                    <option value="VISITOR">Visitor</option>
                    <option value="MEMBER">Member</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Occupation Type
                  </label>
                  <select
                    value={newPerson.occupationType}
                    onChange={(e) => setNewPerson({...newPerson, occupationType: e.target.value as 'STUDENT' | 'WORKER'})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 text-gray-900 bg-white"
                  >
                    <option value="STUDENT">Student</option>
                    <option value="WORKER">Worker</option>
                  </select>
                  <p className="text-xs text-gray-500 mt-1">Optional - will be available after database migration</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <select
                    value={newPerson.status}
                    onChange={(e) => setNewPerson({...newPerson, status: e.target.value as any})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 text-gray-900 bg-white"
                  >
                    <option value="ACTIVE">Active</option>
                    <option value="INACTIVE">Inactive</option>
                    <option value="BANNED">Banned</option>
                    <option value="SUSPENDED">Suspended</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Notes
                  </label>
                  <textarea
                    value={newPerson.notes}
                    onChange={(e) => setNewPerson({...newPerson, notes: e.target.value})}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 text-gray-900 bg-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Emergency Contact
                  </label>
                  <input
                    type="text"
                    value={newPerson.emergencyContact}
                    onChange={(e) => setNewPerson({...newPerson, emergencyContact: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 text-gray-900 bg-white"
                  />
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg"
                  >
                    {loading ? 'Adding...' : 'Add Person'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Edit Person Modal */}
      {editingPerson && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Edit Person</h2>
              <form onSubmit={handleEditPerson} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={editingPerson.name}
                    onChange={(e) => setEditingPerson({...editingPerson, name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 text-gray-900 bg-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={editingPerson.email}
                    onChange={(e) => setEditingPerson({...editingPerson, email: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 text-gray-900 bg-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone
                  </label>
                  <input
                    type="tel"
                    value={editingPerson.phone || ''}
                    onChange={(e) => setEditingPerson({...editingPerson, phone: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 text-gray-900 bg-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Address
                  </label>
                  <textarea
                    value={editingPerson.address || ''}
                    onChange={(e) => setEditingPerson({...editingPerson, address: e.target.value})}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 text-gray-900 bg-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Person Type *
                  </label>
                  <select
                    required
                    value={editingPerson.personType}
                    onChange={(e) => setEditingPerson({...editingPerson, personType: e.target.value as 'MEMBER' | 'VISITOR'})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 text-gray-900 bg-white"
                  >
                    <option value="VISITOR">Visitor</option>
                    <option value="MEMBER">Member</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Occupation Type
                  </label>
                  <select
                    value={editingPerson.occupationType || 'STUDENT'}
                    onChange={(e) => setEditingPerson({...editingPerson, occupationType: e.target.value as 'STUDENT' | 'WORKER'})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 text-gray-900 bg-white"
                  >
                    <option value="STUDENT">Student</option>
                    <option value="WORKER">Worker</option>
                  </select>
                  <p className="text-xs text-gray-500 mt-1">Optional - will be available after database migration</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <select
                    value={editingPerson.status}
                    onChange={(e) => setEditingPerson({...editingPerson, status: e.target.value as any})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 text-gray-900 bg-white"
                  >
                    <option value="ACTIVE">Active</option>
                    <option value="INACTIVE">Inactive</option>
                    <option value="BANNED">Banned</option>
                    <option value="SUSPENDED">Suspended</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Notes
                  </label>
                  <textarea
                    value={editingPerson.notes || ''}
                    onChange={(e) => setEditingPerson({...editingPerson, notes: e.target.value})}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 text-gray-900 bg-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Emergency Contact
                  </label>
                  <input
                    type="text"
                    value={editingPerson.emergencyContact || ''}
                    onChange={(e) => setEditingPerson({...editingPerson, emergencyContact: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 text-gray-900 bg-white"
                  />
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setEditingPerson(null)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg"
                  >
                    {loading ? 'Updating...' : 'Update Person'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* View Person Modal */}
      {viewingPerson && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Person Details</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Name</label>
                  <p className="text-sm text-gray-900">{viewingPerson.name}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <p className="text-sm text-gray-900">{viewingPerson.email}</p>
                </div>

                {viewingPerson.phone && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Phone</label>
                    <p className="text-sm text-gray-900">{viewingPerson.phone}</p>
                  </div>
                )}

                {viewingPerson.address && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Address</label>
                    <p className="text-sm text-gray-900">{viewingPerson.address}</p>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700">Person Type</label>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPersonTypeColor(viewingPerson.personType)}`}>
                    {viewingPerson.personType}
                  </span>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Occupation Type</label>
                  <div className="flex items-center">
                    {getOccupationIcon(viewingPerson.occupationType)}
                    <span className={`ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getOccupationTypeColor(viewingPerson.occupationType)}`}>
                      {viewingPerson.occupationType}
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Status</label>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(viewingPerson.status)}`}>
                    {viewingPerson.status}
                  </span>
                </div>

                {viewingPerson.notes && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Notes</label>
                    <p className="text-sm text-gray-900">{viewingPerson.notes}</p>
                  </div>
                )}

                {viewingPerson.emergencyContact && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Emergency Contact</label>
                    <p className="text-sm text-gray-900">{viewingPerson.emergencyContact}</p>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700">Created</label>
                  <p className="text-sm text-gray-900">
                    {new Date(viewingPerson.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <button
                  onClick={() => setViewingPerson(null)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Statistics Modal */}
      {showStats && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-medium text-gray-900">People Statistics</h2>
                <button
                  onClick={() => setShowStats(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {stats && (
                <div className="space-y-6">
                  {/* Overview Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <div className="flex items-center">
                        <Users className="h-8 w-8 text-blue-600" />
                        <div className="ml-3">
                          <p className="text-sm font-medium text-blue-600">Total People</p>
                          <p className="text-2xl font-bold text-blue-900">{stats.overview.totalPeople}</p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-green-50 p-4 rounded-lg">
                      <div className="flex items-center">
                        <GraduationCap className="h-8 w-8 text-green-600" />
                        <div className="ml-3">
                          <p className="text-sm font-medium text-green-600">Students</p>
                          <p className="text-2xl font-bold text-green-900">{stats.overview.totalStudents}</p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-orange-50 p-4 rounded-lg">
                      <div className="flex items-center">
                        <Briefcase className="h-8 w-8 text-orange-600" />
                        <div className="ml-3">
                          <p className="text-sm font-medium text-orange-600">Workers</p>
                          <p className="text-2xl font-bold text-orange-900">{stats.overview.totalWorkers}</p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-purple-50 p-4 rounded-lg">
                      <div className="flex items-center">
                        <UserPlus className="h-8 w-8 text-purple-600" />
                        <div className="ml-3">
                          <p className="text-sm font-medium text-purple-600">Members</p>
                          <p className="text-2xl font-bold text-purple-900">{stats.overview.totalMembers}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Detailed Statistics */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h3 className="text-lg font-medium text-gray-900 mb-4">Person Types</h3>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Members</span>
                          <span className="text-sm font-medium text-gray-900">{stats.overview.totalMembers}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Visitors</span>
                          <span className="text-sm font-medium text-gray-900">{stats.overview.totalVisitors}</span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h3 className="text-lg font-medium text-gray-900 mb-4">Status Breakdown</h3>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Active</span>
                          <span className="text-sm font-medium text-green-600">{stats.overview.activePeople}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Inactive</span>
                          <span className="text-sm font-medium text-gray-600">{stats.overview.inactivePeople}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Recent Activity */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Activity</h3>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">New people (last 30 days)</span>
                      <span className="text-sm font-medium text-blue-600">{stats.overview.recentPeople}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default UnifiedPeopleManagement
