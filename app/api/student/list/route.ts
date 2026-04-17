import { NextRequest, NextResponse } from 'next/server'
import { auth, clerkClient } from '@clerk/nextjs/server' 
import { PERMISSIONS, hasPermission, UserRole } from '../../../lib/roles' 

const getStudentsListQueryHandler = async (request: NextRequest): Promise<NextResponse> => {
    try {
        const { userId, sessionClaims } = await auth()

        if (!userId) {
            return NextResponse.json({ error: "Debes iniciar sesión" }, { status: 401 })
        }

        const role = sessionClaims?.metadata?.role as UserRole

        const isTeacher = hasPermission(role, PERMISSIONS.VIEW_CLASS_STUDENTS)
        const isAdmin = hasPermission(role, PERMISSIONS.VIEW_ALL_STUDENTS)

        if (!isTeacher && !isAdmin) {
            return NextResponse.json(
                { error: "No tienes permiso para ver el directorio de alumnos" },
                { status: 403 }
            )
        }

        const client = await clerkClient()
        const users = await client.users.getUserList()
        
        const studentsList = users.data
            .filter(user => {
                const userRole = (user.publicMetadata?.role as string) || 'student'
                return userRole === 'student'
            })
            .map(user => ({
                id: user.id,
                name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.username || 'Usuario',
                email: user.emailAddresses[0]?.emailAddress || '',
                imageUrl: user.imageUrl,
                active: true
            }))

        return NextResponse.json({ list: studentsList })
        
    } catch (error) {
        console.error("Error al obtener la lista de estudiantes:", error)
        return NextResponse.json(
            { error: "Ocurrió un error al procesar la solicitud" },
            { status: 500 }
        )
    }
}

export const GET = getStudentsListQueryHandler