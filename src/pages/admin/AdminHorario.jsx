import React, { useEffect, useState } from 'react';
import { Save, RefreshCw, Plus, Trash2, AlertCircle, CheckCircle2, Clock, HelpCircle } from 'lucide-react';
import { getHorario, updateHorario, getDiasBloqueados, addDiaBloqueado, deleteDiaBloqueado } from '../../lib/supabase';

const DIAS_SEMANA = [
  { key: 'lunes',     label: 'Lunes'     },
  { key: 'martes',    label: 'Martes'    },
  { key: 'miercoles', label: 'Miércoles' },
  { key: 'jueves',    label: 'Jueves'    },
  { key: 'viernes',   label: 'Viernes'   },
  { key: 'sabado',    label: 'Sábado'    },
  { key: 'domingo',   label: 'Domingo'   },
];

const HORAS = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0') + ':00');

const DEFAULT_HORARIO = {
  lunes:     { activo: true,  inicio: '09:00', fin: '18:00' },
  martes:    { activo: true,  inicio: '09:00', fin: '18:00' },
  miercoles: { activo: true,  inicio: '09:00', fin: '18:00' },
  jueves:    { activo: true,  inicio: '09:00', fin: '18:00' },
  viernes:   { activo: true,  inicio: '09:00', fin: '18:00' },
  sabado:    { activo: true,  inicio: '10:00', fin: '15:00' },
  domingo:   { activo: false, inicio: '09:00', fin: '18:00' },
};

function formatFecha(fechaStr) {
  const d = new Date(fechaStr + 'T12:00:00');
  return d.toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
}

