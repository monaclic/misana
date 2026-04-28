<script setup lang="ts">
// Hub catalog cars : 12 voitures Excellence Riviera, sidebar filtres ultra
// complet (categorie, marque, prix, annee, transmission, carburant, places,
// ville disponibilite). Multi-select sur tous les axes, layout 2 colonnes.
import {
  RENTAL_CARS,
  RENTAL_CATEGORIES,
  RENTAL_PRICE_BUCKETS,
  rentalBrands,
  type RentalCarCategory,
} from '~/lib/rentalCars';
import { CITIES } from '~/lib/constants';

definePageMeta({ layout: 'default' });

const route = useRoute();
const router = useRouter();
const { locale, t } = useI18n();
const localePath = useLocalePath();

function asArray<T extends string>(v: unknown, allowed: readonly T[]): T[] {
  if (!v) return [];
  const list = Array.isArray(v) ? v : String(v).split(',');
  return list.map((x) => String(x).trim()).filter((x): x is T => (allowed as readonly string[]).includes(x));
}

const VALID_CATEGORIES: RentalCarCategory[] = ['sport', 'supercar', 'suv', 'sedan', 'convertible'];
const brands = rentalBrands();
const brandSlugs = brands.map((b) => b.toLowerCase().replace(/\s+/g, '-'));

// brand slug → canonical brand name
function brandFromSlug(slug: string): string | undefined {
  return brands.find((b) => b.toLowerCase().replace(/\s+/g, '-') === slug);
}

const initialBrandSlugs = asArray(route.query.brand, brandSlugs);
const initialBrands = initialBrandSlugs.map(brandFromSlug).filter(Boolean) as string[];

// Multi-select filters initialised from URL query
const fCategory = ref<RentalCarCategory[]>(asArray(route.query.category, VALID_CATEGORIES));
const fBrand = ref<string[]>(initialBrands);
const fPriceBucket = ref<string[]>([]);
const fTransmission = ref<('auto' | 'manual')[]>([]);
const fFuel = ref<('gasoline' | 'hybrid' | 'electric' | 'diesel')[]>([]);
const fSeats = ref<string[]>([]);
const fYear = ref<string[]>([]);
const fCity = ref<string[]>([]);
const showFilters = ref(false);

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

