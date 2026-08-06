const GA_ID = import.meta.env.VITE_GA_MEASUREMENT_ID;

let initialized = false;

export function initAnalytics() {
  if (!GA_ID || initialized || typeof window === 'undefined') return;
  initialized = true;

  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
  document.head.appendChild(script);

  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag(...args) {
    window.dataLayer.push(args);
  };
  window.gtag('js', new Date());
  window.gtag('config', GA_ID, { send_page_view: false });
}

export function trackPageview(path) {
  if (!GA_ID || typeof window.gtag !== 'function') return;
  window.gtag('event', 'page_view', { page_path: path });
}

export function trackEvent(name, params = {}) {
  if (!GA_ID || typeof window.gtag !== 'function') return;
  window.gtag('event', name, params);
}
