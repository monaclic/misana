<script setup lang="ts">
// Hub catalog villas (Côte d'Azur). Sidebar filtres : ville, capacite,
// chambres, prix semaine, vue mer, cadre. Layout 12 cols, sidebar 3 +
// results 9 (sticky desktop, bottom sheet mobile). Pattern strictement
// aligné sur pages/yacht/all.vue et pages/cars/all.vue.
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

// Listing : on cache CTA header + sticky bottom bar.
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
  { id: '11-plus', labelFr: '11 +', labelEn: '11 +', min: 11, max: 99 },
];

const BEDROOM_BUCKETS = [
  { id: '1-3', label: '1 à 3', labelEn: '1 to 3', min: 1, max: 3 },
  { id: '4-6', label: '4 à 6', labelEn: '4 to 6', min: 4, max: 6 },
  { id: '7-plus', label: '7 +', labelEn: '7 +', min: 7, max: 30 },
];

const PRICE_BUCKETS = [
  { id: 'under-15k', labelFr: "Jusqu'à 15 000 €", labelEn: 'Up to €15,000', min: 0, max: 15000 },
  { id: '15k-50k', labelFr: '15 000 à 50 000 €', labelEn: '€15,000 to €50,000', min: 15000, max: 50000 },
  { id: '50k-plus', labelFr: '50 000 € +', labelEn: '€50,000 +', min: 50000, max: 9999999 },
];

const SETTING_OPTIONS: { value: VillaSetting; labelFr: string; labelEn: string }[] = [
  { value: 'out-of-town', labelFr: 'Hors de la ville', labelEn: 'Out of town' },
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
const showFilters = ref(false);

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

// ============== Vue grid / list ==============

const VALID_VIEWS = ['grid', 'list'] as const;
type ViewMode = typeof VALID_VIEWS[number];
const initialView: ViewMode = (typeof route.query.view === 'string' && (VALID_VIEWS as readonly string[]).includes(route.query.view))
  ? (route.query.view as ViewMode)
  : 'grid';
const view = ref<ViewMode>(initialView);
const effectiveView = computed(() => (isMdUp.value ? view.value : 'grid'));
function setView(v: ViewMode) {
  view.value = v;
  const q: Record<string, string> = { ...route.query } as Record<string, string>;
  if (v === 'grid') delete q.view; else q.view = v;
  router.replace({ path: route.path, query: q });
}

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

// ============== Format / labels ==============

function fmtPrice(p: number | null): string {
  if (p == null) return t('villas.onRequest');
  return new Intl.NumberFormat(locale.value === 'fr' ? 'fr-FR' : 'en-GB', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0,
  }).format(p);
}

function cityLabel(value: VillaCity): string {
  const c = CITY_OPTIONS.find((x) => x.value === value);
  if (!c) return value;
  return locale.value === 'fr' ? c.labelFr : c.labelEn;
}

function cityInitial(value: VillaCity): string {
  const label = cityLabel(value);
  return label.charAt(0).toUpperCase();
}

function settingLabel(value: VillaSetting | null): string {
  if (!value) return '';
  const s = SETTING_OPTIONS.find((x) => x.value === value);
  if (!s) return value;
  return locale.value === 'fr' ? s.labelFr : s.labelEn;
}

function villaSlug(v: Villa): string {
  return locale.value === 'fr' ? v.slug.fr : v.slug.en;
}

// ============== SEO dynamique ==============

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

// ============== Body éditorial ==============

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
  if (fSeaView.value) {
    return isFr
      ? `Sélection vue mer : villas en surplomb, propriétés en bord de plage, terrasses orientées sud face à la Méditerranée. De Saint-Tropez au Cap-Ferrat, chaque adresse a été vérifiée pour la qualité réelle de la vue, pas une promesse marketing. Demande personnalisée pour adapter selon les dates et le nombre de chambres.`
      : `Sea view selection : villas perched above the water, beachfront properties, south-facing terraces over the Mediterranean. From Saint-Tropez to Cap-Ferrat, each address has been checked for the real quality of the view, not a marketing promise. Personalised request to adapt to your dates and number of bedrooms.`;
  }
  if (fSetting.value.length === 1 && fSetting.value[0] === 'beachfront') {
    return isFr
      ? `Face mer : villas pieds dans l'eau ou avec accès direct à la plage. Pampelonne, Plage de Notre-Dame, Cap-d'Antibes, Cap-Ferrat. Disponibilité limitée, à réserver longtemps à l'avance pour la haute saison.`
      : `Beachfront : villas with direct beach access or feet-in-the-water. Pampelonne, Plage de Notre-Dame, Cap-d'Antibes, Cap-Ferrat. Limited availability, book well in advance for the high season.`;
  }
  return isFr
    ? `Sélection de villas sur la Côte d'Azur de Saint-Tropez à Menton. Chaque adresse a été visitée par l'équipe Misana et propose un standard cohérent : ménage, conciergerie pendant le séjour, transfert depuis l'aéroport coordonné. Tarifs semaine de 5 000 à 140 000 €. Demande sur mesure pour adapter à vos dates, votre groupe et vos préférences.`
    : `Selection of villas on the French Riviera from Saint-Tropez to Menton. Each address has been visited by the Misana team and offers a consistent standard : housekeeping, concierge during the stay, coordinated airport transfer. Weekly rates from €5,000 to €140,000. Tailor-made request to adapt to your dates, group and preferences.`;
});
</script>

