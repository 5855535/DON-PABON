export const btn =
  'grid h-10 min-w-10 place-items-center rounded-full border border-line px-3 text-xs font-medium transition hover:border-accent hover:text-accent disabled:opacity-30 disabled:hover:border-line disabled:hover:text-inherit'

export const primaryBtn =
  'min-h-10 rounded-full bg-accent px-5 text-xs font-bold text-bg transition hover:bg-accent-hover disabled:opacity-60'

export const inputCls =
  'min-h-11 w-full rounded-xl border border-line bg-soft px-4 text-sm text-ink placeholder:text-mute/60 focus:border-accent focus:outline-none'

export const errMsg = (e: unknown, fallback = 'Ocurrió un error.') => (e instanceof Error ? e.message : fallback)
