import { Link } from 'react-router-dom'
import { useMeta } from '../lib/useMeta'

export default function NotFound() {
  useMeta('Página no encontrada — DON PABON', 'La página que buscas no existe.', true)
  return (
    <section className="mx-auto max-w-xl px-4 py-32 text-center">
      <p className="font-script text-5xl text-accent">Ups…</p>
      <h1 className="mt-3 text-3xl font-extrabold">No encontramos esta página</h1>
      <p className="mt-3 text-mute">Pero seguro encuentras algo delicioso en nuestro catálogo.</p>
      <Link to="/" className="mt-8 inline-flex min-h-12 items-center rounded-full border border-accent px-7 text-sm font-semibold text-accent transition hover:bg-accent hover:text-bg">
        Volver al inicio
      </Link>
    </section>
  )
}
