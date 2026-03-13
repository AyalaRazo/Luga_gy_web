import React from 'react';
import { Heart, MapPin, Clock, Phone } from 'lucide-react';
import { TikTokIcon, InstagramIcon, WhatsAppIcon, FacebookIcon, SOCIAL_LINKS, BUSINESS_INFO } from '../UI/SocialIcons';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-white">
      {/* Main footer */}
      <div className="container-custom py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">

          {/* Brand */}
          <div className="lg:col-span-1">
            <div className="mb-4">
              <img src="/logo.png" alt="Luga Gy" className="h-14 w-auto object-contain" />
            </div>
            <p className="font-poppins text-sm text-gray-400 leading-relaxed mb-5">
              Especialistas en belleza femenina. Tu lugar de confianza para lucir radiante cada día.
            </p>
            {/* Social links */}
            <div className="flex items-center gap-3 flex-wrap">
              <a
                href={SOCIAL_LINKS.tiktok}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-white/10 hover:bg-pink-500 rounded-full flex items-center justify-center transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-pink-400 cursor-pointer"
                aria-label="TikTok de Luga Gy"
              >
                <TikTokIcon size={18} />
              </a>
              <a
                href={SOCIAL_LINKS.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-white/10 hover:bg-pink-500 rounded-full flex items-center justify-center transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-pink-400 cursor-pointer"
                aria-label="Instagram de Luga Gy"
              >
                <InstagramIcon size={18} />
              </a>
              <a
                href={SOCIAL_LINKS.facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-white/10 hover:bg-blue-600 rounded-full flex items-center justify-center transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-400 cursor-pointer"
                aria-label="Facebook de Luga Gy"
              >
                <FacebookIcon size={18} />
              </a>
              <a
                href={SOCIAL_LINKS.whatsapp}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-white/10 hover:bg-green-500 rounded-full flex items-center justify-center transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-green-400 cursor-pointer"
                aria-label="WhatsApp de Luga Gy"
              >
                <WhatsAppIcon size={18} />
              </a>
            </div>
          </div>

          {/* Services */}
          <div>
            <h3 className="font-poppins text-sm font-semibold tracking-widest text-pink-300 uppercase mb-5">
              Servicios
            </h3>
            <ul className="space-y-2.5">
              {[
                'Pedicure Spa',
                'Manicure Gel',
                'Uñas Acrílicas',
                'Extensiones de Pestañas',
                'Lifting de Pestañas',
                'Diseño de Cejas',
                'Laminado de Cejas',
              ].map((service) => (
                <li key={service}>
                  <a
                    href="#servicios"
                    className="font-poppins text-sm text-gray-400 hover:text-pink-300 transition-colors duration-200 focus:outline-none focus:text-pink-300 cursor-pointer"
                  >
                    {service}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Hours */}
          <div>
            <h3 className="font-poppins text-sm font-semibold tracking-widest text-pink-300 uppercase mb-5">
              Horarios
            </h3>
            <ul className="space-y-3">
              {[
                { day: 'Lunes – Viernes', hours: '10:00 – 20:00' },
                { day: 'Sábados', hours: '10:00 – 18:00' },
                { day: 'Domingos', hours: 'Cerrado' },
              ].map(({ day, hours }) => (
                <li key={day} className="flex items-start gap-2">
                  <Clock size={14} className="text-pink-400 mt-0.5 shrink-0" aria-hidden="true" />
                  <div>
                    <span className="font-poppins text-sm text-gray-300 block">{day}</span>
                    <span className={`font-poppins text-xs ${hours === 'Cerrado' ? 'text-gray-500' : 'text-gray-400'}`}>
                      {hours}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-poppins text-sm font-semibold tracking-widest text-pink-300 uppercase mb-5">
              Contacto
            </h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <Phone size={16} className="text-pink-400 mt-0.5 shrink-0" aria-hidden="true" />
                <div>
                  <span className="font-poppins text-sm text-gray-300 block">WhatsApp</span>
                  <a
                    href={SOCIAL_LINKS.whatsapp}
                    className="font-poppins text-sm text-gray-400 hover:text-pink-300 transition-colors cursor-pointer focus:outline-none focus:text-pink-300"
                  >
                    {SOCIAL_LINKS.whatsappNumber}
                  </a>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <MapPin size={16} className="text-pink-400 mt-0.5 shrink-0" aria-hidden="true" />
                <div>
                  <span className="font-poppins text-sm text-gray-300 block">Dirección</span>
                  <a
                    href={BUSINESS_INFO.mapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-poppins text-sm text-gray-400 hover:text-pink-300 transition-colors leading-snug block cursor-pointer focus:outline-none"
                  >
                    {BUSINESS_INFO.address}
                  </a>
                </div>
              </li>
            </ul>

            <a
              href={SOCIAL_LINKS.whatsapp}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 inline-flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white font-poppins text-sm font-medium px-5 py-2.5 rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-green-400 cursor-pointer shadow-lg"
            >
              <WhatsAppIcon size={16} />
              Escribinos
            </a>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/10">
        <div className="container-custom py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="font-poppins text-xs text-gray-500">
            © {currentYear} Luga Gy. Todos los derechos reservados.
          </p>
          <p className="font-poppins text-xs text-gray-500 flex items-center gap-1">
            Hecho con <Heart size={12} className="text-pink-400 fill-pink-400" aria-hidden="true" /> en Mexicali B.C, México
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
