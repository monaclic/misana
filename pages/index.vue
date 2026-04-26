<script setup lang="ts">
// Homepage Misana V1.
// Hero + 5 services tiles + destinations grid + featured fleet + events + CTA.
// Conversion-oriented : multiples points d entree vers /request et catalog.
import { SERVICES, CITIES, EVENTS } from '~/lib/constants';
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
      logo: 'https://misana.com/logo.png',
    }),
  }],
});

// Heavy destinations (4 lourdes)
const heavyCities = computed(() => CITIES.filter((c) => c.tier === 'heavy'));
const stubCities = computed(() => CITIES.filter((c) => c.tier !== 'heavy'));

// 4 events principaux
const featuredEvents = computed(() =>
  EVENTS.filter((e) => e.tier === 'heavy').slice(0, 4).map((e) => {
    const city = CITIES.find((c) => c.slug === e.city);
    return { ...e, cityEn: city?.en ?? '', cityFr: city?.fr ?? '' };
  }),
);

// 4 cars + 4 yachts coup de coeur
const featuredCars = computed(() =>
  RENTAL_CARS.filter((c) => c.badge === 'flagship' || c.badge === 'popular').slice(0, 4),
);
const featuredYachts = computed(() =>
  YACHTS.filter((y) => y.badge === 'flagship' || y.badge === 'popular').slice(0, 4),
);

// Hero image : fallback Excellence Riviera
const heroImage = 'https://excellenceriviera.com/wp-content/uploads/2022/02/Yacht-Sonishi-Sunkeeper-Featured.jpg';

// Pictogrammes services (basés sur le hub)
const SERVICE_TILES = [
  { slug: 'chauffeur', img: 'https://excellenceriviera.com/wp-content/uploads/2025/08/Transfert-Helicoptere-2.webp' },
  { slug: 'cars', img: 'https://excellenceriviera.com/wp-content/uploads/2025/08/Location-Voiture-Luxe.webp' },
  { slug: 'yacht', img: 'https://excellenceriviera.com/wp-content/uploads/2025/08/Location-Yacht.webp' },
  { slug: 'helicopter', img: 'https://excellenceriviera.com/wp-content/uploads/2022/02/Transfert-Helicoptere-3.jpg' },
  { slug: 'access', img: 'https://excellenceriviera.com/wp-content/uploads/2025/08/Restaurants.webp' },
];
</script>

