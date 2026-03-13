import React, { useEffect, useState } from 'react';
import { X, Save, Calendar, AlertCircle, CheckCircle2 } from 'lucide-react';
import { crearCitaAdmin, updateCita, vincularEventoCalendario, gcalSync, getServiciosAdmin } from '../../lib/supabase';

const SERVICIOS = [
  'Pedicure Spa',
  'Manicure Gel',
  'Uñas Acrílicas',
  'Extensiones de Pestañas',
  'Lifting de Pestañas',
  'Diseño de Cejas',
  'Laminado de Cejas',
];

const ESTADOS = ['pendiente', 'por_confirmar', 'confirmada', 'completada', 'cancelada'];
const ESTADO_LABELS = {
  pendiente:     'Pendiente',
  por_confirmar: 'Por confirmar',
  confirmada:    'Confirmada',
  completada:    'Completada',
  cancelada:     'Cancelada',
};

const HORAS = Array.from({ length: 21 }, (_, i) => {
  const h = Math.floor(i / 2) + 9;
  const m = i % 2 === 0 ? '00' : '30';
  return `${String(h).padStart(2, '0')}:${m}`;
});

const EMPTY = { nombre: '', servicio: SERVICIOS[0], fecha: '', hora: '10:00', estado: 'pendiente', notas: '', precio_cobrado: '', email: '', telefono: '' };

