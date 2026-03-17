import React, { useEffect, useState } from 'react';
import { CheckCircle2, XCircle, Loader, Heart } from 'lucide-react';
import { getCitaByToken, confirmarCita, sendAdminNotification } from '../../lib/supabase';
import OptimizedImage from '../../components/UI/OptimizedImage';

function formatFecha(fechaStr) {
  if (!fechaStr) return '';
  const d = new Date(fechaStr + 'T12:00:00');
  return d.toLocaleDateString('es-MX', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
}

export default function ConfirmarCita() {
  const token = new URLSearchParams(window.location.search).get('token');
  const [cita,    setCita]    = useState(null);
  const [status,  setStatus]  = useState('loading'); // loading | ready | confirming | done | already | invalid

  useEffect(() => {
    if (!token) { setStatus('invalid'); return; }
    getCitaByToken(token).then(({ data, error }) => {
      if (error || !data) { setStatus('invalid'); return; }
      setCita(data);
      if (['confirmada', 'por_confirmar'].includes(data.estado)) setStatus('already');
      else if (['cancelada','solicitud_cancelacion','completada'].includes(data.estado)) setStatus('invalid');
      else setStatus('ready');
    });
  }, [token]);

  async function handleConfirmar() {
    setStatus('confirming');
    const { error } = await confirmarCita(token);
    if (error) { setStatus('invalid'); return; }

    // Notificar al admin que el cliente confirmó
    if (cita) {
      sendAdminNotification({
        name:     cita.nombre,
        servicio: cita.servicio,
        fecha:    cita.fecha,
        hora:     cita.hora?.slice(0, 5),
        email:    cita.email ?? '',
        telefono: cita.telefono ?? '',
      }).catch(() => {}); // no bloquear aunque falle
    }

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
        {(status === 'loading' || status === 'confirming') && (
          <div className="flex flex-col items-center gap-4 py-6">
            <Loader size={40} className="text-pink-400 animate-spin" />
            <p className="font-poppins text-sm text-gray-500 dark:text-gray-400">
              {status === 'confirming' ? 'Confirmando tu cita…' : 'Cargando…'}
            </p>
          </div>
        )}

        {/* Ready to confirm */}
        {status === 'ready' && cita && (
          <>
            <div className="w-16 h-16 bg-pink-50 rounded-2xl flex items-center justify-center mx-auto mb-5">
              <Heart size={28} className="text-pink-400 fill-pink-200" />
            </div>
            <h1 className="font-great-vibes text-4xl text-pink-400 mb-2">Confirmar Cita</h1>
            <p className="font-poppins text-sm text-gray-500 dark:text-gray-400 mb-7">
              Hola <strong className="text-gray-700 dark:text-gray-200">{cita.nombre}</strong>, confirma los detalles de tu cita:
            </p>
            <div className="bg-pink-50/80 dark:bg-gray-700 rounded-2xl border border-pink-100 dark:border-gray-600 p-5 text-left space-y-3 mb-7">
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
            <button
              onClick={handleConfirmar}
              className="w-full py-3 rounded-2xl bg-pink-500 hover:bg-pink-600 text-white font-poppins text-sm font-semibold transition-all cursor-pointer shadow-pink-sm"
            >
              Confirmar mi cita
            </button>
          </>
        )}

        {/* Done */}
        {status === 'done' && (
          <>
            <CheckCircle2 size={52} className="text-green-400 mx-auto mb-4" />
            <h1 className="font-poppins text-xl font-bold text-gray-800 dark:text-gray-100 mb-2">¡Solicitud recibida!</h1>
            <p className="font-poppins text-sm text-gray-500 dark:text-gray-400 mb-6">
              Tu reserva fue registrada. El equipo de Luga Gy la revisará y te enviaremos la confirmación final por correo. ¡Gracias!
            </p>
            {cita && (
              <div className="bg-pink-50/80 dark:bg-gray-700 rounded-2xl border border-pink-100 dark:border-gray-600 p-4 text-left space-y-2 mb-6">
                <p className="font-poppins text-xs text-gray-600 dark:text-gray-300"><span className="font-medium text-pink-400">Servicio:</span> {cita.servicio}</p>
                <p className="font-poppins text-xs text-gray-600 dark:text-gray-300"><span className="font-medium text-pink-400">Fecha:</span> <span className="capitalize">{formatFecha(cita.fecha)}</span></p>
                <p className="font-poppins text-xs text-gray-600 dark:text-gray-300"><span className="font-medium text-pink-400">Hora:</span> {cita.hora?.slice(0, 5)}</p>
              </div>
            )}
            <a href="/" className="inline-block font-poppins text-sm text-pink-400 hover:text-pink-600 transition-colors">
              Volver al inicio →
            </a>
          </>
        )}

        {/* Already confirmed */}
        {status === 'already' && (
          <>
            <CheckCircle2 size={52} className="text-green-300 mx-auto mb-4" />
            <h1 className="font-poppins text-xl font-bold text-gray-800 dark:text-gray-100 mb-2">¡Recibimos tu confirmación!</h1>
            <p className="font-poppins text-sm text-gray-500 dark:text-gray-400 mb-6">
              Tu cita ya fue registrada. En breve el equipo de Luga Gy la revisará y recibirás la confirmación final por correo.
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
              Este enlace no es válido o la cita ya no puede modificarse.
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
