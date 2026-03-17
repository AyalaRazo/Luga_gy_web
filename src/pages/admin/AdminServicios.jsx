import React, { useCallback, useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, RefreshCw, ToggleLeft, ToggleRight, AlertCircle, ImageOff, Eraser } from 'lucide-react';
import { getServiciosAdmin, updateServicio, deleteServicio, cleanupOrphanImages } from '../../lib/supabase';
import { getStorageUrl } from '../../lib/storage';
import ServicioModal from '../../components/Admin/ServicioModal';

const CAT_COLORS = {
  Pedicure: 'bg-rose-100 text-rose-700',
  'Uñas':   'bg-pink-100 text-pink-700',
  Pestañas: 'bg-purple-100 text-purple-700',
  Cejas:    'bg-amber-100 text-amber-700',
  General:  'bg-gray-100 text-gray-600',
};

function ConfirmDialog({ nombre, onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-sm p-6">
        <div className="flex items-start gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-red-50 dark:bg-red-900/30 flex items-center justify-center shrink-0">
            <AlertCircle size={20} className="text-red-500" />
          </div>
          <div>
            <h3 className="font-poppins text-sm font-semibold text-gray-800 dark:text-gray-100">¿Eliminar servicio?</h3>
            <p className="font-poppins text-sm text-gray-500 dark:text-gray-400 mt-1">
              Se eliminará <strong>{nombre}</strong>. Las citas existentes no se verán afectadas.
            </p>
          </div>
        </div>
        <div className="flex gap-3">
          <button onClick={onCancel} className="flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 font-poppins text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all cursor-pointer">Cancelar</button>
          <button onClick={onConfirm} className="flex-1 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white font-poppins text-sm font-semibold transition-all cursor-pointer">Eliminar</button>
        </div>
      </div>
    </div>
  );
}

