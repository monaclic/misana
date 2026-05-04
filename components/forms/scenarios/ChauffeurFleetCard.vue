<script setup lang="ts">
// Card vehicule selectable, calque visuel sur la fleet du hub chauffeur
// (pages/services/chauffeur/index.vue). Ajoute un etat "selectionne" et
// un footer prix. Click = toggle.
//
// Image en mode contain (PNG Leader Limousines transparents) ou cover
// pour les photos qui ont besoin d un fond (ex Sprinter).
const props = defineProps<{
  selected?: boolean;
  disabled?: boolean;
  name: string;
  type: string;
  pax: number;
  luggage: string | number;
  image?: string;
  imageMode?: 'contain' | 'cover';
  badge?: 'popular' | 'flagship';
  badgeLabel?: string;
  price?: number | null;
  priceLocale?: 'en' | 'fr';
  onRequestLabel?: string;
}>();
defineEmits<{ (e: 'select'): void }>();

const fmtPrice = computed(() => {
  if (props.price === undefined) return null;
  if (props.price === null) return props.onRequestLabel ?? '';
  return new Intl.NumberFormat((props.priceLocale ?? 'en') === 'fr' ? 'fr-FR' : 'en-GB', {
    style: 'currency', currency: 'EUR', maximumFractionDigits: 0,
  }).format(props.price);
});
</script>

<template>
  <button
    type="button"
    class="cf-card"
    :class="{ 'cf-card-selected': selected, 'cf-card-disabled': disabled }"
    :disabled="disabled"
    @click="$emit('select')"
  >
    <div class="cf-card-top">
      <div class="cf-card-titles">
        <h3 class="cf-name">{{ name }}</h3>
        <p class="cf-type">{{ type }}</p>
      </div>
      <span v-if="badge" class="cf-badge">{{ badgeLabel || badge }}</span>
    </div>

    <div class="cf-image-wrap" :class="imageMode === 'cover' ? 'cf-image-cover' : 'cf-image-contain'">
      <img v-if="image" :src="image" :alt="name" loading="lazy" draggable="false" class="cf-image" />
    </div>

    <div class="cf-stats">
      <div class="cf-stat">
        <p class="cf-stat-label">Pax</p>
        <p class="cf-stat-value">{{ pax }}</p>
      </div>
      <span class="cf-stat-divider" aria-hidden="true"></span>
      <div class="cf-stat">
        <p class="cf-stat-label">Bagages</p>
        <p class="cf-stat-value">{{ luggage }}</p>
      </div>
      <span v-if="fmtPrice !== null" class="cf-stat-divider" aria-hidden="true"></span>
      <div v-if="fmtPrice !== null" class="cf-stat cf-stat-price">
        <p class="cf-stat-label">Tarif</p>
        <p class="cf-stat-value cf-price">{{ fmtPrice }}</p>
      </div>
    </div>
  </button>
</template>

<style scoped>
.cf-card {
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
  padding: 1.4rem 1.3rem 1.2rem;
  background: var(--color-misana-paper);
  border: 1px solid var(--color-misana-line);
  border-radius: 12px;
  text-align: left;
  color: var(--color-misana-ink);
  cursor: pointer;
  font-family: inherit;
  transition: border-color 0.3s ease, transform 0.3s ease, box-shadow 0.3s ease;
}
.cf-card:not(:disabled):hover {
  border-color: var(--color-misana-ink);
  transform: translateY(-2px);
}
.cf-card-selected {
  border-color: var(--color-misana-ink);
  box-shadow: inset 0 0 0 1px var(--color-misana-ink);
}
.cf-card-disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.cf-card-top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 0.7rem;
}
.cf-card-titles {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
  min-width: 0;
}
.cf-name {
  font-family: var(--font-display, serif);
  font-size: 1.2rem;
  line-height: 1.15;
  margin: 0;
  color: var(--color-misana-ink);
}
.cf-type {
  font-size: 0.65rem;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--color-misana-muted);
  margin: 0;
}
.cf-badge {
  flex-shrink: 0;
  font-size: 0.6rem;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  padding: 0.25rem 0.55rem;
  background: var(--color-misana-ink);
  color: var(--color-misana-paper);
  border-radius: 999px;
  white-space: nowrap;
}

.cf-image-wrap {
  width: 100%;
  aspect-ratio: 16 / 9;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}
.cf-image-contain { background: transparent; }
.cf-image-cover {
  background: var(--color-misana-stone);
  border-radius: 8px;
}
.cf-image {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  transition: transform 0.6s cubic-bezier(0.16, 1, 0.3, 1);
}
.cf-image-cover .cf-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
  transform: scale(1.18);
}
.cf-card:not(:disabled):hover .cf-image { transform: scale(1.04); }
.cf-card:not(:disabled):hover .cf-image-cover .cf-image { transform: scale(1.22); }

.cf-stats {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  padding-top: 1rem;
  border-top: 1px solid var(--color-misana-line);
}
.cf-stat {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 0.3rem;
  flex: 1;
  min-width: 0;
}
.cf-stat-label {
  font-size: 0.6rem;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: var(--color-misana-muted);
  margin: 0;
}
.cf-stat-value {
  font-family: var(--font-display, serif);
  font-size: 1rem;
  line-height: 1;
  color: var(--color-misana-ink);
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.cf-stat-price .cf-price {
  font-weight: 500;
}
.cf-stat-divider {
  width: 1px;
  height: 24px;
  background: var(--color-misana-line);
  flex-shrink: 0;
}
</style>
