import { track } from '../lib/metrics'
import { whatsappUrl } from '../lib/whatsapp'

export function WhatsAppIcon({ className = 'h-5 w-5' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
      <path d="M12.04 2a9.93 9.93 0 0 0-8.5 15.1L2 22l5.05-1.5A9.94 9.94 0 1 0 12.04 2Zm0 1.8a8.13 8.13 0 1 1-4.3 15.05l-.3-.18-3 .88.9-2.93-.2-.3A8.13 8.13 0 0 1 12.04 3.8Zm-3 3.75c-.2 0-.52.07-.8.37-.27.3-1.04 1.02-1.04 2.5s1.07 2.9 1.22 3.1c.15.2 2.1 3.2 5.1 4.5 2.5 1.08 3 .87 3.54.82.55-.05 1.75-.72 2-1.4.25-.7.25-1.3.17-1.42-.07-.12-.27-.2-.57-.35-.3-.15-1.75-.87-2.02-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.65.07-.3-.15-1.26-.46-2.4-1.48-.89-.8-1.5-1.77-1.67-2.07-.17-.3-.02-.46.13-.6.13-.14.3-.35.45-.52.15-.18.2-.3.3-.5.1-.2.05-.38-.02-.52-.08-.15-.67-1.62-.92-2.22-.24-.58-.49-.5-.67-.5h-.57Z" />
    </svg>
  )
}

interface Props {
  message: string
  label?: string
  size?: 'sm' | 'md' | 'lg'
  block?: boolean
  className?: string
  /** Para métricas: de dónde viene el clic y, si aplica, a qué producto pertenece. */
  source: string
  product?: { id?: string; name?: string }
}

const sizes = {
  sm: 'min-h-10 px-4 text-xs',
  md: 'min-h-11 px-5 text-[0.82rem]',
  lg: 'min-h-12 px-6 text-sm',
}

/** Único estilo de botón de WhatsApp de todo el sitio. */
export function WhatsAppButton({ message, label = 'Pedir por WhatsApp', size = 'md', block, className = '', source, product }: Props) {
  return (
    <a
      href={whatsappUrl(message)}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`${label} (se abre en una pestaña nueva)`}
      onClick={() => track('whatsapp_click', product, source)}
      className={`inline-flex items-center justify-center gap-2 rounded-full bg-accent font-bold text-bg shadow-[0_4px_18px_-8px_rgb(235_166_93/0.6)] transition duration-300 hover:bg-accent-hover active:scale-[0.98] ${sizes[size]} ${block ? 'w-full' : ''} ${className}`}
    >
      <WhatsAppIcon className="h-[1.1em] w-[1.1em]" />
      <span>{label}</span>
    </a>
  )
}

/** Acceso rápido solo con icono (barra superior en móvil). */
export function WhatsAppIconButton({ message, source }: { message: string; source: string }) {
  return (
    <a
      href={whatsappUrl(message)}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Pedir por WhatsApp (se abre en una pestaña nueva)"
      onClick={() => track('whatsapp_click', undefined, source)}
      className="grid h-10 w-10 place-items-center rounded-full bg-accent text-bg transition hover:bg-accent-hover active:scale-95"
    >
      <WhatsAppIcon className="h-5 w-5" />
    </a>
  )
}
