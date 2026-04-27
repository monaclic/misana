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
const team = [1, 2, 3] as const;
const faqs = ['hours', 'pricing', 'languages', 'fleet', 'discretion', 'partners'] as const;
const openFaq = ref<string | null>(null);
function toggleFaq(key: string) {
  openFaq.value = openFaq.value === key ? null : key;
}

// --- Scroll-driven animation state ---
// Counters slot-machine values (kilometres / cities)
const counter1 = ref(0);
const counter2 = ref(0);

// Statement section scroll progress (0..1) drives :
//  - 3-line headline color change (overlay translateX per line)
//  - Sticky media frame growth (small -> wide)
const statementSection = ref<HTMLElement | null>(null);
const statementProgress = ref(0);

// Why-us section progress (0..1) drives the staggered entry of the 6 cards.
const whySection = ref<HTMLElement | null>(null);
const whyProgress = ref(0);

let scrollRaf = 0;
function onAboutScroll() {
  cancelAnimationFrame(scrollRaf);
  scrollRaf = requestAnimationFrame(() => {
    if (statementSection.value) {
      const r = statementSection.value.getBoundingClientRect();
      const total = Math.max(1, r.height - window.innerHeight);
      statementProgress.value = Math.max(0, Math.min(1, -r.top / total));
    }
    if (whySection.value) {
      const r = whySection.value.getBoundingClientRect();
      // start when top hits 80% of viewport, complete by 20% from top
      const start = window.innerHeight * 0.8;
      const end = window.innerHeight * 0.2;
      const t = (start - r.top) / (start - end);
      whyProgress.value = Math.max(0, Math.min(1, t));
    }
  });
}

