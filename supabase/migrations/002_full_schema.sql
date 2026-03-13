-- ============================================================
-- Luga Gy — Schema completo (ejecutar en Supabase SQL Editor)
-- https://supabase.com/dashboard/project/xewcrgwgzmrsuzhqjpwq/sql
-- ============================================================

-- ─── 1. ACTUALIZAR tabla citas (agregar columnas faltantes) ─────────────────

alter table public.citas
  add column if not exists email               text,
  add column if not exists telefono            text,
  add column if not exists confirmation_token  text unique,
  add column if not exists cancel_reason       text,
  add column if not exists precio_cobrado      numeric(10,2);

-- Ampliar el check de estado para todos los estados que usa la app
alter table public.citas drop constraint if exists citas_estado_check;
alter table public.citas
  add constraint citas_estado_check
  check (estado in ('pendiente','por_confirmar','confirmada','completada','cancelada','solicitud_cancelacion'));

-- ─── 2. TABLA profiles ──────────────────────────────────────────────────────

create table if not exists public.profiles (
  id      uuid primary key references auth.users(id) on delete cascade,
  nombre  text not null default 'Admin',
  rol     text not null default 'worker'
          check (rol in ('super_admin','admin','worker')),
  activo  boolean not null default true,
  created_at timestamptz default now()
);

alter table public.profiles enable row level security;

-- Cualquier usuario autenticado puede leer todos los profiles
-- (necesario para que AdminUsuarios liste usuarios y para fetchProfile)
drop policy if exists "Usuarios ven su perfil" on public.profiles;
drop policy if exists "Autenticados ven todos los perfiles" on public.profiles;
create policy "Autenticados ven todos los perfiles"
  on public.profiles for select
  to authenticated
  using (true);

-- Usuarios actualizan su propio perfil (nombre)
drop policy if exists "Usuarios actualizan su perfil" on public.profiles;
create policy "Usuarios actualizan su perfil"
  on public.profiles for update
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- Service role puede hacer todo (lo usa la Edge Function)
drop policy if exists "Service role full access profiles" on public.profiles;
create policy "Service role full access profiles"
  on public.profiles for all
  to service_role
  using (true)
  with check (true);

-- ─── 3. TRIGGER — crear profile al registrar usuario ────────────────────────

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, nombre, rol, activo)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'nombre', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'rol', 'worker'),
    true
  )
  on conflict (id) do update
    set nombre = coalesce(excluded.nombre, profiles.nombre),
        rol    = coalesce(excluded.rol,    profiles.rol);
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ─── 4. TABLA servicios ──────────────────────────────────────────────────────

