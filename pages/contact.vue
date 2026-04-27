<script setup lang="ts">
// Page /contact - structure inspiree de Le Collectionist contact, adaptee Misana.
// Layout : 4 rows en 2 colonnes (label gauche / contenu droite), tres lineaire.
// 1. Hero : titre + lead + CTA secondaire
// 2. Row "Par telephone" : label / numero + horaires
// 3. Row "Par email" : label + intro / formulaire complet
// 4. Row "Autre demande" : label / 4 link cards empilees

definePageMeta({ layout: 'default' });

const { t } = useI18n();
const localePath = useLocalePath();
const route = useRoute();

useSeoMeta({
  title: () => `${t('contact.title')} · Misana`,
  description: () => t('contact.metaDescription'),
});

const SUBJECTS = ['request', 'feedback', 'press', 'other'] as const;
type Subject = (typeof SUBJECTS)[number];

function readSubject(): Subject {
  const q = String(route.query.subject ?? '');
  return (SUBJECTS as readonly string[]).includes(q) ? (q as Subject) : ('request' as Subject);
}

const form = reactive({
  subject: readSubject(),
  message: '',
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  newsletter: false,
  consent: false,
  honeypot: '',
});

const submitting = ref(false);
const errorMessage = ref('');
const sent = ref(false);

watch(() => route.query.subject, () => {
  form.subject = readSubject();
});

async function submitContact(e: Event) {
  e.preventDefault();
  if (submitting.value) return;
  errorMessage.value = '';

  if (!form.consent) {
    errorMessage.value = t('contact.errorConsent');
    return;
  }
  if (form.message.trim().length < 10) {
    errorMessage.value = t('contact.errorMessage');
    return;
  }
  if (!form.firstName || !form.lastName || !form.email) {
    errorMessage.value = t('contact.errorRequired');
    return;
  }

  submitting.value = true;
  try {
    await $fetch('/api/contact', { method: 'POST', body: { ...form } });
    sent.value = true;
  } catch (err) {
    console.error(err);
    errorMessage.value = t('contact.errorSubmit');
  } finally {
    submitting.value = false;
  }
}

useHead({
  script: [{
    type: 'application/ld+json',
    innerHTML: JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'ContactPage',
      name: 'Misana',
      url: 'https://misana.com/contact',
    }),
  }],
});
</script>

