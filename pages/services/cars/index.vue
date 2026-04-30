<script setup lang="ts">
// Hub editorial cars : hero home-style (single dark panel) + fleet grid
// inspiree bydrive (cards image + specs + CTA "see all cars").
// Pas de prix en editorial (V1 consultatif), tag "Sur demande" a la place.
import { RENTAL_CARS, RENTAL_CATEGORIES } from '~/lib/rentalCars';
import type { RentalCarCategory } from '~/lib/rentalCars';

definePageMeta({ layout: 'default' });

const { locale, t } = useI18n();
const localePath = useLocalePath();

const fmtEur = (n: number) =>
  new Intl.NumberFormat(locale.value === 'fr' ? 'fr-FR' : 'en-GB', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0,
  }).format(n);

useSeoMeta({
  title: () => t('cars.hubTitle'),
  description: () => t('cars.hubDescription'),
});

useHead({
  script: [{
    type: 'application/ld+json',
    innerHTML: JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'Service',
      name: 'Car rental on the French Riviera',
      provider: { '@type': 'Organization', name: 'Misana' },
      areaServed: ['Cannes', 'Monaco', 'Saint-Tropez', 'Nice', 'Cap-Ferrat'],
      serviceType: 'Car rental',
    }),
  }],
});

// 6 voitures mises en avant : flagship d'abord, puis popular, puis le reste.
const featured = computed(() => {
  const flag = RENTAL_CARS.filter((c) => c.badge === 'flagship');
  const pop = RENTAL_CARS.filter((c) => c.badge === 'popular');
  const rest = RENTAL_CARS.filter((c) => !c.badge);
  return [...flag, ...pop, ...rest].slice(0, 6);
});

const heroImage = computed(() => featured.value[0]?.hero || '');
const brandInitial = (brand: string) => brand.charAt(0).toUpperCase();

// Brands strip (inspiree Esteem) : 6 marques tenues, panel actif
// s'elargit au hover. Image extraite du premier vehicule de la marque.
const SHOWCASE_BRANDS = ['Ferrari', 'Lamborghini', 'Bentley', 'Porsche', 'Mercedes', 'Rolls Royce'] as const;
const brandSlug = (b: string) => b.toLowerCase().replace(/\s+/g, '-');
const showcaseBrands = computed(() =>
  SHOWCASE_BRANDS.map((name) => {
    const cars = RENTAL_CARS.filter((c) => c.brand === name);
    return {
      name,
      slug: brandSlug(name),
      image: cars[0]?.hero || '',
      count: cars.length,
    };
  }).filter((b) => b.image),
);
const activeBrand = ref(0);

// Track scroll horizontal categories : avance sequentielle + drag souris.
const categoriesTrack = ref<HTMLElement | null>(null);
useDragScroller(categoriesTrack, { intervalMs: 5000 });

// Vehicle categories (inspire drivehub) : carte par categorie + tile "Toutes
// les voitures" en tete. Image extraite du premier vehicule de la categorie.
const showcaseCategories = computed(() => {
  const items = [
    { id: 'all' as const, label: 'all' as const, image: RENTAL_CARS[0]?.hero || '', count: RENTAL_CARS.length, slug: '' },
    ...RENTAL_CATEGORIES.map((c) => {
      const cars = RENTAL_CARS.filter((car) => car.category === c.id);
      return {
        id: c.id as RentalCarCategory,
        label: c.id,
        image: cars[0]?.hero || '',
        count: cars.length,
        slug: c.id,
      };
    }),
  ];
  return items.filter((c) => c.image);
});

// Header transparency + reveal observer (pattern home / about)
const headerTransparent = useState<boolean>('header-transparent', () => true);
const heroRef = ref<HTMLElement | null>(null);
let revealObserver: IntersectionObserver | null = null;
let heroOverlapObserver: IntersectionObserver | null = null;

onMounted(() => {
  revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          (e.target as HTMLElement).dataset.revealed = 'true';
          revealObserver?.unobserve(e.target);
        }
      });
    },
    { threshold: 0.2 },
  );
  if (heroRef.value) revealObserver.observe(heroRef.value);

  if (heroRef.value) {
    heroOverlapObserver = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          headerTransparent.value = e.isIntersecting && e.intersectionRatio > 0;
        }
      },
      { threshold: [0, 0.01] },
    );
    heroOverlapObserver.observe(heroRef.value);
  }
});

