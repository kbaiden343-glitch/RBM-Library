'use client'

import React, { createContext, useContext, useReducer, useEffect } from 'react'
import toast from 'react-hot-toast'
import apiClient from '../lib/apiClient'

interface User {
  id: string
  email: string
  role: 'ADMIN' | 'LIBRARIAN' | 'MEMBER'
  name: string
  avatar?: string
  permissions: string[]
}

interface AuthResponse {
  user: {
    id: string
    name: string
    email: string
    role: string
  }
  token: string
}

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  loading: boolean
  error: string | null
}

type AuthAction =
  | { type: 'LOGIN_START' }
  | { type: 'LOGIN_SUCCESS'; payload: User }
  | { type: 'LOGIN_FAILURE'; payload: string }
  | { type: 'LOGOUT' }
  | { type: 'CLEAR_ERROR' }
  | { type: 'SET_LOADING'; payload: boolean }

const AuthContext = createContext<{
  state: AuthState
  login: (email: string, password: string) => Promise<void>
  register: (name: string, email: string, password: string, role?: string) => Promise<void>
  logout: () => void
  clearError: () => void
  hasPermission: (permission: string) => boolean
} | null>(null)

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  loading: false,
  error: null
}

const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'LOGIN_START':
      return { ...state, loading: true, error: null }
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        user: action.payload,
        isAuthenticated: true,
        loading: false,
        error: null
      }
    case 'LOGIN_FAILURE':
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        loading: false,
        error: action.payload
      }
    case 'LOGOUT':
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        loading: false,
        error: null
      }
    case 'CLEAR_ERROR':
      return { ...state, error: null }
    case 'SET_LOADING':
      return { ...state, loading: action.payload }
    default:
      return state
  }
}

// Permission mapping based on role
const getPermissions = (role: string): string[] => {
  switch (role) {
    case 'ADMIN':
      return ['all']
    case 'LIBRARIAN':
      return [
        'books:read', 'books:create', 'books:update', 'books:delete',
        'members:read', 'members:create', 'members:update', 'members:delete',
        'borrowing:read', 'borrowing:create', 'borrowing:update',
        'reservations:read', 'reservations:create', 'reservations:update',
        'attendance:read', 'attendance:create', 'manage_attendance',
        'reports:read', 'dashboard:read', 'settings:read'
      ]
    case 'MEMBER':
      return [
        'books:read',
        'borrowing:read',
        'reservations:read', 'reservations:create',
        'attendance:create'
      ]
    default:
      return []
  }
}

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [state, dispatch] = useReducer(authReducer, initialState)

  // Load user from localStorage on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('library_user')
    const token = localStorage.getItem('token')
    
    if (savedUser && token) {
      try {
        const user = JSON.parse(savedUser)
        // Verify token is still valid by checking if it has required fields
        if (user.id && user.email && user.role) {
          dispatch({ type: 'LOGIN_SUCCESS', payload: user })
        } else {
          // Invalid user data, clear storage
          localStorage.removeItem('library_user')
          localStorage.removeItem('token')
        }
      } catch (error) {
        console.error('Error parsing saved user:', error)
        localStorage.removeItem('library_user')
        localStorage.removeItem('token')
      }
    }
  }, [])

  const login = async (email: string, password: string) => {
    dispatch({ type: 'LOGIN_START' })

    try {
      const response = await apiClient.post<AuthResponse>('/api/auth/login', { email, password })

      if (response.error) {
        dispatch({ type: 'LOGIN_FAILURE', payload: response.error })
        toast.error(response.error)
      } else if (response.data) {
        const user = {
          ...response.data.user,
          permissions: getPermissions(response.data.user.role)
        }
        
        dispatch({ type: 'LOGIN_SUCCESS', payload: user })
        localStorage.setItem('library_user', JSON.stringify(user))
        localStorage.setItem('token', response.data.token)
        toast.success(`Welcome back, ${user.name}!`)
      }
    } catch (error) {
      dispatch({ type: 'LOGIN_FAILURE', payload: 'Login failed. Please try again.' })
      toast.error('Login failed. Please try again.')
    }
  }

  const register = async (name: string, email: string, password: string, role: string = 'MEMBER') => {
    dispatch({ type: 'LOGIN_START' })

    try {
      const response = await apiClient.post<AuthResponse>('/api/auth/register', { name, email, password, role })

      if (response.error) {
        dispatch({ type: 'LOGIN_FAILURE', payload: response.error })
        toast.error(response.error)
      } else if (response.data) {
        const user = {
          ...response.data.user,
          permissions: getPermissions(response.data.user.role)
        }
        
        dispatch({ type: 'LOGIN_SUCCESS', payload: user })
        localStorage.setItem('library_user', JSON.stringify(user))
        localStorage.setItem('token', response.data.token)
        toast.success(`Welcome, ${user.name}!`)
      }
    } catch (error) {
      dispatch({ type: 'LOGIN_FAILURE', payload: 'Registration failed. Please try again.' })
      toast.error('Registration failed. Please try again.')
    }
  }

  const logout = () => {
    dispatch({ type: 'LOGOUT' })
    localStorage.removeItem('library_user')
    localStorage.removeItem('token')
    toast.success('Logged out successfully')
  }

  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' })
  }

  const hasPermission = (permission: string): boolean => {
    if (!state.user) return false
    if (state.user.permissions.includes('all')) return true
    return state.user.permissions.includes(permission)
  }

  const value = {
    state,
    login,
    register,
    logout,
    clearError,
    hasPermission
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}