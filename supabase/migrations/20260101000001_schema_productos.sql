-- DON PABON · esquema de productos, admins y RLS
-- Ejecutar en Supabase → SQL Editor (o con `supabase db push`).

create extension if not exists pgcrypto;

-- ───────── Admins ─────────
-- Solo quien esté en esta tabla puede escribir. Registrarse NO da permisos.
create table if not exists public.admins (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);
alter table public.admins enable row level security;

-- security definer: evita recursión de RLS y no expone la tabla
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from public.admins where user_id = auth.uid());
$$;
revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to anon, authenticated;

-- Un usuario autenticado solo puede ver SU propia fila (para saber si es admin).
-- No hay políticas de insert/update/delete: los admins se crean desde el SQL Editor.
drop policy if exists "admins_select_self" on public.admins;
create policy "admins_select_self" on public.admins
  for select to authenticated using (user_id = auth.uid());

-- ───────── Productos ─────────
create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(btrim(name)) between 1 and 120),
  description text check (description is null or char_length(description) <= 600),
  category text not null check (category in ('panes','dulces','salados','navideno')),
  image_url text,
  image_path text,
  is_featured boolean not null default false,
  is_active boolean not null default true,
  display_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists products_category_order_idx
  on public.products (category, display_order);

-- Un solo producto estrella a la vez
create unique index if not exists products_single_featured_idx
  on public.products (is_featured) where is_featured;

create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;
drop trigger if exists products_touch_updated_at on public.products;
create trigger products_touch_updated_at
  before update on public.products
  for each row execute function public.touch_updated_at();

-- Cambia el producto estrella de forma atómica (solo admins)
create or replace function public.set_featured_product(p_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then
    raise exception 'No autorizado' using errcode = '42501';
  end if;
  update public.products set is_featured = false where is_featured;
  update public.products set is_featured = true, is_active = true where id = p_id;
end;
$$;
revoke all on function public.set_featured_product(uuid) from public, anon;
grant execute on function public.set_featured_product(uuid) to authenticated;

-- ───────── RLS ─────────
alter table public.products enable row level security;

drop policy if exists "products_public_read_active" on public.products;
create policy "products_public_read_active" on public.products
  for select to anon, authenticated using (is_active);

drop policy if exists "products_admin_read_all" on public.products;
create policy "products_admin_read_all" on public.products
  for select to authenticated using (public.is_admin());

drop policy if exists "products_admin_insert" on public.products;
create policy "products_admin_insert" on public.products
  for insert to authenticated with check (public.is_admin());

drop policy if exists "products_admin_update" on public.products;
create policy "products_admin_update" on public.products
  for update to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists "products_admin_delete" on public.products;
create policy "products_admin_delete" on public.products
  for delete to authenticated using (public.is_admin());
