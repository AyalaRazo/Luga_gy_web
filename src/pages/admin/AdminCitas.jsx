import React, { useCallback, useEffect, useState } from 'react';
import {
  Plus, Search, Filter, Pencil, Trash2, RefreshCw,
  CalendarDays, ChevronDown, AlertCircle, Calendar, Check, X, Mail, Phone, CheckCircle2,
} from 'lucide-react';
import { getCitasAdmin, deleteCita, updateCita, gcalSync, resolverCancelacion, sendConfirmedEmail } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const AUTH_ERRS = ['jwt', 'not authenticated', 'pgrst301', '401', 'invalid claim'];
function isAuthErr(e) { return AUTH_ERRS.some(k => String(e?.message ?? e?.code ?? '').toLowerCase().includes(k)); }
import CitaStatusBadge from '../../components/Admin/CitaStatusBadge';
import CitaModal from '../../components/Admin/CitaModal';

const ESTADOS_FILTER = ['todos', 'pendiente', 'por_confirmar', 'confirmada', 'completada', 'cancelada', 'solicitud_cancelacion'];

const ESTADO_LABELS = {
  todos:                 'Todos los estados',
  pendiente:             'Pendiente',
  por_confirmar:         'Por confirmar',
  confirmada:            'Confirmada',
  completada:            'Completada',
  cancelada:             'Cancelada',
  solicitud_cancelacion: 'Solicitud cancelación',
};

function PagoDialog({ cita, onConfirm, onCancel }) {
  const [pagado, setPagado] = useState(true);
  const [monto,  setMonto]  = useState(cita.precio_cobrado != null ? String(cita.precio_cobrado) : '');

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
        <div className="flex items-start gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center shrink-0">
            <CheckCircle2 size={20} className="text-green-500" />
          </div>
          <div>
            <h3 className="font-poppins text-sm font-semibold text-gray-800">Completar cita</h3>
            <p className="font-poppins text-xs text-gray-500 mt-0.5">
              {cita.nombre} · {cita.servicio}
            </p>
          </div>
        </div>

        <p className="font-poppins text-sm text-gray-600 mb-4">¿Se realizó el pago por el servicio?</p>

        {/* Toggle pagado / no pagado */}
        <div className="grid grid-cols-2 gap-2 mb-4">
          <button
            onClick={() => setPagado(true)}
            className={`py-2.5 rounded-xl font-poppins text-sm font-medium transition-all cursor-pointer border ${
              pagado
                ? 'bg-green-500 border-green-500 text-white shadow-sm'
                : 'border-gray-200 text-gray-500 hover:border-green-300 hover:text-green-600'
            }`}
          >
            Sí, se pagó
          </button>
          <button
            onClick={() => setPagado(false)}
            className={`py-2.5 rounded-xl font-poppins text-sm font-medium transition-all cursor-pointer border ${
              !pagado
                ? 'bg-gray-700 border-gray-700 text-white shadow-sm'
                : 'border-gray-200 text-gray-500 hover:border-gray-400 hover:text-gray-700'
            }`}
          >
            No se pagó
          </button>
        </div>

        {/* Monto */}
        {pagado && (
          <div className="mb-4">
            <label className="block font-poppins text-xs font-medium text-gray-600 mb-1.5">
              Monto cobrado (MXN)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 font-poppins text-sm text-gray-400">$</span>
              <input
                type="number"
                min="0"
                step="0.01"
                autoFocus
                value={monto}
                onChange={e => setMonto(e.target.value)}
                placeholder="0.00"
                className="w-full pl-7 pr-3 py-2.5 font-poppins text-sm bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-300 focus:border-green-400 transition-all"
              />
            </div>
          </div>
        )}

        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-2.5 rounded-xl border border-gray-200 font-poppins text-sm text-gray-600 hover:bg-gray-50 transition-all cursor-pointer"
          >
            Cancelar
          </button>
          <button
            onClick={() => onConfirm({ pagado, monto: pagado && monto !== '' ? parseFloat(monto) : null })}
            className="flex-1 py-2.5 rounded-xl bg-green-500 hover:bg-green-600 text-white font-poppins text-sm font-semibold transition-all cursor-pointer"
          >
            Guardar
          </button>
        </div>
      </div>
    </div>
  );
}

