import { NextResponse } from 'next/server'
import { getPublishedProjects } from '@/lib/data'

export async function GET() {
  try {
    const projects = await getPublishedProjects()
    return NextResponse.json(projects)
  } catch (error) {
    console.error('Projects API error:', error)
    return NextResponse.json({ error: 'Failed to fetch projects' }, { status: 500 })
  }
}
