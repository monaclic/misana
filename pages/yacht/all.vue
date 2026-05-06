<script setup lang="ts">
// Hub catalog yacht. Sidebar filtres ultra complet : taille, builder, guests,
// cabines, equipage, prix semaine, annee, amenities (14), zones de croisiere,
// ports de depart. Multi-select sur tous les axes, layout 2 colonnes.
import { useYachts } from '~/composables/useYachts';
import {
  YACHT_PRICE_BUCKETS,
  YACHT_DAILY_BUCKETS,
  YACHT_AMENITY_LABELS,
  YACHT_TYPE_LABELS,
  type Yacht,
  type YachtAmenity,
  type YachtType,
} from '~/lib/yachts';
import { YACHT_SIZES, type YachtSize } from '~/types/request';
import { CITIES } from '~/lib/constants';

definePageMeta({ layout: 'default' });
defineI18nRoute({
  paths: { en: '/yacht-charter/all', fr: '/yacht/tous' },
});
const { yachts: YACHTS_REF } = useYachts();


const route = useRoute();
const router = useRouter();
const { locale, t } = useI18n();
const localePath = useLocalePath();

// Listing : on cache CTA header + sticky bar mobile. User a un CTA dedie
// sur chaque card. Mobile : grid-only, FAB sticky filtre, sort + search
// meme ligne.
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

// Helper : convertit query.string ou query.array en array<T>.
function asArray<T extends string>(v: unknown, allowed: readonly T[]): T[] {
  if (!v) return [];
  const list = Array.isArray(v) ? v : String(v).split(',');
  return list.map((x) => String(x).trim()).filter((x): x is T => (allowed as readonly string[]).includes(x));
}

const TYPE_OPTIONS: YachtType[] = ['motor', 'sail', 'catamaran'];

// Initial values from URL query
const fType = ref<YachtType[]>(asArray(route.query.type, TYPE_OPTIONS));
const fSize = ref<YachtSize[]>(asArray(route.query.size, YACHT_SIZES));
const fBuilder = ref<string[]>(asArray(route.query.builder, []) as string[]);
const fGuestsBucket = ref<string[]>([]);
const fCabinsBucket = ref<string[]>([]);
const fCrewBucket = ref<string[]>([]);
const fDailyBucket = ref<string[]>([]);
const fPriceBucket = ref<string[]>([]);
const fYear = ref<string[]>([]);
const fAmenities = ref<YachtAmenity[]>([]);
const fCruising = ref<string[]>([]);
const fPort = ref<string[]>(asArray(route.query.port, []) as string[]);
const showFilters = ref(false);

// Re-init builder/port from query (need YACHTS to validate after import order)
fBuilder.value = asArray(route.query.builder, Array.from(new Set(YACHTS_REF.value.map((y) => y.builder))).sort() as readonly string[]) as string[];
const VALID_PORTS = ['cannes', 'monaco', 'saint-tropez'];
fPort.value = asArray(route.query.port, VALID_PORTS as readonly string[]) as string[];

// Sync URL ↔ filters
function syncQuery() {
  const q: Record<string, string> = { ...route.query } as Record<string, string>;
  // remove our managed keys first
  delete q.type; delete q.size; delete q.builder; delete q.port;
  if (fType.value.length) q.type = fType.value.join(',');
  if (fSize.value.length) q.size = fSize.value.join(',');
  if (fBuilder.value.length) q.builder = fBuilder.value.join(',');
  if (fPort.value.length) q.port = fPort.value.join(',');
  router.replace({ path: route.path, query: q });
}
watch([fType, fSize, fBuilder, fPort], syncQuery, { deep: true });

// Body éditorial dynamique selon les filtres actifs
const editorialBody = computed(() => {
  const isFr = locale.value === 'fr';
  if (fType.value.length === 1) {
    if (fType.value[0] === 'sail') return isFr
      ? `Une semaine le long de la côte à la voile. Du sloop de croisière (Beneteau Oceanis 62, Jeanneau Yacht 65) au flagship racing (Wally Cento), en passant par la Perini Navi traditionnelle. Le voilier vit autrement de la mer : silence, lente, l'ombre du génois. Six unités de 18 à 38 mètres, équipage de 2 à 7. Charter au départ de Cannes, Monaco ou Saint-Tropez, navigation Côte d'Azur, Corse, Sardaigne.`
      : `A week along the coast under sail. From the cruising sloop (Beneteau Oceanis 62, Jeanneau Yacht 65) to the racing flagship (Wally Cento), via the traditional Perini Navi. The sailing yacht lives differently with the sea : silence, slow pace, the shadow of the genoa. Six units from 18 to 38 metres, crew of 2 to 7. Charter from Cannes, Monaco or Saint-Tropez, cruising the French Riviera, Corsica, Sardinia.`;
    if (fType.value[0] === 'catamaran') return isFr
      ? `Le catamaran offre la plateforme stable et le salon pleine largeur. De la Lagoon 50 cruising au Sunreef 80 sur mesure, six unités couvrent la fourchette 14 à 24 mètres. Quatre à cinq cabines, deux à quatre équipage. Le bateau pour deux familles ou un long weekend en groupe. Tirant d'eau réduit, idéal pour les criques de la Côte d'Azur et les baies de Sardaigne.`
      : `The catamaran offers stable platform and full-beam saloon. From the Lagoon 50 cruising to the custom Sunreef 80, six units cover the 14 to 24 metre range. Four to five cabins, two to four crew. The boat for two families or a long group weekend. Shallow draft, ideal for Riviera coves and Sardinian bays.`;
    if (fType.value[0] === 'motor') return isFr
      ? `Le yacht moteur reste la référence Riviera : sport hulls de 16 mètres pour le day-cruise, semi-déplacement de 30 mètres pour la semaine, mega-yachts de 65 mètres pour le mois. Notre flotte couvre Sunseeker, Sanlorenzo, Pershing, Princess, Ferretti, Mangusta, Azimut, Riva. Du Forza Sunseeker 65 (3 600 €/jour) au Lurssen 65m sur demande. Charter au départ de Cannes, Monaco, Saint-Tropez.`
      : `The motor yacht remains the Riviera reference : 16-metre sport hulls for day-cruise, 30-metre semi-displacement for the week, 65-metre mega yachts for the month. Our fleet covers Sunseeker, Sanlorenzo, Pershing, Princess, Ferretti, Mangusta, Azimut, Riva. From the Forza Sunseeker 65 (€3,600/day) to the Lurssen 65m on request. Charter from Cannes, Monaco, Saint-Tropez.`;
  }
  if (fSize.value.length === 1) {
    const s = fSize.value[0];
    if (s === '15-20m') return isFr
      ? `Quinze à vingt mètres : la day-cruise de référence. Sport hull, vingt-cinq nœuds en croisière, équipage léger d'une ou deux personnes. Le bateau pour un déjeuner au Club 55, un après-midi au Cap-Ferrat, un retour au coucher du soleil sur Cannes. Six à huit personnes, deux à trois cabines pour les nuits ponctuelles. Sunseeker, Pershing, Azimut, Riva.`
      : `Fifteen to twenty metres : the day-cruise reference. Sport hull, twenty-five knots cruising, light crew of one or two. The boat for a lunch at Club 55, an afternoon at Cap-Ferrat, a sunset return to Cannes. Six to eight guests, two to three cabins for occasional overnights. Sunseeker, Pershing, Azimut, Riva.`;
    if (s === '20-30m') return isFr
      ? `Vingt à trente mètres : la fourchette du weekend ou de la semaine. Quatre cabines, équipage de trois à cinq personnes, fly bridge avec bar, jacuzzi sur le pont sur les modèles plus grands. Sanlorenzo SL90, Pershing 9X, Sunseeker 90 Ocean, Princess Y85, Ferretti 920. Tarif journalier 8 à 15 k€, semaine 50 à 90 k€.`
      : `Twenty to thirty metres : the weekend-to-week range. Four cabins, crew of three to five, fly bridge with bar, deck jacuzzi on larger models. Sanlorenzo SL90, Pershing 9X, Sunseeker 90 Ocean, Princess Y85, Ferretti 920. Daily rate €8-15k, weekly €50-90k.`;
    if (s === '30-50m') return isFr
      ? `Trente à cinquante mètres : le superyacht méditerranéen. Dix personnes en cinq cabines, équipage de huit, jouets aquatiques complets (jet ski, seabob, paddle, plongée), gym, stabilisateurs. Heesen, Benetti, Sanlorenzo Alloy, Baglietto Fast, Westport. Le bateau pour une boucle Cannes-Portofino-Saint-Tropez sans transit perceptible.`
      : `Thirty to fifty metres : the Mediterranean superyacht. Ten guests across five cabins, crew of eight, full water toys complement (jet ski, seabob, paddle, scuba), gym, stabilisers. Heesen, Benetti, Sanlorenzo Alloy, Baglietto Fast, Westport. The boat for a Cannes-Portofino-Saint-Tropez loop with no perceptible transit.`;
    if (s === '50m+') return isFr
      ? `Plus de cinquante mètres : le mega yacht. Douze personnes, équipage de dix à quinze, coque de déplacement, autonomie océan. Lurssen, Feadship, Amels, Benetti B.Now. Beach club avec balcons sur la mer, helideck, suite armateur pleine largeur. Tarif semaine à partir de 320 k€.`
      : `Above fifty metres : the mega yacht. Twelve guests, crew of ten to fifteen, displacement hull, ocean range. Lurssen, Feadship, Amels, Benetti B.Now. Beach club with sea balconies, helideck, full-beam master suite. Weekly rate from €320k.`;
  }
  if (fPort.value.length === 1) {
    const port = fPort.value[0];
    const cityName = CITIES.find((c) => c.slug === port);
    const cn = cityName ? (isFr ? cityName.fr : cityName.en) : port;
    return isFr
      ? `Au départ de ${cn} : embarquement organisé au Vieux Port, équipage briefé sur l'itinéraire en amont, restauration arrangée à terre, transferts port-à-villa coordonnés. Notre flotte ${cn} couvre les quatre brackets de taille, du day-cruise sport au charter semaine. Mercedes V-Class chauffeur inclus pour le transfert depuis votre hôtel ou votre villa, taxi-boat sur demande pour rejoindre le yacht au mouillage.`
      : `Charter from ${cn} : boarding organised at the harbour, crew briefed on itinerary in advance, dining arranged on shore, port-to-villa transfers coordinated. Our ${cn} fleet covers all four size brackets, from sport day-cruise to weekly charter. Mercedes V-Class chauffeur included for the transfer from your hotel or villa, water taxi on request to reach the yacht at anchor.`;
  }
  return isFr
    ? `Soixante-quinze yachts couvrant les quatre brackets de taille (15 à 50+ mètres), trois types (moteur, voilier, catamaran), trois ports de départ (Cannes, Monaco, Saint-Tropez). Tarif journalier de 3 600 € à 53 350 €. Charter Méditerranée : Côte d'Azur, Corse, Sardaigne.`
    : `Seventy-five yachts covering the four size brackets (15 to 50+ metres), three types (motor, sailing, catamaran), three departure ports (Cannes, Monaco, Saint-Tropez). Daily rate from €3,600 to €53,350. Mediterranean charter : French Riviera, Corsica, Sardinia.`;
});

