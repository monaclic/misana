<script setup lang="ts">
// Hub catalog cars : 12 voitures Excellence Riviera, sidebar filtres ultra
// complet (categorie, marque, prix, annee, transmission, carburant, places,
// ville disponibilite). Multi-select sur tous les axes, layout 2 colonnes.
import {
  RENTAL_PRICE_BUCKETS,
  type RentalCar,
  type RentalCarCategory,
} from '~/lib/rentalCars';
import { useRentalCars, useRentalCarCategories } from '~/composables/useRentalCars';
import { CITIES } from '~/lib/constants';

definePageMeta({ layout: 'default' });
defineI18nRoute({
  paths: { en: '/car-rental/all', fr: '/location-voiture/all' },
});

const { cars: RENTAL_CARS_REF } = useRentalCars();
const { categories: RENTAL_CATEGORIES_REF } = useRentalCarCategories();


const route = useRoute();
const router = useRouter();
const { locale, t } = useI18n();
const localePath = useLocalePath();

// Listing : on cache CTA header + sticky bottom bar pour ne pas surcharger
// l'experience filtres/grid. Utilisateur peut faire une demande via les
// cards individuelles ou en cliquant sur une fiche.
const stickyContactVisible = useState<boolean>('sticky-contact-visible', () => true);
const isLgUp = ref(false);
const isMdUp = ref(false);
let lgMq: MediaQueryList | null = null;
let mdMq: MediaQueryList | null = null;
function syncLg() { isLgUp.value = lgMq?.matches ?? false; }
function syncMd() { isMdUp.value = mdMq?.matches ?? false; }
// Mobile : on force grid view (pas de list view), card en 2 cols.
const effectiveView = computed(() => (isMdUp.value ? view.value : 'grid'));
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

function asArray<T extends string>(v: unknown, allowed: readonly T[]): T[] {
  if (!v) return [];
  const list = Array.isArray(v) ? v : String(v).split(',');
  return list.map((x) => String(x).trim()).filter((x): x is T => (allowed as readonly string[]).includes(x));
}

const VALID_CATEGORIES: RentalCarCategory[] = ['sport', 'supercar', 'suv', 'convertible'];
const brands = computed(() => Array.from(new Set(RENTAL_CARS_REF.value.map((c) => c.brand))).sort());
const brandSlugs = brands.value.map((b) => b.toLowerCase().replace(/\s+/g, '-'));

// brand slug → canonical brand name
function brandFromSlug(slug: string): string | undefined {
  return brands.value.find((b) => b.toLowerCase().replace(/\s+/g, '-') === slug);
}

const initialBrandSlugs = asArray(route.query.brand, brandSlugs);
const initialBrands = initialBrandSlugs.map(brandFromSlug).filter(Boolean) as string[];

// Multi-select filters initialised from URL query
const fCategory = ref<RentalCarCategory[]>(asArray(route.query.category, VALID_CATEGORIES));
const fBrand = ref<string[]>(initialBrands);
const fPriceBucket = ref<string[]>([]);
const fFuel = ref<('gasoline' | 'hybrid')[]>([]);
const fSeats = ref<string[]>([]);
const fYear = ref<string[]>([]);
const showFilters = ref(false);

// On n'affiche que les categories effectivement utilisees (catalogue fige V1)
const availableCategories = computed(() => {
  const used = new Set(RENTAL_CARS_REF.value.map((c) => c.category));
  return RENTAL_CATEGORIES_REF.value.filter((c) => used.has(c.id as RentalCarCategory));
});

// Recherche full-text : marque, modele, categorie, transmission, carburant,
// annee et noms de villes (FR + EN). Multi-mots = AND. Persistance ?q=
const fSearch = ref<string>(typeof route.query.q === 'string' ? route.query.q : '');
function syncSearch() {
  const q: Record<string, string> = { ...route.query } as Record<string, string>;
  if (fSearch.value.trim()) q.q = fSearch.value.trim();
  else delete q.q;
  router.replace({ path: route.path, query: q });
}
watch(fSearch, syncSearch);

function carHaystack(c: RentalCar): string {
  const cat = RENTAL_CATEGORIES_REF.value.find((x) => x.id === c.category);
  const cityNames = c.availableCities.flatMap((slug) => {
    const city = CITIES.find((x) => x.slug === slug);
    return city ? [city.fr, city.en] : [];
  });
  return [
    c.fullName, c.brand, c.model, c.category,
    c.fuelType, c.transmission, String(c.year),
    cat?.label, cat?.labelFr,
    ...cityNames,
  ].filter(Boolean).join(' ').toLowerCase();
}
function matchSearch(c: RentalCar, terms: string[]): boolean {
  if (!terms.length) return true;
  const hay = carHaystack(c);
  return terms.every((t) => hay.includes(t));
}

