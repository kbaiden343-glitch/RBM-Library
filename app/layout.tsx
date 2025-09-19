import './globals.css'
import { Inter } from 'next/font/google'
import { Toaster } from 'react-hot-toast'
import { LibraryProvider } from './context/LibraryContext'
import { AuthProvider } from './context/AuthContext'
import { NotificationProvider } from './context/NotificationContext'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Robert Aboagye Mensah Community Library',
  description: 'Community Library Management System',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <NotificationProvider>
            <LibraryProvider>
              {children}
              <Toaster position="top-right" />
            </LibraryProvider>
          </NotificationProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
