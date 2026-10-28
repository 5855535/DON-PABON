import { DEMO_MODE } from './supabase'
import { db, removeImage, uploadImage } from './products'
import type { Banner } from './types'

/** Banners de DEMOSTRACIÓN (solo sin Supabase). */
const DEMO_BANNERS: Banner[] = [
  { id: 'demo-b1', title: 'Pan fresco todos los días', image_url: '/images/hero.webp', image_path: null, display_order: 10, is_active: true },
  { id: 'demo-b2', title: 'Endulza tus momentos', image_url: '/images/cat-dulces.webp', image_path: null, display_order: 20, is_active: true },
  { id: 'demo-b3', title: 'El sabor de la tradición', image_url: '/images/cat-navideno.webp', image_path: null, display_order: 30, is_active: true },
]

const COLS = 'id,title,image_url,image_path,display_order,is_active'

export async function fetchActiveBanners(): Promise<Banner[]> {
  if (DEMO_MODE) return DEMO_BANNERS
  const { data, error } = await db()
    .from('banners')
    .select(COLS)
    .eq('is_active', true)
    .order('display_order', { ascending: true })
    .order('created_at', { ascending: true })
  if (error) throw error
  return data as Banner[]
}

export async function fetchAllBanners(): Promise<Banner[]> {
  const { data, error } = await db()
    .from('banners')
    .select(COLS)
    .order('display_order', { ascending: true })
    .order('created_at', { ascending: true })
  if (error) throw error
  return data as Banner[]
}

export async function createBanner(file: File, title: string, nextOrder: number) {
  const up = await uploadImage(file, 'banners')
  const { error } = await db()
    .from('banners')
    .insert({ title: title.trim() || null, image_url: up.url, image_path: up.path, display_order: nextOrder })
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

export async function updateBanner(id: string, patch: Partial<Pick<Banner, 'title' | 'is_active'>>) {
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
