<script setup lang="ts">
// Hub editorial yacht : meme structure que /services/cars (hero home-style
// + fleet grid + brands strip + categories scroll horizontal).
// Pas de prix en editorial (V1 consultatif), tag "Sur demande" a la place.
import { YACHTS, YACHT_TYPE_LABELS } from '~/lib/yachts';
import type { YachtType } from '~/lib/yachts';

definePageMeta({ layout: 'default' });

const { locale, t } = useI18n();
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

// 6 yachts mis en avant : flagship d'abord, puis popular, puis le reste.
const featured = computed(() => {
  const flag = YACHTS.filter((y) => y.badge === 'flagship');
  const pop = YACHTS.filter((y) => y.badge === 'popular');
  const rest = YACHTS.filter((y) => !y.badge);
  return [...flag, ...pop, ...rest].slice(0, 6);
});

const heroImage = computed(() => featured.value[0]?.hero || '');
const builderInitial = (b: string) => b.charAt(0).toUpperCase();

// Brands strip : 6 chantiers tenus, panel actif s'elargit au hover.
const SHOWCASE_BUILDERS = ['Sunseeker', 'Mangusta', 'Azimut', 'Ferretti', 'Benetti', 'Sanlorenzo'] as const;
const builderSlug = (b: string) => b.toLowerCase().replace(/\s+/g, '-');
const showcaseBuilders = computed(() =>
  SHOWCASE_BUILDERS.map((name) => {
    const yachts = YACHTS.filter((y) => y.builder === name);
    return {
      name,
      slug: builderSlug(name),
      image: yachts[0]?.hero || '',
      count: yachts.length,
    };
  }).filter((b) => b.image),
);
const activeBuilder = ref(0);

