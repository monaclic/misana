<script setup lang="ts">
// Homepage Misana V2 - refonte editoriale.
// 1) Sticky services hero (intro + 5 service panels reveal)
// 2) Events list (calendar of the season)
// 3) Testimonials parallax (3 vertical columns, sticky pinned)
// 4) Full request form
// 5) Latest guides
// Footer via default layout (AppFooter enrichi).
import { CITIES, EVENTS } from '~/lib/constants';

definePageMeta({ layout: 'default' });

const { locale, t } = useI18n();
const localePath = useLocalePath();

useSeoMeta({
  title: () => `${t('brand.name')} · ${t('brand.tagline')}`,
  description: () => t('home.metaDescription'),
});

useHead({
  script: [{
    type: 'application/ld+json',
    innerHTML: JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: 'Misana',
      description: 'Concierge service on the French Riviera. Chauffeur, helicopter, cars, yacht, access.',
      url: 'https://misana.com',
      areaServed: 'French Riviera',
    }),
  }],
});

// --- Services sticky stack (acts as hero) ---
// First panel : maison intro ("we orchestrate everything"). Then five services.
type HeroPanel =
  | { kind: 'intro'; img: string }
  | { kind: 'service'; slug: 'chauffeur' | 'cars' | 'yacht' | 'helicopter' | 'access'; img: string };

const SERVICE_PANELS: HeroPanel[] = [
  { kind: 'intro',   img: 'https://images.unsplash.com/photo-1499678329028-101435549a4e?w=2400&q=80' },
  { kind: 'service', slug: 'helicopter', img: 'https://images.unsplash.com/photo-1540979388789-6cee28a1cdc9?w=2000&q=80' },
  { kind: 'service', slug: 'yacht',      img: 'https://images.unsplash.com/photo-1567899378494-47b22a2ae96a?w=2000&q=80' },
  { kind: 'service', slug: 'cars',       img: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=2000&q=80' },
  { kind: 'service', slug: 'chauffeur',  img: 'https://images.unsplash.com/photo-1605515298946-d062f2e9da53?w=2000&q=80' },
  { kind: 'service', slug: 'access',     img: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=2000&q=80' },
];

const panelRefs = ref<HTMLElement[]>([]);
const revealed = ref<Set<number>>(new Set());
const activePanel = ref(0);
let panelObserver: IntersectionObserver | null = null;

const heroSection = ref<HTMLElement | null>(null);
let heroObserver: IntersectionObserver | null = null;
// AppHeader seeds this from the route. Here we only flip it as the user
// scrolls past the hero (opaque header on subsequent sections).
const headerTransparent = useState<boolean>('header-transparent', () => true);

// Hide the (MS · 01) + life with Misana overlay as soon as the user scrolls
// downward at all. No fancy animation : it just disappears.
const atTop = ref(true);
let atTopRaf = 0;
function updateAtTop() {
  atTop.value = window.scrollY <= 1;
}
function onScrollAtTop() {
  cancelAnimationFrame(atTopRaf);
  atTopRaf = requestAnimationFrame(updateAtTop);
}

function setPanelRef(el: Element | null, idx: number) {
  if (el) panelRefs.value[idx] = el as HTMLElement;
}

// Generic reveal observer for any element marked with [data-reveal-on-scroll].
const revealOnScroll = ref<IntersectionObserver | null>(null);

onMounted(() => {
  panelObserver = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        const idx = Number((e.target as HTMLElement).dataset.idx);
        if (e.isIntersecting && e.intersectionRatio > 0.45) {
          if (!revealed.value.has(idx)) {
            const next = new Set(revealed.value);
            next.add(idx);
            revealed.value = next;
          }
          activePanel.value = idx;
        }
      }
    },
    { threshold: [0, 0.45, 0.7, 1] },
  );
  panelRefs.value.forEach((el) => el && panelObserver?.observe(el));

  revealOnScroll.value = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (e.isIntersecting) {
          (e.target as HTMLElement).dataset.revealed = 'true';
          revealOnScroll.value?.unobserve(e.target);
        }
      }
    },
    { threshold: 0.18 },
  );
  document.querySelectorAll('[data-reveal-on-scroll]').forEach((el) => {
    revealOnScroll.value?.observe(el);
  });

  // Toggle header transparency while the hero section overlaps the viewport.
  if (heroSection.value) {
    heroObserver = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          headerTransparent.value = e.isIntersecting && e.intersectionRatio > 0;
        }
      },
      { threshold: [0, 0.01] },
    );
    heroObserver.observe(heroSection.value);
  }

  window.addEventListener('scroll', onScrollAtTop, { passive: true });
  updateAtTop();

  window.addEventListener('scroll', onTestimonialScroll, { passive: true });
  window.addEventListener('resize', onTestimonialScroll, { passive: true });
  updateTestimonialScroll();
});
onBeforeUnmount(() => {
  panelObserver?.disconnect();
  panelObserver = null;
  revealOnScroll.value?.disconnect();
  revealOnScroll.value = null;
  heroObserver?.disconnect();
  heroObserver = null;
  headerTransparent.value = false;
  window.removeEventListener('scroll', onScrollAtTop);
  cancelAnimationFrame(atTopRaf);
  window.removeEventListener('scroll', onTestimonialScroll);
  window.removeEventListener('resize', onTestimonialScroll);
  cancelAnimationFrame(testimonialRaf);
});

