'use client'

interface NotificationChannel {
  email: boolean
  sms: boolean
  push: boolean
}

interface NotificationSettings {
  email: boolean
  sms: boolean
  push: boolean
  overdue: boolean
  reservations: boolean
  newBooks: boolean
  systemUpdates: boolean
  borrowingReminders: boolean
  returnReminders: boolean
  overdueAlerts: boolean
  frequency: 'immediate' | 'daily' | 'weekly'
  quietHours: {
    enabled: boolean
    start: string
    end: string
  }
  emailSettings: {
    overdueReminders: boolean
    reservationAlerts: boolean
    borrowingConfirmations: boolean
    returnReminders: boolean
  }
}

class NotificationService {
  private settings: NotificationSettings

  constructor(settings: NotificationSettings) {
    this.settings = settings
  }

  // Check if notifications are enabled for a specific channel
  isChannelEnabled(channel: keyof NotificationChannel): boolean {
    return this.settings[channel] || false
  }

  // Check if a specific notification type is enabled
  isNotificationEnabled(type: keyof NotificationSettings): boolean {
    return this.settings[type] || false
  }

  // Check if we're in quiet hours
  isInQuietHours(): boolean {
    if (!this.settings.quietHours.enabled) return false

    const now = new Date()
    const currentTime = now.getHours() * 60 + now.getMinutes()
    
    const [startHour, startMin] = this.settings.quietHours.start.split(':').map(Number)
    const [endHour, endMin] = this.settings.quietHours.end.split(':').map(Number)
    
    const startTime = startHour * 60 + startMin
    const endTime = endHour * 60 + endMin

    // Handle overnight quiet hours (e.g., 22:00 to 08:00)
    if (startTime > endTime) {
      return currentTime >= startTime || currentTime <= endTime
    }
    
    return currentTime >= startTime && currentTime <= endTime
  }

  // Send email notification
  async sendEmailNotification(to: string, subject: string, message: string): Promise<boolean> {
    if (!this.isChannelEnabled('email') || this.isInQuietHours()) {
      return false
    }

    try {
      // In a real implementation, you would integrate with an email service
      // For now, we'll simulate the email sending
      console.log(`📧 Email sent to ${to}: ${subject}`)
      console.log(`Message: ${message}`)
      
      // Simulate API call to email service
      const response = await fetch('/api/notifications/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to, subject, message })
      })
      
      return response.ok
    } catch (error) {
      console.error('Failed to send email notification:', error)
      return false
    }
  }

  // Send SMS notification
  async sendSMSNotification(to: string, message: string): Promise<boolean> {
    if (!this.isChannelEnabled('sms') || this.isInQuietHours()) {
      return false
    }

    try {
      // In a real implementation, you would integrate with an SMS service like Twilio
      console.log(`📱 SMS sent to ${to}: ${message}`)
      
      // Simulate API call to SMS service
      const response = await fetch('/api/notifications/sms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to, message })
      })
      
      return response.ok
    } catch (error) {
      console.error('Failed to send SMS notification:', error)
      return false
    }
  }

  // Send push notification
  async sendPushNotification(title: string, message: string, data?: any): Promise<boolean> {
    if (!this.isChannelEnabled('push') || this.isInQuietHours()) {
      return false
    }

    try {
      // Check if browser supports notifications
      if (!('Notification' in window)) {
        console.warn('This browser does not support notifications')
        return false
      }

      // Request permission if not granted
      if (Notification.permission === 'default') {
        const permission = await Notification.requestPermission()
        if (permission !== 'granted') {
          console.warn('Notification permission denied')
          return false
        }
      }

      if (Notification.permission === 'granted') {
        const notification = new Notification(title, {
          body: message,
          icon: '/favicon.ico',
          data: data
        })

        // Auto-close after 5 seconds
        setTimeout(() => notification.close(), 5000)
        
        return true
      }

      return false
    } catch (error) {
      console.error('Failed to send push notification:', error)
      return false
    }
  }

  // Send notification to all enabled channels
  async sendNotification(
    type: keyof NotificationSettings,
    title: string,
    message: string,
    recipient?: { email?: string; phone?: string }
  ): Promise<{ email: boolean; sms: boolean; push: boolean }> {
    if (!this.isNotificationEnabled(type)) {
      return { email: false, sms: false, push: false }
    }

    const results = {
      email: false,
      sms: false,
      push: false
    }

    // Send email if enabled and recipient has email
    if (this.isChannelEnabled('email') && recipient?.email) {
      results.email = await this.sendEmailNotification(recipient.email, title, message)
    }

    // Send SMS if enabled and recipient has phone
    if (this.isChannelEnabled('sms') && recipient?.phone) {
      results.sms = await this.sendSMSNotification(recipient.phone, message)
    }

    // Send push notification (no recipient needed)
    if (this.isChannelEnabled('push')) {
      results.push = await this.sendPushNotification(title, message)
    }

    return results
  }

  // Update settings
  updateSettings(newSettings: NotificationSettings): void {
    this.settings = { ...this.settings, ...newSettings }
  }

  // Get current settings
  getSettings(): NotificationSettings {
    return { ...this.settings }
  }
}

export default NotificationService
export type { NotificationSettings, NotificationChannel }
