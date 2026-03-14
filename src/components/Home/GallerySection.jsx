import React, { useState } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import SectionTitle from '../UI/SectionTitle';
import FadeIn from '../UI/FadeIn';

const gallery = [
  { id: 1, category: 'nails',    description: 'Uñas acrílicas diseño francés',      emoji: '💅' },
  { id: 2, category: 'lashes',   description: 'Extensiones de pestañas volumen',     emoji: '👁️' },
  {
    id: 3,
    category: 'brows',
    description: 'Diseño y laminado de cejas',
    emoji: '✨',
    before: '/images/antes/cejas_diseno/cejas_diseno_antes.png',
    after:  '/images/despues/cejas_diseno/cejas_diseno_despues.png',
  },
  { id: 4, category: 'pedicure', description: 'Pedicure spa con esmaltado',          emoji: '🦶' },
  { id: 5, category: 'nails',    description: 'Manicure gel color rojo pasión',      emoji: '💅' },
  { id: 6, category: 'lashes',   description: 'Lifting de pestañas natural',         emoji: '💫' },
];

const categoryColors = {
  pedicure: 'from-rose-200 to-rose-400',
  nails:    'from-pink-200 to-pink-400',
  lashes:   'from-purple-200 to-purple-400',
  brows:    'from-amber-200 to-amber-400',
};

/* Mitad antes/después — usa imagen real si está disponible, si no el placeholder de gradiente */
const BeforeHalf = ({ item, gradient }) =>
  item.before ? (
    <div className="w-1/2 relative overflow-hidden">
      <img
        src={item.before}
        alt={`Antes — ${item.description}`}
        className="w-full h-full object-cover"
        loading="lazy"
      />
      <div className="absolute top-2 left-2 bg-black/60 text-white text-xs font-poppins px-2 py-0.5 rounded font-medium">
        ANTES
      </div>
    </div>
  ) : (
    <div className={`w-1/2 relative bg-gradient-to-br ${gradient} opacity-40 flex items-end`}>
      <div className="absolute top-2 left-2 bg-black/60 text-white text-xs font-poppins px-2 py-0.5 rounded font-medium">
        ANTES
      </div>
      <div className="w-full h-full flex items-center justify-center">
        <span className="text-4xl opacity-50">{item.emoji}</span>
      </div>
    </div>
  );

const AfterHalf = ({ item, gradient }) =>
  item.after ? (
    <div className="w-1/2 relative overflow-hidden">
      <img
        src={item.after}
        alt={`Después — ${item.description}`}
        className="w-full h-full object-cover"
        loading="lazy"
      />
      <div className="absolute top-2 right-2 bg-pink-500 text-white text-xs font-poppins px-2 py-0.5 rounded font-medium">
        DESPUÉS
      </div>
    </div>
  ) : (
    <div className={`w-1/2 relative bg-gradient-to-br ${gradient} flex items-end`}>
      <div className="absolute top-2 right-2 bg-pink-500 text-white text-xs font-poppins px-2 py-0.5 rounded font-medium">
        DESPUÉS
      </div>
      <div className="w-full h-full flex items-center justify-center">
        <span className="text-5xl">{item.emoji}</span>
      </div>
    </div>
  );

const GalleryCard = ({ item, onClick }) => {
  const gradient = categoryColors[item.category] || 'from-pink-200 to-pink-400';

  return (
    <button
      className="relative group cursor-pointer rounded-2xl overflow-hidden shadow-card hover:shadow-card-hover transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-pink-400 focus:ring-offset-2 w-full"
      onClick={() => onClick(item)}
      aria-label={`Ver resultado: ${item.description}`}
    >
      <div className="aspect-square flex">
        <BeforeHalf item={item} gradient={gradient} />
        {/* Divider */}
        <div className="absolute inset-y-0 left-1/2 w-0.5 bg-white/80 shadow-lg z-10 -translate-x-px" aria-hidden="true" />
        <AfterHalf item={item} gradient={gradient} />
      </div>

      {/* Hover overlay */}
      <div className="absolute inset-0 bg-pink-900/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
        <span className="font-poppins text-white text-sm font-medium bg-pink-500/80 backdrop-blur-sm px-4 py-2 rounded-full">
          Ver detalles
        </span>
      </div>

      {/* Description */}
      <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/60 to-transparent py-3 px-3">
        <p className="font-poppins text-white text-xs font-medium truncate">{item.description}</p>
      </div>
    </button>
  );
};

