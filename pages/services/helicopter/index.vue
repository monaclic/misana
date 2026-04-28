<script setup lang="ts">
// Hub helicopter uberise. 4 sections, tout pousse vers /request.
// Miroir exact de /services/chauffeur (sans tabs : pas de mise a
// disposition pour heli V1, tout est A -> B).
// 1. Hero panel sombre + glass-card avec mini-form (depart/arrivee/date)
// 2. Liaisons : strip horizontal 6 routes phares + table sobre des 12
//    routes Riviera completes avec prix "A partir de"
// 3. Notre flotte : 6 helicos reels depuis lib/fleet (HELICOPTERS),
//    photos Leader Limousines
// 4. Comment ca fonctionne : timeline horizontale 3 etapes (centree)
import { HELICOPTERS } from '~/lib/fleet';
import { HELI_DEPARTURES, HELI_ROUTES, routeFromPrice } from '~/lib/heliRoutes';

definePageMeta({ layout: 'default' });

const { locale, t } = useI18n();
const localePath = useLocalePath();
const router = useRouter();

useSeoMeta({
  title: () => t('helicopter.hubTitle'),
  description: () => t('helicopter.hubDescription'),
});

useHead({
  script: [{
    type: 'application/ld+json',
    innerHTML: JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'Service',
      name: 'Helicopter transfer French Riviera',
      provider: { '@type': 'Organization', name: 'Misana' },
      areaServed: ['Cannes', 'Monaco', 'Saint-Tropez', 'Nice'],
      serviceType: 'Helicopter transfer',
    }),
  }],
});

// ============================================
// HERO MINI-FORM
// ============================================
const formHeli = reactive({ from: '', to: '', date: '' });

function submitForm() {
  const path = localePath('/request');
  const query: Record<string, string> = { service: 'helicopter' };
  if (formHeli.from) query.from = formHeli.from;
  if (formHeli.to) query.to = formHeli.to;
  if (formHeli.date) query.date = formHeli.date;
  router.push({ path, query });
}

// ============================================
// LIAISONS
// ============================================
const featuredRoutes = computed(() =>
  HELI_ROUTES.map((r) => ({
    ...r,
    fromLabel: HELI_DEPARTURES.find((d) => d.id === r.fromId)?.city || r.fromId,
    fromLabelFr: HELI_DEPARTURES.find((d) => d.id === r.fromId)?.cityFr || r.fromId,
    fromMin: routeFromPrice(r),
  })),
);
// Strip principal : 6 liaisons les plus emblematiques
const stripRoutes = computed(() => [
  featuredRoutes.value.find((r) => r.fromId === 'NCE' && r.toId === 'MCM'),
  featuredRoutes.value.find((r) => r.fromId === 'NCE' && r.toId === 'LTT'),
  featuredRoutes.value.find((r) => r.fromId === 'CEQ' && r.toId === 'MCM'),
  featuredRoutes.value.find((r) => r.fromId === 'NCE' && r.toId === 'CEQ'),
  featuredRoutes.value.find((r) => r.fromId === 'LTT' && r.toId === 'CEQ'),
  featuredRoutes.value.find((r) => r.fromId === 'MCM' && r.toId === 'LTT'),
].filter(Boolean) as typeof featuredRoutes.value);

const activeRoute = ref(0);

const ROUTE_IMAGES: Record<string, string> = {
  'NCE-MCM': 'https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=1600&q=80',
  'NCE-CEQ': 'https://images.unsplash.com/photo-1499678329028-101435549a4e?w=1600&q=80',
  'NCE-LTT': 'https://images.unsplash.com/photo-1530541930197-ff16ac917b0e?w=1600&q=80',
  'MCM-NCE': 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=1600&q=80',
  'MCM-CEQ': 'https://images.unsplash.com/photo-1605515298946-d062f2e9da53?w=1600&q=80',
  'MCM-LTT': 'https://images.unsplash.com/photo-1567899378494-47b22a2ae96a?w=1600&q=80',
  'CEQ-NCE': 'https://images.unsplash.com/photo-1473093226795-af9932fe5856?w=1600&q=80',
  'CEQ-MCM': 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=1600&q=80',
  'CEQ-LTT': 'https://images.unsplash.com/photo-1530541930197-ff16ac917b0e?w=1600&q=80',
  'LTT-NCE': 'https://images.unsplash.com/photo-1473093226795-af9932fe5856?w=1600&q=80',
  'LTT-CEQ': 'https://images.unsplash.com/photo-1499678329028-101435549a4e?w=1600&q=80',
  'LTT-MCM': 'https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=1600&q=80',
};
const routeImage = (fromId: string, toId: string) =>
  ROUTE_IMAGES[`${fromId}-${toId}`] || 'https://images.unsplash.com/photo-1567899378494-47b22a2ae96a?w=1600&q=80';

