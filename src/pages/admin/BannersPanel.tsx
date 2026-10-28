import { useCallback, useEffect, useState, type FormEvent } from 'react'
import {
  createBanner,
  deleteBanner,
  fetchAllBanners,
  replaceBannerImage,
  saveBannerOrder,
  updateBanner,
} from '../../lib/banners'
import type { Banner } from '../../lib/types'
import { btn, errMsg, inputCls, primaryBtn } from './ui'

export function BannersPanel() {
  const [banners, setBanners] = useState<Banner[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [title, setTitle] = useState('')
  const [formKey, setFormKey] = useState(0)

  const load = useCallback(async () => {
    try {
      setBanners(await fetchAllBanners())
      setError(null)
    } catch (e) {
      setError(errMsg(e, 'No se pudieron cargar los banners.'))
    } finally {
      setLoading(false)
    }
  }, [])
  useEffect(() => {
    load()
  }, [load])

  const run = async (fn: () => Promise<void>) => {
    setBusy(true)
    setError(null)
    try {
      await fn()
      await load()
    } catch (e) {
      setError(errMsg(e))
    } finally {
      setBusy(false)
    }
  }

  const add = (e: FormEvent) => {
    e.preventDefault()
    if (!file) return setError('Elige una imagen para el banner.')
    const next = (banners.at(-1)?.display_order ?? 0) + 10
    run(async () => {
      await createBanner(file, title, next)
      setFile(null)
      setTitle('')
      setFormKey((k) => k + 1)
    })
  }

  const move = (i: number, dir: -1 | 1) => {
    const ids = banners.map((b) => b.id)
    const j = i + dir
    if (j < 0 || j >= ids.length) return
    ;[ids[i], ids[j]] = [ids[j], ids[i]]
    run(() => saveBannerOrder(ids))
  }

  const rename = (b: Banner) => {
    const t = prompt('Texto del banner (vacío para ninguno):', b.title ?? '')
    if (t !== null) run(() => updateBanner(b.id, { title: t.trim().slice(0, 80) || null }))
  }

  return (
    <>
      <p className="text-xs text-mute">
        Imágenes que giran en el inicio, deslizando a la izquierda. Orden de arriba hacia abajo. Recomendado: horizontal
        16:9 (ej. 1600×900). Si no hay banners activos se muestra la portada por defecto.
      </p>

      <form key={formKey} onSubmit={add} className="mt-4 rounded-xl border border-line bg-card p-3">
        <p className="text-sm font-bold">Agregar banner</p>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <label className="inline-flex min-h-10 cursor-pointer items-center rounded-full border border-accent px-4 text-xs font-semibold text-accent transition hover:bg-accent hover:text-bg focus-within:outline focus-within:outline-2 focus-within:outline-accent">
            {file ? 'Cambiar imagen' : 'Elegir imagen'}
            <input type="file" accept="image/jpeg,image/png,image/webp,image/avif" className="sr-only" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
          </label>
          <span className="max-w-[10rem] truncate text-xs text-mute">{file?.name ?? 'Ninguna seleccionada'}</span>
          <input
            aria-label="Texto del banner (opcional)"
            placeholder="Texto opcional (ej. Pan fresco hoy)"
            maxLength={80}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className={`${inputCls} min-w-0 flex-1 basis-48`}
          />
          <button type="submit" disabled={busy || !file} className={primaryBtn}>{busy ? 'Subiendo…' : 'Agregar'}</button>
        </div>
      </form>

      {error && <p role="alert" className="mt-3 rounded-lg bg-red-500/10 px-4 py-3 text-sm text-red-300">{error}</p>}

      <div className="mt-4 space-y-2">
        {loading && <p className="text-sm text-mute">Cargando…</p>}
        {!loading && banners.length === 0 && <p className="rounded-xl border border-dashed border-line p-6 text-center text-sm text-mute">Aún no hay banners.</p>}
        {banners.map((b, i) => (
          <article key={b.id} className={`flex flex-wrap items-center gap-3 rounded-xl border border-line bg-card p-2.5 ${b.is_active ? '' : 'opacity-60'}`}>
            <img src={b.image_url} alt={b.title ?? `Banner ${i + 1}`} className="aspect-[16/9] w-24 shrink-0 rounded-lg object-cover" />
            <div className="min-w-0 flex-1 basis-32">
              <p className="truncate text-sm font-semibold">{b.title || <span className="text-mute">Sin texto</span>}</p>
              <p className="text-[0.7rem] text-mute">#{i + 1} · {b.is_active ? 'Activo' : 'Oculto'}</p>
            </div>
            <div className="flex flex-wrap items-center gap-1.5">
              <button className={btn} disabled={busy || i === 0} onClick={() => move(i, -1)} aria-label="Subir banner">↑</button>
              <button className={btn} disabled={busy || i === banners.length - 1} onClick={() => move(i, 1)} aria-label="Bajar banner">↓</button>
              <button className={btn} disabled={busy} onClick={() => rename(b)}>Texto</button>
              <label className={`${btn} cursor-pointer focus-within:outline focus-within:outline-2 focus-within:outline-accent`}>
                Imagen
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/avif"
                  className="sr-only"
                  onChange={(e) => {
                    const f = e.target.files?.[0]
                    e.target.value = ''
                    if (f) run(() => replaceBannerImage(b, f))
                  }}
                />
              </label>
              <button className={btn} disabled={busy} onClick={() => run(() => updateBanner(b.id, { is_active: !b.is_active }))}>{b.is_active ? 'Ocultar' : 'Activar'}</button>
              <button
                className={`${btn} text-red-300 hover:!border-red-400 hover:!text-red-300`}
                disabled={busy}
                onClick={() => confirm('¿Eliminar este banner?') && run(() => deleteBanner(b))}
              >
                Eliminar
              </button>
            </div>
          </article>
        ))}
      </div>
    </>
  )
}
