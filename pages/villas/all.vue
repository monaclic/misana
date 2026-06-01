<script setup lang="ts">
// Hub catalog villas (Côte d'Azur).
// - Sidebar gauche toujours visible (desktop : sticky 3 cols ; mobile :
//   inline au-dessus du grid en collapsible).
// - Pas de bouton "Filtres" (la sidebar est toujours là, pas redondant).
// - Carte Google Maps en split desktop, FAB toggle mobile.
// - Cards LC-style allégées : image landscape + nom + location +
//   specs + prix. Pas d'amenities chips, pas de collection label.
// - Pagination "Load more" (12 par page).
import { useVillas, type Villa, type VillaCity, type VillaSetting } from '~/composables/useVillas';
import { useGoogleMaps } from '~/composables/useGoogleMaps';

definePageMeta({ layout: 'default' });
defineI18nRoute({
  paths: { en: '/villas/all', fr: '/villas/all' },
});

const { villas: VILLAS_REF } = useVillas();
const { enabled: mapsEnabled, load: loadMaps } = useGoogleMaps();

const route = useRoute();
const router = useRouter();
const { locale, t } = useI18n();
const localePath = useLocalePath();

const stickyContactVisible = useState<boolean>('sticky-contact-visible', () => true);
const isLgUp = ref(false);
const isMdUp = ref(false);
let lgMq: MediaQueryList | null = null;
let mdMq: MediaQueryList | null = null;
function syncLg() { isLgUp.value = lgMq?.matches ?? false; }
function syncMd() { isMdUp.value = mdMq?.matches ?? false; }
onMounted(() => {
  stickyContactVisible.value = false;
  lgMq = window.matchMedia('(min-width: 1024px)');
  mdMq = window.matchMedia('(min-width: 768px)');
  syncLg();
  syncMd();
  lgMq.addEventListener('change', syncLg);
  mdMq.addEventListener('change', syncMd);
});
onBeforeUnmount(() => {
  stickyContactVisible.value = true;
  lgMq?.removeEventListener('change', syncLg);
  mdMq?.removeEventListener('change', syncMd);
  lgMq = null;
  mdMq = null;
});

// ============== Référentiels ==============

const CITY_OPTIONS: { value: VillaCity; labelFr: string; labelEn: string }[] = [
  { value: 'saint-tropez', labelFr: 'Saint-Tropez', labelEn: 'Saint-Tropez' },
  { value: 'ramatuelle', labelFr: 'Ramatuelle', labelEn: 'Ramatuelle' },
  { value: 'gassin', labelFr: 'Gassin', labelEn: 'Gassin' },
  { value: 'grimaud', labelFr: 'Grimaud', labelEn: 'Grimaud' },
  { value: 'la-croix-valmer', labelFr: 'La Croix-Valmer', labelEn: 'La Croix-Valmer' },
  { value: 'sainte-maxime', labelFr: 'Sainte-Maxime', labelEn: 'Sainte-Maxime' },
  { value: 'cavalaire-sur-mer', labelFr: 'Cavalaire-sur-Mer', labelEn: 'Cavalaire-sur-Mer' },
  { value: 'cannes', labelFr: 'Cannes', labelEn: 'Cannes' },
  { value: 'mougins', labelFr: 'Mougins', labelEn: 'Mougins' },
  { value: 'antibes', labelFr: 'Antibes', labelEn: 'Antibes' },
  { value: 'cap-d-antibes', labelFr: "Cap d'Antibes", labelEn: "Cap d'Antibes" },
  { value: 'villefranche-sur-mer', labelFr: 'Villefranche-sur-Mer', labelEn: 'Villefranche-sur-Mer' },
  { value: 'nice', labelFr: 'Nice', labelEn: 'Nice' },
  { value: 'eze', labelFr: 'Èze', labelEn: 'Èze' },
  { value: 'monaco', labelFr: 'Monaco', labelEn: 'Monaco' },
  { value: 'menton', labelFr: 'Menton', labelEn: 'Menton' },
  { value: 'cap-ferrat', labelFr: 'Cap-Ferrat', labelEn: 'Cap-Ferrat' },
];

const CAPACITY_BUCKETS = [
  { id: 'up-to-6', labelFr: "Jusqu'à 6", labelEn: 'Up to 6', min: 0, max: 6 },
  { id: '7-10', labelFr: '7 à 10', labelEn: '7 to 10', min: 7, max: 10 },
  { id: '11-plus', labelFr: '11+', labelEn: '11+', min: 11, max: 99 },
];

const BEDROOM_BUCKETS = [
  { id: '1-3', labelFr: '1 à 3', labelEn: '1 to 3', min: 1, max: 3 },
  { id: '4-6', labelFr: '4 à 6', labelEn: '4 to 6', min: 4, max: 6 },
  { id: '7-plus', labelFr: '7+', labelEn: '7+', min: 7, max: 30 },
];

const PRICE_BUCKETS = [
  { id: 'under-15k', labelFr: '< 15 000 €', labelEn: '< €15k', min: 0, max: 15000 },
  { id: '15k-50k', labelFr: '15-50 000 €', labelEn: '€15-50k', min: 15000, max: 50000 },
  { id: '50k-plus', labelFr: '> 50 000 €', labelEn: '> €50k', min: 50000, max: 9999999 },
];

const SETTING_OPTIONS: { value: VillaSetting; labelFr: string; labelEn: string }[] = [
  { value: 'out-of-town', labelFr: 'Hors ville', labelEn: 'Out of town' },
  { value: 'beachfront', labelFr: 'Face mer', labelEn: 'Beachfront' },
  { value: 'in-city', labelFr: 'En ville', labelEn: 'In city' },
  { value: 'countryside', labelFr: 'Campagne', labelEn: 'Countryside' },
];

