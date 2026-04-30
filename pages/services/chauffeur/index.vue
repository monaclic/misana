<script setup lang="ts">
// Hub chauffeur uberise. 4 sections, tout pousse vers /request.
// 1. Hero panel sombre + glass-card avec tabs Transfert / Mise a disposition
//    et 3 champs pre-remplissants (la mise a dispo est captee ici, pas
//    de section dediee plus bas)
// 2. Trajets : strip horizontal des 6 routes phares + table sobre
//    listant les 10 transferts complets avec prix "A partir de"
// 3. Notre flotte : VEHICLES reels depuis lib/fleet (E-Class, V-Class,
//    S-Class, Range Rover, Maybach), photos Leader Limousines
// 4. Comment ca fonctionne : timeline horizontale 3 etapes
import { CHAUFFEUR_ROUTES, routeFromPriceChauffeur } from '~/lib/chauffeurRoutes';
import { VEHICLES } from '~/lib/fleet';

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
// HERO MINI-FORM
// ============================================
type FormMode = 'transfer' | 'disposal';
const mode = ref<FormMode>('transfer');

const formTransfer = reactive({ pickup: '', dropoff: '', date: '' });
const formDisposal = reactive({ city: '', duration: 'h8', date: '' });

function submitForm() {
  const path = localePath('/request');
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
  router.push({ path, query });
}

// ============================================
// TRAJETS
// ============================================
const featuredRoutes = computed(() =>
  CHAUFFEUR_ROUTES.map((r) => ({ ...r, from: routeFromPriceChauffeur(r) })),
);
const stripRoutes = computed(() => featuredRoutes.value.slice(0, 6));
const activeRoute = ref(0);

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
// HEADER TRANSPARENCY + REVEAL
// ============================================
const heroImage = 'https://images.unsplash.com/photo-1485291571150-772bcfc10da5?w=2400&q=80';

const headerTransparent = useState<boolean>('header-transparent', () => true);
// Meme logique que la home : CTA header et sticky bottom bar caches
// pendant le hero, visibles des qu'on scrolle dans le contenu.
const stickyContactVisible = useState<boolean>('sticky-contact-visible', () => true);
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
    stickyContactVisible.value = false;
    heroOverlapObserver = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          const overlapping = e.isIntersecting && e.intersectionRatio > 0;
          headerTransparent.value = overlapping;
          stickyContactVisible.value = !overlapping;
        }
      },
      { threshold: [0, 0.01] },
    );
    heroOverlapObserver.observe(heroRef.value);
  }
});

