<script setup lang="ts">
// Carte villa partagee : liste villas/all ET section "villas similaires" de
// la fiche. Source unique pour garantir un rendu strictement identique.
// Carousel photos inline (max 6), titre + prix discret, rangee d'icones.
import type { Villa, VillaCity } from '~/composables/useVillas';
import { resizeSanityUrl } from '~/composables/useSanityImage';

const props = defineProps<{ villa: Villa; active?: boolean }>();
const emit = defineEmits<{ hover: [string]; leave: [] }>();

const { t, locale } = useI18n();
const localePath = useLocalePath();

const CITY_LABELS: { value: VillaCity; labelFr: string; labelEn: string }[] = [
  { value: 'saint-tropez', labelFr: 'Saint-Tropez', labelEn: 'Saint-Tropez' },
  { value: 'ramatuelle', labelFr: 'Ramatuelle', labelEn: 'Ramatuelle' },
  { value: 'gassin', labelFr: 'Gassin', labelEn: 'Gassin' },
  { value: 'grimaud', labelFr: 'Grimaud', labelEn: 'Grimaud' },
  { value: 'la-croix-valmer', labelFr: 'La Croix-Valmer', labelEn: 'La Croix-Valmer' },
  { value: 'sainte-maxime', labelFr: 'Sainte-Maxime', labelEn: 'Sainte-Maxime' },
  { value: 'cavalaire-sur-mer', labelFr: 'Cavalaire-sur-Mer', labelEn: 'Cavalaire-sur-Mer' },
  { value: 'cannes', labelFr: 'Cannes', labelEn: 'Cannes' },
  { value: 'mougins', labelFr: 'Mougins', labelEn: 'Mougins' },
  { value: 'antibes', labelFr: 'Antibes', labelEn: 'Antibes' },
  { value: 'cap-d-antibes', labelFr: "Cap d'Antibes", labelEn: "Cap d'Antibes" },
  { value: 'villefranche-sur-mer', labelFr: 'Villefranche-sur-Mer', labelEn: 'Villefranche-sur-Mer' },
  { value: 'nice', labelFr: 'Nice', labelEn: 'Nice' },
  { value: 'eze', labelFr: 'Èze', labelEn: 'Èze' },
  { value: 'monaco', labelFr: 'Monaco', labelEn: 'Monaco' },
  { value: 'menton', labelFr: 'Menton', labelEn: 'Menton' },
  { value: 'cap-ferrat', labelFr: 'Cap-Ferrat', labelEn: 'Cap-Ferrat' },
];

function fmtPrice(p: number | null): string {
  if (p == null) return t('villas.onRequest');
  return new Intl.NumberFormat(locale.value === 'fr' ? 'fr-FR' : 'en-GB', {
    style: 'currency', currency: 'EUR', maximumFractionDigits: 0,
  }).format(p);
}
function cityLabel(value: VillaCity): string {
  const c = CITY_LABELS.find((x) => x.value === value);
  if (!c) return value;
  return locale.value === 'fr' ? c.labelFr : c.labelEn;
}
const villaSlug = computed(() => (locale.value === 'fr' ? props.villa.slug.fr : props.villa.slug.en));

// Carousel inline : hero + gallery, max 6 photos (pattern LC).
const MAX_CARD_PHOTOS = 6;
const photosAll = computed(() => {
  const out: string[] = [];
  if (props.villa.hero) out.push(props.villa.hero);
  if (Array.isArray(props.villa.gallery)) for (const g of props.villa.gallery) if (g && g !== props.villa.hero) out.push(g);
  // Downscale a la taille reelle d'affichage carte (~500px, retina 1000).
  return out.map((u) => resizeSanityUrl(u, 1000));
});
const photos = computed(() => photosAll.value.slice(0, MAX_CARD_PHOTOS));
const photosHasMore = computed(() => photosAll.value.length > MAX_CARD_PHOTOS);

