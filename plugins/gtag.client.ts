// Google Analytics 4 - injection client-only via DOM natif.
// On evite useHead.script pour ne pas creer d'effect Vue qui plante au dispose.
// Le suffix .client garantit que ce plugin ne tourne jamais en SSR.

declare global {
  interface Window {
    dataLayer: unknown[];
    gtag: (...args: unknown[]) => void;
  }
}

const GA_ID = 'G-LZGHWHT9MY';

export default defineNuxtPlugin(() => {
  if (typeof window === 'undefined') return;

  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
  document.head.appendChild(script);

  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag(...args: unknown[]) {
    window.dataLayer.push(args);
  };
  window.gtag('js', new Date());
  window.gtag('config', GA_ID);
});
