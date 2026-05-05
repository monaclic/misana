<script setup lang="ts">
definePageMeta({ layout: 'default' });
defineI18nRoute({
  paths: { en: '/request/thanks', fr: '/demande/merci' },
});

const { t } = useI18n();
const localePath = useLocalePath();

useSeoMeta({
  title: () => t('request.thanks.title'),
  description: () => t('request.thanks.body'),
});
</script>

<template>
  <main class="min-h-screen flex items-center justify-center px-6 py-24">
    <div class="success-pill" role="status" aria-live="polite">
      <div class="success-icon">
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M5 13l4 4L19 7" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
      </div>
      <p class="success-kicker">{{ t('request.thanks.kicker') }}</p>
      <h1 class="success-title">{{ t('request.thanks.title') }}</h1>
      <p class="success-body">{{ t('request.thanks.body') }}</p>
      <NuxtLink
        :to="localePath('/')"
        class="success-cta"
      >
        {{ t('request.thanks.back') }}
      </NuxtLink>
    </div>
  </main>
</template>

<style scoped>
.success-pill {
  background: #ecfdf5;
  border: 1px solid #a7f3d0;
  border-radius: 4px;
  padding: 2.5rem 1.5rem;
  text-align: center;
  width: 100%;
  max-width: 36rem;
  animation: success-pill-in 0.5s cubic-bezier(0.16, 1, 0.3, 1) both;
}
@media (min-width: 640px) {
  .success-pill { padding: 3rem 2.5rem; }
}
.success-icon {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: #10b981;
  margin: 0 auto 1.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ffffff;
  box-shadow: 0 4px 16px rgba(16, 185, 129, 0.25);
  animation: success-icon-in 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) 0.1s both;
}
.success-icon svg { width: 32px; height: 32px; }
.success-kicker {
  font-size: 11px;
  letter-spacing: 0.25em;
  text-transform: uppercase;
  color: #047857;
  margin: 0 0 0.6rem;
}
.success-title {
  font-family: var(--font-display);
  font-size: 1.85rem;
  line-height: 1.2;
  color: #064e3b;
  margin: 0 0 0.75rem;
}
@media (min-width: 640px) {
  .success-title { font-size: 2.25rem; }
}
.success-body {
  color: #065f46;
  font-size: 0.95rem;
  line-height: 1.6;
  max-width: 28rem;
  margin: 0 auto 1.5rem;
}
.success-cta {
  display: inline-block;
  background: #10b981;
  color: #ffffff;
  padding: 0.7rem 1.4rem;
  font-size: 0.85rem;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  text-decoration: none;
  border-radius: 2px;
  transition: background 0.2s ease;
}
.success-cta:hover { background: #059669; }
@keyframes success-pill-in {
  from { opacity: 0; transform: translateY(8px); }
  to   { opacity: 1; transform: translateY(0); }
}
@keyframes success-icon-in {
  from { opacity: 0; transform: scale(0.6); }
  to   { opacity: 1; transform: scale(1); }
}
@media (prefers-reduced-motion: reduce) {
  .success-pill, .success-icon { animation: none; }
}
</style>
