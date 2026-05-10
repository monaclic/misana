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

// Map slug -> hero
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

// 4 sections par categorie d'etablissement, chacune en slider horizontal.
// Tri intra-section par ville (St-Trop -> Menton, ouest a est).
const CITY_ORDER = [
  'saint-tropez', 'ramatuelle', 'antibes', 'cap-d-antibes',
  'cannes', 'cap-ferrat', 'nice', 'eze', 'monaco', 'menton',
];
const sortByCity = (a: { city: string; name: string }, b: { city: string; name: string }) => {
  const ai = CITY_ORDER.indexOf(a.city);
  const bi = CITY_ORDER.indexOf(b.city);
  const cityDiff = (ai === -1 ? 999 : ai) - (bi === -1 ? 999 : bi);
  if (cityDiff !== 0) return cityDiff;
  return a.name.localeCompare(b.name, 'fr');
};

// Filtre par TYPE d'etablissement uniquement (pas par ville).
// UI : nav texte editoriale, pas de chip, pas de bouton.
type CategoryKey = 'all' | 'restaurant' | 'beach-club' | 'palace' | 'nightclub';
const selectedCategory = ref<CategoryKey>('all');

const CATEGORY_ORDER: Record<string, number> = {
  'restaurant': 0,
  'beach-club': 1,
  'palace': 2,
  'nightclub': 3,
};

const CATEGORY_NAV = computed(() => {
  const counts = new Map<CategoryKey, number>();
  for (const e of ESTABLISHMENTS_REF.value) {
    counts.set(e.category as CategoryKey, (counts.get(e.category as CategoryKey) ?? 0) + 1);
  }
  const order: Array<{ key: CategoryKey; labelFr: string; labelEn: string }> = [
    { key: 'all',         labelFr: 'Toutes',       labelEn: 'All' },
    { key: 'restaurant',  labelFr: 'Restaurants',  labelEn: 'Restaurants' },
    { key: 'beach-club',  labelFr: 'Beach clubs',  labelEn: 'Beach clubs' },
    { key: 'palace',      labelFr: 'Hôtels',       labelEn: 'Hotels' },
    { key: 'nightclub',   labelFr: 'Sorties',      labelEn: 'Nightlife' },
  ];
  return order
    .map((o) => ({
      ...o,
      count: o.key === 'all' ? ESTABLISHMENTS_REF.value.length : (counts.get(o.key) ?? 0),
    }))
    .filter((o) => o.key === 'all' || o.count > 0);
});

