// Meta Pixel - injection client-only via DOM natif.
// Meme principe que gtag.client.ts : on evite useHead.script pour ne pas
// creer d'effect Vue qui plante au dispose. Le suffix .client garantit
// que ce plugin ne tourne jamais en SSR.

declare global {
  interface Window {
    fbq: ((...args: unknown[]) => void) & {
      callMethod?: (...args: unknown[]) => void;
      queue: unknown[];
      push: unknown;
      loaded: boolean;
      version: string;
    };
    _fbq: Window['fbq'];
  }
}

const PIXEL_ID = '1009183961965564';

export default defineNuxtPlugin((nuxtApp) => {
  if (typeof window === 'undefined') return;

  // Stub fbq disponible immediatement pour ne pas perdre les events
  // declenches avant l'injection reelle de fbevents.js.
  if (!window.fbq) {
    const n: any = function (...args: unknown[]) {
      n.callMethod ? n.callMethod.apply(n, args) : n.queue.push(args);
    };
    if (!window._fbq) window._fbq = n;
    n.push = n;
    n.loaded = true;
    n.version = '2.0';
    n.queue = [];
    window.fbq = n;
  }

  window.fbq('init', PIXEL_ID);
  window.fbq('track', 'PageView'); // 1er chargement / hydratation

  // PageView sur chaque navigation SPA. afterEach ne se declenche PAS sur la
  // route initiale (deja resolue a l'hydratation), donc aucun double comptage.
  nuxtApp.$router.afterEach(() => {
    if (typeof window.fbq === 'function') window.fbq('track', 'PageView');
  });

  // fbevents.js injecte hors du chemin critique :
  // requestIdleCallback si dispo, sinon setTimeout 1500ms apres load.
  const inject = () => {
    const script = document.createElement('script');
    script.async = true;
    script.src = 'https://connect.facebook.net/en_US/fbevents.js';
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
