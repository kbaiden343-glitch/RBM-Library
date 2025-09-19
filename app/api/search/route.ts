import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')
    const limit = parseInt(searchParams.get('limit') || '10')

    if (!query || query.trim().length < 2) {
      return NextResponse.json({ results: [] })
    }

    const searchTerm = query.trim()

    // Search in persons (members and visitors)
    const persons = await prisma.person.findMany({
      where: {
        OR: [
          { name: { contains: searchTerm, mode: 'insensitive' } },
          { email: { contains: searchTerm, mode: 'insensitive' } },
          { libraryId: { contains: searchTerm, mode: 'insensitive' } },
          { phone: { contains: searchTerm, mode: 'insensitive' } }
        ]
      },
      select: {
        id: true,
        libraryId: true,
        name: true,
        email: true,
        phone: true,
        personType: true,
        status: true,
        membershipDate: true,
        createdAt: true
      },
      orderBy: [
        { name: 'asc' }
      ],
      take: limit
    })

    // Search in legacy members table (for backward compatibility)
    const legacyMembers = await prisma.member.findMany({
      where: {
        OR: [
          { name: { contains: searchTerm, mode: 'insensitive' } },
          { email: { contains: searchTerm, mode: 'insensitive' } },
          { phone: { contains: searchTerm, mode: 'insensitive' } }
        ]
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        status: true,
        membershipDate: true,
        createdAt: true
      },
      orderBy: [
        { name: 'asc' }
      ],
      take: limit
    })

    // Search in users (staff/admin)
    const users = await prisma.user.findMany({
      where: {
        OR: [
          { name: { contains: searchTerm, mode: 'insensitive' } },
          { email: { contains: searchTerm, mode: 'insensitive' } }
        ]
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true
      },
      orderBy: [
        { name: 'asc' }
      ],
      take: limit
    })

    // Format results with navigation info
    const results = [
      // Persons from unified table
      ...persons.map(person => ({
        id: person.id,
        name: person.name,
        email: person.email,
        phone: person.phone || '',
        libraryId: person.libraryId || '',
        type: person.personType === 'MEMBER' ? 'member' : 'visitor',
        status: person.status,
        membershipDate: person.membershipDate,
        createdAt: person.createdAt,
        navigateTo: person.personType === 'MEMBER' ? 'members' : 'visitors',
        displayType: person.personType === 'MEMBER' ? 'Member' : 'Visitor',
        subtitle: `${person.personType === 'MEMBER' ? 'Member' : 'Visitor'} • ${person.libraryId || 'No ID'} • ${person.email}`
      })),
      
      // Legacy members
      ...legacyMembers.map(member => ({
        id: member.id,
        name: member.name,
        email: member.email,
        phone: member.phone || '',
        libraryId: '',
        type: 'legacy_member',
        status: member.status,
        membershipDate: member.membershipDate,
        createdAt: member.createdAt,
        navigateTo: 'members',
        displayType: 'Member (Legacy)',
        subtitle: `Member (Legacy) • ${member.email}`
      })),
      
      // System users
      ...users.map(user => ({
        id: user.id,
        name: user.name,
        email: user.email,
        phone: '',
        libraryId: '',
        type: 'user',
        status: 'ACTIVE',
        membershipDate: null,
        createdAt: user.createdAt,
        navigateTo: 'users',
        displayType: `${user.role} User`,
        subtitle: `${user.role} User • ${user.email}`
      }))
    ]

    // Sort all results by name and remove duplicates
    const uniqueResults = results
      .filter((result, index, self) => 
        index === self.findIndex(r => r.email === result.email && r.name === result.name)
      )
      .sort((a, b) => a.name.localeCompare(b.name))
      .slice(0, limit)

    return NextResponse.json({
      results: uniqueResults,
      total: uniqueResults.length,
      query: searchTerm
    })

  } catch (error) {
    console.error('Search error:', error)
    return NextResponse.json(
      { error: 'Failed to perform search', results: [] },
      { status: 500 }
    )
  }
}
