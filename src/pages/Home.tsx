import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { fetchActiveBanners } from '../lib/banners'
import { CATEGORIES } from '../lib/categories'
import { useMeta } from '../lib/useMeta'
import { useProducts } from '../lib/ProductsContext'
import type { Banner } from '../lib/types'
import { BannerCarousel } from '../components/BannerCarousel'
import { ProductCard } from '../components/ProductCard'
import { ProductImage } from '../components/ProductImage'
import { ProductModal } from '../components/ProductModal'

/** Si no hay banners cargados (o falla la conexión) se muestra esta portada por defecto. */
const DEFAULT_BANNER: Banner = {
  id: 'default',
  title: 'Pan fresco, recetas auténticas',
  image_url: '/images/hero.webp',
  image_path: null,
  display_order: 0,
  is_active: true,
}

export default function Home() {
  useMeta(
    'DON PABON — Panadería artesanal | Tradición en cada bocado',
    'Pan fresco, recetas auténticas y el sabor de siempre. Panes, dulces, salados y especialidades navideñas de DON PABON. Pide por WhatsApp.',
  )
  const { products, featured, status } = useProducts()
  const [banners, setBanners] = useState<Banner[] | null>(null)
  const [starOpen, setStarOpen] = useState(false)
  const bestsellers = products.filter((p) => p.is_bestseller).slice(0, 8)

  useEffect(() => {
    let alive = true
    fetchActiveBanners()
      .then((b) => alive && setBanners(b.length ? b : [DEFAULT_BANNER]))
      .catch(() => alive && setBanners([DEFAULT_BANNER]))
    return () => {
      alive = false
    }
  }, [])

  return (
    <div className="mx-auto max-w-6xl px-4 pt-3 sm:px-6">
      <h1 className="sr-only">DON PABON — Panadería artesanal</h1>

      {banners ? (
        <BannerCarousel banners={banners} />
      ) : (
        <div className="shimmer aspect-[16/9] rounded-2xl sm:aspect-[21/8]" aria-hidden="true" />
      )}

      {/* Producto estrella */}
      {status === 'ready' && featured && (
        <section className="mt-4" aria-labelledby="estrella">
          <button
            type="button"
            onClick={() => setStarOpen(true)}
            aria-label={`Ver ${featured.name}`}
            className="group flex w-full overflow-hidden rounded-2xl border border-accent/40 bg-card text-left shadow-[0_10px_30px_-18px_rgb(235_166_93/0.5)] transition hover:border-accent"
          >
            <ProductImage src={featured.image_url} alt="" className="aspect-square w-[34%] shrink-0 sm:w-40" />
            <span className="flex min-w-0 flex-1 flex-col justify-center gap-1 p-4">
              <span className="text-[0.62rem] font-bold tracking-[0.18em] text-accent">★ EL FAVORITO DE LA CASA</span>
              <span id="estrella" className="text-base font-extrabold leading-tight">{featured.name}</span>
              {featured.description && <span className="line-clamp-2 text-[0.78rem] text-mute">{featured.description}</span>}
              <span className="mt-1 text-xs font-semibold text-accent transition group-hover:translate-x-1">Ver producto →</span>
            </span>
          </button>
          {starOpen && <ProductModal product={featured} onClose={() => setStarOpen(false)} />}
        </section>
      )}

      {/* Intro mínima */}
      <section className="mt-6 text-center">
        <p className="font-script text-[1.7rem] leading-none text-accent">Tradición en cada bocado</p>
        <p className="mt-2 text-[0.85rem] text-mute">Pan fresco, recetas auténticas y el sabor de siempre.</p>
        <nav aria-label="Categorías" className="mt-3 flex flex-wrap justify-center gap-2 lg:hidden">
          {CATEGORIES.map((c) => (
            <Link
              key={c.slug}
              to={`/${c.slug}`}
              className="min-h-9 rounded-full border border-line px-4 py-2 text-xs font-semibold text-ink transition hover:border-accent hover:text-accent"
            >
              {c.label}
            </Link>
          ))}
        </nav>
      </section>

      {/* Los más pedidos (se asignan desde el panel) */}
      {status === 'ready' && bestsellers.length > 0 && (
        <section className="mt-9" aria-labelledby="mas-pedidos">
          <h2 id="mas-pedidos" className="text-[0.7rem] font-bold tracking-[0.3em] text-accent">LOS MÁS PEDIDOS</h2>
          <ul className="-mx-4 mt-3 flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-px-4 px-4 pb-2 [scrollbar-width:none] sm:mx-0 sm:px-0 lg:grid lg:grid-cols-4 lg:overflow-visible [&::-webkit-scrollbar]:hidden">
            {bestsellers.map((p) => (
              <li key={p.id} className="flex w-[44%] shrink-0 snap-start sm:w-[30%] lg:w-auto">
                <ProductCard product={p} />
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  )
}
