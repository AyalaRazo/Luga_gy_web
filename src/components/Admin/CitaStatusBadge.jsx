import React from 'react';
import Tooltip from '../UI/Tooltip';

const CONFIG = {
  pendiente: {
    label:  'Pendiente',
    bg:     'bg-amber-100',
    text:   'text-amber-700',
    dot:    'bg-amber-400',
    tip:    'La clienta reservó pero aún no confirmó por correo. Espera que haga clic en el link enviado.',
  },
  por_confirmar: {
    label:  'Por confirmar',
    bg:     'bg-blue-100',
    text:   'text-blue-700',
    dot:    'bg-blue-500',
    tip:    'La clienta confirmó su reserva por correo. Pendiente de aprobación del administrador. Envía el correo de confirmación final.',
  },
  confirmada: {
    label:  'Confirmada',
    bg:     'bg-green-100',
    text:   'text-green-700',
    dot:    'bg-green-500',
    tip:    'Cita aprobada por el administrador. La clienta recibió confirmación.',
  },
  completada: {
    label:  'Completada',
    bg:     'bg-purple-100',
    text:   'text-purple-700',
    dot:    'bg-purple-500',
    tip:    'El servicio fue realizado. El ingreso se registra en el reporte.',
  },
  cancelada: {
    label:  'Cancelada',
    bg:     'bg-red-100',
    text:   'text-red-600',
    dot:    'bg-red-400',
    tip:    'Cita cancelada. No se registra ingreso.',
  },
  solicitud_cancelacion: {
    label:  'Sol. cancelación',
    bg:     'bg-amber-100',
    text:   'text-amber-700',
    dot:    'bg-amber-500',
    tip:    'La clienta solicitó cancelar. Acepta o rechaza la solicitud desde el panel.',
  },
};

export default function CitaStatusBadge({ estado, showTooltip = true }) {
  const cfg = CONFIG[estado] ?? CONFIG.pendiente;

  const badge = (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium font-poppins cursor-default ${cfg.bg} ${cfg.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${cfg.dot}`} />
      {cfg.label}
    </span>
  );

  if (!showTooltip || !cfg.tip) return badge;

  return (
    <Tooltip content={cfg.tip} position="top" maxWidth="max-w-[220px]">
      {badge}
    </Tooltip>
  );
}