export default function AdminServicios() {
  const [servicios,   setServicios]   = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [cleaning,    setCleaning]    = useState(false);
  const [modal,       setModal]       = useState(null);
  const [confirm,     setConfirm]     = useState(null);
  const [toast,       setToast]       = useState('');
  const [catFilter,   setCatFilter]   = useState('Todos');

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  const load = useCallback(async () => {
    setLoading(true);
    const { data } = await getServiciosAdmin();
    setServicios(data ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  async function handleToggle(s) {
    await updateServicio(s.id, { activo: !s.activo });
    showToast(s.activo ? `${s.nombre} desactivado.` : `${s.nombre} activado.`);
    load();
  }

  async function handleCleanup() {
    setCleaning(true);
    const { deleted, errors } = await cleanupOrphanImages();
    setCleaning(false);
    if (errors.length) { showToast('Error al limpiar imágenes.'); return; }
    showToast(deleted.length ? `${deleted.length} imagen${deleted.length > 1 ? 'es eliminadas' : ' eliminada'} del Storage.` : 'No hay imágenes huérfanas.');
  }

  async function handleDelete(id, nombre) {
    setConfirm(null);
    const { error } = await deleteServicio(id);
    if (error) { showToast('Error al eliminar.'); return; }
    showToast(`${nombre} eliminado.`);
    load();
  }

  const categorias = ['Todos', ...new Set(servicios.map(s => s.categoria))];
  const filtered   = catFilter === 'Todos' ? servicios : servicios.filter(s => s.categoria === catFilter);
  const activos    = servicios.filter(s => s.activo).length;

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
        <ServicioModal
          servicio={modal.servicio ?? null}
          totalServicios={servicios.length}
          onClose={() => setModal(null)}
          onSaved={() => { setModal(null); load(); showToast(modal.servicio ? 'Servicio actualizado.' : 'Servicio creado.'); }}
        />
      )}

      {/* Header */}
      <div className="flex items-start justify-between mb-6 gap-4 flex-wrap">
        <div>
          <h1 className="font-poppins text-2xl font-bold text-gray-800 dark:text-gray-100">Servicios</h1>
          <p className="font-poppins text-sm text-gray-400 dark:text-gray-500 mt-0.5">
            {activos} activos · {servicios.length} total
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={load} disabled={loading}
            className="flex items-center gap-2 px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-600 font-poppins text-sm text-gray-500 dark:text-gray-400 hover:text-pink-500 hover:border-pink-200 hover:bg-pink-50 dark:hover:bg-pink-900/20 transition-all cursor-pointer">
            <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
          </button>
          <button onClick={handleCleanup} disabled={cleaning}
            title="Eliminar imágenes huérfanas del Storage (archivos sin servicio asociado)"
            className="flex items-center gap-2 px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-600 font-poppins text-sm text-gray-500 dark:text-gray-400 hover:text-amber-500 hover:border-amber-200 hover:bg-amber-50 dark:hover:bg-amber-900/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer">
            <Eraser size={15} className={cleaning ? 'animate-pulse' : ''} />
          </button>
          <button onClick={() => setModal({})}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-pink-500 hover:bg-pink-600 text-white font-poppins text-sm font-semibold transition-all cursor-pointer shadow-pink-sm">
            <Plus size={16} /> Nuevo servicio
          </button>
        </div>
      </div>

      {/* Category filter */}
      <div className="flex flex-wrap gap-2 mb-6">
        {categorias.map(cat => (
          <button key={cat} onClick={() => setCatFilter(cat)}
            className={`px-4 py-1.5 rounded-full font-poppins text-sm font-medium transition-all cursor-pointer border ${
              catFilter === cat
                ? 'bg-pink-500 text-white border-pink-500 shadow-pink-sm'
                : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-600 hover:border-pink-300 hover:text-pink-500 hover:bg-pink-50 dark:hover:bg-gray-700'
            }`}>
            {cat}
          </button>
        ))}
      </div>

      {/* Grid */}
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-9 h-9 border-3 border-pink-100 border-t-pink-500 rounded-full animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
          {filtered.map(s => (
            <div key={s.id}
              className={`bg-white dark:bg-gray-800 rounded-2xl border shadow-sm hover:shadow-md transition-all overflow-hidden group ${s.activo ? 'border-gray-100 dark:border-gray-700' : 'border-gray-100 dark:border-gray-700 opacity-60'}`}>

              {/* Card header */}
              <div className={`${!s.activo ? 'grayscale' : ''}`}>
                {/* Image */}
                <div className="w-full h-36 overflow-hidden rounded-t-2xl bg-pink-50 flex items-center justify-center relative">
                  {s.imagen_url ? (
                    <img src={getStorageUrl(s.imagen_url)} alt={s.nombre} className="w-full h-full object-cover" loading="lazy" decoding="async" width={400} height={144} />
                  ) : (
                    <div className="flex flex-col items-center gap-1.5 text-pink-200">
                      <ImageOff size={28} />
                      <span className="font-poppins text-[10px] text-pink-300">Sin imagen</span>
                    </div>
                  )}
                  {/* Category badge over image */}
                  <span className={`absolute top-2 left-2 px-2 py-0.5 rounded-full font-poppins text-[10px] font-semibold shadow-sm ${CAT_COLORS[s.categoria] ?? CAT_COLORS.General}`}>
                    {s.categoria}
                  </span>
                </div>

              <div className="px-5 pt-4 pb-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-poppins text-sm font-semibold text-gray-800 dark:text-gray-100 leading-tight">{s.nombre}</h3>
                  </div>

                  {/* Active toggle */}
                  <button onClick={() => handleToggle(s)}
                    className={`shrink-0 transition-colors cursor-pointer ${s.activo ? 'text-green-500 hover:text-green-700' : 'text-gray-300 hover:text-gray-500'}`}
                    title={s.activo ? 'Desactivar' : 'Activar'}>
                    {s.activo ? <ToggleRight size={28} /> : <ToggleLeft size={28} />}
                  </button>
                </div>

                {s.descripcion && (
                  <p className="font-poppins text-xs text-gray-500 dark:text-gray-400 leading-relaxed line-clamp-2 mb-4">
                    {s.descripcion}
                  </p>
                )}

                {/* Price + Duration */}
                <div className="flex items-center gap-3">
                  <div className="flex-1 bg-pink-50 dark:bg-pink-900/30 rounded-xl px-3 py-2 text-center">
                    <p className="font-poppins text-lg font-bold text-pink-600 dark:text-pink-400 leading-tight">
                      ${Number(s.precio).toLocaleString('es-MX')}
                    </p>
                    <p className="font-poppins text-[10px] text-pink-400 uppercase tracking-wide">precio</p>
                  </div>
                  <div className="flex-1 bg-gray-50 dark:bg-gray-700 rounded-xl px-3 py-2 text-center">
                    <p className="font-poppins text-lg font-bold text-gray-700 dark:text-gray-200 leading-tight">{s.duracion}</p>
                    <p className="font-poppins text-[10px] text-gray-400 dark:text-gray-500 uppercase tracking-wide">minutos</p>
                  </div>
                </div>
              </div>
              </div>{/* end grayscale wrapper */}

              {/* Actions */}
              <div className="border-t border-gray-50 dark:border-gray-700 px-5 py-3 flex items-center justify-between bg-gray-50/50 dark:bg-gray-700/30">
                <span className={`font-poppins text-xs font-medium ${s.activo ? 'text-green-600' : 'text-gray-400 dark:text-gray-500'}`}>
                  {s.activo ? 'Visible en la web' : 'Oculto en la web'}
                </span>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => setModal({ servicio: s })}
                    className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-pink-500 hover:bg-pink-50 transition-all cursor-pointer"
                    title="Editar">
                    <Pencil size={14} />
                  </button>
                  <button onClick={() => setConfirm({ id: s.id, nombre: s.nombre })}
                    className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all cursor-pointer"
                    title="Eliminar">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}

          {/* Add new card */}
          <button onClick={() => setModal({})}
            className="border-2 border-dashed border-pink-200 dark:border-pink-800/50 rounded-2xl p-8 flex flex-col items-center justify-center gap-3 hover:border-pink-400 hover:bg-pink-50/40 dark:hover:bg-pink-900/20 transition-all cursor-pointer group min-h-[200px]">
            <div className="w-12 h-12 rounded-2xl bg-pink-100 dark:bg-pink-900/40 group-hover:bg-pink-200 dark:group-hover:bg-pink-900/60 flex items-center justify-center transition-all">
              <Plus size={22} className="text-pink-500" />
            </div>
            <p className="font-poppins text-sm font-medium text-pink-500">Agregar servicio</p>
          </button>
        </div>
      )}
    </div>
  );
}
