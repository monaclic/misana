<script setup lang="ts">
// Hub editorial villas : meme squelette que les hubs cars/yacht.
// 1) Hero dark plein ecran  2) Selection de villas  3) Destinations (villes)
// 4) Par cadre (settings)    5) SEO long-form + maillage interne.
// V1 consultatif : pas de prix en editorial, la demande passe par /request.
import { useVillas, type VillaCity, type VillaSetting } from '~/composables/useVillas';

definePageMeta({ layout: 'default' });
defineI18nRoute({
  paths: { en: '/luxury-villa-rental', fr: '/location-villa-de-luxe' },
});

const { locale, t } = useI18n();
const localePath = useLocalePath();

// Image hero uploadee sur Sanity (CDN + transforms pour la perf / LCP).
const HERO_BASE = 'https://cdn.sanity.io/images/akpi9bfm/production/3167a5846f4dbc692f0655f5895ac908523792d1-2998x1999.jpg';
const heroImage = `${HERO_BASE}?w=2400&q=80&auto=format`;

const { villas } = useVillas();

// Labels villes (sous-ensemble verrouille). Sert destinations + cartes.
const CITY_LABELS: Record<string, { fr: string; en: string }> = {
  'saint-tropez': { fr: 'Saint-Tropez', en: 'Saint-Tropez' },
  'ramatuelle': { fr: 'Ramatuelle', en: 'Ramatuelle' },
  'gassin': { fr: 'Gassin', en: 'Gassin' },
  'grimaud': { fr: 'Grimaud', en: 'Grimaud' },
  'la-croix-valmer': { fr: 'La Croix-Valmer', en: 'La Croix-Valmer' },
  'sainte-maxime': { fr: 'Sainte-Maxime', en: 'Sainte-Maxime' },
  'cavalaire-sur-mer': { fr: 'Cavalaire-sur-Mer', en: 'Cavalaire-sur-Mer' },
  'cannes': { fr: 'Cannes', en: 'Cannes' },
  'mougins': { fr: 'Mougins', en: 'Mougins' },
  'antibes': { fr: 'Antibes', en: 'Antibes' },
  'cap-d-antibes': { fr: "Cap d'Antibes", en: "Cap d'Antibes" },
  'villefranche-sur-mer': { fr: 'Villefranche-sur-Mer', en: 'Villefranche-sur-Mer' },
  'nice': { fr: 'Nice', en: 'Nice' },
  'eze': { fr: 'Èze', en: 'Èze' },
  'monaco': { fr: 'Monaco', en: 'Monaco' },
  'menton': { fr: 'Menton', en: 'Menton' },
  'cap-ferrat': { fr: 'Cap-Ferrat', en: 'Cap-Ferrat' },
};
function cityLabel(c: VillaCity): string {
  const x = CITY_LABELS[c];
  return x ? (locale.value === 'fr' ? x.fr : x.en) : c;
}

// Selection : 6 premieres villas (ordre curatif de la query useVillas).
const featured = computed(() => villas.value.slice(0, 6));

// Destinations : villes ayant au moins une villa, image representative
// (1re villa de la ville), tri par nombre de villas decroissant.
const destinations = computed(() => {
  const map = new Map<string, { city: VillaCity; image: string; count: number }>();
  for (const v of villas.value) {
    const cur = map.get(v.city);
    if (cur) cur.count += 1;
    else map.set(v.city, { city: v.city, image: v.hero || '', count: 1 });
  }
  return [...map.values()].sort((a, b) => b.count - a.count);
});

// Par cadre : les 4 settings, image representative + nombre.
const SETTINGS: { value: VillaSetting; fr: string; en: string }[] = [
  { value: 'beachfront', fr: 'Face à la mer', en: 'Beachfront' },
  { value: 'in-city', fr: 'Au cœur de la ville', en: 'In the heart of town' },
  { value: 'countryside', fr: 'À la campagne', en: 'In the countryside' },
  { value: 'out-of-town', fr: 'À l’écart', en: 'Out of town' },
];
const settingCards = computed(() =>
  SETTINGS.map((s) => {
    const inSetting = villas.value.filter((v) => v.setting === s.value);
    return {
      value: s.value,
      label: locale.value === 'fr' ? s.fr : s.en,
      image: inSetting[0]?.hero || villas.value[0]?.hero || '',
      count: inSetting.length,
    };
  }).filter((s) => s.count > 0),
);

// JSON-LD Service (aligne sur les autres hubs).
useHead({
  script: [{
    type: 'application/ld+json',
    innerHTML: JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'Service',
      name: 'Luxury villa rental on the French Riviera',
      provider: { '@type': 'Organization', name: 'Misana' },
      areaServed: ['Saint-Tropez', 'Cannes', 'Cap-Ferrat', 'Nice', 'Monaco'],
      serviceType: 'Villa rental',
    }),
  }],
});

