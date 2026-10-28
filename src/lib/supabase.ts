import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const anon = import.meta.env.VITE_SUPABASE_ANON_KEY

/** true cuando faltan credenciales: el sitio funciona con datos de demostración. */
export const DEMO_MODE = !url || !anon

export const supabase = DEMO_MODE ? null : createClient(url!, anon!)

export const BUCKET = 'product-images'