<template>
  <main class="min-h-screen">
    <!-- Hero band -->
    <section class="bg-misana-paper border-b border-misana-line">
      <div class="max-w-[1600px] mx-auto px-6 sm:px-12 py-10 sm:py-24">
        <p class="text-xs uppercase tracking-widest text-misana-muted mb-3 sm:mb-4">{{ t('villas.kicker') }}</p>
        <h1 class="font-display text-3xl sm:text-5xl mb-3 sm:mb-4">{{ t('villas.hubTitle') }}</h1>
        <p class="text-misana-muted text-base sm:text-lg max-w-2xl" data-display>{{ t('villas.hubLead') }}</p>
      </div>
    </section>

    <!-- Listing -->
    <section class="max-w-[1600px] mx-auto px-4 sm:px-12 py-8 sm:py-16">
      <div class="grid lg:grid-cols-12 gap-10">
        <!-- Backdrop mobile -->
        <Transition name="filters-fade">
          <div
            v-if="showFilters"
            class="lg:hidden fixed inset-0 z-40 bg-black/50"
            @click="showFilters = false"
          ></div>
        </Transition>

        <!-- Sidebar / bottom sheet -->
        <Transition name="filters-sheet">
          <aside
            v-show="showFilters || isLgUp"
            class="filters-aside lg:col-span-3 lg:sticky lg:top-24 lg:self-start"
            :class="showFilters ? 'is-open' : ''"
          >
            <div class="filters-card lg:rounded-md">
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
                <!-- Ville -->
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

                <!-- Capacité -->
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

                <!-- Chambres -->
                <section class="filter-section">
                  <p class="filter-section-key">{{ t('villas.filterBedrooms') }}</p>
                  <ul class="filter-list">
                    <li v-for="b in BEDROOM_BUCKETS" :key="b.id">
                      <label class="filter-row">
                        <input type="checkbox" v-model="fBedrooms" :value="b.id" class="filter-check" />
                        <span class="filter-label">{{ locale === 'fr' ? b.label : b.labelEn }}</span>
                      </label>
                    </li>
                  </ul>
                </section>

                <!-- Prix semaine -->
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

                <!-- Cadre -->
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

                <!-- Vue mer -->
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

              <!-- Footer sticky mobile -->
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

        <!-- Results -->
        <div class="lg:col-span-9">
          <!-- Toolbar -->
          <div class="toolbar">
            <label class="toolbar-search">
              <span class="search-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" class="block w-[18px] h-[18px]">
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

            <div class="toolbar-meta">
              <div class="toolbar-sort-wrap">
                <select v-model="fSort" class="toolbar-sort" :aria-label="t('villas.sortAria')">
                  <option value="default">{{ t('villas.sortDefault') }}</option>
                  <option value="price-asc">{{ t('villas.sortPriceAsc') }}</option>
                  <option value="price-desc">{{ t('villas.sortPriceDesc') }}</option>
                  <option value="capacity-asc">{{ t('villas.sortCapacityAsc') }}</option>
                  <option value="capacity-desc">{{ t('villas.sortCapacityDesc') }}</option>
                </select>
                <span class="toolbar-sort-chevron" aria-hidden="true">
                  <svg viewBox="0 0 12 12" fill="none" class="block w-3 h-3">
                    <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" />
                  </svg>
                </span>
              </div>
              <div class="view-toggle hidden md:inline-flex" role="tablist" :aria-label="t('villas.viewToggleAria')">
                <button
                  type="button"
                  role="tab"
                  class="view-btn"
                  :class="{ 'view-btn-active': view === 'grid' }"
                  :aria-selected="view === 'grid'"
                  :title="t('villas.viewGrid')"
                  @click="setView('grid')"
                >
                  <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" class="w-4 h-4">
                    <rect x="3.5" y="3.5" width="7" height="7" rx="1" stroke="currentColor" stroke-width="1.4" />
                    <rect x="13.5" y="3.5" width="7" height="7" rx="1" stroke="currentColor" stroke-width="1.4" />
                    <rect x="3.5" y="13.5" width="7" height="7" rx="1" stroke="currentColor" stroke-width="1.4" />
                    <rect x="13.5" y="13.5" width="7" height="7" rx="1" stroke="currentColor" stroke-width="1.4" />
                  </svg>
                  <span>{{ t('villas.viewGrid') }}</span>
                </button>
                <button
                  type="button"
                  role="tab"
                  class="view-btn"
                  :class="{ 'view-btn-active': view === 'list' }"
                  :aria-selected="view === 'list'"
                  :title="t('villas.viewList')"
                  @click="setView('list')"
                >
                  <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" class="w-4 h-4">
                    <rect x="3.5" y="4.5" width="17" height="5" rx="1" stroke="currentColor" stroke-width="1.4" />
                    <rect x="3.5" y="14.5" width="17" height="5" rx="1" stroke="currentColor" stroke-width="1.4" />
                  </svg>
                  <span>{{ t('villas.viewList') }}</span>
                </button>
              </div>
            </div>
          </div>

          <p class="toolbar-count">
            {{ visibleVillas.length }} {{ t('villas.results', { n: visibleVillas.length }) }}
            <span v-if="filterCount" class="toolbar-filter-count">· {{ filterCount }} {{ t('villas.filtersActive') }}</span>
          </p>

          <!-- =========== GRID VIEW =========== -->
          <div
            v-if="visibleVillas.length && effectiveView === 'grid'"
            class="grid grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-6"
          >
            <NuxtLink
              v-for="v in visibleVillas"
              :key="v._id"
              :to="localePath(`/villas/${villaSlug(v)}`)"
              class="ccg group"
            >
              <div class="ccg-image-wrap">
                <img v-if="v.hero" :src="v.hero" :alt="v.name" loading="lazy" class="ccg-image" />
                <div v-else class="ccg-image-placeholder"></div>
                <span class="card-cue" aria-hidden="true">
                  <svg viewBox="0 0 20 20" fill="none" class="block w-5 h-5">
                    <path d="M6 14L14 6" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" />
                    <path d="M7 6H14V13" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" />
                  </svg>
                </span>
              </div>

              <div class="ccg-title-wrap">
                <span class="ccg-logo" aria-hidden="true">{{ cityInitial(v.city) }}</span>
                <div class="ccg-title-block">
                  <h3 class="ccg-title">{{ v.name }}</h3>
                  <p class="ccg-details">
                    <template v-if="v.bedrooms"><span>{{ v.bedrooms }} {{ t('villas.bedroomsShort') }}</span><span class="ccg-dot" aria-hidden="true"></span></template>
                    <template v-if="v.bathrooms"><span>{{ v.bathrooms }} {{ t('villas.bathroomsShort') }}</span><span class="ccg-dot" aria-hidden="true"></span></template>
                    <span>{{ cityLabel(v.city) }}</span>
                  </p>
                </div>
              </div>

              <div class="ccg-price-wrap">
                <span v-if="v.capacity" class="ccg-tag">{{ v.capacity }} {{ t('villas.guestsShort') }}</span>
                <div class="ccg-price">
                  <span class="ccg-price-value">{{ fmtPrice(v.pricePerWeekFrom) }}</span>
                  <span class="ccg-price-unit">{{ t('villas.perWeekShort') }}</span>
                </div>
              </div>
            </NuxtLink>
          </div>

          <!-- =========== LIST VIEW =========== -->
          <div v-else-if="visibleVillas.length && effectiveView === 'list'" class="flex flex-col gap-5">
            <NuxtLink
              v-for="v in visibleVillas"
              :key="v._id"
              :to="localePath(`/villas/${villaSlug(v)}`)"
              class="ccl group"
            >
              <div class="ccl-image-wrap">
                <img v-if="v.hero" :src="v.hero" :alt="v.name" loading="lazy" class="ccl-image" />
                <div v-else class="ccl-image-placeholder"></div>
                <span class="card-cue" aria-hidden="true">
                  <svg viewBox="0 0 20 20" fill="none" class="block w-5 h-5">
                    <path d="M6 14L14 6" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" />
                    <path d="M7 6H14V13" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" />
                  </svg>
                </span>
              </div>

              <div class="ccl-desc">
                <div class="ccl-title-row">
                  <span class="ccl-logo" aria-hidden="true">{{ cityInitial(v.city) }}</span>
                  <div class="ccl-title-block">
                    <h3 class="ccl-title">{{ v.name }}</h3>
                    <p class="ccl-subtitle">
                      <span>{{ cityLabel(v.city) }}</span>
                      <template v-if="v.setting"><span class="ccl-dot" aria-hidden="true"></span><span>{{ settingLabel(v.setting) }}</span></template>
                      <template v-if="v.surface"><span class="ccl-dot" aria-hidden="true"></span><span>{{ v.surface }} m²</span></template>
                    </p>
                  </div>
                  <div class="ccl-price-block">
                    <p class="ccl-price">{{ fmtPrice(v.pricePerWeekFrom) }}</p>
                    <p class="ccl-price-label">{{ t('villas.perWeekShort') }}</p>
                  </div>
                </div>

                <div class="ccl-tiers">
                  <div class="ccl-tier">
                    <p class="ccl-tier-key">{{ t('villas.tierFrom') }}</p>
                    <p class="ccl-tier-val">{{ fmtPrice(v.pricePerWeekFrom) }}<small>{{ t('villas.perWeekShort') }}</small></p>
                  </div>
                  <div class="ccl-tier">
                    <p class="ccl-tier-key">{{ t('villas.tierTo') }}</p>
                    <p class="ccl-tier-val">
                      <template v-if="v.pricePerWeekTo">{{ fmtPrice(v.pricePerWeekTo) }}<small>{{ t('villas.perWeekShort') }}</small></template>
                      <template v-else>{{ t('villas.onRequest') }}</template>
                    </p>
                  </div>
                  <div class="ccl-tier ccl-tier-best">
                    <p class="ccl-tier-key">{{ t('villas.tierView') }}</p>
                    <p class="ccl-tier-val">{{ v.seaView ? t('villas.seaView') : (v.setting ? settingLabel(v.setting) : '-') }}</p>
                  </div>
                </div>

                <div class="ccl-conds">
                  <div class="ccl-cond">
                    <span class="ccl-cond-key">{{ t('villas.capacityShort') }}</span>
                    <strong class="ccl-cond-val">{{ v.capacity ?? '-' }}</strong>
                  </div>
                  <div class="ccl-cond">
                    <span class="ccl-cond-key">{{ t('villas.bedroomsLong') }}</span>
                    <strong class="ccl-cond-val">{{ v.bedrooms ?? '-' }}</strong>
                  </div>
                  <div class="ccl-cond">
                    <span class="ccl-cond-key">{{ t('villas.bathroomsLong') }}</span>
                    <strong class="ccl-cond-val">{{ v.bathrooms ?? '-' }}</strong>
                  </div>
                  <div class="ccl-cond">
                    <span class="ccl-cond-key">{{ t('villas.cityLabel') }}</span>
                    <strong class="ccl-cond-val">{{ cityLabel(v.city) }}</strong>
                  </div>
                </div>
              </div>
            </NuxtLink>
          </div>

          <div v-else class="text-center py-16">
            <p class="text-misana-muted text-sm mb-4">{{ t('villas.noResults') }}</p>
            <button type="button" class="text-xs underline underline-offset-4 hover:text-misana-ink transition" @click="clearFilters">{{ t('villas.clearFilters') }}</button>
          </div>

          <p class="text-xs text-misana-muted mt-8 italic">{{ t('villas.priceFootnote') }}</p>
        </div>
      </div>
    </section>

    <!-- Body éditorial -->
    <section class="bg-misana-paper border-t border-misana-line">
      <div class="max-w-[1600px] mx-auto px-6 sm:px-12 py-16 sm:py-20">
        <p class="text-misana-muted leading-relaxed">{{ editorialBody }}</p>
      </div>
    </section>

    <!-- Sticky FAB filtres mobile -->
    <button
      v-show="!showFilters"
      type="button"
      class="filters-fab lg:hidden"
      @click="showFilters = true"
    >
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" class="w-4 h-4">
        <path d="M4 6H20" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" />
        <path d="M7 12H17" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" />
        <path d="M10 18H14" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" />
      </svg>
      <span>{{ t('villas.filters') }}</span>
      <span v-if="filterCount" class="filters-fab-badge">{{ filterCount }}</span>
    </button>
  </main>
