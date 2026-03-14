import React from 'react';
import { Sparkles, ChevronDown } from 'lucide-react';
import ElegantButton from '../UI/ElegantButton';
import { scrollToSection } from '../../lib/scrollTo';
import FadeIn from '../UI/FadeIn';

const FloatingBadge = ({ icon, label, className }) => (
  <div
    className={`absolute bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-2xl px-4 py-2.5 shadow-pink-md
                flex items-center gap-2 border border-pink-100 dark:border-gray-700 ${className}`}
  >
    <span className="text-lg" aria-hidden="true">{icon}</span>
    <span className="font-poppins text-xs font-medium text-gray-700 dark:text-gray-200 whitespace-nowrap">{label}</span>
  </div>
);

const HeroSection = () => {
  return (
    <section
      id="inicio"
      className="relative min-h-screen flex items-center overflow-hidden bg-hero-gradient dark:bg-gray-900 pt-20"
      aria-label="Sección principal"
    >
      {/* Background decorative circles — blur-2xl es menos costoso en GPU */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
        <div className="absolute -top-32 -right-32 w-96 h-96 bg-pink-200/30 rounded-full blur-2xl" />
        <div className="absolute -bottom-40 -left-20 w-80 h-80 bg-pink-300/20 rounded-full blur-2xl" />
      </div>

      <div className="container-custom relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center min-h-[85vh]">

          {/* Left: Text content */}
          <FadeIn delay={0.1} className="flex flex-col gap-6 text-center lg:text-left">
            {/* Tag */}
            <div className="inline-flex items-center gap-2 bg-pink-100/80 text-pink-600 rounded-full px-4 py-1.5 text-xs font-poppins font-medium tracking-wide w-fit mx-auto lg:mx-0">
              <Sparkles size={14} aria-hidden="true" />
              Belleza profesional a tu alcance
            </div>

            {/* Main heading */}
            <div>
              <h1 className="font-great-vibes text-7xl md:text-8xl lg:text-9xl text-pink-400 leading-none mb-3">
                Luga Gy
              </h1>
              <p className="font-playfair text-2xl md:text-3xl text-gray-700 dark:text-gray-200 font-medium leading-snug">
                Tu salón de belleza de{' '}
                <span className="text-pink-400 italic">confianza</span>
              </p>
            </div>

            {/* Description */}
            <p className="font-poppins text-gray-500 dark:text-gray-400 text-lg leading-relaxed max-w-lg mx-auto lg:mx-0">
              Especialistas en <strong className="text-pink-500 font-medium">Pedicure</strong>,{' '}
              <strong className="text-pink-500 font-medium">Nails</strong>,{' '}
              <strong className="text-pink-500 font-medium">Lashes</strong> y{' '}
              <strong className="text-pink-500 font-medium">Brows</strong>. Porque mereces sentirte
              hermosa cada día.
            </p>

            {/* Stats */}
            <div className="flex items-center gap-6 justify-center lg:justify-start">
              {[
                { value: '500+', label: 'Clientas felices' },
                { value: '4.8★', label: 'Calificación promedio' },
              ].map(({ value, label }) => (
                <div key={label} className="text-center lg:text-left">
                  <div className="font-playfair text-2xl font-bold text-pink-400">{value}</div>
                  <div className="font-poppins text-xs text-gray-500 dark:text-gray-400 mt-0.5">{label}</div>
                </div>
              ))}
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
              <ElegantButton
                size="large"
                onClick={() => scrollToSection('reservar')}
              >
                <Sparkles size={16} aria-hidden="true" />
                RESERVAR CITA
              </ElegantButton>
              <ElegantButton
                variant="secondary"
                size="large"
                onClick={() => scrollToSection('servicios')}
              >
                VER SERVICIOS
              </ElegantButton>
            </div>
          </FadeIn>

          {/* Right: Visual card */}
          <FadeIn delay={0.25} className="relative flex justify-center items-center">
            {/* Main hero image placeholder */}
            <div className="relative w-80 h-96 md:w-96 md:h-[480px] animate-float">
              <div className="w-full h-full rounded-3xl bg-gradient-to-br from-pink-200 via-pink-300 to-pink-400 shadow-pink-lg overflow-hidden">
                {/* Placeholder visual */}
                <div className="w-full h-full flex flex-col items-center justify-center p-8 text-center">
                  <span className="font-great-vibes text-6xl text-white/90 leading-none mb-4">
                    Beauty
                  </span>
                  <div className="grid grid-cols-2 gap-3 w-full max-w-xs">
                    {[
                      { icon: '🦶', label: 'Pedicure' },
                      { icon: '💅', label: 'Nails' },
                      { icon: '👁️', label: 'Lashes' },
                      { icon: '✨', label: 'Brows' },
                    ].map(({ icon, label }) => (
                      <div
                        key={label}
                        className="bg-white/30 backdrop-blur-sm rounded-2xl py-3 px-2 border border-white/40"
                      >
                        <div className="text-2xl mb-1">{icon}</div>
                        <div className="font-poppins text-xs text-white font-medium">{label}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Shine overlay */}
              <div className="absolute inset-0 rounded-3xl bg-card-shine pointer-events-none" aria-hidden="true" />
            </div>

            {/* Floating badges */}
            <FloatingBadge icon="💅" label="Nails perfectas" className="-top-4 -left-4 animate-gentle-pulse" />
            <FloatingBadge icon="⭐" label="Recomendacion de clientela" className="-bottom-4 -right-4" />
            <FloatingBadge icon="🌸" label="Experiencia premium" className="top-1/2 -right-8 -translate-y-1/2" />
          </FadeIn>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 animate-bounce">
          <span className="font-poppins text-xs text-gray-400 dark:text-gray-500 tracking-widest uppercase">Explorar</span>
          <ChevronDown size={18} className="text-pink-300" aria-hidden="true" />
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