export default function AdminHorario() {
  const [horario,         setHorario]         = useState(DEFAULT_HORARIO);
  const [diasBloqueados,  setDiasBloqueados]   = useState([]);
  const [loading,         setLoading]          = useState(true);
  const [saving,          setSaving]           = useState(false);
  const [toast,           setToast]            = useState({ msg: '', type: 'ok' });
  const [nuevaFecha,      setNuevaFecha]       = useState('');
  const [nuevoMotivo,     setNuevoMotivo]      = useState('');
  const [addingDay,       setAddingDay]        = useState(false);

  const todayISO = (() => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`; })();

  function showToast(msg, type = 'ok') {
    setToast({ msg, type });
    setTimeout(() => setToast({ msg: '', type: 'ok' }), 3000);
  }

  async function load() {
    setLoading(true);
    const [{ data: h }, { data: dias }] = await Promise.all([getHorario(), getDiasBloqueados()]);
    if (h) setHorario(h);
    setDiasBloqueados(dias ?? []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  function toggleDia(key) {
    setHorario(h => ({ ...h, [key]: { ...h[key], activo: !h[key].activo } }));
  }

  function setHora(key, field, val) {
    setHorario(h => ({ ...h, [key]: { ...h[key], [field]: val } }));
  }

  async function handleSaveHorario() {
    setSaving(true);
    const { error } = await updateHorario(horario);
    setSaving(false);
    if (error) showToast('Error al guardar el horario.', 'error');
    else showToast('Horario guardado correctamente.');
  }

  async function handleAddDia() {
    if (!nuevaFecha) return;
    setAddingDay(true);
    const { error } = await addDiaBloqueado(nuevaFecha, nuevoMotivo);
    setAddingDay(false);
    if (error) {
      showToast(error.message?.includes('unique') ? 'Esa fecha ya está bloqueada.' : 'Error al bloquear el día.', 'error');
      return;
    }
    setNuevaFecha('');
    setNuevoMotivo('');
    load();
    showToast('Día bloqueado correctamente.');
  }

  async function handleDeleteDia(id, fecha) {
    const { error } = await deleteDiaBloqueado(id);
    if (error) { showToast('Error al eliminar.', 'error'); return; }
    showToast(`${formatFecha(fecha)} habilitado nuevamente.`);
    load();
  }

  const inp = "px-3 py-2 font-poppins text-sm bg-white dark:bg-gray-700 dark:text-gray-100 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-300 focus:border-pink-400 transition-all";

  return (
    <div className="p-6 lg:p-8 overflow-y-auto flex-1">
      {/* Toast */}
      {toast.msg && (
        <div className={`fixed top-4 right-4 z-50 flex items-center gap-2 font-poppins text-sm px-4 py-3 rounded-xl shadow-lg ${
          toast.type === 'error' ? 'bg-red-500 text-white' : 'bg-gray-900 text-white'
        }`}>
          {toast.type === 'error'
            ? <AlertCircle size={15} />
            : <CheckCircle2 size={15} className="text-green-400" />}
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div className="flex items-start justify-between mb-6 gap-4 flex-wrap">
        <div>
          <h1 className="font-poppins text-2xl font-bold text-gray-800 dark:text-gray-100">Horario</h1>
          <p className="font-poppins text-sm text-gray-400 dark:text-gray-500 mt-0.5">Configura los días y horarios de atención</p>
        </div>
        <button onClick={load} disabled={loading}
          className="flex items-center gap-2 px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-600 font-poppins text-sm text-gray-500 dark:text-gray-400 hover:text-pink-500 hover:border-pink-200 hover:bg-pink-50 dark:hover:bg-pink-900/20 transition-all cursor-pointer">
          <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-9 h-9 border-3 border-pink-100 border-t-pink-500 rounded-full animate-spin" />
        </div>
      ) : (
        <div className="space-y-6">

          {/* Horario semanal */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
            <div className="flex items-center gap-2 px-6 py-4 border-b border-gray-50 dark:border-gray-700">
              <Clock size={17} className="text-pink-500" />
              <h2 className="font-poppins text-sm font-semibold text-gray-700 dark:text-gray-200">Horario semanal</h2>
              <div className="relative group ml-1">
                <HelpCircle size={15} className="text-gray-300 hover:text-gray-400 cursor-help transition-colors" />
                <div className="absolute left-1/2 -translate-x-1/2 top-full mt-2 w-64 bg-gray-800 text-white font-poppins text-xs rounded-xl px-3 py-2.5 leading-relaxed opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-150 z-50 shadow-lg">
                  <div className="absolute left-1/2 -translate-x-1/2 bottom-full w-0 h-0 border-l-4 border-r-4 border-b-4 border-l-transparent border-r-transparent border-b-gray-800" />
                  Define los días y horas en que se aceptan reservas cada semana. Los días desactivados aparecerán como no disponibles para los clientes.<br /><br /><strong>Capacidad:</strong> número de citas que se pueden reservar al mismo tiempo en un horario. Si hay 2 trabajadoras disponibles ese día, ponla en 2.
                </div>
              </div>
            </div>
            <div className="p-6 space-y-3">
              {DIAS_SEMANA.map(({ key, label }) => {
                const dia = horario[key] ?? { activo: false, inicio: '09:00', fin: '18:00' };
                return (
                  <div key={key} className={`flex items-center gap-4 p-4 rounded-xl border transition-all ${
                    dia.activo ? 'border-pink-100 dark:border-pink-900/50 bg-pink-50/30 dark:bg-pink-900/10' : 'border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-700/30'
                  }`}>
                    {/* Toggle */}
                    <button
                      onClick={() => toggleDia(key)}
                      className={`shrink-0 w-11 h-6 rounded-full relative transition-colors cursor-pointer ${dia.activo ? 'bg-pink-500' : 'bg-gray-300'}`}
                    >
                      <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all ${dia.activo ? 'left-6' : 'left-1'}`} />
                    </button>

                    {/* Día */}
                    <span className={`font-poppins text-sm font-medium w-24 ${dia.activo ? 'text-gray-700 dark:text-gray-200' : 'text-gray-400 dark:text-gray-500'}`}>
                      {label}
                    </span>

                    {/* Horas */}
                    {dia.activo ? (
                      <div className="flex items-center gap-2 flex-1 flex-wrap">
                        <select value={dia.inicio} onChange={e => setHora(key, 'inicio', e.target.value)} className={`${inp} cursor-pointer`}>
                          {HORAS.map(h => <option key={h} value={h}>{h}</option>)}
                        </select>
                        <span className="font-poppins text-sm text-gray-400 dark:text-gray-500">a</span>
                        <select value={dia.fin} onChange={e => setHora(key, 'fin', e.target.value)} className={`${inp} cursor-pointer`}>
                          {HORAS.map(h => <option key={h} value={h}>{h}</option>)}
                        </select>
                        <div className="flex items-center gap-1.5">
                          <span className="font-poppins text-xs text-gray-400 dark:text-gray-500 whitespace-nowrap">Capacidad:</span>
                          <input
                            type="number"
                            min="1"
                            max="10"
                            value={dia.capacidad ?? 1}
                            onChange={e => {
                              const n = e.target.valueAsNumber;
                              if (!isNaN(n)) setHorario(h => ({ ...h, [key]: { ...h[key], capacidad: Math.max(1, n) } }));
                            }}
                            onBlur={e => {
                              if (!e.target.value || Number(e.target.value) < 1)
                                setHorario(h => ({ ...h, [key]: { ...h[key], capacidad: 1 } }));
                            }}
                            className={`${inp} w-16 text-center`}
                          />
                        </div>
                      </div>
                    ) : (
                      <span className="font-poppins text-sm text-gray-400 dark:text-gray-500 italic">Cerrado</span>
                    )}
                  </div>
                );
              })}
            </div>
            <div className="px-6 pb-6">
              <button
                onClick={handleSaveHorario}
                disabled={saving}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-pink-500 hover:bg-pink-600 disabled:bg-pink-300 text-white font-poppins text-sm font-semibold transition-all cursor-pointer shadow-pink-sm"
              >
                {saving
                  ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  : <Save size={15} />}
                Guardar horario
              </button>
            </div>
          </div>

          {/* Días bloqueados */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
            <div className="flex items-center gap-2 px-6 py-4 border-b border-gray-50 dark:border-gray-700">
              <AlertCircle size={17} className="text-amber-500" />
              <h2 className="font-poppins text-sm font-semibold text-gray-700 dark:text-gray-200">Días bloqueados</h2>
              <span className="ml-1 px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 font-poppins text-xs font-semibold">
                {diasBloqueados.length}
              </span>
              <div className="relative group ml-1">
                <HelpCircle size={15} className="text-gray-300 hover:text-gray-400 cursor-help transition-colors" />
                <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-64 bg-gray-800 text-white font-poppins text-xs rounded-xl px-3 py-2.5 leading-relaxed opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-150 z-50 shadow-lg">
                  Bloquea días específicos en los que no habrá atención, sin importar el horario semanal. Los clientes no podrán reservar en esas fechas.
                  <div className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-gray-800" />
                </div>
              </div>
            </div>

            <div className="p-6 space-y-4">
              {/* Agregar día */}
              <div className="flex gap-3 flex-wrap">
                <input
                  type="date"
                  value={nuevaFecha}
                  min={todayISO}
                  onChange={e => setNuevaFecha(e.target.value)}
                  className={`${inp} cursor-pointer`}
                />
                <input
                  type="text"
                  value={nuevoMotivo}
                  onChange={e => setNuevoMotivo(e.target.value)}
                  placeholder="Motivo (opcional)"
                  className={`${inp} flex-1 min-w-40`}
                />
                <button
                  onClick={handleAddDia}
                  disabled={!nuevaFecha || addingDay}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 disabled:bg-amber-300 text-white font-poppins text-sm font-semibold transition-all cursor-pointer"
                >
                  {addingDay
                    ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    : <Plus size={15} />}
                  Bloquear día
                </button>
              </div>

              {/* Lista */}
              {diasBloqueados.length === 0 ? (
                <p className="font-poppins text-sm text-gray-400 dark:text-gray-500 text-center py-6">
                  No hay días bloqueados. El horario semanal aplica todos los días.
                </p>
              ) : (
                <div className="space-y-2">
                  {diasBloqueados.map(d => (
                    <div key={d.id} className="flex items-center justify-between gap-3 p-3.5 bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800/50 rounded-xl">
                      <div>
                        <p className="font-poppins text-sm font-semibold text-gray-700 dark:text-gray-200 capitalize">{formatFecha(d.fecha)}</p>
                        {d.motivo && <p className="font-poppins text-xs text-gray-500 dark:text-gray-400 mt-0.5">{d.motivo}</p>}
                      </div>
                      <button
                        onClick={() => handleDeleteDia(d.id, d.fecha)}
                        className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all cursor-pointer shrink-0"
                        title="Eliminar bloqueo"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

        </div>
      )}
    </div>
  );
}
