import { useEffect, useState } from 'react'
import { btn } from './ui'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

const isStandalone = () =>
  window.matchMedia('(display-mode: standalone)').matches || (navigator as Navigator & { standalone?: boolean }).standalone === true
const isIos = () => /iphone|ipad|ipod/i.test(navigator.userAgent)

/**
 * La app instalable es solo del panel de administración. Este componente solo se monta
 * cuando el usuario ya inició sesión Y es admin, y es el único lugar donde se enlaza el manifest
 * (la web pública no es instalable). Al salir del panel se retira el manifest.
 */
export function InstallApp() {
  const [event, setEvent] = useState<BeforeInstallPromptEvent | null>(null)
  const [installed, setInstalled] = useState(() => isStandalone())
  const [showIosHelp, setShowIosHelp] = useState(false)

  useEffect(() => {
    const onPrompt = (e: Event) => {
      e.preventDefault() // evita el mini-aviso automático: la instalación se ofrece con nuestro botón
      setEvent(e as BeforeInstallPromptEvent)
    }
    const onInstalled = () => {
      setInstalled(true)
      setEvent(null)
    }
    window.addEventListener('beforeinstallprompt', onPrompt)
    window.addEventListener('appinstalled', onInstalled)

    const added: HTMLElement[] = []
    const add = (tag: 'link' | 'meta', attrs: Record<string, string>) => {
      const el = document.createElement(tag)
      for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v)
      document.head.appendChild(el)
      added.push(el)
    }
    add('link', { rel: 'manifest', href: '/admin.webmanifest' })
    add('link', { rel: 'apple-touch-icon', href: '/icons/admin-180.png' })
    add('meta', { name: 'apple-mobile-web-app-capable', content: 'yes' })
    add('meta', { name: 'mobile-web-app-capable', content: 'yes' })
    add('meta', { name: 'apple-mobile-web-app-title', content: 'Pabon Admin' })
    add('meta', { name: 'apple-mobile-web-app-status-bar-style', content: 'black' })
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/admin/sw.js', { scope: '/admin/' }).catch(() => {})
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', onPrompt)
      window.removeEventListener('appinstalled', onInstalled)
      added.forEach((el) => el.remove())
    }
  }, [])

  if (installed) return null

  if (event)
    return (
      <button
        type="button"
        className={`${btn} border-accent text-accent`}
        onClick={async () => {
          await event.prompt()
          await event.userChoice
          setEvent(null)
        }}
      >
        ⬇ Instalar app
      </button>
    )

  if (isIos())
    return (
      <div className="relative">
        <button type="button" className={`${btn} border-accent text-accent`} onClick={() => setShowIosHelp((v) => !v)} aria-expanded={showIosHelp}>
          ⬇ Instalar app
        </button>
        {showIosHelp && (
          <p role="note" className="absolute right-0 z-10 mt-2 w-64 rounded-xl border border-line bg-card p-3 text-xs leading-relaxed text-mute shadow-xl">
            En Safari toca <strong className="text-ink">Compartir</strong> (el cuadro con la flecha) y luego{' '}
            <strong className="text-ink">«Añadir a pantalla de inicio»</strong>.
          </p>
        )}
      </div>
    )

  return null
}