// Dynamic SEO title based on active filters
const dynamicTitle = computed(() => {
  const parts: string[] = [];
  if (fType.value.length === 1) {
    parts.push(locale.value === 'fr' ? YACHT_TYPE_LABELS[fType.value[0]].fr : YACHT_TYPE_LABELS[fType.value[0]].en);
  }
  if (fSize.value.length === 1) parts.push(fSize.value[0]);
  if (fPort.value.length === 1) {
    const c = CITIES.find((c) => c.slug === fPort.value[0]);
    if (c) parts.push(locale.value === 'fr' ? `au départ de ${c.fr}` : `from ${c.en}`);
  }
  if (fBuilder.value.length === 1) parts.push(fBuilder.value[0]);
  const base = locale.value === 'fr' ? 'Yachts sur la Riviera' : 'Yachts on the Riviera';
  return parts.length ? `${parts.join(' · ')} · ${base}` : t('yacht.allTitle');
});

useSeoMeta({
  title: () => dynamicTitle.value,
  description: () => t('yacht.allDescription'),
});

const builders = Array.from(new Set(YACHTS_REF.value.map((y) => y.builder))).sort();

const GUEST_BUCKETS = [
  { id: 'up-to-6', label: 'Up to 6', min: 0, max: 6 },
  { id: '7-10', label: '7 to 10', min: 7, max: 10 },
  { id: '11-plus', label: '11 +', min: 11, max: 30 },
];

const CABIN_BUCKETS = [
  { id: '3', label: '3', min: 3, max: 3 },
  { id: '4', label: '4', min: 4, max: 4 },
  { id: '5', label: '5', min: 5, max: 5 },
  { id: '6-plus', label: '6 +', min: 6, max: 20 },
];

const CREW_BUCKETS = [
  { id: '1-3', label: '1 - 3', min: 1, max: 3 },
  { id: '4-7', label: '4 - 7', min: 4, max: 7 },
  { id: '8-plus', label: '8 +', min: 8, max: 30 },
];

const YEAR_BUCKETS = [
  { id: '2020-plus', label: '2020 +', min: 2020, max: 2099 },
  { id: '2015-2019', label: '2015 - 2019', min: 2015, max: 2019 },
  { id: 'older', label: 'Older', min: 1900, max: 2014 },
];

const ALL_AMENITIES: YachtAmenity[] = [
  'jacuzzi', 'jet-ski', 'seabob', 'paddleboard', 'kayak', 'snorkeling',
  'scuba', 'gym', 'fly-bridge', 'stabilizer', 'wifi', 'av-system', 'tender', 'water-toys',
];

const CRUISING_AREAS = ['french-riviera', 'corsica', 'sardinia'];

const portsAvailable = computed(() => {
  const set = new Set<string>();
  for (const y of YACHTS_REF.value) for (const p of y.ports) set.add(p);
  return Array.from(set).map((slug) => CITIES.find((c) => c.slug === slug)).filter(Boolean) as typeof CITIES[number][];
});

const filteredYachts = computed(() => {
  const terms = fSearch.value.trim().toLowerCase().split(/\s+/).filter(Boolean);
  return YACHTS_REF.value.filter((y) => {
    if (!matchSearch(y, terms)) return false;
    if (fType.value.length && !fType.value.includes(y.type)) return false;
    if (fSize.value.length && !fSize.value.includes(y.size)) return false;
    if (fBuilder.value.length && !fBuilder.value.includes(y.builder)) return false;
    if (fDailyBucket.value.length) {
      if (y.pricePerDay === null) return false;
      const matched = fDailyBucket.value.some((id) => {
        const b = YACHT_DAILY_BUCKETS.find((x) => x.id === id);
        return b ? y.pricePerDay! >= b.min && y.pricePerDay! <= b.max : false;
      });
      if (!matched) return false;
    }
    if (fGuestsBucket.value.length) {
      const matched = fGuestsBucket.value.some((id) => {
        const b = GUEST_BUCKETS.find((x) => x.id === id);
        return b ? y.guests >= b.min && y.guests <= b.max : false;
      });
      if (!matched) return false;
    }
    if (fCabinsBucket.value.length) {
      const matched = fCabinsBucket.value.some((id) => {
        const b = CABIN_BUCKETS.find((x) => x.id === id);
        return b ? y.cabins >= b.min && y.cabins <= b.max : false;
      });
      if (!matched) return false;
    }
    if (fCrewBucket.value.length) {
      const matched = fCrewBucket.value.some((id) => {
        const b = CREW_BUCKETS.find((x) => x.id === id);
        return b ? y.crew >= b.min && y.crew <= b.max : false;
      });
      if (!matched) return false;
    }
    if (fPriceBucket.value.length) {
      const matched = fPriceBucket.value.some((id) => {
        const b = YACHT_PRICE_BUCKETS.find((x) => x.id === id);
        return b ? y.pricePerWeekFrom >= b.min && y.pricePerWeekFrom <= b.max : false;
      });
      if (!matched) return false;
    }
    if (fYear.value.length) {
      const matched = fYear.value.some((id) => {
        const b = YEAR_BUCKETS.find((x) => x.id === id);
        return b ? y.year >= b.min && y.year <= b.max : false;
      });
      if (!matched) return false;
    }
    if (fAmenities.value.length) {
      for (const a of fAmenities.value) if (!y.amenities.includes(a)) return false;
    }
    if (fCruising.value.length) {
      const matched = fCruising.value.some((c) => y.cruisingAreas.includes(c));
      if (!matched) return false;
    }
    if (fPort.value.length) {
      const matched = fPort.value.some((p) => y.ports.includes(p));
      if (!matched) return false;
    }
    return true;
  });
});

