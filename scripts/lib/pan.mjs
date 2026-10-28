// Piezas compartidas para los materiales gráficos (QR en forma de pan y póster).
import { readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import opentype from 'opentype.js'
import QRCode from 'qrcode'

const require = createRequire(import.meta.url)

export const COLORS = { ink: '#101112', cream: '#F5F1E9', accent: '#EBA65D', crust: '#8A4B1E' }

function loadFont(pkg, file) {
  const buf = readFileSync(require.resolve(`@fontsource/${pkg}/files/${file}`))
  return opentype.parse(buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength))
}
export const fonts = {
  bold: loadFont('montserrat', 'montserrat-latin-800-normal.woff'),
  medium: loadFont('montserrat', 'montserrat-latin-500-normal.woff'),
  script: loadFont('caveat', 'caveat-latin-600-normal.woff'),
}


const r2 = (v) => Math.round(v * 100) / 100
/** Trazo de un glifo desplazado a (x, y): se calcula a mano para no depender de toPathData. */
function glyphData(font, ch, x, y, size) {
  const cmds = font.charToGlyph(ch).getPath(0, 0, size).commands
  let out = ''
  for (const c of cmds) {
    if (c.type === 'Z') out += 'Z'
    else if (c.type === 'M' || c.type === 'L') out += `${c.type}${r2(x + c.x)} ${r2(y + c.y)}`
    else if (c.type === 'Q') out += `Q${r2(x + c.x1)} ${r2(y + c.y1)} ${r2(x + c.x)} ${r2(y + c.y)}`
    else if (c.type === 'C') out += `C${r2(x + c.x1)} ${r2(y + c.y1)} ${r2(x + c.x2)} ${r2(y + c.y2)} ${r2(x + c.x)} ${r2(y + c.y)}`
  }
  return out
}

const ACUTE = { á: 'a', é: 'e', í: 'ı', ó: 'o', ú: 'u', Á: 'A', É: 'E', Í: 'I', Ó: 'O', Ú: 'U' }

/**
 * Texto centrado convertido a trazos (no depende de fuentes instaladas). spacing en em.
 * Los glifos acentuados compuestos fallan en opentype.js, así que se dibuja la letra base
 * y la tilde aparte.
 */
export function textPath(font, text, cx, baseline, size, fill, spacing = 0) {
  const upm = font.unitsPerEm
  const os2 = font.tables.os2
  const xh = (os2.sxHeight || upm * 0.52) * (size / upm)
  const cap = (os2.sCapHeight || upm * 0.7) * (size / upm)
  const glyphs = [...text].map((ch) => {
    const base = ACUTE[ch]
    let g = font.charToGlyph(base ?? ch)
    if (base === 'ı' && g.index === 0) g = font.charToGlyph('i')
    return { ch, accent: !!base, g, glyphChar: g.index === 0 ? 'i' : (base ?? ch), adv: (g.advanceWidth * size) / upm + spacing * size }
  })
  const width = glyphs.reduce((a, x) => a + x.adv, 0) - spacing * size
  let x = cx - width / 2
  let d = ''
  for (const { ch, accent, g, glyphChar, adv } of glyphs) {
    d += glyphData(font, glyphChar, x, baseline, size)
    if (accent) {
      const top = baseline - (ch === ch.toUpperCase() ? cap : xh)
      const c = x + ((g.advanceWidth * size) / upm) * 0.5 + (font === fonts.script ? size * 0.13 : 0)
      const t = size * 0.075
      const [ax, ay, bx, by] = [c - size * 0.05, top - size * 0.1, c + size * 0.09, top - size * 0.27]
      d += `M${(ax - t / 2).toFixed(2)} ${ay.toFixed(2)}L${(ax + t / 2).toFixed(2)} ${ay.toFixed(2)}L${(bx + t / 2).toFixed(2)} ${by.toFixed(2)}L${(bx - t / 2).toFixed(2)} ${by.toFixed(2)}Z`
    }
    x += adv
  }
  if (/NaN|undefined|Infinity/.test(d)) throw new Error(`Trazo inválido para el texto: ${text} ... ${d.match(/.{30}(NaN|undefined|Infinity).{10}/)?.[0]}`)
  return `<path d="${d}" fill="${fill}"/>`
}

