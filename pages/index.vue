<script setup lang="ts">
// Homepage Misana V2.
// 17 sections vertically composed, modeled on Le Collectionist's anatomy
// and adapted to Misana's service-based business (Riviera concierge).
// Header (1) and Footer (16-17) come from the default layout.
import { SERVICES, CITIES, EVENTS, WEEKENDS, ESTABLISHMENTS } from '~/lib/constants';
import { RENTAL_CARS } from '~/lib/rentalCars';
import { YACHTS } from '~/lib/yachts';

definePageMeta({ layout: 'default' });

const { locale, t } = useI18n();
const localePath = useLocalePath();
const router = useRouter();

useSeoMeta({
  title: () => `${t('brand.name')} · ${t('brand.tagline')}`,
  description: () => t('home.metaDescription'),
});

useHead({
  script: [{
    type: 'application/ld+json',
    innerHTML: JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: 'Misana',
      description: 'Concierge service on the French Riviera. Chauffeur, helicopter, cars, yacht, access.',
      url: 'https://misana.com',
      areaServed: 'French Riviera',
      logo: 'https://misana.com/logo.png',
    }),
  }],
});

// --- Section 3 : Search bar (acts as universal request opener) ---
const search = reactive({
  service: 'chauffeur' as (typeof SERVICES)[number]['slug'],
  destination: '' as string,
  from: '' as string,
  to: '' as string,
  guests: 2 as number,
});

function submitSearch() {
  const query: Record<string, string> = { service: search.service };
  if (search.destination) query.destination = search.destination;
  if (search.from) query.from = search.from;
  if (search.to) query.to = search.to;
  if (search.guests) query.guests = String(search.guests);
  router.push({ path: localePath('/request'), query });
}

// --- Section 4 : Featured carousel with tabs ---
type TabKey = 'yacht' | 'cars' | 'helicopter' | 'access';
const activeTab = ref<TabKey>('yacht');

const featuredYachts = computed(() =>
  YACHTS.filter((y) => y.badge === 'flagship' || y.badge === 'popular').slice(0, 6),
);
const featuredCars = computed(() =>
  RENTAL_CARS.filter((c) => c.badge === 'flagship' || c.badge === 'popular').slice(0, 6),
);

// Helicopter featured : 4 aircraft archetypes with placeholder hero images.
const featuredHelis = [
  { id: 'h125', model: 'Airbus H125', engine: 'Single', pax: 5, hero: 'https://images.unsplash.com/photo-1544552866-d3ed42536cfd?w=900&q=80' },
  { id: 'h130', model: 'Airbus H130', engine: 'Single', pax: 6, hero: 'https://images.unsplash.com/photo-1531642765602-5cae8bbbf285?w=900&q=80' },
  { id: 'h135', model: 'Airbus H135', engine: 'Twin', pax: 6, hero: 'https://images.unsplash.com/photo-1583245177184-43be75e6e15c?w=900&q=80' },
  { id: 'h155', model: 'Airbus H155', engine: 'Twin', pax: 12, hero: 'https://images.unsplash.com/photo-1521405617584-1d9ca2cfd00f?w=900&q=80' },
];

// Access featured : 4 emblematic establishments, one per category.
const featuredAccess = computed(() => {
  const picks = ['le-louis-xv', 'cap-eden-roc', 'club-55', 'jimmy-z'];
  return picks.map((slug) => ESTABLISHMENTS.find((e) => e.slug === slug)).filter(Boolean) as Array<typeof ESTABLISHMENTS[number]>;
});

// --- Section 6+7 : Three usage profiles (Day / Weekend / Week) and weekend examples ---
const profiles = computed(() => [
  {
    key: 'day',
    title: t('home.profileDayTitle'),
    body: t('home.profileDayBody'),
    href: '/request?service=multi&duration=day',
  },
  {
    key: 'weekend',
    title: t('home.profileWeekendTitle'),
    body: t('home.profileWeekendBody'),
    href: '/request?service=multi&duration=weekend',
  },
  {
    key: 'week',
    title: t('home.profileWeekTitle'),
    body: t('home.profileWeekBody'),
    href: '/request?service=multi&duration=week',
  },
]);

// --- Section 9 : Concierge experience carousel (events) ---
const heavyEvents = computed(() =>
  EVENTS.filter((e) => e.tier === 'heavy').map((e) => {
    const city = CITIES.find((c) => c.slug === e.city);
    return { ...e, cityEn: city?.en ?? '', cityFr: city?.fr ?? '' };
  }),
);

// --- Section 10 : Trending destinations grid with view-more ---
const showAllCities = ref(false);
const heavyCities = computed(() => CITIES.filter((c) => c.tier === 'heavy'));
const stubCities = computed(() => CITIES.filter((c) => c.tier !== 'heavy'));

