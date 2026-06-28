<script setup lang="ts">
import { CAREERS, findCareer } from '~/lib/careers';

definePageMeta({ layout: 'default' });
defineI18nRoute({
  paths: { en: '/careers/[slug]', fr: '/carrieres/[slug]' },
});

const route  = useRoute();
const { locale } = useI18n();
const localePath = useLocalePath();
const isFr   = computed(() => locale.value === 'fr');

const slug = String(route.params.slug);
const job  = findCareer(slug);

if (!job) {
  throw createError({ statusCode: 404, statusMessage: 'Job offer not found', fatal: true });
}

const content  = computed(() => (isFr.value ? job.fr : job.en));
const location = computed(() => (isFr.value ? job.locationFR : job.locationEN));

const contractLabel = computed(() => {
  const map: Record<string, { en: string; fr: string }> = {
    FULL_TIME:  { en: 'Full time - CDI', fr: 'Temps plein - CDI' },
    PART_TIME:  { en: 'Work-study - alternance', fr: 'Alternance' },
    CONTRACTOR: { en: 'Independent partner', fr: 'Partenaire indépendant' },
  };
  const entry = map[job.employmentType];
  return entry ? (isFr.value ? entry.fr : entry.en) : job.employmentType;
});

const ldJson = computed(() => {
  const c = content.value;
  const base: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'JobPosting',
    title: c.title,
    description: c.intro,
    datePosted: job.datePosted,
    validThrough: job.validThrough,
    employmentType: job.employmentType,
    hiringOrganization: {
      '@type': 'Organization',
      name: job.hiringOrganization.name,
      url: job.hiringOrganization.url,
      logo: job.hiringOrganization.logo,
    },
    jobLocation: {
      '@type': 'Place',
      address: {
        '@type': 'PostalAddress',
        addressCountry: 'FR',
        addressRegion: "Alpes-Maritimes / Var - Côte d'Azur",
      },
    },
    applicantLocationRequirements: { '@type': 'Country', name: 'France' },
    url: isFr.value
      ? `https://misana-group.com/fr/carrieres/${job.slug}`
      : `https://misana-group.com/en/careers/${job.slug}`,
  };
  if (job.baseSalary) {
    base.baseSalary = {
      '@type': 'MonetaryAmount',
      currency: job.baseSalary.currency,
      value: {
        '@type': 'QuantitativeValue',
        minValue: job.baseSalary.minValue,
        maxValue: job.baseSalary.maxValue,
        unitText: job.baseSalary.unitText,
      },
    };
  }
  return JSON.stringify(base);
});

useHead({
  script: [{ type: 'application/ld+json', innerHTML: () => ldJson.value }],
});

useSeoMeta({
  title:         () => content.value.seoTitle,
  description:   () => content.value.metaDescription,
  ogTitle:       () => content.value.seoTitle,
  ogDescription: () => content.value.metaDescription,
  ogImage:       'https://misana-group.com/og-default.jpg',
});

const labels = computed(() => isFr.value
  ? {
      aboutRole:    'Le poste',
      expectations: 'Ce que nous attendons',
      offer:        'Ce que nous offrons',
      aboutCompany: 'Misana Group',
    }
  : {
      aboutRole:    'About the role',
      expectations: 'What we expect',
      offer:        'What we offer',
      aboutCompany: 'About Misana Group',
    });
</script>

