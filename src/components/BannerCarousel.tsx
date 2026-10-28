import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { getCategory } from '../lib/categories'
import { track } from '../lib/metrics'
import type { Banner } from '../lib/types'
import { GENERAL_MESSAGE, whatsappUrl } from '../lib/whatsapp'

const INTERVAL = 5000

/** Envuelve el contenido de un banner en el enlace que corresponda (categoría, producto o WhatsApp). */
function SlideLink({ banner, focusable, children }: { banner: Banner; focusable: boolean; children: ReactNode }) {
  const link = banner.link ?? ''
  const tab = focusable ? 0 : -1
  const label = banner.title ?? 'Ver más'
  if (link === 'whatsapp')
    return (
      <a
        href={whatsappUrl(GENERAL_MESSAGE)}
        target="_blank"
        rel="noopener noreferrer"
        tabIndex={tab}
        aria-label={`${label} (pedir por WhatsApp, se abre en una pestaña nueva)`}
        draggable={false}
        onClick={() => track('whatsapp_click', undefined, 'banner')}
        className="block"
      >
        {children}
      </a>
    )
  if (link.startsWith('category:') && getCategory(link.slice(9)))
    return (
      <Link to={`/${link.slice(9)}`} tabIndex={tab} aria-label={`${label} — ver ${getCategory(link.slice(9))!.label}`} draggable={false} className="block">
        {children}
      </Link>
    )
  if (link.startsWith('product:'))
    return (
      <Link to={`/?p=${link.slice(8)}`} tabIndex={tab} aria-label={`${label} — ver producto`} draggable={false} className="block">
        {children}
      </Link>
    )
  return <>{children}</>
}

/** Carrusel que desliza hacia la izquierda (infinito), con swipe táctil, puntos y pausa al interactuar. */
export function BannerCarousel({ banners }: { banners: Banner[] }) {
  const n = banners.length
  const [i, setI] = useState(0)
  const [anim, setAnim] = useState(true)
  const [paused, setPaused] = useState(false)
  const touchX = useRef<number | null>(null)
  const slides = n > 1 ? [...banners, banners[0]] : banners // clon final para el bucle

  const reenable = () => requestAnimationFrame(() => requestAnimationFrame(() => setAnim(true)))

  const next = useCallback(() => setI((x) => (x >= n ? x : x + 1)), [n])
  const prev = useCallback(() => {
    if (i > 0) return setI(i - 1)
    setAnim(false)
    setI(n)
    reenable()
    requestAnimationFrame(() => requestAnimationFrame(() => setI(n - 1)))
  }, [i, n])

  useEffect(() => {
    if (n < 2 || paused || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const t = setInterval(next, INTERVAL)
    return () => clearInterval(t)
  }, [n, paused, next])

  const onEnd = () => {
    if (n > 1 && i === n) {
      setAnim(false)
      setI(0)
      reenable()
    }
  }

  const active = n ? i % n : 0

  return (
    <section
      aria-roledescription="carrusel"
      aria-label="Novedades de DON PABON"
      className="relative overflow-hidden rounded-2xl border border-line bg-card"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      onTouchStart={(e) => {
        touchX.current = e.touches[0].clientX
        setPaused(true)
      }}
      onTouchEnd={(e) => {
        const start = touchX.current
        touchX.current = null
        setPaused(false)
        if (start === null || n < 2) return
        const dx = e.changedTouches[0].clientX - start
        if (dx < -40) next()
        else if (dx > 40) prev()
      }}
    >
      <div
        className={`flex ${anim ? 'transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]' : ''}`}
        style={{ transform: `translateX(-${i * 100}%)` }}
        onTransitionEnd={onEnd}
      >
        {slides.map((b, idx) => (
          <div key={`${b.id}-${idx}`} className="w-full shrink-0" aria-hidden={idx !== active && idx !== i}>
            <SlideLink banner={b} focusable={idx === i}>
              <div className="relative aspect-[16/9] w-full sm:aspect-[21/8]">
                <img
                  src={b.image_url}
                  alt={b.title ?? ''}
                  loading={idx === 0 ? 'eager' : 'lazy'}
                  fetchPriority={idx === 0 ? 'high' : 'auto'}
                  decoding="async"
                  draggable={false}
                  className="h-full w-full select-none object-cover"
                />
                {b.title && (
                  <>
                    <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/75 to-transparent" />
                    <p className="absolute bottom-3 left-4 right-4 font-script text-2xl leading-none text-ink drop-shadow sm:bottom-5 sm:left-6 sm:text-3xl">
                      {b.title}
                    </p>
                  </>
                )}
              </div>
            </SlideLink>
          </div>
        ))}
      </div>

      {n > 1 && (
        <div className="absolute bottom-1 right-2 flex">
          {banners.map((b, idx) => (
            <button
              key={b.id}
              type="button"
              aria-label={`Ver banner ${idx + 1} de ${n}`}
              aria-current={idx === active}
              onClick={() => setI(idx)}
              className="grid h-6 w-5 place-items-center"
            >
              <span className={`h-1.5 rounded-full transition-all ${idx === active ? 'w-4 bg-accent' : 'w-1.5 bg-ink/50'}`} />
            </button>
          ))}
        </div>
      )}
    </section>
  )
}
