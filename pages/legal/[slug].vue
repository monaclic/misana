<script setup lang="ts">
// Legal pages stub : mentions, cgv, privacy, cookies.
definePageMeta({ layout: 'default' });
const route = useRoute();
const { t } = useI18n();

const slug = computed(() => String(route.params.slug));
const validSlugs = ['mentions', 'cgv', 'privacy', 'cookies'];

if (!validSlugs.includes(slug.value)) {
  throw createError({ statusCode: 404, statusMessage: 'Legal page not found', fatal: true });
}

const titleKey = computed(() => `footer.legal.${slug.value}`);
const bodyKey = computed(() => `legal.${slug.value}`);

useSeoMeta({
  title: () => `${t(titleKey.value)} · Misana`,
});
</script>

<template>
  <main class="min-h-screen">
    <section class="bg-misana-stone border-b border-misana-line">
      <div class="max-w-3xl mx-auto px-6 py-20">
        <p class="text-xs uppercase tracking-widest text-misana-muted mb-4">{{ t('legal.kicker') }}</p>
        <h1 class="font-display text-4xl mb-4">{{ t(titleKey) }}</h1>
      </div>
    </section>

    <article class="max-w-3xl mx-auto px-6 py-16 prose prose-misana">
      <p class="text-misana-muted leading-relaxed whitespace-pre-line">{{ t(bodyKey) }}</p>
    </article>
  </main>
</template>
