'use client'

import React, { useState, useEffect } from 'react'
import { Bell, Settings, CheckCircle, XCircle, Clock, Mail, Smartphone, Monitor } from 'lucide-react'
import { useNotifications } from '../hooks/useNotifications'
import { useLibraryNotifications } from '../hooks/useLibraryNotifications'

interface NotificationHistory {
  id: string
  type: string
  title: string
  message: string
  timestamp: Date
  status: 'sent' | 'failed' | 'pending'
  channels: {
    email: boolean
    sms: boolean
    push: boolean
  }
}

const NotificationDashboard: React.FC = () => {
  const { 
    notificationService, 
    testEmailNotification, 
    testSMSNotification, 
    testPushNotification,
    requestNotificationPermission 
  } = useNotifications()
  
  const { 
    notifyBookBorrowed, 
    notifyBookReturned, 
    notifyBookOverdue,
    notifyNewBookAdded,
    notifyReservationMade 
  } = useLibraryNotifications()

  const [notificationHistory, setNotificationHistory] = useState<NotificationHistory[]>([])
  const [isTesting, setIsTesting] = useState(false)
  const [isInitializing, setIsInitializing] = useState(true)

  // Initialize notification service
  useEffect(() => {
    if (notificationService) {
      setIsInitializing(false)
    }
  }, [notificationService])

  // Add notification to history
  const addToHistory = (notification: Omit<NotificationHistory, 'id' | 'timestamp'>) => {
    const newNotification: NotificationHistory = {
      ...notification,
      id: Date.now().toString(),
      timestamp: new Date()
    }
    setNotificationHistory(prev => [newNotification, ...prev.slice(0, 49)]) // Keep last 50
  }

  // Test all notification types
  const testAllNotifications = async () => {
    setIsTesting(true)
    
    try {
      // Test email
      await testEmailNotification()
      addToHistory({
        type: 'email',
        title: 'Test Email Notification',
        message: 'This is a test email notification',
        status: 'sent',
        channels: { email: true, sms: false, push: false }
      })

      // Test SMS
      await testSMSNotification()
      addToHistory({
        type: 'sms',
        title: 'Test SMS Notification',
        message: 'This is a test SMS notification',
        status: 'sent',
        channels: { email: false, sms: true, push: false }
      })

      // Test push
      await testPushNotification()
      addToHistory({
        type: 'push',
        title: 'Test Push Notification',
        message: 'This is a test push notification',
        status: 'sent',
        channels: { email: false, sms: false, push: true }
      })

      // Test library notifications
      await notifyBookBorrowed('Test Book', 'John Doe', '2025-10-23')
      addToHistory({
        type: 'borrowingReminders',
        title: 'Book Borrowed',
        message: 'John Doe has borrowed "Test Book"',
        status: 'sent',
        channels: { email: true, sms: false, push: true }
      })

      await notifyNewBookAdded('New Test Book', 'Test Author')
      addToHistory({
        type: 'newBooks',
        title: 'New Book Added',
        message: 'New book "New Test Book" by Test Author has been added',
        status: 'sent',
        channels: { email: true, sms: false, push: true }
      })

    } catch (error) {
      console.error('Error testing notifications:', error)
    } finally {
      setIsTesting(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'sent':
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'failed':
        return <XCircle className="w-4 h-4 text-red-500" />
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-500" />
      default:
        return <Clock className="w-4 h-4 text-gray-500" />
    }
  }

  const getChannelIcon = (channel: string) => {
    switch (channel) {
      case 'email':
        return <Mail className="w-3 h-3 text-blue-500" />
      case 'sms':
        return <Smartphone className="w-3 h-3 text-green-500" />
      case 'push':
        return <Monitor className="w-3 h-3 text-purple-500" />
      default:
        return null
    }
  }

  // Show loading state while initializing
  if (isInitializing) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center py-12">
          <div className="flex items-center space-x-3">
            <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
            <span className="text-gray-600">Initializing notification service...</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Bell className="w-6 h-6 text-blue-600" />
          <h2 className="text-2xl font-bold text-gray-900">Notification Dashboard</h2>
        </div>
        <button
          onClick={testAllNotifications}
          disabled={isTesting}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
        >
          {isTesting ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Testing...</span>
            </>
          ) : (
            <>
              <Bell className="w-4 h-4" />
              <span>Test All Notifications</span>
            </>
          )}
        </button>
      </div>

      {/* Notification Settings Status */}
      {notificationService && (
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Current Settings</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center space-x-3">
              <Mail className="w-5 h-5 text-blue-500" />
              <div>
                <p className="text-sm font-medium text-gray-900">Email Notifications</p>
                <p className="text-sm text-gray-500">
                  {notificationService.isChannelEnabled('email') ? 'Enabled' : 'Disabled'}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Smartphone className="w-5 h-5 text-green-500" />
              <div>
                <p className="text-sm font-medium text-gray-900">SMS Notifications</p>
                <p className="text-sm text-gray-500">
                  {notificationService.isChannelEnabled('sms') ? 'Enabled' : 'Disabled'}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Monitor className="w-5 h-5 text-purple-500" />
              <div>
                <p className="text-sm font-medium text-gray-900">Push Notifications</p>
                <p className="text-sm text-gray-500">
                  {notificationService.isChannelEnabled('push') ? 'Enabled' : 'Disabled'}
                </p>
              </div>
            </div>
          </div>
          
          {notificationService.isInQuietHours() && (
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800">
                🔕 Currently in quiet hours - notifications are suppressed
              </p>
            </div>
          )}
        </div>
      )}

      {/* Notification History */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Recent Notifications</h3>
        </div>
        <div className="divide-y divide-gray-200">
          {notificationHistory.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              <Bell className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>No notifications sent yet</p>
              <p className="text-sm">Click "Test All Notifications" to see how notifications work</p>
            </div>
          ) : (
            notificationHistory.map((notification) => (
              <div key={notification.id} className="p-6 hover:bg-gray-50">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      {getStatusIcon(notification.status)}
                      <h4 className="text-sm font-medium text-gray-900">{notification.title}</h4>
                      <span className="text-xs text-gray-500">
                        {notification.timestamp.toLocaleTimeString()}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">{notification.message}</p>
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        <span className="text-xs text-gray-500">Channels:</span>
                        {Object.entries(notification.channels).map(([channel, enabled]) => 
                          enabled && (
                            <div key={channel} className="flex items-center space-x-1">
                              {getChannelIcon(channel)}
                              <span className="text-xs text-gray-600 capitalize">{channel}</span>
                            </div>
                          )
                        )}
                      </div>
                      <span className="text-xs text-gray-500">
                        Type: {notification.type}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

export default NotificationDashboard
