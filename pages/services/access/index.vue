<script setup lang="ts">
// Hub editorial access : hero home-style + 4 sections fleet-grid
// (Restaurants, Beach clubs, Palaces, Sorties), card adaptee aux lieux.
import { ESTABLISHMENTS, CITIES } from '~/lib/constants';

definePageMeta({ layout: 'default' });

const { locale, t } = useI18n();
const localePath = useLocalePath();

useSeoMeta({
  title: () => t('access.hubTitle'),
  description: () => t('access.hubDescription'),
});

useHead({
  script: [{
    type: 'application/ld+json',
    innerHTML: JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'Service',
      name: 'Access on the French Riviera',
      provider: { '@type': 'Organization', name: 'Misana' },
      areaServed: ['Cannes', 'Monaco', 'Saint-Tropez', 'Nice', 'Cap-Ferrat', 'Cap-d-Antibes', 'Menton'],
      serviceType: 'Concierge access',
    }),
  }],
});

// Image par establishment. Choix Unsplash thematique (deja eprouves
// dans le build), a remplacer par photos propres en photoshoot V1.
const ESTABLISHMENT_IMAGES: Record<string, string> = {
  // Restaurants
  'le-louis-xv': 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1600&q=80',
  'la-vague-d-or': 'https://images.unsplash.com/photo-1551918120-9739cb430c6d?w=1600&q=80',
  'mirazur': 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=1600&q=80',
  'la-palme-d-or': 'https://images.unsplash.com/photo-1559339352-11d035aa65de?w=1600&q=80',
  'le-chantecler': 'https://images.unsplash.com/photo-1466978913421-dad2ebd01d17?w=1600&q=80',
  // Palaces
  'cap-eden-roc': 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=1600&q=80',
  'carlton-cannes': 'https://images.unsplash.com/photo-1519452575417-564c1401ecc0?w=1600&q=80',
  'martinez-cannes': 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=1600&q=80',
  'grand-hotel-cap-ferrat': 'https://images.unsplash.com/photo-1551918120-9739cb430c6d?w=1600&q=80',
  'hotel-de-paris-monte-carlo': 'https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=1600&q=80',
  // Beach clubs
  'club-55': 'https://images.unsplash.com/photo-1530541930197-ff16ac917b0e?w=1600&q=80',
  'bagatelle': 'https://images.unsplash.com/photo-1505761671935-60b3a7427bad?w=1600&q=80',
  'plage-beau-rivage': 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=1600&q=80',
  // Nightlife
  'jimmy-z': 'https://images.unsplash.com/photo-1571266028243-e1c2c5b15e2d?w=1600&q=80',
  'baoli': 'https://images.unsplash.com/photo-1566737236500-c8ac43014a67?w=1600&q=80',
};

// Hero : image plein ecran d'un palace iconique de la cote.
const heroImage = ESTABLISHMENT_IMAGES['cap-eden-roc'];

// 4 sections : restaurants, beach clubs, palaces, nightlife.
// Tableau de blocs construit cote script (ESTABLISHMENTS est const, donc
// pas de besoin de computed). Iteration v-for directe sans probleme
// d'auto-unwrap de ref dans un literal d'objet template.
const SECTIONS = [
  { items: ESTABLISHMENTS.filter((e) => e.category === 'restaurant'), ns: 'restaurants', cat: 'restaurant' },
  { items: ESTABLISHMENTS.filter((e) => e.category === 'beach-club'), ns: 'beachClubs', cat: 'beach-club' },
  { items: ESTABLISHMENTS.filter((e) => e.category === 'palace'), ns: 'palaces', cat: 'palace' },
  { items: ESTABLISHMENTS.filter((e) => e.category === 'nightclub'), ns: 'nightlife', cat: 'nightclub' },
] as const;

