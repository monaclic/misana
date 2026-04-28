<script setup lang="ts">
// Hub chauffeur : approche "Uber pour le luxe".
// 1. Hero panel sombre + glass-card avec tabs Transfert / Mise a disposition
//    et 3 champs minimum qui pre-remplissent /request
// 2. Notre flotte : 3 vehicules
// 3. Les transferts : strip horizontale (10 routes avec "A partir de X EUR")
// 4. Mise a disposition : slider sequentiel use-cases (jour/soiree/mariage...)
// 5. Comment ca se passe : 3 steps numerotes (rassurance Uber)
import { CHAUFFEUR_ROUTES, routeFromPriceChauffeur } from '~/lib/chauffeurRoutes';

definePageMeta({ layout: 'default' });

const { locale, t } = useI18n();
const localePath = useLocalePath();
const router = useRouter();

useSeoMeta({
  title: () => t('chauffeur.hubTitle'),
  description: () => t('chauffeur.hubDescription'),
});

useHead({
  script: [{
    type: 'application/ld+json',
    innerHTML: JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'Service',
      name: 'Chauffeur service French Riviera',
      provider: { '@type': 'Organization', name: 'Misana' },
      areaServed: ['Cannes', 'Monaco', 'Saint-Tropez', 'Nice', 'Cap-Ferrat'],
      serviceType: 'Chauffeur service',
    }),
  }],
});

// ============================================
// 1. HERO MINI-FORM
// ============================================
type FormMode = 'transfer' | 'disposal';
const mode = ref<FormMode>('transfer');

const formTransfer = reactive({ pickup: '', dropoff: '', date: '' });
const formDisposal = reactive({ city: '', duration: 'h8', date: '' });

function submitForm() {
  const localePathSafe = localePath('/request');
  const query: Record<string, string> = { service: 'chauffeur' };
  if (mode.value === 'transfer') {
    query.mode = 'transfer';
    if (formTransfer.pickup) query.from = formTransfer.pickup;
    if (formTransfer.dropoff) query.to = formTransfer.dropoff;
    if (formTransfer.date) query.date = formTransfer.date;
  } else {
    query.mode = 'disposal';
    if (formDisposal.city) query.city = formDisposal.city;
    if (formDisposal.duration) query.duration = formDisposal.duration;
    if (formDisposal.date) query.date = formDisposal.date;
  }
  router.push({ path: localePathSafe, query });
}