onBeforeUnmount(() => {
  headerTransparent.value = false;
  stickyContactVisible.value = true;
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
</script>

<template>
  <main>
    <!-- ============================================== -->
    <!-- 1. HERO + MINI-FORM (tabs transfert / dispo)     -->
    <!-- ============================================== -->
    <section
      ref="heroRef"
      class="ch-hero relative h-dvh overflow-hidden -mt-16 bg-misana-ink text-misana-paper"
      data-revealed="false"
    >
      <img :src="heroImage" alt="" class="ch-hero-bg absolute inset-0 w-full h-full object-cover" />
      <div class="absolute inset-0 bg-misana-ink/60"></div>

      <div class="relative h-full flex flex-col items-center justify-center px-6 pt-20 pb-8 sm:pb-12">
        <div class="text-center max-w-2xl mb-6 sm:mb-12">
          <div class="overflow-hidden">
            <p class="reveal" data-delay="1">
              <span class="font-display italic text-lg sm:text-2xl opacity-90">the</span>
            </p>
          </div>
          <div class="overflow-hidden mt-1">
            <h1 class="reveal font-display text-3xl sm:text-6xl lg:text-7xl leading-[1.02]" data-delay="2">
              {{ t('chauffeur.hubTitle') }}
            </h1>
          </div>
        </div>

        <div class="reveal-block w-full max-w-3xl" data-delay="3">
          <div class="ch-form">
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
              <Transition name="ch-fields" mode="out-in">
                <div v-if="mode === 'transfer'" key="transfer" class="ch-fields">
                  <label class="ch-field">
                    <span class="ch-field-label">{{ t('chauffeur.form.pickup') }}</span>
                    <input v-model="formTransfer.pickup" type="text" class="ch-field-input" :placeholder="t('chauffeur.form.pickupPlaceholder')" autocomplete="off" />
                  </label>
                  <label class="ch-field">
                    <span class="ch-field-label">{{ t('chauffeur.form.dropoff') }}</span>
                    <input v-model="formTransfer.dropoff" type="text" class="ch-field-input" :placeholder="t('chauffeur.form.dropoffPlaceholder')" autocomplete="off" />
                  </label>
                  <label class="ch-field">
                    <span class="ch-field-label">{{ t('chauffeur.form.date') }}</span>
                    <input v-model="formTransfer.date" type="datetime-local" class="ch-field-input" />
                  </label>
                </div>
                <div v-else key="disposal" class="ch-fields">
                  <label class="ch-field">
                    <span class="ch-field-label">{{ t('chauffeur.form.city') }}</span>
                    <input v-model="formDisposal.city" type="text" class="ch-field-input" :placeholder="t('chauffeur.form.cityPlaceholder')" autocomplete="off" />
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
    <!-- 2. TRAJETS                                       -->
    <!-- ============================================== -->
    <section class="bg-misana-paper text-misana-ink">
      <div class="max-w-[1600px] mx-auto px-6 sm:px-12 py-16 sm:py-20">
        <div class="max-w-2xl mx-auto text-center mb-10 sm:mb-14">
          <p class="text-[11px] uppercase tracking-[0.25em] text-misana-muted mb-5">(MS · 01) · {{ t('chauffeur.transfersKicker') }}</p>
          <h2 class="font-display text-4xl sm:text-5xl lg:text-6xl leading-[1.05] mb-6">{{ t('chauffeur.transfersTitle') }}</h2>
          <p class="text-misana-muted text-base sm:text-lg leading-relaxed">{{ t('chauffeur.transfersLead') }}</p>
        </div>

        <div class="ch-table">
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

        <!-- Strip horizontal sous la table -->
        <div class="brands-row mt-10 sm:mt-14" @mouseleave="activeRoute = 0">
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
      </div>
    </section>

    <!-- ============================================== -->
    <!-- 3. NOTRE FLOTTE (VEHICLES reels)                 -->
    <!-- ============================================== -->
    <section class="bg-misana-paper">
      <div class="max-w-[1600px] mx-auto px-6 sm:px-12 py-16 sm:py-20">
        <div class="text-center mb-10 sm:mb-14">
          <p class="text-[11px] uppercase tracking-[0.25em] text-misana-muted mb-5">(MS · 02) · {{ t('chauffeur.fleetKicker') }}</p>
          <h2 class="font-display text-4xl sm:text-5xl lg:text-6xl leading-[1.05]">{{ t('chauffeur.fleetTitle') }}</h2>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-7">
          <NuxtLink
            v-for="v in VEHICLES"
            :key="v.id"
            :to="localePath({ path: '/request', query: { service: 'chauffeur', vehicle: v.id } })"
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

        <!-- Bouton bas centre -->
        <div class="text-center mt-10 sm:mt-12">
          <NuxtLink
            :to="localePath({ path: '/request', query: { service: 'chauffeur' } })"
            class="inline-flex items-center gap-3 group bg-misana-ink text-misana-paper px-8 py-3.5 text-sm tracking-[0.16em] uppercase rounded-full transition hover:opacity-90"
          >
            <span>{{ t('chauffeur.fleetCta') }}</span>
            <span class="inline-flex items-center justify-center w-[1.1em] h-[1.1em] transition-transform duration-700 group-hover:translate-x-1">
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
    <!-- 4. COMMENT CA FONCTIONNE (timeline 3 etapes)     -->
    <!-- ============================================== -->
    <section class="bg-misana-paper">
      <div class="max-w-[1600px] mx-auto px-6 sm:px-12 py-16 sm:py-20">
        <div class="text-center mb-12 sm:mb-16">
          <p class="text-[11px] uppercase tracking-[0.25em] text-misana-muted mb-5">(MS · 03) · {{ t('chauffeur.stepsKicker') }}</p>
          <h2 class="font-display text-4xl sm:text-5xl lg:text-6xl leading-[1.05]">{{ t('chauffeur.stepsTitle') }}</h2>
        </div>

        <div class="ch-timeline">
          <div class="ch-timeline-line" aria-hidden="true"></div>
          <ol class="ch-timeline-list">
            <li v-for="i in 3" :key="i" class="ch-step">
              <span class="ch-step-dot" aria-hidden="true"></span>
              <span class="ch-step-num">{{ String(i).padStart(2, '0') }}</span>
              <h3 class="ch-step-title">{{ t(`chauffeur.step${i}Title`) }}</h3>
              <p class="ch-step-body">{{ t(`chauffeur.step${i}Body`) }}</p>
            </li>
          </ol>
        </div>

      </div>
    </section>

    <!-- ============================================== -->
    <!-- 5. SEO CONTEXT (long-form + maillage interne)    -->
    <!-- ============================================== -->
    <section class="bg-misana-paper">
      <div class="max-w-[1600px] mx-auto px-6 sm:px-12 py-16 sm:py-20">
        <p class="text-[11px] uppercase tracking-[0.25em] text-misana-muted mb-5">(MS · 04) · {{ t('chauffeur.seo.kicker') }}</p>
        <h2 class="font-display text-3xl sm:text-4xl lg:text-5xl leading-[1.1] mb-8 sm:mb-10">{{ t('chauffeur.seo.title') }}</h2>
        <div class="seo-prose">
          <i18n-t keypath="chauffeur.seo.p1" tag="p" scope="global">
            <template #nice><NuxtLink :to="localePath('/destinations/nice')">Nice</NuxtLink></template>
            <template #monaco><NuxtLink :to="localePath('/destinations/monaco')">Monaco</NuxtLink></template>
            <template #saintTropez><NuxtLink :to="localePath('/destinations/saint-tropez')">Saint-Tropez</NuxtLink></template>
          </i18n-t>
          <i18n-t keypath="chauffeur.seo.p2" tag="p" scope="global">
            <template #transfers><NuxtLink :to="localePath('/transfers')">{{ locale === 'fr' ? 'transferts' : 'transfers' }}</NuxtLink></template>
            <template #capFerrat><NuxtLink :to="localePath('/destinations/cap-ferrat')">Cap-Ferrat</NuxtLink></template>
            <template #cannes><NuxtLink :to="localePath('/destinations/cannes')">Cannes</NuxtLink></template>
            <template #access><NuxtLink :to="localePath('/services/access')">Access</NuxtLink></template>
          </i18n-t>
          <i18n-t keypath="chauffeur.seo.p3" tag="p" scope="global">
            <template #festival><NuxtLink :to="localePath('/events/festival-de-cannes')">{{ locale === 'fr' ? 'Festival de Cannes' : 'Cannes Film Festival' }}</NuxtLink></template>
            <template #grandPrix><NuxtLink :to="localePath('/events/grand-prix-monaco')">{{ locale === 'fr' ? 'Grand Prix de Monaco' : 'Monaco Grand Prix' }}</NuxtLink></template>
            <template #events><NuxtLink :to="localePath('/events')">{{ locale === 'fr' ? 'événements' : 'events' }}</NuxtLink></template>
          </i18n-t>
          <i18n-t keypath="chauffeur.seo.p4" tag="p" scope="global">
            <template #cars><NuxtLink :to="localePath('/services/cars')">{{ locale === 'fr' ? 'voiture' : 'car' }}</NuxtLink></template>
            <template #yacht><NuxtLink :to="localePath('/services/yacht')">{{ locale === 'fr' ? 'yacht' : 'yacht' }}</NuxtLink></template>
            <template #helicopter><NuxtLink :to="localePath('/services/helicopter')">{{ locale === 'fr' ? 'hélicoptère' : 'helicopter' }}</NuxtLink></template>
            <template #destinations><NuxtLink :to="localePath('/destinations')">{{ locale === 'fr' ? 'pages destinations' : 'destinations pages' }}</NuxtLink></template>
            <template #request><NuxtLink :to="localePath('/request')">{{ locale === 'fr' ? 'formulaire de demande' : 'request form' }}</NuxtLink></template>
          </i18n-t>
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
  padding: 1.1rem 1.2rem 1.2rem;
}
@media (min-width: 768px) {
  .ch-form { padding: 1.4rem 1.6rem 1.6rem; }
}
.ch-tabs {
  display: flex;
  gap: 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.18);
  margin-bottom: 0.9rem;
}
@media (min-width: 768px) {
  .ch-tabs { margin-bottom: 1.25rem; }
}
.ch-tab {
  position: relative;
  padding: 0.65rem 1rem 0.7rem;
  font-size: 0.72rem;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.55);
  background: none;
  border: 0;
  cursor: pointer;
  transition: color 0.4s ease;
}
@media (min-width: 768px) {
  .ch-tab { padding: 0.75rem 1.25rem 0.85rem; font-size: 0.78rem; }
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

.ch-form-body { display: flex; flex-direction: column; gap: 0.6rem; }
@media (min-width: 768px) {
  .ch-form-body { gap: 0.85rem; }
}

.ch-fields {
  display: grid;
  grid-template-columns: 1fr;
  gap: 0.6rem;
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
  margin-top: 0.35rem;
  padding: 0.85rem 1.5rem;
  background: var(--color-misana-paper);
  color: var(--color-misana-ink);
  font-size: 0.8rem;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  border: 0;
  border-radius: 4px;
  cursor: pointer;
  transition: background 0.3s ease;
  font-family: inherit;
}
@media (min-width: 768px) {
  .ch-submit { padding: 0.95rem 1.5rem; font-size: 0.85rem; margin-top: 0.5rem; }
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
.ch-fields-leave-to { opacity: 0; transform: translateY(8px); }

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

/* === Table de routes complete (sur fond paper) === */
.ch-table { border-top: 1px solid var(--color-misana-line); }
.ch-table ul { list-style: none; margin: 0; padding: 0; }
.ch-row { border-bottom: 1px solid var(--color-misana-line); }
.ch-row-link {
  display: grid;
  grid-template-columns: 1fr auto auto auto;
  align-items: center;
  gap: 1.5rem;
  padding: 1.1rem 0.5rem;
  text-decoration: none;
  color: var(--color-misana-ink);
  transition: padding 0.4s ease, background 0.4s ease;
}
.ch-row-link:hover {
  padding-left: 1.25rem;
  padding-right: 1.25rem;
  background: var(--color-misana-stone);
}
.ch-row-route {
  font-family: var(--font-display, serif);
  font-size: 1.1rem;
  display: inline-flex;
  align-items: center;
  gap: 0.65rem;
  min-width: 0;
}
.ch-row-from, .ch-row-to { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.ch-row-arrow { opacity: 0.4; font-size: 0.95rem; }
.ch-row-duration {
  font-size: 0.78rem;
  letter-spacing: 0.05em;
  color: var(--color-misana-muted);
  white-space: nowrap;
}
.ch-row-price { display: inline-flex; align-items: baseline; gap: 0.5rem; white-space: nowrap; }
.ch-row-price-label {
  font-size: 0.65rem;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--color-misana-muted);
}
.ch-row-price-value {
  font-family: var(--font-display, serif);
  font-size: 1.1rem;
  color: var(--color-misana-ink);
}
.ch-row-cue { color: var(--color-misana-muted); transition: transform 0.5s ease, color 0.3s ease; }
.ch-row-link:hover .ch-row-cue { transform: translateX(4px); color: var(--color-misana-ink); }

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

/* === Fleet card (style ride-luxury : nom + image transparente + stats) === */
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
/* Cover : zoom de base 1.18 pour que le sujet (Sprinter, etc.)
   occupe une surface visuelle equivalente aux PNG transparents */
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

/* === Timeline 3 etapes === */
.ch-timeline {
  position: relative;
  padding: 1rem 0 0;
}
.ch-timeline-line {
  position: absolute;
  top: 14px;
  left: 8%;
  right: 8%;
  height: 1px;
  background: var(--color-misana-line);
}
.ch-timeline-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 2rem;
}
.ch-step {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 0.85rem;
  padding-top: 0;
}
.ch-step-dot {
  width: 9px;
  height: 9px;
  border-radius: 50%;
  background: var(--color-misana-ink);
  margin-top: 9px;
  margin-bottom: 1.5rem;
}
.ch-step-num {
  font-family: var(--font-display, serif);
  font-style: italic;
  font-size: 0.78rem;
  letter-spacing: 0.05em;
  color: var(--color-misana-muted);
}
.ch-step-title {
  font-family: var(--font-display, serif);
  font-size: 1.6rem;
  line-height: 1.1;
  margin: 0;
  color: var(--color-misana-ink);
}
.ch-step-body {
  margin: 0;
  font-size: 0.95rem;
  line-height: 1.6;
  color: var(--color-misana-muted);
  max-width: 32ch;
}

@media (max-width: 767px) {
  .ch-timeline-line { display: none; }
  .ch-timeline-list { grid-template-columns: 1fr; gap: 2.5rem; }
  .ch-step-dot { margin-top: 0; margin-bottom: 0.85rem; }
}

/* === Stats sous timeline === */
.ch-stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.5rem;
  margin-top: 2.5rem;
  padding-top: 2rem;
  border-top: 1px solid var(--color-misana-line);
}
.ch-stat {
  text-align: center;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
.ch-stat-num {
  font-family: var(--font-display, serif);
  font-size: clamp(2rem, 4vw, 3rem);
  line-height: 1;
  margin: 0;
  color: var(--color-misana-ink);
}
.ch-stat-label {
  font-size: 0.7rem;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--color-misana-muted);
  margin: 0;
}
@media (max-width: 639px) {
  .ch-stats { grid-template-columns: 1fr; gap: 2rem; }
}

/* === SEO prose (long-form + liens internes) === */
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
  .reveal, .reveal-block, .ch-hero-bg, .brand-img, .ch-row-link, .ch-row-cue {
    transition: none !important;
    transform: none !important;
    opacity: 1 !important;
  }
}
</style>
