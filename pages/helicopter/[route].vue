<script setup lang="ts">
// Fiche helicoptere SEO. Pattern URL definitif : /en/helicopter-transfer/[route]
// + /fr/transfert-helicoptere/[route]. Whitelist de 4 slugs prioritaires V1
// pour concentrer l'autorite SEO. Tout autre slug 404.
import { TRANSFERS, CITIES } from '~/lib/constants';
import {
  getTransferDetail,
  getHeroImage,
  getModeGallery,
  getLongContent,
  formatPriceFrom,
} from '~/lib/transferDetails';

definePageMeta({ layout: 'default' });
defineI18nRoute({
  paths: {
    en: '/helicopter-transfer/[route]',
    fr: '/transfert-helicoptere/[route]',
  },
});

const ALLOWED_SLUGS = new Set([
  'nice-monaco',
  'nice-cannes',
  'nice-saint-tropez',
  'monaco-saint-tropez',
]);

const route = useRoute();
const config = useRuntimeConfig();
const { locale, t } = useI18n();
const localePath = useLocalePath();

const slug = computed(() => String(route.params.route));

if (!ALLOWED_SLUGS.has(slug.value)) {
  throw createError({ statusCode: 404, statusMessage: 'Route not found', fatal: true });
}

const transferEntry = TRANSFERS.find((tr) => tr.slug === slug.value);
if (!transferEntry || (transferEntry.mode !== 'helicopter' && transferEntry.mode !== 'both')) {
  throw createError({ statusCode: 404, statusMessage: 'Route not found', fatal: true });
}

const fromCity = computed(() => CITIES.find((c) => c.slug === transferEntry.from));
const toCity = computed(() => CITIES.find((c) => c.slug === transferEntry.to));
const lng = computed<'fr' | 'en'>(() => (locale.value === 'fr' ? 'fr' : 'en'));

const fromName = computed(() => (fromCity.value ? fromCity.value[lng.value] : ''));
const toName = computed(() => (toCity.value ? toCity.value[lng.value] : ''));

const fromNameDual = computed(() => ({
  fr: fromCity.value?.fr ?? '',
  en: fromCity.value?.en ?? '',
}));
const toNameDual = computed(() => ({
  fr: toCity.value?.fr ?? '',
  en: toCity.value?.en ?? '',
}));

const detail = computed(() => getTransferDetail(
  'helicopter',
  slug.value,
  transferEntry.from,
  transferEntry.to,
));

const heroImage = computed(() => getHeroImage('helicopter', slug.value));
const gallery = computed(() => getModeGallery('helicopter'));
const duration = computed(() => detail.value.durationHelicopter ?? 0);

const longContent = computed(() => getLongContent(
  'helicopter',
  slug.value,
  fromNameDual.value,
  toNameDual.value,
  duration.value,
  detail.value.distanceKm,
  detail.value.priceFrom,
));

// Title format : "Helicopter Transfer Nice to Monaco · 7 min · From €700 | Misana"
const seoTitle = computed(() => {
  const prefix = locale.value === 'fr' ? 'Transfert Hélicoptère' : 'Helicopter Transfer';
  const sep = locale.value === 'fr' ? ' à ' : ' to ';
  const from = locale.value === 'fr' ? 'À partir de' : 'From';
  return `${prefix} ${fromName.value}${sep}${toName.value} · ${duration.value} min · ${from} ${formatPriceFrom(detail.value.priceFrom, lng.value)} | Misana`;
});

const seoDescription = computed(() => {
  if (locale.value === 'fr') {
    return `Vol hélicoptère privé ${fromName.value} ${toName.value} en ${duration.value} minutes. À partir de ${formatPriceFrom(detail.value.priceFrom, 'fr')}. Mercedes V-Class incluse. Réponse sous 2h.`;
  }
  return `Private helicopter transfer ${fromName.value} to ${toName.value} in ${duration.value} minutes. From ${formatPriceFrom(detail.value.priceFrom, 'en')}. Mercedes V-Class included. Reply within 2h.`;
});

