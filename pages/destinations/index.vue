<script setup lang="ts">
// Hub destinations : essai typographique le long des 80 km Saint-Tropez ->
// Menton. Lecture haut-bas = trajet ouest-est. Trois sections :
// 1. Hero plein ecran
// 2. The arc : ruban hairline avec les 8 villes en ordre geographique
// 3. Held heavy : 4 chapitres alternes pour les villes lourdes
// 4. Held lighter : grille compacte pour les 4 stub
import { CITIES } from '~/lib/constants';

definePageMeta({ layout: 'default' });

const { locale, t } = useI18n();
const localePath = useLocalePath();

useSeoMeta({
  title: () => t('destinations.hubTitle'),
  description: () => t('destinations.hubDescription'),
});

useHead({
  script: [{
    type: 'application/ld+json',
    innerHTML: JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'TouristDestination',
      name: 'French Riviera (Saint-Tropez to Menton)',
      provider: { '@type': 'Organization', name: 'Misana' },
    }),
  }],
});

// Ordre geographique W -> E. CLAUDE.md fixe 8 destinations verrouillees.
const W_TO_E_ORDER = [
  'saint-tropez', 'cannes', 'cap-d-antibes', 'nice',
  'cap-ferrat', 'eze', 'monaco', 'menton',
] as const;

const orderedCities = computed(() =>
  W_TO_E_ORDER.map((slug) => CITIES.find((c) => c.slug === slug)!).filter(Boolean),
);

// Coordonnees GPS approximatives, signature visuelle (italic mono).
const COORDS: Record<string, { lat: string; lon: string }> = {
  'saint-tropez': { lat: '43.27° N', lon: '6.64° E' },
  'cannes': { lat: '43.55° N', lon: '7.02° E' },
  'cap-d-antibes': { lat: '43.55° N', lon: '7.13° E' },
  'nice': { lat: '43.70° N', lon: '7.27° E' },
  'cap-ferrat': { lat: '43.69° N', lon: '7.33° E' },
  'eze': { lat: '43.73° N', lon: '7.36° E' },
  'monaco': { lat: '43.74° N', lon: '7.42° E' },
  'menton': { lat: '43.78° N', lon: '7.50° E' },
};

// Image par ville. Unsplash thematiques cote / Mediterranee / villages,
// a remplacer par photoshoot V1.
const CITY_IMAGES: Record<string, string> = {
  'saint-tropez': 'https://images.unsplash.com/photo-1530541930197-ff16ac917b0e?w=1800&q=80',
  'cannes': 'https://images.unsplash.com/photo-1499678329028-101435549a4e?w=1800&q=80',
  'cap-d-antibes': 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=1800&q=80',
  'nice': 'https://images.unsplash.com/photo-1567899378494-47b22a2ae96a?w=1800&q=80',
  'cap-ferrat': 'https://images.unsplash.com/photo-1473093226795-af9932fe5856?w=1800&q=80',
  'eze': 'https://images.unsplash.com/photo-1605515298946-d062f2e9da53?w=1800&q=80',
  'monaco': 'https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=1800&q=80',
  'menton': 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=1800&q=80',
};

