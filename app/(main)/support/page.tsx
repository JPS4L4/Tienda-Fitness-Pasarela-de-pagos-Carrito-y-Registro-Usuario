"use client"

import React, { useState } from "react"

const Support = () => {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [subject, setSubject] = useState("")
  const [order, setOrder] = useState("")
  const [message, setMessage] = useState("")
  const [files, setFiles] = useState<File[]>([])
  const [previews, setPreviews] = useState<string[]>([])
  const [status, setStatus] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  // Clase reutilizable para todos los inputs (incluye tu petición del placeholder indigo)
  const inputClass = "w-full p-2.5 mt-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 placeholder:text-gray-500 transition-shadow"

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const list = e.target.files ? Array.from(e.target.files) : []
    setFiles(list)
    const p = list.map((f) => URL.createObjectURL(f))
    setPreviews(p)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setStatus(null)

    if (!name || !email || !subject || !message) {
      setStatus("Por favor completa los campos obligatorios.")
      return
    }

    setLoading(true)
    try {
      const form = new FormData()
      form.append("name", name)
      form.append("email", email)
      form.append("subject", subject)
      form.append("order", order)
      form.append("message", message)
      files.forEach((f) => form.append("images", f))

      // Nota: Asegúrate de tener este endpoint creado o comenta el fetch para probar visualmente
      const res = await fetch("/api/support", { method: "POST", body: form })
      const json = await res.json()
      if (!res.ok) throw new Error(json?.message || "Error al enviar")
      
      setStatus("Mensaje enviado correctamente. Gracias.")
      // Reset form
      setName("")
      setEmail("")
      setSubject("")
      setOrder("")
      setMessage("")
      setFiles([])
      setPreviews([])
    } catch (err: any) {
      setStatus(err?.message || "Error en el envío")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-stretch bg-white text-black font-sans">
      
      {/* SECCIÓN IZQUIERDA: FORMULARIO */}
      <main className="flex-1 flex items-center justify-center p-8 md:p-16">
        <form onSubmit={handleSubmit} className="w-full max-w-3xl">
          <h1 className="text-3xl font-bold mb-4 text-gray-900">Soporte</h1>
          <p className="text-gray-500 mb-8">
            Cuenta brevemente tu problema y adjunta imágenes si es necesario.
          </p>

          {/* Grid de Nombre y Correo */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700">Nombre *</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Tu nombre"
                required
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700">Correo electrónico *</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tú@correo.com"
                required
                className={inputClass}
              />
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700">Asunto *</label>
            <input
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Asunto breve"
              required
              className={inputClass}
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700">Número de orden (opcional)</label>
            <input
              value={order}
              onChange={(e) => setOrder(e.target.value)}
              placeholder="ID de pedido, ticket, etc."
              className={inputClass}
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700">Mensaje *</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Describe el problema o la ayuda que necesitas"
              required
              rows={6}
              className={inputClass}
            />
          </div>

          {/* Input de Archivo Estilizado */}
          <div className="mb-8">
            <label className="block text-sm font-semibold text-gray-700 mb-2">Adjuntar imágenes</label>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileChange}
              className="block w-full text-sm text-gray-500
                file:mr-4 file:py-2 file:px-4
                file:rounded-full file:border-0
                file:text-sm file:font-semibold
                file:bg-indigo-50 file:text-indigo-700
                hover:file:bg-indigo-100 transition-colors cursor-pointer"
            />
            {previews.length > 0 && (
              <div className="flex gap-2 mt-4 flex-wrap">
                {previews.map((p, i) => (
                  <img
                    key={i}
                    src={p}
                    alt={`preview-${i}`}
                    className="w-24 h-20 object-cover rounded-lg border border-gray-200 shadow-sm"
                  />
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center gap-4">
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 bg-slate-900 text-white font-medium rounded-lg hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-lg shadow-indigo-500/20"
            >
              {loading ? "Enviando..." : "Enviar mensaje"}
            </button>
            {status && (
              <p className={`text-sm font-medium ${status.includes("error") ? "text-red-600" : "text-emerald-600"}`}>
                {status}
              </p>
            )}
          </div>
        </form>
      </main>

      {/* SECCIÓN DERECHA: ASIDE (Oculto en celular, visible en pantallas grandes lg:flex) */}
      <aside className="hidden lg:flex w-[520px] bg-linear-to-b from-indigo-50 to-white items-center justify-center p-8 border-l border-gray-100">
        <div className="text-center">
          {/* SVG con clases Tailwind */}
          <svg className="w-56 h-56 mx-auto text-slate-900 mb-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2v2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M12 20v2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M4.93 4.93l1.41 1.41" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M17.66 17.66l1.41 1.41" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M2 12h2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M20 12h2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M4.93 19.07l1.41-1.41" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M17.66 6.34l1.41-1.41" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.5" />
          </svg>
          
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Asistencia rápida</h2>
          <p className="text-gray-500 max-w-xs mx-auto leading-relaxed">
            Adjunta imágenes y describe tu problema. Nuestro equipo revisará tu caso y responderá a tu correo.
          </p>
        </div>
      </aside>
    </div>
  )
}

export default Support