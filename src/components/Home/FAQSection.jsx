import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import SectionTitle from '../UI/SectionTitle';
import FadeIn from '../UI/FadeIn';

const faqs = [
  {
    q: '¿Qué servicios ofrece Luga Gy en Mexicali?',
    a: 'Ofrecemos Pedicure Spa ($350 MXN, 60 min), Manicure Gel ($280 MXN, 45 min), Uñas Acrílicas ($550 MXN, 90 min), Extensiones de Pestañas ($850 MXN, 120 min), Lifting de Pestañas ($650 MXN, 60 min), Diseño de Cejas ($180 MXN, 30 min) y Laminado de Cejas ($450 MXN, 45 min). Calificación promedio de 4.8 estrellas con más de 500 clientas.',
  },
  {
    q: '¿Cómo puedo reservar una cita en Luga Gy?',
    a: 'Puedes reservar directamente en este sitio mediante el formulario de reservación en línea (disponible las 24 horas), o por WhatsApp al +52 686 116 2619. Al reservar en línea recibirás una confirmación por correo electrónico. Se recomienda reservar con al menos 24 horas de anticipación para garantizar disponibilidad.',
  },
  {
    q: '¿Dónde está ubicado el salón Luga Gy?',
    a: 'Nos encontramos en Calle Gordiano Guzmán #1400, colonia Independencia, Mexicali, Baja California, México (C.P. 21290). Atendemos lunes a viernes de 10:00 a 20:00 horas y sábados de 10:00 a 18:00 horas. Los domingos permanecemos cerrados.',
  },
  {
    q: '¿Cuánto duran las uñas de manicure gel?',
    a: 'El manicure gel tiene una duración de 2 a 3 semanas sin perder brillo ni color, significativamente más que el esmalte tradicional (5 a 7 días). El servicio incluye modelado de uñas y toma aproximadamente 45 minutos. Para prolongar el resultado recomendamos usar guantes en tareas domésticas y aplicar aceite de cutículas diariamente.',
  },
  {
    q: '¿Qué es el laminado de cejas y cuánto dura?',
    a: 'El laminado de cejas es un tratamiento semipermanente que alisa y fija los vellos hacia arriba, logrando un efecto de cejas llenas y definidas sin necesidad de maquillaje diario. El resultado dura entre 6 y 8 semanas dependiendo del tipo de piel y los cuidados posteriores. La sesión toma 45 minutos y tiene un costo de $450 MXN.',
  },
  {
    q: '¿Las extensiones de pestañas dañan las pestañas naturales?',
    a: 'Cuando se aplican correctamente por profesionales certificadas, las extensiones de pestañas no dañan las pestañas naturales. Utilizamos la técnica pelo a pelo, que consiste en adherir una extensión a cada pestaña natural de forma individual, respetando su ciclo de crecimiento. Los estilos disponibles son: natural, volumen y mega volumen. El servicio dura 120 minutos y tiene un costo de $850 MXN.',
  },
  {
    q: '¿Qué es el lifting de pestañas y cuánto dura?',
    a: 'El lifting de pestañas es un tratamiento que riza y eleva permanentemente las pestañas naturales sin necesidad de extensiones. El efecto dura entre 6 y 8 semanas. Incluimos tintado para un resultado más dramático y expresivo. Es ideal para quienes buscan una mirada abierta con bajo mantenimiento diario. El servicio toma 60 minutos y tiene un costo de $650 MXN.',
  },
  {
    q: '¿Cuánto cuestan las uñas acrílicas?',
    a: 'Las uñas acrílicas tienen un precio de $550 MXN e incluyen diseño personalizado, forma y largo a elección, esmaltado en gel y acabado impecable. El servicio toma 90 minutos. Para rellenos y mantenimiento, contáctanos directamente por WhatsApp al +52 686 116 2619 o reserva en línea.',
  },
  {
    q: '¿Cuáles son los horarios de Luga Gy?',
    a: 'Atendemos de lunes a viernes de 10:00 a 20:00 horas y los sábados de 10:00 a 18:00 horas. Los domingos el salón permanece cerrado. Para garantizar tu cita, se recomienda reservar con anticipación en línea o por WhatsApp al +52 686 116 2619.',
  },
];

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState(null);

  const toggle = (i) => setOpenIndex(prev => (prev === i ? null : i));

  return (
    <section id="faq" className="section-padding bg-gray-50 dark:bg-gray-800">
      <div className="container-custom">
        <FadeIn delay={0}>
          <SectionTitle title="Preguntas frecuentes" subtitle="Todo lo que necesitas saber antes de tu cita" />
        </FadeIn>

        <FadeIn delay={0.08}>
          <div className="mt-10 max-w-3xl mx-auto divide-y divide-gray-200 dark:divide-gray-700">
            {faqs.map(({ q, a }, i) => (
              <div key={i}>
                <button
                  onClick={() => toggle(i)}
                  className="w-full flex items-center justify-between gap-4 py-4 text-left cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-pink-300 rounded"
                  aria-expanded={openIndex === i}
                >
                  <span className="font-poppins text-sm font-medium text-gray-800 dark:text-gray-100 leading-snug">
                    {q}
                  </span>
                  <ChevronDown
                    size={18}
                    className={`shrink-0 text-pink-400 transition-transform duration-200 ${openIndex === i ? 'rotate-180' : ''}`}
                  />
                </button>

                {openIndex === i && (
                  <div className="pb-4">
                    <p className="font-poppins text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                      {a}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
