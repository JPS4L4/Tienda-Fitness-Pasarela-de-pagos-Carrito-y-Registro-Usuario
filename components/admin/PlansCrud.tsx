'use client'

import { formatPrice, MAX_DISCOUNT } from '@/lib/money'
import { CATALOG_CURRENCY, MIN_CATALOG_PRICE } from '@/lib/catalogValidation'
import {
  emptyPlanForm,
  planFormToPayload,
  planToForm,
  slugify,
  type PlanFormState,
  type PlanRecord,
} from '@/lib/admin/formState'

import { useEffect, useMemo, useState } from 'react'
import Image from 'next/image'
import toast from 'react-hot-toast'
import ReadOnlyNotice from '@/components/admin/ReadOnlyNotice'

type PlanRow = {
  id: number
  type: string
  title: string
  slug: string
  price: number
  discount: number | null
  currency: string
  createdAt: string
  updatedAt: string
}

export default function PlansCrud({ readOnly = false }: { readOnly?: boolean }) {
  const [plans, setPlans] = useState<PlanRow[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [form, setForm] = useState<PlanFormState>(emptyPlanForm)
  const [mode, setMode] = useState<'create' | 'edit'>('create')
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
    setForm(emptyPlanForm)
    setMode('create')
    setUploadError(null)
  }

  const handleChange = (field: Exclude<keyof PlanFormState, 'id'>, value: string) => {
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
    reader.onload = () => setForm((prev) => ({ ...prev, image: reader.result as string }))
    reader.onerror = () => setUploadError('No se pudo leer la imagen.')
    reader.readAsDataURL(file)
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSaving(true)
    setError(null)

    try {
      // Mismas reglas que el servidor: se informa el error antes de enviar
      const result = planFormToPayload(form)
      if (!result.ok) {
        setError(result.error)
        return
      }
      const payload = result.payload

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
        if (response.status === 403) toast.error(data.error || 'Acción no permitida')
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

  const handleEdit = async (row: PlanRow) => {
    setError(null)
    setUploadError(null)
    try {
      // La lista no trae imagen, tags, cobertura ni descripción: se carga el registro completo
      const response = await fetch(`/api/admin/plans/${row.id}`)
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'No se pudo cargar el plan')
      setForm(planToForm(data.plan as PlanRecord))
      setMode('edit')
    } catch (err) {
      console.error(err)
      setError(err instanceof Error ? err.message : 'No se pudo cargar el plan')
    }
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
        if (response.status === 403) toast.error(data.error || 'Acción no permitida')
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
    <>
    {readOnly && <ReadOnlyNotice />}
    <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
      <section className=" w-2xl border border-line bg-surface p-6 ">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl text-fg">Planes</h2>
            <p className="text-sm text-muted">Administra planes de entrenamiento y nutrición.</p>
          </div>
          <button
            onClick={fetchPlans}
            className="btn btn-ghost btn-sm"
            type="button"
          >
            🔃 Actualizar
          </button>
        </div>

        <div className="mt-6">
          {loading ? (
            <p className="text-sm text-muted">Cargando planes...</p>
          ) : !hasPlans ? (
            <div className=" border border-dashed border-line p-6 text-center text-sm text-muted">
              No hay planes aún. Crea el primero desde el formulario.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="text-left text-xs uppercase text-subtle">
                  <tr>
                    <th className="pb-3 pr-4 font-bold">Plan</th>
                    <th className="pb-3 pr-4 font-bold">Tipo</th>
                    <th className="pb-3 pr-4 font-bold">Precio</th>
                    <th className="pb-3 pr-4 font-bold">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {plans.map((plan) => (
                    <tr key={plan.id}>
                      <td className="py-3 pr-4">
                        <p className="font-medium text-fg">{plan.title}</p>
                        <p className="text-xs text-muted">{plan.slug}</p>
                      </td>
                      <td className="py-3 pr-4 text-fg-soft">{plan.type}</td>
                      <td className="py-3 pr-4 text-fg-soft">
                        {formatPrice(plan.price, plan.currency)}
                      </td>
                      <td className="py-3 pr-4">
                        <div className="flex flex-wrap gap-2">
                          <button
                            onClick={() => handleEdit(plan)}
                            className="btn btn-ghost btn-sm !text-warn"
                            type="button"
                          >
                            Editar
                          </button>
                          <button
                            onClick={() => handleDelete(plan.id)}
                            className="btn btn-danger btn-sm"
                            type="button"
                            disabled={readOnly || saving}
                            title={readOnly ? 'Cuenta de solo lectura' : undefined}
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

      <section className="panel">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl text-fg">
              {mode === 'create' ? 'Crear plan' : 'Editar plan'}
            </h2>
            <p className="text-sm text-muted">
              Completa los datos clave para tus planes.
            </p>
          </div>
          {mode === 'edit' && (
            <button
              onClick={resetForm}
              className=" border border-line px-3 py-2 text-sm text-muted hover:bg-surface-2"
              type="button"
            >
              Cancelar edición
            </button>
          )}
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="text-sm font-medium text-fg-soft">
              Tipo
              <select
                value={form.type}
                onChange={(event) => handleChange('type', event.target.value)}
                className="input mt-2 !min-h-10 text-sm"
              >
                <option value="nutricion">Nutrición</option>
                <option value="entrenamiento">Entrenamiento</option>
              </select>
            </label>
            <label className="text-sm font-medium text-fg-soft">
              Título
              <input
                value={form.title}
                onChange={(event) => handleChange('title', event.target.value)}
                className="input mt-2 !min-h-10 text-sm"
                required
              />
            </label>
            <label className="text-sm font-medium text-fg-soft">
              Slug (auto)
              <input
                value={form.slug}
                readOnly
                className="input"
              />
            </label>
            <label className="text-sm font-medium text-fg-soft">
              Precio
              <input
                type="number"
                min={MIN_CATALOG_PRICE}
                step={100}
                value={form.price}
                onChange={(event) => handleChange('price', event.target.value)}
                className="input mt-2 !min-h-10 text-sm"
                required
              />
            </label>
            <label className="text-sm font-medium text-fg-soft">
              Descuento (%)
              <input
                type="number"
                min={0}
                max={MAX_DISCOUNT}
                step={1}
                value={form.discount}
                onChange={(event) => handleChange('discount', event.target.value)}
                className="input mt-2 !min-h-10 text-sm"
              />
            </label>
            <label className="text-sm font-medium text-fg-soft">
              Moneda
              <input
                value={CATALOG_CURRENCY}
                readOnly
                className="input mt-2 !min-h-10 text-sm"
              />
            </label>
            <label className="text-sm font-medium text-fg-soft">
              Imagen (URL)
              <input
                value={form.image.startsWith('data:') ? '' : form.image}
                placeholder={form.image.startsWith('data:') ? '(imagen subida)' : undefined}
                onChange={(event) => handleChange('image', event.target.value)}
                className="input mt-2 !min-h-10 text-sm"
              />
            </label>
          </div>

          <div className="space-y-3">
            <label className="text-sm font-medium text-fg-soft">
              Imagen (solo JPG/JPEG)
              <input
                type="file"
                accept=".jpg,.jpeg,image/jpeg"
                onChange={(event) => handleImageUpload(event.target.files)}
                className="input mt-2 !min-h-10 text-sm"
              />
            </label>
            {uploadError && (
              <p className="text-xs text-danger">{uploadError}</p>
            )}
            {form.image && (
              <div className="flex items-center gap-3">
                <Image
                  src={form.image}
                  alt="Vista previa"
                  width={96}
                  height={96}
                  unoptimized
                  className="h-24 w-24 border border-line object-cover"
                />
                <button type="button" onClick={() => handleChange('image', '')} className="btn btn-ghost btn-sm">
                  Quitar imagen
                </button>
              </div>
            )}
          </div>

          <label className="text-sm font-medium text-fg-soft">
            Descripción corta
            <input
              value={form.shortDescription}
              onChange={(event) => handleChange('shortDescription', event.target.value)}
              className="input mt-2 !min-h-10 text-sm"
            />
          </label>

          <label className="text-sm font-medium text-fg-soft">
            Descripción
            <textarea
              value={form.description}
              onChange={(event) => handleChange('description', event.target.value)}
              className="input mt-2 !min-h-10 text-sm"
              rows={3}
            />
          </label>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="text-sm font-medium text-fg-soft">
              Tags (separados por coma)
              <input
                value={form.tags}
                onChange={(event) => handleChange('tags', event.target.value)}
                className="input mt-2 !min-h-10 text-sm"
              />
            </label>
            <label className="text-sm font-medium text-fg-soft">
              Cobertura (separada por coma)
              <input
                value={form.coverage}
                onChange={(event) => handleChange('coverage', event.target.value)}
                className="input mt-2 !min-h-10 text-sm"
              />
            </label>
          </div>

          {error && (
            <p className=" bg-danger/10 px-3 py-2 text-sm text-danger">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={saving || readOnly}
            title={readOnly ? 'Cuenta de solo lectura' : undefined}
            className="btn btn-primary btn-block"
          >
            {saving ? 'Guardando...' : mode === 'create' ? 'Crear plan' : 'Guardar cambios'}
          </button>
        </form>
      </section>
    </div>
    </>
  )
}
