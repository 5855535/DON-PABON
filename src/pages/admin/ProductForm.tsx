import { useEffect, useRef, useState, type FormEvent } from 'react'
import { CATEGORIES } from '../../lib/categories'
import { saveProduct } from '../../lib/products'
import type { CategorySlug, Product } from '../../lib/types'

const inputCls =
  'min-h-12 w-full rounded-xl border border-line bg-soft px-4 text-ink placeholder:text-mute/60 focus:border-accent focus:outline-none'

interface Props {
  product?: Product
  defaultCategory: CategorySlug
  onClose: () => void
  onSaved: () => void
}

export function ProductForm({ product, defaultCategory, onClose, onSaved }: Props) {
  const [name, setName] = useState(product?.name ?? '')
  const [description, setDescription] = useState(product?.description ?? '')
  const [category, setCategory] = useState<CategorySlug>(product?.category ?? defaultCategory)
  const [active, setActive] = useState(product?.is_active ?? true)
  const [featured, setFeatured] = useState(product?.is_featured ?? false)
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(product?.image_url ?? null)
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const dialogRef = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const d = dialogRef.current
    d?.showModal()
    return () => d?.close()
  }, [])

  useEffect(() => {
    if (!file) return
    const url = URL.createObjectURL(file)
    setPreview(url)
    return () => URL.revokeObjectURL(url)
  }, [file])

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return setError('El nombre es obligatorio.')
    if (!product && !file && !confirm('Este producto no tiene imagen. ¿Guardar de todos modos?')) return
    setBusy(true)
    setError(null)
    try {
      await saveProduct({
        id: product?.id,
        input: { name: name.trim(), description: description.trim() || null, category, is_active: active },
        file,
        featured: featured && active,
        previous: product,
      })
      onSaved()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo guardar el producto.')
      setBusy(false)
    }
  }

  return (
    <dialog
      ref={dialogRef}
      onCancel={(e) => {
        e.preventDefault()
        if (!busy) onClose()
      }}
      aria-labelledby="form-title"
      className="m-auto w-[calc(100%-2rem)] max-w-lg rounded-2xl border border-line bg-card p-0 text-ink backdrop:bg-black/70"
    >
      <form onSubmit={submit} className="max-h-[90svh] overflow-y-auto p-6">
        <h2 id="form-title" className="text-xl font-extrabold">{product ? 'Editar producto' : 'Nuevo producto'}</h2>

        <label htmlFor="p-name" className="mt-5 block text-sm font-medium">Nombre</label>
        <input id="p-name" required maxLength={120} value={name} onChange={(e) => setName(e.target.value)} className={`${inputCls} mt-1.5`} />

        <label htmlFor="p-desc" className="mt-4 block text-sm font-medium">Descripción breve</label>
        <textarea id="p-desc" rows={3} maxLength={600} value={description} onChange={(e) => setDescription(e.target.value)} className={`${inputCls} mt-1.5 py-3`} />

        <label htmlFor="p-cat" className="mt-4 block text-sm font-medium">Categoría</label>
        <select id="p-cat" value={category} onChange={(e) => setCategory(e.target.value as CategorySlug)} className={`${inputCls} mt-1.5`}>
          {CATEGORIES.map((c) => (
            <option key={c.slug} value={c.slug}>{c.label}</option>
          ))}
        </select>

        <p className="mt-4 text-sm font-medium">Imagen</p>
        <div className="mt-1.5 flex items-center gap-4">
          <div className="grid aspect-[4/3] w-28 shrink-0 place-items-center overflow-hidden rounded-lg border border-line bg-soft text-xs text-mute">
            {preview ? <img src={preview} alt="Vista previa de la imagen" className="h-full w-full object-cover" /> : 'Sin imagen'}
          </div>
          <div className="text-xs text-mute">
            <label className="inline-flex min-h-11 cursor-pointer items-center rounded-full border border-accent px-4 text-sm font-semibold text-accent transition hover:bg-accent hover:text-bg focus-within:outline focus-within:outline-2 focus-within:outline-accent">
              {product?.image_url ? 'Reemplazar imagen' : 'Subir imagen'}
              <input type="file" accept="image/jpeg,image/png,image/webp,image/avif" className="sr-only" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
            </label>
            <p className="mt-2">Se optimiza automáticamente a WebP (máx. 1600 px). Recomendado: horizontal 4:3.</p>
          </div>
        </div>

        <div className="mt-5 flex flex-col gap-3">
          <label className="flex min-h-11 items-center gap-3 text-sm">
            <input type="checkbox" checked={active} onChange={(e) => setActive(e.target.checked)} className="h-5 w-5 accent-[#EBA65D]" />
            Activo (visible en la web)
          </label>
          <label className="flex min-h-11 items-center gap-3 text-sm">
            <input type="checkbox" checked={featured && active} disabled={!active} onChange={(e) => setFeatured(e.target.checked)} className="h-5 w-5 accent-[#EBA65D]" />
            Producto estrella (reemplaza al actual)
          </label>
        </div>

        {error && <p role="alert" className="mt-4 rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-300">{error}</p>}

        <div className="mt-6 flex justify-end gap-3">
          <button type="button" onClick={onClose} disabled={busy} className="min-h-12 rounded-full border border-line px-6 text-sm font-semibold hover:border-accent">
            Cancelar
          </button>
          <button type="submit" disabled={busy} className="min-h-12 rounded-full bg-accent px-7 text-sm font-bold text-bg hover:bg-accent-hover disabled:opacity-60">
            {busy ? 'Guardando…' : 'Guardar'}
          </button>
        </div>
      </form>
    </dialog>
  )
}
