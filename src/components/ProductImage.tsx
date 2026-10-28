import { useState } from 'react'
import { WheatMark } from './Logo'

interface Props {
  src: string | null
  alt: string
  className?: string
  eager?: boolean
}

/** Imagen con proporción fija; si falta o falla, muestra un diseño alternativo (nunca imagen rota). */
export function ProductImage({ src, alt, className = '', eager }: Props) {
  const [failed, setFailed] = useState(false)
  const [loaded, setLoaded] = useState(false)

  if (!src || failed) {
    return (
      <div
        role="img"
        aria-label={`${alt} (imagen no disponible)`}
        className={`relative grid place-items-center overflow-hidden bg-gradient-to-br from-soft via-card to-soft ${className}`}
      >
        <div className="absolute inset-0 opacity-30 [background:radial-gradient(circle_at_30%_20%,rgb(235_166_93/0.35),transparent_55%)]" />
        <WheatMark className="relative h-1/3 max-h-20 w-auto text-accent/70" />
      </div>
    )
  }
  return (
    <div className={`relative overflow-hidden bg-soft ${className}`}>
      {!loaded && <div className="shimmer absolute inset-0" aria-hidden="true" />}
      <img
        src={src}
        alt={alt}
        loading={eager ? 'eager' : 'lazy'}
        decoding="async"
        onLoad={() => setLoaded(true)}
        onError={() => setFailed(true)}
        className={`h-full w-full object-cover transition duration-700 group-hover:scale-105 ${loaded ? 'opacity-100' : 'opacity-0'}`}
      />
    </div>
  )
}
