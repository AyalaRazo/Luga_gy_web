import React from 'react';
import ElegantButton from '../UI/ElegantButton';
import { scrollToSection } from '../../lib/scrollTo';
import FadeIn from '../UI/FadeIn';

const HeroSection = () => {
  return (
    <section
      id="inicio"
      className="relative min-h-[100dvh] flex items-center overflow-hidden bg-hero-gradient dark:bg-gray-900 pt-20"
      aria-label="Sección principal"
    >
      <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
        <div className="absolute -top-32 -right-32 w-96 h-96 bg-pink-200/30 rounded-full blur-2xl" />
        <div className="absolute -bottom-40 -left-20 w-80 h-80 bg-pink-300/20 rounded-full blur-2xl" />
      </div>

      <div className="container-custom relative z-10 py-12">
        <div className="grid lg:grid-cols-[55%_45%] gap-10 xl:gap-16 items-center">

          {/* Left — Typography + CTAs */}
          <div className="flex flex-col gap-5 text-center lg:text-left order-2 lg:order-1">

            <FadeIn delay={0}>
              <p className="font-poppins text-xs text-gray-400 dark:text-gray-500 tracking-wide">
                Salón de belleza · Mexicali, B.C.
              </p>
            </FadeIn>

            <FadeIn delay={0.08}>
              <h1 className="font-great-vibes text-6xl md:text-7xl lg:text-8xl text-pink-400 leading-none">
                Luga Gy
              </h1>
            </FadeIn>

            <FadeIn delay={0.16}>
              <p className="font-poppins text-xl md:text-2xl text-gray-700 dark:text-gray-200 font-medium leading-snug">
                Tu salón de belleza de{' '}
                <span className="italic text-pink-400">confianza</span>
              </p>
            </FadeIn>

            <FadeIn delay={0.22}>
              <p className="font-poppins text-gray-500 dark:text-gray-400 text-base leading-relaxed max-w-md mx-auto lg:mx-0">
                Especialistas en pedicure, nails, lashes y cejas en Mexicali, Baja California.
              </p>
            </FadeIn>

            <FadeIn delay={0.30}>
              <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
                <ElegantButton
                  size="large"
                  onClick={() => scrollToSection('reservar')}
                >
                  Reservar cita
                </ElegantButton>
                <ElegantButton
                  variant="secondary"
                  size="large"
                  onClick={() => scrollToSection('servicios')}
                >
                  Ver servicios
                </ElegantButton>
              </div>
            </FadeIn>
          </div>

          {/* Right — Real salon photo */}
          <FadeIn delay={0.18} className="relative flex justify-center items-center order-1 lg:order-2">
            <div className="relative w-full max-w-xs sm:max-w-sm lg:max-w-none">
              <img
                src="/logo.webp"
                srcSet="/logo.webp 1x, /logo@2x.webp 2x"
                alt="Logo de Luga Gy, salón de belleza en Mexicali"
                className="w-full aspect-square object-contain rounded-2xl"
                loading="eager"
                decoding="async"
              />
              <div
                className="absolute -inset-3 rounded-2xl border border-pink-200/40 dark:border-pink-800/30 pointer-events-none"
                aria-hidden="true"
              />
            </div>
          </FadeIn>

        </div>
      </div>
    </section>
  );
};

export default HeroSection;
