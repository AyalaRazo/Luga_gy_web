import React, { useEffect, useRef, useState } from 'react';
import { ExternalLink } from 'lucide-react';
import SectionTitle from '../UI/SectionTitle';
import { TikTokIcon, SOCIAL_LINKS } from '../UI/SocialIcons';
import FadeIn from '../UI/FadeIn';

const videos = [
  {
    id: 1,
    src: '/videos/tiktok/tiktok-1.mp4',
    description: 'Transformación completa de uñas acrílicas — el antes y después que te va a sorprender',
  },
  {
    id: 2,
    src: '/videos/tiktok/tiktok-2.mp4',
    description: 'Pedicura spa relajante — el ritual de autocuidado que necesitás este fin de semana',
  },
  {
    id: 3,
    src: '/videos/tiktok/tiktok-3.mp4',
    description: 'Extensiones de pestañas pelo a pelo — mirada impactante en 2 horas',
  },
  {
    id: 4,
    src: '/videos/tiktok/tiktok-4.mp4',
    description: 'Diseño de cejas con técnica de hilo — la diferencia que cambia todo tu rostro',
  },
];

const VideoCard = ({ video }) => {
  const videoRef = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: '200px' }
    );
    if (videoRef.current) observer.observe(videoRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div className="relative group rounded-2xl overflow-hidden shadow-card hover:shadow-card-hover transition-all duration-300">
      <div ref={videoRef} className="w-full aspect-[9/16] bg-gray-900 relative">
        {visible && (
          <video
            src={video.src}
            muted
            loop
            playsInline
            preload="none"
            autoPlay
            className="w-full h-full object-cover"
          />
        )}
      </div>
    </div>
  );
};

const TikTokFeed = () => (
  <section id="tiktok" className="section-padding bg-gray-950">
    <div className="container-custom">
      <FadeIn>
        <SectionTitle
          title="Síguenos en TikTok"
          subtitle={`${SOCIAL_LINKS.tiktokHandle} — Mira nuestros procesos y resultados en acción`}
          light
        />
      </FadeIn>

      {/* TikTok profile badge */}
      <FadeIn delay={0.1} className="flex justify-center mb-10">
        <a
          href={SOCIAL_LINKS.tiktok}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-3 bg-white/10 hover:bg-white/15 backdrop-blur-sm text-white border border-white/20 rounded-full px-6 py-3 transition-all duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-pink-400"
        >
          <TikTokIcon size={20} />
          <span className="font-poppins font-semibold text-sm">{SOCIAL_LINKS.tiktokHandle}</span>
          <ExternalLink size={14} className="text-white/50" aria-hidden="true" />
        </a>
      </FadeIn>

      {/* Videos grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {videos.map((video, i) => (
          <FadeIn key={video.id} delay={i * 0.08}>
            <VideoCard video={video} />
          </FadeIn>
        ))}
      </div>

      {/* CTA */}
      <FadeIn delay={0.2} className="text-center mt-10">
        <a
          href={SOCIAL_LINKS.tiktok}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 font-poppins text-sm text-pink-300 hover:text-pink-200 transition-colors cursor-pointer focus:outline-none focus:underline"
        >
          <TikTokIcon size={16} />
          Ver todos los videos en TikTok
          <ExternalLink size={14} aria-hidden="true" />
        </a>
      </FadeIn>
    </div>
  </section>
);

export default TikTokFeed;
