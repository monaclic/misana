<script setup lang="ts">
import { NAV_ENTRIES, getMega, type MegaKey } from '~/lib/megaMenu';

const { locale, t } = useI18n();
const localePath = useLocalePath();

const openKey = ref<MegaKey | null>(null);
const mobileOpen = ref(false);
const mobileExpanded = ref<MegaKey | null>(null);

const route = useRoute();
// Routes whose first section is a full-bleed dark hero (header should overlay transparent).
const HERO_ROUTES = new Set<string>([
  '/', '/en', '/fr', '/en/', '/fr/',
  '/about', '/en/about', '/fr/about',
  '/services/cars', '/en/services/cars', '/fr/services/cars',
  '/services/yacht', '/en/services/yacht', '/fr/services/yacht',
  '/services/access', '/en/services/access', '/fr/services/access',
  '/destinations', '/en/destinations', '/fr/destinations',
]);
const isHeroRoute = computed(() => HERO_ROUTES.has(route.path));

// Cross-page transparency flag, seeded from the route so SSR + first paint are correct.
// The page can still flip it (eg. index IntersectionObserver toggles to opaque past the hero).
const headerTransparent = useState<boolean>('header-transparent', () => isHeroRoute.value);
watch(isHeroRoute, (v) => { headerTransparent.value = v; });

// Revert to opaque while a mega panel or the mobile sheet is open, so links stay legible.
const isTransparent = computed(() => headerTransparent.value && openKey.value === null && !mobileOpen.value);

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
  // Events : ancre la section agenda de la home (pas de page /events V1).
  if (k === 'events') return '/#agenda';
  if (k === 'about') return '/about';
  return `/services/${k}`;
}

const activeMega = computed(() =>
  openKey.value ? getMega(openKey.value, locale.value as 'en' | 'fr') : null,
);

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
  <header
    class="fixed top-0 left-0 right-0 z-40 transition-colors duration-300"
    :class="isTransparent ? 'bg-transparent text-misana-paper border-b border-transparent' : 'bg-misana-paper text-misana-ink border-b border-misana-line'"
  >
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
            class="text-sm tracking-wide transition py-5"
            :class="isTransparent ? 'hover:opacity-70' : 'hover:text-misana-muted'"
          >
            {{ locale === 'fr' ? entry.fr : entry.en }}
          </NuxtLink>
        </div>
      </nav>

      <div class="flex items-center gap-4">
        <LocaleSwitcher class="hidden sm:block" />
        <NuxtLink
          :to="localePath('/request')"
          class="text-sm border px-4 py-2 transition"
          :class="isTransparent ? 'border-misana-paper hover:bg-misana-paper hover:text-misana-ink' : 'border-misana-ink hover:bg-misana-ink hover:text-misana-paper'"
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

    <div v-if="mobileOpen" class="lg:hidden border-t border-misana-line max-h-[80vh] overflow-y-auto">
      <ul class="divide-y divide-misana-line">
        <li v-for="entry in NAV_ENTRIES" :key="entry.key">
          <button
            type="button"
            class="w-full flex items-center justify-between px-6 py-4 text-sm hover:bg-misana-stone transition"
            @click="mobileExpanded = mobileExpanded === entry.key ? null : entry.key"
          >
            <span>{{ locale === 'fr' ? entry.fr : entry.en }}</span>
            <span class="text-misana-muted">{{ mobileExpanded === entry.key ? '−' : '+' }}</span>
          </button>
          <div v-if="mobileExpanded === entry.key" class="bg-misana-stone px-6 pb-5 space-y-5">
            <NuxtLink
              :to="localePath(rootHrefFor(entry.key))"
              class="block text-xs underline underline-offset-4"
            >
              {{ locale === 'fr' ? 'Voir tout' : 'View all' }} →
            </NuxtLink>
            <div v-for="(col, idx) in (getMega(entry.key, locale as 'en' | 'fr')?.columns ?? [])" :key="idx" class="space-y-2">
              <p class="text-[10px] uppercase tracking-widest text-misana-muted">
                {{ locale === 'fr' ? col.titleFr : col.titleEn }}
              </p>
              <ul class="space-y-1.5">
                <li v-for="item in col.items" :key="item.href">
                  <NuxtLink :to="localePath(item.href)" class="text-sm">
                    {{ item.label }}
                  </NuxtLink>
                </li>
              </ul>
            </div>
          </div>
        </li>
        <li class="px-6 py-4">
          <LocaleSwitcher />
        </li>
      </ul>
    </div>
  </header>
</template>