// --- Events timeline ---
const timelineEvents = computed(() => {
  return [...EVENTS].sort((a, b) => a.monthOrder - b.monthOrder).map((e) => {
    const city = CITIES.find((c) => c.slug === e.city);
    return { ...e, cityEn: city?.en ?? '', cityFr: city?.fr ?? '' };
  });
});
const eventThumb = (slug: string) => `https://picsum.photos/seed/misana-evt-${slug}/600/400`;

// --- Latest guides (placeholders for V1, journal not yet populated) ---
const guides = [
  { slug: 'a-week-in-cannes', titleEn: 'A week in Cannes, considered.', titleFr: 'Une semaine à Cannes, pensée.', kindEn: 'Guide', kindFr: 'Guide', excerptEn: 'How to hold seven days in May without missing the point.', excerptFr: 'Comment tenir sept jours en mai sans manquer le point.', img: 'https://images.unsplash.com/photo-1568084680786-a84f91d1153c?w=900&q=80' },
  { slug: 'helicopter-routes', titleEn: 'The helicopter routes of the coast.', titleFr: 'Les routes hélicoptère de la côte.', kindEn: 'Note', kindFr: 'Note', excerptEn: 'Twelve point-to-point flights between the hubs of the Riviera.', excerptFr: 'Douze vols point-à-point entre les hubs de la Riviera.', img: 'https://images.unsplash.com/photo-1473162404599-0e3a89d0fb9c?w=900&q=80' },
  { slug: 'three-tables-in-monaco', titleEn: 'Three tables in Monaco.', titleFr: 'Trois tables à Monaco.', kindEn: 'Address', kindFr: 'Adresse', excerptEn: 'Where the regulars return, season after season.', excerptFr: 'Où les habitués reviennent, saison après saison.', img: 'https://images.unsplash.com/photo-1559339352-11d035aa65de?w=900&q=80' },
  { slug: 'before-saint-tropez', titleEn: 'The drive into Saint-Tropez.', titleFr: 'L\'arrivée à Saint-Tropez.', kindEn: 'Guide', kindFr: 'Guide', excerptEn: 'The road in, the small ports, the calmer corner of the bay.', excerptFr: 'La route, les petits ports, le coin plus calme de la baie.', img: 'https://images.unsplash.com/photo-1597212720158-e21eb71ce0e9?w=900&q=80' },
  { slug: 'monaco-race-week', titleEn: 'Monaco, race week.', titleFr: 'Monaco, semaine de course.', kindEn: 'Calendar', kindFr: 'Agenda', excerptEn: 'How the city tightens, where the views still hold.', excerptFr: 'Comment la ville se resserre, où les vues tiennent encore.', img: 'https://images.unsplash.com/photo-1541626078-2cd2b32a5c84?w=900&q=80' },
  { slug: 'cap-ferrat-quiet', titleEn: 'A quieter Cap-Ferrat.', titleFr: 'Un Cap-Ferrat plus calme.', kindEn: 'Address', kindFr: 'Adresse', excerptEn: 'The bays, the gardens, the tables that do not advertise.', excerptFr: 'Les baies, les jardins, les tables qui ne s\'affichent pas.', img: 'https://images.unsplash.com/photo-1473496169904-658ba7c44d8a?w=900&q=80' },
];

// --- Testimonials (anonymised per CLAUDE.md : profile + origin only) ---
type Testimonial = { quoteEn: string; quoteFr: string; authorEn: string; authorFr: string };

