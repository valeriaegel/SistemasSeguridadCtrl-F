export const ROLES = {
  STUDENT: 'student',
  TEACHER: 'teacher',
  ADMIN: 'admin',
} as const

export type UserRole = typeof ROLES[keyof typeof ROLES]

export const PERMISSIONS = {
  // Chat IA
  CHAT_AI_BASIC: 'chat:ai:basic',
  CHAT_AI_CONFIG: 'chat:ai:config',
  
  // Directorio
  VIEW_OWN_PROFILE: 'directory:view:own',
  VIEW_ALL_STUDENTS: 'directory:view:all',
  
  // Acceso a Datos
  ACCESS_OWN_DATA: 'data:access:own',
  ACCESS_CLASS_DATA: 'data:access:class',
  ACCESS_ALL_DATA: 'data:access:all',
  
  // Administración
  ADMIN_STUDENTS: 'admin:students',
  ADMIN_LOGS: 'admin:logs',
} as const

export const rolePermissions: Record<UserRole, string[]> = {
  [ROLES.STUDENT]: [
    PERMISSIONS.CHAT_AI_BASIC,
    PERMISSIONS.VIEW_OWN_PROFILE,
    PERMISSIONS.ACCESS_OWN_DATA,
  ],
  [ROLES.TEACHER]: [
    PERMISSIONS.CHAT_AI_BASIC,
    PERMISSIONS.ACCESS_CLASS_DATA,
  ],
  [ROLES.ADMIN]: [
    PERMISSIONS.CHAT_AI_CONFIG,
    PERMISSIONS.VIEW_ALL_STUDENTS,
    PERMISSIONS.ACCESS_ALL_DATA,
    PERMISSIONS.ADMIN_STUDENTS,
    PERMISSIONS.ADMIN_LOGS,
  ],
}

// Exportamos una función de utilidad para verificar permisos de forma sencilla en cualquier parte del código
export function hasPermission(userRole: UserRole | null | undefined, permission: string) {
  if (!userRole) return false;
  return rolePermissions[userRole]?.includes(permission) ?? false;
}