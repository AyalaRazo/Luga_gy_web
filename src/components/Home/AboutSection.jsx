import React from 'react';
import ElegantButton from '../UI/ElegantButton';
import { scrollToSection } from '../../lib/scrollTo';
import FadeIn from '../UI/FadeIn';

const stats = [
  { value: '500+', label: 'Clientas felices' },
  { value: '2+',   label: 'Años de experiencia' },
  { value: '4.8',  label: 'Calificación promedio' },
];

const values = [
  {
    title: 'Atención personalizada',
    description: 'Cada clienta recibe una experiencia única, adaptada a sus gustos y necesidades.',
  },
  {
    title: 'Calidad premium',
    description: 'Usamos solo los mejores productos del mercado para garantizar resultados duraderos.',
  },
  {
    title: 'Técnicas actualizadas',
    description: 'Nuestro equipo se capacita continuamente en las últimas tendencias y técnicas.',
  },
  {
    title: 'Puntualidad y respeto',
    description: 'Valoramos tu tiempo. Tu cita comienza cuando dijimos, sin esperas innecesarias.',
  },
];

const AboutSection = () => (
  <section id="nosotras" className="section-padding bg-white dark:bg-gray-900">
    <div className="container-custom">
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <FadeIn delay={0}>
          <h2 className="font-playfair text-4xl md:text-5xl text-gray-900 dark:text-gray-100 font-semibold tracking-tight mb-4">
            Sobre Luga Gy
          </h2>
          <div className="border-t border-gray-200 dark:border-gray-700" />
        </FadeIn>

        {/* Body text */}
        <FadeIn delay={0.08}>
          <div className="mt-8 space-y-4 max-w-2xl">
            <p className="font-poppins text-gray-600 dark:text-gray-300 leading-relaxed">
              Somos un salón de belleza especializado en el cuidado femenino integral. Nacimos con la
              misión de ofrecer una experiencia donde cada clienta se sienta valorada, consentida y
              completamente satisfecha.
            </p>
            <p className="font-poppins text-gray-600 dark:text-gray-300 leading-relaxed">
              Nuestra pasión es la belleza auténtica: realzar lo que cada mujer tiene de único,
              potenciando su seguridad y bienestar con técnicas profesionales y productos de primera calidad.
            </p>
          </div>
        </FadeIn>

        {/* Stats row */}
        <FadeIn delay={0.16}>
          <div className="mt-10 flex divide-x divide-gray-200 dark:divide-gray-700">
            {stats.map(({ value, label }) => (
              <div key={label} className="pr-8 pl-8 first:pl-0">
                <div className="font-playfair text-3xl font-semibold text-pink-400 leading-none mb-1">
                  {value}
                </div>
                <div className="font-poppins text-xs text-gray-500 dark:text-gray-400 leading-tight">
                  {label}
                </div>
              </div>
            ))}
          </div>
        </FadeIn>

        {/* Bento values grid */}
        <FadeIn delay={0.22}>
          <div className="mt-10 grid grid-cols-2 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
            {values.map(({ title, description }, i) => {
              const isRight  = i % 2 === 1;
              const isBottom = i >= 2;
              return (
                <div
                  key={title}
                  className={`p-6 bg-gray-50 dark:bg-gray-800 ${isRight ? '' : 'border-r border-gray-200 dark:border-gray-700'} ${isBottom ? '' : 'border-b border-gray-200 dark:border-gray-700'}`}
                >
                  <div className="w-6 h-0.5 bg-pink-400 mb-3" />
                  <h4 className="font-playfair text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2 leading-snug">
                    {title}
                  </h4>
                  <p className="font-poppins text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                    {description}
                  </p>
                </div>
              );
            })}
          </div>
        </FadeIn>

        {/* CTA */}
        <FadeIn delay={0.28}>
          <div className="mt-10 flex justify-center">
            <ElegantButton size="large" onClick={() => scrollToSection('reservar')}>
              Quiero una cita
            </ElegantButton>
          </div>
        </FadeIn>

      </div>
    </div>
  </section>
);

export default AboutSection;
