"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton, useUser, useAuth } from '@clerk/nextjs';
import { PERMISSIONS, hasPermission, UserRole } from './lib/roles';  // Importamos  roles y utilidades de permisos

const NavLink = ({ href, children }: { href: string; children: React.ReactNode }) => {
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <Link
      href={href}
      className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
        isActive
          ? "bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-50"
          : "text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
      }`}
    >
      {children}
    </Link>
  );
};

export function Header() {
  const { isLoaded, userId } = useAuth();
  const { user } = useUser();
  
  // Si Clerk no cargó todavía, no mostramos nada para evitar saltos visuales
  if (!isLoaded || !userId) return null;

  // 2. Extraemos el rol de los metadatos del usuario
  const role = (user?.publicMetadata as any)?.role as UserRole;

  // 3. Verificamos si tiene el permiso necesario.
  const canViewStudents = 
    hasPermission(role, PERMISSIONS.VIEW_ALL_STUDENTS) || 
    hasPermission(role, PERMISSIONS.VIEW_ALL_STUDENTS);

  return (
    <header className="flex items-center justify-between px-4 sm:px-6 py-3 border-b border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md shrink-0 z-20 w-full">
      <div className="flex items-center gap-4">
        <h1 className="text-sm font-semibold tracking-wide text-zinc-800 dark:text-zinc-200 uppercase">
          Secure Campus IA
        </h1>
        <nav className="flex items-center gap-2">
          <NavLink href="/">Chat</NavLink>
          
          {/* 4. Usamos la variable de permiso limpio que creamos arriba */}
          {canViewStudents && (
            <NavLink href="/students">Estudiantes</NavLink>
          )}
        </nav>
      </div>
      
      <div className="flex items-center gap-4 h-10">
        <UserButton />
      </div>
    </header>
  );
}