function fbq(...args) {
  if (typeof window !== 'undefined' && typeof window.fbq === 'function') {
    window.fbq(...args);
  }
}

export function trackEvent(eventName, params = {}) {
  fbq('track', eventName, params);
}

// Evento estándar de Meta para agendamiento de citas
export function trackSchedule(service) {
  fbq('track', 'Schedule', { content_name: service });
}

// Útil si en el futuro agregás un formulario de contacto/lead
export function trackLead() {
  fbq('track', 'Lead');
}
