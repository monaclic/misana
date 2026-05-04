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
    <div class="cf-image-wrap" :class="imageMode === 'cover' ? 'cf-image-cover' : 'cf-image-contain'">
      <img v-if="image" :src="image" :alt="name" loading="lazy" draggable="false" class="cf-image" />
    </div>

    <div class="cf-body">
      <div class="cf-titles">
        <h3 class="cf-name">{{ name }}</h3>
        <p class="cf-type">{{ type }}</p>
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
      </div>

      <p v-if="fmtPrice !== null" class="cf-price">{{ fmtPrice }}</p>
    </div>
  </button>
</template>

<style scoped>
.cf-card {
  display: flex;
  flex-direction: column;
  background: var(--color-misana-paper);
  border: 1px solid var(--color-misana-line);
  border-radius: 8px;
  text-align: left;
  color: var(--color-misana-ink);
  cursor: pointer;
  font-family: inherit;
  overflow: hidden;
  transition: border-color 0.25s ease, transform 0.25s ease, box-shadow 0.25s ease;
}
.cf-card:not(:disabled):hover {
  border-color: var(--color-misana-ink);
}
.cf-card-selected {
  border-color: var(--color-misana-ink);
  box-shadow: inset 0 0 0 1px var(--color-misana-ink);
}
.cf-card-disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

.cf-image-wrap {
  width: 100%;
  aspect-ratio: 5 / 3;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  background: var(--color-misana-stone);
}
.cf-image-contain { background: var(--color-misana-paper); padding: 0.5rem; }
.cf-image {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  transition: transform 0.5s cubic-bezier(0.16, 1, 0.3, 1);
}
.cf-image-cover .cf-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
  transform: scale(1.12);
}
.cf-card:not(:disabled):hover .cf-image { transform: scale(1.03); }
.cf-card:not(:disabled):hover .cf-image-cover .cf-image { transform: scale(1.16); }

.cf-body {
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
  padding: 1rem 1.05rem 1.05rem;
}

.cf-titles {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  min-width: 0;
}
.cf-name {
  font-family: var(--font-display, serif);
  font-size: 1.05rem;
  line-height: 1.2;
  margin: 0;
  color: var(--color-misana-ink);
}
.cf-type {
  font-size: 0.62rem;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--color-misana-muted);
  margin: 0;
}

.cf-stats {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding-top: 0.7rem;
  border-top: 1px solid var(--color-misana-line);
}
.cf-stat {
  display: flex;
  align-items: baseline;
  gap: 0.3rem;
  flex: 1;
  min-width: 0;
}
.cf-stat-label {
  font-size: 0.6rem;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--color-misana-muted);
  margin: 0;
}
.cf-stat-value {
  font-size: 0.85rem;
  line-height: 1;
  color: var(--color-misana-ink);
  margin: 0;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.cf-stat-divider {
  width: 1px;
  height: 12px;
  background: var(--color-misana-line);
  flex-shrink: 0;
}

.cf-price {
  margin: 0;
  font-family: var(--font-display, serif);
  font-size: 1.15rem;
  line-height: 1;
  color: var(--color-misana-ink);
}
</style>
