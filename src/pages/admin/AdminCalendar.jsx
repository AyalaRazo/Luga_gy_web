import React, { useCallback, useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, Plus, RefreshCw, CalendarDays } from 'lucide-react';
import { getCitasRango } from '../../lib/supabase';
import CitaModal from '../../components/Admin/CitaModal';

// ─── Constants ──────────────────────────────────────────────────────────────
const HOUR_START  = 8;
const HOUR_END    = 20;
const PX_PER_HOUR = 64; // pixels per hour row

const DAYS_ES   = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
const MONTHS_ES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio',
                   'Agosto','Septiembre','Octubre','Noviembre','Diciembre'];

const DURACIONES = {
  'Pedicure Spa': 60, 'Manicure Gel': 45, 'Uñas Acrílicas': 90,
  'Extensiones de Pestañas': 120, 'Lifting de Pestañas': 60,
  'Diseño de Cejas': 30, 'Laminado de Cejas': 45,
};

const STATUS_STYLE = {
  pendiente:  'bg-amber-50  border-l-4 border-amber-400  text-amber-900',
  confirmada: 'bg-green-50  border-l-4 border-green-500  text-green-900',
  completada: 'bg-purple-50 border-l-4 border-purple-400 text-purple-900',
  cancelada:  'bg-gray-50   border-l-4 border-gray-300   text-gray-500',
};

// ─── Helpers ────────────────────────────────────────────────────────────────
function getMonday(date) {
  const d   = new Date(date);
  const day = d.getDay();
  d.setDate(d.getDate() - (day === 0 ? 6 : day - 1));
  d.setHours(0, 0, 0, 0);
  return d;
}

function addDays(date, n) {
  const d = new Date(date);
  d.setDate(d.getDate() + n);
  return d;
}

function toDateStr(d) {
  return d.toISOString().slice(0, 10);
}

function timeToMinutes(t) {
  const [h, m] = (t ?? '00:00').slice(0, 5).split(':').map(Number);
  return h * 60 + m;
}

function minutesToPx(minutes) {
  return (minutes / 60) * PX_PER_HOUR;
}

