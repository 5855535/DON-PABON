import { useEffect, useState } from 'react'
import { fetchMetrics } from '../../lib/metrics'
import type { Metrics } from '../../lib/types'
import { errMsg } from './ui'

const RANGES = [
  { days: 7, label: '7 días' },
  { days: 30, label: '30 días' },
  { days: 90, label: '90 días' },
]

const nf = new Intl.NumberFormat('es-CO')

function Stat({ label, value, hint }: { label: string; value: number; hint?: string }) {
  return (
    <div className="rounded-xl border border-line bg-card p-3">
      <p className="text-[0.7rem] text-mute">{label}</p>
      <p className="mt-0.5 text-2xl font-extrabold text-ink">{nf.format(value)}</p>
      {hint && <p className="text-[0.65rem] text-mute">{hint}</p>}
    </div>
  )
}

export function MetricsPanel() {
  const [days, setDays] = useState(30)
  const [data, setData] = useState<Metrics | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let alive = true
    setData(null)
    fetchMetrics(days)
      .then((m) => {
        if (!alive) return
        setData(m)
        setError(null)
      })
      .catch((e) => alive && setError(errMsg(e, 'No se pudieron cargar las métricas.')))
    return () => {
      alive = false
    }
  }, [days])

  const maxVisits = Math.max(1, ...(data?.daily.map((d) => d.visits) ?? [1]))
  const rate = data && data.visits > 0 ? Math.round((data.whatsapp_clicks / data.visits) * 100) : 0

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs text-mute">Datos anónimos. Tus propias visitas como admin no se cuentan.</p>
        <div role="group" aria-label="Periodo" className="flex gap-1.5">
          {RANGES.map((r) => (
            <button
              key={r.days}
              aria-pressed={days === r.days}
              onClick={() => setDays(r.days)}
              className={`min-h-9 rounded-full border px-3.5 text-xs font-semibold transition ${days === r.days ? 'border-accent bg-accent text-bg' : 'border-line hover:border-accent'}`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <p role="alert" className="mt-3 rounded-lg bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {error} ¿Ejecutaste la migración <code>20260101000003_banners_metricas.sql</code>?
        </p>
      )}
      {!data && !error && <p className="mt-4 text-sm text-mute">Cargando…</p>}

      {data && (
        <>
          <div className="mt-4 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
            <Stat label="Visitas (sesiones)" value={data.visits} />
            <Stat label="Visitantes únicos" value={data.unique_visitors} />
            <Stat label="Clics en WhatsApp" value={data.whatsapp_clicks} hint={`${rate}% de las visitas`} />
            <Stat label="Productos vistos" value={data.product_views} />
          </div>

          <h2 className="mt-6 text-sm font-bold">Visitas y clics por día</h2>
          {data.daily.length === 0 ? (
            <p className="mt-2 text-sm text-mute">Aún no hay datos en este periodo.</p>
          ) : (
            <ul className="mt-2 space-y-1" aria-label="Visitas y clics por día">
              {data.daily.map((d) => (
                <li key={d.day} className="flex items-center gap-2 text-[0.7rem]">
                  <span className="w-16 shrink-0 text-mute">{d.day.slice(5)}</span>
                  <span className="h-3 flex-1 overflow-hidden rounded bg-soft">
                    <span className="block h-full rounded bg-accent" style={{ width: `${(d.visits / maxVisits) * 100}%` }} />
                  </span>
                  <span className="w-24 shrink-0 text-right text-mute">{d.visits} visitas · {d.clicks} clics</span>
                </li>
              ))}
            </ul>
          )}

          <h2 className="mt-6 text-sm font-bold">Productos con más interés</h2>
          {data.top_products.length === 0 ? (
            <p className="mt-2 text-sm text-mute">Aún no hay datos en este periodo.</p>
          ) : (
            <div className="mt-2 overflow-x-auto rounded-xl border border-line">
              <table className="w-full text-left text-xs">
                <thead className="bg-card text-mute">
                  <tr>
                    <th className="px-3 py-2 font-medium">Producto</th>
                    <th className="px-3 py-2 text-right font-medium">Vistas</th>
                    <th className="px-3 py-2 text-right font-medium">Clics WhatsApp</th>
                  </tr>
                </thead>
                <tbody>
                  {data.top_products.map((p) => (
                    <tr key={p.name} className="border-t border-line">
                      <td className="px-3 py-2 font-medium">{p.name}</td>
                      <td className="px-3 py-2 text-right">{p.views}</td>
                      <td className="px-3 py-2 text-right text-accent">{p.clicks}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </>
  )
}
