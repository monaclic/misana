<script setup lang="ts">
// Fiche service x ville. URL : /services/[service]/in/[city]
// Pattern landing SEO/SEA cocon : hero + booking card + data row + sections SEO
// + temoignage operations + galerie alternative + maillage internal.
//
// Le sous-segment 'in' evite les conflits avec les routes dynamiques existantes
// (/services/yacht/[yacht], /services/cars/[brandModel], /services/access/[establishment]).
import { SERVICES, CITIES } from '~/lib/constants';
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

// SEO meta
const seoTitle = computed(() => {
  const sN = serviceName.value;
  const cN = cityName.value;
  if (locale.value === 'fr') {
    return `${sN} ${cN} · À partir de ${formatPrice(detail.value!.priceFrom, 'fr')} · Misana`;
  }
  return `${sN} in ${cN} · From ${formatPrice(detail.value!.priceFrom, 'en')} · Misana`;
});

const seoDescription = computed(() => detail.value!.about[lng.value].slice(0, 155));

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

// Popular transfers (refs to TRANSFERS)
const popularTransfers = computed(() => getPopularTransfers(detail.value!.popularTransferSlugs));

// Other cities for the same service
const otherCities = computed(() =>
  CITIES.filter((c) => c.slug !== city.value).slice(0, 4),
);

const breadcrumb = computed(() => [
  { label: 'Misana', to: '/' },
  { label: serviceName.value, to: `/services/${service.value}` },
  { label: cityName.value },
]);

// Booking quick form
const date = ref('');
const pax = ref(2);
const notes = ref('');

const minDate = computed(() => {
  const d = new Date();
  d.setHours(d.getHours() + 24);
  return d.toISOString().slice(0, 10);
});

function decPax() { if (pax.value > 1) pax.value--; }
function incPax() { if (pax.value < 12) pax.value++; }

const canSubmit = computed(() => !!date.value && pax.value >= 1);

async function submit() {
  if (!canSubmit.value) return;
  const query: Record<string, string> = {
    service: service.value,
    city: city.value,
    date: date.value,
    pax: String(pax.value),
  };
  if (notes.value.trim()) query.notes = notes.value.trim();
  await navigateTo({ path: localePath('/request'), query });
}

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

// Service mode for transfer URL building : chauffeur or helicopter
function transferModeFor(t: typeof popularTransfers.value[number]): 'chauffeur' | 'helicopter' {
  // For 'both' mode routes, default to chauffeur if current service is chauffeur, else helicopter.
  if (t.mode === 'both') return service.value === 'helicopter' ? 'helicopter' : 'chauffeur';
  return t.mode === 'helicopter' ? 'helicopter' : 'chauffeur';
}
</script>

