<script setup lang="ts">
// Bandeau contexte affiche en haut du formulaire /request.
// Affiche : image (si dispo) + label + sous-label + bouton modifier
// + bouton WhatsApp pre-rempli avec le contexte.
//
// Mobile-first : image 48px, padding compact. Desktop : image 64px.
import type { ScenarioContext } from '~/composables/useRequestScenario';
import { useGlobalSettings } from '~/composables/useGlobalSettings';
import { HELI_DEPARTURES, HELI_ROUTES } from '~/lib/heliRoutes';

const props = defineProps<{
  context: ScenarioContext;
}>();

const { t, locale } = useI18n();
const { settings } = useGlobalSettings();

// State partage : selects from/to du trajet helico, pilotes depuis ce
// banner. HelicopterRouteScenario lit ces valeurs et synchronise sa data.
const editingHeliRoute = useState<boolean>('request-edit-heli-route', () => false);
const heliRouteFromId = useState<string | undefined>('request-heli-from', () => undefined);
const heliRouteToId = useState<string | undefined>('request-heli-to', () => undefined);

// Liste des heliports utilisables comme depart/arrivee (4 hubs + variants).
const heliportOptions = computed(() => {
  const opts: { id: string; label: string }[] = [];
  for (const dep of HELI_DEPARTURES) {
    opts.push({ id: dep.id, label: locale.value === 'fr' ? dep.cityFr : dep.city });
    if (dep.variants) {
      for (const v of dep.variants) {
        opts.push({
          id: v.id,
          label: `${locale.value === 'fr' ? dep.cityFr : dep.city} · ${locale.value === 'fr' ? v.labelFr : v.label}`,
        });
      }
    }
  }
  return opts;
});

// Lien WhatsApp pre-rempli avec le contexte herite. Si pas de
// numero WhatsApp configure dans Sanity, le bouton est cache.
const whatsappLink = computed(() => {
  const num = settings.value.whatsappNumber?.replace(/\s+/g, '');
  if (!num) return null;
  const text = props.context.contextSubLabel
    ? `Bonjour, je suis intéressé par : ${props.context.contextLabel} — ${props.context.contextSubLabel}.`
    : `Bonjour, ${props.context.contextLabel}.`;
  return `https://wa.me/${num.replace(/^\+/, '')}?text=${encodeURIComponent(text)}`;
});

const replyText = computed(() => {
  const map: Record<string, string> = {
    '30min': t('request.replyPromise.30min'),
    '1h': t('request.replyPromise.1h'),
    '24h': t('request.replyPromise.24h'),
  };
  return map[props.context.replyPromise] || '';
});

// En mode helicopter-route, le label / sublabel / prix doivent suivre
// les choix from/to en temps reel (sinon le bandeau reste fige sur les
// valeurs initiales de l URL apres modification).
const heliRoute = computed(() => {
  if (props.context.scenarioId !== 'helicopter-route') return null;
  const from = heliRouteFromId.value;
  const to = heliRouteToId.value;
  if (!from || !to) return null;
  return HELI_ROUTES.find((r) => {
    const f = r.fromId === 'CEQ' ? ['CEQ', 'CNQ'] : r.fromId === 'LTT' ? ['LTT', 'STG'] : [r.fromId];
    const t_ = r.toId === 'CEQ' ? ['CEQ', 'CNQ'] : r.toId === 'LTT' ? ['LTT', 'STG'] : [r.toId];
    return f.includes(from) && t_.includes(to);
  }) || null;
});

const heliCityLabel = (id: string | undefined) => {
  if (!id) return '';
  for (const dep of HELI_DEPARTURES) {
    if (dep.id === id) return locale.value === 'fr' ? dep.cityFr : dep.city;
    const v = dep.variants?.find((v) => v.id === id);
    if (v) return locale.value === 'fr' ? dep.cityFr : dep.city;
  }
  return id;
};

const liveLabel = computed(() => {
  if (props.context.scenarioId !== 'helicopter-route') return props.context.contextLabel;
  const f = heliCityLabel(heliRouteFromId.value);
  const t_ = heliCityLabel(heliRouteToId.value);
  if (f && t_) return `${f} → ${t_}`;
  return props.context.contextLabel;
});

