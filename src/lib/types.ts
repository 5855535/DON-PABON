export type CategorySlug = 'panes' | 'dulces' | 'salados' | 'navideno'

export interface Product {
  id: string
  name: string
  description: string | null
  category: CategorySlug
  image_url: string | null
  image_path: string | null
  is_featured: boolean
  is_active: boolean
  display_order: number
  created_at: string
  updated_at: string
}

export type ProductInput = Pick<Product, 'name' | 'description' | 'category' | 'is_active'>
