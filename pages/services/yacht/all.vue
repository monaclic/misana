<script setup lang="ts">
// Hub catalog yacht. Sidebar filtres ultra complet : taille, builder, guests,
// cabines, equipage, prix semaine, annee, amenities (14), zones de croisiere,
// ports de depart. Multi-select sur tous les axes, layout 2 colonnes.
import {
  YACHTS,
  YACHT_PRICE_BUCKETS,
  YACHT_DAILY_BUCKETS,
  YACHT_AMENITY_LABELS,
  YACHT_TYPE_LABELS,
  yachtBuilders,
  type YachtAmenity,
  type YachtType,
} from '~/lib/yachts';
import { YACHT_SIZES, type YachtSize } from '~/types/request';
import { CITIES } from '~/lib/constants';

definePageMeta({ layout: 'default' });

const route = useRoute();
const router = useRouter();
const { locale, t } = useI18n();
const localePath = useLocalePath();

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
fBuilder.value = asArray(route.query.builder, yachtBuilders() as readonly string[]) as string[];
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

const builders = yachtBuilders();

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
  for (const y of YACHTS) for (const p of y.ports) set.add(p);
  return Array.from(set).map((slug) => CITIES.find((c) => c.slug === slug)).filter(Boolean) as typeof CITIES[number][];
});

