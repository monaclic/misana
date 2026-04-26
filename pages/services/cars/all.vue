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
      <div class="max-w-5xl mx-auto px-6 py-16 sm:py-24">
        <p class="text-xs uppercase tracking-widest text-misana-muted mb-4">{{ t('cars.kicker') }}</p>
        <h1 class="font-display text-4xl sm:text-5xl mb-4">{{ t('cars.hubTitle') }}</h1>
        <p class="text-misana-muted text-lg max-w-2xl">{{ t('cars.hubLead') }}</p>
      </div>
    </section>

    <section class="max-w-7xl mx-auto px-6 py-12">
      <div class="grid lg:grid-cols-12 gap-8">
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
          <div class="flex items-center justify-between mb-6 text-xs text-misana-muted">
            <p>
              {{ visibleCars.length }} {{ t('cars.results', { n: visibleCars.length }) }}
              <span v-if="filterCount" class="ml-2">· {{ filterCount }} {{ t('cars.filtersActive') }}</span>
            </p>
            <button
              type="button"
              class="lg:hidden border border-misana-line px-3 py-1.5 hover:border-misana-ink transition"
              @click="showFilters = !showFilters"
            >{{ showFilters ? t('cars.hideFilters') : t('cars.showFilters') }}</button>
          </div>

          <div v-if="visibleCars.length" class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
            <NuxtLink
              v-for="car in visibleCars"
              :key="car.id"
              :to="localePath(`/services/cars/${car.id}`)"
              class="group ring-1 ring-misana-line hover:ring-misana-ink transition overflow-hidden bg-misana-paper flex flex-col"
            >
              <div class="aspect-[4/3] relative overflow-hidden bg-misana-stone">
                <img :src="car.hero" :alt="car.fullName" loading="lazy" class="absolute inset-0 w-full h-full object-cover transition duration-700 group-hover:scale-[1.02]" />
                <span v-if="car.badge" class="absolute top-3 left-3 text-[10px] uppercase tracking-widest px-2 py-1 bg-misana-paper text-misana-ink">{{ t(`request.fleet.badge.${car.badge}`) }}</span>
              </div>
              <div class="p-5 flex-1 flex flex-col">
                <p class="text-[10px] uppercase tracking-widest text-misana-muted mb-1">{{ car.brand }}</p>
                <p class="text-sm font-medium leading-tight">{{ car.model }}</p>
                <p class="text-xs text-misana-muted mt-1">{{ locale === 'fr' ? car.descFr : car.desc }}</p>
                <div class="flex items-baseline justify-between mt-4 text-xs text-misana-muted">
                  <span>{{ car.pax }} {{ t('request.fleet.pax') }} · {{ car.hp }} hp</span>
                  <span class="text-misana-ink whitespace-nowrap">
                    <span class="text-misana-muted">{{ t('request.cars.perDay') }} </span>
                    {{ fmtPrice(car.prices.oneToThreeDays) }}
                  </span>
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
      <div class="max-w-3xl mx-auto px-6 py-16">
        <p class="text-misana-muted leading-relaxed">{{ editorialBody }}</p>
      </div>
    </section>
  </main>
</template>
