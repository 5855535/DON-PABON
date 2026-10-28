import { BUCKET, DEMO_MODE, supabase } from './supabase'
import { DEMO_PRODUCTS } from './demoData'
import type { Product, ProductInput } from './types'
import { optimizeImage } from './image'

const COLS =
  'id,name,description,category,image_url,image_path,is_featured,is_active,display_order,created_at,updated_at'

const db = () => {
  if (!supabase) throw new Error('Supabase no está configurado.')
  return supabase
}

/** Catálogo público: solo productos activos (RLS lo garantiza también en el servidor). */
export async function fetchActiveProducts(): Promise<Product[]> {
  if (DEMO_MODE) return DEMO_PRODUCTS
  const { data, error } = await db()
    .from('products')
    .select(COLS)
    .eq('is_active', true)
    .order('display_order', { ascending: true })
    .order('created_at', { ascending: true })
  if (error) throw error
  return data as Product[]
}

/** Panel admin: todos los productos (la política RLS solo lo permite a admins). */
export async function fetchAllProducts(): Promise<Product[]> {
  const { data, error } = await db()
    .from('products')
    .select(COLS)
    .order('category')
    .order('display_order', { ascending: true })
    .order('created_at', { ascending: true })
  if (error) throw error
  return data as Product[]
}

async function uploadImage(file: File): Promise<{ url: string; path: string }> {
  const blob = await optimizeImage(file)
  const ext = blob.type === 'image/webp' ? 'webp' : 'jpg'
  const path = `products/${crypto.randomUUID()}.${ext}`
  const { error } = await db().storage.from(BUCKET).upload(path, blob, {
    contentType: blob.type,
    cacheControl: '31536000',
    upsert: false,
  })
  if (error) throw error
  const { data } = db().storage.from(BUCKET).getPublicUrl(path)
  return { url: data.publicUrl, path }
}

async function removeImage(path: string | null) {
  if (!path) return
  const { error } = await db().storage.from(BUCKET).remove([path])
  if (error) console.warn('No se pudo borrar la imagen anterior:', error.message)
}

export interface SaveOptions {
  id?: string
  input: ProductInput
  file?: File | null
  featured: boolean
  previous?: Product
}

export async function saveProduct({ id, input, file, featured, previous }: SaveOptions): Promise<void> {
  const client = db()
  const uploaded = file ? await uploadImage(file) : null
  try {
    const imageFields = uploaded ? { image_url: uploaded.url, image_path: uploaded.path } : {}
    let productId = id
    if (id) {
      const { error } = await client.from('products').update({ ...input, ...imageFields }).eq('id', id)
      if (error) throw error
    } else {
      const { data: last } = await client
        .from('products')
        .select('display_order')
        .eq('category', input.category)
        .order('display_order', { ascending: false })
        .limit(1)
      const next = (last?.[0]?.display_order ?? 0) + 10
      const { data, error } = await client
        .from('products')
        .insert({ ...input, ...imageFields, display_order: next })
        .select('id')
        .single()
      if (error) throw error
      productId = data.id
    }
    if (featured && !previous?.is_featured) {
      const { error } = await client.rpc('set_featured_product', { p_id: productId })
      if (error) throw error
    } else if (!featured && previous?.is_featured) {
      const { error } = await client.from('products').update({ is_featured: false }).eq('id', productId!)
      if (error) throw error
    }
  } catch (e) {
    if (uploaded) await removeImage(uploaded.path) // evita archivos huérfanos si falla la BD
    throw e
  }
  if (uploaded && previous?.image_path) await removeImage(previous.image_path)
}

export async function deleteProduct(product: Product): Promise<void> {
  const { error } = await db().from('products').delete().eq('id', product.id)
  if (error) throw error
  await removeImage(product.image_path)
}

export async function setActive(id: string, is_active: boolean) {
  const patch = is_active ? { is_active } : { is_active, is_featured: false }
  const { error } = await db().from('products').update(patch).eq('id', id)
  if (error) throw error
}

export async function setFeatured(id: string) {
  const { error } = await db().rpc('set_featured_product', { p_id: id })
  if (error) throw error
}

export async function clearFeatured(id: string) {
  const { error } = await db().from('products').update({ is_featured: false }).eq('id', id)
  if (error) throw error
}

/** Guarda el nuevo orden de una categoría (10, 20, 30…). */
export async function saveOrder(orderedIds: string[]) {
  const results = await Promise.all(
    orderedIds.map((id, i) => db().from('products').update({ display_order: (i + 1) * 10 }).eq('id', id)),
  )
  const failed = results.find((r) => r.error)
  if (failed?.error) throw failed.error
}
