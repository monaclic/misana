<script setup lang="ts">
// Hub editorial yacht :
// 1. Hero home-style
// 2. Categories par taille (replace fleet grid)
// 3. Sejours preparees (replace builders strip)
// Pas de prix en editorial (V1 consultatif).
import { YACHTS } from '~/lib/yachts';
import { YACHT_SIZES, type YachtSize } from '~/types/request';

definePageMeta({ layout: 'default' });

const { t } = useI18n();
const localePath = useLocalePath();

useSeoMeta({
  title: () => t('yacht.hubTitle'),
  description: () => t('yacht.hubDescription'),
});

useHead({
  script: [{
    type: 'application/ld+json',
    innerHTML: JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'Service',
      name: 'Yacht charter on the French Riviera',
      provider: { '@type': 'Organization', name: 'Misana' },
      areaServed: ['Cannes', 'Monaco', 'Saint-Tropez', 'Nice', 'Antibes'],
      serviceType: 'Yacht charter',
    }),
  }],
});

// Hero image : M/Y SAVANNAH (Feadship 83.5m), choix specifique demande.
const heroImage = computed(() => {
  const savannah = YACHTS.find((y) => y.id === 'savannah-feadship-custom');
  return savannah?.hero || YACHTS[0]?.hero || '';
});

// Categories par taille : 4 buckets + carte "Tous les yachts" en tete.
// Slug du size correspond au query param attendu par /services/yacht/all.
const SIZE_KEY: Record<YachtSize, string> = {
  '15-20m': '15-20',
  '20-30m': '20-30',
  '30-50m': '30-50',
  '50m+': '50plus',
};
const showcaseSizes = computed(() => {
  const items = [
    { id: 'all' as const, key: 'all' as const, image: YACHTS[0]?.hero || '', count: YACHTS.length, slug: '' },
    ...YACHT_SIZES.map((s) => {
      const yachts = YACHTS.filter((y) => y.size === s);
      return {
        id: s,
        key: SIZE_KEY[s],
        image: yachts[0]?.hero || '',
        count: yachts.length,
        slug: s,
      };
    }),
  ];
  return items.filter((c) => c.image);
});

// Sejours preparees : tours editoriaux avec duree, titre, body, image.
const CURATED_JOURNEYS = [
  {
    id: 'riviera-weekend',
    image: 'https://images.unsplash.com/photo-1566024287286-457247b70310?w=1600&q=80',
  },
  {
    id: 'pampelonne-family',
    image: 'https://images.unsplash.com/photo-1473093226795-af9932fe5856?w=1600&q=80',
  },
  {
    id: 'sardaigne-week',
    image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=1600&q=80',
  },
  {
    id: 'festival-cannes',
    image: 'https://images.unsplash.com/photo-1520637836862-4d197d17c25a?w=1600&q=80',
  },
] as const;

