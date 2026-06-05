<script setup lang="ts">
// Bloc repliable (accordeon) facon Le Collectionist : bouton pleine largeur
// avec libelle en capitales + icone "+" qui pivote, contenu a hauteur animee.
// Replie par defaut pour alleger la page tout en gardant l'info accessible.
defineProps<{ title: string }>();
const open = ref(false);
</script>

<template>
  <div class="villa-collapse">
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
        <div class="villa-collapse-pad"><slot /></div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.villa-collapse { border-top: 1px solid var(--color-misana-line); }
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

@media (prefers-reduced-motion: reduce) {
  .villa-collapse-outer, .villa-collapse-icon { transition: none; }
}
</style>
