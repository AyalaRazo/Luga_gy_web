// supabase/functions/admin-manage-users/index.ts
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const SUPABASE_URL          = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const corsHeaders = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const authHeader = req.headers.get('Authorization') ?? '';
    const token = authHeader.replace('Bearer ', '').trim();
    if (!token) return json({ error: 'No autorizado: falta token.' }, 401);

    const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    const { data: { user }, error: userErr } = await admin.auth.getUser(token);
    if (userErr || !user) return json({ error: 'Token inválido o expirado.' }, 401);

    const { data: profile } = await admin
      .from('profiles').select('rol, activo').eq('id', user.id).single();

    if (!profile?.activo) return json({ error: 'Cuenta desactivada.' }, 403);

    const isSuperAdmin = profile.rol === 'super_admin';
    const isAdmin      = isSuperAdmin || profile.rol === 'admin';
    if (!isAdmin) return json({ error: 'Sin permisos de administrador.' }, 403);

    const body = await req.json();
    const action: string = body.action;

    // ── invite: solo super_admin ───────────────────────────────────────────────
    if (action === 'invite') {
      if (!isSuperAdmin) return json({ error: 'Solo super_admin puede invitar usuarios.' }, 403);
      const { nombre, email, rol, redirectTo } = body;
      if (!email || !nombre) return json({ error: 'Email y nombre son requeridos.' }, 400);
      if (!['admin', 'worker'].includes(rol)) return json({ error: 'Rol inválido.' }, 400);

      const { data: invited, error: inviteErr } = await admin.auth.admin.inviteUserByEmail(email, {
        redirectTo: redirectTo ?? `${new URL(req.url).origin}/admin/accept-invite`,
        data: { nombre, rol },
      });
      if (inviteErr) return json({ error: inviteErr.message }, 400);

      await admin.from('profiles').upsert(
        { id: invited.user.id, nombre, rol, activo: true },
        { onConflict: 'id' }
      );
      return json({ success: true, userId: invited.user.id });
    }

    // ── update rol: solo super_admin ───────────────────────────────────────────
    if (action === 'update') {
      if (!isSuperAdmin) return json({ error: 'Solo super_admin puede cambiar roles.' }, 403);
      const { userId, rol: newRol } = body;
      if (!userId) return json({ error: 'userId requerido.' }, 400);
      if (!['admin', 'worker'].includes(newRol)) return json({ error: 'Rol inválido.' }, 400);
      if (userId === user.id) return json({ error: 'No puedes cambiar tu propio rol.' }, 400);

      const { error: err } = await admin.from('profiles').update({ rol: newRol }).eq('id', userId);
      if (err) return json({ error: err.message }, 400);
      return json({ success: true });
    }

    // ── deactivate: solo super_admin ───────────────────────────────────────────
    if (action === 'deactivate') {
      if (!isSuperAdmin) return json({ error: 'Solo super_admin puede desactivar usuarios.' }, 403);
      const { userId } = body;
      if (!userId) return json({ error: 'userId requerido.' }, 400);
      if (userId === user.id) return json({ error: 'No puedes desactivarte a ti mismo.' }, 400);

      const { error: err } = await admin.from('profiles').update({ activo: false }).eq('id', userId);
      if (err) return json({ error: err.message }, 400);
      return json({ success: true });
    }

    // ── reactivate: solo super_admin ───────────────────────────────────────────
    if (action === 'reactivate') {
      if (!isSuperAdmin) return json({ error: 'Solo super_admin puede reactivar usuarios.' }, 403);
      const { userId } = body;
      if (!userId) return json({ error: 'userId requerido.' }, 400);

      const { error: err } = await admin.from('profiles').update({ activo: true }).eq('id', userId);
      if (err) return json({ error: err.message }, 400);
      return json({ success: true });
    }

    // ── delete: solo super_admin ───────────────────────────────────────────────
    if (action === 'delete') {
      if (!isSuperAdmin) return json({ error: 'Solo super_admin puede eliminar usuarios.' }, 403);
      const { userId } = body;
      if (!userId) return json({ error: 'userId requerido.' }, 400);
      if (userId === user.id) return json({ error: 'No puedes eliminarte a ti mismo.' }, 400);

      const { error: err } = await admin.auth.admin.deleteUser(userId);
      if (err) return json({ error: err.message }, 400);
      // El profile se elimina en cascada por FK con auth.users
      return json({ success: true });
    }

    return json({ error: `Acción desconocida: ${action}` }, 400);

  } catch (err) {
    console.error('[admin-manage-users]', err);
    return json({ error: 'Error interno del servidor.' }, 500);
  }
});

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}
