import { useEffect, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { useVisibleCategories } from '../lib/useVisibleCategories'
import { GENERAL_MESSAGE } from '../lib/whatsapp'
import { Logo } from './Logo'
import { WhatsAppButton, WhatsAppIconButton } from './WhatsAppButton'


export function Navbar() {
  const [open, setOpen] = useState(false)
  const LINKS = [{ to: '/', label: 'Inicio', end: true }, ...useVisibleCategories().map((c) => ({ to: `/${c.slug}`, label: c.label, end: false }))]
  const { pathname } = useLocation()

  useEffect(() => {
    setOpen(false)
  }, [pathname])
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [open])

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `relative py-2 text-[0.8rem] font-medium transition-colors hover:text-accent ${isActive ? 'text-accent after:absolute after:inset-x-0 after:-bottom-0.5 after:h-0.5 after:rounded after:bg-accent' : 'text-ink/90'}`

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-line bg-bg/90 backdrop-blur-md">
      <nav aria-label="Principal" className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-3 px-4 sm:px-6">
        <Link to="/" aria-label="DON PABON — ir al inicio" className="shrink-0">
          <Logo />
        </Link>

        <ul className="hidden items-center gap-6 lg:flex">
          {LINKS.map((l) => (
            <li key={l.to}>
              <NavLink to={l.to} end={l.end} className={linkClass}>
                {l.label}
              </NavLink>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-2">
          <div className="hidden sm:block">
            <WhatsAppButton message={GENERAL_MESSAGE} size="sm" source="navbar" />
          </div>
          <div className="sm:hidden">
            <WhatsAppIconButton message={GENERAL_MESSAGE} source="navbar" />
          </div>
          <button
            type="button"
            className="grid h-10 w-10 place-items-center rounded-full border border-line text-ink transition hover:border-accent hover:text-accent lg:hidden"
            aria-expanded={open}
            aria-controls="menu-movil"
            aria-label={open ? 'Cerrar menú' : 'Abrir menú'}
            onClick={() => setOpen((o) => !o)}
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
              {open ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
            </svg>
          </button>
        </div>
      </nav>

      {open && (
        <div id="menu-movil" className="animate-fade-in fixed inset-x-0 top-14 h-[calc(100dvh-3.5rem)] overflow-y-auto bg-bg px-4 pb-8 pt-3 lg:hidden">
          <ul className="mx-auto flex max-w-md flex-col">
            {LINKS.map((l) => (
              <li key={l.to}>
                <NavLink
                  to={l.to}
                  end={l.end}
                  className={({ isActive }) =>
                    `flex min-h-12 items-center justify-between border-b border-line px-2 text-base font-semibold transition ${isActive ? 'text-accent' : 'text-ink hover:text-accent'}`
                  }
                >
                  {l.label}
                  <span aria-hidden="true" className="text-accent">→</span>
                </NavLink>
              </li>
            ))}
          </ul>
        </div>
      )}
    </header>
  )
}
