import React, { useCallback, useEffect, useState } from 'react';
import { CalendarDays, Clock, CheckCircle2, XCircle, TrendingUp, RefreshCw, AlertCircle } from 'lucide-react';
import { getCitasStats, getCitasAdmin } from '../../lib/supabase';
import CitaStatusBadge from '../../components/Admin/CitaStatusBadge';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const AUTH_ERRS = ['jwt', 'not authenticated', 'pgrst301', '401', 'invalid claim'];
function isAuthErr(e) { return AUTH_ERRS.some(k => String(e?.message ?? e?.code ?? '').toLowerCase().includes(k)); }

function StatCard({ icon: Icon, label, value, color, sub }) {
  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex items-start gap-4">
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${color}`}>
        <Icon size={20} className="text-white" />
      </div>
      <div className="min-w-0">
        <p className="font-poppins text-2xl font-bold text-gray-800 leading-tight">{value ?? '—'}</p>
        <p className="font-poppins text-sm text-gray-500">{label}</p>
        {sub && <p className="font-poppins text-xs text-gray-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();
  const [stats,   setStats]   = useState(null);
  const [citas,   setCitas]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchErr, setFetchErr] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setFetchErr('');
    try {
      const today = new Date().toISOString().slice(0, 10);
      const [{ data: st, error: e1 }, { data: ct, error: e2 }] = await Promise.all([
        getCitasStats(),
        getCitasAdmin({ fecha: today }),
      ]);
      if (isAuthErr(e1) || isAuthErr(e2)) {
        await signOut();
        navigate('/admin/login', { replace: true, state: { error: 'Sesión expirada.' } });
        return;
      }
      setStats(st);
      setCitas(ct ?? []);
    } catch (e) {
      if (isAuthErr(e)) {
        await signOut();
        navigate('/admin/login', { replace: true, state: { error: 'Sesión expirada.' } });
      } else {
        setFetchErr('Error al cargar datos. Intenta de nuevo.');
      }
    } finally {
      setLoading(false);
    }
  }, [navigate, signOut]);

  useEffect(() => { load(); }, [load]);

  const today = new Date().toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long' });
  const todayCapital = today.charAt(0).toUpperCase() + today.slice(1);

  return (
    <div className="overflow-y-auto flex-1"><div className="p-6 lg:p-8 max-w-5xl mx-auto">

      {/* Header */}
      <div className="flex items-start justify-between mb-8 gap-4">
        <div>
          <h1 className="font-poppins text-2xl font-bold text-gray-800">
            Hola, {profile?.nombre?.split(' ')[0] ?? 'Admin'} 👋
          </h1>
          <p className="font-poppins text-sm text-gray-400 mt-0.5 capitalize">{todayCapital}</p>
        </div>
        <button
          onClick={load}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 font-poppins text-sm text-gray-500 hover:text-pink-500 hover:border-pink-200 hover:bg-pink-50 transition-all cursor-pointer"
        >
          <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
          Actualizar
        </button>
      </div>

      {fetchErr && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-6">
          <AlertCircle size={15} className="text-red-500 shrink-0" />
          <p className="font-poppins text-sm text-red-700">{fetchErr}</p>
        </div>
      )}

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          icon={TrendingUp}
          label="Total citas"
          value={stats?.total}
          color="bg-pink-500"
        />
        <StatCard
          icon={Clock}
          label="Pendientes"
          value={stats?.pendientes}
          color="bg-amber-400"
        />
        <StatCard
          icon={CheckCircle2}
          label="Confirmadas"
          value={stats?.confirmadas}
          color="bg-green-500"
        />
        <StatCard
          icon={XCircle}
          label="Canceladas"
          value={stats?.canceladas}
          color="bg-red-400"
        />
      </div>

      {/* Today's appointments */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-50">
          <div className="flex items-center gap-2">
            <CalendarDays size={18} className="text-pink-500" />
            <h2 className="font-poppins text-base font-semibold text-gray-700">Citas de hoy</h2>
            {!loading && (
              <span className="ml-1 px-2 py-0.5 rounded-full bg-pink-100 text-pink-600 font-poppins text-xs font-medium">
                {citas.length}
              </span>
            )}
          </div>
          <a href="/admin/citas" className="font-poppins text-xs text-pink-500 hover:text-pink-600 cursor-pointer transition-colors">
            Ver todas →
          </a>
        </div>

        {loading ? (
          <div className="px-6 py-12 flex justify-center">
            <div className="w-8 h-8 border-3 border-pink-100 border-t-pink-500 rounded-full animate-spin" />
          </div>
        ) : citas.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <CalendarDays size={36} className="text-pink-200 mx-auto mb-3" />
            <p className="font-poppins text-sm text-gray-400">No hay citas para hoy</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {citas.map((c) => (
              <div key={c.id} className="flex items-center gap-4 px-6 py-3.5 hover:bg-pink-50/40 transition-colors">
                <div className="w-14 text-center">
                  <span className="font-poppins text-sm font-semibold text-pink-600">
                    {c.hora?.slice(0, 5)}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-poppins text-sm font-medium text-gray-800 truncate">{c.nombre}</p>
                  <p className="font-poppins text-xs text-gray-400 truncate">{c.servicio}</p>
                </div>
                <CitaStatusBadge estado={c.estado} />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick stats bottom */}
      <div className="grid grid-cols-2 gap-4 mt-4">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center gap-4">
          <CalendarDays size={20} className="text-pink-400 shrink-0" />
          <div>
            <p className="font-poppins text-xl font-bold text-gray-800">{stats?.hoy ?? '—'}</p>
            <p className="font-poppins text-xs text-gray-400">Citas hoy</p>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center gap-4">
          <CalendarDays size={20} className="text-purple-400 shrink-0" />
          <div>
            <p className="font-poppins text-xl font-bold text-gray-800">{stats?.manana ?? '—'}</p>
            <p className="font-poppins text-xs text-gray-400">Citas mañana</p>
          </div>
        </div>
      </div>
    </div></div>
  );
}