const visibleYachts = computed(() => {
  const arr = [...filteredYachts.value];
  switch (fSort.value) {
    case 'price-week-asc': return arr.sort((a, b) => a.pricePerWeekFrom - b.pricePerWeekFrom);
    case 'price-week-desc': return arr.sort((a, b) => b.pricePerWeekFrom - a.pricePerWeekFrom);
    case 'length-desc': return arr.sort((a, b) => b.lengthM - a.lengthM);
    case 'length-asc': return arr.sort((a, b) => a.lengthM - b.lengthM);
    case 'year-desc': return arr.sort((a, b) => b.year - a.year);
    case 'guests-desc': return arr.sort((a, b) => b.guests - a.guests);
    default: return arr;
  }
});

const filterCount = computed(() =>
  fType.value.length + fSize.value.length + fBuilder.value.length + fGuestsBucket.value.length +
  fCabinsBucket.value.length + fCrewBucket.value.length + fDailyBucket.value.length +
  fPriceBucket.value.length + fYear.value.length + fAmenities.value.length +
  fCruising.value.length + fPort.value.length,
);

function clearFilters() {
  fSearch.value = '';
  fType.value = [];
  fSize.value = [];
  fBuilder.value = [];
  fGuestsBucket.value = [];
  fCabinsBucket.value = [];
  fCrewBucket.value = [];
  fDailyBucket.value = [];
  fPriceBucket.value = [];
  fYear.value = [];
  fAmenities.value = [];
  fCruising.value = [];
  fPort.value = [];
}

function fmtPrice(p: number | null): string {
  if (p === null) return t('yacht.onRequest');
  return new Intl.NumberFormat(locale.value === 'fr' ? 'fr-FR' : 'en-GB', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0,
  }).format(p);
}

// =========== Vue grid / list (URL-based) ===========
const VALID_VIEWS = ['grid', 'list'] as const;
type ViewMode = typeof VALID_VIEWS[number];
const initialView: ViewMode = (typeof route.query.view === 'string' && (VALID_VIEWS as readonly string[]).includes(route.query.view))
  ? (route.query.view as ViewMode)
  : 'grid';
const view = ref<ViewMode>(initialView);
// Mobile : on force grid view
const effectiveView = computed(() => (isMdUp.value ? view.value : 'grid'));
function setView(v: ViewMode) {
  view.value = v;
  const q: Record<string, string> = { ...route.query } as Record<string, string>;
  if (v === 'grid') delete q.view; else q.view = v;
  router.replace({ path: route.path, query: q });
}

// =========== Tri (URL-based) ==========
const VALID_SORTS = ['default', 'price-week-asc', 'price-week-desc', 'length-desc', 'length-asc', 'year-desc', 'guests-desc'] as const;
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

// =========== Recherche full-text ==========
const fSearch = ref<string>(typeof route.query.q === 'string' ? route.query.q : '');
function syncSearch() {
  const q: Record<string, string> = { ...route.query } as Record<string, string>;
  if (fSearch.value.trim()) q.q = fSearch.value.trim();
  else delete q.q;
  router.replace({ path: route.path, query: q });
}
watch(fSearch, syncSearch);

function yachtHaystack(y: Yacht): string {
  const portNames = y.ports.flatMap((slug) => {
    const c = CITIES.find((x) => x.slug === slug);
    return c ? [c.fr, c.en] : [];
  });
  const typeLabels = [YACHT_TYPE_LABELS[y.type].fr, YACHT_TYPE_LABELS[y.type].en];
  return [
    y.fullName, y.name, y.builder, y.model, y.type, y.size,
    String(y.year),
    ...typeLabels,
    ...portNames,
    ...y.cruisingAreas,
  ].filter(Boolean).join(' ').toLowerCase();
}
function matchSearch(y: Yacht, terms: string[]): boolean {
  if (!terms.length) return true;
  const hay = yachtHaystack(y);
  return terms.every((t) => hay.includes(t));
}

// =========== Helpers ==========
function toggleFilter<T>(filter: { value: T[] }, value: T) {
  const idx = filter.value.indexOf(value);
  if (idx >= 0) {
    filter.value = filter.value.filter((_, i) => i !== idx);
  } else {
    filter.value = [...filter.value, value];
  }
}

function builderInitial(b: string): string {
  return b.charAt(0).toUpperCase();
}

function portsLabel(slugs: string[]): string {
  const names = slugs.map((slug) => {
    const c = CITIES.find((x) => x.slug === slug);
    return c ? (locale.value === 'fr' ? c.fr : c.en) : slug;
  });
  if (names.length <= 2) return names.join(', ');
  return `${names.slice(0, 2).join(', ')} +${names.length - 2}`;
}

function typeLabel(t: YachtType): string {
  return locale.value === 'fr' ? YACHT_TYPE_LABELS[t].fr : YACHT_TYPE_LABELS[t].en;
}
</script>

