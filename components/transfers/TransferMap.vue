<script setup lang="ts">
// Vraie carte Google Maps avec polyline pointillee entre depart et arrivee.
// Style monochrome custom Misana (greyscale leger, water stone, no POI).
// Charge le SDK Maps en deferred client-side.
import { CITY_COORDS, HELIPORT_COORDS } from '~/lib/transferDetails';

type Props = {
  from: string;
  to: string;
  mode: 'chauffeur' | 'helicopter';
  fromName: string;
  toName: string;
};

const props = defineProps<Props>();
const config = useRuntimeConfig();
const apiKey = (config.public as { googleMapsKey?: string }).googleMapsKey ?? '';

const mapEl = ref<HTMLElement | null>(null);

const fromKey = computed(() => (props.from === 'nice-airport' ? 'nice-airport' : props.from));
// En mode helicoptere, on resout sur l'heliport precis (Fontvieille, Quai du
// Large, La Mole, Nice heliport) plutot que le centre-ville. Sinon centre-ville.
const isHelico = computed(() => props.mode === 'helicopter');
const fromCoord = computed(() => (
  isHelico.value
    ? (HELIPORT_COORDS[props.from] ?? CITY_COORDS[fromKey.value] ?? CITY_COORDS.nice)
    : (CITY_COORDS[fromKey.value] ?? CITY_COORDS.nice)
));
const toCoord = computed(() => (
  isHelico.value
    ? (HELIPORT_COORDS[props.to] ?? CITY_COORDS[props.to] ?? CITY_COORDS.nice)
    : (CITY_COORDS[props.to] ?? CITY_COORDS.nice)
));

// Style : on cache TOUS les labels de villes Google Maps natifs. Les seules
// villes affichees sont les 2 du trajet, via des Marker custom avec label.
// Reduit le bruit textuel et met l'emphase sur le trajet.
const MISANA_MAP_STYLE = [
  { featureType: 'poi', stylers: [{ visibility: 'off' }] },
  { featureType: 'transit', stylers: [{ visibility: 'off' }] },
  { featureType: 'administrative.locality', elementType: 'labels', stylers: [{ visibility: 'off' }] },
  { featureType: 'administrative.neighborhood', elementType: 'labels', stylers: [{ visibility: 'off' }] },
];

