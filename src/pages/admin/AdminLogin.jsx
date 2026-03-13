import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Heart, Lock, Mail, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function AdminLogin() {
  const { signIn, isAdmin, session } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState(location.state?.error ?? '');

  // If already authenticated as admin, go straight to panel
  useEffect(() => {
    if (session && isAdmin) navigate('/admin', { replace: true });
  }, [session, isAdmin, navigate]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);

    const { data, error: authError } = await signIn(email, password);

    if (authError) {
      setError('Credenciales incorrectas.');
      setLoading(false);
      return;
    }

    // Profile was fetched inside signIn — check role
    if (!data?.user) {
      setError('No se pudo obtener la sesión.');
      setLoading(false);
      return;
    }

    // Navigate — ProtectedRoute will verify the admin role
    navigate('/admin', { replace: true });
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-rose-50 flex items-center justify-center p-4">
      <div className="absolute top-0 left-0 w-72 h-72 bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-72 h-72 bg-rose-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 pointer-events-none" />

      <div className="relative w-full max-w-md">
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-pink-lg border border-pink-100 p-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-pink-50 rounded-2xl mb-4 shadow-pink-sm">
              <Heart size={28} className="text-pink-500 fill-pink-200" />
            </div>
            <h1 className="font-great-vibes text-4xl text-pink-500 leading-none">Luga Gy</h1>
            <p className="font-poppins text-sm text-gray-500 mt-1 tracking-wide uppercase">Panel Administrativo</p>
          </div>

          {error && (
            <div className="flex items-start gap-2.5 bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-6">
              <AlertCircle size={16} className="text-red-500 mt-0.5 shrink-0" />
              <p className="font-poppins text-sm text-red-700">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="email" className="block font-poppins text-sm font-medium text-gray-700 mb-1.5">
                Correo electrónico
              </label>
              <div className="relative">
                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                <input
                  id="email" type="email" autoComplete="email" required
                  value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="admin@lugagy.com"
                  className="w-full pl-10 pr-4 py-2.5 font-poppins text-sm bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-300 focus:border-pink-400 transition-all placeholder:text-gray-300"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block font-poppins text-sm font-medium text-gray-700 mb-1.5">
                Contraseña
              </label>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                <input
                  id="password" type={showPass ? 'text' : 'password'}
                  autoComplete="current-password" required
                  value={password} onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-2.5 font-poppins text-sm bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-300 focus:border-pink-400 transition-all placeholder:text-gray-300"
                />
                <button type="button" onClick={() => setShowPass(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
                  aria-label={showPass ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                >
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit" disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-pink-500 hover:bg-pink-600 disabled:bg-pink-300 text-white font-poppins text-sm font-semibold py-3 rounded-xl transition-all duration-200 shadow-pink-sm hover:shadow-pink-md focus:outline-none focus:ring-2 focus:ring-pink-400 cursor-pointer mt-2"
            >
              {loading
                ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Iniciando sesión…</>
                : 'Iniciar sesión'
              }
            </button>
          </form>

          <p className="font-poppins text-xs text-center text-gray-400 mt-6">
            Solo personal autorizado de Luga Gy
          </p>
        </div>

        <div className="text-center mt-5">
          <a href="/" className="font-poppins text-sm text-gray-400 hover:text-pink-500 transition-colors cursor-pointer">
            ← Volver al sitio
          </a>
        </div>
      </div>
    </div>
  );
}