const FILTERED_ESTABLISHMENTS = computed(() => {
  let list = ESTABLISHMENTS_REF.value.slice();
  if (selectedCategory.value !== 'all') {
    list = list.filter((e) => e.category === selectedCategory.value);
  }
  return list.sort((a, b) => {
    const catDiff = (CATEGORY_ORDER[a.category] ?? 99) - (CATEGORY_ORDER[b.category] ?? 99);
    if (catDiff !== 0) return catDiff;
    return sortByCity(a, b);
  });
});

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
// Note editoriale : priorite a la map curated PLACE_NOTES (textes Misana
// rediges main). Sinon : signature/shortLine depuis Sanity. Sinon vide.
const placeNote = (slug: string) => {
  const n = PLACE_NOTES[slug];
  if (n) return locale.value === 'fr' ? n.fr : n.en;
  const est = ESTABLISHMENTS_REF.value.find((e) => e.slug === slug);
  if (!est?.signature) return '';
  return locale.value === 'fr' ? est.signature.fr : est.signature.en;
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

    <!-- Grille unique + filtre type editorial (texte, pas de bouton) -->
    <section class="bg-misana-paper">
      <div class="max-w-[1600px] mx-auto px-6 sm:px-12 py-14 sm:py-20">
        <!-- Header centre simple -->
        <div class="text-center mb-8 sm:mb-10">
          <p class="text-[11px] uppercase tracking-[0.25em] text-misana-muted mb-4">
            (MS · 01) · {{ t('access.allEstablishmentsKicker') }}
          </p>
          <h2 class="font-display text-4xl sm:text-5xl lg:text-6xl leading-[1.05] mb-4">
            {{ t('access.allEstablishmentsTitle') }}
          </h2>
          <p class="text-misana-muted text-base sm:text-lg">
            {{ FILTERED_ESTABLISHMENTS.length }}
            <span>{{ locale === 'fr'
              ? (FILTERED_ESTABLISHMENTS.length > 1 ? 'adresses' : 'adresse')
              : (FILTERED_ESTABLISHMENTS.length > 1 ? 'addresses' : 'address') }}</span>
          </p>
        </div>

        <!-- Filtre type : nav texte editorial centree, separee par middle dots -->
        <nav class="cat-nav mb-10 sm:mb-14" :aria-label="locale === 'fr' ? 'Filtrer par type' : 'Filter by type'">
          <ul class="cat-nav-list">
            <li v-for="(opt, i) in CATEGORY_NAV" :key="opt.key" class="cat-nav-item">
              <button
                type="button"
                class="cat-nav-link"
                :class="{ 'is-active': selectedCategory === opt.key }"
                @click="selectedCategory = opt.key"
              >
                {{ locale === 'fr' ? opt.labelFr : opt.labelEn }}
                <span class="cat-nav-count">{{ opt.count }}</span>
              </button>
              <span v-if="i < CATEGORY_NAV.length - 1" class="cat-nav-sep" aria-hidden="true">·</span>
            </li>
          </ul>
        </nav>

        <!-- Grille 4 col xl, 3 lg, 2 sm, 1 mobile -->
        <div
          v-if="FILTERED_ESTABLISHMENTS.length"
          class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 sm:gap-6 lg:gap-7"
        >
          <NuxtLink
            v-for="(est, idx) in FILTERED_ESTABLISHMENTS"
            :key="est.slug"
            :to="localePath({ name: 'access-establishment', params: { establishment: est.slug } })"
            class="place-card group"
          >
            <img :src="ESTABLISHMENT_IMAGES[est.slug]" :alt="est.name" loading="lazy" class="place-card-img" />
            <span class="place-card-grad"></span>
            <span class="place-card-number">{{ pad2(idx + 1) }}</span>
            <div class="place-card-caption">
              <p class="place-card-eyebrow">{{ cityLabel(est.city) }}</p>
              <span class="place-card-rule"></span>
              <h3 class="place-card-name">{{ est.name }}</h3>
              <p class="place-card-note">{{ placeNote(est.slug) }}</p>
            </div>
          </NuxtLink>
        </div>

        <!-- CTA global Demander (sous la grille) -->
        <div class="mt-14 sm:mt-20 text-center">
          <NuxtLink
            :to="localePath({ path: '/request', query: {
              service: 'access',
              ...(selectedCategory !== 'all' ? { category: selectedCategory } : {}),
            } })"
            class="inline-flex items-center gap-3 bg-misana-ink text-misana-paper px-8 py-3.5 text-sm tracking-[0.16em] uppercase rounded-full transition hover:opacity-90"
          >
            <span>{{ t('access.sectionCta') }}</span>
          </NuxtLink>
        </div>
      </div>
    </section>

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

/* === Filtre type : nav texte editorial (pas de chip, pas de bouton) === */
.cat-nav { width: 100%; }
.cat-nav-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  align-items: baseline;
  gap: 0;
}
.cat-nav-item {
  display: inline-flex;
  align-items: baseline;
  gap: 0.7rem;
}
.cat-nav-link {
  display: inline-flex;
  align-items: baseline;
  gap: 0.35rem;
  padding: 0.4rem 0.6rem;
  font-size: 0.92rem;
  letter-spacing: 0.01em;
  color: var(--color-misana-muted);
  background: transparent;
  border: 0;
  cursor: pointer;
  position: relative;
  transition: color 0.2s ease;
  font-family: inherit;
}
.cat-nav-link:hover { color: var(--color-misana-ink); }
.cat-nav-link.is-active {
  color: var(--color-misana-ink);
}
.cat-nav-link.is-active::after {
  content: '';
  position: absolute;
  left: 0.6rem;
  right: 0.6rem;
  bottom: 0.15rem;
  height: 1px;
  background: var(--color-misana-ink);
}
.cat-nav-count {
  font-size: 0.7em;
  opacity: 0.55;
  font-variant-numeric: tabular-nums;
}
.cat-nav-sep {
  color: var(--color-misana-muted);
  opacity: 0.4;
  font-size: 0.85rem;
  user-select: none;
}

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
  .reveal, .reveal-line, .access-hero-bg, .place-card-img, .place-card-rule {
    transition: none !important;
    transform: none !important;
    opacity: 1 !important;
  }
}
</style>
