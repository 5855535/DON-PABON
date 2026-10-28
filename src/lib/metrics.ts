import { supabase } from './supabase'
import { db } from './products'
import type { Metrics } from './types'

type EventType = 'visit' | 'product_view' | 'whatsapp_click'

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
let paused = false

/** Los admins no cuentan en las métricas. */
export const pauseTracking = (value: boolean) => {
  paused = value
}

function visitorId(): string {
  try {
    let id = localStorage.getItem('dp_vid')
    if (!id) {
      id = crypto.randomUUID()
      localStorage.setItem('dp_vid', id)
    }
    return id
  } catch {
    return 'anon-' + Math.random().toString(36).slice(2, 12)
  }
}

/** Registra un evento anónimo. Nunca interrumpe la navegación si falla. */
export function track(type: EventType, product?: { id?: string; name?: string }, source?: string) {
  if (!supabase || paused) return
  void supabase
    .from('site_events')
    .insert({
      event_type: type,
      visitor_id: visitorId(),
      product_id: product?.id && UUID.test(product.id) ? product.id : null,
      product_name: product?.name?.slice(0, 120) ?? null,
      source: source ?? null,
    })
    .then(({ error }) => {
      if (error && import.meta.env.DEV) console.warn('[métricas]', error.message)
    })
}

/** Una visita por sesión del navegador. */
export function trackVisitOnce() {
  try {
    if (sessionStorage.getItem('dp_visit')) return
    sessionStorage.setItem('dp_visit', '1')
  } catch {
    /* sin sessionStorage: se cuenta igual */
  }
  track('visit')
}

export async function fetchMetrics(days: number): Promise<Metrics> {
  const { data, error } = await db().rpc('get_metrics', { p_days: days })
  if (error) throw error
  return data as Metrics
}
