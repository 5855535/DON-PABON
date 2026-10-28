import { useCallback, useEffect, useState } from 'react'
import { CATEGORIES } from '../../lib/categories'
import { clearFeatured, deleteProduct, fetchAllProducts, saveOrder, setActive, setFeatured } from '../../lib/products'
import { useProducts } from '../../lib/ProductsContext'
import type { CategorySlug, Product } from '../../lib/types'
import { ProductImage } from '../../components/ProductImage'
import { ProductForm } from './ProductForm'

const btn =
  'grid h-11 min-w-11 place-items-center rounded-full border border-line px-3 text-sm transition hover:border-accent hover:text-accent disabled:opacity-30 disabled:hover:border-line disabled:hover:text-inherit'

export default function Dashboard({ onSignOut }: { onSignOut: () => void }) {
  const { reload } = useProducts()
  const [all, setAll] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [category, setCategory] = useState<CategorySlug>('panes')
  const [editing, setEditing] = useState<Product | 'new' | null>(null)

  const load = useCallback(async () => {
    try {
      setAll(await fetchAllProducts())
      setError(null)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo cargar el catálogo.')
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
      setError(e instanceof Error ? e.message : 'Ocurrió un error.')
    }
  }

  const list = all.filter((p) => p.category === category)
  const star = all.find((p) => p.is_featured)

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
    <section className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold sm:text-3xl">Administración del catálogo</h1>
          <p className="mt-1 text-sm text-mute">
            Producto estrella: <strong className="text-accent">{star ? star.name : 'ninguno'}</strong>
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <a href={`/${category}`} target="_blank" rel="noopener noreferrer" className={btn}>Vista previa ↗</a>
          <button className={btn} onClick={onSignOut}>Cerrar sesión</button>
        </div>
      </div>

      <div role="tablist" aria-label="Categorías" className="mt-6 flex flex-wrap gap-2">
        {CATEGORIES.map((c) => (
          <button
            key={c.slug}
            role="tab"
            aria-selected={category === c.slug}
            onClick={() => setCategory(c.slug)}
            className={`min-h-11 rounded-full border px-5 text-sm font-semibold transition ${category === c.slug ? 'border-accent bg-accent text-bg' : 'border-line text-ink hover:border-accent'}`}
          >
            {c.label} <span className="opacity-70">({all.filter((p) => p.category === c.slug).length})</span>
          </button>
        ))}
        <button onClick={() => setEditing('new')} className="ml-auto min-h-11 rounded-full bg-accent px-6 text-sm font-bold text-bg hover:bg-accent-hover">
          + Nuevo producto
        </button>
      </div>

      {error && <p role="alert" className="mt-4 rounded-lg bg-red-500/10 px-4 py-3 text-sm text-red-300">{error}</p>}

      <div className="mt-5 space-y-3">
        {loading && <p className="text-mute">Cargando…</p>}
        {!loading && list.length === 0 && <p className="rounded-xl border border-dashed border-line p-8 text-center text-mute">No hay productos en esta categoría.</p>}
        {list.map((p, i) => (
          <article key={p.id} className={`flex flex-wrap items-center gap-3 rounded-xl border bg-card p-3 ${p.is_active ? 'border-line' : 'border-line opacity-60'}`}>
            <ProductImage src={p.image_url} alt={p.name} className="aspect-[4/3] w-24 shrink-0 rounded-lg" />
            <div className="min-w-0 flex-1 basis-40">
              <h2 className="truncate font-bold">{p.name}</h2>
              <p className="text-xs text-mute">
                {p.is_active ? 'Activo' : 'Oculto'}
                {p.is_featured && <span className="ml-2 font-semibold text-accent">★ Producto estrella</span>}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button className={btn} onClick={() => move(i, -1)} disabled={i === 0} aria-label={`Subir ${p.name}`}>↑</button>
              <button className={btn} onClick={() => move(i, 1)} disabled={i === list.length - 1} aria-label={`Bajar ${p.name}`}>↓</button>
              <button
                className={btn}
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
    </section>
  )
}
