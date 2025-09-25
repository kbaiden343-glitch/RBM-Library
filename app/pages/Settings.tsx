'use client'

import React, { useState, useEffect } from 'react'
import { 
  Settings as SettingsIcon, 
  User, 
  Bell, 
  Shield, 
  Database, 
  Palette, 
  Save, 
  Download, 
  Upload,
  Eye,
  EyeOff,
  CheckCircle,
  AlertCircle,
  Loader2,
  RefreshCw
} from 'lucide-react'
import toast from 'react-hot-toast'

interface SettingsData {
  id?: string
  libraryName: string
  libraryAddress: string
  libraryEmail: string
  libraryPhone: string
  maxBorrowDays: number
  maxBooksPerMember: number
  overdueFinePerDay: number
  notifications: {
    email: boolean
    sms: boolean
    overdue: boolean
    reservations: boolean
  }
  theme: string
  language: string
}

interface SecurityForm {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

const Settings = () => {
  const [activeTab, setActiveTab] = useState('general')
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  })
  
  const [settings, setSettings] = useState<SettingsData>({
    libraryName: 'Robert Aboagye Mensah Community Library',
    libraryAddress: '',
    libraryEmail: '',
    libraryPhone: '',
    maxBorrowDays: 14,
    maxBooksPerMember: 5,
    overdueFinePerDay: 0.50,
    notifications: {
      email: true,
      sms: false,
      overdue: true,
      reservations: true
    },
    theme: 'light',
    language: 'en'
  })

  const [securityForm, setSecurityForm] = useState<SecurityForm>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })

  const tabs = [
    { id: 'general', label: 'General', icon: SettingsIcon },
    { id: 'borrowing', label: 'Borrowing Rules', icon: User },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'backup', label: 'Backup & Export', icon: Database },
    { id: 'appearance', label: 'Appearance', icon: Palette }
  ]

  // Load settings on component mount
  useEffect(() => {
    loadSettings()
  }, [])

  // Apply theme changes immediately
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('theme', settings.theme)
      document.documentElement.setAttribute('data-theme', settings.theme)
      
      // Apply theme classes to body
      if (settings.theme === 'dark') {
        document.documentElement.classList.add('dark')
      } else {
        document.documentElement.classList.remove('dark')
      }
    }
  }, [settings.theme])

  const loadSettings = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/settings')
      if (response.ok) {
        const data = await response.json()
        setSettings(data)
      } else {
        toast.error('Failed to load settings')
      }
    } catch (error) {
      console.error('Error loading settings:', error)
      toast.error('Failed to load settings')
    } finally {
      setLoading(false)
    }
  }

  const handleSettingChange = (key: string, value: any) => {
    if (key.includes('.')) {
      const [parent, child] = key.split('.')
      setSettings(prev => ({
        ...prev,
        [parent]: {
          ...(prev as any)[parent],
          [child]: value
        }
      }))
    } else {
      setSettings(prev => ({
        ...prev,
        [key]: value
      }))
    }
  }

  const handleSave = async () => {
    // Validate required fields
    if (!settings.libraryName.trim()) {
      toast.error('Library name is required')
      return
    }
    
    if (settings.maxBorrowDays < 1) {
      toast.error('Maximum borrow days must be at least 1')
      return
    }
    
    if (settings.maxBooksPerMember < 1) {
      toast.error('Maximum books per member must be at least 1')
      return
    }
    
    if (settings.overdueFinePerDay < 0) {
      toast.error('Overdue fine cannot be negative')
      return
    }

    setSaving(true)
    try {
      const response = await fetch('/api/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settings),
      })

      if (response.ok) {
        const updatedSettings = await response.json()
        setSettings(updatedSettings)
        toast.success('Settings saved successfully!')
      } else {
        const error = await response.json()
        toast.error(error.error || 'Failed to save settings')
      }
    } catch (error) {
      console.error('Error saving settings:', error)
      toast.error('Failed to save settings. Please check your connection.')
    } finally {
      setSaving(false)
    }
  }

  const handleExport = async () => {
    try {
      const response = await fetch('/api/settings/backup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ type: 'export' }),
      })

      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `library-export-${new Date().toISOString().split('T')[0]}.json`
        a.style.display = 'none'
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
        toast.success('Library data exported successfully!')
      } else {
        const error = await response.json()
        toast.error(error.error || 'Failed to export data')
      }
    } catch (error) {
      console.error('Error exporting data:', error)
      toast.error('Failed to export data. Please check your connection.')
    }
  }

  const handleBackup = async () => {
    try {
      const response = await fetch('/api/settings/backup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ type: 'backup' }),
      })

      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `library-backup-${new Date().toISOString().replace(/[:.]/g, '-')}.json`
        a.style.display = 'none'
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
        toast.success('Backup created successfully!')
      } else {
        const error = await response.json()
        toast.error(error.error || 'Failed to create backup')
      }
    } catch (error) {
      console.error('Error creating backup:', error)
      toast.error('Failed to create backup. Please check your connection.')
    }
  }

  const handleSecuritySubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (securityForm.newPassword !== securityForm.confirmPassword) {
      toast.error('New passwords do not match')
      return
    }

    if (securityForm.newPassword.length < 6) {
      toast.error('New password must be at least 6 characters long')
      return
    }

    try {
      const response = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          currentPassword: securityForm.currentPassword,
          newPassword: securityForm.newPassword,
        }),
      })

      if (response.ok) {
        toast.success('Password changed successfully!')
        setSecurityForm({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        })
      } else {
        const error = await response.json()
        toast.error(error.error || 'Failed to change password')
      }
    } catch (error) {
      console.error('Error changing password:', error)
      toast.error('Failed to change password')
    }
  }

  const togglePasswordVisibility = (field: keyof typeof showPasswords) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }))
  }

  const renderGeneralSettings = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Library Name *
        </label>
        <input
          type="text"
          value={settings.libraryName}
          onChange={(e) => handleSettingChange('libraryName', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 text-gray-900 bg-white"
          required
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Library Address
        </label>
        <textarea
          rows={3}
          value={settings.libraryAddress}
          onChange={(e) => handleSettingChange('libraryAddress', e.target.value)}
          placeholder="Enter library address..."
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 text-gray-900 bg-white"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Contact Information
        </label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <input
              type="email"
              value={settings.libraryEmail}
              onChange={(e) => handleSettingChange('libraryEmail', e.target.value)}
              placeholder="Email address"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 text-gray-900 bg-white"
            />
          </div>
          <div>
            <input
              type="tel"
              value={settings.libraryPhone}
              onChange={(e) => handleSettingChange('libraryPhone', e.target.value)}
              placeholder="Phone number"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 text-gray-900 bg-white"
            />
          </div>
        </div>
      </div>
    </div>
  )

  const renderBorrowingSettings = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Maximum Borrow Days *
        </label>
        <input
          type="number"
          min="1"
          value={settings.maxBorrowDays}
          onChange={(e) => handleSettingChange('maxBorrowDays', parseInt(e.target.value))}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 text-gray-900 bg-white"
          required
        />
        <p className="text-sm text-gray-500 mt-1">Number of days a book can be borrowed</p>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Maximum Books Per Member *
        </label>
        <input
          type="number"
          min="1"
          value={settings.maxBooksPerMember}
          onChange={(e) => handleSettingChange('maxBooksPerMember', parseInt(e.target.value))}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 text-gray-900 bg-white"
          required
        />
        <p className="text-sm text-gray-500 mt-1">Maximum number of books a member can borrow at once</p>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Overdue Fine Per Day ($) *
        </label>
        <input
          type="number"
          step="0.01"
          min="0"
          value={settings.overdueFinePerDay}
          onChange={(e) => handleSettingChange('overdueFinePerDay', parseFloat(e.target.value))}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 text-gray-900 bg-white"
          required
        />
        <p className="text-sm text-gray-500 mt-1">Fine amount charged per day for overdue books</p>
      </div>
    </div>
  )

  const renderNotificationSettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Notification Preferences</h3>
        <div className="space-y-4">
          {[
            { key: 'email', label: 'Email Notifications', description: 'Receive notifications via email' },
            { key: 'sms', label: 'SMS Notifications', description: 'Receive notifications via SMS' },
            { key: 'overdue', label: 'Overdue Alerts', description: 'Get notified about overdue books' },
            { key: 'reservations', label: 'Reservation Alerts', description: 'Get notified about reservations' }
          ].map((notification) => (
            <div key={notification.key} className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900">{notification.label}</p>
                <p className="text-sm text-gray-500">{notification.description}</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.notifications[notification.key as keyof typeof settings.notifications]}
                  onChange={(e) => handleSettingChange(`notifications.${notification.key}`, e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          ))}
        </div>
      </div>
    </div>
  )

  const renderSecuritySettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Change Password</h3>
        <form onSubmit={handleSecuritySubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Current Password
            </label>
            <div className="relative">
              <input
                type={showPasswords.current ? "text" : "password"}
                value={securityForm.currentPassword}
                onChange={(e) => setSecurityForm(prev => ({ ...prev, currentPassword: e.target.value }))}
                className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 text-gray-900 bg-white"
                required
              />
              <button
                type="button"
                onClick={() => togglePasswordVisibility('current')}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                {showPasswords.current ? (
                  <EyeOff className="h-5 w-5 text-gray-400" />
                ) : (
                  <Eye className="h-5 w-5 text-gray-400" />
                )}
              </button>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              New Password
            </label>
            <div className="relative">
              <input
                type={showPasswords.new ? "text" : "password"}
                value={securityForm.newPassword}
                onChange={(e) => setSecurityForm(prev => ({ ...prev, newPassword: e.target.value }))}
                className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 text-gray-900 bg-white"
                required
                minLength={6}
              />
              <button
                type="button"
                onClick={() => togglePasswordVisibility('new')}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                {showPasswords.new ? (
                  <EyeOff className="h-5 w-5 text-gray-400" />
                ) : (
                  <Eye className="h-5 w-5 text-gray-400" />
                )}
              </button>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Confirm New Password
            </label>
            <div className="relative">
              <input
                type={showPasswords.confirm ? "text" : "password"}
                value={securityForm.confirmPassword}
                onChange={(e) => setSecurityForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 text-gray-900 bg-white"
                required
                minLength={6}
              />
              <button
                type="button"
                onClick={() => togglePasswordVisibility('confirm')}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                {showPasswords.confirm ? (
                  <EyeOff className="h-5 w-5 text-gray-400" />
                ) : (
                  <Eye className="h-5 w-5 text-gray-400" />
                )}
              </button>
            </div>
          </div>
          
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
          >
            <Shield className="h-5 w-5" />
            <span>Change Password</span>
          </button>
        </form>
      </div>
    </div>
  )

  const renderBackupSettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Backup & Export</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 border border-gray-200 rounded-lg">
            <div className="flex items-center space-x-3 mb-3">
              <Download className="h-8 w-8 text-green-600" />
              <div>
                <h4 className="font-medium text-gray-900">Export Library Data</h4>
                <p className="text-sm text-gray-500">Download all library data as JSON</p>
              </div>
            </div>
            <button
              onClick={handleExport}
              className="w-full bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center justify-center space-x-2"
            >
              <Download className="h-5 w-5" />
              <span>Export Data</span>
            </button>
          </div>
          
          <div className="p-4 border border-gray-200 rounded-lg">
            <div className="flex items-center space-x-3 mb-3">
              <Database className="h-8 w-8 text-blue-600" />
              <div>
                <h4 className="font-medium text-gray-900">Create Backup</h4>
                <p className="text-sm text-gray-500">Create a complete backup with timestamp</p>
              </div>
            </div>
            <button
              onClick={handleBackup}
              className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center justify-center space-x-2"
            >
              <Database className="h-5 w-5" />
              <span>Create Backup</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )

  const renderAppearanceSettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Appearance</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Theme
            </label>
            <select
              value={settings.theme}
              onChange={(e) => handleSettingChange('theme', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 text-gray-900 bg-white"
            >
              <option value="light">Light</option>
              <option value="dark">Dark</option>
              <option value="auto">Auto (System)</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Language
            </label>
            <select
              value={settings.language}
              onChange={(e) => handleSettingChange('language', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 text-gray-900 bg-white"
            >
              <option value="en">English</option>
              <option value="es">Español</option>
              <option value="fr">Français</option>
              <option value="de">Deutsch</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  )

  const renderTabContent = () => {
    switch (activeTab) {
      case 'general':
        return renderGeneralSettings()
      case 'borrowing':
        return renderBorrowingSettings()
      case 'notifications':
        return renderNotificationSettings()
      case 'security':
        return renderSecuritySettings()
      case 'backup':
        return renderBackupSettings()
      case 'appearance':
        return renderAppearanceSettings()
      default:
        return renderGeneralSettings()
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <div className="text-center">
          <p className="text-gray-600 font-medium">Loading settings...</p>
          <p className="text-sm text-gray-500">Please wait while we fetch your preferences</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600 mt-2">Manage your library system preferences</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <button
            onClick={handleSave}
            disabled={saving}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 w-full sm:w-auto justify-center"
          >
            {saving ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Save className="h-5 w-5" />
            )}
            <span>{saving ? 'Saving...' : 'Save Changes'}</span>
          </button>
          
          <button
            onClick={loadSettings}
            disabled={loading}
            className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 w-full sm:w-auto justify-center"
          >
            {loading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <RefreshCw className="h-5 w-5" />
            )}
            <span>Reset</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Settings Navigation */}
        <div className="lg:col-span-1">
          <nav className="space-y-1">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center space-x-3 px-3 py-2 text-left rounded-lg transition-colors ${
                    activeTab === tab.id
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span className="font-medium">{tab.label}</span>
                </button>
              )
            })}
          </nav>
        </div>

        {/* Settings Content */}
        <div className="lg:col-span-3">
          <div className="bg-white p-4 lg:p-6 rounded-lg shadow-sm border border-gray-200">
            {renderTabContent()}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Settings