// ============================================
// 2. FLOTTE
// ============================================
const FLEET = [
  { id: 'v-class', image: 'https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=1600&q=80' },
  { id: 's-class', image: 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=1600&q=80' },
  { id: 'range-rover', image: 'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=1600&q=80' },
] as const;

// ============================================
// 3. TRANSFERTS (strip)
// ============================================
const featuredRoutes = computed(() =>
  CHAUFFEUR_ROUTES.map((r) => ({
    ...r,
    from: routeFromPriceChauffeur(r),
  })),
);
// On en met 6 en strip principal (les plus populaires : tous les nce-* + can-st)
const stripRoutes = computed(() => featuredRoutes.value.slice(0, 6));
const activeRoute = ref(0);

// Image map par route. Photos thematiques cote.
const ROUTE_IMAGES: Record<string, string> = {
  'nce-mc': 'https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=1600&q=80',
  'nce-can': 'https://images.unsplash.com/photo-1499678329028-101435549a4e?w=1600&q=80',
  'nce-st': 'https://images.unsplash.com/photo-1530541930197-ff16ac917b0e?w=1600&q=80',
  'nce-cf': 'https://images.unsplash.com/photo-1473093226795-af9932fe5856?w=1600&q=80',
  'nce-ca': 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=1600&q=80',
  'nce-eze': 'https://images.unsplash.com/photo-1605515298946-d062f2e9da53?w=1600&q=80',
  'nce-mn': 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=1600&q=80',
  'can-mc': 'https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=1600&q=80',
  'can-st': 'https://images.unsplash.com/photo-1530541930197-ff16ac917b0e?w=1600&q=80',
  'st-mc': 'https://images.unsplash.com/photo-1567899378494-47b22a2ae96a?w=1600&q=80',
};

// ============================================
// 4. MISE A DISPOSITION (slider use-cases)
// ============================================
const DISPOSAL_CASES = [
  { id: 'cannes-day', image: 'https://images.unsplash.com/photo-1499678329028-101435549a4e?w=1600&q=80' },
  { id: 'monaco-evening', image: 'https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=1600&q=80' },
  { id: 'wedding', image: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=1600&q=80' },
  { id: 'festival', image: 'https://images.unsplash.com/photo-1535359793267-b5cce72cd9c2?w=1600&q=80' },
  { id: 'pampelonne-lunch', image: 'https://images.unsplash.com/photo-1530541930197-ff16ac917b0e?w=1600&q=80' },
  { id: 'multi-city', image: 'https://images.unsplash.com/photo-1567899378494-47b22a2ae96a?w=1600&q=80' },
] as const;

const disposalTrack = ref<HTMLElement | null>(null);
useDragScroller(disposalTrack, { intervalMs: 5500 });

// Helper : recupere prix optionnel d'un cas (depuis i18n).
function disposalFrom(id: string): number | null {
  const v = (t as unknown as (k: string) => any)(`chauffeur.disposal.${id}.from`);
  return typeof v === 'number' && Number.isFinite(v) ? v : null;
}

// ============================================
// HEADER TRANSPARENCY + REVEAL
// ============================================
const heroImage = 'https://images.unsplash.com/photo-1485291571150-772bcfc10da5?w=2400&q=80';

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

const fmtEur = (n: number) =>
  new Intl.NumberFormat(locale.value === 'fr' ? 'fr-FR' : 'en-GB', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0,
  }).format(n);

const STEPS = ['1', '2', '3'] as const;
</script>

<template>
  <main>
    <!-- ============================================== -->
    <!-- 1. HERO + MINI-FORM (tabs transfert / dispo)     -->
    <!-- ============================================== -->
    <section
      ref="heroRef"
      class="ch-hero relative h-screen overflow-hidden -mt-16 bg-misana-ink text-misana-paper"
      data-revealed="false"
    >
      <img :src="heroImage" alt="" class="ch-hero-bg absolute inset-0 w-full h-full object-cover" />
      <div class="absolute inset-0 bg-misana-ink/60"></div>

      <div class="relative h-full flex flex-col items-center justify-center px-6 pt-20 pb-12">
        <div class="text-center max-w-2xl mb-10 sm:mb-12">
          <div class="overflow-hidden">
            <p class="reveal" data-delay="1">
              <span class="font-display italic text-xl sm:text-2xl opacity-90">the</span>
            </p>
          </div>
          <div class="overflow-hidden mt-1">
            <h1 class="reveal font-display text-4xl sm:text-6xl lg:text-7xl leading-[1.02]" data-delay="2">
              {{ t('chauffeur.hubTitle') }}
            </h1>
          </div>
        </div>

        <!-- Glass card form -->
        <div class="reveal-block w-full max-w-3xl" data-delay="3">
          <div class="ch-form">
            <!-- Tabs -->
            <div class="ch-tabs" role="tablist">
              <button
                type="button"
                role="tab"
                class="ch-tab"
                :class="mode === 'transfer' ? 'ch-tab-active' : ''"
                :aria-selected="mode === 'transfer'"
                @click="mode = 'transfer'"
              >
                {{ t('chauffeur.tabTransfer') }}
              </button>
              <button
                type="button"
                role="tab"
                class="ch-tab"
                :class="mode === 'disposal' ? 'ch-tab-active' : ''"
                :aria-selected="mode === 'disposal'"
                @click="mode = 'disposal'"
              >
                {{ t('chauffeur.tabDisposal') }}
              </button>
            </div>

            <form @submit.prevent="submitForm" class="ch-form-body">
              <!-- Mode : TRANSFERT -->
              <Transition name="ch-fields" mode="out-in">
                <div v-if="mode === 'transfer'" key="transfer" class="ch-fields">
                  <label class="ch-field">
                    <span class="ch-field-label">{{ t('chauffeur.form.pickup') }}</span>
                    <input
                      v-model="formTransfer.pickup"
                      type="text"
                      class="ch-field-input"
                      :placeholder="t('chauffeur.form.pickupPlaceholder')"
                      autocomplete="off"
                    />
                  </label>
                  <label class="ch-field">
                    <span class="ch-field-label">{{ t('chauffeur.form.dropoff') }}</span>
                    <input
                      v-model="formTransfer.dropoff"
                      type="text"
                      class="ch-field-input"
                      :placeholder="t('chauffeur.form.dropoffPlaceholder')"
                      autocomplete="off"
                    />
                  </label>
                  <label class="ch-field">
                    <span class="ch-field-label">{{ t('chauffeur.form.date') }}</span>
                    <input v-model="formTransfer.date" type="datetime-local" class="ch-field-input" />
                  </label>
                </div>

                <!-- Mode : MISE A DISPOSITION -->
                <div v-else key="disposal" class="ch-fields">
                  <label class="ch-field">
                    <span class="ch-field-label">{{ t('chauffeur.form.city') }}</span>
                    <input
                      v-model="formDisposal.city"
                      type="text"
                      class="ch-field-input"
                      :placeholder="t('chauffeur.form.cityPlaceholder')"
                      autocomplete="off"
                    />
                  </label>
                  <label class="ch-field">
                    <span class="ch-field-label">{{ t('chauffeur.form.duration') }}</span>
                    <select v-model="formDisposal.duration" class="ch-field-input">
                      <option value="h4">{{ t('chauffeur.duration.h4') }}</option>
                      <option value="h8">{{ t('chauffeur.duration.h8') }}</option>
                      <option value="h12">{{ t('chauffeur.duration.h12') }}</option>
                      <option value="h24">{{ t('chauffeur.duration.h24') }}</option>
                    </select>
                  </label>
                  <label class="ch-field">
                    <span class="ch-field-label">{{ t('chauffeur.form.date') }}</span>
                    <input v-model="formDisposal.date" type="datetime-local" class="ch-field-input" />
                  </label>
                </div>
              </Transition>

              <button type="submit" class="ch-submit">
                <span>{{ t('chauffeur.form.submit') }}</span>
                <span class="inline-flex items-center justify-center w-[1.1em] h-[1.1em] translate-y-[0.22em]">
                  <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" class="block w-full h-full">
                    <path d="M7 12H17" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
                    <path d="M13.5 8.5L17 12L13.5 15.5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" />
                  </svg>
                </span>
              </button>

              <p class="ch-footnote">{{ t('chauffeur.form.footnote') }}</p>
            </form>
          </div>
        </div>
      </div>
    </section>

    <!-- ============================================== -->
    <!-- 2. NOTRE FLOTTE                                  -->
    <!-- ============================================== -->
    <section class="bg-misana-paper">
      <div class="max-w-[1600px] mx-auto px-6 sm:px-12 py-24 sm:py-32">
        <div class="text-center mb-14 sm:mb-20">
          <p class="text-[11px] uppercase tracking-[0.25em] text-misana-muted mb-5">(MS · 01) · {{ t('chauffeur.fleetKicker') }}</p>
          <h2 class="font-display text-4xl sm:text-5xl lg:text-6xl leading-[1.05] mb-10">{{ t('chauffeur.fleetTitle') }}</h2>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          <NuxtLink
            v-for="v in FLEET"
            :key="v.id"
            :to="localePath({ path: '/request', query: { service: 'chauffeur', vehicle: v.id } })"
            class="vehicle-card group block bg-misana-paper border border-misana-line rounded-xl overflow-hidden transition hover:border-misana-ink"
          >
            <div class="aspect-[16/11] relative overflow-hidden bg-misana-stone">
              <img
                :src="v.image"
                :alt="t(`chauffeur.vehicle.${v.id}.name`)"
                loading="lazy"
                draggable="false"
                class="absolute inset-0 w-full h-full object-cover transition duration-700 group-hover:scale-[1.03]"
              />
            </div>
            <div class="p-5 sm:p-6">
              <div class="flex items-start gap-4 mb-5">
                <div class="shrink-0 w-10 h-10 rounded-full border border-misana-line flex items-center justify-center font-display text-sm">
                  {{ t(`chauffeur.vehicle.${v.id}.name`).charAt(0) }}
                </div>
                <div class="min-w-0 flex-1">
                  <h3 class="font-display text-lg leading-tight truncate">{{ t(`chauffeur.vehicle.${v.id}.name`) }}</h3>
                  <p class="text-xs text-misana-muted mt-1 flex items-center gap-2">
                    <span>{{ t(`chauffeur.vehicle.${v.id}.type`) }}</span>
                    <span class="inline-block w-1 h-1 rounded-full bg-misana-muted"></span>
                    <span>{{ t(`chauffeur.vehicle.${v.id}.pax`) }}</span>
                  </p>
                </div>
              </div>
              <div class="flex items-center justify-between">
                <span class="inline-flex items-center px-3 py-1 rounded-full bg-misana-stone text-xs text-misana-muted">
                  {{ t('chauffeur.fleetVehicleNote') }}
                </span>
                <span class="inline-flex items-center justify-center w-[1.1em] h-[1.1em] text-misana-muted transition-transform duration-500 group-hover:translate-x-1">
                  <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" class="block w-full h-full">
                    <path d="M7 12H17" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" />
                    <path d="M13.5 8.5L17 12L13.5 15.5" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" />
                  </svg>
                </span>
              </div>
            </div>
          </NuxtLink>
        </div>
      </div>
    </section>

    <!-- ============================================== -->
    <!-- 3. TRANSFERTS (strip horizontal expand)         -->
    <!-- ============================================== -->
    <section class="bg-misana-ink text-misana-paper">
      <div class="max-w-[1600px] mx-auto px-6 sm:px-12 py-24 sm:py-32">
        <div class="max-w-2xl mx-auto text-center mb-14 sm:mb-20">
          <p class="text-[11px] uppercase tracking-[0.25em] text-misana-paper/60 mb-5">(MS · 02) · {{ t('chauffeur.transfersKicker') }}</p>
          <h2 class="font-display text-4xl sm:text-5xl lg:text-6xl leading-[1.05] mb-6">{{ t('chauffeur.transfersTitle') }}</h2>
          <p class="text-misana-paper/70 text-base sm:text-lg leading-relaxed">{{ t('chauffeur.transfersLead') }}</p>
        </div>

        <div class="brands-row" @mouseleave="activeRoute = 0">
          <NuxtLink
            v-for="(r, i) in stripRoutes"
            :key="r.id"
            :to="localePath({ path: '/request', query: { service: 'chauffeur', mode: 'transfer', from: r.fromInputDefault, to: r.toInputDefault } })"
            class="brand-panel"
            :class="{ 'brand-panel-active': activeRoute === i }"
            @mouseenter="activeRoute = i"
            @focus="activeRoute = i"
          >
            <img :src="ROUTE_IMAGES[r.id]" :alt="`${r.fromLabel} → ${r.toLabel}`" loading="lazy" draggable="false" class="brand-img" />
            <div class="brand-overlay"></div>
            <div class="brand-content">
              <p class="brand-name">{{ locale === 'fr' ? r.fromLabelFr : r.fromLabel }} → {{ locale === 'fr' ? r.toLabelFr : r.toLabel }}</p>
              <p class="brand-tag">{{ r.duration }} <span class="opacity-50 mx-2">·</span> {{ t('chauffeur.transfersUnit') }} {{ r.from ? fmtEur(r.from) : '—' }}</p>
            </div>
          </NuxtLink>
        </div>

        <!-- Liste complete des routes (table sobre) -->
        <div class="ch-table mt-14 sm:mt-20">
          <ul>
            <li v-for="r in featuredRoutes" :key="r.id" class="ch-row">
              <NuxtLink
                :to="localePath({ path: '/request', query: { service: 'chauffeur', mode: 'transfer', from: r.fromInputDefault, to: r.toInputDefault } })"
                class="ch-row-link group"
              >
                <span class="ch-row-route">
                  <span class="ch-row-from">{{ locale === 'fr' ? r.fromLabelFr : r.fromLabel }}</span>
                  <span class="ch-row-arrow" aria-hidden="true">→</span>
                  <span class="ch-row-to">{{ locale === 'fr' ? r.toLabelFr : r.toLabel }}</span>
                </span>
                <span class="ch-row-duration">{{ r.duration }}</span>
                <span class="ch-row-price">
                  <span class="ch-row-price-label">{{ t('chauffeur.transfersUnit') }}</span>
                  <span class="ch-row-price-value">{{ r.from ? fmtEur(r.from) : '—' }}</span>
                </span>
                <span class="ch-row-cue">
                  <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" class="block w-4 h-4">
                    <path d="M7 12H17" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" />
                    <path d="M13.5 8.5L17 12L13.5 15.5" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" />
                  </svg>
                </span>
              </NuxtLink>
            </li>
          </ul>
        </div>
      </div>
    </section>

    <!-- ============================================== -->
    <!-- 4. MISE A DISPOSITION (slider sequentiel)        -->
    <!-- ============================================== -->
    <section class="bg-misana-paper">
      <div class="max-w-[1600px] mx-auto px-6 sm:px-12 py-24 sm:py-32">
        <div class="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6 mb-12 sm:mb-16">
          <div>
            <p class="text-[11px] uppercase tracking-[0.25em] text-misana-muted mb-4">(MS · 03) · {{ t('chauffeur.disposalKicker') }}</p>
            <h2 class="font-display text-4xl sm:text-5xl lg:text-6xl leading-[1.05] m-0">{{ t('chauffeur.disposalTitle') }}</h2>
          </div>
          <NuxtLink
            :to="localePath({ path: '/request', query: { service: 'chauffeur', mode: 'disposal' } })"
            class="hidden sm:inline-flex items-center gap-3 group text-misana-ink text-base self-end"
          >
            <span class="border-b border-misana-ink pb-0.5">{{ t('chauffeur.disposalCta') }}</span>
            <span class="inline-flex items-center justify-center w-[1.1em] h-[1.1em] translate-y-[0.22em] transition-transform duration-700 group-hover:translate-x-2">
              <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" class="block w-full h-full">
                <path d="M7 12H17" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" />
                <path d="M13.5 8.5L17 12L13.5 15.5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
            </span>
          </NuxtLink>
        </div>

        <div ref="disposalTrack" class="categories-track">
          <NuxtLink
            v-for="(c, i) in [...DISPOSAL_CASES, ...DISPOSAL_CASES]"
            :key="`${c.id}-${i}`"
            :to="localePath({ path: '/request', query: { service: 'chauffeur', mode: 'disposal', use: c.id } })"
            class="category-card group"
            :aria-hidden="i >= DISPOSAL_CASES.length ? 'true' : undefined"
          >
            <img :src="c.image" :alt="t(`chauffeur.disposal.${c.id}.title`)" loading="lazy" draggable="false" class="category-img" />
            <div class="category-gradient"></div>
            <div class="category-content">
              <p class="text-[11px] uppercase tracking-[0.22em] text-misana-paper/85 mb-2">
                <template v-if="disposalFrom(c.id) !== null">
                  {{ t('chauffeur.disposalFrom') }} {{ fmtEur(disposalFrom(c.id) as number) }}
                </template>
                <template v-else>
                  {{ t('chauffeur.disposalOnRequest') }}
                </template>
              </p>
              <h3 class="font-display text-2xl sm:text-3xl lg:text-4xl leading-tight m-0">{{ t(`chauffeur.disposal.${c.id}.title`) }}</h3>
              <p class="text-sm text-misana-paper/75 mt-2">{{ t(`chauffeur.disposal.${c.id}.subtitle`) }}</p>
            </div>
          </NuxtLink>
        </div>
      </div>
    </section>

    <!-- ============================================== -->
    <!-- 5. COMMENT CA SE PASSE (3 steps numerotes)       -->
    <!-- ============================================== -->
    <section class="bg-misana-stone">
      <div class="max-w-[1600px] mx-auto px-6 sm:px-12 py-24 sm:py-32">
        <div class="text-center mb-14 sm:mb-20">
          <p class="text-[11px] uppercase tracking-[0.25em] text-misana-muted mb-5">(MS · 04) · {{ t('chauffeur.stepsKicker') }}</p>
          <h2 class="font-display text-4xl sm:text-5xl lg:text-6xl leading-[1.05]">{{ t('chauffeur.stepsTitle') }}</h2>
        </div>

        <ol class="grid grid-cols-1 md:grid-cols-3 gap-10 lg:gap-16 list-none p-0">
          <li v-for="(n, i) in STEPS" :key="n" class="step-item">
            <span class="step-num">{{ String(i + 1).padStart(2, '0') }}</span>
            <span class="step-rule"></span>
            <h3 class="step-title">{{ t(`chauffeur.step${i + 1}Title`) }}</h3>
            <p class="step-body">{{ t(`chauffeur.step${i + 1}Body`) }}</p>
          </li>
        </ol>

        <div class="text-center mt-16 sm:mt-20">
          <NuxtLink
            :to="localePath({ path: '/request', query: { service: 'chauffeur' } })"
            class="inline-flex items-center gap-3 group text-misana-ink text-base"
          >
            <span class="border-b border-misana-ink pb-0.5">{{ t('chauffeur.form.submit') }}</span>
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
/* === Hero === */
.ch-hero-bg {
  transform: scale(1.06);
  transition: transform 8s ease-out;
}
[data-revealed="true"] .ch-hero-bg { transform: scale(1); }

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
[data-revealed="true"] .reveal[data-delay="3"] { transition-delay: 0.32s; }

.reveal-block {
  opacity: 0;
  transform: translateY(24px);
  transition:
    opacity 1.1s cubic-bezier(0.16, 1, 0.3, 1),
    transform 1.1s cubic-bezier(0.16, 1, 0.3, 1);
}
[data-revealed="true"] .reveal-block { opacity: 1; transform: translateY(0); }
[data-revealed="true"] .reveal-block[data-delay="3"] { transition-delay: 0.36s; }

/* === Glass form === */
.ch-form {
  background: rgba(255, 255, 255, 0.07);
  border: 1px solid rgba(255, 255, 255, 0.18);
  border-radius: 6px;
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  padding: 1.4rem 1.6rem 1.6rem;
}
.ch-tabs {
  display: flex;
  gap: 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.18);
  margin-bottom: 1.25rem;
}
.ch-tab {
  position: relative;
  padding: 0.75rem 1.25rem 0.85rem;
  font-size: 0.78rem;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.55);
  background: none;
  border: 0;
  cursor: pointer;
  transition: color 0.4s ease;
}
.ch-tab::after {
  content: '';
  position: absolute;
  inset: auto 0 -1px 0;
  height: 1px;
  background: var(--color-misana-paper);
  transform: scaleX(0);
  transform-origin: left;
  transition: transform 0.5s cubic-bezier(0.16, 1, 0.3, 1);
}
.ch-tab-active { color: var(--color-misana-paper); }
.ch-tab-active::after { transform: scaleX(1); }

