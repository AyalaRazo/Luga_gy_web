import React, { useEffect, useState } from 'react';
import { XCircle, Loader, Heart, AlertTriangle } from 'lucide-react';
import { getCitaByToken, solicitarCancelacion } from '../../lib/supabase';
import OptimizedImage from '../../components/UI/OptimizedImage';

function formatFecha(fechaStr) {
  if (!fechaStr) return '';
  const d = new Date(fechaStr + 'T12:00:00');
  return d.toLocaleDateString('es-MX', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
}

export default function CancelarCita() {
  const token = new URLSearchParams(window.location.search).get('token');
  const [cita,   setCita]   = useState(null);
  const [motivo, setMotivo] = useState('');
  const [status, setStatus] = useState('loading'); // loading | ready | sending | done | already | invalid

  useEffect(() => {
    if (!token) { setStatus('invalid'); return; }
    getCitaByToken(token).then(({ data, error }) => {
      if (error || !data) { setStatus('invalid'); return; }
      setCita(data);
      if (data.estado === 'cancelada')                    setStatus('already');
      else if (data.estado === 'solicitud_cancelacion')   setStatus('done');
      else if (data.estado === 'completada')              setStatus('invalid');
      else setStatus('ready');
    });
  }, [token]);

  async function handleSolicitar() {
    setStatus('sending');
    const { error } = await solicitarCancelacion(token, motivo);
    if (error) { setStatus('invalid'); return; }
    setStatus('done');
  }

  return (
    <div className="min-h-screen bg-pink-50/60 dark:bg-gray-900 flex flex-col items-center justify-center p-6">
      {/* Logo */}
      <a href="/" className="flex items-center gap-2 mb-10">
        <OptimizedImage src="/logo.png" webp="/logo.webp" alt="Luga Gy" width={500} height={500} className="h-14 w-auto object-contain" eager />
      </a>

      <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-pink-md border border-pink-100 dark:border-gray-700 w-full max-w-md p-8 text-center">

        {/* Loading */}
        {(status === 'loading' || status === 'sending') && (
          <div className="flex flex-col items-center gap-4 py-6">
            <Loader size={40} className="text-pink-400 animate-spin" />
            <p className="font-poppins text-sm text-gray-500 dark:text-gray-400">
              {status === 'sending' ? 'Enviando solicitud…' : 'Cargando…'}
            </p>
          </div>
        )}

        {/* Ready to cancel */}
        {status === 'ready' && cita && (
          <>
            <div className="w-16 h-16 bg-amber-50 rounded-2xl flex items-center justify-center mx-auto mb-5">
              <AlertTriangle size={28} className="text-amber-400" />
            </div>
            <h1 className="font-great-vibes text-4xl text-pink-400 mb-2">Cancelar Cita</h1>
            <p className="font-poppins text-sm text-gray-500 dark:text-gray-400 mb-6">
              Hola <strong className="text-gray-700 dark:text-gray-200">{cita.nombre}</strong>, ¿deseas solicitar la cancelación de esta cita?
            </p>
            <div className="bg-pink-50/80 dark:bg-gray-700 rounded-2xl border border-pink-100 dark:border-gray-600 p-5 text-left space-y-3 mb-6">
              <div>
                <p className="font-poppins text-[10px] text-gray-400 dark:text-gray-500 uppercase tracking-wider">Servicio</p>
                <p className="font-poppins text-sm font-semibold text-gray-800 dark:text-gray-100">{cita.servicio}</p>
              </div>
              <div>
                <p className="font-poppins text-[10px] text-gray-400 dark:text-gray-500 uppercase tracking-wider">Fecha</p>
                <p className="font-poppins text-sm font-semibold text-gray-800 dark:text-gray-100 capitalize">{formatFecha(cita.fecha)}</p>
              </div>
              <div>
                <p className="font-poppins text-[10px] text-gray-400 dark:text-gray-500 uppercase tracking-wider">Hora</p>
                <p className="font-poppins text-sm font-semibold text-gray-800 dark:text-gray-100">{cita.hora?.slice(0, 5)}</p>
              </div>
            </div>

            <div className="text-left mb-6">
              <label className="block font-poppins text-xs font-medium text-gray-600 dark:text-gray-300 mb-1.5">
                Motivo de cancelación <span className="text-gray-400 dark:text-gray-500">(opcional)</span>
              </label>
              <textarea
                value={motivo}
                onChange={e => setMotivo(e.target.value)}
                rows={3}
                placeholder="Ej: Me surgió algo inesperado…"
                className="w-full px-4 py-3 rounded-xl border border-pink-200 focus:border-pink-400 focus:ring-2 focus:ring-pink-100 outline-none font-poppins text-sm text-gray-700 dark:text-gray-100 placeholder-gray-300 dark:placeholder-gray-500 dark:bg-gray-700 dark:border-gray-600 transition-colors resize-none"
              />
            </div>

            <button
              onClick={handleSolicitar}
              className="w-full py-3 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-poppins text-sm font-semibold transition-all cursor-pointer mb-3"
            >
              Solicitar cancelación
            </button>
            <a href="/" className="inline-block font-poppins text-sm text-gray-400 dark:text-gray-500 hover:text-gray-600 transition-colors">
              No, mantener mi cita
            </a>
          </>
        )}

        {/* Done - request sent */}
        {status === 'done' && (
          <>
            <div className="w-16 h-16 bg-amber-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <AlertTriangle size={28} className="text-amber-400" />
            </div>
            <h1 className="font-poppins text-xl font-bold text-gray-800 dark:text-gray-100 mb-2">Solicitud enviada</h1>
            <p className="font-poppins text-sm text-gray-500 dark:text-gray-400 mb-6">
              Tu solicitud de cancelación fue recibida. El equipo de Luga Gy la revisará y te contactará a la brevedad.
            </p>
            <a href="/" className="inline-block font-poppins text-sm text-pink-400 hover:text-pink-600 transition-colors">
              Volver al inicio →
            </a>
          </>
        )}

        {/* Already cancelled */}
        {status === 'already' && (
          <>
            <XCircle size={52} className="text-gray-300 mx-auto mb-4" />
            <h1 className="font-poppins text-xl font-bold text-gray-800 dark:text-gray-100 mb-2">Cita ya cancelada</h1>
            <p className="font-poppins text-sm text-gray-500 dark:text-gray-400 mb-6">
              Esta cita ya fue cancelada anteriormente.
            </p>
            <a href="/" className="inline-block font-poppins text-sm text-pink-400 hover:text-pink-600 transition-colors">
              Volver al inicio →
            </a>
          </>
        )}

        {/* Invalid */}
        {status === 'invalid' && (
          <>
            <XCircle size={52} className="text-red-300 mx-auto mb-4" />
            <h1 className="font-poppins text-xl font-bold text-gray-800 dark:text-gray-100 mb-2">Enlace inválido</h1>
            <p className="font-poppins text-sm text-gray-500 dark:text-gray-400 mb-6">
              Este enlace no es válido o la cita no puede cancelarse.
            </p>
            <a href="/" className="inline-block font-poppins text-sm text-pink-400 hover:text-pink-600 transition-colors">
              Volver al inicio →
            </a>
          </>
        )}
      </div>

      <p className="font-great-vibes text-2xl text-pink-300 mt-8">Con amor, Luga Gy ✨</p>
    </div>
  );
}
