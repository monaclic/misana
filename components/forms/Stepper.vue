<script setup lang="ts">
// Stepper -/+ tactile pour passengers, luggage, child seats.
// Pattern repris de Leader Limousines : explicit minus / count / plus, pas un
// Select dropdown.

const props = defineProps<{
  modelValue: number | undefined;
  min?: number;
  max?: number;
  label: string;
  hint?: string;
}>();

const emit = defineEmits<{ (e: 'update:modelValue', v: number): void }>();

const min = computed(() => props.min ?? 0);
const max = computed(() => props.max ?? 30);
const value = computed(() => props.modelValue ?? 0);

const dec = () => {
  if (value.value > min.value) emit('update:modelValue', value.value - 1);
};
const inc = () => {
  if (value.value < max.value) emit('update:modelValue', value.value + 1);
};
</script>

<template>
  <div class="flex items-center justify-between border-b border-misana-line py-3">
    <div class="flex flex-col">
      <span class="text-sm">{{ label }}</span>
      <span v-if="hint" class="text-xs text-misana-muted">{{ hint }}</span>
    </div>
    <div class="flex items-center gap-3">
      <button
        type="button"
        :disabled="value <= min"
        :aria-label="`Decrease ${label}`"
        class="w-8 h-8 border border-misana-ink rounded-full text-misana-ink disabled:opacity-30 disabled:cursor-not-allowed hover:bg-misana-ink hover:text-misana-paper transition"
        @click="dec"
      >
        −
      </button>
      <span class="w-8 text-center tabular-nums">{{ value }}</span>
      <button
        type="button"
        :disabled="value >= max"
        :aria-label="`Increase ${label}`"
        class="w-8 h-8 border border-misana-ink rounded-full text-misana-ink disabled:opacity-30 disabled:cursor-not-allowed hover:bg-misana-ink hover:text-misana-paper transition"
        @click="inc"
      >
        +
      </button>
    </div>
  </div>
</template>
