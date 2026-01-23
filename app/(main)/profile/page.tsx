// app/(main)/profile/page.tsx
import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { Metadata } from "next"
import { LogoutButton } from "@/components/LogoutButton"

// Esta página es dinámica porque depende de la sesión
export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: "Mi Perfil | Nan Salazar",
  description: "Perfil del usuario",
}

export default async function ProfilePage() {
  const session = await auth()

  // Si no hay sesión, redirigir a login
  if (!session || !session.user) {
    redirect("/login")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        {/* Card Principal */}
        <div className="bg-white rounded-3xl shadow-2xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-teal-500 to-emerald-600 px-8 pt-12 pb-20 relative">
            <div className="absolute inset-0 opacity-10">
              <div className="absolute inset-0 bg-grid-pattern"></div>
            </div>

            <div className="relative z-10 text-center">
              <div className="w-24 h-24 mx-auto mb-6 bg-white rounded-full flex items-center justify-center shadow-lg">
                {session.user.image ? (
                  <img
                    src={session.user.image}
                    alt={session.user.name || "Usuario"}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full rounded-full bg-gradient-to-br from-teal-400 to-emerald-500 flex items-center justify-center">
                    <span className="text-3xl font-bold text-white">
                      {session.user.name?.charAt(0)?.toUpperCase() || "U"}
                    </span>
                  </div>
                )}
              </div>

              <h1 className="text-4xl font-extrabold text-white mb-2">
                {session.user.name || "Usuario"}
              </h1>
              <p className="text-teal-100 text-lg">{session.user.email}</p>
            </div>
          </div>

          {/* Contenido */}
          <div className="px-8 py-12">
            <div className="space-y-8">
              {/* Información del Usuario */}
              <div className="space-y-4">
                <h2 className="text-2xl font-bold text-slate-900">Información de Cuenta</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                  <div className="bg-slate-50 rounded-xl p-6 border border-slate-200">
                    <p className="text-sm font-medium text-slate-600 mb-1">Nombre</p>
                    <p className="text-lg font-semibold text-slate-900">{session.user.name}</p>
                  </div>

                  <div className="bg-slate-50 rounded-xl p-6 border border-slate-200">
                    <p className="text-sm font-medium text-slate-600 mb-1">Correo Electrónico</p>
                    <p className="text-lg font-semibold text-slate-900 break-words">{session.user.email}</p>
                  </div>

                  <div className="bg-slate-50 rounded-xl p-6 border border-slate-200">
                    <p className="text-sm font-medium text-slate-600 mb-1">ID de Usuario</p>
                    <p className="text-lg font-semibold text-slate-900 font-mono break-all">{session.user.id}</p>
                  </div>

                  <div className="bg-slate-50 rounded-xl p-6 border border-slate-200">
                    <p className="text-sm font-medium text-slate-600 mb-1">Estado</p>
                    <p className="text-lg font-semibold">
                      <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-100 text-green-700 font-medium">
                        <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                        Activo
                      </span>
                    </p>
                  </div>
                </div>
              </div>

              {/* Opciones de Cuenta */}
              <div className="border-t border-slate-200 pt-8">
                <h2 className="text-2xl font-bold text-slate-900 mb-6">Opciones de Cuenta</h2>

                <div className="space-y-3">
                  <button className="w-full px-6 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-900 font-semibold transition-colors text-left">
                    ⚙️ Editar Perfil
                  </button>
                  <button className="w-full px-6 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-900 font-semibold transition-colors text-left">
                    🔐 Cambiar Contraseña
                  </button>
                  <button className="w-full px-6 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-900 font-semibold transition-colors text-left">
                    📋 Mis Compras
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Footer con Logout */}
          <div className="px-8 py-6 bg-slate-50 border-t border-slate-200">
            <LogoutButton />
          </div>
        </div>

        {/* Nota informativa */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-xl p-6">
          <p className="text-sm text-blue-800">
            <span className="font-semibold">💡 Nota:</span> Este es tu perfil de usuario. Aquí puedes ver tu información y
            gestionar tu cuenta. Para cambiar tu contraseña o información personal, usa las opciones disponibles arriba.
          </p>
        </div>
      </div>
    </div>
  )
}
