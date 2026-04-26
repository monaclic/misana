<script setup lang="ts">
// Phone code dropdown : ferme affiche juste l indicatif (ex "+33"),
// ouvert affiche la liste complete (indicatif + nom pays).
import { PHONE_CODES } from '~/lib/phoneCodes';

const props = defineProps<{ modelValue: string | undefined }>();
const emit = defineEmits<{ (e: 'update:modelValue', v: string): void }>();

const { locale } = useI18n();
const open = ref(false);
const wrapper = ref<HTMLElement | null>(null);

function pick(code: string) {
  emit('update:modelValue', code);
  open.value = false;
}

function onClickOutside(e: MouseEvent) {
  if (wrapper.value && !wrapper.value.contains(e.target as Node)) {
    open.value = false;
  }
}

onMounted(() => document.addEventListener('click', onClickOutside));
onBeforeUnmount(() => document.removeEventListener('click', onClickOutside));
</script>

<template>
  <div ref="wrapper" class="relative">
    <button
      type="button"
      class="w-20 border-b border-misana-line py-2 bg-transparent focus:border-misana-ink outline-none text-left tabular-nums hover:border-misana-ink transition"
      :aria-expanded="open"
      @click="open = !open"
    >
      {{ modelValue || '+33' }}
    </button>
    <div
      v-if="open"
      class="absolute top-full left-0 z-20 mt-1 w-72 max-h-72 overflow-y-auto bg-misana-paper border border-misana-line shadow-sm"
      role="listbox"
    >
      <button
        v-for="pc in PHONE_CODES"
        :key="pc.code + pc.country"
        type="button"
        class="w-full text-left px-3 py-2 text-sm hover:bg-misana-stone flex items-center gap-3 transition"
        :class="modelValue === pc.code ? 'bg-misana-stone font-medium' : ''"
        role="option"
        :aria-selected="modelValue === pc.code"
        @click="pick(pc.code)"
      >
        <span class="tabular-nums w-12 text-misana-ink">{{ pc.code }}</span>
        <span class="text-misana-muted">{{ locale === 'fr' ? pc.countryFr : pc.country }}</span>
      </button>
    </div>
  </div>
</template>
