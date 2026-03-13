import React from 'react';
import { MapPin, Clock, Phone, ExternalLink } from 'lucide-react';
import { BUSINESS_INFO, SOCIAL_LINKS, WhatsAppIcon } from '../UI/SocialIcons';
import SectionTitle from '../UI/SectionTitle';

const HOURS = [
  { day: 'Lunes – Viernes', hours: '10:00 – 20:00' },
  { day: 'Sábados',         hours: '10:00 – 18:00' },
  { day: 'Domingos',        hours: 'Cerrado'        },
];

const MAP_EMBED =
  'https://maps.google.com/maps?q=Calle+Gordiano+Guzman+1400+Independencia+Mexicali+BC+Mexico&output=embed';

export default function LocationSection() {
  return (
    <section id="ubicacion" className="section-padding bg-white">
      <div className="container-custom">
        <SectionTitle
          title="¿Dónde estamos?"
          subtitle="Visítanos en el corazón de Mexicali. Siempre listas para consentirte"
        />

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-stretch">

          {/* Mapa */}
          <div className="lg:col-span-3 rounded-3xl overflow-hidden shadow-lg border border-pink-100 min-h-72">
            <iframe
              title="Ubicación Luga Gy"
              src={MAP_EMBED}
              width="100%"
              height="100%"
              style={{ border: 0, minHeight: '320px', display: 'block' }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>

          {/* Info */}
          <div className="lg:col-span-2 flex flex-col gap-5">

            {/* Dirección */}
            <div className="bg-pink-50/60 rounded-2xl p-5 flex gap-4">
              <div className="w-10 h-10 rounded-xl bg-pink-500 flex items-center justify-center shrink-0">
                <MapPin size={18} className="text-white" />
              </div>
              <div>
                <p className="font-poppins text-xs font-semibold text-pink-500 uppercase tracking-wide mb-1">
                  Dirección
                </p>
                <p className="font-poppins text-sm text-gray-700 leading-relaxed">
                  {BUSINESS_INFO.address}
                </p>
                <a
                  href={BUSINESS_INFO.mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 mt-2 font-poppins text-xs text-pink-500 hover:text-pink-600 transition-colors cursor-pointer"
                >
                  Ver en Google Maps
                  <ExternalLink size={11} />
                </a>
              </div>
            </div>

            {/* Horarios */}
            <div className="bg-pink-50/60 rounded-2xl p-5 flex gap-4">
              <div className="w-10 h-10 rounded-xl bg-pink-500 flex items-center justify-center shrink-0">
                <Clock size={18} className="text-white" />
              </div>
              <div className="flex-1">
                <p className="font-poppins text-xs font-semibold text-pink-500 uppercase tracking-wide mb-3">
                  Horarios
                </p>
                <ul className="space-y-2">
                  {HOURS.map(({ day, hours }) => (
                    <li key={day} className="flex items-center justify-between gap-4">
                      <span className="font-poppins text-sm text-gray-600">{day}</span>
                      <span className={`font-poppins text-sm font-medium ${hours === 'Cerrado' ? 'text-gray-400' : 'text-gray-800'}`}>
                        {hours}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Contacto */}
            <div className="bg-pink-50/60 rounded-2xl p-5 flex gap-4">
              <div className="w-10 h-10 rounded-xl bg-pink-500 flex items-center justify-center shrink-0">
                <Phone size={18} className="text-white" />
              </div>
              <div>
                <p className="font-poppins text-xs font-semibold text-pink-500 uppercase tracking-wide mb-1">
                  Contacto
                </p>
                <p className="font-poppins text-sm text-gray-700 mb-3">{SOCIAL_LINKS.whatsappNumber}</p>
                <a
                  href={SOCIAL_LINKS.whatsapp}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white font-poppins text-sm font-semibold px-4 py-2 rounded-xl transition-all cursor-pointer shadow-sm"
                >
                  <WhatsAppIcon size={15} />
                  Escribinos
                </a>
              </div>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}
