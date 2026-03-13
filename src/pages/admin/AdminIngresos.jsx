import React, { useCallback, useEffect, useState } from 'react';
import { TrendingUp, DollarSign, CheckCircle2, BarChart3, RefreshCw, CalendarDays, Download, ChevronLeft, ChevronRight } from 'lucide-react';
import * as XLSX from 'xlsx';
import { getIngresosStats, getIngresosPorServicio } from '../../lib/supabase';

const PERIODOS = [
  { label: 'Esta semana', value: 'semana' },
  { label: 'Este mes',    value: 'mes'    },
  { label: 'Este año',    value: 'año'    },
  { label: 'Personalizado', value: 'custom' },
];

const hoyISO = new Date().toISOString().slice(0, 10);

function getRango(periodo) {
  const hoy = new Date();
  const fin = hoy.toISOString().slice(0, 10);
  let inicio;
  if (periodo === 'semana') {
    const d = new Date(hoy);
    const day = d.getDay();
    d.setDate(d.getDate() - (day === 0 ? 6 : day - 1));
    inicio = d.toISOString().slice(0, 10);
  } else if (periodo === 'mes') {
    inicio = `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, '0')}-01`;
  } else {
    inicio = `${hoy.getFullYear()}-01-01`;
  }
  return { inicio, fin };
}