// ─── Component ──────────────────────────────────────────────────────────────
export default function AdminCalendar() {
  const [monday,  setMonday]  = useState(() => getMonday(new Date()));
  const [citas,   setCitas]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal,   setModal]   = useState(null);
  const [toast,   setToast]   = useState('');

  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(monday, i));
  const todayStr = toDateStr(new Date());

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  const load = useCallback(async () => {
    setLoading(true);
    const { data } = await getCitasRango(toDateStr(weekDays[0]), toDateStr(weekDays[6]));
    setCitas(data ?? []);
    setLoading(false);
  }, [monday]); // eslint-disable-line

  useEffect(() => { load(); }, [load]);

  // Group citas by date
  const byDate = {};
  citas.forEach(c => {
    (byDate[c.fecha] ??= []).push(c);
  });

  const hours = Array.from({ length: HOUR_END - HOUR_START }, (_, i) => HOUR_START + i);

  const monthLabel = (() => {
    const s = weekDays[0], e = weekDays[6];
    if (s.getMonth() === e.getMonth())
      return `${MONTHS_ES[s.getMonth()]} ${s.getFullYear()}`;
    return `${MONTHS_ES[s.getMonth()]} – ${MONTHS_ES[e.getMonth()]} ${e.getFullYear()}`;
  })();

  function handleSlotClick(dateStr, hour) {
    const h = String(hour).padStart(2, '0');
    setModal({ defaultFecha: dateStr, defaultHora: `${h}:00` });
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Toast */}
      {toast && (
        <div className="fixed top-4 right-4 z-50 bg-gray-900 text-white font-poppins text-sm px-4 py-3 rounded-xl shadow-lg animate-fade-in-up">
          {toast}
        </div>
      )}

      {/* Modal */}
      {modal !== null && (
        <CitaModal
          cita={modal.cita ?? null}
          defaultFecha={modal.defaultFecha}
          defaultHora={modal.defaultHora}
          onClose={() => setModal(null)}
          onSaved={() => {
            setModal(null);
            load();
            showToast(modal.cita ? 'Cita actualizada.' : 'Cita creada.');
          }}
        />
      )}

      {/* ── Header ── */}
      <div className="shrink-0 bg-white border-b border-gray-100 px-4 py-3 flex items-center gap-3 flex-wrap">
        {/* Week nav */}
        <div className="flex items-center gap-1">
          <button onClick={() => setMonday(d => addDays(d, -7))}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-pink-50 text-gray-500 hover:text-pink-500 transition-all cursor-pointer">
            <ChevronLeft size={18} />
          </button>
          <button onClick={() => setMonday(getMonday(new Date()))}
            className="px-3 py-1.5 rounded-lg border border-gray-200 font-poppins text-xs font-medium text-gray-600 hover:border-pink-300 hover:text-pink-600 hover:bg-pink-50 transition-all cursor-pointer">
            Hoy
          </button>
          <button onClick={() => setMonday(d => addDays(d, 7))}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-pink-50 text-gray-500 hover:text-pink-500 transition-all cursor-pointer">
            <ChevronRight size={18} />
          </button>
        </div>

        <h2 className="font-poppins text-base font-semibold text-gray-800 flex-1">{monthLabel}</h2>

        <div className="flex items-center gap-2">
          <button onClick={load} disabled={loading}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 font-poppins text-xs text-gray-500 hover:text-pink-500 hover:border-pink-200 hover:bg-pink-50 transition-all cursor-pointer">
            <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
            Actualizar
          </button>
          <button onClick={() => setModal({})}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-pink-500 hover:bg-pink-600 text-white font-poppins text-xs font-semibold transition-all cursor-pointer shadow-pink-sm">
            <Plus size={14} /> Nueva cita
          </button>
        </div>
      </div>

      {/* ── Calendar ── */}
      <div className="flex-1 overflow-auto">
        <div className="min-w-[640px] flex flex-col">

          {/* Day headers — sticky */}
          <div className="flex sticky top-0 z-20 bg-white border-b border-gray-100 shadow-sm">
            {/* Time gutter */}
            <div className="w-14 shrink-0" />
            {weekDays.map((day, i) => {
              const ds      = toDateStr(day);
              const isToday = ds === todayStr;
              const count   = byDate[ds]?.length ?? 0;
              return (
                <div key={i} className={`flex-1 min-w-0 px-1 py-2.5 text-center border-l border-gray-100 ${isToday ? 'bg-pink-50' : ''}`}>
                  <p className={`font-poppins text-[11px] font-semibold uppercase tracking-wider ${isToday ? 'text-pink-500' : 'text-gray-400'}`}>
                    {DAYS_ES[i]}
                  </p>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center mx-auto mt-1 ${isToday ? 'bg-pink-500' : ''}`}>
                    <span className={`font-poppins text-sm font-bold ${isToday ? 'text-white' : 'text-gray-700'}`}>
                      {day.getDate()}
                    </span>
                  </div>
                  {count > 0 && (
                    <span className={`mt-1 inline-block px-1.5 py-0.5 rounded-full font-poppins text-[10px] font-semibold ${isToday ? 'bg-pink-100 text-pink-600' : 'bg-gray-100 text-gray-500'}`}>
                      {count}
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          {/* Time grid */}
          <div className="flex relative">

            {/* Hour labels */}
            <div className="w-14 shrink-0 select-none">
              {hours.map(h => (
                <div key={h} className="flex items-start justify-end pr-2 pt-0"
                  style={{ height: PX_PER_HOUR }}>
                  <span className="font-poppins text-[11px] text-gray-400 translate-y-[-7px]">
                    {String(h).padStart(2, '0')}:00
                  </span>
                </div>
              ))}
            </div>

            {/* Day columns */}
            {weekDays.map((day, di) => {
              const ds        = toDateStr(day);
              const isToday   = ds === todayStr;
              const dayCitas  = byDate[ds] ?? [];

              return (
                <div key={di} className={`flex-1 min-w-0 relative border-l border-gray-100 ${isToday ? 'bg-pink-50/30' : ''}`}
                  style={{ height: PX_PER_HOUR * hours.length }}>

                  {/* Hour slot backgrounds (clickable) */}
                  {hours.map(h => (
                    <div key={h}
                      onClick={() => handleSlotClick(ds, h)}
                      className="absolute w-full border-t border-gray-100 hover:bg-pink-50/50 transition-colors cursor-pointer"
                      style={{ top: (h - HOUR_START) * PX_PER_HOUR, height: PX_PER_HOUR }}
                    />
                  ))}

                  {/* Half-hour lines */}
                  {hours.map(h => (
                    <div key={`${h}-half`}
                      className="absolute w-full border-t border-dashed border-gray-100 pointer-events-none"
                      style={{ top: (h - HOUR_START) * PX_PER_HOUR + PX_PER_HOUR / 2 }}
                    />
                  ))}

                  {/* Current time indicator */}
                  {isToday && (() => {
                    const now     = new Date();
                    const nowMins = now.getHours() * 60 + now.getMinutes();
                    const topPx   = minutesToPx(nowMins - HOUR_START * 60);
                    if (topPx < 0 || topPx > PX_PER_HOUR * hours.length) return null;
                    return (
                      <div className="absolute left-0 right-0 z-10 pointer-events-none flex items-center"
                        style={{ top: topPx }}>
                        <div className="w-2 h-2 rounded-full bg-pink-500 -ml-1 shrink-0" />
                        <div className="flex-1 border-t-2 border-pink-400" />
                      </div>
                    );
                  })()}

                  {/* Cita blocks */}
                  {dayCitas.map(c => {
                    const startMins = timeToMinutes(c.hora);
                    const dur       = DURACIONES[c.servicio] ?? 60;
                    const topPx     = minutesToPx(startMins - HOUR_START * 60);
                    const heightPx  = Math.max(minutesToPx(dur), 24);
                    const style     = STATUS_STYLE[c.estado] ?? STATUS_STYLE.pendiente;

                    return (
                      <div key={c.id}
                        onClick={e => { e.stopPropagation(); setModal({ cita: c }); }}
                        className={`absolute left-0.5 right-0.5 rounded-md px-2 py-1 shadow-sm hover:shadow-md transition-shadow cursor-pointer overflow-hidden z-10 ${style}`}
                        style={{ top: topPx + 1, height: heightPx - 2 }}
                      >
                        <p className="font-poppins text-[11px] font-bold leading-tight truncate">
                          {c.hora.slice(0, 5)} · {c.nombre}
                        </p>
                        {heightPx > 36 && (
                          <p className="font-poppins text-[10px] leading-tight truncate opacity-80">
                            {c.servicio}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>

          {/* Empty state */}
          {!loading && citas.length === 0 && (
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none" style={{ top: 120 }}>
              <CalendarDays size={40} className="text-pink-200 mb-3" />
              <p className="font-poppins text-sm text-gray-400">Sin citas esta semana</p>
            </div>
          )}
        </div>
      </div>

      {/* Legend */}
      <div className="shrink-0 bg-white border-t border-gray-100 px-4 py-2 flex items-center gap-4 flex-wrap">
        {[
          { label: 'Pendiente',  cls: 'bg-amber-400'  },
          { label: 'Confirmada', cls: 'bg-green-500'  },
          { label: 'Completada', cls: 'bg-purple-400' },
        ].map(({ label, cls }) => (
          <div key={label} className="flex items-center gap-1.5">
            <div className={`w-2.5 h-2.5 rounded-sm ${cls}`} />
            <span className="font-poppins text-xs text-gray-500">{label}</span>
          </div>
        ))}
        <span className="font-poppins text-xs text-gray-400 ml-auto">
          Clic en un horario vacío para crear cita
        </span>
      </div>
    </div>
  );
}
