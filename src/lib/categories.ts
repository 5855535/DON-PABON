import type { CategorySlug } from './types'

export interface CategoryInfo {
  slug: CategorySlug
  label: string
  eyebrow: string
  title: string
  description: string
  blurb: string
  cover: string
  bannerPhrase: string
  metaDescription: string
}

export const CATEGORIES: CategoryInfo[] = [
  {
    slug: 'panes',
    label: 'Panes',
    eyebrow: 'Panes',
    title: 'Pan artesanal, siempre fresco',
    description:
      'Elaborados con ingredientes de calidad y mucho amor. Nuestros panes conservan la esencia de la tradición.',
    blurb: 'Tradición y sabor en cada pieza.',
    cover: '/images/cat-panes.webp',
    bannerPhrase: 'Pan fresco todos los días',
    metaDescription: 'Panes artesanales de DON PABON: campesino, integral, de semillas y más. Pide por WhatsApp.',
  },
  {
    slug: 'dulces',
    label: 'Dulces',
    eyebrow: 'Dulces',
    title: 'Endulza tus momentos',
    description:
      'Pasteles, galletas, croissants y más. Hechos con ingredientes de primera y todo el sabor artesanal.',
    blurb: 'El toque perfecto para tu día.',
    cover: '/images/cat-dulces.webp',
    bannerPhrase: 'Un dulce también es un buen plan',
    metaDescription: 'Dulces de DON PABON: croissants, tortas, galletas y repostería artesanal. Pide por WhatsApp.',
  },
  {
    slug: 'salados',
    label: 'Salados',
    eyebrow: 'Salados',
    title: 'Sabor en cada bocado',
    description:
      'Empanadas, hojaldres y más. Perfectos para compartir o disfrutar en cualquier momento del día.',
    blurb: 'Ideales para cualquier momento.',
    cover: '/images/cat-salados.webp',
    bannerPhrase: 'Lo salado también es arte',
    metaDescription: 'Salados de DON PABON: empanadas, hojaldres, pasteles y más. Pide por WhatsApp.',
  },
  {
    slug: 'navideno',
    label: 'Navideño',
    eyebrow: 'Navideño',
    title: 'El sabor de la tradición',
    description:
      'Panetones, galletas y dulces típicos para compartir la magia de la Navidad.',
    blurb: 'El sabor de la tradición en estas fechas.',
    cover: '/images/cat-navideno.webp',
    bannerPhrase: 'Haz tu pedido y vive la magia de la Navidad',
    metaDescription: 'Especialidades navideñas de DON PABON: panetones, galletas y dulces típicos. Pide por WhatsApp.',
  },
]

export const getCategory = (slug: string | undefined) => CATEGORIES.find((c) => c.slug === slug)