// --- Hero / heli / press placeholders ---
const heroImage = 'https://images.unsplash.com/photo-1601581875309-fafbf2d3ed3a?w=2000&q=80';

const SERVICE_TILES = [
  { slug: 'chauffeur', img: 'https://excellenceriviera.com/wp-content/uploads/2025/08/Transfert-Helicoptere-2.webp' },
  { slug: 'cars', img: 'https://excellenceriviera.com/wp-content/uploads/2025/08/Location-Voiture-Luxe.webp' },
  { slug: 'yacht', img: 'https://excellenceriviera.com/wp-content/uploads/2025/08/Location-Yacht.webp' },
  { slug: 'helicopter', img: 'https://excellenceriviera.com/wp-content/uploads/2022/02/Transfert-Helicoptere-3.jpg' },
  { slug: 'access', img: 'https://excellenceriviera.com/wp-content/uploads/2025/08/Restaurants.webp' },
];

const cityImage = (slug: string) => {
  const map: Record<string, string> = {
    'monaco': 'https://images.unsplash.com/photo-1600181681538-1ee847761e95?w=900&q=80',
    'cannes': 'https://images.unsplash.com/photo-1570042225831-d98fa7577f1e?w=900&q=80',
    'saint-tropez': 'https://images.unsplash.com/photo-1597212720158-e21eb71ce0e9?w=900&q=80',
    'nice': 'https://images.unsplash.com/photo-1566888596782-c7f41cc18f78?w=900&q=80',
    'cap-d-antibes': 'https://images.unsplash.com/photo-1503614472-8c93d56e92ce?w=900&q=80',
    'cap-ferrat': 'https://images.unsplash.com/photo-1549221987-25a64f9d57c1?w=900&q=80',
    'eze': 'https://images.unsplash.com/photo-1502104034360-73176bb1e92e?w=900&q=80',
    'menton': 'https://images.unsplash.com/photo-1572177812156-58036aae439c?w=900&q=80',
  };
  return map[slug] ?? '';
};

const accessImage = (slug: string) => {
  const map: Record<string, string> = {
    'le-louis-xv': 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=900&q=80',
    'cap-eden-roc': 'https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=900&q=80',
    'club-55': 'https://images.unsplash.com/photo-1530541930197-ff16ac917b0e?w=900&q=80',
    'jimmy-z': 'https://images.unsplash.com/photo-1545128485-c400e7702796?w=900&q=80',
  };
  return map[slug] ?? '';
};

const eventImage = (slug: string) => {
  const map: Record<string, string> = {
    'festival-de-cannes': 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?w=900&q=80',
    'monaco-grand-prix': 'https://images.unsplash.com/photo-1566041510639-8d95a2490bfb?w=900&q=80',
    'cannes-lions': 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=900&q=80',
    'monaco-yacht-show': 'https://images.unsplash.com/photo-1567899378494-47b22a2ae96a?w=900&q=80',
  };
  return map[slug] ?? '';
};

const weekendImage = (slug: string) => {
  const map: Record<string, string> = {
    'festival-edition': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=900&q=80',
    'grand-prix-edition': 'https://images.unsplash.com/photo-1541626078-2cd2b32a5c84?w=900&q=80',
    'three-days-cap-ferrat': 'https://images.unsplash.com/photo-1473496169904-658ba7c44d8a?w=900&q=80',
  };
  return map[slug] ?? '';
};

// Section 12 : Press placeholders (V1 has no real coverage yet).
const pressMentions = ['Press one', 'Press two', 'Press three', 'Press four', 'Press five'];