// Paragraphes editoriaux pour les 4 villes "tenues fort". 3-4 phrases,
// voix Misana : factuel, sobre, sans superlatif ni tiret long.
const HEAVY_BODIES: Record<string, { fr: string; en: string }> = {
  'saint-tropez': {
    fr: "Le port le matin, Pampelonne pour le déjeuner, Ramatuelle pour le dîner. Les ruelles derrière la place des Lices que personne ne remplit. La saison commence en mai et s'étire jusqu'à fin septembre. Nous tenons les chauffeurs sur place de juin à août.",
    en: "The harbour in the morning, Pampelonne for lunch, Ramatuelle for dinner. The streets behind Place des Lices that nobody fills. The season opens in May and runs to late September. We hold drivers on site from June to August.",
  },
  'cannes': {
    fr: "La Croisette fait deux kilomètres ; nous connaissons le portier de chaque palace. La Californie au-dessus, le Suquet en bas, Palm Beach au bout. Le Festival prend la ville en mai, les Cannes Lions en juin, le Yachting Festival en septembre. Trois temps forts, trois logiques de séjour.",
    en: "The Croisette runs two kilometres ; we know the doorman of every palace. La Californie above, Le Suquet below, Palm Beach at the end. The Festival takes the city in May, Cannes Lions in June, the Yachting Festival in September. Three peaks, three ways to stay.",
  },
  'nice': {
    fr: "L'aéroport NCE est notre porte d'entrée. La Promenade des Anglais en façade, Cimiez sur les hauteurs, Mont Boron pour les villas. La ville fonctionne toute l'année, le Carnaval en février, le Jazz en juillet. Nos chauffeurs y sont basés en permanence.",
    en: "Nice airport is our gateway. Promenade des Anglais on the front, Cimiez on the heights, Mont Boron for the villas. The city runs year-round, Carnival in February, Jazz in July. Our drivers are based here permanently.",
  },
  'monaco': {
    fr: "Le Casino, le Sporting, Larvotto, Fontvieille. Le Grand Prix en mai, le Yacht Show en septembre. Le port Hercule pour les charters, Monte-Carlo pour les palaces. Une ville-état qui se traverse en quinze minutes mais qu'il faut connaître par ses étages.",
    en: "The Casino, the Sporting, Larvotto, Fontvieille. The Grand Prix in May, the Yacht Show in September. Port Hercule for the charters, Monte-Carlo for the palaces. A city-state crossed in fifteen minutes that has to be known floor by floor.",
  },
};
const heavyBody = (slug: string) => {
  const b = HEAVY_BODIES[slug];
  if (!b) return '';
  return locale.value === 'fr' ? b.fr : b.en;
};

// Mini "tags" services pour les villes lourdes : 3 a 4 axes.
const HEAVY_TAGS: Record<string, { fr: string[]; en: string[] }> = {
  'saint-tropez': { fr: ['Yacht', 'Beach club', 'Restaurants'], en: ['Yacht', 'Beach club', 'Restaurants'] },
  'cannes': { fr: ['Festivals', 'Palaces', 'Yacht'], en: ['Festivals', 'Palaces', 'Yacht'] },
  'nice': { fr: ['Aéroport', 'Chauffeur', 'Restaurants'], en: ['Airport', 'Chauffeur', 'Restaurants'] },
  'monaco': { fr: ['Palaces', 'Hélicoptère', 'Yacht'], en: ['Palaces', 'Helicopter', 'Yacht'] },
};
const heavyTags = (slug: string) => {
  const t = HEAVY_TAGS[slug];
  if (!t) return [];
  return locale.value === 'fr' ? t.fr : t.en;
};

// Numerotation editoriale globale (W -> E sur les 8) + interne par section.
const numIn = (slug: string, list: readonly { slug: string }[]) =>
  String(list.findIndex((c) => c.slug === slug) + 1).padStart(2, '0');

const heavyOrdered = computed(() =>
  orderedCities.value.filter((c) => c.tier === 'heavy'),
);
const stubOrdered = computed(() =>
  orderedCities.value.filter((c) => c.tier !== 'heavy'),
);

