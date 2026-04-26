<script setup lang="ts">
definePageMeta({ layout: 'default' });
const { t } = useI18n();

useSeoMeta({
  title: () => `${t('contact.title')} · Misana`,
  description: () => t('contact.metaDescription'),
});
</script>

<template>
  <main class="min-h-screen">
    <section class="bg-misana-stone border-b border-misana-line">
      <div class="max-w-3xl mx-auto px-6 py-20">
        <p class="text-xs uppercase tracking-widest text-misana-muted mb-4">{{ t('contact.kicker') }}</p>
        <h1 class="font-display text-4xl sm:text-5xl mb-6">{{ t('contact.title') }}</h1>
        <p class="text-misana-muted text-lg leading-relaxed">{{ t('contact.lead') }}</p>
      </div>
    </section>

    <section class="max-w-3xl mx-auto px-6 py-20">
      <div class="grid sm:grid-cols-2 gap-10">
        <div>
          <h2 class="text-xs uppercase tracking-widest text-misana-muted mb-3">{{ t('contact.requestKicker') }}</h2>
          <p class="text-misana-muted leading-relaxed mb-4">{{ t('contact.requestBody') }}</p>
          <NuxtLink to="/request" class="border border-misana-ink px-6 py-3 text-sm tracking-wide hover:bg-misana-ink hover:text-misana-paper transition inline-block">
            {{ t('nav.request') }} →
          </NuxtLink>
        </div>
        <div>
          <h2 class="text-xs uppercase tracking-widest text-misana-muted mb-3">{{ t('contact.directKicker') }}</h2>
          <p class="text-misana-muted leading-relaxed">{{ t('contact.directBody') }}</p>
          <p class="text-sm mt-4">contact@misana.com</p>
        </div>
      </div>
    </section>
  </main>
</template>
