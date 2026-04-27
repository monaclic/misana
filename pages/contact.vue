<script setup lang="ts">
// Page /contact - structure inspiree de Le Collectionist contact, adaptee Misana.
// Sections : hero, quick contact strip, form, alternative routes (2x2 grid).

definePageMeta({ layout: 'default' });

const { t } = useI18n();
const localePath = useLocalePath();
const route = useRoute();

useSeoMeta({
  title: () => `${t('contact.title')} · Misana`,
  description: () => t('contact.metaDescription'),
});

const SUBJECTS = ['request', 'press', 'partners', 'careers', 'other'] as const;
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
  consent: false,
  honeypot: '',
});

const submitting = ref(false);
const errorMessage = ref('');
const sent = ref(false);

// When the user clicks an internal `?subject=press` route card, sync the form
// subject + scroll to the form. The page itself does not remount.
watch(() => route.query.subject, () => {
  form.subject = readSubject();
  if (typeof window !== 'undefined') {
    document.querySelector('form')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
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
  <main>
    <!-- ============================================== -->
    <!-- 1. HERO                                          -->
    <!-- ============================================== -->
    <section class="bg-misana-paper border-b border-misana-line">
      <div class="max-w-3xl mx-auto px-6 py-24 sm:py-28 text-center">
        <p class="text-[11px] uppercase tracking-[0.25em] text-misana-muted mb-5">
          (CT · 01) · {{ t('contact.kicker') }}
        </p>
        <h1 class="font-display text-5xl sm:text-6xl lg:text-7xl leading-[1.02] mb-6">
          {{ t('contact.title') }}
        </h1>
        <p class="text-misana-muted text-lg leading-relaxed max-w-xl mx-auto">
          {{ t('contact.lead') }}
        </p>
      </div>
    </section>

    <!-- ============================================== -->
    <!-- 2. QUICK CONTACT STRIP                          -->
    <!-- ============================================== -->
    <section class="bg-misana-stone border-b border-misana-line">
      <div class="max-w-[1600px] mx-auto px-6 sm:px-12 py-14 grid grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-10 text-center">
        <div>
          <p class="text-[10px] uppercase tracking-[0.25em] text-misana-muted mb-3">{{ t('contact.phoneLabel') }}</p>
          <a href="tel:+33400000000" class="font-display text-2xl sm:text-3xl hover:opacity-70 transition">+33 4 00 00 00 00</a>
        </div>
        <div>
          <p class="text-[10px] uppercase tracking-[0.25em] text-misana-muted mb-3">{{ t('contact.whatsappLabel') }}</p>
          <a href="https://wa.me/33600000000" class="font-display text-2xl sm:text-3xl hover:opacity-70 transition">+33 6 00 00 00 00</a>
        </div>
        <div>
          <p class="text-[10px] uppercase tracking-[0.25em] text-misana-muted mb-3">{{ t('contact.emailLabel') }}</p>
          <a href="mailto:contact@misana.com" class="font-display text-2xl sm:text-3xl hover:opacity-70 transition">contact@misana.com</a>
        </div>
        <div>
          <p class="text-[10px] uppercase tracking-[0.25em] text-misana-muted mb-3">{{ t('contact.hoursLabel') }}</p>
          <p class="font-display text-2xl sm:text-3xl">{{ t('contact.hoursValue') }}</p>
          <p class="text-xs text-misana-muted mt-1">{{ t('contact.hoursDetail') }}</p>
        </div>
      </div>
    </section>

    <!-- ============================================== -->
    <!-- 3. FORM                                          -->
    <!-- ============================================== -->
    <section class="bg-misana-paper border-b border-misana-line">
      <div class="max-w-2xl mx-auto px-6 py-24">
        <div class="text-center mb-12">
          <p class="text-[11px] uppercase tracking-[0.25em] text-misana-muted mb-4">(CT · 02) · {{ t('contact.formKicker') }}</p>
          <h2 class="font-display text-3xl sm:text-4xl leading-[1.05]">{{ t('contact.formTitle') }}</h2>
        </div>

        <div v-if="sent" class="border border-misana-line p-10 text-center">
          <p class="text-[11px] uppercase tracking-[0.25em] text-misana-muted mb-3">{{ t('contact.thanksKicker') }}</p>
          <h3 class="font-display text-3xl mb-4">{{ t('contact.thanksTitle') }}</h3>
          <p class="text-misana-muted">{{ t('contact.thanksBody') }}</p>
        </div>

        <form v-else class="space-y-7" @submit="submitContact" novalidate>
          <!-- Subject -->
          <label class="block">
            <span class="text-[10px] uppercase tracking-[0.25em] text-misana-muted block mb-2">{{ t('contact.field.subject') }}</span>
            <select
              v-model="form.subject"
              class="w-full bg-transparent border-b border-misana-ink py-2.5 text-base focus:outline-none focus:border-b-2 cursor-pointer"
            >
              <option v-for="s in SUBJECTS" :key="s" :value="s">{{ t(`contact.subject.${s}`) }}</option>
            </select>
          </label>

          <!-- Message -->
          <label class="block">
            <span class="text-[10px] uppercase tracking-[0.25em] text-misana-muted block mb-2">{{ t('contact.field.message') }}</span>
            <textarea
              v-model="form.message"
              rows="5"
              :placeholder="t('contact.field.messagePlaceholder')"
              class="w-full bg-transparent border-b border-misana-ink py-2.5 text-base focus:outline-none focus:border-b-2 resize-none placeholder:text-misana-muted/60"
            ></textarea>
          </label>

          <!-- Name : 2 cols -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-7">
            <label class="block">
              <span class="text-[10px] uppercase tracking-[0.25em] text-misana-muted block mb-2">{{ t('contact.field.firstName') }}</span>
              <input
                v-model="form.firstName"
                type="text"
                autocomplete="given-name"
                class="w-full bg-transparent border-b border-misana-ink py-2.5 text-base focus:outline-none focus:border-b-2"
              />
            </label>
            <label class="block">
              <span class="text-[10px] uppercase tracking-[0.25em] text-misana-muted block mb-2">{{ t('contact.field.lastName') }}</span>
              <input
                v-model="form.lastName"
                type="text"
                autocomplete="family-name"
                class="w-full bg-transparent border-b border-misana-ink py-2.5 text-base focus:outline-none focus:border-b-2"
              />
            </label>
          </div>

          <!-- Email + Phone -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-7">
            <label class="block">
              <span class="text-[10px] uppercase tracking-[0.25em] text-misana-muted block mb-2">{{ t('contact.field.email') }}</span>
              <input
                v-model="form.email"
                type="email"
                autocomplete="email"
                class="w-full bg-transparent border-b border-misana-ink py-2.5 text-base focus:outline-none focus:border-b-2"
              />
            </label>
            <label class="block">
              <span class="text-[10px] uppercase tracking-[0.25em] text-misana-muted block mb-2">{{ t('contact.field.phone') }}</span>
              <input
                v-model="form.phone"
                type="tel"
                autocomplete="tel"
                class="w-full bg-transparent border-b border-misana-ink py-2.5 text-base focus:outline-none focus:border-b-2"
              />
            </label>
          </div>

          <!-- Honeypot (hidden) -->
          <input
            v-model="form.honeypot"
            type="text"
            tabindex="-1"
            autocomplete="off"
            aria-hidden="true"
            class="hidden"
          />

          <!-- Consent -->
          <label class="flex items-start gap-3 cursor-pointer">
            <input v-model="form.consent" type="checkbox" class="mt-1 accent-misana-ink shrink-0" />
            <span class="text-xs text-misana-muted leading-relaxed">{{ t('contact.consent') }}</span>
          </label>

          <p v-if="errorMessage" class="text-sm text-red-700">{{ errorMessage }}</p>

          <button
            type="submit"
            :disabled="submitting"
            class="w-full sm:w-auto bg-misana-ink text-misana-paper px-10 py-4 text-sm tracking-wide hover:bg-misana-ink/90 transition disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center gap-3"
          >
            <span>{{ submitting ? t('contact.sending') : t('contact.submit') }}</span>
            <span v-if="!submitting" class="inline-flex items-center justify-center w-[1.1em] h-[1.1em] translate-y-[0.22em]">
              <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" class="block w-full h-full">
                <path d="M7 12H17" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
                <path d="M13.5 8.5L17 12L13.5 15.5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
            </span>
          </button>
        </form>
      </div>
    </section>

    <!-- ============================================== -->
    <!-- 4. ALTERNATIVE ROUTES (2x2 grid)                -->
    <!-- ============================================== -->
    <section class="bg-misana-stone border-b border-misana-line">
      <div class="max-w-[1600px] mx-auto px-6 sm:px-12 py-24">
        <div class="text-center mb-14">
          <p class="text-[11px] uppercase tracking-[0.25em] text-misana-muted mb-4">(CT · 03) · {{ t('contact.routesKicker') }}</p>
          <h2 class="font-display text-3xl sm:text-4xl leading-[1.05]">{{ t('contact.routesTitle') }}</h2>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-px bg-misana-line">
          <NuxtLink
            :to="localePath('/request')"
            class="route-card bg-misana-paper p-10"
          >
            <p class="text-[10px] uppercase tracking-[0.25em] text-misana-muted mb-3">{{ t('contact.routes.request.kicker') }}</p>
            <h3 class="font-display text-2xl sm:text-3xl mb-4 leading-tight">{{ t('contact.routes.request.title') }}</h3>
            <p class="text-misana-muted leading-relaxed mb-5">{{ t('contact.routes.request.body') }}</p>
            <span class="inline-flex items-center gap-2.5 text-sm border-b border-misana-ink pb-0.5 group-hover:opacity-70 transition">
              <span>{{ t('contact.routes.request.cta') }}</span>
              <span class="inline-flex items-center justify-center w-[1.1em] h-[1.1em] translate-y-[0.22em]">
                <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" class="block w-full h-full">
                  <path d="M7 12H17" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
                  <path d="M13.5 8.5L17 12L13.5 15.5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" />
                </svg>
              </span>
            </span>
          </NuxtLink>

          <NuxtLink
            :to="localePath('/contact?subject=press')"
            class="route-card bg-misana-paper p-10"
          >
            <p class="text-[10px] uppercase tracking-[0.25em] text-misana-muted mb-3">{{ t('contact.routes.press.kicker') }}</p>
            <h3 class="font-display text-2xl sm:text-3xl mb-4 leading-tight">{{ t('contact.routes.press.title') }}</h3>
            <p class="text-misana-muted leading-relaxed mb-5">{{ t('contact.routes.press.body') }}</p>
            <span class="inline-flex items-center gap-2.5 text-sm border-b border-misana-ink pb-0.5 group-hover:opacity-70 transition">
              <span>{{ t('contact.routes.press.cta') }}</span>
              <span class="inline-flex items-center justify-center w-[1.1em] h-[1.1em] translate-y-[0.22em]">
                <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" class="block w-full h-full">
                  <path d="M7 12H17" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
                  <path d="M13.5 8.5L17 12L13.5 15.5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" />
                </svg>
              </span>
            </span>
          </NuxtLink>

          <NuxtLink
            :to="localePath('/contact?subject=partners')"
            class="route-card bg-misana-paper p-10"
          >
            <p class="text-[10px] uppercase tracking-[0.25em] text-misana-muted mb-3">{{ t('contact.routes.partners.kicker') }}</p>
            <h3 class="font-display text-2xl sm:text-3xl mb-4 leading-tight">{{ t('contact.routes.partners.title') }}</h3>
            <p class="text-misana-muted leading-relaxed mb-5">{{ t('contact.routes.partners.body') }}</p>
            <span class="inline-flex items-center gap-2.5 text-sm border-b border-misana-ink pb-0.5 group-hover:opacity-70 transition">
              <span>{{ t('contact.routes.partners.cta') }}</span>
              <span class="inline-flex items-center justify-center w-[1.1em] h-[1.1em] translate-y-[0.22em]">
                <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" class="block w-full h-full">
                  <path d="M7 12H17" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
                  <path d="M13.5 8.5L17 12L13.5 15.5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" />
                </svg>
              </span>
            </span>
          </NuxtLink>

          <NuxtLink
            :to="localePath('/contact?subject=careers')"
            class="route-card bg-misana-paper p-10"
          >
            <p class="text-[10px] uppercase tracking-[0.25em] text-misana-muted mb-3">{{ t('contact.routes.careers.kicker') }}</p>
            <h3 class="font-display text-2xl sm:text-3xl mb-4 leading-tight">{{ t('contact.routes.careers.title') }}</h3>
            <p class="text-misana-muted leading-relaxed mb-5">{{ t('contact.routes.careers.body') }}</p>
            <span class="inline-flex items-center gap-2.5 text-sm border-b border-misana-ink pb-0.5 group-hover:opacity-70 transition">
              <span>{{ t('contact.routes.careers.cta') }}</span>
              <span class="inline-flex items-center justify-center w-[1.1em] h-[1.1em] translate-y-[0.22em]">
                <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" class="block w-full h-full">
                  <path d="M7 12H17" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
                  <path d="M13.5 8.5L17 12L13.5 15.5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" />
                </svg>
              </span>
            </span>
          </NuxtLink>
        </div>
      </div>
    </section>
  </main>
</template>

<style scoped>
.route-card { display: block; transition: background 0.3s ease; }
.route-card:hover { background: var(--color-misana-stone); }
</style>