const TESTIMONIALS: Testimonial[] = [
  { quoteEn: 'The driver was at the gate before the bags came off the carousel. The week unfolded in calm.', quoteFr: 'Le chauffeur était à la sortie avant que les bagages ne sortent du tapis. La semaine s\'est déroulée dans le calme.', authorEn: 'Family of four, London', authorFr: 'Famille de quatre, Londres' },
  { quoteEn: 'We sent the route in March. The reply came in three hours, with a name and a phone.', quoteFr: 'Nous avons envoyé la route en mars. La réponse est venue en trois heures, avec un nom et un téléphone.', authorEn: 'Returning guest, Geneva', authorFr: 'Hôte de retour, Genève' },
  { quoteEn: 'A table at a place that does not take outside reservations, on a Sunday in August. They knew our names by the second visit.', quoteFr: 'Une table dans un lieu qui ne prend pas de réservation extérieure, un dimanche d\'août. Ils connaissaient nos noms à la deuxième visite.', authorEn: 'Couple, New York', authorFr: 'Couple, New York' },
  { quoteEn: 'Helicopter at La Mole, yacht at the slip, driver in Monaco who knew where to park. We did not lift a phone all week.', quoteFr: 'Hélicoptère à La Môle, yacht à quai, chauffeur à Monaco qui savait où se garer. Nous n\'avons pas décroché un téléphone de la semaine.', authorEn: 'Group of six, Munich', authorFr: 'Groupe de six, Munich' },
  { quoteEn: 'Discretion that takes years to earn. They have it.', quoteFr: 'Une discrétion qui se gagne avec les années. Ils l\'ont.', authorEn: 'Regular, Rome', authorFr: 'Habitué, Rome' },
  { quoteEn: 'The maitre d\' asked about our daughter by name on the second night.', quoteFr: 'Le maître d\'hôtel a demandé des nouvelles de notre fille par son nom dès le deuxième soir.', authorEn: 'Returning family, Paris', authorFr: 'Famille de retour, Paris' },
  { quoteEn: 'We changed the dates twice. They changed everything else without us asking.', quoteFr: 'Nous avons changé les dates deux fois. Ils ont changé tout le reste sans qu\'on demande.', authorEn: 'Couple, Brussels', authorFr: 'Couple, Bruxelles' },
  { quoteEn: 'Six destinations in three days. Not a single moment of waiting.', quoteFr: 'Six destinations en trois jours. Pas un seul moment d\'attente.', authorEn: 'Business group, Stockholm', authorFr: 'Groupe affaires, Stockholm' },
  { quoteEn: 'They sent the menu of the restaurant ahead so we could pre-order for our son\'s allergies.', quoteFr: 'Ils ont envoyé le menu du restaurant en amont pour que nous puissions pré-commander pour les allergies de notre fils.', authorEn: 'Family, Zurich', authorFr: 'Famille, Zurich' },
  { quoteEn: 'A car at every port. A driver who waits without asking.', quoteFr: 'Une voiture à chaque port. Un chauffeur qui attend sans poser de question.', authorEn: 'Yacht week guest, Antwerp', authorFr: 'Semaine yacht, Anvers' },
  { quoteEn: 'Year after year, the same quiet professionalism. Nothing rehearsed, everything ready.', quoteFr: 'Année après année, le même professionnalisme tranquille. Rien de répété, tout est prêt.', authorEn: 'Returning guest, Madrid', authorFr: 'Hôte de retour, Madrid' },
  { quoteEn: 'They held the table on the right terrace at the right hour. The light was as we asked.', quoteFr: 'Ils ont tenu la table sur la bonne terrasse à la bonne heure. La lumière était comme nous voulions.', authorEn: 'Couple, Stockholm', authorFr: 'Couple, Stockholm' },
];

const testimonialColumns = computed<Testimonial[][]>(() => [
  [TESTIMONIALS[0], TESTIMONIALS[3], TESTIMONIALS[6], TESTIMONIALS[9]],
  [TESTIMONIALS[1], TESTIMONIALS[4], TESTIMONIALS[7], TESTIMONIALS[10]],
  [TESTIMONIALS[2], TESTIMONIALS[5], TESTIMONIALS[8], TESTIMONIALS[11]],
]);

const testimonialRoot = ref<HTMLElement | null>(null);
const testimonialProgress = ref(0);
let testimonialRaf = 0;

function updateTestimonialScroll() {
  const el = testimonialRoot.value;
  if (!el) return;
  const rect = el.getBoundingClientRect();
  const total = Math.max(1, el.offsetHeight - window.innerHeight);
  testimonialProgress.value = Math.max(0, Math.min(1, -rect.top / total));
}
function onTestimonialScroll() {
  cancelAnimationFrame(testimonialRaf);
  testimonialRaf = requestAnimationFrame(updateTestimonialScroll);
}

const col1Y = computed(() => -25 + testimonialProgress.value * 50);
const col2Y = computed(() => 20 - testimonialProgress.value * 45);
const col3Y = computed(() => -25 + testimonialProgress.value * 50);

