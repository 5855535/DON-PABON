import { DEMO_MODE } from './supabase'
import { db } from './products'

export const FEATURED_LABEL_KEY = 'featured_label'
export const DEFAULT_FEATURED_LABEL = 'El favorito de la casa'

/** Texto de la etiqueta del producto estrella. Si falla o no existe, usa el valor por defecto. */
export async function fetchFeaturedLabel(): Promise<string> {
  if (DEMO_MODE) return DEFAULT_FEATURED_LABEL
  try {
    const { data, error } = await db().from('site_settings').select('value').eq('key', FEATURED_LABEL_KEY).maybeSingle()
    if (error) throw error
    return data?.value?.trim() || DEFAULT_FEATURED_LABEL
  } catch {
    return DEFAULT_FEATURED_LABEL
  }
}

export async function saveFeaturedLabel(value: string): Promise<void> {
  const text = value.trim()
  if (!text) {
    const { error } = await db().from('site_settings').delete().eq('key', FEATURED_LABEL_KEY)
    if (error) throw error
    return
  }
  const { error } = await db().from('site_settings').upsert({ key: FEATURED_LABEL_KEY, value: text.slice(0, 80) })
  if (error) throw error
}