<template>
  <main class="min-h-screen">
    <!-- Hero band -->
    <section class="bg-misana-paper border-b border-misana-line">
      <div class="max-w-[1600px] mx-auto px-6 sm:px-12 py-10 sm:py-24">
        <p class="text-xs uppercase tracking-widest text-misana-muted mb-3 sm:mb-4">{{ t('yacht.kicker') }}</p>
        <h1 class="font-display text-3xl sm:text-5xl mb-3 sm:mb-4">{{ t('yacht.hubTitle') }}</h1>
        <p class="text-misana-muted text-base sm:text-lg max-w-2xl" data-display>{{ t('yacht.hubLead') }}</p>
      </div>
    </section>

    <!-- Listing -->
    <section class="max-w-[1600px] mx-auto px-4 sm:px-12 py-8 sm:py-16">
      <div class="grid lg:grid-cols-12 gap-10">
        <!-- Backdrop mobile (Airbnb) -->
        <Transition name="filters-fade">
          <div
            v-if="showFilters"
            class="lg:hidden fixed inset-0 z-40 bg-black/50"
            @click="showFilters = false"
          ></div>
        </Transition>

        <!-- Sidebar filters / bottom sheet mobile -->
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
                  aria-label="Close filters"
                  @click="showFilters = false"
                >
                  <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" class="w-4 h-4">
                    <path d="M6 6L18 18M6 18L18 6" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" />
                  </svg>
                </button>
                <p class="filters-title">{{ t('yacht.filters') }}<span v-if="filterCount" class="filters-badge">{{ filterCount }}</span></p>
                <button
                  v-if="filterCount"
                  type="button"
                  class="filters-clear"
                  @click="clearFilters"
                >{{ t('yacht.clearFilters') }}</button>
                <span v-else class="filters-clear-spacer lg:hidden"></span>
              </div>

            <div class="filters-body">
              <!-- Type -->
              <section class="filter-section">
                <p class="filter-section-key">{{ t('yacht.filterType') }}</p>
                <ul class="filter-list">
                  <li v-for="ty in TYPE_OPTIONS" :key="ty">
                    <label class="filter-row">
                      <input type="checkbox" v-model="fType" :value="ty" class="filter-check" />
                      <span class="filter-label">{{ locale === 'fr' ? YACHT_TYPE_LABELS[ty].fr : YACHT_TYPE_LABELS[ty].en }}</span>
                    </label>
                  </li>
                </ul>
              </section>

              <!-- Tarif journalier -->
              <section class="filter-section">
                <p class="filter-section-key">{{ t('yacht.filterDailyPrice') }}</p>
                <ul class="filter-list">
                  <li v-for="bucket in YACHT_DAILY_BUCKETS" :key="bucket.id">
                    <label class="filter-row">
                      <input type="checkbox" v-model="fDailyBucket" :value="bucket.id" class="filter-check" />
                      <span class="filter-label">{{ bucket.label }}</span>
                    </label>
                  </li>
                </ul>
              </section>

              <!-- Taille -->
              <section class="filter-section">
                <p class="filter-section-key">{{ t('yacht.filterSize') }}</p>
                <ul class="filter-list">
                  <li v-for="s in YACHT_SIZES" :key="s">
                    <label class="filter-row">
                      <input type="checkbox" v-model="fSize" :value="s" class="filter-check" />
                      <span class="filter-label">{{ s }}</span>
                    </label>
                  </li>
                </ul>
              </section>

              <!-- Constructeur -->
              <section class="filter-section">
                <p class="filter-section-key">{{ t('yacht.filterBuilder') }}</p>
                <ul class="filter-list">
                  <li v-for="b in builders" :key="b">
                    <label class="filter-row">
                      <input type="checkbox" v-model="fBuilder" :value="b" class="filter-check" />
                      <span class="filter-label">{{ b }}</span>
                    </label>
                  </li>
                </ul>
              </section>

              <!-- Invites -->
              <section class="filter-section">
                <p class="filter-section-key">{{ t('yacht.filterGuests') }}</p>
                <ul class="filter-list">
                  <li v-for="b in GUEST_BUCKETS" :key="b.id">
                    <label class="filter-row">
                      <input type="checkbox" v-model="fGuestsBucket" :value="b.id" class="filter-check" />
                      <span class="filter-label">{{ b.label }}</span>
                    </label>
                  </li>
                </ul>
              </section>

              <!-- Cabines -->
              <section class="filter-section">
                <p class="filter-section-key">{{ t('yacht.filterCabins') }}</p>
                <ul class="filter-list">
                  <li v-for="b in CABIN_BUCKETS" :key="b.id">
                    <label class="filter-row">
                      <input type="checkbox" v-model="fCabinsBucket" :value="b.id" class="filter-check" />
                      <span class="filter-label">{{ b.label }}</span>
                    </label>
                  </li>
                </ul>
              </section>

              <!-- Equipage -->
              <section class="filter-section">
                <p class="filter-section-key">{{ t('yacht.filterCrew') }}</p>
                <ul class="filter-list">
                  <li v-for="b in CREW_BUCKETS" :key="b.id">
                    <label class="filter-row">
                      <input type="checkbox" v-model="fCrewBucket" :value="b.id" class="filter-check" />
                      <span class="filter-label">{{ b.label }}</span>
                    </label>
                  </li>
                </ul>
              </section>

              <!-- Tarif semaine -->
              <section class="filter-section">
                <p class="filter-section-key">{{ t('yacht.filterPrice') }}</p>
                <ul class="filter-list">
                  <li v-for="bucket in YACHT_PRICE_BUCKETS" :key="bucket.id">
                    <label class="filter-row">
                      <input type="checkbox" v-model="fPriceBucket" :value="bucket.id" class="filter-check" />
                      <span class="filter-label">{{ bucket.label }}</span>
                    </label>
                  </li>
                </ul>
              </section>

              <!-- Annee -->
              <section class="filter-section">
                <p class="filter-section-key">{{ t('yacht.filterYear') }}</p>
                <ul class="filter-list">
                  <li v-for="y in YEAR_BUCKETS" :key="y.id">
                    <label class="filter-row">
                      <input type="checkbox" v-model="fYear" :value="y.id" class="filter-check" />
                      <span class="filter-label">{{ y.label }}</span>
                    </label>
                  </li>
                </ul>
              </section>

              <!-- Equipements -->
              <section class="filter-section">
                <p class="filter-section-key">{{ t('yacht.filterAmenities') }}</p>
                <ul class="filter-list">
                  <li v-for="a in ALL_AMENITIES" :key="a">
                    <label class="filter-row">
                      <input type="checkbox" v-model="fAmenities" :value="a" class="filter-check" />
                      <span class="filter-label">{{ locale === 'fr' ? YACHT_AMENITY_LABELS[a].fr : YACHT_AMENITY_LABELS[a].en }}</span>
                    </label>
                  </li>
                </ul>
              </section>

              <!-- Zone de croisiere -->
              <section class="filter-section">
                <p class="filter-section-key">{{ t('yacht.filterCruising') }}</p>
                <ul class="filter-list">
                  <li v-for="area in CRUISING_AREAS" :key="area">
                    <label class="filter-row">
                      <input type="checkbox" v-model="fCruising" :value="area" class="filter-check" />
                      <span class="filter-label">{{ t(`yacht.fiche.cruisingArea.${area}`) }}</span>
                    </label>
                  </li>
                </ul>
              </section>

              <!-- Ports -->
              <section class="filter-section">
                <p class="filter-section-key">{{ t('yacht.filterPort') }}</p>
                <ul class="filter-list">
                  <li v-for="p in portsAvailable" :key="p.slug">
                    <label class="filter-row">
                      <input type="checkbox" v-model="fPort" :value="p.slug" class="filter-check" />
                      <span class="filter-label">{{ locale === 'fr' ? p.fr : p.en }}</span>
                    </label>
                  </li>
                </ul>
              </section>
            </div>

            <!-- Footer sticky mobile : CTA "Voir X resultats" -->
            <div class="filters-footer lg:hidden">
              <button
                type="button"
                class="filters-apply"
                @click="showFilters = false"
              >
                {{ t('yacht.viewResults', { n: visibleYachts.length }) }}
              </button>
            </div>
          </div>
          </aside>
        </Transition>

        <!-- Results -->
        <div class="lg:col-span-9">
          <!-- Toolbar editoriale : recherche + count + view toggle -->
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
                :placeholder="t('yacht.searchPlaceholder')"
                class="search-input"
                :aria-label="t('yacht.searchAria')"
              />
              <button
                v-if="fSearch"
                type="button"
                class="search-clear"
                :aria-label="t('yacht.searchClear')"
                @click="fSearch = ''"
              >×</button>
            </label>

            <div class="toolbar-meta">
              <!-- Sort select -->
              <div class="toolbar-sort-wrap">
                <select v-model="fSort" class="toolbar-sort" :aria-label="t('yacht.sortAria')">
                  <option value="default">{{ t('yacht.sortDefault') }}</option>
                  <option value="price-week-asc">{{ t('yacht.sortPriceWeekAsc') }}</option>
                  <option value="price-week-desc">{{ t('yacht.sortPriceWeekDesc') }}</option>
                  <option value="length-desc">{{ t('yacht.sortLengthDesc') }}</option>
                  <option value="length-asc">{{ t('yacht.sortLengthAsc') }}</option>
                  <option value="year-desc">{{ t('yacht.sortYearDesc') }}</option>
                  <option value="guests-desc">{{ t('yacht.sortGuestsDesc') }}</option>
                </select>
                <span class="toolbar-sort-chevron" aria-hidden="true">
                  <svg viewBox="0 0 12 12" fill="none" class="block w-3 h-3">
                    <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" />
                  </svg>
                </span>
              </div>
              <div class="view-toggle hidden md:inline-flex" role="tablist" :aria-label="t('yacht.viewToggleAria')">
                <button
                  type="button"
                  role="tab"
                  class="view-btn"
                  :class="{ 'view-btn-active': view === 'grid' }"
                  :aria-selected="view === 'grid'"
                  :title="t('yacht.viewGrid')"
                  @click="setView('grid')"
                >
                  <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" class="w-4 h-4">
                    <rect x="3.5" y="3.5" width="7" height="7" rx="1" stroke="currentColor" stroke-width="1.4" />
                    <rect x="13.5" y="3.5" width="7" height="7" rx="1" stroke="currentColor" stroke-width="1.4" />
                    <rect x="3.5" y="13.5" width="7" height="7" rx="1" stroke="currentColor" stroke-width="1.4" />
                    <rect x="13.5" y="13.5" width="7" height="7" rx="1" stroke="currentColor" stroke-width="1.4" />
                  </svg>
                  <span>{{ t('yacht.viewGrid') }}</span>
                </button>
                <button
                  type="button"
                  role="tab"
                  class="view-btn"
                  :class="{ 'view-btn-active': view === 'list' }"
                  :aria-selected="view === 'list'"
                  :title="t('yacht.viewList')"
                  @click="setView('list')"
                >
                  <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" class="w-4 h-4">
                    <rect x="3.5" y="4.5" width="17" height="5" rx="1" stroke="currentColor" stroke-width="1.4" />
                    <rect x="3.5" y="14.5" width="17" height="5" rx="1" stroke="currentColor" stroke-width="1.4" />
                  </svg>
                  <span>{{ t('yacht.viewList') }}</span>
                </button>
              </div>
            </div>
          </div>

          <!-- Count : sous toolbar, sa propre ligne -->
          <p class="toolbar-count">
            {{ visibleYachts.length }} {{ t('yacht.results', { n: visibleYachts.length }) }}
            <span v-if="filterCount" class="toolbar-filter-count">· {{ filterCount }} {{ t('yacht.filtersActive') }}</span>
          </p>

          <!-- =========== GRID VIEW =========== -->
          <div
            v-if="visibleYachts.length && effectiveView === 'grid'"
            class="grid grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-6"
          >
            <NuxtLink
              v-for="y in visibleYachts"
              :key="y.id"
              :to="localePath(`/yacht/${y.id}`)"
              class="ccg group"
            >
              <div class="ccg-image-wrap">
                <img :src="y.hero" :alt="y.fullName" loading="lazy" class="ccg-image" />
                <span v-if="y.badge" class="ccg-badge">{{ t(`request.fleet.badge.${y.badge}`) }}</span>
                <span class="card-cue" aria-hidden="true">
                  <svg viewBox="0 0 20 20" fill="none" class="block w-5 h-5">
                    <path d="M6 14L14 6" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" />
                    <path d="M7 6H14V13" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" />
                  </svg>
                </span>
              </div>

              <div class="ccg-title-wrap">
                <span class="ccg-logo" aria-hidden="true">{{ builderInitial(y.builder) }}</span>
                <div class="ccg-title-block">
                  <h3 class="ccg-title">{{ y.fullName }}</h3>
                  <p class="ccg-details">
                    <span>{{ y.year }}</span>
                    <span class="ccg-dot" aria-hidden="true"></span>
                    <span>{{ y.lengthM }} m</span>
                    <span class="ccg-dot" aria-hidden="true"></span>
                    <span>{{ typeLabel(y.type) }}</span>
                  </p>
                </div>
              </div>

              <div class="ccg-price-wrap">
                <span class="ccg-tag">{{ y.guests }} {{ t('yacht.guestsShort') }}</span>
                <div class="ccg-price">
                  <template v-if="y.pricePerDay">
                    <span class="ccg-price-value">{{ fmtPrice(y.pricePerDay) }}</span>
                    <span class="ccg-price-unit">{{ t('yacht.perDayShort') }}</span>
                  </template>
                  <template v-else>
                    <span class="ccg-price-value">{{ fmtPrice(y.pricePerWeekFrom) }}</span>
                    <span class="ccg-price-unit">{{ t('yacht.perWeekShort') }}</span>
                  </template>
                </div>
              </div>
            </NuxtLink>
          </div>

          <!-- =========== LIST VIEW =========== -->
          <div v-else-if="visibleYachts.length && effectiveView === 'list'" class="flex flex-col gap-5">
            <NuxtLink
              v-for="y in visibleYachts"
              :key="y.id"
              :to="localePath(`/yacht/${y.id}`)"
              class="ccl group"
            >
              <div class="ccl-image-wrap">
                <img :src="y.hero" :alt="y.fullName" loading="lazy" class="ccl-image" />
                <span v-if="y.badge" class="ccl-badge">{{ t(`request.fleet.badge.${y.badge}`) }}</span>
                <span class="card-cue" aria-hidden="true">
                  <svg viewBox="0 0 20 20" fill="none" class="block w-5 h-5">
                    <path d="M6 14L14 6" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" />
                    <path d="M7 6H14V13" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" />
                  </svg>
                </span>
              </div>

              <div class="ccl-desc">
                <!-- Title row -->
                <div class="ccl-title-row">
                  <span class="ccl-logo" aria-hidden="true">{{ builderInitial(y.builder) }}</span>
                  <div class="ccl-title-block">
                    <h3 class="ccl-title">{{ y.fullName }}</h3>
                    <p class="ccl-subtitle">
                      <span>{{ y.year }}</span>
                      <span class="ccl-dot" aria-hidden="true"></span>
                      <span>{{ y.lengthM }} m</span>
                      <span class="ccl-dot" aria-hidden="true"></span>
                      <span>{{ typeLabel(y.type) }}</span>
                      <span class="ccl-dot" aria-hidden="true"></span>
                      <span>{{ y.guests }} {{ t('yacht.guestsShort') }}</span>
                    </p>
                  </div>
                  <div class="ccl-price-block">
                    <p class="ccl-price">
                      <template v-if="y.pricePerDay">{{ fmtPrice(y.pricePerDay) }}</template>
                      <template v-else>{{ fmtPrice(y.pricePerWeekFrom) }}</template>
                    </p>
                    <p class="ccl-price-label">
                      <template v-if="y.pricePerDay">{{ t('yacht.perDayShort') }}</template>
                      <template v-else>{{ t('yacht.perWeekShort') }}</template>
                    </p>
                  </div>
                </div>

                <!-- Tarifs : journee + semaine basse + semaine haute -->
                <div class="ccl-tiers">
                  <div class="ccl-tier">
                    <p class="ccl-tier-key">{{ t('yacht.tierDay') }}</p>
                    <p class="ccl-tier-val">
                      <template v-if="y.pricePerDay">{{ fmtPrice(y.pricePerDay) }}<small>{{ t('yacht.perDayShort') }}</small></template>
                      <template v-else>{{ t('yacht.onRequest') }}</template>
                    </p>
                  </div>
                  <div class="ccl-tier">
                    <p class="ccl-tier-key">{{ t('yacht.tierWeekLow') }}</p>
                    <p class="ccl-tier-val">{{ fmtPrice(y.pricePerWeekFrom) }}<small>{{ t('yacht.perWeekShort') }}</small></p>
                  </div>
                  <div class="ccl-tier ccl-tier-best">
                    <p class="ccl-tier-key">{{ t('yacht.tierWeekHigh') }}</p>
                    <p class="ccl-tier-val">
                      <template v-if="y.pricePerWeekTo">{{ fmtPrice(y.pricePerWeekTo) }}<small>{{ t('yacht.perWeekShort') }}</small></template>
                      <template v-else>{{ t('yacht.onRequest') }}</template>
                    </p>
                  </div>
                </div>

                <!-- Specs yacht-specifiques : cabines, equipage, vitesse, ports -->
                <div class="ccl-conds">
                  <div class="ccl-cond">
                    <span class="ccl-cond-key">{{ t('yacht.cabins') }}</span>
                    <strong class="ccl-cond-val">{{ y.cabins }}</strong>
                  </div>
                  <div class="ccl-cond">
                    <span class="ccl-cond-key">{{ t('yacht.crew') }}</span>
                    <strong class="ccl-cond-val">{{ y.crew }}</strong>
                  </div>
                  <div class="ccl-cond">
                    <span class="ccl-cond-key">{{ t('yacht.maxSpeed') }}</span>
                    <strong class="ccl-cond-val">{{ y.maxKnots }} kn</strong>
                  </div>
                  <div class="ccl-cond">
                    <span class="ccl-cond-key">{{ t('yacht.ports') }}</span>
                    <strong class="ccl-cond-val">{{ portsLabel(y.ports) }}</strong>
                  </div>
                </div>
              </div>
            </NuxtLink>
          </div>

          <div v-else class="text-center py-16">
            <p class="text-misana-muted text-sm mb-4">{{ t('yacht.noResults') }}</p>
            <button type="button" class="text-xs underline underline-offset-4 hover:text-misana-ink transition" @click="clearFilters">{{ t('yacht.clearFilters') }}</button>
          </div>

          <p class="text-xs text-misana-muted mt-8 italic">{{ t('yacht.priceFootnote') }}</p>
        </div>
      </div>
    </section>

    <!-- Body editorial -->
    <section class="bg-misana-paper border-t border-misana-line">
      <div class="max-w-[1600px] mx-auto px-6 sm:px-12 py-16 sm:py-20">
        <p class="text-misana-muted leading-relaxed">{{ editorialBody }}</p>
      </div>
    </section>

    <!-- Sticky bottom filter button (Airbnb-style) : visible mobile uniquement -->
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
      <span>{{ t('yacht.filters') }}</span>
      <span v-if="filterCount" class="filters-fab-badge">{{ filterCount }}</span>
    </button>
  </main>
