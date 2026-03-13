import React from 'react';
import { Sparkles, Heart, Award, Clock } from 'lucide-react';
import SectionTitle from '../UI/SectionTitle';
import ElegantButton from '../UI/ElegantButton';

const values = [
  {
    Icon: Heart,
    title: 'Atención personalizada',
    description: 'Cada clienta recibe una experiencia única, adaptada a sus gustos y necesidades.',
  },
  {
    Icon: Award,
    title: 'Calidad premium',
    description: 'Usamos solo los mejores productos del mercado para garantizar resultados duraderos.',
  },
  {
    Icon: Sparkles,
    title: 'Técnicas actualizadas',
    description: 'Nuestro equipo se capacita continuamente en las últimas tendencias y técnicas.',
  },
  {
    Icon: Clock,
    title: 'Puntualidad y respeto',
    description: 'Valoramos tu tiempo. Tu cita comienza cuando dijimos, sin esperas innecesarias.',
  },
];

const AboutSection = () => (
  <section id="nosotras" className="section-padding bg-white dark:bg-gray-900">
    <div className="container-custom">
      <div className="grid lg:grid-cols-2 gap-12 items-center">

        {/* Visual */}
        <div className="relative flex justify-center order-last lg:order-first">
          <div className="relative w-72 h-80 md:w-80 md:h-96">
            {/* Main card */}
            <div className="w-full h-full rounded-3xl bg-gradient-to-br from-pink-200 via-pink-300 to-pink-400 shadow-pink-lg flex items-center justify-center">
              <div className="text-center p-8">
                <span className="font-great-vibes text-5xl text-white/90 block mb-4">Nosotras</span>
                <div className="grid grid-cols-2 gap-3">
                  {['💅', '👁️', '🦶', '✨'].map((emoji, i) => (
                    <div key={i} className="bg-white/25 rounded-2xl p-3 flex items-center justify-center">
                      <span className="text-3xl">{emoji}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Floating stat cards */}
            <div className="absolute -top-4 -right-4 bg-white dark:bg-gray-800 rounded-2xl px-4 py-3 shadow-pink-md border border-pink-100 dark:border-gray-700">
              <div className="font-playfair text-2xl font-bold text-pink-400">5+</div>
              <div className="font-poppins text-xs text-gray-500 dark:text-gray-400">años de experiencia</div>
            </div>
            <div className="absolute -bottom-4 -left-4 bg-white dark:bg-gray-800 rounded-2xl px-4 py-3 shadow-pink-md border border-pink-100 dark:border-gray-700">
              <div className="font-playfair text-2xl font-bold text-pink-400">500+</div>
              <div className="font-poppins text-xs text-gray-500 dark:text-gray-400">clientas felices</div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div>
          <SectionTitle
            title="Sobre Luga Gy"
            subtitle=""
            align="left"
          />
          <p className="font-poppins text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
            Somos un salón de belleza especializado en el cuidado femenino integral. Nacimos con la
            misión de ofrecer una experiencia donde cada clienta se sienta valorada, consentida y
            completamente satisfecha.
          </p>
          <p className="font-poppins text-gray-600 dark:text-gray-300 leading-relaxed mb-8">
            Nuestra pasión es la belleza auténtica: realzar lo que cada mujer tiene de único,
            potenciando su seguridad y bienestar con técnicas profesionales y productos de primera calidad.
          </p>

          {/* Values grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
            {values.map(({ Icon, title, description }) => (
              <div key={title} className="flex items-start gap-3">
                <div className="w-9 h-9 bg-pink-100 rounded-xl flex items-center justify-center shrink-0">
                  <Icon size={18} className="text-pink-400" aria-hidden="true" />
                </div>
                <div>
                  <h4 className="font-poppins text-sm font-semibold text-gray-800 dark:text-gray-100 mb-0.5">{title}</h4>
                  <p className="font-poppins text-xs text-gray-500 dark:text-gray-400 leading-relaxed">{description}</p>
                </div>
              </div>
            ))}
          </div>

          <ElegantButton
            onClick={() => document.getElementById('reservar')?.scrollIntoView({ behavior: 'smooth' })}
            size="large"
          >
            <Sparkles size={16} aria-hidden="true" />
            QUIERO UNA CITA
          </ElegantButton>
        </div>
      </div>
    </div>
  </section>
);

export default AboutSection;
