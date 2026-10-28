import { Link, useParams } from 'react-router-dom'
import { CATEGORIES, getCategory } from '../lib/categories'
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
    <div className="mx-auto max-w-6xl px-4 pt-5 sm:px-6">
      <header className="animate-fade-up">
        <p className="text-[0.65rem] font-bold tracking-[0.3em] text-accent">{cat.eyebrow.toUpperCase()}</p>
        <h1 className="mt-1 text-2xl font-extrabold leading-tight sm:text-3xl">{cat.title}</h1>
        <p className="mt-1.5 max-w-xl text-[0.85rem] leading-relaxed text-mute">{cat.description}</p>
      </header>

      <section className="mt-5" aria-label={`Productos de ${cat.label}`}>
        <ProductGrid products={byCategory(cat.slug)} />
      </section>

      <aside className="mt-8 flex flex-col items-center justify-between gap-3 rounded-2xl border border-line bg-card px-5 py-5 text-center sm:flex-row sm:text-left">
        <p className="font-script text-2xl leading-tight text-accent">{cat.bannerPhrase} ♡</p>
        <WhatsAppButton message={GENERAL_MESSAGE} size="md" source={`categoria-${cat.slug}`} />
      </aside>

      <nav aria-label="Otras categorías" className="mt-5 flex flex-wrap justify-center gap-2">
        {CATEGORIES.filter((c) => c.slug !== cat.slug).map((c) => (
          <Link key={c.slug} to={`/${c.slug}`} className="min-h-9 rounded-full border border-line px-4 py-2 text-xs font-medium text-mute transition hover:border-accent hover:text-accent">
            {c.label}
          </Link>
        ))}
      </nav>
    </div>
  )
}
