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

// Carte en couleurs natives Google. On cache les POI bavards (business,
// attractions, ecoles, etc) MAIS on garde les locality / administrative
// pour que les noms de villes restent visibles (Nice, Monaco, Cannes...).
// Pattern identique a RouteMap (chauffeur transfer) pour la coherence.
const MISANA_MAP_STYLE = [
  { featureType: 'poi.business', stylers: [{ visibility: 'off' }] },
  { featureType: 'poi.attraction', stylers: [{ visibility: 'off' }] },
  { featureType: 'poi.medical', stylers: [{ visibility: 'off' }] },
  { featureType: 'poi.school', stylers: [{ visibility: 'off' }] },
  { featureType: 'poi.sports_complex', stylers: [{ visibility: 'off' }] },
  { featureType: 'poi.government', stylers: [{ visibility: 'off' }] },
  { featureType: 'poi.place_of_worship', stylers: [{ visibility: 'off' }] },
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

    // Pas de markers custom : les noms de ville natifs Google Maps suffisent
    // pour identifier depart/arrivee. La polyline aux extremites indique le
    // trajet. Style aligne sur RouteMap (chauffeur transfer) : trait plein
    // gris fonce 3px epais, opacity 0.85.
    new google.maps.Polyline({
      path: [fromLL, toLL],
      geodesic: true,
      strokeColor: '#1a1a1a',
      strokeWeight: 3,
      strokeOpacity: 0.85,
      map,
    });

    // Fit bounds sur les 2 points avec padding pour les labels.
    const bounds = new google.maps.LatLngBounds();
    bounds.extend(fromLL);
    bounds.extend(toLL);
    map.fitBounds(bounds, { top: 80, right: 80, bottom: 80, left: 80 });

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