</template>

<style scoped>
/* Reprise stricte du design system yacht/cars (da-audit.md §3-§7). */

/* === Filter checkbox row === */
.filter-list { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 2px; }
.filter-row { display: flex; align-items: center; gap: 10px; padding: 5px 0; cursor: pointer; user-select: none; }
.filter-check {
  appearance: none; -webkit-appearance: none;
  flex: 0 0 auto;
  width: 14px; height: 14px; margin: 0;
  border: 1px solid var(--color-misana-ink);
  background: var(--color-misana-paper);
  border-radius: 2px;
  cursor: pointer; position: relative;
  transition: background 0.2s ease;
}
.filter-check:checked { background: var(--color-misana-ink); }
.filter-label { font-size: 0.82rem; color: var(--color-misana-muted); transition: color 0.2s ease; }
.filter-row:hover .filter-label { color: var(--color-misana-ink); }
.filter-check:checked ~ .filter-label { color: var(--color-misana-ink); font-weight: 500; }

/* === Mobile bottom sheet === */
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
    position: relative; inset: auto;
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

/* === Filters card === */
.filters-card {
  height: 100%; background: var(--color-misana-paper);
  overflow: hidden; display: flex; flex-direction: column;
}
@media (min-width: 1024px) {
  .filters-card { height: auto; border: 1px solid var(--color-misana-line); }
}
.filters-header {
  display: flex; align-items: center; justify-content: space-between;
  gap: 12px; padding: 16px 18px;
  border-bottom: 1px solid var(--color-misana-line);
  background: var(--color-misana-paper); flex: 0 0 auto;
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
  margin: 0; font-size: 0.7rem; letter-spacing: 0.22em; text-transform: uppercase;
  color: var(--color-misana-ink);
  display: inline-flex; align-items: center; gap: 8px;
}
.filters-badge {
  display: inline-flex; align-items: center; justify-content: center;
  min-width: 22px; height: 22px; padding: 0 6px;
  background: var(--color-misana-ink); color: var(--color-misana-paper);
  border-radius: 4px; font-size: 0.7rem; letter-spacing: 0;
}
.filters-clear {
  font-size: 0.65rem; letter-spacing: 0.18em; text-transform: uppercase;
  padding: 6px 12px; background: transparent; color: var(--color-misana-muted);
  border: 1px solid var(--color-misana-line); border-radius: 4px;
  cursor: pointer; font-family: inherit;
  transition: border-color 0.25s ease, color 0.25s ease;
}
.filters-clear:hover { border-color: var(--color-misana-ink); color: var(--color-misana-ink); }
.filters-body {
  display: flex; flex-direction: column; gap: 22px;
  padding: 20px 18px 24px; flex: 1 1 auto;
  overflow-y: auto; -webkit-overflow-scrolling: touch;
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
.filter-section { display: flex; flex-direction: column; gap: 10px; }
.filter-section-key {
  margin: 0; font-size: 0.62rem; letter-spacing: 0.24em;
  text-transform: uppercase; color: var(--color-misana-muted);
}

/* === Toolbar === */
.toolbar {
  display: flex; align-items: center; justify-content: space-between;
  gap: 20px; margin-bottom: 28px;
}
.toolbar-search {
  flex: 1 1 0; min-width: 0;
  display: flex; align-items: center; gap: 12px;
  background: var(--color-misana-paper);
  border: 1px solid var(--color-misana-line);
  border-radius: 4px; padding: 0 18px; height: 44px;
  cursor: text; transition: border-color 0.3s ease;
}
@media (min-width: 1280px) {
  .toolbar-search { max-width: calc((100% - 16px) * 2 / 3); }
}
.toolbar-search:focus-within { border-color: var(--color-misana-ink); }
.search-icon { flex: 0 0 auto; display: inline-flex; color: var(--color-misana-muted); transition: color 0.3s ease; }
.toolbar-search:focus-within .search-icon { color: var(--color-misana-ink); }
.search-input {
  flex: 1 1 0; min-width: 0;
  background: transparent; border: 0; outline: 0;
  font-family: inherit; font-size: 0.95rem;
  color: var(--color-misana-ink); padding: 0;
}
.search-input::placeholder { color: var(--color-misana-muted); }
.search-input::-webkit-search-cancel-button { display: none; }
.search-clear {
  flex: 0 0 auto; width: 24px; height: 24px;
  display: inline-flex; align-items: center; justify-content: center;
  background: var(--color-misana-paper); color: var(--color-misana-ink);
  border: 1px solid var(--color-misana-line); border-radius: 4px;
  font-size: 0.95rem; line-height: 1; cursor: pointer; font-family: inherit;
  transition: background 0.3s ease, border-color 0.3s ease;
}
.search-clear:hover {
  background: var(--color-misana-ink); color: var(--color-misana-paper);
  border-color: var(--color-misana-ink);
}
.toolbar-meta { flex: 0 0 auto; display: flex; align-items: center; gap: 16px; }
.toolbar-count { margin: 0 0 18px; font-size: 0.78rem; color: var(--color-misana-muted); font-style: italic; }
.toolbar-filter-count { margin-left: 0.5rem; font-style: normal; }
.toolbar-sort-wrap { position: relative; display: inline-flex; align-items: center; }
.toolbar-sort {
  appearance: none; -webkit-appearance: none;
  background: var(--color-misana-paper); color: var(--color-misana-ink);
  border: 1px solid var(--color-misana-line); border-radius: 4px;
  padding: 0 32px 0 14px; height: 44px;
  font-size: 0.65rem; letter-spacing: 0.18em; text-transform: uppercase;
  cursor: pointer; font-family: inherit;
  transition: border-color 0.25s ease; outline: none; line-height: 1;
}
.toolbar-sort:hover { border-color: var(--color-misana-ink); }
.toolbar-sort:focus { border-color: var(--color-misana-ink); }
.toolbar-sort-chevron { position: absolute; right: 10px; pointer-events: none; color: var(--color-misana-muted); }

@media (max-width: 767px) {
  .toolbar {
    display: grid;
    grid-template-columns: minmax(0, 1fr) 150px;
    column-gap: 8px; margin-bottom: 14px;
  }
  .toolbar-search { grid-column: 1; height: 44px; padding: 0 14px; box-sizing: border-box; min-width: 0; }
  .search-input { font-size: 0.85rem; }
  .toolbar-meta { grid-column: 2; display: flex; align-items: stretch; }
  .toolbar-count { margin: 0 0 12px; font-size: 0.7rem; }
  .toolbar-sort-wrap { height: 44px; width: 100%; flex: 1 1 auto; }
  .toolbar-sort { width: 100%; height: 44px; padding: 0 28px 0 12px; font-size: 0.62rem; letter-spacing: 0.14em; line-height: 1; }
  .toolbar-sort-chevron { right: 10px; }
  .view-toggle { display: none !important; }
}

/* === FAB filtres === */
.filters-fab {
  position: fixed; bottom: calc(20px + env(safe-area-inset-bottom));
  left: 50%; transform: translateX(-50%);
  display: inline-flex; align-items: center; gap: 8px;
  padding: 12px 22px;
  background: var(--color-misana-ink); color: var(--color-misana-paper);
  border: 0; border-radius: 999px;
  font-size: 0.75rem; letter-spacing: 0.18em; text-transform: uppercase;
  cursor: pointer; font-family: inherit; z-index: 30;
  box-shadow: 0 6px 20px -8px rgba(0, 0, 0, 0.4);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}
.filters-fab:hover { transform: translateX(-50%) translateY(-1px); }
@media (min-width: 1024px) { .filters-fab { display: none !important; } }
.filters-fab-badge {
  display: inline-flex; align-items: center; justify-content: center;
  min-width: 20px; height: 20px; padding: 0 6px; margin-left: 4px;
  background: var(--color-misana-paper); color: var(--color-misana-ink);
  border-radius: 999px; font-size: 0.65rem; letter-spacing: 0;
}

/* === View toggle === */
.view-toggle {
  display: inline-flex; align-items: stretch;
  border: 1px solid var(--color-misana-line);
  background: var(--color-misana-paper);
  border-radius: 4px; padding: 3px; overflow: hidden;
  height: 44px; box-sizing: border-box;
}
.view-btn {
  display: inline-flex; align-items: center; gap: 0.5rem;
  padding: 0 0.95rem;
  font-size: 0.65rem; letter-spacing: 0.22em; text-transform: uppercase;
  color: var(--color-misana-muted); background: transparent;
  border: 0; line-height: 1; border-radius: 4px;
  cursor: pointer; transition: background 0.3s ease, color 0.3s ease;
  font-family: inherit;
}
.view-btn:hover { color: var(--color-misana-ink); }
.view-btn-active { background: var(--color-misana-ink); color: var(--color-misana-paper); }
.view-btn-active:hover { color: var(--color-misana-paper); }

/* === GRID CARD .ccg === */
.ccg {
  display: flex; flex-direction: column; gap: 12px;
  background: var(--color-misana-paper);
  border: 1px solid var(--color-misana-line);
  border-radius: 6px; padding: 10px;
  text-decoration: none; color: var(--color-misana-ink);
  overflow: hidden;
  transition: border-color 0.4s ease, box-shadow 0.4s ease;
}
@media (min-width: 768px) { .ccg { gap: 24px; padding: 24px; } }
.ccg:hover { border-color: var(--color-misana-ink); box-shadow: 0 12px 28px -20px rgba(0, 0, 0, 0.18); }

.ccg-image-wrap {
  position: relative; width: 100%; height: 130px;
  overflow: hidden; border-radius: 4px;
  background: var(--color-misana-stone);
}
@media (min-width: 768px) { .ccg-image-wrap { height: 216px; } }
.ccg-image {
  position: absolute; inset: 0;
  width: 100%; height: 100%; object-fit: cover;
  transition: transform 1.1s cubic-bezier(0.16, 1, 0.3, 1);
}
.ccg:hover .ccg-image { transform: scale(1.04); }
.ccg-image-placeholder { position: absolute; inset: 0; background: var(--color-misana-stone); }

.ccg-title-wrap { display: flex; align-items: flex-start; gap: 12px; width: 100%; }
@media (max-width: 767px) { .ccg-title-wrap { gap: 0; } }
.ccg-logo {
  flex: 0 0 auto; width: 46px; height: 46px;
  display: inline-flex; align-items: center; justify-content: center;
  border: 1px solid var(--color-misana-line); border-radius: 4px;
  font-family: var(--font-display, serif); font-size: 1.1rem;
  color: var(--color-misana-ink); background: var(--color-misana-paper);
}
@media (max-width: 767px) { .ccg-logo { display: none; } }
.ccg-title-block { flex: 1 0 0; min-width: 0; display: flex; flex-direction: column; gap: 2px; }
.ccg-title {
  font-family: var(--font-display, serif);
  font-size: 0.92rem; font-weight: 500; line-height: 1.2;
  margin: 0; color: var(--color-misana-ink); word-break: break-word;
}
@media (min-width: 768px) { .ccg-title { font-size: 1.05rem; line-height: 1.25; } }
.ccg-details {
  margin: 4px 0 0;
  font-size: 0.7rem; color: var(--color-misana-muted);
  display: inline-flex; align-items: center; flex-wrap: wrap; gap: 6px;
}
@media (min-width: 768px) { .ccg-details { font-size: 0.78rem; gap: 8px; } }
.ccg-dot { width: 3px; height: 3px; border-radius: 99px; background: currentColor; opacity: 0.55; }

.ccg-price-wrap { display: flex; align-items: center; justify-content: space-between; gap: 12px; width: 100%; }
.ccg-tag {
  font-size: 0.78rem; color: var(--color-misana-ink);
  padding: 5px 14px; background: var(--color-misana-paper);
  border: 1px solid var(--color-misana-line); border-radius: 4px;
  white-space: nowrap;
}
@media (max-width: 767px) { .ccg-tag { display: none; } }
.ccg-price { display: inline-flex; align-items: baseline; gap: 6px; padding-left: 0; white-space: nowrap; }
@media (min-width: 768px) { .ccg-price { padding-left: 24px; } }
.ccg-price-value {
  font-family: var(--font-display, serif);
  font-size: 1.05rem; line-height: 1; color: var(--color-misana-ink);
}
@media (min-width: 768px) { .ccg-price-value { font-size: 1.4rem; } }
.ccg-price-unit { font-size: 0.7rem; color: var(--color-misana-muted); }
@media (min-width: 768px) { .ccg-price-unit { font-size: 0.78rem; } }

/* === Hover cue === */
.card-cue {
  position: absolute; bottom: 14px; right: 14px;
  width: 46px; height: 46px;
  display: inline-flex; align-items: center; justify-content: center;
  background: var(--color-misana-ink); color: var(--color-misana-paper);
  border-radius: 4px;
  opacity: 0; transform: translateY(8px);
  transition: opacity 0.4s ease, transform 0.55s cubic-bezier(0.16, 1, 0.3, 1);
  pointer-events: none;
}
.ccg:hover .card-cue, .ccl:hover .card-cue { opacity: 1; transform: translateY(0); }

/* === LIST CARD .ccl === */
.ccl {
  display: flex; flex-direction: row; align-items: stretch; gap: 32px;
  background: var(--color-misana-paper);
  border: 1px solid var(--color-misana-line);
  border-radius: 6px; padding: 24px;
  text-decoration: none; color: var(--color-misana-ink);
  overflow: hidden;
  transition: border-color 0.4s ease, box-shadow 0.4s ease;
}
.ccl:hover { border-color: var(--color-misana-ink); box-shadow: 0 14px 32px -22px rgba(0, 0, 0, 0.18); }
.ccl-image-wrap {
  flex: 0 0 auto; position: relative;
  width: 256px; align-self: stretch;
  overflow: hidden; border-radius: 4px;
  background: var(--color-misana-stone);
}
.ccl-image {
  position: absolute; inset: 0;
  width: 100%; height: 100%; object-fit: cover;
  transition: transform 1.1s cubic-bezier(0.16, 1, 0.3, 1);
}
.ccl:hover .ccl-image { transform: scale(1.04); }
.ccl-image-placeholder { position: absolute; inset: 0; background: var(--color-misana-stone); }
.ccl-desc { flex: 1 1 0; min-width: 0; display: flex; flex-direction: column; gap: 20px; }
.ccl-title-row { display: flex; align-items: flex-start; gap: 14px; }
.ccl-logo {
  flex: 0 0 auto; width: 46px; height: 46px;
  display: inline-flex; align-items: center; justify-content: center;
  border: 1px solid var(--color-misana-line); border-radius: 4px;
  font-family: var(--font-display, serif); font-size: 1.1rem;
  color: var(--color-misana-ink);
}
.ccl-title-block { flex: 1 1 0; min-width: 0; display: flex; flex-direction: column; gap: 4px; }
.ccl-title {
  font-family: var(--font-display, serif);
  font-size: 1.4rem; line-height: 1.15; margin: 0;
  color: var(--color-misana-ink);
}
.ccl-subtitle {
  margin: 0; font-size: 0.8rem; color: var(--color-misana-muted);
  display: inline-flex; align-items: center; flex-wrap: wrap; gap: 8px;
}
.ccl-dot { width: 3px; height: 3px; border-radius: 99px; background: currentColor; opacity: 0.55; }
.ccl-price-block { flex: 0 0 auto; text-align: right; min-width: 110px; }
.ccl-price {
  margin: 0; font-family: var(--font-display, serif);
  font-size: 1.4rem; line-height: 1; color: var(--color-misana-ink);
}
.ccl-price-label { margin: 4px 0 0; font-size: 0.7rem; color: var(--color-misana-muted); }

.ccl-tiers { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
.ccl-tier { display: flex; flex-direction: column; gap: 4px; }
.ccl-tier-key {
  margin: 0; font-size: 0.6rem; letter-spacing: 0.2em;
  text-transform: uppercase; color: var(--color-misana-muted);
}
.ccl-tier-val { margin: 0; font-family: var(--font-display, serif); font-size: 1rem; color: var(--color-misana-ink); }
.ccl-tier-val small { font-family: var(--font-sans); font-size: 0.65rem; color: var(--color-misana-muted); margin-left: 4px; }
.ccl-tier-best .ccl-tier-val { color: var(--color-misana-ink); }

.ccl-conds { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; }
.ccl-cond { display: flex; flex-direction: column; gap: 4px; }
.ccl-cond-key {
  font-size: 0.6rem; letter-spacing: 0.2em;
  text-transform: uppercase; color: var(--color-misana-muted);
}
.ccl-cond-val { font-family: var(--font-display, serif); font-size: 0.95rem; color: var(--color-misana-ink); font-weight: 500; }

@media (max-width: 767px) {
  /* List view masquée mobile (effectiveView force grid), CSS défensif. */
  .ccl { flex-direction: column; gap: 16px; padding: 16px; }
  .ccl-image-wrap { width: 100%; height: 200px; }
  .ccl-tiers, .ccl-conds { grid-template-columns: repeat(2, 1fr); }
}

@media (prefers-reduced-motion: reduce) {
  .ccg-image, .ccl-image, .card-cue,
  .filters-sheet-enter-active, .filters-sheet-leave-active,
  .filters-fade-enter-active, .filters-fade-leave-active {
    transition: none !important;
    transform: none !important;
  }
}
</style>
