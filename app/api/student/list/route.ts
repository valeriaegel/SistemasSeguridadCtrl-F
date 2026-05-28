import { NextRequest, NextResponse } from 'next/server'
import { withPermission, UserInfo } from '@/app/lib/withPermission' 
import { PERMISSIONS } from '@/app/lib/roles'
import { GetStudentsListHandler, GetStudentsListQuery } from '@/application/query/GetStudentsListHandler'

const getStudentsListQueryHandler = async (
    request: NextRequest,
    userInfo: UserInfo // Recibimos la info del usuario con permisos ya validados desde withPermission
): Promise<NextResponse> => {
    try {
        const handler = new GetStudentsListHandler()

        // Usamos directamente el email y el rol que ya vienen validados desde withPermission
        const query: GetStudentsListQuery = {
            requesterId: userInfo.email ?? '', 
            requesterRole: userInfo.role
        }
        
        const response = await handler.handle(query)

        return NextResponse.json(response)
        
    } catch (error) {
        console.error("Error al obtener la lista de estudiantes:", error)
        return NextResponse.json(
            { error: "Ocurrió un error al procesar la solicitud" },
            { status: 500 }
        )
    }
}

// Protegemos la ruta para que solo quienes tengan este permiso puedan entrar
export const GET = withPermission(PERMISSIONS.VIEW_ALL_STUDENTS, getStudentsListQueryHandler)