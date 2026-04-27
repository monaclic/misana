<script setup lang="ts">
// Hub editorial cars : hero home-style (single dark panel) + fleet grid
// inspiree bydrive (cards image + specs + CTA "see all cars").
// Pas de prix en editorial (V1 consultatif), tag "Sur demande" a la place.
import { RENTAL_CARS } from '~/lib/rentalCars';

definePageMeta({ layout: 'default' });

const { t } = useI18n();
const localePath = useLocalePath();

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
          <h1 class="reveal font-display text-6xl sm:text-8xl leading-[0.95]" data-delay="2">
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
            :to="localePath({ path: '/request', query: { service: 'cars' } })"
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
          <p class="font-display italic text-misana-muted text-base sm:text-lg mb-5">{{ t('cars.fleetKicker') }}</p>
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

              <div class="flex items-center justify-between">
                <span class="inline-flex items-center px-3 py-1 rounded-full bg-misana-stone text-xs text-misana-muted">
                  {{ car.pax }} {{ t('cars.seatsShort') }}
                </span>
                <span class="inline-flex items-center gap-2 text-xs text-misana-muted">
                  <span>{{ t('cars.onRequest') }}</span>
                  <span class="inline-flex items-center justify-center w-[1.1em] h-[1.1em] transition-transform duration-500 group-hover:translate-x-1">
                    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" class="block w-full h-full">
                      <path d="M7 12H17" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" />
                      <path d="M13.5 8.5L17 12L13.5 15.5" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" />
                    </svg>
                  </span>
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

@media (prefers-reduced-motion: reduce) {
  .reveal, .reveal-line, .cars-hero-bg {
    transition: none !important;
    transform: none !important;
    opacity: 1 !important;
  }
}
</style>