export default function CitaModal({ cita, onClose, onSaved, defaultFecha, defaultHora }) {
  const isEdit = Boolean(cita);
  const [form,      setForm]      = useState(isEdit
    ? { ...cita, hora: cita.hora?.slice(0, 5) ?? '10:00', notas: cita.notas ?? '', precio_cobrado: cita.precio_cobrado != null ? String(cita.precio_cobrado) : '', email: cita.email ?? '', telefono: cita.telefono ?? '' }
    : { ...EMPTY, fecha: defaultFecha ?? '', hora: defaultHora ?? '10:00' });
  const [servicios, setServicios] = useState([]);
  const [loading,   setLoading]   = useState(false);
  const [calSync, setCalSync] = useState('idle'); // idle | syncing | ok | error
  const [error,   setError]   = useState('');

  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  // Load servicios from DB (dynamic list + auto-fill price)
  useEffect(() => {
    getServiciosAdmin().then(({ data }) => {
      if (data?.length) {
        setServicios(data);
        // Auto-fill price on new cita
        if (!isEdit && !form.precio_cobrado) {
          const sv = data.find(s => s.nombre === form.servicio);
          if (sv) setForm(p => ({ ...p, precio_cobrado: String(sv.precio) }));
        }
      }
    });
  }, []); // eslint-disable-line

  // When servicio changes, auto-fill price from DB
  function handleServicioChange(e) {
    const nombre = e.target.value;
    setForm(p => ({ ...p, servicio: nombre }));
    const sv = servicios.find(s => s.nombre === nombre);
    if (sv) setForm(p => ({ ...p, servicio: nombre, precio_cobrado: String(sv.precio) }));
  }

  function set(field) {
    return (e) => setForm(prev => ({ ...prev, [field]: e.target.value }));
  }

  async function syncCalendar(savedCita) {
    setCalSync('syncing');
    const action   = isEdit && cita.google_event_id ? 'update' : 'create';
    const eventId  = cita?.google_event_id ?? undefined;
    const { data, error: fnError } = await gcalSync({ action, cita: savedCita, eventId });

    if (fnError || data?.error) {
      console.warn('[GCal] No se pudo sincronizar:', fnError ?? data?.error);
      setCalSync('error');
      return;
    }

    if (data?.eventId) {
      await vincularEventoCalendario(savedCita.id, data.eventId);
    }
    setCalSync('ok');
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (!form.nombre.trim()) { setError('El nombre es requerido.'); return; }
    if (!form.fecha)          { setError('La fecha es requerida.');  return; }

    setLoading(true);

    const campos = {
      nombre:          form.nombre.trim(),
      servicio:        form.servicio,
      fecha:           form.fecha,
      hora:            form.hora,
      estado:          form.estado,
      notas:           form.notas     || null,
      precio_cobrado:  form.precio_cobrado !== '' ? parseFloat(form.precio_cobrado) : null,
      email:           form.email     || null,
      telefono:        form.telefono  || null,
    };

    const { data: saved, error: dbError } = isEdit
      ? await updateCita(cita.id, campos)
      : await crearCitaAdmin(campos);

    if (dbError) {
      setError('Error al guardar: ' + dbError.message);
      setLoading(false);
      return;
    }

    // Sync with Google Calendar (non-blocking — don't fail if calendar unavailable)
    await syncCalendar(saved);

    setLoading(false);
    onSaved();
  }

  const inputClass = "w-full px-3 py-2.5 font-poppins text-sm bg-gray-50 dark:bg-gray-700 dark:text-gray-100 dark:placeholder-gray-500 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-300 focus:border-pink-400 transition-all";
  const labelClass = "block font-poppins text-xs font-medium text-gray-600 dark:text-gray-300 mb-1.5";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-800 z-10">
          <h2 className="font-poppins text-base font-semibold text-gray-800 dark:text-gray-100">
            {isEdit ? 'Editar cita' : 'Nueva cita'}
          </h2>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 dark:text-gray-500 hover:text-gray-600 hover:bg-gray-100 transition-all cursor-pointer">
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="flex items-start gap-2 bg-red-50 dark:bg-red-900/20 border border-red-200 rounded-xl px-4 py-3">
              <AlertCircle size={15} className="text-red-500 mt-0.5 shrink-0" />
              <p className="font-poppins text-sm text-red-700">{error}</p>
            </div>
          )}

          {/* Calendar sync status */}
          {calSync === 'syncing' && (
            <div className="flex items-center gap-2 bg-blue-50 border border-blue-100 rounded-xl px-4 py-2.5">
              <div className="w-3.5 h-3.5 border-2 border-blue-300 border-t-blue-500 rounded-full animate-spin shrink-0" />
              <p className="font-poppins text-xs text-blue-600">Sincronizando con Google Calendar…</p>
            </div>
          )}
          {calSync === 'ok' && (
            <div className="flex items-center gap-2 bg-green-50 border border-green-100 rounded-xl px-4 py-2.5">
              <CheckCircle2 size={14} className="text-green-500 shrink-0" />
              <p className="font-poppins text-xs text-green-600">Evento sincronizado en Google Calendar</p>
            </div>
          )}
          {calSync === 'error' && (
            <div className="flex items-center gap-2 bg-amber-50 border border-amber-100 rounded-xl px-4 py-2.5">
              <Calendar size={14} className="text-amber-500 shrink-0" />
              <p className="font-poppins text-xs text-amber-700">
                Cita guardada. Google Calendar no está configurado — configuralo en <strong>Ajustes</strong>.
              </p>
            </div>
          )}

          <div>
            <label className={labelClass}>Nombre de la clienta *</label>
            <input type="text" required value={form.nombre} onChange={set('nombre')} placeholder="Ej: María García" className={inputClass} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Correo electrónico <span className="text-gray-400 dark:text-gray-500 font-normal">(opcional)</span></label>
              <input type="email" value={form.email} onChange={set('email')} placeholder="maria@gmail.com" className={inputClass} />
              <p className="font-poppins text-xs text-gray-400 dark:text-gray-500 mt-1">Se usa para identificar a la clienta y agrupar su historial de citas.</p>
            </div>
            <div>
              <label className={labelClass}>Celular <span className="text-gray-400 dark:text-gray-500 font-normal">(opcional)</span></label>
              <input type="tel" value={form.telefono} onChange={set('telefono')} placeholder="686 116 2619" className={inputClass} />
            </div>
          </div>

          <div>
            <label className={labelClass}>Servicio *</label>
            <select value={form.servicio} onChange={handleServicioChange} className={inputClass}>
              {(servicios.length ? servicios.map(s => s.nombre) : SERVICIOS).map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Fecha *</label>
              <input type="date" required value={form.fecha} onChange={set('fecha')} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Hora *</label>
              <select value={form.hora} onChange={set('hora')} className={inputClass}>
                {HORAS.map(h => <option key={h} value={h}>{h}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className={labelClass}>Estado</label>
            <select value={form.estado} onChange={set('estado')} className={inputClass}>
              {ESTADOS.map(e => <option key={e} value={e}>{ESTADO_LABELS[e]}</option>)}
            </select>
          </div>

          {/* Precio cobrado — visible solo si estado es completada o si ya tiene valor */}
          {(form.estado === 'completada' || form.precio_cobrado !== '') && (
            <div>
              <label className={labelClass}>Precio cobrado (MXN)</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 font-poppins text-sm text-gray-400 dark:text-gray-500">$</span>
                <input type="number" min="0" step="0.01"
                  value={form.precio_cobrado} onChange={set('precio_cobrado')}
                  placeholder="0.00"
                  className={`${inputClass} pl-7`} />
              </div>
              <p className="font-poppins text-xs text-gray-400 dark:text-gray-500 mt-1">Se usa para calcular los ingresos en el reporte.</p>
            </div>
          )}

          <div>
            <label className={labelClass}>Notas (opcional)</label>
            <textarea value={form.notas} onChange={set('notas')} rows={3} placeholder="Alergias, preferencias, observaciones…" className={`${inputClass} resize-none`} />
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 font-poppins text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all cursor-pointer">
              Cancelar
            </button>
            <button type="submit" disabled={loading}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-pink-500 hover:bg-pink-600 disabled:bg-pink-300 text-white font-poppins text-sm font-semibold transition-all cursor-pointer shadow-pink-sm">
              {loading
                ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                : <><Save size={15} />{isEdit ? 'Guardar cambios' : 'Crear cita'}</>
              }
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
