import { useState } from 'react'
import type { Product } from '../lib/types'
import { ProductImage } from './ProductImage'
import { ProductModal } from './ProductModal'

export function ProductCard({ product }: { product: Product }) {
  const [open, setOpen] = useState(false)
  return (
    <article className="group animate-fade-up flex flex-col overflow-hidden rounded-xl border border-line bg-card transition duration-300 hover:-translate-y-1 hover:border-accent/40 hover:shadow-[0_18px_40px_-20px_rgb(0_0_0/0.8)]">
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={`Ver ${product.name}`}
        className="relative block w-full cursor-zoom-in text-left"
      >
        <ProductImage src={product.image_url} alt={product.name} className="aspect-[4/3] w-full" />
        <span className="pointer-events-none absolute inset-x-0 bottom-0 flex items-end justify-center bg-gradient-to-t from-black/70 to-transparent pb-3 pt-10 text-xs font-semibold text-ink opacity-0 transition group-hover:opacity-100">
          Toca para ver más
        </span>
      </button>
      <div className="flex flex-1 flex-col gap-1.5 p-4">
        <h3 className="text-base font-bold text-ink">{product.name}</h3>
        {product.description && <p className="line-clamp-2 text-[0.82rem] leading-relaxed text-mute">{product.description}</p>}
        <div className="mt-auto pt-3">
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="group/btn inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full border border-accent/70 px-4 text-[0.8rem] font-bold text-accent transition duration-300 hover:bg-accent hover:text-bg"
          >
            Ver producto
            <svg viewBox="0 0 24 24" className="h-4 w-4 transition-transform group-hover/btn:translate-x-1" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M5 12h14M13 6l6 6-6 6" />
            </svg>
          </button>
        </div>
      </div>
      {open && <ProductModal product={product} onClose={() => setOpen(false)} />}
    </article>
  )
}

export function ProductCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-xl border border-line bg-card" aria-hidden="true">
      <div className="shimmer aspect-[4/3]" />
      <div className="space-y-3 p-4">
        <div className="shimmer h-4 w-2/3 rounded" />
        <div className="shimmer h-3 w-full rounded" />
        <div className="shimmer mt-4 h-11 w-full rounded-full" />
      </div>
    </div>
  )
}
