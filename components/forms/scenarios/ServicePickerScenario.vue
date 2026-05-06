<script setup lang="ts">
// Service picker : affiche quand /request est ouvert sans aucun query
// param. Liste sobre des 5 services + 1 "multi". Selon le service choisi :
//
// - Chauffeur : sous-picker Transfert / Mise a disposition
//     -> /request?service=chauffeur&mode=transfer  (ChauffeurTransferScenario)
//     -> /request?service=chauffeur&mode=disposal (ChauffeurDisposalScenario)
// - Cars      : sous-picker Demande contact / Voir la flotte
//     -> /request?service=cars  (CarsGenericScenario)
//     -> /voitures/all          (page listing)
// - Yacht     : sous-picker Demande contact / Voir nos yachts
//     -> /request?service=yacht (YachtScenario)
//     -> /yacht/all             (page listing)
// - Helicopter: direct -> /request?service=helicopter (HelicopterRouteScenario)
// - Access    : direct -> /request?service=access     (AccessScenario)
// - Multi     : direct -> /request?service=multi      (GenericScenario)
const localePath = useLocalePath();
const { t } = useI18n();

type ServiceKey = 'chauffeur' | 'cars' | 'yacht' | 'helicopter' | 'access' | 'multi';
type SubPickerKey = 'chauffeur' | 'cars' | 'yacht' | null;

// Prop forceSub : quand on arrive sur /request?service=chauffeur (ou cars,
// yacht) sans mode/contexte precis, le composable retourne *-picker et
// la page rend ce composant avec forceSub = service. On bypass alors le
// niveau 1 et on affiche directement le sous-picker du service choisi.
const props = defineProps<{ forceSub?: SubPickerKey }>();

const services: ServiceKey[] = ['chauffeur', 'cars', 'yacht', 'helicopter', 'access', 'multi'];

// Quels services revelent un sous-niveau au clic, vs navigation directe.
const SERVICES_WITH_SUB: SubPickerKey[] = ['chauffeur', 'cars', 'yacht'];
const subPicker = ref<SubPickerKey>(props.forceSub ?? null);

function directLinkFor(s: ServiceKey) {
  return localePath({ path: '/request', query: { service: s } });
}

function onServiceClick(s: ServiceKey, e: Event) {
  if (SERVICES_WITH_SUB.includes(s as SubPickerKey)) {
    e.preventDefault();
    subPicker.value = s as SubPickerKey;
  }
  // Sinon le NuxtLink fait son travail (navigation).
}

// Si on est en forceSub (URL = ?service=chauffeur), revenir au niveau 1
// implique de naviguer vers /request sans query : le composable retombe
// sur 'service-picker' et la page re-render le picker complet.
function back() {
  if (props.forceSub) {
    navigateTo(localePath('/request'));
    return;
  }
  subPicker.value = null;
}

// Sous-options par service. 2 options chacune.
type SubOption = { key: string; to: ReturnType<typeof localePath> };
const subOptions = computed<SubOption[]>(() => {
  const sp = subPicker.value;
  if (!sp) return [];
  if (sp === 'chauffeur') {
    return [
      { key: 'transfer', to: localePath({ path: '/request', query: { service: 'chauffeur', mode: 'transfer' } }) },
      { key: 'disposal', to: localePath({ path: '/request', query: { service: 'chauffeur', mode: 'disposal' } }) },
    ];
  }
  if (sp === 'cars') {
    return [
      { key: 'contact', to: localePath({ path: '/request', query: { service: 'cars', mode: 'contact' } }) },
      { key: 'listing', to: localePath('/voitures/all') },
    ];
  }
  // yacht
  return [
    { key: 'contact', to: localePath({ path: '/request', query: { service: 'yacht', mode: 'contact' } }) },
    { key: 'listing', to: localePath('/yacht/all') },
  ];
});
</script>

