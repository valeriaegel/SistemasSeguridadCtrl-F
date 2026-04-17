"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await fetch("/api/admin/users");
      if (!res.ok) throw new Error("Failed to fetch users");
      const data = await res.json();
      setUsers(data);
    } catch (e) {
      setError("Error al cargar los usuarios");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetUserId: userId, newRole }),
      });

      if (!res.ok) {
        if (res.status === 403) alert("No tienes permiso para modificar a un administrador.");
        else alert("Error al modificar rol");
        return;
      }

      setUsers(users.map(u => u.id === userId ? { ...u, role: newRole, roleRequest: null } : u));
    } catch (e) {
      console.error(e);
      alert("Error inesperado al intentar cambiar el rol.");
    }
  };

  const handleApproveRequest = async (userId: string, requestedRole: string) => {
    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetUserId: userId, newRole: requestedRole, approveRequest: true }),
      });
      if (!res.ok) throw new Error("Error approving request");

      setUsers(users.map(u => u.id === userId ? { ...u, role: requestedRole, roleRequest: null } : u));
    } catch (e) {
      alert("No se pudo aprobar la solicitud");
    }
  };

  if (isLoading) return (
    <div className="flex-1 flex items-center justify-center p-8">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-zinc-900 dark:border-white"></div>
    </div>
  );
  if (error) return <div className="p-8 text-center text-red-500">{error}</div>;

  return (
    <div className="flex-1 flex flex-col overflow-y-auto w-full p-4 sm:p-6 lg:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">Gestión de Usuarios</h1>
          <p className="text-zinc-500 dark:text-zinc-400">Gestiona los roles y permisos de los miembros de la plataforma.</p>
        </div>
      </div>

      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-zinc-50 dark:bg-zinc-950/50 text-zinc-900 dark:text-zinc-400 border-b border-zinc-200 dark:border-zinc-800">
              <tr>
                <th className="px-6 py-4 font-semibold">Usuario</th>
                <th className="px-6 py-4 font-semibold">Solicitudes</th>
                <th className="px-6 py-4 font-semibold">Rol Actual</th>
                <th className="px-6 py-4 font-semibold text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/20 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {user.imageUrl ? (
                        <img src={user.imageUrl} className="w-9 h-9 rounded-full bg-zinc-100 object-cover border border-zinc-200 dark:border-zinc-700" alt="" />
                      ) : (
                        <div className="w-9 h-9 rounded-full bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center text-zinc-500 font-medium">
                          {user.firstName?.[0] || user.email?.[0]?.toUpperCase()}
                        </div>
                      )}
                      <div>
                        <div className="font-medium text-zinc-900 dark:text-zinc-100">
                          {user.firstName} {user.lastName}
                        </div>
                        <div className="text-zinc-500 dark:text-zinc-400 text-xs">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {user.roleRequest ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-orange-100 text-orange-800 dark:bg-orange-500/10 dark:text-orange-400 border border-orange-200 dark:border-orange-500/20">
                        Pide ser {user.roleRequest === 'teacher' ? 'Docente' : user.roleRequest}
                      </span>
                    ) : (
                      <span className="text-zinc-400 dark:text-zinc-600">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium border
                      ${user.role === 'admin' ? 'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-500/10 dark:text-purple-400 dark:border-purple-500/20' :
                        user.role === 'teacher' ? 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20' :
                          'bg-zinc-100 text-zinc-800 border-zinc-200 dark:bg-zinc-500/10 dark:text-zinc-400 dark:border-zinc-500/20'}`}>
                      {user.role === 'admin' ? 'Administrador' : user.role === 'teacher' ? 'Docente' : 'Estudiante'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-3">
                      {user.roleRequest && user.role !== 'admin' && (
                        <button
                          onClick={() => handleApproveRequest(user.id, user.roleRequest)}
                          className="px-3 py-1.5 text-xs font-medium bg-zinc-900 dark:bg-zinc-100 hover:bg-zinc-800 dark:hover:bg-zinc-200 text-white dark:text-zinc-900 rounded-md transition-colors shadow-sm focus:ring-2 focus:ring-zinc-900/50"
                        >
                          Aprobar
                        </button>
                      )}
                      <select
                        value={user.role}
                        onChange={(e) => handleRoleChange(user.id, e.target.value)}
                        disabled={user.role === 'admin'}
                        title={user.role === 'admin' ? "No puedes modificar a otro admin" : "Cambiar rol"}
                        className="bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 text-sm rounded-md focus:ring-blue-500 focus:border-blue-500 block px-3 py-1.5 disabled:opacity-50 disabled:cursor-not-allowed outline-none shadow-sm"
                      >
                        <option value="student">Estudiante</option>
                        <option value="teacher">Docente</option>
                        <option value="admin">Administrador</option>
                      </select>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
