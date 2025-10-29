'use client'

import { useCallback, useEffect, useState } from 'react'
import NotificationService from '../lib/notificationService'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'

interface NotificationHook {
  notificationService: NotificationService | null
  sendNotification: (type: string, title: string, message: string, recipient?: { email?: string; phone?: string }) => Promise<void>
  testEmailNotification: () => Promise<void>
  testSMSNotification: () => Promise<void>
  testPushNotification: () => Promise<void>
  requestNotificationPermission: () => Promise<boolean>
}

export const useNotifications = (): NotificationHook => {
  const { state: { user} } = useAuth()
  const [notificationService, setNotificationService] = useState<NotificationService | null>(null)

  // Initialize notification service with user's settings
  useEffect(() => {
    // Default notification settings
    const defaultSettings = {
      email: true,
      sms: true,
      push: true,
      overdue: true,
      reservations: true,
      newBooks: true,
      systemUpdates: true,
      borrowingReminders: true,
      returnReminders: true,
      overdueAlerts: true,
      frequency: 'immediate' as const,
      quietHours: {
        enabled: false,
        start: '22:00',
        end: '08:00'
      },
      emailSettings: {
        overdueReminders: true,
        reservationAlerts: true,
        borrowingConfirmations: true,
        returnReminders: true
      }
    }

    // Use user settings if available, otherwise use defaults
    const settings = defaultSettings
    const service = new NotificationService(settings)
    setNotificationService(service)
  }, [user])

  // Request browser notification permission
  const requestNotificationPermission = useCallback(async (): Promise<boolean> => {
    if (!('Notification' in window)) {
      toast.error('This browser does not support notifications')
      return false
    }

    if (Notification.permission === 'granted') {
      return true
    }

    if (Notification.permission === 'denied') {
      toast.error('Notification permission denied. Please enable notifications in your browser settings.')
      return false
    }

    const permission = await Notification.requestPermission()
    if (permission === 'granted') {
      toast.success('✅ Notification permission granted!')
      return true
    } else {
      toast.error('❌ Notification permission denied')
      return false
    }
  }, [])

  // Send notification to all enabled channels
  const sendNotification = useCallback(async (
    type: string,
    title: string,
    message: string,
    recipient?: { email?: string; phone?: string }
  ) => {
    if (!notificationService) {
      console.warn('Notification service not initialized')
      return
    }

    try {
      const results = await notificationService.sendNotification(
        type as any,
        title,
        message,
        recipient
      )

      const successCount = Object.values(results).filter(Boolean).length
      if (successCount > 0) {
        toast.success(`✅ Notification sent via ${successCount} channel(s)`)
      } else {
        toast.error('❌ Failed to send notification')
      }
    } catch (error) {
      console.error('Error sending notification:', error)
      toast.error('❌ Error sending notification')
    }
  }, [notificationService])

  // Test functions
  const testEmailNotification = useCallback(async () => {
    if (!notificationService) {
      toast.error('Notification service not initialized')
      return
    }

    try {
      const result = await notificationService.sendEmailNotification(
        user?.email || 'test@example.com',
        'Test Email Notification',
        'This is a test email notification from the library management system.'
      )
      
      if (result) {
        toast.success('✅ Test email notification sent successfully!')
      } else {
        toast.error('❌ Failed to send test email notification')
      }
    } catch (error) {
      toast.error('❌ Error sending test email notification')
    }
  }, [notificationService, user?.email])

  const testSMSNotification = useCallback(async () => {
    if (!notificationService) {
      toast.error('Notification service not initialized')
      return
    }

    try {
      const result = await notificationService.sendSMSNotification(
        '+1234567890',
        'Test SMS notification from library system'
      )
      
      if (result) {
        toast.success('✅ Test SMS notification sent successfully!')
      } else {
        toast.error('❌ Failed to send test SMS notification')
      }
    } catch (error) {
      toast.error('❌ Error sending test SMS notification')
    }
  }, [notificationService, user])

  const testPushNotification = useCallback(async () => {
    if (!notificationService) {
      toast.error('Notification service not initialized')
      return
    }

    try {
      const result = await notificationService.sendPushNotification(
        'Test Push Notification',
        'This is a test push notification from the library management system.'
      )
      
      if (result) {
        toast.success('✅ Test push notification sent successfully!')
      } else {
        toast.error('❌ Failed to send test push notification')
      }
    } catch (error) {
      toast.error('❌ Error sending test push notification')
    }
  }, [notificationService])

  return {
    notificationService,
    sendNotification,
    testEmailNotification,
    testSMSNotification,
    testPushNotification,
    requestNotificationPermission
  }
}
