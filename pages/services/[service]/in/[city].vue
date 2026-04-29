<script setup lang="ts">
// Fiche service x ville. URL : /services/[service]/in/[city]
// Pattern editorial : hero h-screen + about 50/50 + offerings 4 cards
// + popular routes + fleet (reutilise VEHICLES) + why here + SEO + FAQ
// + other cities + footer CTA. Le sous-segment 'in' evite les conflits
// avec les routes dynamiques /services/yacht/[yacht] etc.
import { SERVICES, CITIES } from '~/lib/constants';
import { VEHICLES } from '~/lib/fleet';
import {
  getServiceCityDetail,
  getPopularTransfers,
  formatPrice,
} from '~/lib/serviceCityDetails';

definePageMeta({ layout: 'default' });

const route = useRoute();
const { locale, t } = useI18n();
const localePath = useLocalePath();

const service = computed(() => String(route.params.service));
const city = computed(() => String(route.params.city));

if (!SERVICES.find((s) => s.slug === service.value)) {
  throw createError({ statusCode: 404, statusMessage: 'Service not found', fatal: true });
}
if (!CITIES.find((c) => c.slug === city.value)) {
  throw createError({ statusCode: 404, statusMessage: 'City not found', fatal: true });
}

const detail = computed(() => getServiceCityDetail(service.value, city.value));
if (!detail.value) {
  throw createError({ statusCode: 404, statusMessage: 'Service not yet available in this city', fatal: true });
}

const lng = computed<'fr' | 'en'>(() => (locale.value === 'fr' ? 'fr' : 'en'));
const cityObj = computed(() => CITIES.find((c) => c.slug === city.value)!);
const serviceObj = computed(() => SERVICES.find((s) => s.slug === service.value)!);
const cityName = computed(() => cityObj.value[lng.value]);
const serviceName = computed(() => serviceObj.value[lng.value]);

const seoTitle = computed(() => {
  const t = detail.value!.heroTitle[lng.value];
  return `${t} · ${formatPrice(detail.value!.priceFrom, lng.value)} · Misana`;
});

const seoDescription = computed(() => detail.value!.aboutText[lng.value].slice(0, 155));

useSeoMeta({
  title: () => seoTitle.value,
  description: () => seoDescription.value,
  ogImage: () => detail.value!.heroImage,
});

useHead({
  script: [
    {
      type: 'application/ld+json',
      innerHTML: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'Service',
        name: seoTitle.value,
        description: seoDescription.value,
        provider: { '@type': 'Organization', name: 'Misana' },
        areaServed: { '@type': 'City', name: cityName.value },
        serviceType: serviceName.value,
        offers: {
          '@type': 'Offer',
          price: detail.value!.priceFrom,
          priceCurrency: 'EUR',
        },
      }),
    },
    {
      type: 'application/ld+json',
      innerHTML: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: detail.value!.faq.map((f) => ({
          '@type': 'Question',
          name: f.q[lng.value],
          acceptedAnswer: { '@type': 'Answer', text: f.a[lng.value] },
        })),
      }),
    },
  ],
});

const popularTransfers = computed(() => getPopularTransfers(detail.value!.popularTransferSlugs));
const otherCities = computed(() =>
  CITIES.filter((c) => c.slug !== city.value).slice(0, 4),
);

const breadcrumb = computed(() => [
  { label: 'Misana', to: '/' },
  { label: serviceName.value, to: `/services/${service.value}` },
  { label: cityName.value },
]);

function transferModeFor(t: typeof popularTransfers.value[number]): 'chauffeur' | 'helicopter' {
  if (t.mode === 'both') return service.value === 'helicopter' ? 'helicopter' : 'chauffeur';
  return t.mode === 'helicopter' ? 'helicopter' : 'chauffeur';
}

// Header transparent over hero (pattern hub services)
const headerTransparent = useState<boolean>('header-transparent', () => true);
const heroRef = ref<HTMLElement | null>(null);
let heroObserver: IntersectionObserver | null = null;

onMounted(() => {
  if (heroRef.value) {
    heroObserver = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          headerTransparent.value = e.isIntersecting && e.intersectionRatio > 0;
        }
      },
      { threshold: [0, 0.01] },
    );
    heroObserver.observe(heroRef.value);
  }
});

onBeforeUnmount(() => {
  headerTransparent.value = false;
  heroObserver?.disconnect();
  heroObserver = null;
});
</script>

