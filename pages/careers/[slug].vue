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

// Schema.org JobPosting
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
    applicantLocationRequirements: {
      '@type': 'Country',
      name: 'France',
    },
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
  title:          () => content.value.seoTitle,
  description:    () => content.value.metaDescription,
  ogTitle:        () => content.value.seoTitle,
  ogDescription:  () => content.value.metaDescription,
  ogImage:        'https://misana-group.com/og-default.jpg',
});

// Section labels bilingues
const labels = computed(() => isFr.value
  ? {
      aboutRole:    'Le poste',
      expectations: 'Ce que nous attendons',
      offer:        'Ce que nous offrons',
      aboutCompany: 'Misana Group',
      relatedLinks: 'Nos services correspondants',
    }
  : {
      aboutRole:    'About the role',
      expectations: 'What we expect',
      offer:        'What we offer',
      aboutCompany: 'About Misana Group',
      relatedLinks: 'Related services',
    });
</script>

<template>
  <main class="w-full">
    <!-- ============================================================ -->
    <!-- HEADER OFFRE                                                  -->
    <!-- ============================================================ -->
    <section class="cj-hero">
      <div class="cj-container">
        <nav class="cj-breadcrumb" aria-label="Breadcrumb">
          <NuxtLink :to="localePath({ name: 'careers' })" class="cj-breadcrumb-link">
            {{ isFr ? 'Carrières' : 'Careers' }}
          </NuxtLink>
          <span class="cj-breadcrumb-sep" aria-hidden="true">›</span>
          <span class="cj-breadcrumb-current">{{ content.title }}</span>
        </nav>

        <div class="cj-meta">
          <span class="cj-tag">{{ contractLabel }}</span>
          <span class="cj-tag-sep" aria-hidden="true">·</span>
          <span class="cj-tag">{{ location }}</span>
        </div>

        <h1 class="cj-h1">{{ content.title }}</h1>
        <p class="cj-intro">{{ content.intro }}</p>
      </div>
    </section>

    <!-- ============================================================ -->
    <!-- CONTENU + FORM                                                -->
    <!-- ============================================================ -->
    <div class="cj-body">
      <div class="cj-container">
        <div class="cj-layout">

          <!-- Colonne principale -->
          <article class="cj-article">

            <!-- About the role -->
            <section class="cj-section">
              <h2 class="cj-section-title">{{ labels.aboutRole }}</h2>
              <div class="cj-prose">
                <p v-for="(para, i) in content.aboutRole" :key="i">{{ para }}</p>
              </div>
            </section>

            <!-- What we expect -->
            <section class="cj-section">
              <h2 class="cj-section-title">{{ labels.expectations }}</h2>
              <ul class="cj-list">
                <li v-for="(item, i) in content.expectations" :key="i">{{ item }}</li>
              </ul>
            </section>

            <!-- What we offer -->
            <section class="cj-section">
              <h2 class="cj-section-title">{{ labels.offer }}</h2>
              <ul class="cj-list">
                <li v-for="(item, i) in content.offer" :key="i">{{ item }}</li>
              </ul>
            </section>

            <!-- About Misana Group -->
            <section class="cj-section">
              <h2 class="cj-section-title">{{ labels.aboutCompany }}</h2>
              <p class="cj-prose-single">{{ content.aboutCompany }}</p>
            </section>

            <!-- Maillage interne : liens services -->
            <section class="cj-section cj-links-section">
              <p class="cj-links-note">{{ content.serviceNote }}</p>
              <ul class="cj-links-list">
                <li v-for="link in content.internalLinks" :key="link.path">
                  <NuxtLink :to="localePath(link.path)" class="cj-link">
                    <span>{{ link.label }}</span>
                    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" class="cj-link-arrow">
                      <path d="M7 12H17" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" />
                      <path d="M13.5 8.5L17 12L13.5 15.5" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" />
                    </svg>
                  </NuxtLink>
                </li>
              </ul>
            </section>
          </article>

          <!-- Colonne formulaire (sticky desktop) -->
          <aside class="cj-aside">
            <div class="cj-aside-sticky">
              <ApplyForm :job-slug="job.slug" :job-title="content.title" />
            </div>
          </aside>

        </div>
      </div>
    </div>
  </main>
</template>

<style scoped>
/* Layout container */
.cj-container {
  max-width: 1600px;
  margin: 0 auto;
  padding: 0 1.5rem;
}
@media (min-width: 640px) {
  .cj-container { padding: 0 3rem; }
}

