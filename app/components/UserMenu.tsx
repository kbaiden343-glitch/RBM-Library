'use client'

import React, { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { User, LogOut, Settings, Bell } from 'lucide-react'

const UserMenu = () => {
  const { state, logout } = useAuth()
  const [isOpen, setIsOpen] = useState(false)

  if (!state.user) return null

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-red-100 text-red-800'
      case 'librarian':
        return 'bg-blue-100 text-blue-800'
      case 'member':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 transition-colors"
      >
        <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
          <User className="h-5 w-5 text-white" />
        </div>
        <div className="text-left">
          <p className="text-sm font-medium text-gray-900">{state.user.name}</p>
          <p className="text-xs text-gray-600 capitalize">{state.user.role}</p>
        </div>
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 z-20">
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                  <User className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">{state.user.name}</p>
                  <p className="text-sm text-gray-600">{state.user.email}</p>
                  <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full mt-1 ${getRoleColor(state.user.role)}`}>
                    {state.user.role}
                  </span>
                </div>
              </div>
            </div>

            <div className="py-2">
              <button className="w-full flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                <Bell className="h-4 w-4" />
                <span>Notifications</span>
              </button>
              <button className="w-full flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                <Settings className="h-4 w-4" />
                <span>Settings</span>
              </button>
              <hr className="my-2" />
              <button
                onClick={logout}
                className="w-full flex items-center space-x-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
              >
                <LogOut className="h-4 w-4" />
                <span>Sign out</span>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default UserMenu
