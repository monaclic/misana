<script setup lang="ts">
// Barre fixe mobile : 3 boutons WhatsApp / Call / Request.
// Cache si pas de phone/whatsapp configure (placeholder) plutot que
// d'afficher des liens cliquables vers de faux numeros. Si un seul des
// deux (phone OU whatsapp) est configure, on cache uniquement le bouton
// concerne et on bascule en grid 2 colonnes.
import { isPhonePlaceholder } from '~/composables/usePhoneDisplay';

const config = useRuntimeConfig();
const localePath = useLocalePath();
const { t } = useI18n();
const { settings } = useGlobalSettings();

const phoneE164 = (config.public as any).misanaPhone || '';
const whatsappE164 = (config.public as any).misanaWhatsapp || phoneE164;

const phoneOk = computed(() => {
  const display = settings.value.contactPhone || phoneE164;
  return !isPhonePlaceholder(display);
});
const whatsappOk = computed(() => {
  const num = settings.value.whatsappNumber || whatsappE164;
  if (!num) return false;
  const e164 = String(num).replace(/[^0-9]/g, '');
  return !!e164 && !/^33[46]00000000/.test(e164);
});

const wppHref = computed(() => {
  const num = settings.value.whatsappNumber?.replace(/[^0-9]/g, '') || whatsappE164;
  return `https://wa.me/${num}?text=${encodeURIComponent('Hello Misana')}`;
});
const telHref = computed(() =>
  settings.value.contactPhoneHref || (phoneE164 ? `tel:+${phoneE164}` : ''),
);

// Nombre de boutons actifs (request toujours visible) -> 1, 2 ou 3.
const buttonCount = computed(() => 1 + (phoneOk.value ? 1 : 0) + (whatsappOk.value ? 1 : 0));
const gridClass = computed(() => buttonCount.value === 3 ? 'grid-cols-3' : buttonCount.value === 2 ? 'grid-cols-2' : 'grid-cols-1');

const { visible: stickyVisible } = useContactCTA();
</script>

<template>
  <div v-if="stickyVisible" class="lg:hidden fixed bottom-0 inset-x-0 z-50 bg-misana-paper/95 backdrop-blur border-t border-misana-line">
    <div class="grid divide-x divide-misana-line" :class="gridClass">
      <a v-if="whatsappOk" :href="wppHref" target="_blank" rel="noopener" class="py-3 text-center text-xs uppercase tracking-widest hover:bg-misana-stone transition">
        WhatsApp
      </a>
      <a v-if="phoneOk" :href="telHref" class="py-3 text-center text-xs uppercase tracking-widest hover:bg-misana-stone transition">
        {{ t('sticky.call') }}
      </a>
      <NuxtLink :to="localePath('/request')" class="py-3 text-center text-xs uppercase tracking-widest bg-misana-ink text-misana-paper hover:bg-misana-ink/90 transition">
        {{ t('nav.request') }}
      </NuxtLink>
    </div>
  </div>
</template>
