-- OPCIONAL · datos de DEMOSTRACIÓN (imágenes de ejemplo en /demo del sitio).
-- Bórralos desde el panel admin cuando subas tus productos reales.
insert into public.products (name, description, category, image_url, is_featured, display_order) values
 ('Pan campesino','Corteza crocante y miga suave, horneado a diario.','panes','/demo/campesino.webp',true,10),
 ('Pan integral','Con granos enteros, ideal para el desayuno.','panes','/demo/integral.webp',false,20),
 ('Croissant','Hojaldrado y mantequilloso, recién horneado.','dulces','/demo/croissant.webp',false,10),
 ('Empanadas','Rellenas y doradas, perfectas para compartir.','salados','/demo/empanadas.webp',false,10),
 ('Panetón','El sabor de la tradición en estas fechas.','navideno','/demo/paneton.webp',false,10);