.ch-form-body { display: flex; flex-direction: column; gap: 0.85rem; }

.ch-fields {
  display: grid;
  grid-template-columns: 1fr;
  gap: 0.85rem;
}
@media (min-width: 768px) {
  .ch-fields { grid-template-columns: 1fr 1fr 1fr; gap: 1rem; }
}

.ch-field { display: flex; flex-direction: column; gap: 0.35rem; min-width: 0; }
.ch-field-label {
  font-size: 0.65rem;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.65);
}
.ch-field-input {
  width: 100%;
  background: transparent;
  border: 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.3);
  color: var(--color-misana-paper);
  font-size: 0.95rem;
  padding: 0.45rem 0;
  outline: none;
  transition: border-color 0.3s ease;
  font-family: inherit;
}
.ch-field-input::placeholder { color: rgba(255, 255, 255, 0.4); }
.ch-field-input:focus { border-bottom-color: var(--color-misana-paper); }
.ch-field-input::-webkit-calendar-picker-indicator { filter: invert(1) opacity(0.6); }

.ch-submit {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.85rem;
  width: 100%;
  margin-top: 0.5rem;
  padding: 0.95rem 1.5rem;
  background: var(--color-misana-paper);
  color: var(--color-misana-ink);
  font-size: 0.85rem;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  border: 0;
  border-radius: 4px;
  cursor: pointer;
  transition: background 0.3s ease, color 0.3s ease;
  font-family: inherit;
}
.ch-submit:hover { background: rgba(255, 255, 255, 0.88); }