</template>

<style scoped>
/* ============================================== */
/* DESIGN SYSTEM (yacht/all - port cars/all)      */
/* Forme : 4-6px monochrome blanc/noir + line     */
/* ============================================== */

/* === Filter checkbox row (monochrome) === */
.filter-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.filter-row {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 5px 0;
  cursor: pointer;
  user-select: none;
}
.filter-check {
  appearance: none;
  -webkit-appearance: none;
  flex: 0 0 auto;
  width: 14px;
  height: 14px;
  margin: 0;
  border: 1px solid var(--color-misana-ink);
  background: var(--color-misana-paper);
  border-radius: 2px;
  cursor: pointer;
  position: relative;
  transition: background 0.2s ease;
}
.filter-check:checked { background: var(--color-misana-ink); }
.filter-label {
  font-size: 0.82rem;
  color: var(--color-misana-muted);
  transition: color 0.2s ease;
}
.filter-row:hover .filter-label { color: var(--color-misana-ink); }
.filter-check:checked ~ .filter-label {
  color: var(--color-misana-ink);
  font-weight: 500;
}

/* === Mobile bottom sheet (Airbnb style) === */
.filters-aside.is-open {
  position: fixed;
  inset: auto 0 0 0;
  z-index: 50;
  height: 88vh;
  max-height: 88vh;
  background: var(--color-misana-paper);
  border-top-left-radius: 14px;
  border-top-right-radius: 14px;
  box-shadow: 0 -8px 30px -10px rgba(0, 0, 0, 0.25);
  display: flex;
  flex-direction: column;
}
@media (min-width: 1024px) {
  .filters-aside,
  .filters-aside.is-open {
    position: relative;
    inset: auto;
    height: auto;
    max-height: none;
    background: transparent;
    border-radius: 0;
    box-shadow: none;
  }
}
.filters-sheet-enter-active,
.filters-sheet-leave-active {
  transition: transform 0.35s cubic-bezier(0.32, 0.72, 0, 1), opacity 0.25s ease;
}
.filters-sheet-enter-from,
.filters-sheet-leave-to { transform: translateY(100%); opacity: 0; }
@media (min-width: 1024px) {
  .filters-sheet-enter-active,
  .filters-sheet-leave-active { transition: none; }
  .filters-sheet-enter-from,
  .filters-sheet-leave-to { transform: none; opacity: 1; }
}
.filters-fade-enter-active, .filters-fade-leave-active { transition: opacity 0.25s ease; }
.filters-fade-enter-from, .filters-fade-leave-to { opacity: 0; }