// Vue list ou grid. URL = etat. Defaut = grid (cards compactes type bydrive).
const VALID_VIEWS = ['grid', 'list'] as const;
type ViewMode = typeof VALID_VIEWS[number];
const initialView: ViewMode = (typeof route.query.view === 'string' && (VALID_VIEWS as readonly string[]).includes(route.query.view))
  ? (route.query.view as ViewMode)
  : 'grid';
const view = ref<ViewMode>(initialView);
function setView(v: ViewMode) {
  view.value = v;
  const q: Record<string, string> = { ...route.query } as Record<string, string>;
  if (v === 'grid') delete q.view; else q.view = v;
  router.replace({ path: route.path, query: q });
}

// Tri (URL-based) - cheapest first par defaut sur cars (intent location)
const VALID_SORTS = ['default', 'price-asc', 'price-desc', 'year-desc', 'power-desc', 'speed-desc'] as const;
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

function brandInitial(brand: string): string {
  return brand.charAt(0).toUpperCase();
}
function categoryLabel(cat: RentalCarCategory): string {
  const c = RENTAL_CATEGORIES_REF.value.find((x) => x.id === cat);
  if (!c) return cat;
  return locale.value === 'fr' ? c.labelFr : c.label;
}

function citiesLabel(cities: string[]): string {
  if (cities.length >= 8) return locale.value === 'fr' ? 'Toute la côte' : 'Whole coast';
  const names = cities.map((slug) => {
    const c = CITIES.find((x) => x.slug === slug);
    return c ? (locale.value === 'fr' ? c.fr : c.en) : slug;
  });
  if (names.length <= 3) return names.join(', ');
  return `${names.slice(0, 2).join(', ')} +${names.length - 2}`;
}

function syncQuery() {
  const q: Record<string, string> = { ...route.query } as Record<string, string>;
  delete q.category; delete q.brand;
  if (fCategory.value.length) q.category = fCategory.value.join(',');
  if (fBrand.value.length) {
    q.brand = fBrand.value.map((b) => b.toLowerCase().replace(/\s+/g, '-')).join(',');
  }
  router.replace({ path: route.path, query: q });
}
watch([fCategory, fBrand], syncQuery, { deep: true });

const editorialBody = computed(() => {
  const isFr = locale.value === 'fr';
  if (fCategory.value.length === 1) {
    const c = fCategory.value[0];
    if (c === 'supercar') return isFr
      ? `Ferrari, Lamborghini, McLaren. Les voitures qui closent tout débat. Carbone, huit cents chevaux, trois cents kilomètres heure. Notre flotte supercar couvre la 812 Superfast, la SF90, la F8, la Roma, la Huracan, la Revuelto, l'Artura. Caution de 24 à 50 k€, âge minimum 30 ans, durée minimum 3 jours, kilométrage inclus 150 km/jour. Livraison en main propre à Cannes, Monaco, Saint-Tropez, Nice.`
      : `Ferrari, Lamborghini, McLaren. The cars that close any debate. Carbon, eight hundred horsepower, three hundred kilometres an hour. Our supercar fleet covers the 812 Superfast, SF90, F8, Roma, Huracan, Revuelto, Artura. Deposit €24-50k, minimum age 30, minimum duration 3 days, included mileage 150 km/day. Hand-delivered in Cannes, Monaco, Saint-Tropez, Nice.`;
    if (c === 'sport') return isFr
      ? `Berlines de performance et grands tourismes. Audi RS6, Mercedes AMG GT, Porsche 911 Turbo S, Aston Martin DB12 Volante. Le bon équilibre entre puissance et confort pour la semaine sur la côte. Cinq places, 600 chevaux, transmission automatique, livraison à votre hôtel ou votre villa.`
      : `Performance saloons and grand tourers. Audi RS6, Mercedes AMG GT, Porsche 911 Turbo S, Aston Martin DB12 Volante. The right balance of power and comfort for the week along the coast. Five seats, 600 horsepower, automatic transmission, delivered to your hotel or villa.`;
    if (c === 'suv') return isFr
      ? `Le SUV terrain quand la côte grimpe. Range Rover Vogue, Cayenne Turbo, Bentayga, Cullinan, Urus, Mercedes G63. Six places, garde au sol pour la route du Cap-Ferrat, coffre pour les bagages d'une famille en transit aéroport-villa.`
      : `The terrain SUV when the coast climbs. Range Rover Vogue, Cayenne Turbo, Bentayga, Cullinan, Urus, Mercedes G63. Six seats, ground clearance for the Cap-Ferrat road, boot space for a family in airport-to-villa transit.`;
    if (c === 'convertible') return isFr
      ? `Cabriolets et roadsters pour la côte en été. Mercedes SL 63, Bentley Continental GTC, Ferrari Roma Spider, Rolls-Royce Dawn, Aston Martin DB12 Volante. Le vent sur la Croisette, le soleil sur le Cap, la conduite ouverte de Saint-Tropez à Menton.`
      : `Convertibles and roadsters for the coast in summer. Mercedes SL 63, Bentley Continental GTC, Ferrari Roma Spider, Rolls-Royce Dawn, Aston Martin DB12 Volante. The wind on the Croisette, the sun on the Cap, the open drive from Saint-Tropez to Menton.`;
  }
  if (fBrand.value.length === 1) {
    const b = fBrand.value[0];
    return isFr
      ? `${b} sur la Côte d'Azur : sélection Misana de la flotte ${b} disponible à la location, livrée en main propre à Cannes, Monaco, Saint-Tropez, Nice. Conditions standard : âge minimum 30 ans, caution selon modèle, kilométrage inclus 150 km par jour, assurance comprise. Conciergerie Misana 24 heures pendant la location.`
      : `${b} on the French Riviera : Misana selection of the ${b} fleet available for rent, hand-delivered in Cannes, Monaco, Saint-Tropez, Nice. Standard conditions : minimum age 30, deposit per model, included mileage 150 km per day, insurance covered. Misana 24-hour concierge during the rental.`;
  }
  return isFr
    ? `Trente-sept voitures couvrant cinq catégories (supercar, sport, SUV, berline, cabriolet) et huit marques (Ferrari, Lamborghini, Porsche, Bentley, Rolls-Royce, Mercedes, Audi, Aston Martin). Tarif journalier de 700 € à 4 500 €. Livraison à Cannes, Monaco, Saint-Tropez, Nice, Cap-Ferrat, Cap-d'Antibes, Èze, Menton. Assurance incluse, conciergerie 24 heures.`
    : `Thirty-seven cars covering five categories (supercar, sport, SUV, sedan, convertible) and eight brands (Ferrari, Lamborghini, Porsche, Bentley, Rolls-Royce, Mercedes, Audi, Aston Martin). Daily rate from €700 to €4,500. Delivery in Cannes, Monaco, Saint-Tropez, Nice, Cap-Ferrat, Cap-d'Antibes, Èze, Menton. Insurance included, 24-hour concierge.`;
});

