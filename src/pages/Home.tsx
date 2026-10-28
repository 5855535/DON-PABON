import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { fetchActiveBanners } from '../lib/banners'
import { CATEGORIES } from '../lib/categories'
import { useMeta } from '../lib/useMeta'
import { useProducts } from '../lib/ProductsContext'
import type { Banner } from '../lib/types'
import { GENERAL_MESSAGE, productMessage } from '../lib/whatsapp'
import { BannerCarousel } from '../components/BannerCarousel'
import { ProductCard } from '../components/ProductCard'
import { ProductImage } from '../components/ProductImage'
import { WhatsAppButton } from '../components/WhatsAppButton'

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

      {/* Intro mínima */}
      <section className="mt-5 text-center">
        <p className="font-script text-[1.7rem] leading-none text-accent">Tradición en cada bocado</p>
        <p className="mt-2 text-[0.85rem] text-mute">Pan fresco, recetas auténticas y el sabor de siempre.</p>
        <div className="mt-4 flex justify-center">
          <WhatsAppButton message={GENERAL_MESSAGE} size="md" source="inicio" />
        </div>
        <nav aria-label="Categorías" className="mt-4 flex flex-wrap justify-center gap-2 lg:hidden">
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

      {/* Producto estrella */}
      {status === 'ready' && featured && (
        <section className="mt-9" aria-labelledby="estrella">
          <div className="flex overflow-hidden rounded-2xl border border-line bg-card">
            <ProductImage src={featured.image_url} alt={featured.name} className="aspect-square w-[38%] shrink-0 sm:w-44" />
            <div className="flex min-w-0 flex-1 flex-col justify-center gap-1.5 p-4">
              <span className="w-fit text-[0.62rem] font-bold tracking-[0.18em] text-accent">★ EL FAVORITO DE LA CASA</span>
              <h2 id="estrella" className="text-lg font-extrabold leading-tight">{featured.name}</h2>
              {featured.description && <p className="line-clamp-2 text-[0.8rem] text-mute">{featured.description}</p>}
              <div className="pt-1.5">
                <WhatsAppButton message={productMessage(featured.name)} size="sm" source="estrella" product={{ id: featured.id, name: featured.name }} />
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  )
}
