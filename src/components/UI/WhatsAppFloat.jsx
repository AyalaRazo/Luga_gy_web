import React, { useState, useEffect } from 'react';
import { WhatsAppIcon, SOCIAL_LINKS } from './SocialIcons';
import { X } from 'lucide-react';

const WhatsAppFloat = () => {
  const [showTooltip, setShowTooltip] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setVisible(true);
      setShowTooltip(true);
    }, 3000);

    const tooltipTimeout = setTimeout(() => setShowTooltip(false), 8000);

    return () => {
      clearTimeout(timeout);
      clearTimeout(tooltipTimeout);
    };
  }, []);

  if (!visible) return null;

  return (
    <div className="fixed bottom-6 right-6 z-40 flex items-end gap-3">
      {/* Tooltip */}
      {showTooltip && (
        <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-pink-lg border border-pink-100 dark:border-gray-700 px-4 py-3 max-w-xs animate-fade-in-up">
          <button
            onClick={() => setShowTooltip(false)}
            className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-gray-200 hover:bg-gray-300 rounded-full flex items-center justify-center cursor-pointer transition-colors focus:outline-none"
            aria-label="Cerrar mensaje"
          >
            <X size={10} className="text-gray-600" aria-hidden="true" />
          </button>
          <p className="font-poppins text-sm text-gray-700 dark:text-gray-200 font-medium">
            ¡Hola! ¿Querés reservar una cita?
          </p>
          <p className="font-poppins text-xs text-gray-400 dark:text-gray-500 mt-0.5">
            Escribinos por WhatsApp ahora
          </p>
          {/* Arrow */}
          <div
            className="absolute bottom-3 -right-2 w-0 h-0 border-t-8 border-b-8 border-l-8 border-transparent border-l-white"
            aria-hidden="true"
          />
        </div>
      )}

      {/* FAB button */}
      <a
        href={`${SOCIAL_LINKS.whatsapp}?text=Hola%20Luga%20Gy%21%20Quiero%20reservar%20una%20cita.`}
        target="_blank"
        rel="noopener noreferrer"
        className="w-14 h-14 bg-green-500 hover:bg-green-600 active:bg-green-700 rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-offset-2"
        aria-label="Contactar por WhatsApp"
        onClick={() => setShowTooltip(false)}
      >
        <WhatsAppIcon size={28} className="text-white" />
      </a>
    </div>
  );
};

export default WhatsAppFloat;
