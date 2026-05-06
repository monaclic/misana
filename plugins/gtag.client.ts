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

  // dataLayer + gtag stub disponibles immediatement pour ne pas perdre
  // les events declenches avant l'injection reelle du script gtag.js.
  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag(...args: unknown[]) {
    window.dataLayer.push(args);
  };
  window.gtag('js', new Date());
  window.gtag('config', GA_ID);

  // Le script gtag.js (152 KiB) est injecte hors du chemin critique :
  // requestIdleCallback si dispo, sinon setTimeout 1500ms apres load.
  // Gain LCP : sort GA du JS bloquant initial.
  const inject = () => {
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
    document.head.appendChild(script);
  };

  const schedule = () => {
    if ('requestIdleCallback' in window) {
      (window as any).requestIdleCallback(inject, { timeout: 3000 });
    } else {
      setTimeout(inject, 1500);
    }
  };

  if (document.readyState === 'complete') {
    schedule();
  } else {
    window.addEventListener('load', schedule, { once: true });
  }
});
