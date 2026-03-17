import React, { useCallback, useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, RefreshCw, ToggleLeft, ToggleRight, AlertCircle, Tag } from 'lucide-react';
import { getPromocionesAdmin, getServiciosAdmin, updatePromocion, deletePromocion } from '../../lib/supabase';
import PromocionModal from '../../components/Admin/PromocionModal';
import { DIAS_ES } from '../../lib/promociones';

function ConfirmDialog({ nombre, onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-sm p-6">
        <div className="flex items-start gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-red-50 dark:bg-red-900/30 flex items-center justify-center shrink-0">
            <AlertCircle size={20} className="text-red-500" />
          </div>
          <div>
            <h3 className="font-poppins text-sm font-semibold text-gray-800 dark:text-gray-100">¿Eliminar promoción?</h3>
            <p className="font-poppins text-sm text-gray-500 dark:text-gray-400 mt-1">
              Se eliminará <strong>{nombre}</strong>. Esta acción no se puede deshacer.
            </p>
          </div>
        </div>
        <div className="flex gap-3">
          <button onClick={onCancel}
            className="flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 font-poppins text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all cursor-pointer">
            Cancelar
          </button>
          <button onClick={onConfirm}
            className="flex-1 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white font-poppins text-sm font-semibold transition-all cursor-pointer">
            Eliminar
          </button>
        </div>
      </div>
    </div>
  );
}

function formatFecha(f) {
  if (!f) return null;
  const [y, m, d] = f.split('-');
  return `${d}/${m}/${y}`;
}

function DescuentoBadge({ tipo, valor }) {
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-pink-50 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400 font-poppins text-xs font-bold">
      {tipo === 'porcentaje' ? `${valor}% OFF` : `$${Number(valor).toLocaleString('es-MX')} fijo`}
    </span>
  );
}

