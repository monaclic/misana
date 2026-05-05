<script setup lang="ts">
// Barre fixe mobile : 3 boutons WhatsApp / Call / Request.
// Visible uniquement sur mobile (sm:hidden), masquée si scroll vers le haut
// pour ne pas gêner le hero. Configurable via env :
// NUXT_PUBLIC_MISANA_PHONE = E.164 sans +
// NUXT_PUBLIC_MISANA_WHATSAPP = E.164 sans +
//
// Sur la home : la barre reste cachee tant que l'utilisateur n'a pas
// quitte le hero (controle via useState 'sticky-contact-visible' pose
// par pages/index.vue). Toutes les autres pages : visible par defaut.
const config = useRuntimeConfig();
const localePath = useLocalePath();
const { t } = useI18n();

const phone = (config.public as any).misanaPhone || '33493000000';
const whatsapp = (config.public as any).misanaWhatsapp || phone;

const wppHref = computed(() => `https://wa.me/${whatsapp}?text=${encodeURIComponent('Hello Misana')}`);
const telHref = computed(() => `tel:+${phone}`);

// Logique partagee avec AppHeader : routes contextuelles cachees +
// override useState pour le hero home + footer overlap.
const { visible: stickyVisible } = useContactCTA();
</script>

<template>
  <div v-if="stickyVisible" class="lg:hidden fixed bottom-0 inset-x-0 z-50 bg-misana-paper/95 backdrop-blur border-t border-misana-line">
    <div class="grid grid-cols-3 divide-x divide-misana-line">
      <a :href="wppHref" target="_blank" rel="noopener" class="py-3 text-center text-xs uppercase tracking-widest hover:bg-misana-stone transition">
        WhatsApp
      </a>
      <a :href="telHref" class="py-3 text-center text-xs uppercase tracking-widest hover:bg-misana-stone transition">
        {{ t('sticky.call') }}
      </a>
      <NuxtLink :to="localePath('/request')" class="py-3 text-center text-xs uppercase tracking-widest bg-misana-ink text-misana-paper hover:bg-misana-ink/90 transition">
        {{ t('nav.request') }}
      </NuxtLink>
    </div>
  </div>
</template>
