import { NextRequest, NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import { PERMISSIONS, hasPermission, UserRole } from '../lib/roles'; 

export interface UserInfo {
    userId: string
    role: string
    email: string | null
    jwt: string | null
}

type PermissionedHandler = (request: NextRequest, userInfo: UserInfo, context: any) => Promise<NextResponse> | NextResponse;

export function withPermission(permission: string, handler: PermissionedHandler) {
    return async (request: NextRequest, context: any): Promise<NextResponse> => {
        try {
            const { userId, getToken } = await auth();
            if (!userId) {
                return NextResponse.json(
                    { error: 'No autorizado. Inicia sesión para continuar.' },
                    { status: 401 }
                );
            }

            const user = await currentUser();
            // 3. Obtenemos el rol asegurando que es del tipo UserRole
            const role = (user?.publicMetadata?.role as UserRole) ?? null;
            
            // 4. Usamos TU función para validar
            const isAllowed = hasPermission(role, permission);
            
            if (!isAllowed) {
                return NextResponse.json(
                    { error: 'No tenés permiso para realizar esta acción.' },
                    { status: 403 }
                );
            }

            const email = user?.emailAddresses?.[0]?.emailAddress ?? null;
            const jwt = await getToken();
            const userInfo: UserInfo = { userId, role: role as string, email, jwt }

            return await handler(request, userInfo, context);
        } catch (error) {
            console.error(`[API Error] ${request.method} ${request.nextUrl.pathname}:`, error);
            return NextResponse.json(
                { error: 'Ocurrió un error al procesar la solicitud.' },
                { status: 500 }
            );
        }
    };
}