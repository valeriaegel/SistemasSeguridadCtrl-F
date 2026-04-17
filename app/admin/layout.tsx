import { auth, clerkClient } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { hasPermission, PERMISSIONS, UserRole } from '@/app/lib/roles'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const { userId } = await auth()

  if (!userId) {
    redirect('/')
  }

  const client = await clerkClient()
  const user = await client.users.getUser(userId)
  const role = (user.publicMetadata?.role as UserRole) || 'student'

  if (!hasPermission(role, PERMISSIONS.ADMIN_STUDENTS)) {
    redirect('/')
  }

  return (
    <div className="flex-1 flex flex-col items-center bg-zinc-50 dark:bg-zinc-950 h-full w-full overflow-hidden">
      <div className="flex flex-col w-full max-w-6xl flex-1 bg-white dark:bg-zinc-900/50 shadow-sm border-x border-zinc-200 dark:border-zinc-800 overflow-hidden relative">
        <div className="flex-1 overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  )
}
