<script setup lang="ts">
// Page /about - structure inspiree de Rumaya about-us, adaptee Misana.
// 6 sections : Hero typo split, Philosophy 2-cols, Story timeline horizontale,
// Spaces mosaic, Gallery ticker, CTA.
// Voix et copy = Misana CLAUDE.md, structure et animations = pattern Rumaya.

definePageMeta({ layout: 'default' });

const { locale, t } = useI18n();
const localePath = useLocalePath();

useSeoMeta({
  title: () => `${t('about.title')} · Misana`,
  description: () => t('about.metaDescription'),
});

const milestones = ['2024', '2025', '2026early', '2026summer', 'today'] as const;
const galleryImages = [
  { src: 'https://images.unsplash.com/photo-1505761671935-60b3a7427bad?w=1200&q=80', ratio: '0.75' },
  { src: 'https://images.unsplash.com/photo-1473093226795-af9932fe5856?w=1500&q=80', ratio: '1.5' },
  { src: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=1200&q=80', ratio: '0.667' },
  { src: 'https://images.unsplash.com/photo-1530541930197-ff16ac917b0e?w=1200&q=80', ratio: '0.75' },
  { src: 'https://images.unsplash.com/photo-1520637836862-4d197d17c25a?w=1500&q=80', ratio: '1.5' },
];

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

// Header transparency : transparent uniquement quand la hero sombre overlap
// le viewport ; opaque des qu'on entre dans les sections claires.
const headerTransparent = useState<boolean>('header-transparent', () => true);

const heroRef = ref<HTMLElement | null>(null);
const ctaRef = ref<HTMLElement | null>(null);
let revealObserver: IntersectionObserver | null = null;
let heroOverlapObserver: IntersectionObserver | null = null;

onMounted(() => {
  revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          (e.target as HTMLElement).dataset.revealed = 'true';
          revealObserver?.unobserve(e.target);
        }
      });
    },
    { threshold: 0.2 },
  );
  if (heroRef.value) revealObserver.observe(heroRef.value);
  if (ctaRef.value) revealObserver.observe(ctaRef.value);

  // Toggle header transparency while the hero (and only the hero) overlaps the viewport.
  if (heroRef.value) {
    heroOverlapObserver = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          headerTransparent.value = e.isIntersecting && e.intersectionRatio > 0;
        }
      },
      { threshold: [0, 0.01] },
    );
    heroOverlapObserver.observe(heroRef.value);
  }
});

onBeforeUnmount(() => {
  headerTransparent.value = false;
  revealObserver?.disconnect();
  revealObserver = null;
  heroOverlapObserver?.disconnect();
  heroOverlapObserver = null;
});
</script>