// Header transparency + reveal observer (pattern services)
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
      class="dest-hero relative h-dvh overflow-hidden -mt-16 lg:-mt-24 bg-misana-ink text-misana-paper"
      data-revealed="false"
    >
      <img
        :src="CITY_IMAGES['cap-ferrat']"
        alt=""
        class="dest-hero-bg absolute inset-0 w-full h-full object-cover"
      />
      <div class="absolute inset-0 bg-misana-ink/55"></div>

      <div class="relative h-full flex flex-col items-center justify-center text-center px-6">
        <div class="overflow-hidden">
          <p class="reveal" data-delay="1">
            <span v-if="locale === 'en'" class="font-display italic text-xl sm:text-2xl opacity-90">the</span>
          </p>
        </div>
        <div class="overflow-hidden mt-1">
          <h1 class="reveal font-display text-5xl sm:text-7xl lg:text-9xl leading-[0.92]" data-delay="2">
            Riviera
          </h1>
        </div>
        <div class="reveal-line w-px h-16 sm:h-20 bg-misana-paper/70 my-8 sm:my-9"></div>
        <div class="overflow-hidden max-w-md">
          <p class="reveal text-base sm:text-lg leading-relaxed opacity-90" data-delay="4">
            {{ t('destinations.hubLead') }}
          </p>
        </div>
        <div class="overflow-hidden mt-10">
          <NuxtLink
            :to="localePath({ path: '/request' })"
            class="reveal group inline-flex items-center gap-8 pb-2 border-b-[1.5px] border-misana-paper text-base sm:text-lg tracking-wide"
            data-delay="5"
          >
            <span>{{ t('destinations.heroCta') }}</span>
          </NuxtLink>
        </div>
      </div>
    </section>

    <!-- ============================================== -->
    <!-- 2. THE ARC : ruban geographique 8 villes        -->
    <!-- ============================================== -->
    <section class="bg-misana-paper">
      <div class="max-w-[1600px] mx-auto px-6 sm:px-12 py-20 sm:py-28">
        <div class="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6 mb-14 sm:mb-20">
          <div>
            <p class="text-[11px] uppercase tracking-[0.25em] text-misana-muted mb-4">
              (MS · 01) · {{ t('destinations.arcKicker') }}
            </p>
            <h2 class="font-display text-4xl sm:text-5xl lg:text-6xl leading-[1.05] m-0">
              {{ t('destinations.arcTitle') }}
            </h2>
          </div>
          <p class="text-[11px] uppercase tracking-[0.25em] text-misana-muted">
            Saint-Tropez <span class="mx-2 opacity-50">·</span> Menton
          </p>
        </div>

        <!-- Ruban : ligne hairline + 8 marqueurs ordonnes W -> E -->
        <ol class="arc-ribbon">
          <li
            v-for="(ct, idx) in orderedCities"
            :key="ct.slug"
            class="arc-marker"
            :class="ct.tier === 'heavy' ? 'arc-marker-heavy' : 'arc-marker-stub'"
          >
            <NuxtLink :to="localePath(`/destinations/${ct.slug}`)" class="arc-link group">
              <span class="arc-num">{{ String(idx + 1).padStart(2, '0') }}</span>
              <span class="arc-dot" aria-hidden="true"></span>
              <span class="arc-name">{{ locale === 'fr' ? ct.fr : ct.en }}</span>
              <span class="arc-coord">{{ COORDS[ct.slug]?.lat }}</span>
            </NuxtLink>
          </li>
        </ol>
      </div>
    </section>

    <!-- ============================================== -->
    <!-- 3. HELD HEAVY : 4 chapitres alternes            -->
    <!-- ============================================== -->
    <section class="bg-misana-paper">
      <div class="max-w-[1600px] mx-auto px-6 sm:px-12 pt-8 sm:pt-12 pb-20 sm:pb-28">
        <!-- Header section -->
        <div class="text-center mb-16 sm:mb-24">
          <p class="text-[11px] uppercase tracking-[0.25em] text-misana-muted mb-4">
            (MS · 02) · {{ t('destinations.heavyKicker') }}
          </p>
          <h2 class="font-display text-4xl sm:text-5xl lg:text-6xl leading-[1.05]">
            {{ t('destinations.heavyTitle') }}
          </h2>
        </div>

        <!-- Chapitres : alternance gauche/droite, hairline divider entre -->
        <div class="space-y-20 sm:space-y-32">
          <article
            v-for="(ct, idx) in heavyOrdered"
            :key="ct.slug"
            class="chapter"
            :class="idx % 2 === 0 ? 'chapter-image-left' : 'chapter-image-right'"
          >
            <div class="chapter-image">
              <img
                :src="CITY_IMAGES[ct.slug]"
                :alt="locale === 'fr' ? ct.fr : ct.en"
                loading="lazy"
              />
              <span class="chapter-plate">
                <span class="chapter-plate-num">{{ numIn(ct.slug, heavyOrdered) }} / {{ String(heavyOrdered.length).padStart(2, '0') }}</span>
                <span class="chapter-plate-label">{{ t('destinations.chapterLabel') }}</span>
              </span>
            </div>

            <div class="chapter-text">
              <p class="chapter-coords">{{ COORDS[ct.slug]?.lat }} <span class="opacity-50 mx-1">·</span> {{ COORDS[ct.slug]?.lon }}</p>
              <h3 class="chapter-name">{{ locale === 'fr' ? ct.fr : ct.en }}</h3>
              <p class="chapter-body">{{ heavyBody(ct.slug) }}</p>
              <span class="chapter-rule"></span>
              <ul class="chapter-tags">
                <li v-for="tag in heavyTags(ct.slug)" :key="tag">{{ tag }}</li>
              </ul>
              <NuxtLink
                :to="localePath(`/destinations/${ct.slug}`)"
                class="chapter-link group"
              >
                <span class="border-b border-misana-ink pb-0.5">{{ t('destinations.discover') }} {{ locale === 'fr' ? ct.fr : ct.en }}</span>
              </NuxtLink>
            </div>
          </article>
        </div>
      </div>
    </section>

    <!-- ============================================== -->
    <!-- 4. HELD LIGHTER : grille 4-col compact           -->
    <!-- ============================================== -->
    <section class="bg-misana-ink text-misana-paper">
      <div class="max-w-[1600px] mx-auto px-6 sm:px-12 py-20 sm:py-28">
        <div class="text-center mb-14 sm:mb-20">
          <p class="text-[11px] uppercase tracking-[0.25em] text-misana-paper/60 mb-4">
            (MS · 03) · {{ t('destinations.stubKicker') }}
          </p>
          <h2 class="font-display text-4xl sm:text-5xl lg:text-6xl leading-[1.05]">
            {{ t('destinations.stubTitle') }}
          </h2>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-7">
          <NuxtLink
            v-for="ct in stubOrdered"
            :key="ct.slug"
            :to="localePath(`/destinations/${ct.slug}`)"
            class="stub-card group"
          >
            <img
              :src="CITY_IMAGES[ct.slug]"
              :alt="locale === 'fr' ? ct.fr : ct.en"
              loading="lazy"
              class="stub-img"
            />
            <span class="stub-grad"></span>

            <span class="stub-num">{{ numIn(ct.slug, orderedCities) }}</span>

            <div class="stub-caption">
              <p class="stub-coord">{{ COORDS[ct.slug]?.lat }}</p>
              <span class="stub-rule"></span>
              <h3 class="stub-name">{{ locale === 'fr' ? ct.fr : ct.en }}</h3>
              <p class="stub-blurb">{{ locale === 'fr' ? ct.blurbFr : ct.blurbEn }}</p>
            </div>
          </NuxtLink>
        </div>
      </div>
    </section>

    <!-- ============================================== -->
    <!-- SEO CONTEXT (long-form + maillage interne)       -->
    <!-- ============================================== -->
    <section class="bg-misana-paper">
      <div class="max-w-[1600px] mx-auto px-6 sm:px-12 py-16 sm:py-20">
        <p class="text-[11px] uppercase tracking-[0.25em] text-misana-muted mb-5">(MS · 04) · {{ t('destinations.seo.kicker') }}</p>
        <h2 class="font-display text-3xl sm:text-4xl lg:text-5xl leading-[1.1] mb-8 sm:mb-10">{{ t('destinations.seo.title') }}</h2>
        <div class="seo-prose">
          <i18n-t keypath="destinations.seo.p1" tag="p" scope="global">
            <template #saintTropez><NuxtLink :to="localePath('/destinations/saint-tropez')">Saint-Tropez</NuxtLink></template>
            <template #menton><NuxtLink :to="localePath('/destinations/menton')">Menton</NuxtLink></template>
            <template #cannes><NuxtLink :to="localePath('/destinations/cannes')">Cannes</NuxtLink></template>
            <template #monaco><NuxtLink :to="localePath('/destinations/monaco')">Monaco</NuxtLink></template>
            <template #nice><NuxtLink :to="localePath('/destinations/nice')">Nice</NuxtLink></template>
            <template #capFerrat><NuxtLink :to="localePath('/destinations/cap-ferrat')">Cap-Ferrat</NuxtLink></template>
            <template #eze><NuxtLink :to="localePath('/destinations/eze')">Èze</NuxtLink></template>
            <template #capDAntibes><NuxtLink :to="localePath('/destinations/cap-d-antibes')">Cap-d'Antibes</NuxtLink></template>
          </i18n-t>
          <i18n-t keypath="destinations.seo.p2" tag="p" scope="global">
            <template #capDAntibes><NuxtLink :to="localePath('/destinations/cap-d-antibes')">Cap-d'Antibes</NuxtLink></template>
            <template #capFerrat><NuxtLink :to="localePath('/destinations/cap-ferrat')">Cap-Ferrat</NuxtLink></template>
            <template #eze><NuxtLink :to="localePath('/destinations/eze')">Èze</NuxtLink></template>
          </i18n-t>
          <i18n-t keypath="destinations.seo.p3" tag="p" scope="global">
            <template #chauffeur><NuxtLink :to="localePath({ name: 'chauffeur' })">{{ locale === 'fr' ? 'chauffeur' : 'driver' }}</NuxtLink></template>
            <template #cars><NuxtLink :to="localePath({ name: 'voitures' })">{{ locale === 'fr' ? 'voiture' : 'car' }}</NuxtLink></template>
            <template #helicopter><NuxtLink :to="localePath({ name: 'helicoptere' })">{{ locale === 'fr' ? 'hélicoptère' : 'helicopter' }}</NuxtLink></template>
            <template #yacht><NuxtLink :to="localePath({ name: 'yacht' })">yacht</NuxtLink></template>
            <template #transfers><NuxtLink :to="localePath('/transfers')">{{ locale === 'fr' ? 'transferts' : 'transfers' }}</NuxtLink></template>
          </i18n-t>
          <i18n-t keypath="destinations.seo.p4" tag="p" scope="global">
            <template #festival><NuxtLink :to="localePath({ name: 'events-event', params: { event: 'festival-de-cannes' } })">{{ locale === 'fr' ? 'Festival de Cannes' : 'Cannes Film Festival' }}</NuxtLink></template>
            <template #grandPrix><NuxtLink :to="localePath({ name: 'events-event', params: { event: 'grand-prix-monaco' } })">{{ locale === 'fr' ? 'Grand Prix de Monaco' : 'Monaco Grand Prix' }}</NuxtLink></template>
            <template #events><NuxtLink :to="localePath({ name: 'events' })">{{ locale === 'fr' ? 'événements' : 'events' }}</NuxtLink></template>
            <template #access><NuxtLink :to="localePath({ name: 'reservations' })">Access</NuxtLink></template>
            <template #request><NuxtLink :to="localePath('/request')">{{ locale === 'fr' ? 'formulaire de demande' : 'request form' }}</NuxtLink></template>
          </i18n-t>
        </div>
      </div>
    </section>
  </main>