useSeoMeta({
  title: () => (locale.value === 'fr'
    ? 'Location de villa de luxe sur la Côte d’Azur | Misana'
    : 'Luxury villa rental on the French Riviera | Misana'),
  description: () => (locale.value === 'fr'
    ? 'Sélection de villas de luxe sur la Côte d’Azur, de Saint-Tropez à Menton. Piscine, vue mer, face à la mer. Conciergerie, chef, ménage. Demande personnalisée.'
    : 'A selection of luxury villas on the French Riviera, from Saint-Tropez to Menton. Pool, sea view, beachfront. Concierge, chef, housekeeping. Personalised request.'),
  ogTitle: () => (locale.value === 'fr' ? 'Villas sur la Côte d’Azur · Misana' : 'Villas on the French Riviera · Misana'),
  ogImage: heroImage,
  twitterImage: heroImage,
});

// Header transparent + sticky CTA caches pendant le hero (pattern hubs).
const headerTransparent = useState<boolean>('header-transparent', () => true);
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
      class="villa-hero relative h-dvh overflow-hidden -mt-16 lg:-mt-24 bg-misana-ink text-misana-paper"
      data-revealed="false"
      data-hero
    >
      <img :src="heroImage" :alt="locale === 'fr' ? 'Villa de luxe sur la Côte d’Azur' : 'Luxury villa on the French Riviera'" class="villa-hero-bg absolute inset-0 w-full h-full object-cover" />
      <div class="absolute inset-0 bg-misana-ink/55"></div>

      <div class="relative h-full flex flex-col items-center justify-center text-center px-6">
        <div class="text-center max-w-2xl mx-auto mb-2 sm:mb-4">
          <div class="overflow-hidden">
            <p class="reveal" data-delay="1">
              <span class="font-display italic text-lg sm:text-2xl opacity-90">{{ t('villas.kicker') }}</span>
            </p>
          </div>
          <div class="overflow-hidden mt-1">
            <h1 class="reveal font-display text-3xl sm:text-5xl lg:text-6xl leading-[1.05]" data-delay="2">
              {{ locale === 'fr' ? 'Villas sur la Riviera' : 'Villas on the Riviera' }}
            </h1>
          </div>
        </div>
        <div class="reveal-line w-px h-16 sm:h-20 bg-misana-paper/70 my-8 sm:my-9"></div>
        <div class="overflow-hidden max-w-md">
          <p class="reveal text-base sm:text-lg leading-relaxed opacity-90" data-delay="4">
            {{ t('villas.hubLead') }}
          </p>
        </div>
        <div class="overflow-hidden mt-10">
          <NuxtLink
            :to="localePath({ name: 'villas-all' })"
            class="reveal group inline-flex items-center gap-8 pb-2 border-b-[1.5px] border-misana-paper text-base sm:text-lg tracking-wide"
            data-delay="5"
          >
            <span>{{ locale === 'fr' ? 'Découvrir la collection' : 'Discover the collection' }}</span>
            <span class="inline-flex items-center justify-center w-5 h-5 transition-transform duration-500 group-hover:translate-x-1" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" class="block w-full h-full"><path d="M7 12H17" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" /><path d="M13.5 8.5L17 12L13.5 15.5" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" /></svg>
            </span>
          </NuxtLink>
        </div>
      </div>
    </section>

    <!-- ============================================== -->
    <!-- 2. SELECTION (grille VillaCard)                 -->
    <!-- ============================================== -->
    <section class="bg-misana-paper">
      <div class="max-w-[1600px] mx-auto px-6 sm:px-12 py-16 sm:py-24">
        <div class="flex flex-wrap items-end justify-between gap-4 mb-10">
          <div>
            <p class="text-xs uppercase tracking-widest text-misana-muted mb-2">{{ locale === 'fr' ? 'La collection' : 'The collection' }}</p>
            <h2 class="font-display text-2xl sm:text-3xl">{{ locale === 'fr' ? 'Une sélection mesurée' : 'A considered selection' }}</h2>
          </div>
          <NuxtLink :to="localePath({ name: 'villas-all' })" class="hub-pill-cta">
            {{ locale === 'fr' ? `Voir les ${villas.length} villas` : `See all ${villas.length} villas` }}
          </NuxtLink>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <VillaCard v-for="v in featured" :key="v._id" :villa="v" />
        </div>
      </div>
    </section>

    <!-- ============================================== -->
    <!-- 3. DESTINATIONS (villes -> cocon SEO)           -->
    <!-- ============================================== -->
    <section class="bg-misana-ink text-misana-paper">
      <div class="max-w-[1600px] mx-auto px-6 sm:px-12 py-16 sm:py-24">
        <div class="mb-10">
          <p class="text-xs uppercase tracking-widest text-misana-paper/60 mb-2">{{ locale === 'fr' ? 'Destinations' : 'Destinations' }}</p>
          <h2 class="font-display text-2xl sm:text-3xl">{{ locale === 'fr' ? 'De Saint-Tropez à Menton' : 'From Saint-Tropez to Menton' }}</h2>
        </div>
        <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          <NuxtLink
            v-for="d in destinations"
            :key="d.city"
            :to="localePath({ name: 'villas-all', query: { city: d.city } })"
            class="dest-card group"
          >
            <img v-if="d.image" :src="d.image" :alt="cityLabel(d.city)" loading="lazy" class="dest-img" />
            <div v-else class="dest-img dest-img-placeholder"></div>
            <div class="dest-overlay"></div>
            <div class="dest-body">
              <span class="dest-name">{{ cityLabel(d.city) }}</span>
              <span class="dest-count">{{ d.count }} {{ d.count > 1 ? (locale === 'fr' ? 'villas' : 'villas') : (locale === 'fr' ? 'villa' : 'villa') }}</span>
            </div>
          </NuxtLink>
        </div>
      </div>
    </section>

    <!-- ============================================== -->
    <!-- 4. PAR CADRE (settings)                          -->
    <!-- ============================================== -->
    <section v-if="settingCards.length" class="bg-misana-paper">
      <div class="max-w-[1600px] mx-auto px-6 sm:px-12 py-16 sm:py-24">
        <div class="mb-10">
          <p class="text-xs uppercase tracking-widest text-misana-muted mb-2">{{ locale === 'fr' ? 'Par cadre' : 'By setting' }}</p>
          <h2 class="font-display text-2xl sm:text-3xl">{{ locale === 'fr' ? 'Trouvez votre adresse' : 'Find your address' }}</h2>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <NuxtLink
            v-for="s in settingCards"
            :key="s.value"
            :to="localePath({ name: 'villas-all', query: { setting: s.value } })"
            class="setting-card group"
          >
            <img v-if="s.image" :src="s.image" :alt="s.label" loading="lazy" class="setting-img" />
            <div v-else class="setting-img dest-img-placeholder"></div>
            <div class="dest-overlay"></div>
            <div class="dest-body">
              <span class="dest-name">{{ s.label }}</span>
              <span class="dest-count">{{ s.count }} {{ locale === 'fr' ? 'villas' : 'villas' }}</span>
            </div>
          </NuxtLink>
        </div>
      </div>
    </section>

    <!-- ============================================== -->
    <!-- 5. SEO CONTEXT (long-form + maillage interne)   -->
    <!-- ============================================== -->
    <section class="bg-misana-stone border-t border-misana-line">
      <div class="max-w-3xl mx-auto px-6 sm:px-12 py-16 sm:py-20">
        <h2 class="font-display text-2xl sm:text-3xl mb-6">
          {{ locale === 'fr' ? 'La location de villa, orchestrée' : 'Villa rental, orchestrated' }}
        </h2>
        <div class="hub-prose">
          <template v-if="locale === 'fr'">
            <p>De la presqu’île de Saint-Tropez aux hauteurs de Cap-Ferrat, nous tenons une sélection de villas le long de la Côte d’Azur. Piscine à débordement, vue mer, accès direct à la plage, domaine au calme : chaque maison est retenue pour ce qu’elle offre vraiment, pas pour une étiquette.</p>
            <p>Le séjour est orchestré autour de vous. Ménage, chef à domicile, conciergerie pendant le séjour, courses livrées avant l’arrivée, transfert depuis l’aéroport de Nice ou de Toulon. Vous nous dites vos dates et votre groupe, nous calons le reste.</p>
            <p>La collection couvre Saint-Tropez, Ramatuelle, Cannes, le Cap d’Antibes, Cap-Ferrat et au-delà. Parcourez <NuxtLink :to="localePath({ name: 'villas-all' })" class="hub-link">toutes les villas</NuxtLink>, ou commencez par une <NuxtLink :to="localePath({ name: 'villas-all', query: { setting: 'beachfront' } })" class="hub-link">villa face à la mer</NuxtLink>. Pour le reste du séjour, nous coordonnons aussi <NuxtLink :to="localePath({ name: 'yacht-all' })" class="hub-link">yacht</NuxtLink> et <NuxtLink :to="localePath({ name: 'cars-all' })" class="hub-link">voiture</NuxtLink>.</p>
          </template>
          <template v-else>
            <p>From the Saint-Tropez peninsula to the heights of Cap-Ferrat, we hold a selection of villas along the French Riviera. Infinity pool, sea view, direct beach access, a quiet estate: each house is kept for what it genuinely offers, not for a label.</p>
            <p>The stay is orchestrated around you. Housekeeping, private chef, concierge during the stay, groceries delivered before arrival, transfer from Nice or Toulon airport. You tell us your dates and your group, we arrange the rest.</p>
            <p>The collection covers Saint-Tropez, Ramatuelle, Cannes, Cap d’Antibes, Cap-Ferrat and beyond. Browse <NuxtLink :to="localePath({ name: 'villas-all' })" class="hub-link">all villas</NuxtLink>, or start with a <NuxtLink :to="localePath({ name: 'villas-all', query: { setting: 'beachfront' } })" class="hub-link">beachfront villa</NuxtLink>. For the rest of the stay, we also coordinate <NuxtLink :to="localePath({ name: 'yacht-all' })" class="hub-link">yacht</NuxtLink> and <NuxtLink :to="localePath({ name: 'cars-all' })" class="hub-link">car</NuxtLink>.</p>
          </template>
        </div>
        <NuxtLink :to="localePath({ path: '/request', query: { service: 'villa' } })" class="btn-ink-hub mt-10">
          {{ locale === 'fr' ? 'Faire une demande' : 'Make a request' }}
        </NuxtLink>
      </div>
    </section>
  </main>
