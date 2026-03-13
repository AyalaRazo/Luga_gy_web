import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, CheckCircle2, AlertCircle, KeyRound } from 'lucide-react';
import { supabase } from '../../lib/supabase';

export default function AcceptInvite() {
  const navigate = useNavigate();
  const [hasSession, setHasSession] = useState(null); // null = checking
  const [password,   setPassword]   = useState('');
  const [confirm,    setConfirm]    = useState('');
  const [showPw,     setShowPw]     = useState(false);
  const [loading,    setLoading]    = useState(false);
  const [error,      setError]      = useState('');
  const [done,       setDone]       = useState(false);

  useEffect(() => {
    // Supabase redirects with #access_token=...&refresh_token=...&type=invite
    // in the URL hash. Since detectSessionInUrl is false we parse it manually.
    const hash = window.location.hash;
    if (hash) {
      const params = new URLSearchParams(hash.replace(/^#/, ''));
      const accessToken  = params.get('access_token');
      const refreshToken = params.get('refresh_token');
      if (accessToken && refreshToken) {
        supabase.auth.setSession({ access_token: accessToken, refresh_token: refreshToken })
          .then(({ data: { session } }) => setHasSession(!!session));
        return;
      }
    }
    supabase.auth.getSession().then(({ data: { session } }) => {
      setHasSession(!!session);
    });
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    if (password !== confirm) { setError('Las contraseñas no coinciden.'); return; }
    if (password.length < 6)  { setError('La contraseña debe tener al menos 6 caracteres.'); return; }
    setLoading(true);
    setError('');
    const { error: err } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (err) { setError(err.message); return; }
    setDone(true);
    setTimeout(() => navigate('/admin', { replace: true }), 2000);
  }

  const inp = 'w-full px-4 py-3 font-poppins text-sm border border-pink-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-300 focus:border-pink-400 transition-all';

  // Loading check
  if (hasSession === null) {
    return (
      <div className="min-h-screen bg-pink-50 flex items-center justify-center">
        <div className="w-9 h-9 border-3 border-pink-100 border-t-pink-500 rounded-full animate-spin" />
      </div>
    );
  }

  // No session = invalid/expired link
  if (!hasSession) {
    return (
      <div className="min-h-screen bg-pink-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-sm border border-pink-100 p-8 max-w-sm w-full text-center">
          <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle size={24} className="text-red-500" />
          </div>
          <h1 className="font-poppins text-lg font-bold text-gray-800 mb-2">Link inválido o expirado</h1>
          <p className="font-poppins text-sm text-gray-500 mb-5">
            El link de invitación ya no es válido. Pedile al administrador que envíe una nueva invitación.
          </p>
          <a href="/admin/login"
            className="font-poppins text-sm text-pink-500 hover:text-pink-600 transition-colors">
            Ir al login →
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-pink-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-sm border border-pink-100 p-8 max-w-sm w-full">
        {/* Logo */}
        <div className="text-center mb-6">
          <img src="/logo.png" alt="Luga Gy" className="h-12 w-auto object-contain mx-auto mb-3" />
          <h1 className="font-poppins text-xl font-bold text-gray-800">Establecer contraseña</h1>
          <p className="font-poppins text-sm text-gray-400 mt-1">
            Elegí una contraseña para acceder al panel.
          </p>
        </div>

        {done ? (
          <div className="text-center py-4">
            <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <CheckCircle2 size={24} className="text-green-500" />
            </div>
            <p className="font-poppins text-sm font-semibold text-gray-800">¡Contraseña establecida!</p>
            <p className="font-poppins text-xs text-gray-400 mt-1">Redirigiendo al panel…</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-3 py-2">
                <AlertCircle size={14} className="text-red-500 shrink-0" />
                <p className="font-poppins text-xs text-red-700">{error}</p>
              </div>
            )}

            <div>
              <label className="block font-poppins text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">
                Nueva contraseña
              </label>
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                  required
                  className={`${inp} pr-10`}
                />
                <button type="button" onClick={() => setShowPw(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer">
                  {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            <div>
              <label className="block font-poppins text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">
                Confirmar contraseña
              </label>
              <input
                type={showPw ? 'text' : 'password'}
                value={confirm}
                onChange={e => setConfirm(e.target.value)}
                placeholder="Repetí la contraseña"
                required
                className={inp}
              />
            </div>

            <button type="submit" disabled={loading}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-pink-500 hover:bg-pink-600 disabled:bg-pink-300 text-white font-poppins text-sm font-semibold rounded-xl transition-all cursor-pointer mt-2">
              {loading
                ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                : <KeyRound size={15} />}
              Confirmar contraseña
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
