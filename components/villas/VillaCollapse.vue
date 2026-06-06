<script setup lang="ts">
// Bloc repliable (accordeon) facon Le Collectionist : bouton pleine largeur
// avec libelle en capitales + icone "+" qui pivote, contenu a hauteur animee.
// Replie par defaut pour alleger la page tout en gardant l'info accessible.
defineProps<{ title: string }>();
const { t } = useI18n();
const open = ref(false);
const root = ref<HTMLElement | null>(null);

// Fermeture depuis le bas (mobile) : on referme et on ramene le titre du bloc
// en haut, pour ne pas avoir a remonter manuellement apres une longue liste.
function closeFromBottom() {
  open.value = false;
  nextTick(() => {
    root.value?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
}
</script>

<template>
  <div ref="root" class="villa-collapse">
    <button type="button" class="villa-collapse-btn" :aria-expanded="open" @click="open = !open">
      <span>{{ title }}</span>
      <svg
        class="villa-collapse-icon"
        :class="{ 'is-open': open }"
        viewBox="0 0 24 24" fill="none" stroke="currentColor"
        stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"
        aria-hidden="true"
      >
        <path d="M6 12h6m6 0h-6m0 0V6m0 6v6" />
      </svg>
    </button>
    <div class="villa-collapse-outer" :class="{ 'is-open': open }">
      <div class="villa-collapse-inner">
        <div class="villa-collapse-pad">
          <slot />
          <button v-if="open" type="button" class="villa-collapse-close" @click="closeFromBottom">
            <span>{{ t('villas.fiche.collapse') }}</span>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <path d="M18 15l-6-6-6 6" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.villa-collapse { border-top: 1px solid var(--color-misana-line); scroll-margin-top: 80px; }
.villa-collapse-btn {
  width: 100%;
  display: flex; align-items: center; justify-content: space-between;
  gap: 1rem; padding: 1.5rem 0;
  background: transparent; border: 0; cursor: pointer;
  font-family: inherit; text-align: left;
  color: var(--color-misana-ink);
  font-size: 1.05rem; letter-spacing: 0.04em; text-transform: uppercase;
}
.villa-collapse-icon { width: 20px; height: 20px; flex: 0 0 auto; transition: transform 0.3s ease; }
.villa-collapse-icon.is-open { transform: rotate(45deg); }
.villa-collapse-outer {
  display: grid;
  grid-template-rows: 0fr;
  transition: grid-template-rows 0.35s ease;
}
.villa-collapse-outer.is-open { grid-template-rows: 1fr; }
.villa-collapse-inner { overflow: hidden; min-height: 0; }
.villa-collapse-pad { padding-bottom: 1.75rem; }

/* Fermer depuis le bas : visible en mobile uniquement (sur desktop le titre
   reste a portee, pas besoin). */
.villa-collapse-close {
  display: flex; align-items: center; justify-content: center; gap: 0.5rem;
  width: 100%; margin-top: 1.5rem; padding: 0.85rem 1rem;
  background: transparent;
  border: 1px solid var(--color-misana-line);
  border-radius: 4px;
  cursor: pointer; font-family: inherit;
  color: var(--color-misana-muted);
  font-size: 0.68rem; letter-spacing: 0.16em; text-transform: uppercase;
  transition: border-color 0.3s ease, color 0.3s ease;
}
.villa-collapse-close:hover { border-color: var(--color-misana-ink); color: var(--color-misana-ink); }
.villa-collapse-close svg { width: 15px; height: 15px; flex: 0 0 auto; }
@media (min-width: 1024px) { .villa-collapse-close { display: none; } }

@media (prefers-reduced-motion: reduce) {
  .villa-collapse-outer, .villa-collapse-icon { transition: none; }
}
</style>
