import { useCallback, useEffect, useState, type FormEvent } from 'react'
import { CATEGORIES } from '../../lib/categories'
import { clearFeatured, deleteProduct, fetchAllProducts, saveOrder, setActive, setBestseller, setFeatured } from '../../lib/products'
import { useProducts } from '../../lib/ProductsContext'
import type { CategorySlug, Product } from '../../lib/types'
import { ProductImage } from '../../components/ProductImage'
import { DEFAULT_FEATURED_LABEL, fetchFeaturedLabel, saveFeaturedLabel } from '../../lib/settings'
import { ProductForm } from './ProductForm'
import { btn, errMsg, inputCls, primaryBtn } from './ui'

export function ProductsPanel() {
  const { reload } = useProducts()
  const [all, setAll] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [category, setCategory] = useState<CategorySlug>('panes')
  const [editing, setEditing] = useState<Product | 'new' | null>(null)
  const [label, setLabel] = useState(DEFAULT_FEATURED_LABEL)
  const [labelMsg, setLabelMsg] = useState<string | null>(null)

  useEffect(() => {
    fetchFeaturedLabel().then(setLabel)
  }, [])

  const submitLabel = async (e: FormEvent) => {
    e.preventDefault()
    setLabelMsg(null)
    try {
      await saveFeaturedLabel(label)
      if (!label.trim()) setLabel(DEFAULT_FEATURED_LABEL)
      setLabelMsg('Guardado ✓')
    } catch (err) {
      setLabelMsg(errMsg(err, 'No se pudo guardar.'))
    }
  }

  const load = useCallback(async () => {
    try {
      setAll(await fetchAllProducts())
      setError(null)
    } catch (e) {
      setError(errMsg(e, 'No se pudo cargar el catálogo.'))
    } finally {
      setLoading(false)
    }
  }, [])
  useEffect(() => {
    load()
  }, [load])

  const refresh = async () => {
    await load()
    reload() // mantiene el catálogo público al día
  }

  const run = async (fn: () => Promise<void>) => {
    setError(null)
    try {
      await fn()
      await refresh()
    } catch (e) {
      setError(errMsg(e))
    }
  }

  const list = all.filter((p) => p.category === category)
  const star = all.find((p) => p.is_featured)
  const bestCount = all.filter((p) => p.is_bestseller).length

  const move = (index: number, dir: -1 | 1) => {
    const ids = list.map((p) => p.id)
    const j = index + dir
    if (j < 0 || j >= ids.length) return
    ;[ids[index], ids[j]] = [ids[j], ids[index]]
    run(() => saveOrder(ids))
  }

  const remove = (p: Product) => {
    if (confirm(`¿Eliminar "${p.name}"? Esta acción no se puede deshacer.`)) run(() => deleteProduct(p))
  }

  return (
    <>
      <p className="text-xs text-mute">
        Estrella: <strong className="text-accent">{star ? star.name : 'ninguno'}</strong> · Más pedidos en el inicio:{' '}
        <strong className="text-accent">{bestCount}</strong> (se muestran hasta 8)
      </p>

      <form onSubmit={submitLabel} className="mt-3 rounded-xl border border-line bg-card p-3">
        <label htmlFor="star-label" className="text-xs font-medium">Texto de la etiqueta del producto estrella</label>
        <div className="mt-1.5 flex flex-wrap items-center gap-2">
          <input
            id="star-label"
            value={label}
            maxLength={40}
            onChange={(e) => {
              setLabel(e.target.value)
              setLabelMsg(null)
            }}
            placeholder={DEFAULT_FEATURED_LABEL}
            className={`${inputCls} min-w-0 flex-1 basis-48`}
          />
          <button type="submit" className={primaryBtn}>Guardar</button>
          {labelMsg && <span role="status" className="text-xs text-mute">{labelMsg}</span>}
        </div>
        <p className="mt-1 text-[0.7rem] text-mute">Ej.: «Recomendado del chef», «Lo más pedido». Déjalo vacío para volver a «{DEFAULT_FEATURED_LABEL}».</p>
      </form>

      <div role="tablist" aria-label="Categorías" className="mt-3 flex flex-wrap items-center gap-2">
        {CATEGORIES.map((c) => (
          <button
            key={c.slug}
            role="tab"
            aria-selected={category === c.slug}
            onClick={() => setCategory(c.slug)}
            className={`min-h-10 rounded-full border px-4 text-xs font-semibold transition ${category === c.slug ? 'border-accent bg-accent text-bg' : 'border-line text-ink hover:border-accent'}`}
          >
            {c.label} <span className="opacity-70">({all.filter((p) => p.category === c.slug).length})</span>
          </button>
        ))}
        <button onClick={() => setEditing('new')} className={`${primaryBtn} ml-auto`}>+ Nuevo</button>
      </div>

      {error && <p role="alert" className="mt-3 rounded-lg bg-red-500/10 px-4 py-3 text-sm text-red-300">{error}</p>}

      <div className="mt-4 space-y-2">
        {loading && <p className="text-sm text-mute">Cargando…</p>}
        {!loading && list.length === 0 && <p className="rounded-xl border border-dashed border-line p-6 text-center text-sm text-mute">No hay productos en esta categoría.</p>}
        {list.map((p, i) => (
          <article key={p.id} className={`flex flex-wrap items-center gap-3 rounded-xl border border-line bg-card p-2.5 ${p.is_active ? '' : 'opacity-60'}`}>
            <ProductImage src={p.image_url} alt={p.name} className="aspect-[4/3] w-16 shrink-0 rounded-lg" />
            <div className="min-w-0 flex-1 basis-32">
              <h2 className="truncate text-sm font-bold">{p.name}</h2>
              <p className="text-[0.7rem] text-mute">
                {p.is_active ? 'Activo' : 'Oculto'}
                {p.is_featured && <span className="ml-2 font-semibold text-accent">★ Estrella</span>}
                {p.is_bestseller && <span className="ml-2 font-semibold text-accent">▲ Más pedido</span>}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-1.5">
              <button className={btn} onClick={() => move(i, -1)} disabled={i === 0} aria-label={`Subir ${p.name}`}>↑</button>
              <button className={btn} onClick={() => move(i, 1)} disabled={i === list.length - 1} aria-label={`Bajar ${p.name}`}>↓</button>
              <button
                className={`${btn} ${p.is_bestseller ? 'border-accent text-accent' : ''}`}
                aria-pressed={p.is_bestseller}
                title="Más pedido (aparece en el inicio)"
                onClick={() => run(() => setBestseller(p.id, !p.is_bestseller))}
              >
                {p.is_bestseller ? '▲ Más pedido' : '△ Más pedido'}
              </button>
              <button
                className={`${btn} ${p.is_featured ? 'border-accent text-accent' : ''}`}
                aria-pressed={p.is_featured}
                onClick={() => run(() => (p.is_featured ? clearFeatured(p.id) : setFeatured(p.id)))}
                aria-label={p.is_featured ? `Quitar ${p.name} como estrella` : `Elegir ${p.name} como producto estrella`}
              >
                {p.is_featured ? '★' : '☆'}
              </button>
              <button className={btn} onClick={() => run(() => setActive(p.id, !p.is_active))}>{p.is_active ? 'Ocultar' : 'Activar'}</button>
              <button className={btn} onClick={() => setEditing(p)}>Editar</button>
              <button className={`${btn} text-red-300 hover:!border-red-400 hover:!text-red-300`} onClick={() => remove(p)}>Eliminar</button>
            </div>
          </article>
        ))}
      </div>

      <p className="mt-4 text-center text-xs text-mute">
        <a href={`/${category}`} target="_blank" rel="noopener noreferrer" className="underline-offset-4 hover:text-accent hover:underline">Vista previa de esta categoría ↗</a>
        {' · '}
        <a href="/" target="_blank" rel="noopener noreferrer" className="underline-offset-4 hover:text-accent hover:underline">Vista previa del inicio ↗</a>
      </p>

      {editing && (
        <ProductForm
          product={editing === 'new' ? undefined : editing}
          defaultCategory={category}
          onClose={() => setEditing(null)}
          onSaved={() => {
            setEditing(null)
            refresh()
          }}
        />
      )}
    </>
  )
}