<template>
  <main class="bg-misana-paper">
    <div class="max-w-[1280px] mx-auto px-6 sm:px-12 py-16 sm:py-24 space-y-16 sm:space-y-20">

      <!-- 1. HERO : titre + lead + FAQ link, aligne a gauche, demi-largeur -->
      <section class="grid grid-cols-1 sm:grid-cols-2">
        <div>
          <h1 class="font-display text-4xl sm:text-5xl mb-5 leading-tight">{{ t('contact.title') }}</h1>
          <p class="text-misana-muted leading-relaxed mb-7 max-w-md">{{ t('contact.lead') }}</p>
          <NuxtLink
            :to="localePath('/legal/cgv')"
            class="inline-block border border-misana-ink px-5 py-3 text-xs uppercase tracking-[0.15em] hover:bg-misana-ink hover:text-misana-paper transition"
          >
            {{ t('contact.faqCta') }}
          </NuxtLink>
        </div>
      </section>

      <!-- 2. ROW "Par telephone" -->
      <section class="grid grid-cols-1 sm:grid-cols-2 gap-8 sm:gap-10 pt-12 sm:pt-16 border-t border-misana-line">
        <div>
          <h2 class="font-display text-2xl sm:text-3xl">{{ t('contact.phoneSection') }}</h2>
        </div>
        <div>
          <a
            href="tel:+33400000000"
            class="text-base uppercase tracking-[0.15em] text-misana-ink underline underline-offset-4 hover:text-misana-muted transition inline-block"
          >
            +33&nbsp;4&nbsp;00&nbsp;00&nbsp;00&nbsp;00
          </a>
          <p class="text-misana-muted leading-relaxed mt-4 max-w-md">{{ t('contact.phoneHours') }}</p>
        </div>
      </section>

      <!-- 3. ROW "Par email" : label + intro gauche / form droite -->
      <section class="grid grid-cols-1 sm:grid-cols-2 gap-8 sm:gap-10 pt-12 sm:pt-16 border-t border-misana-line">
        <div>
          <h2 class="font-display text-2xl sm:text-3xl mb-3">{{ t('contact.emailSection') }}</h2>
          <p class="text-misana-muted leading-relaxed max-w-md">{{ t('contact.emailIntro') }}</p>
        </div>

        <div>
          <div v-if="sent" class="border border-misana-line p-8 text-center">
            <p class="text-[11px] uppercase tracking-[0.25em] text-misana-muted mb-3">{{ t('contact.thanksKicker') }}</p>
            <h3 class="font-display text-2xl mb-3">{{ t('contact.thanksTitle') }}</h3>
            <p class="text-misana-muted text-sm">{{ t('contact.thanksBody') }}</p>
          </div>

          <form v-else novalidate class="space-y-6" @submit="submitContact">
            <!-- Subject -->
            <label class="block">
              <span class="text-[11px] uppercase tracking-[0.15em] text-misana-ink block mb-2">
                {{ t('contact.field.subject') }} <span class="text-misana-muted">*</span>
              </span>
              <select
                v-model="form.subject"
                class="w-full bg-transparent border border-misana-line px-3 py-3 text-sm focus:outline-none focus:border-misana-ink cursor-pointer"
              >
                <option v-for="s in SUBJECTS" :key="s" :value="s">{{ t(`contact.subject.${s}`) }}</option>
              </select>
            </label>

            <!-- Message -->
            <label class="block">
              <span class="text-[11px] uppercase tracking-[0.15em] text-misana-ink block mb-2">
                {{ t('contact.field.message') }} <span class="text-misana-muted">*</span>
              </span>
              <textarea
                v-model="form.message"
                rows="4"
                :placeholder="t('contact.field.messagePlaceholder')"
                class="w-full bg-transparent border border-misana-line px-3 py-3 text-sm focus:outline-none focus:border-misana-ink resize-none placeholder:text-misana-muted/60"
              ></textarea>
            </label>

            <!-- Sub-section : how to reach back -->
            <h3 class="font-display text-xl pt-4">{{ t('contact.reachBackSection') }}</h3>

            <!-- Name 50/50 -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <label class="block">
                <span class="text-[11px] uppercase tracking-[0.15em] text-misana-ink block mb-2">
                  {{ t('contact.field.firstName') }} <span class="text-misana-muted">*</span>
                </span>
                <input
                  v-model="form.firstName"
                  type="text"
                  autocomplete="given-name"
                  class="w-full bg-transparent border border-misana-line px-3 py-3 text-sm focus:outline-none focus:border-misana-ink"
                />
              </label>
              <label class="block">
                <span class="text-[11px] uppercase tracking-[0.15em] text-misana-ink block mb-2">
                  {{ t('contact.field.lastName') }} <span class="text-misana-muted">*</span>
                </span>
                <input
                  v-model="form.lastName"
                  type="text"
                  autocomplete="family-name"
                  class="w-full bg-transparent border border-misana-line px-3 py-3 text-sm focus:outline-none focus:border-misana-ink"
                />
              </label>
            </div>

            <!-- Email full width -->
            <label class="block">
              <span class="text-[11px] uppercase tracking-[0.15em] text-misana-ink block mb-2">
                {{ t('contact.field.email') }} <span class="text-misana-muted">*</span>
              </span>
              <input
                v-model="form.email"
                type="email"
                autocomplete="email"
                class="w-full bg-transparent border border-misana-line px-3 py-3 text-sm focus:outline-none focus:border-misana-ink"
              />
            </label>

            <!-- Phone full width -->
            <label class="block">
              <span class="text-[11px] uppercase tracking-[0.15em] text-misana-ink block mb-2">
                {{ t('contact.field.phone') }}
              </span>
              <input
                v-model="form.phone"
                type="tel"
                autocomplete="tel"
                class="w-full bg-transparent border border-misana-line px-3 py-3 text-sm focus:outline-none focus:border-misana-ink"
              />
            </label>

            <!-- Honeypot -->
            <input
              v-model="form.honeypot"
              type="text"
              tabindex="-1"
              autocomplete="off"
              aria-hidden="true"
              class="hidden"
            />

            <!-- Newsletter optin -->
            <label class="flex items-start gap-3 cursor-pointer">
              <input v-model="form.newsletter" type="checkbox" class="mt-1 accent-misana-ink shrink-0" />
              <span class="text-xs text-misana-muted leading-relaxed">{{ t('contact.newsletterOptin') }}</span>
            </label>

            <!-- Consent (required) -->
            <label class="flex items-start gap-3 cursor-pointer">
              <input v-model="form.consent" type="checkbox" class="mt-1 accent-misana-ink shrink-0" />
              <span class="text-xs text-misana-muted leading-relaxed">{{ t('contact.consent') }}</span>
            </label>

            <p v-if="errorMessage" class="text-sm text-red-700">{{ errorMessage }}</p>

            <button
              type="submit"
              :disabled="submitting"
              class="bg-misana-ink text-misana-paper px-7 py-3 text-xs uppercase tracking-[0.15em] hover:bg-misana-ink/90 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {{ submitting ? t('contact.sending') : t('contact.submit') }}
            </button>
          </form>
        </div>
      </section>

      <!-- 4. ROW "Autre demande" : label gauche / 4 link cards droite -->
      <section class="grid grid-cols-1 sm:grid-cols-2 gap-8 sm:gap-10 pt-12 sm:pt-16 border-t border-misana-line">
        <div>
          <h2 class="font-display text-2xl sm:text-3xl mb-3">{{ t('contact.routesSection') }}</h2>
          <p class="text-misana-muted leading-relaxed max-w-md">{{ t('contact.routesIntro') }}</p>
        </div>

        <div class="space-y-3">
          <NuxtLink
            v-for="r in (['request', 'partners', 'press', 'careers'] as const)"
            :key="r"
            :to="localePath(r === 'request' ? '/request' : `/contact?subject=${r === 'careers' || r === 'partners' ? 'other' : r}`)"
            class="contact-route flex items-center justify-between border border-misana-line p-4 hover:border-misana-ink transition group"
          >
            <div class="flex flex-col gap-1 grow pr-4">
              <span class="text-base text-misana-ink">{{ t(`contact.routes.${r}.title`) }}</span>
              <span class="text-sm text-misana-muted leading-relaxed">{{ t(`contact.routes.${r}.body`) }}</span>
            </div>
            <span class="inline-flex items-center justify-center w-5 h-5 shrink-0 transition-transform duration-500 group-hover:translate-x-1">
              <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" class="block w-full h-full">
                <path d="M3 12h18m0 0l-8.5-8.5M21 12l-8.5 8.5" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
            </span>
          </NuxtLink>
        </div>
      </section>

    </div>
  </main>
</template>
