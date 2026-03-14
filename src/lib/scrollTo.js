/**
 * Scrollea a una sección compensando el header fijo.
 * Usa el mismo offset que scroll-padding-top en index.css.
 */
export function scrollToSection(id) {
  const el = document.getElementById(id);
  if (!el) return;
  const headerOffset = window.innerWidth >= 1024 ? 115 : 90;
  const top = el.getBoundingClientRect().top + window.scrollY - headerOffset;
  window.scrollTo({ top, behavior: 'smooth' });
}
