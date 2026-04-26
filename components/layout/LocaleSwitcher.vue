<script setup lang="ts">
const { locale, locales, setLocale } = useI18n();
const switchTo = computed(() => (locale.value === 'fr' ? 'en' : 'fr'));
</script>

<template>
  <button
    type="button"
    class="text-xs uppercase tracking-wide text-misana-muted hover:text-misana-ink transition"
    @click="setLocale(switchTo)"
  >
    {{ switchTo === 'fr' ? 'FR' : 'EN' }}
  </button>
</template>
