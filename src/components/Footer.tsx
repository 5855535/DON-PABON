import { Link } from 'react-router-dom'
import { DEMO_MODE } from '../lib/supabase'

export function Footer() {
  return (
    <footer className="mt-14 border-t border-line">
      {DEMO_MODE && (
        <p className="bg-accent/10 px-4 py-2 text-center text-[0.7rem] text-accent">
          Modo demostración: productos y fotos de ejemplo. Configura Supabase (ver README) para usar tu catálogo real.
        </p>
      )}
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-1.5 px-4 py-6 text-center sm:px-6">
        <p className="font-script text-xl text-mute">Tradición en cada bocado</p>
        <p className="text-[0.7rem] text-mute/80">
          © {new Date().getFullYear()} DON PABON ·{' '}
          <Link to="/admin" className="underline-offset-4 hover:text-accent hover:underline">
            Administración
          </Link>
        </p>
      </div>
    </footer>
  )
}
