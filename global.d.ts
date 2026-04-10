import type { UserRole } from './app/lib/roles';

declare global {
  interface CustomJwtSessionClaims {
    metadata: {
      role?: UserRole;
    }
  }
}