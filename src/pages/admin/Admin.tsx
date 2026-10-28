import { useState, type FormEvent } from 'react'
import { useAuth } from '../../lib/AuthContext'
import { DEMO_MODE } from '../../lib/supabase'
import { useMeta } from '../../lib/useMeta'
import Dashboard from './Dashboard'

const inputCls =
  'min-h-12 w-full rounded-xl border border-line bg-soft px-4 text-ink placeholder:text-mute/60 focus:border-accent focus:outline-none'

function Shell({ children }: { children: React.ReactNode }) {
  return <section className="mx-auto max-w-md px-4 py-12">{children}</section>
}

function Login() {
  const { signIn } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    setBusy(true)
    setError(await signIn(email.trim(), password))
    setBusy(false)
  }

  return (
    <Shell>
      <form onSubmit={submit} className="rounded-2xl border border-line bg-card p-6 sm:p-8">
        <h1 className="text-2xl font-extrabold">Administración</h1>
        <p className="mt-1 text-sm text-mute">Acceso solo para el equipo de DON PABON.</p>
        <label className="mt-6 block text-sm font-medium" htmlFor="email">Correo</label>
        <input id="email" type="email" autoComplete="username" required value={email} onChange={(e) => setEmail(e.target.value)} className={`${inputCls} mt-1.5`} />
        <label className="mt-4 block text-sm font-medium" htmlFor="password">Contraseña</label>
        <input id="password" type="password" autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} className={`${inputCls} mt-1.5`} />
        {error && <p role="alert" className="mt-4 rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-300">{error}</p>}
        <button type="submit" disabled={busy} className="mt-6 min-h-12 w-full rounded-full bg-accent font-bold text-bg transition hover:bg-accent-hover disabled:opacity-60">
          {busy ? 'Ingresando…' : 'Ingresar'}
        </button>
      </form>
    </Shell>
  )
}

export default function Admin() {
  useMeta('Administración — DON PABON', 'Panel de administración del catálogo.', true)
  const { loading, session, isAdmin, signOut } = useAuth()

  if (DEMO_MODE)
    return (
      <Shell>
        <div className="rounded-2xl border border-line bg-card p-6 text-center">
          <h1 className="text-xl font-bold">Panel no disponible en modo demostración</h1>
          <p className="mt-2 text-sm text-mute">Configura las variables de Supabase en el archivo .env (ver README) para activar el panel.</p>
        </div>
      </Shell>
    )
  if (loading) return <div className="grid min-h-[60vh] place-items-center text-mute">Verificando acceso…</div>
  if (!session) return <Login />
  if (!isAdmin)
    return (
      <Shell>
        <div role="alert" className="rounded-2xl border border-line bg-card p-6 text-center">
          <h1 className="text-xl font-bold">Sin permisos</h1>
          <p className="mt-2 text-sm text-mute">Esta cuenta no está autorizada como administradora.</p>
          <button onClick={signOut} className="mt-5 min-h-11 rounded-full border border-accent px-6 text-sm font-semibold text-accent hover:bg-accent hover:text-bg">
            Cerrar sesión
          </button>
        </div>
      </Shell>
    )
  return <Dashboard onSignOut={signOut} />
}
