import { useEffect, useRef, useState } from 'react'
import { getCategory } from '../lib/categories'
import { track } from '../lib/metrics'
import type { Product } from '../lib/types'
import { productMessage } from '../lib/whatsapp'
import { ProductImage } from './ProductImage'
import { WhatsAppButton } from './WhatsAppButton'

export function ProductModal({ product, onClose }: { product: Product; onClose: () => void }) {
  const ref = useRef<HTMLDialogElement>(null)
  const touchX = useRef<number | null>(null)
  const category = getCategory(product.category)
  const images = [product.image_url, ...(product.gallery ?? []).map((g) => g.url)].filter((u): u is string => !!u)
  const [active, setActive] = useState(0)
  const total = Math.max(images.length, 1)
  const go = (i: number) => setActive(((i % total) + total) % total)

  useEffect(() => {
    const d = ref.current
    d?.showModal()
    document.body.style.overflow = 'hidden'
    track('product_view', { id: product.id, name: product.name })
    return () => {
      document.body.style.overflow = ''
      d?.close()
    }
  }, [product.id, product.name])

  return (
    <dialog
      ref={ref}
      aria-labelledby="modal-title"
      onCancel={(e) => {
        e.preventDefault()
        onClose()
      }}
      onKeyDown={(e) => {
        if (e.key === 'ArrowRight') go(active + 1)
        if (e.key === 'ArrowLeft') go(active - 1)
      }}
      onClick={(e) => e.target === ref.current && onClose()}
      className="animate-fade-in mx-auto mb-0 mt-auto w-full max-w-none overflow-hidden rounded-b-none rounded-t-2xl border border-line bg-card p-0 text-ink shadow-[0_-20px_60px_-20px_rgb(0_0_0/0.9)] backdrop:bg-black/75 sm:my-auto sm:w-[calc(100%-1.5rem)] sm:max-w-xl sm:rounded-2xl"
    >
      <div className="grid max-h-[85svh] overflow-y-auto sm:grid-cols-2">
        <div className="flex flex-col bg-soft">
          <div
            className="relative overflow-hidden"
            onTouchStart={(e) => {
              touchX.current = e.touches[0].clientX
            }}
            onTouchEnd={(e) => {
              const start = touchX.current
              touchX.current = null
              if (start === null || total < 2) return
              const dx = e.changedTouches[0].clientX - start
              if (dx < -40) go(active + 1)
              else if (dx > 40) go(active - 1)
            }}
          >
            <div className="flex transition-transform duration-500 ease-out" style={{ transform: `translateX(-${active * 100}%)` }}>
              {(images.length ? images : [null]).map((src, i) => (
                <div key={i} className="w-full shrink-0" aria-hidden={i !== active}>
                  <ProductImage
                    src={src}
                    alt={images.length > 1 ? `${product.name} — foto ${i + 1} de ${images.length}` : product.name}
                    eager={i === 0}
                    className="aspect-[16/10] max-h-[34svh] w-full sm:aspect-auto sm:max-h-none sm:min-h-[15rem]"
                  />
                </div>
              ))}
            </div>
            {total > 1 && (
              <>
                <button type="button" onClick={() => go(active - 1)} aria-label="Foto anterior" className="absolute left-2 top-1/2 hidden h-9 w-9 -translate-y-1/2 place-items-center rounded-full bg-bg/70 text-ink backdrop-blur transition hover:bg-accent hover:text-bg sm:grid">‹</button>
                <button type="button" onClick={() => go(active + 1)} aria-label="Foto siguiente" className="absolute right-2 top-1/2 hidden h-9 w-9 -translate-y-1/2 place-items-center rounded-full bg-bg/70 text-ink backdrop-blur transition hover:bg-accent hover:text-bg sm:grid">›</button>
              </>
            )}
          </div>

          {total > 1 && (
            <div className="flex gap-1.5 p-2" role="group" aria-label="Fotos del producto">
              {images.map((src, i) => (
                <button
                  key={src + i}
                  type="button"
                  onClick={() => go(i)}
                  aria-label={`Ver foto ${i + 1} de ${total}`}
                  aria-current={i === active}
                  className={`h-11 w-14 overflow-hidden rounded-md border-2 transition ${i === active ? 'border-accent' : 'border-transparent opacity-60 hover:opacity-100'}`}
                >
                  <img src={src} alt="" loading="lazy" decoding="async" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex flex-col gap-2 p-4 sm:gap-3 sm:p-5">
          {category && <p className="text-[0.65rem] font-semibold tracking-[0.3em] text-accent">{category.label.toUpperCase()}</p>}
          <h2 id="modal-title" className="text-lg font-extrabold leading-tight">{product.name}</h2>
          <p className="text-[0.82rem] leading-relaxed text-mute">{product.description || 'Horneado con ingredientes de calidad y mucho amor.'}</p>
          <div className="mt-auto flex flex-col gap-1 pt-2">
            <WhatsAppButton message={productMessage(product.name)} size="md" block source="modal" product={{ id: product.id, name: product.name }} />
            <button type="button" onClick={onClose} className="min-h-10 rounded-full text-xs font-medium text-mute transition hover:text-ink">
              Seguir viendo
            </button>
          </div>
        </div>
      </div>
      <button
        type="button"
        onClick={onClose}
        aria-label="Cerrar"
        className="absolute right-2.5 top-2.5 grid h-10 w-10 place-items-center rounded-full bg-bg/80 text-ink backdrop-blur transition hover:bg-accent hover:text-bg"
      >
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" aria-hidden="true">
          <path d="M6 6l12 12M18 6L6 18" />
        </svg>
      </button>
    </dialog>
  )
}
