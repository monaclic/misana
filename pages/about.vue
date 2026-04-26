<script setup lang="ts">
definePageMeta({ layout: 'default' });
const { t } = useI18n();

useSeoMeta({
  title: () => `${t('about.title')} · Misana`,
  description: () => t('about.metaDescription'),
});
</script>

<template>
  <main class="min-h-screen">
    <section class="bg-misana-stone border-b border-misana-line">
      <div class="max-w-3xl mx-auto px-6 py-20">
        <p class="text-xs uppercase tracking-widest text-misana-muted mb-4">{{ t('about.kicker') }}</p>
        <h1 class="font-display text-4xl sm:text-5xl mb-6">{{ t('about.title') }}</h1>
        <p class="text-misana-muted text-lg leading-relaxed">{{ t('about.lead') }}</p>
      </div>
    </section>

    <section class="max-w-3xl mx-auto px-6 py-20 space-y-10">
      <div>
        <h2 class="font-display text-2xl mb-4">{{ t('about.section1Title') }}</h2>
        <p class="text-misana-muted leading-relaxed">{{ t('about.section1Body') }}</p>
      </div>
      <div>
        <h2 class="font-display text-2xl mb-4">{{ t('about.section2Title') }}</h2>
        <p class="text-misana-muted leading-relaxed">{{ t('about.section2Body') }}</p>
      </div>
      <div>
        <h2 class="font-display text-2xl mb-4">{{ t('about.section3Title') }}</h2>
        <p class="text-misana-muted leading-relaxed">{{ t('about.section3Body') }}</p>
      </div>
    </section>
  </main>
</template>
