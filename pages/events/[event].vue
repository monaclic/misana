<script setup lang="ts">
// Fiche event (Festival, GP, Lions, Yacht Show). Pattern editorial similaire
// aux fiches services x event mais oriente sur l'evenement lui-meme.
// Cards 'Misana services for this event' linkent vers les fiches service x event.
import { EVENTS, CITIES, SERVICES } from '~/lib/constants';
import { getEventDetail } from '~/lib/eventDetails';
import { serviceEventPath } from '~/lib/serviceRoutes';

definePageMeta({ layout: 'default' });
defineI18nRoute({
  paths: { en: '/events/[event]', fr: '/evenements/[event]' },
});

const route = useRoute();
const { locale, t } = useI18n();
const localePath = useLocalePath();
const slug = computed(() => String(route.params.event));

const event = computed(() => EVENTS.find((e) => e.slug === slug.value));
if (!event.value) {
  throw createError({ statusCode: 404, statusMessage: 'Event not found', fatal: true });
}

const detail = computed(() => getEventDetail(slug.value));
if (!detail.value) {
  throw createError({ statusCode: 404, statusMessage: 'Event content not yet available', fatal: true });
}

const lng = computed<'fr' | 'en'>(() => (locale.value === 'fr' ? 'fr' : 'en'));
const ev = event.value;
const eventCity = computed(() => CITIES.find((c) => c.slug === ev.city));
const eventLabel = computed(() => (lng.value === 'fr' ? ev.fr : ev.en));
const cityLabel = computed(() => (eventCity.value ? eventCity.value[lng.value] : ''));
const monthLabel = computed(() => (lng.value === 'fr' ? ev.monthFr : ev.monthEn));

useSeoMeta({
  title: () => `${eventLabel.value} · ${cityLabel.value}`,
  description: () => detail.value!.aboutText[lng.value].slice(0, 155),
  ogImage: () => detail.value!.heroImage,
});

