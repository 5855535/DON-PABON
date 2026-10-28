import { useState } from 'react'
import { btn } from './ui'
import { BannersPanel } from './BannersPanel'
import { InstallApp } from './InstallApp'
import { MetricsPanel } from './MetricsPanel'
import { ProductsPanel } from './ProductsPanel'

const TABS = [
  { id: 'productos', label: 'Productos' },
  { id: 'banners', label: 'Banners' },
  { id: 'metricas', label: 'Métricas' },
] as const
type Tab = (typeof TABS)[number]['id']

export default function Dashboard({ onSignOut }: { onSignOut: () => void }) {
  const [tab, setTab] = useState<Tab>('productos')
  return (
    <section className="mx-auto max-w-4xl px-4 py-6 sm:px-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-extrabold">Administración</h1>
        <div className="flex flex-wrap items-center gap-2">
          <InstallApp />
          <a href="/" target="_blank" rel="noopener noreferrer" className={btn}>Ver sitio ↗</a>
          <button className={btn} onClick={onSignOut}>Cerrar sesión</button>
        </div>
      </div>

      <div role="tablist" aria-label="Secciones" className="mt-4 flex gap-1 border-b border-line">
        {TABS.map((t) => (
          <button
            key={t.id}
            role="tab"
            aria-selected={tab === t.id}
            onClick={() => setTab(t.id)}
            className={`-mb-px min-h-11 border-b-2 px-4 text-sm font-semibold transition ${tab === t.id ? 'border-accent text-accent' : 'border-transparent text-mute hover:text-ink'}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="mt-5" role="tabpanel">
        {tab === 'productos' && <ProductsPanel />}
        {tab === 'banners' && <BannersPanel />}
        {tab === 'metricas' && <MetricsPanel />}
      </div>
    </section>
  )
}
