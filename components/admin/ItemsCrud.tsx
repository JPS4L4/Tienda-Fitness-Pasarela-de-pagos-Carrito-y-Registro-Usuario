'use client'

import { formatPrice, MAX_DISCOUNT } from '@/lib/money'
import {
  CATALOG_CURRENCY,
  MAX_INSTALLMENTS,
  MAX_STOCK,
  MIN_CATALOG_PRICE,
  validateCatalogMoney,
} from '@/lib/catalogValidation'

import { useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import ReadOnlyNotice from '@/components/admin/ReadOnlyNotice'

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
  discount: number | null
  originalPrice: number | null
  installments: number | null
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

export default function ItemsCrud({ readOnly = false }: { readOnly?: boolean }) {
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
      // Mismas reglas que el servidor: se informa el error antes de enviar
      const money = validateCatalogMoney(form, { kind: 'item' })
      if (!money.ok) {
        setError(money.error)
        return
      }

      const payload = {
        title: form.title.trim(),
        slug: form.slug.trim() || slugify(form.title),
        price: money.value.price,
        currency: CATALOG_CURRENCY,
        category: form.category.trim(),
        stock: money.value.stock,
        images: uploadedImages.length > 0 ? uploadedImages : parseArray(form.images),
        tags: parseArray(form.tags),
        description: form.description.trim() || null,
        shortDescription: form.shortDescription.trim() || null,
        freeShipping: form.freeShipping,
        isOfferOfTheDay: form.isOfferOfTheDay,
        discount: money.value.discount,
        originalPrice: money.value.originalPrice,
        installments: money.value.installments,
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
      discount: item.discount ? String(item.discount) : '',
      originalPrice: item.originalPrice ? String(item.originalPrice) : '',
      installments: item.installments ? String(item.installments) : '',
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
            {uploadedImages.length > 0 && (
              <div className="flex flex-wrap gap-3">
                {uploadedImages.map((src, index) => (
                  <img
                    key={`${src}-${index}`}
                    src={src}
                    alt="Preview"
                    className="h-20 w-20  border border-line object-cover"
                  />
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
            <label className="text-sm font-medium text-fg-soft">
              Imágenes (URLs separadas por coma, opcional)
              <input
                value={form.images}
                onChange={(event) => handleChange('images', event.target.value)}
                className="input mt-2 !min-h-10 text-sm"
              />
            </label>
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