function onCardScroll(e: Event) {
  const target = e.currentTarget as HTMLElement;
  const slide = Math.round(target.scrollLeft / target.clientWidth);
  const total = target.children.length;
  target.dataset.atStart = slide === 0 ? 'true' : 'false';
  target.dataset.atEnd = slide >= total - 1 ? 'true' : 'false';
  const dotsWrap = target.parentElement?.querySelector('.card-dots');
  if (!dotsWrap) return;
  dotsWrap.querySelectorAll('.card-dot').forEach((d, i) => {
    d.classList.toggle('card-dot-active', i === slide);
  });
}
function scrollCardCarousel(e: MouseEvent, dir: -1 | 1) {
  e.preventDefault();
  e.stopPropagation();
  const btn = e.currentTarget as HTMLElement;
  const wrap = btn.closest('.ccg-image-wrap')?.querySelector('.card-photos') as HTMLElement | null;
  if (!wrap) return;
  wrap.scrollBy({ left: dir * wrap.clientWidth, behavior: 'smooth' });
}
</script>

<template>
  <NuxtLink
    :to="localePath({ name: 'villas-slug', params: { slug: villaSlug } })"
    class="ccg group"
    :class="{ 'ccg-active': active }"
    @mouseenter="emit('hover', villa._id)"
    @mouseleave="emit('leave')"
  >
    <div class="ccg-image-wrap" :data-multi="photos.length > 1 ? 'true' : 'false'">
      <div class="card-photos" data-at-start="true" data-at-end="false" @scroll.passive="onCardScroll">
        <div v-for="(src, i) in photos" :key="i" class="card-photo-slide">
          <img :src="src" :alt="villa.name" loading="lazy" class="ccg-image" />
          <div
            v-if="i === photos.length - 1 && photosHasMore"
            class="card-photo-more"
          >
            <span class="card-photo-more-label">{{ locale === 'fr' ? 'Voir la villa' : 'See villa' }}</span>
            <span class="card-photo-more-arrow" aria-hidden="true">→</span>
          </div>
        </div>
        <div v-if="!photos.length" class="card-photo-slide">
          <div class="ccg-image ccg-image-placeholder"></div>
        </div>
      </div>

      <button
        v-if="photos.length > 1"
        type="button"
        class="card-arrow card-arrow-prev"
        :aria-label="t('villas.prevPhoto')"
        @click="(e) => scrollCardCarousel(e, -1)"
      >
        <svg viewBox="0 0 16 16" fill="none" class="block w-3 h-3">
          <path d="M10 12L6 8L10 4" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
      </button>
      <button
        v-if="photos.length > 1"
        type="button"
        class="card-arrow card-arrow-next"
        :aria-label="t('villas.nextPhoto')"
        @click="(e) => scrollCardCarousel(e, 1)"
      >
        <svg viewBox="0 0 16 16" fill="none" class="block w-3 h-3">
          <path d="M6 4L10 8L6 12" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
      </button>

      <div v-if="photos.length > 1" class="card-dots">
        <span
          v-for="(_, i) in photos"
          :key="i"
          class="card-dot"
          :class="{ 'card-dot-active': i === 0 }"
          aria-hidden="true"
        ></span>
      </div>
    </div>

    <div class="ccg-title-wrap">
      <div class="ccg-title-block">
        <h3 class="ccg-title">{{ villa.name }}</h3>
        <p class="ccg-location">{{ cityLabel(villa.city) }}</p>
      </div>
      <p class="ccg-price">
        <span class="ccg-price-from">{{ locale === 'fr' ? 'dès' : 'from' }}</span>
        <span class="ccg-price-value">{{ fmtPrice(villa.pricePerWeekFrom) }}</span>
        <span class="ccg-price-unit">{{ t('villas.perWeekShort') }}</span>
      </p>
    </div>

    <div class="ccg-icons-row">
      <div class="ccg-icons">
        <span v-if="villa.capacity != null" class="ccg-icon-item">
          <svg viewBox="0 0 16 16" fill="none" aria-hidden="true" class="block w-4 h-4">
            <circle cx="8" cy="5.5" r="2.4" stroke="currentColor" stroke-width="1.3" />
            <path d="M3 13.5C3 11 5.2 9.5 8 9.5S13 11 13 13.5" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" />
          </svg>
          <span>{{ villa.capacity }}</span>
        </span>
        <span v-if="villa.bedrooms != null" class="ccg-icon-item">
          <svg viewBox="0 0 18 18" fill="none" aria-hidden="true" class="block w-4 h-4">
            <path d="M2.5 13.5V5M15.5 13.5V8.5C15.5 7.7 14.8 7 14 7H6V13.5M2.5 11H15.5" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" />
            <path d="M6 9.5C6 8.7 6.7 8 7.5 8H10.5C11.3 8 12 8.7 12 9.5V11H6V9.5Z" stroke="currentColor" stroke-width="1.3" />
          </svg>
          <span>{{ villa.bedrooms }}</span>
        </span>
        <span v-if="villa.bathrooms != null" class="ccg-icon-item">
          <svg viewBox="0 0 18 18" fill="none" aria-hidden="true" class="block w-4 h-4">
            <path d="M2.5 9.5H15.5V11.5C15.5 13.2 14.2 14.5 12.5 14.5H5.5C3.8 14.5 2.5 13.2 2.5 11.5V9.5Z" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round" />
            <path d="M5 9.5V5.5C5 4.4 5.9 3.5 7 3.5C8.1 3.5 9 4.4 9 5.5" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" />
            <path d="M7 5.5L9 5.5" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" />
            <path d="M4 14.5L4 16M14 14.5L14 16" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" />
          </svg>
          <span>{{ villa.bathrooms }}</span>
        </span>
      </div>
      <span v-if="villa.surface != null" class="ccg-icon-item ccg-icon-surface">
        <svg viewBox="0 0 16 16" fill="none" aria-hidden="true" class="block w-4 h-4">
          <rect x="2.5" y="2.5" width="11" height="11" stroke="currentColor" stroke-width="1.3" />
          <path d="M5.5 5.5L5.5 10.5M10.5 5.5L10.5 10.5" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-dasharray="1 1.5" />
        </svg>
        <span>{{ villa.surface }} m²</span>
      </span>
    </div>
  </NuxtLink>