// Header transparency + reveal observer (pattern home / about / cars)
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
      class="yacht-hero relative h-screen overflow-hidden -mt-16 bg-misana-ink text-misana-paper"
      data-revealed="false"
    >
      <img :src="heroImage" alt="" class="yacht-hero-bg absolute inset-0 w-full h-full object-cover" />
      <div class="absolute inset-0 bg-misana-ink/55"></div>

      <div class="relative h-full flex flex-col items-center justify-center text-center px-6">
        <div class="overflow-hidden">
          <p class="reveal" data-delay="1">
            <span class="font-display italic text-xl sm:text-2xl opacity-90">the</span>
          </p>
        </div>
        <div class="overflow-hidden mt-1">
          <h1 class="reveal font-display text-6xl sm:text-8xl leading-[0.95]" data-delay="2">
            {{ t('yacht.hubTitle') }}
          </h1>
        </div>
        <div class="reveal-line w-px h-16 sm:h-20 bg-misana-paper/70 my-8 sm:my-9"></div>
        <div class="overflow-hidden max-w-md">
          <p class="reveal text-base sm:text-lg leading-relaxed opacity-90" data-delay="4">
            {{ t('yacht.hubLead') }}
          </p>
        </div>
        <div class="overflow-hidden mt-10">
          <NuxtLink
            :to="localePath({ path: '/request', query: { service: 'yacht' } })"
            class="reveal group inline-flex items-center gap-8 pb-2 border-b-[1.5px] border-misana-paper text-base sm:text-lg tracking-wide"
            data-delay="5"
          >
            <span>{{ t('yacht.heroCta') }}</span>
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
    <!-- 2. SIZES (categories par taille)                -->
    <!-- ============================================== -->
    <section class="categories-section bg-misana-paper">
      <div class="max-w-[1600px] mx-auto px-6 sm:px-12 py-24 sm:py-32">
        <!-- Header : kicker + h2 + CTA -->
        <div class="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6 mb-12 sm:mb-16">
          <div>
            <span class="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.25em] text-misana-muted mb-4">
              <span class="inline-block w-1.5 h-1.5 rounded-full bg-misana-muted"></span>
              {{ t('yacht.sizesKicker') }}
            </span>
            <h2 class="font-display text-4xl sm:text-5xl lg:text-6xl leading-[1.05] m-0">{{ t('yacht.sizesTitle') }}</h2>
          </div>
          <NuxtLink
            :to="localePath('/services/yacht/all')"
            class="hidden sm:inline-flex items-center gap-3 group text-misana-ink text-base self-end"
          >
            <span class="border-b border-misana-ink pb-0.5">{{ t('yacht.sizesCta') }}</span>
            <span class="inline-flex items-center justify-center w-[1.1em] h-[1.1em] translate-y-[0.22em] transition-transform duration-700 group-hover:translate-x-2">
              <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" class="block w-full h-full">
                <path d="M7 12H17" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" />
                <path d="M13.5 8.5L17 12L13.5 15.5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
            </span>
          </NuxtLink>
        </div>

        <!-- Scroll horizontal snap : 3 visibles desktop, 2 tablet, 1 mobile -->
        <div class="categories-track">
          <NuxtLink
            v-for="s in showcaseSizes"
            :key="s.key"
            :to="s.key === 'all'
              ? localePath('/services/yacht/all')
              : localePath({ path: '/services/yacht/all', query: { size: s.slug } })"
            class="category-card group"
          >
            <img :src="s.image" :alt="t(`yacht.size.${s.key}`)" loading="lazy" class="category-img" />
            <div class="category-gradient"></div>
            <div class="category-content">
              <p class="text-[11px] uppercase tracking-[0.25em] opacity-80 mb-2">{{ s.count }} {{ t('yacht.sizesUnit') }}</p>
              <h3 class="font-display text-2xl sm:text-3xl lg:text-4xl leading-tight m-0">{{ t(`yacht.size.${s.key}`) }}</h3>
            </div>
          </NuxtLink>
        </div>

        <div class="sm:hidden mt-10 text-center">
          <NuxtLink
            :to="localePath('/services/yacht/all')"
            class="inline-flex items-center gap-3 text-misana-ink text-base"
          >
            <span class="border-b border-misana-ink pb-0.5">{{ t('yacht.sizesCta') }}</span>
          </NuxtLink>
        </div>
      </div>
    </section>

    <!-- ============================================== -->
    <!-- 3. CURATED JOURNEYS (sejours preparees)         -->
    <!-- ============================================== -->
    <section class="journeys-section bg-misana-ink text-misana-paper">
      <div class="max-w-[1600px] mx-auto px-6 sm:px-12 py-24 sm:py-32">
        <!-- Header -->
        <div class="max-w-2xl mx-auto text-center mb-14 sm:mb-20">
          <p class="font-display italic text-misana-paper/60 text-base sm:text-lg mb-5">{{ t('yacht.journeysKicker') }}</p>
          <h2 class="font-display text-4xl sm:text-5xl lg:text-6xl leading-[1.05] mb-6">{{ t('yacht.journeysTitle') }}</h2>
          <p class="text-misana-paper/70 text-base sm:text-lg leading-relaxed">{{ t('yacht.journeysLead') }}</p>
        </div>

        <!-- Grid 2 cols -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
          <NuxtLink
            v-for="j in CURATED_JOURNEYS"
            :key="j.id"
            :to="localePath({ path: '/request', query: { service: 'yacht', journey: j.id } })"
            class="journey-card group relative block overflow-hidden rounded-xl"
          >
            <div class="aspect-[4/5] sm:aspect-[5/4] relative overflow-hidden bg-misana-stone">
              <img
                :src="j.image"
                :alt="t(`yacht.journey.${j.id}.title`)"
                loading="lazy"
                class="absolute inset-0 w-full h-full object-cover transition duration-1000 group-hover:scale-[1.04]"
              />
              <div class="journey-gradient"></div>
            </div>
            <div class="journey-content">
              <span class="journey-duration">{{ t(`yacht.journey.${j.id}.duration`) }}</span>
              <h3 class="font-display text-2xl sm:text-3xl lg:text-4xl leading-tight m-0 mt-3">{{ t(`yacht.journey.${j.id}.title`) }}</h3>
              <p class="text-misana-paper/80 text-sm sm:text-base leading-relaxed mt-3 max-w-md">{{ t(`yacht.journey.${j.id}.body`) }}</p>
            </div>
          </NuxtLink>
        </div>

        <!-- CTA bas de section -->
        <div class="text-center mt-14 sm:mt-16">
          <NuxtLink
            :to="localePath({ path: '/request', query: { service: 'yacht' } })"
            class="inline-flex items-center gap-3 group text-misana-paper text-base"
          >
            <span class="border-b border-misana-paper pb-0.5">{{ t('yacht.journeysCta') }}</span>
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
.yacht-hero-bg {
  transform: scale(1.06);
  transition: transform 8s ease-out;
}
[data-revealed="true"] .yacht-hero-bg { transform: scale(1); }

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

