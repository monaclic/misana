<script setup lang="ts">
// Bloc "ou parlez-nous directement" affiche avant le bouton submit.
// Objectif : capter les utilisateurs qui preferent l'humain plutot que
// le formulaire. Cohere avec la philosophie Misana : conversation > form.
//
// Lit globalSettings pour le numero de tel et WhatsApp.
import { useGlobalSettings } from '~/composables/useGlobalSettings';

const { t } = useI18n();
const { settings } = useGlobalSettings();

const phoneHref = computed(() => settings.value.contactPhoneHref || '#');
const phoneDisplay = computed(() => settings.value.contactPhone || '');

const whatsappHref = computed(() => {
  const num = settings.value.whatsappNumber?.replace(/\s+/g, '');
  if (!num) return null;
  return `https://wa.me/${num.replace(/^\+/, '')}`;
});
</script>

<template>
  <div class="direct-block">
    <p class="direct-kicker">{{ t('request.direct.kicker') }}</p>
    <p class="direct-title">{{ t('request.direct.title') }}</p>
    <div class="direct-actions">
      <a
        v-if="phoneDisplay"
        :href="phoneHref"
        class="direct-action"
      >
        <span class="direct-action-icon" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <path d="M5 4h4l2 5-3 2c1.5 3 4 5.5 7 7l2-3 5 2v4c0 1-1 2-2 2-9 0-17-8-17-17 0-1 1-2 2-2z" stroke-linejoin="round" />
          </svg>
        </span>
        <span>
          <span class="direct-action-label">{{ t('request.direct.phoneLabel') }}</span>
          <span class="direct-action-value">{{ phoneDisplay }}</span>
        </span>
      </a>
      <a
        v-if="whatsappHref"
        :href="whatsappHref"
        target="_blank"
        rel="noopener"
        class="direct-action direct-action-wa"
      >
        <span class="direct-action-icon" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2a10 10 0 0 0-8.5 15.2L2 22l4.9-1.5A10 10 0 1 0 12 2zm5.3 14.3c-.2.6-1.2 1.1-1.7 1.2-.5.1-1 .1-1.6-.1-.4-.1-.9-.3-1.5-.5-2.7-1.2-4.5-3.9-4.6-4.1-.1-.2-1.1-1.5-1.1-2.8s.7-2 .9-2.3c.2-.3.5-.3.7-.3h.5c.2 0 .4 0 .6.4.2.5.7 1.7.8 1.8.1.1.1.3 0 .5l-.3.4c-.1.2-.3.3-.4.5-.2.1-.3.3-.1.6.2.3.8 1.3 1.7 2.1 1.1 1 2.1 1.3 2.4 1.4.3.1.5.1.7-.1.2-.2.8-.9 1-1.2.2-.3.4-.3.7-.2.3.1 1.7.8 2 1 .3.2.5.2.6.4.1.2.1 1-.2 1.6z" />
          </svg>
        </span>
        <span>
          <span class="direct-action-label">{{ t('request.direct.whatsappLabel') }}</span>
          <span class="direct-action-value">{{ t('request.direct.whatsappValue') }}</span>
        </span>
      </a>
    </div>
  </div>
</template>

<style scoped>
.direct-block {
  margin: 1rem 0 1.5rem;
  padding: 1.1rem 1.2rem;
  background: var(--color-misana-stone);
  border-radius: 4px;
}
.direct-kicker {
  font-size: 0.65rem;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: var(--color-misana-muted);
  margin: 0 0 0.3rem;
}
.direct-title {
  font-family: var(--font-display);
  font-size: 1.05rem;
  color: var(--color-misana-ink);
  margin: 0 0 0.85rem;
}
.direct-actions {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}
@media (min-width: 640px) {
  .direct-actions { flex-direction: row; gap: 0.8rem; }
}
.direct-action {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 0.7rem;
  padding: 0.8rem 1rem;
  background: var(--color-misana-paper);
  border: 1px solid var(--color-misana-line);
  border-radius: 2px;
  text-decoration: none;
  color: var(--color-misana-ink);
  transition: border-color 0.2s ease, background 0.2s ease;
}
.direct-action:hover {
  border-color: var(--color-misana-ink);
}
.direct-action-icon {
  width: 28px;
  height: 28px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  color: var(--color-misana-ink);
}
.direct-action-icon svg {
  width: 100%;
  height: 100%;
}
.direct-action-wa .direct-action-icon { color: #25D366; }
.direct-action-label {
  display: block;
  font-size: 0.65rem;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--color-misana-muted);
}
.direct-action-value {
  display: block;
  font-size: 0.95rem;
  color: var(--color-misana-ink);
  margin-top: 0.1rem;
}
</style>