onBeforeUnmount(() => {
  headerTransparent.value = false;
  revealObserver?.disconnect();
  revealObserver = null;
  heroOverlapObserver?.disconnect();
  heroOverlapObserver = null;
});
</script>

<template>
  <main>
    <!-- ============================================== -->
    <!-- 1. HERO (home-style, single dark panel)         -->
    <!-- ============================================== -->
    <section
      ref="heroRef"
      class="cars-hero relative h-screen overflow-hidden -mt-16 bg-misana-ink text-misana-paper"
      data-revealed="false"
    >
      <img :src="heroImage" alt="" class="cars-hero-bg absolute inset-0 w-full h-full object-cover" />
      <div class="absolute inset-0 bg-misana-ink/55"></div>

      <div class="relative h-full flex flex-col items-center justify-center text-center px-6">
        <div class="overflow-hidden">
          <p class="reveal" data-delay="1">
            <span class="font-display italic text-xl sm:text-2xl opacity-90">the</span>
          </p>
        </div>
        <div class="overflow-hidden mt-1">
          <h1 class="reveal font-display text-5xl sm:text-7xl lg:text-8xl leading-[0.95]" data-delay="2">
            {{ t('cars.hubTitle') }}
          </h1>
        </div>
        <div class="reveal-line w-px h-16 sm:h-20 bg-misana-paper/70 my-8 sm:my-9"></div>
        <div class="overflow-hidden max-w-md">
          <p class="reveal text-base sm:text-lg leading-relaxed opacity-90" data-delay="4">
            {{ t('cars.hubLead') }}
          </p>
        </div>
        <div class="overflow-hidden mt-10">
          <NuxtLink
            :to="localePath('/services/cars/all')"
            class="reveal group inline-flex items-center gap-8 pb-2 border-b-[1.5px] border-misana-paper text-base sm:text-lg tracking-wide"
            data-delay="5"
          >
            <span>{{ t('cars.heroCta') }}</span>
            <span class="inline-flex items-center justify-center w-[1.1em] h-[1.1em] translate-y-[0.22em] transition-transform duration-700 group-hover:translate-x-2">
              <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" class="block w-full h-full">
                <path d="M7 12H17" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" />
                <path d="M13.5 8.5L17 12L13.5 15.5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
            </span>
          </NuxtLink>
        </div>
      </div>
    </section>

    <!-- ============================================== -->
    <!-- 2. FLEET GRID (inspiree bydrive)                -->
    <!-- ============================================== -->
    <section class="bg-misana-paper">
      <div class="max-w-[1600px] mx-auto px-6 sm:px-12 py-24 sm:py-32">
        <!-- Header : kicker + title + CTA pill -->
        <div class="text-center mb-14 sm:mb-20">
          <p class="text-[11px] uppercase tracking-[0.25em] text-misana-muted mb-5">(MS · 01) · {{ t('cars.fleetKicker') }}</p>
          <h2 class="font-display text-4xl sm:text-5xl lg:text-6xl leading-[1.05] mb-10">{{ t('cars.fleetTitle') }}</h2>
          <NuxtLink
            :to="localePath('/services/cars/all')"
            class="inline-flex items-center gap-3 bg-misana-ink text-misana-paper px-7 py-3 text-sm tracking-wide rounded-full transition hover:opacity-90"
          >
            <span>{{ t('cars.fleetCta') }}</span>
          </NuxtLink>
        </div>

        <!-- Grid 3 cols -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          <NuxtLink
            v-for="car in featured"
            :key="car.id"
            :to="localePath(`/services/cars/${car.id}`)"
            class="car-card group block bg-misana-paper border border-misana-line rounded-xl overflow-hidden transition hover:border-misana-ink"
          >
            <!-- Image -->
            <div class="aspect-[16/11] relative overflow-hidden bg-misana-stone">
              <img
                :src="car.hero"
                :alt="car.fullName"
                loading="lazy"
                class="absolute inset-0 w-full h-full object-cover transition duration-700 group-hover:scale-[1.03]"
              />
            </div>

            <!-- Body -->
            <div class="p-5 sm:p-6">
              <div class="flex items-start gap-4 mb-5">
                <div class="shrink-0 w-10 h-10 rounded-full border border-misana-line flex items-center justify-center font-display text-sm">
                  {{ brandInitial(car.brand) }}
                </div>
                <div class="min-w-0 flex-1">
                  <h3 class="font-display text-lg leading-tight truncate">{{ car.fullName }}</h3>
                  <p class="text-xs text-misana-muted mt-1 flex items-center gap-2">
                    <span>{{ car.transmission === 'auto' ? t('cars.fiche.automatic') : t('cars.fiche.manual') }}</span>
                    <span class="inline-block w-1 h-1 rounded-full bg-misana-muted"></span>
                    <span>{{ car.hp }} hp</span>
                  </p>
                </div>
              </div>

              <div class="flex items-center justify-between gap-3">
                <span class="inline-flex items-center px-3 py-1 rounded-full bg-misana-stone text-xs text-misana-muted whitespace-nowrap">
                  {{ car.pax }} {{ t('cars.seatsShort') }}
                </span>
                <span class="inline-flex items-baseline gap-1.5 whitespace-nowrap">
                  <span class="font-display text-xl text-misana-ink">{{ fmtEur(car.prices.oneToThreeDays) }}</span>
                  <span class="text-xs text-misana-muted">{{ t('cars.perDayShort') }}</span>
                </span>
              </div>
            </div>
          </NuxtLink>
        </div>

        <!-- Bottom inline CTA with total count -->
        <div class="mt-16 text-center">
          <NuxtLink
            :to="localePath('/services/cars/all')"
            class="inline-flex items-center gap-3 group text-misana-ink text-base"
          >
            <span class="border-b border-misana-ink pb-0.5">
              {{ t('cars.fleetCta') }}
              <span class="text-misana-muted ml-2">({{ RENTAL_CARS.length }})</span>
            </span>
            <span class="inline-flex items-center justify-center w-[1.1em] h-[1.1em] translate-y-[0.22em] transition-transform duration-700 group-hover:translate-x-2">
              <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" class="block w-full h-full">
                <path d="M7 12H17" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" />
                <path d="M13.5 8.5L17 12L13.5 15.5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
            </span>
          </NuxtLink>
        </div>
      </div>
    </section>

    <!-- ============================================== -->
    <!-- 3. BRANDS STRIP (inspiree Esteem)               -->
    <!-- ============================================== -->
    <section class="brands-strip bg-misana-ink text-misana-paper">
      <div class="max-w-[1600px] mx-auto px-6 sm:px-12 py-24 sm:py-32">
        <!-- Header -->
        <div class="max-w-2xl mx-auto text-center mb-14 sm:mb-20">
          <p class="text-[11px] uppercase tracking-[0.25em] text-misana-paper/60 mb-5">(MS · 02) · {{ t('cars.brandsKicker') }}</p>
          <h2 class="font-display text-4xl sm:text-5xl lg:text-6xl leading-[1.05] mb-6">{{ t('cars.brandsTitle') }}</h2>
          <p class="text-misana-paper/70 text-base sm:text-lg leading-relaxed">{{ t('cars.brandsLead') }}</p>
        </div>

        <!-- Horizontal panels strip : actif s'elargit, autres se compriment -->
        <div class="brands-row" @mouseleave="activeBrand = 0">
          <NuxtLink
            v-for="(b, i) in showcaseBrands"
            :key="b.slug"
            :to="localePath({ path: '/services/cars/all', query: { brand: b.slug } })"
            class="brand-panel"
            :class="{ 'brand-panel-active': activeBrand === i }"
            @mouseenter="activeBrand = i"
            @focus="activeBrand = i"
          >
            <img :src="b.image" :alt="b.name" loading="lazy" class="brand-img" />
            <div class="brand-overlay"></div>
            <div class="brand-content">
              <p class="brand-name">{{ b.name }}</p>
              <p class="brand-tag">{{ b.count }} {{ t('cars.brandsCarsLabel') }}</p>
            </div>
          </NuxtLink>
        </div>

        <!-- CTA bas de section brands -->
        <div class="text-center mt-14 sm:mt-16">
          <NuxtLink
            :to="localePath('/services/cars/all')"
            class="inline-flex items-center gap-3 group text-misana-paper text-base"
          >
            <span class="border-b border-misana-paper pb-0.5">{{ t('cars.brandsCta') }}</span>
            <span class="inline-flex items-center justify-center w-[1.1em] h-[1.1em] translate-y-[0.22em] transition-transform duration-700 group-hover:translate-x-2">
              <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" class="block w-full h-full">
                <path d="M7 12H17" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" />
                <path d="M13.5 8.5L17 12L13.5 15.5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
            </span>
          </NuxtLink>
        </div>
      </div>
    </section>

    <!-- ============================================== -->
    <!-- 4. CATEGORIES (inspiree drivehub)               -->
    <!-- ============================================== -->
    <section class="categories-section bg-misana-paper">
      <div class="max-w-[1600px] mx-auto px-6 sm:px-12 py-24 sm:py-32">
        <!-- Header : kicker pill + h2 -->
        <div class="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6 mb-12 sm:mb-16">
          <div>
            <p class="text-[11px] uppercase tracking-[0.25em] text-misana-muted mb-4">(MS · 03) · {{ t('cars.categoriesKicker') }}</p>
            <h2 class="font-display text-4xl sm:text-5xl lg:text-6xl leading-[1.05] m-0">{{ t('cars.categoriesTitle') }}</h2>
          </div>
          <NuxtLink
            :to="localePath('/services/cars/all')"
            class="hidden sm:inline-flex items-center gap-3 group text-misana-ink text-base self-end"
          >
            <span class="border-b border-misana-ink pb-0.5">{{ t('cars.categoriesCta') }}</span>
            <span class="inline-flex items-center justify-center w-[1.1em] h-[1.1em] translate-y-[0.22em] transition-transform duration-700 group-hover:translate-x-2">
              <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" class="block w-full h-full">
                <path d="M7 12H17" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" />
                <path d="M13.5 8.5L17 12L13.5 15.5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
            </span>
          </NuxtLink>
        </div>

        <!-- Scroll horizontal snap : 3 cards visibles desktop, 2 sm, 1 mobile -->
        <div ref="categoriesTrack" class="categories-track">
          <!-- Items dupliques x2 pour boucle infinie auto-scroll -->
          <NuxtLink
            v-for="(cat, i) in [...showcaseCategories, ...showcaseCategories]"
            :key="`${cat.label}-${i}`"
            :to="cat.label === 'all'
              ? localePath('/services/cars/all')
              : localePath({ path: '/services/cars/all', query: { category: cat.slug } })"
            class="category-card group"
            :aria-hidden="i >= showcaseCategories.length ? 'true' : undefined"
          >
            <img :src="cat.image" :alt="t(`cars.category.${cat.label}`)" loading="lazy" draggable="false" class="category-img" />
            <div class="category-gradient"></div>
            <div class="category-content">
              <h3 class="font-display text-2xl sm:text-3xl lg:text-4xl leading-tight m-0">{{ t(`cars.category.${cat.label}`) }}</h3>
            </div>
          </NuxtLink>
        </div>

        <!-- CTA mobile -->
        <div class="sm:hidden mt-10 text-center">
          <NuxtLink
            :to="localePath('/services/cars/all')"
            class="inline-flex items-center gap-3 text-misana-ink text-base"
          >
            <span class="border-b border-misana-ink pb-0.5">{{ t('cars.categoriesCta') }}</span>
          </NuxtLink>
        </div>
      </div>
    </section>

    <!-- ============================================== -->
    <!-- SEO CONTEXT (long-form + maillage interne)       -->
    <!-- ============================================== -->
    <section class="bg-misana-paper">
      <div class="max-w-[1600px] mx-auto px-6 sm:px-12 py-16 sm:py-20">
        <p class="text-[11px] uppercase tracking-[0.25em] text-misana-muted mb-5">(MS · 04) · {{ t('cars.seo.kicker') }}</p>
        <h2 class="font-display text-3xl sm:text-4xl lg:text-5xl leading-[1.1] mb-8 sm:mb-10">{{ t('cars.seo.title') }}</h2>
        <div class="seo-prose">
          <i18n-t keypath="cars.seo.p1" tag="p" scope="global">
            <template #monaco><NuxtLink :to="localePath('/destinations/monaco')">Monaco</NuxtLink></template>
            <template #menton><NuxtLink :to="localePath('/destinations/menton')">Menton</NuxtLink></template>
            <template #saintTropez><NuxtLink :to="localePath('/destinations/saint-tropez')">Saint-Tropez</NuxtLink></template>
          </i18n-t>
          <i18n-t keypath="cars.seo.p2" tag="p" scope="global">
            <template #cannes><NuxtLink :to="localePath('/destinations/cannes')">Cannes</NuxtLink></template>
            <template #capFerrat><NuxtLink :to="localePath('/destinations/cap-ferrat')">Cap-Ferrat</NuxtLink></template>
            <template #chauffeur><NuxtLink :to="localePath('/services/chauffeur')">{{ locale === 'fr' ? 'chauffeur' : 'driver' }}</NuxtLink></template>
            <template #transfers><NuxtLink :to="localePath('/transfers')">{{ locale === 'fr' ? 'transfert' : 'transfer' }}</NuxtLink></template>
          </i18n-t>
          <i18n-t keypath="cars.seo.p3" tag="p" scope="global">
            <template #festival><NuxtLink :to="localePath('/events/festival-de-cannes')">{{ locale === 'fr' ? 'Festival de Cannes' : 'Cannes Film Festival' }}</NuxtLink></template>
            <template #grandPrix><NuxtLink :to="localePath('/events/grand-prix-monaco')">{{ locale === 'fr' ? 'Grand Prix de Monaco' : 'Monaco Grand Prix' }}</NuxtLink></template>
            <template #events><NuxtLink :to="localePath('/events')">{{ locale === 'fr' ? 'calendrier' : 'calendar' }}</NuxtLink></template>
          </i18n-t>
          <i18n-t keypath="cars.seo.p4" tag="p" scope="global">
            <template #yacht><NuxtLink :to="localePath('/services/yacht')">yacht</NuxtLink></template>
            <template #helicopter><NuxtLink :to="localePath('/services/helicopter')">{{ locale === 'fr' ? 'hélicoptère' : 'helicopter' }}</NuxtLink></template>
            <template #access><NuxtLink :to="localePath('/services/access')">Access</NuxtLink></template>
            <template #destinations><NuxtLink :to="localePath('/destinations')">{{ locale === 'fr' ? 'pages destinations' : 'destinations pages' }}</NuxtLink></template>
            <template #request><NuxtLink :to="localePath('/request')">{{ locale === 'fr' ? 'formulaire de demande' : 'request form' }}</NuxtLink></template>
          </i18n-t>
        </div>
      </div>
    </section>
  </main>
