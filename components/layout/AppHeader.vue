<script setup lang="ts">
import { NAV_ENTRIES } from '~/lib/megaMenu';

const { locale, t } = useI18n();
const localePath = useLocalePath();
const config = useRuntimeConfig();

// Source de verite : Sanity globalSettings (overridable depuis Studio).
// Fallback : runtimeConfig (env var) puis defaut. Permet a l'associee
// de changer le numero une fois -> propage header + footer + contact.
const { settings } = useGlobalSettings();
const phoneE164Default = (config.public as any).misanaPhone || '33493000000';
const phoneHref = computed(() =>
  settings.value.contactPhoneHref || `tel:+${phoneE164Default}`,
);
// Format affichage : +33 X XX XX XX XX (4 paires apres l'indicatif).
const phoneDisplay = computed(() => {
  if (settings.value.contactPhone) return settings.value.contactPhone;
  const s = String(phoneE164Default).replace(/^(\d{2})(\d)(\d{2})(\d{2})(\d{2})(\d{2}).*/, '+$1 $2 $3 $4 $5 $6');
  return s.startsWith('+') ? s : `+${phoneE164Default}`;
});

const mobileOpen = ref(false);

const route = useRoute();
const HERO_ROUTES = new Set<string>([
  '/', '/en', '/fr', '/en/', '/fr/',
  '/about', '/en/about', '/fr/about',
  '/services/cars', '/en/services/cars', '/fr/services/voitures',
  '/services/yacht', '/en/services/yacht', '/fr/services/yacht',
  '/services/access', '/en/services/access', '/fr/services/acces',
  '/destinations', '/en/destinations', '/fr/destinations',
  '/services/chauffeur', '/en/services/chauffeur', '/fr/services/chauffeur',
  '/services/helicopter', '/en/services/helicopter', '/fr/services/helicoptere',
]);
const isHeroRoute = computed(() => HERO_ROUTES.has(route.path));

const headerTransparent = useState<boolean>('header-transparent', () => isHeroRoute.value);
watch(isHeroRoute, (v) => { headerTransparent.value = v; });

const isTransparent = computed(() => headerTransparent.value && !mobileOpen.value);

// Le CTA "Faire une demande" suit la logique contextuelle du sticky :
// hero de la home, /request, /contact, fiches produits -> cache.
const { visible: ctaVisible } = useContactCTA();

// Renvoie le nom de route i18n quand le slug est localise (cars,
// helicopter, access) pour que localePath emette le bon chemin FR.
// Les autres entrees gardent leurs chemins canoniques.
function hrefFor(k: string): string | { name: string } {
  if (k === 'home') return '/';
  if (k === 'about') return '/about';
  if (k === 'contact') return '/contact';
  if (k === 'cars' || k === 'helicopter' || k === 'access') {
    return { name: `services-${k}` };
  }
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

      <div class="flex items-center justify-self-end">
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

    <!-- Sub-row utility desktop : pattern luxury hotel (Aman, Le Collectionist).
         Numero de telephone à droite, divider vertical fin, LocaleSwitcher.
         Hauteur fine, tracking étiré, font petite. Transparent sur hero,
         border-top discret en mode opaque. -->
    <div
      class="hidden lg:block"
      :class="isTransparent ? '' : 'border-t border-misana-line'"
    >
      <div class="max-w-[1600px] mx-auto px-6 sm:px-12 h-9 flex items-center justify-end gap-5">
        <a
          :href="phoneHref"
          class="text-[11px] tracking-[0.18em] tabular-nums transition"
          :class="isTransparent ? 'opacity-90 hover:opacity-100' : 'text-misana-muted hover:text-misana-ink'"
          :aria-label="t('nav.callUs')"
        >
          {{ phoneDisplay }}
        </a>
        <span
          class="block h-3 w-px"
          :class="isTransparent ? 'bg-misana-paper/30' : 'bg-misana-line'"
          aria-hidden="true"
        ></span>
        <LocaleSwitcher />
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
          <a
            :href="phoneHref"
            class="block w-full text-center text-sm tracking-wide tabular-nums border border-misana-ink px-4 py-3 hover:bg-misana-ink hover:text-misana-paper transition"
          >
            {{ phoneDisplay }}
          </a>
        </li>
      </ul>
    </div>
  </header>
</template>
