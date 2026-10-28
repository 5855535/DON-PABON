import { useEffect, useRef } from 'react'
import { getCategory } from '../lib/categories'
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
    return () => {
      document.body.style.overflow = ''
      d?.close()
    }
  }, [])

  return (
    <dialog
      ref={ref}
      aria-labelledby="modal-title"
      onCancel={(e) => {
        e.preventDefault()
        onClose()
      }}
      onClick={(e) => e.target === ref.current && onClose()}
      className="animate-fade-in m-auto w-[calc(100%-1.5rem)] max-w-3xl overflow-hidden rounded-2xl border border-line bg-card p-0 text-ink shadow-[0_30px_80px_-20px_rgb(0_0_0/0.9)] backdrop:bg-black/80 backdrop:backdrop-blur-sm"
    >
      <div className="grid max-h-[92svh] overflow-y-auto md:grid-cols-2">
        <ProductImage src={product.image_url} alt={product.name} eager className="aspect-[4/3] w-full md:aspect-auto md:min-h-[24rem]" />
        <div className="flex flex-col gap-4 p-6 sm:p-8">
          {category && <p className="text-[0.7rem] font-semibold tracking-[0.35em] text-accent">{category.label.toUpperCase()}</p>}
          <h2 id="modal-title" className="text-3xl font-extrabold leading-tight">{product.name}</h2>
          <p className="leading-relaxed text-mute">{product.description || 'Horneado con ingredientes de calidad y mucho amor.'}</p>
          <p className="font-script text-2xl text-accent">Hecho fresco, con pasión ♡</p>
          <div className="mt-auto flex flex-col gap-3 pt-2">
            <WhatsAppButton message={productMessage(product.name)} size="lg" block />
            <button
              type="button"
              onClick={onClose}
              className="min-h-11 rounded-full text-sm font-medium text-mute transition hover:text-ink"
            >
              Seguir viendo productos
            </button>
          </div>
        </div>
      </div>
      <button
        type="button"
        onClick={onClose}
        aria-label="Cerrar"
        className="absolute right-3 top-3 grid h-11 w-11 place-items-center rounded-full bg-bg/80 text-ink backdrop-blur transition hover:bg-accent hover:text-bg"
      >
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
          <path d="M6 6l12 12M18 6L6 18" />
        </svg>
      </button>
    </dialog>
  )
}
