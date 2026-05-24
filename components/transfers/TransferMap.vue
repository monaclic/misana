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
// On cache aussi les shields des routes (panneaux D2204, A8, etc.) pour
// reduire le bruit visuel autour du trajet helico.
const MISANA_MAP_STYLE = [
  { featureType: 'poi', stylers: [{ visibility: 'off' }] },
  { featureType: 'transit', stylers: [{ visibility: 'off' }] },
  { featureType: 'administrative.locality', elementType: 'labels', stylers: [{ visibility: 'off' }] },
  { featureType: 'administrative.neighborhood', elementType: 'labels', stylers: [{ visibility: 'off' }] },
  // Cache les frontieres administratives (pays, departement, ville) :
  // la frontiere Monaco/France ressort tres fort par defaut, idem
  // limites departementales et communales. On garde les routes nettes
  // sans bordures intrusives autour du trace helico.
  { featureType: 'administrative', elementType: 'geometry.stroke', stylers: [{ visibility: 'off' }] },
  { featureType: 'road', elementType: 'labels.icon', stylers: [{ visibility: 'off' }] },
];

// Loader singleton : un seul script Google Maps charge dans le document.
// Helico : geometry library suffit (polyline pointillee point-a-point).
// Chauffeur : ajoute directions pour le DirectionsService.
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
    script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(key)}&v=weekly&libraries=geometry,routes`;
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
    // Saint-Tropez label est plus large (12 chars) et la ligne y arrive
    // en diagonale -> label remonte d'un cran pour eviter le chevauchement.
    const makeMarker = (pos: { lat: number; lng: number }, name: string) => {
      const labelY = name.includes('Saint-Tropez') ? -10 : -7;
      return new google.maps.Marker({
        position: pos,
        map,
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 5,
          fillColor: '#1a1a1a',
          fillOpacity: 1,
          strokeColor: '#ffffff',
          strokeWeight: 2,
          labelOrigin: new google.maps.Point(0, labelY),
        },
        label: {
          text: name,
          color: '#1a1a1a',
          fontSize: '15px',
          fontWeight: '700',
        },
        title: name,
      });
    };

    const PADDING = { top: 60, right: 60, bottom: 60, left: 60 };
    const bounds = new google.maps.LatLngBounds();
    bounds.extend(fromLL);
    bounds.extend(toLL);

    if (isHelico.value) {
      // Markers helico (cercle custom sur l'heliport) + polyline pointillee
      // point-a-point. Pas de DirectionsService : un helico ne suit pas la route.
      makeMarker(fromLL, props.fromName);
      makeMarker(toLL, props.toName);
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
      map.fitBounds(bounds, PADDING);
    } else {
      // Mode chauffeur : DirectionsService + DirectionsRenderer pour tracer
      // l'itineraire reel par la route. Style cale sur RouteMap.vue de /request
      // (ligne noire pleine, markers natifs Google supprimes au profit des
      // markers customs Misana pour la coherence visuelle).
      makeMarker(fromLL, props.fromName);
      makeMarker(toLL, props.toName);
      const directionsService = new google.maps.DirectionsService();
      const directionsRenderer = new google.maps.DirectionsRenderer({
        map,
        suppressMarkers: true,
        preserveViewport: true,
        polylineOptions: {
          strokeColor: '#1a1a1a',
          strokeWeight: 3,
          strokeOpacity: 0.85,
        },
      });
      directionsService.route(
        {
          origin: fromLL,
          destination: toLL,
          travelMode: google.maps.TravelMode.DRIVING,
        },
        (result: any, status: string) => {
          if (status === 'OK' && result) {
            directionsRenderer.setDirections(result);
            // Recalcule les bounds sur la route reelle (pas juste les 2 points)
            const routeBounds = result.routes?.[0]?.bounds;
            if (routeBounds) {
              map.fitBounds(routeBounds, PADDING);
            } else {
              map.fitBounds(bounds, PADDING);
            }
          } else {
            // Fallback : si pas de route, on garde les 2 markers + fitBounds simple
            map.fitBounds(bounds, PADDING);
          }
        },
      );
    }

    // Cap le zoom max apres fitBounds. Sur petits ecrans (mobile), fitBounds
    // zoome trop pour faire tenir les 2 points proches. Plafond 11.
    google.maps.event.addListenerOnce(map, 'idle', () => {
      if ((map.getZoom() ?? 0) > 11) map.setZoom(11);
    });

    // Force re-render apres layout settled (flex stretch container).
    const refit = () => {
      google.maps.event.trigger(map, 'resize');
      map.fitBounds(bounds, PADDING);
      const z = map.getZoom() ?? 0;
      if (z > 11) map.setZoom(11);
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
  <div class="transfer-map aspect-[4/3] sm:aspect-[16/10] lg:aspect-auto lg:flex-1 lg:min-h-[440px]">
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
