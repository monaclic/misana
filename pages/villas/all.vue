<script setup lang="ts">
// Hub catalog villas (Côte d'Azur). Style strictement aligné sur
// lecollectionist.com/en/search :
// - Hero band restreint
// - Sticky filter bar : count + collection chips + sort dropdown
// - Sidebar gauche rétractable + grid 3 cols desktop
// - Card landscape 16:9 : nom + location + specs + amenities chips
//   + prix "From X to Y per week" + label collection
// - Pas de map (LC/search n'en a pas)
// - Pagination "Load more" (infinite-scroll-style)
// - Section "Cant find?" + Schedule a call
import { useVillas, type Villa, type VillaCity, type VillaSetting } from '~/composables/useVillas';

definePageMeta({ layout: 'default' });
defineI18nRoute({
  paths: { en: '/villas/all', fr: '/villas/all' },
});

const { villas: VILLAS_REF } = useVillas();

const route = useRoute();
const router = useRouter();
const { locale, t } = useI18n();
const localePath = useLocalePath();

const stickyContactVisible = useState<boolean>('sticky-contact-visible', () => true);
const isLgUp = ref(false);
let lgMq: MediaQueryList | null = null;
function syncLg() { isLgUp.value = lgMq?.matches ?? false; }
onMounted(() => {
  stickyContactVisible.value = false;
  lgMq = window.matchMedia('(min-width: 1024px)');
  syncLg();
  lgMq.addEventListener('change', syncLg);
});
onBeforeUnmount(() => {
  stickyContactVisible.value = true;
  lgMq?.removeEventListener('change', syncLg);
  lgMq = null;
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

const COLLECTION_OPTIONS = [
  { value: 'essential', labelFr: 'Essential', labelEn: 'Essential' },
  { value: 'signature', labelFr: 'Signature', labelEn: 'Signature' },
  { value: 'iconic', labelFr: 'Iconic', labelEn: 'Iconic' },
] as const;

type CollectionValue = (typeof COLLECTION_OPTIONS)[number]['value'];

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
const COLLECTION_VALUES = COLLECTION_OPTIONS.map((c) => c.value);
const SETTING_VALUES = SETTING_OPTIONS.map((s) => s.value);

const fCity = ref<VillaCity[]>(asArray(route.query.city, CITY_VALUES));
const fCollection = ref<CollectionValue[]>(asArray(route.query.collection, COLLECTION_VALUES));
const fCapacity = ref<string[]>(asArray(route.query.capacity, CAPACITY_BUCKETS.map((b) => b.id) as readonly string[]));
const fBedrooms = ref<string[]>(asArray(route.query.bedrooms, BEDROOM_BUCKETS.map((b) => b.id) as readonly string[]));
const fPrice = ref<string[]>(asArray(route.query.price, PRICE_BUCKETS.map((b) => b.id) as readonly string[]));
const fSeaView = ref<boolean>(route.query.seaView === '1');
const fSetting = ref<VillaSetting[]>(asArray(route.query.setting, SETTING_VALUES));
const fSearch = ref<string>(typeof route.query.q === 'string' ? route.query.q : '');
const showFilters = ref(false);

function syncQuery() {
  const q: Record<string, string> = { ...route.query } as Record<string, string>;
  delete q.city; delete q.collection; delete q.capacity; delete q.bedrooms; delete q.price; delete q.seaView; delete q.setting; delete q.q;
  if (fCity.value.length) q.city = fCity.value.join(',');
  if (fCollection.value.length) q.collection = fCollection.value.join(',');
  if (fCapacity.value.length) q.capacity = fCapacity.value.join(',');
  if (fBedrooms.value.length) q.bedrooms = fBedrooms.value.join(',');
  if (fPrice.value.length) q.price = fPrice.value.join(',');
  if (fSeaView.value) q.seaView = '1';
  if (fSetting.value.length) q.setting = fSetting.value.join(',');
  if (fSearch.value.trim()) q.q = fSearch.value.trim();
  router.replace({ path: route.path, query: q });
}
watch([fCity, fCollection, fCapacity, fBedrooms, fPrice, fSeaView, fSetting, fSearch], syncQuery, { deep: true });

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
    if (fCollection.value.length && (!v.collection || !fCollection.value.includes(v.collection as CollectionValue))) return false;
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
  fCity.value.length + fCollection.value.length + fCapacity.value.length + fBedrooms.value.length +
  fPrice.value.length + fSetting.value.length + (fSeaView.value ? 1 : 0),
);

function clearFilters() {
  fSearch.value = '';
  fCity.value = [];
  fCollection.value = [];
  fCapacity.value = [];
  fBedrooms.value = [];
  fPrice.value = [];
  fSeaView.value = false;
  fSetting.value = [];
}

// ============== Load more (LC pattern) ==============

const PAGE_SIZE = 12;
const visibleCount = ref(PAGE_SIZE);
watch([fCity, fCollection, fCapacity, fBedrooms, fPrice, fSeaView, fSetting, fSearch, fSort], () => {
  visibleCount.value = PAGE_SIZE; // reset à chaque changement
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
function amenitiesChips(v: Villa): string[] {
  // Si keyFeatures rempli côté Sanity, on les utilise. Sinon on dérive de
  // seaView/setting/heater pour avoir 1-2 chips minimum.
  const features = locale.value === 'fr' ? (v.keyFeatures?.fr ?? []) : (v.keyFeatures?.en ?? []);
  if (features.length) return features.slice(0, 2);
  const derived: string[] = [];
  if (v.setting === 'beachfront') derived.push(t('villas.amenityBeachfront'));
  if (v.seaView) derived.push(t('villas.amenitySeaView'));
  return derived.slice(0, 2);
}
function collectionLabel(v: Villa): string | null {
  if (!v.collection) return null;
  const c = COLLECTION_OPTIONS.find((x) => x.value === v.collection);
  if (!c) return v.collection;
  const name = locale.value === 'fr' ? c.labelFr.toLowerCase() : c.labelEn.toLowerCase();
  return t('villas.collectionLabel', { name });
}

// ============== SEO ==============

const dynamicTitle = computed(() => {
  const parts: string[] = [];
  const firstCity = fCity.value[0];
  if (fCity.value.length === 1 && firstCity) parts.push(cityLabel(firstCity));
  if (fCollection.value.length === 1) parts.push(fCollection.value[0]);
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
        ? `Cannes et son arrière-pays : du Cap-d'Antibes à Mougins, en passant par les hauteurs cannoises. Villas accessibles à pied de la Croisette, propriétés sur le Cap, mas provençaux dans les collines. Tarif semaine de 9 000 à 80 000 €. Conciergerie 24 heures pendant le Festival, le MIPIM, Cannes Lions, le Yachting Festival.`
        : `Cannes and its inland : from Cap-d'Antibes to Mougins, via the heights of Cannes. Villas within walking distance of the Croisette, properties on the Cap, Provençal mas in the hills. Weekly rate from €9,000 to €80,000. 24-hour concierge during the Festival, MIPIM, Cannes Lions, Yachting Festival.`;
    }
    if (cv === 'villefranche-sur-mer' || cv === 'cap-ferrat' || cv === 'nice' || cv === 'eze' || cv === 'monaco' || cv === 'menton') {
      return isFr
        ? `De Villefranche à Menton, l'autre versant de la Riviera. Le Cap-Ferrat et ses propriétés discrètes, Èze et ses villas perchées, Monaco et son hinterland, Menton et ses jardins. Vue sur la baie ou sur la rade. Transferts depuis Nice-Côte d'Azur en 20 minutes, hélicoptère sur demande pour Monaco.`
        : `From Villefranche to Menton, the other side of the Riviera. Cap-Ferrat and its discreet properties, Èze and its perched villas, Monaco and its hinterland, Menton and its gardens. View over the bay or the harbour. Transfers from Nice-Côte d'Azur in 20 minutes, helicopter on request for Monaco.`;
    }
  }
  return isFr
    ? `Sélection de villas sur la Côte d'Azur de Saint-Tropez à Menton. Chaque adresse a été visitée par l'équipe Misana et propose un standard cohérent : ménage, conciergerie pendant le séjour, transfert depuis l'aéroport coordonné. Tarifs semaine de 5 000 à 140 000 €. Demande sur mesure pour adapter à vos dates, votre groupe et vos préférences.`
    : `Selection of villas on the French Riviera from Saint-Tropez to Menton. Each address has been visited by the Misana team and offers a consistent standard : housekeeping, concierge during the stay, coordinated airport transfer. Weekly rates from €5,000 to €140,000. Tailor-made request to adapt to your dates, group and preferences.`;
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

    <!-- Sticky filter bar : count + collection chips + sort -->
    <section class="sticky top-0 z-30 bg-misana-paper border-b border-misana-line">
      <div class="max-w-[1600px] mx-auto px-4 sm:px-12 py-3 flex items-center gap-4 flex-wrap">
        <button
          type="button"
          class="all-filters-btn lg:hidden"
          @click="showFilters = true"
        >
          <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" class="w-4 h-4">
            <path d="M4 6H20M7 12H17M10 18H14" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
          </svg>
          <span>{{ t('villas.filters') }}</span>
          <span v-if="filterCount" class="all-filters-badge">{{ filterCount }}</span>
        </button>

        <p class="text-sm text-misana-muted">
          <span class="text-misana-ink font-medium">{{ visibleVillas.length }}</span>
          {{ t('villas.propertiesCount', visibleVillas.length) }}
        </p>

        <!-- Collection chips (quick filter) -->
        <div class="hidden md:flex items-center gap-2 ml-2">
          <button
            v-for="c in COLLECTION_OPTIONS"
            :key="c.value"
            type="button"
            class="coll-chip"
            :class="{ 'coll-chip-on': fCollection.includes(c.value) }"
            @click="fCollection.includes(c.value)
              ? (fCollection = fCollection.filter((x) => x !== c.value))
              : (fCollection = [...fCollection, c.value])"
          >{{ locale === 'fr' ? c.labelFr : c.labelEn }}</button>
        </div>

        <div class="flex-1"></div>

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

    <!-- Layout principal : sidebar + grid -->
    <section class="max-w-[1600px] mx-auto px-4 sm:px-12 py-8 sm:py-10">
      <div class="grid lg:grid-cols-12 gap-8 lg:gap-10">
        <!-- Backdrop mobile -->
        <Transition name="filters-fade">
          <div
            v-if="showFilters"
            class="lg:hidden fixed inset-0 z-40 bg-black/50"
            @click="showFilters = false"
          ></div>
        </Transition>

        <!-- Sidebar filtres -->
        <Transition name="filters-sheet">
          <aside
            v-show="showFilters || isLgUp"
            class="filters-aside lg:col-span-3 lg:sticky lg:top-20 lg:self-start"
            :class="showFilters ? 'is-open' : ''"
          >
            <div class="filters-card">
              <div class="filters-header">
                <button
                  type="button"
                  class="filters-close lg:hidden"
                  :aria-label="t('villas.filtersClose')"
                  @click="showFilters = false"
                >
                  <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" class="w-4 h-4">
                    <path d="M6 6L18 18M6 18L18 6" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" />
                  </svg>
                </button>
                <p class="filters-title">{{ t('villas.filters') }}<span v-if="filterCount" class="filters-badge">{{ filterCount }}</span></p>
                <button
                  v-if="filterCount"
                  type="button"
                  class="filters-clear"
                  @click="clearFilters"
                >{{ t('villas.clearFilters') }}</button>
                <span v-else class="filters-clear-spacer lg:hidden"></span>
              </div>

              <div class="filters-body">
                <section class="filter-section">
                  <p class="filter-section-key">{{ t('villas.filterCollection') }}</p>
                  <ul class="filter-list">
                    <li v-for="c in COLLECTION_OPTIONS" :key="c.value">
                      <label class="filter-row">
                        <input type="checkbox" v-model="fCollection" :value="c.value" class="filter-check" />
                        <span class="filter-label">{{ locale === 'fr' ? c.labelFr : c.labelEn }}</span>
                      </label>
                    </li>
                  </ul>
                </section>

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
              </div>

              <div class="filters-footer lg:hidden">
                <button
                  type="button"
                  class="filters-apply"
                  @click="showFilters = false"
                >
                  {{ t('villas.viewResults', { n: visibleVillas.length }) }}
                </button>
              </div>
            </div>
          </aside>
        </Transition>

        <!-- Grid villas -->
        <div class="lg:col-span-9">
          <div
            v-if="paginatedVillas.length"
            class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-10"
          >
            <article v-for="v in paginatedVillas" :key="v._id" class="villa-card">
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
                  <p v-if="amenitiesChips(v).length" class="card-amenities">
                    <span v-for="(a, i) in amenitiesChips(v)" :key="i">
                      {{ a }}<span v-if="i < amenitiesChips(v).length - 1" class="card-sep"> · </span>
                    </span>
                  </p>
                  <p class="card-price">{{ priceLine(v) }}</p>
                  <p v-if="collectionLabel(v)" class="card-collection">{{ collectionLabel(v) }}</p>
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
      </div>
    </section>

    <!-- "Cant find the house..." -->
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
  </main>
</template>

<style scoped>
/* ============================================== */
/* STICKY FILTER BAR                              */
/* ============================================== */

.all-filters-btn {
  display: inline-flex; align-items: center; gap: 8px;
  height: 36px; padding: 0 14px;
  background: var(--color-misana-paper); color: var(--color-misana-ink);
  border: 1px solid var(--color-misana-line); border-radius: 999px;
  font-size: 0.78rem; cursor: pointer; font-family: inherit;
  transition: border-color 0.25s ease;
}
.all-filters-btn:hover { border-color: var(--color-misana-ink); }
.all-filters-badge {
  display: inline-flex; align-items: center; justify-content: center;
  min-width: 18px; height: 18px; padding: 0 5px;
  background: var(--color-misana-ink); color: var(--color-misana-paper);
  border-radius: 999px; font-size: 0.65rem;
}

.coll-chip {
  display: inline-flex; align-items: center;
  height: 32px; padding: 0 14px;
  background: var(--color-misana-paper); color: var(--color-misana-muted);
  border: 1px solid var(--color-misana-line); border-radius: 999px;
  font-size: 0.78rem; cursor: pointer; font-family: inherit;
  transition: border-color 0.2s ease, color 0.2s ease, background 0.2s ease;
}
.coll-chip:hover { border-color: var(--color-misana-ink); color: var(--color-misana-ink); }
.coll-chip-on {
  background: var(--color-misana-ink); color: var(--color-misana-paper);
  border-color: var(--color-misana-ink);
}
.coll-chip-on:hover { color: var(--color-misana-paper); }

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

/* ============================================== */
/* SIDEBAR FILTRES (LC pattern)                   */
/* ============================================== */

.filter-list { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 2px; }
.filter-row { display: flex; align-items: center; gap: 10px; padding: 5px 0; cursor: pointer; user-select: none; }
.filter-check {
  appearance: none; -webkit-appearance: none;
  flex: 0 0 auto; width: 14px; height: 14px; margin: 0;
  border: 1px solid var(--color-misana-ink);
  background: var(--color-misana-paper);
  border-radius: 2px;
  cursor: pointer; position: relative;
  transition: background 0.2s ease;
}
.filter-check:checked { background: var(--color-misana-ink); }
.filter-label { font-size: 0.85rem; color: var(--color-misana-ink); transition: color 0.2s ease; }
.filter-row:hover .filter-label { color: var(--color-misana-ink); }
.filter-check:checked ~ .filter-label { font-weight: 500; }

.filters-aside.is-open {
  position: fixed; inset: auto 0 0 0; z-index: 50;
  height: 88vh; max-height: 88vh;
  background: var(--color-misana-paper);
  border-top-left-radius: 14px; border-top-right-radius: 14px;
  box-shadow: 0 -8px 30px -10px rgba(0, 0, 0, 0.25);
  display: flex; flex-direction: column;
}
@media (min-width: 1024px) {
  .filters-aside, .filters-aside.is-open {
    position: sticky; inset: auto; top: 80px;
    height: auto; max-height: none;
    background: transparent; border-radius: 0; box-shadow: none;
  }
}
.filters-sheet-enter-active, .filters-sheet-leave-active {
  transition: transform 0.35s cubic-bezier(0.32, 0.72, 0, 1), opacity 0.25s ease;
}
.filters-sheet-enter-from, .filters-sheet-leave-to { transform: translateY(100%); opacity: 0; }
@media (min-width: 1024px) {
  .filters-sheet-enter-active, .filters-sheet-leave-active { transition: none; }
  .filters-sheet-enter-from, .filters-sheet-leave-to { transform: none; opacity: 1; }
}
.filters-fade-enter-active, .filters-fade-leave-active { transition: opacity 0.25s ease; }
.filters-fade-enter-from, .filters-fade-leave-to { opacity: 0; }

.filters-card {
  height: 100%; background: var(--color-misana-paper);
  overflow: hidden; display: flex; flex-direction: column;
}
.filters-header {
  display: flex; align-items: center; justify-content: space-between;
  gap: 12px; padding: 16px 0 14px;
  border-bottom: 1px solid var(--color-misana-line);
  background: var(--color-misana-paper); flex: 0 0 auto;
}
@media (max-width: 1023px) {
  .filters-header { padding: 16px 18px; }
}
.filters-close {
  width: 32px; height: 32px;
  border: 1px solid var(--color-misana-line); border-radius: 999px;
  background: var(--color-misana-paper); color: var(--color-misana-ink);
  display: inline-flex; align-items: center; justify-content: center;
  cursor: pointer; transition: border-color 0.2s ease;
}
.filters-close:hover { border-color: var(--color-misana-ink); }
.filters-clear-spacer { width: 32px; height: 32px; flex: 0 0 auto; }
@media (min-width: 1024px) { .filters-close { display: none; } }
.filters-title {
  margin: 0; font-size: 0.75rem; letter-spacing: 0.18em;
  text-transform: uppercase; color: var(--color-misana-ink);
  display: inline-flex; align-items: center; gap: 8px;
}
.filters-badge {
  display: inline-flex; align-items: center; justify-content: center;
  min-width: 20px; height: 20px; padding: 0 6px;
  background: var(--color-misana-ink); color: var(--color-misana-paper);
  border-radius: 999px; font-size: 0.65rem; letter-spacing: 0;
}
.filters-clear {
  font-size: 0.7rem; color: var(--color-misana-muted);
  background: transparent; border: 0; cursor: pointer;
  padding: 4px 6px; font-family: inherit;
  text-decoration: underline; text-decoration-thickness: 1px; text-underline-offset: 3px;
  transition: color 0.2s ease;
}
.filters-clear:hover { color: var(--color-misana-ink); }
.filters-body {
  display: flex; flex-direction: column; gap: 26px;
  padding: 20px 0 24px; flex: 1 1 auto;
  overflow-y: auto; -webkit-overflow-scrolling: touch;
}
@media (max-width: 1023px) {
  .filters-body { padding: 20px 18px 24px; }
}
@media (min-width: 1024px) { .filters-body { max-height: calc(100vh - 14rem); } }
.filters-footer {
  flex: 0 0 auto;
  padding: 12px 16px calc(12px + env(safe-area-inset-bottom));
  border-top: 1px solid var(--color-misana-line);
  background: var(--color-misana-paper);
}
.filters-apply {
  width: 100%; padding: 14px 18px;
  background: var(--color-misana-ink); color: var(--color-misana-paper);
  border: 0; border-radius: 8px;
  font-size: 0.78rem; letter-spacing: 0.16em; text-transform: uppercase;
  cursor: pointer; font-family: inherit;
  transition: opacity 0.25s ease;
}
.filters-apply:hover { opacity: 0.9; }
.filter-section { display: flex; flex-direction: column; gap: 12px; }
.filter-section-key {
  margin: 0; font-size: 0.65rem; letter-spacing: 0.22em;
  text-transform: uppercase; color: var(--color-misana-ink); font-weight: 500;
  padding-bottom: 4px;
  border-bottom: 1px solid var(--color-misana-line);
}

/* ============================================== */
/* CARD VILLA (style LC : landscape 16:9 + texte) */
/* ============================================== */

.villa-card { font-family: inherit; }
.villa-card .block { display: block; text-decoration: none; color: inherit; }

.card-image-wrap {
  position: relative;
  width: 100%; aspect-ratio: 16 / 11;
  overflow: hidden; border-radius: 4px;
  background: var(--color-misana-stone);
  margin-bottom: 14px;
}
.card-image {
  position: absolute; inset: 0;
  width: 100%; height: 100%; object-fit: cover;
  transition: transform 1.4s cubic-bezier(0.16, 1, 0.3, 1);
}
.villa-card .group:hover .card-image { transform: scale(1.03); }
.card-image-placeholder { background: var(--color-misana-stone); }

.card-text {
  display: flex; flex-direction: column; gap: 4px;
}
.card-name {
  margin: 0;
  font-family: var(--font-display, serif);
  font-size: 1.15rem; line-height: 1.25; font-weight: 500;
  color: var(--color-misana-ink);
}
.card-location {
  margin: 2px 0 0;
  font-size: 0.78rem; color: var(--color-misana-muted);
}
.card-specs {
  margin: 6px 0 0;
  font-size: 0.78rem; color: var(--color-misana-ink);
  font-weight: 400;
}
.card-amenities {
  margin: 4px 0 0;
  font-size: 0.74rem; color: var(--color-misana-muted);
}
.card-sep { opacity: 0.6; }
.card-price {
  margin: 8px 0 0;
  font-size: 0.85rem; color: var(--color-misana-ink); font-weight: 500;
}
.card-collection {
  margin: 4px 0 0;
  font-size: 0.7rem; letter-spacing: 0.08em;
  color: var(--color-misana-muted);
  text-transform: uppercase;
}

/* ============================================== */
/* LOAD MORE                                       */
/* ============================================== */

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

/* ============================================== */
/* SCHEDULE A CALL CTA                             */
/* ============================================== */

.sched-call-cta {
  display: inline-flex; align-items: center; justify-content: center;
  height: 48px; padding: 0 36px;
  background: var(--color-misana-ink); color: var(--color-misana-paper);
  border: 0; border-radius: 0;
  font-size: 0.7rem; letter-spacing: 0.22em; text-transform: uppercase;
  cursor: pointer; font-family: inherit;
  text-decoration: none;
  transition: opacity 0.25s ease;
}
.sched-call-cta:hover { opacity: 0.9; }

@media (prefers-reduced-motion: reduce) {
  .card-image,
  .filters-sheet-enter-active, .filters-sheet-leave-active,
  .filters-fade-enter-active, .filters-fade-leave-active {
    transition: none !important;
    transform: none !important;
  }
}
</style>
