<script setup lang="ts">
import { CITIES, EVENTS, ESTABLISHMENTS } from '~/lib/constants';

const { locale, t } = useI18n();
const localePath = useLocalePath();

const heavyCities = CITIES.filter((c) => c.tier === 'heavy');
const stubCities = CITIES.filter((c) => c.tier !== 'heavy');
const heavyEvents = EVENTS.filter((e) => e.tier === 'heavy');
const palaces = ESTABLISHMENTS.filter((e) => e.category === 'palace').slice(0, 4);
const restaurants = ESTABLISHMENTS.filter((e) => e.category === 'restaurant').slice(0, 4);

const newsletterEmail = ref('');
const newsletterSent = ref(false);
function submitNewsletter(e: Event) {
  e.preventDefault();
  if (!newsletterEmail.value) return;
  newsletterSent.value = true;
  newsletterEmail.value = '';
}

const year = new Date().getFullYear();
</script>

<template>
  <footer class="bg-misana-ink text-misana-paper">
    <!-- Brand statement strip -->
    <div class="border-b border-misana-paper/15">
      <div class="max-w-[1600px] mx-auto px-6 sm:px-12 py-16 grid grid-cols-1 lg:grid-cols-12 gap-10 items-end">
        <div class="lg:col-span-7">
          <p class="text-[11px] uppercase tracking-[0.25em] opacity-70 mb-5">{{ t('footer.signature') }}</p>
          <p class="font-display text-3xl sm:text-5xl leading-[1.05]">{{ t('footer.brandStatement') }}</p>
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

    <!-- Sitemap columns -->
    <div class="border-b border-misana-paper/15">
      <div class="max-w-[1600px] mx-auto px-6 sm:px-12 py-14 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-10 text-sm">
        <div>
          <p class="text-[10px] uppercase tracking-[0.25em] opacity-70 mb-4">{{ t('footer.services') }}</p>
          <ul class="space-y-2.5">
            <li><NuxtLink :to="localePath('/services/chauffeur')" class="opacity-90 hover:opacity-100">{{ t('nav.chauffeur') }}</NuxtLink></li>
            <li><NuxtLink :to="localePath('/services/cars')" class="opacity-90 hover:opacity-100">{{ t('nav.cars') }}</NuxtLink></li>
            <li><NuxtLink :to="localePath('/services/yacht')" class="opacity-90 hover:opacity-100">{{ t('nav.yacht') }}</NuxtLink></li>
            <li><NuxtLink :to="localePath('/services/helicopter')" class="opacity-90 hover:opacity-100">{{ t('nav.helicopter') }}</NuxtLink></li>
            <li><NuxtLink :to="localePath('/services/access')" class="opacity-90 hover:opacity-100">{{ t('nav.access') }}</NuxtLink></li>
            <li><NuxtLink :to="localePath('/transfers')" class="opacity-90 hover:opacity-100">{{ t('crosslink.allTransfers') }}</NuxtLink></li>
          </ul>
        </div>
        <div>
          <p class="text-[10px] uppercase tracking-[0.25em] opacity-70 mb-4">{{ t('footer.destinations') }}</p>
          <ul class="space-y-2.5">
            <li v-for="c in heavyCities" :key="c.slug">
              <NuxtLink :to="localePath(`/destinations/${c.slug}`)" class="opacity-90 hover:opacity-100">
                {{ locale === 'fr' ? c.fr : c.en }}
              </NuxtLink>
            </li>
            <li v-for="c in stubCities" :key="c.slug">
              <NuxtLink :to="localePath(`/destinations/${c.slug}`)" class="opacity-70 hover:opacity-100 text-xs">
                {{ locale === 'fr' ? c.fr : c.en }}
              </NuxtLink>
            </li>
          </ul>
        </div>
        <div>
          <p class="text-[10px] uppercase tracking-[0.25em] opacity-70 mb-4">{{ t('footer.events') }}</p>
          <ul class="space-y-2.5">
            <li v-for="e in heavyEvents" :key="e.slug">
              <NuxtLink :to="localePath(`/events/${e.slug}`)" class="opacity-90 hover:opacity-100">
                {{ locale === 'fr' ? e.fr : e.en }}
              </NuxtLink>
            </li>
          </ul>
        </div>
        <div>
          <p class="text-[10px] uppercase tracking-[0.25em] opacity-70 mb-4">{{ t('footer.access') }}</p>
          <ul class="space-y-2.5">
            <li v-for="p in palaces" :key="p.slug">
              <NuxtLink :to="localePath(`/services/access/${p.slug}`)" class="opacity-90 hover:opacity-100">
                {{ p.name }}
              </NuxtLink>
            </li>
            <li v-for="r in restaurants" :key="r.slug">
              <NuxtLink :to="localePath(`/services/access/${r.slug}`)" class="opacity-70 hover:opacity-100 text-xs">
                {{ r.name }}
              </NuxtLink>
            </li>
          </ul>
        </div>
        <div>
          <p class="text-[10px] uppercase tracking-[0.25em] opacity-70 mb-4">{{ t('footer.maison') }}</p>
          <ul class="space-y-2.5">
            <li><NuxtLink :to="localePath('/about')" class="opacity-90 hover:opacity-100">{{ t('footer.about') }}</NuxtLink></li>
            <li><NuxtLink :to="localePath('/journal')" class="opacity-90 hover:opacity-100">{{ t('footer.journal') }}</NuxtLink></li>
            <li><NuxtLink :to="localePath('/contact')" class="opacity-90 hover:opacity-100">{{ t('footer.contact') }}</NuxtLink></li>
            <li><NuxtLink :to="localePath('/request')" class="opacity-90 hover:opacity-100">{{ t('nav.request') }}</NuxtLink></li>
          </ul>
        </div>
        <div>
          <p class="text-[10px] uppercase tracking-[0.25em] opacity-70 mb-4">{{ t('footer.reachUs') }}</p>
          <ul class="space-y-2.5 text-sm">
            <li>
              <p class="text-[10px] uppercase tracking-widest opacity-60">{{ t('footer.contactPhoneLabel') }}</p>
              <a href="tel:+33400000000" class="font-display text-base opacity-90 hover:opacity-100">+33 4 00 00 00 00</a>
            </li>
            <li>
              <p class="text-[10px] uppercase tracking-widest opacity-60">{{ t('footer.contactWhatsappLabel') }}</p>
              <a href="https://wa.me/33600000000" class="font-display text-base opacity-90 hover:opacity-100">+33 6 00 00 00 00</a>
            </li>
            <li>
              <p class="text-[10px] uppercase tracking-widest opacity-60">{{ t('footer.contactEmailLabel') }}</p>
              <a href="mailto:hello@misana.com" class="font-display text-base opacity-90 hover:opacity-100">hello@misana.com</a>
            </li>
            <li class="pt-2">
              <p class="text-[10px] uppercase tracking-widest opacity-60">{{ t('footer.contactHoursLabel') }}</p>
              <p class="text-xs opacity-80 mt-1">{{ t('footer.contactHours') }}</p>
            </li>
          </ul>
        </div>
      </div>
    </div>

    <!-- Wordmark band -->
    <div class="border-b border-misana-paper/15">
      <div class="max-w-[1600px] mx-auto px-6 sm:px-12 py-12 sm:py-16 text-center">
        <p class="font-display tracking-[0.05em] text-[18vw] sm:text-[14vw] lg:text-[12rem] leading-[0.85] opacity-90">
          {{ t('brand.name') }}
        </p>
      </div>
    </div>

    <!-- Legal base -->
    <div>
      <div class="max-w-[1600px] mx-auto px-6 sm:px-12 py-6 flex flex-wrap items-center justify-between text-xs opacity-70 gap-4">
        <p>© {{ year }} {{ t('brand.name') }} · {{ t('footer.coordinates') }} · {{ t('footer.established') }}</p>
        <ul class="flex flex-wrap gap-4">
          <li><NuxtLink :to="localePath('/legal/mentions')" class="hover:opacity-100">{{ t('footer.legal.mentions') }}</NuxtLink></li>
          <li><NuxtLink :to="localePath('/legal/cgv')" class="hover:opacity-100">{{ t('footer.legal.cgv') }}</NuxtLink></li>
          <li><NuxtLink :to="localePath('/legal/privacy')" class="hover:opacity-100">{{ t('footer.legal.privacy') }}</NuxtLink></li>
          <li><NuxtLink :to="localePath('/legal/cookies')" class="hover:opacity-100">{{ t('footer.legal.cookies') }}</NuxtLink></li>
        </ul>
        <p>
          Made by
          <a
            href="https://monaclic.com"
            target="_blank"
            rel="noopener noreferrer"
            class="underline underline-offset-2 hover:opacity-100"
          >Monaclic</a>
        </p>
        <LocaleSwitcher />
      </div>
    </div>
  </footer>
</template>