// Animate counters once they enter viewport.
function animateCounter(targetRef: typeof counter1, target: number, duration = 1800) {
  const startTime = performance.now();
  function tick(now: number) {
    const t = Math.min(1, (now - startTime) / duration);
    // Ease out cubic
    const eased = 1 - Math.pow(1 - t, 3);
    targetRef.value = Math.round(target * eased);
    if (t < 1) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}

// Per-line color change progress (offset stagger so lines fill in cascade).
const lineProgress = computed(() => (line: number) => {
  // Each line covers 30% of total, line 1 starts at 0.05, line 2 at 0.25, line 3 at 0.45
  const offsets = [0.05, 0.25, 0.45];
  const start = offsets[line - 1] ?? 0;
  const span = 0.35;
  return Math.max(0, Math.min(1, (statementProgress.value - start) / span));
});

// Sticky media : starts 60vw, ends 96vw at the bottom of the section.
const mediaWidth = computed(() => 60 + statementProgress.value * 36);

onMounted(() => {
  window.addEventListener('scroll', onAboutScroll, { passive: true });
  window.addEventListener('resize', onAboutScroll, { passive: true });
  onAboutScroll();

  // Counter trigger via IO so it spins when the section becomes visible.
  const counterEls = document.querySelectorAll('[data-counter]');
  const countObs = new IntersectionObserver((entries) => {
    for (const e of entries) {
      if (e.isIntersecting) {
        const target = Number((e.target as HTMLElement).dataset.target ?? '0');
        const which = (e.target as HTMLElement).dataset.counter;
        if (which === '1') animateCounter(counter1, target);
        if (which === '2') animateCounter(counter2, target);
        countObs.unobserve(e.target);
      }
    }
  }, { threshold: 0.3 });
  counterEls.forEach((el) => countObs.observe(el));
});
onBeforeUnmount(() => {
  window.removeEventListener('scroll', onAboutScroll);
  window.removeEventListener('resize', onAboutScroll);
  cancelAnimationFrame(scrollRaf);
});

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
      <!-- Two stripes slide right-to-left on mount, revealing the image. -->
      <div class="banner-curtain-a"></div>
      <div class="banner-curtain-b"></div>
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
    <section id="story" class="scroll-mt-24 border-b border-misana-line">
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
    <section id="team" class="scroll-mt-24 border-b border-misana-line bg-misana-stone">
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
            <div data-counter="1" data-target="80" class="bg-misana-paper p-8 sm:p-10">
              <p class="font-display text-6xl sm:text-7xl tabular-nums leading-none">{{ counter1 }}</p>
              <p class="text-sm text-misana-muted uppercase tracking-[0.15em] mt-3">{{ t('about.counter1Label') }}</p>
            </div>
            <div data-counter="2" data-target="8" class="bg-misana-paper p-8 sm:p-10">
              <p class="font-display text-6xl sm:text-7xl tabular-nums leading-none">{{ counter2 }}</p>
              <p class="text-sm text-misana-muted uppercase tracking-[0.15em] mt-3">{{ t('about.counter2Label') }}</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ============================================== -->
    <!-- 4. STATEMENT HEADLINE (color-fill on scroll) +  -->
    <!--    STICKY MEDIA THAT GROWS + MARQUEE OVERHEAD   -->
    <!-- ============================================== -->
    <section ref="statementSection" class="border-b border-misana-line bg-misana-paper overflow-hidden relative">
      <!-- 3-line headline, each line fills from muted to ink as you scroll -->
      <div class="max-w-[1280px] mx-auto px-6 sm:px-12 pt-20 sm:pt-28 pb-12 sm:pb-16">
        <h3 class="font-display text-3xl sm:text-5xl lg:text-6xl leading-[1.15] max-w-4xl space-y-1">
          <span class="block fill-line">
            <span class="fill-line-base">{{ t('about.statementLine1') }}</span>
            <span class="fill-line-overlay" :style="{ clipPath: `inset(0 ${100 - lineProgress(1) * 100}% 0 0)` }">{{ t('about.statementLine1') }}</span>
          </span>
          <span class="block fill-line">
            <span class="fill-line-base">{{ t('about.statementLine2') }}</span>
            <span class="fill-line-overlay" :style="{ clipPath: `inset(0 ${100 - lineProgress(2) * 100}% 0 0)` }">{{ t('about.statementLine2') }}</span>
          </span>
          <span class="block fill-line">
            <span class="fill-line-base">{{ t('about.statementLine3') }}</span>
            <span class="fill-line-overlay" :style="{ clipPath: `inset(0 ${100 - lineProgress(3) * 100}% 0 0)` }">{{ t('about.statementLine3') }}</span>
          </span>
        </h3>
      </div>

      <!-- Pinned media : image grows from 60vw to 96vw, marquee scrolls overhead -->
      <div class="h-[200vh] sm:h-[240vh] relative">
        <div class="sticky top-0 h-screen flex items-center justify-center overflow-hidden">
          <!-- Marquee : sits at top of pinned screen -->
          <div class="marquee-band">
            <div class="marquee-track">
              <span v-for="n in 6" :key="`m${n}`" class="marquee-item">
                <span class="marquee-word">Riviera</span>
                <span class="marquee-dot"></span>
                <span class="marquee-word italic">eighty kilometres</span>
                <span class="marquee-dot"></span>
                <span class="marquee-word">discretion</span>
                <span class="marquee-dot"></span>
                <span class="marquee-word italic">held by name</span>
                <span class="marquee-dot"></span>
              </span>
            </div>
          </div>
          <!-- Frame : width tied to scroll progress -->
          <div
            class="sticky-media-frame"
            :style="{ width: `${mediaWidth}vw` }"
          >
            <img
              src="https://images.unsplash.com/photo-1499678329028-101435549a4e?w=2400&q=80"
              alt=""
              loading="lazy"
              class="absolute inset-0 w-full h-full object-cover"
            />
            <div class="absolute inset-0 bg-misana-ink/20"></div>
          </div>
        </div>
      </div>
    </section>

    <!-- ============================================== -->
    <!-- 5. WHY US (6 cards scroll-driven staggered)     -->
    <!-- ============================================== -->
    <section ref="whySection" id="why" class="scroll-mt-24 border-b border-misana-line bg-misana-paper">
      <div class="max-w-[1280px] mx-auto px-6 sm:px-12 py-20 sm:py-24">
        <div class="mb-14 sm:mb-16 max-w-xl">
          <div class="flex items-center gap-3 mb-4">
            <span class="block w-10 h-px bg-misana-ink"></span>
            <span class="text-[11px] uppercase tracking-[0.25em] text-misana-muted">{{ t('about.whyKicker') }}</span>
          </div>
          <h2 class="font-display text-4xl sm:text-5xl lg:text-6xl leading-[1.05]">{{ t('about.whyTitle') }}</h2>
        </div>

        <!-- Each card has a per-position initial offset (in %), converging to 0 as
             the section scrolls into view. Top row 80/65/50, bottom row 80/60/70 — same
             pattern as Resorto where cards rise like wave at different speeds. -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
          <article
            v-for="n in reasons"
            :key="n"
            class="why-card group relative aspect-[4/5] overflow-hidden bg-misana-stone will-change-transform"
            :style="{ transform: `translateY(${[80, 65, 50, 80, 60, 70][n - 1] * (1 - whyProgress)}%)` }"
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
    <!-- 6. MEET THE TEAM                                 -->
    <!-- ============================================== -->
    <section class="border-b border-misana-line bg-misana-stone">
      <div class="max-w-[1280px] mx-auto px-6 sm:px-12 py-20 sm:py-24">
        <div class="flex flex-col items-center text-center mb-14 sm:mb-16">
          <div class="flex items-center gap-3 mb-5">
            <span class="block w-10 h-px bg-misana-ink"></span>
            <span class="text-[11px] uppercase tracking-[0.25em] text-misana-muted">{{ t('about.teamKicker') }}</span>
            <span class="block w-10 h-px bg-misana-ink"></span>
          </div>
          <h2 class="font-display text-4xl sm:text-5xl lg:text-6xl leading-[1.05]">{{ t('about.teamTitle') }}</h2>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-3 gap-8 sm:gap-10">
          <article
            v-for="n in team"
            :key="n"
            class="team-card group flex flex-col items-center"
          >
            <div class="team-portrait-wrap">
              <div class="team-portrait-frame">
                <img
                  :src="`https://picsum.photos/seed/misana-team-${n}/700/900`"
                  alt=""
                  loading="lazy"
                  class="absolute inset-0 w-full h-full object-cover transition duration-1000 group-hover:scale-[1.04]"
                />
              </div>
            </div>
            <h3 class="font-display text-2xl sm:text-3xl mt-6">{{ t(`about.team.${n}.name`) }}</h3>
            <p class="text-sm uppercase tracking-[0.2em] text-misana-muted mt-2">{{ t(`about.team.${n}.role`) }}</p>
          </article>
        </div>
      </div>
    </section>

    <!-- ============================================== -->
    <!-- 7. FAQ (split image-grid + accordion)           -->
    <!-- ============================================== -->
    <section id="faq" class="scroll-mt-24 bg-misana-paper">
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
/* Banner : two stripes slide off to reveal the image (curtain reveal). */
.banner-curtain-a,
.banner-curtain-b {
  position: absolute;
  inset: 0;
  background: var(--color-misana-ink);
  z-index: 5;
  pointer-events: none;
  transform-origin: right center;
  animation: curtain-out 1.2s cubic-bezier(0.76, 0, 0.24, 1) forwards;
}
.banner-curtain-b {
  background: var(--color-misana-stone);
  animation-delay: 0.15s;
  animation-duration: 1.4s;
}
@keyframes curtain-out {
  from { transform: scaleX(1); }
  to   { transform: scaleX(0); }
}

/* Statement headline : each line has a base layer (muted) and an overlay
   layer (ink) revealed via clip-path that grows as you scroll. The clipPath
   is set inline from JS via lineProgress(line). */
.fill-line {
  position: relative;
  display: block;
}
.fill-line-base {
  color: var(--color-misana-muted);
}
.fill-line-overlay {
  position: absolute;
  inset: 0;
  color: var(--color-misana-ink);
  pointer-events: none;
  white-space: inherit;
}

/* Section 4 : sticky media frame whose width is driven by scroll progress.
   The marquee band sits at the top of the pinned screen. */
.sticky-media-frame {
  position: relative;
  height: min(56vh, 520px);
  max-width: 96vw;
  overflow: hidden;
  z-index: 1;
  transition: width 0.05s linear;
}
.marquee-band {
  position: absolute;
  top: 6vh;
  left: 0;
  right: 0;
  z-index: 2;
  pointer-events: none;
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
  font-size: clamp(2.5rem, 7vw, 6rem);
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

/* Team portraits : circular frame with a thin ring, hover scale subtle. */
.team-portrait-wrap {
  width: 100%;
  max-width: 320px;
  padding: 18px;
}
.team-portrait-frame {
  position: relative;
  width: 100%;
  aspect-ratio: 1;
  border-radius: 9999px;
  overflow: hidden;
  background: var(--color-misana-paper);
  box-shadow: 0 0 0 1px var(--color-misana-line);
}

@media (prefers-reduced-motion: reduce) {
  .marquee-track { animation: none; }
}
</style>