/* === Filters card (sidebar) === */
.filters-card {
  height: 100%;
  background: var(--color-misana-paper);
  overflow: hidden;
  display: flex;
  flex-direction: column;
}
@media (min-width: 1024px) {
  .filters-card {
    height: auto;
    border: 1px solid var(--color-misana-line);
  }
}

.filters-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 16px 18px;
  border-bottom: 1px solid var(--color-misana-line);
  background: var(--color-misana-paper);
  flex: 0 0 auto;
}
.filters-close {
  width: 32px;
  height: 32px;
  border: 1px solid var(--color-misana-line);
  border-radius: 999px;
  background: var(--color-misana-paper);
  color: var(--color-misana-ink);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: border-color 0.2s ease;
}
.filters-close:hover { border-color: var(--color-misana-ink); }
.filters-clear-spacer { width: 32px; height: 32px; flex: 0 0 auto; }
@media (min-width: 1024px) {
  .filters-close { display: none; }
}
.filters-title {
  margin: 0;
  font-size: 0.7rem;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: var(--color-misana-ink);
  display: inline-flex;
  align-items: center;
  gap: 8px;
}
.filters-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 22px;
  height: 22px;
  padding: 0 6px;
  background: var(--color-misana-ink);
  color: var(--color-misana-paper);
  border-radius: 4px;
  font-size: 0.7rem;
  letter-spacing: 0;
}
.filters-clear {
  font-size: 0.65rem;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  padding: 6px 12px;
  background: transparent;
  color: var(--color-misana-muted);
  border: 1px solid var(--color-misana-line);
  border-radius: 4px;
  cursor: pointer;
  font-family: inherit;
  transition: border-color 0.25s ease, color 0.25s ease;
}
.filters-clear:hover {
  border-color: var(--color-misana-ink);
  color: var(--color-misana-ink);
}

.filters-body {
  display: flex;
  flex-direction: column;
  gap: 22px;
  padding: 20px 18px 24px;
  flex: 1 1 auto;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
}
@media (min-width: 1024px) {
  .filters-body { max-height: calc(100vh - 14rem); }
}

/* Footer sticky mobile : CTA "Voir X resultats" full width */
.filters-footer {
  flex: 0 0 auto;
  padding: 12px 16px calc(12px + env(safe-area-inset-bottom));
  border-top: 1px solid var(--color-misana-line);
  background: var(--color-misana-paper);
}
.filters-apply {
  width: 100%;
  padding: 14px 18px;
  background: var(--color-misana-ink);
  color: var(--color-misana-paper);
  border: 0;
  border-radius: 8px;
  font-size: 0.78rem;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  cursor: pointer;
  font-family: inherit;
  transition: opacity 0.25s ease;
}
.filters-apply:hover { opacity: 0.9;
}

.filter-section { display: flex; flex-direction: column; gap: 10px; }
.filter-section-key {
  margin: 0;
  font-size: 0.62rem;
  letter-spacing: 0.24em;
  text-transform: uppercase;
  color: var(--color-misana-muted);
}

