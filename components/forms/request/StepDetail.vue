<script setup lang="ts">
// Etape 2 : panel du service unique selectionne.
// Chaque panel inclut ses dates (chauffeur/helicopter ont aussi un trip type
// one-way / round-trip avec dates retour).
import { useRequestStore } from '~/stores/request';

const store = useRequestStore();
const { t } = useI18n();
</script>

<template>
  <section class="space-y-8">
    <div>
      <h2 class="font-display text-3xl mb-2">{{ t('request.step.detail') }}</h2>
      <p class="text-misana-muted text-sm">{{ t('request.detailIntro') }}</p>
    </div>

    <div v-if="!store.service" class="text-misana-muted text-sm">
      {{ t('request.noService') }}
    </div>

    <div v-else>
      <PanelChauffeur v-if="store.service === 'chauffeur'" />
      <PanelCars v-else-if="store.service === 'cars'" />
      <PanelYacht v-else-if="store.service === 'yacht'" />
      <PanelHelicopter v-else-if="store.service === 'helicopter'" />
      <PanelAccess v-else-if="store.service === 'access'" />
    </div>
  </section>
</template>