const siteUrl = (config.public.siteUrl as string) || 'https://misana-group.com';
const canonicalUrl = computed(() => (
  locale.value === 'fr'
    ? `${siteUrl}/fr/transfert-helicoptere/${slug.value}`
    : `${siteUrl}/en/helicopter-transfer/${slug.value}`
));
const altEnUrl = computed(() => `${siteUrl}/en/helicopter-transfer/${slug.value}`);
const altFrUrl = computed(() => `${siteUrl}/fr/transfert-helicoptere/${slug.value}`);

useSeoMeta({
  title: () => seoTitle.value,
  description: () => seoDescription.value,
  ogTitle: () => seoTitle.value,
  ogDescription: () => seoDescription.value,
  ogImage: () => heroImage.value,
  ogUrl: () => canonicalUrl.value,
  twitterImage: () => heroImage.value,
  robots: 'index,follow',
});

useHead({
  link: [
    { rel: 'canonical', href: canonicalUrl.value },
    { rel: 'alternate', hreflang: 'en', href: altEnUrl.value },
    { rel: 'alternate', hreflang: 'fr', href: altFrUrl.value },
    { rel: 'alternate', hreflang: 'x-default', href: altEnUrl.value },
  ],
  script: [
    {
      type: 'application/ld+json',
      innerHTML: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'Service',
        name: `Helicopter transfer ${fromName.value} to ${toName.value}`,
        provider: { '@type': 'Organization', name: 'Misana', url: siteUrl },
        serviceType: 'Helicopter transfer',
        areaServed: [fromName.value, toName.value],
        description: seoDescription.value,
        offers: {
          '@type': 'Offer',
          price: detail.value.priceFrom,
          priceCurrency: 'EUR',
          priceValidUntil: '2026-12-31',
          availability: 'https://schema.org/InStock',
          url: canonicalUrl.value,
        },
      }),
    },
    {
      type: 'application/ld+json',
      innerHTML: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Misana', item: siteUrl },
          {
            '@type': 'ListItem',
            position: 2,
            name: locale.value === 'fr' ? 'Hélicoptère' : 'Helicopter',
            item: `${siteUrl}${localePath({ name: 'helicopter' })}`,
          },
          {
            '@type': 'ListItem',
            position: 3,
            name: `${fromName.value} → ${toName.value}`,
            item: canonicalUrl.value,
          },
        ],
      }),
    },
    {
      type: 'application/ld+json',
      innerHTML: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'TouristTrip',
        name: seoTitle.value,
        description: seoDescription.value,
        provider: { '@type': 'Organization', name: 'Misana' },
        itinerary: {
          '@type': 'ItemList',
          itemListElement: [
            { '@type': 'Place', name: fromName.value },
            { '@type': 'Place', name: toName.value },
          ],
        },
      }),
    },
    ...(longContent.value.faq?.length
      ? [{
          type: 'application/ld+json',
          innerHTML: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity: longContent.value.faq.map((f) => ({
              '@type': 'Question',
              name: f.q[lng.value],
              acceptedAnswer: { '@type': 'Answer', text: f.a[lng.value] },
            })),
          }),
        }]
      : []),
  ],
});

const related = computed(() => (
  Array.from(ALLOWED_SLUGS)
    .filter((s) => s !== slug.value)
    .map((s) => {
      const tr = TRANSFERS.find((t) => t.slug === s)!;
      const det = getTransferDetail('helicopter', s, tr.from, tr.to);
      return { slug: s, tr, det };
    })
));

const breadcrumb = computed(() => [
  { label: 'Misana', to: '/' },
  { label: t('transfers.modeHelicopter'), to: { name: 'helicopter' } },
  { label: `${fromName.value} → ${toName.value}` },
]);

const TRUST_ITEMS = ['insurance', 'operators', 'response', 'cancellation', 'fleet', 'local'];

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

const h1Prefix = computed(() => (
  locale.value === 'fr' ? 'Transfert hélicoptère' : 'Helicopter transfer'
));