function ConfirmDialog({ message, onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
        <div className="flex items-start gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center shrink-0">
            <AlertCircle size={20} className="text-red-500" />
          </div>
          <div>
            <h3 className="font-poppins text-sm font-semibold text-gray-800">¿Confirmar eliminación?</h3>
            <p className="font-poppins text-sm text-gray-500 mt-1">{message}</p>
          </div>
        </div>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-2.5 rounded-xl border border-gray-200 font-poppins text-sm text-gray-600 hover:bg-gray-50 transition-all cursor-pointer"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white font-poppins text-sm font-semibold transition-all cursor-pointer"
          >
            Eliminar
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AdminCitas() {
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const [citas,      setCitas]      = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [search,     setSearch]     = useState('');
  const [estado,     setEstado]     = useState('todos');
  const [fecha,      setFecha]      = useState('');
  const [modal,      setModal]      = useState(null);   // null | { cita?: object }
  const [confirm,    setConfirm]    = useState(null);   // null | { id, nombre }
  const [toast,      setToast]      = useState('');
  const [pagoDialog, setPagoDialog] = useState(null);     // null | { id, cita } — diálogo de pago al completar

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  const load = useCallback(async () => {
    setLoading(true);
    const filtros = {};
    if (estado !== 'todos') filtros.estado = estado;
    if (fecha)              filtros.fecha  = fecha;
    const { data, error } = await getCitasAdmin(filtros);
    if (isAuthErr(error)) {
      await signOut();
      navigate('/admin/login', { replace: true, state: { error: 'Sesión expirada.' } });
      return;
    }
    setCitas(data ?? []);
    setLoading(false);
  }, [estado, fecha, signOut, navigate]);

  useEffect(() => { load(); }, [load]);

  const filtered = citas.filter(c =>
    search === '' ||
    c.nombre.toLowerCase().includes(search.toLowerCase()) ||
    c.servicio.toLowerCase().includes(search.toLowerCase())
  );

  async function handleDelete(id, nombre) {
    setConfirm(null);
    // Find cita to get google_event_id before deleting
    const cita = citas.find(c => c.id === id);
    if (cita?.google_event_id) {
      await gcalSync({ action: 'delete', eventId: cita.google_event_id });
    }
    const { error } = await deleteCita(id);
    if (error) { showToast('Error al eliminar la cita.'); return; }
    showToast(`Cita de ${nombre} eliminada.`);
    load();
  }

  async function handleChangeEstado(id, nuevoEstado) {
    // Interceptar "completada" para preguntar por el pago
    if (nuevoEstado === 'completada') {
      const cita = citas.find(c => c.id === id);
      setPagoDialog({ id, cita });
      return;
    }
    await updateCita(id, { estado: nuevoEstado });
    // Auto-enviar correo de confirmación cuando el admin aprueba
    if (nuevoEstado === 'confirmada') {
      const cita = citas.find(c => c.id === id);
      if (cita?.email && !cita.confirmation_sent_at) {
        const { error } = await sendConfirmedEmail({
          email:    cita.email,
          name:     cita.nombre,
          servicio: cita.servicio,
          fecha:    cita.fecha,
          hora:     cita.hora?.slice(0, 5),
        });
        if (!error) {
          await updateCita(id, { confirmation_sent_at: new Date().toISOString() });
          showToast(`Cita confirmada — correo enviado a ${cita.email}`);
        } else {
          showToast('Cita confirmada, pero no se pudo enviar el correo.');
        }
      }
    }
    load();
  }

  async function handleResolver(id, accion) {
    const { error } = await resolverCancelacion(id, accion);
    if (error) { showToast('Error al procesar la cancelación.'); return; }
    showToast(accion === 'cancelada' ? 'Cancelación aceptada.' : 'Cancelación rechazada.');
    load();
  }

  async function handleConfirmarPago({ pagado, monto }) {
    const { id } = pagoDialog;
    setPagoDialog(null);
    await updateCita(id, {
      estado:          'completada',
      precio_cobrado:  monto ?? null,
    });
    showToast(pagado && monto != null ? `Cita completada — $${monto} registrados.` : 'Cita completada sin ingreso registrado.');
    load();
  }

  async function handleSendConfirmation(cita) {
    if (!cita.email || cita.confirmation_sent_at) return;
    const { error } = await sendConfirmedEmail({
      email:    cita.email,
      name:     cita.nombre,
      servicio: cita.servicio,
      fecha:    cita.fecha,
      hora:     cita.hora?.slice(0, 5),
    });
    if (error) { showToast('Error al enviar el correo.'); return; }
    await updateCita(cita.id, { confirmation_sent_at: new Date().toISOString() });
    showToast(`Confirmación enviada a ${cita.email}`);
    load();
  }

  function formatFecha(fechaStr) {
    if (!fechaStr) return '—';
    const [y, m, d] = fechaStr.split('-');
    return `${d}/${m}/${y}`;
  }

  return (
    <div className="p-6 lg:p-8 overflow-y-auto flex-1">
      {/* Toast */}
      {toast && (
        <div className="fixed top-4 right-4 z-[70] bg-gray-900 text-white font-poppins text-sm px-4 py-3 rounded-xl shadow-lg animate-fade-in-up">
          {toast}
        </div>
      )}

      {/* Pago dialog */}
      {pagoDialog && (
        <PagoDialog
          cita={pagoDialog.cita}
          onConfirm={handleConfirmarPago}
          onCancel={() => setPagoDialog(null)}
        />
      )}

      {/* Confirm dialog */}
      {confirm && (
        <ConfirmDialog
          message={`Se eliminará la cita de ${confirm.nombre}. Esta acción no se puede deshacer.`}
          onConfirm={() => handleDelete(confirm.id, confirm.nombre)}
          onCancel={() => setConfirm(null)}
        />
      )}

      {/* Modal */}
      {modal !== null && (
        <CitaModal
          cita={modal.cita ?? null}
          onClose={() => setModal(null)}
          onSaved={() => { setModal(null); load(); showToast(modal.cita ? 'Cita actualizada.' : 'Cita creada.'); }}
        />
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">
        <div>
          <h1 className="font-poppins text-2xl font-bold text-gray-800">Citas</h1>
          <p className="font-poppins text-sm text-gray-400 mt-0.5">
            {loading ? 'Cargando…' : `${filtered.length} resultado${filtered.length !== 1 ? 's' : ''}`}
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={load}
            disabled={loading}
            className="flex items-center gap-2 px-3 py-2 rounded-xl border border-gray-200 font-poppins text-sm text-gray-500 hover:text-pink-500 hover:border-pink-200 hover:bg-pink-50 transition-all cursor-pointer"
          >
            <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
          </button>
          <button
            onClick={() => setModal({})}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-pink-500 hover:bg-pink-600 text-white font-poppins text-sm font-semibold transition-all cursor-pointer shadow-pink-sm"
          >
            <Plus size={16} />
            Nueva cita
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-5 flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Buscar por nombre o servicio…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 font-poppins text-sm bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-200 focus:border-pink-300 transition-all"
          />
        </div>

        {/* Estado filter */}
        <div className="relative">
          <Filter size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          <select
            value={estado}
            onChange={e => setEstado(e.target.value)}
            className="pl-8 pr-8 py-2 font-poppins text-sm bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-200 appearance-none cursor-pointer"
          >
            {ESTADOS_FILTER.map(e => (
              <option key={e} value={e}>{ESTADO_LABELS[e]}</option>
            ))}
          </select>
          <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
        </div>

        {/* Fecha filter */}
        <div className="relative">
          <Calendar size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          <input
            type="date"
            value={fecha}
            onChange={e => setFecha(e.target.value)}
            className="pl-8 pr-3 py-2 font-poppins text-sm bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-200 cursor-pointer"
          />
        </div>

        {(fecha || estado !== 'todos' || search) && (
          <button
            onClick={() => { setFecha(''); setEstado('todos'); setSearch(''); }}
            className="px-3 py-2 rounded-xl font-poppins text-xs text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all cursor-pointer border border-transparent hover:border-red-100"
          >
            Limpiar
          </button>
        )}
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-20 flex justify-center">
            <div className="w-9 h-9 border-3 border-pink-100 border-t-pink-500 rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-20 flex flex-col items-center gap-3">
            <CalendarDays size={40} className="text-pink-200" />
            <p className="font-poppins text-sm text-gray-400">No se encontraron citas</p>
            <button
              onClick={() => setModal({})}
              className="mt-1 flex items-center gap-1.5 px-4 py-2 rounded-xl bg-pink-50 text-pink-600 font-poppins text-sm hover:bg-pink-100 transition-all cursor-pointer"
            >
              <Plus size={15} /> Crear la primera cita
            </button>
          </div>
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-50 bg-gray-50/60">
                    {['Clienta', 'Servicio', 'Fecha', 'Hora', 'Estado', 'Acciones'].map(h => (
                      <th key={h} className="px-5 py-3 text-left font-poppins text-xs font-semibold text-gray-400 uppercase tracking-wider">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filtered.map(c => (
                    <tr key={c.id} className={`hover:bg-pink-50/30 transition-colors group ${c.estado === 'solicitud_cancelacion' ? 'bg-amber-50/40' : ''}`}>
                      <td className="px-5 py-3.5">
                        <p className="font-poppins text-sm font-medium text-gray-800">{c.nombre}</p>
                        {c.email && (
                          <p className="flex items-center gap-1 font-poppins text-xs text-gray-400 truncate max-w-[220px]" title={c.email}>
                            <Mail size={10} className="shrink-0" />{c.email}
                          </p>
                        )}
                        {c.telefono && (
                          <p className="flex items-center gap-1 font-poppins text-xs text-gray-400">
                            <Phone size={10} className="shrink-0" />{c.telefono}
                          </p>
                        )}
                        {c.cancel_reason && (
                          <p className="font-poppins text-xs text-amber-600 truncate max-w-[200px]" title={c.cancel_reason}>
                            Motivo: {c.cancel_reason}
                          </p>
                        )}
                        {!c.cancel_reason && c.notas && <p className="font-poppins text-xs text-gray-400 truncate max-w-[200px]">{c.notas}</p>}
                      </td>
                      <td className="px-5 py-3.5 font-poppins text-sm text-gray-600">{c.servicio}</td>
                      <td className="px-5 py-3.5 font-poppins text-sm text-gray-600">{formatFecha(c.fecha)}</td>
                      <td className="px-5 py-3.5 font-poppins text-sm font-semibold text-pink-600">{c.hora?.slice(0, 5)}</td>
                      <td className="px-5 py-3.5">
                        {c.estado === 'solicitud_cancelacion' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-100 text-amber-700 font-poppins text-xs font-semibold">
                            Solicitud cancelación
                          </span>
                        ) : (
                          <>
                            <select
                              value={c.estado}
                              onChange={e => handleChangeEstado(c.id, e.target.value)}
                              className="font-poppins text-xs bg-transparent border-0 cursor-pointer focus:outline-none focus:ring-0 p-0"
                              title="Cambiar estado"
                            >
                              {['pendiente','por_confirmar','confirmada','completada','cancelada'].map(e => (
                                <option key={e} value={e}>{ESTADO_LABELS[e]}</option>
                              ))}
                            </select>
                            <CitaStatusBadge estado={c.estado} />
                          </>
                        )}
                      </td>
                      <td className="px-5 py-3.5">
                        {c.estado === 'solicitud_cancelacion' ? (
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleResolver(c.id, 'cancelada')}
                              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 font-poppins text-xs font-medium transition-all cursor-pointer"
                              title="Aceptar cancelación"
                            >
                              <Check size={12} /> Aceptar
                            </button>
                            <button
                              onClick={() => handleResolver(c.id, 'confirmada')}
                              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-green-50 text-green-600 hover:bg-green-100 font-poppins text-xs font-medium transition-all cursor-pointer"
                              title="Rechazar cancelación"
                            >
                              <X size={12} /> Rechazar
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            {c.email && c.estado === 'confirmada' && (
                              <button
                                onClick={() => handleSendConfirmation(c)}
                                disabled={!!c.confirmation_sent_at}
                                className={`w-8 h-8 flex items-center justify-center rounded-lg transition-all ${
                                  c.confirmation_sent_at
                                    ? 'text-green-500 bg-green-50 cursor-not-allowed'
                                    : 'text-gray-400 hover:text-green-600 hover:bg-green-50 cursor-pointer'
                                }`}
                                title={c.confirmation_sent_at
                                  ? `Confirmación enviada el ${new Date(c.confirmation_sent_at).toLocaleDateString('es-MX', { day:'numeric', month:'short', year:'numeric', hour:'2-digit', minute:'2-digit' })}`
                                  : `Enviar confirmación a ${c.email}`}
                              >
                                <Mail size={14} />
                              </button>
                            )}
                            <button
                              onClick={() => setModal({ cita: c })}
                              className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-pink-500 hover:bg-pink-50 transition-all cursor-pointer"
                              title="Editar"
                            >
                              <Pencil size={14} />
                            </button>
                            <button
                              onClick={() => setConfirm({ id: c.id, nombre: c.nombre })}
                              className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all cursor-pointer"
                              title="Eliminar"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="md:hidden divide-y divide-gray-50">
              {filtered.map(c => (
                <div key={c.id} className="p-4">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div>
                      <p className="font-poppins text-sm font-semibold text-gray-800">{c.nombre}</p>
                      <p className="font-poppins text-xs text-gray-500">{c.servicio}</p>
                      {c.email && (
                        <p className="flex items-center gap-1 font-poppins text-xs text-gray-400 mt-0.5">
                          <Mail size={10} />{c.email}
                        </p>
                      )}
                      {c.telefono && (
                        <p className="flex items-center gap-1 font-poppins text-xs text-gray-400">
                          <Phone size={10} />{c.telefono}
                        </p>
                      )}
                    </div>
                    <CitaStatusBadge estado={c.estado} />
                  </div>
                  <div className="flex items-center gap-4 mb-3">
                    <span className="font-poppins text-xs text-gray-500">{formatFecha(c.fecha)}</span>
                    <span className="font-poppins text-xs font-semibold text-pink-600">{c.hora?.slice(0, 5)}</span>
                  </div>
                  {c.notas && <p className="font-poppins text-xs text-gray-400 mb-3">{c.notas}</p>}
                  <div className="flex gap-2 flex-wrap">
                    {c.email && c.estado === 'confirmada' && (
                      <button
                        onClick={() => handleSendConfirmation(c)}
                        disabled={!!c.confirmation_sent_at}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border font-poppins text-xs transition-all ${
                          c.confirmation_sent_at
                            ? 'border-green-200 bg-green-50 text-green-600 cursor-not-allowed'
                            : 'border-gray-200 text-gray-600 hover:text-green-600 hover:border-green-200 cursor-pointer'
                        }`}
                        title={c.confirmation_sent_at ? 'Confirmación ya enviada' : 'Reenviar confirmación'}
                      >
                        <Mail size={12} /> {c.confirmation_sent_at ? 'Enviado' : 'Reenviar'}
                      </button>
                    )}
                    <button
                      onClick={() => setModal({ cita: c })}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 font-poppins text-xs text-gray-600 hover:text-pink-500 hover:border-pink-200 transition-all cursor-pointer"
                    >
                      <Pencil size={12} /> Editar
                    </button>
                    <button
                      onClick={() => setConfirm({ id: c.id, nombre: c.nombre })}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 font-poppins text-xs text-gray-600 hover:text-red-500 hover:border-red-200 transition-all cursor-pointer"
                    >
                      <Trash2 size={12} /> Eliminar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
