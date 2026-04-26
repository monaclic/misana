<script setup lang="ts">
// Page /request autonome : wrapper minimal autour du composant <RequestForm>.
// Le composant est aussi reutilise embedded dans les landings SEO et fiches
// produit (pages/transfers/[route].vue, pages/services/cars/[brand-model].vue,
// pages/events/[event].vue).
definePageMeta({ layout: 'default' });

const { t } = useI18n();

useSeoMeta({
  title: () => t('request.title'),
  description: () => t('request.subtitle'),
});
</script>

<template>
  <main class="min-h-screen px-6 py-12">
    <div class="max-w-2xl mx-auto">
      <RequestForm />
    </div>
  </main>
</template>