const visibleYachts = computed(() => {
  return YACHTS.filter((y) => {
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

const filterCount = computed(() =>
  fType.value.length + fSize.value.length + fBuilder.value.length + fGuestsBucket.value.length +
  fCabinsBucket.value.length + fCrewBucket.value.length + fDailyBucket.value.length +
  fPriceBucket.value.length + fYear.value.length + fAmenities.value.length +
  fCruising.value.length + fPort.value.length,
);

function clearFilters() {
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
</script>

<template>
  <main class="min-h-screen">
    <section class="bg-misana-stone border-b border-misana-line">
      <div class="max-w-5xl mx-auto px-6 py-16 sm:py-24">
        <p class="text-xs uppercase tracking-widest text-misana-muted mb-4">{{ t('yacht.kicker') }}</p>
        <h1 class="font-display text-4xl sm:text-5xl mb-4">{{ t('yacht.hubTitle') }}</h1>
        <p class="text-misana-muted text-lg max-w-2xl">{{ t('yacht.hubLead') }}</p>
      </div>
    </section>

    <section class="max-w-7xl mx-auto px-6 py-12">
      <div class="grid lg:grid-cols-12 gap-8">
        <!-- Mobile drawer overlay -->
        <div
          v-if="showFilters"
          class="lg:hidden fixed inset-0 z-50 bg-black/40"
          @click="showFilters = false"
        ></div>

        <!-- Sidebar filters (mobile drawer + desktop sticky) -->
        <aside
          class="lg:col-span-3 lg:sticky lg:top-24 lg:self-start"
          :class="showFilters ? 'fixed inset-y-0 left-0 z-50 w-80 max-w-[85vw] bg-misana-paper overflow-y-auto lg:static lg:w-auto lg:max-w-none lg:bg-transparent lg:overflow-visible' : 'hidden lg:block'"
        >
          <div class="lg:border lg:border-misana-line h-full lg:h-auto">
            <div class="flex items-center justify-between px-4 py-3 border-b border-misana-line">
              <p class="text-xs uppercase tracking-widest">{{ t('yacht.filters') }}</p>
              <div class="flex items-center gap-3">
                <button
                  v-if="filterCount"
                  type="button"
                  class="text-[10px] uppercase tracking-widest underline underline-offset-4 text-misana-muted hover:text-misana-ink"
                  @click="clearFilters"
                >{{ t('yacht.clearFilters') }}</button>
                <button
                  type="button"
                  class="lg:hidden text-misana-muted hover:text-misana-ink text-lg"
                  aria-label="Close filters"
                  @click="showFilters = false"
                >✕</button>
              </div>
            </div>

            <div class="divide-y divide-misana-line max-h-[70vh] lg:max-h-[calc(100vh-12rem)] overflow-y-auto">
              <!-- Type -->
              <div class="p-4">
                <p class="text-[10px] uppercase tracking-widest text-misana-muted mb-3">{{ t('yacht.filterType') }}</p>
                <ul class="space-y-2">
                  <li v-for="ty in TYPE_OPTIONS" :key="ty">
                    <label class="flex items-center gap-2 text-xs cursor-pointer">
                      <input type="checkbox" v-model="fType" :value="ty" class="accent-misana-ink" />
                      <span>{{ locale === 'fr' ? YACHT_TYPE_LABELS[ty].fr : YACHT_TYPE_LABELS[ty].en }}</span>
                    </label>
                  </li>
                </ul>
              </div>

              <!-- Daily rate -->
              <div class="p-4">
                <p class="text-[10px] uppercase tracking-widest text-misana-muted mb-3">{{ t('yacht.filterDailyPrice') }}</p>
                <ul class="space-y-2">
                  <li v-for="bucket in YACHT_DAILY_BUCKETS" :key="bucket.id">
                    <label class="flex items-center gap-2 text-xs cursor-pointer">
                      <input type="checkbox" v-model="fDailyBucket" :value="bucket.id" class="accent-misana-ink" />
                      <span>{{ bucket.label }}</span>
                    </label>
                  </li>
                </ul>
              </div>

              <!-- Size -->
              <div class="p-4">
                <p class="text-[10px] uppercase tracking-widest text-misana-muted mb-3">{{ t('yacht.filterSize') }}</p>
                <ul class="space-y-2">
                  <li v-for="s in YACHT_SIZES" :key="s">
                    <label class="flex items-center gap-2 text-xs cursor-pointer">
                      <input type="checkbox" v-model="fSize" :value="s" class="accent-misana-ink" />
                      <span>{{ s }}</span>
                    </label>
                  </li>
                </ul>
              </div>

              <!-- Builder -->
              <div class="p-4">
                <p class="text-[10px] uppercase tracking-widest text-misana-muted mb-3">{{ t('yacht.filterBuilder') }}</p>
                <ul class="space-y-2">
                  <li v-for="b in builders" :key="b">
                    <label class="flex items-center gap-2 text-xs cursor-pointer">
                      <input type="checkbox" v-model="fBuilder" :value="b" class="accent-misana-ink" />
                      <span>{{ b }}</span>
                    </label>
                  </li>
                </ul>
              </div>

              <!-- Guests -->
              <div class="p-4">
                <p class="text-[10px] uppercase tracking-widest text-misana-muted mb-3">{{ t('yacht.filterGuests') }}</p>
                <ul class="space-y-2">
                  <li v-for="b in GUEST_BUCKETS" :key="b.id">
                    <label class="flex items-center gap-2 text-xs cursor-pointer">
                      <input type="checkbox" v-model="fGuestsBucket" :value="b.id" class="accent-misana-ink" />
                      <span>{{ b.label }}</span>
                    </label>
                  </li>
                </ul>
              </div>

              <!-- Cabins -->
              <div class="p-4">
                <p class="text-[10px] uppercase tracking-widest text-misana-muted mb-3">{{ t('yacht.filterCabins') }}</p>
                <ul class="space-y-2">
                  <li v-for="b in CABIN_BUCKETS" :key="b.id">
                    <label class="flex items-center gap-2 text-xs cursor-pointer">
                      <input type="checkbox" v-model="fCabinsBucket" :value="b.id" class="accent-misana-ink" />
                      <span>{{ b.label }}</span>
                    </label>
                  </li>
                </ul>
              </div>

              <!-- Crew -->
              <div class="p-4">
                <p class="text-[10px] uppercase tracking-widest text-misana-muted mb-3">{{ t('yacht.filterCrew') }}</p>
                <ul class="space-y-2">
                  <li v-for="b in CREW_BUCKETS" :key="b.id">
                    <label class="flex items-center gap-2 text-xs cursor-pointer">
                      <input type="checkbox" v-model="fCrewBucket" :value="b.id" class="accent-misana-ink" />
                      <span>{{ b.label }}</span>
                    </label>
                  </li>
                </ul>
              </div>

              <!-- Weekly rate -->
              <div class="p-4">
                <p class="text-[10px] uppercase tracking-widest text-misana-muted mb-3">{{ t('yacht.filterPrice') }}</p>
                <ul class="space-y-2">
                  <li v-for="bucket in YACHT_PRICE_BUCKETS" :key="bucket.id">
                    <label class="flex items-center gap-2 text-xs cursor-pointer">
                      <input type="checkbox" v-model="fPriceBucket" :value="bucket.id" class="accent-misana-ink" />
                      <span>{{ bucket.label }}</span>
                    </label>
                  </li>
                </ul>
              </div>

              <!-- Year -->
              <div class="p-4">
                <p class="text-[10px] uppercase tracking-widest text-misana-muted mb-3">{{ t('yacht.filterYear') }}</p>
                <ul class="space-y-2">
                  <li v-for="y in YEAR_BUCKETS" :key="y.id">
                    <label class="flex items-center gap-2 text-xs cursor-pointer">
                      <input type="checkbox" v-model="fYear" :value="y.id" class="accent-misana-ink" />
                      <span>{{ y.label }}</span>
                    </label>
                  </li>
                </ul>
              </div>

              <!-- Amenities -->
              <div class="p-4">
                <p class="text-[10px] uppercase tracking-widest text-misana-muted mb-3">{{ t('yacht.filterAmenities') }}</p>
                <ul class="space-y-2">
                  <li v-for="a in ALL_AMENITIES" :key="a">
                    <label class="flex items-center gap-2 text-xs cursor-pointer">
                      <input type="checkbox" v-model="fAmenities" :value="a" class="accent-misana-ink" />
                      <span>{{ locale === 'fr' ? YACHT_AMENITY_LABELS[a].fr : YACHT_AMENITY_LABELS[a].en }}</span>
                    </label>
                  </li>
                </ul>
              </div>

              <!-- Cruising areas -->
              <div class="p-4">
                <p class="text-[10px] uppercase tracking-widest text-misana-muted mb-3">{{ t('yacht.filterCruising') }}</p>
                <ul class="space-y-2">
                  <li v-for="area in CRUISING_AREAS" :key="area">
                    <label class="flex items-center gap-2 text-xs cursor-pointer">
                      <input type="checkbox" v-model="fCruising" :value="area" class="accent-misana-ink" />
                      <span>{{ t(`yacht.fiche.cruisingArea.${area}`) }}</span>
                    </label>
                  </li>
                </ul>
              </div>

              <!-- Ports -->
              <div class="p-4">
                <p class="text-[10px] uppercase tracking-widest text-misana-muted mb-3">{{ t('yacht.filterPort') }}</p>
                <ul class="space-y-2">
                  <li v-for="p in portsAvailable" :key="p.slug">
                    <label class="flex items-center gap-2 text-xs cursor-pointer">
                      <input type="checkbox" v-model="fPort" :value="p.slug" class="accent-misana-ink" />
                      <span>{{ locale === 'fr' ? p.fr : p.en }}</span>
                    </label>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </aside>

        <!-- Results -->
        <div class="lg:col-span-9">
          <div class="flex items-center justify-between mb-6 text-xs text-misana-muted">
            <p>
              {{ visibleYachts.length }} {{ t('yacht.results', { n: visibleYachts.length }) }}
              <span v-if="filterCount" class="ml-2">· {{ filterCount }} {{ t('yacht.filtersActive') }}</span>
            </p>
            <button
              type="button"
              class="lg:hidden border border-misana-line px-3 py-1.5 hover:border-misana-ink transition"
              @click="showFilters = !showFilters"
            >{{ showFilters ? t('yacht.hideFilters') : t('yacht.showFilters') }}</button>
          </div>

          <div v-if="visibleYachts.length" class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
            <NuxtLink
              v-for="y in visibleYachts"
              :key="y.id"
              :to="localePath(`/services/yacht/${y.id}`)"
              class="group ring-1 ring-misana-line hover:ring-misana-ink transition overflow-hidden bg-misana-paper flex flex-col"
            >
              <div class="aspect-[4/3] relative overflow-hidden bg-misana-stone">
                <img :src="y.hero" :alt="y.fullName" loading="lazy" class="absolute inset-0 w-full h-full object-cover transition duration-700 group-hover:scale-[1.02]" />
                <span v-if="y.badge" class="absolute top-3 left-3 text-[10px] uppercase tracking-widest px-2 py-1 bg-misana-paper text-misana-ink">{{ t(`request.fleet.badge.${y.badge}`) }}</span>
                <span class="absolute top-3 right-3 text-[10px] uppercase tracking-widest px-2 py-1 bg-misana-ink/80 text-misana-paper">{{ locale === 'fr' ? YACHT_TYPE_LABELS[y.type].fr : YACHT_TYPE_LABELS[y.type].en }}</span>
              </div>
              <div class="p-5 flex-1 flex flex-col">
                <p class="text-[10px] uppercase tracking-widest text-misana-muted mb-1">{{ y.builder }} · {{ y.lengthM }} m · {{ y.year }}</p>
                <p class="text-sm font-medium leading-tight">{{ y.name }}</p>
                <p class="text-xs text-misana-muted mt-1">{{ locale === 'fr' ? y.descFr : y.desc }}</p>
                <div class="flex items-baseline justify-between mt-4 text-xs text-misana-muted">
                  <span>{{ y.guests }} {{ t('yacht.guests') }} · {{ y.cabins }} {{ t('yacht.cabinsShort') }}</span>
                  <span class="text-misana-ink whitespace-nowrap text-right">
                    <span v-if="y.pricePerDay" class="block">
                      <span class="text-misana-muted">{{ t('yacht.from') }} </span>
                      {{ fmtPrice(y.pricePerDay) }} / {{ t('yacht.day') }}
                    </span>
                    <span v-else class="block">
                      <span class="text-misana-muted">{{ t('yacht.from') }} </span>
                      {{ fmtPrice(y.pricePerWeekFrom) }} / {{ t('yacht.week') }}
                    </span>
                  </span>
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

    <!-- Body éditorial dynamique selon filtres -->
    <section class="bg-misana-stone border-t border-misana-line">
      <div class="max-w-3xl mx-auto px-6 py-16">
        <p class="text-misana-muted leading-relaxed">{{ editorialBody }}</p>
      </div>
    </section>
  </main>
</template>
