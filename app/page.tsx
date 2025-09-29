'use client'

import { useState, useEffect } from 'react'
import { useAuth } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import Navbar from './components/Navbar'
import Sidebar from './components/Sidebar'
import SampleNotifications from './components/SampleNotifications'
// import DataInitializer from './components/DataInitializer' // Disabled - manual operations only
import Dashboard from './pages/Dashboard'
import BookCatalog from './pages/BookCatalog'
import UnifiedPeopleManagement from './pages/UnifiedPeopleManagement'
import BorrowingSystem from './pages/BorrowingSystem'
import AttendanceManagement from './pages/AttendanceManagement'
import UnifiedAttendance from './pages/UnifiedAttendance'
import AttendanceTracking from './pages/AttendanceTracking'
import UserManagement from './pages/UserManagement'
import Reports from './pages/Reports'
import LibraryStats from './pages/LibraryStats'
import Settings from './pages/Settings'

export default function Home() {
  const [activePage, setActivePage] = useState('dashboard')
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const { state } = useAuth()

  // Close sidebar when clicking outside on mobile
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsSidebarOpen(false)
      }
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Navigation function for search results
  const handleNavigateFromSearch = (page: string, personId?: string) => {
    setActivePage(page)
    setIsSidebarOpen(false) // Close sidebar on mobile when navigating
    
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

  const handlePageChange = (page: string) => {
    setActivePage(page)
    setIsSidebarOpen(false) // Close sidebar on mobile when changing pages
  }

  const renderPage = () => {
    switch (activePage) {
      case 'dashboard':
        return <Dashboard />
      case 'catalog':
        return <BookCatalog />
      case 'people':
        return <UnifiedPeopleManagement />
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
      case 'library-stats':
        return <LibraryStats />
      case 'settings':
        return <Settings />
      default:
        return <Dashboard />
    }
  }

  return (
    <ProtectedRoute>
      {/* <DataInitializer /> - Disabled: Manual operations only */}
      <SampleNotifications />
      <div className="min-h-screen bg-gray-50">
        <Navbar 
          onNavigate={handleNavigateFromSearch} 
          onMenuToggle={() => setIsSidebarOpen(!isSidebarOpen)}
          isSidebarOpen={isSidebarOpen}
        />
        
        {/* Mobile overlay */}
        {isSidebarOpen && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}
        
        <div className="flex">
          {/* Sidebar */}
          <div className={`
            ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
            md:translate-x-0
            fixed md:relative 
            z-50 md:z-auto
            transition-transform duration-300 ease-in-out
            w-64
          `}>
            <Sidebar 
              activePage={activePage} 
              setActivePage={handlePageChange}
              onClose={() => setIsSidebarOpen(false)}
            />
          </div>
          
          {/* Main content */}
          <main className="flex-1 p-4 md:p-6 min-h-screen">
            {renderPage()}
          </main>
        </div>
      </div>
    </ProtectedRoute>
  )
}