// Loader singleton : un seul script Google Maps charge dans le document.
let mapsScriptPromise: Promise<void> | null = null;
function loadGoogleMaps(key: string): Promise<void> {
  if (typeof window === 'undefined') return Promise.resolve();
  const w = window as unknown as { google?: { maps?: unknown } };
  if (w.google?.maps) return Promise.resolve();
  if (mapsScriptPromise) return mapsScriptPromise;

  mapsScriptPromise = new Promise<void>((resolve, reject) => {
    const existing = document.querySelector('script[data-misana-gmaps]') as HTMLScriptElement | null;
    if (existing) {
      existing.addEventListener('load', () => resolve());
      existing.addEventListener('error', () => reject(new Error('gmaps load error')));
      return;
    }
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(key)}&v=weekly&libraries=geometry`;
    script.async = true;
    script.defer = true;
    script.dataset.misanaGmaps = 'true';
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('gmaps load error'));
    document.head.appendChild(script);
  });
  return mapsScriptPromise;
}

const ready = ref(false);
const errored = ref(false);

async function initMap() {
  if (!mapEl.value || !apiKey) {
    errored.value = !apiKey;
    return;
  }
  try {
    await loadGoogleMaps(apiKey);
    const google = (window as unknown as { google: any }).google;
    if (!google?.maps) {
      errored.value = true;
      return;
    }

    const fromLL = { lat: fromCoord.value[0], lng: fromCoord.value[1] };
    const toLL = { lat: toCoord.value[0], lng: toCoord.value[1] };

    const map = new google.maps.Map(mapEl.value, {
      center: fromLL,
      zoom: 10,
      styles: MISANA_MAP_STYLE,
      disableDefaultUI: true,
      zoomControl: true,
      zoomControlOptions: { position: google.maps.ControlPosition.RIGHT_BOTTOM },
      gestureHandling: 'cooperative',
      backgroundColor: '#ffffff',
      clickableIcons: false,
      mapTypeId: google.maps.MapTypeId.ROADMAP,
    });

    // Markers customs : petit cercle noir avec ring blanc + label texte
    // du nom de ville au-dessus. Positionne sur l'heliport reel.
    const makeMarker = (pos: { lat: number; lng: number }, name: string) =>
      new google.maps.Marker({
        position: pos,
        map,
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 5,
          fillColor: '#1a1a1a',
          fillOpacity: 1,
          strokeColor: '#ffffff',
          strokeWeight: 2,
          labelOrigin: new google.maps.Point(0, -18),
        },
        label: {
          text: name,
          color: '#1a1a1a',
          fontSize: '15px',
          fontWeight: '700',
        },
        title: name,
      });
    makeMarker(fromLL, props.fromName);
    makeMarker(toLL, props.toName);

    // Trajet entre heliports en pointilles, va jusqu'aux points (pas de
    // raccourcissement, la ligne se termine pile sur les markers cercles).
    const dashSymbol = {
      path: 'M 0,-1 0,1',
      strokeOpacity: 1,
      strokeColor: '#1a1a1a',
      scale: 2,
    };
    new google.maps.Polyline({
      path: [fromLL, toLL],
      geodesic: true,
      strokeOpacity: 0,
      icons: [{ icon: dashSymbol, offset: '0', repeat: '8px' }],
      map,
    });

    // Fit bounds sur les 2 heliports (plus de ctrl point d'arc).
    const bounds = new google.maps.LatLngBounds();
    bounds.extend(fromLL);
    bounds.extend(toLL);
    map.fitBounds(bounds, { top: 50, right: 50, bottom: 50, left: 50 });

    // Force re-render apres layout settled. Sans ca, si le container utilise
    // flex stretch (hauteur calculee tardivement), la map s'initialise avant
    // que le container ait sa taille finale et reste mal dimensionnee jusqu'a
    // ce qu'un resize de fenetre la corrige. rAF + setTimeout en double filet.
    const refit = () => {
      google.maps.event.trigger(map, 'resize');
      map.fitBounds(bounds, { top: 80, right: 80, bottom: 80, left: 80 });
    };
    requestAnimationFrame(refit);
    setTimeout(refit, 250);

    // ResizeObserver : si le container grandit (parce que la card sticky a
    // cote stretch en hauteur), Google Maps doit redessiner et refit bounds.
    if (typeof ResizeObserver !== 'undefined') {
      const ro = new ResizeObserver(refit);
      ro.observe(mapEl.value);
    }

    ready.value = true;
  } catch {
    errored.value = true;
  }
}

onMounted(() => {
  initMap();
});
</script>

<template>
  <div class="transfer-map aspect-[800/460] lg:aspect-auto lg:flex-1 lg:min-h-[440px]">
    <div ref="mapEl" class="map-canvas" />
    <!-- Skeleton avant chargement / fallback si pas de clé -->
    <div v-if="!ready" class="map-skeleton" :class="{ errored }">
      <div class="skeleton-line" />
      <p v-if="errored" class="text-sm text-misana-muted">Map unavailable</p>
    </div>
  </div>
</template>

<style scoped>
.transfer-map {
  background: var(--color-misana-paper);
  border: 1px solid var(--color-misana-line);
  border-radius: 6px;
  overflow: hidden;
  position: relative;
}
.map-canvas {
  width: 100%;
  height: 100%;
}
.map-skeleton {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-misana-paper);
  pointer-events: none;
}
.map-skeleton.errored {
  pointer-events: auto;
}
.skeleton-line {
  width: 60%;
  height: 1px;
  background-image: linear-gradient(to right, transparent, var(--color-misana-line) 20%, var(--color-misana-line) 80%, transparent);
}
</style>

<style>
/* Custom labels Google Maps : style typo serif italique pour le from,
   regular 500 pour le to. Fond blanc subtle pour lisibilite. */
.misana-map-label {
  background: rgba(255, 255, 255, 0.92);
  padding: 2px 8px;
  border-radius: 3px;
  letter-spacing: 0.01em;
  text-shadow: 0 1px 2px rgba(255, 255, 255, 0.6);
  transform: translateY(-22px);
  white-space: nowrap;
}
.misana-map-label-from {
  font-style: italic;
}
.misana-map-label-to {
  font-weight: 500;
}
</style>
