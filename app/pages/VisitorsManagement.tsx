'use client'

import React, { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
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
  Clock
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
  notes?: string
  emergencyContact?: string
  membershipDate?: string
  createdAt: string
  updatedAt: string
}

const VisitorsManagement = () => {
  const { hasPermission } = useAuth()
  const [persons, setPersons] = useState<Person[]>([])
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingPerson, setEditingPerson] = useState<Person | null>(null)
  const [viewingPerson, setViewingPerson] = useState<Person | null>(null)

  const personTypes = ['all', 'MEMBER', 'VISITOR', 'VIP', 'STUDENT', 'STAFF']
  const statuses = ['all', 'ACTIVE', 'INACTIVE', 'BANNED', 'SUSPENDED']

  // Check permissions
  if (!hasPermission('members:read')) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600">You need appropriate privileges to access visitor management.</p>
        </div>
      </div>
    )
  }

  useEffect(() => {
    fetchPersons()
  }, [filterType, filterStatus])

  const fetchPersons = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('token')
      const params = new URLSearchParams({
        limit: '100',
        ...(searchTerm && { search: searchTerm }),
        ...(filterType !== 'all' && { personType: filterType }),
        ...(filterStatus !== 'all' && { status: filterStatus }),
      })

      const response = await fetch(`/api/persons?${params}`, {
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

  const handleSearch = () => {
    fetchPersons()
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
        setShowAddModal(false)
        toast.success('Person added successfully!')
      } else {
        const error = await response.json()
        toast.error(error.error || 'Failed to add person')
      }
    } catch (error) {
      console.error('Error adding person:', error)
      toast.error('Failed to add person')
    }
  }

  const handleEditPerson = async (personData: any) => {
    if (!editingPerson) return

    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/persons/${editingPerson.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(personData),
      })

      if (response.ok) {
        const updatedPerson = await response.json()
        setPersons(persons.map(p => p.id === updatedPerson.id ? updatedPerson : p))
        setEditingPerson(null)
        toast.success('Person updated successfully!')
      } else {
        const error = await response.json()
        toast.error(error.error || 'Failed to update person')
      }
    } catch (error) {
      console.error('Error updating person:', error)
      toast.error('Failed to update person')
    }
  }

  const handleDeletePerson = async (personId: string) => {
    if (!confirm('Are you sure you want to delete this person? This action cannot be undone.')) {
      return
    }

    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/persons/${personId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      if (response.ok) {
        setPersons(persons.filter(p => p.id !== personId))
        toast.success('Person deleted successfully!')
      } else {
        const error = await response.json()
        toast.error(error.error || 'Failed to delete person')
      }
    } catch (error) {
      console.error('Error deleting person:', error)
      toast.error('Failed to delete person')
    }
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-green-100 text-green-800'
      case 'INACTIVE':
        return 'bg-gray-100 text-gray-800'
      case 'BANNED':
        return 'bg-red-100 text-red-800'
      case 'SUSPENDED':
        return 'bg-orange-100 text-orange-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const filteredPersons = persons.filter(person =>
    person.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    person.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (person.phone && person.phone.includes(searchTerm))
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">People Management</h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1">Manage all library visitors, members, and staff</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center justify-center space-x-2 px-3 sm:px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm sm:text-base w-full sm:w-auto"
        >
          <Plus className="h-4 w-4" />
          <span>Add Person</span>
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <input
            type="text"
            placeholder="Search by name, email, or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
          />
        </div>
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
        >
          {personTypes.map(type => (
            <option key={type} value={type}>
              {type === 'all' ? 'All Types' : type}
            </option>
          ))}
        </select>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
        >
          {statuses.map(status => (
            <option key={status} value={status}>
              {status === 'all' ? 'All Statuses' : status}
            </option>
          ))}
        </select>
        <button
          onClick={handleSearch}
          className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
        >
          <Filter className="h-4 w-4" />
        </button>
      </div>

      {/* Persons Table */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600 mt-4">Loading persons...</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
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
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Added
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
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
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(person.status)}`}>
                      {person.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="space-y-1">
                      {person.phone && (
                        <div className="flex items-center">
                          <Phone className="h-3 w-3 mr-1" />
                          {person.phone}
                        </div>
                      )}
                      {person.address && (
                        <div className="flex items-center">
                          <MapPin className="h-3 w-3 mr-1" />
                          {person.address.length > 20 ? `${person.address.substring(0, 20)}...` : person.address}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(person.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-2">
                      <button
                        onClick={() => setViewingPerson(person)}
                        className="text-blue-600 hover:text-blue-900"
                        title="View Details"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => setEditingPerson(person)}
                        className="text-green-600 hover:text-green-900"
                        title="Edit"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeletePerson(person.id)}
                        className="text-red-600 hover:text-red-900"
                        title="Delete"
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
      )}

      {filteredPersons.length === 0 && !loading && (
        <div className="text-center py-12">
          <UserPlus className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No persons found</h3>
          <p className="text-gray-600">Try adjusting your search or filter criteria</p>
        </div>
      )}

      {/* Add Person Modal */}
      {showAddModal && (
        <PersonModal
          title="Add New Person"
          onSubmit={handleAddPerson}
          onClose={() => setShowAddModal(false)}
        />
      )}

      {/* Edit Person Modal */}
      {editingPerson && (
        <PersonModal
          title="Edit Person"
          person={editingPerson}
          onSubmit={handleEditPerson}
          onClose={() => setEditingPerson(null)}
        />
      )}

      {/* View Person Modal */}
      {viewingPerson && (
        <ViewPersonModal
          person={viewingPerson}
          onClose={() => setViewingPerson(null)}
        />
      )}
    </div>
  )
}

// Person Modal Component
const PersonModal = ({ title, person, onSubmit, onClose }: {
  title: string
  person?: Person
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
      status: formData.get('status')?.toString() || 'ACTIVE',
      notes: formData.get('notes')?.toString() || '',
      emergencyContact: formData.get('emergencyContact')?.toString() || '',
    }

    if (!data.name || !data.email) {
      toast.error('Name and email are required')
      return
    }

    onSubmit(data)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-semibold mb-4">{title}</h2>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
              <input
                name="name"
                defaultValue={person?.name || ''}
                placeholder="Full Name"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
              <input
                name="email"
                type="email"
                defaultValue={person?.email || ''}
                placeholder="Email Address"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
              <input
                name="phone"
                type="tel"
                defaultValue={person?.phone || ''}
                placeholder="Phone Number"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
              <textarea
                name="address"
                defaultValue={person?.address || ''}
                placeholder="Full Address"
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                <select
                  name="personType"
                  defaultValue={person?.personType || 'VISITOR'}
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  name="status"
                  defaultValue={person?.status || 'ACTIVE'}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                >
                  <option value="ACTIVE">Active</option>
                  <option value="INACTIVE">Inactive</option>
                  <option value="SUSPENDED">Suspended</option>
                  <option value="BANNED">Banned</option>
                </select>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Emergency Contact</label>
              <input
                name="emergencyContact"
                defaultValue={person?.emergencyContact || ''}
                placeholder="Emergency Contact Information"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
              <textarea
                name="notes"
                defaultValue={person?.notes || ''}
                placeholder="Additional notes..."
                rows={3}
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
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              {person ? 'Update Person' : 'Add Person'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// View Person Modal Component
const ViewPersonModal = ({ person, onClose }: {
  person: Person
  onClose: () => void
}) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Person Details</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <Plus className="h-6 w-6 transform rotate-45" />
          </button>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Name</label>
            <p className="text-gray-900">{person.name}</p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <p className="text-gray-900">{person.email}</p>
          </div>
          
          {person.phone && (
            <div>
              <label className="block text-sm font-medium text-gray-700">Phone</label>
              <p className="text-gray-900">{person.phone}</p>
            </div>
          )}
          
          {person.address && (
            <div>
              <label className="block text-sm font-medium text-gray-700">Address</label>
              <p className="text-gray-900">{person.address}</p>
            </div>
          )}
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Type</label>
              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                person.personType === 'MEMBER' ? 'bg-blue-100 text-blue-800' :
                person.personType === 'VISITOR' ? 'bg-green-100 text-green-800' :
                person.personType === 'VIP' ? 'bg-purple-100 text-purple-800' :
                person.personType === 'STUDENT' ? 'bg-yellow-100 text-yellow-800' :
                'bg-red-100 text-red-800'
              }`}>
                {person.personType}
              </span>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Status</label>
              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                person.status === 'ACTIVE' ? 'bg-green-100 text-green-800' :
                person.status === 'INACTIVE' ? 'bg-gray-100 text-gray-800' :
                person.status === 'BANNED' ? 'bg-red-100 text-red-800' :
                'bg-orange-100 text-orange-800'
              }`}>
                {person.status}
              </span>
            </div>
          </div>
          
          {person.emergencyContact && (
            <div>
              <label className="block text-sm font-medium text-gray-700">Emergency Contact</label>
              <p className="text-gray-900">{person.emergencyContact}</p>
            </div>
          )}
          
          {person.notes && (
            <div>
              <label className="block text-sm font-medium text-gray-700">Notes</label>
              <p className="text-gray-900">{person.notes}</p>
            </div>
          )}
          
          <div className="grid grid-cols-2 gap-4 pt-4 border-t">
            <div>
              <label className="block text-sm font-medium text-gray-700">Added</label>
              <p className="text-gray-900 text-sm">{new Date(person.createdAt).toLocaleDateString()}</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Updated</label>
              <p className="text-gray-900 text-sm">{new Date(person.updatedAt).toLocaleDateString()}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default VisitorsManagement
