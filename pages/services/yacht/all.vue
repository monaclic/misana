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
        <!-- Sidebar filters -->
        <aside
          class="lg:col-span-3 lg:sticky lg:top-24 lg:self-start"
          :class="showFilters ? 'block' : 'hidden lg:block'"
        >
          <div class="border border-misana-line">
            <div class="flex items-center justify-between px-4 py-3 border-b border-misana-line">
              <p class="text-xs uppercase tracking-widest">{{ t('yacht.filters') }}</p>
              <button
                v-if="filterCount"
                type="button"
                class="text-[10px] uppercase tracking-widest underline underline-offset-4 text-misana-muted hover:text-misana-ink"
                @click="clearFilters"
              >{{ t('yacht.clearFilters') }}</button>
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
  </main>
</template>
