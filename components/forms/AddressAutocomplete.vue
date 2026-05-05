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

// Mobile : on bascule la dropdown en rendu inline (pas de Teleport, pas de
// position:fixed) pour suivre naturellement le scroll des sticky panels.
const isMobile = ref(false);
function updateIsMobile() {
  if (typeof window !== 'undefined') isMobile.value = window.innerWidth < 768;
}

const visibleSuggestions = computed(() =>
  props.max ? suggestions.value.slice(0, props.max) : suggestions.value,
);

// En variant transparent on Teleport la liste vers <body> et on
// la positionne en fixed, ancree au label parent. Cela contourne
// les stacking contexts crees par les .reveal voisins (transform)
// et evite la double couche de glass (form parent + dropdown).
const dropdownStyle = ref<Record<string, string>>({});
function updateDropdownPos() {
  if (props.variant !== 'transparent' || !wrapper.value) return;
  // Mobile : pas de positionnement fixed. La dropdown est rendue inline
  // dans le DOM (Teleport disabled), elle flow naturellement sous l input.
  if (isMobile.value) {
    dropdownStyle.value = {};
    return;
  }
  const parent = wrapper.value.parentElement as HTMLElement | null;
  const anchor = parent || wrapper.value;
  const rect = anchor.getBoundingClientRect();
  // Decalage 1px vers le bas + 1px vers la gauche, +2px de width
  // pour epouser pixel-perfect le cadre du label parent.
  dropdownStyle.value = {
    position: 'fixed',
    top: `${rect.bottom + 1}px`,
    left: `${rect.left - 1}px`,
    width: `${rect.width + 2}px`,
    zIndex: '1000',
    boxSizing: 'border-box',
    maxWidth: 'calc(100vw - 16px)',
  };
}
watch(open, (v) => {
  if (v) updateDropdownPos();
});
watch(() => visibleSuggestions.value.length, () => {
  if (open.value) updateDropdownPos();
});

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

const dropdownEl = ref<HTMLElement | null>(null);

function onClickOutside(e: MouseEvent) {
  const target = e.target as Node;
  if (wrapper.value?.contains(target)) return;
  if (dropdownEl.value?.contains(target)) return;
  open.value = false;
}

function onFocus() {
  if (suggestions.value.length) open.value = true;
}

// Desktop : ferme au scroll (le rendu fixed deviendrait incoherent avec
// les sticky panels du hero). Mobile : laisse ouvert + bloque le scroll
// du body tant que la dropdown est visible (evite que le user scroll
// dans les autres panels par accident pendant qu il lit les suggestions).
function onScroll() {
  if (open.value && !isMobile.value) open.value = false;
}

function onResize() {
  updateIsMobile();
  if (open.value) updateDropdownPos();
}

onMounted(() => {
  updateIsMobile();
  document.addEventListener('click', onClickOutside);
  window.addEventListener('scroll', onScroll, true);
  window.addEventListener('resize', onResize);
  if (enabled) ensureSvc();
});
onBeforeUnmount(() => {
  document.removeEventListener('click', onClickOutside);
  window.removeEventListener('scroll', onScroll, true);
  window.removeEventListener('resize', onResize);
});
</script>

<template>
  <div
    ref="wrapper"
    class="w-full"
    :class="variant === 'transparent' ? '' : 'relative'"
  >
    <input
      :id="inputId"
      :value="modelValue"
      type="text"
      :class="inputClass || 'w-full border-b border-misana-line py-2 bg-transparent focus:border-misana-ink outline-none'"
      :placeholder="placeholder"
      autocomplete="off"
      autocorrect="off"
      autocapitalize="off"
      spellcheck="false"
      @input="onInput"
      @focus="onFocus"
    />
    <span
      v-if="loading"
      class="absolute right-0 top-2 text-xs text-misana-muted"
      aria-hidden="true"
    >…</span>
    <Teleport to="body" :disabled="variant !== 'transparent' || isMobile">
    <ul
      v-if="open && visibleSuggestions.length"
      ref="dropdownEl"
      class="max-h-72 overflow-y-auto"
      :class="{
        'absolute top-full left-0 right-0 z-20 mt-1 border shadow-sm bg-misana-ink text-misana-paper border-misana-paper/20': variant === 'dark',
        'aa-glass aa-glass-inline': variant === 'transparent' && isMobile,
        'aa-glass': variant === 'transparent' && !isMobile,
        'absolute top-full left-0 right-0 z-20 mt-1 border shadow-sm bg-misana-paper text-misana-ink border-misana-line': !variant || variant === 'light',
      }"
      :style="variant === 'transparent' && !isMobile ? dropdownStyle : undefined"
      role="listbox"
    >
      <li
        v-for="s in visibleSuggestions"
        :key="s.place_id"
        role="option"
        class="cursor-pointer transition"
        :class="{
          'px-3 py-2 text-sm hover:bg-misana-paper/10': variant === 'dark',
          'aa-glass-row': variant === 'transparent',
          'px-3 py-2 text-sm hover:bg-misana-stone': !variant || variant === 'light',
        }"
        @click="pickSuggestion(s)"
      >
        <span>{{ s.structured_formatting?.main_text || s.description }}</span>
        <span v-if="s.structured_formatting?.secondary_text" class="opacity-60 ml-2 text-xs">
          {{ s.structured_formatting.secondary_text }}
        </span>
      </li>
    </ul>
    </Teleport>
  </div>
</template>

<style scoped>
/* Variante transparent : la liste prolonge le glass du formulaire
   parent. Meme bg / blur que .quick-search et .ch-form, separateurs
   de ligne identiques aux fields voisins. Pas de border externe ni
   de shadow : la dropdown se lit comme une rangee supplementaire. */
.aa-glass {
  /* Reprend exactement le glass du form parent. Le z-index est
     gere cote page (la copy editoriale dessous a son propre
     stacking context : on remonte le bloc form via z-index). */
  background: rgba(255, 255, 255, 0.07);
  backdrop-filter: blur(20px) saturate(1.05);
  -webkit-backdrop-filter: blur(20px) saturate(1.05);
  color: var(--color-misana-paper);
}
.aa-glass-row {
  display: block;
  padding: 0.85rem 1.1rem;
  font-size: 0.9rem;
  border-top: 1px solid rgba(255, 255, 255, 0.22);
  color: var(--color-misana-paper);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
/* Mobile inline : la dropdown apparait comme une rangee dediee dans le
   form, sous l input qui a le focus. Pas de position fixed, pas de
   teleport. Elle suit naturellement les scrolls et les sticky panels.
   Hide automatique quand pas de suggestion via v-if. */
.aa-glass-inline {
  position: static;
  display: block;
  width: auto;
  margin: 0 -1.1rem; /* extend to label edges to match field width */
  border-top: 1px solid rgba(255, 255, 255, 0.22);
  border-bottom: 1px solid rgba(255, 255, 255, 0.22);
}
.aa-glass-inline .aa-glass-row:first-child { border-top: 0; }
.aa-glass-row:first-child { border-top: 0; }
.aa-glass-row:hover { background: rgba(255, 255, 255, 0.05); }
</style>
