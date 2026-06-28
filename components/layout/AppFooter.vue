<script setup lang="ts">
const { t, locale } = useI18n();
const localePath = useLocalePath();
const { settings } = useGlobalSettings();

// WhatsApp : on derive le href de settings.whatsappNumber (Sanity), au
// lieu d'un hardcoded. Si le numero est vide, on cache la cellule.
const whatsappHref = computed(() => {
  const num = settings.value.whatsappNumber?.replace(/\s+/g, '');
  if (!num) return '';
  return `https://wa.me/${num.replace(/^\+/, '')}`;
});
const whatsappDisplay = computed(() => settings.value.whatsappNumber || '');

const newsletterEmail = ref('');
const newsletterSent = ref(false);
function submitNewsletter(e: Event) {
  e.preventDefault();
  if (!newsletterEmail.value) return;
  newsletterSent.value = true;
  newsletterEmail.value = '';
}

const year = new Date().getFullYear();

// Quand le footer entre dans le viewport, on cache la sticky bar
// mobile (StickyContact lit ce flag pour ne pas s'afficher devant
// le footer).
const footerEl = ref<HTMLElement | null>(null);
const footerOverlap = useState<boolean>('footer-overlap', () => false);
let footerObserver: IntersectionObserver | null = null;
onMounted(() => {
  if (!footerEl.value) return;
  footerObserver = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        footerOverlap.value = e.isIntersecting && e.intersectionRatio > 0;
      }
    },
    { threshold: [0, 0.01] },
  );
  footerObserver.observe(footerEl.value);
});
onBeforeUnmount(() => {
  footerObserver?.disconnect();
  footerObserver = null;
  footerOverlap.value = false;
});
</script>

