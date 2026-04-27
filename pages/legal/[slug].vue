<script setup lang="ts">
// Pages legales : mentions, cgv, privacy, cookies.
// Contenu structure : intro + tableau de sections (titre + corps) issu de l'i18n.
definePageMeta({ layout: 'default' });

const { t, tm } = useI18n();
const route = useRoute();

const slug = computed(() => String(route.params.slug));
const validSlugs = ['mentions', 'cgv', 'privacy', 'cookies'] as const;

if (!validSlugs.includes(slug.value as typeof validSlugs[number])) {
  throw createError({ statusCode: 404, statusMessage: 'Legal page not found', fatal: true });
}

const titleKey = computed(() => `footer.legal.${slug.value}`);
const intro = computed(() => t(`legal.${slug.value}.intro`));
// Substitute "(at)" placeholder with a real @ at render time.
// vue-i18n's compiler treats @ as a directive trigger, so the JSON files
// store emails in obfuscated form and we restore them here.
const renderEmails = (text: string) =>
  text.replace(/contact \(at\) misana\.com/g, 'contact@misana.com');

const sections = computed<Array<{ title: string; body: string }>>(() => {
  const raw = tm(`legal.${slug.value}.sections`);
  if (!Array.isArray(raw)) return [];
  return (raw as Array<{ title: string; body: string }>).map((s) => ({
    title: renderEmails(s.title),
    body: renderEmails(s.body),
  }));
});

const renderedIntro = computed(() => renderEmails(intro.value));

useSeoMeta({
  title: () => `${t(titleKey.value)} · Misana`,
  description: () => renderedIntro.value,
});
</script>

<template>
  <main class="bg-misana-paper">
    <section class="border-b border-misana-line">
      <div class="max-w-3xl mx-auto px-6 sm:px-8 pt-16 pb-12 sm:pt-20 sm:pb-16">
        <p class="text-[11px] uppercase tracking-[0.25em] text-misana-muted mb-5">{{ t('legal.kicker') }}</p>
        <h1 class="font-display text-4xl sm:text-5xl leading-[1.05] mb-6">{{ t(titleKey) }}</h1>
        <p class="text-misana-muted leading-relaxed text-base sm:text-lg">{{ renderedIntro }}</p>
        <p class="text-[11px] uppercase tracking-[0.25em] text-misana-muted mt-10">{{ t('legal.lastUpdate') }}</p>
      </div>
    </section>

    <article class="max-w-3xl mx-auto px-6 sm:px-8 py-16 sm:py-20 space-y-12">
      <section v-for="(s, i) in sections" :key="i">
        <h2 class="font-display text-xl sm:text-2xl mb-4 leading-snug">{{ s.title }}</h2>
        <p class="text-misana-muted leading-relaxed whitespace-pre-line">{{ s.body }}</p>
      </section>
    </article>
  </main>
</template>