</template>

<style scoped>
/* === Hero (pattern services) === */
.dest-hero-bg {
  transform: scale(1.06);
  transition: transform 8s ease-out;
}
[data-revealed="true"] .dest-hero-bg { transform: scale(1); }

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

/* === The arc : hairline horizontale + 8 marqueurs === */
.arc-ribbon {
  position: relative;
  list-style: none;
  margin: 0;
  padding: 4rem 0 4rem;
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  gap: 0;
}
.arc-ribbon::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  height: 1px;
  background: var(--color-misana-line);
}

.arc-marker { position: relative; min-width: 0; }
.arc-link {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 0 0.5rem;
  position: relative;
  height: 100%;
  text-decoration: none;
  color: inherit;
}

.arc-num {
  font-family: var(--font-display, serif);
  font-style: italic;
  font-size: 0.7rem;
  letter-spacing: 0.1em;
  color: var(--color-misana-muted);
  margin-bottom: 0.6rem;
}

.arc-dot {
  width: 9px;
  height: 9px;
  border-radius: 50%;
  background: var(--color-misana-ink);
  margin: 0;
  transition: transform 0.5s cubic-bezier(0.16, 1, 0.3, 1);
}
.arc-marker-stub .arc-dot {
  background: transparent;
  border: 1px solid var(--color-misana-ink);
}
.arc-link:hover .arc-dot { transform: scale(1.6); }