// ============================================
// HEADER TRANSPARENCY + REVEAL
// ============================================
const heroImage = 'https://www.leaderlimousines.com/cdn/shop/files/Helicopter_H125_flying_over_the_sea.jpg?v=1773610994&width=1500';

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

const departureOptions = computed(() =>
  HELI_DEPARTURES.map((d) => ({ id: d.id, label: locale.value === 'fr' ? d.cityFr : d.city })),
);
</script>

<template>
  <main>
    <!-- ============================================== -->
    <!-- 1. HERO + MINI-FORM                              -->
    <!-- ============================================== -->
    <section
      ref="heroRef"
      class="he-hero relative h-screen overflow-hidden -mt-16 bg-misana-ink text-misana-paper"
      data-revealed="false"
    >
      <img :src="heroImage" alt="" class="he-hero-bg absolute inset-0 w-full h-full object-cover" />
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
              {{ t('helicopter.hubTitle') }}
            </h1>
          </div>
        </div>

        <div class="reveal-block w-full max-w-3xl" data-delay="3">
          <div class="he-form">
            <form @submit.prevent="submitForm" class="he-form-body">
              <div class="he-fields">
                <label class="he-field">
                  <span class="he-field-label">{{ t('helicopter.form.from') }}</span>
                  <select v-model="formHeli.from" class="he-field-input">
                    <option value="">{{ t('helicopter.form.choose') }}</option>
                    <option v-for="d in departureOptions" :key="d.id" :value="d.id">{{ d.label }}</option>
                  </select>
                </label>
                <label class="he-field">
                  <span class="he-field-label">{{ t('helicopter.form.to') }}</span>
                  <select v-model="formHeli.to" class="he-field-input">
                    <option value="">{{ t('helicopter.form.choose') }}</option>
                    <option v-for="d in departureOptions" :key="d.id" :value="d.id" :disabled="d.id === formHeli.from">{{ d.label }}</option>
                  </select>
                </label>
                <label class="he-field">
                  <span class="he-field-label">{{ t('helicopter.form.date') }}</span>
                  <input v-model="formHeli.date" type="datetime-local" class="he-field-input" />
                </label>
              </div>

              <button type="submit" class="he-submit">
                <span>{{ t('helicopter.form.submit') }}</span>
                <span class="inline-flex items-center justify-center w-[1.1em] h-[1.1em] translate-y-[0.22em]">
                  <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" class="block w-full h-full">
                    <path d="M7 12H17" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
                    <path d="M13.5 8.5L17 12L13.5 15.5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" />
                  </svg>
                </span>
              </button>

              <p class="he-footnote">{{ t('helicopter.form.footnote') }}</p>
            </form>
          </div>
        </div>
      </div>
    </section>

    <!-- ============================================== -->
    <!-- 2. LIAISONS                                      -->
    <!-- ============================================== -->
    <section class="bg-misana-paper text-misana-ink">
      <div class="max-w-[1600px] mx-auto px-6 sm:px-12 py-24 sm:py-32">
        <div class="max-w-2xl mx-auto text-center mb-14 sm:mb-20">
          <p class="text-[11px] uppercase tracking-[0.25em] text-misana-muted mb-5">(MS · 01) · {{ t('helicopter.liaisonsKicker') }}</p>
          <h2 class="font-display text-4xl sm:text-5xl lg:text-6xl leading-[1.05] mb-6">{{ t('helicopter.liaisonsTitle') }}</h2>
          <p class="text-misana-muted text-base sm:text-lg leading-relaxed">{{ t('helicopter.liaisonsLead') }}</p>
        </div>

        <div class="brands-row" @mouseleave="activeRoute = 0">
          <NuxtLink
            v-for="(r, i) in stripRoutes"
            :key="`${r.fromId}-${r.toId}`"
            :to="localePath({ path: '/request', query: { service: 'helicopter', from: r.fromId, to: r.toId } })"
            class="brand-panel"
            :class="{ 'brand-panel-active': activeRoute === i }"
            @mouseenter="activeRoute = i"
            @focus="activeRoute = i"
          >
            <img :src="routeImage(r.fromId, r.toId)" :alt="`${r.fromLabel} → ${r.toLabel}`" loading="lazy" draggable="false" class="brand-img" />
            <div class="brand-overlay"></div>
            <div class="brand-content">
              <p class="brand-name">{{ locale === 'fr' ? r.fromLabelFr : r.fromLabel }} → {{ locale === 'fr' ? r.toLabelFr : r.toLabel }}</p>
              <p class="brand-tag">{{ r.duration }} <span class="opacity-50 mx-2">·</span> {{ t('helicopter.liaisonsUnit') }} {{ r.fromMin ? fmtEur(r.fromMin) : '—' }}</p>
            </div>
          </NuxtLink>
        </div>

        <div class="he-table mt-14 sm:mt-20">
          <ul>
            <li v-for="r in featuredRoutes" :key="`${r.fromId}-${r.toId}`" class="he-row">
              <NuxtLink
                :to="localePath({ path: '/request', query: { service: 'helicopter', from: r.fromId, to: r.toId } })"
                class="he-row-link group"
              >
                <span class="he-row-route">
                  <span class="he-row-from">{{ locale === 'fr' ? r.fromLabelFr : r.fromLabel }}</span>
                  <span class="he-row-arrow" aria-hidden="true">→</span>
                  <span class="he-row-to">{{ locale === 'fr' ? r.toLabelFr : r.toLabel }}</span>
                </span>
                <span class="he-row-duration">{{ r.duration }}</span>
                <span class="he-row-price">
                  <span class="he-row-price-label">{{ t('helicopter.liaisonsUnit') }}</span>
                  <span class="he-row-price-value">{{ r.fromMin ? fmtEur(r.fromMin) : '—' }}</span>
                </span>
                <span class="he-row-cue">
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
    <!-- 3. NOTRE FLOTTE (HELICOPTERS reels)              -->
    <!-- ============================================== -->
    <section class="bg-misana-paper">
      <div class="max-w-[1600px] mx-auto px-6 sm:px-12 py-24 sm:py-32">
        <div class="text-center mb-14 sm:mb-20">
          <p class="text-[11px] uppercase tracking-[0.25em] text-misana-muted mb-5">(MS · 02) · {{ t('helicopter.fleetKicker') }}</p>
          <h2 class="font-display text-4xl sm:text-5xl lg:text-6xl leading-[1.05]">{{ t('helicopter.fleetTitle') }}</h2>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          <NuxtLink
            v-for="h in HELICOPTERS"
            :key="h.id"
            :to="localePath({ path: '/request', query: { service: 'helicopter', helicopter: h.id } })"
            class="vehicle-card group block bg-misana-paper border border-misana-line rounded-xl overflow-hidden transition hover:border-misana-ink"
          >
            <div class="aspect-[16/11] relative overflow-hidden bg-misana-stone">
              <img
                :src="h.image"
                :alt="h.name"
                loading="lazy"
                draggable="false"
                class="absolute inset-0 w-full h-full object-cover transition duration-700 group-hover:scale-[1.03]"
              />
              <span v-if="h.badge" class="vehicle-badge">★</span>
            </div>
            <div class="p-5 sm:p-6">
              <div class="flex items-start gap-4 mb-5">
                <div class="shrink-0 w-10 h-10 rounded-full border border-misana-line flex items-center justify-center font-display text-sm">
                  {{ h.name.split(' ')[0].charAt(0) }}
                </div>
                <div class="min-w-0 flex-1">
                  <h3 class="font-display text-lg leading-tight truncate">{{ h.name }}</h3>
                  <p class="text-xs text-misana-muted mt-1 flex items-center gap-2">
                    <span>{{ locale === 'fr' ? h.engineFr : h.engine }}</span>
                    <span class="inline-block w-1 h-1 rounded-full bg-misana-muted"></span>
                    <span>{{ h.pax }} {{ t('helicopter.fleetPax') }}</span>
                  </p>
                </div>
              </div>
              <div class="flex items-center justify-between">
                <span class="inline-flex items-center gap-2 text-xs text-misana-muted">
                  <span class="px-2 py-0.5 rounded-full bg-misana-stone">{{ h.speedKmh }} km/h</span>
                  <span class="px-2 py-0.5 rounded-full bg-misana-stone">{{ h.luggage }}</span>
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
    <!-- 4. COMMENT CA FONCTIONNE (timeline)              -->
    <!-- ============================================== -->
    <section class="bg-misana-paper">
      <div class="max-w-[1600px] mx-auto px-6 sm:px-12 py-24 sm:py-32">
        <div class="text-center mb-16 sm:mb-24">
          <p class="text-[11px] uppercase tracking-[0.25em] text-misana-muted mb-5">(MS · 03) · {{ t('helicopter.stepsKicker') }}</p>
          <h2 class="font-display text-4xl sm:text-5xl lg:text-6xl leading-[1.05]">{{ t('helicopter.stepsTitle') }}</h2>
        </div>

        <div class="he-timeline">
          <div class="he-timeline-line" aria-hidden="true"></div>
          <ol class="he-timeline-list">
            <li v-for="i in 3" :key="i" class="he-step">
              <span class="he-step-dot" aria-hidden="true"></span>
              <span class="he-step-num">{{ String(i).padStart(2, '0') }}</span>
              <h3 class="he-step-title">{{ t(`helicopter.step${i}Title`) }}</h3>
              <p class="he-step-body">{{ t(`helicopter.step${i}Body`) }}</p>
            </li>
          </ol>
        </div>

        <div class="he-stats">
          <div class="he-stat">
            <p class="he-stat-num">7 min</p>
            <p class="he-stat-label">{{ t('helicopter.stat1Label') }}</p>
          </div>
          <div class="he-stat">
            <p class="he-stat-num">30 min</p>
            <p class="he-stat-label">{{ t('helicopter.stat2Label') }}</p>
          </div>
          <div class="he-stat">
            <p class="he-stat-num">1</p>
            <p class="he-stat-label">{{ t('helicopter.stat3Label') }}</p>
          </div>
        </div>

        <div class="text-center mt-16 sm:mt-20">
          <NuxtLink
            :to="localePath({ path: '/request', query: { service: 'helicopter' } })"
            class="inline-flex items-center gap-3 group text-misana-ink text-base"
          >
            <span class="border-b border-misana-ink pb-0.5">{{ t('helicopter.form.submit') }}</span>
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
.he-hero-bg {
  transform: scale(1.06);
  transition: transform 8s ease-out;
}
[data-revealed="true"] .he-hero-bg { transform: scale(1); }

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
.he-form {
  background: rgba(255, 255, 255, 0.07);
  border: 1px solid rgba(255, 255, 255, 0.18);
  border-radius: 6px;
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  padding: 1.4rem 1.6rem 1.6rem;
}
.he-form-body { display: flex; flex-direction: column; gap: 0.85rem; }
.he-fields {
  display: grid;
  grid-template-columns: 1fr;
  gap: 0.85rem;
}
@media (min-width: 768px) {
  .he-fields { grid-template-columns: 1fr 1fr 1fr; gap: 1rem; }
}

