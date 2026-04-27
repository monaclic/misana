<script setup lang="ts">
// Page /about - structure inspiree de Resorto about-us, adaptee Misana.
// Sections :
// 1. Banner full-bleed (image + breadcrumb + h1)
// 2. Section "About" titre centre (kicker + h2) + image grid 3 cards
// 3. Split 60/40 : intro + counter cards (annees / villes)
// 4. Sticky color-changing headline + video-marquee (omis V1, on garde headline simple)
// 5. "Why us" : grille 6 cards en quinconce
// 6. FAQ split : images gauche / accordion droite

definePageMeta({ layout: 'default' });

const { locale, t } = useI18n();
const localePath = useLocalePath();

useSeoMeta({
  title: () => `${t('about.title')} · Misana`,
  description: () => t('about.metaDescription'),
});

const reasons = [1, 2, 3, 4, 5, 6] as const;
const faqs = ['hours', 'pricing', 'languages', 'fleet', 'discretion', 'partners'] as const;
const openFaq = ref<string | null>(null);
function toggleFaq(key: string) {
  openFaq.value = openFaq.value === key ? null : key;
}

useHead({
  script: [{
    type: 'application/ld+json',
    innerHTML: JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'AboutPage',
      name: 'Misana',
      url: 'https://misana.com/about',
    }),
  }],
});
</script>

