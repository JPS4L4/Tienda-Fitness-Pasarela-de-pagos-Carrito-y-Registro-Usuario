"use client"

import Image from "next/image"
import { useState, useEffect } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import googleIcon from '../../../images/icons/google_icon.webp'
import { 
  validateLoginForm, 
  validateRegisterForm, 
  ClientRateLimiter 
} from "@/lib/validation"

export default function UserPage() {
  const [mode, setMode] = useState<"login" | "register">("login")
  const [userName, setUserName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [showPasswordRequirements, setShowPasswordRequirements] = useState(false)
  const [rateLimitWait, setRateLimitWait] = useState(0)

  const router = useRouter()
  const rateLimiter = new ClientRateLimiter()
  const genericAuthMessage = "No se pudo completar la solicitud. Inténtalo de nuevo."

  // Countdown para rate limit
  useEffect(() => {
    if (rateLimitWait > 0) {
      const timer = setInterval(() => {
        setRateLimitWait(prev => Math.max(0, prev - 1))
      }, 1000)
      return () => clearInterval(timer)
    }
  }, [rateLimitWait])

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault()
  setError(null)
  setSuccess(null)

  // Verificar rate limit del cliente
  const limitKey = mode === "login" ? "login" : "register";
  if (!rateLimiter.checkLimit(limitKey, 5, 60000)) {
    const waitTime = rateLimiter.getWaitTime(limitKey, 5, 60000);
    setRateLimitWait(waitTime);
    setError(`Demasiados intentos. Por favor espera ${waitTime} segundos.`);
    return;
  }

  // Validación del lado del cliente
  if (mode === "login") {
    const validation = validateLoginForm(email, password);
    if (!validation.valid) {
      setError(validation.error || "Datos inválidos");
      return;
    }
  } else {
    const validation = validateRegisterForm(userName, email, password, confirmPassword, phone || undefined);
    if (!validation.valid) {
      setError(validation.error || "Datos inválidos");
      return;
    }
  }

  setLoading(true)

  try {
    if (mode === "login") {
      // Usar NextAuth signIn directamente
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      })

      if (result?.ok) {
        setSuccess("¡Login exitoso! Redirigiendo...")
        rateLimiter.reset("login"); // Resetear contador en éxito
        setTimeout(() => {
          router.push("/")
        }, 1000)
      } else {
        console.error("Login fallido:", result?.error)
        setError(genericAuthMessage)
      }
    } else {
      // Registro
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: userName,
          email,
          password,
          phone: phone || undefined,
        }),
      })

      const data = await res.json()

      // Manejar rate limiting del servidor
      if (res.status === 429) {
        const retryAfter = data.retryAfter || 60;
        setRateLimitWait(retryAfter);
        setError(`Demasiados intentos. Por favor espera ${retryAfter} segundos.`);
        return;
      }

      if (res.ok && data.success) {
        setSuccess("¡Cuenta creada exitosamente! Ahora puedes iniciar sesión.")
        rateLimiter.reset("register"); // Resetear contador en éxito
        setTimeout(() => {
          setMode("login")
          setEmail("")
          setPhone("")
          setPassword("")
          setConfirmPassword("")
          setUserName("")
          setSuccess(null)
        }, 1500)
      } else {
        const errorMsg = data.error || data.message
        console.error("❌ Error en registro:", errorMsg);
        setError(genericAuthMessage)
      }
    }
  } catch (err) {
    setError(genericAuthMessage)
    console.error(err)
  } finally {
    setLoading(false)
  }
}

  const handleSocial = async (provider: "google" | "facebook") => {
    setLoading(true)
    try {
      await signIn(provider, { callbackUrl: "/" })
    } catch (err) {
      setError(genericAuthMessage)
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-bg px-4 sm:px-6 lg:px-8 py-12">
      <div className="w-full max-w-md">
        <div className="border border-line border-t-4 border-t-accent bg-surface">
          <div className="px-8 pt-10 pb-6 text-center">
            <h1 className="text-5xl text-fg">
              {mode === "login" ? "Bienvenido de nuevo" : "Únete a la familia"}
            </h1>
            <p className="mt-3 text-muted text-lg">
              {mode === "login"
                ? "Ingresa y sigue entrenando"
                : "Crea tu cuenta en segundos"}
            </p>
          </div>

          <div className="px-8 pb-10">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-5">
                {mode === "register" && (
                  <div>
                    <label htmlFor="name" className="label">
                      Nombre de usuario
                    </label>
                    <input
                      id="name"
                      type="text"
                      value={userName}
                      onChange={(e) => setUserName(e.target.value)}
                      placeholder="Tu nombre o apodo"
                      className="input"
                      required={mode === "register"}
                    />
                  </div>
                )}

                <div>
                  <label htmlFor="email" className="label">
                    {mode === "login" ? "Correo o teléfono" : "Correo electrónico"}
                  </label>
                  <input
                    id="email"
                    type="text"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={mode === "login" ? "tu@correo.com / +57 300 123 4567" : "tu@correo.com"}
                    className="input"
                    required
                  />
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label htmlFor="password" className="block text-sm font-medium text-fg-soft">
                      Contraseña
                    </label>
                    {mode === "login" && (
                      <a href="/forgot-password" className="text-sm text-accent hover:underline font-medium transition-colors">
                        ¿Olvidaste?
                      </a>
                    )}
                  </div>
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onFocus={() => mode === "register" && setShowPasswordRequirements(true)}
                    onBlur={() => setShowPasswordRequirements(false)}
                    placeholder="••••••••"
                    className="input"
                    required
                  />
                  
                  {/* Requisitos de contraseña */}
                  {mode === "register" && showPasswordRequirements && (
                    <div className="mt-2 p-3 bg-accent/10 border border-accent  text-xs">
                      <p className="font-medium text-accent mb-1">La contraseña debe tener:</p>
                      <ul className="space-y-1 text-accent">
                        <li className={password.length >= 8 ? "text-ok" : ""}>
                          • Mínimo 8 caracteres {password.length >= 8 && "✓"}
                        </li>
                        <li className={/[A-Z]/.test(password) ? "text-ok" : ""}>
                          • Una letra mayúscula {/[A-Z]/.test(password) && "✓"}
                        </li>
                        <li className={/[a-z]/.test(password) ? "text-ok" : ""}>
                          • Una letra minúscula {/[a-z]/.test(password) && "✓"}
                        </li>
                        <li className={/\d/.test(password) ? "text-ok" : ""}>
                          • Un número {/\d/.test(password) && "✓"}
                        </li>
                        <li className={/[@$!%*?&]/.test(password) ? "text-ok" : ""}>
                          • Un carácter especial (@$!%*?&) {/[@$!%*?&]/.test(password) && "✓"}
                        </li>
                      </ul>
                    </div>
                  )}
                </div>

                {mode === "register" && (
                  <>

                    <div>
                      <label htmlFor="confirmPassword" className="label">
                        Confirmar contraseña
                      </label>
                      <input
                        id="confirmPassword"
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="••••••••"
                        className="input"
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="phone" className="label">
                        Teléfono (opcional)
                      </label>
                      <input
                        id="phone"
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+57 300 123 4567"
                        className="input"
                      />
                    </div>
                  </>
                )}
              </div>

              {rateLimitWait > 0 && (
                <div className="bg-warn/10 border-l-4 border-warn p-4 ">
                  <p className="text-warn text-sm font-medium">
                    Espera {rateLimitWait} segundos antes de intentar nuevamente
                  </p>
                </div>
              )}

              {error && (
                <div className="bg-danger/10 border-l-4 border-danger p-4 ">
                  <p className="text-danger text-sm">{error}</p>
                </div>
              )}

              {success && (
                <div className="bg-ok/10 border-l-4 border-ok p-4 ">
                  <p className="text-ok text-sm">{success}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={loading || rateLimitWait > 0}
                className="btn btn-primary btn-lg btn-block"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="spinner !h-5 !w-5" aria-hidden="true" />
                    Procesando...
                  </span>
                ) : mode === "login" ? "Iniciar sesión" : "Crear cuenta"}
              </button>
            </form>

            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-line"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-surface text-muted font-medium">o continuar con</span>
              </div>
            </div>

            <div className="flex justify-center items-center gap-4">
              <button
                onClick={() => handleSocial("google")}
                disabled={loading}
                className="btn btn-ghost"
              >
                <Image src={googleIcon} alt="Google" width={24} height={24} />
                <span className="font-medium text-fg-soft">Google</span>
              </button>

              {/* <button
                onClick={() => handleSocial("facebook")}
                disabled={loading}
                className="btn btn-ghost"
              >
                <Image src={facebookIcon} alt="Facebook" width={24} height={24} />
                <span className="font-medium">Facebook</span>
              </button> */}
            </div>
          </div>

          <div className="px-8 py-6 bg-surface-2 border-t border-line text-center">
            <button
              onClick={() => setMode(mode === "login" ? "register" : "login")}
              className="text-accent hover:underline font-medium transition-colors"
            >
              {mode === "login"
                ? "¿No tienes cuenta? Regístrate gratis"
                : "¿Ya tienes cuenta? Inicia sesión"}
            </button>

            {mode === "register" && (
              <p className="mt-4 text-xs text-muted">
                Al registrarte aceptas nuestros{" "}
                <a href="/legal" className="text-accent hover:underline">
                  términos y política de privacidad
                </a>
                
              </p>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}