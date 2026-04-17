import { auth, clerkClient } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const { role } = await req.json()
    if (role !== 'teacher') {
      return new NextResponse('Invalid role requested', { status: 400 })
    }

    const client = await clerkClient()

    await client.users.updateUserMetadata(userId, {
      publicMetadata: {
        roleRequest: role
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error requesting role:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}