<template>
  <main class="min-h-screen">
    <!-- 01. HERO h-screen (pattern hub service) -->
    <section
      ref="heroRef"
      class="relative h-screen overflow-hidden -mt-16 bg-misana-ink text-misana-paper"
    >
      <img
        :src="detail!.heroImage"
        :alt="`${serviceName} ${cityName}`"
        class="absolute inset-0 w-full h-full object-cover"
      />
      <div class="absolute inset-0 bg-misana-ink/55"></div>

      <div class="relative h-full flex flex-col items-center justify-center px-6 pt-20 pb-16 text-center">
        <p class="font-display italic text-xl sm:text-2xl opacity-90 mb-3">the</p>
        <h1 class="font-display text-4xl sm:text-6xl lg:text-7xl xl:text-[5.5rem] leading-[1.02] mb-7 text-balance max-w-5xl">
          {{ detail!.heroTitle[lng] }}
        </h1>
        <p class="font-display italic text-lg sm:text-xl lg:text-2xl opacity-90 max-w-2xl mb-10 text-balance">
          {{ detail!.signature[lng] }}
        </p>
        <NuxtLink
          :to="localePath({ path: '/request', query: { service, city } })"
          class="inline-flex items-center gap-3 group bg-misana-paper text-misana-ink px-8 py-3.5 text-sm tracking-[0.16em] uppercase rounded-full transition hover:opacity-90"
        >
          <span>{{ locale === 'fr' ? 'Faire une demande' : 'Make a request' }}</span>
          <span class="transition-transform duration-500 group-hover:translate-x-1">→</span>
        </NuxtLink>
      </div>
    </section>

    <!-- 02. STICKY BACK -->
    <section class="sticky top-16 z-30 bg-misana-paper/95 backdrop-blur-sm border-b border-misana-line">
      <div class="max-w-[1600px] mx-auto px-6 sm:px-12 py-3 flex items-center justify-between gap-4 flex-wrap">
        <NuxtLink
          :to="localePath(`/services/${service}`)"
          class="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-misana-muted hover:text-misana-ink transition group"
        >
          <span class="inline-flex items-center justify-center w-4 h-4 transition-transform duration-500 group-hover:-translate-x-1">
            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" class="block w-full h-full">
              <path d="M17 12H7" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" />
              <path d="M10.5 8.5L7 12L10.5 15.5" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          </span>
          <span>{{ locale === 'fr' ? `Retour ${serviceName.toLowerCase()}` : `Back to ${serviceName.toLowerCase()}` }}</span>
        </NuxtLink>
        <Breadcrumb :items="breadcrumb" class="hidden sm:block" />
      </div>
    </section>

    <!-- 03. ABOUT (50/50 image + text, pattern editorial) -->
    <section class="bg-misana-paper">
      <div class="max-w-[1600px] mx-auto px-6 sm:px-12 py-16 sm:py-24 grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
        <div>
          <p class="text-[11px] uppercase tracking-[0.25em] text-misana-muted mb-5">
            {{ locale === 'fr' ? 'À propos' : 'About' }}
          </p>
          <h2 class="font-display text-3xl sm:text-4xl lg:text-5xl leading-[1.1] mb-6">
            {{ detail!.aboutTitle[lng] }}
          </h2>
          <p class="text-base sm:text-lg leading-[1.8] mb-8 text-misana-ink/85">
            {{ detail!.aboutText[lng] }}
          </p>
          <NuxtLink
            :to="localePath({ path: '/request', query: { service, city } })"
            class="inline-flex items-center gap-3 group text-sm tracking-wide pb-1 border-b border-misana-ink"
          >
            <span>{{ locale === 'fr' ? 'Faire une demande' : 'Begin a request' }}</span>
            <span class="transition-transform duration-500 group-hover:translate-x-1">→</span>
          </NuxtLink>
        </div>
        <div class="aspect-[4/3] overflow-hidden rounded-[6px] bg-misana-stone">
          <img
            :src="detail!.aboutImage"
            :alt="`${serviceName} ${cityName}`"
            class="w-full h-full object-cover"
          />
        </div>
      </div>
    </section>

    <!-- 04. OFFERINGS : 4 cards de ce qu'on orchestre dans cette ville -->
    <section class="bg-misana-paper border-t border-misana-line">
      <div class="max-w-[1600px] mx-auto px-6 sm:px-12 py-16 sm:py-20">
        <div class="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6 mb-10 sm:mb-14">
          <div>
            <p class="text-[11px] uppercase tracking-[0.25em] text-misana-muted mb-4">
              {{ locale === 'fr' ? 'Notre service' : 'Our service' }}
            </p>
            <h2 class="font-display text-3xl sm:text-4xl lg:text-5xl leading-[1.05] max-w-2xl">
              {{ locale === 'fr' ? 'Ce que nous orchestrons' : 'What we orchestrate' }}
            </h2>
          </div>
          <NuxtLink
            :to="localePath({ path: '/request', query: { service, city } })"
            class="hidden sm:inline-flex items-center gap-3 group text-sm tracking-wide pb-1 border-b border-misana-ink whitespace-nowrap"
          >
            <span>{{ locale === 'fr' ? 'Faire une demande' : 'Begin a request' }}</span>
            <span class="transition-transform duration-500 group-hover:translate-x-1">→</span>
          </NuxtLink>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
          <div
            v-for="(o, i) in detail!.offerings"
            :key="i"
            class="offering-card group"
          >
            <div class="aspect-[4/5] overflow-hidden">
              <img
                :src="o.image"
                :alt="lng === 'fr' ? o.titleFr : o.titleEn"
                loading="lazy"
                class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
              />
            </div>
            <div class="pt-5">
              <h3 class="font-display text-xl mb-2 leading-snug">
                {{ lng === 'fr' ? o.titleFr : o.titleEn }}
              </h3>
              <p class="text-sm text-misana-ink/85 leading-relaxed">
                {{ lng === 'fr' ? o.descFr : o.descEn }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 05. POPULAR ROUTES FROM CITY -->
    <section v-if="popularTransfers.length" class="bg-misana-paper border-t border-misana-line">
      <div class="max-w-[1600px] mx-auto px-6 sm:px-12 py-12 sm:py-14">
        <p class="text-[11px] uppercase tracking-[0.2em] text-misana-muted mb-5">
          {{ locale === 'fr' ? 'Routes populaires' : 'Popular routes' }}
        </p>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <NuxtLink
            v-for="t in popularTransfers"
            :key="t.slug"
            :to="localePath(`/transfers/${transferModeFor(t)}/${t.slug}`)"
            class="popular-chip group"
          >
            <p class="text-[10px] uppercase tracking-[0.18em] text-misana-muted mb-1.5">
              {{ transferModeFor(t) === 'helicopter' ? (locale === 'fr' ? 'Hélicoptère' : 'Helicopter') : 'Chauffeur' }}
            </p>
            <p class="text-sm font-medium leading-tight">{{ t[lng] }}</p>
          </NuxtLink>
        </div>
      </div>
    </section>

    <!-- 06. FLEET (chauffeur uniquement V1) -->
    <section v-if="service === 'chauffeur'" class="bg-misana-paper border-t border-misana-line">
      <div class="max-w-[1600px] mx-auto px-6 sm:px-12 py-16 sm:py-20">
        <div class="text-center mb-10 sm:mb-14">
          <p class="text-[11px] uppercase tracking-[0.25em] text-misana-muted mb-5">{{ t('chauffeur.fleetKicker') }}</p>
          <h2 class="font-display text-3xl sm:text-4xl lg:text-5xl leading-[1.05]">
            {{ locale === 'fr' ? 'Notre flotte' : 'Our fleet' }}
          </h2>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-7">
          <NuxtLink
            v-for="v in VEHICLES"
            :key="v.id"
            :to="localePath({ path: '/request', query: { service: 'chauffeur', vehicle: v.id, city } })"
            class="fleet-card"
          >
            <div class="fleet-card-top">
              <h3 class="fleet-name">{{ v.name }}</h3>
              <p class="fleet-type">{{ locale === 'fr' ? v.subFr : v.sub }}</p>
            </div>

            <div class="fleet-image-wrap" :class="v.imageMode === 'cover' ? 'fleet-image-cover' : 'fleet-image-contain'">
              <img :src="v.image" :alt="v.name" loading="lazy" draggable="false" class="fleet-image" />
            </div>

            <div class="fleet-stats">
              <div class="fleet-stat">
                <p class="fleet-stat-label">{{ t('chauffeur.fleetStatType') }}</p>
                <p class="fleet-stat-value">{{ locale === 'fr' ? v.subFr : v.sub }}</p>
              </div>
              <span class="fleet-stat-divider" aria-hidden="true"></span>
              <div class="fleet-stat">
                <p class="fleet-stat-label">{{ t('chauffeur.fleetStatSeats') }}</p>
                <p class="fleet-stat-value">{{ v.pax }}</p>
              </div>
              <span class="fleet-stat-divider" aria-hidden="true"></span>
              <div class="fleet-stat">
                <p class="fleet-stat-label">{{ t('chauffeur.fleetStatLuggage') }}</p>
                <p class="fleet-stat-value">{{ v.luggage }}</p>
              </div>
            </div>
          </NuxtLink>
        </div>
      </div>
    </section>

    <!-- 07. WHY MISANA HERE -->
    <section class="bg-misana-paper border-t border-misana-line">
      <div class="max-w-[1600px] mx-auto px-6 sm:px-12 py-12 sm:py-16">
        <p class="text-[11px] uppercase tracking-[0.25em] text-misana-muted mb-4">
          {{ locale === 'fr' ? 'Pourquoi Misana' : 'Why Misana' }}
        </p>
        <h2 class="font-display text-2xl sm:text-3xl lg:text-4xl leading-[1.1] mb-8 sm:mb-10 max-w-3xl">
          {{ locale === 'fr' ? 'Pourquoi nous choisir' : 'Why choose us' }}
        </h2>
        <ol class="grid sm:grid-cols-2 gap-x-10 gap-y-5">
          <li v-for="(reason, i) in detail!.whyHere[lng]" :key="i" class="flex gap-4">
            <span class="font-display italic text-xl text-misana-muted leading-none mt-1 flex-shrink-0 w-8">
              {{ String(i + 1).padStart(2, '0') }}
            </span>
            <span class="text-sm sm:text-base leading-relaxed">{{ reason }}</span>
          </li>
        </ol>
      </div>
    </section>

    <!-- 08. SEO + FAQ -->
    <section class="bg-misana-paper border-t border-misana-line">
      <div class="max-w-[1600px] mx-auto px-6 sm:px-12 py-16 sm:py-20">
        <p class="text-[11px] uppercase tracking-[0.2em] text-misana-muted mb-3">
          {{ locale === 'fr' ? 'À propos de ce service' : 'About this service' }}
        </p>
        <h2 class="font-display text-3xl sm:text-4xl mb-7 leading-[1.1]">
          {{ locale === 'fr' ? `${serviceName} ${cityName}` : `${serviceName} in ${cityName}` }}
        </h2>
        <p class="text-base sm:text-lg leading-[1.8] mb-14">{{ detail!.aboutText[lng] }}</p>

        <h2 class="font-display text-2xl sm:text-3xl mb-7 mt-16 leading-tight">
          {{ locale === 'fr' ? 'Questions fréquentes' : 'Frequently asked' }}
        </h2>
        <div class="divide-y divide-misana-line">
          <details v-for="(item, i) in detail!.faq" :key="i" class="group py-5">
            <summary class="flex items-center justify-between cursor-pointer list-none gap-4">
              <span class="text-base font-medium pr-4 leading-snug">{{ item.q[lng] }}</span>
              <span class="text-misana-muted text-xl leading-none transition-transform group-open:rotate-45 flex-shrink-0">+</span>
            </summary>
            <p class="mt-4 text-sm text-misana-ink/85 leading-relaxed pr-8">{{ item.a[lng] }}</p>
          </details>
        </div>
      </div>
    </section>

    <!-- 09. OTHER CITIES -->
    <section v-if="otherCities.length" class="bg-misana-paper border-t border-misana-line">
      <div class="max-w-[1600px] mx-auto px-6 sm:px-12 py-12 sm:py-14">
        <p class="text-[11px] uppercase tracking-[0.2em] text-misana-muted mb-5">
          {{ locale === 'fr' ? 'Dans d\'autres villes' : 'In other cities' }}
        </p>
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <NuxtLink
            v-for="c in otherCities"
            :key="c.slug"
            :to="localePath(`/services/${service}/in/${c.slug}`)"
            class="popular-chip group"
          >
            <p class="text-[10px] uppercase tracking-[0.18em] text-misana-muted mb-1.5">
              {{ serviceName }}
            </p>
            <p class="text-sm font-medium leading-tight">{{ c[lng] }}</p>
          </NuxtLink>
        </div>
      </div>
    </section>

    <!-- 10. FOOTER CTA inverse -->
    <section class="bg-misana-ink text-misana-paper">
      <div class="max-w-[1600px] mx-auto px-6 sm:px-12 py-16 sm:py-20 text-center">
        <p class="text-[11px] uppercase tracking-[0.25em] opacity-70 mb-4">
          {{ locale === 'fr' ? 'Faire une demande' : 'Begin a request' }}
        </p>
        <h2 class="font-display text-3xl sm:text-4xl lg:text-5xl mb-3 leading-tight">
          {{ detail!.heroTitle[lng] }}
        </h2>
        <p class="text-sm sm:text-base opacity-80 mb-8">
          {{ locale === 'fr' ? 'À partir de' : 'From' }} {{ formatPrice(detail!.priceFrom, lng) }} ·
          {{ locale === 'fr' ? 'Réponse sous 2h' : 'Reply within 2h' }} ·
          {{ locale === 'fr' ? 'Annulation gratuite 24h' : 'Free cancellation 24h' }}
        </p>
        <NuxtLink
          :to="localePath({ path: '/request', query: { service, city } })"
          class="inline-flex items-center gap-3 px-8 py-4 bg-misana-paper text-misana-ink text-sm tracking-wide rounded-[4px] hover:opacity-90 transition group"
        >
          <span>{{ locale === 'fr' ? 'Faire une demande' : 'Make a request' }}</span>
          <span class="transition-transform duration-500 group-hover:translate-x-1">→</span>
        </NuxtLink>
      </div>
    </section>
  </main>
</template>

<style scoped>
/* Offering cards (about pattern) */
.offering-card {
  display: flex;
  flex-direction: column;
}

/* Popular chips (kept) */
.popular-chip {
  display: block;
  padding: 1rem 1.1rem;
  border: 1px solid var(--color-misana-line);
  border-radius: 6px;
  background: var(--color-misana-paper);
  transition: border-color 0.2s ease, transform 0.3s ease;
}
.popular-chip:hover {
  border-color: var(--color-misana-ink);
  transform: translateY(-1px);
}

/* Fleet cards (cloned from chauffeur hub for visual consistency) */
.fleet-card {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  padding: 1.75rem 1.5rem 1.5rem;
  background: var(--color-misana-paper);
  border: 1px solid var(--color-misana-line);
  border-radius: 12px;
  text-decoration: none;
  color: var(--color-misana-ink);
  transition: border-color 0.4s ease, transform 0.4s ease;
}
.fleet-card:hover {
  border-color: var(--color-misana-ink);
  transform: translateY(-2px);
}
.fleet-card-top { display: flex; flex-direction: column; gap: 0.35rem; }
.fleet-name {
  font-family: var(--font-display, serif);
  font-size: 1.3rem;
  line-height: 1.15;
  margin: 0;
  color: var(--color-misana-ink);
}
.fleet-type {
  font-size: 0.72rem;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--color-misana-muted);
  margin: 0;
}
.fleet-image-wrap {
  width: 100%;
  aspect-ratio: 16 / 9;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}
.fleet-image-contain { background: transparent; }
.fleet-image-cover {
  background: var(--color-misana-stone);
  border-radius: 8px;
}
.fleet-image {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  transition: transform 0.7s cubic-bezier(0.16, 1, 0.3, 1);
}
.fleet-image-cover .fleet-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
  transform: scale(1.18);
}
.fleet-card:hover .fleet-image { transform: scale(1.04); }
.fleet-card:hover .fleet-image-cover .fleet-image { transform: scale(1.22); }
.fleet-stats {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  padding-top: 1.25rem;
  border-top: 1px solid var(--color-misana-line);
}
.fleet-stat {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 0.3rem;
  flex: 1;
  min-width: 0;
}
.fleet-stat-label {
  font-size: 0.62rem;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: var(--color-misana-muted);
  margin: 0;
}
.fleet-stat-value {
  font-family: var(--font-display, serif);
  font-size: 1.05rem;
  line-height: 1;
  color: var(--color-misana-ink);
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.fleet-stat-divider {
  width: 1px;
  height: 28px;
  background: var(--color-misana-line);
  flex-shrink: 0;
}

details summary::-webkit-details-marker { display: none; }
</style>