const activeGuide = ref(0);
const visibleGuides = 2;
const maxGuide = computed(() => Math.max(0, guides.length - visibleGuides));
function nextGuide() { if (activeGuide.value < maxGuide.value) activeGuide.value++; }
function prevGuide() { if (activeGuide.value > 0) activeGuide.value--; }
const guideProgress = computed(() => maxGuide.value === 0 ? 1 : activeGuide.value / maxGuide.value);
</script>

<template>
  <main>
    <!-- Visually hidden h1 for SEO ; the visible heading is inside the sticky panels. -->
    <h1 class="sr-only">{{ t('brand.name') }} · {{ t('brand.longTagline') }}</h1>

    <!-- ============================================== -->
    <!-- 1. SERVICES HERO (sticky vertical stack)        -->
    <!-- ============================================== -->
    <!-- -mt-16 pulls the hero up under the transparent (sticky) header so
         the page starts at the very top of the viewport with no white band. -->
    <section ref="heroSection" class="services-stack relative bg-misana-ink text-misana-paper -mt-16">
      <article
        v-for="(s, idx) in SERVICE_PANELS"
        :key="s.kind === 'intro' ? 'intro' : s.slug"
        :ref="(el) => setPanelRef(el as Element | null, idx)"
        :data-idx="idx"
        :data-revealed="revealed.has(idx) ? 'true' : 'false'"
        class="services-panel sticky top-0 h-screen overflow-hidden"
        :style="{ zIndex: 10 + idx }"
      >
        <img
          :src="s.img"
          :alt="s.kind === 'intro' ? t('home.heroIntroTitle') : t(`request.service.${s.slug}`)"
          class="absolute inset-0 w-full h-full object-cover services-panel-img"
        />
        <div class="absolute inset-0 bg-misana-ink/45"></div>

        <!-- Intro panel : centered maison statement -->
        <div v-if="s.kind === 'intro'" class="relative h-full flex flex-col items-center justify-center text-center px-6">
          <div class="overflow-hidden">
            <h2 class="reveal font-display text-5xl sm:text-7xl lg:text-8xl leading-[0.95]" data-delay="1">
              {{ t('home.heroIntroTitle') }}
            </h2>
          </div>
          <div class="reveal-line w-px h-16 sm:h-20 bg-misana-paper/70 my-8 sm:my-9" data-delay="2"></div>
          <div class="overflow-hidden max-w-2xl">
            <p class="reveal font-display text-xl sm:text-2xl lg:text-3xl leading-[1.3] opacity-95" data-delay="3">
              {{ t('home.heroIntroBody') }}
            </p>
          </div>
          <div class="overflow-hidden mt-8">
            <p class="reveal text-sm sm:text-base opacity-70 max-w-md" data-delay="4">
              {{ t('home.heroIntroSub') }}
            </p>
          </div>
        </div>

        <!-- Service panel -->
        <div v-else class="relative h-full flex flex-col items-center justify-center text-center px-6">
          <div class="overflow-hidden">
            <p class="reveal" data-delay="1">
              <span class="font-display italic text-xl sm:text-2xl opacity-90">the</span>
            </p>
          </div>
          <div class="overflow-hidden mt-1">
            <h2 class="reveal font-display text-6xl sm:text-8xl leading-[0.95]" data-delay="2">
              ({{ t(`request.service.${s.slug}`) }})
            </h2>
          </div>
          <div class="reveal-line w-px h-16 sm:h-20 bg-misana-paper/70 my-8 sm:my-9" data-delay="3"></div>
          <div class="overflow-hidden max-w-md">
            <p class="reveal text-base sm:text-lg leading-relaxed opacity-90" data-delay="4">
              {{ t(`home.serviceBody.${s.slug}`) }}
            </p>
          </div>
          <div class="overflow-hidden mt-10">
            <NuxtLink
              :to="localePath(`/services/${s.slug}`)"
              class="reveal group inline-flex items-center gap-8 pb-2 border-b-[1.5px] border-misana-paper text-base sm:text-lg tracking-wide"
              data-delay="5"
            >
              <span>{{ t('home.serviceCardCta', { service: t(`request.service.${s.slug}`).toLowerCase() }) }}</span>
              <span class="inline-flex items-center justify-center w-[1.1em] h-[1.1em] translate-y-[0.22em] transition-transform duration-700 group-hover:translate-x-2">
                <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" class="block w-full h-full">
                  <path d="M7 12H17" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
                  <path d="M13.5 8.5L17 12L13.5 15.5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" />
                </svg>
              </span>
            </NuxtLink>
          </div>
        </div>
      </article>

    </section>

    <!-- Footer overlay for the sticky hero : pinned to viewport bottom while hero is in view. -->
    <Teleport to="body">
      <Transition
        enter-active-class="transition duration-500"
        enter-from-class="opacity-0 translate-y-4"
        leave-active-class="transition duration-300"
        leave-to-class="opacity-0"
      >
        <div
          v-show="headerTransparent && activePanel === 0 && atTop"
          style="position:fixed;bottom:0;left:0;right:0;z-index:50;pointer-events:none"
        >
          <div class="max-w-7xl mx-auto px-6 pb-8 sm:pb-10 flex items-end justify-between text-white">
            <p class="text-[11px] tracking-[0.2em] uppercase opacity-80">(MS · 01)</p>
            <p class="font-display text-2xl sm:text-4xl leading-none">
              <span class="opacity-80 italic mr-2 sm:mr-3">life with</span>
              <span>(Misana)</span>
            </p>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- ============================================== -->
    <!-- 2. EVENTS LIST (calendar of the season, dark)   -->
    <!-- ============================================== -->
    <section class="border-b border-misana-paper/15 bg-misana-ink text-misana-paper">
      <div class="max-w-[1440px] mx-auto px-6 sm:px-10 py-24" data-reveal-on-scroll>
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-10 mb-20 items-end reveal-block">
          <div class="lg:col-span-7">
            <p class="text-[11px] uppercase tracking-[0.2em] opacity-60 mb-4">(MS · 02) · {{ t('home.timelineKicker') }}</p>
            <h2 class="font-display text-4xl sm:text-6xl leading-[1.02]">{{ t('home.timelineTitle') }}</h2>
          </div>
          <div class="lg:col-span-5 lg:text-right">
            <p class="opacity-70 mb-6 max-w-md lg:ml-auto">{{ t('home.timelineLead') }}</p>
            <NuxtLink :to="localePath('/events')" class="inline-flex items-baseline gap-2 text-sm group">
              <span class="opacity-50">(</span>
              <span class="border-b border-misana-paper pb-0.5 transition group-hover:opacity-70">{{ t('home.allEvents') }}</span>
              <span class="opacity-60 tabular-nums">{{ timelineEvents.length }}+</span>
              <span class="opacity-50">)</span>
            </NuxtLink>
          </div>
        </div>

        <ul class="border-t border-misana-paper/20 reveal-block">
          <li
            v-for="(ev, idx) in timelineEvents"
            :key="ev.slug"
            class="event-row border-b border-misana-paper/20"
          >
            <NuxtLink
              :to="localePath(`/events/${ev.slug}`)"
              class="grid grid-cols-12 gap-4 sm:gap-6 py-8 sm:py-12 items-center group relative"
            >
              <!-- Sequence number, decorative -->
              <div class="col-span-2 sm:col-span-1 font-display text-base sm:text-xl opacity-40 tabular-nums">
                {{ String(idx + 1).padStart(2, '0') }}
              </div>

              <!-- Date column -->
              <div class="col-span-10 sm:col-span-2 flex items-baseline gap-2 text-sm sm:text-base">
                <span class="font-display text-xl sm:text-3xl tabular-nums">{{ String(ev.monthOrder).padStart(2, '0') }}</span>
                <span class="opacity-40">/</span>
                <span class="font-display text-xl sm:text-3xl tabular-nums">26</span>
              </div>

              <!-- Title, clip-reveal on hover (italic on the second line). Widened to col-span-6 so long titles do not crowd the right edge. -->
              <div class="col-span-12 sm:col-span-6 event-row-clip pr-4">
                <p class="font-display text-2xl sm:text-5xl leading-[1.05] event-row-title-base">
                  {{ locale === 'fr' ? ev.fr : ev.en }}
                </p>
                <p class="font-display text-2xl sm:text-5xl leading-[1.05] italic event-row-title-hover">
                  {{ locale === 'fr' ? ev.fr : ev.en }}
                </p>
              </div>

              <!-- City + month label -->
              <div class="hidden sm:block sm:col-span-1 text-sm opacity-80">
                <p>{{ locale === 'fr' ? ev.cityFr : ev.cityEn }}</p>
                <p class="text-xs opacity-60 mt-0.5">{{ locale === 'fr' ? ev.monthFr : ev.monthEn }}</p>
              </div>

              <!-- CTA -->
              <div class="col-span-12 sm:col-span-2 flex items-center justify-end gap-3 text-xs sm:text-sm">
                <span class="event-row-cta">{{ t('home.timelineCta') }}</span>
                <span class="event-row-arrow inline-flex items-center justify-center w-[1.3em] h-[1.3em] translate-y-[0.22em]">
                  <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" class="block w-full h-full">
                    <path d="M7 12H17" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
                    <path d="M13.5 8.5L17 12L13.5 15.5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" />
                  </svg>
                </span>
              </div>

              <!-- Floating thumbnail to the right of the title, fades + scales in on hover -->
              <div class="event-row-thumb">
                <img :src="eventThumb(ev.slug)" :alt="locale === 'fr' ? ev.fr : ev.en" loading="lazy" />
              </div>

              <!-- Subtle row tint -->
              <div class="event-row-hover absolute inset-0 -z-10"></div>
            </NuxtLink>
          </li>
        </ul>

        <p class="mt-10 text-[11px] uppercase tracking-[0.2em] opacity-50 reveal-block">
          {{ t('home.timelineFootnote') }}
        </p>
      </div>
    </section>

    <!-- ============================================== -->
    <!-- 3. TESTIMONIALS (3 column parallax sticky)      -->
    <!-- ============================================== -->
    <section
      ref="testimonialRoot"
      class="relative bg-misana-paper"
      :style="{ height: '220vh' }"
    >
      <div class="sticky top-0 h-screen overflow-hidden flex flex-col">
        <!-- Title bar -->
        <div class="px-6 pt-20 sm:pt-24 max-w-7xl mx-auto w-full text-center" data-reveal-on-scroll>
          <p class="text-[11px] uppercase tracking-[0.25em] text-misana-muted mb-5 reveal-block">(MS · 03) · {{ t('home.testimonialsKicker') }}</p>
          <h2 class="font-display text-4xl sm:text-5xl lg:text-6xl leading-[1.05] reveal-block">
            {{ t('home.testimonialsTitleStart') }}
            <em class="italic text-misana-muted">{{ t('home.testimonialsTitleAccent') }}</em>
          </h2>
        </div>

        <!-- 3 columns parallax (col 1 / col 3 down, col 2 up) -->
        <div class="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 px-6 sm:px-10 mt-10 sm:mt-12 max-w-7xl mx-auto w-full overflow-hidden relative">
          <div class="will-change-transform" :style="{ transform: `translate3d(0, ${col1Y}%, 0)` }">
            <article v-for="(t_, idx) in testimonialColumns[0]" :key="idx" class="testimonial-card mb-5">
              <p class="font-display italic text-base sm:text-lg leading-relaxed text-misana-ink">
                {{ locale === 'fr' ? t_.quoteFr : t_.quoteEn }}
              </p>
              <p class="text-[10px] uppercase tracking-[0.25em] text-misana-muted mt-5">
                {{ locale === 'fr' ? t_.authorFr : t_.authorEn }}
              </p>
            </article>
          </div>
          <div class="hidden md:block will-change-transform" :style="{ transform: `translate3d(0, ${col2Y}%, 0)` }">
            <article v-for="(t_, idx) in testimonialColumns[1]" :key="idx" class="testimonial-card mb-5">
              <p class="font-display italic text-base sm:text-lg leading-relaxed text-misana-ink">
                {{ locale === 'fr' ? t_.quoteFr : t_.quoteEn }}
              </p>
              <p class="text-[10px] uppercase tracking-[0.25em] text-misana-muted mt-5">
                {{ locale === 'fr' ? t_.authorFr : t_.authorEn }}
              </p>
            </article>
          </div>
          <div class="hidden lg:block will-change-transform" :style="{ transform: `translate3d(0, ${col3Y}%, 0)` }">
            <article v-for="(t_, idx) in testimonialColumns[2]" :key="idx" class="testimonial-card mb-5">
              <p class="font-display italic text-base sm:text-lg leading-relaxed text-misana-ink">
                {{ locale === 'fr' ? t_.quoteFr : t_.quoteEn }}
              </p>
              <p class="text-[10px] uppercase tracking-[0.25em] text-misana-muted mt-5">
                {{ locale === 'fr' ? t_.authorFr : t_.authorEn }}
              </p>
            </article>
          </div>
        </div>

        <!-- Top + bottom fade overlays for clipping illusion -->
        <div class="pointer-events-none absolute top-0 left-0 right-0 h-40 bg-gradient-to-b from-misana-paper to-transparent z-10"></div>
        <div class="pointer-events-none absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-misana-paper to-transparent z-10"></div>

        <!-- Vertical progress bar on the left edge -->
        <div class="absolute top-0 left-0 h-full w-px bg-misana-ink/10 z-20">
          <div class="absolute top-0 left-0 right-0 bg-misana-ink transition-all duration-150" :style="{ height: `${testimonialProgress * 100}%` }"></div>
        </div>
      </div>
    </section>

    <!-- ============================================== -->
    <!-- 4. FULL REQUEST FORM                            -->
    <!-- ============================================== -->
    <section class="border-b border-misana-line bg-misana-stone">
      <div class="max-w-3xl mx-auto px-6 py-24" data-reveal-on-scroll>
        <div class="text-center mb-10 reveal-block">
          <p class="text-[11px] uppercase tracking-[0.2em] text-misana-muted mb-3">(MS · 04) · {{ t('home.formKicker') }}</p>
          <h2 class="font-display text-4xl sm:text-5xl leading-[1.05] mb-4">{{ t('home.formTitle') }}</h2>
          <p class="text-misana-muted max-w-lg mx-auto">{{ t('home.formLead') }}</p>
        </div>
        <div class="bg-misana-paper p-6 sm:p-10 ring-1 ring-misana-line reveal-block">
          <RequestForm />
        </div>
      </div>
    </section>

    <!-- ============================================== -->
    <!-- 5. LATEST GUIDES (split title + carousel)       -->
    <!-- ============================================== -->
    <section class="bg-misana-paper">
      <div class="max-w-7xl mx-auto px-6 py-24" data-reveal-on-scroll>
        <!-- Top : split title + body + chevron link -->
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-10 mb-14 items-start reveal-block">
          <div class="lg:col-span-7">
            <p class="text-[11px] uppercase tracking-[0.2em] text-misana-muted mb-4">(MS · 05) · {{ t('home.guidesKicker') }}</p>
            <h2 class="font-display text-4xl sm:text-6xl leading-[1.02]">
              {{ t('home.guidesTitleStart') }}
              <em class="italic text-misana-muted">{{ t('home.guidesTitleAccent') }}</em>
            </h2>
          </div>
          <div class="lg:col-span-5 lg:pt-8">
            <p class="text-misana-muted leading-relaxed mb-6 max-w-md">{{ t('home.guidesLead') }}</p>
            <NuxtLink :to="localePath('/journal')" class="inline-flex items-center gap-2.5 text-base group">
              <span class="border-b border-misana-ink pb-0.5 transition group-hover:opacity-70">{{ t('home.guidesAll') }}</span>
              <span class="inline-flex items-center justify-center w-[1.1em] h-[1.1em] translate-y-[0.22em]">
                <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" class="block w-full h-full">
                  <path d="M7 12H17" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
                  <path d="M13.5 8.5L17 12L13.5 15.5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" />
                </svg>
              </span>
            </NuxtLink>
          </div>
        </div>

        <!-- Carousel -->
        <div class="reveal-block">
          <div class="guides-slider overflow-hidden">
            <div
              class="flex gap-5 transition-transform duration-700 ease-[cubic-bezier(0.65,0,0.35,1)] will-change-transform"
              :style="{ transform: `translate3d(calc(-${activeGuide} * (var(--guide-step))), 0, 0)` }"
            >
              <NuxtLink
                v-for="g in guides"
                :key="g.slug"
                :to="localePath(`/journal/${g.slug}`)"
                class="guide-slide group block shrink-0"
              >
                <div class="aspect-[4/5] relative overflow-hidden bg-misana-stone">
                  <img
                    :src="g.img"
                    :alt="locale === 'fr' ? g.titleFr : g.titleEn"
                    loading="lazy"
                    class="absolute inset-0 w-full h-full object-cover transition duration-1000 group-hover:scale-[1.04]"
                  />
                </div>
                <div class="pt-5">
                  <p class="text-[10px] uppercase tracking-[0.25em] text-misana-muted">{{ locale === 'fr' ? g.kindFr : g.kindEn }}</p>
                  <h3 class="font-display text-2xl sm:text-3xl mt-2 leading-tight">{{ locale === 'fr' ? g.titleFr : g.titleEn }}</h3>
                </div>
              </NuxtLink>
            </div>
          </div>

          <!-- Nav row : counter + thin progress + text prev/next -->
          <div class="flex items-center gap-6 sm:gap-10 mt-14">
            <div class="text-sm font-display tabular-nums flex items-baseline gap-1">
              <span>{{ String(activeGuide + 1).padStart(2, '0') }}</span>
              <span class="opacity-40">/</span>
              <span class="opacity-60">{{ String(guides.length).padStart(2, '0') }}</span>
            </div>
            <div class="flex-1 h-px bg-misana-ink/15 relative">
              <div
                class="absolute inset-y-0 left-0 bg-misana-ink transition-all duration-500"
                :style="{ width: `${guideProgress * 100}%` }"
              ></div>
            </div>
            <div class="flex items-center gap-6 text-sm tracking-wide">
              <button
                type="button"
                class="hover:opacity-60 transition disabled:opacity-30 disabled:cursor-not-allowed"
                :aria-label="t('home.guidesPrev')"
                :disabled="activeGuide === 0"
                @click="prevGuide"
              >
                ← {{ t('home.guidesPrevShort') }}
              </button>
              <span class="opacity-30">·</span>
              <button
                type="button"
                class="hover:opacity-60 transition disabled:opacity-30 disabled:cursor-not-allowed"
                :aria-label="t('home.guidesNext')"
                :disabled="activeGuide >= maxGuide"
                @click="nextGuide"
              >
                {{ t('home.guidesNextShort') }} →
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  </main>
</template>