</template>

<style scoped>
.ccg {
  display: flex; flex-direction: column; gap: 12px;
  background: var(--color-misana-paper);
  border: 1px solid var(--color-misana-line);
  border-radius: 6px;
  padding: 10px;
  text-decoration: none; color: var(--color-misana-ink);
  overflow: hidden;
  transition: border-color 0.4s ease, box-shadow 0.4s ease;
}
@media (min-width: 768px) { .ccg { gap: 24px; padding: 24px; } }
.ccg:hover, .ccg-active {
  border-color: var(--color-misana-ink);
  box-shadow: 0 12px 28px -20px rgba(0, 0, 0, 0.18);
}

.ccg-image-wrap {
  position: relative;
  width: 100%; aspect-ratio: 4 / 3;
  overflow: hidden; border-radius: 4px;
  background: var(--color-misana-stone);
}
@media (min-width: 768px) { .ccg-image-wrap { aspect-ratio: 3 / 2; } }
.ccg-image {
  position: absolute; inset: 0;
  width: 100%; height: 100%; object-fit: cover;
}
.ccg-image-placeholder { background: var(--color-misana-stone); }

.ccg-title-wrap {
  display: flex; align-items: flex-start; justify-content: space-between;
  gap: 14px; width: 100%;
}
.ccg-title-block { flex: 1 1 auto; min-width: 0; display: flex; flex-direction: column; gap: 2px; }
.ccg-title {
  font-family: var(--font-display, serif);
  font-size: 1.05rem; font-weight: 500; line-height: 1.2;
  margin: 0; color: var(--color-misana-ink);
  word-break: break-word;
}
@media (min-width: 768px) { .ccg-title { font-size: 1.2rem; line-height: 1.25; } }
.ccg-location {
  margin: 2px 0 0;
  font-size: 0.78rem; color: var(--color-misana-muted);
}

