import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, Plus, RefreshCw, CalendarDays, X, Pencil, Mail, Phone, Clock, Tag, FileText, DollarSign, Users, ChevronRight as Arrow, Loader } from 'lucide-react';
import { getCitasRango, sendConfirmedEmail, updateCita, gcalSync, vincularEventoCalendario } from '../../lib/supabase';
import CitaModal from '../../components/Admin/CitaModal';

// ─── Constants ───────────────────────────────────────────────────────────────
const HOUR_START  = 8;
const HOUR_END    = 20;
const PX_PER_HOUR = 64;

const DAYS_ES   = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
const MONTHS_ES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio',
                   'Agosto','Septiembre','Octubre','Noviembre','Diciembre'];

const DURACIONES = {
  'Pedicure Spa': 60, 'Manicure Gel': 45, 'Uñas Acrílicas': 90,
  'Extensiones de Pestañas': 120, 'Lifting de Pestañas': 60,
  'Diseño de Cejas': 30, 'Laminado de Cejas': 45,
};

const STATUS_STYLE = {
  pendiente:             'bg-amber-50  border-l-4 border-amber-400  text-amber-900',
  por_confirmar:         'bg-blue-50   border-l-4 border-blue-400   text-blue-900',
  confirmada:            'bg-green-50  border-l-4 border-green-500  text-green-900',
  completada:            'bg-purple-50 border-l-4 border-purple-400 text-purple-900',
  cancelada:             'bg-gray-50   border-l-4 border-gray-300   text-gray-500',
  solicitud_cancelacion: 'bg-red-50    border-l-4 border-red-400    text-red-900',
};

const STATUS_BADGE = {
  pendiente:             'bg-amber-100  text-amber-700',
  por_confirmar:         'bg-blue-100   text-blue-700',
  confirmada:            'bg-green-100  text-green-700',
  completada:            'bg-purple-100 text-purple-700',
  cancelada:             'bg-gray-100   text-gray-500',
  solicitud_cancelacion: 'bg-red-100    text-red-700',
};

const STATUS_LABEL = {
  pendiente:             'Pendiente',
  por_confirmar:         'Por confirmar',
  confirmada:            'Confirmada',
  completada:            'Completada',
  cancelada:             'Cancelada',
  solicitud_cancelacion: 'Sol. cancelación',
};

// ─── Helpers ─────────────────────────────────────────────────────────────────
function getMonday(date) {
  const d = new Date(date);
  const day = d.getDay();
  d.setDate(d.getDate() - (day === 0 ? 6 : day - 1));
  d.setHours(0, 0, 0, 0);
  return d;
}
function addDays(date, n) { const d = new Date(date); d.setDate(d.getDate() + n); return d; }
function toDateStr(d) {
  // Use LOCAL date components — toISOString() is always UTC and would
  // return the wrong date after 5 PM in Tijuana (UTC-7/UTC-8).
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}
function timeToMinutes(t) { const [h, m] = (t ?? '00:00').slice(0, 5).split(':').map(Number); return h * 60 + m; }
function minutesToPx(min) { return (min / 60) * PX_PER_HOUR; }

/**
 * Agrupa las citas por hora de inicio.
 * Devuelve: [{ hora, citas, topPx, heightPx }]
 */
function groupBySlot(dayCitas) {
  const map = {};
  for (const c of dayCitas) {
    const key = c.hora.slice(0, 5);
    (map[key] ??= []).push(c);
  }
  return Object.entries(map).map(([hora, citas]) => {
    const maxDur   = Math.max(...citas.map(c => DURACIONES[c.servicio] ?? 60));
    const startMin = timeToMinutes(hora);
    return {
      hora,
      citas,
      topPx:    minutesToPx(startMin - HOUR_START * 60),
      heightPx: Math.max(minutesToPx(maxDur), 28),
    };
  });
}

