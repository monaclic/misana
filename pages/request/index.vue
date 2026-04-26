<script setup lang="ts">
// Page /request : wrapper avec réassurance pré-form + RequestForm.
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
      <RequestReassurance />
      <RequestForm />
    </div>
  </main>
</template>
