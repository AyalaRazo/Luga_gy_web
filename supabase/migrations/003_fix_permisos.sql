-- ============================================================
-- Luga Gy — Fix permisos y perfiles (ejecutar en SQL Editor)
-- ============================================================

-- ─── 1. Ver qué usuarios existen y sus perfiles ──────────────────────────────
-- (Corre esto primero para diagnosticar)
select
  u.id,
  u.email,
  u.created_at,
  p.nombre,
  p.rol,
  p.activo
from auth.users u
left join public.profiles p on p.id = u.id
order by u.created_at;

-- ─── 2. Forzar super_admin en el primer usuario (el admin principal) ─────────
-- Si el SELECT de arriba muestra rol = 'worker' o activo = false, este UPDATE lo corrige.

update public.profiles
set rol = 'super_admin', activo = true
where id = (
  select id from auth.users order by created_at limit 1
);

-- Si tienes el UUID exacto, usa esto en su lugar (más seguro):
-- update public.profiles set rol = 'super_admin', activo = true where id = 'PEGA-TU-UUID-AQUI';

-- ─── 3. Garantizar permisos SELECT en las vistas para usuarios autenticados ──
grant select on public.citas_stats          to authenticated;
grant select on public.clientes_resumen     to authenticated;
grant select on public.ingresos_por_servicio to authenticated;
grant select on public.citas_hoy            to authenticated;

-- ─── 4. Verificar el estado final ────────────────────────────────────────────
select id, nombre, rol, activo from public.profiles;
