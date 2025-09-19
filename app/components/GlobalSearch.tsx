'use client'

import React, { useState, useEffect, useRef } from 'react'
import { Search, User, Users, Shield, X, ArrowRight, Clock } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

interface SearchResult {
  id: string
  name: string
  email: string
  phone: string
  libraryId: string
  type: string
  status: string
  membershipDate: string | null
  createdAt: string
  navigateTo: string
  displayType: string
  subtitle: string
}

interface GlobalSearchProps {
  onNavigate: (page: string, personId?: string) => void
}

const GlobalSearch = ({ onNavigate }: GlobalSearchProps) => {
  const { hasPermission } = useAuth()
  const [isOpen, setIsOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const searchRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Check if user has search permissions
  if (!hasPermission('members:read') && !hasPermission('users:read')) {
    return null
  }

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false)
        setSelectedIndex(-1)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    const searchPeople = async () => {
      if (query.trim().length < 2) {
        setResults([])
        return
      }

      setLoading(true)
      try {
        const token = localStorage.getItem('token')
        const response = await fetch(`/api/search?q=${encodeURIComponent(query)}&limit=8`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
        
        if (response.ok) {
          const data = await response.json()
          setResults(data.results || [])
        } else {
          setResults([])
        }
      } catch (error) {
        console.error('Search error:', error)
        setResults([])
      } finally {
        setLoading(false)
      }
    }

    const debounceTimer = setTimeout(searchPeople, 300)
    return () => clearTimeout(debounceTimer)
  }, [query])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIndex(prev => Math.min(prev + 1, results.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIndex(prev => Math.max(prev - 1, -1))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      if (selectedIndex >= 0 && results[selectedIndex]) {
        handleSelectResult(results[selectedIndex])
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false)
      setSelectedIndex(-1)
      inputRef.current?.blur()
    }
  }

  const handleSelectResult = (result: SearchResult) => {
    setIsOpen(false)
    setQuery('')
    setResults([])
    setSelectedIndex(-1)
    
    // Navigate to the appropriate page
    onNavigate(result.navigateTo, result.id)
    
    // Optional: You could also store the selected person's ID for highlighting
    sessionStorage.setItem('highlightPersonId', result.id)
  }

  const getResultIcon = (type: string) => {
    switch (type) {
      case 'member':
      case 'legacy_member':
        return <User className="h-4 w-4 text-blue-600" />
      case 'visitor':
        return <Users className="h-4 w-4 text-green-600" />
      case 'user':
        return <Shield className="h-4 w-4 text-purple-600" />
      default:
        return <User className="h-4 w-4 text-gray-600" />
    }
  }

  const getResultColor = (type: string) => {
    switch (type) {
      case 'member':
      case 'legacy_member':
        return 'border-l-blue-500 bg-blue-50'
      case 'visitor':
        return 'border-l-green-500 bg-green-50'
      case 'user':
        return 'border-l-purple-500 bg-purple-50'
      default:
        return 'border-l-gray-500 bg-gray-50'
    }
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return ''
    return new Date(dateString).toLocaleDateString()
  }

  return (
    <div className="relative" ref={searchRef}>
      {/* Search Input */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-4 w-4 text-gray-400" />
        </div>
        <input
          ref={inputRef}
          type="text"
          placeholder="Search people, members, visitors..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            setIsOpen(true)
            setSelectedIndex(-1)
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        {query && (
          <button
            onClick={() => {
              setQuery('')
              setResults([])
              setIsOpen(false)
              setSelectedIndex(-1)
            }}
            className="absolute inset-y-0 right-0 pr-3 flex items-center"
          >
            <X className="h-4 w-4 text-gray-400 hover:text-gray-600" />
          </button>
        )}
      </div>

      {/* Search Results Dropdown */}
      {isOpen && (query.length >= 2 || results.length > 0) && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
          {loading && (
            <div className="px-4 py-3 text-center text-gray-500">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600 mx-auto mb-2"></div>
              Searching...
            </div>
          )}

          {!loading && query.length >= 2 && results.length === 0 && (
            <div className="px-4 py-6 text-center text-gray-500">
              <Search className="h-8 w-8 mx-auto mb-2 text-gray-300" />
              <p className="text-sm">No people found for "{query}"</p>
              <p className="text-xs text-gray-400 mt-1">Try searching by name, email, phone, or library ID</p>
            </div>
          )}

          {!loading && results.length > 0 && (
            <>
              <div className="px-3 py-2 bg-gray-50 border-b border-gray-200">
                <p className="text-xs font-medium text-gray-600">
                  Found {results.length} people • Click to navigate
                </p>
              </div>
              
              {results.map((result, index) => (
                <div
                  key={`${result.type}-${result.id}`}
                  onClick={() => handleSelectResult(result)}
                  className={`px-4 py-3 cursor-pointer border-l-4 transition-colors ${
                    index === selectedIndex
                      ? `${getResultColor(result.type)} border-l-4`
                      : 'hover:bg-gray-50 border-l-transparent'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3 flex-1 min-w-0">
                      {getResultIcon(result.type)}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {result.name}
                          </p>
                          {result.libraryId && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                              {result.libraryId}
                            </span>
                          )}
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                            result.status === 'ACTIVE' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {result.status}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 truncate">
                          {result.subtitle}
                        </p>
                        {result.membershipDate && (
                          <div className="flex items-center space-x-1 mt-1">
                            <Clock className="h-3 w-3 text-gray-400" />
                            <p className="text-xs text-gray-400">
                              Member since {formatDate(result.membershipDate)}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                    <ArrowRight className="h-4 w-4 text-gray-400" />
                  </div>
                </div>
              ))}
              
              {results.length >= 8 && (
                <div className="px-4 py-2 bg-gray-50 border-t border-gray-200">
                  <p className="text-xs text-gray-500 text-center">
                    Showing first 8 results. Be more specific to narrow down.
                  </p>
                </div>
              )}
            </>
          )}

          {query.length < 2 && query.length > 0 && (
            <div className="px-4 py-3 text-center text-gray-500">
              <p className="text-sm">Type at least 2 characters to search</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default GlobalSearch
