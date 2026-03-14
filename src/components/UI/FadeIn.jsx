import React from 'react';
import { motion } from 'framer-motion';

/**
 * Envuelve cualquier contenido con una animación fade-in + slide-up
 * al entrar al viewport. Props:
 *  - delay: número en segundos (default 0)
 *  - y: desplazamiento inicial en px (default 30)
 *  - className: clases adicionales al wrapper
 *  - as: etiqueta HTML del wrapper (default 'div')
 */
const FadeIn = ({ children, delay = 0, y = 30, className = '', as = 'div' }) => {
  const MotionTag = motion[as] ?? motion.div;
  return (
    <MotionTag
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1], delay }}
    >
      {children}
    </MotionTag>
  );
};

export default FadeIn;