/* Hero */
.cj-hero {
  padding: 5rem 0 3.5rem;
  border-bottom: 1px solid var(--color-misana-line);
}
@media (min-width: 768px) {
  .cj-hero { padding: 7rem 0 4.5rem; }
}

/* Breadcrumb */
.cj-breadcrumb {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 2rem;
  font-size: 0.72rem;
  letter-spacing: 0.08em;
  color: var(--color-misana-muted);
}
.cj-breadcrumb-link {
  color: var(--color-misana-muted);
  text-decoration: none;
  transition: color 0.2s ease;
}
.cj-breadcrumb-link:hover { color: var(--color-misana-ink); }
.cj-breadcrumb-sep { opacity: 0.4; }
.cj-breadcrumb-current { color: var(--color-misana-ink); }

/* Meta chips */
.cj-meta {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1.25rem;
}
.cj-tag {
  font-size: 0.63rem;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: var(--color-misana-muted);
}
.cj-tag-sep { opacity: 0.4; font-size: 0.63rem; }

.cj-h1 {
  font-family: var(--font-display);
  font-size: clamp(2rem, 5vw, 3.8rem);
  line-height: 1.08;
  margin: 0 0 1.5rem;
  max-width: 22ch;
}

.cj-intro {
  font-size: 1rem;
  line-height: 1.75;
  color: var(--color-misana-muted);
  max-width: 64ch;
  margin: 0;
}

/* Body layout */
.cj-body {
  padding: 4rem 0 6rem;
}

.cj-layout {
  display: grid;
  grid-template-columns: 1fr;
  gap: 4rem;
  align-items: start;
}
@media (min-width: 1024px) {
  .cj-layout {
    grid-template-columns: minmax(0, 1fr) 420px;
    gap: 5rem;
  }
}

/* Article sections */
.cj-article {
  display: flex;
  flex-direction: column;
  gap: 3rem;
}

.cj-section { display: flex; flex-direction: column; gap: 1.25rem; }

.cj-section-title {
  font-family: var(--font-display);
  font-size: clamp(1.3rem, 2.5vw, 1.75rem);
  line-height: 1.15;
  margin: 0;
  padding-bottom: 1rem;
  border-bottom: 1px solid var(--color-misana-line);
}

/* Prose paragraphs */
.cj-prose {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
.cj-prose p,
.cj-prose-single {
  font-size: 1rem;
  line-height: 1.8;
  color: var(--color-misana-muted);
  margin: 0;
}

/* List */
.cj-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.7rem;
}
.cj-list li {
  display: flex;
  align-items: baseline;
  gap: 0.75rem;
  font-size: 0.95rem;
  line-height: 1.6;
  color: var(--color-misana-muted);
}
.cj-list li::before {
  content: '';
  flex-shrink: 0;
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: var(--color-misana-muted);
  margin-top: 0.55em;
}

/* Internal links */
.cj-links-section { border-top: 1px solid var(--color-misana-line); padding-top: 2rem; }
.cj-links-note {
  font-size: 0.8rem;
  letter-spacing: 0.05em;
  color: var(--color-misana-muted);
  margin: 0 0 1.25rem;
  font-style: italic;
}
.cj-links-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0;
  border-top: 1px solid var(--color-misana-line);
}
.cj-link {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 0.9rem 0.25rem;
  border-bottom: 1px solid var(--color-misana-line);
  text-decoration: none;
  color: var(--color-misana-ink);
  font-size: 0.9rem;
  transition: padding 0.3s ease;
}
.cj-link:hover { padding-left: 0.75rem; padding-right: 0.75rem; background: var(--color-misana-stone); }
.cj-link-arrow {
  width: 1rem;
  height: 1rem;
  flex-shrink: 0;
  color: var(--color-misana-muted);
  transition: transform 0.3s ease, color 0.3s ease;
}
.cj-link:hover .cj-link-arrow { transform: translateX(3px); color: var(--color-misana-ink); }

/* Aside sticky form */
.cj-aside { position: relative; }
@media (min-width: 1024px) {
  .cj-aside-sticky {
    position: sticky;
    top: 6rem;
  }
}

@media (prefers-reduced-motion: reduce) {
  .cj-link, .cj-link-arrow { transition: none !important; transform: none !important; }
}
</style>
