'use client'

import React from 'react'
import { 
  Home, 
  BookOpen, 
  Users, 
  BookMarked, 
  BarChart3, 
  Settings,
  Calendar,
  Star,
  Shield,
  UserCheck,
  UserPlus,
  TrendingUp
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'

interface SidebarProps {
  activePage: string
  setActivePage: (page: string) => void
  onClose?: () => void
}

const Sidebar = ({ activePage, setActivePage, onClose }: SidebarProps) => {
  const { state, hasPermission } = useAuth()

  const menuItems = [
    { key: 'dashboard', icon: Home, label: 'Dashboard', permission: 'dashboard:read' },
    { key: 'catalog', icon: BookOpen, label: 'Book Catalog', permission: 'books:read' },
    { key: 'people', icon: Users, label: 'People Management', permission: 'members:read' },
    { key: 'borrowing', icon: BookMarked, label: 'Borrowing System', permission: 'borrowing:read' },
    { key: 'attendance', icon: UserCheck, label: 'Attendance (Unified)', permission: 'manage_attendance' },
    { key: 'users', icon: Shield, label: 'User Management', permission: 'all' },
    { key: 'reports', icon: BarChart3, label: 'Reports & Analytics', permission: 'reports:read' },
    { key: 'settings', icon: Settings, label: 'Settings', permission: 'settings:read' },
  ]

  const quickActions = [
    { icon: Calendar, label: 'Attendance Analytics', action: () => setActivePage('tracking'), permission: 'attendance:read' },
  ]

  const filteredMenuItems = menuItems.filter(item => hasPermission(item.permission))
  const filteredQuickActions = quickActions.filter(action => hasPermission(action.permission))

  const handleMenuClick = (page: string) => {
    setActivePage(page)
    if (onClose) {
      onClose()
    }
  }

  return (
    <aside className="w-64 bg-white shadow-sm border-r border-gray-200 min-h-screen">
      <div className="p-4 md:p-6">
        <nav className="space-y-2">
          {filteredMenuItems.map((item) => {
            const Icon = item.icon
            const isActive = activePage === item.key
            
            return (
              <button
                key={item.key}
                onClick={() => handleMenuClick(item.key)}
                className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors w-full text-left ${
                  isActive
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Icon className="h-5 w-5" />
                <span className="font-medium">{item.label}</span>
              </button>
            )
          })}
        </nav>

        {/* Quick Actions Section */}
        {filteredQuickActions.length > 0 && (
          <div className="mt-8 pt-6 border-t border-gray-200">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
              Quick Actions
            </h3>
            <div className="space-y-2">
              {filteredQuickActions.map((item, index) => {
                const Icon = item.icon
                
                return (
                  <button
                    key={index}
                    onClick={item.action}
                    className="flex items-center space-x-3 px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors w-full text-left"
                  >
                    <Icon className="h-5 w-5" />
                    <span className="font-medium">{item.label}</span>
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* User Role Info */}
        {state.user && (
          <div className="mt-8 pt-6 border-t border-gray-200">
            <div className="flex items-center space-x-2 mb-3">
              <Shield className="h-4 w-4 text-gray-500" />
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Your Role
              </h3>
            </div>
            <div className="bg-blue-50 rounded-lg p-3">
              <p className="text-sm font-medium text-blue-900 capitalize">{state.user.role}</p>
              <p className="text-xs text-blue-700">{state.user.name}</p>
            </div>
          </div>
        )}

      </div>
    </aside>
  )
}

export default Sidebar
