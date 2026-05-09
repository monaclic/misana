<script setup lang="ts">
// Hub editorial access : hero home-style + 4 sections fleet-grid
// (Restaurants, Beach clubs, Palaces, Sorties), card adaptee aux lieux.
import { CITIES } from '~/lib/constants';
import { useEstablishments } from '~/composables/useEstablishments';
import { FAQ_ACCESS, pickFaq } from '~/lib/faq';

definePageMeta({ layout: 'default' });
defineI18nRoute({
  paths: { en: '/reservations', fr: '/reservations' },
});

const { locale, t } = useI18n();
const localePath = useLocalePath();
const faqItems = computed(() => pickFaq(FAQ_ACCESS, locale.value));

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

// Source = Sanity (lazy). Les heros et thumbs sont en CDN Sanity.
const { establishments: ESTABLISHMENTS_REF } = useEstablishments();

// Map slug -> hero pour conserver la signature des composants enfants
// (AccessSectionSlider attend :images="ESTABLISHMENT_IMAGES").
const ESTABLISHMENT_IMAGES = computed<Record<string, string>>(() => {
  const map: Record<string, string> = {};
  for (const e of ESTABLISHMENTS_REF.value) map[e.slug] = e.hero;
  return map;
});

// Hero hub : override Sanity si fourni, sinon Cap-Eden-Roc, sinon premier dispo.
const { hub } = useServiceHub('access');
function pickLocale(v: { fr?: string; en?: string } | undefined) {
  if (!v) return undefined;
  return locale.value === 'fr' ? (v.fr || v.en) : (v.en || v.fr);
}
const heroImage = computed(() =>
  hub.value?.heroImage
    || ESTABLISHMENT_IMAGES.value['cap-eden-roc']
    || ESTABLISHMENTS_REF.value[0]?.hero
    || '',
);
const hubTitle = computed(() => pickLocale(hub.value?.heroTitleOverride) || t('access.hubTitle'));
const hubLead = computed(() => pickLocale(hub.value?.heroLeadOverride) || t('access.hubLead'));
const seoTitle = computed(() => {
  const s = locale.value === 'fr' ? hub.value?.seo?.titleFr : hub.value?.seo?.titleEn;
  return s || t('access.seoTitleTag');
});
const seoDescription = computed(() => {
  const s = locale.value === 'fr' ? hub.value?.seo?.descriptionFr : hub.value?.seo?.descriptionEn;
  return s || t('access.hubDescription');
});

// SEO meta : declare apres seoTitle/seoDescription (TDZ fix).
useSeoMeta({
  title: () => seoTitle.value,
  description: () => seoDescription.value,
  ogTitle: () => t('access.ogTitle'),
  ogDescription: () => t('access.ogDescription'),
  ogImage: () => heroImage.value || 'https://misana-group.com/og-default.jpg',
  twitterImage: () => heroImage.value || 'https://misana-group.com/og-default.jpg',
});

// Ordre fixe d'affichage des villes au sein d'une categorie.
// Couvre les villes Excellence (Saint-Tropez, Ramatuelle, Antibes, Cap d'Antibes,
// Cannes, Monaco) + autres villes Misana en fallback.
const CITY_ORDER = [
  'saint-tropez', 'ramatuelle', 'antibes', 'cap-d-antibes',
  'cannes', 'cap-ferrat', 'nice', 'eze', 'monaco', 'menton',
];
const sortByCity = (a: { city: string }, b: { city: string }) => {
  const ai = CITY_ORDER.indexOf(a.city);
  const bi = CITY_ORDER.indexOf(b.city);
  return (ai === -1 ? 999 : ai) - (bi === -1 ? 999 : bi);
};

