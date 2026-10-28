export type CategorySlug = 'panes' | 'dulces' | 'salados' | 'navideno'

export interface GalleryItem {
  url: string
  path: string
}

export interface Product {
  id: string
  name: string
  description: string | null
  category: CategorySlug
  image_url: string | null
  image_path: string | null
  /** Fotos adicionales (hasta 3). Con la principal suman un máximo de 4. */
  gallery: GalleryItem[]
  is_featured: boolean
  is_bestseller: boolean
  is_active: boolean
  display_order: number
  created_at: string
  updated_at: string
}

export type ProductInput = Pick<Product, 'name' | 'description' | 'category' | 'is_active' | 'is_bestseller'>

export interface Banner {
  id: string
  title: string | null
  image_url: string
  image_path: string | null
  display_order: number
  is_active: boolean
}

export interface Metrics {
  visits: number
  unique_visitors: number
  whatsapp_clicks: number
  product_views: number
  top_products: { name: string; views: number; clicks: number }[]
  daily: { day: string; visits: number; clicks: number }[]
}