function brandInitial(brand: string): string {
  return brand.charAt(0).toUpperCase();
}
function categoryLabel(cat: RentalCarCategory): string {
  const c = RENTAL_CATEGORIES.find((x) => x.id === cat);
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
    if (c === 'sedan') return isFr
      ? `La berline quand la discrétion compte. Mercedes Maybach S, Mercedes Classe E, Bentley Mulsanne. Douze cylindres, le silence à vitesse, le bon véhicule pour une longue semaine ou un transfert d'affaires.`
      : `The sedan when discretion matters. Mercedes Maybach S, Mercedes E-Class, Bentley Mulsanne. Twelve cylinders, the silence at speed, the right vehicle for a long week or a business transfer.`;
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
  if (fBrand.value.length === 1) parts.push(fBrand.value[0]);
  if (fCategory.value.length === 1) {
    const cat = RENTAL_CATEGORIES.find((c) => c.id === fCategory.value[0]);
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

const fuelOptions: ('gasoline' | 'hybrid' | 'electric' | 'diesel')[] = [
  'gasoline', 'hybrid', 'electric', 'diesel',
];

const transmissionOptions: ('auto' | 'manual')[] = ['auto', 'manual'];

const visibleCars = computed(() => {
  return RENTAL_CARS.filter((c) => {
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
    if (fTransmission.value.length && !fTransmission.value.includes(c.transmission)) return false;
    if (fFuel.value.length && !fFuel.value.includes(c.fuelType)) return false;
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
    if (fCity.value.length) {
      const matched = fCity.value.some((slug) => c.availableCities.includes(slug));
      if (!matched) return false;
    }
    return true;
  });
});

const filterCount = computed(() =>
  fCategory.value.length + fBrand.value.length + fPriceBucket.value.length +
  fTransmission.value.length + fFuel.value.length + fSeats.value.length +
  fYear.value.length + fCity.value.length,
);

function clearFilters() {
  fCategory.value = [];
  fBrand.value = [];
  fPriceBucket.value = [];
  fTransmission.value = [];
  fFuel.value = [];
  fSeats.value = [];
  fYear.value = [];
  fCity.value = [];
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
    <section class="bg-misana-stone border-b border-misana-line">
      <div class="max-w-[1600px] mx-auto px-6 sm:px-12 py-16 sm:py-24">
        <p class="text-xs uppercase tracking-widest text-misana-muted mb-4">{{ t('cars.kicker') }}</p>
        <h1 class="font-display text-4xl sm:text-5xl mb-4">{{ t('cars.hubTitle') }}</h1>
        <p class="text-misana-muted text-lg max-w-2xl">{{ t('cars.hubLead') }}</p>
      </div>
    </section>

    <section class="max-w-[1600px] mx-auto px-6 sm:px-12 py-12 sm:py-16">
      <div class="grid lg:grid-cols-12 gap-10">
        <div
          v-if="showFilters"
          class="lg:hidden fixed inset-0 z-50 bg-black/40"
          @click="showFilters = false"
        ></div>

        <aside
          class="lg:col-span-3 lg:sticky lg:top-24 lg:self-start"
          :class="showFilters ? 'fixed inset-y-0 left-0 z-50 w-80 max-w-[85vw] bg-misana-paper overflow-y-auto lg:static lg:w-auto lg:max-w-none lg:bg-transparent lg:overflow-visible' : 'hidden lg:block'"
        >
          <div class="lg:border lg:border-misana-line h-full lg:h-auto">
            <div class="flex items-center justify-between px-4 py-3 border-b border-misana-line">
              <p class="text-xs uppercase tracking-widest">{{ t('cars.filters') }}</p>
              <div class="flex items-center gap-3">
                <button
                  v-if="filterCount"
                  type="button"
                  class="text-[10px] uppercase tracking-widest underline underline-offset-4 text-misana-muted hover:text-misana-ink"
                  @click="clearFilters"
                >{{ t('cars.clearFilters') }}</button>
                <button
                  type="button"
                  class="lg:hidden text-misana-muted hover:text-misana-ink text-lg"
                  aria-label="Close filters"
                  @click="showFilters = false"
                >✕</button>
              </div>
            </div>

            <div class="divide-y divide-misana-line max-h-[70vh] lg:max-h-[calc(100vh-12rem)] overflow-y-auto">
              <!-- Category -->
              <div class="p-4">
                <p class="text-[10px] uppercase tracking-widest text-misana-muted mb-3">{{ t('request.cars.category') }}</p>
                <ul class="space-y-2">
                  <li v-for="cat in RENTAL_CATEGORIES" :key="cat.id">
                    <label class="flex items-center gap-2 text-xs cursor-pointer">
                      <input type="checkbox" v-model="fCategory" :value="cat.id" class="accent-misana-ink" />
                      <span>{{ locale === 'fr' ? cat.labelFr : cat.label }}</span>
                    </label>
                  </li>
                </ul>
              </div>

              <!-- Brand -->
              <div class="p-4">
                <p class="text-[10px] uppercase tracking-widest text-misana-muted mb-3">{{ t('cars.filterBrand') }}</p>
                <ul class="space-y-2">
                  <li v-for="b in brands" :key="b">
                    <label class="flex items-center gap-2 text-xs cursor-pointer">
                      <input type="checkbox" v-model="fBrand" :value="b" class="accent-misana-ink" />
                      <span>{{ b }}</span>
                    </label>
                  </li>
                </ul>
              </div>

              <!-- Daily rate -->
              <div class="p-4">
                <p class="text-[10px] uppercase tracking-widest text-misana-muted mb-3">{{ t('cars.filterPrice') }}</p>
                <ul class="space-y-2">
                  <li v-for="bucket in RENTAL_PRICE_BUCKETS" :key="bucket.id">
                    <label class="flex items-center gap-2 text-xs cursor-pointer">
                      <input type="checkbox" v-model="fPriceBucket" :value="bucket.id" class="accent-misana-ink" />
                      <span>{{ bucket.label }}</span>
                    </label>
                  </li>
                </ul>
              </div>

              <!-- Year -->
              <div class="p-4">
                <p class="text-[10px] uppercase tracking-widest text-misana-muted mb-3">{{ t('cars.filterYear') }}</p>
                <ul class="space-y-2">
                  <li v-for="y in YEAR_BUCKETS" :key="y.id">
                    <label class="flex items-center gap-2 text-xs cursor-pointer">
                      <input type="checkbox" v-model="fYear" :value="y.id" class="accent-misana-ink" />
                      <span>{{ y.label }}</span>
                    </label>
                  </li>
                </ul>
              </div>

              <!-- Transmission -->
              <div class="p-4">
                <p class="text-[10px] uppercase tracking-widest text-misana-muted mb-3">{{ t('cars.fiche.transmission') }}</p>
                <ul class="space-y-2">
                  <li v-for="tr in transmissionOptions" :key="tr">
                    <label class="flex items-center gap-2 text-xs cursor-pointer">
                      <input type="checkbox" v-model="fTransmission" :value="tr" class="accent-misana-ink" />
                      <span>{{ tr === 'auto' ? t('cars.fiche.automatic') : t('cars.fiche.manual') }}</span>
                    </label>
                  </li>
                </ul>
              </div>

              <!-- Fuel -->
              <div class="p-4">
                <p class="text-[10px] uppercase tracking-widest text-misana-muted mb-3">{{ t('cars.fiche.fuel') }}</p>
                <ul class="space-y-2">
                  <li v-for="f in fuelOptions" :key="f">
                    <label class="flex items-center gap-2 text-xs cursor-pointer">
                      <input type="checkbox" v-model="fFuel" :value="f" class="accent-misana-ink" />
                      <span>{{ t(`cars.fuel.${f}`) }}</span>
                    </label>
                  </li>
                </ul>
              </div>

              <!-- Seats -->
              <div class="p-4">
                <p class="text-[10px] uppercase tracking-widest text-misana-muted mb-3">{{ t('cars.filterSeats') }}</p>
                <ul class="space-y-2">
                  <li v-for="s in SEAT_BUCKETS" :key="s.id">
                    <label class="flex items-center gap-2 text-xs cursor-pointer">
                      <input type="checkbox" v-model="fSeats" :value="s.id" class="accent-misana-ink" />
                      <span>{{ s.label }} {{ t('request.fleet.pax') }}</span>
                    </label>
                  </li>
                </ul>
              </div>

              <!-- Available city -->
              <div class="p-4">
                <p class="text-[10px] uppercase tracking-widest text-misana-muted mb-3">{{ t('cars.filterCity') }}</p>
                <ul class="space-y-2">
                  <li v-for="ct in CITIES" :key="ct.slug">
                    <label class="flex items-center gap-2 text-xs cursor-pointer">
                      <input type="checkbox" v-model="fCity" :value="ct.slug" class="accent-misana-ink" />
                      <span>{{ locale === 'fr' ? ct.fr : ct.en }}</span>
                    </label>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </aside>

        <!-- Results -->
        <div class="lg:col-span-9">
          <div class="flex items-center justify-between mb-6 gap-4 flex-wrap">
            <p class="text-xs text-misana-muted">
              {{ visibleCars.length }} {{ t('cars.results', { n: visibleCars.length }) }}
              <span v-if="filterCount" class="ml-2">· {{ filterCount }} {{ t('cars.filtersActive') }}</span>
            </p>
            <div class="flex items-center gap-3">
              <!-- View toggle grid / list -->
              <div class="view-toggle" role="tablist" :aria-label="t('cars.viewToggleAria')">
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
              <button
                type="button"
                class="lg:hidden border border-misana-line px-3 py-1.5 text-xs hover:border-misana-ink transition"
                @click="showFilters = !showFilters"
              >{{ showFilters ? t('cars.hideFilters') : t('cars.showFilters') }}</button>
            </div>
          </div>

          <!-- =========== GRID VIEW (bydrive layout) =========== -->
          <div
            v-if="visibleCars.length && view === 'grid'"
            class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6"
          >
            <NuxtLink
              v-for="car in visibleCars"
              :key="car.id"
              :to="localePath(`/services/cars/${car.id}`)"
              class="ccg group"
            >
              <div class="ccg-image-wrap">
                <img :src="car.hero" :alt="car.fullName" loading="lazy" class="ccg-image" />
                <span v-if="car.badge" class="ccg-badge">{{ t(`request.fleet.badge.${car.badge}`) }}</span>
              </div>

              <div class="ccg-title-wrap">
                <span class="ccg-logo" aria-hidden="true">{{ brandInitial(car.brand) }}</span>
                <div class="ccg-title-block">
                  <h3 class="ccg-title">{{ car.fullName }}</h3>
                  <p class="ccg-details">
                    <span>{{ car.transmission === 'auto' ? t('cars.fiche.automatic') : t('cars.fiche.manual') }}</span>
                    <span class="ccg-dot" aria-hidden="true"></span>
                    <span>{{ car.hp }} ch</span>
                  </p>
                </div>
              </div>

              <div class="ccg-price-wrap">
                <span class="ccg-tag">{{ car.pax }} {{ t('request.fleet.pax') }}</span>
                <div class="ccg-price">
                  <span class="ccg-price-from">{{ t('request.cars.fromPrice') }}</span>
                  <span class="ccg-price-value">{{ fmtPrice(car.prices.oneToThreeDays) }}</span>
                  <span class="ccg-price-unit">{{ t('cars.perDayShort') }}</span>
                </div>
              </div>
            </NuxtLink>
          </div>

          <!-- =========== LIST VIEW (detailed card) =========== -->
          <div v-else-if="visibleCars.length && view === 'list'" class="flex flex-col gap-5">
            <NuxtLink
              v-for="car in visibleCars"
              :key="car.id"
              :to="localePath(`/services/cars/${car.id}`)"
              class="ccl group"
            >
              <div class="ccl-image-wrap">
                <img :src="car.hero" :alt="car.fullName" loading="lazy" class="ccl-image" />
                <span v-if="car.badge" class="ccl-badge">{{ t(`request.fleet.badge.${car.badge}`) }}</span>
              </div>
              <div class="ccl-body">
                <div class="ccl-head">
                  <span class="ccl-logo" aria-hidden="true">{{ brandInitial(car.brand) }}</span>
                  <div class="ccl-head-text">
                    <p class="ccl-brand">{{ car.brand }}</p>
                    <h3 class="ccl-title">{{ car.model }}</h3>
                    <p class="ccl-subtitle">
                      <span>{{ t('cars.fiche.year') }} {{ car.year }}</span>
                      <span class="ccl-dot" aria-hidden="true"></span>
                      <span>{{ car.hp }} ch</span>
                      <span class="ccl-dot" aria-hidden="true"></span>
                      <span>{{ car.topSpeedKmh }} km/h</span>
                    </p>
                  </div>
                </div>

                <div class="ccl-specs">
                  <div class="ccl-specs-col">
                    <div class="ccl-spec">
                      <p class="ccl-spec-key">{{ t('cars.specType') }}</p>
                      <p class="ccl-spec-val">{{ categoryLabel(car.category) }}</p>
                    </div>
                    <div class="ccl-spec">
                      <p class="ccl-spec-key">{{ t('cars.fiche.transmission') }}</p>
                      <p class="ccl-spec-val">{{ car.transmission === 'auto' ? t('cars.fiche.automatic') : t('cars.fiche.manual') }}</p>
                    </div>
                    <div class="ccl-spec">
                      <p class="ccl-spec-key">{{ t('cars.fiche.fuel') }}</p>
                      <p class="ccl-spec-val">{{ t(`cars.fuel.${car.fuelType}`) }}</p>
                    </div>
                  </div>
                  <div class="ccl-specs-col ccl-specs-col-right">
                    <div class="ccl-spec">
                      <p class="ccl-spec-key">{{ t('cars.filterSeats') }}</p>
                      <p class="ccl-spec-val">{{ car.pax }}</p>
                    </div>
                    <div class="ccl-spec">
                      <p class="ccl-spec-key">{{ t('cars.fiche.power') }}</p>
                      <p class="ccl-spec-val">{{ car.hp }} ch</p>
                    </div>
                    <div class="ccl-spec">
                      <p class="ccl-spec-key">{{ t('cars.specAvailable') }}</p>
                      <p class="ccl-spec-val">{{ citiesLabel(car.availableCities) }}</p>
                    </div>
                  </div>
                </div>

                <div class="ccl-price-wrap">
                  <p class="ccl-price-from">{{ t('request.cars.fromPrice') }}</p>
                  <p class="ccl-price">{{ fmtPrice(car.prices.oneToThreeDays) }}</p>
                  <p class="ccl-price-unit">{{ t('cars.perDayShort') }}</p>
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

    <section class="bg-misana-stone border-t border-misana-line">
      <div class="max-w-[1600px] mx-auto px-6 sm:px-12 py-16 sm:py-20">
        <p class="text-misana-muted leading-relaxed">{{ editorialBody }}</p>
      </div>
    </section>
  </main>
</template>

<style scoped>
/* === View toggle === */
.view-toggle {
  display: inline-flex;
  border: 1px solid var(--color-misana-line);
  background: var(--color-misana-paper);
}
.view-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.55rem 1rem;
  font-size: 0.65rem;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: var(--color-misana-muted);
  background: transparent;
  border: 0;
  cursor: pointer;
  transition: background 0.3s ease, color 0.3s ease;
  font-family: inherit;
}
.view-btn + .view-btn { border-left: 1px solid var(--color-misana-line); }
.view-btn:hover { color: var(--color-misana-ink); }
.view-btn-active {
  background: var(--color-misana-ink);
  color: var(--color-misana-paper);
}
.view-btn-active:hover { color: var(--color-misana-paper); }

/* ========================================== */
/* GRID CARD (bydrive layout exact, adapte)    */
/* ========================================== */
.ccg {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  background: var(--color-misana-paper);
  border: 1px solid var(--color-misana-line);
  border-radius: 12px;
  padding: 0.75rem 0.75rem 0.85rem;
  text-decoration: none;
  color: var(--color-misana-ink);
  transition: border-color 0.4s ease, box-shadow 0.4s ease, transform 0.5s cubic-bezier(0.16, 1, 0.3, 1);
}
.ccg:hover {
  border-color: var(--color-misana-ink);
  transform: translateY(-2px);
  box-shadow: 0 12px 28px -20px rgba(0, 0, 0, 0.18);
}

/* Preview image */
.ccg-image-wrap {
  position: relative;
  aspect-ratio: 16 / 11;
  overflow: hidden;
  border-radius: 10px;
  background: var(--color-misana-stone);
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
  top: 0.85rem;
  left: 0.85rem;
  font-size: 0.6rem;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  padding: 0.35rem 0.7rem;
  background: var(--color-misana-paper);
  color: var(--color-misana-ink);
  border-radius: 99px;
}

/* Title row : logo (pastille initiale) + titre + details */
.ccg-title-wrap {
  display: flex;
  align-items: center;
  gap: 0.85rem;
  padding: 0.25rem 0.4rem 0;
}
.ccg-logo {
  flex: 0 0 auto;
  width: 40px;
  height: 40px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 1px solid var(--color-misana-line);
  border-radius: 99px;
  font-family: var(--font-display, serif);
  font-size: 1rem;
  color: var(--color-misana-ink);
  background: var(--color-misana-paper);
}
.ccg-title-block { min-width: 0; flex: 1; }
.ccg-title {
  font-family: var(--font-display, serif);
  font-size: 1.05rem;
  line-height: 1.2;
  margin: 0;
  color: var(--color-misana-ink);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.ccg-details {
  margin: 0.3rem 0 0;
  font-size: 0.72rem;
  color: var(--color-misana-muted);
  display: inline-flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.45rem;
}
.ccg-dot {
  width: 3px;
  height: 3px;
  border-radius: 99px;
  background: currentColor;
  opacity: 0.55;
}

/* Price row : pill places + prix droit */
.ccg-price-wrap {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.85rem;
  padding: 0 0.4rem;
}
.ccg-tag {
  font-size: 0.7rem;
  letter-spacing: 0.04em;
  color: var(--color-misana-ink);
  padding: 0.45rem 0.95rem;
  background: var(--color-misana-stone);
  border-radius: 99px;
  white-space: nowrap;
}
.ccg-price {
  display: inline-flex;
  align-items: baseline;
  gap: 0.4rem;
  white-space: nowrap;
}
.ccg-price-from {
  font-family: var(--font-display, serif);
  font-style: italic;
  font-size: 0.78rem;
  color: var(--color-misana-muted);
}
.ccg-price-value {
  font-family: var(--font-display, serif);
  font-size: 1.35rem;
  line-height: 1;
  color: var(--color-misana-ink);
}
.ccg-price-unit {
  font-size: 0.72rem;
  color: var(--color-misana-muted);
}

/* ========================================== */
/* LIST CARD (detailed, ameliore)              */
/* ========================================== */
.ccl {
  display: grid;
  grid-template-columns: 320px 1fr;
  gap: 0;
  background: var(--color-misana-paper);
  border: 1px solid var(--color-misana-line);
  border-radius: 14px;
  padding: 1rem;
  text-decoration: none;
  color: var(--color-misana-ink);
  transition: border-color 0.4s ease, box-shadow 0.4s ease;
  overflow: hidden;
}
.ccl:hover {
  border-color: var(--color-misana-ink);
  box-shadow: 0 14px 32px -22px rgba(0, 0, 0, 0.18);
}

.ccl-image-wrap {
  position: relative;
  aspect-ratio: 4 / 3;
  overflow: hidden;
  border-radius: 10px;
  background: var(--color-misana-stone);
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
  top: 0.85rem;
  left: 0.85rem;
  font-size: 0.6rem;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  padding: 0.35rem 0.7rem;
  background: var(--color-misana-paper);
  color: var(--color-misana-ink);
  border-radius: 99px;
}

.ccl-body {
  display: grid;
  grid-template-columns: minmax(0, 1.05fr) minmax(0, 1.2fr) minmax(0, 0.65fr);
  align-items: center;
  gap: 2rem;
  padding: 0.5rem 1.25rem 0.5rem 1.75rem;
}
.ccl-head {
  display: flex;
  align-items: flex-start;
  gap: 0.95rem;
  min-width: 0;
}
.ccl-logo {
  flex: 0 0 auto;
  width: 44px;
  height: 44px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 1px solid var(--color-misana-line);
  border-radius: 99px;
  font-family: var(--font-display, serif);
  font-size: 1.05rem;
  color: var(--color-misana-ink);
  background: var(--color-misana-paper);
  margin-top: 0.2rem;
}
.ccl-head-text { min-width: 0; }
.ccl-brand {
  font-size: 0.6rem;
  letter-spacing: 0.28em;
  text-transform: uppercase;
  color: var(--color-misana-muted);
  margin: 0 0 0.3rem;
}
.ccl-title {
  font-family: var(--font-display, serif);
  font-size: 1.4rem;
  line-height: 1.1;
  margin: 0;
  color: var(--color-misana-ink);
}
.ccl-subtitle {
  margin: 0.5rem 0 0;
  font-size: 0.75rem;
  color: var(--color-misana-muted);
  display: inline-flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.55rem;
}
.ccl-dot {
  width: 3px;
  height: 3px;
  border-radius: 99px;
  background: currentColor;
  opacity: 0.5;
}

.ccl-specs {
  display: grid;
  grid-template-columns: 1fr 1fr;
  column-gap: 1.5rem;
  row-gap: 0.7rem;
}
.ccl-specs-col {
  display: flex;
  flex-direction: column;
  gap: 0.55rem;
}
.ccl-specs-col-right { text-align: right; }
.ccl-spec { display: flex; flex-direction: column; gap: 0.1rem; }
.ccl-specs-col-right .ccl-spec { align-items: flex-end; }
.ccl-spec-key {
  margin: 0;
  font-size: 0.7rem;
  letter-spacing: 0.04em;
  color: var(--color-misana-muted);
}
.ccl-spec-val {
  margin: 0;
  font-family: var(--font-display, serif);
  font-size: 0.92rem;
  color: var(--color-misana-ink);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
}

.ccl-price-wrap {
  text-align: right;
  align-self: center;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.15rem;
}
.ccl-price-from {
  margin: 0;
  font-family: var(--font-display, serif);
  font-style: italic;
  font-size: 0.85rem;
  color: var(--color-misana-muted);
}
.ccl-price {
  margin: 0;
  font-family: var(--font-display, serif);
  font-size: 1.6rem;
  line-height: 1;
  color: var(--color-misana-ink);
  white-space: nowrap;
}
.ccl-price-unit {
  margin: 0.2rem 0 0;
  font-size: 0.72rem;
  color: var(--color-misana-muted);
}

@media (max-width: 1023px) {
  .ccl {
    grid-template-columns: 1fr;
  }
  .ccl-image-wrap { aspect-ratio: 16 / 9; }
  .ccl-body {
    grid-template-columns: 1fr;
    gap: 1.25rem;
    padding: 1.25rem 0.75rem 0.5rem;
  }
  .ccl-specs-col-right { text-align: left; }
  .ccl-specs-col-right .ccl-spec { align-items: flex-start; }
  .ccl-price-wrap {
    text-align: left;
    align-items: flex-start;
    padding-top: 0.85rem;
    border-top: 1px solid var(--color-misana-line);
  }
}
</style>
