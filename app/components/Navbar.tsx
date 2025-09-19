'use client'

import React, { useState } from 'react'
import { BookOpen, Menu, X } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import UserMenu from './UserMenu'
import NotificationPanel from './NotificationPanel'
import GlobalSearch from './GlobalSearch'

interface NavbarProps {
  onNavigate: (page: string, personId?: string) => void
}

const Navbar = ({ onNavigate }: NavbarProps) => {
  const { state } = useAuth()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <img 
                src="/ST peter.png" 
                alt="Robert Aboagye Mensah Community Library"
                className="h-12 w-12 rounded-full object-cover border-2 border-yellow-400"
                onError={(e) => {
                  // Fallback to Methodist-themed design if image fails to load
                  e.currentTarget.style.display = 'none'
                  e.currentTarget.nextElementSibling.style.display = 'flex'
                }}
              />
              <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-800 to-blue-600 border-2 border-yellow-400 hidden items-center justify-center text-white shadow-lg">
                <div className="text-center">
                  <div className="text-red-400 text-lg font-bold">✚</div>
                  <div className="text-xs font-bold text-yellow-200">MC</div>
                </div>
              </div>
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">
                Robert Aboagye Mensah
              </h1>
              <p className="text-sm text-gray-600">Community Library</p>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          {/* Global Search - Hidden on mobile */}
          <div className="hidden md:block w-80">
            <GlobalSearch onNavigate={onNavigate} />
          </div>

          {/* Notifications */}
          <NotificationPanel />

          {/* User Menu */}
          {state.user && <UserMenu />}

          {/* Mobile menu button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          >
            {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Search Bar */}
      {isMobileMenuOpen && (
        <div className="md:hidden mt-4">
          <GlobalSearch onNavigate={onNavigate} />
        </div>
      )}
    </nav>
  )
}

export default Navbar