useHead({
  script: [
    {
      type: 'application/ld+json',
      innerHTML: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'Event',
        name: eventLabel.value,
        description: detail.value!.aboutText[lng.value].slice(0, 250),
        location: {
          '@type': 'Place',
          name: cityLabel.value,
          address: { '@type': 'PostalAddress', addressLocality: cityLabel.value, addressCountry: ev.city === 'monaco' ? 'MC' : 'FR' },
        },
        organizer: { '@type': 'Organization', name: 'Misana' },
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

// Services Misana pour cet event (les 4 services qui ont une fiche x event)
const SERVICES_FOR_EVENT = ['chauffeur', 'helicopter', 'cars', 'yacht'] as const;
const services = computed(() =>
  SERVICES_FOR_EVENT
    .map((sSlug) => SERVICES.find((s) => s.slug === sSlug))
    .filter(Boolean) as typeof SERVICES[number][],
);

// Other heavy events (les 4 autres)
const otherEvents = computed(() =>
  EVENTS.filter((e) => e.slug !== ev.slug && e.tier === 'heavy').slice(0, 4),
);

const breadcrumb = computed(() => [
  { label: 'Misana', to: '/' },
  { label: locale.value === 'fr' ? 'Événements' : 'Events', to: '/events' },
  { label: eventLabel.value },
]);

// Header transparent over hero
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

// Service descriptions courtes pour les 4 cards services
const SERVICE_TAGLINES: Record<string, { fr: string; en: string }> = {
  chauffeur: {
    fr: 'Mercedes V-Class et S-Class pendant l\'événement, flotte étendue.',
    en: 'Mercedes V-Class and S-Class during the event, extended fleet.',
  },
  helicopter: {
    fr: 'Vols depuis Nice, Cannes, Saint-Tropez. Évite les routes saturées.',
    en: 'Flights from Nice, Cannes, Saint-Tropez. Bypasses saturated roads.',
  },
  cars: {
    fr: 'Ferrari, Bentley, Rolls-Royce livrées à votre hôtel.',
    en: 'Ferrari, Bentley, Rolls-Royce delivered to your hotel.',
  },
  yacht: {
    fr: 'Charter avec mouillage événement, hospitalité à bord.',
    en: 'Charter with event anchorage, on-board hospitality.',
  },
};
</script>

<template>
  <main class="min-h-screen">
    <!-- 01. HERO h-dvh -->
    <section
      ref="heroRef"
      class="relative h-dvh overflow-hidden -mt-16 lg:-mt-24 bg-misana-ink text-misana-paper"
    >
      <img
        :src="detail!.heroImage"
        :alt="eventLabel"
        class="absolute inset-0 w-full h-full object-cover"
      />
      <div class="absolute inset-0 bg-misana-ink/55"></div>

      <div class="relative h-full flex flex-col items-center justify-center px-6 pt-20 pb-16 text-center">
        <p class="text-[11px] uppercase tracking-[0.25em] opacity-90 mb-3">
          {{ monthLabel }}
          <span class="opacity-60 mx-2">·</span>
          {{ cityLabel }}
        </p>
        <h1 class="font-display text-4xl sm:text-6xl lg:text-7xl xl:text-[5.5rem] leading-[1.02] mb-7 text-balance max-w-5xl">
          {{ eventLabel }}
        </h1>
        <p class="font-display italic text-lg sm:text-xl lg:text-2xl opacity-90 max-w-2xl mb-10 text-balance">
          {{ detail!.signature[lng] }}
        </p>
        <NuxtLink
          :to="localePath({ path: '/request', query: { event: slug } })"
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
          :to="localePath('/events')"
          class="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-misana-muted hover:text-misana-ink transition group"
        >
          <span class="inline-flex items-center justify-center w-4 h-4 transition-transform duration-500 group-hover:-translate-x-1">
            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" class="block w-full h-full">
              <path d="M17 12H7" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" />
              <path d="M10.5 8.5L7 12L10.5 15.5" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          </span>
          <span>{{ locale === 'fr' ? 'Retour événements' : 'Back to events' }}</span>
        </NuxtLink>
        <Breadcrumb :items="breadcrumb" class="hidden sm:block" />
      </div>
    </section>

    <!-- 03. ABOUT 50/50 -->
    <section class="bg-misana-paper">
      <div class="max-w-[1600px] mx-auto px-6 sm:px-12 py-16 sm:py-24 grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
        <div>
          <p class="text-[11px] uppercase tracking-[0.25em] text-misana-muted mb-5">
            {{ locale === 'fr' ? 'À propos' : 'About' }}
          </p>
          <h2 class="font-display text-3xl sm:text-4xl lg:text-5xl leading-[1.1] mb-6">
            {{ eventLabel }}
          </h2>
          <p class="text-base sm:text-lg leading-[1.8] mb-8 text-misana-ink/85">
            {{ detail!.aboutText[lng] }}
          </p>
        </div>
        <div class="aspect-[4/3] overflow-hidden rounded-[6px] bg-misana-stone">
          <img
            :src="detail!.aboutImage"
            :alt="eventLabel"
            class="w-full h-full object-cover"
          />
        </div>
      </div>
    </section>

    <!-- 04. PRACTICAL : data row dates / duree / lieux -->
    <section class="border-y border-misana-line">
      <div class="max-w-[1600px] mx-auto px-6 sm:px-12 py-8 sm:py-10 grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-10">
        <div>
          <p class="text-[10px] uppercase tracking-[0.2em] text-misana-muted mb-1.5">
            {{ locale === 'fr' ? 'Dates' : 'Dates' }}
          </p>
          <p class="font-display text-2xl sm:text-3xl leading-tight">{{ detail!.dates[lng] }}</p>
        </div>
        <div>
          <p class="text-[10px] uppercase tracking-[0.2em] text-misana-muted mb-1.5">
            {{ locale === 'fr' ? 'Durée' : 'Duration' }}
          </p>
          <p class="font-display text-2xl sm:text-3xl leading-tight">{{ detail!.duration[lng] }}</p>
        </div>
        <div>
          <p class="text-[10px] uppercase tracking-[0.2em] text-misana-muted mb-1.5">
            {{ locale === 'fr' ? 'Ville' : 'City' }}
          </p>
          <p class="font-display text-2xl sm:text-3xl leading-tight">{{ cityLabel }}</p>
        </div>
      </div>
    </section>

    <!-- 05. SERVICES MISANA POUR CET EVENT : 4 cards -->
    <section class="bg-misana-paper">
      <div class="max-w-[1600px] mx-auto px-6 sm:px-12 py-16 sm:py-20">
        <div class="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6 mb-10 sm:mb-14">
          <div>
            <p class="text-[11px] uppercase tracking-[0.25em] text-misana-muted mb-4">
              {{ locale === 'fr' ? 'Services Misana' : 'Misana services' }}
            </p>
            <h2 class="font-display text-3xl sm:text-4xl lg:text-5xl leading-[1.05] max-w-2xl">
              {{ locale === 'fr' ? `Pour ${eventLabel}` : `For ${eventLabel}` }}
            </h2>
          </div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
          <NuxtLink
            v-for="s in services"
            :key="s.slug"
            :to="localePath(serviceEventPath(s.slug, slug, lng))"
            class="service-card group"
          >
            <div class="service-card-inner">
              <p class="text-[11px] uppercase tracking-[0.2em] text-misana-muted mb-3">{{ s[lng] }}</p>
              <p class="font-display text-xl sm:text-2xl leading-snug mb-4">
                {{ s[lng] }} {{ locale === 'fr' ? eventLabel : `for ${eventLabel}` }}
              </p>
              <p class="text-sm text-misana-ink/85 leading-relaxed mb-6 flex-1">
                {{ SERVICE_TAGLINES[s.slug][lng] }}
              </p>
              <span class="inline-flex items-center gap-2 text-xs tracking-wide pb-1 border-b border-misana-ink self-start">
                {{ locale === 'fr' ? 'Découvrir' : 'Discover' }}
                <span class="transition-transform duration-500 group-hover:translate-x-1">→</span>
              </span>
            </div>
          </NuxtLink>
        </div>
      </div>
    </section>

    <!-- 06. KEY VENUES -->
    <section v-if="detail!.venues[lng].length" class="bg-misana-paper border-t border-misana-line">
      <div class="max-w-[1600px] mx-auto px-6 sm:px-12 py-12 sm:py-16">
        <p class="text-[11px] uppercase tracking-[0.25em] text-misana-muted mb-4">
          {{ locale === 'fr' ? 'Lieux clés' : 'Key venues' }}
        </p>
        <h2 class="font-display text-2xl sm:text-3xl lg:text-4xl leading-[1.1] mb-8 max-w-3xl">
          {{ locale === 'fr' ? `Où se passe ${eventLabel}` : `Where ${eventLabel} happens` }}
        </h2>
        <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
          <div
            v-for="(v, i) in detail!.venues[lng]"
            :key="i"
            class="px-4 py-3 border border-misana-line rounded-[6px] bg-misana-paper text-sm leading-snug"
          >
            {{ v }}
          </div>
        </div>
      </div>
    </section>

    <!-- 07. WHY MISANA -->
    <section class="bg-misana-paper border-t border-misana-line">
      <div class="max-w-[1600px] mx-auto px-6 sm:px-12 py-12 sm:py-16">
        <p class="text-[11px] uppercase tracking-[0.25em] text-misana-muted mb-4">
          {{ locale === 'fr' ? 'Pourquoi Misana' : 'Why Misana' }}
        </p>
        <h2 class="font-display text-2xl sm:text-3xl lg:text-4xl leading-[1.1] mb-8 sm:mb-10 max-w-3xl">
          {{ locale === 'fr' ? `Notre rôle pendant ${eventLabel}` : `Our role during ${eventLabel}` }}
        </h2>
        <ol class="grid sm:grid-cols-2 gap-x-10 gap-y-5">
          <li v-for="(reason, i) in detail!.whyMisana[lng]" :key="i" class="flex gap-4">
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
        <h2 class="font-display text-2xl sm:text-3xl mb-7 leading-tight">
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

    <!-- 09. OTHER EVENTS -->
    <section v-if="otherEvents.length" class="bg-misana-paper border-t border-misana-line">
      <div class="max-w-[1600px] mx-auto px-6 sm:px-12 py-12 sm:py-14">
        <p class="text-[11px] uppercase tracking-[0.2em] text-misana-muted mb-5">
          {{ locale === 'fr' ? 'Autres événements' : 'Other events' }}
        </p>
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <NuxtLink
            v-for="e in otherEvents"
            :key="e.slug"
            :to="localePath(`/events/${e.slug}`)"
            class="other-event-card group"
          >
            <p class="text-[10px] uppercase tracking-[0.18em] text-misana-muted mb-1.5">
              {{ lng === 'fr' ? e.monthFr : e.monthEn }}
            </p>
            <p class="text-sm font-medium leading-tight">{{ lng === 'fr' ? e.fr : e.en }}</p>
          </NuxtLink>
        </div>
      </div>
    </section>
  </main>
</template>

<style scoped>
.service-card {
  display: block;
  height: 100%;
  text-decoration: none;
  color: var(--color-misana-ink);
  background: var(--color-misana-paper);
  border: 1px solid var(--color-misana-line);
  border-radius: 6px;
  transition: border-color 0.3s ease, transform 0.3s ease;
}
.service-card:hover {
  border-color: var(--color-misana-ink);
  transform: translateY(-2px);
}
.service-card-inner {
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 1.5rem 1.5rem 1.5rem;
  min-height: 240px;
}

.other-event-card {
  display: block;
  padding: 1rem 1.1rem;
  border: 1px solid var(--color-misana-line);
  border-radius: 6px;
  background: var(--color-misana-paper);
  transition: border-color 0.2s ease, transform 0.3s ease;
}
.other-event-card:hover {
  border-color: var(--color-misana-ink);
  transform: translateY(-1px);
}

details summary::-webkit-details-marker { display: none; }
</style>
