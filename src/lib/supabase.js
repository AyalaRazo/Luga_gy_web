import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    '[Luga Gy] Faltan variables de entorno de Supabase. ' +
    'Agrega VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY en .env.local'
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession:    true,   // keep session in localStorage
    autoRefreshToken:  true,   // auto-renew token before it expires
    detectSessionInUrl: false, // we don't use magic links
    storageKey: 'lugagy-admin-session', // unique key — avoids collisions
  },
});

// ─── Citas ────────────────────────────────────────────────────────────────────

/**
 * Guarda una nueva cita en Supabase.
 * @param {{ nombre: string, servicio: string, fecha: string, hora: string }} cita
 * @returns {{ data, error }}
 */
export async function crearCita(cita) {
  const { data, error } = await supabase
    .from('citas')
    .insert([{
      nombre:   cita.nombre   || 'Clienta',
      servicio: cita.servicio,
      fecha:    cita.fecha,
      hora:     cita.hora,
      estado:   'pendiente',
      email:    cita.email    || null,
      telefono: cita.telefono || null,
    }])
    .select()
    .single();

  return { data, error };
}

const EDGE_FN_URL = 'https://xewcrgwgzmrsuzhqjpwq.supabase.co/functions/v1/send-booking-email';

export async function sendBookingEmail({ email, name, servicio, fecha, hora, token, telefono }) {
  const res = await fetch(EDGE_FN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ type: 'booking', email, name, servicio, fecha, hora, token, telefono, siteUrl: window.location.origin }),
  });
  const data = await res.json().catch(() => null);
  if (!res.ok) return { data: null, error: data };
  return { data, error: null };
}

export async function sendConfirmedEmail({ email, name, servicio, fecha, hora }) {
  const res = await fetch(EDGE_FN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ type: 'confirmed', email, name, servicio, fecha, hora }),
  });
  const data = await res.json().catch(() => null);
  if (!res.ok) return { data: null, error: data };
  return { data, error: null };
}

/**
 * Obtiene todas las citas de una fecha (para ver disponibilidad).
 * @param {string} fecha — formato YYYY-MM-DD
 */
export async function getCitasPorFecha(fecha) {
  const { data, error } = await supabase
    .from('citas')
    .select('hora, servicio, estado')
    .eq('fecha', fecha)
    .neq('estado', 'cancelada')
    .order('hora');

  return { data, error };
}

/**
 * Vincula una cita con su evento de Google Calendar.
 * @param {string} citaId
 * @param {string} googleEventId
 */
export async function vincularEventoCalendario(citaId, googleEventId) {
  const { data, error } = await supabase
    .from('citas')
    .update({ google_event_id: googleEventId })
    .eq('id', citaId)
    .select('id, google_event_id')
    .single();

  return { data, error };
}

/**
 * Obtiene citas pendientes sin evento de Google Calendar asignado.
 * Útil para el panel admin.
 */
export async function getCitasPendientesSinCalendario() {
  const { data, error } = await supabase
    .from('citas')
    .select('*')
    .eq('estado', 'pendiente')
    .is('google_event_id', null)
    .order('fecha')
    .order('hora');

  return { data, error };
}

// ─── Servicios ────────────────────────────────────────────────────────────────

export async function getServiciosPublic() {
  const { data, error } = await supabase
    .from('servicios')
    .select('*')
    .eq('activo', true)
    .order('orden');
  return { data, error };
}

export async function getServiciosAdmin() {
  const { data, error } = await supabase
    .from('servicios')
    .select('*')
    .order('orden');
  return { data, error };
}

export async function createServicio(campos) {
  const { data, error } = await supabase
    .from('servicios')
    .insert([campos])
    .select()
    .single();
  return { data, error };
}

