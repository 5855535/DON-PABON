import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { fetchActiveProducts } from './products'
import type { CategorySlug, Product } from './types'

type Status = 'loading' | 'ready' | 'error'

interface Ctx {
  status: Status
  products: Product[]
  byCategory: (slug: CategorySlug) => Product[]
  featured: Product | undefined
  reload: () => void
}

const ProductsCtx = createContext<Ctx | null>(null)

export function ProductsProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<Status>('loading')
  const [products, setProducts] = useState<Product[]>([])
  const [tick, setTick] = useState(0)

  useEffect(() => {
    let alive = true
    setStatus('loading')
    fetchActiveProducts()
      .then((data) => {
        if (!alive) return
        setProducts(data)
        setStatus('ready')
      })
      .catch((e) => {
        console.error('Error cargando productos', e)
        if (alive) setStatus('error')
      })
    return () => {
      alive = false
    }
  }, [tick])

  const reload = useCallback(() => setTick((t) => t + 1), [])

  const value = useMemo<Ctx>(
    () => ({
      status,
      products,
      byCategory: (slug) => products.filter((p) => p.category === slug),
      featured: products.find((p) => p.is_featured),
      reload,
    }),
    [status, products, reload],
  )
  return <ProductsCtx.Provider value={value}>{children}</ProductsCtx.Provider>
}

export function useProducts() {
  const ctx = useContext(ProductsCtx)
  if (!ctx) throw new Error('useProducts debe usarse dentro de ProductsProvider')
  return ctx
}
