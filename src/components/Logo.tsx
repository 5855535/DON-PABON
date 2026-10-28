export function WheatMark({ className = 'h-9 w-9' }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} fill="none" aria-hidden="true">
      <path d="M32 58V24" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" />
      <path d="M32 58c-8-3-13-9-15-16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity=".7" />
      <g fill="currentColor">
        <ellipse cx="32" cy="11" rx="3.4" ry="7.5" />
        <ellipse cx="23.5" cy="22" rx="3.2" ry="7.2" transform="rotate(-38 23.5 22)" />
        <ellipse cx="40.5" cy="22" rx="3.2" ry="7.2" transform="rotate(38 40.5 22)" />
        <ellipse cx="22.5" cy="35" rx="3.2" ry="7" transform="rotate(-40 22.5 35)" />
        <ellipse cx="41.5" cy="35" rx="3.2" ry="7" transform="rotate(40 41.5 35)" />
        <ellipse cx="25" cy="47" rx="2.8" ry="6" transform="rotate(-42 25 47)" />
        <ellipse cx="39" cy="47" rx="2.8" ry="6" transform="rotate(42 39 47)" />
      </g>
    </svg>
  )
}

export function Logo({ className = '' }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2 ${className}`} role="img" aria-label="DON PABON, panadería artesanal">
      <WheatMark className="h-7 w-7 text-accent" />
      <span className="flex flex-col leading-none">
        <span className="text-[0.95rem] font-extrabold tracking-[0.14em] text-ink">DON PABON</span>
        <span className="mt-0.5 text-[0.5rem] font-medium tracking-[0.3em] text-mute">PANADERÍA ARTESANAL</span>
      </span>
    </span>
  )
}
