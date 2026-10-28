import { Link, useParams } from 'react-router-dom'
import { getCategory } from '../lib/categories'
import { useMeta } from '../lib/useMeta'
import { useProducts } from '../lib/ProductsContext'
import { GENERAL_MESSAGE } from '../lib/whatsapp'
import { ProductGrid } from '../components/ProductGrid'
import { WhatsAppButton } from '../components/WhatsAppButton'
import NotFound from './NotFound'

export default function Category() {
  const { slug } = useParams()
  const cat = getCategory(slug)
  const { byCategory } = useProducts()
  useMeta(
    cat ? `${cat.label} — DON PABON | Panadería artesanal` : 'Página no encontrada — DON PABON',
    cat?.metaDescription ?? 'La página que buscas no existe.',
    !cat,
  )
  if (!cat) return <NotFound />

  return (
    <>
      <header className="relative isolate overflow-hidden border-b border-line">
        <img src={cat.cover} alt="" aria-hidden="true" className="absolute inset-y-0 right-0 -z-20 h-full w-full object-cover md:w-[55%]" />
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-bg/95 via-bg/90 to-bg/70 md:from-bg md:via-bg/75 md:to-transparent" />
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
          <div className="max-w-lg animate-fade-up">
            <p className="text-[0.7rem] font-semibold tracking-[0.4em] text-accent">{cat.eyebrow.toUpperCase()}</p>
            <h1 className="mt-3 text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl">{cat.title}</h1>
            <p className="mt-4 leading-relaxed text-ink/85">{cat.description}</p>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-4 pt-10 sm:px-6 lg:px-8" aria-label={`Productos de ${cat.label}`}>
        <ProductGrid products={byCategory(cat.slug)} />

        <aside className="relative mt-12 overflow-hidden rounded-2xl border border-line bg-card">
          <img src={cat.cover} alt="" aria-hidden="true" loading="lazy" className="absolute inset-y-0 left-0 h-full w-1/2 object-cover opacity-50" />
          <div className="absolute inset-0 bg-gradient-to-r from-bg/60 via-card/90 to-card" />
          <div className="relative flex flex-col items-center justify-between gap-5 p-8 text-center sm:flex-row sm:text-left">
            <p className="font-script text-3xl leading-tight text-accent sm:ml-[18%] sm:text-4xl">{cat.bannerPhrase} ♡</p>
            <WhatsAppButton message={GENERAL_MESSAGE} size="lg" />
          </div>
        </aside>

        <nav aria-label="Otras categorías" className="mt-8 flex flex-wrap justify-center gap-2">
          {['panes', 'dulces', 'salados', 'navideno']
            .filter((s) => s !== cat.slug)
            .map((s) => (
              <Link key={s} to={`/${s}`} className="min-h-11 rounded-full border border-line px-5 py-2.5 text-sm font-medium capitalize text-mute transition hover:border-accent hover:text-accent">
                {getCategory(s)!.label}
              </Link>
            ))}
        </nav>
      </section>
    </>
  )
}