const dynamicTitle = computed(() => {
  const parts: string[] = [];
  if (fBrand.value.length === 1) parts.push(fBrand.value[0]!);
  if (fCategory.value.length === 1) {
    const cat = RENTAL_CATEGORIES_REF.value.find((c) => c.id === fCategory.value[0]);
    if (cat) parts.push(locale.value === 'fr' ? cat.labelFr : cat.label);
  }
  const base = locale.value === 'fr' ? 'Voitures sur la Riviera' : 'Cars on the Riviera';
  return parts.length ? `${parts.join(' · ')} · ${base}` : t('cars.allTitle');
});

useSeoMeta({
  title: () => dynamicTitle.value,
  description: () => t('cars.allDescription'),
});

const SEAT_BUCKETS = [
  { id: '2', label: '2', min: 2, max: 2 },
  { id: '4', label: '4', min: 3, max: 4 },
  { id: '5-plus', label: '5 +', min: 5, max: 9 },
];

const YEAR_BUCKETS = [
  { id: '2024-plus', label: '2024 +', min: 2024, max: 2099 },
  { id: '2022-2023', label: '2022 - 2023', min: 2022, max: 2023 },
  { id: '2020-2021', label: '2020 - 2021', min: 2020, max: 2021 },
];

const fuelOptions: ('gasoline' | 'hybrid')[] = ['gasoline', 'hybrid'];

const filteredCars = computed(() => {
  const terms = fSearch.value.trim().toLowerCase().split(/\s+/).filter(Boolean);
  return RENTAL_CARS_REF.value.filter((c) => {
    if (!matchSearch(c, terms)) return false;
    if (fCategory.value.length && !fCategory.value.includes(c.category)) return false;
    if (fBrand.value.length && !fBrand.value.includes(c.brand)) return false;
    if (fPriceBucket.value.length) {
      const price = c.prices.oneToThreeDays;
      const matched = fPriceBucket.value.some((id) => {
        const b = RENTAL_PRICE_BUCKETS.find((x) => x.id === id);
        return b ? price >= b.min && price <= b.max : false;
      });
      if (!matched) return false;
    }
    if (fFuel.value.length && !fFuel.value.includes(c.fuelType as 'gasoline' | 'hybrid')) return false;
    if (fSeats.value.length) {
      const matched = fSeats.value.some((id) => {
        const b = SEAT_BUCKETS.find((x) => x.id === id);
        return b ? c.pax >= b.min && c.pax <= b.max : false;
      });
      if (!matched) return false;
    }
    if (fYear.value.length) {
      const matched = fYear.value.some((id) => {
        const b = YEAR_BUCKETS.find((x) => x.id === id);
        return b ? c.year >= b.min && c.year <= b.max : false;
      });
      if (!matched) return false;
    }
    return true;
  });
});

