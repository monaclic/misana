<script setup lang="ts">
// Disclosure sobre : titre + bouton "Add details" / chevron, contenu masque
// par defaut, transition opacity. Utilise dans les panels pour cacher
// les champs avances (steppers, child seats, billing) jusqu a demande.

const props = defineProps<{
  label: string;
  defaultOpen?: boolean;
}>();

const open = ref(props.defaultOpen ?? false);
</script>

<template>
  <div class="border-t border-misana-line pt-6">
    <button
      type="button"
      class="w-full flex items-center justify-between text-sm uppercase tracking-wide text-misana-muted hover:text-misana-ink transition"
      :aria-expanded="open"
      @click="open = !open"
    >
      <span>{{ label }}</span>
      <span aria-hidden="true" class="text-xs transition" :class="{ 'rotate-180': open }">▾</span>
    </button>
    <div v-if="open" class="mt-6 space-y-6">
      <slot />
    </div>
  </div>
</template>
