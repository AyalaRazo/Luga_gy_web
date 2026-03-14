import React, { useEffect, useRef, useState } from 'react';
import { X, Save, AlertCircle, Upload, ImageOff } from 'lucide-react';
import { createServicio, updateServicio, uploadServicioImagen, deleteServicioImagen } from '../../lib/supabase';

const CATEGORIAS    = ['Pedicure', 'Uñas', 'Pestañas', 'Cejas', 'General'];
const DURACIONES_OPT = [15, 30, 45, 60, 75, 90, 105, 120, 150, 180];

const EMPTY = {
  nombre: '', descripcion: '', precio: '', duracion: 60,
  categoria: 'General', activo: true, orden: 0, imagen_url: '',
};

export default function ServicioModal({ servicio, totalServicios = 0, onClose, onSaved }) {
  const isEdit    = Boolean(servicio);
  const [form,    setForm]    = useState(isEdit ? { ...EMPTY, ...servicio, precio: String(servicio.precio) } : { ...EMPTY });
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');
  const [preview, setPreview] = useState(servicio?.imagen_url ?? null);
  const [imgFile, setImgFile] = useState(null);
  const fileRef = useRef();

  useEffect(() => {
    const h = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [onClose]);

  function set(field) {
    return (e) => setForm(p => ({ ...p, [field]: e.target.value }));
  }

  function handleImageChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImgFile(file);
    setPreview(URL.createObjectURL(file));
  }

  function handleDrop(e) {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (!file || !file.type.startsWith('image/')) return;
    setImgFile(file);
    setPreview(URL.createObjectURL(file));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    if (!form.nombre.trim())            { setError('El nombre es requerido.');       return; }
    if (isNaN(parseFloat(form.precio))) { setError('El precio debe ser un número.'); return; }

    setLoading(true);

    const campos = {
      nombre:      form.nombre.trim(),
      descripcion: form.descripcion.trim(),
      precio:      parseFloat(form.precio),
      duracion:    parseInt(form.duracion),
      categoria:   form.categoria,
      activo:      form.activo,
      orden:       parseInt(form.orden) || 0,
      imagen_url:  form.imagen_url || null,
    };

    // Save first to get an ID (needed as filename), then upload image
    const { data: saved, error: err } = isEdit
      ? await updateServicio(servicio.id, campos)
      : await createServicio(campos);

    if (err) { setError('Error al guardar: ' + err.message); setLoading(false); return; }

    // Upload new image if selected
    if (imgFile && saved?.id) {
      // Delete the previous image from storage before uploading the new one
      const oldUrl = isEdit ? servicio.imagen_url : null;
      if (oldUrl) await deleteServicioImagen(oldUrl);

      const { url, error: uploadErr } = await uploadServicioImagen(imgFile, saved.id);
      if (uploadErr) {
        setError('Servicio guardado, pero falló la subida de imagen: ' + uploadErr.message);
        setLoading(false);
        return;
      }
      await updateServicio(saved.id, { imagen_url: url });
    }

    setLoading(false);
    onSaved();
  }

  const inp = "w-full px-3 py-2.5 font-poppins text-sm bg-gray-50 dark:bg-gray-700 dark:text-gray-100 dark:placeholder-gray-500 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-300 focus:border-pink-400 transition-all";
  const lbl = "block font-poppins text-xs font-semibold text-gray-600 dark:text-gray-300 mb-1.5 uppercase tracking-wide";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-lg max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-800 z-10">
          <h2 className="font-poppins text-base font-semibold text-gray-800 dark:text-gray-100">
            {isEdit ? 'Editar servicio' : 'Nuevo servicio'}
          </h2>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 dark:text-gray-500 hover:text-gray-600 hover:bg-gray-100 transition-all cursor-pointer">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="flex items-start gap-2 bg-red-50 dark:bg-red-900/20 border border-red-200 rounded-xl px-4 py-3">
              <AlertCircle size={15} className="text-red-500 mt-0.5 shrink-0" />
              <p className="font-poppins text-sm text-red-700">{error}</p>
            </div>
          )}

          {/* Image upload */}
          <div>
            <label className={lbl}>Imagen del servicio</label>
            <div
              className="relative rounded-2xl overflow-hidden border-2 border-dashed border-pink-200 hover:border-pink-400 transition-colors cursor-pointer group"
              style={{ height: '160px' }}
              onClick={() => fileRef.current?.click()}
              onDrop={handleDrop}
              onDragOver={e => e.preventDefault()}
            >
              {preview ? (
                <>
                  <img src={preview} alt="preview" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <Upload size={18} className="text-white" />
                    <span className="font-poppins text-sm text-white font-medium">Cambiar imagen</span>
                  </div>
                </>
              ) : (
                <div className="h-full flex flex-col items-center justify-center gap-2 bg-pink-50/60 dark:bg-pink-900/20">
                  <div className="w-12 h-12 rounded-2xl bg-pink-100 flex items-center justify-center">
                    <Upload size={20} className="text-pink-400" />
                  </div>
                  <p className="font-poppins text-sm text-pink-500 font-medium">Subir imagen</p>
                  <p className="font-poppins text-xs text-gray-400 dark:text-gray-500">JPG, PNG o WEBP · máx 5 MB</p>
                </div>
              )}
            </div>
            <input
              ref={fileRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              className="hidden"
              onChange={handleImageChange}
            />
            {preview && (
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); setPreview(null); setImgFile(null); setForm(p => ({ ...p, imagen_url: '' })); }}
                className="mt-1.5 font-poppins text-xs text-gray-400 dark:text-gray-500 hover:text-red-500 transition-colors cursor-pointer"
              >
                Quitar imagen
              </button>
            )}
          </div>

          {/* Nombre */}
          <div>
            <label className={lbl}>Nombre del servicio *</label>
            <input type="text" required value={form.nombre} onChange={set('nombre')} placeholder="Ej: Pedicure Spa" className={inp} />
          </div>

          {/* Descripción */}
          <div>
            <label className={lbl}>Descripción</label>
            <textarea value={form.descripcion} onChange={set('descripcion')} rows={3}
              placeholder="Descripción breve del servicio para la página web…"
              className={`${inp} resize-none`} />
          </div>

          {/* Precio + Duración */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={lbl}>Precio (MXN) *</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 font-poppins text-sm text-gray-400 dark:text-gray-500">$</span>
                <input type="number" min="0" step="0.01" required
                  value={form.precio} onChange={set('precio')}
                  placeholder="350"
                  className={`${inp} pl-7`} />
              </div>
            </div>
            <div>
              <label className={lbl}>Duración (min)</label>
              <select value={form.duracion} onChange={set('duracion')} className={inp}>
                {DURACIONES_OPT.map(d => (
                  <option key={d} value={d}>{d} min</option>
                ))}
              </select>
            </div>
          </div>

          {/* Categoría */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={lbl}>Categoría</label>
              <select value={form.categoria} onChange={set('categoria')} className={inp}>
                {CATEGORIAS.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className={lbl}>Orden de aparición</label>
              <input type="number" min="0" value={form.orden} onChange={set('orden')} className={inp} />
              {!servicio && totalServicios > 0 && (
                <p className="font-poppins text-xs text-gray-400 dark:text-gray-500 mt-1.5">
                  Hay <strong className="text-gray-600 dark:text-gray-300">{totalServicios}</strong> servicio{totalServicios !== 1 ? 's' : ''} actualmente. Usa <strong className="text-gray-600 dark:text-gray-300">{totalServicios + 1}</strong> para agregarlo al final.
                </p>
              )}
            </div>
          </div>

          {/* Activo */}
          <div>
            <label className={lbl}>Estado</label>
            <button type="button"
              onClick={() => setForm(p => ({ ...p, activo: !p.activo }))}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-xl border-2 transition-all cursor-pointer font-poppins text-sm font-medium ${
                form.activo
                  ? 'border-green-300 bg-green-50 text-green-700'
                  : 'border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
              }`}>
              <div className={`w-9 h-5 rounded-full transition-all relative ${form.activo ? 'bg-green-500' : 'bg-gray-300'}`}>
                <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all ${form.activo ? 'left-4' : 'left-0.5'}`} />
              </div>
              {form.activo ? 'Activo' : 'Inactivo'}
            </button>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 font-poppins text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all cursor-pointer">
              Cancelar
            </button>
            <button type="submit" disabled={loading}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-pink-500 hover:bg-pink-600 disabled:bg-pink-300 text-white font-poppins text-sm font-semibold transition-all cursor-pointer shadow-pink-sm">
              {loading
                ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                : <><Save size={15} />{isEdit ? 'Guardar' : 'Crear servicio'}</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
