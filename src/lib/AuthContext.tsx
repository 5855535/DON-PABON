import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import type { Session } from '@supabase/supabase-js'
import { supabase } from './supabase'
import { pauseTracking } from './metrics'

interface Ctx {
  loading: boolean
  session: Session | null
  isAdmin: boolean
  signIn: (email: string, password: string) => Promise<string | null>
  signOut: () => Promise<void>
}

const AuthCtx = createContext<Ctx | null>(null)

async function checkAdmin(userId: string): Promise<boolean> {
  if (!supabase) return false
  const { data, error } = await supabase.from('admins').select('user_id').eq('user_id', userId).maybeSingle()
  return !error && !!data
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState(!!supabase)
  const [session, setSession] = useState<Session | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    if (!supabase) return
    let alive = true
    const apply = async (s: Session | null) => {
      const admin = s ? await checkAdmin(s.user.id) : false
      if (!alive) return
      setSession(s)
      setIsAdmin(admin)
      pauseTracking(admin)
      setLoading(false)
    }
    supabase.auth.getSession().then(({ data }) => apply(data.session)).catch(() => alive && setLoading(false))
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => {
      // setTimeout evita llamar a Supabase dentro del callback de auth (deadlock conocido)
      setTimeout(() => apply(s), 0)
    })
    return () => {
      alive = false
      sub.subscription.unsubscribe()
    }
  }, [])

  const signIn: Ctx['signIn'] = async (email, password) => {
    if (!supabase) return 'Supabase no está configurado.'
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    // Mensaje genérico: no revelar si el correo existe
    return error ? 'Correo o contraseña incorrectos.' : null
  }
  const signOut = async () => {
    await supabase?.auth.signOut()
  }

  return <AuthCtx.Provider value={{ loading, session, isAdmin, signIn, signOut }}>{children}</AuthCtx.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthCtx)
  if (!ctx) throw new Error('useAuth debe usarse dentro de AuthProvider')
  return ctx
}
