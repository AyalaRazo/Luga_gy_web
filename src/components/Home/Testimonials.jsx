import React from 'react';
import { Star } from 'lucide-react';
import SectionTitle from '../UI/SectionTitle';
import { TikTokIcon, SOCIAL_LINKS } from '../UI/SocialIcons';

const testimonials = [
  {
    id: 1,
    name: 'María González',
    initials: 'MG',
    service: 'Extensiones de Pestañas',
    rating: 5,
    comment:
      '¡Excelente servicio! Quedé encantada con mis pestañas. Muy profesionales y el ambiente es súper acogedor. Ya saqué turno para el mes que viene.',
    date: 'Hace 2 días',
    color: 'bg-pink-400',
  },
  {
    id: 2,
    name: 'Carolina Pérez',
    initials: 'CP',
    service: 'Manicure Gel',
    rating: 5,
    comment:
      'Las uñas me quedaron perfectas, duran muchísimo y los colores son hermosos. Además el trato es increíble, me sentí muy cuidada. 100% recomendado.',
    date: 'Hace 1 semana',
    color: 'bg-rose-400',
  },
  {
    id: 3,
    name: 'Valentina Ruiz',
    initials: 'VR',
    service: 'Diseño de Cejas',
    rating: 5,
    comment:
      'Por fin encontré un lugar que entiende lo que quiero con mis cejas. Quedaron naturales pero perfectamente definidas. ¡Me encantó el resultado!',
    date: 'Hace 3 días',
    color: 'bg-amber-400',
  },
  {
    id: 4,
    name: 'Sofía Morales',
    initials: 'SM',
    service: 'Pedicure Spa',
    rating: 5,
    comment:
      'La experiencia de pedicure es súper relajante, el masaje incluido es maravilloso. Salí con los pies hermosos y el alma renovada. Volvería siempre.',
    date: 'Hace 5 días',
    color: 'bg-purple-400',
  },
];

const StarRating = ({ rating }) => (
  <div className="flex items-center gap-0.5" role="img" aria-label={`${rating} estrellas de 5`}>
    {[...Array(5)].map((_, i) => (
      <Star
        key={i}
        size={14}
        className={i < rating ? 'fill-gold-400 text-gold-400' : 'text-gray-200'}
        aria-hidden="true"
      />
    ))}
  </div>
);

const TestimonialCard = ({ testimonial }) => (
  <article className="card-base p-6 flex flex-col gap-4">
    <div className="flex items-start gap-4">
      {/* Avatar */}
      <div
        className={`w-12 h-12 ${testimonial.color} rounded-full flex items-center justify-center shrink-0`}
        aria-hidden="true"
      >
        <span className="font-poppins font-semibold text-white text-sm">{testimonial.initials}</span>
      </div>

      {/* Meta */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-poppins font-semibold text-gray-800 text-sm leading-tight">
            {testimonial.name}
          </h3>
          <span className="font-poppins text-xs text-gray-400 shrink-0">{testimonial.date}</span>
        </div>
        <p className="font-poppins text-xs text-pink-400 mt-0.5">{testimonial.service}</p>
        <div className="mt-1.5">
          <StarRating rating={testimonial.rating} />
        </div>
      </div>
    </div>

    {/* Comment */}
    <blockquote className="font-poppins text-sm text-gray-600 leading-relaxed border-l-2 border-pink-200 pl-3">
      "{testimonial.comment}"
    </blockquote>
  </article>
);

const Testimonials = () => (
  <section id="reseñas" className="section-padding bg-pink-50/40">
    <div className="container-custom">
      <SectionTitle
        title="Lo que dicen nuestras clientas"
        subtitle="Experiencias reales de mujeres que confían en Luga Gy"
      />

      {/* Overall rating */}
      <div className="flex justify-center mb-10">
        <div className="bg-white rounded-2xl px-8 py-5 shadow-card border border-pink-100 flex items-center gap-6">
          <div className="text-center">
            <div className="font-playfair text-5xl font-bold text-pink-400">4.8</div>
            <StarRating rating={5} />
            <p className="font-poppins text-xs text-gray-400 mt-1">Calificación promedio</p>
          </div>
          <div className="h-12 w-px bg-pink-100" aria-hidden="true" />
          <div className="text-center">
            <div className="font-playfair text-5xl font-bold text-pink-400">500+</div>
            <p className="font-poppins text-xs text-gray-400 mt-1">Clientas satisfechas</p>
          </div>
        </div>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {testimonials.map((t) => (
          <TestimonialCard key={t.id} testimonial={t} />
        ))}
      </div>

      {/* TikTok reviews link */}
      <div className="text-center mt-10">
        <p className="font-poppins text-sm text-gray-400 mb-3">
          Mirá más reseñas y procesos en nuestro TikTok
        </p>
        <a
          href={SOCIAL_LINKS.tiktok}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 font-poppins text-sm text-pink-400 hover:text-pink-500 transition-colors cursor-pointer focus:outline-none focus:underline"
        >
          <TikTokIcon size={16} />
          {SOCIAL_LINKS.tiktokHandle}
        </a>
      </div>
    </div>
  </section>
);

export default Testimonials;