const visibleCars = computed(() => {
  const arr = [...filteredCars.value];
  switch (fSort.value) {
    case 'price-asc': return arr.sort((a, b) => a.prices.oneToThreeDays - b.prices.oneToThreeDays);
    case 'price-desc': return arr.sort((a, b) => b.prices.oneToThreeDays - a.prices.oneToThreeDays);
    case 'year-desc': return arr.sort((a, b) => b.year - a.year);
    case 'power-desc': return arr.sort((a, b) => b.hp - a.hp);
    case 'speed-desc': return arr.sort((a, b) => b.topSpeedKmh - a.topSpeedKmh);
    default: return arr;
  }
});

const filterCount = computed(() =>
  fCategory.value.length + fBrand.value.length + fPriceBucket.value.length +
  fFuel.value.length + fSeats.value.length + fYear.value.length,
);

function clearFilters() {
  fSearch.value = '';
  fCategory.value = [];
  fBrand.value = [];
  fPriceBucket.value = [];
  fFuel.value = [];
  fSeats.value = [];
  fYear.value = [];
}

// Toggle d'un filtre tableau : add si absent, remove sinon (immutable).
function toggleFilter<T>(filter: { value: T[] }, value: T) {
  const idx = filter.value.indexOf(value);
  if (idx >= 0) {
    filter.value = filter.value.filter((_, i) => i !== idx);
  } else {
    filter.value = [...filter.value, value];
  }
}

function fmtPrice(p: number): string {
  return new Intl.NumberFormat(locale.value === 'fr' ? 'fr-FR' : 'en-GB', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0,
  }).format(p);
}
</script>

