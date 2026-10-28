// Genera el QR de DON PABON con forma de pan de molde (SVG + PNG) y verifica que se pueda leer.
// Uso:  node scripts/qr-pan.mjs https://tu-sitio.netlify.app
import { mkdirSync, writeFileSync } from 'node:fs'
import QRCode from 'qrcode'
import sharp from 'sharp'
import jsQR from 'jsqr'

const url = process.argv[2]
if (!url || !/^https?:\/\//.test(url)) {
  console.error('Uso: node scripts/qr-pan.mjs https://tu-sitio.netlify.app')
  process.exit(1)
}

const INK = '#101112'
const CREAM = '#F5F1E9'
const outDir = new URL('../qr/', import.meta.url)
mkdirSync(outDir, { recursive: true })

// Corrección de errores alta (H): el QR sigue leyéndose aunque se ensucie o se imprima pequeño.
const qr = QRCode.create(url, { errorCorrectionLevel: 'H' })
const n = qr.modules.size
const PANEL = { x: 200, y: 380, size: 600 }
const mod = PANEL.size / (n + 8) // 4 módulos de zona silenciosa a cada lado
const ox = PANEL.x + mod * 4
const oy = PANEL.y + mod * 4

let cells = ''
for (let r = 0; r < n; r++) {
  for (let c = 0; c < n; c++) {
    if (qr.modules.get(r, c)) {
      cells += `<rect x="${(ox + c * mod).toFixed(2)}" y="${(oy + r * mod).toFixed(2)}" width="${(mod + 0.4).toFixed(2)}" height="${(mod + 0.4).toFixed(2)}"/>`
    }
  }
}

// Pan de molde: copa abombada más ancha que el cuerpo.
const loaf =
  'M130 330C40 330 30 170 150 120C260 75 740 75 850 120C970 170 960 330 870 330L850 330L850 1010Q850 1060 800 1060L200 1060Q150 1060 150 1010L150 330Z'

const svg = (bg) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 1320" width="1000" height="1320" role="img" aria-label="Código QR de DON PABON en forma de pan">
  <defs>
    <linearGradient id="crust" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#F0B369"/><stop offset="0.45" stop-color="#EBA65D"/><stop offset="1" stop-color="#C77B34"/>
    </linearGradient>
    <linearGradient id="top" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#F6C382"/><stop offset="1" stop-color="#E39A4C"/>
    </linearGradient>
  </defs>
  <rect width="1000" height="1320" rx="56" fill="${bg}"/>
  <path d="${loaf}" fill="url(#crust)" stroke="#8A4B1E" stroke-width="10" stroke-linejoin="round"/>
  <path d="M150 330C150 330 400 360 850 330" fill="none" stroke="#8A4B1E" stroke-opacity=".35" stroke-width="8" stroke-linecap="round"/>
  <g fill="none" stroke="#FFF3DF" stroke-opacity=".75" stroke-width="12" stroke-linecap="round">
    <path d="M300 170C330 135 380 125 420 140"/><path d="M460 150C500 118 560 112 600 130"/><path d="M640 160C675 135 720 135 755 155"/>
  </g>
  <rect x="${PANEL.x - 14}" y="${PANEL.y - 14}" width="${PANEL.size + 28}" height="${PANEL.size + 28}" rx="44" fill="#8A4B1E" fill-opacity=".35"/>
  <rect x="${PANEL.x}" y="${PANEL.y}" width="${PANEL.size}" height="${PANEL.size}" rx="32" fill="${CREAM}"/>
  <g fill="${INK}" shape-rendering="crispEdges">${cells}</g>
  <g transform="translate(500 1130)" text-anchor="middle" font-family="Montserrat, Arial, sans-serif">
    <text y="0" font-size="30" font-weight="500" letter-spacing="6" fill="#EBA65D">ESCANEA Y PIDE POR WHATSAPP</text>
    <text y="70" font-size="62" font-weight="800" letter-spacing="10" fill="${bg === '#FFFFFF' ? INK : CREAM}">DON PABON</text>
  </g>
</svg>`

const variants = { oscuro: '#101112', claro: '#FFFFFF' }
for (const [name, bg] of Object.entries(variants)) {
  const file = `qr-don-pabon-${name}`
  const markup = svg(bg)
  writeFileSync(new URL(`${file}.svg`, outDir), markup)
  const png = await sharp(Buffer.from(markup), { density: 192 }).resize(1500).png().toBuffer()
  writeFileSync(new URL(`${file}.png`, outDir), png)

  // Verificación: decodifica el PNG generado y compara con la URL.
  const { data, info } = await sharp(png).ensureAlpha().raw().toBuffer({ resolveWithObject: true })
  const read = jsQR(new Uint8ClampedArray(data), info.width, info.height)
  console.log(`${file}: ${read?.data === url ? 'OK, se lee correctamente' : 'ERROR: no se pudo leer'} (${info.width}×${info.height})`)
  if (read?.data !== url) process.exitCode = 1
}
console.log('QR para:', url, '→ carpeta qr/')
