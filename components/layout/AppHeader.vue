<script setup lang="ts">
import { NAV_ENTRIES } from '~/lib/megaMenu';

const { locale, t } = useI18n();
const localePath = useLocalePath();
const config = useRuntimeConfig();
const whatsappHref = computed(() => {
  const num = (config.public as any).misanaWhatsapp || (config.public as any).misanaPhone || '33600000000';
  return `https://wa.me/${num}`;
});

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
    <div class="max-w-[1600px] mx-auto px-6 sm:px-12 h-16 grid grid-cols-[1fr_auto_1fr] items-center">
      <NuxtLink :to="localePath('/')" class="font-display tracking-tight justify-self-start text-2xl" data-display>
        <span class="lg:hidden">M</span>
        <span class="hidden lg:inline">{{ t('brand.name') }}</span>
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
        <a
          :href="whatsappHref"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="WhatsApp"
          class="inline-flex items-center justify-center w-9 h-9 rounded-full transition"
          :class="isTransparent ? 'text-misana-paper hover:bg-misana-paper/10' : 'text-misana-ink hover:bg-misana-ink/5'"
        >
          <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" class="w-4 h-4">
            <path d="M17.5 14.4c-.3-.2-1.7-.8-2-.9-.3-.1-.5-.2-.7.2-.2.3-.8.9-1 1.1-.2.2-.4.2-.7 0-.3-.2-1.2-.4-2.3-1.4-.9-.8-1.5-1.7-1.6-2-.2-.3 0-.5.1-.6.1-.1.3-.4.4-.5.1-.2.2-.3.3-.5.1-.2 0-.4 0-.5 0-.1-.7-1.7-1-2.3-.3-.6-.5-.5-.7-.5h-.6c-.2 0-.5.1-.8.4-.3.3-1 1-1 2.4 0 1.4 1 2.8 1.2 3 .1.2 2 3 4.8 4.2.7.3 1.2.5 1.6.6.7.2 1.3.2 1.8.1.5-.1 1.7-.7 1.9-1.4.2-.7.2-1.2.2-1.4-.1-.1-.3-.2-.6-.4zM12 2C6.5 2 2 6.5 2 12c0 1.8.5 3.5 1.3 5L2 22l5.2-1.3c1.5.8 3.1 1.3 4.8 1.3 5.5 0 10-4.5 10-10S17.5 2 12 2zm0 18.2c-1.5 0-3-.4-4.3-1.2l-.3-.2-3.2.8.9-3.1-.2-.3C4.1 14.9 3.7 13.5 3.7 12 3.7 7.4 7.4 3.7 12 3.7c4.6 0 8.3 3.7 8.3 8.3 0 4.6-3.7 8.2-8.3 8.2z"/>
          </svg>
        </a>
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