<template>
  <main class="min-h-screen">
    <section class="bg-misana-paper border-b border-misana-line">
      <div class="max-w-[1600px] mx-auto px-6 sm:px-12 py-10 sm:py-24">
        <p class="text-xs uppercase tracking-widest text-misana-muted mb-3 sm:mb-4">{{ t('cars.kicker') }}</p>
        <h1 class="font-display text-3xl sm:text-5xl mb-3 sm:mb-4">{{ t('cars.hubTitle') }}</h1>
        <p class="text-misana-muted text-base sm:text-lg max-w-2xl" data-display>{{ t('cars.hubLead') }}</p>
      </div>
    </section>

    <section class="max-w-[1600px] mx-auto px-4 sm:px-12 py-8 sm:py-16">
      <div class="grid lg:grid-cols-12 gap-10">
        <!-- Backdrop mobile : couvre tout sauf le sheet (Airbnb style) -->
        <Transition name="filters-fade">
          <div
            v-if="showFilters"
            class="lg:hidden fixed inset-0 z-40 bg-black/50"
            @click="showFilters = false"
          ></div>
        </Transition>

        <!-- Aside : sidebar lg+ / bottom sheet mobile (slide-up Airbnb) -->
        <Transition name="filters-sheet">
          <aside
            v-show="showFilters || isLgUp"
            class="filters-aside lg:col-span-3 lg:sticky lg:top-24 lg:self-start"
            :class="showFilters ? 'is-open' : ''"
          >
            <div class="filters-card lg:rounded-md">
              <!-- Header sticky mobile -->
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
                <p class="filters-title">{{ t('cars.filters') }}<span v-if="filterCount" class="filters-badge">{{ filterCount }}</span></p>
                <button
                  v-if="filterCount"
                  type="button"
                  class="filters-clear"
                  @click="clearFilters"
                >{{ t('cars.clearFilters') }}</button>
                <span v-else class="filters-clear-spacer lg:hidden"></span>
              </div>

            <div class="filters-body">
              <!-- Categorie -->
              <section class="filter-section">
                <p class="filter-section-key">{{ t('request.cars.category') }}</p>
                <ul class="filter-list">
                  <li v-for="cat in availableCategories" :key="cat.id">
                    <label class="filter-row">
                      <input type="checkbox" v-model="fCategory" :value="cat.id" class="filter-check" />
                      <span class="filter-label">{{ locale === 'fr' ? cat.labelFr : cat.label }}</span>
                    </label>
                  </li>
                </ul>
              </section>

              <!-- Marque -->
              <section class="filter-section">
                <p class="filter-section-key">{{ t('cars.filterBrand') }}</p>
                <ul class="filter-list">
                  <li v-for="b in brands" :key="b">
                    <label class="filter-row">
                      <input type="checkbox" v-model="fBrand" :value="b" class="filter-check" />
                      <span class="filter-label">{{ b }}</span>
                    </label>
                  </li>
                </ul>
              </section>

              <!-- Tarif journalier -->
              <section class="filter-section">
                <p class="filter-section-key">{{ t('cars.filterPrice') }}</p>
                <ul class="filter-list">
                  <li v-for="bucket in RENTAL_PRICE_BUCKETS" :key="bucket.id">
                    <label class="filter-row">
                      <input type="checkbox" v-model="fPriceBucket" :value="bucket.id" class="filter-check" />
                      <span class="filter-label">{{ bucket.label }}</span>
                    </label>
                  </li>
                </ul>
              </section>

              <!-- Année -->
              <section class="filter-section">
                <p class="filter-section-key">{{ t('cars.filterYear') }}</p>
                <ul class="filter-list">
                  <li v-for="y in YEAR_BUCKETS" :key="y.id">
                    <label class="filter-row">
                      <input type="checkbox" v-model="fYear" :value="y.id" class="filter-check" />
                      <span class="filter-label">{{ y.label }}</span>
                    </label>
                  </li>
                </ul>
              </section>

              <!-- Carburant -->
              <section class="filter-section">
                <p class="filter-section-key">{{ t('cars.fiche.fuel') }}</p>
                <ul class="filter-list">
                  <li v-for="f in fuelOptions" :key="f">
                    <label class="filter-row">
                      <input type="checkbox" v-model="fFuel" :value="f" class="filter-check" />
                      <span class="filter-label">{{ t(`cars.fuel.${f}`) }}</span>
                    </label>
                  </li>
                </ul>
              </section>

              <!-- Places -->
              <section class="filter-section">
                <p class="filter-section-key">{{ t('cars.filterSeats') }}</p>
                <ul class="filter-list">
                  <li v-for="s in SEAT_BUCKETS" :key="s.id">
                    <label class="filter-row">
                      <input type="checkbox" v-model="fSeats" :value="s.id" class="filter-check" />
                      <span class="filter-label">{{ s.label }} {{ t('request.fleet.pax') }}</span>
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
                {{ t('cars.viewResults', { n: visibleCars.length }) }}
              </button>
            </div>
          </div>
          </aside>
        </Transition>

        <!-- Results -->
        <div class="lg:col-span-9">
          <!-- Toolbar editoriale : recherche (gauche) + count + toggle (droite) -->
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
                :placeholder="t('cars.searchPlaceholder')"
                class="search-input"
                :aria-label="t('cars.searchAria')"
              />
              <button
                v-if="fSearch"
                type="button"
                class="search-clear"
                :aria-label="t('cars.searchClear')"
                @click="fSearch = ''"
              >×</button>
            </label>

            <div class="toolbar-meta">
              <!-- Sort select -->
              <div class="toolbar-sort-wrap">
                <select v-model="fSort" class="toolbar-sort" :aria-label="t('cars.sortAria')">
                  <option value="default">{{ t('cars.sortDefault') }}</option>
                  <option value="price-asc">{{ t('cars.sortPriceAsc') }}</option>
                  <option value="price-desc">{{ t('cars.sortPriceDesc') }}</option>
                  <option value="year-desc">{{ t('cars.sortYearDesc') }}</option>
                  <option value="power-desc">{{ t('cars.sortPowerDesc') }}</option>
                  <option value="speed-desc">{{ t('cars.sortSpeedDesc') }}</option>
                </select>
                <span class="toolbar-sort-chevron" aria-hidden="true">
                  <svg viewBox="0 0 12 12" fill="none" class="block w-3 h-3">
                    <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" />
                  </svg>
                </span>
              </div>
              <!-- View toggle grid / list -->
              <div class="view-toggle hidden md:inline-flex" role="tablist" :aria-label="t('cars.viewToggleAria')">
                <button
                  type="button"
                  role="tab"
                  class="view-btn"
                  :class="{ 'view-btn-active': view === 'grid' }"
                  :aria-selected="view === 'grid'"
                  :title="t('cars.viewGrid')"
                  @click="setView('grid')"
                >
                  <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" class="w-4 h-4">
                    <rect x="3.5" y="3.5" width="7" height="7" rx="1" stroke="currentColor" stroke-width="1.4" />
                    <rect x="13.5" y="3.5" width="7" height="7" rx="1" stroke="currentColor" stroke-width="1.4" />
                    <rect x="3.5" y="13.5" width="7" height="7" rx="1" stroke="currentColor" stroke-width="1.4" />
                    <rect x="13.5" y="13.5" width="7" height="7" rx="1" stroke="currentColor" stroke-width="1.4" />
                  </svg>
                  <span>{{ t('cars.viewGrid') }}</span>
                </button>
                <button
                  type="button"
                  role="tab"
                  class="view-btn"
                  :class="{ 'view-btn-active': view === 'list' }"
                  :aria-selected="view === 'list'"
                  :title="t('cars.viewList')"
                  @click="setView('list')"
                >
                  <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" class="w-4 h-4">
                    <rect x="3.5" y="4.5" width="17" height="5" rx="1" stroke="currentColor" stroke-width="1.4" />
                    <rect x="3.5" y="14.5" width="17" height="5" rx="1" stroke="currentColor" stroke-width="1.4" />
                  </svg>
                  <span>{{ t('cars.viewList') }}</span>
                </button>
              </div>
            </div>
          </div>

          <!-- Count : sous le toolbar, sa propre ligne -->
          <p class="toolbar-count">
            {{ visibleCars.length }} {{ t('cars.results', { n: visibleCars.length }) }}
            <span v-if="filterCount" class="toolbar-filter-count">· {{ filterCount }} {{ t('cars.filtersActive') }}</span>
          </p>

          <!-- =========== GRID VIEW (bydrive layout) =========== -->
          <div
            v-if="visibleCars.length && effectiveView === 'grid'"
            class="grid grid-cols-2 gap-3 sm:gap-6"
          >
            <NuxtLink
              v-for="car in visibleCars"
              :key="car.id"
              :to="localePath({ name: 'cars-brandModel', params: { brandModel: car.id } })"
              class="ccg group"
            >
              <div class="ccg-image-wrap">
                <img :src="car.hero" :alt="car.fullName" loading="lazy" class="ccg-image" />
                <!-- badge masque (UX cleanup) -->
                <span v-if="false" class="ccg-badge">{{ t(`cars.badge.${car.badge}`) }}</span>
                <span class="card-cue" aria-hidden="true">
                  <svg viewBox="0 0 20 20" fill="none" class="block w-5 h-5">
                    <path d="M6 14L14 6" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" />
                    <path d="M7 6H14V13" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" />
                  </svg>
                </span>
              </div>

              <div class="ccg-title-wrap">
                <span class="ccg-logo" aria-hidden="true">{{ brandInitial(car.brand) }}</span>
                <div class="ccg-title-block">
                  <h3 class="ccg-title">{{ car.fullName }}</h3>
                  <p class="ccg-details">
                    <span>{{ car.year }}</span>
                    <span class="ccg-dot" aria-hidden="true"></span>
                    <span>{{ car.hp }} ch</span>
                    <span class="ccg-dot" aria-hidden="true"></span>
                    <span>{{ car.topSpeedKmh }} km/h</span>
                  </p>
                </div>
              </div>

              <div class="ccg-price-wrap">
                <span class="ccg-tag">{{ car.pax }} {{ t('request.fleet.pax') }}</span>
                <div class="ccg-price">
                  <span class="ccg-price-value">{{ fmtPrice(car.prices.oneToThreeDays) }}</span>
                  <span class="ccg-price-unit">{{ t('cars.perDayShort') }}</span>
                </div>
              </div>
            </NuxtLink>
          </div>

          <!-- =========== LIST VIEW (bydrive dealer-cars-list 1:1) =========== -->
          <div v-else-if="visibleCars.length && effectiveView === 'list'" class="flex flex-col gap-5">
            <NuxtLink
              v-for="car in visibleCars"
              :key="car.id"
              :to="localePath({ name: 'cars-brandModel', params: { brandModel: car.id } })"
              class="ccl group"
            >
              <!-- Image wrap : 256px wide stretch, hover icon bottom-right -->
              <div class="ccl-image-wrap">
                <img :src="car.hero" :alt="car.fullName" loading="lazy" class="ccl-image" />
                <!-- badge masque (UX cleanup) -->
                <span v-if="false" class="ccl-badge">{{ t(`cars.badge.${car.badge}`) }}</span>
                <span class="card-cue" aria-hidden="true">
                  <svg viewBox="0 0 20 20" fill="none" class="block w-5 h-5">
                    <path d="M6 14L14 6" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" />
                    <path d="M7 6H14V13" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" />
                  </svg>
                </span>
              </div>

              <!-- Description wrap : title-row (logo + title + price absolute) + specs -->
              <div class="ccl-desc">
                <!-- Title and Price row -->
                <div class="ccl-title-row">
                  <span class="ccl-logo" aria-hidden="true">{{ brandInitial(car.brand) }}</span>
                  <div class="ccl-title-block">
                    <h3 class="ccl-title">{{ car.fullName }}</h3>
                    <p class="ccl-subtitle">
                      <span>{{ car.year }}</span>
                      <span class="ccl-dot" aria-hidden="true"></span>
                      <span>{{ car.hp }} ch</span>
                      <span class="ccl-dot" aria-hidden="true"></span>
                      <span>{{ car.topSpeedKmh }} km/h</span>
                      <span class="ccl-dot" aria-hidden="true"></span>
                      <span>{{ categoryLabel(car.category) }}</span>
                    </p>
                  </div>
                  <div class="ccl-price-block">
                    <p class="ccl-price">{{ fmtPrice(car.prices.oneToThreeDays) }}</p>
                    <p class="ccl-price-label">{{ t('cars.perDayShort') }}</p>
                  </div>
                </div>

                <!-- Tarifs degressifs : 1-3j / 4-7j / 7j+ -->
                <div class="ccl-tiers">
                  <div class="ccl-tier">
                    <p class="ccl-tier-key">{{ t('cars.fiche.tier1to3') }}</p>
                    <p class="ccl-tier-val">{{ fmtPrice(car.prices.oneToThreeDays) }}<small>{{ t('cars.perDayShort') }}</small></p>
                  </div>
                  <div class="ccl-tier">
                    <p class="ccl-tier-key">{{ t('cars.fiche.tier4to7') }}</p>
                    <p class="ccl-tier-val">{{ fmtPrice(car.prices.fourToSevenDays) }}<small>{{ t('cars.perDayShort') }}</small></p>
                  </div>
                  <div class="ccl-tier ccl-tier-best">
                    <p class="ccl-tier-key">{{ t('cars.fiche.tier7plus') }}</p>
                    <p class="ccl-tier-val">{{ fmtPrice(car.prices.weekPlus) }}<small>{{ t('cars.perDayShort') }}</small></p>
                  </div>
                </div>

                <!-- Conditions : caution, min jours, km inclus, villes -->
                <div class="ccl-conds">
                  <div class="ccl-cond">
                    <span class="ccl-cond-key">{{ t('cars.condDeposit') }}</span>
                    <strong class="ccl-cond-val">{{ fmtPrice(car.conditions.securityDeposit) }}</strong>
                  </div>
                  <div class="ccl-cond">
                    <span class="ccl-cond-key">{{ t('cars.condMin') }}</span>
                    <strong class="ccl-cond-val">{{ car.conditions.minDays }} {{ t('cars.fiche.daysShort') }}</strong>
                  </div>
                  <div class="ccl-cond">
                    <span class="ccl-cond-key">{{ t('cars.condIncluded') }}</span>
                    <strong class="ccl-cond-val">{{ car.conditions.includedKmPerDay }} {{ t('cars.kmPerDayShort') }}</strong>
                  </div>
                  <div class="ccl-cond">
                    <span class="ccl-cond-key">{{ t('cars.specAvailable') }}</span>
                    <strong class="ccl-cond-val">{{ citiesLabel(car.availableCities) }}</strong>
                  </div>
                </div>
              </div>
            </NuxtLink>
          </div>

          <div v-else class="text-center py-16">
            <p class="text-misana-muted text-sm mb-4">{{ t('cars.noResults') }}</p>
            <button type="button" class="text-xs underline underline-offset-4 hover:text-misana-ink transition" @click="clearFilters">{{ t('cars.clearFilters') }}</button>
          </div>

          <p class="text-xs text-misana-muted mt-8 italic">{{ t('request.cars.priceFootnote') }}</p>
        </div>
      </div>
    </section>

    <section class="bg-misana-paper border-t border-misana-line">
      <div class="max-w-[1600px] mx-auto px-6 sm:px-12 py-16 sm:py-20">
        <p class="text-misana-muted leading-relaxed">{{ editorialBody }}</p>
      </div>
    </section>

    <!-- Sticky bottom filter button (Airbnb-style) : visible mobile uniquement,
         cache pendant que le sheet est ouvert. -->
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
      <span>{{ t('cars.filters') }}</span>
      <span v-if="filterCount" class="filters-fab-badge">{{ filterCount }}</span>
    </button>
  </main>
