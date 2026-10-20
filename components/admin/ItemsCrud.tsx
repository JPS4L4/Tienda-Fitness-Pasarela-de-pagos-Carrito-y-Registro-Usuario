'use client'

import { formatPrice, MAX_DISCOUNT } from '@/lib/money'
import {
  CATALOG_CURRENCY,
  MAX_INSTALLMENTS,
  MAX_STOCK,
  MIN_CATALOG_PRICE,
} from '@/lib/catalogValidation'
import {
  emptyItemForm,
  itemFormToPayload,
  itemToForm,
  slugify,
  type ItemFormState,
  type ItemRecord,
} from '@/lib/admin/formState'

import { useEffect, useMemo, useState } from 'react'
import Image from 'next/image'
import toast from 'react-hot-toast'
import ReadOnlyNotice from '@/components/admin/ReadOnlyNotice'

type ItemRow = {
  id: number
  title: string
  slug: string
  price: number
  discount: number | null
  originalPrice: number | null
  installments: number | null
  currency: string
  category: string
  stock: number
  createdAt: string
  updatedAt: string
}

export default function ItemsCrud({ readOnly = false }: { readOnly?: boolean }) {
  const [items, setItems] = useState<ItemRow[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [form, setForm] = useState<ItemFormState>(emptyItemForm)
  const [mode, setMode] = useState<'create' | 'edit'>('create')
  const [newImageUrl, setNewImageUrl] = useState('')
  const [uploadError, setUploadError] = useState<string | null>(null)

  const hasItems = useMemo(() => items.length > 0, [items])

  const fetchItems = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch('/api/admin/items')
      const data = await response.json()
      setItems(data.items || [])
    } catch (err) {
      console.error(err)
      setError('No se pudieron cargar los items.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchItems()
  }, [])

  const resetForm = () => {
    setForm(emptyItemForm)
    setMode('create')
    setNewImageUrl('')
    setUploadError(null)
  }

  const handleChange = (field: Exclude<keyof ItemFormState, 'images' | 'id'>, value: string | boolean) => {
    if (field === 'title' && typeof value === 'string') {
      setForm((prev) => ({
        ...prev,
        title: value,
        slug: slugify(value),
      }))
      return
    }
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const handleImageUpload = async (files: FileList | null) => {
    setUploadError(null)
    if (!files || files.length === 0) return

    const acceptedTypes = ['image/jpeg', 'image/jpg']
    const fileArray = Array.from(files)

    const invalid = fileArray.find((file) => !acceptedTypes.includes(file.type))
    if (invalid) {
      setUploadError('Solo se permiten imágenes JPG o JPEG.')
      return
    }

    const readers = fileArray.map(
      (file) =>
        new Promise<string>((resolve, reject) => {
          const reader = new FileReader()
          reader.onload = () => resolve(reader.result as string)
          reader.onerror = () => reject(new Error('Error leyendo imagen'))
          reader.readAsDataURL(file)
        })
    )

    try {
      const results = await Promise.all(readers)
      setForm((prev) => ({ ...prev, images: [...prev.images, ...results] }))
    } catch (err) {
      console.error(err)
      setUploadError('No se pudieron cargar las imágenes.')
    }
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSaving(true)
    setError(null)

    try {
      // Mismas reglas que el servidor: se informa el error antes de enviar
      const result = itemFormToPayload(form)
      if (!result.ok) {
        setError(result.error)
        return
      }
      const payload = result.payload

      const url = mode === 'create'
        ? '/api/admin/items'
        : `/api/admin/items/${form.id}`

      const response = await fetch(url, {
        method: mode === 'create' ? 'POST' : 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const data = await response.json()
        if (response.status === 403) toast.error(data.error || 'Acción no permitida')
        throw new Error(data.error || 'Error guardando el item')
      }

      await fetchItems()
      resetForm()
    } catch (err) {
      console.error(err)
      setError(err instanceof Error ? err.message : 'Error guardando el item')
    } finally {
      setSaving(false)
    }
  }

  const handleEdit = async (row: ItemRow) => {
    setError(null)
    setUploadError(null)
    setNewImageUrl('')
    try {
      // La lista no trae imágenes, tags ni descripción: se carga el registro completo
      const response = await fetch(`/api/admin/items/${row.id}`)
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'No se pudo cargar el item')
      setForm(itemToForm(data.item as ItemRecord))
      setMode('edit')
    } catch (err) {
      console.error(err)
      setError(err instanceof Error ? err.message : 'No se pudo cargar el item')
    }
  }

  const addImageUrl = () => {
    const url = newImageUrl.trim()
    if (!url) return
    setForm((prev) => ({ ...prev, images: [...prev.images, url] }))
    setNewImageUrl('')
  }

  const removeImage = (index: number) =>
    setForm((prev) => ({ ...prev, images: prev.images.filter((_, i) => i !== index) }))

  const handleDelete = async (id: number) => {
    const confirmed = window.confirm('¿Eliminar este item?')
    if (!confirmed) return

    setSaving(true)
    setError(null)

    try {
      const response = await fetch(`/api/admin/items/${id}`, { method: 'DELETE' })
      if (!response.ok) {
        const data = await response.json()
        if (response.status === 403) toast.error(data.error || 'Acción no permitida')
        throw new Error(data.error || 'Error eliminando el item')
      }
      await fetchItems()
      if (form.id === id) resetForm()
    } catch (err) {
      console.error(err)
      setError(err instanceof Error ? err.message : 'Error eliminando el item')
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
    {readOnly && <ReadOnlyNotice />}
    <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
      <section className="panel">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl text-fg">Items</h2>
            <p className="text-sm text-muted">Administra productos y su catálogo.</p>
          </div>
          <button
            onClick={fetchItems}
            className="btn btn-ghost btn-sm"
            type="button"
          >
            🔃 Actualizar
          </button>
        </div>

        <div className="mt-6">
          {loading ? (
            <p className="text-sm text-muted">Cargando items...</p>
          ) : !hasItems ? (
            <div className=" border border-dashed border-line p-6 text-center text-sm text-muted">
              No hay items aún. Crea el primero desde el formulario.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="text-left text-xs uppercase text-subtle">
                  <tr>
                    <th className="pb-3 pr-4 font-bold">Item</th>
                    <th className="pb-3 pr-4 font-bold">Precio</th>
                    <th className="pb-3 pr-4 font-bold">Stock</th>
                    <th className="pb-3 pr-4 font-bold">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {items.map((item) => (
                    <tr key={item.id}>
                      <td className="py-3 pr-4">
                        <p className="font-medium text-fg">{item.title}</p>
                        <p className="text-xs text-muted">{item.slug}</p>
                      </td>
                      <td className="py-3 pr-4 text-fg-soft">
                        {formatPrice(item.price, item.currency)}
                      </td>
                      <td className="py-3 pr-4 text-fg-soft">{item.stock}</td>
                      <td className="py-3 pr-4">
                        <div className="flex flex-wrap gap-2">
                          <button
                            onClick={() => handleEdit(item)}
                            className="btn btn-ghost btn-sm !text-warn"
                            type="button"
                          >
                            Editar
                          </button>
                          <button
                            onClick={() => handleDelete(item.id)}
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
              {mode === 'create' ? 'Crear item' : 'Editar item'}
            </h2>
            <p className="text-sm text-muted">
              Completa los campos principales para el catálogo.
            </p>
          </div>
          {mode === 'edit' && (
            <button
              onClick={resetForm}
              className="btn btn-ghost btn-sm"
              type="button"
            >
              Cancelar edición
            </button>
          )}
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
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
              Moneda
              <input
                value={CATALOG_CURRENCY}
                readOnly
                className="input mt-2 !min-h-10 text-sm"
              />
            </label>
            <label className="text-sm font-medium text-fg-soft">
              Categoría
              <input
                value={form.category}
                onChange={(event) => handleChange('category', event.target.value)}
                className="input mt-2 !min-h-10 text-sm"
                required
              />
            </label>
            <label className="text-sm font-medium text-fg-soft">
              Stock
              <input
                type="number"
                min={0}
                max={MAX_STOCK}
                step={1}
                value={form.stock}
                onChange={(event) => handleChange('stock', event.target.value)}
                className="input mt-2 !min-h-10 text-sm"
              />
            </label>
          </div>

          <div className="space-y-3">
            <label className="text-sm font-medium text-fg-soft">
              Imágenes (solo JPG/JPEG)
              <input
                type="file"
                accept=".jpg,.jpeg,image/jpeg"
                multiple
                onChange={(event) => handleImageUpload(event.target.files)}
                className="input mt-2 !min-h-10 text-sm"
              />
            </label>
            {uploadError && (
              <p className="text-xs text-danger">{uploadError}</p>
            )}
            {form.images.length > 0 && (
              <div className="flex flex-wrap gap-3">
                {form.images.map((src, index) => (
                  <div key={`${src.slice(0, 40)}-${index}`} className="relative">
                    <Image
                      src={src}
                      alt={`Imagen ${index + 1}`}
                      width={80}
                      height={80}
                      unoptimized
                      className="h-20 w-20 border border-line object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute -right-2 -top-2 grid h-6 w-6 place-items-center border border-line bg-surface text-xs text-danger"
                      aria-label={`Quitar imagen ${index + 1}`}
                    >
                      ×
                    </button>
                  </div>
                ))}
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
            <div className="text-sm font-medium text-fg-soft">
              <label htmlFor="item-image-url">Agregar imagen por URL (opcional)</label>
              <div className="mt-2 flex gap-2">
                <input
                  id="item-image-url"
                  value={newImageUrl}
                  onChange={(event) => setNewImageUrl(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') {
                      event.preventDefault()
                      addImageUrl()
                    }
                  }}
                  className="input !min-h-10 text-sm"
                  placeholder="https://… o /images/…"
                />
                <button type="button" onClick={addImageUrl} className="btn btn-ghost btn-sm">
                  Agregar
                </button>
              </div>
            </div>
            <label className="text-sm font-medium text-fg-soft">
              Tags (separados por coma)
              <input
                value={form.tags}
                onChange={(event) => handleChange('tags', event.target.value)}
                className="input mt-2 !min-h-10 text-sm"
              />
            </label>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <label className="text-sm font-medium text-fg-soft">
              Precio original
              <input
                type="number"
                min={MIN_CATALOG_PRICE}
                step={100}
                value={form.originalPrice}
                onChange={(event) => handleChange('originalPrice', event.target.value)}
                className="input mt-2 !min-h-10 text-sm"
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
              Cuotas
              <input
                type="number"
                min={1}
                max={MAX_INSTALLMENTS}
                step={1}
                value={form.installments}
                onChange={(event) => handleChange('installments', event.target.value)}
                className="input mt-2 !min-h-10 text-sm"
              />
            </label>
          </div>

          <div className="flex flex-wrap gap-4">
            <label className="flex items-center gap-2 text-sm text-fg-soft">
              <input
                type="checkbox"
                checked={form.freeShipping}
                onChange={(event) => handleChange('freeShipping', event.target.checked)}
              />
              Envío gratis
            </label>
            <label className="flex items-center gap-2 text-sm text-fg-soft">
              <input
                type="checkbox"
                checked={form.isOfferOfTheDay}
                onChange={(event) => handleChange('isOfferOfTheDay', event.target.checked)}
              />
              Oferta del día
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
            {saving ? 'Guardando...' : mode === 'create' ? 'Crear item' : 'Guardar cambios'}
          </button>
        </form>
      </section>
    </div>
    </>
  )
}
