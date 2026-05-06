<script setup lang="ts">
// Slider mobile pour la section access. Embla loop infini bidirectionnel.
// Reutilise par chacun des 4 blocs (restaurants, beach-clubs, palaces, nightclubs).
// Desktop : la grille .place-card est rendue par le parent en md:grid.
import emblaCarouselVue from 'embla-carousel-vue';

defineProps<{
  items: Array<{ slug: string; name: string; city: string }>;
  images: Record<string, string>;
  cityLabel: (slug: string) => string;
  placeNote: (slug: string) => string;
  discoverLabel: string;
  prevLabel: string;
  nextLabel: string;
}>();

const localePath = useLocalePath();

const [emblaRef, emblaApi] = emblaCarouselVue({
  loop: true,
  align: 'center',
  containScroll: false,
  dragFree: false,
  duration: 28,
});
const selectedSlide = ref(0);
function emblaPrev() { emblaApi.value?.scrollPrev(); }
function emblaNext() { emblaApi.value?.scrollNext(); }
watch(emblaApi, (api) => {
  if (!api) return;
  selectedSlide.value = api.selectedScrollSnap();
  api.on('select', () => { selectedSlide.value = api.selectedScrollSnap(); });
});
</script>

<template>
  <div class="emb">
    <div ref="emblaRef" class="emb-viewport">
      <div class="emb-container">
        <NuxtLink
          v-for="(est, i) in items"
          :key="est.slug"
          :to="localePath({ name: 'reservations-establishment', params: { establishment: est.slug } })"
          class="emb-slide"
          :class="{ 'emb-slide-active': selectedSlide === i }"
        >
          <div class="emb-card">
            <img :src="images[est.slug]" :alt="est.name" loading="lazy" class="emb-img" />
            <div class="emb-overlay"></div>
            <div class="emb-content">
              <p class="emb-eyebrow">{{ cityLabel(est.city) }}</p>
              <h3 class="emb-name">{{ est.name }}</h3>
              <p class="emb-note">{{ placeNote(est.slug) }}</p>
            </div>
          </div>
        </NuxtLink>
      </div>
    </div>
    <button type="button" class="emb-nav emb-nav-prev" :aria-label="prevLabel" @click="emblaPrev">
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" class="block w-4 h-4">
        <path d="M15 6L9 12L15 18" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" />
      </svg>
    </button>
    <button type="button" class="emb-nav emb-nav-next" :aria-label="nextLabel" @click="emblaNext">
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" class="block w-4 h-4">
        <path d="M9 6L15 12L9 18" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" />
      </svg>
    </button>
  </div>
</template>

<style scoped>
.emb {
  position: relative;
  margin: 0 -1.5rem;
}
.emb-viewport {
  overflow: hidden;
  cursor: grab;
}
.emb-viewport:active { cursor: grabbing; }
.emb-container {
  display: flex;
  touch-action: pan-y pinch-zoom;
}
.emb-slide {
  flex: 0 0 78%;
  min-width: 0;
  padding-right: 10px;
  text-decoration: none;
  display: block;
}
.emb-card {
  position: relative;
  aspect-ratio: 4 / 5;
  border-radius: 6px;
  overflow: hidden;
  background: #1a1a1a;
  opacity: 0.4;
  filter: brightness(0.7);
  transition: opacity 0.35s ease, filter 0.35s ease;
}
.emb-slide-active .emb-card {
  opacity: 1;
  filter: brightness(1);
}
.emb-img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.emb-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, rgba(0,0,0,0) 35%, rgba(0,0,0,0.7) 100%);
}
.emb-content {
  position: absolute;
  inset: auto 0 0 0;
  padding: 1.4rem 1.4rem 1.6rem;
  text-align: left;
  color: var(--color-misana-paper);
}
.emb-eyebrow {
  font-size: 0.65rem;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.78);
  margin: 0 0 0.5rem;
}
.emb-name {
  font-family: var(--font-display, serif);
  font-size: 1.4rem;
  line-height: 1.15;
  margin: 0;
}
.emb-note {
  font-size: 0.82rem;
  line-height: 1.45;
  margin: 0.5rem 0 0;
  color: rgba(255, 255, 255, 0.78);
}
.emb-nav {
  position: absolute;
  bottom: 12px;
  width: 36px;
  height: 36px;
  border-radius: 999px;
  background: rgba(0, 0, 0, 0.5);
  color: var(--color-misana-paper);
  border: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 5;
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  transition: background 0.3s ease;
}
.emb-nav:hover { background: rgba(0, 0, 0, 0.7); }
.emb-nav-prev { left: 6%; }
.emb-nav-next { right: 6%; }
</style>
