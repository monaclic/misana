<script setup lang="ts">
// Error page Misana. Rendue par Nuxt sur tout createError() + 404 routing.
// Design : noir/blanc sobre, codes Misana. Pas d'illustration tape-a-l'oeil.
// CTA : retour accueil (avec preservation locale) + telephone si configure.
import { resolvePhone } from '~/composables/usePhoneDisplay';

const props = defineProps<{
  error: { statusCode?: number; statusMessage?: string; message?: string } | null;
}>();

const { t, locale } = useI18n();
const localePath = useLocalePath();
const config = useRuntimeConfig();
const { settings } = useGlobalSettings();

const statusCode = computed(() => props.error?.statusCode || 500);
const is404 = computed(() => statusCode.value === 404);

// Title affiche dans <title> + h1.
const errorTitle = computed(() =>
  is404.value ? t('error.404.title') : t('error.500.title'),
);
const errorBody = computed(() =>
  is404.value ? t('error.404.body') : t('error.500.body'),
);

// Telephone : meme pattern que header/footer (cache si placeholder).
const phoneE164Default = (config.public as any).misanaPhone || '';
const phone = computed(() =>
  resolvePhone(
    settings.value.contactPhone
      || (phoneE164Default
        ? String(phoneE164Default).replace(/^(\d{2})(\d)(\d{2})(\d{2})(\d{2})(\d{2}).*/, '+$1 $2 $3 $4 $5 $6')
        : ''),
    settings.value.contactPhoneHref || (phoneE164Default ? `tel:+${phoneE164Default}` : ''),
  ),
);

// WhatsApp : verifie aussi placeholder.
const whatsappE164 = (config.public as any).misanaWhatsapp || phoneE164Default;
const whatsapp = computed(() => {
  const num = settings.value.whatsappNumber || (whatsappE164 ? `+${whatsappE164}` : '');
  if (!num) return null;
  const e164 = String(num).replace(/[^0-9]/g, '');
  if (!e164 || /^33[46]00000000/.test(e164)) return null;
  return { display: num, href: `https://wa.me/${e164}` };
});

useSeoMeta({
  title: () => errorTitle.value,
  robots: 'noindex, nofollow',
});

function handleHome() {
  // clearError reset le state d'erreur Nuxt ET navigue.
  clearError({ redirect: localePath('/') });
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
          {{ t('error.cta.home') }}
        </button>
        <a
          v-if="phone"
          :href="phone.href"
          class="error-cta-secondary"
          :aria-label="t('nav.callUs')"
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
      <p>{{ t('brand.name') }} · {{ locale === 'fr' ? "Côte d'Azur" : 'French Riviera' }}</p>
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
