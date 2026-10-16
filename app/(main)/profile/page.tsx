// app/(main)/profile/page.tsx
import { auth } from "@/lib/nextAuth"
import { redirect } from "next/navigation"
import { Metadata } from "next"
import { ArrowRight, ClipboardList, Dumbbell, Settings } from "lucide-react"
import { LogoutButton } from "@/components/buttons/LogoutButton"
import { Badge } from "@/components/ui/Badge"
import Link from "next/link"

// Esta página es dinámica porque depende de la sesión
export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: "Mi Perfil",
  description: "Perfil del usuario",
}

const OPTIONS = [
  { href: "/profile/orders", label: "Mis compras", Icon: ClipboardList },
  { href: "/profile/plans", label: "Mis planes", Icon: Dumbbell },
  { href: "/profile/edit", label: "Editar perfil", Icon: Settings },
]

export default async function ProfilePage() {
  const session = await auth()

  // Si no hay sesión, redirigir a login
  if (!session || !session.user) {
    redirect("/login")
  }

  const info = [
    { label: "Nombre", value: session.user.name },
    { label: "Correo electrónico", value: session.user.email, breakAll: true },
    { label: "Teléfono", value: session.user.phone || "No agregado" },
    { label: "ID de usuario", value: session.user.id, mono: true },
  ]

  return (
    <div className="min-h-screen bg-bg px-4 py-10 sm:px-6 md:py-14 lg:px-8">
      <div className="mx-auto max-w-3xl">
        <div className="card border-t-4 border-t-accent">
          {/* Cabecera */}
          <div className="flex flex-col gap-5 border-b border-line bg-surface-2 p-6 sm:flex-row sm:items-center md:p-8">
            <div className="media h-24 w-24 shrink-0 bg-accent">
              {session.user.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={session.user.image}
                  alt={session.user.name || "Usuario"}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-accent text-on-accent">
                  <span className="font-display text-5xl">
                    {session.user.name?.charAt(0)?.toUpperCase() || "U"}
                  </span>
                </div>
              )}
            </div>
            <div className="min-w-0">
              <h1 className="break-words text-5xl text-fg md:text-6xl">{session.user.name || "Usuario"}</h1>
              <p className="mt-2 break-all text-lg text-muted">{session.user.email}</p>
              <div className="mt-3">
                <Badge tone="ok">Cuenta activa</Badge>
              </div>
            </div>
          </div>

          <div className="space-y-10 p-6 md:p-8">
            {/* Información de la cuenta */}
            <section>
              <h2 className="mb-5 text-3xl">Información de cuenta</h2>
              <dl className="grid grid-cols-1 gap-px border border-line bg-line sm:grid-cols-2">
                {info.map((row) => (
                  <div key={row.label} className="bg-surface p-5">
                    <dt className="mb-1 text-xs font-bold uppercase tracking-[0.14em] text-muted">{row.label}</dt>
                    <dd
                      className={`text-lg font-semibold text-fg ${row.mono ? "font-mono" : ""} ${row.breakAll ? "break-all" : "break-words"}`}
                    >
                      {row.value}
                    </dd>
                  </div>
                ))}
              </dl>
            </section>

            {/* Opciones */}
            <section>
              <h2 className="mb-5 text-3xl">Opciones de cuenta</h2>
              <div className="grid gap-3">
                {OPTIONS.map(({ href, label, Icon }) => (
                  <Link
                    key={href}
                    href={href}
                    className="group flex items-center gap-4 border border-line bg-surface-2 px-5 py-4 font-extrabold uppercase tracking-[0.1em] text-fg transition-colors hover:border-accent hover:text-accent"
                  >
                    <Icon className="h-5 w-5" aria-hidden="true" />
                    {label}
                    <ArrowRight className="ml-auto h-5 w-5 transition-transform group-hover:translate-x-1" aria-hidden="true" />
                  </Link>
                ))}
              </div>
            </section>
          </div>

          <div className="border-t border-line bg-surface-2 p-6 md:px-8">
            <LogoutButton />
          </div>
        </div>

        <p className="mt-6 border-l-4 border-accent bg-surface p-5 text-sm leading-relaxed text-fg-soft">
          <b className="text-fg">Nota:</b> este es tu perfil de usuario. Aquí puedes ver tu información y gestionar tu
          cuenta. Para cambiar tu contraseña o información personal, usa las opciones disponibles arriba.
        </p>
      </div>
    </div>
  )
}
