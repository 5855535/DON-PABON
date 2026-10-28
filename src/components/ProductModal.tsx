import { useEffect, useRef } from 'react'
import { getCategory } from '../lib/categories'
import { track } from '../lib/metrics'
import type { Product } from '../lib/types'
import { productMessage } from '../lib/whatsapp'
import { ProductImage } from './ProductImage'
import { WhatsAppButton } from './WhatsAppButton'

export function ProductModal({ product, onClose }: { product: Product; onClose: () => void }) {
  const ref = useRef<HTMLDialogElement>(null)
  const category = getCategory(product.category)

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
      onClick={(e) => e.target === ref.current && onClose()}
      className="animate-fade-in m-auto w-[calc(100%-1.5rem)] max-w-2xl overflow-hidden rounded-2xl border border-line bg-card p-0 text-ink shadow-[0_30px_80px_-20px_rgb(0_0_0/0.9)] backdrop:bg-black/80"
    >
      <div className="grid max-h-[92svh] overflow-y-auto sm:grid-cols-2">
        <ProductImage src={product.image_url} alt={product.name} eager className="aspect-[4/3] w-full sm:aspect-auto sm:min-h-[18rem]" />
        <div className="flex flex-col gap-3 p-5">
          {category && <p className="text-[0.65rem] font-semibold tracking-[0.3em] text-accent">{category.label.toUpperCase()}</p>}
          <h2 id="modal-title" className="text-xl font-extrabold leading-tight">{product.name}</h2>
          <p className="text-sm leading-relaxed text-mute">{product.description || 'Horneado con ingredientes de calidad y mucho amor.'}</p>
          <div className="mt-auto flex flex-col gap-1 pt-2">
            <WhatsAppButton message={productMessage(product.name)} size="lg" block source="modal" product={{ id: product.id, name: product.name }} />
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
