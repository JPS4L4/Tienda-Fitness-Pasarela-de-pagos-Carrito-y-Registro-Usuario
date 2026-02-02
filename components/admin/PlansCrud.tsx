'use client'

import { useEffect, useMemo, useState } from 'react'

type PlanFormState = {
  id?: number
  type: string
  title: string
  slug: string
  price: string
  currency: string
  tags: string
  coverage: string
  image: string
  description: string
  shortDescription: string
}

type PlanRow = {
  id: number
  type: string
  title: string
  slug: string
  price: number
  currency: string
  createdAt: string
  updatedAt: string
}

const slugify = (value: string) =>
  value
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')

const emptyForm: PlanFormState = {
  type: 'nutricion',
  title: '',
  slug: '',
  price: '',
  currency: 'COP',
  tags: '',
  coverage: '',
  image: '',
  description: '',
  shortDescription: '',
}

export default function PlansCrud() {
  const [plans, setPlans] = useState<PlanRow[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [form, setForm] = useState<PlanFormState>(emptyForm)
  const [mode, setMode] = useState<'create' | 'edit'>('create')
  const [uploadedImage, setUploadedImage] = useState<string | null>(null)
  const [uploadError, setUploadError] = useState<string | null>(null)

  const hasPlans = useMemo(() => plans.length > 0, [plans])

  const fetchPlans = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch('/api/admin/plans')
      const data = await response.json()
      setPlans(data.plans || [])
    } catch (err) {
      console.error(err)
      setError('No se pudieron cargar los planes.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPlans()
  }, [])

  const resetForm = () => {
    setForm(emptyForm)
    setMode('create')
    setUploadedImage(null)
    setUploadError(null)
  }

  const handleChange = (field: keyof PlanFormState, value: string) => {
    if (field === 'title') {
      setForm((prev) => ({
        ...prev,
        title: value,
        slug: slugify(value),
      }))
      return
    }
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const parseArray = (value: string) =>
    value
      .split(',')
      .map((entry) => entry.trim())
      .filter(Boolean)

  const handleImageUpload = (files: FileList | null) => {
    setUploadError(null)
    if (!files || files.length === 0) return

    const file = files[0]
    const acceptedTypes = ['image/jpeg', 'image/jpg']

    if (!acceptedTypes.includes(file.type)) {
      setUploadError('Solo se permiten imágenes JPG o JPEG.')
      return
    }

    const reader = new FileReader()
    reader.onload = () => setUploadedImage(reader.result as string)
    reader.onerror = () => setUploadError('No se pudo leer la imagen.')
    reader.readAsDataURL(file)
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSaving(true)
    setError(null)

    try {
      const payload = {
        type: form.type.trim(),
        title: form.title.trim(),
        slug: form.slug.trim() || slugify(form.title),
        price: Number(form.price),
        currency: form.currency.trim() || 'COP',
        tags: parseArray(form.tags),
        coverage: parseArray(form.coverage),
        image: uploadedImage || form.image.trim() || null,
        description: form.description.trim() || null,
        shortDescription: form.shortDescription.trim() || null,
      }

      const url = mode === 'create'
        ? '/api/admin/plans'
        : `/api/admin/plans/${form.id}`

      const response = await fetch(url, {
        method: mode === 'create' ? 'POST' : 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Error guardando el plan')
      }

      await fetchPlans()
      resetForm()
    } catch (err) {
      console.error(err)
      setError(err instanceof Error ? err.message : 'Error guardando el plan')
    } finally {
      setSaving(false)
    }
  }

  const handleEdit = (plan: PlanRow) => {
    setMode('edit')
    setUploadedImage(null)
    setUploadError(null)
    setForm((prev) => ({
      ...prev,
      id: plan.id,
      type: plan.type,
      title: plan.title,
      slug: plan.slug,
      price: String(plan.price),
      currency: plan.currency,
    }))
  }

  const handleDelete = async (id: number) => {
    const confirmed = window.confirm('¿Eliminar este plan?')
    if (!confirmed) return

    setSaving(true)
    setError(null)

    try {
      const response = await fetch(`/api/admin/plans/${id}`, { method: 'DELETE' })
      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Error eliminando el plan')
      }
      await fetchPlans()
      if (form.id === id) resetForm()
    } catch (err) {
      console.error(err)
      setError(err instanceof Error ? err.message : 'Error eliminando el plan')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
      <section className="rounded-2xl w-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">Planes</h2>
            <p className="text-sm text-slate-500">Administra planes de entrenamiento y nutrición.</p>
          </div>
          <button
            onClick={fetchPlans}
            className="rounded-lg border border-blue-600 px-3 py-2 text-sm text-blue-600 hover:bg-slate-50"
            type="button"
          >
            🔃 Actualizar
          </button>
        </div>

        <div className="mt-6">
          {loading ? (
            <p className="text-sm text-slate-500">Cargando planes...</p>
          ) : !hasPlans ? (
            <div className="rounded-lg border border-dashed border-slate-200 p-6 text-center text-sm text-slate-500">
              No hay planes aún. Crea el primero desde el formulario.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="text-left text-xs uppercase text-slate-400">
                  <tr>
                    <th className="pb-3">Plan</th>
                    <th className="pb-3">Tipo</th>
                    <th className="pb-3">Precio</th>
                    <th className="pb-3">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {plans.map((plan) => (
                    <tr key={plan.id}>
                      <td className="py-3">
                        <p className="font-medium text-slate-900">{plan.title}</p>
                        <p className="text-xs text-slate-500">{plan.slug}</p>
                      </td>
                      <td className="py-3 text-slate-700">{plan.type}</td>
                      <td className="py-3 text-slate-700">
                        {plan.currency} {plan.price.toLocaleString('es-CO')}
                      </td>
                      <td className="py-3">
                        <div className="flex flex-wrap gap-2">
                          <button
                            onClick={() => handleEdit(plan)}
                            className="rounded-lg border border-yellow-600 px-3 py-1 text-xs text-yellow-600 hover:bg-slate-50"
                            type="button"
                          >
                            Editar
                          </button>
                          <button
                            onClick={() => handleDelete(plan.id)}
                            className="rounded-lg border border-red-600 px-3 py-1 text-xs text-red-600 hover:bg-red-50"
                            type="button"
                          >
                            Eliminar
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">
              {mode === 'create' ? 'Crear plan' : 'Editar plan'}
            </h2>
            <p className="text-sm text-slate-500">
              Completa los datos clave para tus planes.
            </p>
          </div>
          {mode === 'edit' && (
            <button
              onClick={resetForm}
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50"
              type="button"
            >
              Cancelar edición
            </button>
          )}
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="text-sm font-medium text-slate-700">
              Tipo
              <select
                value={form.type}
                onChange={(event) => handleChange('type', event.target.value)}
                className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              >
                <option value="nutricion">Nutrición</option>
                <option value="entrenamiento">Entrenamiento</option>
              </select>
            </label>
            <label className="text-sm font-medium text-slate-700">
              Título
              <input
                value={form.title}
                onChange={(event) => handleChange('title', event.target.value)}
                className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                required
              />
            </label>
            <label className="text-sm font-medium text-slate-700">
              Slug (auto)
              <input
                value={form.slug}
                readOnly
                className="mt-2 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600"
              />
            </label>
            <label className="text-sm font-medium text-slate-700">
              Precio
              <input
                type="number"
                value={form.price}
                onChange={(event) => handleChange('price', event.target.value)}
                className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                required
              />
            </label>
            <label className="text-sm font-medium text-slate-700">
              Moneda
              <input
                value={form.currency}
                onChange={(event) => handleChange('currency', event.target.value)}
                className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              />
            </label>
            <label className="text-sm font-medium text-slate-700">
              Imagen (URL)
              <input
                value={form.image}
                onChange={(event) => handleChange('image', event.target.value)}
                className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              />
            </label>
          </div>

          <div className="space-y-3">
            <label className="text-sm font-medium text-slate-700">
              Imagen (solo JPG/JPEG)
              <input
                type="file"
                accept=".jpg,.jpeg,image/jpeg"
                onChange={(event) => handleImageUpload(event.target.files)}
                className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              />
            </label>
            {uploadError && (
              <p className="text-xs text-red-600">{uploadError}</p>
            )}
            {uploadedImage && (
              <img
                src={uploadedImage}
                alt="Preview"
                className="h-24 w-24 rounded-lg border border-slate-200 object-cover"
              />
            )}
          </div>

          <label className="text-sm font-medium text-slate-700">
            Descripción corta
            <input
              value={form.shortDescription}
              onChange={(event) => handleChange('shortDescription', event.target.value)}
              className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            />
          </label>

          <label className="text-sm font-medium text-slate-700">
            Descripción
            <textarea
              value={form.description}
              onChange={(event) => handleChange('description', event.target.value)}
              className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              rows={3}
            />
          </label>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="text-sm font-medium text-slate-700">
              Tags (separados por coma)
              <input
                value={form.tags}
                onChange={(event) => handleChange('tags', event.target.value)}
                className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              />
            </label>
            <label className="text-sm font-medium text-slate-700">
              Cobertura (separada por coma)
              <input
                value={form.coverage}
                onChange={(event) => handleChange('coverage', event.target.value)}
                className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              />
            </label>
          </div>

          {error && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={saving}
            className="w-full rounded-xl bg-green-700 px-4 py-3 text-sm font-semibold text-white transition hover:bg-green-800 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {saving ? 'Guardando...' : mode === 'create' ? 'Crear plan' : 'Guardar cambios'}
          </button>
        </form>
      </section>
    </div>
  )
}
