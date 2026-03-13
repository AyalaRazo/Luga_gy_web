import React from 'react';

const CONFIG = {
  pendiente:     { label: 'Pendiente',         bg: 'bg-amber-100',  text: 'text-amber-700',  dot: 'bg-amber-400'  },
  por_confirmar: { label: 'Por confirmar',     bg: 'bg-blue-100',   text: 'text-blue-700',   dot: 'bg-blue-500'   },
  confirmada:    { label: 'Confirmada',        bg: 'bg-green-100',  text: 'text-green-700',  dot: 'bg-green-500'  },
  cancelada:     { label: 'Cancelada',         bg: 'bg-red-100',    text: 'text-red-700',    dot: 'bg-red-400'    },
  completada:    { label: 'Completada',        bg: 'bg-purple-100', text: 'text-purple-700', dot: 'bg-purple-500' },
};

export default function CitaStatusBadge({ estado }) {
  const cfg = CONFIG[estado] ?? CONFIG.pendiente;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium font-poppins ${cfg.bg} ${cfg.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
}
