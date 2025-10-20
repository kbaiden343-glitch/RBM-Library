import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../lib/db'

export async function GET() {
  try {
    // Get the first (and only) settings record
    let settings = await prisma.settings.findFirst()
    
    // If no settings exist, create default settings
    if (!settings) {
      settings = await prisma.settings.create({
        data: {
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
        }
      })
    }
    
    return NextResponse.json(settings)
  } catch (error) {
    console.error('Error fetching settings:', error)
    return NextResponse.json(
      { error: 'Failed to fetch settings' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      libraryName,
      libraryAddress,
      libraryEmail,
      libraryPhone,
      maxBorrowDays,
      maxBooksPerMember,
      overdueFinePerDay,
      notifications,
      theme,
      language
    } = body

    // Validate required fields
    if (!libraryName || maxBorrowDays < 1 || maxBooksPerMember < 1 || overdueFinePerDay < 0) {
      return NextResponse.json(
        { error: 'Invalid settings data' },
        { status: 400 }
      )
    }

    // Get existing settings or create new one
    let settings = await prisma.settings.findFirst()
    
    if (settings) {
      // Update existing settings
      settings = await prisma.settings.update({
        where: { id: settings.id },
        data: {
          libraryName,
          libraryAddress,
          libraryEmail,
          libraryPhone,
          maxBorrowDays: parseInt(maxBorrowDays),
          maxBooksPerMember: parseInt(maxBooksPerMember),
          overdueFinePerDay: parseFloat(overdueFinePerDay),
          notifications,
          theme,
          language
        }
      })
    } else {
      // Create new settings
      settings = await prisma.settings.create({
        data: {
          libraryName,
          libraryAddress,
          libraryEmail,
          libraryPhone,
          maxBorrowDays: parseInt(maxBorrowDays),
          maxBooksPerMember: parseInt(maxBooksPerMember),
          overdueFinePerDay: parseFloat(overdueFinePerDay),
          notifications,
          theme,
          language
        }
      })
    }

    return NextResponse.json(settings)
  } catch (error) {
    console.error('Error updating settings:', error)
    return NextResponse.json(
      { error: 'Failed to update settings' },
      { status: 500 }
    )
  }
}