</template>

<style scoped>
/* === Hero (identique cars/yacht) === */
.villa-hero-bg {
  transform: scale(1.06);
  transition: transform 8s ease-out;
}
[data-revealed="true"] .villa-hero-bg { transform: scale(1); }

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
[data-revealed="true"] .reveal[data-delay="4"] { transition-delay: 0.42s; }
[data-revealed="true"] .reveal[data-delay="5"] { transition-delay: 0.58s; }
.reveal-line {
  transform: scaleY(0);
  transform-origin: top center;
  transition: transform 1.4s cubic-bezier(0.16, 1, 0.3, 1) 0.28s;
}
[data-revealed="true"] .reveal-line { transform: scaleY(1); }

/* === CTA pill (header selection) === */
.hub-pill-cta {
  display: inline-flex; align-items: center;
  font-size: 0.72rem; letter-spacing: 0.16em; text-transform: uppercase;
  color: var(--color-misana-ink);
  border: 1px solid var(--color-misana-line);
  padding: 10px 20px; border-radius: 999px;
  transition: border-color 0.3s ease, background 0.3s ease, color 0.3s ease;
}
.hub-pill-cta:hover { border-color: var(--color-misana-ink); background: var(--color-misana-ink); color: var(--color-misana-paper); }

/* === Cartes destination / cadre === */
.dest-card, .setting-card {
  position: relative; display: block;
  aspect-ratio: 3 / 4; border-radius: 6px; overflow: hidden;
  background: var(--color-misana-stone);
}
.setting-card { aspect-ratio: 4 / 5; }
.dest-img, .setting-img {
  position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover;
  transition: transform 0.6s cubic-bezier(0.16, 1, 0.3, 1);
}
.dest-card:hover .dest-img, .setting-card:hover .setting-img { transform: scale(1.05); }
.dest-img-placeholder { background: var(--color-misana-stone); }
.dest-overlay {
  position: absolute; inset: 0;
  background: linear-gradient(to top, rgba(11,11,11,0.6) 0%, rgba(11,11,11,0) 55%);
}
.dest-body {
  position: absolute; left: 16px; right: 16px; bottom: 14px;
  display: flex; flex-direction: column; gap: 2px; color: var(--color-misana-paper);
}
.dest-name { font-family: var(--font-display, serif); font-size: 1.05rem; line-height: 1.15; }
.dest-count { font-size: 0.72rem; letter-spacing: 0.04em; opacity: 0.85; }

/* === SEO prose === */
.hub-prose p { font-size: 0.98rem; line-height: 1.9; color: var(--color-misana-ink); margin: 0 0 1.2rem; }
.hub-link { text-decoration: underline; text-underline-offset: 3px; }
.hub-link:hover { color: var(--color-misana-muted); }
.btn-ink-hub {
  display: inline-flex; align-items: center; justify-content: center;
  background: var(--color-misana-ink); color: var(--color-misana-paper);
  font-size: 0.72rem; letter-spacing: 0.16em; text-transform: uppercase;
  padding: 14px 28px; border-radius: 4px;
  transition: opacity 0.3s ease;
}
.btn-ink-hub:hover { opacity: 0.85; }

@media (prefers-reduced-motion: reduce) {
  .reveal, .reveal-line, .villa-hero-bg, .dest-img, .setting-img {
    transition: none !important; transform: none !important; opacity: 1 !important;
  }
}
</style>
