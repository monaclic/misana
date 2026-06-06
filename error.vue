<script setup lang="ts">
// Error page Misana. Rendue par Nuxt sur tout createError() + 404 routing.
// Design : noir/blanc sobre, codes Misana.
//
// IMPORTANT : ne fait AUCUN async / Sanity fetch / store Pinia. Si error.vue
// throw, Nuxt fallback sur sa default error page (verte/Nuxt branding) qui
// dans Vercel sort en JSON. On limite donc strictement aux primitives sync.
import { resolvePhone, isPhonePlaceholder } from '~/composables/usePhoneDisplay';

const props = defineProps<{
  error: { statusCode?: number; statusMessage?: string; message?: string } | null;
}>();

// AUCUN composable i18n ici (useI18n / useLocalePath). Sur Vercel, ils peuvent
// crasher au rendu SSR de la page d'erreur (rendue hors contexte de route i18n)
// et faire planter la fonction => 500 / FUNCTION_INVOCATION_FAILED au lieu d'un
// 404 propre. La locale est deduite du chemin, les textes sont inline.
const config = useRuntimeConfig();
const route = useRoute();
const loc = computed(() => (String(route?.path || '').startsWith('/fr') ? 'fr' : 'en'));

const COPY = {
  en: {
    t404: 'This page could not be found',
    b404: 'The page you are looking for has moved or no longer exists.',
    t500: 'Something went wrong',
    b500: 'An unexpected error occurred. Please try again in a moment.',
    home: 'Back to home',
    call: 'Call us',
    region: 'French Riviera',
  },
  fr: {
    t404: 'Cette page est introuvable',
    b404: "La page que vous cherchez a ete deplacee ou n'existe plus.",
    t500: 'Une erreur est survenue',
    b500: 'Une erreur inattendue est survenue. Merci de reessayer dans un instant.',
    home: "Retour a l'accueil",
    call: 'Nous appeler',
    region: "Cote d'Azur",
  },
} as const;
const c = computed(() => COPY[loc.value]);

const statusCode = computed(() => props.error?.statusCode || 500);
const is404 = computed(() => statusCode.value === 404);

const errorTitle = computed(() => (is404.value ? c.value.t404 : c.value.t500));
const errorBody = computed(() => (is404.value ? c.value.b404 : c.value.b500));

// Phone : env var uniquement (pas de fetch Sanity dans error.vue).
const phoneE164Default = (config.public as any).misanaPhone || '';
const phone = computed(() =>
  phoneE164Default && !isPhonePlaceholder(phoneE164Default)
    ? resolvePhone(
        String(phoneE164Default).replace(/^(\d{2})(\d)(\d{2})(\d{2})(\d{2})(\d{2}).*/, '+$1 $2 $3 $4 $5 $6'),
        `tel:+${phoneE164Default}`,
      )
    : null,
);
const whatsappE164 = (config.public as any).misanaWhatsapp || phoneE164Default;
const whatsapp = computed(() => {
  if (!whatsappE164 || isPhonePlaceholder(whatsappE164)) return null;
  const e164 = String(whatsappE164).replace(/[^0-9]/g, '');
  if (!e164 || /^33[46]00000000/.test(e164)) return null;
  return { display: `+${e164}`, href: `https://wa.me/${e164}` };
});

useSeoMeta({
  title: () => errorTitle.value,
  robots: 'noindex, nofollow',
});

function handleHome() {
  clearError({ redirect: `/${loc.value}` });
}
</script>

<template>
  <div class="error-shell">
    <main class="error-main">
      <p class="error-code">{{ statusCode }}</p>
      <h1 class="error-title">{{ errorTitle }}</h1>
      <p class="error-body">{{ errorBody }}</p>

      <div class="error-cta-group">
        <button type="button" class="error-cta-primary" @click="handleHome">
          {{ c.home }}
        </button>
        <a
          v-if="phone"
          :href="phone.href"
          class="error-cta-secondary"
          :aria-label="c.call"
        >
          {{ phone.display }}
        </a>
        <a
          v-if="whatsapp"
          :href="whatsapp.href"
          class="error-cta-secondary"
          target="_blank"
          rel="noopener"
        >
          WhatsApp
        </a>
      </div>
    </main>

    <footer class="error-footer">
      <p>Misana · {{ c.region }}</p>
    </footer>
  </div>
</template>

<style scoped>
.error-shell {
  min-height: 100dvh;
  display: flex;
  flex-direction: column;
  background: var(--color-misana-paper, #ffffff);
  color: var(--color-misana-ink, #0a0a09);
}
.error-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 4rem 1.5rem;
}
.error-code {
  font-size: 0.7rem;
  letter-spacing: 0.3em;
  text-transform: uppercase;
  color: var(--color-misana-muted, #6b6b66);
  margin: 0 0 1.25rem;
  font-variant-numeric: tabular-nums;
}
.error-title {
  font-family: var(--font-display, 'Rubik', serif);
  font-size: clamp(2rem, 5vw, 3.5rem);
  line-height: 1.1;
  margin: 0 0 1rem;
  max-width: 36rem;
}
.error-body {
  font-size: 1rem;
  line-height: 1.6;
  color: var(--color-misana-muted, #6b6b66);
  max-width: 32rem;
  margin: 0 0 2.5rem;
}
.error-cta-group {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
  justify-content: center;
}
.error-cta-primary {
  background: var(--color-misana-ink, #0a0a09);
  color: var(--color-misana-paper, #ffffff);
  border: 0;
  padding: 0.85rem 1.6rem;
  font-size: 0.78rem;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  cursor: pointer;
  border-radius: 2px;
  transition: opacity 0.2s ease;
  font-family: inherit;
}
.error-cta-primary:hover { opacity: 0.85; }
.error-cta-secondary {
  border: 1px solid var(--color-misana-line, #e5e5e0);
  color: var(--color-misana-ink, #0a0a09);
  padding: 0.85rem 1.6rem;
  font-size: 0.78rem;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  text-decoration: none;
  border-radius: 2px;
  transition: border-color 0.2s ease;
}
.error-cta-secondary:hover { border-color: var(--color-misana-ink, #0a0a09); }
.error-footer {
  border-top: 1px solid var(--color-misana-line, #e5e5e0);
  padding: 1.5rem;
  text-align: center;
  font-size: 0.7rem;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  color: var(--color-misana-muted, #6b6b66);
}
.error-footer p { margin: 0; }
</style>