/* === Toolbar : search + count + view toggle === */
.toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  margin-bottom: 28px;
}
.toolbar-search {
  flex: 1 1 0;
  min-width: 0;
  display: flex;
  align-items: center;
  gap: 12px;
  background: var(--color-misana-paper);
  border: 1px solid var(--color-misana-line);
  border-radius: 4px;
  padding: 0 18px;
  height: 44px;
  cursor: text;
  transition: border-color 0.3s ease;
}
@media (min-width: 1280px) {
  .toolbar-search { max-width: calc((100% - 16px) * 2 / 3); }
}
.toolbar-search:focus-within { border-color: var(--color-misana-ink); }
.search-icon {
  flex: 0 0 auto;
  display: inline-flex;
  color: var(--color-misana-muted);
  transition: color 0.3s ease;
}
.toolbar-search:focus-within .search-icon { color: var(--color-misana-ink); }
.search-input {
  flex: 1 1 0;
  min-width: 0;
  background: transparent;
  border: 0;
  outline: 0;
  font-family: inherit;
  font-size: 0.95rem;
  color: var(--color-misana-ink);
  padding: 0;
}
.search-input::placeholder { color: var(--color-misana-muted); }
.search-input::-webkit-search-cancel-button { display: none; }
.search-clear {
  flex: 0 0 auto;
  width: 24px;
  height: 24px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: var(--color-misana-paper);
  color: var(--color-misana-ink);
  border: 1px solid var(--color-misana-line);
  border-radius: 4px;
  font-size: 0.95rem;
  line-height: 1;
  cursor: pointer;
  font-family: inherit;
  transition: background 0.3s ease, border-color 0.3s ease;
}
.search-clear:hover {
  background: var(--color-misana-ink);
  color: var(--color-misana-paper);
  border-color: var(--color-misana-ink);
}

.toolbar-meta {
  flex: 0 0 auto;
  display: flex;
  align-items: center;
  gap: 16px;
}
.toolbar-count {
  margin: 0 0 18px;
  font-size: 0.78rem;
  color: var(--color-misana-muted);
  font-style: italic;
}
.toolbar-filter-count { margin-left: 0.5rem; font-style: normal; }

.toolbar-sort-wrap {
  position: relative;
  display: inline-flex;
  align-items: center;
}
.toolbar-sort {
  appearance: none;
  -webkit-appearance: none;
  background: var(--color-misana-paper);
  color: var(--color-misana-ink);
  border: 1px solid var(--color-misana-line);
  border-radius: 4px;
  padding: 0 32px 0 14px;
  height: 44px;
  font-size: 0.65rem;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  cursor: pointer;
  font-family: inherit;
  transition: border-color 0.25s ease;
  outline: none;
  line-height: 1;
}
.toolbar-sort:hover { border-color: var(--color-misana-ink); }
.toolbar-sort:focus { border-color: var(--color-misana-ink); }
.toolbar-sort-chevron {
  position: absolute;
  right: 10px;
  pointer-events: none;
  color: var(--color-misana-muted);
}

@media (max-width: 767px) {
  /* Toolbar mobile : 1 ligne search + sort 150px, hauteur 44px */
  .toolbar {
    display: grid;
    grid-template-columns: minmax(0, 1fr) 150px;
    column-gap: 8px;
    margin-bottom: 14px;
  }
  .toolbar-search {
    grid-column: 1;
    height: 44px;
    padding: 0 14px;
    box-sizing: border-box;
    min-width: 0;
  }
  .search-input { font-size: 0.85rem; }
  .toolbar-meta {
    grid-column: 2;
    display: flex;
    align-items: stretch;
  }
  .toolbar-count {
    margin: 0 0 12px;
    font-size: 0.7rem;
  }
  .toolbar-sort-wrap { height: 44px; width: 100%; flex: 1 1 auto; }
  .toolbar-sort {
    width: 100%;
    height: 44px;
    padding: 0 28px 0 12px;
    font-size: 0.62rem;
    letter-spacing: 0.14em;
    line-height: 1;
  }
  .toolbar-sort-chevron { right: 10px; }
  .view-toggle { display: none !important; }
}
/* === FAB filter button (Airbnb-style) : visible mobile only === */
.filters-fab {
  position: fixed;
  bottom: calc(20px + env(safe-area-inset-bottom));
  left: 50%;
  transform: translateX(-50%);
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 12px 22px;
  background: var(--color-misana-ink);
  color: var(--color-misana-paper);
  border: 0;
  border-radius: 999px;
  font-size: 0.75rem;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  cursor: pointer;
  font-family: inherit;
  z-index: 30;
  box-shadow: 0 6px 20px -8px rgba(0, 0, 0, 0.4);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}
.filters-fab:hover { transform: translateX(-50%) translateY(-1px); }
@media (min-width: 1024px) {
  .filters-fab { display: none !important; }
}
.filters-fab-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 20px;
  height: 20px;
  padding: 0 6px;
  margin-left: 4px;
  background: var(--color-misana-paper);
  color: var(--color-misana-ink);
  border-radius: 999px;
  font-size: 0.65rem;
  letter-spacing: 0;
}

/* === View toggle (44px hauteur uniforme desktop) === */
.view-toggle {
  display: inline-flex;
  align-items: stretch;
  border: 1px solid var(--color-misana-line);
  background: var(--color-misana-paper);
  border-radius: 4px;
  padding: 3px;
  overflow: hidden;
  height: 44px;
  box-sizing: border-box;
}
.view-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0 0.95rem;
  font-size: 0.65rem;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: var(--color-misana-muted);
  background: transparent;
  border: 0;
  line-height: 1;
  border-radius: 4px;
  cursor: pointer;
  transition: background 0.3s ease, color 0.3s ease;
  font-family: inherit;
}
.view-btn:hover { color: var(--color-misana-ink); }
.view-btn-active {
  background: var(--color-misana-ink);
  color: var(--color-misana-paper);
}
.view-btn-active:hover { color: var(--color-misana-paper); }

/* === Hover cue (black square arrow) === */
.card-cue {
  position: absolute;
  bottom: 14px;
  right: 14px;
  width: 46px;
  height: 46px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: var(--color-misana-ink);
  color: var(--color-misana-paper);
  border-radius: 4px;
  opacity: 0;
  transform: translateY(8px);
  transition:
    opacity 0.4s ease,
    transform 0.55s cubic-bezier(0.16, 1, 0.3, 1);
  pointer-events: none;
}
.ccg:hover .card-cue,
.ccl:hover .card-cue {
  opacity: 1;
  transform: translateY(0);
}