<template>
  <main class="min-h-screen">
    <!-- Hero -->
    <section class="relative h-[80vh] min-h-[600px] overflow-hidden bg-misana-stone">
      <img :src="heroImage" alt="" class="absolute inset-0 w-full h-full object-cover opacity-90" />
      <div class="absolute inset-0 bg-gradient-to-b from-black/30 via-black/10 to-black/40"></div>
      <div class="relative h-full max-w-5xl mx-auto px-6 flex flex-col justify-end pb-16 sm:pb-24 text-misana-paper">
        <p class="text-xs uppercase tracking-widest mb-4 opacity-90">{{ t('home.kicker') }}</p>
        <h1 class="font-display text-5xl sm:text-7xl mb-6 leading-tight">{{ t('home.heroTitle') }}</h1>
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

    <!-- 5 services -->
    <section class="border-b border-misana-line">
      <div class="max-w-7xl mx-auto px-6 py-20">
        <div class="flex items-end justify-between mb-10">
          <div>
            <p class="text-xs uppercase tracking-widest text-misana-muted mb-2">{{ t('home.servicesKicker') }}</p>
            <h2 class="font-display text-3xl sm:text-4xl">{{ t('home.servicesTitle') }}</h2>
          </div>
          <NuxtLink :to="localePath('/request')" class="hidden sm:block text-sm underline underline-offset-4 hover:text-misana-muted transition">
            {{ t('home.makeRequestNow') }} →
          </NuxtLink>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <NuxtLink
            v-for="tile in SERVICE_TILES"
            :key="tile.slug"
            :to="localePath(`/services/${tile.slug}`)"
            class="group relative aspect-[3/4] overflow-hidden bg-misana-stone block"
          >
            <img :src="tile.img" :alt="t(`request.service.${tile.slug}`)" loading="lazy" class="absolute inset-0 w-full h-full object-cover transition duration-700 group-hover:scale-[1.04]" />
            <div class="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
            <div class="absolute bottom-5 left-5 right-5 text-misana-paper">
              <p class="text-[10px] uppercase tracking-widest mb-1 opacity-80">{{ t('home.service') }}</p>
              <p class="font-display text-2xl">{{ t(`request.service.${tile.slug}`) }}</p>
              <p class="text-xs mt-1 opacity-80">{{ t(`request.serviceTagline.${tile.slug}`) }}</p>
            </div>
          </NuxtLink>
        </div>
      </div>
    </section>

    <!-- Destinations -->
    <section class="border-b border-misana-line bg-misana-stone">
      <div class="max-w-7xl mx-auto px-6 py-20">
        <div class="flex items-end justify-between mb-10">
          <div>
            <p class="text-xs uppercase tracking-widest text-misana-muted mb-2">{{ t('home.destinationsKicker') }}</p>
            <h2 class="font-display text-3xl sm:text-4xl">{{ t('home.destinationsTitle') }}</h2>
            <p class="text-misana-muted mt-2 max-w-xl">{{ t('home.destinationsLead') }}</p>
          </div>
          <NuxtLink :to="localePath('/destinations')" class="hidden sm:block text-sm underline underline-offset-4 hover:text-misana-muted transition">
            {{ t('home.allDestinations') }} →
          </NuxtLink>
        </div>

        <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <NuxtLink
            v-for="ct in CITIES"
            :key="ct.slug"
            :to="localePath(`/destinations/${ct.slug}`)"
            class="group bg-misana-paper aspect-[4/5] flex flex-col justify-between p-5 ring-1 ring-misana-line hover:ring-misana-ink transition"
          >
            <p class="text-[10px] uppercase tracking-widest text-misana-muted">{{ ct.tier === 'heavy' ? t('home.cityHeavy') : t('home.cityStub') }}</p>
            <div>
              <p class="font-display text-xl mb-2">{{ locale === 'fr' ? ct.fr : ct.en }}</p>
              <p class="text-xs text-misana-muted">{{ locale === 'fr' ? ct.blurbFr : ct.blurbEn }}</p>
            </div>
          </NuxtLink>
        </div>
      </div>
    </section>

    <!-- Featured cars -->
    <section v-if="featuredCars.length" class="border-b border-misana-line">
      <div class="max-w-7xl mx-auto px-6 py-20">
        <div class="flex items-end justify-between mb-10">
          <div>
            <p class="text-xs uppercase tracking-widest text-misana-muted mb-2">{{ t('home.carsKicker') }}</p>
            <h2 class="font-display text-3xl sm:text-4xl">{{ t('home.carsTitle') }}</h2>
          </div>
          <NuxtLink :to="localePath('/services/cars')" class="hidden sm:block text-sm underline underline-offset-4 hover:text-misana-muted transition">
            {{ t('home.allCars') }} →
          </NuxtLink>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <NuxtLink
            v-for="car in featuredCars"
            :key="car.id"
            :to="localePath(`/services/cars/${car.id}`)"
            class="group ring-1 ring-misana-line hover:ring-misana-ink transition overflow-hidden block"
          >
            <div class="aspect-[4/3] relative overflow-hidden bg-misana-stone">
              <img :src="car.hero" :alt="car.fullName" loading="lazy" class="absolute inset-0 w-full h-full object-cover transition duration-700 group-hover:scale-[1.02]" />
            </div>
            <div class="p-4">
              <p class="text-[10px] uppercase tracking-widest text-misana-muted mb-1">{{ car.brand }}</p>
              <p class="text-sm font-medium">{{ car.model }}</p>
              <p class="text-xs text-misana-muted mt-1">{{ car.hp }} hp · {{ car.year }}</p>
            </div>
          </NuxtLink>
        </div>
      </div>
    </section>

    <!-- Featured yachts -->
    <section v-if="featuredYachts.length" class="border-b border-misana-line bg-misana-stone">
      <div class="max-w-7xl mx-auto px-6 py-20">
        <div class="flex items-end justify-between mb-10">
          <div>
            <p class="text-xs uppercase tracking-widest text-misana-muted mb-2">{{ t('home.yachtsKicker') }}</p>
            <h2 class="font-display text-3xl sm:text-4xl">{{ t('home.yachtsTitle') }}</h2>
          </div>
          <NuxtLink :to="localePath('/services/yacht')" class="hidden sm:block text-sm underline underline-offset-4 hover:text-misana-muted transition">
            {{ t('home.allYachts') }} →
          </NuxtLink>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <NuxtLink
            v-for="y in featuredYachts"
            :key="y.id"
            :to="localePath(`/services/yacht/${y.id}`)"
            class="group bg-misana-paper ring-1 ring-misana-line hover:ring-misana-ink transition overflow-hidden block"
          >
            <div class="aspect-[4/3] relative overflow-hidden bg-misana-stone">
              <img :src="y.hero" :alt="y.fullName" loading="lazy" class="absolute inset-0 w-full h-full object-cover transition duration-700 group-hover:scale-[1.02]" />
            </div>
            <div class="p-4">
              <p class="text-[10px] uppercase tracking-widest text-misana-muted mb-1">{{ y.builder }} · {{ y.lengthM }} m</p>
              <p class="text-sm font-medium">{{ y.name }}</p>
              <p class="text-xs text-misana-muted mt-1">{{ y.guests }} {{ t('yacht.guests') }} · {{ y.cabins }} {{ t('yacht.cabinsShort') }}</p>
            </div>
          </NuxtLink>
        </div>
      </div>
    </section>

    <!-- Events -->
    <section v-if="featuredEvents.length" class="border-b border-misana-line">
      <div class="max-w-7xl mx-auto px-6 py-20">
        <div class="flex items-end justify-between mb-10">
          <div>
            <p class="text-xs uppercase tracking-widest text-misana-muted mb-2">{{ t('home.eventsKicker') }}</p>
            <h2 class="font-display text-3xl sm:text-4xl">{{ t('home.eventsTitle') }}</h2>
          </div>
          <NuxtLink :to="localePath('/events')" class="hidden sm:block text-sm underline underline-offset-4 hover:text-misana-muted transition">
            {{ t('home.allEvents') }} →
          </NuxtLink>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <NuxtLink
            v-for="ev in featuredEvents"
            :key="ev.slug"
            :to="localePath(`/events/${ev.slug}`)"
            class="group block border border-misana-line hover:border-misana-ink transition p-6"
          >
            <p class="text-[10px] uppercase tracking-widest text-misana-muted mb-2">{{ locale === 'fr' ? ev.monthFr : ev.monthEn }}</p>
            <p class="font-display text-xl mb-2">{{ locale === 'fr' ? ev.fr : ev.en }}</p>
            <p class="text-xs text-misana-muted">{{ locale === 'fr' ? ev.cityFr : ev.cityEn }}</p>
          </NuxtLink>
        </div>
      </div>
    </section>

    <!-- Trust strip -->
    <section class="border-b border-misana-line">
      <div class="max-w-7xl mx-auto px-6 py-16 grid grid-cols-1 sm:grid-cols-3 gap-10">
        <div>
          <p class="font-display text-2xl mb-3">{{ t('home.trust1Title') }}</p>
          <p class="text-sm text-misana-muted leading-relaxed">{{ t('home.trust1Body') }}</p>
        </div>
        <div>
          <p class="font-display text-2xl mb-3">{{ t('home.trust2Title') }}</p>
          <p class="text-sm text-misana-muted leading-relaxed">{{ t('home.trust2Body') }}</p>
        </div>
        <div>
          <p class="font-display text-2xl mb-3">{{ t('home.trust3Title') }}</p>
          <p class="text-sm text-misana-muted leading-relaxed">{{ t('home.trust3Body') }}</p>
        </div>
      </div>
    </section>

    <!-- Final CTA -->
    <section class="bg-misana-ink text-misana-paper">
      <div class="max-w-3xl mx-auto px-6 py-24 text-center">
        <p class="text-xs uppercase tracking-widest opacity-80 mb-4">{{ t('home.finalKicker') }}</p>
        <h2 class="font-display text-4xl sm:text-5xl mb-6">{{ t('home.finalTitle') }}</h2>
        <p class="text-misana-paper/80 mb-10 max-w-xl mx-auto">{{ t('home.finalLead') }}</p>
        <NuxtLink :to="localePath('/request')" class="inline-block border border-misana-paper px-8 py-4 text-sm tracking-wide hover:bg-misana-paper hover:text-misana-ink transition">
          {{ t('nav.request') }} →
        </NuxtLink>
      </div>
    </section>
  </main>
</template>