// Categories : "all" + 3 types (motor, sail, catamaran).
const showcaseCategories = computed(() => {
  const types: YachtType[] = ['motor', 'sail', 'catamaran'];
  const items = [
    { id: 'all' as const, label: 'all' as const, image: YACHTS[0]?.hero || '', count: YACHTS.length, slug: '' },
    ...types.map((t) => {
      const yachts = YACHTS.filter((y) => y.type === t);
      return {
        id: t,
        label: t as YachtType,
        image: yachts[0]?.hero || '',
        count: yachts.length,
        slug: t,
      };
    }),
  ];
  return items.filter((c) => c.image);
});

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
    <!-- 2. FLEET GRID                                   -->
    <!-- ============================================== -->
    <section class="bg-misana-paper">
      <div class="max-w-[1600px] mx-auto px-6 sm:px-12 py-24 sm:py-32">
        <div class="text-center mb-14 sm:mb-20">
          <p class="font-display italic text-misana-muted text-base sm:text-lg mb-5">{{ t('yacht.fleetKicker') }}</p>
          <h2 class="font-display text-4xl sm:text-5xl lg:text-6xl leading-[1.05] mb-10">{{ t('yacht.fleetTitle') }}</h2>
          <NuxtLink
            :to="localePath('/services/yacht/all')"
            class="inline-flex items-center gap-3 bg-misana-ink text-misana-paper px-7 py-3 text-sm tracking-wide rounded-full transition hover:opacity-90"
          >
            <span>{{ t('yacht.fleetCta') }}</span>
          </NuxtLink>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          <NuxtLink
            v-for="y in featured"
            :key="y.id"
            :to="localePath(`/services/yacht/${y.id}`)"
            class="yacht-card group block bg-misana-paper border border-misana-line rounded-xl overflow-hidden transition hover:border-misana-ink"
          >
            <div class="aspect-[16/11] relative overflow-hidden bg-misana-stone">
              <img
                :src="y.hero"
                :alt="y.fullName"
                loading="lazy"
                class="absolute inset-0 w-full h-full object-cover transition duration-700 group-hover:scale-[1.03]"
              />
            </div>

            <div class="p-5 sm:p-6">
              <div class="flex items-start gap-4 mb-5">
                <div class="shrink-0 w-10 h-10 rounded-full border border-misana-line flex items-center justify-center font-display text-sm">
                  {{ builderInitial(y.builder) }}
                </div>
                <div class="min-w-0 flex-1">
                  <h3 class="font-display text-lg leading-tight truncate">{{ y.fullName }}</h3>
                  <p class="text-xs text-misana-muted mt-1 flex items-center gap-2">
                    <span>{{ locale === 'fr' ? YACHT_TYPE_LABELS[y.type].fr : YACHT_TYPE_LABELS[y.type].en }}</span>
                    <span class="inline-block w-1 h-1 rounded-full bg-misana-muted"></span>
                    <span>{{ y.lengthM.toFixed(0) }} m</span>
                  </p>
                </div>
              </div>

              <div class="flex items-center justify-between">
                <span class="inline-flex items-center px-3 py-1 rounded-full bg-misana-stone text-xs text-misana-muted">
                  {{ y.guests }} {{ t('yacht.guestsShort') }}
                </span>
                <span class="inline-flex items-center gap-2 text-xs text-misana-muted">
                  <span>{{ t('yacht.onRequest') }}</span>
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

        <div class="mt-16 text-center">
          <NuxtLink
            :to="localePath('/services/yacht/all')"
            class="inline-flex items-center gap-3 group text-misana-ink text-base"
          >
            <span class="border-b border-misana-ink pb-0.5">
              {{ t('yacht.fleetCta') }}
              <span class="text-misana-muted ml-2">({{ YACHTS.length }})</span>
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

    <!-- ============================================== -->
    <!-- 3. BUILDERS STRIP                               -->
    <!-- ============================================== -->
    <section class="brands-strip bg-misana-ink text-misana-paper">
      <div class="max-w-[1600px] mx-auto px-6 sm:px-12 py-24 sm:py-32">
        <div class="max-w-2xl mx-auto text-center mb-14 sm:mb-20">
          <p class="font-display italic text-misana-paper/60 text-base sm:text-lg mb-5">{{ t('yacht.brandsKicker') }}</p>
          <h2 class="font-display text-4xl sm:text-5xl lg:text-6xl leading-[1.05] mb-6">{{ t('yacht.brandsTitle') }}</h2>
          <p class="text-misana-paper/70 text-base sm:text-lg leading-relaxed">{{ t('yacht.brandsLead') }}</p>
        </div>

        <div class="brands-row" @mouseleave="activeBuilder = 0">
          <NuxtLink
            v-for="(b, i) in showcaseBuilders"
            :key="b.slug"
            :to="localePath({ path: '/services/yacht/all', query: { builder: b.slug } })"
            class="brand-panel"
            :class="{ 'brand-panel-active': activeBuilder === i }"
            @mouseenter="activeBuilder = i"
            @focus="activeBuilder = i"
          >
            <img :src="b.image" :alt="b.name" loading="lazy" class="brand-img" />
            <div class="brand-overlay"></div>
            <div class="brand-content">
              <p class="brand-name">{{ b.name }}</p>
              <p class="brand-tag">{{ b.count }} {{ t('yacht.brandsYachtsLabel') }}</p>
            </div>
          </NuxtLink>
        </div>

        <div class="text-center mt-14 sm:mt-16">
          <NuxtLink
            :to="localePath({ path: '/request', query: { service: 'yacht' } })"
            class="inline-flex items-center gap-3 group text-misana-paper text-base"
          >
            <span class="border-b border-misana-paper pb-0.5">{{ t('yacht.brandsCta') }}</span>
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
    <!-- 4. CATEGORIES                                   -->
    <!-- ============================================== -->
    <section class="categories-section bg-misana-paper">
      <div class="max-w-[1600px] mx-auto px-6 sm:px-12 py-24 sm:py-32">
        <div class="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6 mb-12 sm:mb-16">
          <div>
            <span class="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.25em] text-misana-muted mb-4">
              <span class="inline-block w-1.5 h-1.5 rounded-full bg-misana-muted"></span>
              {{ t('yacht.categoriesKicker') }}
            </span>
            <h2 class="font-display text-4xl sm:text-5xl lg:text-6xl leading-[1.05] m-0">{{ t('yacht.categoriesTitle') }}</h2>
          </div>
          <NuxtLink
            :to="localePath('/services/yacht/all')"
            class="hidden sm:inline-flex items-center gap-3 group text-misana-ink text-base self-end"
          >
            <span class="border-b border-misana-ink pb-0.5">{{ t('yacht.categoriesCta') }}</span>
            <span class="inline-flex items-center justify-center w-[1.1em] h-[1.1em] translate-y-[0.22em] transition-transform duration-700 group-hover:translate-x-2">
              <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" class="block w-full h-full">
                <path d="M7 12H17" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" />
                <path d="M13.5 8.5L17 12L13.5 15.5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
            </span>
          </NuxtLink>
        </div>

        <div class="categories-track">
          <NuxtLink
            v-for="cat in showcaseCategories"
            :key="cat.label"
            :to="cat.label === 'all'
              ? localePath('/services/yacht/all')
              : localePath({ path: '/services/yacht/all', query: { type: cat.slug } })"
            class="category-card group"
          >
            <img :src="cat.image" :alt="t(`yacht.category.${cat.label}`)" loading="lazy" class="category-img" />
            <div class="category-gradient"></div>
            <div class="category-content">
              <h3 class="font-display text-2xl sm:text-3xl lg:text-4xl leading-tight m-0">{{ t(`yacht.category.${cat.label}`) }}</h3>
            </div>
          </NuxtLink>
        </div>

        <div class="sm:hidden mt-10 text-center">
          <NuxtLink
            :to="localePath('/services/yacht/all')"
            class="inline-flex items-center gap-3 text-misana-ink text-base"
          >
            <span class="border-b border-misana-ink pb-0.5">{{ t('yacht.categoriesCta') }}</span>
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

