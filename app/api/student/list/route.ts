import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server' // <-- 1. Autenticación
import { PERMISSIONS, hasPermission, UserRole } from '../../../lib/roles' // <-- 2. Autorización
import { GetStudentsListHandler, GetStudentsListQuery } from '@/application/query/GetStudentsListHandler'

const getStudentsListQueryHandler = async (request: NextRequest): Promise<NextResponse> => {
    try {
        // BLOQUE DE SEGURIDAD
        const { userId, sessionClaims } = await auth()

        if (!userId) {
            return NextResponse.json({ error: "Debes iniciar sesión" }, { status: 401 })
        }

        const role = sessionClaims?.metadata?.role as UserRole

        // Verificamos si tiene alguno de los dos permisos válidos para listar alumnos
        const isTeacher = hasPermission(role, PERMISSIONS.VIEW_CLASS_STUDENTS)
        const isAdmin = hasPermission(role, PERMISSIONS.VIEW_ALL_STUDENTS)

        if (!isTeacher && !isAdmin) {
            return NextResponse.json(
                { error: "No tienes permiso para ver el directorio de alumnos" },
                { status: 403 }
            )
        }
        // FIN DEL BLOQUE DE SEGURIDAD 

        const handler = new GetStudentsListHandler()
 
        const query: GetStudentsListQuery = {
            // requesterId: userId,
            // requesterRole: role
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

export const GET = getStudentsListQueryHandler