</template>

<style scoped>
/* Hero pattern home : reveal staggered + bg ken-burns 8s */
.cars-hero-bg {
  transform: scale(1.06);
  transition: transform 8s ease-out;
}
[data-revealed="true"] .cars-hero-bg { transform: scale(1); }

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

.car-card { transition: border-color 0.4s ease, transform 0.4s ease; }

/* === Brands strip (inspire Esteem) ===
   Flex horizontal, panel actif flex-grow majoritaire, autres compresses.
   Image opacity faible quand inactif, brand name centre. */
.brands-row {
  display: flex;
  gap: 8px;
  height: 70vh;
  min-height: 420px;
  max-height: 720px;
  overflow: hidden;
  border-radius: 12px;
}
.brand-panel {
  position: relative;
  flex: 1 1 0;
  min-width: 0;
  overflow: hidden;
  background: #1a1a1a;
  cursor: pointer;
  transition: flex-grow 1.1s cubic-bezier(0.16, 1, 0.3, 1);
}
.brand-panel-active { flex-grow: 2; }

.brand-img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  opacity: 0.28;
  transform: scale(1.04);
  transition:
    opacity 1s cubic-bezier(0.16, 1, 0.3, 1),
    transform 1.4s cubic-bezier(0.16, 1, 0.3, 1);
}
.brand-panel-active .brand-img {
  opacity: 1;
  transform: scale(1);
}

