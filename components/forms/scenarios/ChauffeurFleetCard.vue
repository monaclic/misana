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

// Affiche "A partir de" devant le prix uniquement si c est un vrai prix
// (pas pour 'Sur demande' / 'Trop petit' qui ne se prefixent pas).
const hasRealPrice = computed(() => typeof props.price === 'number');
const fromLabel = computed(() => (props.priceLocale ?? 'en') === 'fr' ? 'À partir de' : 'From');
</script>

<template>
  <button
    type="button"
    class="cf-card"
    :class="{ 'cf-card-selected': selected, 'cf-card-disabled': disabled }"
    :disabled="disabled"
    :aria-pressed="selected"
    @click="$emit('select')"
  >
    <!-- Cercle indicateur radio en haut a droite : etat 'a choisir' visible -->
    <span class="cf-check" aria-hidden="true">
      <svg v-if="selected" viewBox="0 0 16 16" class="cf-check-icon">
        <path d="M3 8.5L6.5 12L13 5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
      </svg>
    </span>

    <div v-if="fmtPrice !== null" class="cf-price-row">
      <span v-if="hasRealPrice" class="cf-price-prefix">{{ fromLabel }}</span>
      <span class="cf-price-value">{{ fmtPrice }}</span>
    </div>

    <div class="cf-image-wrap" :class="imageMode === 'cover' ? 'cf-image-cover' : 'cf-image-contain'">
      <div
        v-if="image"
        class="cf-image-bg"
        :style="{ backgroundImage: `url('${image}')` }"
        role="img"
        :aria-label="name"
      ></div>
      <span v-else class="cf-image-placeholder">{{ name }}</span>
    </div>

    <div class="cf-body">
      <div class="cf-titles">
        <h3 class="cf-name">{{ name }}</h3>
        <p class="cf-type">{{ type }}</p>
      </div>

      <div class="cf-stats">
        <div class="cf-stat">
          <span class="cf-stat-label">Pax</span>
          <span class="cf-stat-value">{{ pax }}</span>
        </div>
        <span class="cf-stat-divider" aria-hidden="true"></span>
        <div class="cf-stat">
          <span class="cf-stat-label">Bagages</span>
          <span class="cf-stat-value">{{ luggage }}</span>
        </div>
      </div>
    </div>
  </button>
</template>

<style scoped>
.cf-card {
  position: relative;
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

.cf-check {
  position: absolute;
  top: 0.7rem;
  right: 0.7rem;
  width: 22px;
  height: 22px;
  border: 1.5px solid var(--color-misana-line);
  border-radius: 999px;
  background: var(--color-misana-paper);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  z-index: 2;
  transition: border-color 0.2s ease, background 0.2s ease;
}
.cf-card:not(:disabled):hover .cf-check { border-color: var(--color-misana-ink); }
.cf-card-selected .cf-check {
  border-color: var(--color-misana-ink);
  background: var(--color-misana-ink);
  color: var(--color-misana-paper);
}
.cf-check-icon { width: 14px; height: 14px; }
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
  position: relative;
  width: 100%;
  height: 200px;
  overflow: hidden;
  background: var(--color-misana-stone);
}
.cf-image-contain { background: var(--color-misana-paper); }
@media (min-width: 560px) {
  .cf-image-wrap { height: 220px; }
}
.cf-price-row {
  display: flex;
  align-items: baseline;
  gap: 0.4rem;
  padding: 0.85rem 1.05rem;
  border-bottom: 1px solid var(--color-misana-line);
  background: var(--color-misana-paper);
}
.cf-card-selected .cf-price-row {
  background: var(--color-misana-stone);
}
/* Pattern bulletproof : div avec background-image au lieu de <img>.
   Le div n a pas de taille intrinseque, impossible de deborder, peu
   importe la resolution ou le ratio de la photo source. */
.cf-image-bg {
  position: absolute;
  inset: 0;
  background-repeat: no-repeat;
  background-position: center;
  transition: transform 0.5s cubic-bezier(0.16, 1, 0.3, 1);
}
/* TOUS les vehicules en background-size: contain. La photo Sprinter
   s affiche entiere avec fond stone autour, alignee avec les PNG des
   autres. Plus de crop, plus de debordement, plus de difference visuelle. */
.cf-image-contain .cf-image-bg,
.cf-image-cover .cf-image-bg {
  background-size: contain;
  inset: 0.5rem;
}
.cf-image-placeholder {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: var(--font-display, serif);
  font-size: 1.1rem;
  color: var(--color-misana-muted);
  text-align: center;
  padding: 0 1rem;
  letter-spacing: 0.02em;
}
.cf-card:not(:disabled):hover .cf-image-bg { transform: scale(1.03); }

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
  gap: 0.35rem;
  flex: 1;
  min-width: 0;
}
.cf-stat-label {
  font-size: 0.6rem;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--color-misana-muted);
}
.cf-stat-value {
  font-size: 0.85rem;
  line-height: 1;
  color: var(--color-misana-ink);
  font-weight: 500;
  white-space: nowrap;
}
.cf-stat-divider {
  width: 1px;
  height: 12px;
  background: var(--color-misana-line);
  flex-shrink: 0;
}

.cf-price-prefix {
  font-size: 0.6rem;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--color-misana-muted);
}
.cf-price-value {
  font-family: var(--font-display, serif);
  font-size: 0.95rem;
  line-height: 1;
  color: var(--color-misana-ink);
  font-weight: 500;
}
</style>