<template>
  <main class="w-full">

    <!-- Hero -->
    <section class="w-full border-b border-misana-line py-20 sm:py-28">
      <div class="max-w-[1600px] mx-auto px-6 sm:px-12">

        <nav class="flex items-center gap-2 mb-8 text-[0.72rem] tracking-wide text-misana-muted" aria-label="Breadcrumb">
          <NuxtLink :to="localePath({ name: 'careers' })" class="hover:text-misana-ink transition-colors">
            {{ isFr ? 'Carrières' : 'Careers' }}
          </NuxtLink>
          <span class="opacity-40">›</span>
          <span class="text-misana-ink">{{ content.title }}</span>
        </nav>

        <div class="flex items-center gap-2 mb-5">
          <span class="text-[0.63rem] uppercase tracking-[0.2em] text-misana-muted">{{ contractLabel }}</span>
          <span class="opacity-40 text-[0.63rem]">·</span>
          <span class="text-[0.63rem] uppercase tracking-[0.2em] text-misana-muted">{{ location }}</span>
        </div>

        <h1 class="font-display text-[clamp(2rem,5vw,3.8rem)] leading-[1.08] mb-6 max-w-[22ch]">
          {{ content.title }}
        </h1>
        <p class="text-base leading-[1.75] text-misana-muted max-w-2xl">
          {{ content.intro }}
        </p>
      </div>
    </section>

    <!-- Contenu -->
    <section class="w-full py-16 sm:py-20">
      <div class="max-w-[1600px] mx-auto px-6 sm:px-12">
        <div class="flex flex-col gap-12">

          <!-- About the role -->
          <div class="flex flex-col gap-5">
            <h2 class="font-display text-[clamp(1.3rem,2.5vw,1.75rem)] leading-[1.15] pb-4 border-b border-misana-line">
              {{ labels.aboutRole }}
            </h2>
            <div class="flex flex-col gap-4">
              <p v-for="(para, i) in content.aboutRole" :key="i" class="text-base leading-[1.8] text-misana-muted">
                {{ para }}
              </p>
            </div>
          </div>

          <!-- What we expect -->
          <div class="flex flex-col gap-5">
            <h2 class="font-display text-[clamp(1.3rem,2.5vw,1.75rem)] leading-[1.15] pb-4 border-b border-misana-line">
              {{ labels.expectations }}
            </h2>
            <ul class="flex flex-col gap-3">
              <li v-for="(item, i) in content.expectations" :key="i" class="flex items-baseline gap-3 text-[0.95rem] leading-[1.6] text-misana-muted">
                <span class="shrink-0 w-1 h-1 rounded-full bg-misana-muted mt-[0.55em]"></span>
                {{ item }}
              </li>
            </ul>
          </div>

          <!-- What we offer -->
          <div class="flex flex-col gap-5">
            <h2 class="font-display text-[clamp(1.3rem,2.5vw,1.75rem)] leading-[1.15] pb-4 border-b border-misana-line">
              {{ labels.offer }}
            </h2>
            <ul class="flex flex-col gap-3">
              <li v-for="(item, i) in content.offer" :key="i" class="flex items-baseline gap-3 text-[0.95rem] leading-[1.6] text-misana-muted">
                <span class="shrink-0 w-1 h-1 rounded-full bg-misana-muted mt-[0.55em]"></span>
                {{ item }}
              </li>
            </ul>
          </div>

          <!-- About Misana -->
          <div class="flex flex-col gap-5">
            <h2 class="font-display text-[clamp(1.3rem,2.5vw,1.75rem)] leading-[1.15] pb-4 border-b border-misana-line">
              {{ labels.aboutCompany }}
            </h2>
            <p class="text-base leading-[1.8] text-misana-muted">{{ content.aboutCompany }}</p>
          </div>

          <!-- Liens internes -->
          <div class="flex flex-col gap-5 pt-4 border-t border-misana-line">
            <p class="text-[0.8rem] italic text-misana-muted">{{ content.serviceNote }}</p>
            <ul class="flex flex-col border-t border-misana-line">
              <li v-for="link in content.internalLinks" :key="link.path">
                <NuxtLink
                  :to="localePath(link.path)"
                  class="flex items-center justify-between gap-4 py-3.5 px-1 border-b border-misana-line text-[0.9rem] text-misana-ink no-underline hover:px-3 hover:bg-misana-stone transition-all duration-300"
                >
                  <span>{{ link.label }}</span>
                  <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" class="w-4 h-4 shrink-0 text-misana-muted">
                    <path d="M7 12H17" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" />
                    <path d="M13.5 8.5L17 12L13.5 15.5" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" />
                  </svg>
                </NuxtLink>
              </li>
            </ul>
          </div>

          <!-- Formulaire -->
          <div class="pt-4 border-t border-misana-line">
            <ApplyForm :job-slug="job.slug" :job-title="content.title" />
          </div>

        </div>
      </div>
    </section>

  </main>
</template>
