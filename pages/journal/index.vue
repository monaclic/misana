<script setup lang="ts">
definePageMeta({ layout: 'default' });
const { t } = useI18n();

useSeoMeta({
  title: () => `${t('journal.title')} · Misana`,
  description: () => t('journal.metaDescription'),
});
</script>

<template>
  <main class="min-h-screen">
    <section class="bg-misana-stone border-b border-misana-line">
      <div class="max-w-3xl mx-auto px-6 py-20">
        <p class="text-xs uppercase tracking-widest text-misana-muted mb-4">{{ t('journal.kicker') }}</p>
        <h1 class="font-display text-4xl sm:text-5xl mb-6">{{ t('journal.title') }}</h1>
        <p class="text-misana-muted text-lg leading-relaxed">{{ t('journal.lead') }}</p>
      </div>
    </section>

    <section class="max-w-3xl mx-auto px-6 py-20 text-center">
      <p class="text-misana-muted">{{ t('journal.comingSoon') }}</p>
    </section>
  </main>
</template>
