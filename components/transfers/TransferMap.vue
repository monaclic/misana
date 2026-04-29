<script setup lang="ts">
// Vraie carte Google Maps avec polyline pointillee entre depart et arrivee.
// Style monochrome custom Misana (greyscale leger, water stone, no POI).
// Charge le SDK Maps en deferred client-side.
import { CITY_COORDS } from '~/lib/transferDetails';

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
const fromCoord = computed(() => CITY_COORDS[fromKey.value] ?? CITY_COORDS.nice);
const toCoord = computed(() => CITY_COORDS[props.to] ?? CITY_COORDS.nice);

// Carte en couleurs natives Google. Seuls reglages : on cache POI et transit
// pour rester focus sur la geographie pure (cotes, villes, routes).
const MISANA_MAP_STYLE = [
  { featureType: 'poi', stylers: [{ visibility: 'off' }] },
  { featureType: 'transit', stylers: [{ visibility: 'off' }] },
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

    // Marker depart (cercle ouvert)
    new google.maps.Marker({
      position: fromLL,
      map,
      icon: {
        path: google.maps.SymbolPath.CIRCLE,
        scale: 9,
        fillColor: '#ffffff',
        fillOpacity: 1,
        strokeColor: '#0b0b0b',
        strokeWeight: 2.5,
      },
      title: props.fromName,
      label: {
        text: props.fromName,
        className: 'misana-map-label misana-map-label-from',
        color: '#0b0b0b',
        fontFamily: 'Cormorant Garamond, Georgia, serif',
        fontSize: '15px',
      },
    });

    // Marker arrivee (cercle plein)
    new google.maps.Marker({
      position: toLL,
      map,
      icon: {
        path: google.maps.SymbolPath.CIRCLE,
        scale: 9,
        fillColor: '#0b0b0b',
        fillOpacity: 1,
        strokeColor: '#ffffff',
        strokeWeight: 2,
      },
      title: props.toName,
      label: {
        text: props.toName,
        className: 'misana-map-label misana-map-label-to',
        color: '#0b0b0b',
        fontFamily: 'Cormorant Garamond, Georgia, serif',
        fontSize: '15px',
      },
    });

    // Polyline pointillee : ligne invisible + symbole repete tous les 14px.
    const dashSymbol = {
      path: 'M 0,-1 0,1',
      strokeOpacity: 1,
      strokeColor: '#0b0b0b',
      scale: 3,
    };

    new google.maps.Polyline({
      path: [fromLL, toLL],
      geodesic: true,
      strokeOpacity: 0,
      icons: [{ icon: dashSymbol, offset: '0', repeat: '14px' }],
      map,
    });

    // Fit bounds sur les 2 points avec padding pour les labels.
    const bounds = new google.maps.LatLngBounds();
    bounds.extend(fromLL);
    bounds.extend(toLL);
    map.fitBounds(bounds, { top: 80, right: 80, bottom: 80, left: 80 });

    // ResizeObserver : si le container grandit (parce que la card sticky a
    // cote stretch en hauteur), Google Maps doit redessiner et refit bounds.
    if (typeof ResizeObserver !== 'undefined') {
      const ro = new ResizeObserver(() => {
        google.maps.event.trigger(map, 'resize');
        map.fitBounds(bounds, { top: 80, right: 80, bottom: 80, left: 80 });
      });
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