// 4 sections : restaurants, beach clubs, palaces, nightlife.
// Palaces conserve sa logique actuelle (slider mobile + grid desktop, hors scope
// de la refonte access). Restaurants / beach clubs / nightlife passent au tri par
// ville + grille responsive 3/2/1 col + truncation a 6 fiches max par defaut.
const SECTIONS = computed(() => [
  { items: ESTABLISHMENTS_REF.value.filter((e) => e.category === 'restaurant').slice().sort(sortByCity), ns: 'restaurants', cat: 'restaurant' },
  { items: ESTABLISHMENTS_REF.value.filter((e) => e.category === 'beach-club').slice().sort(sortByCity), ns: 'beachClubs', cat: 'beach-club' },
  { items: ESTABLISHMENTS_REF.value.filter((e) => e.category === 'palace'), ns: 'palaces', cat: 'palace' },
  { items: ESTABLISHMENTS_REF.value.filter((e) => e.category === 'nightclub').slice().sort(sortByCity), ns: 'nightlife', cat: 'nightclub' },
]);

// State local d'expansion par section (cle = ns). Bouton "Voir les autres ({n})"
// pour reveler le reste sans rechargement.
const VISIBLE_LIMIT = 6;
const expandedSections = ref<Record<string, boolean>>({});
function visibleItems<T>(block: { ns: string; cat: string; items: T[] }): T[] {
  if (block.cat === 'palace') return block.items;
  if (expandedSections.value[block.ns]) return block.items;
  return block.items.slice(0, VISIBLE_LIMIT);
}
function hiddenCount(block: { ns: string; cat: string; items: unknown[] }): number {
  if (block.cat === 'palace' || expandedSections.value[block.ns]) return 0;
  return Math.max(0, block.items.length - VISIBLE_LIMIT);
}
function toggleSection(ns: string) {
  expandedSections.value[ns] = !expandedSections.value[ns];
}

const cityOf = (slug: string) => CITIES.find((c) => c.slug === slug);
const cityLabel = (slug: string) => {
  const c = cityOf(slug);
  return c ? (locale.value === 'fr' ? c.fr : c.en) : '';
};

// Note editoriale par lieu : une ligne courte, voix Misana
// (factuelle, sans superlatif, sans tiret long).
const PLACE_NOTES: Record<string, { fr: string; en: string }> = {
  'le-louis-xv': { fr: 'Trois étoiles à Monte-Carlo, depuis 1987.', en: 'Three stars in Monte-Carlo, since 1987.' },
  'la-vague-d-or': { fr: 'Trois étoiles, face à la baie de Saint-Tropez.', en: 'Three stars, facing the bay of Saint-Tropez.' },
  'mirazur': { fr: 'Mauro Colagreco, jardins en restanques au-dessus de Menton.', en: 'Mauro Colagreco, terraced gardens above Menton.' },
  'la-palme-d-or': { fr: 'Au Martinez, signature Christian Sinicropi.', en: 'At the Martinez, by Christian Sinicropi.' },
  'le-chantecler': { fr: 'Au Negresco, sur la Promenade des Anglais.', en: 'At the Negresco, on the Promenade des Anglais.' },
  'cap-eden-roc': { fr: 'Sur la pointe d\'Antibes, ouvert depuis 1870.', en: 'On the tip of Antibes, open since 1870.' },
  'carlton-cannes': { fr: 'Façade blanche sur la Croisette.', en: 'White facade on the Croisette.' },
  'martinez-cannes': { fr: 'Art déco face au tapis rouge.', en: 'Art deco facing the red carpet.' },
  'grand-hotel-cap-ferrat': { fr: 'Grand parc, vue sur la baie de Beaulieu.', en: 'Wide grounds, view over Beaulieu bay.' },
  'hotel-de-paris-monte-carlo': { fr: 'Place du Casino, l\'adresse de Monaco.', en: 'Place du Casino, the address in Monaco.' },
  'club-55': { fr: 'Pampelonne, le déjeuner depuis 1955.', en: 'Pampelonne, lunch since 1955.' },
  'bagatelle': { fr: 'L\'après-midi qui s\'étire, à Saint-Tropez.', en: 'An afternoon that stretches, in Saint-Tropez.' },
  'plage-beau-rivage': { fr: 'Promenade des Anglais, sur le sable.', en: 'Promenade des Anglais, on the sand.' },
  'jimmy-z': { fr: 'Au Sporting, l\'heure tardive de Monte-Carlo.', en: 'At the Sporting, the late hour of Monte-Carlo.' },
  'baoli': { fr: 'Port Canto, la nuit de Cannes.', en: 'Port Canto, the night of Cannes.' },
};
const placeNote = (slug: string) => {
  const n = PLACE_NOTES[slug];
  if (!n) return '';
  return locale.value === 'fr' ? n.fr : n.en;
};

