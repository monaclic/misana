<script setup lang="ts">
import type { JobOffer } from '~/lib/careers';

const props = defineProps<{
  job: JobOffer;
}>();

const { locale } = useI18n();
const localePath = useLocalePath();

const content = computed(() => (locale.value === 'fr' ? props.job.fr : props.job.en));
const location = computed(() =>
  locale.value === 'fr' ? props.job.locationFR : props.job.locationEN,
);

const contractLabel = computed(() => {
  const map: Record<string, { en: string; fr: string }> = {
    FULL_TIME: { en: 'Full time', fr: 'Temps plein' },
    PART_TIME: { en: 'Work-study', fr: 'Alternance' },
    CONTRACTOR: { en: 'Independent partner', fr: 'Partenaire indépendant' },
  };
  const entry = map[props.job.employmentType];
  return entry ? (locale.value === 'fr' ? entry.fr : entry.en) : props.job.employmentType;
});
</script>

<template>
  <NuxtLink
    :to="localePath({ name: 'careers-slug', params: { slug: job.slug } })"
    class="career-card group"
  >
    <div class="career-card-meta">
      <span class="career-card-contract">{{ contractLabel }}</span>
      <span class="career-card-sep" aria-hidden="true">·</span>
      <span class="career-card-location">{{ location }}</span>
    </div>

    <h2 class="career-card-title">{{ content.title }}</h2>
    <p class="career-card-intro">{{ content.intro }}</p>

    <span class="career-card-cta">
      <span>{{ locale === 'fr' ? 'Voir le poste' : 'View role' }}</span>
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" class="career-card-arrow">
        <path d="M7 12H17" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" />
        <path d="M13.5 8.5L17 12L13.5 15.5" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" />
      </svg>
    </span>
  </NuxtLink>
</template>

<style scoped>
.career-card {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 2rem 1.75rem;
  border: 1px solid var(--color-misana-line);
  border-radius: 4px;
  text-decoration: none;
  color: var(--color-misana-ink);
  background: var(--color-misana-paper);
  transition: border-color 0.35s ease, transform 0.35s ease;
}
.career-card:hover {
  border-color: var(--color-misana-ink);
  transform: translateY(-2px);
}

.career-card-meta {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.65rem;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: var(--color-misana-muted);
}
.career-card-sep { opacity: 0.5; }

.career-card-title {
  font-family: var(--font-display);
  font-size: clamp(1.4rem, 2.5vw, 1.9rem);
  line-height: 1.1;
  margin: 0;
  color: var(--color-misana-ink);
}

.career-card-intro {
  font-size: 0.95rem;
  line-height: 1.7;
  color: var(--color-misana-muted);
  margin: 0;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.career-card-cta {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: auto;
  padding-top: 1.25rem;
  border-top: 1px solid var(--color-misana-line);
  font-size: 0.72rem;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--color-misana-muted);
  transition: color 0.3s ease;
}
.career-card:hover .career-card-cta { color: var(--color-misana-ink); }

.career-card-arrow {
  width: 1rem;
  height: 1rem;
  transition: transform 0.4s ease;
}
.career-card:hover .career-card-arrow { transform: translateX(3px); }

@media (prefers-reduced-motion: reduce) {
  .career-card,
  .career-card-arrow { transition: none !important; transform: none !important; }
}
</style>