const cityOf = (slug: string) => CITIES.find((c) => c.slug === slug);
const cityLabel = (slug: string) => {
  const c = cityOf(slug);
  return c ? (locale.value === 'fr' ? c.fr : c.en) : '';
};
const nameInitial = (n: string) => n.replace(/^(L'|Le |La |Hôtel )/i, '').charAt(0).toUpperCase();

// Header transparency + reveal observer (pattern home / about / cars / yacht)
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
      class="access-hero relative h-screen overflow-hidden -mt-16 bg-misana-ink text-misana-paper"
      data-revealed="false"
    >
      <img :src="heroImage" alt="" class="access-hero-bg absolute inset-0 w-full h-full object-cover" />
      <div class="absolute inset-0 bg-misana-ink/55"></div>

      <div class="relative h-full flex flex-col items-center justify-center text-center px-6">
        <div class="overflow-hidden">
          <p class="reveal" data-delay="1">
            <span class="font-display italic text-xl sm:text-2xl opacity-90">the</span>
          </p>
        </div>
        <div class="overflow-hidden mt-1">
          <h1 class="reveal font-display text-6xl sm:text-8xl leading-[0.95]" data-delay="2">
            {{ t('access.hubTitle') }}
          </h1>
        </div>
        <div class="reveal-line w-px h-16 sm:h-20 bg-misana-paper/70 my-8 sm:my-9"></div>
        <div class="overflow-hidden max-w-md">
          <p class="reveal text-base sm:text-lg leading-relaxed opacity-90" data-delay="4">
            {{ t('access.hubLead') }}
          </p>
        </div>
        <div class="overflow-hidden mt-10">
          <NuxtLink
            :to="localePath({ path: '/request', query: { service: 'access' } })"
            class="reveal group inline-flex items-center gap-8 pb-2 border-b-[1.5px] border-misana-paper text-base sm:text-lg tracking-wide"
            data-delay="5"
          >
            <span>{{ t('access.heroCta') }}</span>
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

    <!-- Macro template : sections fleet-grid pour chaque categorie -->
    <template v-for="block in SECTIONS" :key="block.ns">
      <section
        v-if="block.items.length"
        class="bg-misana-paper border-t border-misana-line"
      >
        <div class="max-w-[1600px] mx-auto px-6 sm:px-12 py-24 sm:py-32">
          <!-- Header centered : kicker italic + h2 + pill CTA -->
          <div class="text-center mb-14 sm:mb-20">
            <p class="font-display italic text-misana-muted text-base sm:text-lg mb-5">
              {{ t(`access.${block.ns}Kicker`) }}
            </p>
            <h2 class="font-display text-4xl sm:text-5xl lg:text-6xl leading-[1.05] mb-10">
              {{ t(`access.${block.ns}Title`) }}
            </h2>
            <NuxtLink
              :to="localePath({ path: '/request', query: { service: 'access', category: block.cat } })"
              class="inline-flex items-center gap-3 bg-misana-ink text-misana-paper px-7 py-3 text-sm tracking-wide rounded-full transition hover:opacity-90"
            >
              <span>{{ t('access.sectionCta') }}</span>
            </NuxtLink>
          </div>

          <!-- Grid 3 cols de cards -->
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            <NuxtLink
              v-for="est in block.items"
              :key="est.slug"
              :to="localePath(`/services/access/${est.slug}`)"
              class="place-card group block bg-misana-paper border border-misana-line rounded-xl overflow-hidden transition hover:border-misana-ink"
            >
              <div class="aspect-[16/11] relative overflow-hidden bg-misana-stone">
                <img
                  :src="ESTABLISHMENT_IMAGES[est.slug]"
                  :alt="est.name"
                  loading="lazy"
                  class="absolute inset-0 w-full h-full object-cover transition duration-700 group-hover:scale-[1.03]"
                />
              </div>

              <div class="p-5 sm:p-6">
                <div class="flex items-start gap-4 mb-5">
                  <div class="shrink-0 w-10 h-10 rounded-full border border-misana-line flex items-center justify-center font-display text-sm">
                    {{ nameInitial(est.name) }}
                  </div>
                  <div class="min-w-0 flex-1">
                    <h3 class="font-display text-lg leading-tight truncate">{{ est.name }}</h3>
                    <p class="text-xs text-misana-muted mt-1">{{ cityLabel(est.city) }}</p>
                  </div>
                </div>

                <div class="flex items-center justify-between">
                  <span class="inline-flex items-center px-3 py-1 rounded-full bg-misana-stone text-xs text-misana-muted">
                    {{ t(`access.cat.${est.category}`) }}
                  </span>
                  <span class="inline-flex items-center gap-2 text-xs text-misana-muted">
                    <span>{{ t('access.onRequest') }}</span>
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

          <!-- Bottom inline CTA avec compteur -->
          <div class="mt-16 text-center">
            <NuxtLink
              :to="localePath({ path: '/request', query: { service: 'access', category: block.cat } })"
              class="inline-flex items-center gap-3 group text-misana-ink text-base"
            >
              <span class="border-b border-misana-ink pb-0.5">
                {{ t('access.sectionCta') }}
                <span class="text-misana-muted ml-2">({{ block.items.length }})</span>
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
    </template>
  </main>
</template>

<style scoped>
/* Hero pattern home : reveal staggered + bg ken-burns 8s */
.access-hero-bg {
  transform: scale(1.06);
  transition: transform 8s ease-out;
}
[data-revealed="true"] .access-hero-bg { transform: scale(1); }

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

.place-card { transition: border-color 0.4s ease, transform 0.4s ease; }

@media (prefers-reduced-motion: reduce) {
  .reveal, .reveal-line, .access-hero-bg {
    transition: none !important;
    transform: none !important;
    opacity: 1 !important;
  }
}
</style>