// ─── Overlay wrapper (closes on outside click / Escape) ──────────────────────
function Overlay({ children, onClose }) {
  const ref = useRef();
  useEffect(() => {
    const onKey  = (e) => { if (e.key === 'Escape') onClose(); };
    const onDown = (e) => { if (ref.current && !ref.current.contains(e.target)) onClose(); };
    window.addEventListener('keydown', onKey);
    setTimeout(() => document.addEventListener('mousedown', onDown), 0);
    return () => { window.removeEventListener('keydown', onKey); document.removeEventListener('mousedown', onDown); };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm">
      <div ref={ref} className="animate-fade-in-up">
        {children}
      </div>
    </div>
  );
}

// ─── Panel: lista de clientes en un slot ─────────────────────────────────────
function SlotListPanel({ hora, fecha, citas, onSelectCita, onClose }) {
  const d = new Date(fecha + 'T12:00:00');
  const fechaLabel = d.toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long' });

  return (
    <Overlay onClose={onClose}>
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-700">
          <div>
            <div className="flex items-center gap-2">
              <Users size={15} className="text-pink-500" />
              <span className="font-poppins text-base font-bold text-gray-800 dark:text-gray-100">{hora}</span>
              <span className="px-2 py-0.5 rounded-full bg-pink-100 dark:bg-pink-900/40 text-pink-600 dark:text-pink-400 font-poppins text-xs font-semibold">
                {citas.length} clientas
              </span>
            </div>
            <p className="font-poppins text-xs text-gray-400 dark:text-gray-500 mt-0.5 capitalize">{fechaLabel}</p>
          </div>
          <button onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all cursor-pointer">
            <X size={15} />
          </button>
        </div>

        {/* Lista */}
        <div className="p-3 space-y-2 max-h-80 overflow-y-auto">
          {citas.map(c => (
            <button key={c.id} onClick={() => onSelectCita(c)}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border border-gray-100 dark:border-gray-700 hover:border-pink-200 dark:hover:border-pink-800 hover:bg-pink-50/50 dark:hover:bg-pink-900/20 transition-all cursor-pointer text-left group">
              {/* Color dot */}
              <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                c.estado === 'confirmada' ? 'bg-green-500' :
                c.estado === 'completada' ? 'bg-purple-400' :
                c.estado === 'cancelada'  ? 'bg-gray-300'  : 'bg-amber-400'
              }`} />
              <div className="flex-1 min-w-0">
                <p className="font-poppins text-sm font-semibold text-gray-800 dark:text-gray-100 truncate">{c.nombre}</p>
                <p className="font-poppins text-xs text-gray-500 dark:text-gray-400 truncate">{c.servicio}</p>
              </div>
              <span className={`shrink-0 px-2 py-0.5 rounded-full font-poppins text-[10px] font-semibold ${STATUS_BADGE[c.estado] ?? STATUS_BADGE.pendiente}`}>
                {STATUS_LABEL[c.estado] ?? c.estado}
              </span>
              <Arrow size={14} className="text-gray-300 group-hover:text-pink-400 shrink-0 transition-colors" />
            </button>
          ))}
        </div>
      </div>
    </Overlay>
  );
}

// ─── Panel: detalle de una cita ───────────────────────────────────────────────
function CitaDetail({ cita, onClose, onEdit, onBack, onSendConfirmation, sendingEmail }) {
  const estado = cita.estado ?? 'pendiente';

  const showMailBtn = cita.email && (
    estado === 'por_confirmar' ||
    (estado === 'confirmada' && !cita.confirmation_sent_at)
  );
  const mailSent = cita.email && estado === 'confirmada' && cita.confirmation_sent_at;

  return (
    <Overlay onClose={onClose}>
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-start justify-between px-6 py-5 border-b border-gray-100 dark:border-gray-700 gap-3">
          <div className="flex-1 min-w-0">
            <p className="font-poppins text-base font-bold text-gray-800 dark:text-gray-100 truncate">{cita.nombre}</p>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <span className="font-poppins text-xs text-gray-500 dark:text-gray-400">{cita.hora?.slice(0, 5)}</span>
              <span className={`px-2 py-0.5 rounded-full font-poppins text-[10px] font-semibold ${STATUS_BADGE[estado]}`}>
                {STATUS_LABEL[estado] ?? estado}
              </span>
            </div>
          </div>
          <button onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all cursor-pointer shrink-0">
            <X size={15} />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 grid grid-cols-2 gap-x-8 gap-y-4">
          <DetailRow icon={Tag}       label="Servicio" value={cita.servicio} />
          <DetailRow icon={Clock}     label="Hora"     value={cita.hora?.slice(0, 5)} />
          {cita.email    && <DetailRow icon={Mail}        label="Correo"   value={cita.email} />}
          {cita.telefono && <DetailRow icon={Phone}       label="Celular"  value={cita.telefono} />}
          {cita.precio_cobrado != null && (
            <DetailRow icon={DollarSign} label="Cobrado"
              value={`$${Number(cita.precio_cobrado).toLocaleString('es-MX')}`} />
          )}
          {cita.notas && (
            <div className="col-span-2">
              <DetailRow icon={FileText} label="Notas" value={cita.notas} multiline />
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="px-6 pb-6 flex gap-2 flex-wrap">
          {onBack && (
            <button onClick={onBack}
              className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 font-poppins text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all cursor-pointer">
              <ChevronLeft size={14} /> Volver
            </button>
          )}
          {showMailBtn && (
            <button
              onClick={() => onSendConfirmation(cita)}
              disabled={sendingEmail}
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-green-500 hover:bg-green-600 disabled:bg-green-300 text-white font-poppins text-sm font-semibold transition-all cursor-pointer"
              title={estado === 'por_confirmar' ? `Confirmar cita y enviar correo a ${cita.email}` : `Enviar confirmación a ${cita.email}`}
            >
              {sendingEmail
                ? <Loader size={14} className="animate-spin" />
                : <Mail size={14} />}
              {estado === 'por_confirmar' ? 'Confirmar y enviar correo' : 'Enviar correo'}
            </button>
          )}
          {mailSent && (
            <span className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-green-50 border border-green-200 text-green-600 font-poppins text-sm">
              <Mail size={14} /> Correo enviado
            </span>
          )}
          <button onClick={onEdit}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-pink-500 hover:bg-pink-600 text-white font-poppins text-sm font-semibold transition-all cursor-pointer shadow-pink-sm">
            <Pencil size={14} /> Editar
          </button>
        </div>
      </div>
    </Overlay>
  );
}

function DetailRow({ icon: Icon, label, value, multiline }) {
  return (
    <div className="flex items-start gap-2.5">
      <Icon size={14} className="text-pink-400 mt-0.5 shrink-0" />
      <div className="min-w-0">
        <span className="font-poppins text-[10px] text-gray-400 dark:text-gray-500 uppercase tracking-wide block">{label}</span>
        <span className={`font-poppins text-sm text-gray-700 dark:text-gray-200 ${multiline ? 'whitespace-pre-wrap' : 'truncate block'}`}>{value}</span>
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function AdminCalendar() {
  const [monday,  setMonday]  = useState(() => getMonday(new Date()));
  const [citas,   setCitas]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal,   setModal]   = useState(null);   // { cita? } | null → CitaModal
  const [slotPanel, setSlotPanel] = useState(null); // { hora, fecha, citas }
  const [detail,    setDetail]    = useState(null); // { cita, fromSlot? }
  const [toast,      setToast]      = useState('');
  const [sendingEmail, setSendingEmail] = useState(false);

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

  const byDate = {};
  citas.forEach(c => { (byDate[c.fecha] ??= []).push(c); });

  const hours = Array.from({ length: HOUR_END - HOUR_START }, (_, i) => HOUR_START + i);

  const monthLabel = (() => {
    const s = weekDays[0], e = weekDays[6];
    if (s.getMonth() === e.getMonth())
      return `${MONTHS_ES[s.getMonth()]} ${s.getFullYear()}`;
    return `${MONTHS_ES[s.getMonth()]} – ${MONTHS_ES[e.getMonth()]} ${e.getFullYear()}`;
  })();

  async function handleSendConfirmation(cita) {
    if (!cita.email) return;
    setSendingEmail(true);
    const { error } = await sendConfirmedEmail({
      email:    cita.email,
      name:     cita.nombre,
      servicio: cita.servicio,
      fecha:    cita.fecha,
      hora:     cita.hora?.slice(0, 5),
    });
    if (error) {
      showToast('Error al enviar el correo.');
      setSendingEmail(false);
      return;
    }

    const updates = { confirmation_sent_at: new Date().toISOString() };
    if (cita.estado === 'por_confirmar') {
      updates.estado = 'confirmada';
      const action  = cita.google_event_id ? 'update' : 'create';
      const eventId = cita.google_event_id ?? undefined;
      const { data: gcalData } = await gcalSync({ action, cita: { ...cita, estado: 'confirmada' }, eventId });
      if (gcalData?.eventId) await vincularEventoCalendario(cita.id, gcalData.eventId);
    }
    await updateCita(cita.id, updates);

    // Update the detail panel with new cita state
    const updatedCita = { ...cita, ...updates };
    setDetail(d => d ? { ...d, cita: updatedCita } : d);

    showToast(`Confirmación enviada a ${cita.email}`);
    setSendingEmail(false);
    load();
  }

  function handleSlotClick(dateStr, hour) {
    const h = String(hour).padStart(2, '0');
    setModal({ defaultFecha: dateStr, defaultHora: `${h}:00` });
  }

  function handleBlockClick(e, slot, dateStr) {
    e.stopPropagation();
    if (slot.citas.length === 1) {
      setDetail({ cita: slot.citas[0], fromSlot: null });
    } else {
      setSlotPanel({ hora: slot.hora, fecha: dateStr, citas: slot.citas });
    }
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Toast */}
      {toast && (
        <div className="fixed top-4 right-4 z-50 bg-gray-900 text-white font-poppins text-sm px-4 py-3 rounded-xl shadow-lg animate-fade-in-up">
          {toast}
        </div>
      )}

      {/* Slot list panel (múltiples clientes) */}
      {slotPanel && !detail && (
        <SlotListPanel
          hora={slotPanel.hora}
          fecha={slotPanel.fecha}
          citas={slotPanel.citas}
          onClose={() => setSlotPanel(null)}
          onSelectCita={(c) => setDetail({ cita: c, fromSlot: slotPanel })}
        />
      )}

      {/* Detail de una cita */}
      {detail && (
        <CitaDetail
          cita={detail.cita}
          onClose={() => setDetail(null)}
          onBack={detail.fromSlot ? () => { setDetail(null); setSlotPanel(detail.fromSlot); } : null}
          onEdit={() => { setDetail(null); setSlotPanel(null); setModal({ cita: detail.cita }); }}
          onSendConfirmation={handleSendConfirmation}
          sendingEmail={sendingEmail}
        />
      )}

      {/* Crear / editar cita */}
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
      <div className="shrink-0 bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700 px-4 py-3 flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-1">
          <button onClick={() => setMonday(d => addDays(d, -7))}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-pink-50 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 hover:text-pink-500 transition-all cursor-pointer">
            <ChevronLeft size={18} />
          </button>
          <button onClick={() => setMonday(getMonday(new Date()))}
            className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-600 font-poppins text-xs font-medium text-gray-600 dark:text-gray-300 hover:border-pink-300 hover:text-pink-600 hover:bg-pink-50 dark:hover:bg-gray-700 transition-all cursor-pointer">
            Hoy
          </button>
          <button onClick={() => setMonday(d => addDays(d, 7))}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-pink-50 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 hover:text-pink-500 transition-all cursor-pointer">
            <ChevronRight size={18} />
          </button>
        </div>

        <h2 className="font-poppins text-base font-semibold text-gray-800 dark:text-gray-100 flex-1">{monthLabel}</h2>

        <div className="flex items-center gap-2">
          <button onClick={load} disabled={loading}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-600 font-poppins text-xs text-gray-500 dark:text-gray-400 hover:text-pink-500 hover:border-pink-200 hover:bg-pink-50 dark:hover:bg-gray-700 transition-all cursor-pointer">
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

          {/* Day headers */}
          <div className="flex sticky top-0 z-20 bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700 shadow-sm">
            <div className="w-14 shrink-0" />
            {weekDays.map((day, i) => {
              const ds      = toDateStr(day);
              const isToday = ds === todayStr;
              const count   = byDate[ds]?.length ?? 0;
              return (
                <div key={i} className={`flex-1 min-w-0 px-1 py-2.5 text-center border-l border-gray-100 dark:border-gray-700 ${isToday ? 'bg-pink-50 dark:bg-pink-900/20' : ''}`}>
                  <p className={`font-poppins text-[11px] font-semibold uppercase tracking-wider ${isToday ? 'text-pink-500' : 'text-gray-400 dark:text-gray-500'}`}>
                    {DAYS_ES[i]}
                  </p>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center mx-auto mt-1 ${isToday ? 'bg-pink-500' : ''}`}>
                    <span className={`font-poppins text-sm font-bold ${isToday ? 'text-white' : 'text-gray-700 dark:text-gray-200'}`}>
                      {day.getDate()}
                    </span>
                  </div>
                  {count > 0 && (
                    <span className={`mt-1 inline-block px-1.5 py-0.5 rounded-full font-poppins text-[10px] font-semibold ${isToday ? 'bg-pink-100 text-pink-600' : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400'}`}>
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
                <div key={h} className="flex items-start justify-end pr-2"
                  style={{ height: PX_PER_HOUR }}>
                  <span className="font-poppins text-[11px] text-gray-400 dark:text-gray-500 translate-y-[-7px]">
                    {String(h).padStart(2, '0')}:00
                  </span>
                </div>
              ))}
            </div>

            {/* Day columns */}
            {weekDays.map((day, di) => {
              const ds       = toDateStr(day);
              const isToday  = ds === todayStr;
              const dayCitas = byDate[ds] ?? [];
              const slots    = groupBySlot(dayCitas);

              return (
                <div key={di}
                  className={`flex-1 min-w-0 relative border-l border-gray-100 dark:border-gray-700 ${isToday ? 'bg-pink-50/30 dark:bg-pink-900/10' : ''}`}
                  style={{ height: PX_PER_HOUR * hours.length }}>

                  {/* Hour slot backgrounds */}
                  {hours.map(h => (
                    <div key={h}
                      onClick={() => handleSlotClick(ds, h)}
                      className="absolute w-full border-t border-gray-100 dark:border-gray-700 hover:bg-pink-50/50 dark:hover:bg-pink-900/10 transition-colors cursor-pointer"
                      style={{ top: (h - HOUR_START) * PX_PER_HOUR, height: PX_PER_HOUR }}
                    />
                  ))}

                  {/* Half-hour lines */}
                  {hours.map(h => (
                    <div key={`${h}-half`}
                      className="absolute w-full border-t border-dashed border-gray-100 dark:border-gray-700/50 pointer-events-none"
                      style={{ top: (h - HOUR_START) * PX_PER_HOUR + PX_PER_HOUR / 2 }}
                    />
                  ))}

                  {/* Current time indicator */}
                  {isToday && (() => {
                    const now    = new Date();
                    const topPx  = minutesToPx(now.getHours() * 60 + now.getMinutes() - HOUR_START * 60);
                    if (topPx < 0 || topPx > PX_PER_HOUR * hours.length) return null;
                    return (
                      <div className="absolute left-0 right-0 z-10 pointer-events-none flex items-center"
                        style={{ top: topPx }}>
                        <div className="w-2 h-2 rounded-full bg-pink-500 -ml-1 shrink-0" />
                        <div className="flex-1 border-t-2 border-pink-400" />
                      </div>
                    );
                  })()}

                  {/* Slot blocks */}
                  {slots.map(slot => {
                    const single = slot.citas.length === 1;
                    const c      = slot.citas[0];
                    const style  = single ? (STATUS_STYLE[c.estado] ?? STATUS_STYLE.pendiente) : '';

                    return (
                      <div key={slot.hora}
                        onClick={e => handleBlockClick(e, slot, ds)}
                        title={single ? `${c.nombre} · ${c.servicio}` : `${slot.citas.length} clientas · ${slot.hora}`}
                        className={`absolute left-0.5 right-0.5 rounded-md px-2 py-1 shadow-sm hover:shadow-md hover:brightness-95 transition-all cursor-pointer overflow-hidden z-10 ${
                          single
                            ? style
                            : 'bg-pink-500 text-white border-l-4 border-pink-700'
                        }`}
                        style={{ top: slot.topPx + 1, height: slot.heightPx - 2 }}
                      >
                        {single ? (
                          <>
                            <p className="font-poppins text-[11px] font-bold leading-tight truncate">
                              {c.hora.slice(0, 5)} · {c.nombre}
                            </p>
                            {slot.heightPx > 36 && (
                              <p className="font-poppins text-[10px] leading-tight truncate opacity-80">
                                {c.servicio}
                              </p>
                            )}
                          </>
                        ) : (
                          <>
                            <div className="flex items-center gap-1">
                              <Users size={10} className="shrink-0 opacity-90" />
                              <p className="font-poppins text-[11px] font-bold leading-tight truncate">
                                {slot.hora} · {slot.citas.length} clientas
                              </p>
                            </div>
                            {slot.heightPx > 36 && (
                              <p className="font-poppins text-[10px] leading-tight truncate opacity-80">
                                {slot.citas.map(x => x.nombre.split(' ')[0]).join(', ')}
                              </p>
                            )}
                          </>
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
              <p className="font-poppins text-sm text-gray-400 dark:text-gray-500">Sin citas esta semana</p>
            </div>
          )}
        </div>
      </div>

      {/* Legend */}
      <div className="shrink-0 bg-white dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700 px-4 py-2 flex items-center gap-4 flex-wrap">
        {[
          { label: 'Pendiente',  cls: 'bg-amber-400'  },
          { label: 'Confirmada', cls: 'bg-green-500'  },
          { label: 'Completada', cls: 'bg-purple-400' },
          { label: 'Múltiples',  cls: 'bg-pink-500'   },
        ].map(({ label, cls }) => (
          <div key={label} className="flex items-center gap-1.5">
            <div className={`w-2.5 h-2.5 rounded-sm ${cls}`} />
            <span className="font-poppins text-xs text-gray-500 dark:text-gray-400">{label}</span>
          </div>
        ))}
        <span className="font-poppins text-xs text-gray-400 dark:text-gray-500 ml-auto">
          Clic en cita para ver detalle · Clic en horario vacío para crear
        </span>
      </div>
    </div>
  );
}