<style scoped>
/* Sticky stack of service panels (hero). Footer overlay is rendered as a sibling
   pinned to the viewport bottom only while the hero is visible (toggled via v-show). */
.services-stack-footer {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 50;
  pointer-events: none;
}

/* Reveal animation triggered by IntersectionObserver via [data-revealed]. */
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

.services-panel-img {
  transform: scale(1.06);
  transition: transform 8s ease-out;
}
[data-revealed="true"] .services-panel-img { transform: scale(1); }

/* Event list rows. Title uses a two-layer clip reveal : the regular title (in flow,
   defines the container height so multi-line titles work) slides up out of view
   while an italic clone slides up into place from below. */
.event-row-clip {
  position: relative;
  overflow: hidden;
}
.event-row-title-base {
  position: relative;
  margin: 0;
  transform: translateY(0);
  transition: transform 0.7s cubic-bezier(0.16, 1, 0.3, 1);
  will-change: transform;
}
.event-row-title-hover {
  position: absolute;
  inset: 0;
  margin: 0;
  transform: translateY(105%);
  opacity: 0.92;
  transition: transform 0.7s cubic-bezier(0.16, 1, 0.3, 1);
  will-change: transform;
}
.event-row a:hover .event-row-title-base { transform: translateY(-105%); }
.event-row a:hover .event-row-title-hover { transform: translateY(0); }

