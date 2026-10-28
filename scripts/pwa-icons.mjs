// Genera los íconos de la app de administración (PWA) en public/icons/.
// Uso:  node scripts/pwa-icons.mjs
import { mkdirSync } from 'node:fs'
import sharp from 'sharp'
import { wheat } from './lib/pan.mjs'

const outDir = new URL('../public/icons/', import.meta.url)
mkdirSync(outDir, { recursive: true })

// Fondo oscuro a sangre (sirve para íconos "maskable"); el trigo queda en la zona segura central (≈60 %).
const svg = (scale) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <rect width="512" height="512" fill="#101112"/>
  <circle cx="256" cy="256" r="190" fill="#EBA65D" fill-opacity=".10"/>
  <g transform="translate(${256 - 32 * scale} ${256 - 32 * scale}) scale(${scale})">${wheat('#EBA65D')}</g>
</svg>`

const make = async (name, size, scale) => {
  await sharp(Buffer.from(svg(scale)), { density: 384 }).resize(size, size).png().toFile(new URL(name, outDir).pathname.replace(/^\/([A-Za-z]:)/, '$1'))
  console.log('OK', name, `${size}×${size}`)
}

await make('admin-192.png', 192, 4.2)
await make('admin-512.png', 512, 4.2)
await make('admin-maskable-512.png', 512, 3.4) // más margen: los SO recortan los bordes
await make('admin-180.png', 180, 4.2) // iOS (apple-touch-icon)
