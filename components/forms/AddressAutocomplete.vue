<script setup lang="ts">
// Input adresse avec suggestions Google Places.
// Utilise l API legacy AutocompleteService (deprec mars 2025 mais
// toujours fonctionnelle, et la nouvelle API necessite l activation
// de "Places API (New)" cote Google Cloud Console).

import { useGoogleMaps } from '~/composables/useGoogleMaps';

const props = defineProps<{
  modelValue: string | undefined;
  placeholder?: string;
  inputId?: string;
  inputClass?: string;
  variant?: 'light' | 'dark' | 'transparent';
  max?: number;
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

const visibleSuggestions = computed(() =>
  props.max ? suggestions.value.slice(0, props.max) : suggestions.value,
);

let svc: any = null;
let token: any = null;
let sdkReady = false;

async function ensureSvc() {
  if (!enabled || sdkReady) return;
  try {
    const g = await load();
    if (!g?.maps?.places) {
      console.warn('[AddressAutocomplete] Google Maps Places non disponible. Verifier que Places API est activee sur la cle.');
      return;
    }
    svc = new g.maps.places.AutocompleteService();
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
    if (!svc) {
      loading.value = false;
      return;
    }
    svc.getPlacePredictions(
      {
        input: value,
        sessionToken: token,
        componentRestrictions: { country: ['fr', 'mc', 'it'] },
      },
      (results: any[] | null, status: string) => {
        loading.value = false;
        if (status !== 'OK' && status !== 'ZERO_RESULTS') {
          console.warn('[AddressAutocomplete] Places status :', status);
        }
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
  if (enabled) ensureSvc();
});
onBeforeUnmount(() => document.removeEventListener('click', onClickOutside));
</script>

<template>
  <div ref="wrapper" class="relative w-full">
    <input
      :id="inputId"
      :value="modelValue"
      type="text"
      :class="inputClass || 'w-full border-b border-misana-line py-2 bg-transparent focus:border-misana-ink outline-none'"
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
      v-if="open && visibleSuggestions.length"
      class="absolute top-full left-0 right-0 z-20 mt-1 max-h-72 overflow-y-auto border shadow-sm"
      :class="{
        'bg-misana-ink text-misana-paper border-misana-paper/20': variant === 'dark',
        'bg-misana-ink/40 backdrop-blur-md text-misana-paper border-misana-paper/25': variant === 'transparent',
        'bg-misana-paper text-misana-ink border-misana-line': !variant || variant === 'light',
      }"
      role="listbox"
    >
      <li
        v-for="s in visibleSuggestions"
        :key="s.place_id"
        role="option"
        class="px-3 py-2 text-sm cursor-pointer transition"
        :class="variant === 'dark' || variant === 'transparent' ? 'hover:bg-misana-paper/10' : 'hover:bg-misana-stone'"
        @click="pickSuggestion(s)"
      >
        <span>{{ s.structured_formatting?.main_text || s.description }}</span>
        <span v-if="s.structured_formatting?.secondary_text" class="opacity-60 ml-2 text-xs">
          {{ s.structured_formatting.secondary_text }}
        </span>
      </li>
    </ul>
  </div>
</template>
