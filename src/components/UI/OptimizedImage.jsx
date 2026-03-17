import React from 'react';

/**
 * Imagen optimizada con soporte WebP + fallback PNG/JPG.
 *
 * Props:
 *   src       — ruta al PNG/JPG original (siempre requerida)
 *   webp      — ruta al WebP (opcional; si no se pasa no usa <picture>)
 *   webp2x    — ruta al WebP @2x para retina (opcional)
 *   alt       — texto alternativo (siempre requerido)
 *   width     — ancho intrínseco para evitar CLS
 *   height    — alto intrínseco para evitar CLS
 *   eager     — si true usa loading="eager" + fetchpriority="high" (above the fold)
 *   className — clases CSS adicionales
 *   sizes     — atributo sizes para imágenes responsive
 */
export default function OptimizedImage({
  src,
  webp,
  webp2x,
  alt,
  width,
  height,
  eager = false,
  className = '',
  sizes,
  ...rest
}) {
  const loading        = eager ? 'eager'  : 'lazy';
  const fetchpriority  = eager ? 'high'   : 'low';
  const decoding       = eager ? 'sync'   : 'async';

  const imgEl = (
    <img
      src={src}
      alt={alt}
      width={width}
      height={height}
      loading={loading}
      fetchpriority={fetchpriority}
      decoding={decoding}
      className={className}
      sizes={sizes}
      {...rest}
    />
  );

  if (!webp) return imgEl;

  const srcSet = webp2x ? `${webp} 1x, ${webp2x} 2x` : webp;

  return (
    <picture>
      <source
        type="image/webp"
        srcSet={srcSet}
        sizes={sizes}
      />
      {imgEl}
    </picture>
  );
}
