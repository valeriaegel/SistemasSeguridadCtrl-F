import { clerkClient } from '@clerk/nextjs/server'

export type UserRole = 'student' | 'teacher' | 'admin'

export async function assignUserRole(userId: string, role: UserRole) {
  const client = await clerkClient()
  await client.users.updateUserMetadata(userId, {
    publicMetadata: {
      role: role,
    },
  })
}

export async function getUserRole(userId: string): Promise<UserRole | null> {
  const client = await clerkClient()
  const user = await client.users.getUser(userId)
  return (user.publicMetadata?.role as UserRole) ?? null
}

//Luego puedes importarlo donde lo necesites:
//import { assignUserRole } from '@/lib/user-roles'

//await assignUserRole('user_123', 'student')