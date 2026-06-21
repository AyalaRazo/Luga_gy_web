import React, { useEffect, useState, useMemo } from 'react';
import { X, Save, Calendar, AlertCircle, CheckCircle2, Tag } from 'lucide-react';
import { crearCitaAdmin, updateCita, vincularEventoCalendario, gcalSync, getServiciosAdmin, getPromocionesAdmin } from '../../lib/supabase';
import { promosParaHoy, calcularPrecioEfectivo } from '../../lib/promociones';

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

const EMPTY = { nombre: '', fecha: '', hora: '10:00', estado: 'pendiente', notas: '', precio_cobrado: '', email: '', telefono: '' };

export default function CitaModal({ cita, onClose, onSaved, defaultFecha, defaultHora }) {
  const isEdit = Boolean(cita);
  const [form, setForm] = useState(isEdit
    ? { ...cita, hora: cita.hora?.slice(0, 5) ?? '10:00', notas: cita.notas ?? '', precio_cobrado: cita.precio_cobrado != null ? String(cita.precio_cobrado) : '', email: cita.email ?? '', telefono: cita.telefono ?? '' }
    : { ...EMPTY, fecha: defaultFecha ?? '', hora: defaultHora ?? '10:00' });

  const [selectedAdminServices, setSelectedAdminServices] = useState(
    isEdit ? (cita?.servicio || '').split(' + ').filter(Boolean) : []
  );
  const [servicios,   setServicios]   = useState([]);
  const [promociones, setPromociones] = useState([]);
  const [loading,     setLoading]     = useState(false);
  const [calSync,     setCalSync]     = useState('idle');
  const [error,       setError]       = useState('');

  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  useEffect(() => {
    getServiciosAdmin().then(({ data }) => {
      if (data?.length) setServicios(data);
    });
    getPromocionesAdmin().then(({ data }) => {
      if (data?.length) setPromociones(data);
    });
  }, []); // eslint-disable-line

  const toggleAdminService = (nombre) => {
    setSelectedAdminServices(prev => {
      const next = prev.includes(nombre)
        ? prev.filter(s => s !== nombre)
        : [...prev, nombre];
      if (servicios.length > 0) {
        const total = servicios
          .filter(s => next.includes(s.nombre))
          .reduce((sum, s) => sum + (Number(s.precio) || 0), 0);
        setForm(p => ({ ...p, precio_cobrado: next.length > 0 ? String(total) : '' }));
      }
      return next;
    });
  };

  const precioHint = useMemo(() => {
    if (!selectedAdminServices.length || !servicios.length) return null;
    const svcs = servicios.filter(s => selectedAdminServices.includes(s.nombre));
    if (!svcs.length) return null;
    const fecha = form.fecha ? new Date(form.fecha + 'T12:00:00') : new Date();
    const promosHoy = promosParaHoy(promociones, fecha);
    let totalBase = 0, totalFinal = 0;
    const promosAplicadas = [];
    svcs.forEach(sv => {
      const { precioFinal, promo } = calcularPrecioEfectivo(sv.precio, promosHoy, sv.id);
      totalBase  += Number(sv.precio) || 0;
      totalFinal += precioFinal || 0;
      if (promo && !promosAplicadas.find(p => p.nombre === promo.nombre)) {
        promosAplicadas.push(promo);
      }
    });
    return { precioBase: totalBase, precioFinal: totalFinal, promosAplicadas };
  }, [selectedAdminServices, form.fecha, servicios, promociones]);

  function set(field) {
    return (e) => setForm(prev => ({ ...prev, [field]: e.target.value }));
  }

  async function syncCalendar(savedCita) {
    const estadosConEvento = ['confirmada', 'completada'];
    const eventIdExistente = savedCita.google_event_id ?? cita?.google_event_id ?? null;
    const tieneEvento      = Boolean(eventIdExistente);

    const duracion_total = servicios
      .filter(s => selectedAdminServices.includes(s.nombre))
      .reduce((sum, s) => sum + (s.duracion || 60), 0) || 60;

    if (estadosConEvento.includes(savedCita.estado)) {
      setCalSync('syncing');
      const action = tieneEvento ? 'update' : 'create';
      const { data, error: fnError } = await gcalSync({ action, cita: { ...savedCita, duracion_total }, eventId: eventIdExistente ?? undefined });
      if (fnError || data?.error) {
        console.warn('[GCal] No se pudo sincronizar:', fnError ?? data?.error);
        setCalSync('error');
        return;
      }
      if (data?.eventId) await vincularEventoCalendario(savedCita.id, data.eventId);
      setCalSync('ok');
    } else if (tieneEvento) {
      await gcalSync({ action: 'delete', eventId: eventIdExistente });
      await vincularEventoCalendario(savedCita.id, null);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (!form.nombre.trim())  { setError('El nombre es requerido.'); return; }
    if (!form.fecha)           { setError('La fecha es requerida.'); return; }
    if (selectedAdminServices.length === 0) { setError('Selecciona al menos un servicio.'); return; }
    if (form.precio_cobrado === '' || form.precio_cobrado == null) { setError('El precio cobrado es requerido.'); return; }
    if (parseFloat(form.precio_cobrado) < 0) { setError('El precio cobrado no puede ser negativo.'); return; }

    setLoading(true);

    const campos = {
      nombre:         form.nombre.trim(),
      servicio:       selectedAdminServices.join(' + '),
      fecha:          form.fecha,
      hora:           form.hora,
      estado:         form.estado,
      notas:          form.notas     || null,
      precio_cobrado: form.precio_cobrado !== '' ? parseFloat(form.precio_cobrado) : null,
      email:          form.email     || null,
      telefono:       form.telefono  || null,
    };

    const { data: saved, error: dbError } = isEdit
      ? await updateCita(cita.id, campos)
      : await crearCitaAdmin(campos);

    if (dbError) {
      setError('Error al guardar: ' + dbError.message);
      setLoading(false);
      return;
    }

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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

          {/* Servicios — multi-select chips */}
          <div>
            <label className={labelClass}>Servicio *</label>
            {servicios.length === 0 ? (
              <p className="font-poppins text-xs text-gray-400 dark:text-gray-500">Cargando servicios…</p>
            ) : (
              <div className="flex flex-wrap gap-2" role="group" aria-label="Seleccionar servicios">
                {servicios.map((svc) => {
                  const selected = selectedAdminServices.includes(svc.nombre);
                  return (
                    <button
                      key={svc.id}
                      type="button"
                      onClick={() => toggleAdminService(svc.nombre)}
                      aria-pressed={selected}
                      className={`px-3 py-2 rounded-xl text-xs font-poppins font-medium transition-all duration-200 active:scale-[0.97] focus:outline-none focus:ring-2 focus:ring-pink-300 border text-left
                        ${selected
                          ? 'bg-pink-400 text-white border-pink-400'
                          : 'bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-600 hover:border-pink-400 hover:text-pink-500'
                        }`}
                    >
                      <span className="block leading-tight">{svc.nombre}</span>
                      {svc.precio != null && (
                        <span className={`block text-[10px] mt-0.5 ${selected ? 'text-white/75' : 'text-gray-400 dark:text-gray-500'}`}>
                          ${svc.precio} MXN
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

          {/* Precio cobrado */}
          <div>
            <label className={labelClass}>Precio cobrado (MXN) *</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 font-poppins text-sm text-gray-400 dark:text-gray-500">$</span>
              <input type="number" min="0" step="0.01" required
                value={form.precio_cobrado} onChange={set('precio_cobrado')}
                placeholder="0.00"
                className={`${inputClass} pl-7`} />
            </div>
            {precioHint && (
              precioHint.promosAplicadas.length > 0 ? (
                <div className="flex items-start gap-1.5 mt-1.5">
                  <Tag size={11} className="text-pink-400 mt-0.5 shrink-0" />
                  <p className="font-poppins text-xs text-gray-400 dark:text-gray-500 leading-relaxed">
                    Precio regular: <span className="line-through">${precioHint.precioBase}</span>
                    {' · '}
                    <span className="text-pink-500 font-medium">
                      Con promo "{precioHint.promosAplicadas.map(p => p.nombre).join(', ')}": ${precioHint.precioFinal}
                    </span>
                  </p>
                </div>
              ) : (
                <p className="font-poppins text-xs text-gray-400 dark:text-gray-500 mt-1.5">
                  Precio estimado: <span className="font-medium text-gray-500 dark:text-gray-400">${precioHint.precioBase} MXN</span>
                </p>
              )
            )}
          </div>

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
