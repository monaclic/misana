<script setup lang="ts">
const { locale, setLocale } = useI18n();

function pick(l: 'en' | 'fr') {
  if (locale.value !== l) setLocale(l);
}
</script>

<template>
  <div class="inline-flex items-center gap-1.5 text-xs uppercase tracking-wide select-none">
    <button
      type="button"
      class="transition cursor-pointer"
      :class="locale === 'en' ? 'opacity-100 font-medium' : 'opacity-50 hover:opacity-80'"
      :aria-current="locale === 'en' ? 'true' : 'false'"
      @click="pick('en')"
    >
      EN
    </button>
    <span class="opacity-30">·</span>
    <button
      type="button"
      class="transition cursor-pointer"
      :class="locale === 'fr' ? 'opacity-100 font-medium' : 'opacity-50 hover:opacity-80'"
      :aria-current="locale === 'fr' ? 'true' : 'false'"
      @click="pick('fr')"
    >
      FR
    </button>
  </div>
</template>