/* ========================================== */
/* GRID CARD (bydrive layout, yacht adapted)   */
/* ========================================== */
.ccg {
  display: flex;
  flex-direction: column;
  gap: 12px;
  background: var(--color-misana-paper);
  border: 1px solid var(--color-misana-line);
  border-radius: 6px;
  padding: 10px;
  text-decoration: none;
  color: var(--color-misana-ink);
  overflow: hidden;
  transition: border-color 0.4s ease, box-shadow 0.4s ease;
}
@media (min-width: 768px) {
  .ccg { gap: 24px; padding: 24px; }
}
.ccg:hover {
  border-color: var(--color-misana-ink);
  box-shadow: 0 12px 28px -20px rgba(0, 0, 0, 0.18);
}
.ccg-image-wrap {
  position: relative;
  width: 100%;
  height: 130px;
  overflow: hidden;
  border-radius: 4px;
  background: var(--color-misana-paper);
}
@media (min-width: 768px) {
  .ccg-image-wrap { height: 216px; }
}
.ccg-image {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 1.1s cubic-bezier(0.16, 1, 0.3, 1);
}
.ccg:hover .ccg-image { transform: scale(1.04); }
.ccg-badge {
  position: absolute;
  top: 12px;
  left: 12px;
  font-size: 0.6rem;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  padding: 0.35rem 0.7rem;
  background: var(--color-misana-paper);
  color: var(--color-misana-ink);
  border-radius: 4px;
}
.ccg-title-wrap {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  width: 100%;
}
@media (max-width: 767px) {
  .ccg-title-wrap { gap: 0; }
}
.ccg-logo {
  flex: 0 0 auto;
  width: 46px;
  height: 46px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 1px solid var(--color-misana-line);
  border-radius: 4px;
  font-family: var(--font-display, serif);
  font-size: 1.1rem;
  color: var(--color-misana-ink);
  background: var(--color-misana-paper);
}
@media (max-width: 767px) {
  .ccg-logo { display: none; }
}
.ccg-title-block { flex: 1 0 0; min-width: 0; display: flex; flex-direction: column; gap: 2px; }
.ccg-title {
  font-family: var(--font-display, serif);
  font-size: 0.92rem;
  font-weight: 500;
  line-height: 1.2;
  margin: 0;
  color: var(--color-misana-ink);
  word-break: break-word;
}
@media (min-width: 768px) {
  .ccg-title { font-size: 1.05rem; line-height: 1.25; }
}
.ccg-details {
  margin: 4px 0 0;
  font-size: 0.7rem;
  color: var(--color-misana-muted);
  display: inline-flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 6px;
}
@media (min-width: 768px) {
  .ccg-details { font-size: 0.78rem; gap: 8px; }
}
.ccg-dot {
  width: 3px;
  height: 3px;
  border-radius: 99px;
  background: currentColor;
  opacity: 0.55;
}
.ccg-price-wrap {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  width: 100%;
}
.ccg-tag {
  font-size: 0.78rem;
  color: var(--color-misana-ink);
  padding: 5px 14px;
  background: var(--color-misana-paper);
  border: 1px solid var(--color-misana-line);
  border-radius: 4px;
  white-space: nowrap;
}
@media (max-width: 767px) {
  .ccg-tag { display: none; }
}
.ccg-price {
  display: inline-flex;
  align-items: baseline;
  gap: 6px;
  padding-left: 0;
  white-space: nowrap;
}
@media (min-width: 768px) {
  .ccg-price { padding-left: 24px; }
}
.ccg-price-from {
  font-family: var(--font-display, serif);
  font-style: italic;
  font-size: 0.8rem;
  color: var(--color-misana-muted);
}
.ccg-price-value {
  font-family: var(--font-display, serif);
  font-size: 1.05rem;
  line-height: 1;
  color: var(--color-misana-ink);
}
@media (min-width: 768px) {
  .ccg-price-value { font-size: 1.4rem; }
}
.ccg-price-unit {
  font-size: 0.7rem;
  color: var(--color-misana-muted);
}
@media (min-width: 768px) {
  .ccg-price-unit { font-size: 0.78rem; }
}

/* ========================================== */
/* LIST CARD (bydrive dealer-cars-list 1:1)    */
/* ========================================== */
.ccl {
  display: flex;
  flex-direction: row;
  align-items: stretch;
  gap: 32px;
  background: var(--color-misana-paper);
  border: 1px solid var(--color-misana-line);
  border-radius: 6px;
  padding: 24px;
  text-decoration: none;
  color: var(--color-misana-ink);
  overflow: hidden;
  transition: border-color 0.4s ease, box-shadow 0.4s ease;
}
.ccl:hover {
  border-color: var(--color-misana-ink);
  box-shadow: 0 14px 32px -22px rgba(0, 0, 0, 0.18);
}
.ccl-image-wrap {
  position: relative;
  flex: 0 0 256px;
  width: 256px;
  align-self: stretch;
  min-height: 200px;
  overflow: hidden;
  border-radius: 4px;
  background: var(--color-misana-paper);
}
.ccl-image {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 1.1s cubic-bezier(0.16, 1, 0.3, 1);
}
.ccl:hover .ccl-image { transform: scale(1.04); }
.ccl-badge {
  position: absolute;
  top: 12px;
  left: 12px;
  font-size: 0.6rem;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  padding: 0.35rem 0.7rem;
  background: var(--color-misana-paper);
  color: var(--color-misana-ink);
  border-radius: 4px;
}
.ccl-desc {
  flex: 1 0 0;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 20px;
  position: relative;
}
.ccl-title-row {
  display: flex;
  align-items: center;
  gap: 14px;
  width: 100%;
  position: relative;
  padding-right: 140px;
}
.ccl-logo {
  flex: 0 0 auto;
  width: 46px;
  height: 46px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 1px solid var(--color-misana-line);
  border-radius: 4px;
  font-family: var(--font-display, serif);
  font-size: 1.1rem;
  color: var(--color-misana-ink);
  background: var(--color-misana-paper);
}
.ccl-title-block {
  flex: 1 0 0;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.ccl-title {
  font-family: var(--font-display, serif);
  font-size: 1.25rem;
  font-weight: 500;
  line-height: 1.2;
  margin: 0;
  color: var(--color-misana-ink);
  word-break: break-word;
}
.ccl-subtitle {
  margin: 4px 0 0;
  font-size: 0.78rem;
  color: var(--color-misana-muted);
  display: inline-flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
}
.ccl-dot {
  width: 3px;
  height: 3px;
  border-radius: 99px;
  background: currentColor;
  opacity: 0.55;
}
.ccl-price-block {
  position: absolute;
  top: 0;
  right: 0;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 2px;
}
.ccl-price {
  margin: 0;
  font-family: var(--font-display, serif);
  font-size: 1.5rem;
  line-height: 1.1;
  color: var(--color-misana-ink);
  white-space: nowrap;
}
.ccl-price-label {
  margin: 0;
  font-size: 0.78rem;
  color: var(--color-misana-muted);
}

/* Tarifs : 3 tiers (journee + semaine basse + semaine haute) */
.ccl-tiers {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0;
  width: 100%;
  border-top: 1px solid var(--color-misana-line);
  border-bottom: 1px solid var(--color-misana-line);
}
.ccl-tier {
  padding: 14px 18px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.ccl-tier + .ccl-tier { border-left: 1px solid var(--color-misana-line); }
.ccl-tier-key {
  margin: 0;
  font-size: 0.7rem;
  letter-spacing: 0.04em;
  color: var(--color-misana-muted);
}
.ccl-tier-val {
  margin: 0;
  font-family: var(--font-display, serif);
  font-size: 1.05rem;
  color: var(--color-misana-ink);
  display: inline-flex;
  align-items: baseline;
  gap: 4px;
  white-space: nowrap;
}
.ccl-tier-val small {
  font-family: var(--font-sans, inherit);
  font-size: 0.7rem;
  color: var(--color-misana-muted);
}
.ccl-tier-best {
  background: var(--color-misana-paper);
  position: relative;
}
.ccl-tier-best::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: var(--color-misana-ink);
}
.ccl-tier-best .ccl-tier-val { font-weight: 600; }

/* Conditions yacht-specifiques : 4 items inline */
.ccl-conds {
  display: flex;
  flex-direction: row;
  align-items: center;
  flex-wrap: wrap;
  gap: 0;
  width: 100%;
}
.ccl-cond {
  display: inline-flex;
  align-items: baseline;
  gap: 6px;
  padding: 0 18px;
  white-space: nowrap;
}
.ccl-cond:first-child { padding-left: 0; }
.ccl-cond + .ccl-cond { border-left: 1px solid var(--color-misana-line); }
.ccl-cond-key {
  font-size: 0.72rem;
  color: var(--color-misana-muted);
}
.ccl-cond-val {
  font-size: 0.78rem;
  font-weight: 600;
  color: var(--color-misana-ink);
}

@media (max-width: 1023px) {
  .ccl {
    flex-direction: column;
    gap: 20px;
  }
  .ccl-image-wrap {
    flex: none;
    width: 100%;
    height: 200px;
    align-self: auto;
  }
  .ccl-title-row { padding-right: 0; }
  .ccl-price-block {
    position: relative;
    top: auto;
    right: auto;
    align-items: flex-start;
  }
  .ccl-conds {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
  .ccl-cond {
    padding: 0;
    border-left: 0 !important;
  }
}
@media (max-width: 639px) {
  .ccl-tiers { grid-template-columns: 1fr; }
  .ccl-tier + .ccl-tier {
    border-left: 0;
    border-top: 1px solid var(--color-misana-line);
  }
}
</style>