.ch-footnote {
  font-size: 0.72rem;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.6);
  text-align: center;
  margin: 0.25rem 0 0;
}

.ch-fields-enter-active,
.ch-fields-leave-active {
  transition:
    opacity 0.45s cubic-bezier(0.16, 1, 0.3, 1),
    transform 0.45s cubic-bezier(0.16, 1, 0.3, 1);
}
.ch-fields-enter-from,
.ch-fields-leave-to {
  opacity: 0;
  transform: translateY(8px);
}

/* === Vehicle card === */
.vehicle-card { transition: border-color 0.4s ease, transform 0.4s ease; }

/* === Brands strip (transferts) === */
.brands-row {
  display: flex;
  gap: 8px;
  height: 60vh;
  min-height: 400px;
  max-height: 640px;
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
  opacity: 0.32;
  transform: scale(1.04);
  transition: opacity 1s cubic-bezier(0.16, 1, 0.3, 1), transform 1.4s cubic-bezier(0.16, 1, 0.3, 1);
}
.brand-panel-active .brand-img { opacity: 1; transform: scale(1); }
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
  letter-spacing: 0.05em;
  color: var(--color-misana-paper);
  margin: 0;
  white-space: nowrap;
  transition: font-size 0.6s ease;
}
.brand-panel-active .brand-name { font-size: 1.05rem; }
.brand-tag {
  font-size: 0.72rem;
  color: rgba(255, 255, 255, 0.78);
  margin-top: 0.55rem;
  letter-spacing: 0.05em;
  opacity: 0;
  transform: translateY(8px);
  transition: opacity 0.6s ease 0.25s, transform 0.6s ease 0.25s;
}
.brand-panel-active .brand-tag { opacity: 1; transform: translateY(0); }