function asArray<T extends string>(v: unknown, allowed: readonly T[]): T[] {
  if (!v) return [];
  const list = Array.isArray(v) ? v : String(v).split(',');
  return list.map((x) => String(x).trim()).filter((x): x is T => (allowed as readonly string[]).includes(x));
}

// ============== Filtres (URL = état) ==============

const CITY_VALUES = CITY_OPTIONS.map((c) => c.value);
const SETTING_VALUES = SETTING_OPTIONS.map((s) => s.value);

const fCity = ref<VillaCity[]>(asArray(route.query.city, CITY_VALUES));
const fCapacity = ref<string[]>(asArray(route.query.capacity, CAPACITY_BUCKETS.map((b) => b.id) as readonly string[]));
const fBedrooms = ref<string[]>(asArray(route.query.bedrooms, BEDROOM_BUCKETS.map((b) => b.id) as readonly string[]));
const fPrice = ref<string[]>(asArray(route.query.price, PRICE_BUCKETS.map((b) => b.id) as readonly string[]));
const fSeaView = ref<boolean>(route.query.seaView === '1');
const fSetting = ref<VillaSetting[]>(asArray(route.query.setting, SETTING_VALUES));
const fSearch = ref<string>(typeof route.query.q === 'string' ? route.query.q : '');

function syncQuery() {
  const q: Record<string, string> = { ...route.query } as Record<string, string>;
  delete q.city; delete q.capacity; delete q.bedrooms; delete q.price; delete q.seaView; delete q.setting; delete q.q;
  if (fCity.value.length) q.city = fCity.value.join(',');
  if (fCapacity.value.length) q.capacity = fCapacity.value.join(',');
  if (fBedrooms.value.length) q.bedrooms = fBedrooms.value.join(',');
  if (fPrice.value.length) q.price = fPrice.value.join(',');
  if (fSeaView.value) q.seaView = '1';
  if (fSetting.value.length) q.setting = fSetting.value.join(',');
  if (fSearch.value.trim()) q.q = fSearch.value.trim();
  router.replace({ path: route.path, query: q });
}
watch([fCity, fCapacity, fBedrooms, fPrice, fSeaView, fSetting, fSearch], syncQuery, { deep: true });

// ============== Tri ==============

const VALID_SORTS = ['default', 'price-asc', 'price-desc', 'bedrooms-asc', 'bedrooms-desc'] as const;
type SortMode = typeof VALID_SORTS[number];
const initialSort: SortMode = (typeof route.query.sort === 'string' && (VALID_SORTS as readonly string[]).includes(route.query.sort))
  ? (route.query.sort as SortMode)
  : 'default';
const fSort = ref<SortMode>(initialSort);
function syncSort() {
  const q: Record<string, string> = { ...route.query } as Record<string, string>;
  if (fSort.value === 'default') delete q.sort;
  else q.sort = fSort.value;
  router.replace({ path: route.path, query: q });
}
watch(fSort, syncSort);

// ============== Show map (persiste en URL) + toggle mobile ==============

const showMap = ref<boolean>(route.query.map !== '0');
const mobileView = ref<'list' | 'map'>('list');
function syncMap() {
  const q: Record<string, string> = { ...route.query } as Record<string, string>;
  if (showMap.value) delete q.map;
  else q.map = '0';
  router.replace({ path: route.path, query: q });
}
watch(showMap, syncMap);

// ============== Filtrage + tri ==============

function villaHaystack(v: Villa): string {
  const cityOpt = CITY_OPTIONS.find((c) => c.value === v.city);
  const cityNames = cityOpt ? [cityOpt.labelFr, cityOpt.labelEn] : [];
  return [v.name, v.city, ...cityNames].filter(Boolean).join(' ').toLowerCase();
}
function matchSearch(v: Villa, terms: string[]): boolean {
  if (!terms.length) return true;
  const hay = villaHaystack(v);
  return terms.every((t) => hay.includes(t));
}

const filteredVillas = computed(() => {
  const terms = fSearch.value.trim().toLowerCase().split(/\s+/).filter(Boolean);
  return VILLAS_REF.value.filter((v) => {
    if (!matchSearch(v, terms)) return false;
    if (fCity.value.length && !fCity.value.includes(v.city)) return false;
    if (fCapacity.value.length) {
      if (v.capacity == null) return false;
      const matched = fCapacity.value.some((id) => {
        const b = CAPACITY_BUCKETS.find((x) => x.id === id);
        return b ? v.capacity! >= b.min && v.capacity! <= b.max : false;
      });
      if (!matched) return false;
    }
    if (fBedrooms.value.length) {
      if (v.bedrooms == null) return false;
      const matched = fBedrooms.value.some((id) => {
        const b = BEDROOM_BUCKETS.find((x) => x.id === id);
        return b ? v.bedrooms! >= b.min && v.bedrooms! <= b.max : false;
      });
      if (!matched) return false;
    }
    if (fPrice.value.length) {
      if (v.pricePerWeekFrom == null) return false;
      const matched = fPrice.value.some((id) => {
        const b = PRICE_BUCKETS.find((x) => x.id === id);
        return b ? v.pricePerWeekFrom! >= b.min && v.pricePerWeekFrom! <= b.max : false;
      });
      if (!matched) return false;
    }
    if (fSeaView.value && !v.seaView) return false;
    if (fSetting.value.length) {
      if (!v.setting) return false;
      if (!fSetting.value.includes(v.setting)) return false;
    }
    return true;
  });
});

