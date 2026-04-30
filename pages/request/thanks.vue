<script setup lang="ts">
definePageMeta({ layout: 'default' });

const { t } = useI18n();
const localePath = useLocalePath();

useSeoMeta({
  title: () => t('request.thanks.title'),
  description: () => t('request.thanks.body'),
});
</script>

<template>
  <main class="min-h-screen flex items-center justify-center px-6">
    <div class="max-w-xl text-center">
      <h1 class="font-display text-4xl sm:text-5xl mb-6">{{ $t('request.thanks.title') }}</h1>
      <p class="text-misana-muted text-lg mb-10">{{ $t('request.thanks.body') }}</p>
      <NuxtLink
        :to="localePath('/')"
        class="inline-block border border-misana-ink px-6 py-3 text-sm tracking-wide hover:bg-misana-ink hover:text-misana-paper transition"
      >
        {{ $t('request.thanks.back') }}
      </NuxtLink>
    </div>
  </main>
</template>
