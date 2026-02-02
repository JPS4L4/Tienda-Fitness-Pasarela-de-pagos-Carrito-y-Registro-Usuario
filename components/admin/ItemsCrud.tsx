'use client'

import { useEffect, useMemo, useState } from 'react'

type ItemFormState = {
  id?: number
  title: string
  slug: string
  price: string
  currency: string
  category: string
  stock: string
  images: string
  tags: string
  description: string
  shortDescription: string
  freeShipping: boolean
  isOfferOfTheDay: boolean
  discount: string
  originalPrice: string
  installments: string
}

type ItemRow = {
  id: number
  title: string
  slug: string
  price: number
  currency: string
  category: string
  stock: number
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

const emptyForm: ItemFormState = {
  title: '',
  slug: '',
  price: '',
  currency: 'COP',
  category: '',
  stock: '0',
  images: '',
  tags: '',
  description: '',
  shortDescription: '',
  freeShipping: false,
  isOfferOfTheDay: false,
  discount: '',
  originalPrice: '',
  installments: '',
}

export default function ItemsCrud() {
  const [items, setItems] = useState<ItemRow[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [form, setForm] = useState<ItemFormState>(emptyForm)
  const [mode, setMode] = useState<'create' | 'edit'>('create')
  const [uploadedImages, setUploadedImages] = useState<string[]>([])
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
    setForm(emptyForm)
    setMode('create')
    setUploadedImages([])
    setUploadError(null)
  }

  const handleChange = (field: keyof ItemFormState, value: string | boolean) => {
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

  const parseArray = (value: string) =>
    value
      .split(',')
      .map((entry) => entry.trim())
      .filter(Boolean)

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
      setUploadedImages(results)
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
      const payload = {
        title: form.title.trim(),
        slug: form.slug.trim() || slugify(form.title),
        price: Number(form.price),
        currency: form.currency.trim() || 'COP',
        category: form.category.trim(),
        stock: Number(form.stock),
        images: uploadedImages.length > 0 ? uploadedImages : parseArray(form.images),
        tags: parseArray(form.tags),
        description: form.description.trim() || null,
        shortDescription: form.shortDescription.trim() || null,
        freeShipping: form.freeShipping,
        isOfferOfTheDay: form.isOfferOfTheDay,
        discount: form.discount ? Number(form.discount) : null,
        originalPrice: form.originalPrice ? Number(form.originalPrice) : null,
        installments: form.installments ? Number(form.installments) : null,
      }

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

  const handleEdit = (item: ItemRow) => {
    setMode('edit')
    setUploadedImages([])
    setUploadError(null)
    setForm((prev) => ({
      ...prev,
      id: item.id,
      title: item.title,
      slug: item.slug,
      price: String(item.price),
      currency: item.currency,
      category: item.category,
      stock: String(item.stock),
    }))
  }

  const handleDelete = async (id: number) => {
    const confirmed = window.confirm('¿Eliminar este item?')
    if (!confirmed) return

    setSaving(true)
    setError(null)

    try {
      const response = await fetch(`/api/admin/items/${id}`, { method: 'DELETE' })
      if (!response.ok) {
        const data = await response.json()
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
    <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">Items</h2>
            <p className="text-sm text-slate-500">Administra productos y su catálogo.</p>
          </div>
          <button
            onClick={fetchItems}
            className="rounded-lg border border-blue-600 px-3 py-2 text-sm text-blue-600 hover:bg-slate-50"
            type="button"
          >
            🔃 Actualizar
          </button>
        </div>

        <div className="mt-6">
          {loading ? (
            <p className="text-sm text-slate-500">Cargando items...</p>
          ) : !hasItems ? (
            <div className="rounded-lg border border-dashed border-slate-200 p-6 text-center text-sm text-slate-500">
              No hay items aún. Crea el primero desde el formulario.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="text-left text-xs uppercase text-slate-400">
                  <tr>
                    <th className="pb-3">Item</th>
                    <th className="pb-3">Precio</th>
                    <th className="pb-3">Stock</th>
                    <th className="pb-3">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {items.map((item) => (
                    <tr key={item.id}>
                      <td className="py-3">
                        <p className="font-medium text-slate-900">{item.title}</p>
                        <p className="text-xs text-slate-500">{item.slug}</p>
                      </td>
                      <td className="py-3 text-slate-700">
                        {item.currency} {item.price.toLocaleString('es-CO')}
                      </td>
                      <td className="py-3 text-slate-700">{item.stock}</td>
                      <td className="py-3">
                        <div className="flex flex-wrap gap-2">
                          <button
                            onClick={() => handleEdit(item)}
                            className="rounded-lg border border-yellow-600 px-3 py-1 text-xs text-yellow-600 hover:bg-slate-50"
                            type="button"
                          >
                            Editar
                          </button>
                          <button
                            onClick={() => handleDelete(item.id)}
                            className="rounded-lg border border-red-200 px-3 py-1 text-xs text-red-600 hover:bg-red-50"
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
              {mode === 'create' ? 'Crear item' : 'Editar item'}
            </h2>
            <p className="text-sm text-slate-500">
              Completa los campos principales para el catálogo.
            </p>
          </div>
          {mode === 'edit' && (
            <button
              onClick={resetForm}
              className="rounded-lg border border-orange-600 px-3 py-2 text-sm text-orange-600 hover:bg-slate-50"
              type="button"
            >
              Cancelar edición
            </button>
          )}
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
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
              Categoría
              <input
                value={form.category}
                onChange={(event) => handleChange('category', event.target.value)}
                className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                required
              />
            </label>
            <label className="text-sm font-medium text-slate-700">
              Stock
              <input
                type="number"
                value={form.stock}
                onChange={(event) => handleChange('stock', event.target.value)}
                className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              />
            </label>
          </div>

          <div className="space-y-3">
            <label className="text-sm font-medium text-slate-700">
              Imágenes (solo JPG/JPEG)
              <input
                type="file"
                accept=".jpg,.jpeg,image/jpeg"
                multiple
                onChange={(event) => handleImageUpload(event.target.files)}
                className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              />
            </label>
            {uploadError && (
              <p className="text-xs text-red-600">{uploadError}</p>
            )}
            {uploadedImages.length > 0 && (
              <div className="flex flex-wrap gap-3">
                {uploadedImages.map((src, index) => (
                  <img
                    key={`${src}-${index}`}
                    src={src}
                    alt="Preview"
                    className="h-20 w-20 rounded-lg border border-slate-200 object-cover"
                  />
                ))}
              </div>
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
              Imágenes (URLs separadas por coma, opcional)
              <input
                value={form.images}
                onChange={(event) => handleChange('images', event.target.value)}
                className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              />
            </label>
            <label className="text-sm font-medium text-slate-700">
              Tags (separados por coma)
              <input
                value={form.tags}
                onChange={(event) => handleChange('tags', event.target.value)}
                className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              />
            </label>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <label className="text-sm font-medium text-slate-700">
              Precio original
              <input
                type="number"
                value={form.originalPrice}
                onChange={(event) => handleChange('originalPrice', event.target.value)}
                className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              />
            </label>
            <label className="text-sm font-medium text-slate-700">
              Descuento (%)
              <input
                type="number"
                value={form.discount}
                onChange={(event) => handleChange('discount', event.target.value)}
                className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              />
            </label>
            <label className="text-sm font-medium text-slate-700">
              Cuotas
              <input
                type="number"
                value={form.installments}
                onChange={(event) => handleChange('installments', event.target.value)}
                className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              />
            </label>
          </div>

          <div className="flex flex-wrap gap-4">
            <label className="flex items-center gap-2 text-sm text-slate-700">
              <input
                type="checkbox"
                checked={form.freeShipping}
                onChange={(event) => handleChange('freeShipping', event.target.checked)}
              />
              Envío gratis
            </label>
            <label className="flex items-center gap-2 text-sm text-slate-700">
              <input
                type="checkbox"
                checked={form.isOfferOfTheDay}
                onChange={(event) => handleChange('isOfferOfTheDay', event.target.checked)}
              />
              Oferta del día
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
            {saving ? 'Guardando...' : mode === 'create' ? 'Crear item' : 'Guardar cambios'}
          </button>
        </form>
      </section>
    </div>
  )
}
