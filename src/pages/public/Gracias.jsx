import React, { useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { CheckCircle2, Mail, CalendarCheck } from 'lucide-react';
import { trackSchedule } from '../../lib/metaPixel';

function formatFecha(fechaStr) {
  if (!fechaStr) return '';
  const d = new Date(fechaStr + 'T12:00:00');
  return d.toLocaleDateString('es-MX', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
}

export default function Gracias() {
  const { state } = useLocation();
  const { servicio, valor, fecha, hora, nombre, email } = state ?? {};

  useEffect(() => {
    trackSchedule(servicio ?? '', valor ?? 0);
  }, []);

  return (
    <div className="min-h-screen bg-pink-50/60 flex flex-col items-center justify-center px-4 py-16">
      {/* Logo / marca */}
      <p className="font-great-vibes text-4xl text-pink-400 mb-8">Luga Gy</p>

      <div className="bg-white rounded-3xl shadow-md border border-pink-100 max-w-md w-full p-8 flex flex-col items-center gap-6 text-center">
        {/* Icono éxito */}
        <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center">
          <CheckCircle2 size={36} className="text-green-400" />
        </div>

        <div>
          <h1 className="font-great-vibes text-3xl text-pink-400 mb-1">¡Cita reservada!</h1>
          {nombre && (
            <p className="font-poppins text-gray-600 text-sm">
              Gracias, <span className="font-semibold text-gray-800">{nombre}</span>. Pronto te contactamos para confirmar.
            </p>
          )}
          {!nombre && (
            <p className="font-poppins text-gray-500 text-sm">
              Tu solicitud de cita fue recibida.
            </p>
          )}
        </div>

        {/* Resumen */}
        {(servicio || fecha || hora) && (
          <div className="w-full bg-pink-50 border border-pink-100 rounded-2xl p-4 text-left space-y-2">
            <div className="flex items-center gap-2 mb-1">
              <CalendarCheck size={14} className="text-pink-400 shrink-0" />
              <span className="font-poppins text-xs font-semibold text-pink-400 uppercase tracking-wide">Detalle de tu cita</span>
            </div>
            {servicio && (
              <p className="font-poppins text-sm text-gray-700">
                <span className="text-gray-400 font-medium">Servicio:</span> {servicio}
              </p>
            )}
            {fecha && (
              <p className="font-poppins text-sm text-gray-700">
                <span className="text-gray-400 font-medium">Fecha:</span> {formatFecha(fecha)}
              </p>
            )}
            {hora && (
              <p className="font-poppins text-sm text-gray-700">
                <span className="text-gray-400 font-medium">Hora:</span> {hora}
              </p>
            )}
          </div>
        )}

        {/* Aviso de correo */}
        <div className="w-full flex items-start gap-3 bg-blue-50 border border-blue-100 rounded-2xl p-4 text-left">
          <Mail size={16} className="text-blue-400 shrink-0 mt-0.5" />
          <p className="font-poppins text-sm text-blue-700">
            Te enviamos una confirmación a{' '}
            {email
              ? <strong className="text-blue-800">{email}</strong>
              : 'tu correo electrónico'
            }
            . Revisá también tu carpeta de spam.
          </p>
        </div>

        {/* CTA */}
        <Link
          to="/"
          className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-pink-400 hover:bg-pink-500 active:bg-pink-600 text-white font-poppins font-semibold text-sm transition-colors"
        >
          Volver al inicio
        </Link>
      </div>

      <p className="font-poppins text-xs text-gray-400 mt-6">
        © {new Date().getFullYear()} Luga Gy — Salón de Belleza
      </p>
    </div>
  );
}
