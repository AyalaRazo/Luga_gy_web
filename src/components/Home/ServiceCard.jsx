import React from 'react';
import { Clock } from 'lucide-react';
import ElegantButton from '../UI/ElegantButton';

const categoryColors = {
  pedicure: 'bg-rose-50 text-rose-500 border-rose-100',
  nails: 'bg-pink-50 text-pink-500 border-pink-100',
  lashes: 'bg-purple-50 text-purple-500 border-purple-100',
  brows: 'bg-amber-50 text-amber-600 border-amber-100',
};

const ServiceCard = ({ title, description, price, duration, image, icon, category, onSelect }) => {
  const categoryClass = categoryColors[category] || 'bg-pink-50 text-pink-500 border-pink-100';

  const scrollToBooking = () => {
    document.getElementById('reservar')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <article
      className="card-base dark:bg-gray-800 group overflow-hidden cursor-pointer flex flex-col h-full"
      onClick={() => onSelect?.({ title, description, price, duration, image, category })}
    >
      {/* Image */}
      <div className="relative h-52 overflow-hidden bg-gradient-to-br from-pink-100 to-pink-200 shrink-0">
        {image ? (
          <img
            src={image}
            alt={`Servicio de ${title}`}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-pink-100 to-rose-200" aria-hidden="true" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-pink-900/20 to-transparent" aria-hidden="true" />

        {/* Duration badge */}
        <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full shadow-sm flex items-center gap-1">
          <Clock size={12} className="text-pink-400" aria-hidden="true" />
          <span className="font-poppins text-xs text-gray-600 dark:text-gray-300">{duration} min</span>
        </div>

        {/* Category badge */}
        <div className={`absolute top-3 left-3 border rounded-full px-2.5 py-0.5 text-xs font-poppins font-medium ${categoryClass}`}>
          {category.charAt(0).toUpperCase() + category.slice(1)}
        </div>
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col flex-1">
        <div className="mb-2">
          <h3 className="font-poppins text-base font-semibold text-gray-800 dark:text-gray-100 leading-tight">
            {title}
          </h3>
        </div>

        <p className="font-poppins text-sm text-gray-500 dark:text-gray-400 leading-relaxed mb-4 flex-1 line-clamp-3">
          {description}
        </p>

        <div className="flex items-center justify-between mt-auto pt-3 border-t border-pink-50 dark:border-gray-700">
          <div className="flex items-baseline gap-0.5">
            <span className="font-great-vibes text-3xl text-pink-400 leading-none">${price}</span>
          </div>
          <ElegantButton variant="secondary" size="small" onClick={scrollToBooking}>
            RESERVAR
          </ElegantButton>
        </div>
      </div>
    </article>
  );
};

export default ServiceCard;
