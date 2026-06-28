<script setup lang="ts">
import { CAREERS } from '~/lib/careers';

definePageMeta({ layout: 'default' });
defineI18nRoute({
  paths: { en: '/careers', fr: '/carrieres' },
});

const { locale } = useI18n();
const localePath = useLocalePath();
const isFr = computed(() => locale.value === 'fr');

// Schema.org ItemList
const ldJson = computed(() => JSON.stringify({
  '@context': 'https://schema.org',
  '@type': 'ItemList',
  name: isFr.value ? "Offres d'emploi - Misana" : 'Job openings - Misana',
  url: isFr.value
    ? 'https://misana-group.com/fr/carrieres'
    : 'https://misana-group.com/en/careers',
  numberOfItems: CAREERS.length,
  itemListElement: CAREERS.map((job, i) => ({
    '@type': 'ListItem',
    position: i + 1,
    url: isFr.value
      ? `https://misana-group.com/fr/carrieres/${job.slug}`
      : `https://misana-group.com/en/careers/${job.slug}`,
    name: isFr.value ? job.fr.title : job.en.title,
  })),
}));

useHead({
  script: [{ type: 'application/ld+json', innerHTML: () => ldJson.value }],
});

useSeoMeta({
  title: () => isFr.value
    ? "Carrières - Emploi Luxe Côte d'Azur | Misana Group"
    : 'Careers - Luxury Jobs French Riviera | Misana Group',
  description: () => isFr.value
    ? "Rejoignez Misana sur la Côte d'Azur. Chauffeur, développement commercial, marketing, conciergerie yacht. Postes ouverts à Nice, Cannes, Monaco."
    : 'Join Misana on the French Riviera. Chauffeur partner, business developer, SEO, yacht concierge. Roles based in Nice, Cannes, Monaco.',
  ogTitle: () => isFr.value
    ? "Carrières - Emploi Luxe Côte d'Azur | Misana"
    : 'Careers - Luxury Jobs French Riviera | Misana',
  ogDescription: () => isFr.value
    ? "Rejoignez Misana sur la Côte d'Azur. Chauffeur, développement commercial, marketing, conciergerie yacht."
    : 'Join Misana on the French Riviera. Chauffeur partner, business developer, SEO, yacht concierge.',
  ogImage: 'https://misana-group.com/og-default.jpg',
});
</script>

<template>
  <main>
    <!-- ============================================================ -->
    <!-- 1. HERO / INTRO                                               -->
    <!-- ============================================================ -->
    <section class="careers-hero">
      <div class="careers-container">
        <p class="careers-kicker">{{ isFr ? 'La maison' : 'The house' }}</p>

        <h1 class="careers-h1">
          {{ isFr ? 'Rejoindre Misana.' : 'Join Misana.' }}
        </h1>

        <div class="careers-intro-prose">
          <p v-if="!isFr">
            Misana Group operates luxury private services on the French Riviera, from Saint-Tropez to Monaco. Our offer covers private chauffeur, helicopter transfers, yacht charter, prestige car rental and venue access.
          </p>
          <p v-if="!isFr">
            We are a small team working directly with clients and partners across the corridor. The roles we open are operational, with direct reporting lines and no corporate layers.
          </p>
          <p v-if="isFr">
            Misana Group opère des services privés haut de gamme sur la Côte d'Azur, de Saint-Tropez à Monaco. Notre offre couvre le chauffeur privé, les transferts hélicoptère, la location de yacht, la location de voitures de prestige et l'accès aux meilleures adresses.
          </p>
          <p v-if="isFr">
            Nous sommes une équipe réduite travaillant directement avec les clients et les partenaires sur le corridor. Les postes que nous ouvrons sont opérationnels, avec des lignes hiérarchiques directes et sans strates intermédiaires.
          </p>
        </div>
      </div>
    </section>

    <!-- ============================================================ -->
    <!-- 2. OFFRES                                                     -->
    <!-- ============================================================ -->
    <section class="careers-listings">
      <div class="careers-container">
        <p class="careers-kicker">
          {{ CAREERS.length }} {{ isFr ? 'postes ouverts' : 'open roles' }}
        </p>

        <div class="careers-grid">
          <CareerCard
            v-for="job in CAREERS"
            :key="job.slug"
            :job="job"
          />
        </div>
      </div>
    </section>

    <!-- ============================================================ -->
    <!-- 3. NOTE DE FIN                                                -->
    <!-- ============================================================ -->
    <section class="careers-footer-note">
      <div class="careers-container">
        <p class="careers-footer-note-text">
          <template v-if="!isFr">
            We do not work with agencies or recruiters for these roles. Applications are reviewed directly by the founding team. If no role matches today, you are welcome to write to us at
            <a href="mailto:contact@misana-group.com" class="careers-mailto">contact@misana-group.com</a>
            with the relevant context.
          </template>
          <template v-else>
            Nous ne travaillons pas avec des agences ou des recruteurs pour ces postes. Les candidatures sont examinées directement par l'équipe fondatrice. Si aucun poste ne correspond aujourd'hui, vous pouvez nous écrire à
            <a href="mailto:contact@misana-group.com" class="careers-mailto">contact@misana-group.com</a>
            avec le contexte pertinent.
          </template>
        </p>
      </div>
    </section>
  </main>
</template>

<style scoped>
.careers-hero,
.careers-listings,
.careers-footer-note {
  display: block;
  width: 100%;
}

.careers-container {
  max-width: 1600px;
  margin: 0 auto;
  padding: 0 1.5rem;
}
@media (min-width: 640px) {
  .careers-container { padding: 0 3rem; }
}

/* Hero */
.careers-hero {
  padding: 6rem 0 4rem;
  border-bottom: 1px solid var(--color-misana-line);
}
@media (min-width: 768px) {
  .careers-hero { padding: 8rem 0 5rem; }
}

.careers-kicker {
  font-size: 0.65rem;
  letter-spacing: 0.25em;
  text-transform: uppercase;
  color: var(--color-misana-muted);
  margin: 0 0 1.75rem;
}

.careers-h1 {
  font-family: var(--font-display);
  font-size: clamp(2.8rem, 6vw, 5rem);
  line-height: 1.05;
  margin: 0 0 2.5rem;
  max-width: 18ch;
}

.careers-intro-prose {
  max-width: 68ch;
  display: flex;
  flex-direction: column;
  gap: 1.1rem;
}
.careers-intro-prose p {
  font-size: 1rem;
  line-height: 1.8;
  color: var(--color-misana-muted);
  margin: 0;
}

/* Listings */
.careers-listings {
  padding: 5rem 0;
}

.careers-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.25rem;
}
@media (min-width: 768px) {
  .careers-grid { grid-template-columns: repeat(2, 1fr); }
}

/* Footer note */
.careers-footer-note {
  padding: 3rem 0 5rem;
  border-top: 1px solid var(--color-misana-line);
}
.careers-footer-note-text {
  font-size: 0.88rem;
  line-height: 1.7;
  color: var(--color-misana-muted);
  max-width: 60ch;
  margin: 0;
}
.careers-mailto {
  color: var(--color-misana-ink);
  text-decoration: underline;
  text-underline-offset: 3px;
  text-decoration-color: var(--color-misana-line);
  transition: text-decoration-color 0.25s ease;
}
.careers-mailto:hover { text-decoration-color: var(--color-misana-ink); }
</style>
