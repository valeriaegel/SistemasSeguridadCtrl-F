'use client'
//ACA DEBERIAMOS DEFINIR BIEN LOS PERMISOS PARA VER EL DETALLE DE LOS ESTUDIANTES, 
// Y USAR ESTE GUARD PARA MOSTRARLO O NO SEGUN EL ROL DEL USUARIO LOGUEADO.

import { ReactNode } from 'react'
import { PERMISSIONS, hasPermission, UserRole } from "../../lib/roles"


interface GuardProps {
    children: ReactNode;
  fallback?: ReactNode;
}

export const Guard = async ({ children, fallback = null }: GuardProps) => {
    // Aquí podrías obtener el rol del usuario desde tu contexto de autenticación o cualquier otro método que uses
  return <>{children}</>
}