// Numerotation editoriale : 01, 02, ... avec padding.
const pad2 = (n: number) => String(n).padStart(2, '0');

// Header transparency + reveal observer (pattern home / about / cars / yacht)
const headerTransparent = useState<boolean>('header-transparent', () => true);
// CTA header + sticky bottom bar caches pendant le hero, visibles ailleurs.
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
</script>

<template>
  <main>
    <!-- ============================================== -->
    <!-- 1. HERO (home-style, single dark panel)         -->
    <!-- ============================================== -->
    <section
      ref="heroRef"
      class="access-hero relative h-dvh overflow-hidden -mt-16 lg:-mt-24 bg-misana-ink text-misana-paper"
      data-revealed="false"
      data-hero
    >
      <img :src="heroImage" alt="" class="access-hero-bg absolute inset-0 w-full h-full object-cover" />
      <div class="absolute inset-0 bg-misana-ink/55"></div>

      <div class="relative h-full flex flex-col items-center justify-center text-center px-6">
        <div class="text-center max-w-2xl mx-auto mb-2 sm:mb-4">
          <div class="overflow-hidden">
            <p class="reveal" data-delay="1">
              <span v-if="locale === 'en'" class="font-display italic text-lg sm:text-2xl opacity-90">the</span>
            </p>
          </div>
          <div class="overflow-hidden mt-1">
            <h1 class="reveal font-display text-3xl sm:text-5xl lg:text-6xl leading-[1.05]" data-delay="2">
              {{ hubTitle }}
            </h1>
          </div>
        </div>
        <div class="reveal-line w-px h-16 sm:h-20 bg-misana-paper/70 my-8 sm:my-9"></div>
        <div class="overflow-hidden max-w-md">
          <p class="reveal text-base sm:text-lg leading-relaxed opacity-90" data-delay="4">
            {{ hubLead }}
          </p>
        </div>
        <div class="overflow-hidden mt-10">
          <NuxtLink
            :to="localePath({ path: '/request', query: { service: 'access' } })"
            class="reveal group inline-flex items-center gap-8 pb-2 border-b-[1.5px] border-misana-paper text-base sm:text-lg tracking-wide"
            data-delay="5"
          >
            <span>{{ t('access.heroCta') }}</span>
          </NuxtLink>
        </div>
      </div>
    </section>

    <!-- Macro template : sections fleet-grid pour chaque categorie -->
    <template v-for="(block, blockIdx) in SECTIONS" :key="block.ns">
      <section
        v-if="block.items.length"
        class="bg-misana-paper"
      >
        <div class="max-w-[1600px] mx-auto px-6 sm:px-12 py-14 sm:py-20">
          <!-- Header centered : kicker italic + h2 + pill CTA -->
          <div class="text-center mb-10 sm:mb-14">
            <p class="text-[11px] uppercase tracking-[0.25em] text-misana-muted mb-4">
              (MS · {{ String(blockIdx + 1).padStart(2, '0') }}) · {{ t(`access.${block.ns}Kicker`) }}
            </p>
            <h2 class="font-display text-4xl sm:text-5xl lg:text-6xl leading-[1.05] mb-7">
              {{ t(`access.${block.ns}Title`) }}
            </h2>
            <NuxtLink
              :to="localePath({ path: '/request', query: { service: 'access', category: block.cat } })"
              class="hidden md:inline-flex items-center gap-3 bg-misana-ink text-misana-paper px-7 py-3 text-sm tracking-wide rounded-full transition hover:opacity-90"
            >
              <span>{{ t('access.sectionCta') }}</span>
            </NuxtLink>
          </div>

          <!-- PALACES (hors scope, layout actuel preserve) :
               desktop grid 3 cols, mobile slider Embla. -->
          <template v-if="block.cat === 'palace'">
            <div class="hidden md:grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-7">
              <NuxtLink
                v-for="(est, idx) in block.items"
                :key="est.slug"
                :to="localePath({ name: 'access-establishment', params: { establishment: est.slug } })"
                class="place-card group"
              >
                <img :src="ESTABLISHMENT_IMAGES[est.slug]" :alt="est.name" loading="lazy" class="place-card-img" />
                <span class="place-card-grad"></span>
                <span class="place-card-number">{{ pad2(idx + 1) }}</span>
                <span class="place-card-cue">
                  <span>{{ t('access.discover') }}</span>
                  <span class="place-card-cue-arrow inline-flex items-center justify-center w-[0.9em] h-[0.9em] translate-y-[0.05em]">
                    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" class="block w-full h-full">
                      <path d="M7 12H17" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
                      <path d="M13.5 8.5L17 12L13.5 15.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                    </svg>
                  </span>
                </span>
                <div class="place-card-caption">
                  <p class="place-card-eyebrow">{{ cityLabel(est.city) }}</p>
                  <span class="place-card-rule"></span>
                  <h3 class="place-card-name">{{ est.name }}</h3>
                  <p class="place-card-note">{{ placeNote(est.slug) }}</p>
                </div>
              </NuxtLink>
            </div>
            <div class="md:hidden">
              <AccessSectionSlider
                :items="block.items"
                :images="ESTABLISHMENT_IMAGES"
                :city-label="cityLabel"
                :place-note="placeNote"
                :discover-label="t('access.discover')"
                :prev-label="t('cars.brandsPrev')"
                :next-label="t('cars.brandsNext')"
              />
            </div>
          </template>

          <!-- RESTAURANTS / BEACH CLUBS / NIGHTLIFE :
               grille responsive (mobile 1 col, tablet 2 col, desktop 3 col),
               tri par ville (CITY_ORDER), truncation a 6 fiches max + bouton
               "Voir les autres ({n})" qui revele le reste sans rechargement. -->
          <template v-else>
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-7">
              <NuxtLink
                v-for="(est, idx) in visibleItems(block)"
                :key="est.slug"
                :to="localePath({ name: 'access-establishment', params: { establishment: est.slug } })"
                class="place-card group"
              >
                <img :src="ESTABLISHMENT_IMAGES[est.slug]" :alt="est.name" loading="lazy" class="place-card-img" />
                <span class="place-card-grad"></span>
                <span class="place-card-number">{{ pad2(idx + 1) }}</span>
                <span class="place-card-cue">
                  <span>{{ t('access.discover') }}</span>
                  <span class="place-card-cue-arrow inline-flex items-center justify-center w-[0.9em] h-[0.9em] translate-y-[0.05em]">
                    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" class="block w-full h-full">
                      <path d="M7 12H17" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
                      <path d="M13.5 8.5L17 12L13.5 15.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                    </svg>
                  </span>
                </span>
                <div class="place-card-caption">
                  <p class="place-card-eyebrow">{{ cityLabel(est.city) }}</p>
                  <span class="place-card-rule"></span>
                  <h3 class="place-card-name">{{ est.name }}</h3>
                  <p class="place-card-note">{{ placeNote(est.slug) }}</p>
                </div>
              </NuxtLink>
            </div>

            <!-- Bouton "Voir les autres (n)" si plus de 6 fiches dans la section -->
            <div v-if="hiddenCount(block) > 0" class="mt-8 sm:mt-10 text-center">
              <button
                type="button"
                @click="toggleSection(block.ns)"
                class="inline-flex items-center gap-3 group text-misana-ink text-base"
              >
                <span class="border-b border-misana-ink pb-0.5">
                  {{ locale === 'fr' ? `Voir les autres (${hiddenCount(block)})` : `View ${hiddenCount(block)} more` }}
                </span>
              </button>
            </div>
            <div v-else-if="expandedSections[block.ns] && block.items.length > VISIBLE_LIMIT" class="mt-8 sm:mt-10 text-center">
              <button
                type="button"
                @click="toggleSection(block.ns)"
                class="inline-flex items-center gap-3 group text-misana-muted text-sm"
              >
                <span class="border-b border-misana-muted pb-0.5">
                  {{ locale === 'fr' ? 'Reduire' : 'Show less' }}
                </span>
              </button>
            </div>
          </template>

          <!-- Bottom inline CTA avec compteur -->
          <div class="mt-10 sm:mt-12 text-center">
            <NuxtLink
              :to="localePath({ path: '/request', query: { service: 'access', category: block.cat } })"
              class="inline-flex items-center gap-3 group text-misana-ink text-base"
            >
              <span class="border-b border-misana-ink pb-0.5">
                {{ t('access.sectionCta') }}
                <span class="text-misana-muted ml-2">({{ block.items.length }})</span>
              </span>
            </NuxtLink>
          </div>
        </div>
      </section>
    </template>

    <!-- ============================================== -->
    <!-- FAQ (SEO + AEO : FAQPage schema injecte)         -->
    <!-- ============================================== -->
    <FaqSection
      id="access"
      :title="locale === 'fr' ? 'Questions fréquentes' : 'Frequently asked questions'"
      :items="faqItems"
    />

    <!-- ============================================== -->
    <!-- SEO CONTEXT (long-form + maillage interne)       -->
    <!-- ============================================== -->
    <section class="bg-misana-paper">
      <div class="max-w-[1600px] mx-auto px-6 sm:px-12 py-16 sm:py-20">
        <p class="text-[11px] uppercase tracking-[0.25em] text-misana-muted mb-5">(MS · 05) · {{ t('access.seo.kicker') }}</p>
        <h2 class="font-display text-3xl sm:text-4xl lg:text-5xl leading-[1.1] mb-8 sm:mb-10">{{ t('access.seo.title') }}</h2>
        <div class="seo-prose">
          <i18n-t keypath="access.seo.p1" tag="p" scope="global">
            <template #saintTropez><NuxtLink :to="localePath('/destinations/saint-tropez')">Saint-Tropez</NuxtLink></template>
            <template #monaco><NuxtLink :to="localePath('/destinations/monaco')">Monaco</NuxtLink></template>
            <template #cannes><NuxtLink :to="localePath('/destinations/cannes')">Cannes</NuxtLink></template>
            <template #capDAntibes><NuxtLink :to="localePath('/destinations/cap-d-antibes')">{{ locale === 'fr' ? 'Cap-d\'Antibes' : 'Cap d\'Antibes' }}</NuxtLink></template>
            <template #capFerrat><NuxtLink :to="localePath('/destinations/cap-ferrat')">Cap-Ferrat</NuxtLink></template>
            <template #nice><NuxtLink :to="localePath('/destinations/nice')">Nice</NuxtLink></template>
          </i18n-t>
          <i18n-t keypath="access.seo.p2" tag="p" scope="global" />
          <i18n-t keypath="access.seo.p3" tag="p" scope="global">
            <template #festival><NuxtLink :to="localePath('/events/festival-de-cannes')">{{ locale === 'fr' ? 'Festival de Cannes' : 'Cannes Film Festival' }}</NuxtLink></template>
            <template #grandPrix><NuxtLink :to="localePath('/events/monaco-grand-prix')">{{ locale === 'fr' ? 'Grand Prix de Monaco' : 'Monaco Grand Prix' }}</NuxtLink></template>
            <template #monacoYachtShow><NuxtLink :to="localePath('/events/monaco-yacht-show')">Monaco Yacht Show</NuxtLink></template>
          </i18n-t>
          <i18n-t keypath="access.seo.p4" tag="p" scope="global">
            <template #chauffeur><NuxtLink :to="localePath({ name: 'chauffeur' })">chauffeur</NuxtLink></template>
            <template #cars><NuxtLink :to="localePath({ name: 'cars' })">{{ locale === 'fr' ? 'voiture' : 'car rental' }}</NuxtLink></template>
            <template #yacht><NuxtLink :to="localePath({ name: 'yacht' })">{{ locale === 'fr' ? 'yacht' : 'yacht' }}</NuxtLink></template>
            <template #helicopter><NuxtLink :to="localePath({ name: 'helicopter' })">{{ locale === 'fr' ? 'hélicoptère' : 'helicopter' }}</NuxtLink></template>
            <template #request><NuxtLink :to="localePath('/request')">{{ locale === 'fr' ? 'formulaire' : 'request form' }}</NuxtLink></template>
          </i18n-t>
        </div>
      </div>
    </section>
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