.he-field { display: flex; flex-direction: column; gap: 0.35rem; min-width: 0; }
.he-field-label {
  font-size: 0.65rem;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.65);
}
.he-field-input {
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
.he-field-input::placeholder { color: rgba(255, 255, 255, 0.4); }
.he-field-input:focus { border-bottom-color: var(--color-misana-paper); }
.he-field-input::-webkit-calendar-picker-indicator { filter: invert(1) opacity(0.6); }
.he-field-input option { color: var(--color-misana-ink); background: var(--color-misana-paper); }

.he-submit {
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
  transition: background 0.3s ease;
  font-family: inherit;
}
.he-submit:hover { background: rgba(255, 255, 255, 0.88); }

.he-footnote {
  font-size: 0.72rem;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.6);
  text-align: center;
  margin: 0.25rem 0 0;
}

/* === Brands strip (liaisons) === */
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

/* === Table de liaisons (sur fond paper) === */
.he-table { border-top: 1px solid var(--color-misana-line); }
.he-table ul { list-style: none; margin: 0; padding: 0; }
.he-row { border-bottom: 1px solid var(--color-misana-line); }
.he-row-link {
  display: grid;
  grid-template-columns: 1fr auto auto auto;
  align-items: center;
  gap: 1.5rem;
  padding: 1.1rem 0.5rem;
  text-decoration: none;
  color: var(--color-misana-ink);
  transition: padding 0.4s ease, background 0.4s ease;
}
.he-row-link:hover {
  padding-left: 1.25rem;
  padding-right: 1.25rem;
  background: var(--color-misana-stone);
}
.he-row-route {
  font-family: var(--font-display, serif);
  font-size: 1.1rem;
  display: inline-flex;
  align-items: center;
  gap: 0.65rem;
  min-width: 0;
}
.he-row-from, .he-row-to { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.he-row-arrow { opacity: 0.4; font-size: 0.95rem; }
.he-row-duration {
  font-size: 0.78rem;
  letter-spacing: 0.05em;
  color: var(--color-misana-muted);
  white-space: nowrap;
}
.he-row-price { display: inline-flex; align-items: baseline; gap: 0.5rem; white-space: nowrap; }
.he-row-price-label {
  font-size: 0.65rem;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--color-misana-muted);
}
.he-row-price-value {
  font-family: var(--font-display, serif);
  font-size: 1.1rem;
  color: var(--color-misana-ink);
}
.he-row-cue { color: var(--color-misana-muted); transition: transform 0.5s ease, color 0.3s ease; }
.he-row-link:hover .he-row-cue { transform: translateX(4px); color: var(--color-misana-ink); }

