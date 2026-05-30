<script setup lang="ts">
// Carte Google Maps avec trace de l itineraire pickup -> [stops] -> dropoff.
// Charge le SDK via useGoogleMaps (deja utilise par AddressAutocomplete +
// distanceBetween) puis utilise DirectionsService + DirectionsRenderer.
//
// Style sobre : map type roadmap, contournement des POI bavards, marqueurs
// minimaux noirs. Si Maps indispo, on cache simplement le composant.
import { useGoogleMaps } from '~/composables/useGoogleMaps';

const props = defineProps<{
  pickup?: string;
  dropoff?: string;
  stops?: string[];
}>();

const { enabled, load } = useGoogleMaps();
const mapEl = ref<HTMLDivElement | null>(null);
const mapReady = ref(false);
let mapInstance: any = null;
let directionsRenderer: any = null;
let directionsService: any = null;

async function ensureMap() {
  if (!enabled || !mapEl.value || mapReady.value) return;
  const g = await load();
  if (!g?.maps) return;
  mapInstance = new g.maps.Map(mapEl.value, {
    center: { lat: 43.7, lng: 7.27 }, // Riviera centre par defaut
    zoom: 10,
    disableDefaultUI: true,
    zoomControl: true,
    gestureHandling: 'cooperative',
    styles: [
      { featureType: 'poi.business', stylers: [{ visibility: 'off' }] },
      { featureType: 'poi.attraction', stylers: [{ visibility: 'off' }] },
      { featureType: 'poi.medical', stylers: [{ visibility: 'off' }] },
      { featureType: 'poi.school', stylers: [{ visibility: 'off' }] },
      { featureType: 'poi.sports_complex', stylers: [{ visibility: 'off' }] },
      { featureType: 'transit', stylers: [{ visibility: 'off' }] },
    ],
  });
  directionsService = new g.maps.DirectionsService();
  directionsRenderer = new g.maps.DirectionsRenderer({
    map: mapInstance,
    suppressMarkers: false,
    polylineOptions: {
      strokeColor: '#1a1a1a',
      strokeWeight: 3,
      strokeOpacity: 0.85,
    },
  });
  mapReady.value = true;
}

let drawTimer: ReturnType<typeof setTimeout> | null = null;
// Snapshot des inputs au moment du fire du setTimeout. Permet d'ignorer
// les callbacks d'anciennes requetes qui reviendraient apres une plus
// recente (race condition entre 2 frappes utilisateur rapides).
let lastRequestKey = '';

async function drawRoute() {
  if (!enabled) return;
  await nextTick();
  await ensureMap();
  if (!directionsService || !directionsRenderer) return;
  // Clear immediat : si l'utilisateur a change l'adresse, on ne veut
  // surtout pas laisser l'ancien trace visible (trompeur, surtout si
  // la nouvelle adresse est invalide -> ZERO_RESULTS et la map gardait
  // l'ancien trajet en silence).
  directionsRenderer.setDirections({ routes: [] } as any);
  if (!props.pickup || !props.dropoff) return;
  if (drawTimer) clearTimeout(drawTimer);
  const key = `${props.pickup}||${props.dropoff}||${JSON.stringify(props.stops || [])}`;
  lastRequestKey = key;
  drawTimer = setTimeout(() => {
    const g = (window as any).google;
    if (!g?.maps) return;
    directionsService.route(
      {
        origin: props.pickup,
        destination: props.dropoff,
        waypoints: (props.stops || []).filter(Boolean).map((w) => ({ location: w, stopover: true })),
        travelMode: g.maps.TravelMode.DRIVING,
      },
      (result: any, status: string) => {
        // Ignore les callbacks qui correspondent a une requete obsolete.
        if (key !== lastRequestKey) return;
        if (status === 'OK' && result) {
          directionsRenderer.setDirections(result);
        } else {
          // Trace clear deja fait. On ne reaffiche pas l'ancien trajet
          // pour ne pas induire l'equipe en erreur sur le mail recu.
          console.warn('[RouteMap] Directions status :', status);
        }
      },
    );
  }, 500);
}

watch(
  () => [props.pickup, props.dropoff, JSON.stringify(props.stops || [])],
  drawRoute,
  { immediate: true },
);

// Si v-if rend le div apres le watcher initial, on retente apres mount.
onMounted(() => {
  if (props.pickup && props.dropoff) drawRoute();
});

onBeforeUnmount(() => {
  if (drawTimer) clearTimeout(drawTimer);
  if (directionsRenderer) {
    directionsRenderer.setMap(null);
    directionsRenderer = null;
  }
  mapInstance = null;
  directionsService = null;
});
</script>

<template>
  <div v-if="enabled && pickup && dropoff" class="route-map-wrap">
    <div ref="mapEl" class="route-map"></div>
  </div>
</template>

<style scoped>
.route-map-wrap {
  width: 100%;
  margin-top: 0.5rem;
  border: 1px solid var(--color-misana-line);
  border-radius: 4px;
  overflow: hidden;
  background: var(--color-misana-stone);
}
.route-map {
  width: 100%;
  height: 180px;
}
@media (min-width: 720px) {
  .route-map { height: 220px; }
}
</style>