.event-row-arrow {
  transition: transform 0.55s cubic-bezier(0.16, 1, 0.3, 1);
}
.event-row a:hover .event-row-arrow { transform: translateX(8px); }

.event-row-cta {
  position: relative;
  padding-bottom: 2px;
}
.event-row-cta::after {
  content: "";
  position: absolute;
  left: 0;
  bottom: 0;
  height: 1px;
  width: 100%;
  background: currentColor;
  transform: scaleX(0);
  transform-origin: right;
  transition: transform 0.6s cubic-bezier(0.16, 1, 0.3, 1);
}
.event-row a:hover .event-row-cta::after {
  transform: scaleX(1);
  transform-origin: left;
}

.event-row-hover {
  background: rgba(255, 255, 255, 0.05);
  opacity: 0;
  transition: opacity 0.45s ease;
}
.event-row a:hover .event-row-hover { opacity: 1; }

.event-row-thumb {
  position: absolute;
  pointer-events: none;
  top: 50%;
  left: 60%;
  width: 220px;
  aspect-ratio: 4 / 3;
  transform: translateY(-50%) translateX(-10px) scale(0.92);
  opacity: 0;
  overflow: hidden;
  z-index: 5;
  transition:
    opacity 0.5s cubic-bezier(0.16, 1, 0.3, 1),
    transform 0.7s cubic-bezier(0.16, 1, 0.3, 1);
  filter: brightness(0.85) saturate(0.9);
}
.event-row-thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}
.event-row a:hover .event-row-thumb {
  opacity: 1;
  transform: translateY(-50%) translateX(0) scale(1);
}
@media (max-width: 768px) {
  .event-row-thumb { display: none; }
}