</template>

<style scoped>
/* ============================================== */
/* DESIGN SYSTEM (cars/all)                       */
/* - Pill component (.pill / .pill-active)         */
/* - Filters card (sidebar wrapper + sections)     */
/* - Toolbar (search + count + view toggle)        */
/* Forme : 999px interactifs, 12px conteneurs    */
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
.filter-check:checked::after {
  content: '';
  position: absolute;
  inset: 3px;
  background: var(--color-misana-paper);
  /* dot interior visible via padding inside */
  display: none;
}
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

/* === Filters card (sidebar) === */
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

/* Slide-up animation mobile */
.filters-sheet-enter-active,
.filters-sheet-leave-active {
  transition: transform 0.35s cubic-bezier(0.32, 0.72, 0, 1), opacity 0.25s ease;
}
.filters-sheet-enter-from,
.filters-sheet-leave-to {
  transform: translateY(100%);
  opacity: 0;
}
@media (min-width: 1024px) {
  .filters-sheet-enter-active,
  .filters-sheet-leave-active { transition: none; }
  .filters-sheet-enter-from,
  .filters-sheet-leave-to { transform: none; opacity: 1; }
}
.filters-fade-enter-active, .filters-fade-leave-active { transition: opacity 0.25s ease; }
.filters-fade-enter-from, .filters-fade-leave-to { opacity: 0; }

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
.filters-apply:hover { opacity: 0.9; }