.arc-name {
  font-family: var(--font-display, serif);
  font-size: 0.95rem;
  letter-spacing: 0.02em;
  color: var(--color-misana-ink);
  margin-top: 0.85rem;
  white-space: nowrap;
  transition: opacity 0.4s ease;
}
.arc-marker-stub .arc-name { opacity: 0.65; }
.arc-link:hover .arc-name { opacity: 1; }

.arc-coord {
  font-family: var(--font-mono, ui-monospace, SFMono-Regular, monospace);
  font-style: italic;
  font-size: 0.65rem;
  letter-spacing: 0.05em;
  color: var(--color-misana-muted);
  margin-top: 0.35rem;
}

@media (max-width: 1023px) {
  .arc-ribbon {
    grid-template-columns: repeat(4, 1fr);
    gap: 1.5rem 0;
    padding: 2rem 0;
  }
  .arc-ribbon::before { display: none; }
  .arc-name { font-size: 0.85rem; }
}
@media (max-width: 639px) {
  .arc-ribbon { grid-template-columns: repeat(2, 1fr); }
}

/* === Held heavy chapters === */
.chapter {
  display: grid;
  grid-template-columns: 1fr;
  gap: 2.5rem;
  align-items: center;
}
@media (min-width: 1024px) {
  .chapter {
    grid-template-columns: minmax(0, 5fr) minmax(0, 6fr);
    gap: 5rem;
  }
  .chapter-image-right .chapter-image { order: 2; }
  .chapter-image-right .chapter-text { order: 1; padding-left: 0; padding-right: 2rem; }
  .chapter-image-left .chapter-text { padding-left: 2rem; }
}