/* Testimonials column cards : sober, no border, simple typography. */
.testimonial-card {
  padding: 1.5rem 0;
  border-top: 1px solid var(--color-misana-line);
}
.testimonial-card:first-child { border-top: 0; }

/* Guides carousel : 1 slide visible mobile, 2 slides desktop, with translate
   step matching the slide width + gap (gap-5 = 1.25rem). */
.guides-slider {
  --guide-step: calc(100% + 1.25rem);
}
.guide-slide {
  width: 100%;
}
@media (min-width: 768px) {
  .guides-slider {
    --guide-step: calc(50% + 0.625rem);
  }
  .guide-slide {
    width: calc(50% - 0.625rem);
  }
}

/* Generic block reveal for editorial sections (cities, services, etc.). */
.reveal-block {
  opacity: 0;
  transform: translateY(28px);
  transition: opacity 0.9s cubic-bezier(0.16, 1, 0.3, 1), transform 0.9s cubic-bezier(0.16, 1, 0.3, 1);
}
[data-revealed="true"].reveal-block,
[data-revealed="true"] .reveal-block { opacity: 1; transform: translateY(0); }

@media (prefers-reduced-motion: reduce) {
  .reveal, .reveal-line, .reveal-block, .services-panel-img {
    transform: none !important;
    transition: none !important;
    opacity: 1 !important;
  }
}
</style>