@media (max-width: 767px) {
  .he-row-link {
    grid-template-columns: 1fr auto;
    grid-template-rows: auto auto;
    gap: 0.35rem 1rem;
    padding: 1rem 0.5rem;
  }
  .he-row-route { grid-column: 1 / -1; font-size: 1rem; }
  .he-row-duration { grid-row: 2; grid-column: 1; }
  .he-row-price { grid-row: 2; grid-column: 2; }
  .he-row-cue { display: none; }
}

/* === Vehicle card (helicopter) === */
.vehicle-card { transition: border-color 0.4s ease; }
.vehicle-badge {
  position: absolute;
  top: 1rem;
  left: 1rem;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: var(--color-misana-ink);
  color: var(--color-misana-paper);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 0.7rem;
  z-index: 2;
}

/* === Timeline 3 etapes (centree) === */
.he-timeline { position: relative; padding: 1rem 0 0; }
.he-timeline-line {
  position: absolute;
  top: 14px;
  left: 8%;
  right: 8%;
  height: 1px;
  background: var(--color-misana-line);
}
.he-timeline-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 2rem;
}
.he-step {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 0.85rem;
  padding-top: 0;
}
.he-step-dot {
  width: 9px;
  height: 9px;
  border-radius: 50%;
  background: var(--color-misana-ink);
  margin-top: 9px;
  margin-bottom: 1.5rem;
}
.he-step-num {
  font-family: var(--font-display, serif);
  font-style: italic;
  font-size: 0.78rem;
  letter-spacing: 0.05em;
  color: var(--color-misana-muted);
}
.he-step-title {
  font-family: var(--font-display, serif);
  font-size: 1.6rem;
  line-height: 1.1;
  margin: 0;
  color: var(--color-misana-ink);
}
.he-step-body {
  margin: 0;
  font-size: 0.95rem;
  line-height: 1.6;
  color: var(--color-misana-muted);
  max-width: 32ch;
}

@media (max-width: 767px) {
  .he-timeline-line { display: none; }
  .he-timeline-list { grid-template-columns: 1fr; gap: 2.5rem; }
  .he-step-dot { margin-top: 0; margin-bottom: 0.85rem; }
}

/* === Stats sous timeline === */
.he-stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.5rem;
  margin-top: 4rem;
  padding-top: 3rem;
  border-top: 1px solid var(--color-misana-line);
}
.he-stat {
  text-align: center;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
.he-stat-num {
  font-family: var(--font-display, serif);
  font-size: clamp(2rem, 4vw, 3rem);
  line-height: 1;
  margin: 0;
  color: var(--color-misana-ink);
}
.he-stat-label {
  font-size: 0.7rem;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--color-misana-muted);
  margin: 0;
}
@media (max-width: 639px) {
  .he-stats { grid-template-columns: 1fr; gap: 2rem; }
}

@media (prefers-reduced-motion: reduce) {
  .reveal, .reveal-block, .he-hero-bg, .brand-img, .he-row-link, .he-row-cue {
    transition: none !important;
    transform: none !important;
    opacity: 1 !important;
  }
}
</style>
