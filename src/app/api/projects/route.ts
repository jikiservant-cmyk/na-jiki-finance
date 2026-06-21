import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const projects = await db.portfolioProject.findMany({
      where: { published: true },
      orderBy: { sortOrder: 'asc' },
    })
    return NextResponse.json(projects)
  } catch (error) {
    console.error('Projects API error:', error)
    return NextResponse.json({ error: 'Failed to fetch projects' }, { status: 500 })
  }
}
