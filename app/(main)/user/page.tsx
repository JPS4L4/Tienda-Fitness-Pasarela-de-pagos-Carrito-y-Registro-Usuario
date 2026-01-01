"use client"

import Image from "next/image"
import { useState } from "react"
import googleIcon from '../../../images/icons/google_icon.webp'
import facebookIcon from '../../../images/icons/facebook_icon.webp'

export default function UserPage() {
    const [mode, setMode] = useState<"login" | "register">("login")
    const [userName, setUserName] = useState("")
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        if (mode === "login") {
            console.log("Iniciar sesión con:", { email, password })
        } else {
            console.log("Registro con:", { userName,email, password })
        }
    }

    function handleSocial(provider: string) {
        console.log("Iniciar con proveedor social:", provider)
    }

    return (
        // CONTENEDOR PRINCIPAL: Ocupa toda la pantalla (min-h-screen), fondo blanco o gris muy suave
        <main className="min-h-screen w-full flex flex-col items-center justify-center bg-white px-4 sm:px-6 lg:px-8">
            
            {/* CONTENEDOR DE CONTENIDO: Ancho máximo controlado para que no se estire demasiado en monitores grandes */}
            <div className="w-full max-w-md space-y-8">
                
                {/* CABECERA */}
                <div className="text-center">
                    <h1 className="text-4xl font-extrabold tracking-tight text-slate-900">
                        {mode === "login" ? "Bienvenido de nuevo" : "Crea tu cuenta"}
                    </h1>
                    <p className="mt-2 text-sm text-slate-600">
                        {mode === "login" 
                            ? "Ingresa tus credenciales para continuar" 
                            : "Únete a nosotros y empieza a gestionar tu contenido"}
                    </p>
                </div>

                {/* FORMULARIO */}
                <form onSubmit={handleSubmit} className="mt-8 space-y-6">
                    <div className="space-y-4">
                        {
                            mode === "register" && (
                                <div>
                                    <label htmlFor="name" className="block text-sm font-medium text-slate-700">
                                        Nombre Usuario
                                    </label>
                                    <input
                                        id="name"
                                        name="name"
                                        type="text"
                                        autoComplete="name"
                                        required
                                        value={userName}
                                        onChange={(e) => setUserName(e.target.value)}
                                        placeholder="¿Cómo quieres que te llamemos?"
                                        className="mt-1 block w-full rounded-lg border border-slate-300 px-4 py-3 text-slate-900 placeholder-slate-400 focus:border-teal-500 focus:ring-2 focus:ring-teal-500 focus:outline-none transition-all"
                                    />
                                </div>
                            )
                        }
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-slate-700">
                                Correo Electrónico
                            </label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                autoComplete="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="tu@correo.com"
                                className="mt-1 block w-full rounded-lg border border-slate-300 px-4 py-3 text-slate-900 placeholder-slate-400 focus:border-teal-500 focus:ring-2 focus:ring-teal-500 focus:outline-none transition-all"
                            />
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-slate-700">
                                Contraseña
                            </label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                autoComplete="current-password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                className="mt-1 block w-full rounded-lg border border-slate-300 px-4 py-3 text-slate-900 placeholder-slate-400 focus:border-teal-500 focus:ring-2 focus:ring-teal-500 focus:outline-none transition-all"
                            />
                        </div>
                         {
                            mode === "register" && (
                                <div>
                                    <label htmlFor="repassword" className="block text-sm font-medium text-slate-700">
                                        Confirmar tu Contraseña
                                    </label>
                                    <input
                                        id="repassword"
                                        name="repassword"
                                        type="password"
                                        required
                                        placeholder="••••••••"
                                        className="mt-1 block w-full rounded-lg border border-slate-300 px-4 py-3 text-slate-900 placeholder-slate-400 focus:border-teal-500 focus:ring-2 focus:ring-teal-500 focus:outline-none transition-all"
                                    />
                                </div>
                            )
                        }
                    </div>
                    

                    <button
                        type="submit"
                        className="group relative flex w-full justify-center rounded-lg bg-teal-600 px-4 py-3 text-sm font-bold text-white hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 transition-colors duration-200"
                    >
                        {mode === "login" ? "Ingresar" : "Crear cuenta"}
                    </button>
                </form>

                {/* DIVISOR */}
                <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-slate-200" />
                    </div>
                    <div className="relative flex justify-center text-sm">
                        <span className="bg-white px-2 text-slate-500">O continuar con</span>
                    </div>
                </div>

                {/* BOTONES SOCIALES */}
                <div className="grid grid-cols-2 gap-3">
                    <button
                        onClick={() => handleSocial("google")}
                        className="flex items-center justify-center gap-3 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                    >
                        <Image src={googleIcon} alt="google_icon" width={20} height={20} />
                        Google
                    </button>

                    <button
                        onClick={() => handleSocial("facebook")}
                        className="flex items-center justify-center gap-3 rounded-lg bg-[#1877F2] px-4 py-3 text-sm font-medium text-white hover:bg-[#166fe5] transition-colors"
                    >
                        <Image src={facebookIcon} alt="facebook_icon" width={20} height={20} />
                        Facebook
                    </button>
                </div>

                {/* FOOTER / TOGGLE */}
                <div className="text-center mt-6">
                    <button
                        onClick={() => setMode(mode === "login" ? "register" : "login")}
                        className="text-sm font-medium text-teal-600 hover:text-teal-500 hover:underline transition-all"
                    >
                        {mode === "login" ? "¿No tienes cuenta? Regístrate gratis" : "¿Ya tienes cuenta? Inicia sesión"}
                    </button>

                    {mode === "register" && (
                        <div className="mt-4 rounded-md bg-slate-50 p-4 text-xs text-slate-500">
                            Al registrarte, aceptas nuestros términos y condiciones y política de privacidad.
                        </div>
                    )}
                </div>
            </div>
        </main>
    )
}