.yacht-card { transition: border-color 0.4s ease, transform 0.4s ease; }

/* === Builders strip ===
   Flex horizontal, panel actif flex-grow majoritaire, autres compresses. */
.brands-row {
  display: flex;
  gap: 8px;
  height: 70vh;
  min-height: 420px;
  max-height: 720px;
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
  opacity: 0.28;
  transform: scale(1.04);
  transition:
    opacity 1s cubic-bezier(0.16, 1, 0.3, 1),
    transform 1.4s cubic-bezier(0.16, 1, 0.3, 1);
}
.brand-panel-active .brand-img {
  opacity: 1;
  transform: scale(1);
}

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
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: var(--color-misana-paper);
  margin: 0;
  white-space: nowrap;
  transition: font-size 0.6s ease;
}
.brand-panel-active .brand-name {
  font-size: 1.15rem;
}
.brand-tag {
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.72);
  margin-top: 0.55rem;
  letter-spacing: 0.05em;
  opacity: 0;
  transform: translateY(8px);
  transition:
    opacity 0.6s ease 0.25s,
    transform 0.6s ease 0.25s;
}
.brand-panel-active .brand-tag {
  opacity: 1;
  transform: translateY(0);
}

@media (max-width: 767px) {
  .brands-row {
    flex-direction: column;
    height: auto;
    min-height: 0;
    max-height: none;
  }
  .brand-panel {
    height: 22vh;
    min-height: 160px;
  }
  .brand-panel-active { flex-grow: 1; }
  .brand-img { opacity: 0.55; }
  .brand-overlay { opacity: 1; }
  .brand-tag { opacity: 1; transform: none; }
}

/* === Categories ===
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

@media (prefers-reduced-motion: reduce) {
  .reveal, .reveal-line, .yacht-hero-bg, .brand-img, .category-img {
    transition: none !important;
    transform: none !important;
    opacity: 1 !important;
  }
}
</style>