.chapter-image {
  position: relative;
  aspect-ratio: 4 / 5;
  overflow: hidden;
  background: var(--color-misana-stone);
  border-radius: 4px;
}
.chapter-image img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transform: scale(1);
  transition: transform 1.4s cubic-bezier(0.16, 1, 0.3, 1);
}
.chapter:hover .chapter-image img { transform: scale(1.04); }

.chapter-plate {
  position: absolute;
  top: 1.5rem;
  left: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
  color: var(--color-misana-paper);
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.4);
}
.chapter-plate-num {
  font-family: var(--font-display, serif);
  font-style: italic;
  font-size: 1rem;
  letter-spacing: 0.05em;
}
.chapter-plate-label {
  font-size: 0.6rem;
  letter-spacing: 0.3em;
  text-transform: uppercase;
  opacity: 0.85;
}

.chapter-text { display: flex; flex-direction: column; }

.chapter-coords {
  font-family: var(--font-mono, ui-monospace, SFMono-Regular, monospace);
  font-style: italic;
  font-size: 0.78rem;
  letter-spacing: 0.05em;
  color: var(--color-misana-muted);
  margin: 0 0 1.25rem;
}

.chapter-name {
  font-family: var(--font-display, serif);
  font-size: clamp(3.5rem, 8vw, 7rem);
  line-height: 0.95;
  letter-spacing: -0.01em;
  margin: 0 0 1.75rem;
  color: var(--color-misana-ink);
}

