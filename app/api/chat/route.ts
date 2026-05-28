import { NextRequest, NextResponse } from 'next/server'
import { withPermission, UserInfo } from '@/app/lib/withPermission' // Ajusta la ruta a tu proyecto
import { PERMISSIONS } from '@/app/lib/roles'
import { AddMessageHandler, AddMessageCommand } from '@/application/command/AddMessageHandler'

const addMessageCommandHandler = async (
    request: NextRequest,
    _userInfo: UserInfo // Recibimos la info del usuario 
): Promise<NextResponse> => {
    try {
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


export const POST = withPermission(PERMISSIONS.CHAT_AI_BASIC, addMessageCommandHandler)