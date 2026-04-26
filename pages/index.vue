<script setup lang="ts">
const { t } = useI18n();

useSeoMeta({
  title: () => t('brand.name'),
  description: () => t('brand.longTagline'),
});
</script>

<template>
  <main class="min-h-screen flex items-center justify-center px-6">
    <div class="max-w-xl text-center">
      <h1 class="font-display text-5xl mb-4">{{ $t('brand.name') }}</h1>
      <p class="text-misana-muted text-lg mb-2">{{ $t('brand.tagline') }}</p>
      <p class="text-misana-muted text-sm">{{ $t('brand.longTagline') }}</p>
      <NuxtLink
        to="/request"
        class="inline-block mt-10 border border-misana-ink px-6 py-3 text-sm tracking-wide hover:bg-misana-ink hover:text-misana-paper transition"
      >
        {{ $t('nav.request') }}
      </NuxtLink>
    </div>
  </main>
</template>
