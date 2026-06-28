<script setup lang="ts">
import { CAREERS } from '~/lib/careers';

definePageMeta({ layout: 'default' });
defineI18nRoute({
  paths: { en: '/careers', fr: '/carrieres' },
});

const { locale } = useI18n();
const localePath = useLocalePath();
const isFr = computed(() => locale.value === 'fr');

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
  <main class="w-full">

    <!-- Hero -->
    <section class="w-full border-b border-misana-line py-24 sm:py-32">
      <div class="max-w-[1600px] mx-auto px-6 sm:px-12">
        <p class="text-[0.65rem] uppercase tracking-[0.25em] text-misana-muted mb-7">
          {{ isFr ? 'La maison' : 'The house' }}
        </p>
        <h1 class="font-display text-[clamp(2.8rem,6vw,5rem)] leading-[1.05] mb-10 max-w-[18ch]">
          {{ isFr ? 'Rejoindre Misana.' : 'Join Misana.' }}
        </h1>
        <div class="flex flex-col gap-4 max-w-2xl">
          <p v-if="!isFr" class="text-base leading-[1.8] text-misana-muted">
            Misana Group operates luxury private services on the French Riviera, from Saint-Tropez to Monaco. Our offer covers private chauffeur, helicopter transfers, yacht charter, prestige car rental and venue access.
          </p>
          <p v-if="!isFr" class="text-base leading-[1.8] text-misana-muted">
            We are a small team working directly with clients and partners across the corridor. The roles we open are operational, with direct reporting lines and no corporate layers.
          </p>
          <p v-if="isFr" class="text-base leading-[1.8] text-misana-muted">
            Misana Group opère des services privés haut de gamme sur la Côte d'Azur, de Saint-Tropez à Monaco. Notre offre couvre le chauffeur privé, les transferts hélicoptère, la location de yacht, la location de voitures de prestige et l'accès aux meilleures adresses.
          </p>
          <p v-if="isFr" class="text-base leading-[1.8] text-misana-muted">
            Nous sommes une équipe réduite travaillant directement avec les clients et les partenaires sur le corridor. Les postes que nous ouvrons sont opérationnels, avec des lignes hiérarchiques directes et sans strates intermédiaires.
          </p>
        </div>
      </div>
    </section>

    <!-- Offres -->
    <section class="w-full py-20">
      <div class="max-w-[1600px] mx-auto px-6 sm:px-12">
        <p class="text-[0.65rem] uppercase tracking-[0.25em] text-misana-muted mb-8">
          {{ CAREERS.length }} {{ isFr ? 'postes ouverts' : 'open roles' }}
        </p>
        <div class="flex flex-col gap-5">
          <CareerCard
            v-for="job in CAREERS"
            :key="job.slug"
            :job="job"
          />
        </div>
      </div>
    </section>

    <!-- Note de fin -->
    <section class="w-full border-t border-misana-line py-12 sm:py-16">
      <div class="max-w-[1600px] mx-auto px-6 sm:px-12">
        <p class="text-sm leading-[1.7] text-misana-muted max-w-2xl">
          <template v-if="!isFr">
            We do not work with agencies or recruiters for these roles. Applications are reviewed directly by the founding team. If no role matches today, you are welcome to write to us at
            <a href="mailto:contact@misana-group.com" class="text-misana-ink underline underline-offset-2 decoration-misana-line hover:decoration-misana-ink transition-colors">contact@misana-group.com</a>
            with the relevant context.
          </template>
          <template v-else>
            Nous ne travaillons pas avec des agences ou des recruteurs pour ces postes. Les candidatures sont examinées directement par l'équipe fondatrice. Si aucun poste ne correspond aujourd'hui, vous pouvez nous écrire à
            <a href="mailto:contact@misana-group.com" class="text-misana-ink underline underline-offset-2 decoration-misana-line hover:decoration-misana-ink transition-colors">contact@misana-group.com</a>
            avec le contexte pertinent.
          </template>
        </p>
      </div>
    </section>

  </main>
</template>
