const MAX_SIDE = 1600
const MAX_INPUT_BYTES = 15 * 1024 * 1024

/** Redimensiona (máx. 1600 px) y convierte a WebP (JPEG si el navegador no lo soporta). */
export async function optimizeImage(file: File): Promise<Blob> {
  if (!file.type.startsWith('image/')) throw new Error('El archivo no es una imagen.')
  if (file.size > MAX_INPUT_BYTES) throw new Error('La imagen supera los 15 MB.')

  const bitmap = await createImageBitmap(file)
  const scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height))
  const w = Math.round(bitmap.width * scale)
  const h = Math.round(bitmap.height * scale)
  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('No se pudo procesar la imagen.')
  ctx.drawImage(bitmap, 0, 0, w, h)
  bitmap.close()

  const toBlob = (type: string, q: number) =>
    new Promise<Blob | null>((res) => canvas.toBlob(res, type, q))
  let blob = await toBlob('image/webp', 0.82)
  if (!blob || blob.type !== 'image/webp') blob = await toBlob('image/jpeg', 0.85)
  if (!blob) throw new Error('No se pudo convertir la imagen.')
  return blob
}
