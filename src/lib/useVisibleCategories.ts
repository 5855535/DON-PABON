import { CATEGORIES } from './categories'
import { useProducts } from './ProductsContext'

/**
 * Categorías que tienen al menos un producto activo. Mientras carga (o si falla, o si todas
 * están vacías) se muestran todas, para que la navegación no parpadee ni quede sin opciones.
 */
export function useVisibleCategories() {
  const { status, products } = useProducts()
  if (status !== 'ready' || products.length === 0) return CATEGORIES
  const withProducts = CATEGORIES.filter((c) => products.some((p) => p.category === c.slug))
  return withProducts.length ? withProducts : CATEGORIES
}
