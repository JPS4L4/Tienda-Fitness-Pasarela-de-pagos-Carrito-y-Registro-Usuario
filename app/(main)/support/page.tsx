"use client"

import React, { useState } from "react"
import toast from "react-hot-toast"
import Image from "next/image"
import { LifeBuoy } from "lucide-react"
import { errorMessage } from "@/lib/utils";

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
  const inputClass = "input mt-1.5"

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
      toast.error("Por favor completa los campos obligatorios.", { duration: 4000 })
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

      const res = await fetch("/api/support", { method: "POST", body: form })
      const json = await res.json()
      if (!res.ok) throw new Error(json?.message || "Error al enviar")
      
      setStatus("Mensaje enviado correctamente. Gracias.")
      toast.success("¡Ticket de soporte enviado! Te responderemos en 24-48 horas.", { duration: 5000 })
      
      // Reset form
      setName("")
      setEmail("")
      setSubject("")
      setOrder("")
      setMessage("")
      setFiles([])
      setPreviews([])
    } catch (err) {
      const errorMsg = errorMessage(err, "Error en el envío")
      setStatus(errorMsg)
      toast.error(errorMsg, { duration: 4000 })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-stretch bg-surface text-fg font-sans">
      
      {/* SECCIÓN IZQUIERDA: FORMULARIO */}
      <main className="flex-1 flex items-center justify-center p-8 md:p-16">
        <form onSubmit={handleSubmit} className="w-full max-w-3xl">
          <h1 className="text-3xl font-bold mb-4 text-fg">Soporte</h1>
          <p className="text-muted mb-8">
            Cuenta brevemente tu problema y adjunta imágenes si es necesario.
          </p>

          {/* Grid de Nombre y Correo */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-semibold text-fg-soft">Nombre *</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Tu nombre"
                required
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-fg-soft">Correo electrónico *</label>
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
            <label className="block text-sm font-semibold text-fg-soft">Asunto *</label>
            <input
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Asunto breve"
              required
              className={inputClass}
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-semibold text-fg-soft">Número de orden (opcional)</label>
            <input
              value={order}
              onChange={(e) => setOrder(e.target.value)}
              placeholder="ID de pedido, ticket, etc."
              className={inputClass}
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-semibold text-fg-soft">Mensaje *</label>
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
            <label className="label">Adjuntar imágenes</label>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileChange}
              className="block w-full text-sm text-muted
                file:mr-4 file:py-2 file:px-4
                file: file:border-0
                file:text-sm file:font-semibold
                file:bg-accent/10 file:text-accent
                hover:file:bg-accent/10 transition-colors cursor-pointer"
            />
            {previews.length > 0 && (
              <div className="flex gap-2 mt-4 flex-wrap">
                {previews.map((p, i) => (
                  <Image
                    key={i}
                    src={p}
                    alt={`preview-${i}`}
                    width={96}
                    height={80}
                    unoptimized
                    className="w-24 h-20 object-cover border border-line"
                  />
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center gap-4">
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary"
            >
              {loading ? "Enviando..." : "Enviar mensaje"}
            </button>
            {status && (
              <p className={`text-sm font-medium ${status.includes("error") ? "text-danger" : "text-ok"}`}>
                {status}
              </p>
            )}
          </div>
        </form>
      </main>

      {/* SECCIÓN DERECHA: ASIDE (Oculto en celular, visible en pantallas grandes lg:flex) */}
      <aside className="hidden lg:flex w-[520px] bg-surface items-center justify-center p-8 border-l border-line">
        <div className="text-center">
          <LifeBuoy className="mx-auto mb-6 h-32 w-32 text-accent" strokeWidth={1.25} aria-hidden="true" />

          <h2 className="text-4xl text-fg mb-3">Asistencia rápida</h2>
          <p className="text-muted max-w-xs mx-auto leading-relaxed">
            Adjunta imágenes y describe tu problema. Nuestro equipo revisará tu caso y responderá a tu correo.
          </p>
        </div>
      </aside>
    </div>
  )
}

export default Support