const visibleVillas = computed(() => {
  const arr = [...filteredVillas.value];
  switch (fSort.value) {
    case 'price-asc': return arr.sort((a, b) => (a.pricePerWeekFrom ?? Infinity) - (b.pricePerWeekFrom ?? Infinity));
    case 'price-desc': return arr.sort((a, b) => (b.pricePerWeekFrom ?? -1) - (a.pricePerWeekFrom ?? -1));
    case 'bedrooms-asc': return arr.sort((a, b) => (a.bedrooms ?? Infinity) - (b.bedrooms ?? Infinity));
    case 'bedrooms-desc': return arr.sort((a, b) => (b.bedrooms ?? -1) - (a.bedrooms ?? -1));
    default: return arr;
  }
});

const filterCount = computed(() =>
  fCity.value.length + fCapacity.value.length + fBedrooms.value.length +
  fPrice.value.length + fSetting.value.length + (fSeaView.value ? 1 : 0),
);

function clearFilters() {
  fSearch.value = '';
  fCity.value = [];
  fCapacity.value = [];
  fBedrooms.value = [];
  fPrice.value = [];
  fSeaView.value = false;
  fSetting.value = [];
}

// ============== Load more ==============

const PAGE_SIZE = 12;
const visibleCount = ref(PAGE_SIZE);
watch([fCity, fCapacity, fBedrooms, fPrice, fSeaView, fSetting, fSearch, fSort], () => {
  visibleCount.value = PAGE_SIZE;
}, { deep: true });
const paginatedVillas = computed(() => visibleVillas.value.slice(0, visibleCount.value));
const hasMore = computed(() => visibleVillas.value.length > visibleCount.value);
function loadMore() {
  visibleCount.value = Math.min(visibleCount.value + PAGE_SIZE, visibleVillas.value.length);
}

// ============== Format / labels ==============

function fmtPrice(p: number | null): string {
  if (p == null) return t('villas.onRequest');
  return new Intl.NumberFormat(locale.value === 'fr' ? 'fr-FR' : 'en-GB', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0,
  }).format(p);
}
function fmtPriceShort(p: number | null): string {
  if (p == null) return locale.value === 'fr' ? 'Sur dem.' : 'On req.';
  if (p >= 1000) return `${Math.round(p / 1000)}k€`;
  return `${p}€`;
}
function priceLine(v: Villa): string {
  if (v.pricePerWeekFrom == null) return t('villas.onRequest');
  if (v.pricePerWeekTo != null && v.pricePerWeekTo > v.pricePerWeekFrom) {
    return t('villas.fromToWeek', { min: fmtPrice(v.pricePerWeekFrom), max: fmtPrice(v.pricePerWeekTo) });
  }
  return t('villas.fromWeek', { min: fmtPrice(v.pricePerWeekFrom) });
}
function cityLabel(value: VillaCity): string {
  const c = CITY_OPTIONS.find((x) => x.value === value);
  if (!c) return value;
  return locale.value === 'fr' ? c.labelFr : c.labelEn;
}
function locationLine(v: Villa): string {
  return `${cityLabel(v.city)}, ${t('villas.locationSuffix')}`;
}
function specsLine(v: Villa): string {
  if (v.capacity == null && v.bedrooms == null && v.bathrooms == null) return '';
  return t('villas.specsLine', {
    guests: v.capacity ?? '-',
    bedrooms: v.bedrooms ?? '-',
    bathrooms: v.bathrooms ?? '-',
  });
}
function villaSlug(v: Villa): string {
  return locale.value === 'fr' ? v.slug.fr : v.slug.en;
}

// ============== Hover sync card <-> marker ==============

const hoveredVillaId = ref<string | null>(null);
const previewedVilla = computed<Villa | null>(() => {
  if (!hoveredVillaId.value) return null;
  return visibleVillas.value.find((v) => v._id === hoveredVillaId.value) ?? null;
});

// ============== Google Maps ==============

const mapContainerRef = ref<HTMLElement | null>(null);
let mapInstance: any = null;
let mapOverlays: any[] = [];
let googleRef: any = null;

function destroyMarkers() {
  for (const ov of mapOverlays) {
    try { ov.setMap(null); } catch (e) { void e; }
  }
  mapOverlays = [];
}

function buildOverlays(villas: Villa[]) {
  if (!googleRef || !mapInstance) return;
  destroyMarkers();
  const withGps = villas.filter((v) => v.gpsLat != null && v.gpsLng != null);
  if (!withGps.length) return;

  class PriceMarker extends googleRef.maps.OverlayView {
    private position: any;
    private price: number | null;
    private id: string;
    private div: HTMLElement | null = null;
    private onClickFn: () => void;

    constructor(position: any, price: number | null, id: string, onClickFn: () => void) {
      super();
      this.position = position;
      this.price = price;
      this.id = id;
      this.onClickFn = onClickFn;
    }
    onAdd() {
      const div = document.createElement('div');
      div.className = 'vm-marker';
      div.dataset.villaId = this.id;
      div.textContent = fmtPriceShort(this.price);
      div.addEventListener('click', this.onClickFn);
      div.addEventListener('mouseenter', () => { hoveredVillaId.value = this.id; });
      div.addEventListener('mouseleave', () => { hoveredVillaId.value = null; });
      this.div = div;
      const panes = this.getPanes();
      panes?.overlayMouseTarget.appendChild(div);
    }
    draw() {
      if (!this.div) return;
      const proj = this.getProjection();
      const pos = proj?.fromLatLngToDivPixel(this.position);
      if (pos) {
        this.div.style.left = pos.x + 'px';
        this.div.style.top = pos.y + 'px';
      }
    }
    onRemove() {
      this.div?.remove();
      this.div = null;
    }
    updateActive(active: boolean) {
      this.div?.classList.toggle('vm-marker-active', active);
    }
    getId() { return this.id; }
  }

  const bounds = new googleRef.maps.LatLngBounds();
  for (const v of withGps) {
    const pos = new googleRef.maps.LatLng(v.gpsLat, v.gpsLng);
    bounds.extend(pos);
    const marker = new PriceMarker(pos, v.pricePerWeekFrom, v._id, () => {
      navigateTo(localePath(`/villas/${villaSlug(v)}`));
    });
    marker.setMap(mapInstance);
    mapOverlays.push(marker);
  }
  if (!bounds.isEmpty()) {
    mapInstance.fitBounds(bounds, 80);
    googleRef.maps.event.addListenerOnce(mapInstance, 'idle', () => {
      if (mapInstance.getZoom() > 12) mapInstance.setZoom(12);
    });
  }
}

