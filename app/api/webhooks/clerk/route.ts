import { Webhook } from 'svix'
import { headers } from 'next/headers'
import { WebhookEvent } from '@clerk/nextjs/server'
import { assignUserRole } from '../../../lib/user-roles'
import { ROLES } from '@/app/lib/roles'
import { getSupabaseClient } from '@/infraestructure/database/supabaseClient'

export async function POST(req: Request) {
  const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET
  if (!WEBHOOK_SECRET) {
    throw new Error('Falta configurar WEBHOOK_SECRET en tu archivo .env')
  }

  const headerPayload = await headers()
  const svix_id = headerPayload.get('svix-id')
  const svix_timestamp = headerPayload.get('svix-timestamp')
  const svix_signature = headerPayload.get('svix-signature')

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response('Error occured -- no svix headers', { status: 400 })
  }

  const payload = await req.json()
  const body = JSON.stringify(payload)

  const wh = new Webhook(WEBHOOK_SECRET)
  let evt: WebhookEvent

  try {
    evt = wh.verify(body, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    }) as WebhookEvent
  } catch (err) {
    console.error('Error verificando webhook:', err)
    return new Response('Error occured', { status: 400 })
  }

  const eventType = evt.type

  if (eventType === 'user.created') {
    const { id, email_addresses, first_name, last_name } = evt.data

    console.log(`Asignando rol por defecto al usuario ${id}...`)

    try {
      await assignUserRole(id, ROLES.STUDENT)
      console.log(`Rol '${ROLES.STUDENT}' asignado con éxito al usuario ${id}`)
    } catch (error) {
      console.error('Error al asignar el rol:', error)
      return new Response('Error al asignar el rol', { status: 500 })
    }

    try {
      const supabase = getSupabaseClient()
      const email = email_addresses?.[0]?.email_address ?? ''
      const name = `${first_name ?? ''} ${last_name ?? ''}`.trim() || email

      const { error } = await supabase
        .from('students')
        .upsert({ name, email, active: true }, { onConflict: 'email' })

      if (error) {
        console.error('Error al insertar estudiante:', error.message)
        return new Response('Error al insertar estudiante', { status: 500 })
      }

      console.log(`Estudiante ${email} insertado en Supabase`)
    } catch (error) {
      console.error('Error Supabase:', error)
      return new Response('Error al conectar con Supabase', { status: 500 })
    }
  }

  return new Response('', { status: 200 })
}