.chapter-body {
  font-size: 1.05rem;
  line-height: 1.65;
  color: var(--color-misana-muted);
  margin: 0 0 1.75rem;
  max-width: 38ch;
}

.chapter-rule {
  display: block;
  width: 48px;
  height: 1px;
  background: var(--color-misana-ink);
  margin-bottom: 1.5rem;
}

.chapter-tags {
  list-style: none;
  margin: 0 0 2rem;
  padding: 0;
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem 1rem;
}
.chapter-tags li {
  font-size: 0.7rem;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--color-misana-muted);
}
.chapter-tags li::after {
  content: '·';
  margin-left: 1rem;
  opacity: 0.5;
}
.chapter-tags li:last-child::after { content: ''; margin: 0; }

.chapter-link {
  display: inline-flex;
  align-items: center;
  gap: 0.75rem;
  color: var(--color-misana-ink);
  font-size: 1rem;
  text-decoration: none;
  align-self: flex-start;
}

/* === Held lighter (stub cards) === */
.stub-card {
  position: relative;
  display: block;
  aspect-ratio: 1 / 1;
  border-radius: 4px;
  overflow: hidden;
  background: #1a1a1a;
  isolation: isolate;
}
.stub-img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transform: scale(1);
  transition: transform 1.4s cubic-bezier(0.16, 1, 0.3, 1);
}
.stub-card:hover .stub-img { transform: scale(1.045); }

.stub-grad {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    to top,
    rgba(7, 7, 7, 0.85) 0%,
    rgba(7, 7, 7, 0.5) 35%,
    rgba(7, 7, 7, 0.15) 65%,
    rgba(7, 7, 7, 0) 100%
  );
  pointer-events: none;
}

.stub-num {
  position: absolute;
  top: 1.1rem;
  left: 1.1rem;
  font-family: var(--font-display, serif);
  font-style: italic;
  font-size: 0.75rem;
  letter-spacing: 0.05em;
  color: rgba(255, 255, 255, 0.7);
  z-index: 2;
}

.stub-caption {
  position: absolute;
  inset: auto 0 0 0;
  padding: 1.25rem 1.25rem 1.4rem;
  z-index: 2;
}

.stub-coord {
  font-family: var(--font-mono, ui-monospace, SFMono-Regular, monospace);
  font-style: italic;
  font-size: 0.65rem;
  letter-spacing: 0.05em;
  color: rgba(255, 255, 255, 0.7);
  margin: 0;
}

.stub-rule {
  display: block;
  width: 22px;
  height: 1px;
  background: rgba(255, 255, 255, 0.5);
  margin: 0.55rem 0 0.6rem;
  transition: width 0.7s cubic-bezier(0.16, 1, 0.3, 1);
}
.stub-card:hover .stub-rule { width: 44px; }

.stub-name {
  font-family: var(--font-display, serif);
  font-size: 1.35rem;
  line-height: 1.05;
  margin: 0;
  color: var(--color-misana-paper);
}

.stub-blurb {
  font-size: 0.72rem;
  line-height: 1.45;
  color: rgba(255, 255, 255, 0.72);
  margin: 0.55rem 0 0;
  max-width: 26ch;
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
  .reveal, .reveal-line, .dest-hero-bg, .chapter-image img,
  .stub-img, .stub-rule, .arc-dot {
    transition: none !important;
    transform: none !important;
    opacity: 1 !important;
  }
}
</style>