@media (max-width: 767px) {
  .brands-row { flex-direction: column; height: auto; min-height: 0; max-height: none; }
  .brand-panel { height: 22vh; min-height: 160px; }
  .brand-panel-active { flex-grow: 1; }
  .brand-img { opacity: 0.55; }
  .brand-overlay { opacity: 1; }
  .brand-tag { opacity: 1; transform: none; }
}

/* === Table de routes complete === */
.ch-table {
  border-top: 1px solid rgba(255, 255, 255, 0.18);
}
.ch-table ul { list-style: none; margin: 0; padding: 0; }
.ch-row { border-bottom: 1px solid rgba(255, 255, 255, 0.12); }
.ch-row-link {
  display: grid;
  grid-template-columns: 1fr auto auto auto;
  align-items: center;
  gap: 1.5rem;
  padding: 1.1rem 0.5rem;
  text-decoration: none;
  color: var(--color-misana-paper);
  transition: padding 0.4s ease;
}
.ch-row-link:hover { padding-left: 1.25rem; padding-right: 1.25rem; }
.ch-row-route {
  font-family: var(--font-display, serif);
  font-size: 1.1rem;
  display: inline-flex;
  align-items: center;
  gap: 0.65rem;
  min-width: 0;
}
.ch-row-from, .ch-row-to { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.ch-row-arrow { opacity: 0.5; font-size: 0.95rem; }
.ch-row-duration {
  font-size: 0.78rem;
  letter-spacing: 0.05em;
  color: rgba(255, 255, 255, 0.55);
  white-space: nowrap;
}
.ch-row-price { display: inline-flex; align-items: baseline; gap: 0.5rem; white-space: nowrap; }
.ch-row-price-label {
  font-size: 0.65rem;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.5);
}
.ch-row-price-value {
  font-family: var(--font-display, serif);
  font-size: 1.1rem;
  color: var(--color-misana-paper);
}
.ch-row-cue { color: rgba(255, 255, 255, 0.55); transition: transform 0.5s ease, color 0.3s ease; }
.ch-row-link:hover .ch-row-cue { transform: translateX(4px); color: var(--color-misana-paper); }

