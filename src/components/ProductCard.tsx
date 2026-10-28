import type { Product } from '../lib/types'
import { productMessage } from '../lib/whatsapp'
import { ProductImage } from './ProductImage'
import { WhatsAppButton } from './WhatsAppButton'

export function ProductCard({ product }: { product: Product }) {
  return (
    <article className="group animate-fade-up flex flex-col overflow-hidden rounded-xl border border-line bg-card transition duration-300 hover:-translate-y-1 hover:border-accent/40 hover:shadow-[0_18px_40px_-20px_rgb(0_0_0/0.8)]">
      <ProductImage src={product.image_url} alt={product.name} className="aspect-[4/3] w-full" />
      <div className="flex flex-1 flex-col gap-1.5 p-4">
        <h3 className="text-base font-bold text-ink">{product.name}</h3>
        {product.description && <p className="line-clamp-2 text-[0.82rem] leading-relaxed text-mute">{product.description}</p>}
        <div className="mt-auto pt-3">
          <WhatsAppButton message={productMessage(product.name)} size="sm" block />
        </div>
      </div>
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
