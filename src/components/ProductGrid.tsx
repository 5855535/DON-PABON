import { useProducts } from '../lib/ProductsContext'
import type { Product } from '../lib/types'
import { ProductCard, ProductCardSkeleton } from './ProductCard'

const GRID = 'grid grid-cols-1 gap-4 min-[480px]:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 lg:gap-5'

export function ProductGrid({ products, emptyText = 'Aún no hay productos en esta categoría.' }: { products: Product[]; emptyText?: string }) {
  const { status, reload } = useProducts()

  if (status === 'loading')
    return (
      <div className={GRID} aria-busy="true" aria-label="Cargando productos">
        {Array.from({ length: 8 }, (_, i) => (
          <ProductCardSkeleton key={i} />
        ))}
      </div>
    )

  if (status === 'error')
    return (
      <div role="alert" className="rounded-xl border border-line bg-card px-6 py-12 text-center">
        <p className="text-lg font-bold">No pudimos cargar los productos</p>
        <p className="mx-auto mt-2 max-w-md text-sm text-mute">Revisa tu conexión a internet e inténtalo de nuevo.</p>
        <button
          type="button"
          onClick={reload}
          className="mt-5 min-h-11 rounded-full border border-accent px-6 text-sm font-semibold text-accent transition hover:bg-accent hover:text-bg"
        >
          Reintentar
        </button>
      </div>
    )

  if (products.length === 0)
    return (
      <div className="rounded-xl border border-dashed border-line bg-card/50 px-6 py-14 text-center">
        <p className="font-script text-3xl text-accent">Pronto, más sabores</p>
        <p className="mt-2 text-sm text-mute">{emptyText}</p>
      </div>
    )

  return (
    <ul className={GRID}>
      {products.map((p) => (
        <li key={p.id} className="contents">
          <ProductCard product={p} />
        </li>
      ))}
    </ul>
  )
}
