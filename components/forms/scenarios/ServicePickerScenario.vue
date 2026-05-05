<script setup lang="ts">
// Service picker : affiche quand /request est ouvert sans aucun query
// param. Liste sobre des 5 services + 1 "multi". Chaque clic relance
// le composable scenario via navigation /request?service=xxx, qui
// rendra le scenario approprie au service choisi.
const localePath = useLocalePath();
const { t } = useI18n();

type ServiceKey = 'chauffeur' | 'cars' | 'yacht' | 'helicopter' | 'access' | 'multi';

const services: ServiceKey[] = ['chauffeur', 'cars', 'yacht', 'helicopter', 'access', 'multi'];

function linkFor(s: ServiceKey) {
  return localePath({ path: '/request', query: { service: s } });
}
</script>

<template>
  <fieldset class="scenario-block sp-block">
    <legend class="scenario-legend sp-legend">{{ t('request.picker.title') }}</legend>
    <p class="sp-lead">{{ t('request.picker.lead') }}</p>

    <ul class="sp-list">
      <li v-for="s in services" :key="s" class="sp-item">
        <NuxtLink :to="linkFor(s)" class="sp-link group">
          <div class="sp-text">
            <span class="sp-label">{{ t(`request.picker.services.${s}.label`) }}</span>
            <span class="sp-sub">{{ t(`request.picker.services.${s}.sub`) }}</span>
          </div>
          <span class="sp-arrow inline-flex items-center justify-center w-[1.1em] h-[1.1em] transition-transform duration-500 group-hover:translate-x-2">
            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" class="block w-full h-full">
              <path d="M7 12H17" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" />
              <path d="M13.5 8.5L17 12L13.5 15.5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          </span>
        </NuxtLink>
      </li>
    </ul>
  </fieldset>
</template>

<style scoped>
@import './_shared.css';

.sp-block { gap: 1.25rem; }
.sp-legend { font-size: 1.6rem; }
.sp-lead {
  color: var(--color-misana-muted);
  font-size: 0.95rem;
  line-height: 1.55;
  max-width: 38rem;
  margin: 0 0 0.5rem;
}
.sp-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  border-top: 1px solid var(--color-misana-line);
}
.sp-item {
  border-bottom: 1px solid var(--color-misana-line);
}
.sp-link {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 1.15rem 0.25rem;
  color: var(--color-misana-ink);
  text-decoration: none;
  transition: padding-left 0.35s ease, color 0.2s ease;
}
.sp-link:hover { padding-left: 0.6rem; }
.sp-text {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  min-width: 0;
}
.sp-label {
  font-family: var(--font-display);
  font-size: 1.5rem;
  line-height: 1.1;
}
.sp-sub {
  font-size: 0.85rem;
  color: var(--color-misana-muted);
  letter-spacing: 0.01em;
}
.sp-arrow { color: var(--color-misana-ink); flex-shrink: 0; }

@media (min-width: 640px) {
  .sp-link { padding: 1.4rem 0.25rem; }
  .sp-label { font-size: 1.75rem; }
}
</style>
