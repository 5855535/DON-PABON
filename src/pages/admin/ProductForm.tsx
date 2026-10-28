import { useEffect, useRef, useState, type FormEvent } from 'react'
import { CATEGORIES } from '../../lib/categories'
import { MAX_IMAGES, saveProduct, type ImageSlot } from '../../lib/products'
import type { CategorySlug, Product } from '../../lib/types'
import { errMsg, inputCls } from './ui'

interface Props {
  product?: Product
  defaultCategory: CategorySlug
  onClose: () => void
  onSaved: () => void
}

const initialSlots = (p?: Product): ImageSlot[] => {
  if (!p) return []
  const main = p.image_url ? [{ url: p.image_url, path: p.image_path }] : []
  return [...main, ...(p.gallery ?? []).map((g) => ({ url: g.url, path: g.path || null }))]
}

const miniBtn =
  'grid h-8 min-w-8 place-items-center rounded-full bg-bg/85 px-2 text-xs font-semibold text-ink backdrop-blur transition hover:bg-accent hover:text-bg disabled:opacity-30'

export function ProductForm({ product, defaultCategory, onClose, onSaved }: Props) {
  const [name, setName] = useState(product?.name ?? '')
  const [description, setDescription] = useState(product?.description ?? '')
  const [category, setCategory] = useState<CategorySlug>(product?.category ?? defaultCategory)
  const [active, setActive] = useState(product?.is_active ?? true)
  const [featured, setFeatured] = useState(product?.is_featured ?? false)
  const [bestseller, setBestseller] = useState(product?.is_bestseller ?? false)
  const [slots, setSlots] = useState<ImageSlot[]>(() => initialSlots(product))
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const dialogRef = useRef<HTMLDialogElement>(null)
  const blobUrls = useRef<string[]>([])

  useEffect(() => {
    const d = dialogRef.current
    d?.showModal()
    const urls = blobUrls.current
    return () => {
      d?.close()
      urls.forEach((u) => URL.revokeObjectURL(u))
    }
  }, [])

  const addFiles = (files: FileList | null) => {
    if (!files) return
    const room = MAX_IMAGES - slots.length
    const picked = [...files].filter((f) => f.type.startsWith('image/')).slice(0, room)
    if (files.length > room) setError(`Máximo ${MAX_IMAGES} imágenes por producto.`)
    else setError(null)
    const added = picked.map((file) => {
      const url = URL.createObjectURL(file)
      blobUrls.current.push(url)
      return { url, path: null, file }
    })
    setSlots((s) => [...s, ...added])
  }

  const move = (i: number, dir: -1 | 1) =>
    setSlots((s) => {
      const j = i + dir
      if (j < 0 || j >= s.length) return s
      const next = [...s]
      ;[next[i], next[j]] = [next[j], next[i]]
      return next
    })
  const remove = (i: number) => setSlots((s) => s.filter((_, k) => k !== i))

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return setError('El nombre es obligatorio.')
    if (!product && slots.length === 0 && !confirm('Este producto no tiene imagen. ¿Guardar de todos modos?')) return
    setBusy(true)
    setError(null)
    try {
      await saveProduct({
        id: product?.id,
        input: { name: name.trim(), description: description.trim() || null, category, is_active: active, is_bestseller: bestseller },
        images: slots,
        featured: featured && active,
        previous: product,
      })
      onSaved()
    } catch (err) {
      setError(errMsg(err, 'No se pudo guardar el producto.'))
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
      className="m-auto w-[calc(100%-1.5rem)] max-w-md rounded-2xl border border-line bg-card p-0 text-ink backdrop:bg-black/70"
    >
      <form onSubmit={submit} className="max-h-[92svh] overflow-y-auto p-5">
        <h2 id="form-title" className="text-lg font-extrabold">{product ? 'Editar producto' : 'Nuevo producto'}</h2>

        <label htmlFor="p-name" className="mt-4 block text-xs font-medium">Nombre</label>
        <input id="p-name" required maxLength={120} value={name} onChange={(e) => setName(e.target.value)} className={`${inputCls} mt-1`} />

        <label htmlFor="p-desc" className="mt-3 block text-xs font-medium">Descripción breve</label>
        <textarea id="p-desc" rows={3} maxLength={600} value={description} onChange={(e) => setDescription(e.target.value)} className={`${inputCls} mt-1 py-2.5`} />

        <label htmlFor="p-cat" className="mt-3 block text-xs font-medium">Categoría</label>
        <select id="p-cat" value={category} onChange={(e) => setCategory(e.target.value as CategorySlug)} className={`${inputCls} mt-1`}>
          {CATEGORIES.map((c) => (
            <option key={c.slug} value={c.slug}>{c.label}</option>
          ))}
        </select>

        <p className="mt-3 text-xs font-medium">
          Imágenes <span className="text-mute">({slots.length}/{MAX_IMAGES}) · la primera es la principal</span>
        </p>
        <ul className="mt-1.5 grid grid-cols-2 gap-2">
          {slots.map((s, i) => (
            <li key={s.url} className="relative overflow-hidden rounded-lg border border-line bg-soft">
              <img src={s.url} alt={`Imagen ${i + 1} del producto`} className="aspect-[4/3] w-full object-cover" />
              {i === 0 && (
                <span className="absolute left-1.5 top-1.5 rounded-full bg-accent px-2 py-0.5 text-[0.6rem] font-bold text-bg">Principal</span>
              )}
              <div className="absolute inset-x-1.5 bottom-1.5 flex items-center justify-between gap-1">
                <span className="flex gap-1">
                  <button type="button" className={miniBtn} disabled={i === 0} onClick={() => move(i, -1)} aria-label={`Mover imagen ${i + 1} antes`}>←</button>
                  <button type="button" className={miniBtn} disabled={i === slots.length - 1} onClick={() => move(i, 1)} aria-label={`Mover imagen ${i + 1} después`}>→</button>
                </span>
                <button type="button" className={`${miniBtn} hover:!bg-red-500 hover:!text-white`} onClick={() => remove(i)} aria-label={`Quitar imagen ${i + 1}`}>✕</button>
              </div>
            </li>
          ))}
          {slots.length < MAX_IMAGES && (
            <li>
              <label className="flex aspect-[4/3] cursor-pointer flex-col items-center justify-center gap-1 rounded-lg border border-dashed border-accent/60 text-center text-xs font-semibold text-accent transition hover:bg-accent/10 focus-within:outline focus-within:outline-2 focus-within:outline-accent">
                <span className="text-xl leading-none" aria-hidden="true">＋</span>
                Agregar imagen
                <input
                  type="file"
                  multiple
                  accept="image/jpeg,image/png,image/webp,image/avif"
                  className="sr-only"
                  onChange={(e) => {
                    addFiles(e.target.files)
                    e.target.value = ''
                  }}
                />
              </label>
            </li>
          )}
        </ul>
        <p className="mt-1.5 text-[0.7rem] text-mute">Se optimizan a WebP automáticamente. Ideal: horizontal 4:3 (1200 × 900 px).</p>

        <div className="mt-3 flex flex-col">
          <label className="flex min-h-10 items-center gap-3 text-sm">
            <input type="checkbox" checked={active} onChange={(e) => setActive(e.target.checked)} className="h-5 w-5 accent-[#EBA65D]" />
            Activo (visible en la web)
          </label>
          <label className="flex min-h-10 items-center gap-3 text-sm">
            <input type="checkbox" checked={bestseller} onChange={(e) => setBestseller(e.target.checked)} className="h-5 w-5 accent-[#EBA65D]" />
            Recomendado (aparece en el inicio)
          </label>
          <label className="flex min-h-10 items-center gap-3 text-sm">
            <input type="checkbox" checked={featured && active} disabled={!active} onChange={(e) => setFeatured(e.target.checked)} className="h-5 w-5 accent-[#EBA65D]" />
            Producto estrella (reemplaza al actual)
          </label>
        </div>

        {error && <p role="alert" className="mt-3 rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-300">{error}</p>}

        <div className="mt-5 flex justify-end gap-2">
          <button type="button" onClick={onClose} disabled={busy} className="min-h-10 rounded-full border border-line px-5 text-xs font-semibold hover:border-accent">
            Cancelar
          </button>
          <button type="submit" disabled={busy} className="min-h-10 rounded-full bg-accent px-6 text-xs font-bold text-bg hover:bg-accent-hover disabled:opacity-60">
            {busy ? 'Guardando…' : 'Guardar'}
          </button>
        </div>
      </form>
    </dialog>
  )
}
