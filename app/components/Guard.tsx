'use client'

import { ReactNode } from 'react'
import { usePermission } from '@/app/hooks/usePermission' 

interface GuardProps {
  permission: string;
  children: ReactNode;
  fallback?: ReactNode;
}

export const Guard = ({ permission, children, fallback = null }: GuardProps) => {
  const { checkPermission, isLoading } = usePermission()

  if (isLoading) return null;

  if (!checkPermission(permission)) {
    return <>{fallback}</>
  }

  return <>{children}</>
}