async function initMap() {
  if (!mapsEnabled || !mapContainerRef.value) return;
  if (mapInstance) {
    setTimeout(() => googleRef?.maps?.event?.trigger(mapInstance, 'resize'), 50);
    return;
  }
  try {
    googleRef = await loadMaps();
    if (!googleRef?.maps) return;
    mapInstance = new googleRef.maps.Map(mapContainerRef.value, {
      center: { lat: 43.55, lng: 7.1 },
      zoom: 9,
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: false,
      zoomControl: true,
      gestureHandling: 'greedy',
    });
    buildOverlays(visibleVillas.value);
  } catch (e) {
    console.warn('[villas/all] map init failed', e);
  }
}

watch([mapContainerRef, visibleVillas, () => showMap.value, () => mobileView.value, () => isMdUp.value], async () => {
  if (!mapContainerRef.value) return;
  const visible = showMap.value && (isMdUp.value || mobileView.value === 'map');
  if (!visible) return;
  if (!mapInstance) await initMap();
  else {
    setTimeout(() => googleRef?.maps?.event?.trigger(mapInstance, 'resize'), 50);
    buildOverlays(visibleVillas.value);
  }
}, { flush: 'post' });

watch(hoveredVillaId, (id) => {
  for (const ov of mapOverlays) {
    if (typeof ov.updateActive === 'function') {
      ov.updateActive(ov.getId() === id);
    }
  }
});

onBeforeUnmount(() => {
  destroyMarkers();
  mapInstance = null;
  googleRef = null;
});

// ============== SEO ==============

const dynamicTitle = computed(() => {
  const parts: string[] = [];
  const firstCity = fCity.value[0];
  if (fCity.value.length === 1 && firstCity) parts.push(cityLabel(firstCity));
  if (fSeaView.value) parts.push(locale.value === 'fr' ? 'vue mer' : 'sea view');
  const base = locale.value === 'fr' ? 'Villas sur la Riviera' : 'Villas on the Riviera';
  return parts.length ? `${parts.join(' · ')} · ${base}` : t('villas.allTitle');
});

useSeoMeta({
  title: () => dynamicTitle.value,
  description: () => t('villas.allDescription'),
});

// ============== Editorial body ==============

const editorialBody = computed(() => {
  const isFr = locale.value === 'fr';
  if (fCity.value.length === 1) {
    const cv = fCity.value[0];
    if (cv === 'saint-tropez' || cv === 'ramatuelle' || cv === 'gassin' || cv === 'grimaud' || cv === 'la-croix-valmer' || cv === 'sainte-maxime' || cv === 'cavalaire-sur-mer') {
      return isFr
        ? `De la presqu'île de Saint-Tropez à Cavalaire, la sélection couvre les villas avec piscine, vue mer ou pieds dans l'eau, capacité de 6 à 22 personnes. Cuisinier, ménage, conciergerie pendant le séjour, livraison de courses à l'arrivée. Transferts depuis Nice ou Toulon coordonnés.`
        : `From the Saint-Tropez peninsula to Cavalaire, the selection covers villas with pool, sea view or beachfront, capacity from 6 to 22. Private chef, housekeeping, concierge during the stay, pre-arrival grocery delivery. Transfers from Nice or Toulon coordinated.`;
    }
    if (cv === 'cannes' || cv === 'mougins' || cv === 'antibes' || cv === 'cap-d-antibes') {
      return isFr
        ? `Cannes et son arrière-pays : du Cap-d'Antibes à Mougins, en passant par les hauteurs cannoises. Villas accessibles à pied de la Croisette, propriétés sur le Cap, mas provençaux dans les collines. Conciergerie 24 heures pendant le Festival, le MIPIM, Cannes Lions, le Yachting Festival.`
        : `Cannes and its inland : from Cap-d'Antibes to Mougins, via the heights of Cannes. Villas within walking distance of the Croisette, properties on the Cap, Provençal mas in the hills. 24-hour concierge during the Festival, MIPIM, Cannes Lions, Yachting Festival.`;
    }
    if (cv === 'villefranche-sur-mer' || cv === 'cap-ferrat' || cv === 'nice' || cv === 'eze' || cv === 'monaco' || cv === 'menton') {
      return isFr
        ? `De Villefranche à Menton, l'autre versant de la Riviera. Le Cap-Ferrat et ses propriétés discrètes, Èze et ses villas perchées, Monaco et son hinterland, Menton et ses jardins. Vue sur la baie ou sur la rade. Transferts depuis Nice-Côte d'Azur en 20 minutes, hélicoptère sur demande pour Monaco.`
        : `From Villefranche to Menton, the other side of the Riviera. Cap-Ferrat and its discreet properties, Èze and its perched villas, Monaco and its hinterland, Menton and its gardens. View over the bay or the harbour. Transfers from Nice-Côte d'Azur in 20 minutes, helicopter on request for Monaco.`;
    }
  }
  return isFr
    ? `Sélection de villas sur la Côte d'Azur de Saint-Tropez à Menton. Chaque adresse a été visitée par l'équipe Misana et propose un standard cohérent : ménage, conciergerie pendant le séjour, transfert depuis l'aéroport coordonné. Demande sur mesure pour adapter à vos dates, votre groupe et vos préférences.`
    : `Selection of villas on the French Riviera from Saint-Tropez to Menton. Each address has been visited by the Misana team and offers a consistent standard : housekeeping, concierge during the stay, coordinated airport transfer. Tailor-made request to adapt to your dates, group and preferences.`;
});
</script>

