// Póster de promoción de DON PABON con el QR en forma de pan.
// Uso:  node scripts/poster.mjs https://tu-sitio.netlify.app [foto-portada]
// Genera en poster/: A4 vertical (2480×3508, listo para imprimir) e historia/estado vertical (1080×1920).
import { mkdirSync, writeFileSync } from 'node:fs'
import sharp from 'sharp'
import jsQR from 'jsqr'
import { breadQr, COLORS, fonts, textPath, wheat } from './lib/pan.mjs'

const url = process.argv[2]
if (!url || !/^https?:\/\//.test(url)) {
  console.error('Uso: node scripts/poster.mjs https://tu-sitio.netlify.app [foto-portada.webp]')
  process.exit(1)
}
const photoPath = process.argv[3] ?? new URL('../public/images/hero.webp', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1')
const outDir = new URL('../poster/', import.meta.url)
mkdirSync(outDir, { recursive: true })

const host = url.replace(/^https?:\/\//, '').replace(/\/$/, '')
const { defs, group } = breadQr(url)

const FORMATS = {
  a4: { H: 1414, photoH: 560, logoY: 80, tagY: 335, h1Y: 455, h2Y: 535, qrTy: 640, qrScale: 0.6, scanY: 1300, urlY: 1362, outW: 2480 },
  historia: { H: 1778, photoH: 760, logoY: 130, tagY: 450, h1Y: 585, h2Y: 665, qrTy: 830, qrScale: 0.72, scanY: 1640, urlY: 1712, outW: 1080 },
}

async function build(name, f) {
  const photo = await sharp(photoPath)
    .resize(2000, Math.round(f.photoH * 2), { fit: 'cover', position: 'centre' })
    .modulate({ brightness: 0.9 })
    .jpeg({ quality: 88 })
    .toBuffer()
  const W = 1000
  const qrH = 1000 * f.qrScale
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${f.H}" width="${W}" height="${f.H}">
  <defs>${defs}
    <linearGradient id="fade" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="${COLORS.ink}" stop-opacity=".55"/><stop offset=".55" stop-color="${COLORS.ink}" stop-opacity=".35"/><stop offset="1" stop-color="${COLORS.ink}" stop-opacity="1"/>
    </linearGradient>
    <radialGradient id="glow" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="${COLORS.accent}" stop-opacity=".28"/><stop offset="1" stop-color="${COLORS.accent}" stop-opacity="0"/></radialGradient>
  </defs>
  <rect width="${W}" height="${f.H}" fill="${COLORS.ink}"/>
  <image href="data:image/jpeg;base64,${photo.toString('base64')}" x="0" y="0" width="${W}" height="${f.photoH}" preserveAspectRatio="xMidYMid slice"/>
  <rect width="${W}" height="${f.photoH}" fill="url(#fade)"/>
  <ellipse cx="500" cy="${f.qrTy + qrH / 2}" rx="520" ry="${qrH * 0.62}" fill="url(#glow)"/>

  <g transform="translate(${500 - 228} ${f.logoY - 4}) scale(1.05)">
    <g transform="scale(.9)">${wheat(COLORS.accent)}</g>
  </g>
  ${textPath(fonts.bold, 'DON PABON', 560, f.logoY + 44, 54, COLORS.cream, 0.16)}
  ${textPath(fonts.medium, 'PANADERÍA ARTESANAL', 560, f.logoY + 74, 17, COLORS.mute ?? '#C9C9C9', 0.34)}

  ${textPath(fonts.script, 'Tradición en cada bocado', 500, f.tagY, 104, COLORS.accent)}
  ${textPath(fonts.bold, 'PIDE TU PAN', 500, f.h1Y, 74, COLORS.cream, 0.04)}
  ${textPath(fonts.bold, 'DESDE EL CELULAR', 500, f.h2Y, 74, COLORS.cream, 0.04)}

  <g transform="translate(500 ${f.qrTy}) scale(${f.qrScale}) translate(-500 -60)">${group}</g>

  ${textPath(fonts.medium, 'ESCANEA EL CÓDIGO Y PIDE POR WHATSAPP', 500, f.scanY, 27, COLORS.accent, 0.12)}
  ${textPath(fonts.bold, host, 500, f.urlY, 46, COLORS.cream, 0.02)}
</svg>`
  writeFileSync(new URL(`${name}.svg`, outDir), svg)
  const png = await sharp(Buffer.from(svg), { density: 96 * (f.outW / W) }).resize(f.outW).png().toBuffer()
  writeFileSync(new URL(`poster-don-pabon-${name}.png`, outDir), png)

  const { data, info } = await sharp(png).ensureAlpha().raw().toBuffer({ resolveWithObject: true })
  const read = jsQR(new Uint8ClampedArray(data), info.width, info.height)
  const ok = read?.data === url
  console.log(`${name}: ${ok ? 'OK, el QR se lee' : 'ERROR: el QR no se lee'} (${info.width}×${info.height})`)
  if (!ok) process.exitCode = 1
}

for (const [name, f] of Object.entries(FORMATS)) await build(name, f)
