import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../lib/db'

export async function POST(request: NextRequest) {
  try {
    const { type } = await request.json()
    
    if (type === 'export') {
      // Export all library data
      const [books, persons, borrowings, reservations, attendance, settings] = await Promise.all([
        prisma.book.findMany({
          include: {
            borrowings: true,
            reservations: true
          }
        }),
        prisma.person.findMany({
          include: {
            borrowings: true,
            reservations: true,
            attendance: true
          }
        }),
        prisma.borrowing.findMany({
          include: {
            book: true,
            person: true,
            member: true
          }
        }),
        prisma.reservation.findMany({
          include: {
            book: true,
            person: true,
            member: true
          }
        }),
        prisma.attendance.findMany({
          include: {
            person: true,
            member: true
          }
        }),
        prisma.settings.findFirst()
      ])

      const exportData = {
        exportDate: new Date().toISOString(),
        version: '1.0',
        libraryName: settings?.libraryName || 'Library',
        data: {
          books,
          persons,
          borrowings,
          reservations,
          attendance,
          settings
        }
      }

      // Create filename with timestamp
      const timestamp = new Date().toISOString().split('T')[0]
      const filename = `library-export-${timestamp}.json`

      // Return the data with proper headers for download
      return new NextResponse(JSON.stringify(exportData, null, 2), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Content-Disposition': `attachment; filename="${filename}"`
        }
      })
    } else if (type === 'backup') {
      // Create a backup (same as export but with different filename)
      const [books, persons, borrowings, reservations, attendance, settings] = await Promise.all([
        prisma.book.findMany({
          include: {
            borrowings: true,
            reservations: true
          }
        }),
        prisma.person.findMany({
          include: {
            borrowings: true,
            reservations: true,
            attendance: true
          }
        }),
        prisma.borrowing.findMany({
          include: {
            book: true,
            person: true,
            member: true
          }
        }),
        prisma.reservation.findMany({
          include: {
            book: true,
            person: true,
            member: true
          }
        }),
        prisma.attendance.findMany({
          include: {
            person: true,
            member: true
          }
        }),
        prisma.settings.findFirst()
      ])

      const backupData = {
        backupDate: new Date().toISOString(),
        version: '1.0',
        libraryName: settings?.libraryName || 'Library',
        data: {
          books,
          persons,
          borrowings,
          reservations,
          attendance,
          settings
        }
      }

      // Create filename with timestamp
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
      const filename = `library-backup-${timestamp}.json`

      // Return the data with proper headers for download
      return new NextResponse(JSON.stringify(backupData, null, 2), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Content-Disposition': `attachment; filename="${filename}"`
        }
      })
    } else {
      return NextResponse.json(
        { error: 'Invalid backup type. Use "export" or "backup"' },
        { status: 400 }
      )
    }
  } catch (error) {
    console.error('Error creating backup/export:', error)
    return NextResponse.json(
      { error: 'Failed to create backup/export' },
      { status: 500 }
    )
  }
}
