-- DON PABON · "Más pedidos", banners del inicio y métricas de visitas/clics
-- Ejecutar en el SQL Editor DESPUÉS de las dos migraciones anteriores.

-- ───────── Más pedidos (asignable desde el panel) ─────────
alter table public.products add column if not exists is_bestseller boolean not null default false;

-- ───────── Banners del inicio ─────────
create table if not exists public.banners (
  id uuid primary key default gen_random_uuid(),
  title text check (title is null or char_length(title) <= 80),
  image_url text not null,
  image_path text,
  display_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists banners_touch_updated_at on public.banners;
create trigger banners_touch_updated_at
  before update on public.banners
  for each row execute function public.touch_updated_at();

alter table public.banners enable row level security;

drop policy if exists "banners_public_read_active" on public.banners;
create policy "banners_public_read_active" on public.banners
  for select to anon, authenticated using (is_active);

drop policy if exists "banners_admin_read_all" on public.banners;
create policy "banners_admin_read_all" on public.banners
  for select to authenticated using (public.is_admin());

drop policy if exists "banners_admin_insert" on public.banners;
create policy "banners_admin_insert" on public.banners
  for insert to authenticated with check (public.is_admin());

drop policy if exists "banners_admin_update" on public.banners;
create policy "banners_admin_update" on public.banners
  for update to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists "banners_admin_delete" on public.banners;
create policy "banners_admin_delete" on public.banners
  for delete to authenticated using (public.is_admin());

-- (Las imágenes de banners usan el mismo bucket product-images, carpeta banners/)

-- ───────── Métricas ─────────
-- Solo se guardan eventos anónimos: un id aleatorio por navegador, sin datos personales.
create table if not exists public.site_events (
  id bigint generated always as identity primary key,
  event_type text not null check (event_type in ('visit','product_view','whatsapp_click')),
  visitor_id text not null check (char_length(visitor_id) between 8 and 64),
  product_id uuid references public.products(id) on delete set null,
  product_name text check (product_name is null or char_length(product_name) <= 120),
  source text check (source is null or char_length(source) <= 40),
  created_at timestamptz not null default now()
);
create index if not exists site_events_created_idx on public.site_events (created_at);
create index if not exists site_events_type_created_idx on public.site_events (event_type, created_at);

alter table public.site_events enable row level security;

-- Cualquier visitante puede REGISTRAR eventos, pero nadie salvo admins puede leerlos.
drop policy if exists "events_public_insert" on public.site_events;
create policy "events_public_insert" on public.site_events
  for insert to anon, authenticated with check (true);

drop policy if exists "events_admin_read" on public.site_events;
create policy "events_admin_read" on public.site_events
  for select to authenticated using (public.is_admin());

-- Resumen para el panel (solo admins)
create or replace function public.get_metrics(p_days integer default 30)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_since timestamptz := now() - make_interval(days => greatest(1, least(coalesce(p_days, 30), 365)));
  v_result jsonb;
begin
  if not public.is_admin() then
    raise exception 'No autorizado' using errcode = '42501';
  end if;

  select jsonb_build_object(
    'visits',          (select count(*) from site_events where event_type = 'visit' and created_at >= v_since),
    'unique_visitors', (select count(distinct visitor_id) from site_events where created_at >= v_since),
    'whatsapp_clicks', (select count(*) from site_events where event_type = 'whatsapp_click' and created_at >= v_since),
    'product_views',   (select count(*) from site_events where event_type = 'product_view' and created_at >= v_since),
    'top_products', coalesce((
      select jsonb_agg(t) from (
        select product_name as name,
               count(*) filter (where event_type = 'product_view')    as views,
               count(*) filter (where event_type = 'whatsapp_click')  as clicks
          from site_events
         where product_name is not null and created_at >= v_since
         group by product_name
         order by clicks desc, views desc
         limit 10
      ) t), '[]'::jsonb),
    'daily', coalesce((
      select jsonb_agg(d order by d.day) from (
        select (created_at at time zone 'America/Bogota')::date as day,
               count(*) filter (where event_type = 'visit')          as visits,
               count(*) filter (where event_type = 'whatsapp_click') as clicks
          from site_events
         where created_at >= v_since
         group by 1
      ) d), '[]'::jsonb)
  ) into v_result;

  return v_result;
end;
$$;
revoke all on function public.get_metrics(integer) from public, anon;
grant execute on function public.get_metrics(integer) to authenticated;
