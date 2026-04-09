import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

// 1. Definimos las rutas. Asegurate de que coincidan con tus carpetas en /app
const isPublicRoute = createRouteMatcher(['/', '/sign-in(.*)', '/sign-up(.*)', '/api/webhooks(.*)'])
const isStudentsDirectoryRoute = createRouteMatcher(['/students(.*)']) 
export default clerkMiddleware(async (auth, req) => {
  const { userId, sessionClaims } = await auth()

  // Protección de rutas privadas
  if (!isPublicRoute(req)) {
    await auth.protect()
  }

  // Extraemos el rol 
  const role = (sessionClaims?.metadata as any)?.role

  // Si alguien intenta entrar al directorio de estudiantes
  if (isStudentsDirectoryRoute(req)) {
    // Si NO es admin Y tampoco es teacher no permite el acceso
    if (role !== 'admin' && role !== 'teacher') {
      return NextResponse.redirect(new URL('/', req.url))
    }
  }

  return NextResponse.next()
})

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
}