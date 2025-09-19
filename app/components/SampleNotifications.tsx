'use client'

import { useEffect } from 'react'
import { useNotifications } from '../context/NotificationContext'

const SampleNotifications = () => {
  const { addNotification } = useNotifications()

  useEffect(() => {
    // Add some sample notifications on first load
    const hasShownWelcome = localStorage.getItem('library_welcome_shown')
    
    if (!hasShownWelcome) {
      setTimeout(() => {
        addNotification({
          type: 'info',
          title: 'Welcome to the Library System!',
          message: 'You can now manage books, members, and borrowing activities. Explore the different sections using the sidebar.',
          action: {
            label: 'Get Started',
            onClick: () => console.log('Getting started...')
          }
        })
      }, 2000)

      setTimeout(() => {
        addNotification({
          type: 'warning',
          title: 'System Maintenance',
          message: 'Scheduled maintenance will occur tonight from 2 AM to 4 AM. Some features may be temporarily unavailable.',
        })
      }, 5000)

      setTimeout(() => {
        addNotification({
          type: 'success',
          title: 'New Features Available',
          message: 'Check out the new QR code scanner and enhanced reporting features in the latest update!',
        })
      }, 8000)

      localStorage.setItem('library_welcome_shown', 'true')
    }
  }, [addNotification])

  return null
}

export default SampleNotifications