<template>
  <main class="min-h-screen">
    <!-- 01. HERO pleine largeur -->
    <section
      ref="heroRef"
      class="relative h-[60vh] sm:h-[72vh] min-h-[440px] overflow-hidden -mt-16 bg-misana-ink"
    >
      <img
        :src="detail!.heroImage"
        :alt="`${serviceName} ${cityName}`"
        class="absolute inset-0 w-full h-full object-cover opacity-95"
      />
      <div class="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-misana-ink/80 via-misana-ink/35 to-transparent"></div>
      <div class="relative h-full max-w-[1600px] mx-auto px-6 sm:px-12 flex flex-col justify-end pb-12 sm:pb-16 text-misana-paper">
        <p class="text-[11px] uppercase tracking-[0.25em] opacity-90 mb-4">
          {{ serviceName }}
          <span class="opacity-60 mx-2">·</span>
          {{ cityName }}
        </p>
        <h1 class="font-display leading-[1.02] mb-4">
          <span class="block font-display italic text-xl sm:text-2xl lg:text-3xl opacity-90 mb-2">
            {{ locale === 'fr' ? `Service ${serviceName.toLowerCase()}` : `${serviceName} service` }}
          </span>
          <span class="block text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-[5.5rem] text-balance leading-[1.02] tracking-tight">
            {{ cityName }}
          </span>
        </h1>
        <p class="font-display italic text-lg sm:text-xl lg:text-2xl opacity-90 max-w-3xl text-balance">
          {{ detail!.signature[lng] }}
        </p>
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

    <!-- 03. INTRO + BOOKING (grid 7/5, hauteurs alignees) -->
    <section>
      <div class="max-w-[1600px] mx-auto px-6 sm:px-12 py-12 sm:py-16 grid lg:grid-cols-12 gap-8 lg:gap-12 lg:items-stretch">
        <div class="lg:col-span-7 lg:flex lg:flex-col">
          <div class="aspect-[800/460] lg:aspect-auto lg:flex-1 lg:min-h-[440px] overflow-hidden rounded-[6px] bg-misana-paper border border-misana-line">
            <img
              :src="detail!.illustration"
              :alt="`${serviceName} ${cityName}`"
              class="w-full h-full object-cover"
            />
          </div>
        </div>

        <aside class="lg:col-span-5 lg:flex lg:flex-col">
          <div class="lg:h-full lg:flex lg:flex-col">
            <div class="border border-misana-line bg-misana-paper rounded-[6px] overflow-hidden lg:flex-1 lg:flex lg:flex-col">
              <div class="px-6 sm:px-7 pt-6 pb-5 border-b border-misana-line">
                <p class="text-[11px] uppercase tracking-[0.2em] text-misana-muted mb-2">
                  {{ locale === 'fr' ? 'À partir de' : 'From' }}
                </p>
                <div class="flex items-baseline gap-3">
                  <span class="font-display text-4xl leading-none">{{ formatPrice(detail!.priceFrom, lng) }}</span>
                  <span class="text-xs text-misana-muted">{{ detail!.priceUnit[lng] }}</span>
                </div>
                <p class="text-[11px] text-misana-muted mt-2 leading-relaxed">
                  {{ locale === 'fr' ? 'Indicatif. Devis final transmis à la demande, selon date et conditions.' : 'Indicative. Final quote shared on request, depending on date and conditions.' }}
                </p>
              </div>

              <div class="px-6 sm:px-7 py-6 space-y-4 lg:flex-1 lg:flex lg:flex-col lg:justify-center">
                <div class="grid grid-cols-2 gap-3">
                  <div>
                    <label class="block text-[10px] uppercase tracking-[0.18em] text-misana-muted mb-1.5">
                      {{ locale === 'fr' ? 'Date' : 'Date' }}
                    </label>
                    <input v-model="date" type="date" :min="minDate" class="form-input" />
                  </div>
                  <div>
                    <label class="block text-[10px] uppercase tracking-[0.18em] text-misana-muted mb-1.5">
                      {{ locale === 'fr' ? 'Convives' : 'Guests' }}
                    </label>
                    <div class="flex items-stretch border border-misana-line rounded-[4px] overflow-hidden">
                      <button type="button" class="counter-btn" :disabled="pax <= 1" @click="decPax">−</button>
                      <span class="flex-1 flex items-center justify-center text-sm">{{ pax }}</span>
                      <button type="button" class="counter-btn" :disabled="pax >= 12" @click="incPax">+</button>
                    </div>
                  </div>
                </div>

                <div>
                  <label class="block text-[10px] uppercase tracking-[0.18em] text-misana-muted mb-1.5">
                    {{ locale === 'fr' ? 'Notes (optionnel)' : 'Notes (optional)' }}
                  </label>
                  <textarea
                    v-model="notes"
                    rows="2"
                    class="form-input resize-none"
                    :placeholder="locale === 'fr' ? 'Préférences, contexte...' : 'Preferences, context...'"
                  />
                </div>

                <button type="button" class="submit-btn" :disabled="!canSubmit" @click="submit">
                  <span>{{ locale === 'fr' ? 'Continuer' : 'Continue' }}</span>
                  <span class="arrow">→</span>
                </button>
              </div>

              <div class="px-6 sm:px-7 py-4 border-t border-misana-line text-[11px] text-misana-muted leading-relaxed space-y-1.5">
                <div class="flex justify-between gap-2">
                  <span>{{ locale === 'fr' ? 'Réponse' : 'Reply' }}</span>
                  <span class="text-misana-ink">{{ locale === 'fr' ? 'Sous 2h' : 'Within 2h' }}</span>
                </div>
                <div class="flex justify-between gap-2">
                  <span>{{ locale === 'fr' ? 'Annulation' : 'Cancellation' }}</span>
                  <span class="text-misana-ink">{{ locale === 'fr' ? 'Gratuite jusqu\'à 24h' : 'Free up to 24h' }}</span>
                </div>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </section>

    <!-- 04. DATA ROW : 4 metrics -->
    <section class="border-y border-misana-line">
      <div class="max-w-[1600px] mx-auto px-6 sm:px-12 py-8 sm:py-10 grid grid-cols-2 sm:grid-cols-4 gap-6 sm:gap-10">
        <div v-for="(m, i) in detail!.metrics" :key="i">
          <p class="text-[10px] uppercase tracking-[0.2em] text-misana-muted mb-1.5">
            {{ lng === 'fr' ? m.labelFr : m.labelEn }}
          </p>
          <p class="font-display text-2xl sm:text-3xl leading-tight">{{ m.value }}</p>
        </div>
      </div>
    </section>

    <!-- 05. WHAT WE ORCHESTRATE IN [CITY] : 3-4 cards -->
    <section>
      <div class="max-w-[1600px] mx-auto px-6 sm:px-12 py-12 sm:py-16">
        <p class="text-[11px] uppercase tracking-[0.2em] text-misana-muted mb-8">
          {{ locale === 'fr' ? `Ce que nous orchestrons à ${cityName}` : `What we orchestrate in ${cityName}` }}
        </p>
        <div class="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          <div v-for="(item, i) in detail!.whatWeOrchestrate" :key="i" class="space-y-3">
            <p class="font-display text-2xl text-misana-muted leading-none">{{ String(i + 1).padStart(2, '0') }}</p>
            <h3 class="font-display text-lg leading-snug">{{ lng === 'fr' ? item.titleFr : item.titleEn }}</h3>
            <p class="text-sm text-misana-ink/85 leading-relaxed">{{ lng === 'fr' ? item.descFr : item.descEn }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- 06. POPULAR TRANSFERS FROM [CITY] -->
    <section v-if="popularTransfers.length" class="border-t border-misana-line">
      <div class="max-w-[1600px] mx-auto px-6 sm:px-12 py-12 sm:py-14">
        <p class="text-[11px] uppercase tracking-[0.2em] text-misana-muted mb-5">
          {{ locale === 'fr' ? `Routes populaires depuis ${cityName}` : `Popular routes from ${cityName}` }}
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

    <!-- 07. WHY MISANA IN [CITY] : 5 bullets -->
    <section class="border-t border-misana-line">
      <div class="max-w-[1600px] mx-auto px-6 sm:px-12 py-12 sm:py-16">
        <p class="text-[11px] uppercase tracking-[0.2em] text-misana-muted mb-8">
          {{ locale === 'fr' ? `Pourquoi Misana à ${cityName}` : `Why Misana in ${cityName}` }}
        </p>
        <ol class="grid sm:grid-cols-2 gap-x-10 gap-y-6">
          <li v-for="(reason, i) in detail!.whyHere[lng]" :key="i" class="flex gap-5">
            <span class="font-display italic text-2xl text-misana-muted leading-none mt-1 flex-shrink-0 w-8">
              {{ String(i + 1).padStart(2, '0') }}
            </span>
            <span class="text-base leading-relaxed">{{ reason }}</span>
          </li>
        </ol>
      </div>
    </section>

    <!-- 08. OPERATING STANDARD : 6 trust badges -->
    <section class="border-t border-misana-line">
      <div class="max-w-[1600px] mx-auto px-6 sm:px-12 py-12 sm:py-14">
        <p class="text-[11px] uppercase tracking-[0.25em] text-misana-muted text-center mb-10">
          {{ t('transfers.fiche.standardKicker') }}
        </p>
        <div class="grid grid-cols-2 sm:grid-cols-3 gap-x-10 gap-y-10">
          <div v-for="key in ['insurance', 'operators', 'response', 'cancellation', 'fleet', 'local']" :key="key" class="flex gap-4">
            <span class="flex-shrink-0 w-9 h-9 border border-misana-ink rounded-full flex items-center justify-center mt-0.5">
              <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">
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

    <!-- 09. BIG SEO TEXT : about + FAQ pleine largeur -->
    <section class="border-t border-misana-line bg-misana-paper">
      <div class="max-w-[1600px] mx-auto px-6 sm:px-12 py-16 sm:py-20">
        <p class="text-[11px] uppercase tracking-[0.2em] text-misana-muted mb-3">
          {{ locale === 'fr' ? 'À propos de ce service' : 'About this service' }}
        </p>
        <h2 class="font-display text-3xl sm:text-4xl lg:text-5xl mb-7 leading-[1.1]">
          {{ locale === 'fr' ? `${serviceName} ${cityName}` : `${serviceName} in ${cityName}` }}
        </h2>
        <p class="text-base sm:text-lg leading-[1.8] mb-14">{{ detail!.about[lng] }}</p>

        <h2 class="font-display text-2xl sm:text-3xl mb-7 mt-16 leading-tight">
          {{ locale === 'fr' ? `Questions fréquentes sur ${serviceName.toLowerCase()} ${cityName}` : `Frequently asked about ${serviceName.toLowerCase()} in ${cityName}` }}
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

    <!-- 10. OTHER CITIES (chips) -->
    <section v-if="otherCities.length" class="border-t border-misana-line">
      <div class="max-w-[1600px] mx-auto px-6 sm:px-12 py-12 sm:py-14">
        <p class="text-[11px] uppercase tracking-[0.2em] text-misana-muted mb-5">
          {{ locale === 'fr' ? `${serviceName} dans d'autres villes` : `${serviceName} in other cities` }}
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

    <!-- 11. FOOTER CTA inverse -->
    <section class="bg-misana-ink text-misana-paper">
      <div class="max-w-[1600px] mx-auto px-6 sm:px-12 py-16 sm:py-20 text-center">
        <p class="text-[11px] uppercase tracking-[0.25em] opacity-70 mb-4">
          {{ locale === 'fr' ? 'Faire une demande' : 'Begin a request' }}
        </p>
        <h2 class="font-display text-3xl sm:text-4xl lg:text-5xl mb-3 leading-tight">
          {{ locale === 'fr' ? `${serviceName} ${cityName}` : `${serviceName} in ${cityName}` }}
        </h2>
        <p class="text-sm sm:text-base opacity-80 mb-8">
          {{ locale === 'fr' ? 'À partir de' : 'From' }} {{ formatPrice(detail!.priceFrom, lng) }} ·
          {{ locale === 'fr' ? 'Réponse sous 2h' : 'Reply within 2h' }} ·
          {{ locale === 'fr' ? 'Annulation gratuite' : 'Free cancellation' }}
        </p>
        <NuxtLink
          :to="localePath({ path: '/request', query: { service: service, city: city } })"
          class="inline-flex items-center gap-3 px-8 py-4 bg-misana-paper text-misana-ink text-sm tracking-wide rounded-[4px] hover:opacity-90 transition group"
        >
          <span>{{ locale === 'fr' ? 'Demander' : 'Request' }} {{ serviceName.toLowerCase() }}</span>
          <span class="transition-transform duration-500 group-hover:translate-x-1">→</span>
        </NuxtLink>
      </div>
    </section>
  </main>
</template>

<style scoped>
.form-input {
  width: 100%;
  border: 1px solid var(--color-misana-line);
  background: var(--color-misana-paper);
  padding: 0.55rem 0.65rem;
  font-size: 0.85rem;
  color: var(--color-misana-ink);
  border-radius: 4px;
  outline: none;
  transition: border-color 0.2s ease;
  font-family: inherit;
}
.form-input:focus { border-color: var(--color-misana-ink); }
.counter-btn {
  width: 36px;
  font-size: 1rem;
  color: var(--color-misana-ink);
  background: var(--color-misana-paper);
  cursor: pointer;
  transition: background 0.15s ease;
}
.counter-btn:first-child { border-right: 1px solid var(--color-misana-line); }
.counter-btn:last-child { border-left: 1px solid var(--color-misana-line); }
.counter-btn:hover:not(:disabled) { background: var(--color-misana-stone); }
.counter-btn:disabled { opacity: 0.3; cursor: not-allowed; }
.submit-btn {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 0.95rem 1.15rem;
  background: var(--color-misana-ink);
  color: var(--color-misana-paper);
  font-size: 0.9rem;
  letter-spacing: 0.02em;
  border-radius: 4px;
  cursor: pointer;
  transition: opacity 0.2s ease;
}
.submit-btn:hover:not(:disabled) { opacity: 0.88; }
.submit-btn:disabled { opacity: 0.4; cursor: not-allowed; }
.submit-btn .arrow { transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1); }
.submit-btn:hover:not(:disabled) .arrow { transform: translateX(4px); }

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
details summary::-webkit-details-marker { display: none; }
</style>