export async function updateServicio(id, campos) {
  const { data, error } = await supabase
    .from('servicios')
    .update({ ...campos, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();
  return { data, error };
}

export async function deleteServicio(id) {
  const { error } = await supabase.from('servicios').delete().eq('id', id);
  return { error };
}

// ─── Confirmación / Cancelación pública (por token) ──────────────────────────

export async function getCitaByToken(token) {
  const { data, error } = await supabase
    .from('citas')
    .select('id, nombre, servicio, fecha, hora, estado')
    .eq('confirmation_token', token)
    .single();
  return { data, error };
}

export async function confirmarCita(token) {
  const { data, error } = await supabase
    .from('citas')
    .update({ estado: 'por_confirmar' })
    .eq('confirmation_token', token)
    .eq('estado', 'pendiente')
    .select('id, estado')
    .single();
  return { data, error };
}

export async function solicitarCancelacion(token, motivo = '') {
  const { data, error } = await supabase
    .from('citas')
    .update({ estado: 'solicitud_cancelacion', cancel_reason: motivo || null })
    .eq('confirmation_token', token)
    .in('estado', ['pendiente', 'confirmada'])
    .select('id, estado')
    .single();
  return { data, error };
}

export async function resolverCancelacion(id, accion) {
  // accion: 'cancelada' | 'confirmada'
  const { data, error } = await supabase
    .from('citas')
    .update({ estado: accion })
    .eq('id', id)
    .eq('estado', 'solicitud_cancelacion')
    .select('id, estado')
    .single();
  return { data, error };
}

/**
 * Sube una imagen al bucket "servicios" y devuelve la URL pública.
 * @param {File} file
 * @param {string} servicioId — usado como nombre de archivo
 */
export async function uploadServicioImagen(file, servicioId) {
  const ext  = file.name.split('.').pop();
  const path = `${servicioId}.${ext}`;
  const { error } = await supabase.storage
    .from('servicios')
    .upload(path, file, { upsert: true, contentType: file.type });
  if (error) return { url: null, error };
  const { data } = supabase.storage.from('servicios').getPublicUrl(path);
  return { url: data.publicUrl, error: null };
}

// ─── Ingresos ─────────────────────────────────────────────────────────────────

export async function getIngresosStats(fechaInicio, fechaFin) {
  const { data, error } = await supabase
    .from('citas')
    .select('precio_cobrado, servicio, fecha, nombre, estado')
    .eq('estado', 'completada')
    .gte('fecha', fechaInicio)
    .lte('fecha', fechaFin)
    .order('fecha', { ascending: false });
  return { data, error };
}

export async function getIngresosPorServicio() {
  const { data, error } = await supabase
    .from('ingresos_por_servicio')
    .select('*');
  return { data, error };
}

// ─── Horario ──────────────────────────────────────────────────────────────────

export async function getHorario() {
  const { data, error } = await supabase.rpc('get_horario_publico');
  return { data: data ?? null, error };
}

export async function updateHorario(horario_config) {
  const { data, error } = await supabase.from('settings').update({ horario_config }).eq('id', 1).select('horario_config').single();
  return { data, error };
}

export async function getDiasBloqueados() {
  const { data, error } = await supabase.from('dias_bloqueados').select('*').order('fecha');
  return { data, error };
}

export async function addDiaBloqueado(fecha, motivo = '') {
  const { data, error } = await supabase.from('dias_bloqueados').insert([{ fecha, motivo: motivo || null }]).select().single();
  return { data, error };
}

export async function deleteDiaBloqueado(id) {
  const { error } = await supabase.from('dias_bloqueados').delete().eq('id', id);
  return { error };
}

// ─── Settings ─────────────────────────────────────────────────────────────────

export async function getSettings() {
  const { data, error } = await supabase.from('settings').select('*').eq('id', 1).single();
  return { data, error };
}

export async function updateSettings(campos) {
  const { data, error } = await supabase.from('settings').update(campos).eq('id', 1).select().single();
  return { data, error };
}

// ─── Google Calendar Edge Function ────────────────────────────────────────────

export async function gcalSync(payload) {
  const { data, error } = await supabase.functions.invoke('gcal-sync', { body: payload });
  return { data, error };
}

// ─── Admin CRUD ────────────────────────────────────────────────────────────────

/**
 * Obtiene todas las citas (requiere sesión admin).
 * @param {{ estado?: string, fecha?: string }} filtros
 */
export async function getCitasAdmin(filtros = {}) {
  let query = supabase
    .from('citas')
    .select('*')
    .order('fecha', { ascending: false })
    .order('hora');

  if (filtros.estado) query = query.eq('estado', filtros.estado);
  if (filtros.fecha)  query = query.eq('fecha', filtros.fecha);

  const { data, error } = await query;
  return { data, error };
}

/**
 * Obtiene citas en un rango de fechas (para vista de calendario).
 * @param {string} fechaInicio — YYYY-MM-DD
 * @param {string} fechaFin    — YYYY-MM-DD
 */
export async function getCitasRango(fechaInicio, fechaFin) {
  const { data, error } = await supabase
    .from('citas')
    .select('*')
    .gte('fecha', fechaInicio)
    .lte('fecha', fechaFin)
    .neq('estado', 'cancelada')
    .order('fecha')
    .order('hora');

  return { data, error };
}

/**
 * Actualiza campos de una cita.
 * @param {string} id
 * @param {object} campos
 */
export async function updateCita(id, campos) {
  const { data, error } = await supabase
    .from('citas')
    .update(campos)
    .eq('id', id)
    .select()
    .single();

  return { data, error };
}

/**
 * Elimina una cita por id.
 * @param {string} id
 */
export async function deleteCita(id) {
  const { error } = await supabase
    .from('citas')
    .delete()
    .eq('id', id);

  return { error };
}

/**
 * Obtiene estadísticas de la vista citas_stats.
 */
export async function getCitasStats() {
  const { data, error } = await supabase
    .from('citas_stats')
    .select('*')
    .single();

  return { data, error };
}

/**
 * Crea una nueva cita desde el panel admin (sin restricción de estado).
 */
// ─── Usuarios (gestión de roles) ──────────────────────────────────────────────

const MANAGE_USERS_URL = `${supabaseUrl}/functions/v1/admin-manage-users`;

export async function getUsuarios() {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, nombre, rol, activo')
    .order('activo', { ascending: false });
  return { data, error };
}

export async function manageUser(action, payload) {
  const { data: { session } } = await supabase.auth.getSession();
  const token = session?.access_token;
  const res = await fetch(MANAGE_USERS_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ action, ...payload }),
  });
  const data = await res.json().catch(() => null);
  if (!res.ok) return { data: null, error: data };
  return { data, error: null };
}

// ─── Clientas ─────────────────────────────────────────────────────────────────

export async function getClientas() {
  const { data, error } = await supabase
    .from('clientes_resumen')
    .select('*');
  return { data, error };
}

export async function getCitasDeCliente(email, nombre) {
  let query = supabase
    .from('citas')
    .select('*')
    .order('fecha', { ascending: false })
    .order('hora');

  if (email) {
    query = query.eq('email', email);
  } else {
    query = query.ilike('nombre', nombre);
  }

  const { data, error } = await query;
  return { data, error };
}

export async function crearCitaAdmin(cita) {
  const { data, error } = await supabase
    .from('citas')
    .insert([{
      nombre:   cita.nombre   || 'Clienta',
      servicio: cita.servicio,
      fecha:    cita.fecha,
      hora:     cita.hora,
      estado:   cita.estado   || 'pendiente',
      notas:    cita.notas    || null,
      email:    cita.email    || null,
      telefono: cita.telefono || null,
    }])
    .select()
    .single();

  return { data, error };
}
