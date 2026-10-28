import { Link } from 'react-router-dom'
import { DEMO_MODE } from '../lib/supabase'
import { Logo } from './Logo'

export function Footer() {
  return (
    <footer className="mt-20 border-t border-line bg-card/40">
      {DEMO_MODE && (
        <p className="bg-accent/10 px-4 py-2 text-center text-xs text-accent">
          Modo demostración: se muestran productos y fotos de ejemplo. Configura Supabase (ver README) para usar tu catálogo real.
        </p>
      )}
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 py-8 sm:flex-row sm:px-6 lg:px-8">
        <Logo />
        <p className="font-script text-2xl text-mute">Tradición en cada bocado</p>
        <p className="text-xs text-mute">
          © {new Date().getFullYear()} DON PABON ·{' '}
          <Link to="/admin" className="underline-offset-4 hover:text-accent hover:underline">
            Administración
          </Link>
        </p>
      </div>
    </footer>
  )
}