<template>
  <main class="bg-misana-paper">
    <!-- ============================================== -->
    <!-- 1. BANNER full-bleed                            -->
    <!-- ============================================== -->
    <section class="relative h-[60vh] min-h-[420px] overflow-hidden bg-misana-ink">
      <img
        src="https://images.unsplash.com/photo-1499678329028-101435549a4e?w=2400&q=80"
        alt=""
        class="absolute inset-0 w-full h-full object-cover opacity-90"
      />
      <div class="absolute inset-0 bg-misana-ink/35"></div>
      <div class="relative h-full max-w-[1280px] mx-auto px-6 sm:px-12 flex flex-col justify-end pb-16 sm:pb-20 text-misana-paper">
        <div class="flex items-center gap-3 text-[11px] uppercase tracking-[0.2em] opacity-85 mb-6">
          <NuxtLink :to="localePath('/')" class="hover:opacity-70 transition">{{ t('nav.home') }}</NuxtLink>
          <span class="w-1.5 h-1.5 rounded-full bg-misana-paper/60"></span>
          <span>{{ t('about.title') }}</span>
        </div>
        <h1 class="font-display text-5xl sm:text-7xl lg:text-8xl leading-[0.95]">{{ t('about.title') }}</h1>
      </div>
    </section>

    <!-- ============================================== -->
    <!-- 2. ABOUT TITLE BAR + 3 IMAGES GRID              -->
    <!-- ============================================== -->
    <section class="border-b border-misana-line">
      <div class="max-w-[1280px] mx-auto px-6 sm:px-12 py-20 sm:py-24">
        <div class="flex flex-col items-center text-center mb-14 sm:mb-16">
          <div class="flex items-center gap-3 mb-5">
            <span class="block w-10 h-px bg-misana-ink"></span>
            <span class="text-[11px] uppercase tracking-[0.25em] text-misana-muted">{{ t('about.aboutKicker') }}</span>
            <span class="block w-10 h-px bg-misana-ink"></span>
          </div>
          <h2 class="font-display text-4xl sm:text-5xl lg:text-6xl leading-[1.05] max-w-3xl">{{ t('about.aboutTitle') }}</h2>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5">
          <div class="aspect-[3/4] relative overflow-hidden bg-misana-stone">
            <img src="https://images.unsplash.com/photo-1566041510639-8d95a2490bfb?w=900&q=80" alt="" loading="lazy" class="absolute inset-0 w-full h-full object-cover" />
          </div>
          <div class="aspect-[3/4] relative overflow-hidden bg-misana-stone">
            <img src="https://images.unsplash.com/photo-1567899378494-47b22a2ae96a?w=900&q=80" alt="" loading="lazy" class="absolute inset-0 w-full h-full object-cover" />
            <div class="absolute inset-0 bg-misana-ink/40"></div>
            <div class="absolute inset-0 flex flex-col items-center justify-center text-center text-misana-paper p-8">
              <p class="text-[11px] uppercase tracking-[0.25em] mb-4 opacity-85">{{ t('about.spotlightKicker') }}</p>
              <h3 class="font-display text-2xl sm:text-3xl mb-6 leading-tight">{{ t('about.spotlightTitle') }}</h3>
              <NuxtLink :to="localePath('/services/yacht')" class="border border-misana-paper px-5 py-2.5 text-xs uppercase tracking-[0.15em] hover:bg-misana-paper hover:text-misana-ink transition">
                {{ t('about.spotlightCta') }}
              </NuxtLink>
            </div>
          </div>
          <div class="aspect-[3/4] relative overflow-hidden bg-misana-stone">
            <img src="https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=900&q=80" alt="" loading="lazy" class="absolute inset-0 w-full h-full object-cover" />
          </div>
        </div>
      </div>
    </section>

    <!-- ============================================== -->
    <!-- 3. SPLIT INTRO + COUNTERS                       -->
    <!-- ============================================== -->
    <section class="border-b border-misana-line bg-misana-stone">
      <div class="max-w-[1280px] mx-auto px-6 sm:px-12 py-20 sm:py-24 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-start">
        <!-- Left : intro + cta + small image -->
        <div class="lg:col-span-5">
          <div class="flex items-center gap-3 mb-4">
            <span class="block w-10 h-px bg-misana-ink"></span>
            <span class="text-[11px] uppercase tracking-[0.25em] text-misana-muted">{{ t('about.introKicker') }}</span>
          </div>
          <h2 class="font-display text-3xl sm:text-4xl lg:text-5xl leading-[1.05] mb-6">{{ t('about.introTitle') }}</h2>
          <p class="text-misana-muted leading-relaxed mb-8 max-w-md">{{ t('about.introBody') }}</p>
          <NuxtLink :to="localePath('/request')" class="inline-block border border-misana-ink px-6 py-3 text-xs uppercase tracking-[0.15em] hover:bg-misana-ink hover:text-misana-paper transition">
            {{ t('about.introCta') }}
          </NuxtLink>
          <div class="mt-10 aspect-[5/3] relative overflow-hidden bg-misana-paper">
            <img src="https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=1400&q=80" alt="" loading="lazy" class="absolute inset-0 w-full h-full object-cover" />
          </div>
        </div>

        <!-- Right : large portrait + 2 counter cards stacked -->
        <div class="lg:col-span-7">
          <div class="aspect-[4/5] relative overflow-hidden bg-misana-paper">
            <img src="https://images.unsplash.com/photo-1605515298946-d062f2e9da53?w=1400&q=80" alt="" loading="lazy" class="absolute inset-0 w-full h-full object-cover" />
          </div>
          <div class="grid grid-cols-2 gap-px bg-misana-line mt-5">
            <div class="bg-misana-paper p-8 sm:p-10">
              <p class="font-display text-6xl sm:text-7xl tabular-nums leading-none">80</p>
              <p class="text-sm text-misana-muted uppercase tracking-[0.15em] mt-3">{{ t('about.counter1Label') }}</p>
            </div>
            <div class="bg-misana-paper p-8 sm:p-10">
              <p class="font-display text-6xl sm:text-7xl tabular-nums leading-none">8</p>
              <p class="text-sm text-misana-muted uppercase tracking-[0.15em] mt-3">{{ t('about.counter2Label') }}</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ============================================== -->
    <!-- 4. STATEMENT HEADLINE + INFINITY MARQUEE        -->
    <!-- ============================================== -->
    <section class="border-b border-misana-line bg-misana-paper overflow-hidden">
      <div class="max-w-[1280px] mx-auto px-6 sm:px-12 py-20 sm:py-28">
        <h3 class="font-display text-3xl sm:text-5xl lg:text-6xl leading-[1.15] max-w-4xl">
          <span class="text-misana-muted">{{ t('about.statementLine1') }}</span>
          <span class="block">{{ t('about.statementLine2') }}</span>
          <span class="block text-misana-muted">{{ t('about.statementLine3') }}</span>
        </h3>
      </div>
      <div class="marquee py-10 sm:py-14 border-t border-b border-misana-line">
        <div class="marquee-track">
          <div class="marquee-item" v-for="n in 4" :key="`a${n}`">
            <span class="marquee-word">Riviera</span>
            <span class="marquee-dot"></span>
            <span class="marquee-word italic">eighty kilometres</span>
            <span class="marquee-dot"></span>
            <span class="marquee-word">discretion</span>
            <span class="marquee-dot"></span>
            <span class="marquee-word italic">held by name</span>
            <span class="marquee-dot"></span>
          </div>
          <div class="marquee-item" v-for="n in 4" :key="`b${n}`">
            <span class="marquee-word">Riviera</span>
            <span class="marquee-dot"></span>
            <span class="marquee-word italic">eighty kilometres</span>
            <span class="marquee-dot"></span>
            <span class="marquee-word">discretion</span>
            <span class="marquee-dot"></span>
            <span class="marquee-word italic">held by name</span>
            <span class="marquee-dot"></span>
          </div>
        </div>
      </div>
    </section>

    <!-- ============================================== -->
    <!-- 5. WHY US (6 cards staggered)                   -->
    <!-- ============================================== -->
    <section class="border-b border-misana-line bg-misana-paper">
      <div class="max-w-[1280px] mx-auto px-6 sm:px-12 py-20 sm:py-24">
        <div class="mb-14 sm:mb-16 max-w-xl">
          <div class="flex items-center gap-3 mb-4">
            <span class="block w-10 h-px bg-misana-ink"></span>
            <span class="text-[11px] uppercase tracking-[0.25em] text-misana-muted">{{ t('about.whyKicker') }}</span>
          </div>
          <h2 class="font-display text-4xl sm:text-5xl lg:text-6xl leading-[1.05]">{{ t('about.whyTitle') }}</h2>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
          <article
            v-for="n in reasons"
            :key="n"
            class="why-card group relative aspect-[4/5] overflow-hidden bg-misana-stone"
            :class="`why-card-${n}`"
          >
            <img :src="`https://picsum.photos/seed/misana-why-${n}/900/1200`" alt="" loading="lazy" class="absolute inset-0 w-full h-full object-cover transition duration-1000 group-hover:scale-[1.04]" />
            <div class="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent"></div>
            <div class="absolute top-6 right-6 font-display text-3xl text-misana-paper/70 tabular-nums">{{ String(n).padStart(2, '0') }}</div>
            <div class="absolute bottom-7 left-7 right-7 text-misana-paper">
              <h3 class="font-display text-2xl sm:text-3xl mb-3 leading-tight">{{ t(`about.reasons.${n}.title`) }}</h3>
              <p class="text-sm leading-relaxed opacity-85">{{ t(`about.reasons.${n}.body`) }}</p>
            </div>
          </article>
        </div>
      </div>
    </section>

    <!-- ============================================== -->
    <!-- 6. FAQ (split image-grid + accordion)           -->
    <!-- ============================================== -->
    <section class="bg-misana-paper">
      <div class="max-w-[1280px] mx-auto px-6 sm:px-12 py-20 sm:py-24 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-start">
        <!-- Left : image grid 3-up -->
        <div class="lg:col-span-5 grid grid-cols-2 gap-4">
          <div class="aspect-[3/4] relative overflow-hidden bg-misana-stone">
            <img src="https://images.unsplash.com/photo-1540979388789-6cee28a1cdc9?w=900&q=80" alt="" loading="lazy" class="absolute inset-0 w-full h-full object-cover" />
          </div>
          <div class="aspect-[3/4] relative overflow-hidden bg-misana-stone mt-12">
            <img src="https://images.unsplash.com/photo-1567899378494-47b22a2ae96a?w=900&q=80" alt="" loading="lazy" class="absolute inset-0 w-full h-full object-cover" />
          </div>
          <div class="col-span-2 aspect-[5/3] relative overflow-hidden bg-misana-stone">
            <img src="https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1400&q=80" alt="" loading="lazy" class="absolute inset-0 w-full h-full object-cover" />
          </div>
        </div>

        <!-- Right : accordion -->
        <div class="lg:col-span-7">
          <div class="flex items-center gap-3 mb-4">
            <span class="block w-10 h-px bg-misana-ink"></span>
            <span class="text-[11px] uppercase tracking-[0.25em] text-misana-muted">{{ t('about.faqKicker') }}</span>
          </div>
          <h2 class="font-display text-3xl sm:text-4xl lg:text-5xl leading-[1.05] mb-10">{{ t('about.faqTitle') }}</h2>

          <div class="border-t border-misana-ink/15">
            <div
              v-for="key in faqs"
              :key="key"
              class="border-b border-misana-ink/15"
            >
              <button
                type="button"
                class="w-full flex items-center justify-between text-left py-5 sm:py-6 group"
                :aria-expanded="openFaq === key"
                @click="toggleFaq(key)"
              >
                <span class="font-display text-lg sm:text-xl pr-6">{{ t(`about.faq.${key}.q`) }}</span>
                <span class="relative shrink-0 w-5 h-5">
                  <span class="absolute top-1/2 left-0 right-0 h-px bg-misana-ink"></span>
                  <span
                    class="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-px bg-misana-ink transition-transform duration-500"
                    :class="openFaq === key ? 'scale-y-0' : 'scale-y-100'"
                  ></span>
                </span>
              </button>
              <div
                class="overflow-hidden transition-[grid-template-rows] duration-500 ease-out grid"
                :class="openFaq === key ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'"
              >
                <div class="overflow-hidden">
                  <p class="text-misana-muted leading-relaxed pb-5 sm:pb-6 max-w-2xl">{{ t(`about.faq.${key}.a`) }}</p>
                </div>
              </div>
            </div>
          </div>

          <NuxtLink :to="localePath('/contact')" class="inline-block mt-10 border border-misana-ink px-6 py-3 text-xs uppercase tracking-[0.15em] hover:bg-misana-ink hover:text-misana-paper transition">
            {{ t('about.faqCta') }}
          </NuxtLink>
        </div>
      </div>
    </section>
  </main>
