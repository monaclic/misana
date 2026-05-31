<script setup lang="ts">
// Hub catalog villas (Côte d'Azur). Style et pattern fonctionnel
// inspirés Le Collectionist /search et Airbnb /s/<city>/homes :
// - Cards sans border, image 1:1 dominante, carousel inline.
// - Filtres chips horizontaux + drawer "Filtres" tous détails.
// - Layout split desktop : grid 7 cols + map sticky 5 cols.
// - Mobile : toggle "Voir la carte" qui swap grid <-> map fullscreen.
// - Markers map = pill prix custom (OverlayView), hover sync card.
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
onMounted(() => { stickyContactVisible.value = false; });
onBeforeUnmount(() => { stickyContactVisible.value = true; });

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
  { id: 'up-to-6', labelFr: "Jusqu'à 6 pers", labelEn: 'Up to 6 guests', min: 0, max: 6 },
  { id: '7-10', labelFr: '7 à 10 pers', labelEn: '7 to 10 guests', min: 7, max: 10 },
  { id: '11-plus', labelFr: '11+ pers', labelEn: '11+ guests', min: 11, max: 99 },
];

const BEDROOM_BUCKETS = [
  { id: '1-3', labelFr: '1 à 3 ch', labelEn: '1 to 3 br', min: 1, max: 3 },
  { id: '4-6', labelFr: '4 à 6 ch', labelEn: '4 to 6 br', min: 4, max: 6 },
  { id: '7-plus', labelFr: '7+ ch', labelEn: '7+ br', min: 7, max: 30 },
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
const showAllFilters = ref(false);

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

const VALID_SORTS = ['default', 'price-asc', 'price-desc', 'capacity-asc', 'capacity-desc'] as const;
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

// ============== View toggle (mobile only) ==============
// Desktop : split fixe grid + map. Mobile : 1 vue à la fois (grid | map).

const mobileView = ref<'list' | 'map'>('list');
const isMdUp = ref(false);
let mdMq: MediaQueryList | null = null;
function syncMd() { isMdUp.value = mdMq?.matches ?? false; }
onMounted(() => {
  mdMq = window.matchMedia('(min-width: 768px)');
  syncMd();
  mdMq.addEventListener('change', syncMd);
});
onBeforeUnmount(() => {
  mdMq?.removeEventListener('change', syncMd);
  mdMq = null;
});

// ============== Filtrage + tri ==============

function villaHaystack(v: Villa): string {
  const cityOpt = CITY_OPTIONS.find((c) => c.value === v.city);
  const cityNames = cityOpt ? [cityOpt.labelFr, cityOpt.labelEn] : [];
  const features = [
    ...(v.keyFeatures?.fr ?? []),
    ...(v.keyFeatures?.en ?? []),
  ];
  return [v.name, v.city, ...cityNames, ...features].filter(Boolean).join(' ').toLowerCase();
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
    case 'capacity-asc': return arr.sort((a, b) => (a.capacity ?? Infinity) - (b.capacity ?? Infinity));
    case 'capacity-desc': return arr.sort((a, b) => (b.capacity ?? -1) - (a.capacity ?? -1));
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

// ============== Chips actifs ==============

type Chip = { key: string; label: string; clear: () => void };
const activeChips = computed<Chip[]>(() => {
  const chips: Chip[] = [];
  for (const c of fCity.value) {
    const opt = CITY_OPTIONS.find((x) => x.value === c);
    chips.push({
      key: `city:${c}`,
      label: opt ? (locale.value === 'fr' ? opt.labelFr : opt.labelEn) : c,
      clear: () => { fCity.value = fCity.value.filter((x) => x !== c); },
    });
  }
  for (const id of fCapacity.value) {
    const b = CAPACITY_BUCKETS.find((x) => x.id === id);
    chips.push({
      key: `capacity:${id}`,
      label: b ? (locale.value === 'fr' ? b.labelFr : b.labelEn) : id,
      clear: () => { fCapacity.value = fCapacity.value.filter((x) => x !== id); },
    });
  }
  for (const id of fBedrooms.value) {
    const b = BEDROOM_BUCKETS.find((x) => x.id === id);
    chips.push({
      key: `bedrooms:${id}`,
      label: b ? (locale.value === 'fr' ? b.labelFr : b.labelEn) : id,
      clear: () => { fBedrooms.value = fBedrooms.value.filter((x) => x !== id); },
    });
  }
  for (const id of fPrice.value) {
    const b = PRICE_BUCKETS.find((x) => x.id === id);
    chips.push({
      key: `price:${id}`,
      label: b ? (locale.value === 'fr' ? b.labelFr : b.labelEn) : id,
      clear: () => { fPrice.value = fPrice.value.filter((x) => x !== id); },
    });
  }
  for (const s of fSetting.value) {
    const opt = SETTING_OPTIONS.find((x) => x.value === s);
    chips.push({
      key: `setting:${s}`,
      label: opt ? (locale.value === 'fr' ? opt.labelFr : opt.labelEn) : s,
      clear: () => { fSetting.value = fSetting.value.filter((x) => x !== s); },
    });
  }
  if (fSeaView.value) {
    chips.push({
      key: 'seaView',
      label: t('villas.seaView'),
      clear: () => { fSeaView.value = false; },
    });
  }
  return chips;
});

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
function cityLabel(value: VillaCity): string {
  const c = CITY_OPTIONS.find((x) => x.value === value);
  if (!c) return value;
  return locale.value === 'fr' ? c.labelFr : c.labelEn;
}
function villaSlug(v: Villa): string {
  return locale.value === 'fr' ? v.slug.fr : v.slug.en;
}

// ============== Carousel inline ==============

function onCarouselScroll(e: Event) {
  const target = e.currentTarget as HTMLElement;
  const slide = Math.round(target.scrollLeft / target.clientWidth);
  const dotsWrap = target.parentElement?.querySelector('.card-dots');
  if (!dotsWrap) return;
  dotsWrap.querySelectorAll('.card-dot').forEach((d, i) => {
    d.classList.toggle('card-dot-active', i === slide);
  });
}
function scrollCarousel(e: MouseEvent, dir: -1 | 1) {
  e.preventDefault();
  e.stopPropagation();
  const btn = e.currentTarget as HTMLElement;
  const wrap = btn.closest('.card-photo-wrap')?.querySelector('.card-photos') as HTMLElement | null;
  if (!wrap) return;
  wrap.scrollBy({ left: dir * wrap.clientWidth, behavior: 'smooth' });
}
function villaPhotos(v: Villa): string[] {
  return v.hero ? [v.hero] : [];
}

// ============== Hover sync card <-> marker ==============

const hoveredVillaId = ref<string | null>(null);

// ============== Map (Google Maps) ==============
// Init après mount, recréation des markers à chaque changement de
// visibleVillas. Bounds auto-fit. OverlayView custom pour pill prix.

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

  // OverlayView custom : pill blanc arrondi avec prix.
  class PriceMarker extends googleRef.maps.OverlayView {
    private position: any;
    private price: number | null;
    private id: string;
    private div: HTMLElement | null = null;
    private onClick: () => void;

    constructor(position: any, price: number | null, id: string, onClick: () => void) {
      super();
      this.position = position;
      this.price = price;
      this.id = id;
      this.onClick = onClick;
    }
    onAdd() {
      const div = document.createElement('div');
      div.className = 'vm-marker';
      div.dataset.villaId = this.id;
      div.textContent = fmtPriceShort(this.price);
      div.addEventListener('click', this.onClick);
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
    mapInstance.fitBounds(bounds, 64);
    // Cap zoom max pour éviter d'être trop zoomé sur une seule villa.
    const listener = googleRef.maps.event.addListenerOnce(mapInstance, 'idle', () => {
      if (mapInstance.getZoom() > 12) mapInstance.setZoom(12);
    });
    void listener;
  }
}

async function initMap() {
  if (!mapsEnabled || !mapContainerRef.value) return;
  try {
    googleRef = await loadMaps();
    if (!googleRef?.maps) return;
    mapInstance = new googleRef.maps.Map(mapContainerRef.value, {
      center: { lat: 43.55, lng: 7.1 }, // Côte d'Azur centre
      zoom: 9,
      disableDefaultUI: true,
      zoomControl: true,
      gestureHandling: 'greedy',
      styles: [
        // Style monochrome sobre, alignement palette Misana.
        { elementType: 'geometry', stylers: [{ color: '#f5f4f1' }] },
        { elementType: 'labels.text.fill', stylers: [{ color: '#6b6b66' }] },
        { elementType: 'labels.text.stroke', stylers: [{ color: '#ffffff' }] },
        { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#dcdfe1' }] },
        { featureType: 'water', elementType: 'labels.text.fill', stylers: [{ color: '#6b6b66' }] },
        { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#ffffff' }] },
        { featureType: 'poi', stylers: [{ visibility: 'off' }] },
        { featureType: 'transit', stylers: [{ visibility: 'off' }] },
      ],
    });
    buildOverlays(visibleVillas.value);
  } catch (e) {
    console.warn('[villas/all] map init failed', e);
  }
}

// Re-init quand la map devient visible (desktop déjà visible au mount,
// mobile = quand mobileView === 'map')
watch([mapContainerRef, visibleVillas, () => mobileView.value, () => isMdUp.value], async () => {
  if (!mapContainerRef.value) return;
  if (!isMdUp.value && mobileView.value !== 'map') return;
  if (!mapInstance) await initMap();
  else buildOverlays(visibleVillas.value);
}, { flush: 'post' });

// Sync hover : quand hoveredVillaId change, update active marker
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

// ============== Drawer filtres : body lock ==============

watch(showAllFilters, (open) => {
  if (typeof document === 'undefined') return;
  document.body.style.overflow = open ? 'hidden' : '';
});
</script>

<template>
  <main class="min-h-screen bg-misana-paper">
    <!-- Hero -->
    <section class="border-b border-misana-line">
      <div class="max-w-[1600px] mx-auto px-6 sm:px-12 py-8 sm:py-16">
        <p class="text-xs uppercase tracking-widest text-misana-muted mb-3">{{ t('villas.kicker') }}</p>
        <h1 class="font-display text-3xl sm:text-5xl mb-3">{{ t('villas.hubTitle') }}</h1>
        <p class="text-misana-muted text-base sm:text-lg max-w-2xl" data-display>{{ t('villas.hubLead') }}</p>
      </div>
    </section>

    <!-- Toolbar sticky : recherche + bouton filtres + tri + toggle mobile map -->
    <section class="sticky top-0 z-30 bg-misana-paper border-b border-misana-line">
      <div class="max-w-[1600px] mx-auto px-6 sm:px-12 py-4">
        <div class="flex items-center gap-3 flex-wrap">
          <label class="toolbar-search">
            <span class="search-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" class="block w-[16px] h-[16px]">
                <circle cx="10.5" cy="10.5" r="6.5" stroke="currentColor" stroke-width="1.6" />
                <path d="M19.5 19.5L15.5 15.5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" />
              </svg>
            </span>
            <input
              v-model="fSearch"
              type="search"
              autocomplete="off"
              spellcheck="false"
              :placeholder="t('villas.searchPlaceholder')"
              class="search-input"
              :aria-label="t('villas.searchAria')"
            />
            <button
              v-if="fSearch"
              type="button"
              class="search-clear"
              :aria-label="t('villas.searchClear')"
              @click="fSearch = ''"
            >×</button>
          </label>

          <button
            type="button"
            class="filter-button"
            @click="showAllFilters = true"
          >
            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" class="w-4 h-4">
              <path d="M4 6H20" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
              <path d="M7 12H17" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
              <path d="M10 18H14" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
            </svg>
            <span>{{ t('villas.filters') }}</span>
            <span v-if="filterCount" class="filter-button-badge">{{ filterCount }}</span>
          </button>

          <div class="flex-1"></div>

          <div class="sort-wrap">
            <select v-model="fSort" class="sort-select" :aria-label="t('villas.sortAria')">
              <option value="default">{{ t('villas.sortDefault') }}</option>
              <option value="price-asc">{{ t('villas.sortPriceAsc') }}</option>
              <option value="price-desc">{{ t('villas.sortPriceDesc') }}</option>
              <option value="capacity-asc">{{ t('villas.sortCapacityAsc') }}</option>
              <option value="capacity-desc">{{ t('villas.sortCapacityDesc') }}</option>
            </select>
            <span class="sort-chevron" aria-hidden="true">
              <svg viewBox="0 0 12 12" fill="none" class="block w-3 h-3">
                <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
            </span>
          </div>
        </div>

        <!-- Chips actifs -->
        <div v-if="activeChips.length" class="flex items-center gap-2 flex-wrap mt-3">
          <button
            v-for="chip in activeChips"
            :key="chip.key"
            type="button"
            class="chip-active"
            @click="chip.clear"
          >
            <span>{{ chip.label }}</span>
            <span class="chip-close" aria-hidden="true">×</span>
          </button>
          <button
            type="button"
            class="chip-clear-all"
            @click="clearFilters"
          >{{ t('villas.clearFilters') }}</button>
        </div>
      </div>
    </section>

    <!-- Split layout : grille + map sticky desktop, swap mobile -->
    <section class="max-w-[1600px] mx-auto px-6 sm:px-12 py-8 sm:py-12">
      <p class="text-sm text-misana-muted italic mb-6">
        {{ visibleVillas.length }} {{ t('villas.results', visibleVillas.length) }}
      </p>

      <div class="lg:grid lg:grid-cols-12 lg:gap-8">
        <!-- Grille villas -->
        <div
          class="lg:col-span-7"
          :class="{ 'hidden md:block': mobileView === 'map' }"
        >
          <div
            v-if="visibleVillas.length"
            class="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8"
          >
            <article
              v-for="v in visibleVillas"
              :key="v._id"
              class="villa-card"
              :class="{ 'villa-card-active': hoveredVillaId === v._id }"
              @mouseenter="hoveredVillaId = v._id"
              @mouseleave="hoveredVillaId = null"
            >
              <NuxtLink :to="localePath(`/villas/${villaSlug(v)}`)" class="block">
                <div class="card-photo-wrap" :data-multi="villaPhotos(v).length > 1 ? 'true' : 'false'">
                  <div class="card-photos" @scroll.passive="onCarouselScroll">
                    <img
                      v-for="(src, i) in villaPhotos(v)"
                      :key="i"
                      :src="src"
                      :alt="v.name"
                      loading="lazy"
                      class="card-photo"
                    />
                    <div v-if="!villaPhotos(v).length" class="card-photo card-photo-placeholder"></div>
                  </div>

                  <button
                    v-if="villaPhotos(v).length > 1"
                    type="button"
                    class="card-arrow card-arrow-prev"
                    :aria-label="t('villas.prevPhoto')"
                    @click="(e) => scrollCarousel(e, -1)"
                  >
                    <svg viewBox="0 0 16 16" fill="none" class="block w-3 h-3">
                      <path d="M10 12L6 8L10 4" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" />
                    </svg>
                  </button>
                  <button
                    v-if="villaPhotos(v).length > 1"
                    type="button"
                    class="card-arrow card-arrow-next"
                    :aria-label="t('villas.nextPhoto')"
                    @click="(e) => scrollCarousel(e, 1)"
                  >
                    <svg viewBox="0 0 16 16" fill="none" class="block w-3 h-3">
                      <path d="M6 4L10 8L6 12" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" />
                    </svg>
                  </button>

                  <div v-if="villaPhotos(v).length > 1" class="card-dots">
                    <span
                      v-for="(_, i) in villaPhotos(v)"
                      :key="i"
                      class="card-dot"
                      :class="{ 'card-dot-active': i === 0 }"
                      aria-hidden="true"
                    ></span>
                  </div>
                </div>

                <div class="card-text">
                  <div class="card-line-1">
                    <h3 class="card-name">{{ v.name }}</h3>
                    <p class="card-price">
                      <span class="card-price-value">{{ fmtPrice(v.pricePerWeekFrom) }}</span>
                      <span class="card-price-unit">{{ t('villas.perWeekShort') }}</span>
                    </p>
                  </div>
                  <p class="card-line-2">{{ cityLabel(v.city) }}</p>
                  <p class="card-line-3">
                    <template v-if="v.capacity">{{ v.capacity }} {{ t('villas.guestsShort') }}</template>
                    <template v-if="v.capacity && (v.bedrooms || v.bathrooms)"> · </template>
                    <template v-if="v.bedrooms">{{ v.bedrooms }} {{ t('villas.bedroomsShort') }}</template>
                    <template v-if="v.bedrooms && v.bathrooms"> · </template>
                    <template v-if="v.bathrooms">{{ v.bathrooms }} {{ t('villas.bathroomsShort') }}</template>
                  </p>
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

          <p class="text-xs text-misana-muted mt-12 italic">{{ t('villas.priceFootnote') }}</p>
        </div>

        <!-- Map sticky desktop / fullscreen mobile -->
        <aside
          class="villa-map-aside lg:col-span-5"
          :class="{ 'hidden md:block': mobileView === 'list', 'is-mobile-full': !isMdUp && mobileView === 'map' }"
        >
          <div ref="mapContainerRef" class="villa-map">
            <p v-if="!mapsEnabled" class="villa-map-fallback">{{ t('villas.mapUnavailable') }}</p>
          </div>
        </aside>
      </div>
    </section>

    <!-- Toggle "Voir carte / liste" mobile only -->
    <button
      v-if="!isMdUp"
      type="button"
      class="map-toggle-fab"
      @click="mobileView = mobileView === 'map' ? 'list' : 'map'"
    >
      <svg v-if="mobileView === 'list'" viewBox="0 0 24 24" fill="none" aria-hidden="true" class="w-4 h-4">
        <path d="M9 4L3 6V20L9 18M9 4L15 6M9 4V18M15 6L21 4V18L15 20M15 6V20M9 18L15 20" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" />
      </svg>
      <svg v-else viewBox="0 0 24 24" fill="none" aria-hidden="true" class="w-4 h-4">
        <path d="M4 6H20M4 12H20M4 18H20" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" />
      </svg>
      <span>{{ mobileView === 'list' ? t('villas.showMap') : t('villas.hideMap') }}</span>
    </button>

    <!-- ===================== DRAWER FILTRES ===================== -->
    <Transition name="drawer-fade">
      <div
        v-if="showAllFilters"
        class="drawer-backdrop"
        @click="showAllFilters = false"
      ></div>
    </Transition>
    <Transition name="drawer-slide">
      <aside
        v-if="showAllFilters"
        class="drawer"
        role="dialog"
        aria-modal="true"
      >
        <header class="drawer-header">
          <p class="drawer-title">{{ t('villas.filters') }}<span v-if="filterCount" class="drawer-title-badge">{{ filterCount }}</span></p>
          <button
            type="button"
            class="drawer-close"
            :aria-label="t('villas.filtersClose')"
            @click="showAllFilters = false"
          >
            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" class="w-4 h-4">
              <path d="M6 6L18 18M6 18L18 6" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" />
            </svg>
          </button>
        </header>

        <div class="drawer-body">
          <section class="drawer-section">
            <p class="drawer-section-key">{{ t('villas.filterCity') }}</p>
            <div class="chip-grid">
              <button
                v-for="c in CITY_OPTIONS"
                :key="c.value"
                type="button"
                class="chip"
                :class="{ 'chip-on': fCity.includes(c.value) }"
                @click="fCity.includes(c.value) ? (fCity = fCity.filter((x) => x !== c.value)) : (fCity = [...fCity, c.value])"
              >{{ locale === 'fr' ? c.labelFr : c.labelEn }}</button>
            </div>
          </section>

          <section class="drawer-section">
            <p class="drawer-section-key">{{ t('villas.filterCapacity') }}</p>
            <div class="chip-grid">
              <button
                v-for="b in CAPACITY_BUCKETS"
                :key="b.id"
                type="button"
                class="chip"
                :class="{ 'chip-on': fCapacity.includes(b.id) }"
                @click="fCapacity.includes(b.id) ? (fCapacity = fCapacity.filter((x) => x !== b.id)) : (fCapacity = [...fCapacity, b.id])"
              >{{ locale === 'fr' ? b.labelFr : b.labelEn }}</button>
            </div>
          </section>

          <section class="drawer-section">
            <p class="drawer-section-key">{{ t('villas.filterBedrooms') }}</p>
            <div class="chip-grid">
              <button
                v-for="b in BEDROOM_BUCKETS"
                :key="b.id"
                type="button"
                class="chip"
                :class="{ 'chip-on': fBedrooms.includes(b.id) }"
                @click="fBedrooms.includes(b.id) ? (fBedrooms = fBedrooms.filter((x) => x !== b.id)) : (fBedrooms = [...fBedrooms, b.id])"
              >{{ locale === 'fr' ? b.labelFr : b.labelEn }}</button>
            </div>
          </section>

          <section class="drawer-section">
            <p class="drawer-section-key">{{ t('villas.filterPrice') }}</p>
            <div class="chip-grid">
              <button
                v-for="b in PRICE_BUCKETS"
                :key="b.id"
                type="button"
                class="chip"
                :class="{ 'chip-on': fPrice.includes(b.id) }"
                @click="fPrice.includes(b.id) ? (fPrice = fPrice.filter((x) => x !== b.id)) : (fPrice = [...fPrice, b.id])"
              >{{ locale === 'fr' ? b.labelFr : b.labelEn }}</button>
            </div>
          </section>

          <section class="drawer-section">
            <p class="drawer-section-key">{{ t('villas.filterSetting') }}</p>
            <div class="chip-grid">
              <button
                v-for="s in SETTING_OPTIONS"
                :key="s.value"
                type="button"
                class="chip"
                :class="{ 'chip-on': fSetting.includes(s.value) }"
                @click="fSetting.includes(s.value) ? (fSetting = fSetting.filter((x) => x !== s.value)) : (fSetting = [...fSetting, s.value])"
              >{{ locale === 'fr' ? s.labelFr : s.labelEn }}</button>
            </div>
          </section>

          <section class="drawer-section">
            <p class="drawer-section-key">{{ t('villas.filterView') }}</p>
            <div class="chip-grid">
              <button
                type="button"
                class="chip"
                :class="{ 'chip-on': fSeaView }"
                @click="fSeaView = !fSeaView"
              >{{ t('villas.seaView') }}</button>
            </div>
          </section>
        </div>

        <footer class="drawer-footer">
          <button type="button" class="drawer-clear" @click="clearFilters">{{ t('villas.clearFilters') }}</button>
          <button type="button" class="drawer-apply" @click="showAllFilters = false">
            {{ t('villas.viewResults', { n: visibleVillas.length }) }}
          </button>
        </footer>
      </aside>
    </Transition>
  </main>
</template>

<style scoped>
/* ============================================== */
/* TOOLBAR sticky                                 */
/* ============================================== */
.toolbar-search {
  flex: 0 1 320px; min-width: 200px;
  display: flex; align-items: center; gap: 10px;
  background: var(--color-misana-paper);
  border: 1px solid var(--color-misana-line);
  border-radius: 999px;
  padding: 0 14px; height: 40px;
  cursor: text;
  transition: border-color 0.25s ease, box-shadow 0.25s ease;
}
.toolbar-search:focus-within {
  border-color: var(--color-misana-ink);
  box-shadow: 0 1px 6px -2px rgba(0, 0, 0, 0.12);
}
.search-icon { flex: 0 0 auto; display: inline-flex; color: var(--color-misana-muted); }
.toolbar-search:focus-within .search-icon { color: var(--color-misana-ink); }
.search-input {
  flex: 1 1 0; min-width: 0;
  background: transparent; border: 0; outline: 0;
  font-family: inherit; font-size: 0.85rem;
  color: var(--color-misana-ink); padding: 0;
}
.search-input::placeholder { color: var(--color-misana-muted); }
.search-input::-webkit-search-cancel-button { display: none; }
.search-clear {
  flex: 0 0 auto; width: 20px; height: 20px;
  display: inline-flex; align-items: center; justify-content: center;
  background: transparent; color: var(--color-misana-muted);
  border: 0; border-radius: 999px;
  font-size: 1rem; line-height: 1; cursor: pointer; font-family: inherit;
  transition: color 0.2s ease, background 0.2s ease;
}
.search-clear:hover { color: var(--color-misana-ink); background: var(--color-misana-stone); }

.filter-button {
  display: inline-flex; align-items: center; gap: 8px;
  height: 40px; padding: 0 16px;
  background: var(--color-misana-paper); color: var(--color-misana-ink);
  border: 1px solid var(--color-misana-line); border-radius: 999px;
  font-size: 0.78rem; cursor: pointer; font-family: inherit;
  transition: border-color 0.25s ease;
}
.filter-button:hover { border-color: var(--color-misana-ink); }
.filter-button-badge {
  display: inline-flex; align-items: center; justify-content: center;
  min-width: 18px; height: 18px; padding: 0 5px;
  background: var(--color-misana-ink); color: var(--color-misana-paper);
  border-radius: 999px; font-size: 0.65rem;
}

.sort-wrap { position: relative; display: inline-flex; align-items: center; }
.sort-select {
  appearance: none; -webkit-appearance: none;
  background: var(--color-misana-paper); color: var(--color-misana-ink);
  border: 1px solid var(--color-misana-line); border-radius: 999px;
  padding: 0 28px 0 14px; height: 40px;
  font-size: 0.78rem; cursor: pointer; font-family: inherit;
  transition: border-color 0.25s ease; outline: none; line-height: 1;
}
.sort-select:hover { border-color: var(--color-misana-ink); }
.sort-chevron { position: absolute; right: 10px; pointer-events: none; color: var(--color-misana-muted); }

.chip-active {
  display: inline-flex; align-items: center; gap: 6px;
  height: 30px; padding: 0 10px 0 14px;
  background: var(--color-misana-ink); color: var(--color-misana-paper);
  border: 0; border-radius: 999px;
  font-size: 0.75rem; cursor: pointer; font-family: inherit;
  transition: opacity 0.2s ease;
}
.chip-active:hover { opacity: 0.85; }
.chip-close {
  display: inline-flex; align-items: center; justify-content: center;
  width: 16px; height: 16px; border-radius: 999px;
  background: rgba(255, 255, 255, 0.18); font-size: 0.9rem; line-height: 1;
}
.chip-clear-all {
  font-size: 0.72rem; color: var(--color-misana-muted);
  background: transparent; border: 0; cursor: pointer;
  padding: 4px 8px; font-family: inherit;
  text-decoration: underline; text-decoration-thickness: 1px; text-underline-offset: 3px;
  transition: color 0.2s ease;
}
.chip-clear-all:hover { color: var(--color-misana-ink); }

@media (max-width: 640px) {
  .toolbar-search { flex: 1 1 100%; height: 40px; }
  .sort-select { font-size: 0.72rem; padding: 0 26px 0 12px; }
  .filter-button { font-size: 0.72rem; padding: 0 12px; }
}

/* ============================================== */
/* CARD VILLA (style LC)                          */
/* ============================================== */
.villa-card { font-family: inherit; transition: opacity 0.2s ease; }
.villa-card .block { display: block; text-decoration: none; color: inherit; }
.villa-card-active .card-photo-wrap {
  box-shadow: 0 0 0 2px var(--color-misana-ink);
}

.card-photo-wrap {
  position: relative;
  width: 100%; aspect-ratio: 1 / 1;
  overflow: hidden; border-radius: 6px;
  background: var(--color-misana-stone);
  isolation: isolate;
  transition: box-shadow 0.25s ease;
}
.card-photos {
  display: flex; flex-direction: row;
  width: 100%; height: 100%;
  overflow-x: auto; overflow-y: hidden;
  scroll-snap-type: x mandatory;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
}
.card-photos::-webkit-scrollbar { display: none; }
.card-photo {
  flex: 0 0 100%;
  width: 100%; height: 100%; object-fit: cover;
  scroll-snap-align: start;
  transition: transform 1.2s cubic-bezier(0.16, 1, 0.3, 1);
}
.villa-card:hover .card-photo { transform: scale(1.03); }
.card-photo-placeholder { background: var(--color-misana-stone); }

.card-arrow {
  position: absolute; top: 50%; transform: translateY(-50%);
  width: 28px; height: 28px;
  display: none; align-items: center; justify-content: center;
  background: rgba(255, 255, 255, 0.96); color: var(--color-misana-ink);
  border: 1px solid rgba(0, 0, 0, 0.06); border-radius: 999px;
  cursor: pointer; padding: 0;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
  opacity: 0; z-index: 2;
  transition: opacity 0.2s ease, transform 0.2s ease;
}
.card-arrow:hover { transform: translateY(-50%) scale(1.08); }
.card-arrow-prev { left: 8px; }
.card-arrow-next { right: 8px; }
@media (hover: hover) and (min-width: 768px) {
  .card-photo-wrap[data-multi="true"] .card-arrow { display: inline-flex; }
  .villa-card:hover .card-arrow { opacity: 1; }
}

.card-dots {
  position: absolute; bottom: 10px; left: 50%;
  transform: translateX(-50%);
  display: inline-flex; align-items: center; gap: 5px;
  z-index: 2; pointer-events: none;
}
.card-dot {
  width: 6px; height: 6px; border-radius: 999px;
  background: rgba(255, 255, 255, 0.6);
  transition: background 0.25s ease, transform 0.25s ease;
}
.card-dot-active { background: rgba(255, 255, 255, 1); transform: scale(1.15); }

.card-text { margin-top: 12px; display: flex; flex-direction: column; gap: 2px; }
.card-line-1 { display: flex; align-items: baseline; gap: 12px; }
.card-name {
  flex: 1 1 0; min-width: 0; margin: 0;
  font-family: var(--font-display, serif);
  font-size: 1.05rem; line-height: 1.25; font-weight: 500;
  color: var(--color-misana-ink);
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}
.card-price {
  flex: 0 0 auto; margin: 0;
  display: inline-flex; align-items: baseline; gap: 4px;
  white-space: nowrap;
}
.card-price-value {
  font-family: var(--font-display, serif);
  font-size: 0.95rem; line-height: 1;
  color: var(--color-misana-ink);
}
.card-price-unit { font-size: 0.7rem; color: var(--color-misana-muted); }
.card-line-2 { margin: 1px 0 0; font-size: 0.78rem; color: var(--color-misana-muted); }
.card-line-3 { margin: 1px 0 0; font-size: 0.74rem; color: var(--color-misana-muted); }

/* ============================================== */
/* MAP                                             */
/* ============================================== */
.villa-map-aside {
  position: relative;
}
@media (min-width: 1024px) {
  .villa-map-aside {
    position: sticky;
    top: calc(64px + 80px); /* offset header + toolbar approximatif */
    align-self: flex-start;
    height: calc(100vh - 64px - 100px);
  }
}
.villa-map-aside.is-mobile-full {
  position: fixed;
  inset: 64px 0 0 0;
  z-index: 25;
  height: calc(100dvh - 64px);
}
.villa-map {
  position: relative;
  width: 100%; height: 100%;
  min-height: 500px;
  background: var(--color-misana-stone);
  border: 1px solid var(--color-misana-line);
  border-radius: 6px;
  overflow: hidden;
}
.villa-map-aside.is-mobile-full .villa-map {
  border-radius: 0;
  border: 0;
  min-height: 0;
}
.villa-map-fallback {
  position: absolute; inset: 0;
  display: flex; align-items: center; justify-content: center;
  font-size: 0.85rem; color: var(--color-misana-muted);
}

/* Pill marker prix (OverlayView dans Google Maps) */
:global(.vm-marker) {
  position: absolute;
  transform: translate(-50%, -50%);
  background: var(--color-misana-paper);
  color: var(--color-misana-ink);
  border: 1px solid var(--color-misana-line);
  border-radius: 999px;
  padding: 5px 10px;
  font-family: var(--font-sans, system-ui);
  font-size: 0.72rem;
  font-weight: 500;
  white-space: nowrap;
  cursor: pointer;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
  user-select: none;
  transition: transform 0.18s cubic-bezier(0.16, 1, 0.3, 1), background 0.18s ease, color 0.18s ease, box-shadow 0.18s ease;
  z-index: 1;
}
:global(.vm-marker:hover) {
  transform: translate(-50%, -50%) scale(1.06);
  z-index: 3;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.22);
}
:global(.vm-marker-active) {
  background: var(--color-misana-ink);
  color: var(--color-misana-paper);
  border-color: var(--color-misana-ink);
  z-index: 3;
  transform: translate(-50%, -50%) scale(1.1);
}

/* Toggle FAB mobile */
.map-toggle-fab {
  position: fixed;
  bottom: calc(24px + env(safe-area-inset-bottom));
  left: 50%;
  transform: translateX(-50%);
  display: inline-flex; align-items: center; gap: 8px;
  padding: 12px 22px;
  background: var(--color-misana-ink); color: var(--color-misana-paper);
  border: 0; border-radius: 999px;
  font-size: 0.78rem; letter-spacing: 0;
  cursor: pointer; font-family: inherit;
  z-index: 35;
  box-shadow: 0 6px 20px -8px rgba(0, 0, 0, 0.4);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}
.map-toggle-fab:hover { transform: translateX(-50%) translateY(-1px); }
@media (min-width: 768px) {
  .map-toggle-fab { display: none !important; }
}

/* ============================================== */
/* DRAWER FILTRES                                  */
/* ============================================== */
.drawer-backdrop {
  position: fixed; inset: 0; z-index: 40;
  background: rgba(0, 0, 0, 0.45);
}
.drawer {
  position: fixed; z-index: 50;
  background: var(--color-misana-paper);
  display: flex; flex-direction: column;
  inset: auto 0 0 0;
  height: 92vh; max-height: 92vh;
  border-top-left-radius: 14px; border-top-right-radius: 14px;
  box-shadow: 0 -8px 30px -10px rgba(0, 0, 0, 0.25);
}
@media (min-width: 768px) {
  .drawer {
    inset: 0 0 0 auto;
    width: min(520px, 92vw);
    height: 100vh; max-height: 100vh;
    border-radius: 0;
    border-left: 1px solid var(--color-misana-line);
    box-shadow: -8px 0 30px -10px rgba(0, 0, 0, 0.18);
  }
}
.drawer-header {
  flex: 0 0 auto;
  display: flex; align-items: center; justify-content: space-between;
  gap: 12px; padding: 18px 22px;
  border-bottom: 1px solid var(--color-misana-line);
}
.drawer-title {
  margin: 0;
  font-size: 0.7rem; letter-spacing: 0.22em;
  text-transform: uppercase; color: var(--color-misana-ink);
  display: inline-flex; align-items: center; gap: 8px;
}
.drawer-title-badge {
  display: inline-flex; align-items: center; justify-content: center;
  min-width: 22px; height: 22px; padding: 0 6px;
  background: var(--color-misana-ink); color: var(--color-misana-paper);
  border-radius: 999px; font-size: 0.7rem;
}
.drawer-close {
  width: 32px; height: 32px;
  background: transparent; color: var(--color-misana-ink);
  border: 1px solid var(--color-misana-line); border-radius: 999px;
  display: inline-flex; align-items: center; justify-content: center;
  cursor: pointer; transition: border-color 0.2s ease, background 0.2s ease;
}
.drawer-close:hover { border-color: var(--color-misana-ink); background: var(--color-misana-stone); }
.drawer-body {
  flex: 1 1 auto;
  padding: 22px 22px 32px;
  overflow-y: auto; -webkit-overflow-scrolling: touch;
  display: flex; flex-direction: column; gap: 26px;
}
.drawer-section { display: flex; flex-direction: column; gap: 12px; }
.drawer-section-key {
  margin: 0;
  font-size: 0.62rem; letter-spacing: 0.24em;
  text-transform: uppercase; color: var(--color-misana-muted);
}
.chip-grid { display: flex; flex-wrap: wrap; gap: 8px; }
.chip {
  display: inline-flex; align-items: center;
  height: 36px; padding: 0 14px;
  background: var(--color-misana-paper); color: var(--color-misana-ink);
  border: 1px solid var(--color-misana-line); border-radius: 999px;
  font-size: 0.78rem; cursor: pointer; font-family: inherit;
  transition: border-color 0.2s ease, background 0.2s ease, color 0.2s ease;
}
.chip:hover { border-color: var(--color-misana-ink); }
.chip-on {
  background: var(--color-misana-ink); color: var(--color-misana-paper);
  border-color: var(--color-misana-ink);
}
.drawer-footer {
  flex: 0 0 auto;
  display: flex; align-items: center; gap: 12px;
  padding: 14px 22px calc(14px + env(safe-area-inset-bottom));
  border-top: 1px solid var(--color-misana-line);
  background: var(--color-misana-paper);
}
.drawer-clear {
  font-size: 0.78rem; color: var(--color-misana-ink);
  background: transparent; border: 0; cursor: pointer; padding: 8px 4px;
  text-decoration: underline; text-decoration-thickness: 1px; text-underline-offset: 4px;
  font-family: inherit;
}
.drawer-apply {
  flex: 1 1 0;
  background: var(--color-misana-ink); color: var(--color-misana-paper);
  border: 0; border-radius: 8px;
  height: 48px; padding: 0 22px;
  font-size: 0.78rem; letter-spacing: 0.12em; text-transform: uppercase;
  cursor: pointer; font-family: inherit;
  transition: opacity 0.2s ease;
}
.drawer-apply:hover { opacity: 0.9; }

.drawer-fade-enter-active, .drawer-fade-leave-active { transition: opacity 0.25s ease; }
.drawer-fade-enter-from, .drawer-fade-leave-to { opacity: 0; }
.drawer-slide-enter-active, .drawer-slide-leave-active {
  transition: transform 0.35s cubic-bezier(0.32, 0.72, 0, 1);
}
.drawer-slide-enter-from, .drawer-slide-leave-to { transform: translateY(100%); }
@media (min-width: 768px) {
  .drawer-slide-enter-from, .drawer-slide-leave-to { transform: translateX(100%); }
}

@media (prefers-reduced-motion: reduce) {
  .card-photo, :global(.vm-marker),
  .drawer-fade-enter-active, .drawer-fade-leave-active,
  .drawer-slide-enter-active, .drawer-slide-leave-active {
    transition: none !important;
    transform: none !important;
  }
}
</style>