<template>
  <main class="min-h-screen bg-misana-paper">
    <!-- Hero band -->
    <section class="border-b border-misana-line">
      <div class="max-w-[1600px] mx-auto px-6 sm:px-12 py-10 sm:py-20">
        <p class="text-xs uppercase tracking-widest text-misana-muted mb-3 sm:mb-4">{{ t('villas.kicker') }}</p>
        <h1 class="font-display text-3xl sm:text-5xl mb-3 sm:mb-4">{{ t('villas.hubTitle') }}</h1>
        <p class="text-misana-muted text-base sm:text-lg max-w-2xl" data-display>{{ t('villas.hubLead') }}</p>
      </div>
    </section>

    <!-- Sticky bar : count + sort + toggle map -->
    <section class="sticky top-0 z-30 bg-misana-paper border-b border-misana-line">
      <div class="max-w-[1600px] mx-auto px-4 sm:px-12 py-3 flex items-center gap-4">
        <p class="text-sm text-misana-muted">
          <span class="text-misana-ink font-medium">{{ visibleVillas.length }}</span>
          {{ t('villas.propertiesCount', visibleVillas.length) }}
        </p>

        <div class="flex-1"></div>

        <button
          v-if="mapsEnabled"
          type="button"
          class="map-toggle hidden md:inline-flex"
          @click="showMap = !showMap"
        >
          <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" class="w-4 h-4">
            <path d="M3 6L9 4L15 6L21 4V18L15 20L9 18L3 20V6Z" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" />
            <path d="M9 4V18M15 6V20" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
          <span>{{ showMap ? t('villas.hideMap') : t('villas.showMap') }}</span>
        </button>

        <div class="sort-wrap">
          <select v-model="fSort" class="sort-select" :aria-label="t('villas.sortAria')">
            <option value="default">{{ t('villas.sortDefault') }}</option>
            <option value="price-asc">{{ t('villas.sortPriceAsc') }}</option>
            <option value="price-desc">{{ t('villas.sortPriceDesc') }}</option>
            <option value="bedrooms-asc">{{ locale === 'fr' ? 'Chambres (croissant)' : 'Bedrooms (low to high)' }}</option>
            <option value="bedrooms-desc">{{ locale === 'fr' ? 'Chambres (décroissant)' : 'Bedrooms (high to low)' }}</option>
          </select>
          <span class="sort-chevron" aria-hidden="true">
            <svg viewBox="0 0 12 12" fill="none" class="block w-3 h-3">
              <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          </span>
        </div>
      </div>
    </section>

    <!-- Layout : sidebar + grid + map -->
    <section class="max-w-[1600px] mx-auto px-4 sm:px-12 py-8 sm:py-10">
      <div class="grid lg:grid-cols-12 gap-6 lg:gap-8">
        <!-- Sidebar filtres -->
        <aside class="filters-aside lg:col-span-3 lg:sticky lg:top-20 lg:self-start">
          <div class="filters-body">
            <section class="filter-section">
              <p class="filter-section-key">{{ t('villas.filterCity') }}</p>
              <ul class="filter-list">
                <li v-for="c in CITY_OPTIONS" :key="c.value">
                  <label class="filter-row">
                    <input type="checkbox" v-model="fCity" :value="c.value" class="filter-check" />
                    <span class="filter-label">{{ locale === 'fr' ? c.labelFr : c.labelEn }}</span>
                  </label>
                </li>
              </ul>
            </section>

            <section class="filter-section">
              <p class="filter-section-key">{{ t('villas.filterBedrooms') }}</p>
              <ul class="filter-list">
                <li v-for="b in BEDROOM_BUCKETS" :key="b.id">
                  <label class="filter-row">
                    <input type="checkbox" v-model="fBedrooms" :value="b.id" class="filter-check" />
                    <span class="filter-label">{{ locale === 'fr' ? b.labelFr : b.labelEn }}</span>
                  </label>
                </li>
              </ul>
            </section>

            <section class="filter-section">
              <p class="filter-section-key">{{ t('villas.filterCapacity') }}</p>
              <ul class="filter-list">
                <li v-for="b in CAPACITY_BUCKETS" :key="b.id">
                  <label class="filter-row">
                    <input type="checkbox" v-model="fCapacity" :value="b.id" class="filter-check" />
                    <span class="filter-label">{{ locale === 'fr' ? b.labelFr : b.labelEn }}</span>
                  </label>
                </li>
              </ul>
            </section>

            <section class="filter-section">
              <p class="filter-section-key">{{ t('villas.filterPrice') }}</p>
              <ul class="filter-list">
                <li v-for="b in PRICE_BUCKETS" :key="b.id">
                  <label class="filter-row">
                    <input type="checkbox" v-model="fPrice" :value="b.id" class="filter-check" />
                    <span class="filter-label">{{ locale === 'fr' ? b.labelFr : b.labelEn }}</span>
                  </label>
                </li>
              </ul>
            </section>

            <section class="filter-section">
              <p class="filter-section-key">{{ t('villas.filterSetting') }}</p>
              <ul class="filter-list">
                <li v-for="s in SETTING_OPTIONS" :key="s.value">
                  <label class="filter-row">
                    <input type="checkbox" v-model="fSetting" :value="s.value" class="filter-check" />
                    <span class="filter-label">{{ locale === 'fr' ? s.labelFr : s.labelEn }}</span>
                  </label>
                </li>
              </ul>
            </section>

            <section class="filter-section">
              <p class="filter-section-key">{{ t('villas.filterView') }}</p>
              <ul class="filter-list">
                <li>
                  <label class="filter-row">
                    <input type="checkbox" v-model="fSeaView" class="filter-check" />
                    <span class="filter-label">{{ t('villas.seaView') }}</span>
                  </label>
                </li>
              </ul>
            </section>

            <button
              v-if="filterCount"
              type="button"
              class="filters-clear-bottom"
              @click="clearFilters"
            >{{ t('villas.clearFilters') }} ({{ filterCount }})</button>
          </div>
        </aside>

        <!-- Grid + map -->
        <div class="lg:col-span-9">
          <div class="grid-map-wrap" :class="{ 'has-map': showMap && isMdUp }">
            <!-- Grid -->
            <div
              class="villas-grid-col"
              :class="{ 'mobile-hidden': !isMdUp && mobileView === 'map' }"
            >
              <div
                v-if="paginatedVillas.length"
                class="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-10"
                :class="!showMap ? 'lg:grid-cols-3' : ''"
              >
                <article
                  v-for="v in paginatedVillas"
                  :key="v._id"
                  class="villa-card"
                  :class="{ 'villa-card-active': hoveredVillaId === v._id }"
                  @mouseenter="hoveredVillaId = v._id"
                  @mouseleave="hoveredVillaId = null"
                >
                  <NuxtLink :to="localePath(`/villas/${villaSlug(v)}`)" class="block group">
                    <div class="card-image-wrap">
                      <img
                        v-if="v.hero"
                        :src="v.hero"
                        :alt="v.name"
                        loading="lazy"
                        class="card-image"
                      />
                      <div v-else class="card-image card-image-placeholder"></div>
                    </div>

                    <div class="card-text">
                      <h3 class="card-name">{{ v.name }}</h3>
                      <p class="card-location">{{ locationLine(v) }}</p>
                      <p class="card-specs">{{ specsLine(v) }}</p>
                      <p class="card-price">{{ priceLine(v) }}</p>
                    </div>
                  </NuxtLink>
                </article>
              </div>

              <div v-else class="text-center py-24">
                <p class="text-misana-muted text-sm mb-4">{{ t('villas.noResults') }}</p>
                <button
                  v-if="filterCount"
                  type="button"
                  class="text-xs underline underline-offset-4 hover:text-misana-ink transition"
                  @click="clearFilters"
                >{{ t('villas.clearFilters') }}</button>
              </div>

              <div v-if="hasMore" class="text-center mt-12">
                <button
                  type="button"
                  class="load-more-btn"
                  @click="loadMore"
                >{{ t('villas.loadMore') }}</button>
              </div>

              <p class="text-xs text-misana-muted mt-12 italic">{{ t('villas.priceFootnote') }}</p>
            </div>

            <!-- Map -->
            <aside
              v-if="showMap"
              class="villa-map-aside"
              :class="{
                'mobile-fullscreen': !isMdUp && mobileView === 'map',
                'mobile-hidden': !isMdUp && mobileView === 'list'
              }"
            >
              <div class="villa-map-wrap">
                <div ref="mapContainerRef" class="villa-map">
                  <p v-if="!mapsEnabled" class="villa-map-fallback">{{ t('villas.mapUnavailable') }}</p>
                </div>

                <Transition name="preview-fade">
                  <NuxtLink
                    v-if="previewedVilla"
                    :to="localePath(`/villas/${villaSlug(previewedVilla)}`)"
                    class="map-preview"
                  >
                    <img v-if="previewedVilla.hero" :src="previewedVilla.hero" :alt="previewedVilla.name" loading="lazy" class="map-preview-img" />
                    <div v-else class="map-preview-img map-preview-img-placeholder"></div>
                    <div class="map-preview-text">
                      <p class="map-preview-name">{{ previewedVilla.name }}</p>
                      <p class="map-preview-city">{{ cityLabel(previewedVilla.city) }}</p>
                      <p class="map-preview-price">{{ priceLine(previewedVilla) }}</p>
                    </div>
                  </NuxtLink>
                </Transition>
              </div>
            </aside>
          </div>
        </div>
      </div>
    </section>

    <!-- "Cant find..." CTA -->
    <section class="border-y border-misana-line bg-misana-stone">
      <div class="max-w-[1600px] mx-auto px-6 sm:px-12 py-14 sm:py-20 text-center">
        <h2 class="font-display text-2xl sm:text-3xl mb-4">{{ t('villas.schedCallTitle') }}</h2>
        <p class="text-misana-muted max-w-xl mx-auto mb-8 leading-relaxed">{{ t('villas.schedCallLead') }}</p>
        <NuxtLink
          :to="localePath({ path: '/request', query: { service: 'villa' } })"
          class="sched-call-cta"
        >{{ t('villas.schedCallCta') }}</NuxtLink>
      </div>
    </section>

    <!-- Body editorial -->
    <section class="bg-misana-paper">
      <div class="max-w-[1600px] mx-auto px-6 sm:px-12 py-16 sm:py-20">
        <p class="text-misana-muted leading-relaxed max-w-3xl">{{ editorialBody }}</p>
      </div>
    </section>

    <!-- FAB toggle map mobile -->
    <button
      v-if="!isMdUp && mapsEnabled && showMap"
      type="button"
      class="map-toggle-fab"
      @click="mobileView = mobileView === 'map' ? 'list' : 'map'"
    >
      <svg v-if="mobileView === 'list'" viewBox="0 0 24 24" fill="none" aria-hidden="true" class="w-4 h-4">
        <path d="M3 6L9 4L15 6L21 4V18L15 20L9 18L3 20V6Z" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" />
        <path d="M9 4V18M15 6V20" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" />
      </svg>
      <svg v-else viewBox="0 0 24 24" fill="none" aria-hidden="true" class="w-4 h-4">
        <path d="M4 6H20M4 12H20M4 18H20" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" />
      </svg>
      <span>{{ mobileView === 'list' ? t('villas.showMap') : t('villas.viewList') }}</span>
    </button>
  </main>
