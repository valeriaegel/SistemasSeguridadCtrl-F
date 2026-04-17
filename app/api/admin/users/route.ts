import { auth, clerkClient } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { hasPermission, PERMISSIONS, UserRole } from '@/app/lib/roles'

async function isAdmin() {
  const { userId } = await auth()
  if (!userId) return false

  const client = await clerkClient()
  const user = await client.users.getUser(userId)
  const role = (user.publicMetadata?.role as UserRole) || 'student'

  return hasPermission(role, PERMISSIONS.ADMIN_STUDENTS)
}

export async function GET() {
  if (!(await isAdmin())) {
    return new NextResponse('Unauthorized', { status: 401 })
  }

  const client = await clerkClient()
  const users = await client.users.getUserList()

  const formattedUsers = users.data.map(user => ({
    id: user.id,
    email: user.emailAddresses[0]?.emailAddress,
    firstName: user.firstName,
    lastName: user.lastName,
    imageUrl: user.imageUrl,
    role: (user.publicMetadata?.role as string) || 'student',
    roleRequest: user.publicMetadata?.roleRequest as string | undefined
  }))

  return NextResponse.json(formattedUsers)
}

export async function PATCH(req: Request) {
  if (!(await isAdmin())) {
    return new NextResponse('Unauthorized', { status: 401 })
  }

  const { targetUserId, newRole, approveRequest } = await req.json()
  const client = await clerkClient()

  const targetUser = await client.users.getUser(targetUserId)
  const targetRole = targetUser.publicMetadata?.role as string

  if (targetRole === 'admin') {
    return new NextResponse('No se puede modificar a otro administrador', { status: 403 })
  }

  let publicMetadata: any = { role: newRole }

  // Cleanup request if it's being approved or dismissed implicitly
  if (approveRequest || newRole !== targetRole) {
    publicMetadata.roleRequest = null
  }

  await client.users.updateUserMetadata(targetUserId, {
    publicMetadata
  })

  return NextResponse.json({ success: true })
}