.ccg-price {
  flex: 0 0 auto; margin: 0;
  display: inline-flex; align-items: baseline; justify-content: flex-end;
  gap: 3px; white-space: nowrap;
  line-height: 1.2;
  font-size: 0.78rem;
  color: var(--color-misana-muted);
  font-variant-numeric: tabular-nums;
}
.ccg-price-from { font-style: italic; }
.ccg-price-value { color: var(--color-misana-ink); }
.ccg-price-unit { color: var(--color-misana-muted); }

.ccg-icons-row {
  display: flex; align-items: center; justify-content: space-between;
  gap: 12px;
}
.ccg-icons {
  display: flex; align-items: center;
  gap: 20px; flex-wrap: wrap;
  color: var(--color-misana-ink);
  font-variant-numeric: tabular-nums;
}
.ccg-icon-surface { flex: 0 0 auto; }
.ccg-icon-item {
  display: inline-flex; align-items: center; gap: 5px;
  font-size: 0.82rem;
  color: var(--color-misana-ink);
}
.ccg-icon-item svg {
  color: var(--color-misana-muted);
  flex: 0 0 auto;
}

/* === Carousel inline cards === */
.card-photos {
  display: flex; flex-direction: row;
  width: 100%; height: 100%;
  overflow-x: auto; overflow-y: hidden;
  scroll-snap-type: x mandatory;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
}
.card-photos::-webkit-scrollbar { display: none; }
.card-photo-slide {
  position: relative;
  flex: 0 0 100%;
  width: 100%; height: 100%;
  scroll-snap-align: start;
}
.ccg-image-wrap .ccg-image {
  position: absolute; inset: 0;
  width: 100%; height: 100%; object-fit: cover;
}

.card-photo-more {
  position: absolute; inset: 0;
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  gap: 12px;
  background: rgba(11, 11, 11, 0.55);
  color: var(--color-misana-paper);
  text-align: center;
  pointer-events: none;
}
.card-photo-more-label {
  font-family: var(--font-display, serif);
  font-size: 1.1rem; letter-spacing: 0.02em;
}
.card-photo-more-arrow {
  font-size: 1.5rem; line-height: 1; opacity: 0.9;
  transition: transform 0.3s ease;
}
.ccg:hover .card-photo-more-arrow { transform: translateX(4px); }
.card-arrow {
  position: absolute; top: 50%; transform: translateY(-50%);
  width: 28px; height: 28px;
  display: none; align-items: center; justify-content: center;
  background: rgba(255, 255, 255, 0.96); color: var(--color-misana-ink);
  border: 1px solid rgba(0, 0, 0, 0.06); border-radius: 999px;
  cursor: pointer; padding: 0;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
  opacity: 0; z-index: 2;
  transition: opacity 0.2s ease, transform 0.2s ease;
}
.card-arrow:hover { transform: translateY(-50%) scale(1.08); }
.card-arrow-prev { left: 8px; }
.card-arrow-next { right: 8px; }
@media (hover: hover) and (min-width: 768px) {
  .ccg-image-wrap[data-multi="true"] .card-arrow { display: inline-flex; }
  .ccg:hover .card-arrow { opacity: 1; }
}
.card-photos[data-at-start="true"] ~ .card-arrow-prev {
  opacity: 0 !important;
  pointer-events: none !important;
}
.card-photos[data-at-end="true"] ~ .card-arrow-next {
  opacity: 0 !important;
  pointer-events: none !important;
}
.card-dots {
  position: absolute; bottom: 10px; left: 50%;
  transform: translateX(-50%);
  display: inline-flex; align-items: center; gap: 5px;
  z-index: 2; pointer-events: none;
}
.card-dot {
  width: 6px; height: 6px; border-radius: 999px;
  background: rgba(255, 255, 255, 0.6);
  transition: background 0.25s ease, transform 0.25s ease;
}
.card-dot-active { background: rgba(255, 255, 255, 1); transform: scale(1.15); }
</style>