/* === Filter section === */
.filter-section { display: flex; flex-direction: column; gap: 10px; }
.filter-section-key {
  margin: 0;
  font-size: 0.62rem;
  letter-spacing: 0.24em;
  text-transform: uppercase;
  color: var(--color-misana-muted);
}

/* === Toolbar : search pill + count + view toggle === */
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
  transition: border-color 0.3s ease, background 0.3s ease;
}
@media (min-width: 1280px) {
  /* Cap : la recherche s'arrete a la fin de la col 2 du grid 3-col */
  .toolbar-search { max-width: calc((100% - 16px) * 2 / 3); }
}
.toolbar-search:focus-within {
  border-color: var(--color-misana-ink);
  background: var(--color-misana-paper);
}
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

/* Sort select styled - squared B&W */
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
  /* Toolbar mobile : 1 ligne search + sort cote a cote, hauteur 44px */
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
  /* toolbar-meta = wrap pour sort uniquement (toggle masque, count deplace) */
  .toolbar-meta {
    grid-column: 2;
    display: flex;
    align-items: stretch;
  }
  /* Sort : meme ligne que search, hauteur identique 44px */
  .toolbar-sort-wrap {
    height: 44px;
    width: 100%;
    flex: 1 1 auto;
  }
  .toolbar-sort {
    width: 100%;
    height: 44px;
    padding: 0 28px 0 12px;
    font-size: 0.62rem;
    letter-spacing: 0.14em;
    line-height: 1;
  }
  .toolbar-sort-chevron { right: 10px; }
  /* View toggle masque mobile : on force grid via JS effectiveView */
  .view-toggle { display: none !important; }
  /* Count plus discret mobile, sa propre ligne sous toolbar */
  .toolbar-count {
    margin: 0 0 12px;
    font-size: 0.7rem;
  }
}
/* Sticky bottom filter button (FAB pill, Airbnb-style) : visible mobile only.
   Cache desktop (>= 1024px) car la sidebar filtres est sticky a gauche. */
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

