function fbq(...args) {
  if (typeof window !== 'undefined' && typeof window.fbq === 'function') {
    window.fbq(...args);
  }
}

export function trackViewContent(contentName) {
  fbq('track', 'ViewContent', { content_name: contentName, content_category: 'Belleza' });
}

export function trackInitiateCheckout(services, value) {
  fbq('track', 'InitiateCheckout', {
    content_name: services,
    num_items: services.split(' + ').length,
    value,
    currency: 'MXN',
  });
}

export function trackSchedule(service, value) {
  fbq('track', 'Schedule', { content_name: service, value, currency: 'MXN' });
}

export function trackContact(method = 'WhatsApp') {
  fbq('track', 'Contact', { content_name: method });
}

export function trackLead() {
  fbq('track', 'Lead');
}

export function trackEvent(eventName, params = {}) {
  fbq('track', eventName, params);
}
