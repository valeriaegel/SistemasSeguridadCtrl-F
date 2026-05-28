import { auth, clerkClient } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { hasPermission, PERMISSIONS, UserRole } from '@/app/lib/roles'
import { getSupabaseClient } from '@/infraestructure/database/supabaseClient'

async function isAdmin() {
  const { userId } = await auth()
  if (!userId) return false

  const client = await clerkClient()
  const user = await client.users.getUser(userId)
  const role = (user.publicMetadata?.role as UserRole) ?? 'student'

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
  const targetEmail = targetUser.emailAddresses[0]?.emailAddress ?? ''
  const targetName = `${targetUser.firstName ?? ''} ${targetUser.lastName ?? ''}`.trim() || targetEmail

  if (targetRole === 'admin') {
    return new NextResponse('No se puede modificar a otro administrador', { status: 403 })
  }

  let publicMetadata: any = { role: newRole }
  if (approveRequest || newRole !== targetRole) {
    publicMetadata.roleRequest = null
  }

  await client.users.updateUserMetadata(targetUserId, { publicMetadata })

  const supabase = getSupabaseClient()

  // Si el nuevo rol es student, insertar/activar en la tabla students
  if (newRole === 'student') {
    const { error } = await supabase
      .from('students')
      .upsert({ name: targetName, email: targetEmail, active: true }, { onConflict: 'email' })

    if (error) {
      console.error('Error al insertar/activar estudiante:', error.message)
    }
  }

  // Si el nuevo rol NO es student, desactivarlo en la tabla students
  if (newRole !== 'student') {
    const { error } = await supabase
      .from('students')
      .update({ active: false })
      .eq('email', targetEmail)

    if (error) {
      console.error('Error al desactivar estudiante:', error.message)
    }
  }

  // Registrar el cambio de rol en audit_logs
  const { userId: adminId } = await auth()
  const adminUser = await client.users.getUser(adminId!)
  const adminEmail = adminUser.emailAddresses[0]?.emailAddress ?? 'admin'

  await supabase.from('audit_logs').insert({
    table_name: 'role_changes',
    action: 'UPDATE',
    record_id: targetUserId,
    old_data: { role: targetRole, email: targetEmail, name: targetName },
    new_data: { role: newRole, email: targetEmail, name: targetName },
    user_email: adminEmail,
  })

  return NextResponse.json({ success: true })
}