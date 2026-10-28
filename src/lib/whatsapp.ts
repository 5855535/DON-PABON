/**
 * Único punto de configuración del número de WhatsApp.
 * Se define en .env → WHATSAPP_PHONE=573XXXXXXXXX (solo dígitos, con código de país).
 */
const raw = import.meta.env.WHATSAPP_PHONE ?? ''
const digits = String(raw).replace(/\D/g, '')

export const WHATSAPP_PHONE = digits
export const WHATSAPP_CONFIGURED = /^\d{10,15}$/.test(digits)

if (!WHATSAPP_CONFIGURED && import.meta.env.DEV) {
  console.warn(
    '[DON PABON] WHATSAPP_PHONE no está configurado (ej. 573001234567). Los botones abrirán WhatsApp sin destinatario.',
  )
}

export const GENERAL_MESSAGE = 'Hola, DON PABON. Quisiera hacer un pedido, ¿me podrían ayudar, por favor?'

export const productMessage = (name: string) =>
  `Hola, DON PABON. Estoy interesado/a en el producto ${name}. ¿Me podrían informar cuál es su precio, por favor?`

export const whatsappUrl = (message: string) =>
  `https://wa.me/${WHATSAPP_CONFIGURED ? WHATSAPP_PHONE : ''}?text=${encodeURIComponent(message)}`