/** Símbolo de trigo (mismo del logo). Dibujado en un cuadro de 64×64. */
export const wheat = (color) => `<g fill="${color}" stroke="none">
  <rect x="30.7" y="24" width="2.6" height="34" rx="1.3"/>
  <ellipse cx="32" cy="11" rx="3.4" ry="7.5"/>
  <ellipse cx="23.5" cy="22" rx="3.2" ry="7.2" transform="rotate(-38 23.5 22)"/><ellipse cx="40.5" cy="22" rx="3.2" ry="7.2" transform="rotate(38 40.5 22)"/>
  <ellipse cx="22.5" cy="35" rx="3.2" ry="7" transform="rotate(-40 22.5 35)"/><ellipse cx="41.5" cy="35" rx="3.2" ry="7" transform="rotate(40 41.5 35)"/>
  <ellipse cx="25" cy="47" rx="2.8" ry="6" transform="rotate(-42 25 47)"/><ellipse cx="39" cy="47" rx="2.8" ry="6" transform="rotate(42 39 47)"/>
</g>`

const PANEL = { x: 200, y: 380, size: 600 }
const LOAF =
  'M130 330C40 330 30 170 150 120C260 75 740 75 850 120C970 170 960 330 870 330L850 330L850 1010Q850 1060 800 1060L200 1060Q150 1060 150 1010L150 330Z'

/**
 * Pan de molde con el QR dentro. Coordenadas 1000 de ancho; el pan ocupa y = 60…1060.
 * Corrección de errores H y zona silenciosa de 4 módulos para que escanee bien.
 */
export function breadQr(url) {
  const qr = QRCode.create(url, { errorCorrectionLevel: 'H' })
  const n = qr.modules.size
  const mod = PANEL.size / (n + 8)
  const ox = PANEL.x + mod * 4
  const oy = PANEL.y + mod * 4
  let cells = ''
  for (let r = 0; r < n; r++)
    for (let c = 0; c < n; c++)
      if (qr.modules.get(r, c))
        cells += `<rect x="${(ox + c * mod).toFixed(2)}" y="${(oy + r * mod).toFixed(2)}" width="${(mod + 0.4).toFixed(2)}" height="${(mod + 0.4).toFixed(2)}"/>`

  const defs = `<linearGradient id="crust" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#F0B369"/><stop offset="0.45" stop-color="#EBA65D"/><stop offset="1" stop-color="#C77B34"/></linearGradient>`
  const group = `
  <path d="${LOAF}" fill="url(#crust)" stroke="${COLORS.crust}" stroke-width="10" stroke-linejoin="round"/>
  <path d="M150 330C150 330 400 360 850 330" fill="none" stroke="${COLORS.crust}" stroke-opacity=".35" stroke-width="8" stroke-linecap="round"/>
  <g fill="none" stroke="#FFF3DF" stroke-opacity=".75" stroke-width="12" stroke-linecap="round">
    <path d="M300 170C330 135 380 125 420 140"/><path d="M460 150C500 118 560 112 600 130"/><path d="M640 160C675 135 720 135 755 155"/>
  </g>
  <rect x="${PANEL.x - 14}" y="${PANEL.y - 14}" width="${PANEL.size + 28}" height="${PANEL.size + 28}" rx="44" fill="${COLORS.crust}" fill-opacity=".35"/>
  <rect x="${PANEL.x}" y="${PANEL.y}" width="${PANEL.size}" height="${PANEL.size}" rx="32" fill="${COLORS.cream}"/>
  <g fill="${COLORS.ink}" shape-rendering="crispEdges">${cells}</g>`
  return { defs, group }
}
