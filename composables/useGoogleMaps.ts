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

  async function load() {
    if (!enabled) return null;
    return loadScript(key, ['places']);
  }

  // Calcule distance (km) et duree (min) entre origine et destination
  // avec stops optionnels via DirectionsService (gere waypoints).
  // Retourne null si Maps indisponible ou query echouee.
  async function distanceBetween(
    origin: string,
    destination: string,
    waypoints?: string[],
  ): Promise<{ km: number; minutes: number } | null> {
    if (!enabled || !origin || !destination) return null;
    try {
      const g = await load();
      if (!g?.maps) return null;
      const directions = new g.maps.DirectionsService();
      const result: any = await new Promise((resolve, reject) => {
        directions.route(
          {
            origin,
            destination,
            waypoints: (waypoints || []).filter(Boolean).map((w) => ({ location: w, stopover: true })),
            travelMode: g.maps.TravelMode.DRIVING,
          },
          (res: any, status: string) => {
            if (status === 'OK') resolve(res);
            else reject(status);
          },
        );
      });
      const legs = result?.routes?.[0]?.legs || [];
      const totalMeters = legs.reduce((acc: number, l: any) => acc + (l?.distance?.value || 0), 0);
      const totalSeconds = legs.reduce((acc: number, l: any) => acc + (l?.duration?.value || 0), 0);
      if (!totalMeters) return null;
      return { km: Math.round(totalMeters / 1000), minutes: Math.round(totalSeconds / 60) };
    } catch (e) {
      console.warn('[useGoogleMaps] distanceBetween :', e);
      return null;
    }
  }

  return { enabled, load, distanceBetween };
}
