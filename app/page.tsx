'use client'

import { useState } from 'react'
import { useAuth } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import Navbar from './components/Navbar'
import Sidebar from './components/Sidebar'
import SampleNotifications from './components/SampleNotifications'
import DataInitializer from './components/DataInitializer'
import Dashboard from './pages/Dashboard'
import BookCatalog from './pages/BookCatalog'
import MemberManagement from './pages/MemberManagement'
import VisitorsManagement from './pages/VisitorsManagement'
import BorrowingSystem from './pages/BorrowingSystem'
import AttendanceManagement from './pages/AttendanceManagement'
import UnifiedAttendance from './pages/UnifiedAttendance'
import AttendanceTracking from './pages/AttendanceTracking'
import UserManagement from './pages/UserManagement'
import Reports from './pages/Reports'
import Settings from './pages/Settings'

export default function Home() {
  const [activePage, setActivePage] = useState('dashboard')
  const { state } = useAuth()

  // Navigation function for search results
  const handleNavigateFromSearch = (page: string, personId?: string) => {
    setActivePage(page)
    
    // Store the person ID to highlight them on the target page
    if (personId) {
      sessionStorage.setItem('highlightPersonId', personId)
      // Auto-scroll to the person after a short delay to allow page to load
      setTimeout(() => {
        const element = document.getElementById(`person-${personId}`)
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' })
          element.classList.add('bg-yellow-100', 'border-yellow-300', 'border-2')
          setTimeout(() => {
            element.classList.remove('bg-yellow-100', 'border-yellow-300', 'border-2')
          }, 3000)
        }
      }, 500)
    }
  }

  const renderPage = () => {
    switch (activePage) {
      case 'dashboard':
        return <Dashboard />
      case 'catalog':
        return <BookCatalog />
      case 'members':
        return <MemberManagement />
      case 'visitors':
        return <VisitorsManagement />
      case 'borrowing':
        return <BorrowingSystem />
      case 'attendance':
        return <UnifiedAttendance />
      case 'tracking':
        return <AttendanceTracking />
      case 'users':
        return <UserManagement />
      case 'reports':
        return <Reports />
      case 'settings':
        return <Settings />
      default:
        return <Dashboard />
    }
  }

  return (
    <ProtectedRoute>
      <DataInitializer />
      <SampleNotifications />
      <div className="min-h-screen bg-gray-50">
        <Navbar onNavigate={handleNavigateFromSearch} />
        <div className="flex">
          <Sidebar activePage={activePage} setActivePage={setActivePage} />
          <main className="flex-1 p-6">
            {renderPage()}
          </main>
        </div>
      </div>
    </ProtectedRoute>
  )
}