</template>

<style scoped>
/* Why us : staggered grid offset rows */
@media (min-width: 1024px) {
  .why-card-2, .why-card-5 { transform: translateY(40px); }
  .why-card-3, .why-card-6 { transform: translateY(72px); }
}

/* Marquee infinite scroll */
.marquee {
  position: relative;
  overflow: hidden;
}
.marquee-track {
  display: flex;
  width: max-content;
  animation: marquee-scroll 60s linear infinite;
  will-change: transform;
}
.marquee-item {
  display: inline-flex;
  align-items: center;
  gap: 2.5rem;
  padding-right: 2.5rem;
  font-family: var(--font-display);
  font-size: clamp(2rem, 4vw, 3.75rem);
  line-height: 1;
  letter-spacing: 0.01em;
  white-space: nowrap;
  color: var(--color-misana-ink);
}
.marquee-word { display: inline-block; }
.marquee-dot {
  display: inline-block;
  width: 0.5rem;
  height: 0.5rem;
  border-radius: 50%;
  background: var(--color-misana-ink);
  flex-shrink: 0;
}
@keyframes marquee-scroll {
  from { transform: translate3d(0, 0, 0); }
  to   { transform: translate3d(-50%, 0, 0); }
}
@media (prefers-reduced-motion: reduce) {
  .marquee-track { animation: none; }
}
</style>
