// Lazy-load du SDK Google Maps JavaScript API (places + distance).
// Charge le script une seule fois quand un composant l appelle.
// Si la clef est absente, les composants client tombent gracieusement
// sur des inputs texte simples sans autocomplete ni calcul.

let loadingPromise: Promise<any> | null = null;

function loadScript(key: string, libraries: string[]): Promise<any> {
  if (typeof window === 'undefined') return Promise.reject(new Error('SSR'));
  if ((window as any).google?.maps) return Promise.resolve((window as any).google);
  if (loadingPromise) return loadingPromise;

  loadingPromise = new Promise((resolve, reject) => {
    const params = new URLSearchParams({
      key,
      libraries: libraries.join(','),
      v: 'weekly',
      loading: 'async',
    });
    const cbName = `__misanaMapsCb_${Date.now()}`;
    (window as any)[cbName] = () => {
      delete (window as any)[cbName];
      resolve((window as any).google);
    };
    params.set('callback', cbName);
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?${params.toString()}`;
    script.async = true;
    script.defer = true;
    script.onerror = (e) => {
      loadingPromise = null;
      reject(e);
    };
    document.head.appendChild(script);
  });
  return loadingPromise;
}

export function useGoogleMaps() {
  const config = useRuntimeConfig();
  const key = config.public.googleMapsKey as string;
  const enabled = !!key;

  // On charge places (Autocomplete) + routes (RouteMatrix nouvelle API).
  async function load() {
    if (!enabled) return null;
    return loadScript(key, ['places', 'routes']);
  }

  return { enabled, load };
}
