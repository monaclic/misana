<script setup lang="ts">
// Input adresse avec suggestions Google Places.
// Si la clef Maps n est pas configuree, on degrade vers un input texte simple.
// Emet @update:modelValue (string) et @select avec { description, placeId }.

import { useGoogleMaps } from '~/composables/useGoogleMaps';

const props = defineProps<{
  modelValue: string | undefined;
  placeholder?: string;
  inputId?: string;
}>();
const emit = defineEmits<{
  (e: 'update:modelValue', v: string): void;
  (e: 'select', payload: { description: string; placeId: string }): void;
}>();

const { enabled, load } = useGoogleMaps();
// On evite les types globaux google.maps.* (necessitent @types/google.maps)
// et on traite l SDK comme any : les appels sont bornes a runtime, pas de
// surface API a typer cote client V1.
const suggestions = ref<any[]>([]);
const open = ref(false);
const wrapper = ref<HTMLElement | null>(null);

let svc: any = null;
let token: any = null;

async function ensureSvc() {
  if (!enabled) return;
  if (svc) return;
  const g = await load();
  if (!g) return;
  svc = new g.maps.places.AutocompleteService();
  token = new g.maps.places.AutocompleteSessionToken();
}

let debounce: ReturnType<typeof setTimeout> | null = null;

async function onInput(e: Event) {
  const value = (e.target as HTMLInputElement).value;
  emit('update:modelValue', value);
  if (!enabled || value.length < 2) {
    suggestions.value = [];
    open.value = false;
    return;
  }
  if (debounce) clearTimeout(debounce);
  debounce = setTimeout(async () => {
    await ensureSvc();
    if (!svc) return;
    svc.getPlacePredictions(
      {
        input: value,
        sessionToken: token!,
        // Bias vers la France et l Italie cote (Riviera + extension proche).
        componentRestrictions: { country: ['fr', 'mc', 'it'] },
        types: ['geocode', 'establishment'],
      },
      (results) => {
        suggestions.value = results || [];
        open.value = (results?.length ?? 0) > 0;
      },
    );
  }, 200);
}

function pickSuggestion(s: any) {
  emit('update:modelValue', s.description);
  emit('select', { description: s.description, placeId: s.place_id });
  open.value = false;
  suggestions.value = [];
  // Reset session token apres selection
  const g = (window as any).google;
  if (g?.maps?.places) {
    token = new g.maps.places.AutocompleteSessionToken();
  }
}

function onClickOutside(e: MouseEvent) {
  if (wrapper.value && !wrapper.value.contains(e.target as Node)) {
    open.value = false;
  }
}

onMounted(() => {
  document.addEventListener('click', onClickOutside);
  // Pre-warm le SDK des le mount pour avoir l autocomplete instant.
  if (enabled) ensureSvc();
});
onBeforeUnmount(() => document.removeEventListener('click', onClickOutside));
</script>

<template>
  <div ref="wrapper" class="relative">
    <input
      :id="inputId"
      :value="modelValue"
      type="text"
      class="w-full border-b border-misana-line py-2 bg-transparent focus:border-misana-ink outline-none"
      :placeholder="placeholder"
      autocomplete="off"
      @input="onInput"
      @focus="suggestions.length && (open = true)"
    />
    <ul
      v-if="open && suggestions.length"
      class="absolute top-full left-0 right-0 z-20 mt-1 max-h-72 overflow-y-auto bg-misana-paper border border-misana-line shadow-sm"
      role="listbox"
    >
      <li
        v-for="s in suggestions"
        :key="s.place_id"
        role="option"
        class="px-3 py-2 text-sm hover:bg-misana-stone cursor-pointer transition"
        @click="pickSuggestion(s)"
      >
        <span class="text-misana-ink">{{ s.structured_formatting?.main_text || s.description }}</span>
        <span v-if="s.structured_formatting?.secondary_text" class="text-misana-muted ml-2 text-xs">
          {{ s.structured_formatting.secondary_text }}
        </span>
      </li>
    </ul>
  </div>
</template>
