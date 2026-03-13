import React, { useCallback, useEffect, useState } from 'react';
import {
  Users, RefreshCw, UserPlus, X, Shield, Trash2,
  CheckCircle2, AlertCircle, Crown,
} from 'lucide-react';
import { getUsuarios, manageUser } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';

const ROL_LABELS = {
  super_admin: { label: 'Super Admin', bg: 'bg-purple-100', text: 'text-purple-700' },
  admin:       { label: 'Admin',       bg: 'bg-pink-100',   text: 'text-pink-700'   },
  worker:      { label: 'Worker',      bg: 'bg-blue-100',   text: 'text-blue-700'   },
};

function RolBadge({ rol }) {
  const cfg = ROL_LABELS[rol] ?? { label: rol, bg: 'bg-gray-100', text: 'text-gray-600' };
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-poppins text-xs font-semibold ${cfg.bg} ${cfg.text}`}>
      {rol === 'super_admin' && <Crown size={10} />}
      {cfg.label}
    </span>
  );
}

// ─── Modal de confirmación de eliminación ──────────────────────────────────────

function DeleteConfirmModal({ usuario, onConfirm, onCancel, loading }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
        <div className="flex items-start gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center shrink-0">
            <Trash2 size={18} className="text-red-500" />
          </div>
          <div>
            <h3 className="font-poppins text-sm font-semibold text-gray-800">¿Eliminar usuario?</h3>
            <p className="font-poppins text-xs text-gray-500 mt-1">
              Se eliminará permanentemente a <strong>{usuario.nombre}</strong>. Esta acción no se puede deshacer.
            </p>
          </div>
        </div>
        <div className="flex gap-3">
          <button onClick={onCancel} disabled={loading}
            className="flex-1 py-2.5 rounded-xl border border-gray-200 font-poppins text-sm text-gray-600 hover:bg-gray-50 transition-all cursor-pointer disabled:opacity-50">
            Cancelar
          </button>
          <button onClick={onConfirm} disabled={loading}
            className="flex-1 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 disabled:bg-red-300 text-white font-poppins text-sm font-semibold transition-all cursor-pointer flex items-center justify-center gap-2">
            {loading
              ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              : <Trash2 size={14} />}
            Eliminar
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Modal de invitación ───────────────────────────────────────────────────────

function InviteModal({ onClose, onSuccess }) {
  const [form, setForm]       = useState({ nombre: '', email: '', rol: 'worker' });
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');

  const siteUrl = window.location.origin;

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.nombre || !form.email) return;
    setLoading(true);
    setError('');
    const { error: err } = await manageUser('invite', {
      nombre: form.nombre,
      email:  form.email,
      rol:    form.rol,
      redirectTo: `${siteUrl}/admin/accept-invite`,
    });
    setLoading(false);
    if (err) { setError(err.error ?? 'Error al enviar la invitación.'); return; }
    onSuccess();
    onClose();
  }

  const inp = 'w-full px-3 py-2.5 font-poppins text-sm bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-300 focus:border-pink-400 transition-all';
  const lbl = 'block font-poppins text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <UserPlus size={18} className="text-pink-500" />
            <h2 className="font-poppins text-base font-semibold text-gray-800">Invitar usuario</h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 cursor-pointer transition-colors">
            <X size={18} />
          </button>
        </div>

        {error && (
          <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-3 py-2 mb-4">
            <AlertCircle size={14} className="text-red-500 shrink-0" />
            <p className="font-poppins text-xs text-red-700">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className={lbl}>Nombre</label>
            <input type="text" required value={form.nombre}
              onChange={e => setForm(p => ({ ...p, nombre: e.target.value }))}
              placeholder="Nombre completo" className={inp} />
          </div>
          <div>
            <label className={lbl}>Email</label>
            <input type="email" required value={form.email}
              onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
              placeholder="correo@ejemplo.com" className={inp} />
          </div>
          <div>
            <label className={lbl}>Rol</label>
            <select value={form.rol} onChange={e => setForm(p => ({ ...p, rol: e.target.value }))}
              className={`${inp} cursor-pointer`}>
              <option value="admin">Admin</option>
              <option value="worker">Worker</option>
            </select>
          </div>
          <p className="font-poppins text-xs text-gray-400">
            Se enviará un email de invitación. El usuario podrá establecer su contraseña al hacer clic en el link.
          </p>
          <button type="submit" disabled={loading}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-pink-500 hover:bg-pink-600 disabled:bg-pink-300 text-white font-poppins text-sm font-semibold rounded-xl transition-all cursor-pointer">
            {loading
              ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              : <UserPlus size={15} />}
            Enviar invitación
          </button>
        </form>
      </div>
    </div>
  );
}

// ─── Página principal ──────────────────────────────────────────────────────────

export default function AdminUsuarios() {
  const { profile, isSuperAdmin } = useAuth();
  const [usuarios, setUsuarios]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [toast, setToast]         = useState({ msg: '', type: 'ok' });
  const [showInvite, setShowInvite]           = useState(false);
  const [saving, setSaving]                   = useState({});
  const [deleteTarget, setDeleteTarget]       = useState(null); // usuario a eliminar
  const [deleteLoading, setDeleteLoading]     = useState(false);

  const showToast = (msg, type = 'ok') => {
    setToast({ msg, type });
    setTimeout(() => setToast({ msg: '', type: 'ok' }), 3500);
  };

  const load = useCallback(async () => {
    setLoading(true);
    const { data } = await getUsuarios();
    setUsuarios(data ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  async function handleToggleActivo(u) {
    if (!isSuperAdmin) return;
    if (u.id === profile?.id) return;
    setSaving(s => ({ ...s, [u.id]: true }));
    const action = u.activo ? 'deactivate' : 'reactivate';
    const { error } = await manageUser(action, { userId: u.id });
    setSaving(s => ({ ...s, [u.id]: false }));
    if (error) { showToast(error.error ?? 'Error al actualizar.', 'error'); return; }
    showToast(u.activo ? `${u.nombre} desactivado.` : `${u.nombre} activado.`);
    load();
  }

  async function handleChangeRol(u, newRol) {
    if (!isSuperAdmin) return;
    setSaving(s => ({ ...s, [u.id + '_rol']: true }));
    const { error } = await manageUser('update', { userId: u.id, rol: newRol });
    setSaving(s => ({ ...s, [u.id + '_rol']: false }));
    if (error) { showToast(error.error ?? 'Error al cambiar rol.', 'error'); return; }
    showToast(`Rol de ${u.nombre} actualizado.`);
    load();
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    const { error } = await manageUser('delete', { userId: deleteTarget.id });
    setDeleteLoading(false);
    if (error) { showToast(error.error ?? 'Error al eliminar.', 'error'); setDeleteTarget(null); return; }
    showToast(`${deleteTarget.nombre} eliminado.`);
    setDeleteTarget(null);
    load();
  }

  // Una fila es de solo lectura si: es uno mismo, o si es super_admin y el viewer no lo es
  function isReadOnly(u) {
    if (u.id === profile?.id) return true;
    if (!isSuperAdmin) return true; // admins solo ven
    if (u.rol === 'super_admin') return true; // nadie edita a otro super_admin
    return false;
  }

  return (
    <div className="overflow-y-auto flex-1">
      <div className="p-6 lg:p-8 max-w-3xl mx-auto">

        {/* Toast */}
        {toast.msg && (
          <div className={`fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg font-poppins text-sm ${
            toast.type === 'error' ? 'bg-red-600 text-white' : 'bg-gray-900 text-white'
          }`}>
            {toast.type === 'error' ? <AlertCircle size={15} /> : <CheckCircle2 size={15} className="text-green-400" />}
            {toast.msg}
          </div>
        )}

        {/* Header */}
        <div className="flex items-start justify-between mb-6 gap-4 flex-wrap">
          <div>
            <h1 className="font-poppins text-2xl font-bold text-gray-800">Usuarios</h1>
            <p className="font-poppins text-sm text-gray-400 mt-0.5">
              {loading ? '…' : `${usuarios.length} usuarios registrados`}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={load} disabled={loading}
              className="flex items-center gap-2 px-3 py-2 rounded-xl border border-gray-200 font-poppins text-sm text-gray-500 hover:text-pink-500 hover:border-pink-200 hover:bg-pink-50 transition-all cursor-pointer">
              <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
            </button>
            {isSuperAdmin && (
              <button onClick={() => setShowInvite(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-pink-500 hover:bg-pink-600 text-white font-poppins text-sm font-semibold transition-all cursor-pointer shadow-sm">
                <UserPlus size={15} />
                Invitar usuario
              </button>
            )}
          </div>
        </div>

        {/* Lista */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-9 h-9 border-3 border-pink-100 border-t-pink-500 rounded-full animate-spin" />
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            {usuarios.length === 0 ? (
              <div className="py-16 text-center">
                <Users size={36} className="text-pink-200 mx-auto mb-3" />
                <p className="font-poppins text-sm text-gray-400">No hay usuarios registrados</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-50">
                {usuarios.map(u => {
                  const readOnly = isReadOnly(u);
                  const isSelf   = u.id === profile?.id;
                  return (
                    <div key={u.id} className={`flex items-center gap-4 px-5 py-4 ${!u.activo ? 'opacity-50' : ''}`}>
                      {/* Avatar */}
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${
                        u.rol === 'super_admin' ? 'bg-purple-100' : u.rol === 'admin' ? 'bg-pink-100' : 'bg-blue-100'
                      }`}>
                        <span className={`font-poppins text-sm font-bold ${
                          u.rol === 'super_admin' ? 'text-purple-600' : u.rol === 'admin' ? 'text-pink-600' : 'text-blue-600'
                        }`}>
                          {u.nombre?.[0]?.toUpperCase() ?? '?'}
                        </span>
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-poppins text-sm font-semibold text-gray-800">{u.nombre}</p>
                          {isSelf && <span className="font-poppins text-xs text-gray-400">(tú)</span>}
                          {!u.activo && <span className="font-poppins text-xs text-gray-400 italic">Inactivo</span>}
                        </div>
                        <RolBadge rol={u.rol} />
                      </div>

                      {/* Acciones */}
                      {readOnly ? (
                        <span className="font-poppins text-xs text-gray-300 shrink-0">Solo lectura</span>
                      ) : (
                        <div className="flex items-center gap-2 shrink-0">
                          {/* Cambiar rol */}
                          <select
                            value={u.rol}
                            disabled={saving[u.id + '_rol']}
                            onChange={e => handleChangeRol(u, e.target.value)}
                            className="px-2 py-1.5 font-poppins text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-300 cursor-pointer disabled:opacity-50 bg-white"
                          >
                            <option value="admin">Admin</option>
                            <option value="worker">Worker</option>
                          </select>

                          {/* Toggle activo */}
                          <button
                            onClick={() => handleToggleActivo(u)}
                            disabled={saving[u.id]}
                            title={u.activo ? 'Desactivar' : 'Activar'}
                            className={`w-8 h-8 flex items-center justify-center rounded-lg transition-all cursor-pointer disabled:opacity-50 ${
                              u.activo
                                ? 'text-gray-400 hover:text-amber-500 hover:bg-amber-50'
                                : 'text-gray-400 hover:text-green-500 hover:bg-green-50'
                            }`}
                          >
                            {saving[u.id]
                              ? <div className="w-3.5 h-3.5 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
                              : u.activo ? <Shield size={15} /> : <CheckCircle2 size={15} />}
                          </button>

                          {/* Eliminar */}
                          <button
                            onClick={() => setDeleteTarget(u)}
                            title="Eliminar usuario"
                            className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all cursor-pointer"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Info */}
        <div className="mt-4 bg-amber-50 border border-amber-100 rounded-xl px-4 py-3">
          <p className="font-poppins text-xs text-amber-700 leading-relaxed">
            <strong>Permisos:</strong> Worker solo puede gestionar Citas, Clientas y Calendario.
            Admin tiene acceso completo de lectura. Super Admin puede gestionar todos los usuarios.
          </p>
        </div>
      </div>

      {showInvite && (
        <InviteModal
          onClose={() => setShowInvite(false)}
          onSuccess={() => { load(); showToast('Invitación enviada correctamente.'); }}
        />
      )}

      {deleteTarget && (
        <DeleteConfirmModal
          usuario={deleteTarget}
          loading={deleteLoading}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}
