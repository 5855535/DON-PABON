import { useCallback } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useProducts } from '../lib/ProductsContext'
import { ProductModal } from './ProductModal'

/** Abre el modal de un producto cuando la URL trae ?p=<id> (por ejemplo, desde un banner). */
export function ProductDeepLink() {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const { products } = useProducts()
  const id = params.get('p')
  const product = id ? products.find((p) => p.id === id) : undefined

  const onClose = useCallback(() => {
    const next = new URLSearchParams(window.location.search)
    next.delete('p')
    navigate({ search: next.toString() }, { replace: true })
  }, [navigate])

  if (!product) return null
  return <ProductModal key={product.id} product={product} onClose={onClose} />
}
