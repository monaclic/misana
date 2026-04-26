<script setup lang="ts">
import { NAV_ENTRIES, getMega, type MegaKey } from '~/lib/megaMenu';

const { locale, t } = useI18n();
const localePath = useLocalePath();

const openKey = ref<MegaKey | null>(null);
const mobileOpen = ref(false);

// Timeout grace period : permet de bouger le curseur du link vers le panel
// sans que le menu disparaisse. 150ms suffit pour traverser le gap.
let closeTimer: ReturnType<typeof setTimeout> | null = null;

function open(k: MegaKey) {
  if (closeTimer) {
    clearTimeout(closeTimer);
    closeTimer = null;
  }
  openKey.value = k;
}

function scheduleClose() {
  if (closeTimer) clearTimeout(closeTimer);
  closeTimer = setTimeout(() => {
    openKey.value = null;
    closeTimer = null;
  }, 150);
}

function rootHrefFor(k: MegaKey) {
  if (k === 'destinations') return '/destinations';
  if (k === 'events') return '/events';
  if (k === 'about') return '/about';
  return `/services/${k}`;
}

const activeMega = computed(() =>
  openKey.value ? getMega(openKey.value, locale.value as 'en' | 'fr') : null,
);

const route = useRoute();
watch(() => route.fullPath, () => {
  openKey.value = null;
  mobileOpen.value = false;
  if (closeTimer) {
    clearTimeout(closeTimer);
    closeTimer = null;
  }
});
</script>

<template>
  <header class="sticky top-0 z-40 bg-misana-paper border-b border-misana-line">
    <div class="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
      <NuxtLink :to="localePath('/')" class="font-display text-2xl tracking-tight">
        {{ t('brand.name') }}
      </NuxtLink>

      <nav class="hidden lg:flex items-center gap-6">
        <div
          v-for="entry in NAV_ENTRIES"
          :key="entry.key"
          class="relative"
          @mouseenter="open(entry.key)"
          @mouseleave="scheduleClose"
        >
          <NuxtLink
            :to="localePath(rootHrefFor(entry.key))"
            class="text-sm tracking-wide hover:text-misana-muted transition py-5"
          >
            {{ locale === 'fr' ? entry.fr : entry.en }}
          </NuxtLink>
        </div>
      </nav>

      <div class="flex items-center gap-4">
        <LocaleSwitcher class="hidden sm:block" />
        <NuxtLink
          :to="localePath('/request')"
          class="text-sm border border-misana-ink px-4 py-2 hover:bg-misana-ink hover:text-misana-paper transition"
        >
          {{ t('nav.request') }}
        </NuxtLink>
        <button
          type="button"
          class="lg:hidden text-sm"
          :aria-expanded="mobileOpen"
          @click="mobileOpen = !mobileOpen"
        >
          {{ mobileOpen ? '✕' : '☰' }}
        </button>
      </div>
    </div>

    <Transition
      enter-active-class="transition duration-150 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition duration-100 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="openKey && activeMega"
        class="hidden lg:block absolute left-0 right-0 bg-misana-paper border-b border-misana-line shadow-sm"
        @mouseenter="open(openKey!)"
        @mouseleave="scheduleClose"
      >
        <div class="max-w-7xl mx-auto px-6 py-10 grid grid-cols-3 gap-10">
          <div v-for="(col, idx) in activeMega.columns" :key="idx">
            <p class="text-xs uppercase tracking-wide text-misana-muted mb-3">
              {{ locale === 'fr' ? col.titleFr : col.titleEn }}
            </p>
            <ul class="space-y-2">
              <li v-for="item in col.items" :key="item.href">
                <NuxtLink :to="localePath(item.href)" class="text-sm hover:text-misana-muted transition">
                  {{ item.label }}
                </NuxtLink>
              </li>
            </ul>
          </div>
          <div class="col-span-3 flex justify-end">
            <NuxtLink
              :to="localePath(activeMega.cta.href)"
              class="text-sm border-b border-misana-ink hover:opacity-70 transition"
            >
              {{ locale === 'fr' ? activeMega.cta.fr : activeMega.cta.en }} →
            </NuxtLink>
          </div>
        </div>
      </div>
    </Transition>

    <div v-if="mobileOpen" class="lg:hidden border-t border-misana-line">
      <ul class="px-6 py-4 space-y-3">
        <li v-for="entry in NAV_ENTRIES" :key="entry.key">
          <NuxtLink :to="localePath(rootHrefFor(entry.key))" class="text-sm">
            {{ locale === 'fr' ? entry.fr : entry.en }}
          </NuxtLink>
        </li>
        <li class="pt-3 border-t border-misana-line">
          <LocaleSwitcher />
        </li>
      </ul>
    </div>
  </header>
</template>
