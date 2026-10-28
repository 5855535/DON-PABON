-- DON PABON · ajustes editables del sitio (por ahora: texto de la etiqueta del producto estrella)
-- Ejecutar en el SQL Editor después de las migraciones anteriores.

create table if not exists public.site_settings (
  key text primary key check (char_length(key) between 1 and 60),
  value text not null check (char_length(value) <= 80),
  updated_at timestamptz not null default now()
);

drop trigger if exists site_settings_touch_updated_at on public.site_settings;
create trigger site_settings_touch_updated_at
  before update on public.site_settings
  for each row execute function public.touch_updated_at();

alter table public.site_settings enable row level security;

-- Lectura pública (son textos que se muestran en la web); escritura solo admins.
drop policy if exists "settings_public_read" on public.site_settings;
create policy "settings_public_read" on public.site_settings
  for select to anon, authenticated using (true);

drop policy if exists "settings_admin_insert" on public.site_settings;
create policy "settings_admin_insert" on public.site_settings
  for insert to authenticated with check (public.is_admin());

drop policy if exists "settings_admin_update" on public.site_settings;
create policy "settings_admin_update" on public.site_settings
  for update to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists "settings_admin_delete" on public.site_settings;
create policy "settings_admin_delete" on public.site_settings
  for delete to authenticated using (public.is_admin());
