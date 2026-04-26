<script setup lang="ts">
// Bandeau de réassurance avant le form : délai, contact, langue, paiement.
// Aussi : carte concierge (placeholder photo) pour humaniser le funnel.
const { t } = useI18n();
</script>

<template>
  <aside class="border border-misana-line bg-misana-stone p-6 mb-10">
    <div class="grid sm:grid-cols-4 gap-4 text-xs">
      <div>
        <p class="text-[10px] uppercase tracking-widest text-misana-muted mb-1">{{ t('reassure.responseTitle') }}</p>
        <p>{{ t('reassure.responseBody') }}</p>
      </div>
      <div>
        <p class="text-[10px] uppercase tracking-widest text-misana-muted mb-1">{{ t('reassure.contactTitle') }}</p>
        <p>{{ t('reassure.contactBody') }}</p>
      </div>
      <div>
        <p class="text-[10px] uppercase tracking-widest text-misana-muted mb-1">{{ t('reassure.languageTitle') }}</p>
        <p>{{ t('reassure.languageBody') }}</p>
      </div>
      <div>
        <p class="text-[10px] uppercase tracking-widest text-misana-muted mb-1">{{ t('reassure.paymentTitle') }}</p>
        <p>{{ t('reassure.paymentBody') }}</p>
      </div>
    </div>
  </aside>
</template>
