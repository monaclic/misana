<script setup lang="ts">
// Homepage Misana V2 - refonte editoriale.
// 1) Sticky services hero (5 panels reveal)
// 2) Cities band
// 3) Service feature : Helicopter
// 4) Service feature : Yacht
// 5) Service feature : Cars
// 6) Service feature : Chauffeur
// 7) Events timeline
// 8) Access top picks
// 9) Full request form
// 10) Latest guides
// Footer via default layout (AppFooter enrichi).
import { CITIES, EVENTS, ESTABLISHMENTS, TRANSFERS } from '~/lib/constants';
import { RENTAL_CARS } from '~/lib/rentalCars';
import { YACHTS } from '~/lib/yachts';

definePageMeta({ layout: 'default' });

const { locale, t } = useI18n();
const localePath = useLocalePath();

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
    }),
  }],
});

// --- Services sticky stack (acts as hero) ---
// First panel : maison intro ("we orchestrate everything"). Then five services.
type HeroPanel =
  | { kind: 'intro'; img: string }
  | { kind: 'service'; slug: 'chauffeur' | 'cars' | 'yacht' | 'helicopter' | 'access'; img: string };

const SERVICE_PANELS: HeroPanel[] = [
  { kind: 'intro',   img: 'https://images.unsplash.com/photo-1499678329028-101435549a4e?w=2400&q=80' },
  { kind: 'service', slug: 'helicopter', img: 'https://images.unsplash.com/photo-1540979388789-6cee28a1cdc9?w=2000&q=80' },
  { kind: 'service', slug: 'yacht',      img: 'https://images.unsplash.com/photo-1567899378494-47b22a2ae96a?w=2000&q=80' },
  { kind: 'service', slug: 'cars',       img: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=2000&q=80' },
  { kind: 'service', slug: 'chauffeur',  img: 'https://images.unsplash.com/photo-1605515298946-d062f2e9da53?w=2000&q=80' },
  { kind: 'service', slug: 'access',     img: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=2000&q=80' },
];

const panelRefs = ref<HTMLElement[]>([]);
const revealed = ref<Set<number>>(new Set());
const activePanel = ref(0);
let panelObserver: IntersectionObserver | null = null;

const heroSection = ref<HTMLElement | null>(null);
let heroObserver: IntersectionObserver | null = null;
// AppHeader seeds this from the route. Here we only flip it as the user
// scrolls past the hero (opaque header on subsequent sections).
const headerTransparent = useState<boolean>('header-transparent', () => true);

// Hide the (MS · 01) + life with Misana overlay as soon as the user scrolls
// downward at all. No fancy animation : it just disappears.
const atTop = ref(true);
let atTopRaf = 0;
function updateAtTop() {
  atTop.value = window.scrollY <= 1;
}
function onScrollAtTop() {
  cancelAnimationFrame(atTopRaf);
  atTopRaf = requestAnimationFrame(updateAtTop);
}

function setPanelRef(el: Element | null, idx: number) {
  if (el) panelRefs.value[idx] = el as HTMLElement;
}

// Generic reveal observer for any element marked with [data-reveal-on-scroll].
const revealOnScroll = ref<IntersectionObserver | null>(null);

onMounted(() => {
  panelObserver = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        const idx = Number((e.target as HTMLElement).dataset.idx);
        if (e.isIntersecting && e.intersectionRatio > 0.45) {
          if (!revealed.value.has(idx)) {
            const next = new Set(revealed.value);
            next.add(idx);
            revealed.value = next;
          }
          activePanel.value = idx;
        }
      }
    },
    { threshold: [0, 0.45, 0.7, 1] },
  );
  panelRefs.value.forEach((el) => el && panelObserver?.observe(el));

  revealOnScroll.value = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (e.isIntersecting) {
          (e.target as HTMLElement).dataset.revealed = 'true';
          revealOnScroll.value?.unobserve(e.target);
        }
      }
    },
    { threshold: 0.18 },
  );
  document.querySelectorAll('[data-reveal-on-scroll]').forEach((el) => {
    revealOnScroll.value?.observe(el);
  });

  // Toggle header transparency while the hero section overlaps the viewport.
  if (heroSection.value) {
    heroObserver = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          headerTransparent.value = e.isIntersecting && e.intersectionRatio > 0;
        }
      },
      { threshold: [0, 0.01] },
    );
    heroObserver.observe(heroSection.value);
  }

  window.addEventListener('scroll', onScrollAtTop, { passive: true });
  updateAtTop();
});
onBeforeUnmount(() => {
  panelObserver?.disconnect();
  panelObserver = null;
  revealOnScroll.value?.disconnect();
  revealOnScroll.value = null;
  heroObserver?.disconnect();
  heroObserver = null;
  headerTransparent.value = false;
  window.removeEventListener('scroll', onScrollAtTop);
  cancelAnimationFrame(atTopRaf);
});

// --- Cities ---
const heavyCities = computed(() => CITIES.filter((c) => c.tier === 'heavy'));
const stubCities = computed(() => CITIES.filter((c) => c.tier !== 'heavy'));
// V1 placeholders (CLAUDE.md). Picsum guarantees reliable loading per seed.
// Swap to actual photoshoot assets when available.
const cityImage = (slug: string) => `https://picsum.photos/seed/misana-${slug}/1200/1500`;