</template>

<style scoped>
/* STICKY BAR */
.map-toggle {
  display: inline-flex; align-items: center; gap: 8px;
  height: 36px; padding: 0 14px;
  background: var(--color-misana-paper); color: var(--color-misana-ink);
  border: 1px solid var(--color-misana-line); border-radius: 999px;
  font-size: 0.78rem; cursor: pointer; font-family: inherit;
  transition: border-color 0.25s ease;
}
.map-toggle:hover { border-color: var(--color-misana-ink); }
.sort-wrap { position: relative; display: inline-flex; align-items: center; }
.sort-select {
  appearance: none; -webkit-appearance: none;
  background: transparent; color: var(--color-misana-ink);
  border: 1px solid var(--color-misana-line); border-radius: 999px;
  padding: 0 30px 0 14px; height: 36px;
  font-size: 0.78rem; cursor: pointer; font-family: inherit;
  transition: border-color 0.25s ease; outline: none; line-height: 1;
}
.sort-select:hover, .sort-select:focus { border-color: var(--color-misana-ink); }
.sort-chevron { position: absolute; right: 10px; pointer-events: none; color: var(--color-misana-muted); }

/* SIDEBAR */
.filter-list { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 2px; }
.filter-row { display: flex; align-items: center; gap: 10px; padding: 5px 0; cursor: pointer; user-select: none; }
.filter-check {
  appearance: none; -webkit-appearance: none;
  flex: 0 0 auto; width: 14px; height: 14px; margin: 0;
  border: 1px solid var(--color-misana-ink);
  background: var(--color-misana-paper);
  border-radius: 2px; cursor: pointer; position: relative;
  transition: background 0.2s ease;
}
.filter-check:checked { background: var(--color-misana-ink); }
.filter-label { font-size: 0.85rem; color: var(--color-misana-ink); transition: color 0.2s ease; }
.filter-check:checked ~ .filter-label { font-weight: 500; }
.filters-body {
  display: flex; flex-direction: column; gap: 26px;
  padding: 0;
}
@media (min-width: 1024px) {
  .filters-body { max-height: calc(100vh - 14rem); overflow-y: auto; }
}
.filter-section { display: flex; flex-direction: column; gap: 12px; }
.filter-section-key {
  margin: 0; font-size: 0.65rem; letter-spacing: 0.22em;
  text-transform: uppercase; color: var(--color-misana-ink); font-weight: 500;
  padding-bottom: 4px;
  border-bottom: 1px solid var(--color-misana-line);
}
.filters-clear-bottom {
  margin-top: 8px;
  font-size: 0.78rem; color: var(--color-misana-ink);
  background: transparent; border: 0; cursor: pointer;
  text-align: left; padding: 6px 0; font-family: inherit;
  text-decoration: underline; text-decoration-thickness: 1px; text-underline-offset: 3px;
  transition: color 0.2s ease;
}
.filters-clear-bottom:hover { opacity: 0.7; }