.brand-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 0.55) 100%);
  opacity: 0;
  transition: opacity 0.8s ease;
}
.brand-panel-active .brand-overlay { opacity: 1; }

.brand-content {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-end;
  padding: 1.5rem 1rem 2rem;
  text-align: center;
}
.brand-name {
  font-family: var(--font-display, serif);
  font-size: 0.95rem;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: var(--color-misana-paper);
  margin: 0;
  white-space: nowrap;
  transition: font-size 0.6s ease;
}
.brand-panel-active .brand-name {
  font-size: 1.15rem;
}
.brand-tag {
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.72);
  margin-top: 0.55rem;
  letter-spacing: 0.05em;
  opacity: 0;
  transform: translateY(8px);
  transition:
    opacity 0.6s ease 0.25s,
    transform 0.6s ease 0.25s;
}
.brand-panel-active .brand-tag {
  opacity: 1;
  transform: translateY(0);
}

@media (max-width: 767px) {
  .brands-row {
    flex-direction: column;
    height: auto;
    min-height: 0;
    max-height: none;
  }
  .brand-panel {
    height: 22vh;
    min-height: 160px;
  }
  .brand-panel-active { flex-grow: 1; }
  .brand-img { opacity: 0.55; }
  .brand-overlay { opacity: 1; }
  .brand-tag { opacity: 1; transform: none; }
}

