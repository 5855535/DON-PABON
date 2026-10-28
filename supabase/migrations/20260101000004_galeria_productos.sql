-- DON PABON · galería de hasta 4 fotos por producto
-- image_url/image_path = foto principal; gallery = hasta 3 fotos adicionales [{url, path}].
-- Ejecutar en el SQL Editor después de las migraciones anteriores.

alter table public.products
  add column if not exists gallery jsonb not null default '[]'::jsonb;

alter table public.products drop constraint if exists products_gallery_valid;
alter table public.products
  add constraint products_gallery_valid
  check (jsonb_typeof(gallery) = 'array' and jsonb_array_length(gallery) <= 3);
