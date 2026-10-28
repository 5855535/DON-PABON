import { useState } from 'react'
import type { Product } from '../lib/types'
import { ProductImage } from './ProductImage'
import { ProductModal } from './ProductModal'

/** Tarjeta mínima tipo menú: foto + nombre. La descripción y el pedido están en el modal. */
export function ProductCard({ product }: { product: Product }) {
  const [open, setOpen] = useState(false)
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={`Ver ${product.name}`}
        className="group animate-fade-up flex w-full flex-col overflow-hidden rounded-xl border border-line bg-card text-left transition duration-300 hover:-translate-y-1 hover:border-accent/50 hover:shadow-[0_18px_40px_-20px_rgb(0_0_0/0.8)]"
      >
        <ProductImage src={product.image_url} alt="" className="aspect-[4/3] w-full" />
        <span className="flex min-h-12 items-center justify-between gap-2 px-3.5 py-3">
          <span className="text-[0.92rem] font-bold leading-tight text-ink">{product.name}</span>
          <span
            aria-hidden="true"
            className="grid h-7 w-7 shrink-0 place-items-center rounded-full border border-accent/60 text-accent transition group-hover:bg-accent group-hover:text-bg"
          >
            <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M13 6l6 6-6 6" />
            </svg>
          </span>
        </span>
      </button>
      {open && <ProductModal product={product} onClose={() => setOpen(false)} />}
    </>
  )
}

export function ProductCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-xl border border-line bg-card" aria-hidden="true">
      <div className="shimmer aspect-[4/3]" />
      <div className="p-3.5">
        <div className="shimmer h-4 w-2/3 rounded" />
      </div>
    </div>
  )
}
