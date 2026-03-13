import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const MAX_LOADING_MS = 5000; // safety timeout — never hang forever

export default function ProtectedRoute({ children }) {
  const { session, canAccess, loading } = useAuth();
  const [timedOut, setTimedOut] = useState(false);

  // Safety net: if loading takes too long, treat it as unauthenticated
  useEffect(() => {
    if (!loading) return;
    const t = setTimeout(() => setTimedOut(true), MAX_LOADING_MS);
    return () => clearTimeout(t);
  }, [loading]);

  if (loading && !timedOut) {
    return (
      <div className="min-h-screen bg-pink-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-pink-200 border-t-pink-500 rounded-full animate-spin" />
          <p className="font-poppins text-sm text-gray-500">Verificando acceso…</p>
        </div>
      </div>
    );
  }

  if (!session || !canAccess) {
    return <Navigate to="/admin/login" replace state={{ error: timedOut ? 'Sesión expirada. Iniciá sesión nuevamente.' : undefined }} />;
  }

  return children;
}