/* === Card lieu (editoriale, image = card) ===
   Pas de body separe, tout overlaye sur la photo, format portrait 4:5,
   numero magazine, hairline qui s'etire au hover, eyebrow ville,
   nom display, note italique. */
.place-card {
  position: relative;
  display: block;
  aspect-ratio: 4 / 5;
  border-radius: 4px;
  overflow: hidden;
  background: var(--color-misana-stone);
  color: var(--color-misana-paper);
  isolation: isolate;
}

.place-card-img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transform: scale(1);
  transition: transform 1.4s cubic-bezier(0.16, 1, 0.3, 1);
}
.place-card:hover .place-card-img { transform: scale(1.045); }

.place-card-grad {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    to top,
    rgba(7, 7, 7, 0.88) 0%,
    rgba(7, 7, 7, 0.55) 32%,
    rgba(7, 7, 7, 0.18) 60%,
    rgba(7, 7, 7, 0) 100%
  );
  pointer-events: none;
  transition: opacity 0.6s ease;
}
.place-card:hover .place-card-grad { opacity: 0.92; }

/* Numero editorial : top-left, italic display, sobre */
.place-card-number {
  position: absolute;
  top: 1.25rem;
  left: 1.25rem;
  font-family: var(--font-display, serif);
  font-style: italic;
  font-size: 0.78rem;
  letter-spacing: 0.05em;
  color: rgba(255, 255, 255, 0.72);
  z-index: 2;
}

