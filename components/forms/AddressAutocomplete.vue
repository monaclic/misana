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
const suggestions = ref<any[]>([]);
const open = ref(false);
const loading = ref(false);
const wrapper = ref<HTMLElement | null>(null);

let svc: any = null;
let token: any = null;
let sdkReady = false;

async function ensureSvc() {
  if (!enabled || sdkReady) return;
  try {
    const g = await load();
    if (!g?.maps?.places?.AutocompleteSuggestion) {
      console.warn('[AddressAutocomplete] AutocompleteSuggestion non disponible. Verifier que Places API (New) est activee sur la cle.');
      return;
    }
    token = new g.maps.places.AutocompleteSessionToken();
    sdkReady = true;
  } catch (e) {
    console.error('[AddressAutocomplete] Echec chargement Google Maps SDK :', e);
  }
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
  loading.value = true;
  debounce = setTimeout(async () => {
    await ensureSvc();
    const g = (window as any).google;
    if (!sdkReady || !g?.maps?.places?.AutocompleteSuggestion) {
      loading.value = false;
      return;
    }
    try {
      const { suggestions: results } = await g.maps.places.AutocompleteSuggestion.fetchAutocompleteSuggestions({
        input: value,
        sessionToken: token,
        // Bias geographique : France + Monaco + Italie.
        includedRegionCodes: ['fr', 'mc', 'it'],
      });
      suggestions.value = results || [];
      open.value = (results?.length ?? 0) > 0;
    } catch (err) {
      console.warn('[AddressAutocomplete] fetchAutocompleteSuggestions :', err);
      suggestions.value = [];
      open.value = false;
    } finally {
      loading.value = false;
    }
  }, 200);
}

// Helpers pour adapter la forme de la nouvelle API
function predictionOf(s: any) {
  return s.placePrediction ?? s;
}
function descriptionOf(s: any): string {
  const p = predictionOf(s);
  return p.text?.toString?.() ?? p.description ?? '';
}
function placeIdOf(s: any): string {
  const p = predictionOf(s);
  return p.placeId ?? p.place_id ?? '';
}
function mainTextOf(s: any): string {
  const p = predictionOf(s);
  return p.mainText?.toString?.() ?? p.structured_formatting?.main_text ?? descriptionOf(s);
}
function secondaryTextOf(s: any): string {
  const p = predictionOf(s);
  return p.secondaryText?.toString?.() ?? p.structured_formatting?.secondary_text ?? '';
}

function pickSuggestion(s: any) {
  const description = descriptionOf(s);
  const placeId = placeIdOf(s);
  emit('update:modelValue', description);
  emit('select', { description, placeId });
  open.value = false;
  suggestions.value = [];
  // Reset session token apres selection (best practice billing)
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

function onFocus() {
  if (suggestions.value.length) open.value = true;
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
      @focus="onFocus"
    />
    <span
      v-if="loading"
      class="absolute right-0 top-2 text-xs text-misana-muted"
      aria-hidden="true"
    >…</span>
    <ul
      v-if="open && suggestions.length"
      class="absolute top-full left-0 right-0 z-20 mt-1 max-h-72 overflow-y-auto bg-misana-paper border border-misana-line shadow-sm"
      role="listbox"
    >
      <li
        v-for="(s, i) in suggestions"
        :key="placeIdOf(s) || i"
        role="option"
        class="px-3 py-2 text-sm hover:bg-misana-stone cursor-pointer transition"
        @click="pickSuggestion(s)"
      >
        <span class="text-misana-ink">{{ mainTextOf(s) }}</span>
        <span v-if="secondaryTextOf(s)" class="text-misana-muted ml-2 text-xs">
          {{ secondaryTextOf(s) }}
        </span>
      </li>
    </ul>
  </div>
</template>
