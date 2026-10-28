// Genera el QR de DON PABON con forma de pan de molde (SVG + PNG) y verifica que se pueda leer.
// Uso:  node scripts/qr-pan.mjs https://tu-sitio.netlify.app
import { mkdirSync, writeFileSync } from 'node:fs'
import sharp from 'sharp'
import jsQR from 'jsqr'
import { breadQr, COLORS, fonts, textPath } from './lib/pan.mjs'

const url = process.argv[2]
if (!url || !/^https?:\/\//.test(url)) {
  console.error('Uso: node scripts/qr-pan.mjs https://tu-sitio.netlify.app')
  process.exit(1)
}
const outDir = new URL('../qr/', import.meta.url)
mkdirSync(outDir, { recursive: true })

const { defs, group } = breadQr(url)
const svg = (bg, titleColor) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 1320" width="1000" height="1320" role="img" aria-label="Código QR de DON PABON en forma de pan">
  <defs>${defs}</defs>
  <rect width="1000" height="1320" rx="56" fill="${bg}"/>
  ${group}
  ${textPath(fonts.medium, 'ESCANEA Y PIDE POR WHATSAPP', 500, 1140, 30, COLORS.accent, 0.2)}
  ${textPath(fonts.bold, 'DON PABON', 500, 1215, 62, titleColor, 0.16)}
</svg>`

const variants = { oscuro: ['#101112', COLORS.cream], claro: ['#FFFFFF', COLORS.ink] }
for (const [name, [bg, title]] of Object.entries(variants)) {
  const file = `qr-don-pabon-${name}`
  const markup = svg(bg, title)
  writeFileSync(new URL(`${file}.svg`, outDir), markup)
  const png = await sharp(Buffer.from(markup), { density: 192 }).resize(1500).png().toBuffer()
  writeFileSync(new URL(`${file}.png`, outDir), png)

  const { data, info } = await sharp(png).ensureAlpha().raw().toBuffer({ resolveWithObject: true })
  const read = jsQR(new Uint8ClampedArray(data), info.width, info.height)
  console.log(`${file}: ${read?.data === url ? 'OK, se lee correctamente' : 'ERROR: no se pudo leer'} (${info.width}×${info.height})`)
  if (read?.data !== url) process.exitCode = 1
}
console.log('QR para:', url, '→ carpeta qr/')