const liveSubLabel = computed(() => {
  if (props.context.scenarioId !== 'helicopter-route') return props.context.contextSubLabel;
  const r = heliRoute.value;
  if (r) return `${locale.value === 'fr' ? 'Transfert hélicoptère' : 'Helicopter transfer'} · ${r.duration}`;
  return props.context.contextSubLabel;
});

// Tarif indicatif formate selon la locale.
// Pour helicopter-route, on calcule le min en temps reel sur la route choisie.
const priceText = computed(() => {
  let value: number | undefined;
  let unit: 'day' | 'week' | 'trip' | undefined;
  let currency = 'EUR';

  if (props.context.scenarioId === 'helicopter-route') {
    const r = heliRoute.value;
    if (r) {
      const prices = Object.values(r.price).filter((p): p is number => typeof p === 'number');
      if (prices.length) {
        value = Math.min(...prices);
        unit = 'trip';
      }
    }
  } else if (props.context.priceFrom) {
    value = props.context.priceFrom.value;
    unit = props.context.priceFrom.unit;
    currency = props.context.priceFrom.currency;
  }

  if (value === undefined || !unit) return '';

  const fmt = new Intl.NumberFormat(locale.value === 'fr' ? 'fr-FR' : 'en-GB', {
    style: 'currency', currency, maximumFractionDigits: 0,
  }).format(value);
  const unitKey =
    unit === 'day' ? 'request.priceUnit.day'
    : unit === 'week' ? 'request.priceUnit.week'
    : 'request.priceUnit.trip';
  return t('request.priceFromPrefix') + ' ' + fmt + ' ' + t(unitKey);
});

</script>

<template>
  <div class="context-banner">
    <div class="context-banner-inner">
      <!-- Image visuelle si dispo (fiche precise) -->
      <div v-if="context.contextImage" class="context-banner-image">
        <img :src="context.contextImage" :alt="context.contextLabel" loading="lazy" />
      </div>
      <!-- Sinon icone de service generique -->
      <div v-else class="context-banner-icon" aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <circle cx="12" cy="12" r="9" />
          <path d="M12 7v5l3 2" stroke-linecap="round" />
        </svg>
      </div>

      <div class="context-banner-text">
        <p class="context-banner-kicker">{{ t('request.contextKicker') }}</p>

        <!-- Mode edition trajet helico : selects inline a la place du label -->
        <div
          v-if="context.scenarioId === 'helicopter-route' && editingHeliRoute"
          class="banner-route-edit"
        >
          <select
            :value="heliRouteFromId"
            class="banner-route-select"
            @change="heliRouteFromId = ($event.target as HTMLSelectElement).value"
          >
            <option value="" disabled>—</option>
            <option v-for="o in heliportOptions" :key="`f-${o.id}`" :value="o.id">{{ o.label }}</option>
          </select>
          <span class="banner-route-arrow" aria-hidden="true">→</span>
          <select
            :value="heliRouteToId"
            class="banner-route-select"
            @change="heliRouteToId = ($event.target as HTMLSelectElement).value"
          >
            <option value="" disabled>—</option>
            <option v-for="o in heliportOptions" :key="`t-${o.id}`" :value="o.id">{{ o.label }}</option>
          </select>
          <button
            type="button"
            class="banner-route-confirm"
            :disabled="!heliRouteFromId || !heliRouteToId"
            @click="editingHeliRoute = false"
          >
            {{ t('request.scenario.helicopter.confirmRoute') }}
          </button>
        </div>
        <p v-else class="context-banner-label">{{ liveLabel }}</p>

        <p v-if="liveSubLabel" class="context-banner-sublabel">
          {{ liveSubLabel }}
        </p>
      </div>
    </div>

    <!-- Tarif indicatif (V1 : pour la confiance, pas de transaction) -->
    <p v-if="priceText" class="context-banner-price">
      <span class="context-banner-price-value">{{ priceText }}</span>
      <span class="context-banner-price-note">{{ t('request.priceFootnote') }}</span>
    </p>

    <div class="context-banner-actions">
      <button
        v-if="context.scenarioId === 'helicopter-route' && !editingHeliRoute"
        type="button"
        class="context-banner-modify"
        @click="editingHeliRoute = true"
      >
        {{ t('request.scenario.helicopter.editRoute') }}
      </button>
      <NuxtLink
        v-if="context.backLink"
        :to="context.backLink"
        class="context-banner-modify"
      >
        {{ t('request.modifyContext') }}
      </NuxtLink>
    </div>

    <p v-if="replyText" class="context-banner-reply">{{ replyText }}</p>
  </div>