<template>
  <footer ref="footerEl" class="bg-misana-ink text-misana-paper">
    <!-- Brand statement strip -->
    <div class="border-b border-misana-paper/15">
      <div class="max-w-[1600px] mx-auto px-6 sm:px-12 py-16 grid grid-cols-1 lg:grid-cols-12 gap-10 items-end">
        <div class="lg:col-span-7">
          <p class="text-[11px] uppercase tracking-[0.25em] opacity-70 mb-5">{{ t('footer.signature') }}</p>
          <p class="font-display text-3xl sm:text-5xl leading-[1.05]" data-display>{{ t('footer.brandStatement') }}</p>
        </div>
        <div class="lg:col-span-5">
          <p class="text-[11px] uppercase tracking-[0.25em] opacity-70 mb-3">{{ t('footer.newsletterTitle') }}</p>
          <form v-if="!newsletterSent" class="flex border-b border-misana-paper" @submit="submitNewsletter">
            <input
              v-model="newsletterEmail"
              type="email"
              required
              :placeholder="t('footer.newsletterPlaceholder')"
              class="flex-1 bg-transparent py-3 text-sm placeholder:text-misana-paper/50 focus:outline-none"
            />
            <button type="submit" class="text-sm tracking-wide opacity-80 hover:opacity-100 transition pl-4">
              {{ t('footer.newsletterCta') }} →
            </button>
          </form>
          <p v-else class="text-sm opacity-80 py-3">{{ t('footer.newsletterThanks') }}</p>
          <p class="text-xs opacity-60 mt-3">{{ t('footer.newsletterNote') }}</p>
        </div>
      </div>
    </div>

    <!-- Footer columns V1 minimum : Services, La Maison, Reach us. -->
    <div class="border-b border-misana-paper/15">
      <div class="max-w-[1600px] mx-auto px-6 sm:px-12 py-14 grid grid-cols-2 sm:grid-cols-12 gap-10 text-sm">
        <div class="sm:col-span-3">
          <p class="text-[10px] uppercase tracking-[0.25em] opacity-70 mb-4">{{ t('footer.services') }}</p>
          <ul class="space-y-2.5">
            <li><NuxtLink :to="localePath({ name: 'chauffeur' })" class="opacity-90 hover:opacity-100">{{ t('nav.chauffeur') }}</NuxtLink></li>
            <li><NuxtLink :to="localePath({ name: 'cars' })" class="opacity-90 hover:opacity-100">{{ t('nav.cars') }}</NuxtLink></li>
            <li><NuxtLink :to="localePath({ name: 'yacht' })" class="opacity-90 hover:opacity-100">{{ t('nav.yacht') }}</NuxtLink></li>
            <li><NuxtLink :to="localePath({ name: 'helicopter' })" class="opacity-90 hover:opacity-100">{{ t('nav.helicopter') }}</NuxtLink></li>
            <li><NuxtLink :to="localePath({ name: 'access' })" class="opacity-90 hover:opacity-100">{{ t('nav.access') }}</NuxtLink></li>
            <li><NuxtLink :to="localePath({ name: 'villas' })" class="opacity-90 hover:opacity-100">{{ t('nav.villas') }}</NuxtLink></li>
          </ul>
        </div>
        <div class="sm:col-span-3">
          <p class="text-[10px] uppercase tracking-[0.25em] opacity-70 mb-4">{{ t('footer.maison') }}</p>
          <ul class="space-y-2.5">
            <li><NuxtLink :to="localePath('/contact')" class="opacity-90 hover:opacity-100">{{ t('footer.contact') }}</NuxtLink></li>
            <li><NuxtLink :to="localePath('/contact')" class="opacity-90 hover:opacity-100">{{ t('nav.request') }}</NuxtLink></li>
            <li><NuxtLink :to="localePath({ name: 'careers' })" class="opacity-90 hover:opacity-100">{{ locale === 'fr' ? 'Carrières' : 'Careers' }}</NuxtLink></li>
          </ul>
        </div>
        <div class="col-span-2 sm:col-span-6">
          <p class="text-[10px] uppercase tracking-[0.25em] opacity-70 mb-4">{{ t('footer.reachUs') }}</p>
          <div class="grid grid-cols-2 gap-x-6 gap-y-5 text-sm">
            <div>
              <p class="text-[10px] uppercase tracking-widest opacity-60">{{ t('footer.contactPhoneLabel') }}</p>
              <a :href="settings.contactPhoneHref" class="font-display text-base opacity-90 hover:opacity-100">{{ settings.contactPhone }}</a>
            </div>
            <div v-if="whatsappHref">
              <p class="text-[10px] uppercase tracking-widest opacity-60">{{ t('footer.contactWhatsappLabel') }}</p>
              <a :href="whatsappHref" target="_blank" rel="noopener" class="font-display text-base opacity-90 hover:opacity-100">{{ whatsappDisplay }}</a>
            </div>
            <div>
              <p class="text-[10px] uppercase tracking-widest opacity-60">{{ t('footer.contactEmailLabel') }}</p>
              <a :href="`mailto:${settings.contactEmail}`" class="font-display text-base opacity-90 hover:opacity-100">{{ settings.contactEmail }}</a>
            </div>
            <div>
              <p class="text-[10px] uppercase tracking-widest opacity-60">{{ t('footer.contactHoursLabel') }}</p>
              <p class="text-xs opacity-80 mt-1">{{ t('footer.contactHours') }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Wordmark band -->
    <div class="border-b border-misana-paper/15">
      <div class="max-w-[1600px] mx-auto px-6 sm:px-12 py-12 sm:py-16 text-center">
        <p class="font-display tracking-[0.05em] text-[18vw] sm:text-[14vw] lg:text-[12rem] leading-[0.85] opacity-90" data-display>
          {{ t('brand.name') }}
        </p>
      </div>
    </div>

    <!-- Legal base : grid 3 col egales pour que les liens soient vraiment
         au centre du viewport (justify-between alignait sur les bords des
         items, pas du viewport). Mobile : empile centre. -->
    <div>
      <div class="max-w-[1600px] mx-auto px-6 sm:px-12 py-6 text-xs opacity-70">
        <div class="flex flex-col items-center gap-3 sm:grid sm:grid-cols-3 sm:items-center sm:gap-4">
          <p class="text-center sm:text-left sm:justify-self-start">
            © {{ year }} {{ t('brand.name') }}
          </p>
          <ul class="flex flex-wrap justify-center gap-4 sm:justify-self-center">
            <li><NuxtLink :to="localePath('/legal/mentions')" class="hover:opacity-100">{{ t('footer.legal.mentions') }}</NuxtLink></li>
            <li><NuxtLink :to="localePath('/legal/cgv')" class="hover:opacity-100">{{ t('footer.legal.cgv') }}</NuxtLink></li>
            <li><NuxtLink :to="localePath('/legal/privacy')" class="hover:opacity-100">{{ t('footer.legal.privacy') }}</NuxtLink></li>
            <li><NuxtLink :to="localePath('/legal/cookies')" class="hover:opacity-100">{{ t('footer.legal.cookies') }}</NuxtLink></li>
          </ul>
          <span class="hidden sm:inline-flex sm:justify-self-end">
            <LocaleSwitcher />
          </span>
        </div>
      </div>
    </div>
  </footer>
</template>