function fmt(n) {
  return Number(n ?? 0).toLocaleString('es-MX', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

function StatCard({ icon: Icon, label, value, sub, color }) {
  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex items-start gap-4">
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${color}`}>
        <Icon size={20} className="text-white" />
      </div>
      <div>
        <p className="font-poppins text-2xl font-bold text-gray-800 leading-tight">{value}</p>
        <p className="font-poppins text-sm text-gray-500">{label}</p>
        {sub && <p className="font-poppins text-xs text-gray-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

export default function AdminIngresos() {
  const PAGE_SIZE = 10;
  const [periodo,     setPeriodo]     = useState('mes');
  const [customInicio, setCustomInicio] = useState(hoyISO.slice(0, 7) + '-01');
  const [customFin,    setCustomFin]    = useState(hoyISO);
  const [citas,       setCitas]       = useState([]);
  const [ranking,     setRanking]     = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [page,        setPage]        = useState(1);

  const load = useCallback(async () => {
    setLoading(true);
    const { inicio, fin } = periodo === 'custom'
      ? { inicio: customInicio, fin: customFin }
      : getRango(periodo);
    const [{ data: c }, { data: r }] = await Promise.all([
      getIngresosStats(inicio, fin),
      getIngresosPorServicio(),
    ]);
    setCitas(c ?? []);
    setRanking(r ?? []);
    setLoading(false);
  }, [periodo, customInicio, customFin]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { setPage(1); }, [citas]);

  function handleExport() {
    const { inicio, fin } = periodo === 'custom'
      ? { inicio: customInicio, fin: customFin }
      : getRango(periodo);

    // Hoja 1: detalle de citas
    const detalle = citas.map(c => ({
      'Fecha':    c.fecha,
      'Clienta':  c.nombre,
      'Servicio': c.servicio,
      'Cobrado':  c.precio_cobrado != null ? Number(c.precio_cobrado) : '',
    }));
    detalle.push({ 'Fecha': '', 'Clienta': '', 'Servicio': 'TOTAL', 'Cobrado': totalIngresado });

    // Hoja 2: resumen por servicio
    const resumen = ranking
      .filter(r => Number(r.total_ingresado) > 0)
      .map(r => ({
        'Servicio':       r.nombre,
        'Citas':          Number(r.total_citas),
        'Total ingresado': Number(r.total_ingresado),
      }));

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(detalle),  'Citas completadas');
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(resumen),  'Por servicio');

    const nombreArchivo = `ingresos_${inicio}_${fin}.xlsx`;
    XLSX.writeFile(wb, nombreArchivo);
  }

  // Computed stats
  const totalIngresado = citas.reduce((s, c) => s + Number(c.precio_cobrado ?? 0), 0);
  const totalCitas     = citas.length;
  const promedio       = totalCitas > 0 ? totalIngresado / totalCitas : 0;

  // Paginación
  const totalPages = Math.max(1, Math.ceil(citas.length / PAGE_SIZE));
  const pageCitas  = citas.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  function getPageNumbers() {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
    const pages = new Set([1, totalPages, page, page - 1, page + 1].filter(p => p >= 1 && p <= totalPages));
    const sorted = [...pages].sort((a, b) => a - b);
    const result = [];
    for (let i = 0; i < sorted.length; i++) {
      if (i > 0 && sorted[i] - sorted[i - 1] > 1) result.push('…');
      result.push(sorted[i]);
    }
    return result;
  }

  // Daily chart data (last 30 days or within period)
  const dailyMap = {};
  citas.forEach(c => {
    dailyMap[c.fecha] = (dailyMap[c.fecha] ?? 0) + Number(c.precio_cobrado ?? 0);
  });
  const chartDays  = Object.keys(dailyMap).sort();
  const chartMax   = Math.max(...Object.values(dailyMap), 1);

  // Top servicios
  const topServicios = ranking
    .filter(r => Number(r.total_ingresado) > 0)
    .slice(0, 5);
  const maxIngreso = Math.max(...topServicios.map(r => Number(r.total_ingresado)), 1);

  return (
    <div className="p-6 lg:p-8 overflow-y-auto flex-1">
      {/* Header */}
      <div className="flex items-start justify-between mb-6 gap-4 flex-wrap">
        <div>
          <h1 className="font-poppins text-2xl font-bold text-gray-800">Ingresos</h1>
          <p className="font-poppins text-sm text-gray-400 mt-0.5">Control financiero del negocio</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {PERIODOS.map(p => (
            <button key={p.value} onClick={() => setPeriodo(p.value)}
              className={`px-3 py-1.5 rounded-xl font-poppins text-xs font-medium transition-all cursor-pointer border ${
                periodo === p.value
                  ? 'bg-pink-500 text-white border-pink-500 shadow-pink-sm'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-pink-300 hover:text-pink-500'
              }`}>
              {p.label}
            </button>
          ))}
          <button onClick={load} disabled={loading}
            className="w-8 h-8 flex items-center justify-center rounded-xl border border-gray-200 text-gray-500 hover:text-pink-500 hover:border-pink-200 hover:bg-pink-50 transition-all cursor-pointer">
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          </button>
          <button
            onClick={handleExport}
            disabled={loading || citas.length === 0}
            title="Exportar a Excel"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-gray-200 font-poppins text-xs font-medium text-gray-600 hover:text-green-600 hover:border-green-300 hover:bg-green-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer">
            <Download size={14} />
            Exportar .xlsx
          </button>
        </div>

        {/* Rango personalizado */}
        {periodo === 'custom' && (
          <div className="flex items-center gap-2 mt-3 flex-wrap">
            <input
              type="date"
              value={customInicio}
              max={customFin}
              onChange={e => setCustomInicio(e.target.value)}
              className="px-3 py-2 font-poppins text-sm bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-300 focus:border-pink-400 transition-all cursor-pointer"
            />
            <span className="font-poppins text-sm text-gray-400">al</span>
            <input
              type="date"
              value={customFin}
              min={customInicio}
              max={hoyISO}
              onChange={e => setCustomFin(e.target.value)}
              className="px-3 py-2 font-poppins text-sm bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-300 focus:border-pink-400 transition-all cursor-pointer"
            />
          </div>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-9 h-9 border-3 border-pink-100 border-t-pink-500 rounded-full animate-spin" />
        </div>
      ) : (
        <>
          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <StatCard icon={DollarSign}   label="Total ingresado"  value={`$${fmt(totalIngresado)}`}      sub="de citas completadas" color="bg-pink-500" />
            <StatCard icon={CheckCircle2} label="Citas completadas" value={totalCitas}                    sub="en el período"        color="bg-green-500" />
            <StatCard icon={TrendingUp}   label="Ticket promedio"  value={`$${fmt(promedio)}`}            sub="por cita"             color="bg-purple-500" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">
            {/* Daily chart */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <div className="flex items-center gap-2 mb-5">
                <BarChart3 size={18} className="text-pink-500" />
                <h2 className="font-poppins text-sm font-semibold text-gray-700">Ingresos por día</h2>
              </div>
              {chartDays.length === 0 ? (
                <div className="flex flex-col items-center py-8 text-gray-300">
                  <BarChart3 size={36} className="mb-2" />
                  <p className="font-poppins text-sm">Sin ingresos registrados</p>
                </div>
              ) : (
                <div className="flex items-end gap-1.5 h-32">
                  {chartDays.map(day => {
                    const val    = dailyMap[day];
                    const pct    = (val / chartMax) * 100;
                    const [,, d] = day.split('-');
                    return (
                      <div key={day} className="flex-1 flex flex-col items-center gap-1 group">
                        <div className="relative w-full flex items-end justify-center" style={{ height: '96px' }}>
                          <div
                            className="w-full rounded-t-lg bg-pink-400 group-hover:bg-pink-500 transition-all"
                            style={{ height: `${Math.max(pct, 4)}%` }}
                          />
                          <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-gray-800 text-white font-poppins text-[10px] px-1.5 py-0.5 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                            ${fmt(val)}
                          </div>
                        </div>
                        <span className="font-poppins text-[10px] text-gray-400">{d}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Top servicios */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <div className="flex items-center gap-2 mb-5">
                <TrendingUp size={18} className="text-pink-500" />
                <h2 className="font-poppins text-sm font-semibold text-gray-700">Top servicios por ingreso</h2>
              </div>
              {topServicios.length === 0 ? (
                <div className="flex flex-col items-center py-8 text-gray-300">
                  <TrendingUp size={36} className="mb-2" />
                  <p className="font-poppins text-sm">Sin datos aún</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {topServicios.map((r, i) => {
                    const pct = (Number(r.total_ingresado) / maxIngreso) * 100;
                    return (
                      <div key={r.nombre}>
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-2">
                            <span className="font-poppins text-xs font-bold text-pink-400 w-4">{i + 1}</span>
                            <span className="font-poppins text-xs font-medium text-gray-700 truncate max-w-[140px]">{r.nombre}</span>
                          </div>
                          <div className="text-right shrink-0 ml-2">
                            <span className="font-poppins text-xs font-bold text-gray-800">${fmt(r.total_ingresado)}</span>
                            <span className="font-poppins text-[10px] text-gray-400 ml-1">({r.total_citas} citas)</span>
                          </div>
                        </div>
                        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div className="h-full bg-gradient-to-r from-pink-400 to-rose-400 rounded-full transition-all" style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Citas completadas — tabla paginada */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">

            {/* Header */}
            <div className="flex items-center justify-between gap-3 px-5 py-4 border-b border-gray-50 flex-wrap">
              <div className="flex items-center gap-2">
                <CalendarDays size={17} className="text-pink-500" />
                <h2 className="font-poppins text-sm font-semibold text-gray-700">Citas completadas</h2>
                <span className="px-2 py-0.5 rounded-full bg-pink-100 text-pink-600 font-poppins text-xs font-semibold">
                  {totalCitas}
                </span>
              </div>
              {citas.length > 0 && (
                <p className="font-poppins text-xs text-gray-400">
                  Mostrando <span className="font-semibold text-gray-600">{(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, citas.length)}</span> de <span className="font-semibold text-gray-600">{citas.length}</span> registros
                </p>
              )}
            </div>

            {citas.length === 0 ? (
              <div className="py-14 flex flex-col items-center gap-2 text-gray-300">
                <CalendarDays size={36} />
                <p className="font-poppins text-sm">No hay citas completadas en este período</p>
                <p className="font-poppins text-xs text-gray-400 text-center max-w-xs">
                  Los ingresos se registran al marcar una cita como "Completada" con precio cobrado
                </p>
              </div>
            ) : (
              <>
                {/* Tabla */}
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gray-50/80 border-b border-gray-100">
                        {['#', 'Fecha', 'Clienta', 'Servicio', 'Cobrado'].map(h => (
                          <th key={h} className="px-5 py-3 text-left font-poppins text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {pageCitas.map((c, i) => {
                        const globalIndex = (page - 1) * PAGE_SIZE + i + 1;
                        return (
                          <tr key={c.fecha + c.nombre + i}
                            className="border-b border-gray-50 hover:bg-pink-50/40 transition-colors duration-150 group">
                            <td className="px-5 py-3.5 font-poppins text-xs text-gray-300 w-10">
                              {globalIndex}
                            </td>
                            <td className="px-5 py-3.5 font-poppins text-sm text-gray-500 whitespace-nowrap">
                              {new Date(c.fecha + 'T12:00:00').toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' })}
                            </td>
                            <td className="px-5 py-3.5 font-poppins text-sm font-semibold text-gray-800">
                              {c.nombre}
                            </td>
                            <td className="px-5 py-3.5">
                              <span className="inline-block font-poppins text-xs px-2.5 py-1 rounded-lg bg-pink-50 text-pink-600 font-medium border border-pink-100">
                                {c.servicio}
                              </span>
                            </td>
                            <td className="px-5 py-3.5">
                              {c.precio_cobrado != null
                                ? <span className="font-poppins text-sm font-bold text-green-600">${fmt(c.precio_cobrado)}</span>
                                : <span className="font-poppins text-xs text-gray-300 italic">—</span>
                              }
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Footer: paginación + total */}
                <div className="flex items-center justify-between px-5 py-3.5 border-t border-gray-100 bg-gray-50/50 flex-wrap gap-3">

                  {/* Total */}
                  <div className="font-poppins text-sm text-gray-600">
                    Total del período: <span className="font-bold text-pink-600 text-base">${fmt(totalIngresado)}</span>
                  </div>

                  {/* Controles de paginación */}
                  {totalPages > 1 && (
                    <div className="flex items-center gap-1">
                      {/* Anterior */}
                      <button
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        disabled={page === 1}
                        className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:border-pink-300 hover:text-pink-500 hover:bg-pink-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-150 cursor-pointer"
                        aria-label="Página anterior"
                      >
                        <ChevronLeft size={14} />
                      </button>

                      {/* Números */}
                      {getPageNumbers().map((p, i) =>
                        p === '…' ? (
                          <span key={`ellipsis-${i}`} className="w-8 h-8 flex items-center justify-center font-poppins text-xs text-gray-400">
                            …
                          </span>
                        ) : (
                          <button
                            key={p}
                            onClick={() => setPage(p)}
                            className={`w-8 h-8 flex items-center justify-center rounded-lg font-poppins text-xs font-medium transition-all duration-150 cursor-pointer border ${
                              page === p
                                ? 'bg-pink-500 text-white border-pink-500 shadow-sm'
                                : 'border-gray-200 text-gray-600 hover:border-pink-300 hover:text-pink-500 hover:bg-pink-50'
                            }`}
                          >
                            {p}
                          </button>
                        )
                      )}

                      {/* Siguiente */}
                      <button
                        onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                        disabled={page === totalPages}
                        className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:border-pink-300 hover:text-pink-500 hover:bg-pink-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-150 cursor-pointer"
                        aria-label="Página siguiente"
                      >
                        <ChevronRight size={14} />
                      </button>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
}
