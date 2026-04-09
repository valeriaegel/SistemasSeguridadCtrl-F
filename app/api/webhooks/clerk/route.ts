import { Webhook } from 'svix'
import { headers } from 'next/headers'
import { WebhookEvent } from '@clerk/nextjs/server'
import { assignUserRole } from '../../../lib/user-roles'
import { ROLES } from '@/app/lib/roles'

export async function POST(req: Request) {
  // Vas a obtener este secreto desde el dashboard de Clerk en el siguiente paso
  const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET

  if (!WEBHOOK_SECRET) {
    throw new Error('Falta configurar WEBHOOK_SECRET en tu archivo .env')
  }

  // Obtener los headers para la verificación
  const headerPayload = await headers()
  const svix_id = headerPayload.get('svix-id')
  const svix_timestamp = headerPayload.get('svix-timestamp')
  const svix_signature = headerPayload.get('svix-signature')

  // Si no hay headers, la petición no viene de Clerk
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response('Error occured -- no svix headers', {
      status: 400,
    })
  }

  // Obtener el body de la petición
  const payload = await req.json()
  const body = JSON.stringify(payload)

  // Crear una nueva instancia de Svix con tu secreto
  const wh = new Webhook(WEBHOOK_SECRET)
  let evt: WebhookEvent

  // Verificar que el payload es legítimo
  try {
    evt = wh.verify(body, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    }) as WebhookEvent
  } catch (err) {
    console.error('Error verificando webhook:', err)
    return new Response('Error occured', {
      status: 400,
    })
  }

  const eventType = evt.type

  if (eventType === 'user.created') {
    const { id } = evt.data // Obtenemos el ID del nuevo usuario
    
    console.log(`Asignando rol por defecto al usuario ${id}...`)
    
    try {
      // Usamos tu función para asignarle 'student' en los metadatos
      await assignUserRole(id, ROLES.STUDENT)
      console.log(`Rol '${ROLES.STUDENT}' asignado con éxito al usuario ${id}`)
    } catch (error) {
      console.error('Error al asignar el rol:', error)
      return new Response('Error al asignar el rol', { status: 500 })
    }
  }

  return new Response('', { status: 200 })
}