import React, { useCallback, useEffect, useState } from 'react';
import {
  Users, Search, RefreshCw, X, ChevronLeft,
  Mail, Phone, CalendarDays, CheckCircle2, TrendingUp,
} from 'lucide-react';
import { getClientas, getCitasDeCliente } from '../../lib/supabase';
import CitaStatusBadge from '../../components/Admin/CitaStatusBadge';
import Pagination from '../../components/Admin/Pagination';

function fmt(fechaStr) {
  if (!fechaStr) return '—';
  const d = new Date(fechaStr + 'T12:00:00');
  return d.toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' });
}

function fmtMoney(n) {
  if (!n) return '$0';
  return '$' + Number(n).toLocaleString('es-MX', { minimumFractionDigits: 0 });
}

// ─── Drawer de historial ───────────────────────────────────────────────────────

function HistorialDrawer({ clienta, onClose }) {
  const [citas, setCitas] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!clienta) return;
    setLoading(true);
    getCitasDeCliente(clienta.email || null, clienta.nombre).then(({ data }) => {
      setCitas(data ?? []);
      setLoading(false);
    });
  }, [clienta]);

  if (!clienta) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 lg:hidden"
        onClick={onClose}
      />
      <div className="fixed top-0 right-0 h-full w-full max-w-md bg-white dark:bg-gray-800 shadow-2xl z-50 flex flex-col">
        {/* Header */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100 dark:border-gray-700">
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all cursor-pointer shrink-0"
          >
            <ChevronLeft size={18} />
          </button>
          <div className="min-w-0">
            <p className="font-poppins text-sm font-semibold text-gray-800 dark:text-gray-100 truncate">{clienta.nombre}</p>
            {clienta.email && (
              <p className="font-poppins text-xs text-gray-400 dark:text-gray-500 truncate">{clienta.email}</p>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 px-5 py-4 border-b border-gray-50 dark:border-gray-700">
          <div className="text-center">
            <p className="font-poppins text-lg font-bold text-gray-800 dark:text-gray-100">{clienta.total_citas}</p>
            <p className="font-poppins text-xs text-gray-400 dark:text-gray-500">Total</p>
          </div>
          <div className="text-center">
            <p className="font-poppins text-lg font-bold text-green-600">{clienta.citas_completadas}</p>
            <p className="font-poppins text-xs text-gray-400 dark:text-gray-500">Completadas</p>
          </div>
          <div className="text-center">
            <p className="font-poppins text-lg font-bold text-pink-600 dark:text-pink-400">{fmtMoney(clienta.total_gastado)}</p>
            <p className="font-poppins text-xs text-gray-400 dark:text-gray-500">Gastado</p>
          </div>
        </div>

        {/* Citas */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex justify-center py-16">
              <div className="w-7 h-7 border-2 border-pink-100 border-t-pink-500 rounded-full animate-spin" />
            </div>
          ) : citas.length === 0 ? (
            <div className="py-16 text-center px-6">
              <CalendarDays size={32} className="text-pink-200 mx-auto mb-3" />
              <p className="font-poppins text-sm text-gray-400 dark:text-gray-500">Sin citas registradas</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50 dark:divide-gray-700 px-5">
              {citas.map(c => (
                <div key={c.id} className="py-3.5 flex items-start gap-3">
                  <div className="shrink-0 text-center w-12">
                    <p className="font-poppins text-xs font-semibold text-pink-600 dark:text-pink-400">{c.hora?.slice(0, 5)}</p>
                    <p className="font-poppins text-[10px] text-gray-400 dark:text-gray-500 leading-tight mt-0.5">{fmt(c.fecha)}</p>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-poppins text-sm font-medium text-gray-800 dark:text-gray-100 truncate">{c.servicio}</p>
                    {c.precio_cobrado > 0 && (
                      <p className="font-poppins text-xs text-green-600 mt-0.5">{fmtMoney(c.precio_cobrado)}</p>
                    )}
                    {c.notas && (
                      <p className="font-poppins text-xs text-gray-400 dark:text-gray-500 mt-0.5 truncate">{c.notas}</p>
                    )}
                  </div>
                  <CitaStatusBadge estado={c.estado} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

// ─── Página principal ──────────────────────────────────────────────────────────

const PAGE_SIZE = 10;

export default function AdminClientas() {
  const [clientas, setClientas] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [search,   setSearch]   = useState('');
  const [selected, setSelected] = useState(null);
  const [page,     setPage]     = useState(1);

  const load = useCallback(async () => {
    setLoading(true);
    const { data } = await getClientas();
    setClientas(data ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = clientas.filter(c => {
    const q = search.toLowerCase();
    return (
      c.nombre?.toLowerCase().includes(q) ||
      c.email?.toLowerCase().includes(q) ||
      c.telefono?.toLowerCase().includes(q)
    );
  });

  const totalPages    = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageClientas  = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  useEffect(() => { setPage(1); }, [filtered.length, search]);

  return (
    <div className="overflow-y-auto flex-1">
      <div className="p-6 lg:p-8 max-w-5xl mx-auto">

        {/* Header */}
        <div className="flex items-start justify-between mb-6 gap-4 flex-wrap">
          <div>
            <h1 className="font-poppins text-2xl font-bold text-gray-800 dark:text-gray-100">Clientas</h1>
            <p className="font-poppins text-sm text-gray-400 dark:text-gray-500 mt-0.5">
              {loading ? '…' : `${clientas.length} clientas registradas`}
            </p>
          </div>
          <button
            onClick={load}
            disabled={loading}
            className="flex items-center gap-2 px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-600 font-poppins text-sm text-gray-500 dark:text-gray-400 hover:text-pink-500 hover:border-pink-200 hover:bg-pink-50 dark:hover:bg-pink-900/20 transition-all cursor-pointer"
          >
            <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>

        {/* Buscador */}
        <div className="relative mb-5">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar por nombre, email o teléfono…"
            className="w-full pl-9 pr-9 py-2.5 bg-white dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-500 border border-gray-200 dark:border-gray-600 rounded-xl font-poppins text-sm focus:outline-none focus:ring-2 focus:ring-pink-300 focus:border-pink-400 transition-all"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 cursor-pointer"
            >
              <X size={15} />
            </button>
          )}
        </div>

        {/* Tabla desktop */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-9 h-9 border-3 border-pink-100 border-t-pink-500 rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm py-16 text-center">
            <Users size={36} className="text-pink-200 mx-auto mb-3" />
            <p className="font-poppins text-sm text-gray-400 dark:text-gray-500">
              {search ? 'Sin resultados para esa búsqueda' : 'Aún no hay clientas registradas'}
            </p>
          </div>
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden lg:block bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-50 dark:border-gray-700 bg-gray-50/60 dark:bg-gray-700/40">
                    <th className="text-left px-5 py-3.5 font-poppins text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wide">Clienta</th>
                    <th className="text-left px-5 py-3.5 font-poppins text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wide">Contacto</th>
                    <th className="text-center px-4 py-3.5 font-poppins text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wide">Citas</th>
                    <th className="text-center px-4 py-3.5 font-poppins text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wide">Completadas</th>
                    <th className="text-right px-4 py-3.5 font-poppins text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wide">Gastado</th>
                    <th className="text-left px-4 py-3.5 font-poppins text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wide">Última cita</th>
                    <th className="px-4 py-3.5" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 dark:divide-gray-700">
                  {pageClientas.map(c => (
                    <tr key={c.cliente_id} className="hover:bg-pink-50/30 dark:hover:bg-gray-700/50 transition-colors">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-pink-100 dark:bg-pink-900/40 flex items-center justify-center shrink-0">
                            <span className="font-poppins text-xs font-bold text-pink-600 dark:text-pink-400">
                              {c.nombre?.[0]?.toUpperCase() ?? '?'}
                            </span>
                          </div>
                          <p className="font-poppins text-sm font-medium text-gray-800 dark:text-gray-100">{c.nombre}</p>
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="space-y-0.5">
                          {c.email && (
                            <div className="flex items-center gap-1.5">
                              <Mail size={12} className="text-gray-400 shrink-0" />
                              <span className="font-poppins text-xs text-gray-500 dark:text-gray-400 truncate max-w-[180px]">{c.email}</span>
                            </div>
                          )}
                          {c.telefono && (
                            <div className="flex items-center gap-1.5">
                              <Phone size={12} className="text-gray-400 shrink-0" />
                              <span className="font-poppins text-xs text-gray-500 dark:text-gray-400">{c.telefono}</span>
                            </div>
                          )}
                          {!c.email && !c.telefono && (
                            <span className="font-poppins text-xs text-gray-300 dark:text-gray-600">—</span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-center">
                        <span className="font-poppins text-sm font-semibold text-gray-700 dark:text-gray-200">{c.total_citas}</span>
                      </td>
                      <td className="px-4 py-3.5 text-center">
                        <span className="font-poppins text-sm text-green-600 font-medium">{c.citas_completadas}</span>
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        <span className="font-poppins text-sm font-semibold text-pink-600 dark:text-pink-400">{fmtMoney(c.total_gastado)}</span>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="font-poppins text-xs text-gray-500 dark:text-gray-400">{fmt(c.ultima_cita)}</span>
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        <button
                          onClick={() => setSelected(c)}
                          className="px-3 py-1.5 rounded-lg bg-pink-50 dark:bg-pink-900/30 hover:bg-pink-100 dark:hover:bg-pink-900/50 text-pink-600 dark:text-pink-400 font-poppins text-xs font-semibold transition-all cursor-pointer"
                        >
                          Ver historial
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="lg:hidden space-y-3">
              {pageClientas.map(c => (
                <div
                  key={c.cliente_id}
                  className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-4"
                >
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-full bg-pink-100 dark:bg-pink-900/40 flex items-center justify-center shrink-0">
                        <span className="font-poppins text-sm font-bold text-pink-600 dark:text-pink-400">
                          {c.nombre?.[0]?.toUpperCase() ?? '?'}
                        </span>
                      </div>
                      <div className="min-w-0">
                        <p className="font-poppins text-sm font-semibold text-gray-800 dark:text-gray-100 truncate">{c.nombre}</p>
                        {c.email && (
                          <p className="font-poppins text-xs text-gray-400 dark:text-gray-500 truncate">{c.email}</p>
                        )}
                        {c.telefono && (
                          <p className="font-poppins text-xs text-gray-400 dark:text-gray-500">{c.telefono}</p>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => setSelected(c)}
                      className="shrink-0 px-3 py-1.5 rounded-lg bg-pink-50 dark:bg-pink-900/30 hover:bg-pink-100 dark:hover:bg-pink-900/50 text-pink-600 dark:text-pink-400 font-poppins text-xs font-semibold transition-all cursor-pointer"
                    >
                      Historial
                    </button>
                  </div>
                  <div className="grid grid-cols-3 gap-2 pt-3 border-t border-gray-50 dark:border-gray-700">
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1 mb-0.5">
                        <CalendarDays size={11} className="text-gray-400" />
                        <span className="font-poppins text-sm font-bold text-gray-700 dark:text-gray-200">{c.total_citas}</span>
                      </div>
                      <p className="font-poppins text-[10px] text-gray-400 dark:text-gray-500">Total</p>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1 mb-0.5">
                        <CheckCircle2 size={11} className="text-green-500" />
                        <span className="font-poppins text-sm font-bold text-green-600">{c.citas_completadas}</span>
                      </div>
                      <p className="font-poppins text-[10px] text-gray-400 dark:text-gray-500">Completadas</p>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1 mb-0.5">
                        <TrendingUp size={11} className="text-pink-500" />
                        <span className="font-poppins text-sm font-bold text-pink-600 dark:text-pink-400">{fmtMoney(c.total_gastado)}</span>
                      </div>
                      <p className="font-poppins text-[10px] text-gray-400 dark:text-gray-500">Gastado</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <Pagination page={page} totalPages={totalPages} total={filtered.length} pageSize={PAGE_SIZE} onChange={setPage} />
          </>
        )}
      </div>

      {/* Drawer */}
      <HistorialDrawer clienta={selected} onClose={() => setSelected(null)} />
    </div>
  );
}
