'use client'

import { useSession } from '@clerk/nextjs'
import { hasPermission, UserRole } from '../lib/roles' 

export const usePermission = () => {
  const { session, isLoaded } = useSession()

  // Extraemos el rol de los metadatos públicos de Clerk
  const role = session?.user?.publicMetadata?.role as UserRole | undefined

  return {
    // Retorna true o false usando tu función centralizada
    checkPermission: (permission: string) => hasPermission(role, permission),
    role,
    isLoading: !isLoaded
  }
}