// --- Services horizontal sticky scroll (Rumaya pattern) ---
const SERVICE_PANELS = [
  { slug: 'chauffeur', img: 'https://images.unsplash.com/photo-1605515298946-d062f2e9da53?w=2000&q=80' },
  { slug: 'cars',      img: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=2000&q=80' },
  { slug: 'yacht',     img: 'https://images.unsplash.com/photo-1567899378494-47b22a2ae96a?w=2000&q=80' },
  { slug: 'helicopter',img: 'https://images.unsplash.com/photo-1540979388789-6cee28a1cdc9?w=2000&q=80' },
  { slug: 'access',    img: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=2000&q=80' },
] as const;

const servicesScrollRoot = ref<HTMLElement | null>(null);
const scrollProgress = ref(0);

function updateScroll() {
  const el = servicesScrollRoot.value;
  if (!el) return;
  const rect = el.getBoundingClientRect();
  const total = el.offsetHeight - window.innerHeight;
  const scrolled = -rect.top;
  scrollProgress.value = Math.max(0, Math.min(1, scrolled / total));
}

onMounted(() => {
  window.addEventListener('scroll', updateScroll, { passive: true });
  window.addEventListener('resize', updateScroll, { passive: true });
  updateScroll();
});
onBeforeUnmount(() => {
  window.removeEventListener('scroll', updateScroll);
  window.removeEventListener('resize', updateScroll);
});

const panelTranslate = computed(() => {
  const max = SERVICE_PANELS.length - 1;
  return -scrollProgress.value * max * 100;
});

// Section 15 : Newsletter
const email = ref('');
const subscribed = ref(false);
function subscribe(e: Event) {
  e.preventDefault();
  if (!email.value) return;
  subscribed.value = true;
  email.value = '';
}
</script>

<template>
  <main>
    <!-- Section 2 : Hero -->
    <section class="relative h-[88vh] min-h-[640px] overflow-hidden bg-misana-stone">
      <img :src="heroImage" alt="" class="absolute inset-0 w-full h-full object-cover" />
      <div class="absolute inset-0 bg-gradient-to-b from-black/35 via-black/10 to-black/55"></div>
      <div class="relative h-full max-w-6xl mx-auto px-6 flex flex-col justify-end pb-24 text-misana-paper">
        <p class="text-xs uppercase tracking-[0.2em] mb-5 opacity-90">{{ t('home.kicker') }}</p>
        <h1 class="font-display text-5xl sm:text-7xl mb-6 leading-[1.05] max-w-3xl">{{ t('home.heroTitle') }}</h1>
        <p class="text-lg sm:text-xl mb-10 max-w-xl opacity-90">{{ t('home.heroLead') }}</p>
        <div class="flex flex-wrap gap-3">
          <NuxtLink :to="localePath('/request')" class="bg-misana-paper text-misana-ink px-7 py-3.5 text-sm tracking-wide hover:bg-misana-paper/90 transition">
            {{ t('nav.request') }} →
          </NuxtLink>
          <NuxtLink :to="localePath('/services/yacht')" class="border border-misana-paper text-misana-paper px-7 py-3.5 text-sm tracking-wide hover:bg-misana-paper hover:text-misana-ink transition">
            {{ t('home.exploreFleet') }}
          </NuxtLink>
        </div>
      </div>
    </section>

    <!-- Section 3 : Search bar -->
    <section class="border-b border-misana-line bg-misana-paper">
      <div class="max-w-6xl mx-auto px-6 -mt-10 sm:-mt-12 relative z-10">
        <form
          class="bg-misana-paper ring-1 ring-misana-line shadow-sm grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-0"
          @submit.prevent="submitSearch"
        >
          <label class="px-5 py-4 border-b sm:border-b-0 sm:border-r border-misana-line block">
            <span class="text-[10px] uppercase tracking-widest text-misana-muted block mb-1">{{ t('home.searchService') }}</span>
            <select v-model="search.service" class="w-full bg-transparent text-sm focus:outline-none">
              <option v-for="s in SERVICES" :key="s.slug" :value="s.slug">
                {{ t(`request.service.${s.slug}`) }}
              </option>
            </select>
          </label>
          <label class="px-5 py-4 border-b sm:border-b-0 sm:border-r border-misana-line block">
            <span class="text-[10px] uppercase tracking-widest text-misana-muted block mb-1">{{ t('home.searchDestination') }}</span>
            <select v-model="search.destination" class="w-full bg-transparent text-sm focus:outline-none">
              <option value="">{{ t('home.searchAnywhere') }}</option>
              <option v-for="c in CITIES" :key="c.slug" :value="c.slug">
                {{ locale === 'fr' ? c.fr : c.en }}
              </option>
            </select>
          </label>
          <label class="px-5 py-4 border-b sm:border-b-0 sm:border-r border-misana-line block">
            <span class="text-[10px] uppercase tracking-widest text-misana-muted block mb-1">{{ t('request.dates.from') }}</span>
            <input v-model="search.from" type="date" class="w-full bg-transparent text-sm focus:outline-none" />
          </label>
          <label class="px-5 py-4 border-b sm:border-b-0 sm:border-r border-misana-line block">
            <span class="text-[10px] uppercase tracking-widest text-misana-muted block mb-1">{{ t('request.dates.to') }}</span>
            <input v-model="search.to" type="date" class="w-full bg-transparent text-sm focus:outline-none" />
          </label>
          <button type="submit" class="bg-misana-ink text-misana-paper text-sm tracking-wide px-6 py-4 hover:bg-misana-ink/90 transition">
            {{ t('home.searchCta') }} →
          </button>
        </form>
        <p class="text-xs text-misana-muted mt-3">{{ t('home.searchNote') }}</p>
      </div>
    </section>

    <!-- Section 3.5 : Five services as full-bleed horizontal sticky panels -->
    <section
      ref="servicesScrollRoot"
      class="relative bg-misana-ink"
      :style="{ height: `${SERVICE_PANELS.length * 100}vh` }"
    >
      <div class="absolute top-0 left-0 right-0 z-20 px-6 pt-10 pointer-events-none">
        <div class="max-w-7xl mx-auto flex items-end justify-between text-misana-paper">
          <p class="text-[11px] tracking-[0.2em] uppercase opacity-80">(MS · 02)</p>
          <p class="font-display text-3xl sm:text-5xl leading-none">
            <span class="opacity-80 italic mr-3">life on</span>
            <span>(Misana)</span>
          </p>
        </div>
      </div>

      <div class="sticky top-0 h-screen w-full overflow-hidden">
        <div
          class="flex h-full will-change-transform"
          :style="{ width: `${SERVICE_PANELS.length * 100}vw`, transform: `translate3d(${panelTranslate}vw, 0, 0)` }"
        >
          <article
            v-for="s in SERVICE_PANELS"
            :key="s.slug"
            class="relative h-full shrink-0"
            :style="{ width: '100vw' }"
          >
            <img :src="s.img" :alt="t(`request.service.${s.slug}`)" class="absolute inset-0 w-full h-full object-cover" style="filter: brightness(0.55)" />
            <div class="relative h-full flex flex-col items-center justify-center text-center text-misana-paper px-6">
              <p class="font-display italic text-2xl sm:text-3xl mb-4 opacity-90">the</p>
              <h3 class="font-display text-6xl sm:text-8xl leading-[0.95] mb-2">
                ({{ t(`request.service.${s.slug}`) }})
              </h3>
              <div class="w-px h-20 bg-misana-paper/70 my-8"></div>
              <p class="max-w-md text-base sm:text-lg leading-relaxed opacity-90 mb-10">
                {{ t(`home.serviceBody.${s.slug}`) }}
              </p>
              <NuxtLink
                :to="localePath(`/services/${s.slug}`)"
                class="group inline-flex items-center gap-10 pb-1 border-b border-misana-paper text-sm tracking-wide"
              >
                <span>{{ t('home.serviceCardCta', { service: t(`request.service.${s.slug}`).toLowerCase() }) }}</span>
                <span class="inline-flex transition-transform duration-700 group-hover:translate-x-2">
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path d="M7 12H17" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" />
                    <path d="M13.5 8.5L17 12L13.5 15.5" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" />
                  </svg>
                </span>
              </NuxtLink>
            </div>
          </article>
        </div>

        <div class="absolute bottom-8 left-0 right-0 z-20 px-6 pointer-events-none">
          <div class="max-w-7xl mx-auto flex items-center gap-3 text-misana-paper text-[11px] tracking-[0.2em] uppercase opacity-90">
            <span>{{ String(Math.round(scrollProgress * (SERVICE_PANELS.length - 1)) + 1).padStart(2, '0') }}</span>
            <div class="flex-1 h-px bg-misana-paper/30 relative">
              <div class="absolute inset-y-0 left-0 bg-misana-paper transition-all duration-150" :style="{ width: `${scrollProgress * 100}%` }"></div>
            </div>
            <span>{{ String(SERVICE_PANELS.length).padStart(2, '0') }}</span>
          </div>
        </div>
      </div>
    </section>

    <!-- Section 4 : Featured carousel with tabs -->
    <section class="border-b border-misana-line">
      <div class="max-w-7xl mx-auto px-6 py-20">
        <div class="flex flex-wrap items-end justify-between gap-6 mb-8">
          <div>
            <p class="text-xs uppercase tracking-widest text-misana-muted mb-2">{{ t('home.featuredKicker') }}</p>
            <h2 class="font-display text-3xl sm:text-4xl">{{ t('home.featuredTitle') }}</h2>
          </div>
          <div class="flex flex-wrap gap-2">
            <button
              v-for="tab in (['yacht','cars','helicopter','access'] as TabKey[])"
              :key="tab"
              type="button"
              class="text-xs uppercase tracking-widest px-4 py-2 border transition"
              :class="activeTab === tab ? 'bg-misana-ink text-misana-paper border-misana-ink' : 'border-misana-line text-misana-ink hover:border-misana-ink'"
              @click="activeTab = tab"
            >
              {{ t(`request.service.${tab}`) }}
            </button>
          </div>
        </div>

        <div class="overflow-x-auto -mx-6 px-6 scrollbar-thin">
          <!-- Yacht -->
          <div v-show="activeTab === 'yacht'" class="flex gap-4 min-w-max">
            <NuxtLink
              v-for="y in featuredYachts"
              :key="y.id"
              :to="localePath(`/services/yacht/${y.id}`)"
              class="group block w-[300px] shrink-0"
            >
              <div class="aspect-[4/5] relative overflow-hidden bg-misana-stone ring-1 ring-misana-line">
                <img :src="y.hero" :alt="y.fullName" loading="lazy" class="absolute inset-0 w-full h-full object-cover transition duration-700 group-hover:scale-[1.03]" />
              </div>
              <div class="pt-3">
                <p class="text-[10px] uppercase tracking-widest text-misana-muted">{{ y.builder }} · {{ y.lengthM }} m</p>
                <p class="text-sm font-medium mt-0.5">{{ y.name }}</p>
                <p class="text-xs text-misana-muted">{{ y.guests }} {{ t('yacht.guests') }} · {{ y.cabins }} {{ t('yacht.cabinsShort') }}</p>
              </div>
            </NuxtLink>
          </div>
          <!-- Cars -->
          <div v-show="activeTab === 'cars'" class="flex gap-4 min-w-max">
            <NuxtLink
              v-for="c in featuredCars"
              :key="c.id"
              :to="localePath(`/services/cars/${c.id}`)"
              class="group block w-[300px] shrink-0"
            >
              <div class="aspect-[4/5] relative overflow-hidden bg-misana-stone ring-1 ring-misana-line">
                <img :src="c.hero" :alt="c.fullName" loading="lazy" class="absolute inset-0 w-full h-full object-cover transition duration-700 group-hover:scale-[1.03]" />
              </div>
              <div class="pt-3">
                <p class="text-[10px] uppercase tracking-widest text-misana-muted">{{ c.brand }}</p>
                <p class="text-sm font-medium mt-0.5">{{ c.model }}</p>
                <p class="text-xs text-misana-muted">{{ c.hp }} hp · {{ c.year }}</p>
              </div>
            </NuxtLink>
          </div>
          <!-- Helicopter -->
          <div v-show="activeTab === 'helicopter'" class="flex gap-4 min-w-max">
            <NuxtLink
              v-for="h in featuredHelis"
              :key="h.id"
              :to="localePath('/services/helicopter')"
              class="group block w-[300px] shrink-0"
            >
              <div class="aspect-[4/5] relative overflow-hidden bg-misana-stone ring-1 ring-misana-line">
                <img :src="h.hero" :alt="h.model" loading="lazy" class="absolute inset-0 w-full h-full object-cover transition duration-700 group-hover:scale-[1.03]" />
              </div>
              <div class="pt-3">
                <p class="text-[10px] uppercase tracking-widest text-misana-muted">{{ h.engine }} engine</p>
                <p class="text-sm font-medium mt-0.5">{{ h.model }}</p>
                <p class="text-xs text-misana-muted">{{ h.pax }} {{ t('yacht.guests') }}</p>
              </div>
            </NuxtLink>
          </div>
          <!-- Access -->
          <div v-show="activeTab === 'access'" class="flex gap-4 min-w-max">
            <NuxtLink
              v-for="a in featuredAccess"
              :key="a.slug"
              :to="localePath(`/services/access/${a.slug}`)"
              class="group block w-[300px] shrink-0"
            >
              <div class="aspect-[4/5] relative overflow-hidden bg-misana-stone ring-1 ring-misana-line">
                <img :src="accessImage(a.slug)" :alt="a.name" loading="lazy" class="absolute inset-0 w-full h-full object-cover transition duration-700 group-hover:scale-[1.03]" />
              </div>
              <div class="pt-3">
                <p class="text-[10px] uppercase tracking-widest text-misana-muted">{{ t(`access.cat.${a.category}`) }}</p>
                <p class="text-sm font-medium mt-0.5">{{ a.name }}</p>
                <p class="text-xs text-misana-muted">{{ CITIES.find((c) => c.slug === a.city)?.[locale === 'fr' ? 'fr' : 'en'] }}</p>
              </div>
            </NuxtLink>
          </div>
        </div>
      </div>
    </section>

    <!-- Section 5 : Value proposition (3 columns) -->
    <section class="border-b border-misana-line bg-misana-stone">
      <div class="max-w-6xl mx-auto px-6 py-20 grid grid-cols-1 sm:grid-cols-3 gap-10">
        <div>
          <p class="font-display text-5xl mb-3">80</p>
          <p class="font-display text-2xl mb-3">{{ t('home.valueScopeTitle') }}</p>
          <p class="text-sm text-misana-muted leading-relaxed">{{ t('home.valueScopeBody') }}</p>
        </div>
        <div>
          <p class="font-display text-5xl mb-3">24</p>
          <p class="font-display text-2xl mb-3">{{ t('home.valueReplyTitle') }}</p>
          <p class="text-sm text-misana-muted leading-relaxed">{{ t('home.valueReplyBody') }}</p>
        </div>
        <div>
          <p class="font-display text-5xl mb-3">·</p>
          <p class="font-display text-2xl mb-3">{{ t('home.valueDiscretionTitle') }}</p>
          <p class="text-sm text-misana-muted leading-relaxed">{{ t('home.valueDiscretionBody') }}</p>
        </div>
      </div>
    </section>

    <!-- Section 6 : Three usage profiles -->
    <section class="border-b border-misana-line">
      <div class="max-w-7xl mx-auto px-6 py-20">
        <div class="max-w-2xl mb-10">
          <p class="text-xs uppercase tracking-widest text-misana-muted mb-2">{{ t('home.profilesKicker') }}</p>
          <h2 class="font-display text-3xl sm:text-4xl mb-4">{{ t('home.profilesTitle') }}</h2>
          <p class="text-misana-muted">{{ t('home.profilesLead') }}</p>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-px bg-misana-line">
          <div v-for="p in profiles" :key="p.key" class="bg-misana-paper p-8">
            <p class="font-display text-2xl mb-3">{{ p.title }}</p>
            <p class="text-sm text-misana-muted leading-relaxed mb-6">{{ p.body }}</p>
            <NuxtLink :to="localePath(p.href)" class="text-sm underline underline-offset-4 hover:text-misana-muted transition">
              {{ t('home.profilesCta') }} →
            </NuxtLink>
          </div>
        </div>
      </div>
    </section>

    <!-- Section 7 : Profile examples carousel (curated weekends) -->
    <section class="border-b border-misana-line bg-misana-stone">
      <div class="max-w-7xl mx-auto px-6 py-20">
        <div class="flex items-end justify-between mb-8">
          <div>
            <p class="text-xs uppercase tracking-widest text-misana-muted mb-2">{{ t('home.weekendsKicker') }}</p>
            <h2 class="font-display text-3xl sm:text-4xl">{{ t('home.weekendsTitle') }}</h2>
          </div>
        </div>
        <div class="overflow-x-auto -mx-6 px-6">
          <div class="flex gap-5 min-w-max">
            <article v-for="w in WEEKENDS" :key="w.slug" class="w-[380px] shrink-0 bg-misana-paper ring-1 ring-misana-line">
              <div class="aspect-[16/10] relative overflow-hidden bg-misana-stone">
                <img :src="weekendImage(w.slug)" :alt="locale === 'fr' ? w.fr : w.en" loading="lazy" class="absolute inset-0 w-full h-full object-cover" />
              </div>
              <div class="p-6">
                <p class="text-[10px] uppercase tracking-widest text-misana-muted mb-2">{{ t('home.weekendBadge') }}</p>
                <p class="font-display text-2xl mb-3">{{ locale === 'fr' ? w.fr : w.en }}</p>
                <p class="text-sm text-misana-muted leading-relaxed">{{ locale === 'fr' ? w.blurbFr : w.blurbEn }}</p>
              </div>
            </article>
          </div>
        </div>
      </div>
    </section>

    <!-- Section 8 : Concierge CTA -->
    <section class="border-b border-misana-line">
      <div class="max-w-4xl mx-auto px-6 py-20 text-center">
        <p class="text-xs uppercase tracking-widest text-misana-muted mb-3">{{ t('home.conciergeKicker') }}</p>
        <h2 class="font-display text-3xl sm:text-4xl mb-5">{{ t('home.conciergeTitle') }}</h2>
        <p class="text-misana-muted max-w-2xl mx-auto mb-8">{{ t('home.conciergeLead') }}</p>
        <NuxtLink :to="localePath('/contact')" class="inline-block border border-misana-ink px-7 py-3.5 text-sm tracking-wide hover:bg-misana-ink hover:text-misana-paper transition">
          {{ t('home.conciergeCta') }} →
        </NuxtLink>
      </div>
    </section>

    <!-- Section 9 : Concierge experience carousel (heavy events) -->
    <section class="border-b border-misana-line bg-misana-stone">
      <div class="max-w-7xl mx-auto px-6 py-20">
        <div class="flex items-end justify-between mb-8">
          <div>
            <p class="text-xs uppercase tracking-widest text-misana-muted mb-2">{{ t('home.eventsKicker') }}</p>
            <h2 class="font-display text-3xl sm:text-4xl">{{ t('home.eventsTitle') }}</h2>
          </div>
          <NuxtLink :to="localePath('/events')" class="hidden sm:block text-sm underline underline-offset-4 hover:text-misana-muted transition">
            {{ t('home.allEvents') }} →
          </NuxtLink>
        </div>
        <div class="overflow-x-auto -mx-6 px-6">
          <div class="flex gap-4 min-w-max">
            <NuxtLink
              v-for="ev in heavyEvents"
              :key="ev.slug"
              :to="localePath(`/events/${ev.slug}`)"
              class="group block w-[320px] shrink-0"
            >
              <div class="aspect-[4/3] relative overflow-hidden bg-misana-paper ring-1 ring-misana-line">
                <img :src="eventImage(ev.slug)" :alt="locale === 'fr' ? ev.fr : ev.en" loading="lazy" class="absolute inset-0 w-full h-full object-cover transition duration-700 group-hover:scale-[1.03]" />
              </div>
              <div class="pt-3">
                <p class="text-[10px] uppercase tracking-widest text-misana-muted">{{ locale === 'fr' ? ev.monthFr : ev.monthEn }} · {{ locale === 'fr' ? ev.cityFr : ev.cityEn }}</p>
                <p class="text-base font-medium mt-1">{{ locale === 'fr' ? ev.fr : ev.en }}</p>
              </div>
            </NuxtLink>
          </div>
        </div>
      </div>
    </section>

    <!-- Section 10 : Trending destinations grid with view-more -->
    <section class="border-b border-misana-line">
      <div class="max-w-7xl mx-auto px-6 py-20">
        <div class="flex items-end justify-between mb-8">
          <div>
            <p class="text-xs uppercase tracking-widest text-misana-muted mb-2">{{ t('home.destinationsKicker') }}</p>
            <h2 class="font-display text-3xl sm:text-4xl">{{ t('home.destinationsTitle') }}</h2>
          </div>
          <NuxtLink :to="localePath('/destinations')" class="hidden sm:block text-sm underline underline-offset-4 hover:text-misana-muted transition">
            {{ t('home.allDestinations') }} →
          </NuxtLink>
        </div>

        <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          <NuxtLink
            v-for="ct in heavyCities"
            :key="ct.slug"
            :to="localePath(`/destinations/${ct.slug}`)"
            class="group block aspect-[4/5] relative overflow-hidden bg-misana-stone"
          >
            <img :src="cityImage(ct.slug)" :alt="locale === 'fr' ? ct.fr : ct.en" loading="lazy" class="absolute inset-0 w-full h-full object-cover transition duration-700 group-hover:scale-[1.04]" />
            <div class="absolute inset-0 bg-gradient-to-t from-black/65 via-black/10 to-transparent"></div>
            <div class="absolute bottom-5 left-5 right-5 text-misana-paper">
              <p class="text-[10px] uppercase tracking-widest opacity-80 mb-1">{{ t('home.cityHeavy') }}</p>
              <p class="font-display text-2xl">{{ locale === 'fr' ? ct.fr : ct.en }}</p>
            </div>
          </NuxtLink>
          <template v-if="showAllCities">
            <NuxtLink
              v-for="ct in stubCities"
              :key="ct.slug"
              :to="localePath(`/destinations/${ct.slug}`)"
              class="group block aspect-[4/5] relative overflow-hidden bg-misana-stone"
            >
              <img :src="cityImage(ct.slug)" :alt="locale === 'fr' ? ct.fr : ct.en" loading="lazy" class="absolute inset-0 w-full h-full object-cover transition duration-700 group-hover:scale-[1.04]" />
              <div class="absolute inset-0 bg-gradient-to-t from-black/65 via-black/10 to-transparent"></div>
              <div class="absolute bottom-5 left-5 right-5 text-misana-paper">
                <p class="text-[10px] uppercase tracking-widest opacity-80 mb-1">{{ t('home.cityStub') }}</p>
                <p class="font-display text-2xl">{{ locale === 'fr' ? ct.fr : ct.en }}</p>
              </div>
            </NuxtLink>
          </template>
        </div>
        <div class="mt-8 text-center">
          <button
            type="button"
            class="text-sm underline underline-offset-4 hover:text-misana-muted transition"
            @click="showAllCities = !showAllCities"
          >
            {{ showAllCities ? t('home.viewLess') : t('home.viewMore') }} →
          </button>
        </div>
      </div>
    </section>

    <!-- Section 11 : Property partners CTA (B2B : palaces, villas, restaurants) -->
    <section class="border-b border-misana-line">
      <div class="max-w-7xl mx-auto px-6 py-20 grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
        <div class="aspect-[4/3] relative overflow-hidden bg-misana-stone">
          <img src="https://images.unsplash.com/photo-1596178065887-1198b6148b2b?w=1200&q=80" alt="" loading="lazy" class="absolute inset-0 w-full h-full object-cover" />
        </div>
        <div>
          <p class="text-xs uppercase tracking-widest text-misana-muted mb-3">{{ t('home.partnersKicker') }}</p>
          <h2 class="font-display text-3xl sm:text-4xl mb-5">{{ t('home.partnersTitle') }}</h2>
          <p class="text-misana-muted leading-relaxed mb-8 max-w-lg">{{ t('home.partnersBody') }}</p>
          <NuxtLink :to="localePath('/contact')" class="inline-block border border-misana-ink px-7 py-3.5 text-sm tracking-wide hover:bg-misana-ink hover:text-misana-paper transition">
            {{ t('home.partnersCta') }} →
          </NuxtLink>
        </div>
      </div>
    </section>

    <!-- Section 12 : Press mentions -->
    <section class="border-b border-misana-line bg-misana-stone">
      <div class="max-w-7xl mx-auto px-6 py-12">
        <p class="text-[10px] uppercase tracking-widest text-misana-muted text-center mb-6">{{ t('home.pressKicker') }}</p>
        <div class="overflow-x-auto">
          <div class="flex items-center justify-around gap-12 min-w-max px-4">
            <span v-for="p in pressMentions" :key="p" class="font-display text-xl text-misana-muted/70 italic shrink-0">
              {{ p }}
            </span>
          </div>
        </div>
      </div>
    </section>

    <!-- Section 13 : Certifications -->
    <section class="border-b border-misana-line">
      <div class="max-w-3xl mx-auto px-6 py-16 text-center">
        <p class="text-xs uppercase tracking-widest text-misana-muted mb-4">{{ t('home.certificationsKicker') }}</p>
        <p class="font-display text-2xl mb-8">{{ t('home.certificationsTitle') }}</p>
        <div class="flex items-center justify-center gap-12">
          <div class="w-24 h-24 ring-1 ring-misana-line flex items-center justify-center text-[10px] uppercase tracking-widest text-misana-muted">
            {{ t('home.certBadge1') }}
          </div>
          <div class="w-24 h-24 ring-1 ring-misana-line flex items-center justify-center text-[10px] uppercase tracking-widest text-misana-muted">
            {{ t('home.certBadge2') }}
          </div>
        </div>
      </div>
    </section>

    <!-- Section 14 : Direct contact (replacement for the app download promo) -->
    <section class="border-b border-misana-line bg-misana-ink text-misana-paper">
      <div class="max-w-7xl mx-auto px-6 py-20 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <div>
          <p class="text-xs uppercase tracking-widest opacity-70 mb-3">{{ t('home.reachKicker') }}</p>
          <h2 class="font-display text-3xl sm:text-4xl mb-5">{{ t('home.reachTitle') }}</h2>
          <p class="opacity-80 leading-relaxed mb-8 max-w-lg">{{ t('home.reachBody') }}</p>
          <div class="flex flex-wrap gap-3">
            <NuxtLink :to="localePath('/request')" class="bg-misana-paper text-misana-ink px-7 py-3.5 text-sm tracking-wide hover:bg-misana-paper/90 transition">
              {{ t('nav.request') }} →
            </NuxtLink>
            <a href="mailto:hello@misana.com" class="border border-misana-paper px-7 py-3.5 text-sm tracking-wide hover:bg-misana-paper hover:text-misana-ink transition">
              {{ t('home.reachEmail') }}
            </a>
          </div>
        </div>
        <div class="grid grid-cols-2 gap-px bg-misana-paper/20">
          <div class="bg-misana-ink p-6">
            <p class="text-[10px] uppercase tracking-widest opacity-60 mb-2">{{ t('home.reachPhoneLabel') }}</p>
            <p class="font-display text-xl">+33 4 00 00 00 00</p>
          </div>
          <div class="bg-misana-ink p-6">
            <p class="text-[10px] uppercase tracking-widest opacity-60 mb-2">{{ t('home.reachWhatsappLabel') }}</p>
            <p class="font-display text-xl">+33 6 00 00 00 00</p>
          </div>
          <div class="bg-misana-ink p-6">
            <p class="text-[10px] uppercase tracking-widest opacity-60 mb-2">{{ t('home.reachEmailLabel') }}</p>
            <p class="font-display text-xl">hello@misana.com</p>
          </div>
          <div class="bg-misana-ink p-6">
            <p class="text-[10px] uppercase tracking-widest opacity-60 mb-2">{{ t('home.reachHoursLabel') }}</p>
            <p class="font-display text-xl">{{ t('home.reachHours') }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Section 15 : Newsletter -->
    <section class="border-b border-misana-line">
      <div class="max-w-2xl mx-auto px-6 py-20 text-center">
        <p class="text-xs uppercase tracking-widest text-misana-muted mb-3">{{ t('home.newsletterKicker') }}</p>
        <h2 class="font-display text-3xl sm:text-4xl mb-4">{{ t('home.newsletterTitle') }}</h2>
        <p class="text-misana-muted mb-8">{{ t('home.newsletterLead') }}</p>
        <form v-if="!subscribed" class="flex flex-col sm:flex-row gap-3 max-w-md mx-auto" @submit="subscribe">
          <input
            v-model="email"
            type="email"
            required
            :placeholder="t('home.newsletterPlaceholder')"
            class="flex-1 px-4 py-3 ring-1 ring-misana-line focus:ring-misana-ink focus:outline-none text-sm bg-misana-paper"
          />
          <button type="submit" class="bg-misana-ink text-misana-paper px-6 py-3 text-sm tracking-wide hover:bg-misana-ink/90 transition">
            {{ t('home.newsletterCta') }}
          </button>
        </form>
        <p v-else class="text-sm text-misana-muted">{{ t('home.newsletterThanks') }}</p>
      </div>
    </section>
  </main>
</template>

<style scoped>
.scrollbar-thin::-webkit-scrollbar { height: 6px; }
.scrollbar-thin::-webkit-scrollbar-track { background: transparent; }
.scrollbar-thin::-webkit-scrollbar-thumb { background: var(--color-misana-line); }
</style>