/* === Categories (inspire drivehub) ===
   Scroll horizontal snap : 3 cards visibles desktop, 2 tablet, 1 mobile.
   Image + gradient bottom-up + titre blanc en bas. */
.categories-track {
  display: flex;
  gap: 20px;
  overflow-x: auto;
  overflow-y: hidden;
  padding-bottom: 8px;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
  cursor: grab;
  user-select: none;
  scroll-behavior: auto;
}
.categories-track::-webkit-scrollbar { display: none; }
.categories-track.is-dragging { cursor: grabbing; }

.category-card {
  position: relative;
  flex: 0 0 calc((100% - 40px) / 3);
  aspect-ratio: 1 / 1;
  border-radius: 12px;
  overflow: hidden;
  background: var(--color-misana-stone);
  display: block;
  user-select: none;
}
.category-img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 1.2s cubic-bezier(0.16, 1, 0.3, 1);
}
.category-card:hover .category-img { transform: scale(1.05); }

.category-gradient {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    to top,
    rgba(7, 7, 7, 0.92) 0%,
    rgba(7, 7, 7, 0.55) 28%,
    rgba(7, 7, 7, 0.2) 55%,
    rgba(7, 7, 7, 0) 100%
  );
  pointer-events: none;
}
.category-content {
  position: absolute;
  inset: auto 0 0 0;
  padding: 1.5rem 1.75rem;
  color: var(--color-misana-paper);
}

@media (max-width: 1023px) {
  .category-card { flex: 0 0 calc((100% - 20px) / 2); }
}
@media (max-width: 639px) {
  .categories-track { gap: 16px; }
  .category-card { flex: 0 0 80%; aspect-ratio: 4 / 5; }
  .category-content { padding: 1.25rem 1.25rem; }
}

/* === SEO prose === */
.seo-prose p {
  font-size: 1.0625rem;
  line-height: 1.85;
  color: var(--color-misana-ink);
  margin: 0 0 1.4rem;
}
.seo-prose p:last-child { margin-bottom: 0; }
.seo-prose a {
  color: var(--color-misana-ink);
  text-decoration: underline;
  text-decoration-thickness: 1px;
  text-underline-offset: 3px;
  text-decoration-color: var(--color-misana-line);
  transition: text-decoration-color 0.3s ease;
}
.seo-prose a:hover { text-decoration-color: var(--color-misana-ink); }

@media (prefers-reduced-motion: reduce) {
  .reveal, .reveal-line, .cars-hero-bg {
    transition: none !important;
    transform: none !important;
    opacity: 1 !important;
  }
}
</style>
