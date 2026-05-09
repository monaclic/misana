<script setup lang="ts">
// Card flotte generique : carousel d images (exterieur + interieur), badge,
// metadata, prix indicatif optionnel.
// Utilise pour helicoptere ET vehicules chauffeur. Fallback : si pas d images
// fournies, on rend un placeholder typo.

const props = defineProps<{
  selected?: boolean;
  title: string;
  sub?: string;
  meta?: { icon: 'pax' | 'luggage' | 'speed'; text: string }[];
  badge?: 'popular' | 'flagship';
  badgeLabel?: string;
  images: string[];
  // Prix optionnel : si undefined, pas de prix affiche.
  price?: number | null;
  priceLocale?: 'en' | 'fr';
  onRequestLabel?: string;
  fromLabel?: string;
}>();
defineEmits<{ (e: 'select'): void }>();

const idx = ref(0);
const total = computed(() => props.images.length);
const trackRef = ref<HTMLDivElement | null>(null);

function scrollToIndex(i: number) {
  const el = trackRef.value;
  if (!el) return;
  el.scrollTo({ left: el.clientWidth * i, behavior: 'smooth' });
}

function onScroll() {
  const el = trackRef.value;
  if (!el || !el.clientWidth) return;
  const i = Math.round(el.scrollLeft / el.clientWidth);
  if (i !== idx.value) idx.value = i;
}

function prev(e: MouseEvent) {
  e.stopPropagation();
  scrollToIndex((idx.value - 1 + total.value) % total.value);
}
function next(e: MouseEvent) {
  e.stopPropagation();
  scrollToIndex((idx.value + 1) % total.value);
}
function goTo(i: number, e: MouseEvent) {
  e.stopPropagation();
  scrollToIndex(i);
}

const fmtPrice = computed(() => {
  if (props.price === undefined) return null;
  if (props.price === null) return props.onRequestLabel ?? '';
  return new Intl.NumberFormat((props.priceLocale ?? 'en') === 'fr' ? 'fr-FR' : 'en-GB', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0,
  }).format(props.price);
});
</script>

<template>
  <button
    type="button"
    class="group relative text-left transition overflow-hidden flex flex-col bg-misana-paper"
    :class="
      selected
        ? 'ring-1 ring-misana-ink'
        : 'ring-1 ring-misana-line hover:ring-misana-ink'
    "
    @click="$emit('select')"
  >
    <div class="aspect-[4/3] relative overflow-hidden bg-misana-stone">
      <div
        v-if="images.length"
        ref="trackRef"
        class="carousel-track absolute inset-0 flex overflow-x-auto snap-x snap-mandatory"
        @scroll.passive="onScroll"
      >
        <img
          v-for="(src, i) in images"
          :key="src"
          :src="src"
          :alt="`${title} (${i + 1}/${total})`"
          loading="lazy"
          draggable="false"
          class="snap-start shrink-0 w-full h-full object-cover select-none"
        />
      </div>
      <div v-else class="absolute inset-0 flex items-center justify-center px-6">
        <span class="font-display text-xl text-misana-ink/70 text-center leading-tight">
          {{ title }}
        </span>
      </div>

      <template v-if="total > 1">
        <button
          type="button"
          aria-label="Previous image"
          class="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 inline-flex items-center justify-center bg-misana-paper/80 hover:bg-misana-paper text-misana-ink opacity-0 group-hover:opacity-100 transition"
          @click="prev"
        >‹</button>
        <button
          type="button"
          aria-label="Next image"
          class="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 inline-flex items-center justify-center bg-misana-paper/80 hover:bg-misana-paper text-misana-ink opacity-0 group-hover:opacity-100 transition"
          @click="next"
        >›</button>
        <div class="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
          <button
            v-for="(_, i) in images"
            :key="i"
            type="button"
            :aria-label="`Image ${i + 1}`"
            class="w-1.5 h-1.5 rounded-full transition"
            :class="i === idx ? 'bg-misana-paper' : 'bg-misana-paper/50 hover:bg-misana-paper/80'"
            @click="goTo(i, $event)"
          ></button>
        </div>
      </template>

      <span
        v-if="badge"
        class="absolute top-3 left-3 text-[10px] uppercase tracking-widest px-2 py-1 bg-misana-paper text-misana-ink"
      >{{ badgeLabel }}</span>
      <span
        v-if="selected"
        class="absolute top-3 right-3 w-6 h-6 inline-flex items-center justify-center text-xs bg-misana-ink text-misana-paper rounded-full"
        aria-hidden="true"
      >✓</span>
    </div>

    <div class="p-4">
      <div class="flex items-baseline justify-between gap-3">
        <div>
          <p class="text-sm font-medium leading-tight">{{ title }}</p>
          <p v-if="sub" class="text-xs text-misana-muted mt-0.5">{{ sub }}</p>
        </div>
        <p v-if="fmtPrice" class="text-sm font-medium text-misana-ink whitespace-nowrap">
          <span v-if="fromLabel" class="text-misana-muted text-xs">{{ fromLabel }} </span>{{ fmtPrice }}
        </p>
      </div>

      <ul v-if="meta && meta.length" class="flex flex-wrap gap-x-4 gap-y-1 mt-3 text-xs text-misana-muted">
        <li v-for="(m, i) in meta" :key="i" class="inline-flex items-center gap-1.5">
          <span aria-hidden="true">
            <svg v-if="m.icon === 'pax'" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <circle cx="12" cy="7" r="4" />
              <path d="M4 21c0-4.5 3.5-8 8-8s8 3.5 8 8" />
            </svg>
            <svg v-else-if="m.icon === 'luggage'" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <rect x="5" y="7" width="14" height="13" rx="1.5" />
              <path d="M9 7V4h6v3M9 12v6M15 12v6" />
            </svg>
            <svg v-else width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <circle cx="12" cy="12" r="9" />
              <path d="M12 7v5l3 2" />
            </svg>
          </span>
          {{ m.text }}
        </li>
      </ul>
    </div>
  </button>
</template>

<style scoped>
/* Hide scrollbar : swipe natif sans bande disgracieuse en bas du carousel. */
.carousel-track {
  scrollbar-width: none;
  -ms-overflow-style: none;
  -webkit-overflow-scrolling: touch;
  overscroll-behavior-x: contain;
}
.carousel-track::-webkit-scrollbar {
  display: none;
}
</style>
