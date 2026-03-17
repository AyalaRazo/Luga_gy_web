import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Mail, MousePointerClick, UserCheck, CheckCircle2, XCircle, Info } from 'lucide-react';

const STEPS = [
  {
    estado:  'pendiente',
    label:   'Pendiente',
    bg:      'bg-amber-50 border-amber-200 dark:bg-amber-900/20 dark:border-amber-700',
    dot:     'bg-amber-400',
    text:    'text-amber-700 dark:text-amber-400',
    icon:    MousePointerClick,
    iconBg:  'bg-amber-100 dark:bg-amber-800/40',
    desc:    'Cliente llena el formulario web y reserva una cita.',
    trigger: null,
  },
  {
    estado:  'arrow-email',
    label:   null,
    arrow:   true,
    arrowLabel: '✉️ Email al cliente con link de confirmar / cancelar',
    arrowColor: 'text-amber-500',
  },
  {
    estado:  'por_confirmar',
    label:   'Por confirmar',
    bg:      'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-700',
    dot:     'bg-blue-500',
    text:    'text-blue-700 dark:text-blue-400',
    icon:    Mail,
    iconBg:  'bg-blue-100 dark:bg-blue-800/40',
    desc:    'Cliente hizo clic en "Confirmar mi cita" desde el correo.',
    trigger: null,
  },
  {
    estado:  'arrow-admin',
    label:   null,
    arrow:   true,
    arrowLabel: '✉️ Email al admin avisando que el cliente confirmó',
    arrowColor: 'text-blue-500',
  },
  {
    estado:  'confirmada',
    label:   'Confirmada',
    bg:      'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-700',
    dot:     'bg-green-500',
    text:    'text-green-700 dark:text-green-400',
    icon:    UserCheck,
    iconBg:  'bg-green-100 dark:bg-green-800/40',
    desc:    'Admin aprobó la cita. Puede enviar correo de confirmación final al cliente.',
    trigger: 'Admin envía correo ó cambia estado manualmente',
  },
  {
    estado:  'arrow-confirm',
    label:   null,
    arrow:   true,
    arrowLabel: '✉️ Email de confirmación final al cliente (opcional)',
    arrowColor: 'text-green-500',
  },
  {
    estado:  'completada',
    label:   'Completada',
    bg:      'bg-purple-50 border-purple-200 dark:bg-purple-900/20 dark:border-purple-700',
    dot:     'bg-purple-500',
    text:    'text-purple-700 dark:text-purple-400',
    icon:    CheckCircle2,
    iconBg:  'bg-purple-100 dark:bg-purple-800/40',
    desc:    'El servicio se realizó. Se registra el ingreso en el reporte.',
    trigger: 'Admin marca como completada',
  },
];

const EXTRAS = [
  {
    label: 'Cancelada',
    bg:    'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-700',
    dot:   'bg-red-400',
    text:  'text-red-600 dark:text-red-400',
    icon:  XCircle,
    iconBg:'bg-red-100 dark:bg-red-800/40',
    desc:  'La clienta solicitó cancelar y el admin aceptó, o el admin canceló directamente.',
  },
];

export default function CitaFlowGuide() {
  const [open, setOpen] = useState(false);

  return (
    <div className="mb-5 rounded-2xl border border-blue-100 dark:border-blue-900/40 bg-blue-50/60 dark:bg-blue-950/20 overflow-hidden">
      {/* Toggle header */}
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center gap-3 px-5 py-3.5 text-left hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-colors cursor-pointer"
      >
        <div className="w-7 h-7 rounded-lg bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center shrink-0">
          <Info size={14} className="text-blue-500" />
        </div>
        <div className="flex-1">
          <p className="font-poppins text-sm font-semibold text-blue-700 dark:text-blue-400">
            Flujo de estados de las citas
          </p>
          <p className="font-poppins text-xs text-blue-500/80 dark:text-blue-500 mt-0.5">
            ¿Cómo funciona el proceso de reserva? Ver guía
          </p>
        </div>
        {open
          ? <ChevronUp size={15} className="text-blue-400 shrink-0" />
          : <ChevronDown size={15} className="text-blue-400 shrink-0" />
        }
      </button>

      {/* Content */}
      {open && (
        <div className="px-5 pb-6 pt-1">
          {/* Main flow */}
          <div className="flex flex-col items-center gap-0 w-full max-w-lg mx-auto">
            {STEPS.map((step, i) => {
              if (step.arrow) {
                return (
                  <div key={i} className="flex flex-col items-center gap-0.5 py-1">
                    <div className="w-0.5 h-4 bg-gray-200 dark:bg-gray-700" />
                    <span className={`font-poppins text-[11px] font-medium ${step.arrowColor} bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-full px-3 py-0.5 shadow-sm`}>
                      {step.arrowLabel}
                    </span>
                    <div className="w-0.5 h-4 bg-gray-200 dark:bg-gray-700" />
                    <div className="w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-gray-300 dark:border-t-gray-600" />
                  </div>
                );
              }

              const Icon = step.icon;
              return (
                <div key={i} className={`w-full border rounded-xl p-4 ${step.bg}`}>
                  <div className="flex items-start gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${step.iconBg}`}>
                      <Icon size={15} className={step.text} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className={`w-2 h-2 rounded-full shrink-0 ${step.dot}`} />
                        <span className={`font-poppins text-xs font-bold uppercase tracking-wide ${step.text}`}>
                          {step.label}
                        </span>
                      </div>
                      <p className="font-poppins text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
                        {step.desc}
                      </p>
                      {step.trigger && (
                        <p className="font-poppins text-[11px] text-gray-400 dark:text-gray-500 mt-1">
                          → {step.trigger}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Divider */}
          <div className="flex items-center gap-3 my-4 max-w-lg mx-auto">
            <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
            <span className="font-poppins text-[11px] text-gray-400 dark:text-gray-500">estados alternativos</span>
            <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
          </div>

          {/* Extra states */}
          <div className="flex flex-col gap-2 max-w-lg mx-auto">
            {EXTRAS.map((step) => {
              const Icon = step.icon;
              return (
                <div key={step.label} className={`w-full border rounded-xl p-4 ${step.bg}`}>
                  <div className="flex items-start gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${step.iconBg}`}>
                      <Icon size={15} className={step.text} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className={`w-2 h-2 rounded-full shrink-0 ${step.dot}`} />
                        <span className={`font-poppins text-xs font-bold uppercase tracking-wide ${step.text}`}>
                          {step.label}
                        </span>
                      </div>
                      <p className="font-poppins text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
                        {step.desc}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Tip */}
          <p className="text-center font-poppins text-[11px] text-gray-400 dark:text-gray-500 mt-4">
            💡 Pasa el cursor sobre cualquier badge de estado para ver su descripción.
          </p>
        </div>
      )}
    </div>
  );
}