const Modal = ({ item, onClose, onPrev, onNext }) => {
  const gradient = categoryColors[item.category] || 'from-pink-200 to-pink-400';

  return (
    <div
      className="fixed inset-0 bg-black/85 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={`Resultado: ${item.description}`}
    >
      <div
        className="relative max-w-2xl w-full bg-white dark:bg-gray-800 rounded-3xl overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-10 w-9 h-9 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-full flex items-center justify-center transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-pink-400"
          aria-label="Cerrar"
        >
          <X size={18} className="text-gray-600 dark:text-gray-300" aria-hidden="true" />
        </button>

        <div className="flex h-64">
          {/* Before */}
          {item.before ? (
            <div className="w-1/2 relative overflow-hidden">
              <img src={item.before} alt={`Antes — ${item.description}`} className="w-full h-full object-cover" />
              <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/60 to-transparent py-2 text-center">
                <p className="font-poppins text-sm font-semibold text-white">ANTES</p>
              </div>
            </div>
          ) : (
            <div className={`w-1/2 bg-gradient-to-br ${gradient} opacity-50 flex items-center justify-center`}>
              <div className="text-center">
                <span className="text-7xl opacity-60">{item.emoji}</span>
                <p className="font-poppins text-sm font-semibold text-gray-700 dark:text-gray-200 mt-2">ANTES</p>
              </div>
            </div>
          )}
          {/* After */}
          {item.after ? (
            <div className="w-1/2 relative overflow-hidden">
              <img src={item.after} alt={`Después — ${item.description}`} className="w-full h-full object-cover" />
              <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/60 to-transparent py-2 text-center">
                <p className="font-poppins text-sm font-semibold text-white">DESPUÉS</p>
              </div>
            </div>
          ) : (
            <div className={`w-1/2 bg-gradient-to-br ${gradient} flex items-center justify-center`}>
              <div className="text-center">
                <span className="text-7xl">{item.emoji}</span>
                <p className="font-poppins text-sm font-semibold text-white mt-2">DESPUÉS</p>
              </div>
            </div>
          )}
        </div>

        <div className="p-5 flex items-center justify-between dark:bg-gray-800">
          <button
            onClick={onPrev}
            className="w-9 h-9 bg-pink-50 dark:bg-pink-900/20 hover:bg-pink-100 dark:hover:bg-gray-700 rounded-full flex items-center justify-center transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-pink-300"
            aria-label="Anterior"
          >
            <ChevronLeft size={18} className="text-pink-400" aria-hidden="true" />
          </button>
          <p className="font-poppins text-gray-700 dark:text-gray-200 font-medium text-sm text-center">
            {item.description}
          </p>
          <button
            onClick={onNext}
            className="w-9 h-9 bg-pink-50 dark:bg-pink-900/20 hover:bg-pink-100 dark:hover:bg-gray-700 rounded-full flex items-center justify-center transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-pink-300"
            aria-label="Siguiente"
          >
            <ChevronRight size={18} className="text-pink-400" aria-hidden="true" />
          </button>
        </div>
      </div>
    </div>
  );
};

const GallerySection = () => {
  const [selected, setSelected] = useState(null);
  const selectedIndex = gallery.findIndex((g) => g.id === selected?.id);

  const openModal = (item) => setSelected(item);
  const closeModal = () => setSelected(null);
  const prevItem = () => setSelected(gallery[(selectedIndex - 1 + gallery.length) % gallery.length]);
  const nextItem = () => setSelected(gallery[(selectedIndex + 1) % gallery.length]);

  return (
    <section id="galeria" className="section-padding bg-white dark:bg-gray-900">
      <div className="container-custom">
        <FadeIn>
          <SectionTitle
            title="Resultados Reales"
            subtitle="Antes y después de nuestros tratamientos. La transformación habla por sí sola."
          />
        </FadeIn>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {gallery.map((item, i) => (
            <FadeIn key={item.id} delay={i * 0.07}>
              <GalleryCard item={item} onClick={openModal} />
            </FadeIn>
          ))}
        </div>
      </div>

      {selected && (
        <Modal item={selected} onClose={closeModal} onPrev={prevItem} onNext={nextItem} />
      )}
    </section>
  );
};

export default GallerySection;