const aboutTitle = computed(() => (
  locale.value === 'fr'
    ? `Vol ${fromName.value} ${toName.value} en hélicoptère`
    : `${fromName.value} ${toName.value} by helicopter`
));

const whyTitle = computed(() => (
  locale.value === 'fr'
    ? `Pourquoi voler ${fromName.value} → ${toName.value}`
    : `Why fly ${fromName.value} to ${toName.value}`
));

const faqTitle = computed(() => (
  locale.value === 'fr'
    ? `Questions fréquentes sur ${fromName.value} ${toName.value}`
    : `Frequently asked about ${fromName.value} ${toName.value}`
));
</script>

<template>
  <main class="min-h-screen">
    <!-- 01. HERO -->
    <section
      ref="heroRef"
      class="relative h-[60vh] sm:h-[72vh] min-h-[440px] overflow-hidden -mt-16 lg:-mt-24 bg-misana-ink"
    >
      <img
        :src="heroImage"
        :alt="`${fromName} → ${toName}`"
        class="absolute inset-0 w-full h-full object-cover opacity-95"
      />
      <div class="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-misana-ink/80 via-misana-ink/35 to-transparent"></div>
      <div class="relative h-full max-w-[1600px] mx-auto px-6 sm:px-12 flex flex-col justify-end pb-12 sm:pb-16 text-misana-paper">
        <p class="text-[11px] uppercase tracking-[0.25em] opacity-90 mb-4">
          {{ duration }} min
          <span class="opacity-60 mx-2">·</span>
          {{ detail.distanceKm }} km
          <span class="opacity-60 mx-2">·</span>
          {{ locale === 'fr' ? 'À partir de' : 'From' }} {{ formatPriceFrom(detail.priceFrom, lng) }}
        </p>
        <h1 class="font-display leading-[1.02] mb-4">
          <span class="block font-display italic text-xl sm:text-2xl lg:text-3xl opacity-90 mb-2">
            {{ h1Prefix }}
          </span>
          <span class="block text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-[5.5rem] text-balance leading-[1.02] tracking-tight">
            {{ fromName }}<span class="opacity-70 mx-3 sm:mx-4">→</span>{{ toName }}
          </span>
        </h1>
        <p class="font-display italic text-lg sm:text-xl lg:text-2xl opacity-90 max-w-3xl text-balance">
          {{ t('transfers.fiche.heroSubtitleHelico') }}
        </p>
      </div>
    </section>

    <!-- 02. STICKY BACK -->
    <section class="sticky top-16 z-30 bg-misana-paper/95 backdrop-blur-sm border-b border-misana-line">
      <div class="max-w-[1600px] mx-auto px-6 sm:px-12 py-3 flex items-center justify-between gap-4 flex-wrap">
        <NuxtLink
          :to="localePath({ name: 'helicopter' })"
          class="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-misana-muted hover:text-misana-ink transition group"
        >
          <span class="inline-flex items-center justify-center w-4 h-4 transition-transform duration-500 group-hover:-translate-x-1">
            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" class="block w-full h-full">
              <path d="M17 12H7" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" />
              <path d="M10.5 8.5L7 12L10.5 15.5" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          </span>
          <span>{{ t('transfers.fiche.backToHelicopter') }}</span>
        </NuxtLink>
        <Breadcrumb :items="breadcrumb" class="hidden sm:block" />
      </div>
    </section>

    <!-- 03. BOOKING : map + widget -->
    <section>
      <div class="max-w-[1600px] mx-auto px-6 sm:px-12 pt-12 sm:pt-16 grid lg:grid-cols-12 gap-8 lg:gap-12 lg:items-stretch">
        <div class="lg:col-span-7 lg:flex lg:flex-col">
          <TransferMap
            :from="transferEntry.from"
            :to="transferEntry.to"
            mode="helicopter"
            :from-name="fromName"
            :to-name="toName"
          />
        </div>

        <aside class="lg:col-span-5 lg:flex lg:flex-col">
          <TransferReservationWidget
            :slug="slug"
            mode="helicopter"
            :from-city="transferEntry.from"
            :to-city="transferEntry.to"
            :from-name="fromName"
            :to-name="toName"
            :price-from="detail.priceFrom"
            :pax-min="detail.paxMin"
            :pax-max="detail.paxMax"
            :bidirectional="true"
            variant="inline"
          />
        </aside>
      </div>

      <!-- Lien chauffeur : plan B meteo. Maille vers le hub chauffeur. -->
      <div class="max-w-[1600px] mx-auto px-6 sm:px-12 pt-5 pb-12 sm:pb-16">
        <NuxtLink
          :to="localePath({ name: 'chauffeur' })"
          class="inline-flex items-center gap-2 text-xs uppercase tracking-[0.15em] text-misana-muted hover:text-misana-ink transition group"
        >
          <span>{{ locale === 'fr' ? 'Plan B météo : transfert chauffeur' : 'Weather plan B: chauffeur transfer' }}</span>
          <span class="inline-block transition-transform duration-500 group-hover:translate-x-1">→</span>
        </NuxtLink>
      </div>
    </section>

    <!-- 04. DATA ROW -->
    <section class="border-y border-misana-line">
      <div class="max-w-[1600px] mx-auto px-6 sm:px-12 py-8 sm:py-10 grid grid-cols-2 sm:grid-cols-4 gap-6 sm:gap-10">
        <div>
          <p class="text-[10px] uppercase tracking-[0.2em] text-misana-muted mb-1.5">{{ t('transfers.fiche.metric.flightTime') }}</p>
          <p class="font-display text-3xl sm:text-4xl leading-none">{{ duration }} <span class="text-base text-misana-muted">min</span></p>
        </div>
        <div>
          <p class="text-[10px] uppercase tracking-[0.2em] text-misana-muted mb-1.5">{{ t('transfers.fiche.metric.distance') }}</p>
          <p class="font-display text-3xl sm:text-4xl leading-none">{{ detail.distanceKm }} <span class="text-base text-misana-muted">km</span></p>
        </div>
        <div>
          <p class="text-[10px] uppercase tracking-[0.2em] text-misana-muted mb-1.5">{{ t('transfers.fiche.metric.capacity') }}</p>
          <p class="font-display text-3xl sm:text-4xl leading-none">{{ detail.paxMin }}-{{ detail.paxMax }} <span class="text-base text-misana-muted">pax</span></p>
        </div>
        <div>
          <p class="text-[10px] uppercase tracking-[0.2em] text-misana-muted mb-1.5">{{ t('transfers.fiche.metric.aircraft') }}</p>
          <p class="text-sm sm:text-base leading-tight pt-2">{{ detail.aircraftType?.[lng] }}</p>
        </div>
      </div>
    </section>

    <!-- 05. RELATED -->
    <section v-if="related.length" class="border-b border-misana-line">
      <div class="max-w-[1600px] mx-auto px-6 sm:px-12 py-12 sm:py-14">
        <p class="text-[11px] uppercase tracking-[0.2em] text-misana-muted mb-5">
          {{ t('transfers.fiche.alternatives') }}
        </p>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <NuxtLink
            v-for="other in related"
            :key="other.slug"
            :to="localePath({ name: 'helicopter-route', params: { route: other.slug } })"
            class="alternative-chip group"
          >
            <p class="text-[10px] uppercase tracking-[0.18em] text-misana-muted mb-1.5">
              {{ t('transfers.modeHelicopter') }}
            </p>
            <p class="text-sm font-medium leading-tight mb-3">{{ other.tr[lng] }}</p>
            <div class="flex items-baseline justify-between text-xs text-misana-muted">
              <span>{{ other.det.durationHelicopter }} min</span>
              <span class="text-misana-ink">{{ formatPriceFrom(other.det.priceFrom, lng) }}</span>
            </div>
          </NuxtLink>
        </div>
      </div>
    </section>

    <!-- 06. OPERATING STANDARD -->
    <section class="border-b border-misana-line">
      <div class="max-w-[1600px] mx-auto px-6 sm:px-12 py-12 sm:py-14">
        <p class="text-[11px] uppercase tracking-[0.25em] text-misana-muted text-center mb-10">
          {{ t('transfers.fiche.standardKicker') }}
        </p>
        <div class="grid grid-cols-2 sm:grid-cols-3 gap-x-10 gap-y-10">
          <div v-for="key in TRUST_ITEMS" :key="key" class="flex gap-4">
            <span class="flex-shrink-0 w-9 h-9 border border-misana-ink rounded-full flex items-center justify-center mt-0.5">
              <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <path d="M5 13L9 17L19 7" />
              </svg>
            </span>
            <div>
              <h3 class="text-sm font-medium mb-1">{{ t(`transfers.fiche.standard.${key}.title`) }}</h3>
              <p class="text-xs text-misana-muted leading-relaxed">{{ t(`transfers.fiche.standard.${key}.desc`) }}</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 07. DEPARTURE / ARRIVAL hubs -->
    <section
      v-if="longContent.hubFromTitle && longContent.hubToTitle && longContent.hubFromDesc && longContent.hubToDesc"
      class="border-b border-misana-line"
    >
      <div class="max-w-[1600px] mx-auto px-6 sm:px-12 py-12 sm:py-16 grid sm:grid-cols-2 gap-10 sm:gap-16">
        <div>
          <p class="text-[11px] uppercase tracking-[0.2em] text-misana-muted mb-3 flex items-center gap-2">
            <span class="inline-block w-2 h-2 rounded-full border border-misana-ink"></span>
            {{ t('transfers.fiche.departure') }}
          </p>
          <h3 class="font-display text-2xl sm:text-3xl mb-4 leading-snug">{{ longContent.hubFromTitle[lng] }}</h3>
          <p class="text-base leading-relaxed">{{ longContent.hubFromDesc[lng] }}</p>
        </div>
        <div>
          <p class="text-[11px] uppercase tracking-[0.2em] text-misana-muted mb-3 flex items-center gap-2">
            <span class="inline-block w-2 h-2 rounded-full bg-misana-ink"></span>
            {{ t('transfers.fiche.arrival') }}
          </p>
          <h3 class="font-display text-2xl sm:text-3xl mb-4 leading-snug">{{ longContent.hubToTitle[lng] }}</h3>
          <p class="text-base leading-relaxed">{{ longContent.hubToDesc[lng] }}</p>
        </div>
      </div>
    </section>

    <!-- 08. GALERIE -->
    <section class="border-t border-misana-line">
      <div class="max-w-[1600px] mx-auto px-6 sm:px-12 py-12 sm:py-16">
        <p class="text-[11px] uppercase tracking-[0.2em] text-misana-muted mb-5">
          {{ t('transfers.fiche.gallerySection') }}
        </p>
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div
            v-for="(img, i) in gallery"
            :key="`gallery-${i}`"
            class="aspect-[4/5] overflow-hidden rounded-[6px] bg-misana-paper"
          >
            <img
              :src="img"
              :alt="`${fromName} → ${toName} ${i + 1}`"
              loading="lazy"
              class="w-full h-full object-cover transition-transform duration-700 hover:scale-[1.04]"
            />
          </div>
        </div>
      </div>
    </section>

    <!-- 09. WHAT TO EXPECT -->
    <section class="border-t border-misana-line">
      <div class="max-w-[1600px] mx-auto px-6 sm:px-12 py-12 sm:py-16">
        <p class="text-[11px] uppercase tracking-[0.2em] text-misana-muted mb-5">
          {{ t('transfers.fiche.whatToExpect') }}
        </p>
        <ul class="grid sm:grid-cols-3 gap-6 sm:gap-10">
          <li v-for="(line, i) in detail.whatToExpect[lng]" :key="i" class="flex gap-3 text-sm leading-relaxed">
            <span class="font-display text-2xl text-misana-muted leading-none mt-0.5">{{ String(i + 1).padStart(2, '0') }}</span>
            <span>{{ line }}</span>
          </li>
        </ul>
      </div>
    </section>

    <!-- 10. BIG SEO TEXT -->
    <section class="border-t border-misana-line bg-misana-paper">
      <div class="max-w-[1600px] mx-auto px-6 sm:px-12 py-16 sm:py-20">
        <p class="text-[11px] uppercase tracking-[0.2em] text-misana-muted mb-3">
          {{ t('transfers.fiche.aboutKicker') }}
        </p>
        <h2 class="font-display text-3xl sm:text-4xl lg:text-5xl mb-7 leading-[1.1]">{{ aboutTitle }}</h2>
        <p class="text-base sm:text-lg leading-[1.8] mb-14">{{ longContent.about[lng] }}</p>

        <h3 class="font-display text-2xl sm:text-3xl mb-7 leading-tight">{{ whyTitle }}</h3>
        <ol class="grid sm:grid-cols-2 gap-x-10 gap-y-6 mb-14">
          <li v-for="(reason, i) in longContent.whyMode[lng]" :key="i" class="flex gap-5">
            <span class="font-display italic text-2xl text-misana-muted leading-none mt-1 flex-shrink-0 w-8">
              {{ String(i + 1).padStart(2, '0') }}
            </span>
            <span class="text-base leading-relaxed">{{ reason }}</span>
          </li>
        </ol>

        <h2 class="font-display text-2xl sm:text-3xl mb-7 mt-16 leading-tight">{{ faqTitle }}</h2>
        <div class="divide-y divide-misana-line">
          <details v-for="(item, i) in longContent.faq" :key="i" class="group py-5">
            <summary class="flex items-center justify-between cursor-pointer list-none gap-4">
              <span class="text-base font-medium pr-4 leading-snug">{{ item.q[lng] }}</span>
              <span class="text-misana-muted text-xl leading-none transition-transform group-open:rotate-45 flex-shrink-0">+</span>
            </summary>
            <p class="mt-4 text-sm text-misana-ink/85 leading-relaxed pr-8">{{ item.a[lng] }}</p>
          </details>
        </div>
      </div>
    </section>

    <!-- 11. FOOTER CTA -->
    <section class="bg-misana-ink text-misana-paper">
      <div class="max-w-[1600px] mx-auto px-6 sm:px-12 py-16 sm:py-20 text-center">
        <p class="text-[11px] uppercase tracking-[0.25em] opacity-70 mb-4">{{ t('transfers.fiche.footerKicker') }}</p>
        <h2 class="font-display text-3xl sm:text-4xl lg:text-5xl mb-3 leading-tight">
          {{ fromName }} <span class="opacity-70 mx-2">→</span> {{ toName }}
        </h2>
        <p class="text-sm sm:text-base opacity-80 mb-8">
          {{ t('transfers.fiche.priceFrom') }} {{ formatPriceFrom(detail.priceFrom, lng) }} ·
          {{ duration }} min ·
          {{ detail.paxMin }}-{{ detail.paxMax }} pax
        </p>
        <NuxtLink
          :to="localePath({ path: '/request', query: { service: 'helicopter', from: transferEntry.from, to: transferEntry.to } })"
          class="inline-flex items-center gap-3 px-8 py-4 bg-misana-paper text-misana-ink text-sm tracking-wide rounded-[4px] hover:opacity-90 transition group"
        >
          <span>{{ t('transfers.fiche.requestTransfer') }}</span>
          <span class="transition-transform duration-500 group-hover:translate-x-1">→</span>
        </NuxtLink>
      </div>
    </section>
  </main>
</template>

<style scoped>
.alternative-chip {
  display: block;
  padding: 1rem 1.1rem;
  border: 1px solid var(--color-misana-line);
  border-radius: 6px;
  background: var(--color-misana-paper);
  transition: border-color 0.2s ease, transform 0.3s ease;
}
.alternative-chip:hover {
  border-color: var(--color-misana-ink);
  transform: translateY(-1px);
}
details summary::-webkit-details-marker { display: none; }
</style>