<template>
  <fieldset class="scenario-block sp-block">
    <!-- Niveau 1 : choix du service -->
    <div v-if="!subPicker">
      <legend class="scenario-legend sp-legend">{{ t('request.picker.title') }}</legend>
      <p class="sp-lead">{{ t('request.picker.lead') }}</p>

      <ul class="sp-list">
        <li v-for="s in services" :key="s" class="sp-item">
          <NuxtLink :to="directLinkFor(s)" class="sp-link group" @click="onServiceClick(s, $event)">
            <div class="sp-text">
              <span class="sp-label">{{ t(`request.picker.services.${s}.label`) }}</span>
              <span class="sp-sub">{{ t(`request.picker.services.${s}.sub`) }}</span>
            </div>
            <span class="sp-arrow inline-flex items-center justify-center w-[1.1em] h-[1.1em] transition-transform duration-500 group-hover:translate-x-2">
              <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" class="block w-full h-full">
                <path d="M7 12H17" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" />
                <path d="M13.5 8.5L17 12L13.5 15.5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
            </span>
          </NuxtLink>
        </li>
      </ul>
    </div>

    <!-- Niveau 2 : sous-options du service selectionne -->
    <div v-else>
      <button type="button" class="sp-back" @click="back">
        <span aria-hidden="true">←</span>
        <span>{{ t('request.picker.back') }}</span>
      </button>
      <legend class="scenario-legend sp-legend">{{ t(`request.picker.sub.${subPicker}.title`) }}</legend>
      <p class="sp-lead">{{ t(`request.picker.sub.${subPicker}.lead`) }}</p>

      <ul class="sp-list">
        <li v-for="opt in subOptions" :key="opt.key" class="sp-item">
          <NuxtLink :to="opt.to" class="sp-link group">
            <div class="sp-text">
              <span class="sp-label">{{ t(`request.picker.sub.${subPicker}.options.${opt.key}.label`) }}</span>
              <span class="sp-sub">{{ t(`request.picker.sub.${subPicker}.options.${opt.key}.sub`) }}</span>
            </div>
            <span class="sp-arrow inline-flex items-center justify-center w-[1.1em] h-[1.1em] transition-transform duration-500 group-hover:translate-x-2">
              <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" class="block w-full h-full">
                <path d="M7 12H17" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" />
                <path d="M13.5 8.5L17 12L13.5 15.5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
            </span>
          </NuxtLink>
        </li>
      </ul>
    </div>
  </fieldset>
</template>

<style scoped>
@import './_shared.css';

.sp-block { gap: 1.25rem; }
.sp-legend { font-size: 1.6rem; }
.sp-lead {
  color: var(--color-misana-muted);
  font-size: 0.95rem;
  line-height: 1.55;
  max-width: 38rem;
  margin: 0 0 0.5rem;
}
.sp-back {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.4rem 0;
  margin: 0 0 1rem;
  font-size: 0.75rem;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--color-misana-muted);
  background: transparent;
  border: 0;
  cursor: pointer;
  transition: color 0.2s ease;
}
.sp-back:hover { color: var(--color-misana-ink); }
.sp-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  border-top: 1px solid var(--color-misana-line);
}
.sp-item { border-bottom: 1px solid var(--color-misana-line); }
.sp-link {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 1.15rem 0.25rem;
  color: var(--color-misana-ink);
  text-decoration: none;
  transition: padding-left 0.35s ease, color 0.2s ease;
}
.sp-link:hover { padding-left: 0.6rem; }
.sp-text {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  min-width: 0;
}
.sp-label {
  font-family: var(--font-display);
  font-size: 1.5rem;
  line-height: 1.1;
}
.sp-sub {
  font-size: 0.85rem;
  color: var(--color-misana-muted);
  letter-spacing: 0.01em;
}
.sp-arrow { color: var(--color-misana-ink); flex-shrink: 0; }

@media (min-width: 640px) {
  .sp-link { padding: 1.4rem 0.25rem; }
  .sp-label { font-size: 1.75rem; }
}
</style>