// --- Cities slider (one full-bleed slide at a time) ---
const activeCity = ref(0);
function nextCity() {
  activeCity.value = (activeCity.value + 1) % CITIES.length;
}
function prevCity() {
  activeCity.value = (activeCity.value - 1 + CITIES.length) % CITIES.length;
}

// --- Featured per service for the dedicated sections ---
const heliCards = [
  { id: 'NCE', name: 'Nice', heliport: 'Heliport NCE', img: 'https://images.unsplash.com/photo-1531642765602-5cae8bbbf285?w=900&q=80' },
  { id: 'MCM', name: 'Monaco', heliport: 'Heliport Monaco', img: 'https://images.unsplash.com/photo-1583245177184-43be75e6e15c?w=900&q=80' },
  { id: 'CEQ', name: 'Cannes', heliport: 'Mandelieu / Quai du Large', img: 'https://images.unsplash.com/photo-1521405617584-1d9ca2cfd00f?w=900&q=80' },
  { id: 'LTT', name: 'Saint-Tropez', heliport: 'La Mole / Grimaud', img: 'https://images.unsplash.com/photo-1544552866-d3ed42536cfd?w=900&q=80' },
];

const featuredYachts = computed(() =>
  YACHTS.filter((y) => y.badge === 'flagship' || y.badge === 'popular').slice(0, 3),
);
const featuredCars = computed(() =>
  RENTAL_CARS.filter((c) => c.badge === 'flagship' || c.badge === 'popular').slice(0, 3),
);

const popularRoutes = computed(() => {
  const wanted = ['nice-airport-monaco', 'nice-airport-saint-tropez', 'nice-airport-cannes', 'monaco-saint-tropez'];
  return wanted.map((slug) => TRANSFERS.find((tr) => tr.slug === slug)).filter(Boolean) as Array<typeof TRANSFERS[number]>;
});

// --- Events timeline ---
const timelineEvents = computed(() => {
  return [...EVENTS].sort((a, b) => a.monthOrder - b.monthOrder).map((e) => {
    const city = CITIES.find((c) => c.slug === e.city);
    return { ...e, cityEn: city?.en ?? '', cityFr: city?.fr ?? '' };
  });
});
const eventThumb = (slug: string) => `https://picsum.photos/seed/misana-evt-${slug}/600/400`;

