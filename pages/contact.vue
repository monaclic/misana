<script setup lang="ts">
// Page /contact - structure inspiree de Le Collectionist contact, adaptee Misana.
// Layout : 4 rows en 2 colonnes (label gauche / contenu droite), tres lineaire.
// 1. Hero : titre + lead + CTA secondaire
// 2. Row "Par telephone" : label / numero + horaires
// 3. Row "Par email" : label + intro / formulaire complet
// 4. Row "Autre demande" : label / 4 link cards empilees

definePageMeta({ layout: 'default' });

const { locale, t } = useI18n();
const localePath = useLocalePath();
const route = useRoute();

// Source : Sanity contactPage (overrides) + globalSettings (phone, email).
// Tous les overrides sont optionnels : fallback sur traductions i18n.
const { contact } = useContactPage();
const { settings } = useGlobalSettings();

function pickLocale(v: { fr?: string; en?: string } | undefined) {
  if (!v) return undefined;
  return locale.value === 'fr' ? (v.fr || v.en) : (v.en || v.fr);
}

const heroTitle = computed(() => pickLocale(contact.value?.heroTitleOverride) || t('contact.title'));
const heroLead = computed(() => pickLocale(contact.value?.heroLeadOverride) || t('contact.lead'));
const phoneSectionLabel = computed(() => pickLocale(contact.value?.phoneSectionLabelOverride) || t('contact.phoneSection'));
const phoneHours = computed(() => pickLocale(contact.value?.phoneHoursOverride) || t('contact.phoneHours'));
const emailSectionLabel = computed(() => pickLocale(contact.value?.emailSectionLabelOverride) || t('contact.emailSection'));
const emailIntro = computed(() => pickLocale(contact.value?.emailIntroOverride) || t('contact.emailIntro'));

useSeoMeta({
  title: () => {
    const s = locale.value === 'fr' ? contact.value?.seo?.titleFr : contact.value?.seo?.titleEn;
    return s || t('contact.seoTitleTag');
  },
  description: () => {
    const s = locale.value === 'fr' ? contact.value?.seo?.descriptionFr : contact.value?.seo?.descriptionEn;
    return s || t('contact.metaDescription');
  },
  ogTitle: () => t('contact.ogTitle'),
  ogDescription: () => t('contact.ogDescription'),
});

const SUBJECTS = [
  'request',
  'chauffeur',
  'cars',
  'yacht',
  'helicopter',
  'access',
  'partners',
  'careers',
  'feedback',
  'press',
  'other',
] as const;
type Subject = (typeof SUBJECTS)[number];

function readSubject(): Subject {
  const q = String(route.query.subject ?? '');
  return (SUBJECTS as readonly string[]).includes(q) ? (q as Subject) : ('request' as Subject);
}

const formRef = ref<HTMLElement | null>(null);
const formFlash = ref(false);

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

