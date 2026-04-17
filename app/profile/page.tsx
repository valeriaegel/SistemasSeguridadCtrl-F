"use client";

import { useUser } from "@clerk/nextjs";
import { useState } from "react";
import { UserRole } from "@/app/lib/roles";

export default function ProfilePage() {
  const { user, isLoaded } = useUser();
  const [isRequesting, setIsRequesting] = useState(false);
  const [requestStatus, setRequestStatus] = useState<"idle" | "success" | "error">("idle");

  if (!isLoaded || !user) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-zinc-900 dark:border-white"></div>
      </div>
    );
  }

  const publicMetadata = user.publicMetadata as any;
  const currentRole = (publicMetadata?.role as UserRole) || "student";
  const roleRequest = publicMetadata?.roleRequest;

  const handleRequestRole = async () => {
    setIsRequesting(true);
    setRequestStatus("idle");
    try {
      const res = await fetch("/api/user/request-role", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ role: "teacher" }),
      });

      if (!res.ok) throw new Error("Failed to request role");

      await user.reload();
      setRequestStatus("success");
    } catch (e) {
      setRequestStatus("error");
    } finally {
      setIsRequesting(false);
    }
  };

  const translateRole = (role: string) => {
    switch (role) {
      case "student": return "Estudiante";
      case "teacher": return "Docente";
      case "admin": return "Administrador";
      default: return role;
    }
  };

  return (
    <main className="flex flex-col flex-1 max-w-4xl mx-auto w-full p-4 sm:p-6 lg:p-8 space-y-8 bg-zinc-50 dark:bg-zinc-950 overflow-y-auto">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">Mi Perfil</h1>
      </div>

      <div className="bg-white dark:bg-zinc-900 rounded-2xl p-6 border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-6">
        <div className="flex items-center gap-4">
          <img src={user.imageUrl} alt="Profile" className="w-16 h-16 rounded-full ring-2 ring-zinc-100 dark:ring-zinc-800" />
          <div>
            <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">{user.fullName || "Usuario"}</h2>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">{user.primaryEmailAddress?.emailAddress}</p>
          </div>
        </div>

        <div className="pt-6 border-t border-zinc-100 dark:border-zinc-800">
          <h3 className="text-sm font-medium text-zinc-900 dark:text-zinc-100 mb-4 uppercase tracking-wider">Nivel de acceso</h3>
          <div className="flex items-center gap-4">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400 ring-1 ring-inset ring-blue-700/10 dark:ring-blue-400/20">
              Rol: {translateRole(currentRole)}
            </span>
          </div>
        </div>

        {currentRole === "student" && (
          <div className="pt-6 border-t border-zinc-100 dark:border-zinc-800">
            <h3 className="text-sm font-medium text-zinc-900 dark:text-zinc-100 mb-2">Solicitud de Rol Docente</h3>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-4 max-w-2xl">
              El acceso a las herramientas de gestión académica y comisiones requiere verificación institucional. Solicita la revisión de tu cuenta.
            </p>

            {roleRequest === 'teacher' ? (
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-orange-50 dark:bg-orange-950/30 text-orange-700 dark:text-orange-400 border border-orange-200 dark:border-orange-900/50">
                Tu solicitud está en revisión por un administrador.
              </div>
            ) : (
              <div className="space-y-4">
                <button
                  onClick={handleRequestRole}
                  disabled={isRequesting}
                  className="px-4 py-2 bg-zinc-900 dark:bg-zinc-100 text-zinc-50 dark:text-zinc-900 rounded-lg text-sm font-medium hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors focus:ring-2 focus:ring-offset-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isRequesting ? "Enviando..." : "Solicitar Rol de Docente"}
                </button>
                {requestStatus === "success" && (
                  <p className="text-sm text-green-600 dark:text-green-400">¡Solicitud enviada correctamente! Un administrador la revisará pronto.</p>
                )}
                {requestStatus === "error" && (
                  <p className="text-sm text-red-600 dark:text-red-400">Ocurrió un error al enviar la solicitud. Intenta más tarde.</p>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
