import { Link } from 'react-router-dom'
import { CATEGORIES } from '../lib/categories'
import { useMeta } from '../lib/useMeta'
import { useProducts } from '../lib/ProductsContext'
import { GENERAL_MESSAGE, productMessage } from '../lib/whatsapp'
import { ProductImage } from '../components/ProductImage'
import { WhatsAppButton } from '../components/WhatsAppButton'

export default function Home() {
  useMeta(
    'DON PABON — Panadería artesanal | Tradición en cada bocado',
    'Pan fresco, recetas auténticas y el sabor de siempre. Panes, dulces, salados y especialidades navideñas de DON PABON. Pide por WhatsApp.',
  )
  const { featured, status } = useProducts()

  return (
    <>
      {/* HERO */}
      <section className="relative isolate overflow-hidden border-b border-line">
        <img
          src="/images/hero.webp"
          alt="Pan artesanal de corteza dorada sobre una tela rústica con espigas de trigo"
          fetchPriority="high"
          className="absolute inset-y-0 right-0 -z-20 h-full w-full object-cover object-center md:w-[62%]"
        />
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-bg/95 via-bg/80 to-bg/50 md:from-bg md:via-bg/70 md:to-transparent" />
        <div className="absolute inset-x-0 bottom-0 -z-10 h-32 bg-gradient-to-t from-bg to-transparent" />
        <div className="mx-auto flex min-h-[calc(100svh-4rem)] max-w-7xl flex-col justify-center px-4 py-16 sm:px-6 lg:px-8">
          <div className="max-w-xl animate-fade-up">
            <p className="text-[0.7rem] font-semibold tracking-[0.4em] text-accent">PANADERÍA ARTESANAL</p>
            <h1 className="mt-4 text-5xl font-extrabold leading-none tracking-tight sm:text-7xl">DON PABON</h1>
            <p className="mt-3 font-script text-4xl leading-tight text-accent sm:text-5xl">Tradición en cada bocado</p>
            <p className="mt-6 max-w-sm text-base leading-relaxed text-ink/90">Pan fresco, recetas auténticas y el sabor de siempre.</p>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <WhatsAppButton message={GENERAL_MESSAGE} size="lg" trailingArrow />
              <a
                href="#categorias"
                className="inline-flex min-h-12 items-center gap-2 rounded-full px-4 text-sm font-semibold text-ink transition hover:text-accent"
              >
                <svg viewBox="0 0 24 24" className="h-5 w-5 text-accent" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M12 5v14M6 13l6 6 6-6" />
                </svg>
                Descubre nuestros productos
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* CATEGORÍAS */}
      <section id="categorias" className="mx-auto max-w-7xl scroll-mt-20 px-4 pt-16 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-[0.7rem] font-semibold tracking-[0.4em] text-accent">NUESTRAS CATEGORÍAS</p>
            <h2 className="mt-3 max-w-md text-3xl font-extrabold leading-tight sm:text-4xl">Lo mejor de nuestra panadería, para ti</h2>
          </div>
          <p className="-rotate-2 font-script text-2xl leading-tight text-mute">Productos frescos, hechos con pasión ♡</p>
        </div>
        <ul className="mt-8 grid grid-cols-1 gap-4 min-[480px]:grid-cols-2 lg:grid-cols-4 lg:gap-5">
          {CATEGORIES.map((c) => (
            <li key={c.slug}>
              <Link
                to={`/${c.slug}`}
                className="group flex h-full flex-col overflow-hidden rounded-xl border border-line bg-card transition duration-300 hover:-translate-y-1 hover:border-accent/50"
              >
                <ProductImage src={c.cover} alt={`Categoría ${c.label}`} className="aspect-[4/3] w-full" />
                <div className="flex flex-1 flex-col gap-1 p-4">
                  <h3 className="text-xl font-bold">{c.label}</h3>
                  <p className="text-[0.82rem] text-mute">{c.blurb}</p>
                  <span className="mt-4 grid h-9 w-9 place-items-center self-end rounded-full border border-accent/60 text-accent transition group-hover:bg-accent group-hover:text-bg" aria-hidden="true">
                    →
                  </span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {/* PRODUCTO ESTRELLA */}
      {status === 'ready' && featured && (
        <section className="mx-auto mt-20 max-w-7xl px-4 sm:px-6 lg:px-8" aria-labelledby="estrella">
          <div className="grid overflow-hidden rounded-2xl border border-line bg-card md:grid-cols-2">
            <ProductImage src={featured.image_url} alt={featured.name} className="aspect-[4/3] w-full md:aspect-auto md:min-h-[26rem]" />
            <div className="flex flex-col justify-center gap-4 p-6 sm:p-10">
              <span className="inline-flex w-fit items-center gap-2 rounded-full border border-accent/50 bg-accent/10 px-3.5 py-1.5 text-[0.7rem] font-bold tracking-[0.18em] text-accent">
                ★ EL FAVORITO DE LA CASA
              </span>
              <p className="text-xs font-semibold tracking-[0.3em] text-mute">PRODUCTO ESTRELLA</p>
              <h2 id="estrella" className="text-3xl font-extrabold leading-tight sm:text-4xl">{featured.name}</h2>
              {featured.description && <p className="max-w-md leading-relaxed text-mute">{featured.description}</p>}
              <div className="pt-2">
                <WhatsAppButton message={productMessage(featured.name)} size="lg" />
              </div>
            </div>
          </div>
        </section>
      )}

    </>
  )
}
