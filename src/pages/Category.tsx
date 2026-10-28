import { Link, useParams } from 'react-router-dom'
import { CATEGORIES, getCategory } from '../lib/categories'
import { useVisibleCategories } from '../lib/useVisibleCategories'
import { useMeta } from '../lib/useMeta'
import { useProducts } from '../lib/ProductsContext'
import { ProductGrid } from '../components/ProductGrid'
import NotFound from './NotFound'

export default function Category() {
  const { slug } = useParams()
  const cat = getCategory(slug)
  const { byCategory } = useProducts()
  const visible = useVisibleCategories()
  useMeta(
    cat ? `${cat.label} — DON PABON | Panadería artesanal` : 'Página no encontrada — DON PABON',
    cat?.metaDescription ?? 'La página que buscas no existe.',
    !cat,
  )
  if (!cat) return <NotFound />

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6">
      <nav
        aria-label="Categorías"
        className="sticky top-14 z-30 -mx-4 flex gap-2 overflow-x-auto border-b border-line bg-bg/90 px-4 py-2 backdrop-blur [scrollbar-width:none] sm:-mx-6 sm:px-6 lg:hidden [&::-webkit-scrollbar]:hidden"
      >
        {CATEGORIES.filter((c) => c.slug === cat.slug || visible.includes(c)).map((c) => (
          <Link
            key={c.slug}
            to={`/${c.slug}`}
            aria-current={c.slug === cat.slug ? 'page' : undefined}
            className={`min-h-10 shrink-0 rounded-full border px-4 py-2.5 text-xs font-semibold transition ${c.slug === cat.slug ? 'border-accent bg-accent text-bg' : 'border-line text-ink hover:border-accent hover:text-accent'}`}
          >
            {c.label}
          </Link>
        ))}
      </nav>
      <div className="pt-5">
      <header className="animate-fade-up">
        <p className="text-[0.65rem] font-bold tracking-[0.3em] text-accent">{cat.eyebrow.toUpperCase()}</p>
        <h1 className="mt-1 text-2xl font-extrabold leading-tight sm:text-3xl">{cat.title}</h1>
        <p className="mt-1.5 max-w-xl text-[0.85rem] leading-relaxed text-mute">{cat.description}</p>
      </header>

      <section className="mt-5" aria-label={`Productos de ${cat.label}`}>
        <ProductGrid products={byCategory(cat.slug)} />
      </section>

      <p className="mt-8 text-center font-script text-2xl leading-tight text-accent">{cat.bannerPhrase} ♡</p>
      </div>
    </div>
  )
}
