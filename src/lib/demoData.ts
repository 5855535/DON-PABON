import type { Product } from './types'

/**
 * DATOS DE DEMOSTRACIÓN — solo se usan si no hay credenciales de Supabase.
 * Las fotos de /public/demo son imágenes de ejemplo; reemplázalas con tus productos
 * reales desde el panel /admin (o cargando datos en Supabase).
 */
const d = (
  id: number,
  name: string,
  description: string,
  category: Product['category'],
  file: string,
  extra: Partial<Product> = {},
): Product => ({
  id: `demo-${id}`,
  name,
  description,
  category,
  image_url: `/demo/${file}.webp`,
  image_path: null,
  is_featured: false,
  is_active: true,
  display_order: id * 10,
  created_at: '2026-01-01T00:00:00Z',
  updated_at: '2026-01-01T00:00:00Z',
  ...extra,
})

export const DEMO_PRODUCTS: Product[] = [
  d(1, 'Pan campesino', 'Corteza crocante y miga suave, horneado cada día.', 'panes', 'campesino', { is_featured: true }),
  d(2, 'Pan integral', 'Con granos enteros, ideal para el desayuno.', 'panes', 'integral'),
  d(3, 'Pan de semillas', 'Mezcla de semillas tostadas y masa madre.', 'panes', 'semillas'),
  d(4, 'Pan francés', 'Ligero, dorado y perfecto para acompañar.', 'panes', 'frances'),
  d(5, 'Pan de maíz', 'Dulce suave de maíz con aroma casero.', 'panes', 'maiz'),
  d(6, 'Pan de queso', 'Esponjoso y relleno de queso fundido.', 'panes', 'queso'),
  d(7, 'Baguette', 'Larga, crocante y recién salida del horno.', 'panes', 'baguette'),
  d(8, 'Pan de yuca', 'Tradicional, suave y con queso.', 'panes', 'yuca'),
  d(9, 'Croissant', 'Hojaldrado y mantequilloso.', 'dulces', 'croissant'),
  d(10, 'Pan de chocolate', 'Hojaldre relleno de chocolate oscuro.', 'dulces', 'chocolate'),
  d(11, 'Ensaimada', 'Espiral dulce y esponjosa con azúcar glas.', 'dulces', 'ensaimada'),
  d(12, 'Rollo de canela', 'Canela, azúcar y glaseado cremoso.', 'dulces', 'rollo-canela'),
  d(13, 'Muffin', 'Suave por dentro, dorado por fuera.', 'dulces', 'muffin'),
  d(14, 'Alfajor', 'Dos galletas tiernas con dulce de leche.', 'dulces', 'alfajor'),
  d(15, 'Galletas', 'Crocantes, con chips de chocolate.', 'dulces', 'galletas'),
  d(16, 'Torta de chocolate', 'Capas húmedas y cobertura intensa.', 'dulces', 'torta-chocolate'),
  d(17, 'Empanadas', 'Doradas y rellenas, ideales para compartir.', 'salados', 'empanadas'),
  d(18, 'Hojaldres', 'Crujientes y rellenos de sabor.', 'salados', 'hojaldres'),
  d(19, 'Pastel de pollo', 'Masa hojaldrada con pollo cremoso.', 'salados', 'pastel-pollo'),
  d(20, 'Arepa de huevo', 'Clásico de la casa, crocante y caliente.', 'salados', 'arepa-huevo'),
  d(21, 'Croquetas', 'Doradas por fuera, suaves por dentro.', 'salados', 'croquetas'),
  d(22, 'Sándwiches', 'Pan artesanal con rellenos frescos.', 'salados', 'sandwiches'),
  d(23, 'Panetón', 'Esponjoso, con frutas confitadas y mucho sabor.', 'navideno', 'paneton'),
  d(24, 'Galletas navideñas', 'Decoradas a mano para compartir.', 'navideno', 'galletas-navidenas'),
  d(25, 'Torta navideña', 'Frutos rojos y chocolate para brindar.', 'navideno', 'torta-navidena'),
  d(26, 'Budín', 'Húmedo y aromático, receta de siempre.', 'navideno', 'budin'),
  d(27, 'Stollen', 'Clásico navideño con azúcar glas.', 'navideno', 'stollen'),
  d(28, 'Dulce de frutas', 'Frutas confitadas de temporada.', 'navideno', 'dulce-frutas'),
]