export default function AdminPromociones() {
  const [promociones, setPromociones] = useState([]);
  const [servicios,   setServicios]   = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [modal,       setModal]       = useState(null);   // null | {} | { promocion }
  const [confirm,     setConfirm]     = useState(null);
  const [toast,       setToast]       = useState('');

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  const load = useCallback(async () => {
    setLoading(true);
    const [{ data: promos }, { data: svcs }] = await Promise.all([
      getPromocionesAdmin(),
      getServiciosAdmin(),
    ]);
    setPromociones(promos ?? []);
    setServicios(svcs ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  async function handleToggle(p) {
    await updatePromocion(p.id, { activo: !p.activo });
    showToast(p.activo ? `${p.nombre} desactivada.` : `${p.nombre} activada.`);
    load();
  }

  async function handleDelete(id, nombre) {
    setConfirm(null);
    const { error } = await deletePromocion(id);
    if (error) { showToast('Error al eliminar.'); return; }
    showToast(`${nombre} eliminada.`);
    load();
  }

  const activas = promociones.filter(p => p.activo).length;

  return (
    <div className="p-6 lg:p-8 overflow-y-auto flex-1">
      {/* Toast */}
      {toast && (
        <div className="fixed top-4 right-4 z-50 bg-gray-900 text-white font-poppins text-sm px-4 py-3 rounded-xl shadow-lg">
          {toast}
        </div>
      )}

      {confirm && (
        <ConfirmDialog
          nombre={confirm.nombre}
          onConfirm={() => handleDelete(confirm.id, confirm.nombre)}
          onCancel={() => setConfirm(null)}
        />
      )}

      {modal !== null && (
        <PromocionModal
          promocion={modal.promocion ?? null}
          servicios={servicios}
          onClose={() => setModal(null)}
          onSaved={() => {
            setModal(null);
            load();
            showToast(modal.promocion ? 'Promoción actualizada.' : 'Promoción creada.');
          }}
        />
      )}

      {/* Header */}
      <div className="flex items-start justify-between mb-6 gap-4 flex-wrap">
        <div>
          <h1 className="font-poppins text-2xl font-bold text-gray-800 dark:text-gray-100">Promociones</h1>
          <p className="font-poppins text-sm text-gray-400 dark:text-gray-500 mt-0.5">
            {activas} activas · {promociones.length} total
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={load} disabled={loading}
            className="flex items-center gap-2 px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-600 font-poppins text-sm text-gray-500 dark:text-gray-400 hover:text-pink-500 hover:border-pink-200 hover:bg-pink-50 dark:hover:bg-pink-900/20 transition-all cursor-pointer">
            <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
          </button>
          <button onClick={() => setModal({})}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-pink-500 hover:bg-pink-600 text-white font-poppins text-sm font-semibold transition-all cursor-pointer shadow-pink-sm">
            <Plus size={16} /> Nueva promoción
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-9 h-9 border-3 border-pink-100 border-t-pink-500 rounded-full animate-spin" />
        </div>
      ) : promociones.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <div className="w-16 h-16 rounded-2xl bg-pink-50 dark:bg-pink-900/20 flex items-center justify-center">
            <Tag size={28} className="text-pink-300" />
          </div>
          <p className="font-poppins text-sm text-gray-400 dark:text-gray-500">No hay promociones todavía.</p>
          <button onClick={() => setModal({})}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-pink-500 hover:bg-pink-600 text-white font-poppins text-sm font-semibold transition-all cursor-pointer">
            <Plus size={15} /> Crear primera promoción
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {promociones.map(p => {
            const svcsLabel = p.servicio_ids === null
              ? 'Todos los servicios'
              : p.servicio_ids.length === 0
                ? 'Sin servicios'
                : p.servicio_ids.length === 1
                  ? (servicios.find(s => s.id === p.servicio_ids[0])?.nombre ?? '1 servicio')
                  : `${p.servicio_ids.length} servicios`;

            const fi = formatFecha(p.fecha_inicio);
            const ff = formatFecha(p.fecha_fin);
            const fechaLabel = fi || ff
              ? `${fi ?? '∞'} – ${ff ?? '∞'}`
              : 'Permanente';

            return (
              <div key={p.id}
                className={`bg-white dark:bg-gray-800 rounded-2xl border shadow-sm hover:shadow-md transition-all overflow-hidden group ${
                  p.activo ? 'border-gray-100 dark:border-gray-700' : 'border-gray-100 dark:border-gray-700 opacity-60'
                }`}>
                <div className="px-5 py-4 flex items-center gap-4 flex-wrap">

                  {/* Icon */}
                  <div className="w-10 h-10 rounded-xl bg-pink-50 dark:bg-pink-900/30 flex items-center justify-center shrink-0">
                    <Tag size={18} className="text-pink-400" />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-poppins text-sm font-semibold text-gray-800 dark:text-gray-100">{p.nombre}</h3>
                      <DescuentoBadge tipo={p.tipo_descuento} valor={p.valor_descuento} />
                    </div>
                    {p.descripcion && (
                      <p className="font-poppins text-xs text-gray-500 dark:text-gray-400 mt-0.5 truncate">{p.descripcion}</p>
                    )}
                    <div className="flex items-center gap-3 mt-2 flex-wrap">
                      {/* Días */}
                      <div className="flex gap-1">
                        {DIAS_ES.map((dia, dow) => (
                          <span key={dow}
                            className={`font-poppins text-[10px] font-semibold px-1.5 py-0.5 rounded ${
                              p.dias_semana.includes(dow)
                                ? 'bg-pink-100 dark:bg-pink-900/40 text-pink-600 dark:text-pink-400'
                                : 'bg-gray-50 dark:bg-gray-700 text-gray-300 dark:text-gray-600'
                            }`}>
                            {dia}
                          </span>
                        ))}
                      </div>
                      {/* Fechas */}
                      <span className="font-poppins text-[11px] text-gray-400 dark:text-gray-500">{fechaLabel}</span>
                      {/* Servicios */}
                      <span className="font-poppins text-[11px] text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700 px-2 py-0.5 rounded-full">
                        {svcsLabel}
                      </span>
                    </div>
                  </div>

                  {/* Toggle + actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    <button onClick={() => handleToggle(p)}
                      className={`transition-colors cursor-pointer ${p.activo ? 'text-green-500 hover:text-green-700' : 'text-gray-300 hover:text-gray-500'}`}
                      title={p.activo ? 'Desactivar' : 'Activar'}>
                      {p.activo ? <ToggleRight size={28} /> : <ToggleLeft size={28} />}
                    </button>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => setModal({ promocion: p })}
                        className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-pink-500 hover:bg-pink-50 dark:hover:bg-pink-900/20 transition-all cursor-pointer"
                        title="Editar">
                        <Pencil size={14} />
                      </button>
                      <button onClick={() => setConfirm({ id: p.id, nombre: p.nombre })}
                        className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all cursor-pointer"
                        title="Eliminar">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Add card */}
          <button onClick={() => setModal({})}
            className="w-full border-2 border-dashed border-pink-200 dark:border-pink-800/50 rounded-2xl p-6 flex items-center justify-center gap-3 hover:border-pink-400 hover:bg-pink-50/40 dark:hover:bg-pink-900/20 transition-all cursor-pointer group">
            <div className="w-10 h-10 rounded-xl bg-pink-100 dark:bg-pink-900/40 group-hover:bg-pink-200 dark:group-hover:bg-pink-900/60 flex items-center justify-center transition-all">
              <Plus size={18} className="text-pink-500" />
            </div>
            <p className="font-poppins text-sm font-medium text-pink-500">Agregar promoción</p>
          </button>
        </div>
      )}
    </div>
  );
}
