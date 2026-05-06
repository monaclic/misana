<script setup lang="ts">
// Etape 1 : choix unique d un service.
// Cars et Yacht renvoient sur le catalog : choix d un vehicule precis avant
// de remplir un formulaire (le formulaire embarque vit sur la fiche produit).
// Chauffeur, Helicopter, Access continuent dans le tronc /request.

import { SERVICES, type Service } from '~/types/request';
import { useRequestStore } from '~/stores/request';

const store = useRequestStore();
const { t } = useI18n();
const localePath = useLocalePath();

const CATALOG_SERVICES: Service[] = ['cars', 'yacht'];

function pick(s: Service) {
  if (CATALOG_SERVICES.includes(s)) {
    return navigateTo(localePath(`/${s}`));
  }
  store.selectService(s);
}
</script>

<template>
  <section class="space-y-10">
    <div>
      <h2 class="font-display text-3xl mb-2">{{ t('request.step.context') }}</h2>
      <p class="text-misana-muted text-sm">{{ t('request.contextIntro') }}</p>
    </div>

    <div>
      <p class="text-sm uppercase tracking-wide text-misana-muted mb-4">
        {{ t('request.service.label') }}
      </p>
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <button
          v-for="svc in SERVICES"
          :key="svc"
          type="button"
          class="text-left border p-5 transition"
          :class="
            store.service === svc
              ? 'border-misana-ink bg-misana-ink text-misana-paper'
              : 'border-misana-line hover:border-misana-ink'
          "
          @click="pick(svc)"
        >
          <div class="flex items-center justify-between">
            <span class="font-display text-xl">{{ t(`request.service.${svc}`) }}</span>
            <span
              class="w-6 h-6 inline-flex items-center justify-center text-xs border rounded-full"
              :class="
                store.service === svc
                  ? 'border-misana-paper text-misana-paper'
                  : 'border-misana-line text-misana-muted'
              "
              aria-hidden="true"
            >
              {{ store.service === svc ? '✓' : (CATALOG_SERVICES.includes(svc) ? '→' : '') }}
            </span>
          </div>
          <p class="text-sm mt-2 opacity-75">{{ t(`request.serviceTagline.${svc}`) }}</p>
          <p
            v-if="CATALOG_SERVICES.includes(svc)"
            class="text-[10px] uppercase tracking-widest opacity-60 mt-3"
          >
            {{ t('request.browseCatalog') }}
          </p>
        </button>
      </div>
    </div>
  </section>
</template>