/* === Categories (sizes) ===
   Scroll horizontal snap : 3 cards visibles desktop, 2 tablet, 1 mobile. */
.categories-track {
  display: flex;
  gap: 20px;
  overflow-x: auto;
  scroll-snap-type: x mandatory;
  scroll-padding: 0 1rem;
  padding-bottom: 8px;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
}
.categories-track::-webkit-scrollbar { display: none; }

.category-card {
  position: relative;
  flex: 0 0 calc((100% - 40px) / 3);
  aspect-ratio: 1 / 1;
  border-radius: 12px;
  overflow: hidden;
  scroll-snap-align: start;
  background: var(--color-misana-stone);
  display: block;
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

/* === Curated journeys ===
   Grille 2 cols, image plein cadre + gradient + texte par-dessus en bas. */
.journey-card { transition: transform 0.4s ease; }

.journey-gradient {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    to top,
    rgba(0, 0, 0, 0.85) 0%,
    rgba(0, 0, 0, 0.45) 35%,
    rgba(0, 0, 0, 0.15) 65%,
    rgba(0, 0, 0, 0) 100%
  );
  pointer-events: none;
}

.journey-content {
  position: absolute;
  inset: auto 0 0 0;
  padding: 2rem 2rem 2.25rem;
  color: var(--color-misana-paper);
}
.journey-duration {
  display: inline-flex;
  align-items: center;
  padding: 0.35rem 0.85rem;
  border: 1px solid rgba(255, 255, 255, 0.4);
  border-radius: 9999px;
  font-size: 0.7rem;
  letter-spacing: 0.18em;
  text-transform: uppercase;
}

@media (max-width: 639px) {
  .journey-content { padding: 1.5rem 1.5rem 1.75rem; }
}

@media (prefers-reduced-motion: reduce) {
  .reveal, .reveal-line, .yacht-hero-bg, .category-img {
    transition: none !important;
    transform: none !important;
    opacity: 1 !important;
  }
}
</style>
