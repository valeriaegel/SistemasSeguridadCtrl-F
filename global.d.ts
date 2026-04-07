declare global {
  interface CustomJwtSessionClaims {
    metadata: {
      role?: 'student' | 'teacher' | 'admin'
    }
  }
}