/* === View toggle (pill harmonise avec search, hauteur 44px) === */
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
  border-radius: 4px;
  cursor: pointer;
  transition: background 0.3s ease, color 0.3s ease;
  font-family: inherit;
  line-height: 1;
}
.view-btn:hover { color: var(--color-misana-ink); }
.view-btn-active {
  background: var(--color-misana-ink);
  color: var(--color-misana-paper);
}
.view-btn-active:hover { color: var(--color-misana-paper); }

/* ========================================== */
/* GRID CARD (bydrive 1:1 - dim. exactes)      */
/* card 12px radius / padding 24px / gap 24px */
/* image height 216px / logo 46px             */
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

/* Preview image - 130px mobile, 216px desktop */
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

/* Title row : logo 46px + titre block. Gap 12px. align-items flex-start */
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
.ccg-title-block {
  flex: 1 0 0;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}
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

/* Price row : pill stone left, price right. space-between, no padding */
.ccg-price-wrap {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  width: 100%;
}
.ccg-tag {
  font-size: 0.78rem;
  letter-spacing: 0;
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
/* HOVER CUE (black square arrow, commun)      */
/* ========================================== */
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
/* LIST CARD (bydrive dealer-cars-list 1:1)    */
/* row 24px padding, gap 32px                  */
/* image 256px wide, stretch height            */
/* desc gap 20px, title-row gap 14px           */
/* logo 46px, price absolute top-right         */
/* specs 2 cols, items inline (key 10px val)   */
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

/* Image wrap : 256px wide, stretch height */
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

/* Description column : gap 20px */
.ccl-desc {
  flex: 1 0 0;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 20px;
  position: relative;
}

/* Title row : logo 46px + title block + price block (absolute right) */
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

/* Price block : absolute top-right of description */
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

/* Tarifs degressifs : 3 tiers en grille avec mise en valeur du dernier */
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

/* Conditions : 4 items horizontal, separateurs verticaux */
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

/* Tablet (640-1023) : single column, image full width on top */
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

/* Mobile (< 640px) : layout horizontal compact image gauche + infos droite,
   masque tiers et conditions. Image hauteur fixe pour ratio coherent
   au lieu de stretch sur la hauteur du contenu. */
@media (max-width: 639px) {
  .ccl {
    flex-direction: row;
    gap: 12px;
    padding: 10px;
    align-items: center;
    min-height: 110px;
  }
  .ccl-image-wrap {
    flex: 0 0 130px;
    width: 130px;
    height: 100px;
    min-height: 100px;
    align-self: center;
  }
  .ccl-desc {
    gap: 4px;
    padding: 0;
    min-width: 0;
    flex: 1 1 0;
  }
  .ccl-title-row {
    flex-direction: column;
    align-items: flex-start;
    gap: 3px;
    padding-right: 0;
  }
  .ccl-logo { display: none; }
  .ccl-title {
    font-size: 0.9rem;
    line-height: 1.15;
    overflow: hidden;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
  }
  .ccl-subtitle {
    font-size: 0.66rem;
    gap: 4px;
    margin: 0;
  }
  .ccl-price-block {
    position: relative;
    top: auto;
    right: auto;
    align-items: flex-start;
    margin-top: 2px;
  }
  .ccl-price { font-size: 0.92rem !important; line-height: 1; }
  .ccl-price-label { font-size: 0.6rem !important; margin-top: 2px; }
  /* Masque tarifs degressifs et conditions sur mobile (info secondaire,
     dispo dans la fiche) */
  .ccl-tiers { display: none; }
  .ccl-conds { display: none; }
  /* Hide hover scale icon mobile */
  .ccl-image-wrap .card-cue { display: none; }
  .ccl-badge {
    top: 6px;
    left: 6px;
    padding: 0.2rem 0.5rem;
    font-size: 0.55rem;
  }
}
</style>