<template>
  <main class="about-page">
    <!-- ============================================== -->
    <!-- 1. HERO : split typo (left text, right text)     -->
    <!--    + image full-bleed dessous + scroll cue       -->
    <!-- ============================================== -->
    <section ref="heroRef" class="hero-about -mt-16" data-revealed="false">
      <div class="hero-about-inner max-w-[1600px] mx-auto px-6 sm:px-12">
        <div class="hero-about-spacer"></div>

        <!-- Title block : 2 fragments inline + 1 fragment offset right -->
        <div class="hero-about-headings">
          <div class="hero-about-left">
            <div class="overflow-hidden">
              <h1 class="reveal font-display text-6xl sm:text-8xl lg:text-[12rem] leading-[0.95] m-0" data-delay="1">
                {{ t('about.heroPart1') }}
              </h1>
            </div>
            <div class="overflow-hidden text-right">
              <h1 class="reveal font-display italic text-6xl sm:text-8xl lg:text-[12rem] leading-[0.95] m-0" data-delay="2">
                {{ t('about.heroPart2') }}
              </h1>
            </div>
          </div>
          <div class="hero-about-right">
            <div class="overflow-hidden">
              <h1 class="reveal font-display text-6xl sm:text-8xl lg:text-[12rem] leading-[0.95] m-0" data-delay="3">
                {{ t('about.heroPart3') }}
              </h1>
            </div>
          </div>
        </div>

        <!-- Subheading + scroll cue : 2 cols -->
        <div class="hero-about-subs">
          <div class="hero-about-subs-left">
            <div class="overflow-hidden">
              <p class="reveal text-base sm:text-lg leading-relaxed opacity-95 max-w-md" data-delay="4">{{ t('about.heroLead') }}</p>
            </div>
          </div>
          <div class="hero-about-subs-right">
            <div class="overflow-hidden">
              <p class="reveal text-[11px] uppercase tracking-[0.25em] opacity-70" data-delay="5">{{ t('about.scrollCue') }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Background image full-bleed -->
      <div class="hero-about-bg">
        <img
          src="https://images.unsplash.com/photo-1499678329028-101435549a4e?w=2400&q=80"
          alt=""
          class="absolute inset-0 w-full h-full object-cover hero-bg-img"
        />
        <div class="absolute inset-0 bg-misana-ink/45"></div>
      </div>
    </section>

    <!-- ============================================== -->
    <!-- 2. PHILOSOPHY : 2 cols (label + 2 paragraphs)   -->
    <!--    + grande image en bas pleine largeur          -->
    <!-- ============================================== -->
    <section id="philosophy" class="philosophy scroll-mt-24">
      <div class="max-w-[1600px] mx-auto px-6 sm:px-12 py-24 sm:py-32">
        <!-- Top : label + 2-line heading -->
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-20 sm:mb-24">
          <div class="lg:col-span-4">
            <p class="text-[11px] uppercase tracking-[0.25em] philo-accent">(MS · 02)</p>
            <h2 class="font-display text-5xl sm:text-7xl lg:text-8xl leading-[0.95] mt-6 philo-title">
              {{ t('about.philoHead1') }}
            </h2>
          </div>
          <div class="lg:col-span-8 flex justify-end">
            <h2 class="font-display text-5xl sm:text-7xl lg:text-8xl leading-[0.95] philo-title text-right">
              {{ t('about.philoHead2') }}
            </h2>
          </div>
        </div>

        <!-- Middle : 2 cols of body text + small label -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-10 lg:gap-20 mb-20 sm:mb-24">
          <div class="md:pl-[20%] reveal-block">
            <p class="text-[11px] uppercase tracking-[0.25em] philo-accent mb-3">{{ t('about.philoSub1') }}</p>
            <p class="text-base sm:text-lg leading-relaxed text-misana-muted max-w-md">{{ t('about.philoBody1') }}</p>
            <p class="text-[11px] uppercase tracking-[0.25em] philo-accent mt-6">({{ t('about.philoTag1') }})</p>
          </div>
          <div class="md:pl-[20%] reveal-block">
            <p class="text-[11px] uppercase tracking-[0.25em] philo-accent mb-3">{{ t('about.philoSub2') }}</p>
            <p class="text-base sm:text-lg leading-relaxed text-misana-muted max-w-md">{{ t('about.philoBody2') }}</p>
            <p class="text-[11px] uppercase tracking-[0.25em] philo-accent mt-6">({{ t('about.philoTag2') }})</p>
          </div>
        </div>

        <!-- Bottom : full-bleed wide image -->
        <div class="aspect-[3/2] relative overflow-hidden bg-misana-stone">
          <img
            src="https://images.unsplash.com/photo-1566041510639-8d95a2490bfb?w=2400&q=80"
            alt=""
            loading="lazy"
            class="absolute inset-0 w-full h-full object-cover"
          />
        </div>
      </div>
    </section>

    <!-- ============================================== -->
    <!-- 3. STORY : intro + horizontal timeline           -->
    <!--    line + alternating dots above and below      -->
    <!-- ============================================== -->
    <section id="story" class="story scroll-mt-24 bg-misana-paper">
      <div class="max-w-[1600px] mx-auto px-6 sm:px-12 py-24 sm:py-28">
        <!-- Top : centered title + lead -->
        <div class="text-center mb-20 sm:mb-24 max-w-3xl mx-auto">
          <h2 class="font-display text-5xl sm:text-6xl lg:text-7xl leading-[1.05]">{{ t('about.storyTitle') }}</h2>
          <p class="text-misana-muted text-base sm:text-lg leading-relaxed mt-6">{{ t('about.storyLead') }}</p>
        </div>

        <!-- Timeline : horizontal line + 5 dots alternating top/bottom -->
        <div class="timeline">
          <div class="timeline-line"></div>
          <ul class="timeline-list">
            <li
              v-for="(m, idx) in milestones"
              :key="m"
              class="timeline-item"
              :class="idx % 2 === 0 ? 'timeline-item-top' : 'timeline-item-bottom'"
            >
              <div class="timeline-content">
                <p class="font-display italic text-misana-muted text-sm sm:text-base mb-2">{{ t(`about.story.${m}.year`) }}</p>
                <p class="text-base sm:text-lg leading-snug philo-accent max-w-[200px]">{{ t(`about.story.${m}.label`) }}</p>
              </div>
              <div class="timeline-stem"></div>
              <div class="timeline-dot"></div>
            </li>
          </ul>
        </div>

        <!-- Bottom : closing paragraph -->
        <div class="mt-20 sm:mt-28 max-w-2xl mx-auto text-center">
          <p class="text-[11px] uppercase tracking-[0.25em] philo-accent mb-5">(MS · 03)</p>
          <p class="text-misana-muted text-base sm:text-lg leading-relaxed">{{ t('about.storyClose') }}</p>
        </div>
      </div>
    </section>

    <!-- ============================================== -->
    <!-- 4. SPACES : portrait + text overlay + portrait   -->
    <!--    image-text-image mosaic on dark bg           -->
    <!-- ============================================== -->
    <section class="spaces bg-misana-ink text-misana-paper">
      <div class="max-w-[1600px] mx-auto px-6 sm:px-12 py-24 sm:py-32">
        <div class="grid grid-cols-1 md:grid-cols-12 gap-6 sm:gap-10 items-center">
          <div class="md:col-span-5 aspect-[3/4] relative overflow-hidden">
            <img
              src="https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1400&q=80"
              alt=""
              loading="lazy"
              class="absolute inset-0 w-full h-full object-cover spaces-img"
            />
          </div>
          <div class="md:col-span-4 px-2 sm:px-6">
            <h2 class="font-display text-4xl sm:text-5xl lg:text-6xl leading-[1.05] mb-6">{{ t('about.spacesTitle') }}</h2>
            <p class="opacity-80 text-base sm:text-lg leading-relaxed">{{ t('about.spacesBody') }}</p>
          </div>
          <div class="md:col-span-3 aspect-[2/3] relative overflow-hidden">
            <img
              src="https://images.unsplash.com/photo-1605515298946-d062f2e9da53?w=900&q=80"
              alt=""
              loading="lazy"
              class="absolute inset-0 w-full h-full object-cover spaces-img"
            />
          </div>
        </div>
      </div>
    </section>

    <!-- ============================================== -->
    <!-- 5. GALLERY : titled left + horizontal ticker     -->
    <!--    that scrolls infinitely                       -->
    <!-- ============================================== -->
    <section class="gallery overflow-hidden">
      <div class="max-w-[1600px] mx-auto px-6 sm:px-12 pt-24 sm:pt-32 pb-12">
        <!-- Heading : (the) Moments (we) Share, layout typographique -->
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-12">
          <div class="lg:col-span-5 flex items-end gap-6">
            <h4 class="font-display italic text-2xl sm:text-3xl text-misana-muted m-0">{{ t('about.galleryWord1') }}</h4>
            <p class="text-[11px] uppercase tracking-[0.25em] philo-accent">(MS · 04)</p>
          </div>
          <div class="lg:col-span-7">
            <h2 class="font-display text-5xl sm:text-7xl lg:text-8xl leading-[0.95] philo-title m-0">{{ t('about.galleryWord2') }}</h2>
            <div class="flex items-end gap-4 mt-2">
              <h4 class="font-display italic text-2xl sm:text-3xl text-misana-muted m-0">{{ t('about.galleryWord3') }}</h4>
              <h2 class="font-display text-5xl sm:text-7xl lg:text-8xl leading-[0.95] philo-title m-0">{{ t('about.galleryWord4') }}</h2>
            </div>
          </div>
        </div>

        <!-- Sub block : intro + cta -->
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-16 sm:mb-20">
          <div class="lg:col-span-5"></div>
          <div class="lg:col-span-7 max-w-2xl">
            <p class="text-[11px] uppercase tracking-[0.25em] philo-accent mb-3">{{ t('about.gallerySub') }}</p>
            <p class="text-misana-muted text-base sm:text-lg leading-relaxed mb-7">{{ t('about.galleryBody') }}</p>
            <NuxtLink :to="localePath('/journal')" class="inline-flex items-center gap-3 group philo-accent text-base">
              <span class="border-b border-current pb-0.5">{{ t('about.galleryCta') }}</span>
              <span class="inline-flex items-center justify-center w-[1.1em] h-[1.1em] translate-y-[0.22em] transition-transform duration-700 group-hover:translate-x-2">
                <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" class="block w-full h-full">
                  <path d="M7 12H17" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" />
                  <path d="M13.5 8.5L17 12L13.5 15.5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" />
                </svg>
              </span>
            </NuxtLink>
          </div>
        </div>
      </div>

      <!-- Ticker : 5 images at fixed height, looping infinitely -->
      <div class="ticker pb-24 sm:pb-32">
        <div class="ticker-track">
          <div
            v-for="loop in 2"
            :key="loop"
            class="ticker-set"
          >
            <div
              v-for="(img, idx) in galleryImages"
              :key="`${loop}-${idx}`"
              class="ticker-item"
              :style="{ aspectRatio: img.ratio }"
            >
              <img :src="img.src" alt="" loading="lazy" class="absolute inset-0 w-full h-full object-cover" />
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ============================================== -->
    <!-- 6. CTA : full-bleed image with centered call     -->
    <!-- ============================================== -->
    <section ref="ctaRef" class="cta-about" data-revealed="false">
      <div class="cta-about-content max-w-[1600px] mx-auto px-6 sm:px-12 py-24 sm:py-32 text-center">
        <div class="overflow-hidden">
          <h2 class="reveal font-display text-5xl sm:text-7xl lg:text-8xl leading-[0.95] m-0" data-delay="1">{{ t('about.ctaPart1') }}</h2>
        </div>
        <div class="overflow-hidden mt-2">
          <h2 class="reveal font-display italic text-5xl sm:text-7xl lg:text-8xl leading-[0.95] m-0" data-delay="2">{{ t('about.ctaPart2') }}</h2>
        </div>
        <div class="reveal-line cta-divider"></div>
        <div class="overflow-hidden">
          <p class="reveal max-w-md mx-auto opacity-90 text-base sm:text-lg leading-relaxed mb-10" data-delay="4">{{ t('about.ctaBody') }}</p>
        </div>
        <div class="overflow-hidden inline-block">
          <NuxtLink :to="localePath('/request')" class="reveal inline-flex items-center gap-3 group text-misana-paper text-base" data-delay="5">
            <span class="border-b border-misana-paper pb-0.5">{{ t('about.ctaCta') }}</span>
            <span class="inline-flex items-center justify-center w-[1.1em] h-[1.1em] translate-y-[0.22em] transition-transform duration-700 group-hover:translate-x-2">
              <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" class="block w-full h-full">
                <path d="M7 12H17" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" />
                <path d="M13.5 8.5L17 12L13.5 15.5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
            </span>
          </NuxtLink>
        </div>
      </div>
      <div class="cta-about-bg">
        <img
          src="https://images.unsplash.com/photo-1567899378494-47b22a2ae96a?w=2400&q=80"
          alt=""
          loading="lazy"
          class="absolute inset-0 w-full h-full object-cover hero-bg-img"
        />
        <div class="absolute inset-0 bg-misana-ink/55"></div>
      </div>
    </section>
  </main>
</template>

<style scoped>
/* Pas d'accent couleur : tout reste sur l'encre Misana */
.philo-accent { color: var(--color-misana-ink); }
.philo-title { color: var(--color-misana-ink); }

.about-page { background: var(--color-misana-paper); color: var(--color-misana-ink); }

/* === HERO === */
.hero-about {
  position: relative;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  padding-bottom: 8vh;
  color: var(--color-misana-paper);
  overflow: hidden;
}
.hero-about-inner { position: relative; z-index: 2; width: 100%; }
.hero-about-spacer { height: 28vh; }
.hero-about-bg { position: absolute; inset: 0; z-index: 1; }

/* Bg image : ken-burns lent calque sur la home, declenche par [data-revealed]. */
.hero-bg-img {
  transform: scale(1.06);
  transition: transform 8s ease-out;
}
[data-revealed="true"] .hero-bg-img { transform: scale(1); }

.hero-about-headings {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.5rem;
  margin-bottom: 5vh;
}
@media (min-width: 1024px) {
  .hero-about-headings { grid-template-columns: 1fr 1fr; }
}
.hero-about-left { display: flex; flex-direction: column; }
.hero-about-right { display: flex; align-items: flex-end; justify-content: flex-end; }

.hero-about-subs {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.5rem;
  align-items: flex-end;
}
@media (min-width: 1024px) {
  .hero-about-subs { grid-template-columns: 1fr 1fr; }
  .hero-about-subs-right { text-align: right; }
}

/* Reveal pattern aligned with home hero : translateY(110%) -> 0 sur 1.1s,
   declenche par [data-revealed="true"] sur l'ancetre, etage via data-delay. */
.reveal {
  display: inline-block;
  opacity: 0;
  transform: translateY(110%);
  transition:
    opacity 1.1s cubic-bezier(0.16, 1, 0.3, 1),
    transform 1.1s cubic-bezier(0.16, 1, 0.3, 1);
}
[data-revealed="true"] .reveal { opacity: 1; transform: translateY(0); }
[data-revealed="true"] .reveal[data-delay="1"] { transition-delay: 0.05s; }
[data-revealed="true"] .reveal[data-delay="2"] { transition-delay: 0.18s; }
[data-revealed="true"] .reveal[data-delay="3"] { transition-delay: 0.28s; }
[data-revealed="true"] .reveal[data-delay="4"] { transition-delay: 0.42s; }
[data-revealed="true"] .reveal[data-delay="5"] { transition-delay: 0.58s; }

.reveal-line {
  transform: scaleY(0);
  transform-origin: top center;
  transition: transform 1.4s cubic-bezier(0.16, 1, 0.3, 1) 0.28s;
}
[data-revealed="true"] .reveal-line { transform: scaleY(1); }

/* === STORY TIMELINE === */
.timeline { position: relative; padding: 0 2vw; }
.timeline-line {
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  height: 1px;
  background: var(--color-misana-line);
}
.timeline-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  align-items: center;
  min-height: 320px;
}
.timeline-item {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.timeline-item-top { transform: translateY(-60px); }
.timeline-item-bottom { transform: translateY(60px); }
.timeline-content { text-align: center; padding: 0 0.5rem; }
.timeline-item-top .timeline-content { order: 1; margin-bottom: 1rem; }
.timeline-item-bottom .timeline-content { order: 3; margin-top: 1rem; }
.timeline-stem {
  width: 1px;
  height: 24px;
  background: var(--color-misana-ink);
  order: 2;
}
.timeline-dot {
  width: 9px;
  height: 9px;
  border-radius: 50%;
  background: var(--color-misana-ink);
  order: 4;
}
.timeline-item-bottom .timeline-stem { order: 4; }
.timeline-item-bottom .timeline-dot { order: 2; }

@media (max-width: 767px) {
  .timeline-list { grid-template-columns: repeat(2, 1fr); gap: 3rem 1rem; min-height: auto; }
  .timeline-item, .timeline-item-top, .timeline-item-bottom { transform: none; }
  .timeline-line { display: none; }
}

/* === SPACES (image scale on enter) === */
.spaces-img {
  transform: scale(1.1);
  transition: transform 1.4s cubic-bezier(0.16, 1, 0.3, 1);
}
.spaces:hover .spaces-img { transform: scale(1); }

/* === GALLERY TICKER === */
.ticker {
  position: relative;
  overflow: hidden;
}
.ticker-track {
  display: flex;
  width: max-content;
  gap: 94px;
  animation: ticker-scroll 80s linear infinite;
  will-change: transform;
}
.ticker-set {
  display: flex;
  gap: 94px;
  flex-shrink: 0;
}
.ticker-item {
  position: relative;
  width: 300px;
  flex-shrink: 0;
  overflow: hidden;
  background: var(--color-misana-stone);
}
@keyframes ticker-scroll {
  from { transform: translate3d(0, 0, 0); }
  to   { transform: translate3d(calc(-50% - 47px), 0, 0); }
}

/* === CTA full-bleed === */
.cta-about {
  position: relative;
  color: var(--color-misana-paper);
  overflow: hidden;
}
.cta-about-content { position: relative; z-index: 2; }
.cta-about-bg { position: absolute; inset: 0; z-index: 1; }
.cta-divider {
  width: 1px;
  height: 80px;
  margin: 2.5rem auto;
  background: var(--color-misana-paper);
  opacity: 0.7;
}

@media (prefers-reduced-motion: reduce) {
  .reveal, .reveal-line, .hero-bg-img, .ticker-track {
    animation: none !important;
    transition: none !important;
    transform: none !important;
    opacity: 1 !important;
  }
}
</style>