/* Cue Decouvrir : top-right, fade-in au hover */
.place-card-cue {
  position: absolute;
  top: 1.1rem;
  right: 1.25rem;
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  font-size: 0.65rem;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.92);
  opacity: 0;
  transform: translateX(-6px);
  transition: opacity 0.55s ease, transform 0.55s ease;
  z-index: 2;
}
.place-card:hover .place-card-cue {
  opacity: 1;
  transform: translateX(0);
}
@media (max-width: 767px) {
  .place-card-cue-arrow { display: none; }
}

/* Caption block : pile en bas, infos overlayees */
.place-card-caption {
  position: absolute;
  inset: auto 0 0 0;
  padding: 1.5rem 1.5rem 1.6rem;
  z-index: 2;
}
@media (min-width: 640px) {
  .place-card-caption { padding: 1.75rem 1.75rem 1.85rem; }
}

.place-card-eyebrow {
  font-size: 0.62rem;
  letter-spacing: 0.28em;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.85);
  margin: 0;
}

.place-card-rule {
  display: block;
  width: 26px;
  height: 1px;
  margin: 0.75rem 0 0.85rem;
  background: rgba(255, 255, 255, 0.55);
  transition: width 0.7s cubic-bezier(0.16, 1, 0.3, 1);
}
.place-card:hover .place-card-rule { width: 56px; }

.place-card-name {
  font-family: var(--font-display, serif);
  font-size: 1.55rem;
  line-height: 1.05;
  margin: 0;
  color: var(--color-misana-paper);
}
@media (min-width: 1024px) {
  .place-card-name { font-size: 1.7rem; }
}

.place-card-note {
  margin: 0.65rem 0 0;
  max-width: 28ch;
  font-style: italic;
  font-size: 0.8rem;
  line-height: 1.45;
  color: rgba(255, 255, 255, 0.78);
}

/* === SEO prose === */
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
  .reveal, .reveal-line, .access-hero-bg, .place-card-img, .place-card-rule, .place-card-cue {
    transition: none !important;
    transform: none !important;
    opacity: 1 !important;
  }
}
</style>
