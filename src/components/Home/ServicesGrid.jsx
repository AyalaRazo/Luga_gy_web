import React, { useEffect, useRef, useState } from 'react';
import ServiceCard from './ServiceCard';
import SectionTitle from '../UI/SectionTitle';
import { getServiciosPublic, getPromocionesPublic } from '../../lib/supabase';
import { promosParaHoy, calcularPrecioEfectivo } from '../../lib/promociones';
import { getStorageUrl } from '../../lib/storage';
import { X, Clock, Tag } from 'lucide-react';
import { scrollToSection } from '../../lib/scrollTo';

const categoryColors = {
  pedicure: 'bg-rose-50 text-rose-500 border-rose-100',
  uñas:     'bg-pink-50 text-pink-500 border-pink-100',
  pestañas: 'bg-purple-50 text-purple-500 border-purple-100',
  cejas:    'bg-amber-50 text-amber-600 border-amber-100',
};

function ServiceModal({ service, onClose }) {
  const overlayRef = useRef(null);

  useEffect(() => {
    if (!service) return;
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [service, onClose]);

  if (!service) return null;

  const categoryClass = categoryColors[service.category] || 'bg-pink-50 text-pink-500 border-pink-100';

  const scrollToBooking = () => {
    onClose();
    setTimeout(() => {
      scrollToSection('reservar');
    }, 200);
  };

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={(e) => { if (e.target === overlayRef.current) onClose(); }}
    >
      <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-fade-in">
        {/* Image */}
        <div className="relative h-56 bg-gradient-to-br from-pink-100 to-rose-200 shrink-0">
          {service.image ? (
            <img
              src={service.image}
              alt={service.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-pink-100 to-rose-200" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />

          {/* Close */}
          <button
            onClick={onClose}
            className="absolute top-3 right-3 w-8 h-8 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-sm transition-all cursor-pointer"
            aria-label="Cerrar"
          >
            <X size={16} className="text-gray-600 dark:text-gray-300" />
          </button>

          {/* Badges */}
          <div className="absolute top-3 left-3 flex gap-2">
            <span className={`border rounded-full px-2.5 py-0.5 text-xs font-poppins font-medium ${categoryClass}`}>
              {service.category.charAt(0).toUpperCase() + service.category.slice(1)}
            </span>
          </div>

          {/* Duration */}
          <div className="absolute bottom-3 right-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full shadow-sm flex items-center gap-1">
            <Clock size={12} className="text-pink-400" />
            <span className="font-poppins text-xs text-gray-600 dark:text-gray-300">{service.duration} min</span>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <h2 className="font-poppins text-xl font-bold text-gray-800 dark:text-gray-100 mb-3">{service.title}</h2>
          <p className="font-poppins text-sm text-gray-500 dark:text-gray-400 leading-relaxed mb-6">{service.description}</p>

          <div className="flex items-center justify-between pt-4 border-t border-pink-50 dark:border-gray-700">
            <div>
              <p className="font-poppins text-xs text-gray-400 dark:text-gray-500 mb-0.5">Precio</p>
              {service.promoActiva ? (
                <div className="flex items-baseline gap-2">
                  <span className="font-poppins text-sm text-gray-400 line-through">${service.price}</span>
                  <span className="font-great-vibes text-4xl text-pink-400 leading-none">${service.precioFinal}</span>
                </div>
              ) : (
                <span className="font-great-vibes text-4xl text-pink-400 leading-none">${service.price}</span>
              )}
            </div>
            <button
              onClick={scrollToBooking}
              className="px-6 py-3 bg-pink-500 hover:bg-pink-600 text-white font-poppins text-sm font-semibold rounded-2xl transition-all shadow-md hover:shadow-pink-200 cursor-pointer"
            >
              Reservar ahora
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Fallback hardcoded (mostrado mientras carga o si falla Supabase)
const FALLBACK = [
  { title: 'Pedicure Spa',            description: 'Tratamiento completo de pies con exfoliación, hidratación profunda y esmaltado de larga duración. Incluye masaje de pies.', price: '350', duration: 60,  image: null, category: 'pedicure' },
  { title: 'Manicure Gel',            description: 'Esmaltado semipermanente de alta calidad. Duración de 2-3 semanas sin perder brillo ni color. Incluye modelado de uñas.',     price: '280', duration: 45,  image: null, category: 'uñas'     },
  { title: 'Uñas Acrílicas',          description: 'Diseño personalizado, forma y largo a elección. Incluye esmaltado en gel y acabado impecable con los mejores productos.',     price: '550', duration: 90,  image: null, category: 'uñas'     },
  { title: 'Extensiones de Pestañas', description: 'Técnica pelo a pelo para una mirada impactante. Estilos: natural, volumen y mega volumen.',                                  price: '850', duration: 120, image: null, category: 'pestañas' },
  { title: 'Lifting de Pestañas',     description: 'Realza tu mirada curvando tus pestañas naturales. Incluye tintado para un efecto más dramático y duradero.',                 price: '650', duration: 60,  image: null, category: 'pestañas' },
  { title: 'Diseño de Cejas',         description: 'Perfilado y depilación profesional. Incluye asesoría de forma ideal para tu rostro.',                                        price: '180', duration: 30,  image: null, category: 'cejas'    },
  { title: 'Laminado de Cejas',       description: 'Cejas fijadas con efecto cepillado por hasta 8 semanas. Resultado natural y definido.',                                       price: '450', duration: 45,  image: null, category: 'cejas'    },
  { title: 'Spa de Pies Completo',    description: 'Pedicure premium con exfoliación, mascarilla, hidratación, esmaltado y masaje de piernas.',                                  price: '550', duration: 75,  image: null, category: 'pedicure' },
];

function dbToCard(s, promosHoy = []) {
  const { precioFinal, promo } = calcularPrecioEfectivo(Number(s.precio), promosHoy, s.id);
  return {
    id:          s.id,
    title:       s.nombre,
    description: s.descripcion ?? '',
    price:       String(Math.round(s.precio)),
    precioFinal: promo ? String(precioFinal) : null,
    promoActiva: promo ?? null,
    duration:    s.duracion,
    image:       getStorageUrl(s.imagen_url) ?? null,
    category:    (s.categoria ?? 'general').toLowerCase(),
  };
}

const ServicesGrid = () => {
  const [services,        setServices]        = useState(FALLBACK);
  const [activeCategory,  setActiveCategory]  = useState('Todos');
  const [categories,      setCategories]      = useState(['Todos', 'Pedicure', 'Uñas', 'Pestañas', 'Cejas']);
  const [selected,        setSelected]        = useState(null);
  const [promosHoy,       setPromosHoy]       = useState([]);

  useEffect(() => {
    Promise.all([getServiciosPublic(), getPromocionesPublic()]).then(
      ([{ data: svcs }, { data: promos }]) => {
        const hoy = promosParaHoy(promos ?? []);
        setPromosHoy(hoy);
        if (!svcs?.length) return;
        const cards = svcs.map(s => dbToCard(s, hoy));
        setServices(cards);
        const cats = ['Todos', ...new Set(svcs.map(s => s.categoria))];
        setCategories(cats);
      }
    );
  }, []);

  const filtered =
    activeCategory === 'Todos'
      ? services
      : services.filter(s => s.category.toLowerCase() === activeCategory.toLowerCase());

  return (
    <section id="servicios" className="section-padding bg-pink-50/40 dark:bg-gray-900">
      <div className="container-custom">
        <SectionTitle
          title="Nuestros Servicios"
          subtitle="Descubre todo lo que tenemos para consentirte y resaltar tu belleza natural"
        />

        {/* Promo banner */}
        {promosHoy.length > 0 && (
          <div className="flex items-center gap-2.5 bg-pink-50 dark:bg-pink-900/20 border border-pink-200 dark:border-pink-800/50 rounded-2xl px-5 py-3 mb-8">
            <Tag size={15} className="text-pink-500 shrink-0" />
            <p className="font-poppins text-sm text-pink-700 dark:text-pink-300">
              <strong>¡Hoy tenemos promociones activas!</strong> Revisa los servicios marcados con descuento.
            </p>
          </div>
        )}

        {/* Category filters */}
        <div className="flex flex-wrap justify-center gap-2 mb-10" role="group" aria-label="Filtrar por categoría">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-5 py-2 rounded-full font-poppins text-sm font-medium transition-all duration-200 border cursor-pointer focus:outline-none focus:ring-2 focus:ring-pink-300 focus:ring-offset-1 ${
                activeCategory === cat
                  ? 'bg-pink-400 text-white border-pink-400 shadow-pink-sm'
                  : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-pink-200 dark:border-gray-600 hover:bg-pink-50 dark:hover:bg-gray-700 hover:border-pink-300 hover:text-pink-500'
              }`}
              aria-pressed={activeCategory === cat}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filtered.map((service, index) => (
            <ServiceCard key={`${service.title}-${index}`} {...service} onSelect={setSelected} />
          ))}
        </div>

        {filtered.length === 0 && (
          <p className="text-center font-poppins text-gray-400 dark:text-gray-500 py-12">
            No hay servicios en esta categoría.
          </p>
        )}
      </div>

      <ServiceModal service={selected} onClose={() => setSelected(null)} />
    </section>
  );
};

export default ServicesGrid;
