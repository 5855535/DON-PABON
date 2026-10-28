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
2. **SQL Editor** → ejecuta en orden `supabase/migrations/…_schema_productos.sql`,
   `…_storage_imagenes.sql`, `…_banners_metricas.sql`, `…_galeria_productos.sql`, `…_ajustes_sitio.sql` y `…_enlace_banners.sql` (o usa la CLI: `supabase link` + `supabase db push`).
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

Tres pestañas:

- **Productos**: crear/editar/eliminar, categoría, activar/ocultar, **producto estrella** (con el texto de su etiqueta editable, p. ej. «Recomendado del chef»), **Recomendado** (los marcados aparecen en el inicio, hasta 8), reordenar (↑ ↓),
subir/reemplazar imagen (se redimensiona a ≤1600 px y se convierte a **WebP** en el navegador; la imagen
anterior se borra del bucket y, si falla el guardado, se elimina la recién subida para no dejar huérfanos) y
«Vista previa» del catálogo público.
- **Banners**: imágenes que giran en el inicio deslizando a la izquierda (agregar, reemplazar, texto opcional, orden, ocultar, eliminar). Recomendado 16:9. Cada banner puede tener un enlace (al tocarlo abre una categoría, un producto o WhatsApp). Sin banners activos se usa la portada por defecto.
- **Métricas**: visitas (sesiones), visitantes únicos, clics en WhatsApp, productos vistos, serie por día y productos con más interés (7/30/90 días). Son eventos anónimos (id aleatorio por navegador, sin datos personales); las visitas de admins no cuentan.

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

## App instalable del panel de administración (PWA)

Los admins pueden instalar el panel en el celular como una app (icono propio, pantalla completa, abre directo en `/admin/`).

- **Android (Chrome):** entra a `/admin`, inicia sesión y toca **⬇ Instalar app** (o menú ⋮ → «Instalar app»).
- **iPhone (Safari):** entra a `/admin`, inicia sesión, toca **⬇ Instalar app** y sigue la ayuda: Compartir → «Añadir a pantalla de inicio».
- La web pública **no** es instalable: el `manifest` solo se enlaza dentro del panel, y únicamente después de iniciar sesión como admin. El botón de instalar solo lo ven admins.
- Importante: ningún navegador permite *prohibir* técnicamente la instalación de una página. Lo que se garantiza es que la app instalada solo abre el panel, y el panel exige usuario y contraseña de una cuenta registrada en la tabla `admins` (RLS en la base de datos). Un usuario sin cuenta admin no puede ver ni cambiar nada.
- Archivos: `public/admin.webmanifest`, `public/admin/sw.js` (service worker mínimo, sin caché de datos), `public/icons/admin-*.png` (se regeneran con `node scripts/pwa-icons.mjs`), `src/pages/admin/InstallApp.tsx`.
## Tamaños de imágenes

| Dónde | Proporción | Tamaño recomendado | Notas |
|---|---|---|---|
| Fotos de productos (hasta 4 por producto: principal + 3 en el modal) | 4:3 horizontal | **1200 × 900 px** (mínimo 800 × 600) | Producto centrado. Se muestra también recortada en cuadrado (producto estrella) y a 16:10 en el modal del celular. |
| Banners del inicio | 16:9 | **1600 × 900 px** | En celular se ve completo; en pantallas grandes se recorta arriba y abajo (≈ 21:8), así que deja lo importante en la franja central. |
| Portada por defecto (`public/images/hero.webp`) | 16:9 | 1600 × 900 px | Solo se usa si no hay banners activos. |
| Imagen al compartir en redes (`og:image`) | 1.91:1 | 1200 × 630 px | Opcional. Hoy usa `hero.webp`; para que las redes la muestren bien conviene una URL absoluta del dominio final. |

El panel redimensiona a un máximo de 1600 px y convierte a WebP; no hace falta optimizar antes (acepta hasta 15 MB).
Las imágenes `public/images/cat-*.webp` ya no se muestran en la web.

## QR con forma de pan

```bash
node scripts/qr-pan.mjs https://TU-SITIO.netlify.app
```

Genera en `qr/` el QR (pan de molde) en versión oscura y clara, en SVG (vectorial, para imprenta) y PNG (1500 px),
y comprueba automáticamente que se pueda leer. Tamaño de impresión mínimo recomendado: 4 × 4 cm la zona del código.

## Póster de promoción

```bash
node scripts/poster.mjs https://TU-SITIO.netlify.app [foto-portada.webp]
```

Genera en `poster/` un póster A4 vertical (2480 × 3508 px, para imprimir) y una versión para historias/estados (1080 × 1920 px), ambos con el QR en forma de pan. Por defecto usa `public/images/hero.webp` de fondo; pasa una foto propia de mayor resolución como segundo argumento para mejor calidad de impresión.

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
