import { DEMO_MODE } from './supabase'
import { db, removeImage, uploadImage } from './products'
import type { Banner } from './types'

/** Banners de DEMOSTRACIÓN (solo sin Supabase). */
const DEMO_BANNERS: Banner[] = [
  { id: 'demo-b1', title: 'Pan fresco todos los días', image_url: '/images/hero.webp', image_path: null, display_order: 10, is_active: true },
  { id: 'demo-b2', title: 'Endulza tus momentos', image_url: '/images/cat-dulces.webp', image_path: null, display_order: 20, is_active: true },
  { id: 'demo-b3', title: 'El sabor de la tradición', image_url: '/images/cat-navideno.webp', image_path: null, display_order: 30, is_active: true },
]

const COLS = 'id,title,image_url,image_path,link,display_order,is_active'
// Respaldo por si aún no se ejecutó la migración del enlace (columna `link`).
const COLS_NO_LINK = 'id,title,image_url,image_path,display_order,is_active'

async function selectBanners(active: boolean): Promise<Banner[]> {
  const run = (cols: string) => {
    let q = db().from('banners').select(cols)
    if (active) q = q.eq('is_active', true)
    return q.order('display_order', { ascending: true }).order('created_at', { ascending: true })
  }
  let { data, error } = await run(COLS)
  if (error) ({ data, error } = await run(COLS_NO_LINK))
  if (error) throw error
  return data as unknown as Banner[]
}

export async function fetchActiveBanners(): Promise<Banner[]> {
  if (DEMO_MODE) return DEMO_BANNERS
  return selectBanners(true)
}

export const fetchAllBanners = () => selectBanners(false)

export async function createBanner(file: File, title: string, nextOrder: number, link: string | null = null) {
  const up = await uploadImage(file, 'banners')
  const { error } = await db()
    .from('banners')
    .insert({ title: title.trim() || null, image_url: up.url, image_path: up.path, display_order: nextOrder, ...(link ? { link } : {}) })
  if (error) {
    await removeImage(up.path)
    throw error
  }
}

export async function replaceBannerImage(banner: Banner, file: File) {
  const up = await uploadImage(file, 'banners')
  const { error } = await db().from('banners').update({ image_url: up.url, image_path: up.path }).eq('id', banner.id)
  if (error) {
    await removeImage(up.path)
    throw error
  }
  await removeImage(banner.image_path)
}

export async function updateBanner(id: string, patch: Partial<Pick<Banner, 'title' | 'is_active' | 'link'>>) {
  const { error } = await db().from('banners').update(patch).eq('id', id)
  if (error) throw error
}

export async function deleteBanner(banner: Banner) {
  const { error } = await db().from('banners').delete().eq('id', banner.id)
  if (error) throw error
  await removeImage(banner.image_path)
}

export async function saveBannerOrder(orderedIds: string[]) {
  const results = await Promise.all(
    orderedIds.map((id, i) => db().from('banners').update({ display_order: (i + 1) * 10 }).eq('id', id)),
  )
  const failed = results.find((r) => r.error)
  if (failed?.error) throw failed.error
}