</template>

<style scoped>
.context-banner {
  border: 1px solid var(--color-misana-line);
  background: var(--color-misana-paper);
  padding: 1rem 1.1rem;
  margin-bottom: 1.5rem;
  border-radius: 4px;
}

.context-banner-inner {
  display: flex;
  align-items: center;
  gap: 0.85rem;
}

.context-banner-image {
  width: 48px;
  height: 48px;
  flex-shrink: 0;
  overflow: hidden;
  background: var(--color-misana-stone);
  border-radius: 2px;
}
.context-banner-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}
@media (min-width: 640px) {
  .context-banner-image { width: 64px; height: 64px; }
}

.context-banner-icon {
  width: 48px;
  height: 48px;
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: var(--color-misana-muted);
  background: var(--color-misana-stone);
  border-radius: 2px;
}
.context-banner-icon svg { width: 24px; height: 24px; }
@media (min-width: 640px) {
  .context-banner-icon { width: 64px; height: 64px; }
  .context-banner-icon svg { width: 28px; height: 28px; }
}

.context-banner-text { min-width: 0; flex: 1; }
.context-banner-kicker {
  font-size: 0.65rem;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: var(--color-misana-muted);
  margin: 0 0 0.2rem;
}
.context-banner-label {
  font-size: 1rem;
  font-weight: 500;
  color: var(--color-misana-ink);
  margin: 0;
  line-height: 1.3;
}
@media (min-width: 640px) {
  .context-banner-label { font-size: 1.1rem; }
}
.context-banner-sublabel {
  font-size: 0.85rem;
  color: var(--color-misana-muted);
  margin: 0.1rem 0 0;
  line-height: 1.3;
}

.banner-route-edit {
  display: flex;
  align-items: stretch;
  gap: 0.5rem;
  flex-wrap: wrap;
}
.banner-route-arrow {
  align-self: center;
}
.banner-route-confirm {
  font-size: 0.78rem;
  letter-spacing: 0.05em;
  padding: 0 0.95rem;
  line-height: 1;
  border: 1px solid var(--color-misana-ink);
  background: var(--color-misana-ink);
  color: var(--color-misana-paper);
  cursor: pointer;
  font-family: inherit;
  transition: opacity 0.2s ease;
  margin-left: auto;
  flex-shrink: 0;
}
.banner-route-confirm:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
.banner-route-confirm:not(:disabled):hover { opacity: 0.8; }
.banner-route-select {
  font-family: inherit;
  font-size: 0.95rem;
  color: var(--color-misana-ink);
  background: var(--color-misana-paper);
  border: 1px solid var(--color-misana-line);
  border-radius: 2px;
  padding: 0.35rem 0.5rem;
  min-width: 0;
  flex: 1 1 auto;
}
.banner-route-select:focus {
  outline: none;
  border-color: var(--color-misana-ink);
}
.banner-route-arrow {
  color: var(--color-misana-muted);
  font-size: 0.95rem;
  flex-shrink: 0;
}

.context-banner-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem 1rem;
  margin-top: 0.85rem;
}
.context-banner-modify,
.context-banner-wa {
  font-size: 0.78rem;
  letter-spacing: 0.05em;
  color: var(--color-misana-ink);
  text-decoration: none;
  border: none;
  border-bottom: 1px solid var(--color-misana-ink);
  background: none;
  padding: 0 0 0.1rem;
  cursor: pointer;
  transition: opacity 0.2s ease;
  font-family: inherit;
}
.context-banner-modify:hover,
.context-banner-wa:hover { opacity: 0.6; }

.context-banner-price {
  margin: 0.85rem 0 0;
  padding: 0.7rem 0;
  border-top: 1px solid var(--color-misana-line);
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}
.context-banner-price-value {
  font-size: 0.95rem;
  font-weight: 500;
  color: var(--color-misana-ink);
}
.context-banner-price-note {
  font-size: 0.72rem;
  color: var(--color-misana-muted);
  line-height: 1.4;
}

.context-banner-reply {
  margin-top: 0.85rem;
  padding-top: 0.7rem;
  border-top: 1px solid var(--color-misana-line);
  font-size: 0.75rem;
  color: var(--color-misana-muted);
  letter-spacing: 0.04em;
}
</style>