@media (max-width: 1023px) {
  .filters-aside {
    padding-bottom: 24px;
    border-bottom: 1px solid var(--color-misana-line);
    margin-bottom: 24px;
  }
}

/* GRID + MAP SPLIT */
.grid-map-wrap { display: block; }
@media (min-width: 1024px) {
  .grid-map-wrap.has-map {
    display: grid;
    grid-template-columns: minmax(0, 1fr) minmax(0, 420px);
    gap: 20px;
    align-items: start;
  }
}
.villas-grid-col { min-width: 0; }
.villa-map-aside {
  position: relative;
}
@media (min-width: 1024px) {
  .villa-map-aside {
    position: sticky;
    top: 80px;
    align-self: flex-start;
    height: calc(100vh - 100px);
  }
}
.villa-map-aside.mobile-fullscreen {
  position: fixed;
  inset: 64px 0 0 0;
  z-index: 25;
  height: calc(100dvh - 64px);
}
.villa-map-aside.mobile-hidden { display: none; }
.villas-grid-col.mobile-hidden { display: none; }
@media (min-width: 768px) {
  .villa-map-aside.mobile-hidden,
  .villas-grid-col.mobile-hidden { display: block; }
}

.villa-map-wrap {
  position: relative;
  width: 100%; height: 100%;
  min-height: 500px;
  border-radius: 6px;
  overflow: hidden;
  background: var(--color-misana-stone);
}
.villa-map-aside.mobile-fullscreen .villa-map-wrap {
  border-radius: 0;
  min-height: 0;
}
.villa-map { position: absolute; inset: 0; }
.villa-map-fallback {
  position: absolute; inset: 0;
  display: flex; align-items: center; justify-content: center;
  font-size: 0.85rem; color: var(--color-misana-muted);
}

/* Pill marker */
:global(.vm-marker) {
  position: absolute;
  transform: translate(-50%, -50%);
  background: var(--color-misana-paper);
  color: var(--color-misana-ink);
  border: 1px solid rgba(0, 0, 0, 0.12);
  border-radius: 999px;
  padding: 6px 11px;
  font-family: var(--font-sans, system-ui);
  font-size: 0.74rem; font-weight: 600;
  white-space: nowrap; cursor: pointer;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.18);
  user-select: none;
  transition: transform 0.18s cubic-bezier(0.16, 1, 0.3, 1), background 0.18s ease, color 0.18s ease, box-shadow 0.18s ease;
  z-index: 1;
}
:global(.vm-marker:hover) {
  transform: translate(-50%, -50%) scale(1.08);
  z-index: 5;
  box-shadow: 0 6px 14px rgba(0, 0, 0, 0.25);
}
:global(.vm-marker-active) {
  background: var(--color-misana-ink);
  color: var(--color-misana-paper);
  border-color: var(--color-misana-ink);
  z-index: 5;
  transform: translate(-50%, -50%) scale(1.12);
}