// Internal route cards (?subject=press, etc.) update the dropdown, scroll the
// form into view, and flash it briefly so the user sees the finality of click.
watch(() => route.query.subject, async () => {
  form.subject = readSubject();
  await nextTick();
  if (typeof window !== 'undefined' && formRef.value) {
    // Scroll avec offset pour eviter que le header sticky cache le haut
    // du form et donner un peu d'air au-dessus.
    const HEADER_OFFSET = 120;
    const top = formRef.value.getBoundingClientRect().top + window.scrollY - HEADER_OFFSET;
    window.scrollTo({ top, behavior: 'smooth' });
    formFlash.value = true;
    setTimeout(() => { formFlash.value = false; }, 1400);
  }
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
    // Scroll vers le bloc remerciement (qui remplace le form) avec offset
    // header sticky pour qu'il soit immediatement visible apres submit.
    await nextTick();
    if (typeof window !== 'undefined' && formRef.value) {
      const HEADER_OFFSET = 120;
      const top = formRef.value.getBoundingClientRect().top + window.scrollY - HEADER_OFFSET;
      window.scrollTo({ top, behavior: 'smooth' });
    }
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
          <h1 class="font-display text-4xl sm:text-5xl mb-5 leading-tight">{{ heroTitle }}</h1>
          <p class="text-misana-muted leading-relaxed max-w-md">{{ heroLead }}</p>
        </div>
      </section>

      <!-- 2. ROW "Par telephone" -->
      <section class="grid grid-cols-1 sm:grid-cols-2 gap-8 sm:gap-10 pt-12 sm:pt-16 border-t border-misana-line">
        <div>
          <h2 class="font-display text-2xl sm:text-3xl">{{ phoneSectionLabel }}</h2>
        </div>
        <div>
          <a
            :href="settings.contactPhoneHref"
            class="text-base uppercase tracking-[0.15em] text-misana-ink underline underline-offset-4 hover:text-misana-muted transition inline-block"
          >
            {{ settings.contactPhone }}
          </a>
          <p class="text-misana-muted leading-relaxed mt-4 max-w-md">{{ phoneHours }}</p>
        </div>
      </section>

      <!-- 3. ROW "Par email" : label + intro gauche / form droite -->
      <section class="grid grid-cols-1 sm:grid-cols-2 gap-8 sm:gap-10 pt-12 sm:pt-16 border-t border-misana-line">
        <div>
          <h2 class="font-display text-2xl sm:text-3xl mb-3">{{ emailSectionLabel }}</h2>
          <p class="text-misana-muted leading-relaxed max-w-md">{{ emailIntro }}</p>
        </div>

        <div ref="formRef" :class="['contact-form-wrap', formFlash ? 'is-flash' : '']">
          <div v-if="sent" class="success-pill" role="status" aria-live="polite">
            <div class="success-icon">
              <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M5 13l4 4L19 7" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
            </div>
            <p class="success-kicker">{{ t('contact.thanksKicker') }}</p>
            <h3 class="success-title">{{ t('contact.thanksTitle') }}</h3>
            <p class="success-body">{{ t('contact.thanksBody') }}</p>
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
            :to="{ path: localePath('/contact'), query: { subject: r } }"
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

<style scoped>
/* Brief outline flash on the form when the user lands from a route card.
   Visible feedback that the click had a destination. */
.contact-form-wrap {
  position: relative;
  transition: background 0.3s ease;
  padding: 0;
}
.contact-form-wrap.is-flash::before {
  content: '';
  position: absolute;
  inset: -12px;
  border: 1px solid var(--color-misana-ink);
  pointer-events: none;
  animation: contact-flash 1.4s cubic-bezier(0.16, 1, 0.3, 1) both;
}
@keyframes contact-flash {
  0%   { opacity: 0; transform: scale(1.01); }
  20%  { opacity: 1; transform: scale(1); }
  100% { opacity: 0; transform: scale(1); }
}

/* Success pill style Stripe : grand bandeau vert pastel avec cercle
   check anime, suffisamment voyant pour qu'on ne le rate pas meme apres
   scroll. Couleurs sobres pour rester aligne au ton Misana. */
.success-pill {
  background: #ecfdf5;
  border: 1px solid #a7f3d0;
  border-radius: 4px;
  padding: 2.5rem 1.5rem;
  text-align: center;
  animation: success-pill-in 0.5s cubic-bezier(0.16, 1, 0.3, 1) both;
}
@media (min-width: 640px) {
  .success-pill { padding: 3rem 2.5rem; }
}
.success-icon {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: #10b981;
  margin: 0 auto 1.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ffffff;
  box-shadow: 0 4px 16px rgba(16, 185, 129, 0.25);
  animation: success-icon-in 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) 0.1s both;
}
.success-icon svg { width: 32px; height: 32px; }
.success-kicker {
  font-size: 11px;
  letter-spacing: 0.25em;
  text-transform: uppercase;
  color: #047857;
  margin: 0 0 0.6rem;
}
.success-title {
  font-family: var(--font-display);
  font-size: 1.5rem;
  line-height: 1.2;
  color: #064e3b;
  margin: 0 0 0.75rem;
}
@media (min-width: 640px) {
  .success-title { font-size: 1.85rem; }
}
.success-body {
  color: #065f46;
  font-size: 0.95rem;
  line-height: 1.6;
  max-width: 32rem;
  margin: 0 auto;
}
@keyframes success-pill-in {
  from { opacity: 0; transform: translateY(8px); }
  to   { opacity: 1; transform: translateY(0); }
}
@keyframes success-icon-in {
  from { opacity: 0; transform: scale(0.6); }
  to   { opacity: 1; transform: scale(1); }
}
@media (prefers-reduced-motion: reduce) {
  .success-pill, .success-icon { animation: none; }
}
</style>