@media (max-width: 767px) {
  .ch-row-link {
    grid-template-columns: 1fr auto;
    grid-template-rows: auto auto;
    gap: 0.35rem 1rem;
    padding: 1rem 0.5rem;
  }
  .ch-row-route { grid-column: 1 / -1; font-size: 1rem; }
  .ch-row-duration { grid-row: 2; grid-column: 1; }
  .ch-row-price { grid-row: 2; grid-column: 2; }
  .ch-row-cue { display: none; }
}

/* === Categories track (use-cases mise a dispo) === */
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

/* === Steps "Comment ca se passe" === */
.step-item {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 1rem;
}
.step-num {
  font-family: var(--font-display, serif);
  font-style: italic;
  font-size: 0.8rem;
  letter-spacing: 0.05em;
  color: var(--color-misana-muted);
}
.step-rule {
  display: block;
  width: 32px;
  height: 1px;
  background: var(--color-misana-ink);
  margin-bottom: 0.25rem;
}
.step-title {
  font-family: var(--font-display, serif);
  font-size: 1.6rem;
  line-height: 1.1;
  margin: 0;
  color: var(--color-misana-ink);
}
.step-body {
  margin: 0;
  font-size: 0.95rem;
  line-height: 1.6;
  color: var(--color-misana-muted);
  max-width: 32ch;
}

@media (prefers-reduced-motion: reduce) {
  .reveal, .reveal-block, .ch-hero-bg, .brand-img, .category-img, .ch-row-link, .ch-row-cue {
    transition: none !important;
    transform: none !important;
    opacity: 1 !important;
  }
}
</style>
