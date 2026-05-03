<script setup lang="ts">
import { NAV_ENTRIES } from '~/lib/megaMenu';

const { locale, t } = useI18n();
const localePath = useLocalePath();

const mobileOpen = ref(false);

const route = useRoute();
const HERO_ROUTES = new Set<string>([
  '/', '/en', '/fr', '/en/', '/fr/',
  '/about', '/en/about', '/fr/about',
  '/services/cars', '/en/services/cars', '/fr/services/cars',
  '/services/yacht', '/en/services/yacht', '/fr/services/yacht',
  '/services/access', '/en/services/access', '/fr/services/access',
  '/destinations', '/en/destinations', '/fr/destinations',
  '/services/chauffeur', '/en/services/chauffeur', '/fr/services/chauffeur',
  '/services/helicopter', '/en/services/helicopter', '/fr/services/helicopter',
]);
const isHeroRoute = computed(() => HERO_ROUTES.has(route.path));

const headerTransparent = useState<boolean>('header-transparent', () => isHeroRoute.value);
watch(isHeroRoute, (v) => { headerTransparent.value = v; });

const isTransparent = computed(() => headerTransparent.value && !mobileOpen.value);

// Le CTA "Faire une demande" suit le meme state que le sticky contact :
// cache pendant le hero de la home, visible partout ailleurs.
const ctaVisible = useState<boolean>('sticky-contact-visible', () => true);

function hrefFor(k: string) {
  if (k === 'home') return '/';
  if (k === 'about') return '/about';
  if (k === 'contact') return '/contact';
  return `/services/${k}`;
}

watch(() => route.fullPath, () => {
  mobileOpen.value = false;
});
</script>

<template>
  <header
    class="fixed top-0 left-0 right-0 z-40 transition-colors duration-300"
    :class="isTransparent ? 'bg-transparent text-misana-paper border-b border-transparent' : 'bg-misana-paper text-misana-ink border-b border-misana-line'"
  >
    <div class="max-w-[1600px] mx-auto px-6 sm:px-12 h-16 flex items-center justify-between lg:grid lg:grid-cols-[1fr_auto_1fr]">
      <NuxtLink :to="localePath('/')" class="font-display text-2xl tracking-tight justify-self-start">
        {{ t('brand.name') }}
      </NuxtLink>

      <span class="lg:hidden">
        <LocaleSwitcher />
      </span>

      <nav class="hidden lg:flex items-center gap-6 justify-self-center">
        <NuxtLink
          v-for="entry in NAV_ENTRIES"
          :key="entry.key"
          :to="localePath(hrefFor(entry.key))"
          class="text-sm tracking-wide transition py-5"
          :class="isTransparent ? 'hover:opacity-70' : 'hover:text-misana-muted'"
        >
          {{ locale === 'fr' ? entry.fr : entry.en }}
        </NuxtLink>
      </nav>

      <div class="flex items-center gap-4 justify-self-end">
        <span class="hidden lg:inline-flex">
          <LocaleSwitcher />
        </span>
        <NuxtLink
          v-if="ctaVisible"
          :to="localePath('/request')"
          class="hidden lg:inline-block text-sm border px-4 py-2 transition"
          :class="isTransparent ? 'border-misana-paper hover:bg-misana-paper hover:text-misana-ink' : 'border-misana-ink hover:bg-misana-ink hover:text-misana-paper'"
        >
          {{ t('nav.request') }}
        </NuxtLink>
        <button
          type="button"
          class="lg:hidden inline-flex items-center justify-center w-11 h-11 -mr-3 sm:-mr-6 text-2xl leading-none"
          :aria-label="mobileOpen ? 'Close menu' : 'Open menu'"
          :aria-expanded="mobileOpen"
          @click="mobileOpen = !mobileOpen"
        >
          {{ mobileOpen ? '✕' : '☰' }}
        </button>
      </div>
    </div>

    <div v-if="mobileOpen" class="lg:hidden border-t border-misana-line">
      <ul class="divide-y divide-misana-line">
        <li v-for="entry in NAV_ENTRIES" :key="entry.key">
          <NuxtLink
            :to="localePath(hrefFor(entry.key))"
            class="block px-6 py-4 text-sm hover:bg-misana-stone transition"
          >
            {{ locale === 'fr' ? entry.fr : entry.en }}
          </NuxtLink>
        </li>
        <li class="px-6 py-4">
          <NuxtLink
            :to="localePath('/request')"
            class="block w-full text-center text-sm border border-misana-ink px-4 py-3 hover:bg-misana-ink hover:text-misana-paper transition"
          >
            {{ t('nav.request') }}
          </NuxtLink>
        </li>
      </ul>
    </div>
  </header>
</template>
