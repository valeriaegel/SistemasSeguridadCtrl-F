import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server' // <-- 1. Importamos auth de Clerk
import { PERMISSIONS, hasPermission, UserRole } from '../../lib/roles'
import { AddMessageHandler, AddMessageCommand, AddMessageResponse } from '@/application/command/AddMessageHandler'

const addMessageCommandHandler = async (request: NextRequest): Promise<NextResponse> => {
    try {
        const { userId, sessionClaims } = await auth()

        if (!userId) {
            return NextResponse.json(
                { error: "Debes iniciar sesión para usar el chat" },
                { status: 401 }
            )
        }

        const role = sessionClaims?.metadata?.role as UserRole

        if (!hasPermission(role, PERMISSIONS.CHAT_AI_BASIC)) {
            return NextResponse.json(
                { error: "No tienes los permisos necesarios para enviar mensajes" },
                { status: 403 }
            )
        }



        const handler = new AddMessageHandler()

        const command: AddMessageCommand = await request.json()


        const response = await handler.handle(command)

        return NextResponse.json(response)

    } catch (error) {
        console.error("Error procesando el mensaje:", error)
        return NextResponse.json(
            { error: "Ocurrió un error al procesar la solicitud" },
            { status: 500 }
        )
    }
}

export const POST = addMessageCommandHandler