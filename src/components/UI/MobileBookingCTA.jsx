import React, { useEffect, useState } from 'react';
import { scrollToSection } from '../../lib/scrollTo';

export default function MobileBookingCTA() {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const target = document.getElementById('reservar');
    if (!target) return;

    const observer = new IntersectionObserver(
      ([entry]) => setVisible(!entry.isIntersecting),
      { threshold: 0.1 }
    );
    observer.observe(target);
    return () => observer.disconnect();
  }, []);

  if (!visible) return null;

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 lg:hidden">
      <button
        onClick={() => scrollToSection('reservar')}
        className="btn-primary shadow-lg px-8 py-3 text-sm"
        aria-label="Ir al formulario de reserva"
      >
        Reservar cita
      </button>
    </div>
  );
}
