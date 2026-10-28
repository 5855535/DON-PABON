# DON PABON — Catálogo web de panadería

Catálogo público **sin precios, sin carrito y sin pagos**: todo pedido se hace por WhatsApp.
Stack: React + TypeScript + Vite + Tailwind CSS v4 + Supabase (Database, Storage, Auth, RLS).

## Estructura

```
src/
  components/   Navbar, Logo (SVG propio), WhatsAppButton, ProductCard, ProductGrid…
  pages/        Home, Category (/panes /dulces /salados /navideno), NotFound
  pages/admin/  Panel protegido (/admin): login, listado, formulario
  lib/          supabase, whatsapp, products (CRUD + imágenes), categorías, datos demo
supabase/
  migrations/   20260101000001_schema_productos.sql  (tablas, RLS, función de estrella)
                20260101000002_storage_imagenes.sql (bucket + políticas de Storage)
  seed_admin.sql  primer admin   ·   seed_demo.sql  datos de ejemplo (opcional)
public/images   hero y portadas de categoría   ·   public/demo   fotos de EJEMPLO
```

## 1. Ejecutar en local

```bash
npm install
cp .env.example .env     # en Windows: copy .env.example .env
npm run dev              # http://localhost:5173
```

**Sin credenciales de Supabase el sitio funciona en modo demostración** (productos y fotos de ejemplo,
con un aviso en el pie de página). El panel `/admin` queda desactivado hasta configurar Supabase.

## 2. Configurar el número de WhatsApp

En `.env` (única variable de configuración):

```
WHATSAPP_PHONE=573001234567
```

Solo dígitos, con código de país (Colombia = `57`). Todos los botones usan
`https://wa.me/NUMERO?text=` + `encodeURIComponent(mensaje)`. Si la variable no está definida o es el
placeholder, los botones abren WhatsApp sin destinatario (y en desarrollo aparece una advertencia en consola).

- Botón general: «Hola, DON PABON. Quisiera hacer un pedido, ¿me podrían ayudar, por favor?»
- Por producto: «Hola, DON PABON. Estoy interesado/a en el producto {nombre}. ¿Me podrían informar cuál es su precio, por favor?»

Los textos están en `src/lib/whatsapp.ts`. Tras cambiar el `.env` hay que **reconstruir** (`npm run build`).

## 3. Crear el proyecto Supabase (plan gratuito)

1. En <https://supabase.com> crea un proyecto.
2. **SQL Editor** → ejecuta en orden `supabase/migrations/…_schema_productos.sql` y luego
   `…_storage_imagenes.sql` (o usa la CLI: `supabase link` + `supabase db push`).
3. **Authentication → Sign In / Providers → Email**: **desactiva "Allow new users to sign up"**
   (no debe haber registro público). Aun así, registrarse nunca da permisos: solo pueden escribir
   los usuarios listados en la tabla `admins`.
4. **Project Settings → API**: copia *Project URL* y la clave **anon** a `.env`:
   `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY`. **Nunca uses ni pegues la `service_role`.**
5. (Opcional) `supabase/seed_demo.sql` para cargar 5 productos de ejemplo.

### Crear el primer admin de forma segura

1. **Authentication → Users → Add user**: correo + contraseña robusta (marca *Auto Confirm User*).
2. En el SQL Editor, edita el correo de `supabase/seed_admin.sql` y ejecútalo (inserta al usuario en `admins`).
3. Entra a `/admin` con ese correo.

### Seguridad (resumen de las políticas)

- `products`: visitantes (anon) solo **leen productos activos**; admins leen todo y hacen insert/update/delete.
- `admins`: cada usuario solo ve su propia fila; no existe política de escritura (se gestiona desde el SQL Editor).
- Storage `product-images`: lectura pública; subir/reemplazar/borrar solo admins; límite 5 MB y solo WebP/JPEG/PNG/AVIF.
- Un solo producto estrella: índice único parcial + función `set_featured_product` (atómica, solo admins).
- El cliente no maneja precios en ningún punto.

## 4. Panel de administración (`/admin`)

Login, crear/editar/eliminar productos, categoría, activar/ocultar, **producto estrella**, reordenar (↑ ↓),
subir/reemplazar imagen (se redimensiona a ≤1600 px y se convierte a **WebP** en el navegador; la imagen
anterior se borra del bucket y, si falla el guardado, se elimina la recién subida para no dejar huérfanos) y
«Vista previa» del catálogo público.

## 5. Publicar

```bash
npm run build      # genera dist/
```

Sube `dist/` a Netlify, Vercel o Cloudflare Pages (incluye `public/_redirects` y `vercel.json` para el
enrutado SPA). Define allí `WHATSAPP_PHONE`, `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY`
**antes** de construir, y añade la URL final en Supabase → Authentication → URL Configuration.

## 6. Reemplazar el material de demostración

- `public/demo/*` y `src/lib/demoData.ts`: fotos y productos **de ejemplo** (recortes del mockup de diseño,
  baja resolución). Con Supabase configurado ya no se usan; puedes borrarlos.
- `public/images/hero.webp` y `cat-*.webp`: portada del inicio y de cada categoría. Sustitúyelos por fotos
  propias (hero ≥ 1600 px de ancho recomendado) conservando el nombre.

## Pruebas realizadas

- `npm run build` (tsc + vite) sin errores.
- Navegador (vista previa de producción, modo demo): inicio, hero, categorías, producto estrella, destacados y
  URLs de categoría; ruta inexistente → 404 amigable; sin scroll horizontal; 0 imágenes rotas.
- Móvil (375 px, emulación): navbar compacta, menú desplegable con botón de WhatsApp, tarjetas a 1 columna.
- Enlaces WhatsApp con `WHATSAPP_PHONE=573001234567`: URL `wa.me/573001234567?text=…` codificada y mensaje por
  producto exacto; `target=_blank` con `rel=noopener noreferrer`.
- Sin precios en la interfaz pública. `/admin` en modo demo muestra aviso de no disponible.

## Pendiente / no verificado

- **Integración real con Supabase NO probada** (no había credenciales): migraciones SQL, RLS, login, CRUD,
  subida/borrado de imágenes y producto estrella están implementados pero deben probarse al crear el proyecto.
- Número real de WhatsApp (hoy placeholder) y fotos profesionales de los productos.
- Revisión en dispositivos reales (iPhone/Android) y tablet; solo se revisó 375 px y escritorio en emulación.
- Sitemap y URLs canónicas cuando se conozca el dominio.