// --- Access top picks ---
const topAccess = [
  { slug: 'le-louis-xv', img: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=900&q=80' },
  { slug: 'cap-eden-roc', img: 'https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=900&q=80' },
  { slug: 'club-55', img: 'https://images.unsplash.com/photo-1530541930197-ff16ac917b0e?w=900&q=80' },
  { slug: 'la-vague-d-or', img: 'https://images.unsplash.com/photo-1543007630-9710e4a00a20?w=900&q=80' },
  { slug: 'mirazur', img: 'https://images.unsplash.com/photo-1559339352-11d035aa65de?w=900&q=80' },
  { slug: 'jimmy-z', img: 'https://images.unsplash.com/photo-1545128485-c400e7702796?w=900&q=80' },
];
const accessByCity = (citySlug: string) => CITIES.find((c) => c.slug === citySlug);

// --- Latest guides (placeholders for V1, journal not yet populated) ---
const guides = [
  { slug: 'a-week-in-cannes', titleEn: 'A week in Cannes, considered.', titleFr: 'Une semaine à Cannes, pensée.', kindEn: 'Guide', kindFr: 'Guide', img: 'https://images.unsplash.com/photo-1568084680786-a84f91d1153c?w=900&q=80' },
  { slug: 'helicopter-routes-of-the-coast', titleEn: 'The helicopter routes of the coast.', titleFr: 'Les routes hélicoptère de la côte.', kindEn: 'Note', kindFr: 'Note', img: 'https://images.unsplash.com/photo-1473162404599-0e3a89d0fb9c?w=900&q=80' },
  { slug: 'three-tables-in-monaco', titleEn: 'Three tables in Monaco.', titleFr: 'Trois tables à Monaco.', kindEn: 'Address', kindFr: 'Adresse', img: 'https://images.unsplash.com/photo-1559339352-11d035aa65de?w=900&q=80' },
];
</script>

<template>
  <main>
    <!-- Visually hidden h1 for SEO ; the visible heading is inside the sticky panels. -->
    <h1 class="sr-only">{{ t('brand.name') }} · {{ t('brand.longTagline') }}</h1>

    <!-- ============================================== -->
    <!-- 1. SERVICES HERO (sticky vertical stack)        -->
    <!-- ============================================== -->
    <!-- -mt-16 pulls the hero up under the transparent (sticky) header so
         the page starts at the very top of the viewport with no white band. -->
    <section ref="heroSection" class="services-stack relative bg-misana-ink text-misana-paper -mt-16">
      <article
        v-for="(s, idx) in SERVICE_PANELS"
        :key="s.kind === 'intro' ? 'intro' : s.slug"
        :ref="(el) => setPanelRef(el as Element | null, idx)"
        :data-idx="idx"
        :data-revealed="revealed.has(idx) ? 'true' : 'false'"
        class="services-panel sticky top-0 h-screen overflow-hidden"
        :style="{ zIndex: 10 + idx }"
      >
        <img
          :src="s.img"
          :alt="s.kind === 'intro' ? t('home.heroIntroTitle') : t(`request.service.${s.slug}`)"
          class="absolute inset-0 w-full h-full object-cover services-panel-img"
        />
        <div class="absolute inset-0 bg-misana-ink/45"></div>

        <!-- Intro panel : centered maison statement -->
        <div v-if="s.kind === 'intro'" class="relative h-full flex flex-col items-center justify-center text-center px-6">
          <div class="overflow-hidden">
            <h2 class="reveal font-display text-5xl sm:text-7xl lg:text-8xl leading-[0.95]" data-delay="1">
              {{ t('home.heroIntroTitle') }}
            </h2>
          </div>
          <div class="reveal-line w-px h-16 sm:h-20 bg-misana-paper/70 my-8 sm:my-9" data-delay="2"></div>
          <div class="overflow-hidden max-w-2xl">
            <p class="reveal font-display text-xl sm:text-2xl lg:text-3xl leading-[1.3] opacity-95" data-delay="3">
              {{ t('home.heroIntroBody') }}
            </p>
          </div>
          <div class="overflow-hidden mt-8">
            <p class="reveal text-sm sm:text-base opacity-70 max-w-md" data-delay="4">
              {{ t('home.heroIntroSub') }}
            </p>
          </div>
        </div>

        <!-- Service panel -->
        <div v-else class="relative h-full flex flex-col items-center justify-center text-center px-6">
          <div class="overflow-hidden">
            <p class="reveal" data-delay="1">
              <span class="font-display italic text-xl sm:text-2xl opacity-90">the</span>
            </p>
          </div>
          <div class="overflow-hidden mt-1">
            <h2 class="reveal font-display text-6xl sm:text-8xl leading-[0.95]" data-delay="2">
              ({{ t(`request.service.${s.slug}`) }})
            </h2>
          </div>
          <div class="reveal-line w-px h-16 sm:h-20 bg-misana-paper/70 my-8 sm:my-9" data-delay="3"></div>
          <div class="overflow-hidden max-w-md">
            <p class="reveal text-base sm:text-lg leading-relaxed opacity-90" data-delay="4">
              {{ t(`home.serviceBody.${s.slug}`) }}
            </p>
          </div>
          <div class="overflow-hidden mt-10">
            <NuxtLink
              :to="localePath(`/services/${s.slug}`)"
              class="reveal group inline-flex items-center gap-8 pb-2 border-b-[1.5px] border-misana-paper text-base sm:text-lg tracking-wide"
              data-delay="5"
            >
              <span>{{ t('home.serviceCardCta', { service: t(`request.service.${s.slug}`).toLowerCase() }) }}</span>
              <span class="inline-flex items-center justify-center w-[1.1em] h-[1.1em] translate-y-[0.12em] transition-transform duration-700 group-hover:translate-x-2">
                <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" class="block w-full h-full">
                  <path d="M7 12H17" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
                  <path d="M13.5 8.5L17 12L13.5 15.5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" />
                </svg>
              </span>
            </NuxtLink>
          </div>
        </div>
      </article>

    </section>

    <!-- Footer overlay for the sticky hero : pinned to viewport bottom while hero is in view. -->
    <Teleport to="body">
      <Transition
        enter-active-class="transition duration-500"
        enter-from-class="opacity-0 translate-y-4"
        leave-active-class="transition duration-300"
        leave-to-class="opacity-0"
      >
        <div
          v-show="headerTransparent && activePanel === 0 && atTop"
          style="position:fixed;bottom:0;left:0;right:0;z-index:50;pointer-events:none"
        >
          <div class="max-w-7xl mx-auto px-6 pb-8 sm:pb-10 flex items-end justify-between text-white">
            <p class="text-[11px] tracking-[0.2em] uppercase opacity-80">(MS · 01)</p>
            <p class="font-display text-2xl sm:text-4xl leading-none">
              <span class="opacity-80 italic mr-2 sm:mr-3">life with</span>
              <span>(Misana)</span>
            </p>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- ============================================== -->
    <!-- 2. CITIES SLIDER (one full-bleed slide at a time) -->
    <!-- ============================================== -->
    <section class="border-t border-b border-misana-line bg-misana-paper">
      <div class="max-w-7xl mx-auto px-6 pt-20 sm:pt-24" data-reveal-on-scroll>
        <div class="flex flex-wrap items-end justify-between gap-6 mb-12 reveal-block">
          <div class="max-w-2xl">
            <p class="text-[11px] uppercase tracking-[0.25em] text-misana-muted mb-3">(MS · 02) · {{ t('home.citiesKicker') }}</p>
            <h2 class="font-display text-4xl sm:text-6xl leading-[1.02]">{{ t('home.citiesTitle') }}</h2>
            <p class="text-misana-muted mt-4 max-w-lg">{{ t('home.citiesLead') }}</p>
          </div>
          <NuxtLink :to="localePath('/destinations')" class="inline-flex items-center gap-2.5 text-base underline underline-offset-4 hover:text-misana-muted transition">
            {{ t('home.allDestinations') }}
            <span class="inline-flex items-center justify-center w-[1.1em] h-[1.1em] translate-y-[0.12em]">
              <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" class="block w-full h-full">
                <path d="M7 12H17" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
                <path d="M13.5 8.5L17 12L13.5 15.5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
            </span>
          </NuxtLink>
        </div>
      </div>

      <!-- Slider -->
      <div class="relative pb-20 sm:pb-24" data-reveal-on-scroll>
        <div class="reveal-block relative h-[68vh] sm:h-[78vh] overflow-hidden bg-misana-stone">
          <div
            class="flex h-full transition-transform duration-700 ease-[cubic-bezier(0.65,0,0.35,1)] will-change-transform"
            :style="{ transform: `translate3d(-${activeCity * 100}%, 0, 0)` }"
          >
            <article
              v-for="c in CITIES"
              :key="c.slug"
              class="w-full shrink-0 h-full relative"
            >
              <NuxtLink :to="localePath(`/destinations/${c.slug}`)" class="block h-full relative group">
                <img
                  :src="cityImage(c.slug)"
                  :alt="locale === 'fr' ? c.fr : c.en"
                  loading="lazy"
                  class="absolute inset-0 w-full h-full object-cover transition duration-1000 group-hover:scale-[1.03]"
                />
                <div class="absolute inset-0 bg-gradient-to-t from-black/65 via-black/15 to-transparent"></div>
                <div class="absolute bottom-12 sm:bottom-16 left-8 sm:left-16 right-8 sm:right-16 text-misana-paper">
                  <p class="text-[11px] uppercase tracking-[0.25em] opacity-85 mb-3">
                    {{ c.tier === 'heavy' ? t('home.cityHeavy') : t('home.cityStub') }} · {{ locale === 'fr' ? c.blurbFr : c.blurbEn }}
                  </p>
                  <h3 class="font-display text-5xl sm:text-7xl lg:text-8xl leading-[0.95]">
                    {{ locale === 'fr' ? c.fr : c.en }}
                  </h3>
                </div>
              </NuxtLink>
            </article>
          </div>

          <!-- Arrows -->
          <button
            type="button"
            class="absolute left-4 sm:left-6 top-1/2 -translate-y-1/2 w-12 h-12 flex items-center justify-center rounded-full bg-misana-paper/15 backdrop-blur-sm text-misana-paper hover:bg-misana-paper/30 transition"
            :aria-label="t('home.citiesPrev')"
            @click="prevCity"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M17 12H7" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" />
              <path d="M10.5 8.5L7 12L10.5 15.5" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          </button>
          <button
            type="button"
            class="absolute right-4 sm:right-6 top-1/2 -translate-y-1/2 w-12 h-12 flex items-center justify-center rounded-full bg-misana-paper/15 backdrop-blur-sm text-misana-paper hover:bg-misana-paper/30 transition"
            :aria-label="t('home.citiesNext')"
            @click="nextCity"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M7 12H17" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" />
              <path d="M13.5 8.5L17 12L13.5 15.5" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          </button>

          <!-- Counter top right + dots bottom -->
          <div class="absolute top-6 right-6 sm:top-8 sm:right-8 text-misana-paper font-display text-base sm:text-lg flex items-baseline gap-1 tabular-nums">
            <span>{{ String(activeCity + 1).padStart(2, '0') }}</span>
            <span class="opacity-50">/</span>
            <span class="opacity-70">{{ String(CITIES.length).padStart(2, '0') }}</span>
          </div>

          <div class="absolute bottom-6 left-0 right-0 flex items-center justify-center gap-2">
            <button
              v-for="(c, idx) in CITIES"
              :key="c.slug"
              type="button"
              class="h-1.5 rounded-full transition-all duration-500"
              :class="activeCity === idx ? 'w-8 bg-misana-paper' : 'w-1.5 bg-misana-paper/45 hover:bg-misana-paper/70'"
              :aria-label="`${t('home.citiesGoTo')} ${locale === 'fr' ? c.fr : c.en}`"
              @click="activeCity = idx"
            ></button>
          </div>
        </div>
      </div>
    </section>

    <!-- ============================================== -->
    <!-- 3. SERVICE FEATURE : HELICOPTER                 -->
    <!-- ============================================== -->
    <section class="border-b border-misana-line bg-misana-stone">
      <div class="max-w-7xl mx-auto px-6 py-24 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center" data-reveal-on-scroll>
        <div class="lg:col-span-5 reveal-block">
          <p class="text-[11px] uppercase tracking-[0.2em] text-misana-muted mb-3">(MS · 03) · {{ t('home.heliKicker') }}</p>
          <h2 class="font-display text-4xl sm:text-5xl leading-[1.05] mb-6">{{ t('home.heliTitle') }}</h2>
          <p class="text-misana-muted leading-relaxed mb-8 max-w-md">{{ t('home.heliBody') }}</p>
          <NuxtLink :to="localePath('/services/helicopter')" class="inline-block border border-misana-ink px-6 py-3 text-sm tracking-wide hover:bg-misana-ink hover:text-misana-paper transition">
            {{ t('home.heliCta') }} →
          </NuxtLink>
        </div>
        <div class="lg:col-span-7 grid grid-cols-2 gap-3 sm:gap-4 reveal-block">
          <div v-for="h in heliCards" :key="h.id" class="aspect-[4/5] relative overflow-hidden bg-misana-paper">
            <img :src="h.img" :alt="h.name" loading="lazy" class="absolute inset-0 w-full h-full object-cover" />
            <div class="absolute inset-0 bg-gradient-to-t from-black/65 to-transparent"></div>
            <div class="absolute bottom-4 left-4 right-4 text-misana-paper">
              <p class="text-[10px] uppercase tracking-[0.2em] opacity-80">{{ h.heliport }}</p>
              <p class="font-display text-xl">{{ h.name }}</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ============================================== -->
    <!-- 4. SERVICE FEATURE : YACHT                      -->
    <!-- ============================================== -->
    <section class="border-b border-misana-line bg-misana-paper">
      <div class="max-w-7xl mx-auto px-6 py-24 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center" data-reveal-on-scroll>
        <div class="lg:col-span-7 order-2 lg:order-1 grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 reveal-block">
          <NuxtLink
            v-for="y in featuredYachts"
            :key="y.id"
            :to="localePath(`/services/yacht/${y.id}`)"
            class="group block bg-misana-stone"
          >
            <div class="aspect-[3/4] relative overflow-hidden">
              <img :src="y.hero" :alt="y.fullName" loading="lazy" class="absolute inset-0 w-full h-full object-cover transition duration-700 group-hover:scale-[1.04]" />
            </div>
            <div class="p-3">
              <p class="text-[10px] uppercase tracking-[0.2em] text-misana-muted">{{ y.builder }} · {{ y.lengthM }} m</p>
              <p class="text-sm font-medium mt-0.5">{{ y.name }}</p>
            </div>
          </NuxtLink>
        </div>
        <div class="lg:col-span-5 order-1 lg:order-2 reveal-block">
          <p class="text-[11px] uppercase tracking-[0.2em] text-misana-muted mb-3">(MS · 04) · {{ t('home.yachtKicker') }}</p>
          <h2 class="font-display text-4xl sm:text-5xl leading-[1.05] mb-6">{{ t('home.yachtTitle') }}</h2>
          <p class="text-misana-muted leading-relaxed mb-8 max-w-md">{{ t('home.yachtBody') }}</p>
          <NuxtLink :to="localePath('/services/yacht')" class="inline-block border border-misana-ink px-6 py-3 text-sm tracking-wide hover:bg-misana-ink hover:text-misana-paper transition">
            {{ t('home.yachtCta') }} →
          </NuxtLink>
        </div>
      </div>
    </section>

    <!-- ============================================== -->
    <!-- 5. SERVICE FEATURE : CARS (location vehicule luxe) -->
    <!-- ============================================== -->
    <section class="border-b border-misana-line bg-misana-stone">
      <div class="max-w-7xl mx-auto px-6 py-24 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center" data-reveal-on-scroll>
        <div class="lg:col-span-5 reveal-block">
          <p class="text-[11px] uppercase tracking-[0.2em] text-misana-muted mb-3">(MS · 05) · {{ t('home.carsKicker') }}</p>
          <h2 class="font-display text-4xl sm:text-5xl leading-[1.05] mb-6">{{ t('home.carsFeatTitle') }}</h2>
          <p class="text-misana-muted leading-relaxed mb-8 max-w-md">{{ t('home.carsFeatBody') }}</p>
          <NuxtLink :to="localePath('/services/cars')" class="inline-block border border-misana-ink px-6 py-3 text-sm tracking-wide hover:bg-misana-ink hover:text-misana-paper transition">
            {{ t('home.carsFeatCta') }} →
          </NuxtLink>
        </div>
        <div class="lg:col-span-7 grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 reveal-block">
          <NuxtLink
            v-for="c in featuredCars"
            :key="c.id"
            :to="localePath(`/services/cars/${c.id}`)"
            class="group block bg-misana-paper"
          >
            <div class="aspect-[4/3] relative overflow-hidden">
              <img :src="c.hero" :alt="c.fullName" loading="lazy" class="absolute inset-0 w-full h-full object-cover transition duration-700 group-hover:scale-[1.04]" />
            </div>
            <div class="p-3">
              <p class="text-[10px] uppercase tracking-[0.2em] text-misana-muted">{{ c.brand }}</p>
              <p class="text-sm font-medium mt-0.5">{{ c.model }}</p>
              <p class="text-[11px] text-misana-muted mt-0.5">{{ c.hp }} hp · {{ c.year }}</p>
            </div>
          </NuxtLink>
        </div>
      </div>
    </section>

    <!-- ============================================== -->
    <!-- 6. SERVICE FEATURE : CHAUFFEUR                  -->
    <!-- ============================================== -->
    <section class="border-b border-misana-line bg-misana-paper">
      <div class="max-w-7xl mx-auto px-6 py-24 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center" data-reveal-on-scroll>
        <div class="lg:col-span-7 order-2 lg:order-1 reveal-block">
          <div class="aspect-[16/10] relative overflow-hidden bg-misana-stone">
            <img src="https://images.unsplash.com/photo-1611016186353-9af58c69a533?w=1600&q=80" alt="" loading="lazy" class="absolute inset-0 w-full h-full object-cover" />
          </div>
          <ul class="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2">
            <li v-for="r in popularRoutes" :key="r.slug" class="flex items-center justify-between border-b border-misana-line py-2 text-sm">
              <NuxtLink :to="localePath(`/transfers/${r.slug}`)" class="hover:text-misana-muted transition">
                {{ locale === 'fr' ? r.fr : r.en }}
              </NuxtLink>
              <span class="text-misana-muted text-xs">→</span>
            </li>
          </ul>
        </div>
        <div class="lg:col-span-5 order-1 lg:order-2 reveal-block">
          <p class="text-[11px] uppercase tracking-[0.2em] text-misana-muted mb-3">(MS · 06) · {{ t('home.chauffeurKicker') }}</p>
          <h2 class="font-display text-4xl sm:text-5xl leading-[1.05] mb-6">{{ t('home.chauffeurTitle') }}</h2>
          <p class="text-misana-muted leading-relaxed mb-8 max-w-md">{{ t('home.chauffeurBody') }}</p>
          <NuxtLink :to="localePath('/services/chauffeur')" class="inline-block border border-misana-ink px-6 py-3 text-sm tracking-wide hover:bg-misana-ink hover:text-misana-paper transition">
            {{ t('home.chauffeurCta') }} →
          </NuxtLink>
        </div>
      </div>
    </section>

    <!-- ============================================== -->
    <!-- 7. EVENTS LIST (calendar of the season, dark)   -->
    <!-- ============================================== -->
    <section class="border-b border-misana-paper/15 bg-misana-ink text-misana-paper">
      <div class="max-w-7xl mx-auto px-6 py-24" data-reveal-on-scroll>
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-10 mb-20 items-end reveal-block">
          <div class="lg:col-span-7">
            <p class="text-[11px] uppercase tracking-[0.2em] opacity-60 mb-4">(MS · 07) · {{ t('home.timelineKicker') }}</p>
            <h2 class="font-display text-4xl sm:text-6xl leading-[1.02]">{{ t('home.timelineTitle') }}</h2>
          </div>
          <div class="lg:col-span-5 lg:text-right">
            <p class="opacity-70 mb-6 max-w-md lg:ml-auto">{{ t('home.timelineLead') }}</p>
            <NuxtLink :to="localePath('/events')" class="inline-flex items-baseline gap-2 text-sm group">
              <span class="opacity-50">(</span>
              <span class="border-b border-misana-paper pb-0.5 transition group-hover:opacity-70">{{ t('home.allEvents') }}</span>
              <span class="opacity-60 tabular-nums">{{ timelineEvents.length }}+</span>
              <span class="opacity-50">)</span>
            </NuxtLink>
          </div>
        </div>

        <ul class="border-t border-misana-paper/20 reveal-block">
          <li
            v-for="(ev, idx) in timelineEvents"
            :key="ev.slug"
            class="event-row border-b border-misana-paper/20"
          >
            <NuxtLink
              :to="localePath(`/events/${ev.slug}`)"
              class="grid grid-cols-12 gap-4 sm:gap-6 py-8 sm:py-12 items-center group relative"
            >
              <!-- Sequence number, decorative -->
              <div class="col-span-2 sm:col-span-1 font-display text-base sm:text-xl opacity-40 tabular-nums">
                {{ String(idx + 1).padStart(2, '0') }}
              </div>

              <!-- Date column -->
              <div class="col-span-10 sm:col-span-2 flex items-baseline gap-2 text-sm sm:text-base">
                <span class="font-display text-xl sm:text-3xl tabular-nums">{{ String(ev.monthOrder).padStart(2, '0') }}</span>
                <span class="opacity-40">/</span>
                <span class="font-display text-xl sm:text-3xl tabular-nums">26</span>
              </div>

              <!-- Title, clip-reveal on hover (italic on the second line) -->
              <div class="col-span-12 sm:col-span-5 event-row-clip">
                <p class="font-display text-2xl sm:text-5xl leading-[1.05] event-row-title-base">
                  {{ locale === 'fr' ? ev.fr : ev.en }}
                </p>
                <p class="font-display text-2xl sm:text-5xl leading-[1.05] italic event-row-title-hover">
                  {{ locale === 'fr' ? ev.fr : ev.en }}
                </p>
              </div>

              <!-- City + month label -->
              <div class="hidden sm:block sm:col-span-2 text-sm opacity-80">
                <p>{{ locale === 'fr' ? ev.cityFr : ev.cityEn }}</p>
                <p class="text-xs opacity-60 mt-0.5">{{ locale === 'fr' ? ev.monthFr : ev.monthEn }}</p>
              </div>

              <!-- CTA -->
              <div class="col-span-12 sm:col-span-2 flex items-center justify-end gap-3 text-xs sm:text-sm">
                <span class="event-row-cta">{{ t('home.timelineCta') }}</span>
                <span class="event-row-arrow inline-flex items-center justify-center w-[1.3em] h-[1.3em] translate-y-[0.12em]">
                  <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" class="block w-full h-full">
                    <path d="M7 12H17" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
                    <path d="M13.5 8.5L17 12L13.5 15.5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" />
                  </svg>
                </span>
              </div>

              <!-- Floating thumbnail to the right of the title, fades + scales in on hover -->
              <div class="event-row-thumb">
                <img :src="eventThumb(ev.slug)" :alt="locale === 'fr' ? ev.fr : ev.en" loading="lazy" />
              </div>

              <!-- Subtle row tint -->
              <div class="event-row-hover absolute inset-0 -z-10"></div>
            </NuxtLink>
          </li>
        </ul>

        <p class="mt-10 text-[11px] uppercase tracking-[0.2em] opacity-50 reveal-block">
          {{ t('home.timelineFootnote') }}
        </p>
      </div>
    </section>

    <!-- ============================================== -->
    <!-- 8. ACCESS - top tables / addresses              -->
    <!-- ============================================== -->
    <section class="border-b border-misana-line bg-misana-paper">
      <div class="max-w-7xl mx-auto px-6 py-24" data-reveal-on-scroll>
        <div class="flex flex-wrap items-end justify-between gap-6 mb-12 reveal-block">
          <div class="max-w-2xl">
            <p class="text-[11px] uppercase tracking-[0.2em] text-misana-muted mb-3">(MS · 08) · {{ t('home.accessKickerNew') }}</p>
            <h2 class="font-display text-4xl sm:text-5xl leading-[1.05]">{{ t('home.accessTitleNew') }}</h2>
            <p class="text-misana-muted mt-4 max-w-lg">{{ t('home.accessLeadNew') }}</p>
          </div>
          <NuxtLink :to="localePath('/services/access')" class="text-sm underline underline-offset-4 hover:text-misana-muted transition">
            {{ t('access.hubTitle') }} →
          </NuxtLink>
        </div>
        <div class="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-5 reveal-block">
          <NuxtLink
            v-for="a in topAccess"
            :key="a.slug"
            :to="localePath(`/services/access/${a.slug}`)"
            class="group block bg-misana-stone"
          >
            <div class="aspect-[4/5] relative overflow-hidden">
              <img :src="a.img" :alt="ESTABLISHMENTS.find((e) => e.slug === a.slug)?.name ?? ''" loading="lazy" class="absolute inset-0 w-full h-full object-cover transition duration-1000 group-hover:scale-[1.04]" />
              <div class="absolute inset-0 bg-gradient-to-t from-black/70 via-black/5 to-transparent"></div>
              <div class="absolute bottom-5 left-5 right-5 text-misana-paper">
                <p class="text-[10px] uppercase tracking-[0.2em] opacity-80">
                  {{ t(`access.cat.${ESTABLISHMENTS.find((e) => e.slug === a.slug)?.category ?? 'restaurant'}`) }}
                  ·
                  {{ accessByCity(ESTABLISHMENTS.find((e) => e.slug === a.slug)?.city ?? '')?.[locale === 'fr' ? 'fr' : 'en'] }}
                </p>
                <p class="font-display text-xl mt-1">{{ ESTABLISHMENTS.find((e) => e.slug === a.slug)?.name }}</p>
              </div>
            </div>
          </NuxtLink>
        </div>
      </div>
    </section>

    <!-- ============================================== -->
    <!-- 9. FULL REQUEST FORM                            -->
    <!-- ============================================== -->
    <section class="border-b border-misana-line bg-misana-stone">
      <div class="max-w-3xl mx-auto px-6 py-24" data-reveal-on-scroll>
        <div class="text-center mb-10 reveal-block">
          <p class="text-[11px] uppercase tracking-[0.2em] text-misana-muted mb-3">(MS · 09) · {{ t('home.formKicker') }}</p>
          <h2 class="font-display text-4xl sm:text-5xl leading-[1.05] mb-4">{{ t('home.formTitle') }}</h2>
          <p class="text-misana-muted max-w-lg mx-auto">{{ t('home.formLead') }}</p>
        </div>
        <div class="bg-misana-paper p-6 sm:p-10 ring-1 ring-misana-line reveal-block">
          <RequestForm />
        </div>
      </div>
    </section>

    <!-- ============================================== -->
    <!-- 10. LATEST GUIDES                               -->
    <!-- ============================================== -->
    <section class="bg-misana-paper">
      <div class="max-w-7xl mx-auto px-6 py-24" data-reveal-on-scroll>
        <div class="flex flex-wrap items-end justify-between gap-6 mb-12 reveal-block">
          <div>
            <p class="text-[11px] uppercase tracking-[0.2em] text-misana-muted mb-3">(MS · 10) · {{ t('home.guidesKicker') }}</p>
            <h2 class="font-display text-4xl sm:text-5xl leading-[1.05]">{{ t('home.guidesTitle') }}</h2>
            <p class="text-misana-muted mt-4 max-w-lg">{{ t('home.guidesLead') }}</p>
          </div>
          <NuxtLink :to="localePath('/journal')" class="text-sm underline underline-offset-4 hover:text-misana-muted transition">
            {{ t('home.guidesAll') }} →
          </NuxtLink>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 reveal-block">
          <NuxtLink
            v-for="g in guides"
            :key="g.slug"
            :to="localePath(`/journal/${g.slug}`)"
            class="group block"
          >
            <div class="aspect-[4/3] relative overflow-hidden bg-misana-stone">
              <img :src="g.img" :alt="locale === 'fr' ? g.titleFr : g.titleEn" loading="lazy" class="absolute inset-0 w-full h-full object-cover transition duration-1000 group-hover:scale-[1.04]" />
            </div>
            <p class="text-[10px] uppercase tracking-[0.2em] text-misana-muted mt-4">{{ locale === 'fr' ? g.kindFr : g.kindEn }}</p>
            <p class="font-display text-2xl mt-2 leading-tight">{{ locale === 'fr' ? g.titleFr : g.titleEn }}</p>
          </NuxtLink>
        </div>
      </div>
    </section>
  </main>
</template>

<style scoped>
/* Sticky stack of service panels (hero). Footer overlay is rendered as a sibling
   pinned to the viewport bottom only while the hero is visible (toggled via v-show). */
.services-stack-footer {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 50;
  pointer-events: none;
}

/* Reveal animation triggered by IntersectionObserver via [data-revealed]. */
.reveal {
  display: inline-block;
  opacity: 0;
  transform: translateY(110%);
  transition:
    opacity 1.1s cubic-bezier(0.16, 1, 0.3, 1),
    transform 1.1s cubic-bezier(0.16, 1, 0.3, 1);
}
[data-revealed="true"] .reveal { opacity: 1; transform: translateY(0); }
[data-revealed="true"] .reveal[data-delay="1"] { transition-delay: 0.05s; }
[data-revealed="true"] .reveal[data-delay="2"] { transition-delay: 0.18s; }
[data-revealed="true"] .reveal[data-delay="3"] { transition-delay: 0.28s; }
[data-revealed="true"] .reveal[data-delay="4"] { transition-delay: 0.42s; }
[data-revealed="true"] .reveal[data-delay="5"] { transition-delay: 0.58s; }

.reveal-line {
  transform: scaleY(0);
  transform-origin: top center;
  transition: transform 1.4s cubic-bezier(0.16, 1, 0.3, 1) 0.28s;
}
[data-revealed="true"] .reveal-line { transform: scaleY(1); }

.services-panel-img {
  transform: scale(1.06);
  transition: transform 8s ease-out;
}
[data-revealed="true"] .services-panel-img { transform: scale(1); }

/* Event list rows. Title uses a two-layer clip reveal : the regular title (in flow,
   defines the container height so multi-line titles work) slides up out of view
   while an italic clone slides up into place from below. */
.event-row-clip {
  position: relative;
  overflow: hidden;
}
.event-row-title-base {
  position: relative;
  margin: 0;
  transform: translateY(0);
  transition: transform 0.7s cubic-bezier(0.16, 1, 0.3, 1);
  will-change: transform;
}
.event-row-title-hover {
  position: absolute;
  inset: 0;
  margin: 0;
  transform: translateY(105%);
  opacity: 0.92;
  transition: transform 0.7s cubic-bezier(0.16, 1, 0.3, 1);
  will-change: transform;
}
.event-row a:hover .event-row-title-base { transform: translateY(-105%); }
.event-row a:hover .event-row-title-hover { transform: translateY(0); }

.event-row-arrow {
  transition: transform 0.55s cubic-bezier(0.16, 1, 0.3, 1);
}
.event-row a:hover .event-row-arrow { transform: translateX(8px); }

.event-row-cta {
  position: relative;
  padding-bottom: 2px;
}
.event-row-cta::after {
  content: "";
  position: absolute;
  left: 0;
  bottom: 0;
  height: 1px;
  width: 100%;
  background: currentColor;
  transform: scaleX(0);
  transform-origin: right;
  transition: transform 0.6s cubic-bezier(0.16, 1, 0.3, 1);
}
.event-row a:hover .event-row-cta::after {
  transform: scaleX(1);
  transform-origin: left;
}

.event-row-hover {
  background: rgba(255, 255, 255, 0.05);
  opacity: 0;
  transition: opacity 0.45s ease;
}
.event-row a:hover .event-row-hover { opacity: 1; }

.event-row-thumb {
  position: absolute;
  pointer-events: none;
  top: 50%;
  left: 60%;
  width: 220px;
  aspect-ratio: 4 / 3;
  transform: translateY(-50%) translateX(-10px) scale(0.92);
  opacity: 0;
  overflow: hidden;
  z-index: 5;
  transition:
    opacity 0.5s cubic-bezier(0.16, 1, 0.3, 1),
    transform 0.7s cubic-bezier(0.16, 1, 0.3, 1);
  filter: brightness(0.85) saturate(0.9);
}
.event-row-thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}
.event-row a:hover .event-row-thumb {
  opacity: 1;
  transform: translateY(-50%) translateX(0) scale(1);
}
@media (max-width: 768px) {
  .event-row-thumb { display: none; }
}

/* Generic block reveal for editorial sections (cities, services, etc.). */
.reveal-block {
  opacity: 0;
  transform: translateY(28px);
  transition: opacity 0.9s cubic-bezier(0.16, 1, 0.3, 1), transform 0.9s cubic-bezier(0.16, 1, 0.3, 1);
}
[data-revealed="true"].reveal-block,
[data-revealed="true"] .reveal-block { opacity: 1; transform: translateY(0); }

@media (prefers-reduced-motion: reduce) {
  .reveal, .reveal-line, .reveal-block, .services-panel-img {
    transform: none !important;
    transition: none !important;
    opacity: 1 !important;
  }
}
</style>
