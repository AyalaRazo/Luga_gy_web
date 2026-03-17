import React, { useState } from 'react';
import { X, AlertCircle, ToggleLeft, ToggleRight, Tag } from 'lucide-react';
import { createPromocion, updatePromocion } from '../../lib/supabase';
import { DIAS_ES } from '../../lib/promociones';

const EMPTY = {
  nombre: '', descripcion: '',
  servicio_ids: null,          // null = todos
  dias_semana: [],
  fecha_inicio: '', fecha_fin: '',
  tipo_descuento: 'porcentaje',
  valor_descuento: '',
  activo: true,
};

const inp = 'w-full px-3 py-2.5 font-poppins text-sm bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 border border-pink-100 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-200 focus:border-pink-300 transition-all';
const lbl = 'block font-poppins text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1.5';

export default function PromocionModal({ promocion, servicios = [], onClose, onSaved }) {
  const isEdit = !!promocion;

  const [form, setForm] = useState(() => {
    if (!promocion) return { ...EMPTY };
    return {
      nombre:          promocion.nombre ?? '',
      descripcion:     promocion.descripcion ?? '',
      servicio_ids:    promocion.servicio_ids ?? null,
      dias_semana:     promocion.dias_semana ?? [],
      fecha_inicio:    promocion.fecha_inicio ?? '',
      fecha_fin:       promocion.fecha_fin ?? '',
      tipo_descuento:  promocion.tipo_descuento ?? 'porcentaje',
      valor_descuento: promocion.valor_descuento ?? '',
      activo:          promocion.activo ?? true,
    };
  });

  const todosServicios = form.servicio_ids === null;
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');

  function set(key, val) { setForm(f => ({ ...f, [key]: val })); }

  function toggleDia(dow) {
    set('dias_semana',
      form.dias_semana.includes(dow)
        ? form.dias_semana.filter(d => d !== dow)
        : [...form.dias_semana, dow].sort((a, b) => a - b)
    );
  }

  function toggleServicio(id) {
    const cur = form.servicio_ids ?? [];
    set('servicio_ids',
      cur.includes(id) ? cur.filter(s => s !== id) : [...cur, id]
    );
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (!form.nombre.trim())         { setError('El nombre es requerido.'); return; }
    if (!form.dias_semana.length)    { setError('Selecciona al menos un día.'); return; }
    const val = parseFloat(form.valor_descuento);
    if (isNaN(val) || val <= 0)      { setError('El valor del descuento debe ser mayor a 0.'); return; }
    if (form.tipo_descuento === 'porcentaje' && val > 100) {
      setError('El porcentaje no puede ser mayor a 100.');
      return;
    }
    if (!todosServicios && (!form.servicio_ids || form.servicio_ids.length === 0)) {
      setError('Selecciona al menos un servicio o activa "Todos los servicios".');
      return;
    }

    const payload = {
      nombre:          form.nombre.trim(),
      descripcion:     form.descripcion.trim() || null,
      servicio_ids:    todosServicios ? null : form.servicio_ids,
      dias_semana:     form.dias_semana,
      fecha_inicio:    form.fecha_inicio || null,
      fecha_fin:       form.fecha_fin    || null,
      tipo_descuento:  form.tipo_descuento,
      valor_descuento: val,
      activo:          form.activo,
    };

    setLoading(true);
    const { error: err } = isEdit
      ? await updatePromocion(promocion.id, payload)
      : await createPromocion(payload);
    setLoading(false);

    if (err) { setError(err.message ?? 'Error al guardar.'); return; }
    onSaved();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-lg max-h-[92vh] flex flex-col">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-pink-50 dark:border-gray-700 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-pink-50 dark:bg-pink-900/30 flex items-center justify-center">
              <Tag size={15} className="text-pink-500" />
            </div>
            <h2 className="font-poppins text-base font-bold text-gray-800 dark:text-gray-100">
              {isEdit ? 'Editar promoción' : 'Nueva promoción'}
            </h2>
          </div>
          <button onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all cursor-pointer">
            <X size={15} />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="overflow-y-auto flex-1 px-6 py-5 space-y-5">

          {error && (
            <div className="flex items-center gap-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl px-3 py-2.5">
              <AlertCircle size={14} className="text-red-500 shrink-0" />
              <p className="font-poppins text-xs text-red-700 dark:text-red-400">{error}</p>
            </div>
          )}

          {/* Nombre */}
          <div>
            <label className={lbl}>Nombre *</label>
            <input type="text" value={form.nombre} onChange={e => set('nombre', e.target.value)}
              placeholder="Ej: Martes de pedicure" className={inp} required />
          </div>

          {/* Descripción */}
          <div>
            <label className={lbl}>Descripción <span className="text-gray-300 dark:text-gray-600 normal-case">(opcional)</span></label>
            <textarea rows={2} value={form.descripcion} onChange={e => set('descripcion', e.target.value)}
              placeholder="Ej: Descuento especial los martes en todos los pedicures" className={`${inp} resize-none`} />
          </div>

          {/* Tipo de descuento */}
          <div>
            <label className={lbl}>Tipo de descuento *</label>
            <div className="flex gap-3">
              {[
                { val: 'porcentaje', label: '% Porcentaje' },
                { val: 'precio_fijo', label: '$ Precio fijo' },
              ].map(({ val, label }) => (
                <button key={val} type="button"
                  onClick={() => set('tipo_descuento', val)}
                  className={`flex-1 py-2.5 rounded-xl font-poppins text-sm font-medium border transition-all cursor-pointer ${
                    form.tipo_descuento === val
                      ? 'bg-pink-500 text-white border-pink-500'
                      : 'bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-600 hover:border-pink-300'
                  }`}>
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Valor */}
          <div>
            <label className={lbl}>
              {form.tipo_descuento === 'porcentaje' ? '% de descuento *' : 'Precio final (MXN) *'}
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 font-poppins text-sm text-gray-400 pointer-events-none">
                {form.tipo_descuento === 'porcentaje' ? '%' : '$'}
              </span>
              <input type="number" min="1" max={form.tipo_descuento === 'porcentaje' ? 100 : undefined}
                step="1" value={form.valor_descuento}
                onChange={e => set('valor_descuento', e.target.value)}
                placeholder={form.tipo_descuento === 'porcentaje' ? '20' : '180'}
                className={`${inp} pl-8`} required />
            </div>
          </div>

          {/* Días de la semana */}
          <div>
            <label className={lbl}>Días que aplica *</label>
            <div className="flex gap-1.5 flex-wrap">
              {DIAS_ES.map((dia, dow) => (
                <button key={dow} type="button"
                  onClick={() => toggleDia(dow)}
                  className={`px-3 py-1.5 rounded-full font-poppins text-xs font-semibold border transition-all cursor-pointer ${
                    form.dias_semana.includes(dow)
                      ? 'bg-pink-500 text-white border-pink-500'
                      : 'bg-white dark:bg-gray-700 text-gray-500 dark:text-gray-400 border-gray-200 dark:border-gray-600 hover:border-pink-300 hover:text-pink-500'
                  }`}>
                  {dia}
                </button>
              ))}
            </div>
          </div>

          {/* Fechas opcionales */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={lbl}>Fecha inicio <span className="text-gray-300 dark:text-gray-600 normal-case">(opcional)</span></label>
              <input type="date" value={form.fecha_inicio} onChange={e => set('fecha_inicio', e.target.value)}
                className={inp} />
            </div>
            <div>
              <label className={lbl}>Fecha fin <span className="text-gray-300 dark:text-gray-600 normal-case">(opcional)</span></label>
              <input type="date" value={form.fecha_fin} onChange={e => set('fecha_fin', e.target.value)}
                className={inp} />
            </div>
          </div>

          {/* Servicios */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className={`${lbl} mb-0`}>Servicios *</label>
              <button type="button" onClick={() => set('servicio_ids', todosServicios ? [] : null)}
                className="flex items-center gap-1.5 cursor-pointer">
                {todosServicios
                  ? <ToggleRight size={22} className="text-green-500" />
                  : <ToggleLeft  size={22} className="text-gray-300" />}
                <span className="font-poppins text-xs text-gray-500 dark:text-gray-400">Todos los servicios</span>
              </button>
            </div>
            {!todosServicios && (
              <div className="border border-gray-100 dark:border-gray-700 rounded-xl divide-y divide-gray-50 dark:divide-gray-700 max-h-48 overflow-y-auto">
                {servicios.map(s => (
                  <label key={s.id}
                    className="flex items-center gap-3 px-4 py-2.5 hover:bg-pink-50/40 dark:hover:bg-gray-700/50 cursor-pointer transition-colors">
                    <input type="checkbox"
                      checked={(form.servicio_ids ?? []).includes(s.id)}
                      onChange={() => toggleServicio(s.id)}
                      className="accent-pink-500 w-4 h-4 cursor-pointer" />
                    <div className="flex-1 min-w-0">
                      <span className="font-poppins text-sm text-gray-700 dark:text-gray-200">{s.nombre}</span>
                      {s.precio && (
                        <span className="font-poppins text-xs text-gray-400 dark:text-gray-500 ml-2">
                          ${Number(s.precio).toLocaleString('es-MX')}
                        </span>
                      )}
                    </div>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Estado */}
          <div className="flex items-center justify-between py-3 border-t border-pink-50 dark:border-gray-700">
            <div>
              <p className="font-poppins text-sm font-medium text-gray-700 dark:text-gray-200">Estado</p>
              <p className="font-poppins text-xs text-gray-400 dark:text-gray-500">
                {form.activo ? 'Visible en el sitio web' : 'Oculta del sitio web'}
              </p>
            </div>
            <button type="button" onClick={() => set('activo', !form.activo)}
              className={`transition-colors cursor-pointer ${form.activo ? 'text-green-500 hover:text-green-700' : 'text-gray-300 hover:text-gray-500'}`}>
              {form.activo ? <ToggleRight size={30} /> : <ToggleLeft size={30} />}
            </button>
          </div>
        </form>

        {/* Footer */}
        <div className="shrink-0 flex gap-3 px-6 py-4 border-t border-pink-50 dark:border-gray-700">
          <button type="button" onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 font-poppins text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all cursor-pointer">
            Cancelar
          </button>
          <button type="submit" form="promo-form" disabled={loading}
            onClick={handleSubmit}
            className="flex-1 py-2.5 rounded-xl bg-pink-500 hover:bg-pink-600 disabled:bg-pink-300 text-white font-poppins text-sm font-semibold transition-all cursor-pointer shadow-pink-sm">
            {loading
              ? <span className="flex items-center justify-center gap-2"><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Guardando…</span>
              : isEdit ? 'Guardar cambios' : 'Crear promoción'}
          </button>
        </div>
      </div>
    </div>
  );
}