create table if not exists public.servicios (
  id          uuid        default gen_random_uuid() primary key,
  nombre      text        not null,
  descripcion text,
  duracion    integer     not null default 60, -- minutos
  precio      numeric(10,2),
  categoria   text,
  activo      boolean     not null default true,
  orden       integer     not null default 0,
  imagen_url  text,
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

alter table public.servicios enable row level security;

-- Público puede ver servicios activos
drop policy if exists "Público ve servicios activos" on public.servicios;
create policy "Público ve servicios activos"
  on public.servicios for select
  to anon
  using (activo = true);

-- Autenticados ven todos
drop policy if exists "Admin ve todos los servicios" on public.servicios;
create policy "Admin ve todos los servicios"
  on public.servicios for select
  to authenticated
  using (true);

-- Autenticados pueden CRUD
drop policy if exists "Admin CRUD servicios" on public.servicios;
create policy "Admin CRUD servicios"
  on public.servicios for all
  to authenticated
  using (true)
  with check (true);

-- ─── 5. TABLA settings ───────────────────────────────────────────────────────

create table if not exists public.settings (
  id              integer primary key default 1,
  horario_config  jsonb,
  nombre_negocio  text    default 'Luga Gy',
  telefono        text,
  email_negocio   text,
  created_at      timestamptz default now(),
  updated_at      timestamptz default now(),
  constraint settings_singleton check (id = 1)
);

-- Insertar fila única si no existe
insert into public.settings (id) values (1)
  on conflict (id) do nothing;

alter table public.settings enable row level security;

drop policy if exists "Admin ve settings" on public.settings;
create policy "Admin ve settings"
  on public.settings for select
  to authenticated
  using (true);

drop policy if exists "Admin actualiza settings" on public.settings;
create policy "Admin actualiza settings"
  on public.settings for update
  to authenticated
  using (true)
  with check (true);

-- ─── 6. TABLA dias_bloqueados ────────────────────────────────────────────────

create table if not exists public.dias_bloqueados (
  id         uuid        default gen_random_uuid() primary key,
  fecha      date        not null unique,
  motivo     text,
  created_at timestamptz default now()
);

alter table public.dias_bloqueados enable row level security;

drop policy if exists "Público ve días bloqueados" on public.dias_bloqueados;
create policy "Público ve días bloqueados"
  on public.dias_bloqueados for select
  to anon
  using (true);

drop policy if exists "Admin CRUD días bloqueados" on public.dias_bloqueados;
create policy "Admin CRUD días bloqueados"
  on public.dias_bloqueados for all
  to authenticated
  using (true)
  with check (true);

-- ─── 7. VISTA citas_stats ────────────────────────────────────────────────────

drop view if exists public.citas_stats;
create view public.citas_stats as
select
  count(*)                                                  as total,
  count(*) filter (where estado = 'pendiente')              as pendientes,
  count(*) filter (where estado = 'por_confirmar')          as por_confirmar,
  count(*) filter (where estado = 'confirmada')             as confirmadas,
  count(*) filter (where estado = 'completada')             as completadas,
  count(*) filter (where estado = 'cancelada')              as canceladas,
  count(*) filter (where fecha = current_date)              as hoy,
  count(*) filter (where fecha = current_date + 1)          as manana
from public.citas;

-- ─── 8. VISTA clientes_resumen ───────────────────────────────────────────────

drop view if exists public.clientes_resumen;
create view public.clientes_resumen as
select
  coalesce(email, nombre)                                           as key,
  nombre,
  email,
  telefono,
  count(*)                                                          as total_citas,
  count(*) filter (where estado = 'completada')                     as citas_completadas,
  max(fecha)                                                        as ultima_visita,
  min(fecha)                                                        as primera_visita,
  coalesce(sum(precio_cobrado) filter (where estado = 'completada'), 0) as total_gastado
from public.citas
group by coalesce(email, nombre), nombre, email, telefono;

-- ─── 9. VISTA ingresos_por_servicio ──────────────────────────────────────────

drop view if exists public.ingresos_por_servicio;
create view public.ingresos_por_servicio as
select
  servicio,
  count(*)                                   as total_citas,
  coalesce(sum(precio_cobrado), 0)           as total_ingresos,
  coalesce(avg(precio_cobrado), 0)           as promedio
from public.citas
where estado = 'completada'
group by servicio
order by total_ingresos desc;

-- ─── 10. ASEGURAR que los usuarios existentes tienen perfil ─────────────────
-- Inserta profiles para usuarios de auth.users que aún no tengan uno.
-- El rol se lee de raw_user_meta_data->>'rol' si existe, o 'worker' por defecto.
-- Para el primer usuario (admin principal) puedes cambiarlo manualmente después
-- con: UPDATE profiles SET rol = 'super_admin' WHERE id = '<tu-uuid>';

insert into public.profiles (id, nombre, rol, activo)
select
  id,
  coalesce(raw_user_meta_data->>'nombre', split_part(email, '@', 1)),
  coalesce(
    nullif(raw_user_meta_data->>'rol', ''),
    case when row_number() over (order by created_at) = 1 then 'super_admin' else 'worker' end
  ),
  true
from auth.users
on conflict (id) do nothing;

-- ============================================================
-- FIN — Verifica en Table Editor que profiles tenga tus usuarios
-- ============================================================
