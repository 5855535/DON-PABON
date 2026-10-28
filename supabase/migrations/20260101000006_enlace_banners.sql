-- DON PABON · enlace opcional en cada banner (al tocarlo abre una categoría, un producto o WhatsApp)
-- Valores: NULL (sin enlace) | 'whatsapp' | 'category:<slug>' | 'product:<uuid>'
-- Ejecutar en el SQL Editor después de las migraciones anteriores.

alter table public.banners
  add column if not exists link text
  check (link is null or char_length(link) <= 80);
