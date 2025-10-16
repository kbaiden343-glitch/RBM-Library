'use client'

import { useNotifications } from '../hooks/useNotifications'
import { useAuth } from '../context/AuthContext'

// Notification triggers for library events
export const useLibraryNotifications = () => {
  const { sendNotification } = useNotifications()
  const { user } = useAuth()

  // Send notification when a book is borrowed
  const notifyBookBorrowed = async (bookTitle: string, borrowerName: string, dueDate: string) => {
    await sendNotification(
      'borrowingReminders',
      '📚 Book Borrowed',
      `${borrowerName} has borrowed "${bookTitle}". Due date: ${dueDate}`,
      { email: user?.email }
    )
  }

  // Send notification when a book is returned
  const notifyBookReturned = async (bookTitle: string, borrowerName: string) => {
    await sendNotification(
      'returnReminders',
      '📖 Book Returned',
      `${borrowerName} has returned "${bookTitle}"`,
      { email: user?.email }
    )
  }

  // Send notification when a book becomes overdue
  const notifyBookOverdue = async (bookTitle: string, borrowerName: string, daysOverdue: number) => {
    await sendNotification(
      'overdueAlerts',
      '⚠️ Book Overdue',
      `"${bookTitle}" borrowed by ${borrowerName} is ${daysOverdue} days overdue`,
      { email: user?.email, phone: user?.phone }
    )
  }

  // Send notification when a new book is added
  const notifyNewBookAdded = async (bookTitle: string, author: string) => {
    await sendNotification(
      'newBooks',
      '🆕 New Book Added',
      `New book "${bookTitle}" by ${author} has been added to the library`,
      { email: user?.email }
    )
  }

  // Send notification when a reservation is made
  const notifyReservationMade = async (bookTitle: string, borrowerName: string) => {
    await sendNotification(
      'reservations',
      '📋 Book Reserved',
      `${borrowerName} has reserved "${bookTitle}"`,
      { email: user?.email }
    )
  }

  // Send notification when a reservation is ready
  const notifyReservationReady = async (bookTitle: string, borrowerName: string) => {
    await sendNotification(
      'reservations',
      '✅ Reservation Ready',
      `"${bookTitle}" is now available for ${borrowerName}`,
      { email: user?.email, phone: user?.phone }
    )
  }

  // Send notification for system updates
  const notifySystemUpdate = async (updateMessage: string) => {
    await sendNotification(
      'systemUpdates',
      '⚙️ System Update',
      updateMessage,
      { email: user?.email }
    )
  }

  // Send notification for maintenance
  const notifyMaintenance = async (maintenanceMessage: string) => {
    await sendNotification(
      'systemUpdates',
      '🔧 System Maintenance',
      maintenanceMessage,
      { email: user?.email }
    )
  }

  // Send reminder notification
  const notifyReminder = async (title: string, message: string, type: string = 'borrowingReminders') => {
    await sendNotification(
      type,
      `🔔 ${title}`,
      message,
      { email: user?.email, phone: user?.phone }
    )
  }

  return {
    notifyBookBorrowed,
    notifyBookReturned,
    notifyBookOverdue,
    notifyNewBookAdded,
    notifyReservationMade,
    notifyReservationReady,
    notifySystemUpdate,
    notifyMaintenance,
    notifyReminder
  }
}