/* Preview villa au hover marker */
.map-preview {
  position: absolute;
  left: 12px; right: 12px; bottom: 12px;
  z-index: 4;
  display: flex; align-items: stretch; gap: 12px;
  padding: 10px;
  background: var(--color-misana-paper);
  border-radius: 8px;
  box-shadow: 0 8px 28px -8px rgba(0, 0, 0, 0.28);
  text-decoration: none; color: inherit;
  max-width: 340px;
  margin-left: auto;
}
.map-preview-img {
  flex: 0 0 84px;
  width: 84px; height: 84px;
  object-fit: cover;
  border-radius: 4px;
  background: var(--color-misana-stone);
}
.map-preview-img-placeholder { background: var(--color-misana-stone); }
.map-preview-text {
  flex: 1 1 0; min-width: 0;
  display: flex; flex-direction: column; gap: 2px; padding: 2px 0;
}
.map-preview-name {
  margin: 0;
  font-family: var(--font-display, serif);
  font-size: 0.95rem; line-height: 1.2; font-weight: 500;
  color: var(--color-misana-ink);
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}
.map-preview-city { margin: 0; font-size: 0.72rem; color: var(--color-misana-muted); }
.map-preview-price { margin: auto 0 0; font-size: 0.78rem; color: var(--color-misana-ink); font-weight: 500; }
.preview-fade-enter-active, .preview-fade-leave-active {
  transition: opacity 0.18s ease, transform 0.18s ease;
}
.preview-fade-enter-from, .preview-fade-leave-to {
  opacity: 0; transform: translateY(8px);
}

/* CARD VILLA */
.villa-card { font-family: inherit; transition: opacity 0.2s ease; }
.villa-card .block { display: block; text-decoration: none; color: inherit; }
.villa-card-active .card-image-wrap {
  box-shadow: 0 0 0 2px var(--color-misana-ink);
}

.card-image-wrap {
  position: relative;
  width: 100%; aspect-ratio: 16 / 11;
  overflow: hidden; border-radius: 4px;
  background: var(--color-misana-stone);
  margin-bottom: 12px;
  transition: box-shadow 0.25s ease;
}
.card-image {
  position: absolute; inset: 0;
  width: 100%; height: 100%; object-fit: cover;
  transition: transform 1.4s cubic-bezier(0.16, 1, 0.3, 1);
}
.villa-card .group:hover .card-image { transform: scale(1.03); }
.card-image-placeholder { background: var(--color-misana-stone); }

.card-text { display: flex; flex-direction: column; gap: 3px; }
.card-name {
  margin: 0;
  font-family: var(--font-display, serif);
  font-size: 1.1rem; line-height: 1.25; font-weight: 500;
  color: var(--color-misana-ink);
}
.card-location { margin: 1px 0 0; font-size: 0.78rem; color: var(--color-misana-muted); }
.card-specs { margin: 4px 0 0; font-size: 0.78rem; color: var(--color-misana-ink); }
.card-price { margin: 6px 0 0; font-size: 0.85rem; color: var(--color-misana-ink); font-weight: 500; }

/* LOAD MORE */
.load-more-btn {
  display: inline-flex; align-items: center; justify-content: center;
  height: 48px; padding: 0 36px;
  background: var(--color-misana-paper); color: var(--color-misana-ink);
  border: 1px solid var(--color-misana-ink); border-radius: 0;
  font-size: 0.7rem; letter-spacing: 0.22em; text-transform: uppercase;
  cursor: pointer; font-family: inherit;
  transition: background 0.25s ease, color 0.25s ease;
}
.load-more-btn:hover {
  background: var(--color-misana-ink); color: var(--color-misana-paper);
}

/* SCHEDULE CTA */
.sched-call-cta {
  display: inline-flex; align-items: center; justify-content: center;
  height: 48px; padding: 0 36px;
  background: var(--color-misana-ink); color: var(--color-misana-paper);
  border: 0; border-radius: 0;
  font-size: 0.7rem; letter-spacing: 0.22em; text-transform: uppercase;
  cursor: pointer; font-family: inherit; text-decoration: none;
  transition: opacity 0.25s ease;
}
.sched-call-cta:hover { opacity: 0.9; }

/* FAB MAP MOBILE */
.map-toggle-fab {
  position: fixed;
  bottom: calc(20px + env(safe-area-inset-bottom));
  left: 50%; transform: translateX(-50%);
  display: inline-flex; align-items: center; gap: 8px;
  padding: 12px 22px;
  background: var(--color-misana-ink); color: var(--color-misana-paper);
  border: 0; border-radius: 999px;
  font-size: 0.72rem; letter-spacing: 0.16em; text-transform: uppercase;
  cursor: pointer; font-family: inherit; z-index: 30;
  box-shadow: 0 6px 20px -8px rgba(0, 0, 0, 0.4);
  transition: transform 0.2s ease;
}
.map-toggle-fab:hover { transform: translateX(-50%) translateY(-1px); }
@media (min-width: 768px) { .map-toggle-fab { display: none !important; } }

@media (prefers-reduced-motion: reduce) {
  .card-image, :global(.vm-marker),
  .preview-fade-enter-active, .preview-fade-leave-active {
    transition: none !important; transform: none !important;
  }
}
</style>
