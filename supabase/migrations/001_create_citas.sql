-- ============================================================
-- Luga Gy — Tabla de Citas
-- Ejecutar en: https://supabase.com/dashboard/project/xewcrgwgzmrsuzhqjpwq/sql
-- ============================================================

-- 1. Crear tabla
create table if not exists public.citas (
  id               uuid        default gen_random_uuid() primary key,
  nombre           text        not null default 'Clienta',
  servicio         text        not null,
  fecha            date        not null,
  hora             time        not null,
  estado           text        not null default 'pendiente'
                               check (estado in ('pendiente', 'confirmada', 'cancelada')),
  google_event_id  text,                          -- ID del evento en Google Calendar
  whatsapp_sent    boolean     default false,     -- ¿Se envió confirmación por WA?
  notas            text,                          -- Notas internas
  created_at       timestamptz default now()
);

-- 2. Índices para consultas rápidas
create index if not exists citas_fecha_idx   on public.citas (fecha);
create index if not exists citas_estado_idx  on public.citas (estado);

-- 3. Habilitar Row Level Security
alter table public.citas enable row level security;

-- 4. Políticas RLS

-- Cualquier visitante puede INSERTAR su propia cita (reserva desde la web)
create policy "Clientes pueden crear citas"
  on public.citas
  for insert
  to anon
  with check (true);

-- Solo usuarios autenticados (admin) pueden VER todas las citas
create policy "Admin puede ver citas"
  on public.citas
  for select
  to authenticated
  using (true);

-- Solo admin puede actualizar (confirmar / cancelar)
create policy "Admin puede actualizar citas"
  on public.citas
  for update
  to authenticated
  using (true)
  with check (true);

-- Solo admin puede eliminar
create policy "Admin puede eliminar citas"
  on public.citas
  for delete
  to authenticated
  using (true);

-- ============================================================
-- Vista de citas del día (útil para panel admin)
-- ============================================================
create or replace view public.citas_hoy as
  select id, nombre, servicio, hora, estado, notas
  from public.citas
  where fecha = current_date
  order by hora;
